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

export type User = typeof users.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
