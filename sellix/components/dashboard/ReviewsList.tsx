"use client";

import { useState, useTransition } from "react";
import { Star, Bot } from "@/components/ui/icons";
import { suggestReplyAction, sendReplyAction } from "@/app/actions/reviews";

export type ReviewItem = {
  id: string;
  productName: string | null;
  authorName: string | null;
  rating: number | null;
  text: string | null;
  answered: boolean;
  answerText: string | null;
};

const TONES = ["Дружелюбный", "Деловой", "С юмором"];

export function ReviewsList({ items, demo }: { items: ReviewItem[]; demo: boolean }) {
  const [tone, setTone] = useState(TONES[0]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {demo && (
          <div className="bento p-4 text-sm text-muted">
            Это примеры. Подключите магазин — здесь появятся ваши реальные отзывы,
            и кнопка «Ответить с ИИ» отправит ответ прямо в Wildberries.
          </div>
        )}
        {items.map((r) => (
          <ReviewCard key={r.id} item={r} tone={tone} demo={demo} />
        ))}
      </div>

      <div className="space-y-4">
        <div className="bento p-6">
          <h3 className="font-semibold">Голос бренда</h3>
          <p className="mt-1 text-sm text-muted">ИИ отвечает в этом стиле.</p>
          <div className="mt-3 space-y-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={
                  t === tone
                    ? "w-full rounded-xl bg-lime px-3 py-2 text-sm font-semibold text-ink"
                    : "w-full rounded-xl border border-line px-3 py-2 text-sm text-muted hover:text-white"
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ item, tone, demo }: { item: ReviewItem; tone: string; demo: boolean }) {
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState(item.answerText ?? "");
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(item.answered);
  const [error, setError] = useState<string | null>(null);

  function suggest() {
    setError(null);
    start(async () => {
      const res = await suggestReplyAction(item.id, tone);
      if (res.text) {
        setDraft(res.text);
        setOpen(true);
      } else setError(res.error ?? "Ошибка");
    });
  }

  function send() {
    setError(null);
    start(async () => {
      const res = await sendReplyAction(item.id, draft);
      if (res.ok) setSent(true);
      else setError(res.error ?? "Ошибка");
    });
  }

  return (
    <div className="bento p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-500 text-xs font-bold">
            {(item.authorName?.[0] ?? "?").toUpperCase()}
          </span>
          <span className="text-sm font-semibold">{item.authorName ?? "Покупатель"}</span>
          <span className="flex text-lime">
            {Array.from({ length: item.rating ?? 0 }).map((_, k) => (
              <Star key={k} className="h-3.5 w-3.5" />
            ))}
          </span>
        </div>
        <span
          className={
            sent
              ? "rounded-full bg-lime/15 px-2 py-0.5 text-xs text-lime"
              : "rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400"
          }
        >
          {sent ? "Отвечено" : "Нужен ответ"}
        </span>
      </div>

      {item.productName && <div className="mt-2 text-xs text-muted">{item.productName}</div>}
      <p className="mt-2 text-sm text-white/90">{item.text || "(без текста)"}</p>

      {open && (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm outline-none focus:border-lime/60"
        />
      )}

      {error && <div className="mt-2 text-xs text-red-400">{error}</div>}

      {!sent && (
        <div className="mt-3 flex items-center gap-2">
          <button onClick={suggest} disabled={pending} className="btn-primary text-xs disabled:opacity-60">
            <Bot className="h-3.5 w-3.5" /> {pending ? "…" : "Ответить с ИИ"}
          </button>
          {open && (
            <button onClick={send} disabled={pending || demo} className="btn-ghost text-xs disabled:opacity-60">
              {demo ? "Отправка (демо)" : "Отправить в WB"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
