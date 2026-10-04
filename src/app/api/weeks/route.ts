import { NextResponse } from "next/server";
import { getState, saveWeek } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function num(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : undefined;
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const weekNumber = Number(body.weekNumber);
  if (!Number.isInteger(weekNumber) || weekNumber < 1) {
    return NextResponse.json({ error: "Semana inválida." }, { status: 400 });
  }

  await saveWeek(weekNumber, {
    startDate: typeof body.startDate === "string" ? body.startDate : undefined,
    endDate: typeof body.endDate === "string" ? body.endDate : undefined,
    received: num(body.received),
    food: num(body.food),
    realSaved: num(body.realSaved),
    confirmed: typeof body.confirmed === "boolean" ? body.confirmed : undefined,
    notes: typeof body.notes === "string" ? body.notes.slice(0, 500) : undefined,
    savedNovoBanco: num(body.savedNovoBanco),
    savedWise: num(body.savedWise),
    savedBrl: num(body.savedBrl),
    workedSaturday: typeof body.workedSaturday === "boolean" ? body.workedSaturday : undefined,
  });

  return NextResponse.json(await getState());
}
