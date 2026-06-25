import { PageShell } from "@/components/dashboard/PageShell";
import { FinancePanel } from "@/components/dashboard/FinancePanel";
import { Term } from "@/components/ui/Term";
import { getCurrentUser } from "@/lib/auth/session";
import { getFinance } from "@/lib/data/finance";

const RUB = (n: number) => (n < 0 ? "−" : "") + Math.abs(n).toLocaleString("ru-RU") + " ₽";

const CLS = {
  high: { label: "Высокая", color: "text-lime", dot: "bg-lime" },
  mid: { label: "Средняя", color: "text-amber-400", dot: "bg-amber-400" },
  low: { label: "Убыточные", color: "text-red-400", dot: "bg-red-400" },
} as const;

export default async function FinancePage() {
  const user = await getCurrentUser();
  const fin = user
    ? await getFinance(user.id)
    : { connected: false, params: { commissionPct: 17, logisticsPerUnit: 60, cogsPct: 40, taxPct: 7, fixedMonthly: 0 }, pnl: null as any, products: [], counts: { high: 0, mid: 0, low: 0 } };

  const pnl = fin.pnl;
  const total = fin.counts.high + fin.counts.mid + fin.counts.low || 1;

  return (
    <PageShell title="Финансы">
      <div className="bento-lime mb-4 p-6">
        <div className="font-display text-xl font-bold">Чистая прибыль до копейки</div>
        <div className="text-sm text-ink/80">
          ОПиУ с учётом комиссии, логистики, налогов и постоянных расходов.
        </div>
      </div>

      {!fin.connected && (
        <div className="bento mb-4 p-4 text-sm text-muted">
          Подключите магазин — выручка и продажи подтянутся автоматически. Ниже — пример расчёта по вашим параметрам.
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Выручка", RUB(pnl.revenue), "text-white"],
          ["Чистая прибыль", RUB(pnl.netProfit), pnl.netProfit >= 0 ? "text-lime" : "text-red-400"],
          ["Маржа", `${pnl.marginPct}%`, pnl.marginPct >= 0 ? "text-lime" : "text-red-400"],
          ["Все расходы", RUB(pnl.revenue - pnl.netProfit), "text-white"],
        ].map(([l, v, c]) => (
          <div key={l as string} className="bento p-5">
            <div className={"font-display text-2xl font-bold " + (c as string)}>{v}</div>
            <div className="text-xs text-muted">{l}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ОПиУ */}
        <div className="bento p-6 lg:col-span-2">
          <h3 className="mb-4 font-semibold">
            <Term k="юнит-экономика">Отчёт о прибылях и убытках</Term>
          </h3>
          <div className="space-y-1.5">
            {pnl.lines.map((ln: any) => (
              <div
                key={ln.label}
                className={
                  "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm " +
                  (ln.kind === "result" ? "bg-ink-700 font-semibold" : "")
                }
              >
                <span className={ln.kind === "result" ? "text-white" : "text-muted"}>{ln.label}</span>
                <span className={ln.value < 0 ? "text-red-400" : ln.kind === "result" ? "text-lime" : "text-white"}>
                  {RUB(ln.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Распределение маржи */}
        <div className="bento p-6">
          <h3 className="font-semibold">Товары по марже</h3>
          <p className="mt-1 text-xs text-muted">Где деньги, а где балласт.</p>
          <div className="mt-4 space-y-3">
            {(["high", "mid", "low"] as const).map((k) => (
              <div key={k}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={"h-2 w-2 rounded-full " + CLS[k].dot} />
                    {CLS[k].label}
                  </span>
                  <span className={CLS[k].color}>{fin.counts[k]}</span>
                </div>
                <div className="h-2 rounded-full bg-ink-500">
                  <div className={"h-2 rounded-full " + CLS[k].dot} style={{ width: `${(fin.counts[k] / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <FinancePanel initial={fin.params} />
      </div>

      {/* Товары — худшие по марже сверху */}
      {fin.products.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 font-semibold">Товары: маржа по каждому</h3>
          <div className="bento p-0 overflow-x-auto">
            <div className="grid grid-cols-12 border-b border-line px-5 py-3 text-xs uppercase text-muted min-w-[560px]">
              <div className="col-span-6">Товар</div>
              <div className="col-span-3">Цена</div>
              <div className="col-span-3">Маржа</div>
            </div>
            {fin.products.map((p, i) => (
              <div key={i} className="grid grid-cols-12 items-center border-b border-line px-5 py-3 text-sm last:border-0 min-w-[560px]">
                <div className="col-span-6 truncate font-medium">{p.name}</div>
                <div className="col-span-3">{RUB(p.price)}</div>
                <div className="col-span-3">
                  <span className={"rounded-full px-2 py-0.5 text-xs font-semibold " + (p.cls === "high" ? "bg-lime/15 text-lime" : p.cls === "mid" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400")}>
                    {p.marginPct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
