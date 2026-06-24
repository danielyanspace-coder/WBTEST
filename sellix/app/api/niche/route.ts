import { NextRequest, NextResponse } from "next/server";
import { analyzeNiche } from "@/lib/niche/wbPublic";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const query = req.nextUrl.searchParams.get("query")?.trim();
  if (!query) return NextResponse.json({ error: "empty query" }, { status: 400 });

  try {
    const report = await analyzeNiche(query);
    return NextResponse.json(report);
  } catch {
    return NextResponse.json(
      { error: "WB не отдал данные по нише (мог временно ограничить доступ). Попробуйте позже." },
      { status: 200 }
    );
  }
}
