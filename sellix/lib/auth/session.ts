/**
 * Серверные хелперы сессии (Node runtime): чтение/запись cookie + загрузка
 * текущего пользователя из БД. Используется в server actions и RSC.
 */
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { SESSION_COOKIE, signToken, verifyToken } from "./jwt";

export async function createSession(user: { id: string; email: string }) {
  const token = await signToken({ sub: user.id, email: user.email });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function destroySession() {
  cookies().delete(SESSION_COOKIE);
}

/** Текущий пользователь или null. Безопасно: при недоступной БД вернёт null. */
export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.sub) return null;
  try {
    const rows = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
