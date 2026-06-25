"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { keywordTracks, keywordPositions } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { findPosition } from "@/lib/market/position";

/** Начать отслеживать позицию артикула по запросу (сразу делаем первый замер). */
export async function addKeywordAction(nmId: number, query: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  const q = query.trim();
  if (!nmId || !q) return { error: "Укажите артикул и запрос" };
  try {
    await db.insert(keywordTracks).values({ userId: user.id, nmId, query: q }).onConflictDoNothing();
    const pos = await findPosition(q, nmId);
    await db
      .insert(keywordPositions)
      .values({ nmId, query: q, date: new Date().toISOString().slice(0, 10), position: pos })
      .onConflictDoNothing();
  } catch {
    return { error: "Не удалось добавить запрос" };
  }
  revalidatePath("/dashboard/seo");
  return { ok: true };
}

export async function removeKeywordAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  await db.delete(keywordTracks).where(and(eq(keywordTracks.id, id), eq(keywordTracks.userId, user.id)));
  revalidatePath("/dashboard/seo");
  return { ok: true };
}

/** Список отслеживаемых запросов с текущей позицией, изменением и историей. */
export async function getKeywordTracks(userId: string) {
  const tracks = await db
    .select()
    .from(keywordTracks)
    .where(eq(keywordTracks.userId, userId))
    .orderBy(desc(keywordTracks.createdAt))
    .limit(50);

  const out = [];
  for (const t of tracks) {
    const hist = await db
      .select({ date: keywordPositions.date, position: keywordPositions.position })
      .from(keywordPositions)
      .where(and(eq(keywordPositions.nmId, t.nmId), eq(keywordPositions.query, t.query)))
      .orderBy(desc(keywordPositions.date))
      .limit(20);
    const current = hist[0]?.position ?? null;
    const prev = hist[1]?.position ?? null;
    const delta = current != null && prev != null ? prev - current : null; // + = поднялись
    out.push({
      id: t.id,
      nmId: t.nmId,
      query: t.query,
      current,
      delta,
      series: [...hist].reverse().map((h) => h.position ?? 0),
    });
  }
  return out;
}
