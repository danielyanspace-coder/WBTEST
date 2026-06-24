/**
 * Синхронизация данных магазина из WB API в нашу БД.
 * Каждая секция обёрнута в try/catch — сбой одной не ломает остальные.
 * Вызывается при подключении магазина и кнопкой «Обновить», может ставиться в cron.
 */
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { stores, products, stocks, salesDaily, feedbacks } from "@/lib/db/schema";
import { WBClient } from "./client";

function dateNDaysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}

export async function syncProducts(storeId: string, client: WBClient) {
  const cards = await client.getCards(100);
  let prices: any[] = [];
  try {
    prices = await client.getPrices(1000);
  } catch {}
  const priceByNm = new Map<number, any>();
  for (const p of prices) priceByNm.set(p.nmID ?? p.nmId, p);

  await db.delete(products).where(eq(products.storeId, storeId));
  if (cards.length === 0) return 0;

  const rows = cards.map((c: any) => {
    const nmId = c.nmID ?? c.nmId;
    const pr = priceByNm.get(nmId);
    const sizePrice = pr?.sizes?.[0];
    return {
      storeId,
      nmId,
      title: c.title ?? c.subjectName ?? null,
      brand: c.brand ?? null,
      category: c.subjectName ?? null,
      priceCurrent: sizePrice?.price ?? pr?.price ?? null,
      discount: pr?.discount ?? null,
      rating: null,
    };
  });
  await db.insert(products).values(rows);
  return rows.length;
}

export async function syncStocks(storeId: string, client: WBClient) {
  const data = await client.getStocks(dateNDaysAgo(1));
  await db.delete(stocks).where(eq(stocks.storeId, storeId));
  if (!Array.isArray(data) || data.length === 0) return 0;
  const rows = data.slice(0, 5000).map((s: any) => ({
    storeId,
    nmId: s.nmId ?? s.nmID ?? 0,
    warehouse: s.warehouseName ?? null,
    quantity: s.quantity ?? 0,
  }));
  await db.insert(stocks).values(rows);
  return rows.length;
}

export async function syncSales(storeId: string, client: WBClient) {
  const from = dateNDaysAgo(30);
  const [orders, sales] = await Promise.all([
    client.getOrders(from).catch(() => []),
    client.getSales(from).catch(() => []),
  ]);

  const byDate = new Map<string, { orders: number; buyouts: number; revenue: number }>();
  for (const o of orders as any[]) {
    const d = (o.date ?? "").slice(0, 10);
    if (!d) continue;
    const cur = byDate.get(d) ?? { orders: 0, buyouts: 0, revenue: 0 };
    cur.orders += 1;
    byDate.set(d, cur);
  }
  for (const s of sales as any[]) {
    const d = (s.date ?? "").slice(0, 10);
    if (!d) continue;
    const cur = byDate.get(d) ?? { orders: 0, buyouts: 0, revenue: 0 };
    cur.buyouts += 1;
    cur.revenue += Math.round(s.finishedPrice ?? s.forPay ?? 0);
    byDate.set(d, cur);
  }

  await db.delete(salesDaily).where(eq(salesDaily.storeId, storeId));
  const rows = [...byDate.entries()].map(([date, v]) => ({ storeId, date, ...v }));
  if (rows.length) await db.insert(salesDaily).values(rows);
  return rows.length;
}

export async function syncFeedbacks(storeId: string, client: WBClient) {
  const [unanswered, answered] = await Promise.all([
    client.getFeedbacks(false, 100).catch(() => []),
    client.getFeedbacks(true, 50).catch(() => []),
  ]);
  const all = [...unanswered, ...answered];
  if (all.length === 0) return 0;

  const existing = await db
    .select({ wbId: feedbacks.wbId })
    .from(feedbacks)
    .where(eq(feedbacks.storeId, storeId));
  const known = new Set(existing.map((e) => e.wbId));

  const toInsert = all
    .filter((f: any) => !known.has(String(f.id)))
    .map((f: any) => ({
      storeId,
      wbId: String(f.id),
      nmId: f.productDetails?.nmId ?? null,
      productName: f.productDetails?.productName ?? null,
      authorName: f.userName ?? null,
      rating: f.productValuation ?? null,
      text: f.text ?? "",
      answered: Boolean(f.answer),
      answerText: f.answer?.text ?? null,
      createdAt: f.createdDate ? new Date(f.createdDate) : null,
    }));

  if (toInsert.length) await db.insert(feedbacks).values(toInsert);
  return toInsert.length;
}

/** Полная синхронизация. Возвращает счётчики и ошибки по секциям. */
export async function syncAll(storeId: string, client: WBClient) {
  const result: Record<string, number | string> = {};
  for (const [name, fn] of [
    ["products", syncProducts],
    ["stocks", syncStocks],
    ["sales", syncSales],
    ["feedbacks", syncFeedbacks],
  ] as const) {
    try {
      result[name] = await fn(storeId, client);
    } catch (e: any) {
      result[name] = `error: ${e?.message ?? "unknown"}`;
    }
  }
  await db.update(stores).set({ lastSyncAt: new Date() }).where(eq(stores.id, storeId));
  return result;
}
