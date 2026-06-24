"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { generateReferralCode } from "@/lib/auth/referral";
import { TRIAL_DAYS } from "@/lib/plans";

export type AuthState = { error?: string };

const registerSchema = z.object({
  name: z.string().trim().min(2, "Введите имя"),
  email: z.string().trim().toLowerCase().email("Неверный email"),
  password: z.string().min(8, "Пароль минимум 8 символов"),
  ref: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Неверный email"),
  password: z.string().min(1, "Введите пароль"),
});

async function uniqueReferralCode() {
  for (let i = 0; i < 6; i++) {
    const code = generateReferralCode();
    const exists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.referralCode, code))
      .limit(1);
    if (exists.length === 0) return code;
  }
  return generateReferralCode() + Date.now().toString(36).slice(-3).toUpperCase();
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    ref: formData.get("ref") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };
  }
  const { name, email, password, ref } = parsed.data;

  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) {
      return { error: "Пользователь с таким email уже есть" };
    }

    // Кто пригласил (по реферальному коду)
    let referredById: string | null = null;
    if (ref) {
      const referrer = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, ref))
        .limit(1);
      referredById = referrer[0]?.id ?? null;
    }

    const passwordHash = await hashPassword(password);
    const referralCode = await uniqueReferralCode();
    const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash, referralCode, referredById, trialEndsAt })
      .returning({ id: users.id, email: users.email });

    // Пробная подписка на 7 дней
    await db.insert(subscriptions).values({
      userId: user.id,
      plan: "NONE",
      status: "TRIALING",
      currentPeriodEnd: trialEndsAt,
    });

    await createSession(user);
  } catch (e) {
    return { error: "Не удалось создать аккаунт. Попробуйте ещё раз." };
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };
  }
  const { email, password } = parsed.data;

  try {
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return { error: "Неверный email или пароль" };
    }
    await createSession({ id: user.id, email: user.email });
  } catch (e) {
    return { error: "Ошибка входа. Попробуйте ещё раз." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  destroySession();
  redirect("/");
}
