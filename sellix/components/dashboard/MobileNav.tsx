"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV } from "@/lib/dashboardNav";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const groups: { key: "main" | "tools" | "account"; title: string }[] = [
  { key: "main", title: "Главное" },
  { key: "tools", title: "Инструменты" },
  { key: "account", title: "Аккаунт" },
];

/** Гамбургер + выезжающее меню для кабинета на мобильных (lg:hidden). */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Меню"
        className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 animate-view overflow-y-auto border-r border-line bg-ink-800 p-4">
            <div className="px-2 py-3">
              <Logo />
            </div>
            <nav className="mt-4 space-y-6">
              {groups.map((g) => (
                <div key={g.key}>
                  <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {g.title}
                  </div>
                  <ul className="space-y-1">
                    {DASHBOARD_NAV.filter((n) => n.group === g.key).map((item) => {
                      const Icon = item.icon;
                      const active =
                        item.href === "/dashboard"
                          ? pathname === "/dashboard"
                          : pathname.startsWith(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                              active
                                ? "bg-lime font-semibold text-ink"
                                : "text-muted hover:bg-ink-600 hover:text-white"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}
