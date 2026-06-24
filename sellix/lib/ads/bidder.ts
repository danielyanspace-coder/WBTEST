/**
 * Логика автобиддера: рекомендация ставки (CPM) по целевому ДРР.
 * ДРР (доля рекламных расходов) = расход / выручка * 100.
 * Высокий ДРР → снижаем ставку; низкий при наличии заказов → можно поднять.
 */
export type BidInput = { cpm: number | null; drr: number | null; orders: number };
export type BidSettings = { targetDrr: number; minCpm: number; maxCpm: number };
export type BidRec = { cpm: number; action: "up" | "down" | "keep"; reason: string };

export function recommendCpm(c: BidInput, s: BidSettings): BidRec {
  const cpm = c.cpm ?? s.minCpm;

  if (c.drr == null) {
    return { cpm, action: "keep", reason: "Мало данных — оставляем ставку" };
  }
  if (c.drr > s.targetDrr * 1.2) {
    const next = Math.max(s.minCpm, Math.round(cpm * 0.9));
    return {
      cpm: next,
      action: next < cpm ? "down" : "keep",
      reason: `ДРР ${c.drr.toFixed(0)}% выше цели ${s.targetDrr}% — снижаем ставку`,
    };
  }
  if (c.drr < s.targetDrr * 0.8 && c.orders > 0) {
    const next = Math.min(s.maxCpm, Math.round(cpm * 1.1));
    return {
      cpm: next,
      action: next > cpm ? "up" : "keep",
      reason: `ДРР ${c.drr.toFixed(0)}% ниже цели — можно поднять ставку и забрать больше заказов`,
    };
  }
  return { cpm, action: "keep", reason: `ДРР ${c.drr.toFixed(0)}% в норме` };
}
