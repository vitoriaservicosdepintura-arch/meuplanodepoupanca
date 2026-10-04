import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { settings as settingsTable, transactions, weeks } from "@/db/schema";
import { computeSummary } from "@/lib/compute";
import { DEFAULTS, TOTAL_WEEKS, WEEK_PERIODS, buildPeriods, round2 } from "@/lib/plan";
import type { AppState, Settings, Transaction, Week } from "@/lib/types";

export async function getSettings(): Promise<Settings> {
  const rows = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.id, 1))
    .limit(1);
  if (rows.length === 0) {
    await db
      .insert(settingsTable)
      .values({
        id: 1,
        weeklyIncome: DEFAULTS.weeklyIncome,
        weeklyFoodBudget: DEFAULTS.weeklyFoodBudget,
        goal: DEFAULTS.goal,
        eurToBrlRate: DEFAULTS.eurToBrlRate,
        startDate: DEFAULTS.startDate,
        endDate: DEFAULTS.endDate,
      })
      .onConflictDoNothing();
    return { ...DEFAULTS };
  }
  const row = rows[0];
  return {
    weeklyIncome: row.weeklyIncome,
    weeklyFoodBudget: row.weeklyFoodBudget,
    goal: row.goal,
    eurToBrlRate: row.eurToBrlRate,
    startDate: String(row.startDate).slice(0, 10),
    endDate: String(row.endDate).slice(0, 10),
  };
}

export async function ensureWeeksSeeded(settings: Settings): Promise<void> {
  const existing = await db.select().from(weeks);
  if (existing.length >= TOTAL_WEEKS) return;
  const periods =
    settings.startDate === DEFAULTS.startDate
      ? WEEK_PERIODS
      : buildPeriods(settings.startDate);
  const have = new Set(existing.map((w) => w.weekNumber));
  const missing = periods.filter((p) => !have.has(p.week));
  if (missing.length === 0) return;
  await db
    .insert(weeks)
    .values(
      missing.map((period) => ({
        weekNumber: period.week,
        startDate: period.start,
        endDate: period.end,
        received: settings.weeklyIncome,
        food: settings.weeklyFoodBudget,
        realSaved: 0,
        confirmed: false,
        notes: "",
      })),
    )
    .onConflictDoNothing();
}

export async function getWeeks(): Promise<Week[]> {
  const rows = await db.select().from(weeks).orderBy(asc(weeks.weekNumber));
  return rows.map((row) => ({
    weekNumber: row.weekNumber,
    startDate: String(row.startDate).slice(0, 10),
    endDate: String(row.endDate).slice(0, 10),
    received: round2(row.received),
    food: round2(row.food),
    realSaved: round2(row.realSaved),
    confirmed: row.confirmed,
    notes: row.notes ?? "",
    savedNovoBanco: row.savedNovoBanco ?? 0,
    savedWise: row.savedWise ?? 0,
    savedBrl: row.savedBrl ?? 0,
    workedSaturday: row.workedSaturday ?? false,
  }));
}

export async function getTransactions(): Promise<Transaction[]> {
  const rows = await db
    .select()
    .from(transactions)
    .orderBy(asc(transactions.date), asc(transactions.id));
  return rows.map((row) => ({
    id: row.id,
    date: String(row.date).slice(0, 10),
    income: round2(row.income),
    expense: round2(row.expense),
    reason: row.reason ?? "",
    notes: row.notes ?? "",
  }));
}

export async function getState(): Promise<AppState> {
  try {
    const settings = await getSettings();
    await ensureWeeksSeeded(settings);
    const [weekRows, transactionRows] = await Promise.all([
      getWeeks(),
      getTransactions(),
    ]);
    return {
      settings,
      weeks: weekRows,
      transactions: transactionRows,
      summary: computeSummary(settings, weekRows, transactionRows),
    };
  } catch (error) {
    console.warn("DB offline, falling back to mock state for getState", error);
    const settings = { ...DEFAULTS };
    const periods = buildPeriods(settings.startDate);
    const weekRows: Week[] = periods.map((period) => ({
      weekNumber: period.week,
      startDate: period.start,
      endDate: period.end,
      received: settings.weeklyIncome,
      food: settings.weeklyFoodBudget,
      realSaved: 0,
      confirmed: false,
      notes: "",
      savedNovoBanco: 0,
      savedWise: 0,
      savedBrl: 0,
      workedSaturday: false,
    }));
    return {
      settings,
      weeks: weekRows,
      transactions: [],
      summary: computeSummary(settings, weekRows, []),
    };
  }
}

export async function saveWeek(
  weekNumber: number,
  patch: Partial<Pick<Week, "received" | "food" | "realSaved" | "confirmed" | "notes" | "savedNovoBanco" | "savedWise" | "savedBrl" | "workedSaturday">>,
): Promise<void> {
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.received !== undefined) update.received = round2(patch.received);
  if (patch.food !== undefined) update.food = round2(patch.food);
  if (patch.realSaved !== undefined) update.realSaved = round2(patch.realSaved);
  if (patch.confirmed !== undefined) update.confirmed = patch.confirmed;
  if (patch.notes !== undefined) update.notes = patch.notes;
  if (patch.savedNovoBanco !== undefined) update.savedNovoBanco = round2(patch.savedNovoBanco);
  if (patch.savedWise !== undefined) update.savedWise = round2(patch.savedWise);
  if (patch.savedBrl !== undefined) update.savedBrl = round2(patch.savedBrl);
  if (patch.workedSaturday !== undefined) update.workedSaturday = patch.workedSaturday;
  await db.update(weeks).set(update).where(eq(weeks.weekNumber, weekNumber));
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next: Settings = { ...current, ...patch };
  await db
    .update(settingsTable)
    .set({
      weeklyIncome: next.weeklyIncome,
      weeklyFoodBudget: next.weeklyFoodBudget,
      goal: next.goal,
      eurToBrlRate: next.eurToBrlRate,
      startDate: next.startDate,
      endDate: next.endDate,
      updatedAt: new Date(),
    })
    .where(eq(settingsTable.id, 1));

  // Re-align week periods when the start date changes.
  if (patch.startDate && patch.startDate !== current.startDate) {
    const periods = buildPeriods(next.startDate);
    for (const period of periods) {
      await db
        .update(weeks)
        .set({ startDate: period.start, endDate: period.end })
        .where(eq(weeks.weekNumber, period.week));
    }
  }
  return next;
}
