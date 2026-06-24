import { KeyRound, Zap, Rocket } from "@/components/ui/icons";

const steps = [
  {
    icon: KeyRound,
    title: "Вставьте ключ WB API",
    text: "В личном кабинете Wildberries создаётся специальный ключ. Вы копируете его в одно поле у нас — это безопасно и занимает минуту.",
  },
  {
    icon: Zap,
    title: "Данные подгрузятся сами",
    text: "SELLIX сам заберёт ваши товары, заказы, остатки и отзывы. Ничего настраивать руками не нужно.",
  },
  {
    icon: Rocket,
    title: "Всё открывается",
    text: "Дашборд, умные цены, автоответы и AI-агент включаются автоматически. Заходить на WB больше незачем.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="section py-16">
      <div className="mb-8 max-w-2xl">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Как это работает
        </h2>
        <p className="mt-3 text-muted">Три шага — и магазин на автопилоте.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bento p-7">
              <div className="mb-5 flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime text-ink">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-5xl font-bold text-ink-500">
                  0{i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
