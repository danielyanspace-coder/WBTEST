"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { priceEvents, salesDaily } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getClientForUser } from "@/lib/wb/store";
import { notify } from "@/lib/notify/engine";

/**
 * Применить рекомендованную цену в WB и записать событие (для адаптивного
 * обучения репрайсера и объяснимости). Шлёт уведомление о крупном изменении.
 */
export async function applyPriceAction(input: {
  nmId: number;
  oldPrice: number;
  newPrice: number;
  reason?: string;
  confidence?: number;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  const ctx = await getClientForUser(user.id);
  if (!ctx) return { error: "Сначала подключите магазин" };

  try {
    await ctx.client.setPrice(input.nmId, input.newPrice);

    // Снимок спроса «до» (для последующей оценки эластичности)
    const before = await db
      .select({ orders: sql<number>`coalesce(sum(${salesDaily.orders}),0)` })
      .from(salesDaily)
      .where(eq(salesDaily.storeId, ctx.store.id));
    const salesBefore = before[0]?.orders ?? 0;

    await db.insert(priceEvents).values({
      storeId: ctx.store.id,
      nmId: input.nmId,
      oldPrice: input.oldPrice,
      newPrice: input.newPrice,
      reason: input.reason ?? null,
      confidence: input.confidence ?? null,
      applied: true,
      salesBefore,
    });

    const deltaPct = Math.round(((input.newPrice - input.oldPrice) / Math.max(1, input.oldPrice)) * 100);
    if (Math.abs(deltaPct) >= 5) {
      await notify(user.id, {
        type: "price",
        severity: "info",
        title: `Цена изменена на ${deltaPct > 0 ? "+" : ""}${deltaPct}%`,
        body: `Артикул ${input.nmId}: ${input.oldPrice} → ${input.newPrice} ₽. ${input.reason ?? ""}`,
        dedupeKey: `price:${input.nmId}:${new Date().toISOString().slice(0, 13)}`,
      });
    }
  } catch {
    return { error: "WB отклонил изменение цены (проверьте права токена «Цены»)." };
  }

  revalidatePath("/dashboard/pricing");
  return { ok: true };
}
