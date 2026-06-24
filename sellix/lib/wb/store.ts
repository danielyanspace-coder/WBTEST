import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { decryptSecret } from "@/lib/crypto";
import { WBClient } from "./client";

/** Магазин WB пользователя (или null). */
export async function getStoreForUser(userId: string) {
  const rows = await db
    .select()
    .from(stores)
    .where(and(eq(stores.userId, userId), eq(stores.marketplace, "WB")))
    .limit(1);
  return rows[0] ?? null;
}

/** Расшифрованный токен магазина (или null). */
export function getStoreToken(store: typeof stores.$inferSelect | null): string | null {
  if (!store?.keyCipher || !store.keyIv || !store.keyTag) return null;
  try {
    return decryptSecret(store.keyCipher, store.keyIv, store.keyTag);
  } catch {
    return null;
  }
}

/** Готовый WB-клиент для пользователя (или null, если магазин не подключён). */
export async function getClientForUser(userId: string) {
  const store = await getStoreForUser(userId);
  const token = getStoreToken(store);
  if (!store || !token) return null;
  return { store, client: new WBClient(token) };
}
