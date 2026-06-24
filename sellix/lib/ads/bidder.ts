/**
 * Совместимость: биддер переехал в lib/ads/engine.ts (адаптивный движок с
 * защитой бюджета). Здесь — реэкспорт и тонкая обёртка под старый вызов.
 */
export * from "./engine";
import { recommendBid, type BidSettings, DEFAULT_BID_SETTINGS } from "./engine";

/** Старый упрощённый интерфейс — делегирует новому движку. */
export function recommendCpm(
  c: { cpm: number | null; drr: number | null; orders: number },
  s: Partial<BidSettings>
) {
  const settings = { ...DEFAULT_BID_SETTINGS, ...s };
  // приблизительно восстанавливаем расход/выручку из ДРР для движка
  const revenue = c.orders * 1000;
  const spend = c.drr != null ? Math.round((revenue * c.drr) / 100) : 0;
  const rec = recommendBid(
    { cpm: c.cpm, spend, revenue, orders: c.orders, views: 0, clicks: c.orders * 5 },
    settings
  );
  return { cpm: rec.cpm, action: rec.action === "pause" ? "down" : rec.action, reason: rec.reason };
}
