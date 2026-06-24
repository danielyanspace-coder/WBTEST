/** Генерация ответа на отзыв покупателя в заданном «голосе бренда». */
import { chat, hasOpenAI } from "./openai";

export async function generateReviewReply(opts: {
  productName?: string | null;
  rating?: number | null;
  text?: string | null;
  tone?: string;
}): Promise<string> {
  const tone = opts.tone || "дружелюбный, на «вы», вежливый";
  if (!hasOpenAI()) {
    return "Спасибо за ваш отзыв! Нам очень важно ваше мнение. (Подключите OPENAI_API_KEY, чтобы ответы генерировались автоматически.)";
  }

  const system = [
    "Ты отвечаешь на отзывы покупателей на Wildberries от лица продавца.",
    `Тон: ${tone}.`,
    "Правила WB: без ссылок, контактов, рекламы других товаров и просьб изменить оценку.",
    "Если отзыв негативный — извинись, предложи решение, сохрани лицо бренда.",
    "Если позитивный — поблагодари тепло и по-человечески. 1–3 предложения.",
  ].join(" ");

  const user = `Товар: ${opts.productName ?? "—"}\nОценка: ${
    opts.rating ?? "—"
  }/5\nОтзыв: ${opts.text ?? "(без текста)"}\n\nНапиши короткий ответ покупателю.`;

  return chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.6, maxTokens: 200 }
  );
}
