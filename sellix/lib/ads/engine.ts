/**
 * Биддер 2.0 — адаптивное управление ставкой с защитой бюджета.
 *
 * Логика — пропорциональное управление по целевому ДРР (как термостат), а не
 * фиксированные ±10%. Шаг масштабируется уверенностью (объёмом данных).
 * Сверху — несколько «предохранителей бюджета», чтобы реклама не сожгла деньги:
 *   • дневной лимит расхода → пауза;
 *   • тратит без заказов → пауза (kill-switch);
 *   • ДРР пробил потолок → резкий срез/пауза.
 */
export type Campaign = {
  cpm: number | null;
  spend: number; // ₽ за период
  revenue: number; // ₽ за период
  orders: number;
  views: number;
  clicks: number;
};

export type BidSettings = {
  targetDrr: number; // целевой ДРР, %
  minCpm: number;
  maxCpm: number;
  dailyBudget: number; // ₽/день, 0 = без лимита
  hardDrrCeiling: number; // потолок ДРР, %
  killSwitch: boolean;
};

export const DEFAULT_BID_SETTINGS: BidSettings = {
  targetDrr: 10,
  minCpm: 100,
  maxCpm: 500,
  dailyBudget: 0,
  hardDrrCeiling: 25,
  killSwitch: true,
};

export type BidRec = {
  cpm: number;
  action: "up" | "down" | "keep" | "pause";
  reason: string;
  confidence: number;
  drr: number | null;
  /** true → требуется немедленное вмешательство (для уведомлений). */
  alert?: boolean;
};

export function recommendBid(c: Campaign, s: BidSettings = DEFAULT_BID_SETTINGS): BidRec {
  const cpm = c.cpm ?? s.minCpm;
  const drr = c.revenue > 0 ? (c.spend / c.revenue) * 100 : null;
  const conf = Math.min(1, c.clicks / 50);
  const base = { cpm, drr, confidence: Math.round(conf * 100) / 100 };

  // ── ЗАЩИТА БЮДЖЕТА (kill-switch) ──
  if (s.killSwitch) {
    if (s.dailyBudget > 0 && c.spend >= s.dailyBudget) {
      return { ...base, cpm: s.minCpm, action: "pause", alert: true, reason: `Дневной бюджет ${s.dailyBudget} ₽ исчерпан — ставлю на паузу до завтра` };
    }
    if (c.spend >= Math.max(300, s.dailyBudget * 0.5) && c.orders === 0 && c.clicks >= 20) {
      return { ...base, cpm: s.minCpm, action: "pause", alert: true, reason: `Потрачено ${c.spend} ₽ и 0 заказов при ${c.clicks} кликах — останавливаю слив бюджета` };
    }
    if (drr != null && drr > s.hardDrrCeiling) {
      const next = Math.max(s.minCpm, Math.round(cpm * 0.7));
      return { ...base, cpm: next, action: next < cpm ? "down" : "pause", alert: true, reason: `ДРР ${drr.toFixed(0)}% пробил потолок ${s.hardDrrCeiling}% — резко снижаю ставку` };
    }
  }

  // ── НЕТ ВЫРУЧКИ ПОКА ──
  if (drr == null) {
    if (c.clicks < 15) return { ...base, action: "keep", reason: "Мало данных — собираем статистику, ставку не трогаем" };
    if (c.spend > 0) {
      const next = Math.max(s.minCpm, Math.round(cpm * 0.9));
      return { ...base, cpm: next, action: next < cpm ? "down" : "keep", reason: "Есть клики, но нет продаж — снижаем ставку" };
    }
    return { ...base, action: "keep", reason: "Недостаточно данных для решения" };
  }

  // ── ПРОПОРЦИОНАЛЬНОЕ УПРАВЛЕНИЕ ──
  // error>0 → ДРР ниже цели (реклама окупается) → можно поднять ставку
  const error = (s.targetDrr - drr) / s.targetDrr;
  const k = 0.35;
  let step = Math.max(-0.15, Math.min(0.15, error * k)) * (0.4 + conf * 0.6);
  let next = Math.round(cpm * (1 + step));
  next = Math.max(s.minCpm, Math.min(s.maxCpm, next));

  if (next === cpm) return { ...base, action: "keep", reason: `ДРР ${drr.toFixed(0)}% близко к цели ${s.targetDrr}% — ставка оптимальна` };
  if (next > cpm) return { ...base, cpm: next, action: "up", reason: `ДРР ${drr.toFixed(0)}% ниже цели — реклама окупается, поднимаем ставку за заказами` };
  return { ...base, cpm: next, action: "down", reason: `ДРР ${drr.toFixed(0)}% выше цели ${s.targetDrr}% — снижаем ставку, бережём маржу` };
}

/**
 * Совет по перебросу бюджета между кампаниями: деньги выгоднее переливать из
 * самой убыточной (высокий ДРР) в самую окупаемую (низкий ДРР).
 */
export function budgetAdvice(camps: (Campaign & { name?: string | null })[]): string | null {
  const withDrr = camps
    .map((c) => ({ name: c.name, drr: c.revenue > 0 ? (c.spend / c.revenue) * 100 : null, spend: c.spend }))
    .filter((c) => c.drr != null && c.spend > 0) as { name?: string | null; drr: number; spend: number }[];
  if (withDrr.length < 2) return null;
  const sorted = [...withDrr].sort((a, b) => a.drr - b.drr);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  if (worst.drr - best.drr < 10) return null;
  return `Переброс бюджета: «${worst.name ?? "кампания"}» (ДРР ${Math.round(worst.drr)}%) тратит дороже, чем «${best.name ?? "кампания"}» (ДРР ${Math.round(best.drr)}%). Снизьте ставку у первой и поднимите у второй — те же деньги принесут больше заказов.`;
}
