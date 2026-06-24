# 🧭 NAVIGATION — карта проекта SELLIX

> Этот файл — «карта местности». Сюда смотрим в первую очередь, чтобы не искать
> по всему репозиторию. Обновляем при добавлении новых модулей.

**Продукт:** SELLIX — AI-платформа для продавцов Wildberries.
**Стек:** Next.js 14 (App Router) + TypeScript + TailwindCSS. AI: OpenAI + RAG. Оплата: mock → ЮKassa.
**Приложение лежит в:** `sellix/`
**Ветка разработки:** `claude/wb-analytics-crm-features-dvm4p3`

---

## 📁 Структура `sellix/`

```
sellix/
├── app/                          # маршруты (App Router)
│   ├── layout.tsx                # шрифты, метаданные, <html>
│   ├── globals.css               # дизайн-система: .bento, .btn, .term, токены
│   ├── page.tsx                  # ЛЕНДИНГ (собирает секции из components/landing)
│   ├── (auth)/
│   │   ├── login/page.tsx        # вход
│   │   └── register/page.tsx     # регистрация (+ поле промокода реферала)
│   └── dashboard/                # КАБИНЕТ (после входа)
│       ├── layout.tsx            # сайдбар + контент
│       ├── page.tsx              # обзор (KPI, графики, подсказки агента)
│       ├── assistant/page.tsx    # AI-агент (чат + автопилот)
│       ├── connect/page.tsx      # ПОДКЛЮЧЕНИЕ WB API (ввод ключа)
│       ├── analytics/page.tsx    # аналитика магазина (воронка, прибыль)
│       ├── reviews/page.tsx      # отзывы/вопросы (автоответы, разбор жалоб)
│       ├── pricing/page.tsx      # умные цены (репрайсер)
│       ├── supplies/page.tsx     # поставки (заглушка)
│       ├── ads/page.tsx          # реклама/биддер (заглушка)
│       ├── seo/page.tsx          # SEO карточек (заглушка)
│       ├── handbook/page.tsx     # справочник WB + AI-чат (RAG)
│       ├── referral/page.tsx     # рефералка (ссылка, статистика, выплаты)
│       ├── billing/page.tsx      # подписка/тарифы
│       └── settings/page.tsx     # профиль, ключ WB, голос бренда
│
├── components/
│   ├── ui/
│   │   ├── Logo.tsx              # логотип
│   │   ├── BentoCard.tsx         # универсальная bento-плитка
│   │   └── Term.tsx              # ⭐ подсказка для сложных слов (glossary)
│   ├── visuals/
│   │   └── Abstract.tsx          # SVG-визуалы (кристалл, волна, бар-чарт)
│   ├── landing/                  # секции лендинга
│   │   ├── Navbar.tsx  Hero.tsx  Features.tsx  HowItWorks.tsx
│   │   └── Pricing.tsx  Referral.tsx  FAQ.tsx  Footer.tsx
│   ├── auth/AuthShell.tsx        # каркас + поле формы (Field)
│   └── dashboard/
│       ├── Sidebar.tsx           # навигация кабинета (из lib/dashboardNav)
│       ├── Topbar.tsx            # верхняя панель
│       ├── PageShell.tsx         # обёртка страницы + ComingSoon
│       └── ChatBox.tsx           # ⭐ UI AI-чата (сейчас mock-ответы)
│
├── lib/                          # данные и утилиты (единый источник правды)
│   ├── utils.ts                  # cn() — объединение классов
│   ├── glossary.ts               # ⭐ словарь сложных слов (для <Term/>)
│   ├── plans.ts                  # тарифы, TRIAL_DAYS=7, REFERRAL_PERCENT=20
│   ├── features.ts               # список фич (лендинг + меню)
│   └── dashboardNav.ts           # пункты меню кабинета
│
├── public/                       # статика
├── Dockerfile  docker-compose.yml
├── .env.example                  # все переменные окружения
└── README.md
```

⭐ — ключевые места, к которым возвращаемся чаще всего.

---

## 🎨 Дизайн-система (BENTO)

Определена в `tailwind.config.ts` + `app/globals.css`.

| Токен | Значение | Где |
|---|---|---|
| Фон | `#0B0B0C` (ink) | `bg-ink` |
| Поверхность | `#161618` | `.bento` |
| Акцент | `#C7F503` (неон-лайм) | `text-lime`, `bg-lime`, `.bento-lime` |
| Скругление | 28px | `rounded-bento` |
| Шрифты | Inter (текст), Space Grotesk (заголовки) | `font-sans`, `font-display` |

Готовые классы: `.bento`, `.bento-lime`, `.btn-primary`, `.btn-ghost`, `.chip`, `.term`, `.section`, `.bg-dots`.

---

## 🧩 Где что менять (быстрые ответы)

- **Добавить термин-объяснение** → `lib/glossary.ts`, использовать `<Term k="ключ">текст</Term>`.
- **Изменить тарифы/цены** → `lib/plans.ts`.
- **Добавить пункт меню кабинета** → `lib/dashboardNav.ts` + новый файл в `app/dashboard/...`.
- **Изменить фичи на лендинге** → `lib/features.ts`.
- **Поменять визуалы/иллюстрации** → `components/visuals/Abstract.tsx`.
- **Логика AI-чата** → `components/dashboard/ChatBox.tsx` (потом — `app/api/ai/chat`).

---

## 🗺️ ROADMAP (этапы сборки)

- [x] **Этап 1 — Дизайн и UI** (текущий): лендинг, auth, кабинет, дизайн-система, Docker.
- [ ] **Этап 2 — Auth + БД**: next-auth, Prisma, модели (User, Store, Subscription, Referral).
- [ ] **Этап 3 — WB API**: шифрование ключа, загрузка товаров/заказов/остатков/отзывов.
- [ ] **Этап 4 — AI + RAG**: OpenAI, загрузка справочника WB в pgvector, `/api/ai/chat`.
- [ ] **Этап 5 — Биллинг**: ЮKassa (приём + автопродление) + реферальные начисления/выплаты.
- [ ] **Этап 6 — Фичи на данных**: репрайсер, автоответы, аналитика, биддер, SEO.

---

## 🔌 Карта: фича → метод WB API (для этапа 3–6)

| Фича | WB API (группа) | Тип |
|---|---|---|
| Аналитика, воронка | Analytics / Statistics (`sales-funnel`, `search-report`) | чтение |
| Отзывы и вопросы | Feedbacks & Questions (`/feedbacks`, `/questions`, ответы) | чтение+запись |
| Умные цены | Prices & Discounts (учесть карантин цены ×3) | запись |
| Поставки/остатки | Statistics/Marketplace (`stocks-report`) | чтение |
| Реклама (биддер) | Promotion (кампании, ставки, кластеры) | чтение+запись |
| SEO карточек | Content (карточки) + Analytics (запросы) | чтение+запись |

Лимиты помним: цены — ~10 запросов/6 сек; у отзывов свои лимиты на аккаунт.

---

## 📄 Прочие файлы в корне репозитория

- `WB_сервисы_функции_матрица.docx` — матрица уникальных функций сервисов WB.
- `JVO_разбор_сервиса.docx` — разбор сервиса JVO (референс функционала).
- `build_docx.py`, `build_jvo_docx.py` — генераторы этих docx.
