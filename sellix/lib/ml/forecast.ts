/**
 * Ядро прогноза спроса (без внешних ML-библиотек — чистая математика на наших
 * временных рядах продаж). Используется репрайсером, биддером и уведомлениями.
 *
 * Идея: из ежедневных продаж считаем скорость (шт/день), тренд (EMA-наклон) и
 * «запас хода» по складу. Это и есть основа адаптивных решений по цене и ставке.
 */
export type DailyPoint = { date: string; orders: number; buyouts: number; revenue: number };

function sortByDate(points: DailyPoint[]) {
  return [...points].sort((a, b) => a.date.localeCompare(b.date));
}

/** Средняя скорость заказов в день за последние N дней. */
export function velocity(points: DailyPoint[], days = 14): number {
  if (points.length === 0) return 0;
  const last = sortByDate(points).slice(-days);
  const total = last.reduce((s, p) => s + p.orders, 0);
  return total / Math.max(1, last.length);
}

/** Экспоненциально сглаженный тренд спроса: -1..+1 (падение → рост). */
export function trend(points: DailyPoint[]): number {
  const pts = sortByDate(points);
  if (pts.length < 4) return 0;
  const half = Math.floor(pts.length / 2);
  const older = pts.slice(0, half);
  const recent = pts.slice(half);
  const avg = (arr: DailyPoint[]) => arr.reduce((s, p) => s + p.orders, 0) / Math.max(1, arr.length);
  const a = avg(older);
  const b = avg(recent);
  if (a === 0 && b === 0) return 0;
  const change = (b - a) / Math.max(1, a);
  return Math.max(-1, Math.min(1, change));
}

/** На сколько дней хватит текущего остатка при нынешней скорости. */
export function daysOfCover(stock: number, v: number): number {
  if (v <= 0) return stock > 0 ? 999 : 0;
  return stock / v;
}

/** Прогноз заказов на горизонт (дней) с учётом тренда. */
export function forecastUnits(points: DailyPoint[], horizonDays: number): number {
  const v = velocity(points);
  const t = trend(points);
  // тренд слегка корректирует базовую скорость
  return Math.max(0, Math.round(v * horizonDays * (1 + t * 0.5)));
}

/** Оценка эластичности спроса по цене из пары наблюдений (%Δспроса / %Δцены). */
export function elasticity(
  priceOld: number,
  priceNew: number,
  salesOld: number,
  salesNew: number
): number | null {
  if (priceOld <= 0 || salesOld <= 0 || priceNew === priceOld) return null;
  const dP = (priceNew - priceOld) / priceOld;
  const dQ = (salesNew - salesOld) / salesOld;
  if (dP === 0) return null;
  // обычно эластичность отрицательна (цена ↑ → спрос ↓)
  return dQ / dP;
}

/** Уверенность 0..1 по объёму данных (чем больше точек и продаж, тем выше). */
export function confidence(points: DailyPoint[]): number {
  const days = points.length;
  const sales = points.reduce((s, p) => s + p.orders, 0);
  const byDays = Math.min(1, days / 14);
  const bySales = Math.min(1, sales / 30);
  return Math.round((byDays * 0.5 + bySales * 0.5) * 100) / 100;
}
