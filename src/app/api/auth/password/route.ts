import { NextResponse } from "next/server";
import { checkCredentials, hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: unknown;
    currentPassword?: unknown;
    newPassword?: unknown;
  };
  const email = typeof body.email === "string" ? body.email : "";
  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "A nova senha deve ter pelo menos 6 caracteres." },
      { status: 400 },
    );
  }

  const ok = await checkCredentials(email, currentPassword);
  if (!ok) {
    return NextResponse.json({ error: "Email ou senha actual incorretos." }, { status: 401 });
  }

  const newHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.email, email.trim().toLowerCase()));

  return NextResponse.json({ ok: true });
}
