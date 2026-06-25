"use client";

import { useState, useTransition } from "react";
import { saveFinanceSettings } from "@/app/actions/finance";

type Params = {
  commissionPct: number;
  logisticsPerUnit: number;
  cogsPct: number;
  taxPct: number;
  fixedMonthly: number;
};

const FIELDS: { key: keyof Params; label: string; suffix: string }[] = [
  { key: "cogsPct", label: "Себестоимость", suffix: "%" },
  { key: "commissionPct", label: "Комиссия WB", suffix: "%" },
  { key: "logisticsPerUnit", label: "Логистика", suffix: "₽/шт" },
  { key: "taxPct", label: "Налог", suffix: "%" },
  { key: "fixedMonthly", label: "Пост. расходы", suffix: "₽/мес" },
];

export function FinancePanel({ initial }: { initial: Params }) {
  const [p, setP] = useState<Params>(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function save() {
    setMsg(null);
    start(async () => {
      const r = await saveFinanceSettings(p);
      setMsg(r.ok ? "Сохранено — расчёт обновлён" : r.error ?? "Ошибка");
    });
  }

  return (
    <div className="bento p-6">
      <h3 className="font-semibold">Параметры экономики</h3>
      <p className="mt-1 text-xs text-muted">Заполните один раз — расчёт прибыли станет точным.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs text-muted">{f.label}, {f.suffix}</span>
            <input
              type="number"
              value={p[f.key]}
              onChange={(e) => setP({ ...p, [f.key]: +e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm outline-none focus:border-lime/60"
            />
          </label>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Сохраняем…" : "Пересчитать"}
        </button>
        {msg && <span className="text-sm text-lime">{msg}</span>}
      </div>
    </div>
  );
}
