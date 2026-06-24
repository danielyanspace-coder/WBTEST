/**
 * Репрайсер 2.0 — адаптивный движок цены.
 *
 * Вместо одного правила «мало остатка → подними» движок взвешивает несколько
 * сигналов и подстраивается под РЕАКЦИЮ спроса на прошлые изменения цены
 * (онлайн-оценка эластичности). Всегда объясняет решение и держит жёсткие
 * предохранители, чтобы не убить маржу и не словить «карантин цены» WB.
 */
import { velocity, trend, daysOfCover, confidence, elasticity, type DailyPoint } from "@/lib/ml/forecast";

export type PriceInput = {
  price: number; // текущая цена, ₽
  minProfitPrice?: number | null; // нижняя граница (себестоимость+минмаржа)
  stock: number;
  sales: DailyPoint[];
  lastEvent?: { oldPrice: number; newPrice: number; salesBefore: number; salesAfter: number } | null;
  hoursSinceLastChange?: number;
};

export type PriceSettings = {
  maxStepPct: number; // макс. шаг за раз, % (предохранитель)
  targetDaysCoverLow: number; // ниже — дефицит, поднимаем
  targetDaysCoverHigh: number; // выше — затоварка, снижаем
  cooldownHours: number;
};

export const DEFAULT_PRICE_SETTINGS: PriceSettings = {
  maxStepPct: 6,
  targetDaysCoverLow: 10,
  targetDaysCoverHigh: 45,
  cooldownHours: 20,
};

export type PriceRec = {
  price: number;
  action: "up" | "down" | "keep";
  reason: string;
  confidence: number;
  signals: { velocity: number; daysOfCover: number; trend: number; elasticity: number | null };
};

export function recommendPrice(p: PriceInput, s: PriceSettings = DEFAULT_PRICE_SETTINGS): PriceRec {
  const v = velocity(p.sales);
  const t = trend(p.sales);
  const doc = daysOfCover(p.stock, v);
  const conf = confidence(p.sales);
  const floor = p.minProfitPrice && p.minProfitPrice > 0 ? p.minProfitPrice : Math.round(p.price * 0.6);
  const el = p.lastEvent
    ? elasticity(p.lastEvent.oldPrice, p.lastEvent.newPrice, p.lastEvent.salesBefore, p.lastEvent.salesAfter)
    : null;

  const keep = (reason: string): PriceRec => ({
    price: p.price,
    action: "keep",
    reason,
    confidence: conf,
    signals: { velocity: round1(v), daysOfCover: round1(doc), trend: round1(t), elasticity: el },
  });

  // Предохранитель: не трогаем чаще, чем раз в cooldown
  if (p.hoursSinceLastChange != null && p.hoursSinceLastChange < s.cooldownHours) {
    return keep(`Недавно меняли цену (${Math.round(p.hoursSinceLastChange)} ч назад) — ждём реакции спроса`);
  }

  // Базовое направление и «сила» по запасу хода и тренду
  let dir = 0; // +1 поднять, -1 снизить
  let intensity = 0; // 0..1
  let reason = "";

  if (v > 0 && doc < s.targetDaysCoverLow) {
    dir = 1;
    intensity = clamp01((s.targetDaysCoverLow - doc) / s.targetDaysCoverLow);
    reason = `Запас всего ~${Math.round(doc)} дн. при стабильном спросе — поднимаем цену, чтобы заработать больше и растянуть остаток`;
  } else if (doc > s.targetDaysCoverHigh) {
    dir = -1;
    intensity = clamp01((doc - s.targetDaysCoverHigh) / (s.targetDaysCoverHigh * 2));
    reason = `Товар залёживается (~${Math.round(doc)} дн. запаса) — снижаем цену, чтобы ускорить продажи и не платить за хранение`;
  } else if (t > 0.3) {
    dir = 1;
    intensity = 0.4 * t;
    reason = "Спрос уверенно растёт — аккуратно поднимаем цену вслед за рынком";
  } else if (t < -0.3) {
    dir = -1;
    intensity = 0.4 * Math.abs(t);
    reason = "Спрос падает — небольшое снижение, чтобы удержать продажи";
  } else {
    return keep("Спрос и остатки в норме — цена оптимальна");
  }

  // Адаптация по эластичности: если прошлый подъём сильно срезал продажи —
  // спрос эластичный, уменьшаем шаг; если почти не повлиял — можно смелее.
  let stepPct = s.maxStepPct * intensity * (0.5 + conf * 0.5);
  if (el != null) {
    if (el < -1.2) stepPct *= 0.5; // очень чувствителен к цене
    else if (el > -0.4) stepPct *= 1.3; // спрос почти не реагирует — можно увереннее
  }
  stepPct = Math.min(stepPct, s.maxStepPct); // жёсткий потолок шага

  let next = Math.round(p.price * (1 + (dir * stepPct) / 100));

  // ── ЖЁСТКИЕ ПРЕДОХРАНИТЕЛИ ──
  // 1) не ниже минимальной прибыльной цены
  if (next < floor) {
    if (p.price <= floor) return keep("Цена уже на минимуме прибыльности — ниже нельзя");
    next = floor;
    reason += " (ограничено минимальной прибыльной ценой)";
  }
  // 2) защита от «карантина цены» WB — никогда резко больше чем на треть вниз
  const minAllowed = Math.ceil(p.price / 3) + 1;
  if (next < minAllowed) next = minAllowed;

  if (next === p.price) return keep("Изменение слишком мелкое — оставляем как есть");

  return {
    price: next,
    action: dir > 0 ? "up" : "down",
    reason,
    confidence: conf,
    signals: { velocity: round1(v), daysOfCover: round1(doc), trend: round1(t), elasticity: el },
  };
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const round1 = (x: number) => Math.round(x * 10) / 10;
