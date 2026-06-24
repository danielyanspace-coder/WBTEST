import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="section grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            AI-платформа для продавцов Wildberries. Весь бизнес — в одном окне.
          </p>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-white">Продукт</div>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href="#features" className="hover:text-white">Возможности</a></li>
            <li><a href="#pricing" className="hover:text-white">Тарифы</a></li>
            <li><a href="#referral" className="hover:text-white">Рефералка</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-white">Аккаунт</div>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/login" className="hover:text-white">Войти</Link></li>
            <li><Link href="/register" className="hover:text-white">Регистрация</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">Кабинет</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-white">Правовое</div>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href="#" className="hover:text-white">Оферта</a></li>
            <li><a href="#" className="hover:text-white">Политика данных</a></li>
          </ul>
        </div>
      </div>
      <div className="section flex flex-col items-center justify-between gap-2 border-t border-line py-6 text-xs text-muted md:flex-row">
        <span>© {new Date().getFullYear()} SELLIX. Все права защищены.</span>
        <span>Сделано для продавцов Wildberries 💚</span>
      </div>
    </footer>
  );
}
