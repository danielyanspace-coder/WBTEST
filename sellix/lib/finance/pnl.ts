/**
 * Финансовый учёт: отчёт о прибылях и убытках (ОПиУ) и юнит-экономика.
 * Считает чистую прибыль после комиссии, логистики, себестоимости, налога и
 * постоянных расходов; классифицирует товары по марже (🟢/🟡/🔴).
 */
export type FinanceParams = {
  commissionPct: number;
  logisticsPerUnit: number;
  cogsPct: number;
  taxPct: number;
  fixedMonthly: number;
};

export const DEFAULT_FINANCE: FinanceParams = {
  commissionPct: 17,
  logisticsPerUnit: 60,
  cogsPct: 40,
  taxPct: 7,
  fixedMonthly: 0,
};

export type PnlLine = { label: string; value: number; kind: "in" | "out" | "result" };
export type Pnl = {
  revenue: number;
  cogs: number;
  commission: number;
  logistics: number;
  tax: number;
  fixed: number;
  grossProfit: number;
  netProfit: number;
  marginPct: number;
  lines: PnlLine[];
};

export function computePnl(revenue: number, units: number, p: FinanceParams): Pnl {
  const cogs = Math.round((revenue * p.cogsPct) / 100);
  const commission = Math.round((revenue * p.commissionPct) / 100);
  const logistics = Math.round(units * p.logisticsPerUnit);
  const tax = Math.round((revenue * p.taxPct) / 100);
  const fixed = p.fixedMonthly;
  const grossProfit = revenue - cogs - commission - logistics;
  const netProfit = grossProfit - tax - fixed;
  const marginPct = revenue > 0 ? Math.round((netProfit / revenue) * 1000) / 10 : 0;

  const lines: PnlLine[] = [
    { label: "Выручка", value: revenue, kind: "in" },
    { label: "Себестоимость товара", value: -cogs, kind: "out" },
    { label: "Комиссия WB", value: -commission, kind: "out" },
    { label: "Логистика", value: -logistics, kind: "out" },
    { label: "Валовая прибыль", value: grossProfit, kind: "result" },
    { label: "Налог", value: -tax, kind: "out" },
    { label: "Постоянные расходы", value: -fixed, kind: "out" },
    { label: "Чистая прибыль", value: netProfit, kind: "result" },
  ];
  return { revenue, cogs, commission, logistics, tax, fixed, grossProfit, netProfit, marginPct, lines };
}

/** Маржа одного товара в % с учётом фикс. логистики (дешёвые товары — рискованнее). */
export function productMargin(price: number, p: FinanceParams): number {
  if (price <= 0) return 0;
  const net = price - (price * (p.cogsPct + p.commissionPct + p.taxPct)) / 100 - p.logisticsPerUnit;
  return Math.round((net / price) * 1000) / 10;
}

export function classifyMargin(marginPct: number): "high" | "mid" | "low" {
  if (marginPct >= 20) return "high";
  if (marginPct >= 0) return "mid";
  return "low";
}
