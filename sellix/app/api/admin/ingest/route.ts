import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handbookDocs } from "@/lib/db/schema";
import { embed, hasOpenAI } from "@/lib/ai/openai";
import { HANDBOOK } from "@/lib/ai/handbookData";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Загрузка справочника в RAG: считает эмбеддинги и кладёт в БД.
 * Защита: заголовок x-admin-secret должен совпасть с ADMIN_SECRET.
 * Запуск (после установки OPENAI_API_KEY):
 *   curl -X POST {APP_URL}/api/admin/ingest -H "x-admin-secret: ВАШ_СЕКРЕТ"
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!hasOpenAI()) {
    return NextResponse.json({ error: "OPENAI_API_KEY не задан" }, { status: 400 });
  }

  try {
    const embeddings = await embed(HANDBOOK.map((d) => `${d.title}\n${d.content}`));
    await db.delete(handbookDocs);
    await db.insert(handbookDocs).values(
      HANDBOOK.map((d, i) => ({
        source: "WB",
        title: d.title,
        url: d.url,
        content: d.content,
        embedding: embeddings[i],
      }))
    );
    return NextResponse.json({ ok: true, ingested: HANDBOOK.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "ingest failed" }, { status: 500 });
  }
}
