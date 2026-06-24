import { PageShell } from "@/components/dashboard/PageShell";
import { ChatBox } from "@/components/dashboard/ChatBox";

export default function AssistantPage() {
  return (
    <PageShell title="AI-агент">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChatBox
            placeholder="Например: какая комиссия в моей категории?"
            starters={[
              "Что мне сделать сегодня?",
              "Почему упали продажи?",
              "Какие отзывы требуют внимания?",
            ]}
          />
        </div>
        <div className="space-y-4">
          <div className="bento p-6">
            <h3 className="font-semibold">Автопилот</h3>
            <p className="mt-1 text-sm text-muted">
              Что агент делает за вас автоматически.
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                ["Отвечает на отзывы", true],
                ["Держит умные цены", true],
                ["Следит за остатками", true],
                ["Управляет рекламой", false],
              ].map(([t, on]) => (
                <li key={t as string} className="flex items-center justify-between">
                  <span>{t as string}</span>
                  <span
                    className={
                      on
                        ? "rounded-full bg-lime px-2 py-0.5 text-xs font-semibold text-ink"
                        : "rounded-full border border-line px-2 py-0.5 text-xs text-muted"
                    }
                  >
                    {on ? "вкл" : "выкл"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
