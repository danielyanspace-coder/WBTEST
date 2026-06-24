import { PageShell } from "@/components/dashboard/PageShell";
import { BillingPlans } from "@/components/dashboard/BillingPlans";
import { getCurrentUser } from "@/lib/auth/session";
import { getSubscription } from "@/lib/data/dashboard";

const STATUS_LABEL: Record<string, string> = {
  TRIALING: "Пробный период",
  ACTIVE: "Активна",
  CANCELED: "Отменена",
  PAST_DUE: "Ожидает оплаты",
};

const PLAN_LABEL: Record<string, string> = {
  NONE: "—",
  START: "Старт",
  PRO: "Профи",
  BUSINESS: "Бизнес",
};

export default async function BillingPage() {
  const user = await getCurrentUser();
  const { sub, trialLeft } = user
    ? await getSubscription(user.id)
    : { sub: null, trialLeft: 0 };

  const status = sub?.status ?? "TRIALING";
  const statusText =
    status === "TRIALING"
      ? `Пробный период · осталось ${trialLeft} дн.`
      : `${STATUS_LABEL[status]} · тариф «${PLAN_LABEL[sub?.plan ?? "NONE"]}»`;

  return (
    <PageShell title="Подписка">
      <div className="bento mb-4 flex flex-col items-start justify-between gap-3 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="text-sm text-muted">Текущий статус</div>
          <div className="font-display text-xl font-bold">{statusText}</div>
        </div>
        <span className="rounded-full bg-lime/15 px-3 py-1 text-sm font-semibold text-lime">
          {status === "ACTIVE" ? "оплачено" : "активен"}
        </span>
      </div>

      <BillingPlans />

      <p className="mt-4 text-xs text-muted">
        Если ЮKassa подключена (ключи на сервере) — оплата идёт через неё с
        автопродлением. Без ключей работает тестовый режим (моментальная активация).
      </p>
    </PageShell>
  );
}
