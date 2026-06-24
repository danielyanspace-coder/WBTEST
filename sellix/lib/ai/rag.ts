/**
 * RAG по справочнику Wildberries: находим релевантные куски и отвечаем строго
 * по ним, со ссылками. Косинусная близость считается в Node (pgvector не нужен).
 */
import { db } from "@/lib/db";
import { handbookDocs } from "@/lib/db/schema";
import { chat, embed, hasOpenAI } from "./openai";

export type Source = { title: string; url: string | null };
export type RagAnswer = { answer: string; sources: Source[] };

function cosine(a: number[], b: number[]) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

async function retrieve(query: string, k = 4) {
  const docs = await db
    .select({
      title: handbookDocs.title,
      url: handbookDocs.url,
      content: handbookDocs.content,
      embedding: handbookDocs.embedding,
    })
    .from(handbookDocs);

  const withEmb = docs.filter((d) => Array.isArray(d.embedding));
  if (withEmb.length === 0) return [];

  const [qvec] = await embed([query]);
  return withEmb
    .map((d) => ({ ...d, score: cosine(qvec, d.embedding as number[]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export async function answerWithRag(question: string): Promise<RagAnswer> {
  if (!hasOpenAI()) {
    return {
      answer:
        "AI пока не подключён: добавьте OPENAI_API_KEY в настройки сервера, и я начну отвечать по справочнику Wildberries.",
      sources: [],
    };
  }

  let chunks: Awaited<ReturnType<typeof retrieve>> = [];
  try {
    chunks = await retrieve(question, 4);
  } catch {
    chunks = [];
  }

  const context = chunks
    .map((c, i) => `[Источник ${i + 1}: ${c.title}]\n${c.content}`)
    .join("\n\n");

  const system = [
    "Ты — помощник продавца Wildberries в сервисе SELLIX.",
    "Отвечай простым человеческим языком, без сложных терминов; если термин нужен — поясни его в скобках.",
    "Используй приведённый контекст из справочника. Если ответа в контексте нет — честно скажи об этом и дай общий совет.",
    "Не выдумывай цифры и правила. Будь кратким и по делу.",
  ].join(" ");

  const user = context
    ? `Контекст из справочника:\n${context}\n\nВопрос: ${question}`
    : `Вопрос: ${question}\n(Контекста из справочника не нашлось — ответь общими словами и предложи уточнить.)`;

  const answer = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.3 }
  );

  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const c of chunks) {
    const key = c.title + (c.url ?? "");
    if (!seen.has(key)) {
      seen.add(key);
      sources.push({ title: c.title, url: c.url });
    }
  }

  return { answer, sources };
}
