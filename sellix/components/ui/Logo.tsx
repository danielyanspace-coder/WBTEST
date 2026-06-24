import Link from "next/link";

/** Логотип SELLIX: неоновый «глаз-объектив» + название. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" />
          <circle cx="12" cy="12" r="3.2" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-white">
          SELL<span className="text-lime">IX</span>
        </span>
      )}
    </Link>
  );
}
