import Link from "next/link";
import { AuthShell, Field } from "@/components/auth/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell
      title="С возвращением"
      subtitle="Войдите, чтобы продолжить управлять магазином"
      footer={
        <>
          Нет аккаунта?{" "}
          <Link href="/register" className="font-semibold text-lime hover:underline">
            Создать
          </Link>
        </>
      }
    >
      {/* TODO(auth): подключить серверное действие входа (next-auth/credentials) */}
      <form action="/dashboard">
        <Field label="Email" type="email" placeholder="you@example.com" />
        <Field label="Пароль" type="password" placeholder="••••••••" />
        <Link href="#" className="mb-4 block text-right text-xs text-muted hover:text-white">
          Забыли пароль?
        </Link>
        <button className="btn-primary w-full">Войти</button>
      </form>
    </AuthShell>
  );
}
