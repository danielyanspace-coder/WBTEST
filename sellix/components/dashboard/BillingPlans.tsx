"use client";

import { useState, useTransition } from "react";
import { Check } from "@/components/ui/icons";
import { PLANS } from "@/lib/plans";
import { checkoutAction } from "@/app/actions/billing";
import type { PlanId } from "@/lib/billing/service";

const ID_MAP: Record<string, PlanId> = { start: "START", pro: "PRO", business: "BUSINESS" };

export function BillingPlans() {
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function buy(id: string) {
    setBusyId(id);
    setMsg(null);
    start(async () => {
      const res = await checkoutAction(ID_MAP[id]);
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else if (res.ok) {
        setMsg("Подписка активирована! (тестовый режим)");
        setTimeout(() => window.location.reload(), 900);
      } else {
        setMsg(res.error ?? "Ошибка оплаты");
      }
      setBusyId(null);
    });
  }

  return (
    <>
      {msg && (
        <div className="mb-4 rounded-xl border border-lime/30 bg-lime/10 px-4 py-2.5 text-sm text-lime">
          {msg}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.id} className={p.highlight ? "bento border-lime/50 p-6 shadow-glow" : "bento p-6"}>
            <h3 className="font-display text-lg font-bold">{p.name}</h3>
            <div className="mt-2 flex items-end gap-1">
              <span className="font-display text-3xl font-bold">
                {p.priceMonth.toLocaleString("ru-RU")}
              </span>
              <span className="mb-1 text-muted">₽/мес</span>
            </div>
            <button
              onClick={() => buy(p.id)}
              disabled={pending && busyId === p.id}
              className={(p.highlight ? "btn-primary" : "btn-ghost") + " mt-4 w-full disabled:opacity-60"}
            >
              {pending && busyId === p.id ? "Открываем оплату…" : `Выбрать ${p.name}`}
            </button>
            <ul className="mt-4 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
