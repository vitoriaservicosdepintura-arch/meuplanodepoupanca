import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { getState, saveSettings, saveWeek } from "@/lib/store";
import { round2, todayISO } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getState();
  return NextResponse.json({
    app: "Meu Plano de Poupança",
    exportedAt: new Date().toISOString(),
    settings: state.settings,
    weeks: state.weeks,
    transactions: state.transactions,
    summary: state.summary,
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    settings?: Record<string, unknown>;
    weeks?: Record<string, unknown>[];
    transactions?: Record<string, unknown>[];
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
  }

  if (body.settings) {
    const s = body.settings;
    await saveSettings({
      weeklyIncome: Number(s.weeklyIncome) || undefined,
      weeklyFoodBudget: Number(s.weeklyFoodBudget) || undefined,
      goal: Number(s.goal) || undefined,
      eurToBrlRate: Number(s.eurToBrlRate) || undefined,
      startDate: typeof s.startDate === "string" ? s.startDate : undefined,
      endDate: typeof s.endDate === "string" ? s.endDate : undefined,
    });
  }

  if (Array.isArray(body.weeks)) {
    for (const week of body.weeks) {
      const weekNumber = Number(week.weekNumber);
      if (!Number.isInteger(weekNumber)) continue;
      await saveWeek(weekNumber, {
        received: Number(week.received) || 0,
        food: Number(week.food) || 0,
        realSaved: Number(week.realSaved) || 0,
        confirmed: Boolean(week.confirmed),
        notes: typeof week.notes === "string" ? week.notes : "",
      });
    }
  }

  if (Array.isArray(body.transactions)) {
    await db.delete(transactions);
    for (const t of body.transactions) {
      await db.insert(transactions).values({
        date: typeof t.date === "string" ? t.date.slice(0, 10) : todayISO(),
        income: round2(Number(t.income) || 0),
        expense: round2(Number(t.expense) || 0),
        reason: typeof t.reason === "string" ? t.reason : "",
        notes: typeof t.notes === "string" ? t.notes : "",
      });
    }
  }

  return NextResponse.json(await getState());
}
