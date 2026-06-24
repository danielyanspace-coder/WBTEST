import { PageShell } from "@/components/dashboard/PageShell";
import { Term } from "@/components/ui/Term";
import { getCurrentUser } from "@/lib/auth/session";
import { getPriceRecs } from "@/lib/data/dashboard";

const DEMO = [
  { name: "Платье летнее", price: "1 540 ₽", action: "Поднять до 1 690 ₽", reason: "Высокий спрос, мало остатка" },
  { name: "Футболка базовая", price: "690 ₽", action: "Оставить", reason: "Цена оптимальна" },
  { name: "Куртка демисезон", price: "4 200 ₽", action: "Снизить до 3 990 ₽", reason: "Залёживается на складе" },
];

export default async function PricingToolPage() {
  const user = await getCurrentUser();
  const recs = user ? await getPriceRecs(user.id) : [];
  const rows = recs.length ? recs : DEMO;

  return (
    <PageShell title="Умные цены">
      <div className="bento-lime mb-4 flex items-center justify-between p-6">
        <div>
          <div className="font-display text-xl font-bold">
            <Term k="репрайсер">Репрайсер</Term> готов к работе
          </div>
          <div className="text-sm text-ink/80">
            Держит прибыль и не даёт товару залёживаться
          </div>
        </div>
        <span className="rounded-full bg-ink px-3 py-1 text-sm font-semibold text-white">
          {recs.length ? "по вашим данным" : "пример"}
        </span>
      </div>

      <div className="bento p-0">
        <div className="grid grid-cols-12 border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
          <div className="col-span-4">Товар</div>
          <div className="col-span-2">Цена</div>
          <div className="col-span-3">Рекомендация</div>
          <div className="col-span-3">Почему</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-12 items-center border-b border-line px-5 py-4 text-sm last:border-0">
            <div className="col-span-4 font-medium">{r.name}</div>
            <div className="col-span-2">{r.price}</div>
            <div className="col-span-3">
              <span className="rounded-full bg-lime/15 px-2 py-0.5 text-xs font-semibold text-lime">
                {r.action}
              </span>
            </div>
            <div className="col-span-3 text-muted">{r.reason}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted">
        Учитываем спрос, остатки, <Term k="оборачиваемость">оборачиваемость</Term> и
        минимальную маржу. Изменения применяются к WB по расписанию — с подтверждением
        или автоматически (с учётом <Term k="карантин цены">карантина цены</Term>).
      </p>
    </PageShell>
  );
}
