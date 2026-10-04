import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/** Single-user credential store. Only one row is ever used (id = 1). */
export const appUser = pgTable("app_user", {
  id: integer("id").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Multi-user table with email + name + hashed password. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Plan configuration. Singleton row (id = 1). */
export const settings = pgTable("settings", {
  id: integer("id").primaryKey(),
  weeklyIncome: doublePrecision("weekly_income").notNull().default(560),
  weeklyFoodBudget: doublePrecision("weekly_food_budget").notNull().default(50),
  goal: doublePrecision("goal").notNull().default(6120),
  eurToBrlRate: doublePrecision("eur_to_brl_rate").notNull().default(5.9),
  startDate: date("start_date").notNull().default("2026-09-28"),
  endDate: date("end_date").notNull().default("2026-12-20"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** The 12 weekly records of the plan. */
export const weeks = pgTable("weeks", {
  id: serial("id").primaryKey(),
  weekNumber: integer("week_number").notNull().unique(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  received: doublePrecision("received").notNull().default(0),
  food: doublePrecision("food").notNull().default(0),
  realSaved: doublePrecision("real_saved").notNull().default(0),
  confirmed: boolean("confirmed").notNull().default(false),
  notes: text("notes").notNull().default(""),
  savedNovoBanco: doublePrecision("saved_novo_banco").notNull().default(0),
  savedWise: doublePrecision("saved_wise").notNull().default(0),
  savedBrl: doublePrecision("saved_brl").notNull().default(0),
  workedSaturday: boolean("worked_saturday").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Free-form movements (entradas / saídas) outside the weekly plan. */
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  income: doublePrecision("income").notNull().default(0),
  expense: doublePrecision("expense").notNull().default(0),
  reason: text("reason").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type WeekRow = typeof weeks.$inferSelect;
export type TransactionRow = typeof transactions.$inferSelect;
export type SettingsRow = typeof settings.$inferSelect;
