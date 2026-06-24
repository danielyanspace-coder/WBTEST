/** Отправка сообщений через Telegram Bot API. Включается при TELEGRAM_BOT_TOKEN. */
const API = "https://api.telegram.org";

export function hasTelegram() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

export function botUsername() {
  return process.env.TELEGRAM_BOT_USERNAME || "your_bot";
}

export async function sendTelegram(chatId: string, text: string): Promise<boolean> {
  if (!hasTelegram()) return false;
  try {
    const res = await fetch(`${API}/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
