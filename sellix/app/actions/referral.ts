"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { referralEarnings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

/** Запрос вывода: помечаем доступные начисления как «выплачено». */
export async function requestPayoutAction() {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  // TODO(payouts): интеграция выплат ЮKassa Payouts; пока помечаем вручную
  await db
    .update(referralEarnings)
    .set({ status: "PAID" })
    .where(and(eq(referralEarnings.referrerId, user.id), eq(referralEarnings.status, "AVAILABLE")));
  revalidatePath("/dashboard/referral");
  return { ok: true };
}
