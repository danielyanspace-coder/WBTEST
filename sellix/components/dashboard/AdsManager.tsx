"use client";

import { useState, useTransition } from "react";
import { applyBidAction, saveAdSettingsAction, runBidderAction } from "@/app/actions/ads";

type Campaign = {
  id: string;
  advertId: number;
  name: string | null;
  type: number | null;
  cpm: number | null;
  views: number;
  orders: number;
  drr: number | null;
  rec: { cpm: number; action: "up" | "down" | "keep"; reason: string };
};

type Settings = { targetDrr: number; minCpm: number; maxCpm: number; auto: boolean };

const ACTION_LABEL = { up: "Поднять", down: "Снизить", keep: "Оставить" } as const;

export function AdsManager({
  connected,
  settings,
  campaigns,
  demo,
}: {
  connected: boolean;
  settings: Settings;
  campaigns: Campaign[];
  demo: boolean;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [s, setS] = useState(settings);

  function save() {
    setMsg(null);
    start(async () => {
      const r = await saveAdSettingsAction(s);
      setMsg(r.ok ? "Настройки сохранены" : r.error ?? "Ошибка");
    });
  }
  function runAll() {
    setMsg(null);
    start(async () => {
      const r = await runBidderAction();
      setMsg(r.ok ? `Применено ставок: ${r.applied ?? 0}` : r.error ?? "Ошибка");
    });
  }
  function applyOne(c: Campaign) {
    setMsg(null);
    start(async () => {
      const r = await applyBidAction(c.advertId, c.type ?? 8, c.rec.cpm);
      setMsg(r.ok ? `Ставка обновлена: ${c.name}` : r.error ?? "Ошибка");
    });
  }

  return (
    <>
      {msg && (
        <div className="mb-4 rounded-xl border border-lime/30 bg-lime/10 px-4 py-2.5 text-sm text-lime">{msg}</div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="bento p-6 lg:col-span-2">
          <h3 className="font-semibold">Настройки биддера</h3>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs text-muted">Целевой ДРР, %</span>
              <input
                type="number"
                value={s.targetDrr}
                onChange={(e) => setS({ ...s, targetDrr: +e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm outline-none focus:border-lime/60"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Мин. ставка</span>
              <input
                type="number"
                value={s.minCpm}
                onChange={(e) => setS({ ...s, minCpm: +e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm outline-none focus:border-lime/60"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Макс. ставка</span>
              <input
                type="number"
                value={s.maxCpm}
                onChange={(e) => setS({ ...s, maxCpm: +e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm outline-none focus:border-lime/60"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={save} disabled={pending} className="btn-primary disabled:opacity-60">
              Сохранить
            </button>
            <button onClick={runAll} disabled={pending || demo} className="btn-ghost disabled:opacity-60">
              Применить рекомендации ко всем
            </button>
          </div>
        </div>

        <div className="bento flex flex-col justify-center p-6">
          <div className="text-sm text-muted">Цель</div>
          <div className="font-display text-3xl font-bold text-lime">ДРР ≤ {s.targetDrr}%</div>
          <p className="mt-1 text-xs text-muted">
            Биддер снижает ставку при превышении и поднимает, когда реклама окупается.
          </p>
        </div>
      </div>

      {demo && (
        <div className="bento mb-4 p-4 text-sm text-muted">
          Это пример. Подключите магазин с рекламными кампаниями — здесь появятся ваши
          кампании, а кнопки изменят ставки прямо в Wildberries.
        </div>
      )}

      <div className="bento p-0">
        <div className="grid grid-cols-12 border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
          <div className="col-span-4">Кампания</div>
          <div className="col-span-2">Ставка</div>
          <div className="col-span-1">Заказы</div>
          <div className="col-span-2">ДРР</div>
          <div className="col-span-3">Рекомендация</div>
        </div>
        {campaigns.map((c) => (
          <div key={c.id} className="grid grid-cols-12 items-center border-b border-line px-5 py-4 text-sm last:border-0">
            <div className="col-span-4 truncate font-medium">{c.name}</div>
            <div className="col-span-2">{c.cpm ?? "—"} ₽</div>
            <div className="col-span-1">{c.orders}</div>
            <div className="col-span-2">{c.drr != null ? `${c.drr.toFixed(0)}%` : "—"}</div>
            <div className="col-span-3">
              {c.rec.action === "keep" ? (
                <span className="text-xs text-muted">{c.rec.reason}</span>
              ) : (
                <button
                  onClick={() => applyOne(c)}
                  disabled={pending || demo}
                  className="rounded-full bg-lime/15 px-2 py-1 text-xs font-semibold text-lime hover:bg-lime/25 disabled:opacity-60"
                  title={c.rec.reason}
                >
                  {ACTION_LABEL[c.rec.action]} → {c.rec.cpm} ₽
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
