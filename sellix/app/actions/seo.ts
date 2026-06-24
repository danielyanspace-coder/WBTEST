"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { getClientForUser } from "@/lib/wb/store";
import { generateSeo, type SeoResult } from "@/lib/ai/seo";

/** Сгенерировать SEO по данным товара. */
export async function generateSeoAction(input: {
  name: string;
  category?: string;
  brand?: string;
  extra?: string;
}): Promise<{ result?: SeoResult; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  if (!input.name?.trim()) return { error: "Укажите название товара" };
  try {
    const result = await generateSeo(input);
    return { result };
  } catch {
    return { error: "Не удалось сгенерировать SEO" };
  }
}

/** Применить сгенерированные тексты к карточке WB. */
export async function applySeoAction(nmId: number, title: string, description: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  const ctx = await getClientForUser(user.id);
  if (!ctx) return { error: "Сначала подключите магазин" };
  try {
    await ctx.client.updateCardText(nmId, title, description);
  } catch (e: any) {
    return { error: "WB не принял обновление карточки (проверьте права токена «Контент»)." };
  }
  return { ok: true };
}
