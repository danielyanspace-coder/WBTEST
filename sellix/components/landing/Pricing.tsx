import Link from "next/link";
import { Check } from "@/components/ui/icons";
import { PLANS, TRIAL_DAYS } from "@/lib/plans";

export function Pricing() {
  return (
    <section id="pricing" className="section py-16">
      <div className="mb-8 max-w-2xl">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Простые тарифы
        </h2>
        <p className="mt-3 text-muted">
          {TRIAL_DAYS} дней бесплатно на любом тарифе. Карта не нужна, чтобы попробовать.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={
              p.highlight
                ? "bento border-lime/50 p-7 shadow-glow"
                : "bento p-7"
            }
          >
            {p.highlight && (
              <span className="mb-3 inline-block rounded-full bg-lime px-3 py-1 text-xs font-semibold text-ink">
                Хит
              </span>
            )}
            <h3 className="font-display text-xl font-bold">{p.name}</h3>
            <p className="mt-1 text-sm text-muted">{p.tagline}</p>
            <div className="mt-5 flex items-end gap-1">
              <span className="font-display text-4xl font-bold">
                {p.priceMonth.toLocaleString("ru-RU")}
              </span>
              <span className="mb-1 text-muted">₽/мес</span>
            </div>
            <p className="mt-1 text-xs text-muted">{p.limits}</p>

            <Link
              href="/register"
              className={p.highlight ? "btn-primary mt-6 w-full" : "btn-ghost mt-6 w-full"}
            >
              Попробовать бесплатно
            </Link>

            <ul className="mt-6 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                  <span className="text-white/90">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
