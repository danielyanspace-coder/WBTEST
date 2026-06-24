import {
  Bot,
  MessagesSquare,
  LineChart,
  Tag,
  Boxes,
  Megaphone,
  Search,
  Bell,
  Sparkles,
  BookOpen,
} from "@/components/ui/icons";

/** Список фич продукта — используется на лендинге и в меню кабинета. */
export type Feature = {
  slug: string;
  title: string;
  short: string;
  icon: any;
  status: "ready-ui" | "soon";
};

export const FEATURES: Feature[] = [
  {
    slug: "assistant",
    title: "AI-агент",
    short: "Берёт на себя рутину: цены, отзывы, отчёты. Работает круглосуточно.",
    icon: Bot,
    status: "ready-ui",
  },
  {
    slug: "reviews",
    title: "Отзывы и вопросы",
    short: "Автоответы в вашем стиле, работа с негативом, разбор жалоб.",
    icon: MessagesSquare,
    status: "ready-ui",
  },
  {
    slug: "analytics",
    title: "Аналитика магазина",
    short: "Продажи, выручка, прибыль и воронка — понятными словами.",
    icon: LineChart,
    status: "ready-ui",
  },
  {
    slug: "pricing",
    title: "Умные цены",
    short: "Робот держит прибыль и не даёт товару залёживаться.",
    icon: Tag,
    status: "ready-ui",
  },
  {
    slug: "supplies",
    title: "Поставки и остатки",
    short: "Подскажет, что и когда везти, чтобы не уйти в ноль.",
    icon: Boxes,
    status: "ready-ui",
  },
  {
    slug: "ads",
    title: "Реклама",
    short: "Биддер сам управляет ставками и экономит бюджет.",
    icon: Megaphone,
    status: "ready-ui",
  },
  {
    slug: "seo",
    title: "SEO карточек",
    short: "Подбирает слова, чтобы вас находили чаще в поиске WB.",
    icon: Search,
    status: "ready-ui",
  },
  {
    slug: "alerts",
    title: "Уведомления",
    short: "Сообщит о провале остатков, падении рейтинга и проблемах.",
    icon: Bell,
    status: "ready-ui",
  },
  {
    slug: "niches",
    title: "Аналитика ниш",
    short: "Поиск прибыльных товаров и оценка конкурентов.",
    icon: Sparkles,
    status: "soon",
  },
  {
    slug: "handbook",
    title: "Справочник WB + AI-чат",
    short: "Спросите что угодно — ИИ найдёт ответ в правилах Wildberries.",
    icon: BookOpen,
    status: "ready-ui",
  },
];
