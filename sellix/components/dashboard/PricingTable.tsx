"use client";

import { useState, useTransition } from "react";
import { applyPriceAction } from "@/app/actions/pricing";

export type Rec = {
  name: string;
  nmId?: number;
  price: string;
  oldPriceNum?: number;
  newPriceNum?: number;
  actionType?: "up" | "down" | "keep";
  action: string;
  reason: string;
  confidence?: number;
};

export function PricingTable({ rows, demo }: { rows: Rec[]; demo: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<number[]>([]);

  function apply(r: Rec) {
    if (!r.nmId || !r.newPriceNum || !r.oldPriceNum) return;
    setMsg(null);
    start(async () => {
      const res = await applyPriceAction({
        nmId: r.nmId!,
        oldPrice: r.oldPriceNum!,
        newPrice: r.newPriceNum!,
        reason: r.reason,
        confidence: r.confidence,
      });
      if (res.ok) {
        setDoneIds((d) => [...d, r.nmId!]);
        setMsg(`Цена обновлена: ${r.name}`);
      } else setMsg(res.error ?? "Ошибка");
    });
  }

  return (
    <>
      {msg && <div className="mb-3 rounded-xl border border-lime/30 bg-lime/10 px-4 py-2.5 text-sm text-lime">{msg}</div>}
      <div className="bento p-0 overflow-x-auto">
        <div className="grid grid-cols-12 border-b border-line px-5 py-3 text-xs uppercase text-muted min-w-[720px]">
          <div className="col-span-3">Товар</div>
          <div className="col-span-2">Цена</div>
          <div className="col-span-3">Рекомендация</div>
          <div className="col-span-2">Уверенность</div>
          <div className="col-span-2">Действие</div>
        </div>
        {rows.map((r, i) => {
          const done = r.nmId != null && doneIds.includes(r.nmId);
          const canApply = !demo && r.actionType && r.actionType !== "keep" && !done;
          return (
            <div key={i} className="grid grid-cols-12 items-center border-b border-line px-5 py-4 text-sm last:border-0 min-w-[720px]">
              <div className="col-span-3 font-medium">{r.name}</div>
              <div className="col-span-2">{r.price}</div>
              <div className="col-span-3">
                <span className="rounded-full bg-lime/15 px-2 py-0.5 text-xs font-semibold text-lime" title={r.reason}>
                  {r.action}
                </span>
                <div className="mt-1 text-xs text-muted line-clamp-1">{r.reason}</div>
              </div>
              <div className="col-span-2">
                {r.confidence != null ? (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-ink-500">
                      <div className="h-1.5 rounded-full bg-lime" style={{ width: `${Math.round((r.confidence ?? 0) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-muted">{Math.round((r.confidence ?? 0) * 100)}%</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted">—</span>
                )}
              </div>
              <div className="col-span-2">
                {done ? (
                  <span className="text-xs text-lime">Применено</span>
                ) : canApply ? (
                  <button onClick={() => apply(r)} disabled={pending} className="rounded-full bg-lime px-3 py-1 text-xs font-semibold text-ink disabled:opacity-60">
                    Применить
                  </button>
                ) : (
                  <span className="text-xs text-muted">{demo ? "демо" : "—"}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
