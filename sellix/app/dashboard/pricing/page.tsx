import { PageShell } from "@/components/dashboard/PageShell";
import { Term } from "@/components/ui/Term";
import { getCurrentUser } from "@/lib/auth/session";
import { getPriceRecs } from "@/lib/data/dashboard";
import { PricingTable, type Rec } from "@/components/dashboard/PricingTable";

const DEMO: Rec[] = [
  { name: "Платье летнее", price: "1 540 ₽", action: "Поднять до 1 690 ₽", reason: "Запас ~7 дн. при стабильном спросе — поднимаем цену", confidence: 0.8, actionType: "up" },
  { name: "Футболка базовая", price: "690 ₽", action: "Оставить", reason: "Спрос и остатки в норме — цена оптимальна", confidence: 0.6, actionType: "keep" },
  { name: "Куртка демисезон", price: "4 200 ₽", action: "Снизить до 3 990 ₽", reason: "Товар залёживается — ускоряем продажи", confidence: 0.7, actionType: "down" },
];

export default async function PricingToolPage() {
  const user = await getCurrentUser();
  const recs = user ? await getPriceRecs(user.id) : [];
  const demo = recs.length === 0;
  const rows: Rec[] = demo ? DEMO : (recs as Rec[]);

  return (
    <PageShell title="Умные цены">
      <div className="bento-lime mb-4 flex items-center justify-between p-6">
        <div>
          <div className="font-display text-xl font-bold">
            <Term k="репрайсер">Репрайсер</Term> 2.0 — адаптивный
          </div>
          <div className="text-sm text-ink/80">
            Взвешивает спрос, остатки, тренд и реакцию на прошлые цены. Бережёт маржу.
          </div>
        </div>
        <span className="rounded-full bg-ink px-3 py-1 text-sm font-semibold text-white">
          {demo ? "пример" : "по вашим данным"}
        </span>
      </div>

      <PricingTable rows={rows} demo={demo} />

      <p className="mt-4 text-xs text-muted">
        Движок защищён предохранителями: не опускает цену ниже минимальной прибыльной,
        ограничивает шаг за раз и учитывает <Term k="карантин цены">карантин цены</Term> WB.
        Уверенность показывает, насколько движку хватает данных для решения.
      </p>
    </PageShell>
  );
}
