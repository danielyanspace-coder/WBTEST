"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adCampaigns, adSettings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getClientForUser } from "@/lib/wb/store";
import { recommendCpm } from "@/lib/ads/bidder";

/** Применить ставку к одной кампании. */
export async function applyBidAction(advertId: number, type: number, cpm: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  const ctx = await getClientForUser(user.id);
  if (!ctx) return { error: "Сначала подключите магазин" };
  try {
    await ctx.client.setAdvertCpm(advertId, type, cpm);
    await db
      .update(adCampaigns)
      .set({ cpm })
      .where(and(eq(adCampaigns.storeId, ctx.store.id), eq(adCampaigns.advertId, advertId)));
  } catch {
    return { error: "WB отклонил изменение ставки" };
  }
  revalidatePath("/dashboard/ads");
  return { ok: true };
}

/** Сохранить настройки биддера. */
export async function saveAdSettingsAction(input: {
  targetDrr: number;
  maxCpm: number;
  minCpm: number;
  auto: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  const ctx = await getClientForUser(user.id);
  if (!ctx) return { error: "Сначала подключите магазин" };

  const existing = await db
    .select({ id: adSettings.id })
    .from(adSettings)
    .where(eq(adSettings.storeId, ctx.store.id))
    .limit(1);
  if (existing[0]) {
    await db.update(adSettings).set({ ...input, updatedAt: new Date() }).where(eq(adSettings.id, existing[0].id));
  } else {
    await db.insert(adSettings).values({ storeId: ctx.store.id, ...input });
  }
  revalidatePath("/dashboard/ads");
  return { ok: true };
}

/** Применить рекомендованные ставки ко всем кампаниям (ручной запуск автопилота). */
export async function runBidderAction() {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  const ctx = await getClientForUser(user.id);
  if (!ctx) return { error: "Сначала подключите магазин" };

  const setRows = await db.select().from(adSettings).where(eq(adSettings.storeId, ctx.store.id)).limit(1);
  const s = setRows[0] ?? { targetDrr: 10, minCpm: 100, maxCpm: 500 };
  const camps = await db.select().from(adCampaigns).where(eq(adCampaigns.storeId, ctx.store.id));

  let applied = 0;
  for (const c of camps) {
    const rec = recommendCpm({ cpm: c.cpm, drr: c.drr, orders: c.orders }, s as any);
    if (rec.action !== "keep" && c.type != null) {
      try {
        await ctx.client.setAdvertCpm(c.advertId, c.type, rec.cpm);
        await db.update(adCampaigns).set({ cpm: rec.cpm }).where(eq(adCampaigns.id, c.id));
        applied++;
      } catch {}
    }
  }
  revalidatePath("/dashboard/ads");
  return { ok: true, applied };
}
