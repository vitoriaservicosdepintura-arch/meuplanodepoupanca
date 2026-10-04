import { buildPeriods, currentWeekNumber, round2 } from "@/lib/plan";
import type { Settings, Summary, Transaction, Week } from "@/lib/types";

/**
 * All derived numbers live here so the client and the server always agree.
 * IMPORTANT RULE: the accumulated balance uses `realSaved` only — never the
 * expected (previsto) value.
 */
export function computeSummary(
  settings: Settings,
  weeks: Week[],
  transactions: Transaction[] = [],
): Summary {
  const ordered = [...weeks].sort((a, b) => a.weekNumber - b.weekNumber);

  let running = 0;
  const cumulative = ordered.map((week) => {
    running = round2(running + week.realSaved);
    return { week: week.weekNumber, value: running };
  });

  const totalSaved = round2(running);
  const goal = settings.goal;
  // A week is "active" (counts in totals) once the user has touched it:
  // confirmed, has savings, OR any value differs from the plan defaults.
  const activeWeeks = ordered.filter(
    (w) =>
      w.confirmed ||
      w.realSaved > 0 ||
      w.food !== settings.weeklyFoodBudget ||
      w.received !== settings.weeklyIncome ||
      w.notes !== ""
  );

  const totalReceived = round2(activeWeeks.reduce((sum, w) => sum + w.received, 0));
  const totalFood = round2(activeWeeks.reduce((sum, w) => sum + w.food, 0));
  const totalExpectedSavings = round2(
    activeWeeks.reduce((sum, w) => sum + (w.received - w.food), 0)
  );
  const transactionsBalance = round2(
    transactions.reduce((sum, t) => sum + t.income - t.expense, 0),
  );

  const periods =
    ordered.length > 0
      ? ordered.map((w) => ({ week: w.weekNumber, start: w.startDate, end: w.endDate }))
      : buildPeriods(settings.startDate);

  return {
    totalSaved,
    brlValue: round2(totalSaved * settings.eurToBrlRate),
    goal,
    goalPercentage: goal > 0 ? round2((totalSaved / goal) * 100) : 0,
    remainingGoal: round2(Math.max(goal - totalSaved, 0)),
    currentWeek: currentWeekNumber(periods),
    totalReceived,
    totalFood,
    totalExpectedSavings,
    confirmedWeeks: ordered.filter((w) => w.confirmed).length,
    cumulative,
    transactionsBalance,
    totalNovoBanco: round2(ordered.reduce((sum, w) => sum + (w.savedNovoBanco ?? 0), 0)),
    totalWise: round2(ordered.reduce((sum, w) => sum + (w.savedWise ?? 0), 0)),
    totalBrl: round2(ordered.reduce((sum, w) => sum + (w.savedBrl ?? 0), 0)),
  };
}

export function runningBalances(transactions: Transaction[]): Map<number, number> {
  const ordered = [...transactions].sort((a, b) =>
    a.date === b.date ? a.id - b.id : a.date.localeCompare(b.date),
  );
  const map = new Map<number, number>();
  let balance = 0;
  for (const t of ordered) {
    balance = round2(balance + t.income - t.expense);
    map.set(t.id, balance);
  }
  return map;
}
