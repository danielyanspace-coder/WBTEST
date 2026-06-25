"use client";

import { useState, useTransition } from "react";
import { Search, Star } from "@/components/ui/icons";
import type { NicheReport } from "@/lib/niche/wbPublic";
import { addWatchAction } from "@/app/actions/watch";

const RUB = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export function NicheExplorer() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<NicheReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [tracked, setTracked] = useState<number[]>([]);

  function track(nmId: number, name: string) {
    setTracked((t) => [...t, nmId]);
    start(async () => { await addWatchAction(nmId, name); });
  }

  async function run() {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch(`/api/niche?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setReport(data);
    } catch {
      setError("Сеть недоступна, попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bento mb-4 p-5">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="Введите нишу: например «платье летнее» или «термокружка»"
            className="flex-1 rounded-xl border border-line bg-ink-700 px-4 py-2.5 text-sm outline-none focus:border-lime/60"
          />
          <button onClick={run} disabled={loading} className="btn-primary disabled:opacity-60">
            <Search className="h-4 w-4" /> {loading ? "Анализ…" : "Анализ ниши"}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Данные берутся из публичного каталога WB. Цифры по популярности —
          приблизительная оценка (точные продажи WB не раскрывает).
        </p>
      </div>

      {error && (
        <div className="bento mb-4 p-4 text-sm text-red-400">{error}</div>
      )}

      {report && report.sample > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ["Продавцов в выдаче", String(report.sellers)],
              ["Средняя цена", RUB(report.price.avg)],
              ["Отзывов суммарно", report.totalFeedbacks.toLocaleString("ru-RU")],
              ["Средний рейтинг", report.avgRating.toFixed(1)],
            ].map(([l, v]) => (
              <div key={l} className="bento p-5">
                <div className="font-display text-2xl font-bold">{v}</div>
                <div className="text-xs text-muted">{l}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="bento p-6">
              <h3 className="font-semibold">Разброс цен</h3>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted">Минимум</span><span>{RUB(report.price.min)}</span></div>
                <div className="flex justify-between"><span className="text-muted">Средняя</span><span>{RUB(report.price.avg)}</span></div>
                <div className="flex justify-between"><span className="text-muted">Максимум</span><span>{RUB(report.price.max)}</span></div>
              </div>
              <h3 className="mt-5 font-semibold">Сильные бренды</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {report.topBrands.map((b) => (
                  <li key={b.brand} className="flex justify-between">
                    <span className="truncate">{b.brand}</span>
                    <span className="text-lime">{b.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bento p-6 lg:col-span-2">
              <h3 className="font-semibold">Топ товаров ниши</h3>
              <div className="mt-3 divide-y divide-line">
                {report.topProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                    <div className="min-w-0">
                      <div className="truncate">{p.name}</div>
                      <div className="text-xs text-muted">{p.brand}</div>
                    </div>
                    <div className="flex items-center gap-4 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-muted">
                        <Star className="h-3 w-3 text-lime" /> {p.rating.toFixed(1)}
                      </span>
                      <span className="hidden text-muted sm:inline">{p.feedbacks} отз.</span>
                      <span className="font-semibold">{RUB(p.price)}</span>
                      <button
                        onClick={() => track(p.id, p.name)}
                        disabled={pending || tracked.includes(p.id)}
                        className="rounded-full border border-line px-2 py-0.5 text-xs text-muted hover:border-lime/40 hover:text-white disabled:opacity-50"
                      >
                        {tracked.includes(p.id) ? "Отслеживается" : "Отслеживать"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {report && report.sample === 0 && (
        <div className="bento p-4 text-sm text-muted">По этому запросу ничего не нашлось.</div>
      )}
    </>
  );
}
