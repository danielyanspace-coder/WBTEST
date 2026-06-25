import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { hasOpenAI } from "@/lib/ai/openai";
import { hasYooKassa } from "@/lib/billing/yookassa";
import { hasTelegram } from "@/lib/notify/telegram";

export const runtime = "nodejs";

/** Состояние системы и подключённых интеграций (для проверки после деплоя). */
export async function GET() {
  let dbOk = false;
  try {
    await db.execute(sql`select 1`);
    dbOk = true;
  } catch {}

  const checks = {
    db: dbOk,
    openai: hasOpenAI(),
    yookassa: hasYooKassa(),
    telegram: hasTelegram(),
    cron: Boolean(process.env.CRON_SECRET),
  };

  return NextResponse.json(
    { status: dbOk ? "ok" : "degraded", time: new Date().toISOString(), checks },
    { status: dbOk ? 200 : 503 }
  );
}
