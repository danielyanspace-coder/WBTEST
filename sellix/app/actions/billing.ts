"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { createPendingPayment, finalizePayment, type PlanId } from "@/lib/billing/service";
import { createYooPayment, hasYooKassa } from "@/lib/billing/yookassa";

/**
 * Оформление подписки.
 * - ЮKassa подключена → возвращаем ссылку на оплату (redirect).
 * - Иначе mock-режим → сразу активируем подписку (для тестов без ключей).
 */
export async function checkoutAction(plan: PlanId): Promise<{ redirectUrl?: string; ok?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (hasYooKassa()) {
    const payment = await createPendingPayment(user.id, plan, "YOOKASSA");
    try {
      const { confirmationUrl, id } = await createYooPayment({
        amountKopecks: payment.amount,
        description: `Подписка SELLIX (${plan})`,
        returnUrl: `${appUrl}/dashboard/billing?status=success`,
        metadata: { paymentId: payment.id },
        idempotenceKey: payment.id,
      });
      await db.update(payments).set({ externalId: id }).where(eq(payments.id, payment.id));
      return { redirectUrl: confirmationUrl };
    } catch {
      return { error: "Не удалось создать платёж. Попробуйте позже." };
    }
  }

  // MOCK: моментальная активация
  const payment = await createPendingPayment(user.id, plan, "MOCK");
  await finalizePayment(payment.id);
  revalidatePath("/dashboard/billing");
  return { ok: true };
}
