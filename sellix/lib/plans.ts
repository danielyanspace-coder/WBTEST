/** Тарифные планы SELLIX. Цены — заглушка, billing подключается отдельно (mock). */
export type Plan = {
  id: "trial" | "start" | "pro" | "business";
  name: string;
  priceMonth: number; // ₽/мес
  tagline: string;
  highlight?: boolean;
  features: string[];
  limits: string;
};

export const PLANS: Plan[] = [
  {
    id: "start",
    name: "Старт",
    priceMonth: 1490,
    tagline: "Для тех, кто только разгоняется",
    limits: "до 300 товаров · 1 магазин WB",
    features: [
      "Аналитика своего магазина",
      "Автоответы на отзывы и вопросы",
      "AI-чат по справочнику WB",
      "Уведомления об остатках",
    ],
  },
  {
    id: "pro",
    name: "Профи",
    priceMonth: 3490,
    tagline: "Самый популярный выбор",
    highlight: true,
    limits: "до 3 000 товаров · 3 магазина WB",
    features: [
      "Всё из «Старт»",
      "Репрайсер (умные цены)",
      "Планирование поставок",
      "Анализ отзывов и проблем",
      "SEO-помощник карточек",
    ],
  },
  {
    id: "business",
    name: "Бизнес",
    priceMonth: 6990,
    tagline: "Максимум автоматизации",
    limits: "без лимита товаров · 10 магазинов",
    features: [
      "Всё из «Профи»",
      "Биддер рекламы",
      "AI-агент 24/7 (автопилот)",
      "Внешняя аналитика ниш",
      "Приоритетная поддержка",
    ],
  },
];

export const TRIAL_DAYS = 7;
export const REFERRAL_PERCENT = 20;
