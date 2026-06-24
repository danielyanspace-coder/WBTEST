/** Тонкий клиент OpenAI (REST через fetch). Модели берутся из .env. */
const BASE = "https://api.openai.com/v1";

export function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function embed(texts: string[]): Promise<number[][]> {
  const res = await fetch(`${BASE}/embeddings`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small",
      input: texts,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI embed ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.data.map((d: any) => d.embedding as number[]);
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chat(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 700,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI chat ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
