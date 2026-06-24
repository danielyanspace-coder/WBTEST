import {
  LayoutDashboard,
  Bot,
  MessagesSquare,
  LineChart,
  Tag,
  Boxes,
  Megaphone,
  Search,
  BookOpen,
  Gift,
  CreditCard,
  Settings,
  PlugZap,
  Sparkles,
} from "@/components/ui/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: any;
  group: "main" | "tools" | "account";
  badge?: string;
};

/** Навигация кабинета. Группируется по разделам в сайдбаре. */
export const DASHBOARD_NAV: NavItem[] = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard, group: "main" },
  { href: "/dashboard/assistant", label: "AI-агент", icon: Bot, group: "main" },
  { href: "/dashboard/connect", label: "Подключить WB", icon: PlugZap, group: "main", badge: "старт" },

  { href: "/dashboard/analytics", label: "Аналитика", icon: LineChart, group: "tools" },
  { href: "/dashboard/reviews", label: "Отзывы", icon: MessagesSquare, group: "tools" },
  { href: "/dashboard/pricing", label: "Умные цены", icon: Tag, group: "tools" },
  { href: "/dashboard/supplies", label: "Поставки", icon: Boxes, group: "tools" },
  { href: "/dashboard/ads", label: "Реклама", icon: Megaphone, group: "tools" },
  { href: "/dashboard/seo", label: "SEO карточек", icon: Search, group: "tools" },
  { href: "/dashboard/niches", label: "Аналитика ниш", icon: Sparkles, group: "tools" },
  { href: "/dashboard/handbook", label: "Справочник + чат", icon: BookOpen, group: "tools" },

  { href: "/dashboard/referral", label: "Рефералы", icon: Gift, group: "account" },
  { href: "/dashboard/billing", label: "Подписка", icon: CreditCard, group: "account" },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings, group: "account" },
];
