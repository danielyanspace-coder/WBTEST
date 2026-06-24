import { NextRequest, NextResponse } from "next/server";
import { answerWithRag } from "@/lib/ai/rag";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { message } = await req.json().catch(() => ({ message: "" }));
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "empty message" }, { status: 400 });
  }

  try {
    const result = await answerWithRag(message);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { answer: "Не получилось ответить, попробуйте ещё раз.", sources: [] },
      { status: 200 }
    );
  }
}
