"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { encryptSecret } from "@/lib/crypto";
import { getCurrentUser } from "@/lib/auth/session";

export type StoreState = { error?: string; ok?: boolean };

const schema = z.object({
  apiKey: z.string().trim().min(20, "Похоже, ключ слишком короткий"),
  name: z.string().trim().optional(),
});

/** Подключение магазина WB: шифруем ключ и сохраняем. */
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

  try {
    const { cipher, iv, tag } = encryptSecret(parsed.data.apiKey);
    const existing = await db
      .select({ id: stores.id })
      .from(stores)
      .where(and(eq(stores.userId, user.id), eq(stores.marketplace, "WB")))
      .limit(1);

    if (existing[0]) {
      await db
        .update(stores)
        .set({ keyCipher: cipher, keyIv: iv, keyTag: tag, status: "CONNECTED" })
        .where(eq(stores.id, existing[0].id));
    } else {
      await db.insert(stores).values({
        userId: user.id,
        name: parsed.data.name || "Мой магазин",
        keyCipher: cipher,
        keyIv: iv,
        keyTag: tag,
        status: "CONNECTED",
      });
    }
    // TODO(wb, этап 3): проверить ключ запросом к WB API и запустить первую синхронизацию
  } catch {
    return { error: "Не удалось сохранить ключ. Попробуйте ещё раз." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
