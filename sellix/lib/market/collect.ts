/**
 * Накопление собственной истории рынка (без покупки баз).
 * - appendOwnSnapshots: ежедневный снимок реальных данных подключённого магазина.
 * - snapshotWatchlist: ежедневный снимок отслеживаемых товаров через публичный API.
 * Со временем из этих снимков строится оценка продаж (метод разницы остатков).
 */
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { marketSnapshots, products, stocks, watchItems } from "@/lib/db/schema";
import { fetchItemSnapshot } from "./public";

const today = () => new Date().toISOString().slice(0, 10);

/** Снимок реальных данных магазина (цена + остаток) — наш ground-truth. */
export async function appendOwnSnapshots(storeId: string) {
  const prods = await db
    .select({ nmId: products.nmId, price: products.priceCurrent })
    .from(products)
    .where(eq(products.storeId, storeId));
  if (prods.length === 0) return 0;

  const stk = await db
    .select({ nmId: stocks.nmId, q: sql<number>`sum(${stocks.quantity})` })
    .from(stocks)
    .where(eq(stocks.storeId, storeId))
    .groupBy(stocks.nmId);
  const qtyByNm = new Map<number, number>();
  for (const s of stk) qtyByNm.set(s.nmId, s.q ?? 0);

  const d = today();
  const rows = prods.map((p) => ({
    nmId: p.nmId,
    date: d,
    price: p.price ?? null,
    stock: qtyByNm.get(p.nmId) ?? 0,
    source: "own" as const,
  }));

  await db.insert(marketSnapshots).values(rows).onConflictDoNothing();
  return rows.length;
}

/** Снимок всех отслеживаемых товаров через бесплатный публичный API WB. */
export async function snapshotWatchlist(limit = 300) {
  const items = await db
    .select({ nmId: watchItems.nmId })
    .from(watchItems)
    .groupBy(watchItems.nmId)
    .limit(limit);
  const d = today();
  let ok = 0;
  for (const it of items) {
    const snap = await fetchItemSnapshot(it.nmId);
    if (!snap) continue;
    await db
      .insert(marketSnapshots)
      .values({
        nmId: it.nmId,
        date: d,
        price: snap.price,
        stock: snap.stock,
        rating: snap.rating,
        feedbacks: snap.feedbacks,
        source: "public",
      })
      .onConflictDoNothing();
    ok++;
    await new Promise((r) => setTimeout(r, 120)); // бережём публичный API
  }
  return ok;
}
