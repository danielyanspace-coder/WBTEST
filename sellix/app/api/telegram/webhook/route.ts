import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sendTelegram } from "@/lib/notify/telegram";

export const runtime = "nodejs";

/**
 * Вебхук Telegram-бота. Обрабатывает «/start КОД» — привязывает чат к аккаунту.
 * Настройка (один раз):
 *   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<APP_URL>/api/telegram/webhook"
 */
export async function POST(req: NextRequest) {
  const update = await req.json().catch(() => null);
  const msg = update?.message;
  const text: string = msg?.text ?? "";
  const chatId = msg?.chat?.id;
  if (!chatId) return NextResponse.json({ ok: true });

  const m = text.match(/^\/start\s+(\S+)/);
  if (m) {
    const code = m[1];
    const rows = await db.select().from(users).where(eq(users.telegramLinkCode, code)).limit(1);
    const user = rows[0];
    if (user) {
      await db
        .update(users)
        .set({ telegramChatId: String(chatId), telegramLinkCode: null })
        .where(eq(users.id, user.id));
      await sendTelegram(String(chatId), "✅ <b>Telegram подключён!</b>\nТеперь SELLIX будет присылать важные сигналы: остатки, бюджет рекламы, негативные отзывы.");
    } else {
      await sendTelegram(String(chatId), "Код не найден или устарел. Откройте в кабинете «Настройки → Telegram» и получите новую ссылку.");
    }
  } else if (text === "/start") {
    await sendTelegram(String(chatId), "Привет! Это бот SELLIX. Чтобы привязать аккаунт, откройте кабинет → Настройки → «Подключить Telegram».");
  }

  return NextResponse.json({ ok: true });
}
