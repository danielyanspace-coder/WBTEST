"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { watchItems, marketSnapshots } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { fetchItemSnapshot } from "@/lib/market/public";
import { estimateSales } from "@/lib/market/estimate";

/** Добавить товар/конкурента в отслеживание (начинаем копить историю). */
export async function addWatchAction(nmId: number, title?: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  try {
    await db.insert(watchItems).values({ userId: user.id, nmId, title: title ?? null }).onConflictDoNothing();
    // первый снимок сразу, чтобы было от чего считать
    const snap = await fetchItemSnapshot(nmId);
    if (snap) {
      await db
        .insert(marketSnapshots)
        .values({ nmId, date: new Date().toISOString().slice(0, 10), price: snap.price, stock: snap.stock, rating: snap.rating, feedbacks: snap.feedbacks, source: "public" })
        .onConflictDoNothing();
    }
  } catch {
    return { error: "Не удалось добавить" };
  }
  revalidatePath("/dashboard/niches");
  return { ok: true };
}

export async function removeWatchAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  await db.delete(watchItems).where(and(eq(watchItems.id, id), eq(watchItems.userId, user.id)));
  revalidatePath("/dashboard/niches");
  return { ok: true };
}

/** Список отслеживаемых товаров с оценкой продаж по накопленной истории. */
export async function getWatchlist(userId: string) {
  const items = await db
    .select()
    .from(watchItems)
    .where(eq(watchItems.userId, userId))
    .orderBy(desc(watchItems.createdAt))
    .limit(50);

  const out = [];
  for (const it of items) {
    const snaps = await db
      .select({ date: marketSnapshots.date, stock: marketSnapshots.stock, price: marketSnapshots.price })
      .from(marketSnapshots)
      .where(eq(marketSnapshots.nmId, it.nmId))
      .orderBy(desc(marketSnapshots.date))
      .limit(40);
    const est = estimateSales(snaps.map((s) => ({ date: s.date, stock: s.stock, price: s.price })));
    const latest = snaps[0];
    const asc = [...snaps].reverse();
    out.push({
      id: it.id,
      nmId: it.nmId,
      title: it.title ?? `Артикул ${it.nmId}`,
      price: latest?.price ?? null,
      stock: latest?.stock ?? null,
      days: est?.days ?? 0,
      perDay: est?.perDay ?? null,
      estSold: est?.estSold ?? null,
      stockSeries: asc.map((s) => s.stock ?? 0),
      salesSeries: est?.series.map((x) => x.sold) ?? [],
    });
  }
  return out;
}
