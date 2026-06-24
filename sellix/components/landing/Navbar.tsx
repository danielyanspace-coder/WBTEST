import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const links = [
  { href: "#features", label: "Возможности" },
  { href: "#how", label: "Как это работает" },
  { href: "#pricing", label: "Тарифы" },
  { href: "#referral", label: "Рефералка" },
  { href: "#faq", label: "Вопросы" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-ink/70 backdrop-blur-xl">
      <div className="section flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted transition hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost hidden sm:inline-flex">
            Войти
          </Link>
          <Link href="/register" className="btn-primary">
            Попробовать 7 дней
          </Link>
        </div>
      </div>
    </header>
  );
}
