import Link from "next/link";
import { Bell, ChevronDown } from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { logoutAction } from "@/app/actions/auth";

export async function Topbar({ title }: { title: string }) {
  const user = await getCurrentUser();
  const label = user?.name || user?.email || "Мой аккаунт";
  const initial = (label[0] || "S").toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-ink/70 px-5 backdrop-blur-xl">
      <h1 className="font-display text-lg font-bold">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted hover:text-white">
          <Bell className="h-4 w-4" />
        </button>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 rounded-xl border border-line px-2.5 py-1.5 text-sm hover:bg-ink-600"
        >
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-lime text-xs font-bold text-ink">
            {initial}
          </span>
          <span className="hidden max-w-[140px] truncate sm:block">{label}</span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </Link>
        <form action={logoutAction}>
          <button className="rounded-xl border border-line px-3 py-1.5 text-sm text-muted hover:text-white">
            Выйти
          </button>
        </form>
      </div>
    </header>
  );
}
