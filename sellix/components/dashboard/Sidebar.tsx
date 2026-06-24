"use client";

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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-ink-800 p-4 lg:flex">
      <div className="px-2 py-3">
        <Logo />
      </div>

      <nav className="mt-4 flex-1 space-y-6 overflow-y-auto">
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
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                        active
                          ? "bg-lime text-ink font-semibold"
                          : "text-muted hover:bg-ink-600 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {item.badge && (
                        <span
                          className={cn(
                            "ml-auto rounded-full px-2 py-0.5 text-[10px]",
                            active ? "bg-ink/15" : "bg-lime/15 text-lime"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-4 rounded-2xl border border-line bg-ink-700 p-4">
        <div className="text-xs text-muted">Пробный период</div>
        <div className="mt-1 text-sm font-semibold text-white">Осталось 7 дней</div>
        <Link href="/dashboard/billing" className="btn-primary mt-3 w-full text-xs">
          Выбрать тариф
        </Link>
      </div>
    </aside>
  );
}
