"use client";

import { useState, useTransition } from "react";
import { Search, Check } from "@/components/ui/icons";
import { generateSeoAction, applySeoAction } from "@/app/actions/seo";
import type { SeoResult } from "@/lib/ai/seo";

type Product = { id: string; nmId: number; title: string | null; category: string | null; brand: string | null };

export function SeoStudio({ products }: { products: Product[] }) {
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [nmId, setNmId] = useState<number | null>(null);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function pick(id: string) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setName(p.title ?? "");
    setCategory(p.category ?? "");
    setBrand(p.brand ?? "");
    setNmId(p.nmId);
  }

  function generate() {
    setMsg(null);
    start(async () => {
      const r = await generateSeoAction({ name, category, brand });
      if (r.result) setResult(r.result);
      else setMsg(r.error ?? "Ошибка");
    });
  }

  function apply() {
    if (!nmId || !result) return;
    setMsg(null);
    start(async () => {
      const r = await applySeoAction(nmId, result.title, result.description);
      setMsg(r.ok ? "Карточка обновлена в WB" : r.error ?? "Ошибка");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="bento p-6">
        <h3 className="font-semibold">Что оптимизируем</h3>
        {products.length > 0 && (
          <select
            onChange={(e) => pick(e.target.value)}
            className="mt-3 w-full rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm outline-none focus:border-lime/60"
            defaultValue=""
          >
            <option value="" disabled>
              Выбрать товар из магазина…
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title ?? `Артикул ${p.nmId}`}
              </option>
            ))}
          </select>
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название товара"
          className="mt-3 w-full rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm outline-none focus:border-lime/60"
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Категория"
            className="w-full rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm outline-none focus:border-lime/60"
          />
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Бренд"
            className="w-full rounded-xl border border-line bg-ink-700 px-3 py-2 text-sm outline-none focus:border-lime/60"
          />
        </div>
        <button onClick={generate} disabled={pending || !name} className="btn-primary mt-4 disabled:opacity-60">
          <Search className="h-4 w-4" /> {pending ? "Генерируем…" : "Сгенерировать SEO"}
        </button>
        {msg && <div className="mt-3 text-sm text-lime">{msg}</div>}
      </div>

      <div className="bento p-6">
        <h3 className="font-semibold">Результат</h3>
        {!result ? (
          <p className="mt-3 text-sm text-muted">Здесь появятся готовые заголовок, описание и ключевые слова.</p>
        ) : (
          <div className="mt-3 space-y-3">
            <div>
              <div className="text-xs text-muted">Заголовок</div>
              <div className="rounded-xl border border-line bg-ink-700 p-3 text-sm">{result.title}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Описание</div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-line bg-ink-700 p-3 text-sm whitespace-pre-wrap">
                {result.description}
              </div>
            </div>
            {result.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((k) => (
                  <span key={k} className="chip">{k}</span>
                ))}
              </div>
            )}
            <button
              onClick={apply}
              disabled={pending || !nmId}
              className="btn-ghost w-full disabled:opacity-50"
              title={nmId ? "" : "Выберите товар из магазина, чтобы применить"}
            >
              <Check className="h-4 w-4" /> Применить к карточке WB
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
