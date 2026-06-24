"use client";

import { useState } from "react";
import { Send, Sparkles, Link2 } from "@/components/ui/icons";

type Msg = { role: "user" | "ai"; text: string; source?: string };

/**
 * UI чата с AI. Сейчас работает на демо-ответах (mock).
 * TODO(ai): подключить POST /api/ai/chat — OpenAI + RAG по справочнику WB.
 */
export function ChatBox({
  placeholder = "Спросите что угодно про Wildberries…",
  starters = [],
}: {
  placeholder?: string;
  starters?: string[];
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "Привет! Я ваш AI-помощник по Wildberries. Спросите про правила, комиссии, поставки или свой магазин — отвечу простыми словами.",
    },
  ]);
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      const sources = (data.sources ?? [])
        .map((s: { title: string }) => s.title)
        .join(", ");
      setMessages((m) => [
        ...m,
        { role: "ai", text: data.answer ?? "Не удалось ответить.", source: sources || undefined },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Сеть недоступна, попробуйте ещё раз." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bento flex h-[70vh] flex-col p-0">
      <div className="flex items-center gap-2 border-b border-line px-5 py-3">
        <Sparkles className="h-4 w-4 text-lime" />
        <span className="text-sm font-semibold">AI-чат</span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-lime px-4 py-2.5 text-sm text-ink"
                  : "max-w-[80%] rounded-2xl rounded-bl-sm border border-line bg-ink-700 px-4 py-2.5 text-sm text-white"
              }
            >
              {m.text}
              {m.source && (
                <div className="mt-2 flex items-center gap-1 text-xs text-lime">
                  <Link2 className="h-3 w-3" /> {m.source}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {starters.length > 0 && (
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          {starters.map((s) => (
            <button key={s} onClick={() => send(s)} className="chip hover:text-white">
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-line p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-line bg-ink-700 px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-lime/60"
        />
        <button type="submit" className="btn-primary px-3">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
