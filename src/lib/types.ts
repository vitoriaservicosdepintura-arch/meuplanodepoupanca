export type Settings = {
  weeklyIncome: number;
  weeklyFoodBudget: number;
  goal: number;
  eurToBrlRate: number;
  eurToBrlRateLive?: number; // fetched from API
  startDate: string;
  endDate: string;
};

export type Week = {
  weekNumber: number;
  startDate: string;
  endDate: string;
  received: number;
  food: number;
  realSaved: number;
  confirmed: boolean;
  notes: string;
  // Bank distribution (in EUR)
  savedNovoBanco: number;
  savedWise: number;
  savedBrl: number; // amount in BRL deposited to Brazilian account
  workedSaturday: boolean;
};

export type Transaction = {
  id: number;
  date: string;
  income: number;
  expense: number;
  reason: string;
  notes: string;
};

export type Summary = {
  totalSaved: number;
  brlValue: number;
  goal: number;
  goalPercentage: number;
  remainingGoal: number;
  currentWeek: number;
  totalReceived: number;
  totalFood: number;
  totalExpectedSavings: number;
  confirmedWeeks: number;
  cumulative: { week: number; value: number }[];
  transactionsBalance: number;
  totalNovoBanco: number;
  totalWise: number;
  totalBrl: number;
};

export type AppState = {
  settings: Settings;
  weeks: Week[];
  transactions: Transaction[];
  summary: Summary;
};

