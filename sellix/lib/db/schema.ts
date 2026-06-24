/**
 * Схема базы данных SELLIX (Drizzle ORM, PostgreSQL).
 * Здесь — единый источник правды по таблицам. Миграции генерируются из неё:
 *   npx drizzle-kit generate   (создаёт SQL в ./drizzle)
 *   npx drizzle-kit migrate    (применяет к БД)
 */
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  real,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Перечисления ───────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);
export const storeStatusEnum = pgEnum("store_status", [
  "CONNECTED",
  "DISCONNECTED",
  "ERROR",
]);
export const planEnum = pgEnum("plan", ["NONE", "START", "PRO", "BUSINESS"]);
export const subStatusEnum = pgEnum("sub_status", [
  "TRIALING",
  "ACTIVE",
  "CANCELED",
  "PAST_DUE",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "SUCCEEDED",
  "FAILED",
]);
export const paymentProviderEnum = pgEnum("payment_provider", [
  "MOCK",
  "YOOKASSA",
]);
export const earningStatusEnum = pgEnum("earning_status", [
  "PENDING",
  "AVAILABLE",
  "PAID",
]);

// ─── Пользователи ───────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("USER"),
  // Реферальная программа
  referralCode: text("referral_code").notNull().unique(),
  referredById: uuid("referred_by_id"), // кто пригласил (логическая ссылка на users.id)
  // Пробный период
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Магазины (подключение WB API) ──────────────────────────────
export const stores = pgTable("stores", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Мой магазин"),
  marketplace: text("marketplace").notNull().default("WB"),
  // Ключ WB API хранится зашифрованным (AES-256-GCM): шифртекст + iv + тег
  keyCipher: text("key_cipher"),
  keyIv: text("key_iv"),
  keyTag: text("key_tag"),
  status: storeStatusEnum("status").notNull().default("DISCONNECTED"),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Подписки ───────────────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  plan: planEnum("plan").notNull().default("NONE"),
  status: subStatusEnum("status").notNull().default("TRIALING"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Платежи ────────────────────────────────────────────────────
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // в копейках
  currency: text("currency").notNull().default("RUB"),
  plan: planEnum("plan").notNull(),
  status: paymentStatusEnum("status").notNull().default("PENDING"),
  provider: paymentProviderEnum("provider").notNull().default("MOCK"),
  externalId: text("external_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Реферальные начисления (20% с оплат) ───────────────────────
export const referralEarnings = pgTable("referral_earnings", {
  id: uuid("id").defaultRandom().primaryKey(),
  referrerId: uuid("referrer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredUserId: uuid("referred_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(), // в копейках
  percent: integer("percent").notNull().default(20),
  status: earningStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Данные магазина (загружаются из WB API, этап 3) ────────────
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  nmId: integer("nm_id").notNull(), // артикул WB
  title: text("title"),
  brand: text("brand"),
  category: text("category"),
  priceCurrent: integer("price_current"), // рубли
  discount: integer("discount"),
  rating: real("rating"),
  minProfitPrice: integer("min_profit_price"), // минимально допустимая цена (для репрайсера)
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const stocks = pgTable("stocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  nmId: integer("nm_id").notNull(),
  warehouse: text("warehouse"),
  quantity: integer("quantity").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const salesDaily = pgTable("sales_daily", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  orders: integer("orders").notNull().default(0),
  buyouts: integer("buyouts").notNull().default(0),
  revenue: integer("revenue").notNull().default(0), // рубли
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const feedbacks = pgTable("feedbacks", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  wbId: text("wb_id").notNull(), // id отзыва в WB
  nmId: integer("nm_id"),
  productName: text("product_name"),
  authorName: text("author_name"),
  rating: integer("rating"),
  text: text("text"),
  answered: boolean("answered").notNull().default(false),
  answerText: text("answer_text"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  syncedAt: timestamp("synced_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Справочник WB для AI-чата (RAG, этап 4) ─────────────────────
// embedding хранится как массив чисел (jsonb) — косинусная близость считается в Node,
// поэтому pgvector не требуется и БД остаётся обычным PostgreSQL.
export const handbookDocs = pgTable("handbook_docs", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: text("source").notNull().default("WB"),
  title: text("title").notNull(),
  url: text("url"),
  content: text("content").notNull(),
  embedding: jsonb("embedding").$type<number[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Реклама (биддер) ───────────────────────────────────────────
export const adCampaigns = pgTable("ad_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  advertId: integer("advert_id").notNull(),
  name: text("name"),
  type: integer("type"),
  status: integer("status"),
  cpm: integer("cpm"), // текущая ставка
  views: integer("views").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  orders: integer("orders").notNull().default(0),
  spend: integer("spend").notNull().default(0), // рубли
  revenue: integer("revenue").notNull().default(0), // рубли
  drr: real("drr"), // доля рекламных расходов, %
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const adSettings = pgTable("ad_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id").notNull().unique().references(() => stores.id, { onDelete: "cascade" }),
  targetDrr: integer("target_drr").notNull().default(10), // целевой ДРР, %
  maxCpm: integer("max_cpm").notNull().default(500),
  minCpm: integer("min_cpm").notNull().default(100),
  auto: boolean("auto").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Feedback = typeof feedbacks.$inferSelect;
export type HandbookDoc = typeof handbookDocs.$inferSelect;
export type AdCampaign = typeof adCampaigns.$inferSelect;
export type AdSettings = typeof adSettings.$inferSelect;
