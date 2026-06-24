import { PageShell } from "@/components/dashboard/PageShell";
import { Star, Bot } from "lucide-react";
import { Term } from "@/components/ui/Term";

const reviews = [
  { name: "Анна", rating: 5, text: "Платье шикарное, размер в размер!", status: "Отвечено ИИ" },
  { name: "Игорь", rating: 2, text: "Пришло помятым, долго ехало.", status: "Нужен ответ" },
  { name: "Мария", rating: 4, text: "Хорошо, но цвет чуть темнее.", status: "Отвечено ИИ" },
];

export default function ReviewsPage() {
  return (
    <PageShell title="Отзывы и вопросы">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {reviews.map((r, i) => (
            <div key={i} className="bento p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-500 text-xs font-bold">
                    {r.name[0]}
                  </span>
                  <span className="text-sm font-semibold">{r.name}</span>
                  <span className="flex text-lime">
                    {Array.from({ length: r.rating }).map((_, k) => (
                      <Star key={k} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </span>
                </div>
                <span
                  className={
                    r.status === "Нужен ответ"
                      ? "rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400"
                      : "rounded-full bg-lime/15 px-2 py-0.5 text-xs text-lime"
                  }
                >
                  {r.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-white/90">{r.text}</p>
              <div className="mt-3 flex items-center gap-2">
                <button className="btn-primary text-xs">
                  <Bot className="h-3.5 w-3.5" /> Ответить с ИИ
                </button>
                <button className="btn-ghost text-xs">Ответить самому</button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bento p-6">
            <h3 className="font-semibold">Голос бренда</h3>
            <p className="mt-1 text-sm text-muted">
              ИИ отвечает в вашем <Term k="Tone of Voice">стиле общения</Term>.
            </p>
            <div className="mt-3 space-y-2">
              {["Дружелюбный", "Деловой", "С юмором"].map((s, i) => (
                <button
                  key={s}
                  className={
                    i === 0
                      ? "w-full rounded-xl bg-lime px-3 py-2 text-sm font-semibold text-ink"
                      : "w-full rounded-xl border border-line px-3 py-2 text-sm text-muted hover:text-white"
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="bento p-6">
            <h3 className="font-semibold">Разбор жалоб</h3>
            <p className="mt-1 text-sm text-muted">Что чаще всего не нравится:</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between"><span>Помятая упаковка</span><span className="text-lime">34%</span></li>
              <li className="flex justify-between"><span>Долгая доставка</span><span className="text-lime">21%</span></li>
              <li className="flex justify-between"><span>Цвет отличается</span><span className="text-lime">12%</span></li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
