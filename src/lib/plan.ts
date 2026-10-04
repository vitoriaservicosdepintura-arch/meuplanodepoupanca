export const TOTAL_WEEKS = 12;

export const DEFAULTS = {
  weeklyIncome: 560,
  weeklyFoodBudget: 50,
  goal: 6120,
  eurToBrlRate: 5.9,
  startDate: "2026-09-28",
  endDate: "2026-12-20",
};

export type WeekPeriod = { week: number; start: string; end: string };

/** Fixed periods from the plan (Mon -> Sun), 12 weeks. */
export const WEEK_PERIODS: WeekPeriod[] = [
  { week: 1, start: "2026-09-28", end: "2026-10-04" },
  { week: 2, start: "2026-10-05", end: "2026-10-11" },
  { week: 3, start: "2026-10-12", end: "2026-10-18" },
  { week: 4, start: "2026-10-19", end: "2026-10-25" },
  { week: 5, start: "2026-10-26", end: "2026-11-01" },
  { week: 6, start: "2026-11-02", end: "2026-11-08" },
  { week: 7, start: "2026-11-09", end: "2026-11-15" },
  { week: 8, start: "2026-11-16", end: "2026-11-22" },
  { week: 9, start: "2026-11-23", end: "2026-11-29" },
  { week: 10, start: "2026-11-30", end: "2026-12-06" },
  { week: 11, start: "2026-12-07", end: "2026-12-13" },
  { week: 12, start: "2026-12-14", end: "2026-12-20" },
];

export function buildPeriods(startDate: string, totalWeeks = TOTAL_WEEKS): WeekPeriod[] {
  const base = new Date(`${startDate}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) return WEEK_PERIODS;
  return Array.from({ length: totalWeeks }, (_, index) => {
    const start = new Date(base);
    start.setUTCDate(start.getUTCDate() + index * 7);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    return {
      week: index + 1,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentWeekNumber(periods: WeekPeriod[], today = todayISO()): number {
  if (periods.length === 0) return 1;
  for (const period of periods) {
    if (today >= period.start && today <= period.end) return period.week;
  }
  if (today < periods[0].start) return 1;
  return periods[periods.length - 1].week;
}

export const eur = (value: number) =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export function formatDateBR(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function formatRange(start: string, end: string): string {
  const [, sm, sd] = start.slice(0, 10).split("-");
  const [, em, ed] = end.slice(0, 10).split("-");
  return `${sd}/${sm} – ${ed}/${em}`;
}

export type WeekStatus = "not_started" | "in_progress" | "confirmed";

export const STATUS_LABEL: Record<WeekStatus, string> = {
  not_started: "⚪ Não iniciada",
  in_progress: "🟡 Em andamento",
  confirmed: "🟢 Confirmada",
};

export function weekStatus(week: {
  received: number;
  food: number;
  realSaved: number;
  confirmed: boolean;
  notes?: string;
}): WeekStatus {
  if (week.confirmed) return "confirmed";
  if (week.received !== 0 || week.food !== 0 || week.realSaved !== 0) {
    return "in_progress";
  }
  return "not_started";
}

export function round2(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
