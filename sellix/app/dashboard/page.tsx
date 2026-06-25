import Link from "next/link";
import { ArrowUpRight, Wallet, Package, Star, TrendingUp } from "@/components/ui/icons";
import { PageShell } from "@/components/dashboard/PageShell";
import { MiniBars, WaveLine } from "@/components/visuals/Abstract";
import { getCurrentUser } from "@/lib/auth/session";
import { getOverview } from "@/lib/data/dashboard";
import { getStoreHealth } from "@/lib/health/score";

const ICONS = [Wallet, Package, Star, TrendingUp];
const SEV = {
  critical: "bg-red-500/15 text-red-400",
  warning: "bg-amber-500/15 text-amber-400",
  info: "bg-lime/15 text-lime",
} as const;

export default async function DashboardHome() {
  const user = await getCurrentUser();
  const overview = user ? await getOverview(user.id) : { connected: false, kpis: [] as { label: string; value: string }[] };
  const health = user ? await getStoreHealth(user.id) : { connected: false, score: 0, grade: "—", subs: [], actions: [] };

  return (
    <PageShell title="Обзор">
      {!overview.connected && (
        <div className="bento-lime mb-4 flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
          <div>
            <div className="font-display text-lg font-bold">Подключите магазин за 1 минуту</div>
            <div className="text-sm text-ink/80">Вставьте ключ WB API — и индекс здоровья оживёт.</div>
          </div>
          <Link href="/dashboard/connect" className="btn bg-ink text-white hover:bg-ink-600">
            Подключить WB <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overview.kpis.map((k, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={k.label} className="bento p-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-500 text-lime">
                <Icon className="h-4 w-4" />
              </span>
              <div className="mt-3 font-display text-2xl font-bold">{k.value}</div>
              <div className="text-xs text-muted">{k.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Индекс здоровья */}
        <div className="bento p-6">
          <h3 className="font-semibold">Индекс здоровья</h3>
          <div className="mt-3 flex items-end gap-3">
            <div className="font-display text-5xl font-bold text-lime">{health.connected ? health.score : "—"}</div>
            <div className="mb-1 text-sm text-muted">{health.connected ? `/ 100 · ${health.grade}` : "подключите магазин"}</div>
          </div>
          <div className="mt-4 space-y-2">
            {health.subs.map((s) => (
              <div key={s.key}>
                <div className="mb-0.5 flex justify-between text-xs text-muted">
                  <span>{s.label}</span>
                  <span>{s.score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-ink-500">
                  <div
                    className={"h-1.5 rounded-full " + (s.score >= 70 ? "bg-lime" : s.score >= 50 ? "bg-amber-400" : "bg-red-400")}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Что сделать сегодня — реальные приоритеты */}
        <div className="bento p-6 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Что сделать сегодня</h3>
            <span className="chip">приоритет по деньгам</span>
          </div>
          {health.actions.length === 0 ? (
            <p className="text-sm text-muted">
              {health.connected ? "Всё под контролем — критичных задач нет 🎉" : "Подключите магазин, чтобы получить план действий."}
            </p>
          ) : (
            <div className="space-y-2">
              {health.actions.slice(0, 5).map((a) => (
                <Link
                  key={a.key}
                  href={a.href}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-ink-700 px-4 py-3 transition hover:border-lime/40"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{a.title}</div>
                    <div className="truncate text-xs text-muted">{a.body}</div>
                  </div>
                  <span className={"shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold " + SEV[a.severity]}>
                    {a.severity === "critical" ? "срочно" : a.severity === "warning" ? "важно" : "совет"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="bento p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Продажи по дням</h3>
            <span className="chip">30 дней</span>
          </div>
          <MiniBars className="h-40 w-full" />
        </div>
        <div className="bento-lime flex flex-col justify-between p-6">
          <div className="font-display text-xl font-bold">AI-агент на автопилоте</div>
          <div className="text-sm text-ink/80">Держит цены и отвечает на отзывы, пока вы отдыхаете</div>
          <WaveLine className="mt-2 h-12 w-full" />
        </div>
      </div>
    </PageShell>
  );
}
