import { PageShell } from "@/components/dashboard/PageShell";
import { ChatBox } from "@/components/dashboard/ChatBox";
import { BookOpen } from "@/components/ui/icons";

const topics = [
  "Комиссии и тарифы",
  "Логистика и хранение",
  "Поставки на склад",
  "Штрафы и блокировки",
  "Реклама и продвижение",
  "Возвраты и брак",
];

export default function HandbookPage() {
  return (
    <PageShell title="Справочник WB + AI-чат">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChatBox
            placeholder="Спросите по правилам Wildberries…"
            starters={[
              "Сколько стоит хранение?",
              "Как избежать штрафа за поставку?",
              "Что такое самовыкуп и можно ли?",
            ]}
          />
        </div>
        <div className="bento p-6">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-lime" />
            <h3 className="font-semibold">Темы справочника</h3>
          </div>
          <p className="mb-4 text-sm text-muted">
            Весь справочник Wildberries загружен в систему. ИИ ищет ответ по нему и
            даёт ссылку на источник — без выдумок.
          </p>
          <ul className="space-y-2">
            {topics.map((t) => (
              <li
                key={t}
                className="rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm text-white/90 hover:border-lime/40"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
