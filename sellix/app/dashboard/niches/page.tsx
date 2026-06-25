import { PageShell } from "@/components/dashboard/PageShell";
import { NicheExplorer } from "@/components/dashboard/NicheExplorer";
import { Watchlist } from "@/components/dashboard/Watchlist";
import { getCurrentUser } from "@/lib/auth/session";
import { getWatchlist } from "@/app/actions/watch";

export default async function NichesPage() {
  const user = await getCurrentUser();
  const watch = user ? await getWatchlist(user.id) : [];

  return (
    <PageShell title="Аналитика ниш">
      <div className="bento-lime mb-4 p-6">
        <div className="font-display text-xl font-bold">Изучите нишу за секунды</div>
        <div className="text-sm text-ink/80">
          Цены, конкуренция, бренды и топ товаров. Добавьте товары в отслеживание —
          и мы сами накопим историю продаж бесплатно.
        </div>
      </div>
      <NicheExplorer />
      <Watchlist items={watch} />
    </PageShell>
  );
}
