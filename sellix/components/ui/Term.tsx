"use client";

import { useState } from "react";
import { GLOSSARY } from "@/lib/glossary";

/**
 * <Term k="юнит-экономика">юнит-экономику</Term>
 * Подчёркивает сложное слово и показывает простое объяснение во всплывашке.
 * Так на сайте не остаётся непонятных терминов для обычного пользователя.
 */
export function Term({ k, children }: { k: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const text = GLOSSARY[k];
  const label = children ?? k;

  if (!text) return <>{label}</>;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      <span className="term">{label}</span>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-2xl border border-line bg-ink-600 p-3 text-left text-xs font-normal leading-relaxed text-white shadow-bento"
        >
          <span className="mb-1 block font-semibold text-lime">{k}</span>
          {text}
        </span>
      )}
    </span>
  );
}
