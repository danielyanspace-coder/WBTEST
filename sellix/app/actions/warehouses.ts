"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { warehouseWatches } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getClientForUser } from "@/lib/wb/store";

/** Список складов WB (для выбора отслеживаемого). */
export async function getWarehousesAction(): Promise<{ items?: { id: number; name: string }[]; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  const ctx = await getClientForUser(user.id);
  if (!ctx) return { error: "Сначала подключите магазин" };
  try {
    const raw = await ctx.client.getWarehouses();
    const items = raw
      .map((w: any) => ({ id: w.ID ?? w.id, name: w.name ?? `Склад ${w.ID ?? w.id}` }))
      .filter((w: any) => w.id);
    return { items };
  } catch {
    return { error: "Не удалось получить список складов" };
  }
}

export async function addWarehouseWatchAction(warehouseId: number, warehouseName: string, maxCoefficient: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  await db
    .insert(warehouseWatches)
    .values({ userId: user.id, warehouseId, warehouseName, maxCoefficient })
    .onConflictDoUpdate({ target: [warehouseWatches.userId, warehouseWatches.warehouseId], set: { maxCoefficient, warehouseName } });
  revalidatePath("/dashboard/supplies");
  return { ok: true };
}

export async function removeWarehouseWatchAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  await db.delete(warehouseWatches).where(and(eq(warehouseWatches.id, id), eq(warehouseWatches.userId, user.id)));
  revalidatePath("/dashboard/supplies");
  return { ok: true };
}

/** Отслеживаемые склады + живой статус приёмки (минимальный коэффициент и дата). */
export async function getWarehouseWatchesStatus(userId: string) {
  const watches = await db.select().from(warehouseWatches).where(eq(warehouseWatches.userId, userId));
  if (watches.length === 0) return [];

  const ctx = await getClientForUser(userId);
  let coefs: any[] = [];
  if (ctx) {
    try {
      coefs = await ctx.client.getAcceptanceCoefficients(watches.map((w) => w.warehouseId));
    } catch {}
  }

  return watches.map((w) => {
    const slots = coefs.filter(
      (c) => (c.warehouseID ?? c.warehouseId) === w.warehouseId && (c.coefficient ?? -1) >= 0 && c.allowUnload !== false
    );
    slots.sort((a, b) => (a.coefficient ?? 0) - (b.coefficient ?? 0));
    const best = slots[0];
    const open = best != null && (best.coefficient ?? 99) <= w.maxCoefficient;
    return {
      id: w.id,
      warehouseId: w.warehouseId,
      warehouseName: w.warehouseName ?? `Склад ${w.warehouseId}`,
      maxCoefficient: w.maxCoefficient,
      currentCoef: best ? best.coefficient ?? null : null,
      date: best?.date ? String(best.date).slice(0, 10) : null,
      open,
    };
  });
}
