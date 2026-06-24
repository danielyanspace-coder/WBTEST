"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { encryptSecret } from "@/lib/crypto";
import { getCurrentUser } from "@/lib/auth/session";
import { WBClient } from "@/lib/wb/client";
import { getClientForUser } from "@/lib/wb/store";
import { syncAll } from "@/lib/wb/sync";

export type StoreState = { error?: string; ok?: boolean };

const schema = z.object({
  apiKey: z.string().trim().min(20, "Похоже, ключ слишком короткий"),
  name: z.string().trim().optional(),
});

/** Подключение магазина WB: проверяем ключ, шифруем, сохраняем, синхронизируем. */
export async function connectStoreAction(
  _prev: StoreState,
  formData: FormData
): Promise<StoreState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Сессия истекла, войдите снова" };

  const parsed = schema.safeParse({
    apiKey: formData.get("apiKey"),
    name: formData.get("name") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте ключ" };
  }

  const apiKey = parsed.data.apiKey;

  // Проверяем токен (если WB недоступен — не блокируем, сохраним и попробуем позже)
  const valid = await new WBClient(apiKey).ping().catch(() => false);

  try {
    const { cipher, iv, tag } = encryptSecret(apiKey);
    const existing = await db
      .select({ id: stores.id })
      .from(stores)
      .where(and(eq(stores.userId, user.id), eq(stores.marketplace, "WB")))
      .limit(1);

    const values = {
      keyCipher: cipher,
      keyIv: iv,
      keyTag: tag,
      status: "CONNECTED" as const,
    };

    let storeId: string;
    if (existing[0]) {
      storeId = existing[0].id;
      await db.update(stores).set(values).where(eq(stores.id, storeId));
    } else {
      const [row] = await db
        .insert(stores)
        .values({ userId: user.id, name: parsed.data.name || "Мой магазин", ...values })
        .returning({ id: stores.id });
      storeId = row.id;
    }

    // Первая синхронизация (не валим подключение, если что-то частично не зашло)
    const client = new WBClient(apiKey);
    await syncAll(storeId, client).catch(() => null);
  } catch {
    return { error: "Не удалось сохранить ключ. Попробуйте ещё раз." };
  }

  revalidatePath("/dashboard");
  return {
    ok: true,
    error: valid ? undefined : "Ключ сохранён, но WB не подтвердил его — проверьте права токена.",
  };
}

/** Кнопка «Обновить данные» в кабинете. */
export async function refreshStoreAction(): Promise<StoreState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  const ctx = await getClientForUser(user.id);
  if (!ctx) return { error: "Сначала подключите магазин" };
  await syncAll(ctx.store.id, ctx.client).catch(() => null);
  revalidatePath("/dashboard");
  return { ok: true };
}
