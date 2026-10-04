import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { getState } from "@/lib/store";
import { round2, todayISO } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const date =
    typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
      ? body.date
      : todayISO();
  const income = Math.max(Number(body.income) || 0, 0);
  const expense = Math.max(Number(body.expense) || 0, 0);

  if (income === 0 && expense === 0) {
    return NextResponse.json(
      { error: "Informe um valor de entrada ou de saída." },
      { status: 400 },
    );
  }

  await db.insert(transactions).values({
    date,
    income: round2(income),
    expense: round2(expense),
    reason: typeof body.reason === "string" ? body.reason.slice(0, 160) : "",
    notes: typeof body.notes === "string" ? body.notes.slice(0, 500) : "",
  });

  return NextResponse.json(await getState());
}

export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }
  await db.delete(transactions).where(eq(transactions.id, id));
  return NextResponse.json(await getState());
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const income = Math.max(Number(body.income) || 0, 0);
  const expense = Math.max(Number(body.expense) || 0, 0);

  if (income === 0 && expense === 0) {
    return NextResponse.json(
      { error: "Informe um valor de entrada ou de saída." },
      { status: 400 },
    );
  }

  await db.update(transactions).set({
    date: typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : todayISO(),
    income: round2(income),
    expense: round2(expense),
    reason: typeof body.reason === "string" ? body.reason.slice(0, 160) : "",
    notes: typeof body.notes === "string" ? body.notes.slice(0, 500) : "",
  }).where(eq(transactions.id, id));

  return NextResponse.json(await getState());
}
