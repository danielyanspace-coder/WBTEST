/**
 * SELLIX icon set — собственные иконки, нарисованные под неон-бенто стиль.
 * Единый «штриховой» стиль: viewBox 24, stroke=currentColor, 1.8, round.
 * Имена совпадают с теми, что использовались из lucide, поэтому импорт просто
 * переключается на "@/components/ui/icons". Никаких системных эмодзи в проекте.
 */
import * as React from "react";

type Props = React.SVGProps<SVGSVGElement>;

function Icon({ children, ...p }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      {children}
    </svg>
  );
}

export const ArrowUpRight = (p: Props) => (
  <Icon {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Icon>
);

export const Sparkles = (p: Props) => (
  <Icon {...p}>
    <path d="M12 4l1.7 4.6L18 10l-4.3 1.4L12 16l-1.7-4.6L6 10l4.3-1.4z" />
    <path d="M18.5 4.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6L16.3 7l1.6-.6z" />
  </Icon>
);

export const Bot = (p: Props) => (
  <Icon {...p}>
    <rect x="4" y="8" width="16" height="12" rx="4" />
    <path d="M12 8V4" />
    <circle cx="12" cy="3" r="1" />
    <path d="M9 13.5v1.5M15 13.5v1.5" />
    <path d="M2 13v3M22 13v3" />
  </Icon>
);

export const MessagesSquare = (p: Props) => (
  <Icon {...p}>
    <path d="M4 6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-5 4z" />
  </Icon>
);

export const LineChart = (p: Props) => (
  <Icon {...p}>
    <path d="M4 4v16h16" />
    <path d="M4 15l5-5 4 4 7-7" />
  </Icon>
);

export const Tag = (p: Props) => (
  <Icon {...p}>
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7" cy="7" r="1.3" />
  </Icon>
);

export const Boxes = (p: Props) => (
  <Icon {...p}>
    <path d="M12 3 3 7l9 4 9-4z" />
    <path d="M3 7v10l9 4 9-4V7" />
    <path d="M12 11v10" />
  </Icon>
);

export const Megaphone = (p: Props) => (
  <Icon {...p}>
    <path d="M4 10v4h3l10 4V6L7 10z" />
    <path d="M7 14v3a2 2 0 0 0 4 0" />
    <path d="M20 10a3 3 0 0 1 0 4" />
  </Icon>
);

export const Search = (p: Props) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icon>
);

export const Bell = (p: Props) => (
  <Icon {...p}>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9z" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </Icon>
);

export const BookOpen = (p: Props) => (
  <Icon {...p}>
    <path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z" />
    <path d="M12 6v14" />
  </Icon>
);

export const Gift = (p: Props) => (
  <Icon {...p}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M5 12v9h14v-9" />
    <path d="M12 8V21" />
    <path d="M12 8C12 8 11 3 8 3a2.5 2.5 0 0 0 0 5z" />
    <path d="M12 8c0 0 1-5 4-5a2.5 2.5 0 0 1 0 5z" />
  </Icon>
);

export const CreditCard = (p: Props) => (
  <Icon {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <path d="M6 15h4" />
  </Icon>
);

export const Settings = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
  </Icon>
);

export const PlugZap = (p: Props) => (
  <Icon {...p}>
    <path d="M9 7V2M15 7V2" />
    <path d="M6 7h12v3a6 6 0 0 1-12 0z" />
    <path d="M12 16l-1.5 3h3L12 22" />
  </Icon>
);

export const LayoutDashboard = (p: Props) => (
  <Icon {...p}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="5" rx="1.5" />
    <rect x="13" y="10" width="8" height="11" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
  </Icon>
);

export const KeyRound = (p: Props) => (
  <Icon {...p}>
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="M10.7 12.3 20 3" />
    <path d="M16 7l3 3" />
  </Icon>
);

export const Zap = (p: Props) => (
  <Icon {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </Icon>
);

export const Rocket = (p: Props) => (
  <Icon {...p}>
    <path d="M5 13c-2 1-3 4-3 6 2 0 5-1 6-3" />
    <path d="M12 15l-3-3c1-5 4-8 10-9-1 6-4 9-9 10z" />
    <circle cx="14.5" cy="9.5" r="1.4" />
  </Icon>
);

export const Users = (p: Props) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M16 5a3.5 3.5 0 0 1 0 7" />
    <path d="M18 14c2 .8 3 2.8 3 6" />
  </Icon>
);

export const Wallet = (p: Props) => (
  <Icon {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h12v3" />
    <rect x="3" y="7" width="18" height="12" rx="2" />
    <circle cx="17" cy="13" r="1.3" fill="currentColor" stroke="none" />
  </Icon>
);

export const TrendingUp = (p: Props) => (
  <Icon {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </Icon>
);

export const Star = (p: Props) => (
  <Icon {...p}>
    <path d="M12 3l2.7 5.9 6.3.7-4.7 4.3 1.3 6.2L12 17.8 6.1 20.4l1.3-6.2L2.7 9.6l6.3-.7z" />
  </Icon>
);

export const Package = (p: Props) => (
  <Icon {...p}>
    <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
    <path d="M3 8l9 5 9-5" />
    <path d="M12 13v9" />
  </Icon>
);

export const Check = (p: Props) => (
  <Icon {...p}>
    <path d="M4 12l5 6L20 6" />
  </Icon>
);

export const Copy = (p: Props) => (
  <Icon {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2" />
  </Icon>
);

export const Send = (p: Props) => (
  <Icon {...p}>
    <path d="M22 2 11 13" />
    <path d="M22 2l-7 20-4-9-9-4z" />
  </Icon>
);

export const ChevronDown = (p: Props) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const ShieldCheck = (p: Props) => (
  <Icon {...p}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
);

export const CheckCircle2 = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12l3 3 5-5" />
  </Icon>
);

export const Heart = (p: Props) => (
  <Icon {...p}>
    <path d="M12 20s-7-4.5-9.5-9C1 8 2.5 4.5 6 4.5c2 0 3.3 1.2 4 2.3.7-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 15.5 12 20 12 20z" />
  </Icon>
);

export const Link2 = (p: Props) => (
  <Icon {...p}>
    <path d="M9 12h6" />
    <path d="M10 8H7a4 4 0 0 0 0 8h3" />
    <path d="M14 8h3a4 4 0 0 1 0 8h-3" />
  </Icon>
);
