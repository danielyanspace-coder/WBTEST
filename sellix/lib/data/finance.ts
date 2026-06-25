import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { financeSettings, products, salesDaily } from "@/lib/db/schema";
import { getStoreForUser } from "@/lib/wb/store";
import { computePnl, productMargin, classifyMargin, DEFAULT_FINANCE, type FinanceParams } from "@/lib/finance/pnl";

export async function getFinance(userId: string) {
  const setRow = (await db.select().from(financeSettings).where(eq(financeSettings.userId, userId)).limit(1))[0];
  const params: FinanceParams = setRow
    ? {
        commissionPct: setRow.commissionPct,
        logisticsPerUnit: setRow.logisticsPerUnit,
        cogsPct: setRow.cogsPct,
        taxPct: setRow.taxPct,
        fixedMonthly: setRow.fixedMonthly,
      }
    : DEFAULT_FINANCE;

  const store = await getStoreForUser(userId);
  if (!store) {
    return { connected: false, params, pnl: computePnl(0, 0, params), products: [], counts: { high: 0, mid: 0, low: 0 } };
  }

  const agg = (
    await db
      .select({
        revenue: sql<number>`coalesce(sum(${salesDaily.revenue}),0)`,
        units: sql<number>`coalesce(sum(${salesDaily.buyouts}),0)`,
      })
      .from(salesDaily)
      .where(eq(salesDaily.storeId, store.id))
  )[0] ?? { revenue: 0, units: 0 };

  const pnl = computePnl(agg.revenue, agg.units, params);

  const prods = await db.select().from(products).where(eq(products.storeId, store.id)).limit(200);
  const counts = { high: 0, mid: 0, low: 0 };
  const productList = prods
    .map((p) => {
      const price = p.priceCurrent ?? 0;
      const m = productMargin(price, params);
      const cls = classifyMargin(m);
      counts[cls]++;
      return { name: p.title ?? `Артикул ${p.nmId}`, price, marginPct: m, cls };
    })
    .sort((a, b) => a.marginPct - b.marginPct)
    .slice(0, 25);

  return { connected: true, params, pnl, products: productList, counts };
}
