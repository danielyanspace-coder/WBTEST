"use client";

import { useState, useTransition } from "react";
import { Search } from "@/components/ui/icons";
import { Sparkline } from "@/components/ui/Sparkline";
import { addKeywordAction, removeKeywordAction } from "@/app/actions/keywords";

type Track = {
  id: string;
  nmId: number;
  query: string;
  current: number | null;
  delta: number | null;
  series: number[];
};

export function PositionTracker({ tracks }: { tracks: Track[] }) {
  const [pending, start] = useTransition();
  const [nm, setNm] = useState("");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  function add() {
    setMsg(null);
    const nmId = parseInt(nm, 10);
    if (!nmId || !q.trim()) {
      setMsg("Укажите артикул и запрос");
      return;
    }
    start(async () => {
      const r = await addKeywordAction(nmId, q.trim());
      if (r.ok) {
        setQ("");
        setMsg("Добавлено — первый замер сделан");
      } else setMsg(r.error ?? "Ошибка");
    });
  }

  return (
    <div className="mt-4">
      <h3 className="mb-1 font-semibold">Позиции по запросам</h3>
      <p className="mb-3 text-xs text-muted">
        Бесплатно следим, на каком месте ваш товар в поиске WB по ключевым словам.
        Замеряем каждый день — видно рост или падение.
      </p>

      <div className="bento mb-3 p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={nm}
            onChange={(e) => setNm(e.target.value)}
            placeholder="Артикул WB (nmId)"
            className="w-full rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm sm:w-48"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Поисковый запрос, например «платье летнее»"
            className="flex-1 rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm"
          />
          <button onClick={add} disabled={pending} className="btn-primary disabled:opacity-60">
            <Search className="h-4 w-4" /> Отслеживать
          </button>
        </div>
        {msg && <div className="mt-2 text-xs text-lime">{msg}</div>}
      </div>

      {tracks.length > 0 && (
        <div className="bento p-0 overflow-x-auto">
          <div className="grid grid-cols-12 border-b border-line px-5 py-3 text-xs uppercase text-muted min-w-[640px]">
            <div className="col-span-5">Запрос</div>
            <div className="col-span-2">Артикул</div>
            <div className="col-span-2">Позиция</div>
            <div className="col-span-2">Динамика</div>
            <div className="col-span-1"></div>
          </div>
          {tracks.map((t) => (
            <div key={t.id} className="grid grid-cols-12 items-center border-b border-line px-5 py-4 text-sm last:border-0 min-w-[640px]">
              <div className="col-span-5 truncate font-medium">{t.query}</div>
              <div className="col-span-2 text-muted">{t.nmId}</div>
              <div className="col-span-2">
                {t.current != null ? (
                  <span className="font-semibold">
                    #{t.current}
                    {t.delta != null && t.delta !== 0 && (
                      <span className={t.delta > 0 ? "ml-1 text-lime" : "ml-1 text-red-400"}>
                        {t.delta > 0 ? `↑${t.delta}` : `↓${Math.abs(t.delta)}`}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-xs text-muted">вне топ-300</span>
                )}
              </div>
              <div className="col-span-2">
                <Sparkline data={t.series.filter((x) => x > 0).map((x) => -x)} className="h-7 w-16" />
              </div>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => start(async () => { await removeKeywordAction(t.id); })}
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
