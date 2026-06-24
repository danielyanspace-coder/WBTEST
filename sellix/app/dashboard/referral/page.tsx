import { PageShell } from "@/components/dashboard/PageShell";
import { Copy, Wallet, Users } from "lucide-react";
import { REFERRAL_PERCENT } from "@/lib/plans";

export default function ReferralPage() {
  const link = "https://sellix.app/r/SELLIX-AB12";
  return (
    <PageShell title="Реферальная программа">
      <div className="bento-lime mb-4 p-6">
        <div className="font-display text-2xl font-bold">
          Получайте {REFERRAL_PERCENT}% с каждой оплаты друзей
        </div>
        <p className="text-sm text-ink/80">
          Начисления приходят с каждого продления подписки, а не один раз.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="bento p-6 lg:col-span-2">
          <h3 className="font-semibold">Ваша ссылка</h3>
          <div className="mt-3 flex items-center gap-2">
            <input
              readOnly
              value={link}
              className="flex-1 rounded-xl border border-line bg-ink-700 px-4 py-2.5 text-sm"
            />
            <button className="btn-primary">
              <Copy className="h-4 w-4" /> Копировать
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              [Users, "Переходы", "128"],
              [Users, "Регистрации", "24"],
              [Wallet, "Оплатили", "9"],
            ].map(([Icon, l, v]: any, i) => (
              <div key={i} className="rounded-2xl border border-line bg-ink-700 p-4">
                <Icon className="h-4 w-4 text-lime" />
                <div className="mt-2 font-display text-xl font-bold">{v}</div>
                <div className="text-xs text-muted">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bento flex flex-col justify-between p-6">
          <div>
            <h3 className="font-semibold">К выплате</h3>
            <div className="mt-2 font-display text-3xl font-bold text-lime">12 480 ₽</div>
            <p className="mt-1 text-xs text-muted">Доступно к выводу от 1 000 ₽</p>
          </div>
          {/* TODO(payouts): вывод через ЮKassa Payouts на карту */}
          <button className="btn-primary mt-4 w-full">Вывести на карту</button>
        </div>
      </div>
    </PageShell>
  );
}
