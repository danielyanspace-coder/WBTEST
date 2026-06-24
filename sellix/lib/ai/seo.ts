/** Генерация SEO для карточки WB: заголовок, описание, ключевые слова. */
import { chat, hasOpenAI } from "./openai";

export type SeoResult = { title: string; description: string; keywords: string[] };

export async function generateSeo(input: {
  name: string;
  category?: string;
  brand?: string;
  extra?: string;
}): Promise<SeoResult> {
  if (!hasOpenAI()) {
    return {
      title: input.name,
      description:
        "Подключите OPENAI_API_KEY, чтобы SELLIX сам писал продающие SEO-описания под поиск Wildberries.",
      keywords: [],
    };
  }

  const system =
    "Ты — SEO-специалист маркетплейса Wildberries. Составь продающий и релевантный поиску заголовок (до 100 символов) и описание (800–1200 символов) карточки, естественно вписав ключевые запросы. Без запрещённых обещаний, без КАПСА, без воды. Верни СТРОГО JSON вида {\"title\":\"...\",\"description\":\"...\",\"keywords\":[\"...\"]}.";
  const user = `Товар: ${input.name}\nКатегория: ${input.category ?? "—"}\nБренд: ${input.brand ?? "—"}\nДополнительно: ${input.extra ?? "—"}`;

  const raw = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.6, maxTokens: 800 }
  );

  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      title: String(parsed.title ?? input.name),
      description: String(parsed.description ?? ""),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : [],
    };
  } catch {
    return { title: input.name, description: cleaned, keywords: [] };
  }
}
