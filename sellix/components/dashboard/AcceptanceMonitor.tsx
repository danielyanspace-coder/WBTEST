"use client";

import { useState, useTransition } from "react";
import { Boxes } from "@/components/ui/icons";
import {
  getWarehousesAction,
  addWarehouseWatchAction,
  removeWarehouseWatchAction,
} from "@/app/actions/warehouses";

type Watch = {
  id: string;
  warehouseId: number;
  warehouseName: string;
  maxCoefficient: number;
  currentCoef: number | null;
  date: string | null;
  open: boolean;
};

const COEF_OPTIONS = [
  { v: 0, label: "Только бесплатная (×0)" },
  { v: 1, label: "До ×1" },
  { v: 2, label: "До ×2" },
  { v: 5, label: "До ×5" },
];

export function AcceptanceMonitor({ watches }: { watches: Watch[] }) {
  const [pending, start] = useTransition();
  const [warehouses, setWarehouses] = useState<{ id: number; name: string }[] | null>(null);
  const [whId, setWhId] = useState<number | "">("");
  const [maxCoef, setMaxCoef] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  function loadWarehouses() {
    setMsg(null);
    start(async () => {
      const r = await getWarehousesAction();
      if (r.items) setWarehouses(r.items);
      else setMsg(r.error ?? "Ошибка");
    });
  }

  function add() {
    if (whId === "") return;
    const wh = warehouses?.find((w) => w.id === whId);
    setMsg(null);
    start(async () => {
      const r = await addWarehouseWatchAction(Number(whId), wh?.name ?? `Склад ${whId}`, maxCoef);
      setMsg(r.ok ? "Склад добавлен в отслеживание" : r.error ?? "Ошибка");
    });
  }

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink-500 text-lime">
          <Boxes className="h-4 w-4" />
        </span>
        <h3 className="font-semibold">Мониторинг приёмки складов</h3>
      </div>
      <p className="mb-3 text-xs text-muted">
        Выберите склады — бот пришлёт в Telegram, как только откроется приёмка с
        нужным коэффициентом. Больше не нужно ловить слоты вручную.
      </p>

      <div className="bento mb-3 p-4">
        {!warehouses ? (
          <button onClick={loadWarehouses} disabled={pending} className="btn-ghost disabled:opacity-60">
            {pending ? "Загрузка…" : "Загрузить список складов WB"}
          </button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={whId}
              onChange={(e) => setWhId(e.target.value ? Number(e.target.value) : "")}
              className="flex-1 rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm"
            >
              <option value="">Выберите склад…</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <select
              value={maxCoef}
              onChange={(e) => setMaxCoef(Number(e.target.value))}
              className="rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm"
            >
              {COEF_OPTIONS.map((o) => (
                <option key={o.v} value={o.v}>{o.label}</option>
              ))}
            </select>
            <button onClick={add} disabled={pending || whId === ""} className="btn-primary disabled:opacity-60">
              Отслеживать
            </button>
          </div>
        )}
        {msg && <div className="mt-2 text-xs text-lime">{msg}</div>}
      </div>

      {watches.length > 0 && (
        <div className="bento p-0 overflow-x-auto">
          <div className="grid grid-cols-12 border-b border-line px-5 py-3 text-xs uppercase text-muted min-w-[640px]">
            <div className="col-span-5">Склад</div>
            <div className="col-span-3">Лимит коэф.</div>
            <div className="col-span-3">Статус</div>
            <div className="col-span-1"></div>
          </div>
          {watches.map((w) => (
            <div key={w.id} className="grid grid-cols-12 items-center border-b border-line px-5 py-4 text-sm last:border-0 min-w-[640px]">
              <div className="col-span-5 truncate font-medium">{w.warehouseName}</div>
              <div className="col-span-3 text-muted">≤ ×{w.maxCoefficient}</div>
              <div className="col-span-3">
                {w.open ? (
                  <span className="rounded-full bg-lime/15 px-2 py-0.5 text-xs font-semibold text-lime">
                    Открыта ×{w.currentCoef}{w.date ? ` · ${w.date}` : ""}
                  </span>
                ) : (
                  <span className="rounded-full bg-ink-500 px-2 py-0.5 text-xs text-muted">
                    {w.currentCoef != null ? `×${w.currentCoef} — ждём лимит` : "Пока закрыта"}
                  </span>
                )}
              </div>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => start(async () => { await removeWarehouseWatchAction(w.id); })}
                  disabled={pending}
                  className="text-xs text-muted hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
