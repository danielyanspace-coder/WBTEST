"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Field } from "@/components/auth/AuthShell";
import { loginAction, registerAction, type AuthState } from "@/app/actions/auth";
import { TRIAL_DAYS } from "@/lib/plans";

const initial: AuthState = {};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? "Подождите…" : children}
    </button>
  );
}

function ErrorBox({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
      {error}
    </div>
  );
}

export function LoginForm() {
  const [state, action] = useFormState(loginAction, initial);
  return (
    <form action={action}>
      <ErrorBox error={state.error} />
      <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
      <Field label="Пароль" name="password" type="password" placeholder="••••••••" required />
      <SubmitButton>Войти</SubmitButton>
    </form>
  );
}

export function RegisterForm({ refCode }: { refCode?: string }) {
  const [state, action] = useFormState(registerAction, initial);
  return (
    <form action={action}>
      <ErrorBox error={state.error} />
      <Field label="Имя" name="name" placeholder="Как к вам обращаться" required />
      <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
      <Field
        label="Пароль"
        name="password"
        type="password"
        placeholder="Придумайте пароль"
        hint="Минимум 8 символов"
        required
      />
      <Field
        label="Промокод друга (необязательно)"
        name="ref"
        placeholder="Например: SELLIX-AB12"
        hint="Если пришли по ссылке — код подставится сам"
        defaultValue={refCode}
      />
      <SubmitButton>Создать аккаунт</SubmitButton>
      <p className="mt-3 text-center text-xs text-muted">
        {TRIAL_DAYS} дней бесплатно. Нажимая, вы соглашаетесь с офертой и политикой данных.
      </p>
    </form>
  );
}
