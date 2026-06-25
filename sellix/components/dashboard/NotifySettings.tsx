"use client";

import { useState, useTransition } from "react";
import { linkTelegramAction, unlinkTelegramAction, saveNotifySettingsAction } from "@/app/actions/telegram";

type Flags = {
  outOfStock: boolean;
  reviews: boolean;
  budget: boolean;
  priceChanges: boolean;
  weeklyDigest: boolean;
  acceptance: boolean;
};

const LABELS: [keyof Flags, string][] = [
  ["outOfStock", "Заканчивается товар"],
  ["acceptance", "Открылась приёмка на складе"],
  ["budget", "Реклама жжёт бюджет (kill-switch)"],
  ["reviews", "Негативные отзывы без ответа"],
  ["priceChanges", "Изменения цен репрайсером"],
  ["weeklyDigest", "Триал и еженедельный отчёт"],
];

export function NotifySettings({ connected, flags }: { connected: boolean; flags: Flags }) {
  const [pending, start] = useTransition();
  const [f, setF] = useState<Flags>(flags);
  const [msg, setMsg] = useState<string | null>(null);

  function connect() {
    setMsg(null);
    start(async () => {
      const r = await linkTelegramAction();
      if (r.url) window.open(r.url, "_blank");
      else setMsg(r.error ?? "Ошибка");
    });
  }
  function toggle(key: keyof Flags) {
    const next = { ...f, [key]: !f[key] };
    setF(next);
    start(async () => { await saveNotifySettingsAction(next); });
  }

  return (
    <div className="bento p-6 lg:col-span-2">
      <h3 className="font-semibold">Telegram-уведомления</h3>
      <p className="mt-1 text-sm text-muted">
        Бот пишет в критических ситуациях: остатки на нуле, реклама сливает бюджет,
        негатив без ответа. Чтобы не терять деньги, пока вы не в кабинете.
      </p>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-ink-700 px-4 py-3">
        <span className="text-sm">{connected ? "Telegram подключён" : "Telegram не подключён"}</span>
        {connected ? (
          <form action={unlinkTelegramAction}>
            <button className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:text-white">Отключить</button>
          </form>
        ) : (
          <button onClick={connect} disabled={pending} className="btn-primary text-xs disabled:opacity-60">
            {pending ? "…" : "Подключить Telegram"}
          </button>
        )}
      </div>
      {msg && <div className="mt-2 text-xs text-red-400">{msg}</div>}

      <div className="mt-5 space-y-2">
        {LABELS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-2.5 text-sm hover:border-lime/40"
          >
            <span>{label}</span>
            <span className={"rounded-full px-2 py-0.5 text-xs font-semibold " + (f[key] ? "bg-lime text-ink" : "border border-line text-muted")}>
              {f[key] ? "вкл" : "выкл"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
