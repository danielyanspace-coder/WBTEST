import { FEATURES } from "@/lib/features";

export function Features() {
  return (
    <section id="features" className="section py-16">
      <div className="mb-8 max-w-2xl">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Всё, что есть у дорогих сервисов — <span className="text-lime">в одном месте</span>
        </h2>
        <p className="mt-3 text-muted">
          И понятным языком. Наводите на любое сложное слово на сайте — покажем простое объяснение.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.slug} className="bento group p-5 transition hover:border-lime/40">
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-500 text-lime">
                  <Icon className="h-5 w-5" />
                </span>
                {f.status === "soon" && (
                  <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-muted">
                    скоро
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{f.short}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
