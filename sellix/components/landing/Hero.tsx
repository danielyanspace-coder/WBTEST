import Link from "next/link";
import { ArrowUpRight, Sparkles } from "@/components/ui/icons";
import { CrystalBlob, WaveLine, MiniBars } from "@/components/visuals/Abstract";
import { Term } from "@/components/ui/Term";

export function Hero() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 bg-lime-radial" />
      <div className="section relative pb-10 pt-12">
        <div className="mb-6 flex justify-center">
          <span className="chip">
            <Sparkles className="h-3.5 w-3.5 text-lime" />
            Весь Wildberries в одном окне
          </span>
        </div>

        {/* BENTO-сетка героя */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
          {/* Главная плитка */}
          <div className="bento group flex flex-col justify-between p-8 md:col-span-2 md:row-span-2">
            <div className="absolute -right-10 -top-10 h-64 w-64 opacity-70">
              <CrystalBlob className="h-full w-full" />
            </div>
            <div className="relative max-w-xl">
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                Продавайте на WB
                <br />
                <span className="text-lime">на автопилоте</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
                SELLIX подключается к вашему магазину за 1 минуту и сам ведёт{" "}
                <Term k="юнит-экономика">экономику</Term>, отвечает на отзывы,
                держит <Term k="репрайсер">умные цены</Term> и подсказывает, что
                делать дальше. Без сложных слов.
              </p>
            </div>
            <div className="relative mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn-primary text-base">
                Начать бесплатно — 7 дней
              </Link>
              <Link href="#how" className="btn-ghost text-base">
                Как это работает
              </Link>
            </div>
          </div>

          {/* Лаймовая плитка AI */}
          <div className="bento-lime flex flex-col justify-between p-6">
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold">
                AI-агент
              </span>
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <WaveLine className="my-2 h-16 w-full" />
            <div className="font-display text-2xl font-bold">Работает 24/7</div>
          </div>

          {/* Плитка статистики */}
          <div className="bento flex flex-col justify-between p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Рост выручки</span>
              <span className="rounded-full bg-lime/15 px-2 py-0.5 text-xs font-semibold text-lime">
                +32%
              </span>
            </div>
            <MiniBars className="mt-2 h-16 w-full" />
          </div>
        </div>

        {/* Логотип-доверие */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted">
          <span>Подключение по WB API за 1 минуту</span>
          <span className="h-1 w-1 rounded-full bg-line" />
          <span>Данные не передаются третьим лицам</span>
          <span className="h-1 w-1 rounded-full bg-line" />
          <span>Отмена в любой момент</span>
        </div>
      </div>
    </section>
  );
}
