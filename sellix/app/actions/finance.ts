"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { financeSettings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export async function saveFinanceSettings(input: {
  commissionPct: number;
  logisticsPerUnit: number;
  cogsPct: number;
  taxPct: number;
  fixedMonthly: number;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  const existing = await db.select({ id: financeSettings.id }).from(financeSettings).where(eq(financeSettings.userId, user.id)).limit(1);
  if (existing[0]) {
    await db.update(financeSettings).set({ ...input, updatedAt: new Date() }).where(eq(financeSettings.id, existing[0].id));
  } else {
    await db.insert(financeSettings).values({ userId: user.id, ...input });
  }
  revalidatePath("/dashboard/finance");
  return { ok: true };
}
