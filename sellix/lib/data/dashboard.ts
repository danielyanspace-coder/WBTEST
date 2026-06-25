/**
 * Слой данных кабинета: реальные агрегаты из БД, когда магазин подключён,
 * иначе — демонстрационные значения, чтобы интерфейс всегда был живым.
 */
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  stores,
  products,
  stocks,
  salesDaily,
  feedbacks,
  subscriptions,
  referralEarnings,
  users,
  adCampaigns,
  adSettings,
  priceEvents,
} from "@/lib/db/schema";
import { getStoreForUser } from "@/lib/wb/store";
import { recommendBid, DEFAULT_BID_SETTINGS } from "@/lib/ads/engine";
import { recommendPrice } from "@/lib/pricing/engine";
import type { DailyPoint } from "@/lib/ml/forecast";

const RUB = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export async function getOverview(userId: string) {
  const store = await getStoreForUser(userId);
  const connected = store?.status === "CONNECTED";

  if (!connected || !store) {
    return {
      connected: false,
      kpis: [
        { label: "Выручка за 7 дней", value: "—", delta: "" },
        { label: "Заказы", value: "—", delta: "" },
        { label: "Рейтинг магазина", value: "—", delta: "" },
        { label: "Выкуп", value: "—", delta: "" },
      ],
    };
  }

  const last7 = await db
    .select({
      revenue: sql<number>`coalesce(sum(${salesDaily.revenue}),0)`,
      orders: sql<number>`coalesce(sum(${salesDaily.orders}),0)`,
      buyouts: sql<number>`coalesce(sum(${salesDaily.buyouts}),0)`,
    })
    .from(salesDaily)
    .where(eq(salesDaily.storeId, store.id));

  const r = last7[0] ?? { revenue: 0, orders: 0, buyouts: 0 };
  const buyout = r.orders ? Math.round((r.buyouts / r.orders) * 100) : 0;

  return {
    connected: true,
    kpis: [
      { label: "Выручка (30 дней)", value: RUB(r.revenue), delta: "" },
      { label: "Заказы", value: String(r.orders), delta: "" },
      { label: "Выкупы", value: String(r.buyouts), delta: "" },
      { label: "Выкуп", value: `${buyout}%`, delta: "" },
    ],
  };
}

export async function getAnalytics(userId: string) {
  const store = await getStoreForUser(userId);
  if (!store) return { connected: false, cards: [] };

  const agg = await db
    .select({
      revenue: sql<number>`coalesce(sum(${salesDaily.revenue}),0)`,
      orders: sql<number>`coalesce(sum(${salesDaily.orders}),0)`,
      buyouts: sql<number>`coalesce(sum(${salesDaily.buyouts}),0)`,
    })
    .from(salesDaily)
    .where(eq(salesDaily.storeId, store.id));
  const a = agg[0] ?? { revenue: 0, orders: 0, buyouts: 0 };
  const avg = a.buyouts ? Math.round(a.revenue / a.buyouts) : 0;

  return {
    connected: true,
    cards: [
      ["Выручка (30 дней)", RUB(a.revenue)],
      ["Заказы", String(a.orders)],
      ["Выкупы", String(a.buyouts)],
      ["Средний чек", RUB(avg)],
    ] as [string, string][],
  };
}

export async function getFeedbacks(userId: string) {
  const store = await getStoreForUser(userId);
  if (!store) return [];
  return db
    .select()
    .from(feedbacks)
    .where(eq(feedbacks.storeId, store.id))
    .orderBy(desc(feedbacks.createdAt))
    .limit(30);
}

/** Рекомендации по ценам через адаптивный движок (репрайсер 2.0). */
export async function getPriceRecs(userId: string) {
  const store = await getStoreForUser(userId);
  if (!store) return [];

  const prods = await db.select().from(products).where(eq(products.storeId, store.id)).limit(50);
  const stk = await db.select().from(stocks).where(eq(stocks.storeId, store.id));
  const qtyByNm = new Map<number, number>();
  for (const s of stk) qtyByNm.set(s.nmId, (qtyByNm.get(s.nmId) ?? 0) + s.quantity);

  // Продажи магазина (распределяем как прокси спроса на товар)
  const storeSales = await db.select().from(salesDaily).where(eq(salesDaily.storeId, store.id));
  const share = 1 / Math.max(1, prods.length);
  const points: DailyPoint[] = storeSales.map((s) => ({
    date: s.date,
    orders: s.orders * share,
    buyouts: s.buyouts * share,
    revenue: s.revenue * share,
  }));

  // Последнее применённое изменение цены по каждому артикулу (для обучения)
  const events = await db
    .select()
    .from(priceEvents)
    .where(and(eq(priceEvents.storeId, store.id), eq(priceEvents.applied, true)))
    .orderBy(desc(priceEvents.createdAt))
    .limit(200);
  const lastByNm = new Map<number, (typeof events)[number]>();
  for (const e of events) if (!lastByNm.has(e.nmId)) lastByNm.set(e.nmId, e);

  return prods.slice(0, 20).map((p) => {
    const qty = qtyByNm.get(p.nmId) ?? 0;
    const price = p.priceCurrent ?? 0;

    // Спрос «после» изменения = заказы магазина после даты события
    const ev = lastByNm.get(p.nmId);
    let lastEvent = null as null | { oldPrice: number; newPrice: number; salesBefore: number; salesAfter: number };
    if (ev && ev.oldPrice != null && ev.newPrice != null && ev.salesBefore != null) {
      const evDay = ev.createdAt ? new Date(ev.createdAt).toISOString().slice(0, 10) : "";
      const salesAfter = storeSales.filter((s) => s.date > evDay).reduce((a, s) => a + s.orders, 0);
      if (salesAfter > 0) {
        lastEvent = { oldPrice: ev.oldPrice, newPrice: ev.newPrice, salesBefore: ev.salesBefore, salesAfter };
      }
    }

    const hoursSince = ev?.createdAt ? (Date.now() - +new Date(ev.createdAt)) / 3600000 : undefined;
    const rec = recommendPrice({ price, minProfitPrice: p.minProfitPrice, stock: qty, sales: points, lastEvent, hoursSinceLastChange: hoursSince });
    const action =
      rec.action === "up" ? `Поднять до ${RUB(rec.price)}` : rec.action === "down" ? `Снизить до ${RUB(rec.price)}` : "Оставить";
    return {
      name: p.title ?? `Артикул ${p.nmId}`,
      nmId: p.nmId,
      price: RUB(price),
      oldPriceNum: price,
      newPriceNum: rec.price,
      actionType: rec.action,
      action,
      reason: rec.reason,
      qty,
      confidence: rec.confidence,
    };
  });
}

export async function getReferral(userId: string) {
  const me = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const code = me[0]?.referralCode ?? "SELLIX-XXXXX";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sellix.app";

  const invited = await db
    .select({ c: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.referredById, userId));

  const earnings = await db
    .select({ status: referralEarnings.status, amount: referralEarnings.amount })
    .from(referralEarnings)
    .where(eq(referralEarnings.referrerId, userId));

  const sum = (st: string) =>
    earnings.filter((e) => e.status === st).reduce((a, e) => a + e.amount, 0);

  return {
    code,
    link: `${appUrl}/r/${code}`,
    invited: invited[0]?.c ?? 0,
    paid: earnings.filter((e) => e.status === "PAID").length,
    available: sum("AVAILABLE"),
    total: earnings.reduce((a, e) => a + e.amount, 0),
  };
}

export async function getAds(userId: string) {
  const store = await getStoreForUser(userId);
  const defaults = { ...DEFAULT_BID_SETTINGS, auto: false };
  if (!store) return { connected: false, settings: defaults, campaigns: [] as any[] };

  const setRows = await db.select().from(adSettings).where(eq(adSettings.storeId, store.id)).limit(1);
  const s = setRows[0] ? { ...DEFAULT_BID_SETTINGS, ...setRows[0] } : defaults;

  const camps = await db.select().from(adCampaigns).where(eq(adCampaigns.storeId, store.id));
  const campaigns = camps.map((c) => ({
    ...c,
    rec: recommendBid(
      { cpm: c.cpm, spend: c.spend, revenue: c.revenue, orders: c.orders, views: c.views, clicks: c.clicks },
      s as any
    ),
  }));
  return { connected: true, settings: s, campaigns };
}

export async function getSubscription(userId: string) {
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  const sub = rows[0];
  const trialLeft = sub?.currentPeriodEnd
    ? Math.max(0, Math.ceil((+new Date(sub.currentPeriodEnd) - Date.now()) / 86400000))
    : 0;
  return { sub, trialLeft };
}
