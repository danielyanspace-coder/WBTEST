"use client";

import { useTransition } from "react";
import { removeWatchAction } from "@/app/actions/watch";

type Item = {
  id: string;
  nmId: number;
  title: string;
  price: number | null;
  stock: number | null;
  days: number;
  perDay: number | null;
  estSold: number | null;
};

export function Watchlist({ items }: { items: Item[] }) {
  const [pending, start] = useTransition();
  if (items.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="mb-2 font-semibold">Отслеживаемые товары</h3>
      <p className="mb-3 text-xs text-muted">
        Каждый день снимаем цену и остаток через бесплатный публичный API WB и сами
        считаем продажи по разнице остатков. История копится — точность растёт.
      </p>
      <div className="bento p-0 overflow-x-auto">
        <div className="grid grid-cols-12 border-b border-line px-5 py-3 text-xs uppercase text-muted min-w-[640px]">
          <div className="col-span-5">Товар</div>
          <div className="col-span-2">Цена</div>
          <div className="col-span-2">Остаток</div>
          <div className="col-span-2">Продажи/день</div>
          <div className="col-span-1"></div>
        </div>
        {items.map((it) => (
          <div key={it.id} className="grid grid-cols-12 items-center border-b border-line px-5 py-4 text-sm last:border-0 min-w-[640px]">
            <div className="col-span-5 truncate font-medium">{it.title}</div>
            <div className="col-span-2">{it.price != null ? it.price.toLocaleString("ru-RU") + " ₽" : "—"}</div>
            <div className="col-span-2">{it.stock ?? "—"}</div>
            <div className="col-span-2">
              {it.days >= 1 && it.perDay != null ? (
                <span className="font-semibold text-lime">~{it.perDay} шт</span>
              ) : (
                <span className="text-xs text-muted">копим данные…</span>
              )}
            </div>
            <div className="col-span-1 text-right">
              <button
                onClick={() => start(async () => { await removeWatchAction(it.id); })}
                disabled={pending}
                className="text-xs text-muted hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
