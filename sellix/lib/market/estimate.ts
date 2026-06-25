/**
 * Оценка продаж методом разницы остатков (как у MPSTATS, но на своей истории).
 * Если остаток за день уменьшился — это проданные штуки; если вырос (поставка) —
 * за этот день продажи неизвестны, считаем 0 (не искажаем вверх).
 */
export type Snap = { date: string; stock: number | null; price: number | null };

export type SalesEstimate = {
  days: number;
  estSold: number; // всего за период
  perDay: number; // среднее в день
  series: { date: string; sold: number }[];
};

export function estimateSales(snapshots: Snap[]): SalesEstimate | null {
  const pts = [...snapshots]
    .filter((s) => s.stock != null)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (pts.length < 2) return null;

  const series: { date: string; sold: number }[] = [];
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1].stock ?? 0;
    const cur = pts[i].stock ?? 0;
    const sold = prev > cur ? prev - cur : 0; // рост остатка = поставка → 0
    series.push({ date: pts[i].date, sold });
  }
  const estSold = series.reduce((a, s) => a + s.sold, 0);
  return {
    days: series.length,
    estSold,
    perDay: Math.round((estSold / series.length) * 10) / 10,
    series,
  };
}
