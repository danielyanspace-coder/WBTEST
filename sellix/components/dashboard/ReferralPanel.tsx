"use client";

import { useState, useTransition } from "react";
import { Copy } from "@/components/ui/icons";
import { requestPayoutAction } from "@/app/actions/referral";

export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <input readOnly value={link} className="flex-1 rounded-xl border border-line bg-ink-700 px-4 py-2.5 text-sm" />
      <button
        onClick={() => {
          navigator.clipboard?.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="btn-primary"
      >
        <Copy className="h-4 w-4" /> {copied ? "Скопировано" : "Копировать"}
      </button>
    </div>
  );
}

export function PayoutButton({ available }: { available: number }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const canPayout = available >= 100000; // от 1000 ₽ (в копейках)
  return (
    <button
      onClick={() => start(async () => { await requestPayoutAction(); setDone(true); })}
      disabled={pending || !canPayout || done}
      className="btn-primary mt-4 w-full disabled:opacity-50"
    >
      {done ? "Заявка принята" : pending ? "Отправляем…" : "Вывести на карту"}
    </button>
  );
}
