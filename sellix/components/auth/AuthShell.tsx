import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { CrystalBlob } from "@/components/visuals/Abstract";

/** Общий каркас для страниц входа/регистрации в bento-стиле. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="bg-dots grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Левая витрина */}
      <div className="relative hidden overflow-hidden border-r border-line bg-ink-800 p-12 lg:block">
        <Logo />
        <div className="absolute -bottom-10 -right-10 h-96 w-96 opacity-80">
          <CrystalBlob className="h-full w-full" />
        </div>
        <div className="relative mt-24 max-w-sm">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Весь Wildberries <span className="text-lime">на автопилоте</span>
          </h2>
          <p className="mt-4 text-muted">
            Подключите магазин за минуту и получите аналитику, умные цены и
            AI-агента, который работает за вас 24/7.
          </p>
        </div>
      </div>

      {/* Форма */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
          <div className="mt-8 text-center">
            <Link href="/" className="text-xs text-muted hover:text-white">
              ← На главную
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  hint,
  defaultValue,
  required,
}: {
  label: string;
  name?: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium text-white/90">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-xl border border-line bg-ink-700 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-muted focus:border-lime/60"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
