import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/AuthForms";
import { TRIAL_DAYS } from "@/lib/plans";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
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
      <RegisterForm refCode={searchParams.ref} />
    </AuthShell>
  );
}
