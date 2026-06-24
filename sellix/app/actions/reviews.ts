"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { feedbacks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getClientForUser } from "@/lib/wb/store";
import { generateReviewReply } from "@/lib/ai/reply";

/** Сгенерировать (но не отправлять) черновик ответа на отзыв. */
export async function suggestReplyAction(feedbackId: string, tone?: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  const rows = await db.select().from(feedbacks).where(eq(feedbacks.id, feedbackId)).limit(1);
  const fb = rows[0];
  if (!fb) return { error: "Отзыв не найден" };
  try {
    const text = await generateReviewReply({
      productName: fb.productName,
      rating: fb.rating,
      text: fb.text,
      tone,
    });
    return { text };
  } catch {
    return { error: "Не удалось сгенерировать ответ" };
  }
}

/** Отправить ответ в WB и пометить отзыв отвеченным. */
export async function sendReplyAction(feedbackId: string, text: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите снова" };
  const ctx = await getClientForUser(user.id);

  const rows = await db
    .select()
    .from(feedbacks)
    .where(and(eq(feedbacks.id, feedbackId), eq(feedbacks.storeId, ctx?.store.id ?? "")))
    .limit(1);
  const fb = rows[0];
  if (!fb || !ctx) return { error: "Сначала подключите магазин" };

  try {
    await ctx.client.answerFeedback(fb.wbId, text);
    await db
      .update(feedbacks)
      .set({ answered: true, answerText: text })
      .where(eq(feedbacks.id, feedbackId));
  } catch {
    return { error: "WB отклонил ответ. Проверьте текст (без ссылок и контактов)." };
  }

  revalidatePath("/dashboard/reviews");
  return { ok: true };
}
