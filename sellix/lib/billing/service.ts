/** Бизнес-логика подписок и реферальных начислений. */
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, subscriptions, payments, referralEarnings } from "@/lib/db/schema";
import { PLANS, REFERRAL_PERCENT } from "@/lib/plans";

export type PlanId = "START" | "PRO" | "BUSINESS";

const PLAN_MAP: Record<PlanId, (typeof PLANS)[number]["id"]> = {
  START: "start",
  PRO: "pro",
  BUSINESS: "business",
};

export function planPriceKopecks(plan: PlanId): number {
  const p = PLANS.find((x) => x.id === PLAN_MAP[plan]);
  return (p?.priceMonth ?? 0) * 100;
}

/** Создать запись платежа в статусе PENDING. */
export async function createPendingPayment(userId: string, plan: PlanId, provider: "MOCK" | "YOOKASSA") {
  const [row] = await db
    .insert(payments)
    .values({ userId, plan, amount: planPriceKopecks(plan), provider, status: "PENDING" })
    .returning();
  return row;
}

/** Завершить платёж: активировать подписку на 30 дней и начислить рефералу 20%. */
export async function finalizePayment(paymentId: string) {
  const rows = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  const payment = rows[0];
  if (!payment || payment.status === "SUCCEEDED") return;

  await db.update(payments).set({ status: "SUCCEEDED" }).where(eq(payments.id, paymentId));

  const periodEnd = new Date(Date.now() + 30 * 86400000);
  const existingSub = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.userId, payment.userId))
    .limit(1);

  if (existingSub[0]) {
    await db
      .update(subscriptions)
      .set({ plan: payment.plan, status: "ACTIVE", currentPeriodEnd: periodEnd, updatedAt: new Date() })
      .where(eq(subscriptions.userId, payment.userId));
  } else {
    await db.insert(subscriptions).values({
      userId: payment.userId,
      plan: payment.plan,
      status: "ACTIVE",
      currentPeriodEnd: periodEnd,
    });
  }

  // Реферальное начисление 20% тому, кто пригласил
  const buyer = await db.select().from(users).where(eq(users.id, payment.userId)).limit(1);
  const referrerId = buyer[0]?.referredById;
  if (referrerId) {
    await db.insert(referralEarnings).values({
      referrerId,
      referredUserId: payment.userId,
      paymentId: payment.id,
      amount: Math.round((payment.amount * REFERRAL_PERCENT) / 100),
      percent: REFERRAL_PERCENT,
      status: "AVAILABLE",
    });
  }
}
