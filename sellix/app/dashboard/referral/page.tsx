import { PageShell } from "@/components/dashboard/PageShell";
import { Wallet, Users } from "@/components/ui/icons";
import { REFERRAL_PERCENT } from "@/lib/plans";
import { getCurrentUser } from "@/lib/auth/session";
import { getReferral } from "@/lib/data/dashboard";
import { CopyLink, PayoutButton } from "@/components/dashboard/ReferralPanel";

const RUB = (kopecks: number) => (kopecks / 100).toLocaleString("ru-RU") + " ₽";

export default async function ReferralPage() {
  const user = await getCurrentUser();
  const data = user
    ? await getReferral(user.id)
    : { code: "—", link: "", invited: 0, paid: 0, available: 0, total: 0 };

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
          <div className="mt-3">
            <CopyLink link={data.link} />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              [Users, "Приглашено", String(data.invited)],
              [Wallet, "Оплат всего", RUB(data.total)],
              [Wallet, "Выплачено", String(data.paid)],
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
            <div className="mt-2 font-display text-3xl font-bold text-lime">{RUB(data.available)}</div>
            <p className="mt-1 text-xs text-muted">Доступно к выводу от 1 000 ₽</p>
          </div>
          <PayoutButton available={data.available} />
        </div>
      </div>
    </PageShell>
  );
}
