import { NextRequest, NextResponse } from "next/server";
import { finalizePayment } from "@/lib/billing/service";

export const runtime = "nodejs";

/**
 * Вебхук ЮKassa. На событие payment.succeeded достаём наш paymentId из metadata
 * и завершаем платёж (активация подписки + реферальное начисление).
 * URL для настройки в ЮKassa: {APP_URL}/api/billing/webhook
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  if (body.event === "payment.succeeded") {
    const paymentId = body.object?.metadata?.paymentId;
    if (paymentId) {
      try {
        await finalizePayment(paymentId);
      } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
      }
    }
  }
  return NextResponse.json({ ok: true });
}
