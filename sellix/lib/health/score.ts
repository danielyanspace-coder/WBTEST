/**
 * Индекс здоровья магазина (0–100) — наш проактивный «врач».
 * Считает подоценки по складу, ценам, рекламе, отзывам и контенту, затем
 * выдаёт приоритезированный список действий с оценкой потерь в деньгах.
 * Это то, чего нет у большинства: не «таблицы», а «сделай вот это — заработаешь».
 */
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, stocks, salesDaily, feedbacks, adCampaigns, adSettings, subscriptions } from "@/lib/db/schema";
import { getStoreForUser } from "@/lib/wb/store";
import { recommendPrice } from "@/lib/pricing/engine";
import { recommendBid, DEFAULT_BID_SETTINGS } from "@/lib/ads/engine";
import { velocity, type DailyPoint } from "@/lib/ml/forecast";

const RUB = (n: number) => Math.round(n).toLocaleString("ru-RU") + " ₽";

export type HealthAction = {
  key: string;
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  href: string;
};
export type HealthSub = { key: string; label: string; score: number };
export type Health = {
  connected: boolean;
  score: number;
  grade: string;
  subs: HealthSub[];
  actions: HealthAction[];
};

function grade(score: number) {
  if (score >= 85) return "Отлично";
  if (score >= 70) return "Хорошо";
  if (score >= 50) return "Средне";
  return "Требует внимания";
}

export async function getStoreHealth(userId: string): Promise<Health> {
  const store = await getStoreForUser(userId);
  if (!store) {
    return { connected: false, score: 0, grade: "—", subs: [], actions: [] };
  }

  const [prods, stk, sales, fbNeg, camps, setRows, subRow] = await Promise.all([
    db.select().from(products).where(eq(products.storeId, store.id)),
    db.select({ nmId: stocks.nmId, q: sql<number>`sum(${stocks.quantity})` }).from(stocks).where(eq(stocks.storeId, store.id)).groupBy(stocks.nmId),
    db.select().from(salesDaily).where(eq(salesDaily.storeId, store.id)),
    db.select({ c: sql<number>`count(*)` }).from(feedbacks).where(and(eq(feedbacks.storeId, store.id), eq(feedbacks.answered, false), sql`${feedbacks.rating} <= 3`)),
    db.select().from(adCampaigns).where(eq(adCampaigns.storeId, store.id)),
    db.select().from(adSettings).where(eq(adSettings.storeId, store.id)).limit(1),
    db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1),
  ]);

  const points: DailyPoint[] = sales.map((s) => ({ date: s.date, orders: s.orders, buyouts: s.buyouts, revenue: s.revenue }));
  const storeV = velocity(points);
  const share = 1 / Math.max(1, prods.length);
  const perPoints = points.map((p) => ({ ...p, orders: p.orders * share }));

  const qtyByNm = new Map<number, number>();
  for (const s of stk) qtyByNm.set(s.nmId, s.q ?? 0);

  const actions: HealthAction[] = [];

  // ── Склад ──
  const outItems = [...qtyByNm.entries()].filter(([, q]) => q > 0 && q < 5).length;
  const dailyRevenue = points.length ? points.reduce((a, p) => a + p.revenue, 0) / points.length : 0;
  const stockScore = Math.max(0, 100 - outItems * 12);
  if (outItems > 0) {
    actions.push({
      key: "stock",
      severity: "critical",
      title: `Завезите ${outItems} товаров — заканчиваются`,
      body: `Простой = потеря ~${RUB(dailyRevenue * 0.15)}/день и просадка в поиске.`,
      href: "/dashboard/supplies",
    });
  }

  // ── Цены ──
  let priceActionable = 0;
  for (const p of prods.slice(0, 100)) {
    const rec = recommendPrice({ price: p.priceCurrent ?? 0, minProfitPrice: p.minProfitPrice, stock: qtyByNm.get(p.nmId) ?? 0, sales: perPoints });
    if (rec.action !== "keep") priceActionable++;
  }
  const priceScore = prods.length ? Math.max(40, 100 - Math.round((priceActionable / prods.length) * 80)) : 70;
  if (priceActionable > 0) {
    actions.push({
      key: "price",
      severity: "warning",
      title: `${priceActionable} цен можно оптимизировать`,
      body: "Репрайсер 2.0 предлагает изменения с защитой маржи — примените в один клик.",
      href: "/dashboard/pricing",
    });
  }

  // ── Реклама ──
  const s = setRows[0] ? { ...DEFAULT_BID_SETTINGS, ...setRows[0] } : DEFAULT_BID_SETTINGS;
  let burning = 0;
  let drrSum = 0, drrN = 0;
  for (const c of camps) {
    const rec = recommendBid({ cpm: c.cpm, spend: c.spend, revenue: c.revenue, orders: c.orders, views: c.views, clicks: c.clicks }, s as any);
    if (rec.alert) burning++;
    if (rec.drr != null) { drrSum += rec.drr; drrN++; }
  }
  const avgDrr = drrN ? drrSum / drrN : null;
  const adsScore = camps.length === 0 ? 75 : Math.max(0, 100 - burning * 20 - (avgDrr && avgDrr > s.targetDrr ? Math.min(30, (avgDrr - s.targetDrr) * 2) : 0));
  if (burning > 0) {
    actions.push({
      key: "budget",
      severity: "critical",
      title: `${burning} кампаний сливают бюджет`,
      body: "Сработала защита бюджета. Подтвердите паузу/снижение ставок.",
      href: "/dashboard/ads",
    });
  }

  // ── Отзывы ──
  const negUnanswered = fbNeg[0]?.c ?? 0;
  const reviewScore = Math.max(0, 100 - negUnanswered * 8);
  if (negUnanswered > 0) {
    actions.push({
      key: "reviews",
      severity: "warning",
      title: `Ответьте на ${negUnanswered} негативных отзывов`,
      body: "Ответ за 24 ч поднимает карточку. AI уже подготовил черновики.",
      href: "/dashboard/reviews",
    });
  }

  // ── Контент ──
  const withTitle = prods.filter((p) => (p.title?.length ?? 0) > 10).length;
  const contentScore = prods.length ? Math.round((withTitle / prods.length) * 100) : 70;
  if (prods.length && withTitle / prods.length < 0.8) {
    actions.push({
      key: "seo",
      severity: "info",
      title: "Усильте SEO карточек",
      body: "У части товаров слабые заголовки — ИИ напишет продающие за секунды.",
      href: "/dashboard/seo",
    });
  }

  // ── Триал ──
  const sub = subRow[0];
  if (sub?.status === "TRIALING" && sub.currentPeriodEnd) {
    const left = Math.ceil((+new Date(sub.currentPeriodEnd) - Date.now()) / 86400000);
    if (left <= 3) {
      actions.push({
        key: "trial",
        severity: "warning",
        title: `Пробный период: осталось ${left} дн.`,
        body: "Выберите тариф, чтобы не потерять автопилот.",
        href: "/dashboard/billing",
      });
    }
  }

  const subs: HealthSub[] = [
    { key: "stock", label: "Склад", score: Math.round(stockScore) },
    { key: "price", label: "Цены", score: Math.round(priceScore) },
    { key: "ads", label: "Реклама", score: Math.round(adsScore) },
    { key: "reviews", label: "Отзывы", score: Math.round(reviewScore) },
    { key: "content", label: "Контент", score: Math.round(contentScore) },
  ];
  const weights: Record<string, number> = { stock: 0.28, price: 0.22, ads: 0.2, reviews: 0.18, content: 0.12 };
  const score = Math.round(subs.reduce((a, x) => a + x.score * (weights[x.key] ?? 0.2), 0));

  const order = { critical: 0, warning: 1, info: 2 } as const;
  actions.sort((a, b) => order[a.severity] - order[b.severity]);

  return { connected: true, score, grade: grade(score), subs, actions };
}
