import { ShieldCheck, KeyRound, CheckCircle2 } from "@/components/ui/icons";
import { PageShell } from "@/components/dashboard/PageShell";
import { Term } from "@/components/ui/Term";

const scopes = [
  "Аналитика и статистика",
  "Цены и скидки",
  "Отзывы и вопросы",
  "Реклама (продвижение)",
  "Контент карточек",
  "Поставки и остатки",
];

export default function ConnectPage() {
  return (
    <PageShell title="Подключить Wildberries">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="bento p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-ink">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">Вставьте ключ WB API</h3>
              <p className="text-xs text-muted">
                Это единственное, что нужно для запуска
              </p>
            </div>
          </div>

          {/* TODO(wb): POST /api/wb/connect — шифрование и сохранение ключа, проверка валидности */}
          <form action="/dashboard" className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Токен WB API</span>
              <textarea
                rows={3}
                placeholder="eyJhbGciOiJ..."
                className="w-full rounded-xl border border-line bg-ink-700 px-4 py-3 font-mono text-xs text-white outline-none focus:border-lime/60"
              />
            </label>
            <button className="btn-primary">Подключить магазин</button>
          </form>

          <div className="mt-6 rounded-2xl border border-line bg-ink-800 p-4">
            <div className="mb-2 text-sm font-semibold">Где взять ключ?</div>
            <ol className="list-inside list-decimal space-y-1 text-sm text-muted">
              <li>Зайдите в кабинет продавца Wildberries</li>
              <li>Откройте «Настройки → Доступ к API»</li>
              <li>Создайте токен и скопируйте его сюда</li>
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bento p-6">
            <div className="mb-3 flex items-center gap-2 text-lime">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-semibold text-white">Это безопасно</span>
            </div>
            <p className="text-sm text-muted">
              Ключ хранится в зашифрованном виде и даёт доступ только к вашему
              кабинету. Отозвать можно в любой момент в WB.
            </p>
          </div>

          <div className="bento p-6">
            <div className="mb-3 text-sm font-semibold">Что получит SELLIX</div>
            <ul className="space-y-2">
              {scopes.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-white/90">
                  <CheckCircle2 className="h-4 w-4 text-lime" /> {s}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">
              Мы используем только чтение и разрешённые действия. Никаких{" "}
              <Term k="карантин цены">рискованных операций</Term> без вашего согласия.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
