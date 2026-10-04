import { NextResponse } from "next/server";
import { getState, saveSettings } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function positive(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function isoDate(value: unknown): string | undefined {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : undefined;
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  await saveSettings({
    weeklyIncome: positive(body.weeklyIncome),
    weeklyFoodBudget: positive(body.weeklyFoodBudget),
    goal: positive(body.goal),
    eurToBrlRate: positive(body.eurToBrlRate),
    startDate: isoDate(body.startDate),
    endDate: isoDate(body.endDate),
  });
  return NextResponse.json(await getState());
}
