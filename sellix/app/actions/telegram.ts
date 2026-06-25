"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, notificationSettings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { botUsername, hasTelegram } from "@/lib/notify/telegram";

/** Сгенерировать ссылку-привязку Telegram. */
export async function linkTelegramAction(): Promise<{ url?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  if (!hasTelegram()) return { error: "Бот не настроен на сервере (нет TELEGRAM_BOT_TOKEN)" };

  const code = "tg_" + Math.random().toString(36).slice(2, 10);
  await db.update(users).set({ telegramLinkCode: code }).where(eq(users.id, user.id));
  return { url: `https://t.me/${botUsername()}?start=${code}` };
}

/** Отключить Telegram. */
export async function unlinkTelegramAction() {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  await db.update(users).set({ telegramChatId: null, telegramLinkCode: null }).where(eq(users.id, user.id));
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

/** Сохранить тумблеры уведомлений. */
export async function saveNotifySettingsAction(input: {
  outOfStock: boolean;
  reviews: boolean;
  budget: boolean;
  priceChanges: boolean;
  weeklyDigest: boolean;
  acceptance: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  const existing = await db
    .select({ id: notificationSettings.id })
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, user.id))
    .limit(1);
  if (existing[0]) {
    await db.update(notificationSettings).set({ ...input, updatedAt: new Date() }).where(eq(notificationSettings.id, existing[0].id));
  } else {
    await db.insert(notificationSettings).values({ userId: user.id, ...input });
  }
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
