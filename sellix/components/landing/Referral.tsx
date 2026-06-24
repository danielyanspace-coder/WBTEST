import Link from "next/link";
import { Gift, Users, Wallet } from "@/components/ui/icons";
import { REFERRAL_PERCENT } from "@/lib/plans";

export function Referral() {
  return (
    <section id="referral" className="section py-16">
      <div className="bento-lime grid grid-cols-1 gap-6 p-8 md:grid-cols-2 md:p-12">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold">
            <Gift className="h-3.5 w-3.5" /> Реферальная программа
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl">
            Приводите друзей —<br />получайте {REFERRAL_PERCENT}% с каждой оплаты
          </h2>
          <p className="mt-3 max-w-md text-ink/80">
            Делитесь личной ссылкой. Как только друг оплачивает подписку, вам
            начисляется {REFERRAL_PERCENT}% — и так с каждого его продления.
          </p>
          <Link href="/register" className="btn mt-6 bg-ink text-white hover:bg-ink-600">
            Получить ссылку
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-1">
          {[
            { icon: Users, t: "Делитесь ссылкой", d: "Личная ссылка в кабинете" },
            { icon: Wallet, t: `${REFERRAL_PERCENT}% с оплат`, d: "С каждого продления, не разово" },
            { icon: Gift, t: "Вывод на карту", d: "Когда накопится минимум" },
          ].map((x, i) => {
            const Icon = x.icon;
            return (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-ink/90 p-4 text-white">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime text-ink">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-semibold">{x.t}</div>
                  <div className="text-xs text-muted">{x.d}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
