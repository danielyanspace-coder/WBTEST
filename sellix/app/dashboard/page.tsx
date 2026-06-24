import Link from "next/link";
import { ArrowUpRight, TrendingUp, Star, Package, Wallet } from "@/components/ui/icons";
import { PageShell } from "@/components/dashboard/PageShell";
import { MiniBars, WaveLine } from "@/components/visuals/Abstract";
import { Term } from "@/components/ui/Term";

const kpis = [
  { icon: Wallet, label: "Выручка за 7 дней", value: "1 248 600 ₽", delta: "+12%" },
  { icon: Package, label: "Заказы", value: "412", delta: "+8%" },
  { icon: Star, label: "Рейтинг магазина", value: "4.8", delta: "+0.1" },
  { icon: TrendingUp, label: "Выкуп", value: "71%", delta: "+3%" },
];

export default function DashboardHome() {
  return (
    <PageShell title="Обзор">
      {/* Подсказка про подключение */}
      <div className="bento-lime mb-4 flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
        <div>
          <div className="font-display text-lg font-bold">Подключите магазин за 1 минуту</div>
          <div className="text-sm text-ink/80">
            Вставьте ключ WB API — и все цифры и инструменты оживут.
          </div>
        </div>
        <Link href="/dashboard/connect" className="btn bg-ink text-white hover:bg-ink-600">
          Подключить WB <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* KPI-плитки */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bento p-5">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-500 text-lime">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="rounded-full bg-lime/15 px-2 py-0.5 text-xs font-semibold text-lime">
                  {k.delta}
                </span>
              </div>
              <div className="mt-3 font-display text-2xl font-bold">{k.value}</div>
              <div className="text-xs text-muted">{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Крупные плитки */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="bento p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Продажи по дням</h3>
            <span className="chip">7 дней</span>
          </div>
          <MiniBars className="h-40 w-full" />
        </div>

        <div className="bento flex flex-col justify-between p-6">
          <div>
            <h3 className="font-semibold">Что сделать сегодня</h3>
            <p className="mt-1 text-xs text-muted">Подсказки AI-агента</p>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="text-lime">•</span> 3 товара скоро закончатся —{" "}
              <Term k="out-of-stock">риск простоя</Term>
            </li>
            <li className="flex gap-2">
              <span className="text-lime">•</span> 5 новых отзывов ждут ответа
            </li>
            <li className="flex gap-2">
              <span className="text-lime">•</span> 2 цены можно поднять без потери продаж
            </li>
          </ul>
          <Link href="/dashboard/assistant" className="btn-ghost mt-4 w-full text-sm">
            Открыть AI-агента
          </Link>
        </div>
      </div>

      <div className="mt-4 bento-lime flex items-center justify-between p-6">
        <div>
          <div className="font-display text-xl font-bold">AI-агент на автопилоте</div>
          <div className="text-sm text-ink/80">Отвечает на отзывы и держит цены, пока вы отдыхаете</div>
        </div>
        <WaveLine className="hidden h-14 w-48 sm:block" />
      </div>
    </PageShell>
  );
}
