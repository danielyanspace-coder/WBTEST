import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";

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
      <LoginForm />
    </AuthShell>
  );
}
