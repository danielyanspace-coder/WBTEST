import { PageShell } from "@/components/dashboard/PageShell";
import { PLANS, TRIAL_DAYS } from "@/lib/plans";
import { Check } from "@/components/ui/icons";

export default function BillingPage() {
  return (
    <PageShell title="Подписка">
      <div className="bento mb-4 flex flex-col items-start justify-between gap-3 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="text-sm text-muted">Текущий статус</div>
          <div className="font-display text-xl font-bold">
            Пробный период · осталось {TRIAL_DAYS} дней
          </div>
        </div>
        <span className="rounded-full bg-lime/15 px-3 py-1 text-sm font-semibold text-lime">
          активен
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={p.highlight ? "bento border-lime/50 p-6 shadow-glow" : "bento p-6"}
          >
            <h3 className="font-display text-lg font-bold">{p.name}</h3>
            <div className="mt-2 flex items-end gap-1">
              <span className="font-display text-3xl font-bold">
                {p.priceMonth.toLocaleString("ru-RU")}
              </span>
              <span className="mb-1 text-muted">₽/мес</span>
            </div>
            {/* TODO(billing): создать платёж в ЮKassa и включить тариф по вебхуку */}
            <button className={p.highlight ? "btn-primary mt-4 w-full" : "btn-ghost mt-4 w-full"}>
              Выбрать {p.name}
            </button>
            <ul className="mt-4 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted">
        Оплата сейчас в тестовом режиме (mock). Перед запуском подключим ЮKassa:
        автопродление и приём карт РФ.
      </p>
    </PageShell>
  );
}
