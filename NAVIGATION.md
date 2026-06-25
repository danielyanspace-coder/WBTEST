# 🧭 NAVIGATION — карта проекта SELLIX

> Этот файл — «карта местности». Сюда смотрим в первую очередь, чтобы не искать
> по всему репозиторию. Обновляем при добавлении новых модулей.

**Продукт:** SELLIX — AI-платформа для продавцов Wildberries.
**Стек:** Next.js 14 (App Router) + TypeScript + TailwindCSS. БД: PostgreSQL + Drizzle ORM. Авторизация: своя на JWT (jose) + bcrypt. AI: OpenAI + RAG. Оплата: mock → ЮKassa.
**Приложение лежит в:** `sellix/`
**Ветка разработки:** `claude/wb-analytics-crm-features-dvm4p3`

> Примечание по ORM: выбран **Drizzle** (чистый JS, без бинарных движков) —
> надёжно ставится и собирается. Иконки — **собственный набор** `components/ui/icons.tsx`
> (системных эмодзи в проекте нет).

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
│   ├── dashboardNav.ts           # пункты меню кабинета
│   ├── crypto.ts                 # ⭐ AES-256-GCM шифрование ключей WB API
│   ├── db/
│   │   ├── schema.ts             # ⭐ СХЕМА БД (users, stores, subscriptions, payments, referral_earnings)
│   │   └── index.ts              # Drizzle-клиент (pg Pool)
│   └── auth/
│       ├── jwt.ts                # ⭐ подпись/проверка JWT (edge-safe, для middleware)
│       ├── session.ts            # cookie-сессия + getCurrentUser() (Node)
│       ├── password.ts           # bcrypt hash/verify
│       └── referral.ts           # генерация кода SELLIX-XXXX
│
├── app/actions/                  # ⭐ серверные действия (Server Actions)
│   ├── auth.ts                   # registerAction / loginAction / logoutAction
│   └── store.ts                  # connectStoreAction (подключение WB, шифрует ключ)
├── app/r/[code]/route.ts         # реферальная ссылка → /register?ref=CODE
├── middleware.ts                 # ⭐ защита /dashboard, редиректы auth-страниц
├── components/auth/AuthForms.tsx # клиентские формы входа/регистрации (useFormState)
├── components/dashboard/ConnectForm.tsx # форма подключения WB
│
├── drizzle/                      # сгенерированные SQL-миграции (drizzle-kit generate)
├── drizzle.config.ts             # конфиг миграций
├── public/                       # статика (preview.html — превью лендинга)
├── Dockerfile  docker-compose.yml
├── .env.example                  # все переменные окружения
└── README.md
```

### 🗄️ База данных и команды

```bash
npm run db:generate   # сгенерировать SQL-миграции из schema.ts
npm run db:migrate    # применить миграции к БД (нужен DATABASE_URL)
npm run db:push       # быстро синхронизировать схему (для разработки)
npm run db:studio     # визуальный просмотр БД
```

Таблицы: `users` (+реф.код, пробный период), `stores` (зашифрованный ключ WB),
`subscriptions` (план/статус/период), `payments`, `referral_earnings` (20%).

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

- [x] **Этап 1 — Дизайн и UI**: лендинг, auth, кабинет, дизайн-система, Docker.
- [x] **Этап 1.5 — Иконки**: собственный SVG-набор вместо эмодзи/lucide.
- [x] **Этап 2 — Auth + БД**: Drizzle + PostgreSQL, своя JWT-авторизация, модели
      (User, Store, Subscription, Payment, ReferralEarning), middleware, регистрация
      с пробным периодом и привязкой реферала, подключение WB (шифрование ключа).
- [x] **Этап 3 — WB API**: клиент `lib/wb/client.ts`, синхронизация `lib/wb/sync.ts`
      (товары, остатки, продажи, отзывы), подключение с проверкой ключа.
- [x] **Этап 4 — AI + RAG**: `lib/ai/*` (OpenAI, RAG по справочнику, ответы на отзывы),
      `/api/ai/chat`, загрузка справочника `/api/admin/ingest` + `lib/ai/handbookData.ts`.
- [x] **Этап 5 — Биллинг**: `lib/billing/*` (ЮKassa + mock), `/api/billing/webhook`,
      активация подписки и реферальные начисления 20%.
- [x] **Этап 6 — Фичи на данных**: аналитика, отзывы (AI-ответ + отправка в WB),
      умные цены, поставки, рефералы — на реальных данных с демо-фолбэком.

- [x] **Этап 7 — Биддер рекламы**: `lib/ads/bidder.ts`, синхронизация кампаний,
      рекомендация и автоприменение ставок по целевому ДРР (`app/actions/ads.ts`).
- [x] **Этап 8 — SEO-генерация**: `lib/ai/seo.ts`, генерация заголовка/описания/ключей
      и применение к карточке WB (`app/actions/seo.ts`, `/dashboard/seo`).
- [x] **Этап 9 — Аналитика ниш (парсинг)**: `lib/niche/wbPublic.ts`, `/api/niche`,
      `/dashboard/niches` — по публичному каталогу WB, с пометкой об оценочности.

- [x] **Этап 10 — Адаптивные движки**: репрайсер 2.0 (`lib/pricing/engine.ts`) и
      биддер 2.0 с защитой бюджета/kill-switch (`lib/ads/engine.ts`) на прогнозе
      спроса (`lib/ml/forecast.ts`); история цен для обучения (`price_events`).
- [x] **Этап 11 — Telegram-уведомления**: `lib/notify/*`, привязка бота,
      правила (остатки/бюджет/отзывы/триал), `/api/telegram/webhook`.
- [x] **Этап 12 — Автоматизация**: `/api/cron/tick` — автосинхронизация WB +
      автобиддер + прогон уведомлений (ставится в cron по CRON_SECRET).

- [x] **Этап 13 — Индекс здоровья + проактивность**: `lib/health/score.ts`
      (оценка 0–100 по складу/ценам/рекламе/отзывам/контенту + приоритеты по деньгам),
      выведен в «Обзор»; адаптивная петля репрайсера замкнута (эластичность из
      `price_events`); детектор обвала продаж и еженедельный дайджест в Telegram;
      переброс рекламного бюджета (`budgetAdvice`); healthcheck `/api/health`.

- [x] **Этап 14 — Свой датасет без покупок**: ежедневные снимки рынка
      (`market_snapshots`): source='own' — реальные данные магазина, source='public' —
      бесплатный публичный API WB (`card.wb.ru`). Отслеживание товаров
      (`watch_items`) + оценка продаж методом разницы остатков (`lib/market/*`).
      Сбор идёт в cron и при синхронизации — история копится сама, бесплатно.

- [x] **Этап 15 — Позиции и графики**: отслеживание позиций по ключевым запросам
      (бесплатно из поиска WB) — `lib/market/position.ts`, `keyword_tracks`/`keyword_positions`,
      виджет в SEO; мини-графики (`Sparkline`) истории цены/остатков/продаж и позиций.

> Что осталось «дорастить» позже: выплаты рефералам через ЮKassa Payouts
> (сейчас помечаются вручную); со временем — расширение охвата собственного
> датасета (больше отслеживаемых артикулов = точнее ниша-аналитика).

### 🗃️ Накопление данных без покупок (этап 14)

```
lib/market/public.ts   # бесплатный снимок артикула из card.wb.ru (цена/остаток/рейтинг)
lib/market/estimate.ts # оценка продаж по разнице остатков
lib/market/collect.ts  # снимки своих товаров (own) + отслеживаемых (public)
app/actions/watch.ts   # добавить/убрать отслеживание + список с оценкой
```
Снимки: при каждой синхронизации (свои данные) и в `/api/cron/tick` (отслеживаемые).

### 🩺 Проактивный слой (этап 13)

```
lib/health/score.ts    # индекс здоровья магазина + приоритезированные действия
lib/ml/forecast.ts     # + anomalyDrop (детектор обвала продаж)
lib/notify/engine.ts   # + аномалия продаж + sendWeeklyDigest (дайджест в TG)
lib/ads/engine.ts      # + budgetAdvice (переброс бюджета между кампаниями)
app/api/health         # состояние БД и подключённых интеграций
```

### 🧠 Движки и автоматизация (этапы 10–12)

```
lib/ml/forecast.ts     # скорость, тренд, запас хода, эластичность, уверенность
lib/pricing/engine.ts  # репрайсер 2.0: мультисигнал + предохранители маржи
lib/ads/engine.ts      # биддер 2.0: ПИД-управление + защита бюджета (kill-switch)
lib/notify/telegram.ts # отправка в Telegram
lib/notify/engine.ts   # правила уведомлений + дедуп + рассылка
app/api/telegram/webhook # привязка чата (/start КОД)
app/api/cron/tick      # cron: синхронизация + автобиддер + уведомления
app/actions/pricing.ts # применение цены в WB + запись price_events
app/actions/telegram.ts# привязка/отвязка Telegram + тумблеры уведомлений
```

### 🔌 Бэкенд-модули (этапы 3–6)

```
lib/wb/client.ts      # вызовы WB API (товары, цены, остатки, продажи, отзывы)
lib/wb/store.ts       # токен магазина (расшифровка) + готовый клиент
lib/wb/sync.ts        # загрузка данных WB → БД
lib/ai/openai.ts      # OpenAI (chat + embeddings)
lib/ai/rag.ts         # поиск по справочнику + ответ со ссылками
lib/ai/reply.ts       # генерация ответа на отзыв (голос бренда)
lib/ai/handbookData.ts# стартовый справочник WB
lib/ai/seo.ts         # генерация SEO карточки
lib/ads/bidder.ts     # логика рекомендации ставок (ДРР)
lib/niche/wbPublic.ts # парсинг публичного каталога WB + агрегаты ниши
lib/billing/service.ts# подписки + реферальные начисления
lib/billing/yookassa.ts # клиент ЮKassa
lib/data/dashboard.ts # агрегаты для страниц кабинета (вкл. рекламу)
app/actions/*         # auth, store (WB), reviews, billing, referral, ads, seo
app/api/ai/chat       # чат RAG
app/api/admin/ingest  # загрузка справочника в RAG (x-admin-secret)
app/api/billing/webhook # приём событий ЮKassa
app/api/niche         # анализ ниши по публичному каталогу WB
```

> Реклама и SEO используют тот же WB-токен продавца (доп. ключи не нужны).
> Аналитика ниш работает на публичном API WB — токен не требуется.

📦 **Деплой и ключи:** см. `/SETUP_REQUIRED.md` (что прислать) и `/sellix/.env.example`.
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
