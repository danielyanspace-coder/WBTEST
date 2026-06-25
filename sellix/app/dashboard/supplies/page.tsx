import { PageShell } from "@/components/dashboard/PageShell";
import { getCurrentUser } from "@/lib/auth/session";
import { getPriceRecs } from "@/lib/data/dashboard";
import { AcceptanceMonitor } from "@/components/dashboard/AcceptanceMonitor";
import { getWarehouseWatchesStatus } from "@/app/actions/warehouses";

const DEMO = [
  { name: "Платье летнее", qty: 6 },
  { name: "Кроссовки беговые", qty: 3 },
  { name: "Рюкзак городской", qty: 9 },
];

export default async function SuppliesPage() {
  const user = await getCurrentUser();
  const recs = user ? await getPriceRecs(user.id) : [];
  const low = recs.filter((r) => r.qty > 0 && r.qty < 10).map((r) => ({ name: r.name, qty: r.qty }));
  const rows = low.length ? low : DEMO;
  const watches = user ? await getWarehouseWatchesStatus(user.id) : [];

  return (
    <PageShell title="Поставки и остатки">
      <div className="bento-lime mb-4 p-6">
        <div className="font-display text-xl font-bold">Скоро закончатся</div>
        <div className="text-sm text-ink/80">Эти товары стоит довезти в первую очередь</div>
      </div>

      <div className="bento p-0">
        <div className="grid grid-cols-12 border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
          <div className="col-span-8">Товар</div>
          <div className="col-span-4">Остаток, шт</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-12 items-center border-b border-line px-5 py-4 text-sm last:border-0">
            <div className="col-span-8 font-medium">{r.name}</div>
            <div className="col-span-4">
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">
                {r.qty}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted">
        Список строится по вашим остаткам из WB. Подключите магазин, чтобы видеть
        реальные данные и прогноз, на сколько дней хватит запаса.
      </p>

      <AcceptanceMonitor watches={watches} />
    </PageShell>
  );
}
