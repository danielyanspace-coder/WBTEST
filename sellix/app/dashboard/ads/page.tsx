import { PageShell } from "@/components/dashboard/PageShell";
import { getCurrentUser } from "@/lib/auth/session";
import { getAds } from "@/lib/data/dashboard";
import { AdsManager } from "@/components/dashboard/AdsManager";
import { budgetAdvice } from "@/lib/ads/engine";

const DEMO_CAMPAIGNS = [
  { id: "d1", advertId: 1, name: "Поиск · Платья", type: 8, cpm: 250, views: 18400, orders: 42, drr: 14, rec: { cpm: 225, action: "down" as const, reason: "ДРР 14% выше цели 10% — снижаем" } },
  { id: "d2", advertId: 2, name: "Карточка · Обувь", type: 9, cpm: 180, views: 9200, orders: 30, drr: 7, rec: { cpm: 198, action: "up" as const, reason: "ДРР 7% ниже цели — можно поднять" } },
  { id: "d3", advertId: 3, name: "Авто · Аксессуары", type: 8, cpm: 150, views: 5100, orders: 12, drr: 10, rec: { cpm: 150, action: "keep" as const, reason: "ДРР 10% в норме" } },
];

export default async function AdsPage() {
  const user = await getCurrentUser();
  const data = user
    ? await getAds(user.id)
    : { connected: false, settings: { targetDrr: 10, minCpm: 100, maxCpm: 500, auto: false }, campaigns: [] };

  const demo = data.campaigns.length === 0;
  const advice = demo ? null : budgetAdvice(data.campaigns as any);

  return (
    <PageShell title="Реклама — биддер">
      {advice && (
        <div className="bento mb-4 flex items-start gap-3 p-4 text-sm">
          <span className="mt-0.5 rounded-full bg-lime/15 px-2 py-0.5 text-xs font-semibold text-lime">совет</span>
          <span className="text-white/90">{advice}</span>
        </div>
      )}
      <AdsManager
        connected={data.connected}
        settings={data.settings}
        campaigns={demo ? (DEMO_CAMPAIGNS as any) : (data.campaigns as any)}
        demo={demo}
      />
    </PageShell>
  );
}
