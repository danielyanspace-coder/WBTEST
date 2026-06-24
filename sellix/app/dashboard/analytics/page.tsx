import { PageShell } from "@/components/dashboard/PageShell";
import { MiniBars } from "@/components/visuals/Abstract";
import { Term } from "@/components/ui/Term";
import { getCurrentUser } from "@/lib/auth/session";
import { getAnalytics } from "@/lib/data/dashboard";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  const data = user ? await getAnalytics(user.id) : { connected: false, cards: [] };

  return (
    <PageShell title="Аналитика магазина">
      {!data.connected && (
        <div className="bento mb-4 p-5 text-sm text-muted">
          Подключите магазин на странице «Подключить WB», чтобы увидеть реальные
          цифры. Ниже — структура отчёта.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="bento p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Выручка и продажи</h3>
            <span className="chip">30 дней</span>
          </div>
          <MiniBars className="h-44 w-full" />
        </div>

        <div className="bento p-6">
          <h3 className="font-semibold">
            <Term k="воронка продаж">Воронка продаж</Term>
          </h3>
          <div className="mt-4 space-y-3">
            {[
              ["Показы", 100],
              ["Клики", 58],
              ["В корзину", 32],
              ["Заказы", 18],
              ["Выкуп", 12],
            ].map(([step, pct]: any) => (
              <div key={step}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted">{step}</span>
                </div>
                <div className="h-2 rounded-full bg-ink-500">
                  <div className="h-2 rounded-full bg-lime" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(data.cards.length
          ? data.cards
          : ([
              ["Выручка (30 дней)", "—"],
              ["Заказы", "—"],
              ["Выкупы", "—"],
              ["Средний чек", "—"],
            ] as [string, string][])
        ).map(([l, v]) => (
          <div key={l} className="bento p-5">
            <div className="font-display text-2xl font-bold">{v}</div>
            <div className="text-xs text-muted">{l}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
