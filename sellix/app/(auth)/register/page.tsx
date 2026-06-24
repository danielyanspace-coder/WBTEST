import Link from "next/link";
import { AuthShell, Field } from "@/components/auth/AuthShell";
import { TRIAL_DAYS } from "@/lib/plans";

export default function RegisterPage() {
  return (
    <AuthShell
      title={`Бесплатно ${TRIAL_DAYS} дней`}
      subtitle="Регистрация займёт меньше минуты. Карта не нужна."
      footer={
        <>
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-semibold text-lime hover:underline">
            Войти
          </Link>
        </>
      }
    >
      {/* TODO(auth): серверное действие регистрации + привязка реферального кода из ?ref= */}
      <form action="/dashboard">
        <Field label="Имя" placeholder="Как к вам обращаться" />
        <Field label="Email" type="email" placeholder="you@example.com" />
        <Field
          label="Пароль"
          type="password"
          placeholder="Придумайте пароль"
          hint="Минимум 8 символов"
        />
        <Field
          label="Промокод друга (необязательно)"
          placeholder="Например: SELLIX-AB12"
          hint="Если пришли по ссылке — код подставится сам"
        />
        <button className="btn-primary w-full">Создать аккаунт</button>
        <p className="mt-3 text-center text-xs text-muted">
          Нажимая, вы соглашаетесь с офертой и политикой данных
        </p>
      </form>
    </AuthShell>
  );
}
