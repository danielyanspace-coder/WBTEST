import { PageShell } from "@/components/dashboard/PageShell";
import { NicheExplorer } from "@/components/dashboard/NicheExplorer";

export default function NichesPage() {
  return (
    <PageShell title="Аналитика ниш">
      <div className="bento-lime mb-4 p-6">
        <div className="font-display text-xl font-bold">Изучите нишу за секунды</div>
        <div className="text-sm text-ink/80">
          Цены, конкуренция, сильные бренды и популярные товары — по любому запросу.
        </div>
      </div>
      <NicheExplorer />
    </PageShell>
  );
}
