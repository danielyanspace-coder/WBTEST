import { eq } from "drizzle-orm";
import { PageShell } from "@/components/dashboard/PageShell";
import { Field } from "@/components/auth/AuthShell";
import { NotifySettings } from "@/components/dashboard/NotifySettings";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { notificationSettings } from "@/lib/db/schema";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const connected = Boolean(user?.telegramChatId);
  const setRow = user
    ? (await db.select().from(notificationSettings).where(eq(notificationSettings.userId, user.id)).limit(1))[0]
    : null;
  const flags = {
    outOfStock: setRow?.outOfStock ?? true,
    reviews: setRow?.reviews ?? true,
    budget: setRow?.budget ?? true,
    priceChanges: setRow?.priceChanges ?? true,
    weeklyDigest: setRow?.weeklyDigest ?? true,
  };

  return (
    <PageShell title="Настройки">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bento p-6">
          <h3 className="font-semibold">Профиль</h3>
          <div className="mt-4">
            <Field label="Имя" placeholder="Ваше имя" />
            <Field label="Email" type="email" placeholder="you@example.com" />
            <button className="btn-primary">Сохранить</button>
          </div>
        </div>

        <div className="bento p-6">
          <h3 className="font-semibold">Подключение Wildberries</h3>
          <p className="mt-1 text-sm text-muted">
            Ключ WB API хранится в зашифрованном виде.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-ink-700 px-4 py-3">
            <span className="text-sm">Магазин подключён</span>
            <span className="rounded-full bg-lime/15 px-2 py-0.5 text-xs font-semibold text-lime">
              активно
            </span>
          </div>
          <button className="btn-ghost mt-3">Обновить ключ</button>
        </div>

        <div className="bento p-6 lg:col-span-2">
          <h3 className="font-semibold">Голос бренда для ответов ИИ</h3>
          <p className="mt-1 text-sm text-muted">
            Опишите, как общаться с покупателями — ИИ будет отвечать в этом стиле.
          </p>
          <textarea
            rows={3}
            placeholder="Например: дружелюбно, на «вы», с лёгким юмором, всегда благодарим за отзыв…"
            className="mt-3 w-full rounded-xl border border-line bg-ink-700 px-4 py-3 text-sm outline-none focus:border-lime/60"
          />
          <button className="btn-primary mt-3">Сохранить стиль</button>
        </div>

        <NotifySettings connected={connected} flags={flags} />
      </div>
    </PageShell>
  );
}
