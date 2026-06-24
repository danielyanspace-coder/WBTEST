import { PageShell } from "@/components/dashboard/PageShell";
import { MiniBars } from "@/components/visuals/Abstract";
import { Term } from "@/components/ui/Term";

const funnel = [
  { step: "Показы", value: "182 400", pct: 100 },
  { step: "Клики", value: "21 050", pct: 58 },
  { step: "В корзину", value: "6 120", pct: 32 },
  { step: "Заказы", value: "1 940", pct: 18 },
  { step: "Выкуп", value: "1 377", pct: 12 },
];

export default function AnalyticsPage() {
  return (
    <PageShell title="Аналитика магазина">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="bento p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Выручка и прибыль</h3>
            <span className="chip">30 дней</span>
          </div>
          <MiniBars className="h-44 w-full" />
        </div>

        <div className="bento p-6">
          <h3 className="font-semibold">
            <Term k="воронка продаж">Воронка продаж</Term>
          </h3>
          <div className="mt-4 space-y-3">
            {funnel.map((f) => (
              <div key={f.step}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted">{f.step}</span>
                  <span className="font-semibold">{f.value}</span>
                </div>
                <div className="h-2 rounded-full bg-ink-500">
                  <div
                    className="h-2 rounded-full bg-lime"
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Чистая прибыль", "318 200 ₽"],
          ["Маржа", "26%"],
          ["Оборачиваемость", "18 дн."],
          ["Средний чек", "1 540 ₽"],
        ].map(([l, v]) => (
          <div key={l} className="bento p-5">
            <div className="font-display text-2xl font-bold">{v}</div>
            <div className="text-xs text-muted">{l}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
