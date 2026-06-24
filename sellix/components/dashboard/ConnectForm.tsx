"use client";

import { useFormState, useFormStatus } from "react-dom";
import { connectStoreAction, type StoreState } from "@/app/actions/store";

const initial: StoreState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? "Подключаем…" : "Подключить магазин"}
    </button>
  );
}

export function ConnectForm() {
  const [state, action] = useFormState(connectStoreAction, initial);
  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {state.error}
        </div>
      )}
      {state.ok && (
        <div className="rounded-xl border border-lime/30 bg-lime/10 px-4 py-2.5 text-sm text-lime">
          Магазин подключён! Данные начнут подгружаться.
        </div>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Токен WB API</span>
        <textarea
          name="apiKey"
          rows={3}
          placeholder="eyJhbGciOiJ..."
          className="w-full rounded-xl border border-line bg-ink-700 px-4 py-3 font-mono text-xs text-white outline-none focus:border-lime/60"
        />
      </label>
      <Submit />
    </form>
  );
}
