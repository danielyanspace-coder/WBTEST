/**
 * Подпись/проверка JWT (jose). Edge-safe — используется в middleware.
 * Не импортирует БД и next/headers, чтобы работать на Edge Runtime.
 */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sellix_session";
const ALG = "HS256";

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-insecure-auth-secret-change-me"
  );
}

export async function signToken(payload: { sub: string; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as { sub: string; email: string };
  } catch {
    return null;
  }
}
