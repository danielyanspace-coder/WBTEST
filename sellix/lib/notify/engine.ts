/**
 * Движок уведомлений: сам находит критические ситуации в магазине и шлёт
 * пользователю короткое сообщение в Telegram с конкретным действием.
 * Зачем: продавец не сидит в кабинете 24/7 — а деньги теряются именно в моменты
 * «закончился товар / горит бюджет / негатив без ответа».
 */
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  stores,
  stocks,
  feedbacks,
  adCampaigns,
  adSettings,
  subscriptions,
  salesDaily,
  notifications,
  notificationSettings,
} from "@/lib/db/schema";
import { sendTelegram } from "./telegram";
import { recommendBid, DEFAULT_BID_SETTINGS } from "@/lib/ads/engine";
import { anomalyDrop, type DailyPoint } from "@/lib/ml/forecast";
import { getStoreHealth } from "@/lib/health/score";

type NotifyInput = {
  type: "stock" | "reviews" | "budget" | "price" | "trial" | "digest" | "sales" | "acceptance";
  title: string;
  body?: string;
  severity?: "info" | "warning" | "critical";
  dedupeKey?: string;
};

function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day + 3);
  const first = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((+t - +first) / 86400000 - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
  return `${t.getUTCFullYear()}W${week}`;
}

const SETTING_FLAG: Record<string, keyof typeof flagDefaults> = {
  stock: "outOfStock",
  reviews: "reviews",
  budget: "budget",
  price: "priceChanges",
  digest: "weeklyDigest",
  trial: "weeklyDigest",
  acceptance: "acceptance",
};
const flagDefaults = { outOfStock: true, reviews: true, budget: true, priceChanges: true, weeklyDigest: true, acceptance: true };

/** Создать уведомление (с дедупом за сутки) и отправить в Telegram, если можно. */
export async function notify(userId: string, n: NotifyInput) {
  const dedupe = n.dedupeKey ?? `${n.type}:${new Date().toISOString().slice(0, 10)}`;

  const dupe = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.dedupeKey, dedupe),
        gte(notifications.createdAt, new Date(Date.now() - 86400000))
      )
    )
    .limit(1);
  if (dupe[0]) return;

  // настройки уведомлений
  const setRows = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId)).limit(1);
  const flag = SETTING_FLAG[n.type];
  const enabled = setRows[0] ? (setRows[0] as any)[flag] !== false : true;

  const user = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  let sent = false;
  if (enabled && user?.telegramChatId) {
    const icon = n.severity === "critical" ? "🔴" : n.severity === "warning" ? "🟡" : "🟢";
    sent = await sendTelegram(user.telegramChatId, `${icon} <b>${n.title}</b>\n${n.body ?? ""}\n\n— SELLIX`);
  }

  await db.insert(notifications).values({
    userId,
    type: n.type,
    title: n.title,
    body: n.body ?? null,
    severity: n.severity ?? "info",
    dedupeKey: dedupe,
    sentTelegram: sent,
  });
}

/** Прогон всех правил для одного пользователя. Возвращает число алертов. */
export async function runAlertsForUser(userId: string): Promise<number> {
  let count = 0;
  const store = (
    await db.select().from(stores).where(and(eq(stores.userId, userId), eq(stores.marketplace, "WB"))).limit(1)
  )[0];

  // Триал заканчивается
  const sub = (await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1))[0];
  if (sub?.status === "TRIALING" && sub.currentPeriodEnd) {
    const left = Math.ceil((+new Date(sub.currentPeriodEnd) - Date.now()) / 86400000);
    if (left <= 2 && left >= 0) {
      await notify(userId, {
        type: "trial",
        severity: "warning",
        title: "Пробный период заканчивается",
        body: `Осталось ${left} дн. Выберите тариф, чтобы не потерять автопилот, умные цены и автоответы.`,
        dedupeKey: `trial:${left}`,
      });
      count++;
    }
  }

  if (!store) return count;

  // Заканчивается товар
  const lowStock = await db
    .select({ nmId: stocks.nmId, q: sql<number>`sum(${stocks.quantity})` })
    .from(stocks)
    .where(eq(stocks.storeId, store.id))
    .groupBy(stocks.nmId);
  const critical = lowStock.filter((s) => s.q > 0 && s.q < 5);
  if (critical.length > 0) {
    await notify(userId, {
      type: "stock",
      severity: "critical",
      title: `Скоро закончится ${critical.length} товаров`,
      body: "Запланируйте поставку, иначе потеряете продажи и позиции в поиске. Раздел «Поставки» подскажет, что везти.",
    });
    count++;
  }

  // Негатив без ответа
  const neg = await db
    .select({ c: sql<number>`count(*)` })
    .from(feedbacks)
    .where(and(eq(feedbacks.storeId, store.id), eq(feedbacks.answered, false), sql`${feedbacks.rating} <= 3`));
  const negCount = neg[0]?.c ?? 0;
  if (negCount > 0) {
    await notify(userId, {
      type: "reviews",
      severity: "warning",
      title: `${negCount} негативных отзывов без ответа`,
      body: "Ответьте в течение 24 ч — это поднимает карточку. AI-агент уже подготовил черновики в разделе «Отзывы».",
    });
    count++;
  }

  // Защита бюджета рекламы
  const setRows = await db.select().from(adSettings).where(eq(adSettings.storeId, store.id)).limit(1);
  const s = setRows[0] ? { ...DEFAULT_BID_SETTINGS, ...setRows[0] } : DEFAULT_BID_SETTINGS;
  const camps = await db.select().from(adCampaigns).where(eq(adCampaigns.storeId, store.id));
  const burning = camps.filter((c) => recommendBid({ cpm: c.cpm, spend: c.spend, revenue: c.revenue, orders: c.orders, views: c.views, clicks: c.clicks }, s as any).alert);
  if (burning.length > 0) {
    await notify(userId, {
      type: "budget",
      severity: "critical",
      title: `Реклама жжёт бюджет: ${burning.length} кампаний`,
      body: "Сработала защита: ставки снижены/на паузе. Загляните в «Реклама», чтобы подтвердить или поправить.",
    });
    count++;
  }

  // Резкий обвал продаж (аномалия)
  const sales = await db.select().from(salesDaily).where(eq(salesDaily.storeId, store.id));
  const points: DailyPoint[] = sales.map((s) => ({ date: s.date, orders: s.orders, buyouts: s.buyouts, revenue: s.revenue }));
  const anomaly = anomalyDrop(points);
  if (anomaly) {
    await notify(userId, {
      type: "sales",
      severity: "critical",
      title: `Продажи упали на ${anomaly.drop}%`,
      body: `Сейчас ~${anomaly.recent} заказов/день против обычных ~${anomaly.baseline}. Проверьте цены, рекламу и остатки — возможна потеря позиций.`,
      dedupeKey: `sales:${new Date().toISOString().slice(0, 10)}`,
    });
    count++;
  }

  return count;
}

/** Еженедельный дайджест в Telegram (раз в неделю). */
export async function sendWeeklyDigest(userId: string) {
  const health = await getStoreHealth(userId);
  if (!health.connected) return;
  const top = health.actions.slice(0, 3).map((a) => `• ${a.title}`).join("\n") || "• Критичных задач нет — так держать!";
  await notify(userId, {
    type: "digest",
    severity: "info",
    title: `Итоги недели · здоровье магазина ${health.score}/100 (${health.grade})`,
    body: `Главное на неделю:\n${top}\n\nОткройте кабинет, чтобы выполнить в один клик.`,
    dedupeKey: `digest:${isoWeek()}`,
  });
}

/** Прогон по всем пользователям (для cron). */
export async function runAlertsForAll(): Promise<number> {
  const all = await db.select({ id: users.id }).from(users);
  let total = 0;
  for (const u of all) {
    try {
      total += await runAlertsForUser(u.id);
      await sendWeeklyDigest(u.id); // дедуп раз в неделю внутри
    } catch {}
  }
  return total;
}
