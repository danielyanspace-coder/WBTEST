import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { stores, adSettings, adCampaigns } from "@/lib/db/schema";
import { getStoreToken } from "@/lib/wb/store";
import { WBClient } from "@/lib/wb/client";
import { syncAll } from "@/lib/wb/sync";
import { recommendBid, DEFAULT_BID_SETTINGS } from "@/lib/ads/engine";
import { runAlertsForAll } from "@/lib/notify/engine";
import { snapshotWatchlist, snapshotKeywords } from "@/lib/market/collect";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Регулярный «тик» платформы. Ставится в cron (например, раз в 30 минут):
 *   curl "https://APP_URL/api/cron/tick?secret=CRON_SECRET"
 * Делает: синхронизацию магазинов из WB → автобиддер (где включён) →
 * прогон уведомлений (остатки/бюджет/отзывы/триал).
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") || req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const result = { stores: 0, synced: 0, bidsApplied: 0, alerts: 0, watchSnapshots: 0, keywordSnapshots: 0 };
  const connected = await db.select().from(stores).where(eq(stores.status, "CONNECTED"));
  result.stores = connected.length;

  for (const store of connected) {
    const token = getStoreToken(store);
    if (!token) continue;
    const client = new WBClient(token);
    try {
      await syncAll(store.id, client);
      result.synced++;
    } catch {}

    // Автобиддер (если включён) — с защитой бюджета из движка
    const setRows = await db.select().from(adSettings).where(eq(adSettings.storeId, store.id)).limit(1);
    const s = setRows[0];
    if (s?.auto) {
      const camps = await db.select().from(adCampaigns).where(eq(adCampaigns.storeId, store.id));
      const settings = { ...DEFAULT_BID_SETTINGS, ...s };
      for (const c of camps) {
        const rec = recommendBid(
          { cpm: c.cpm, spend: c.spend, revenue: c.revenue, orders: c.orders, views: c.views, clicks: c.clicks },
          settings as any
        );
        if ((rec.action === "up" || rec.action === "down" || rec.action === "pause") && c.type != null) {
          try {
            await client.setAdvertCpm(c.advertId, c.type, rec.cpm);
            await db.update(adCampaigns).set({ cpm: rec.cpm }).where(eq(adCampaigns.id, c.id));
            result.bidsApplied++;
          } catch {}
        }
      }
    }
  }

  try {
    result.watchSnapshots = await snapshotWatchlist();
  } catch {}

  try {
    result.keywordSnapshots = await snapshotKeywords();
  } catch {}

  try {
    result.alerts = await runAlertsForAll();
  } catch {}

  return NextResponse.json({ ok: true, ...result });
}
