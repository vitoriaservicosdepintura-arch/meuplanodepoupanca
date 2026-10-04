import { NextResponse } from "next/server";
import { checkCredentials, startSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let email = "";
  let password = "";
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    email = typeof body.email === "string" ? body.email : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    email = "";
    password = "";
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Informe o email e a senha." }, { status: 400 });
  }

  const ok = await checkCredentials(email, password);
  if (!ok) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({ error: "Email ou senha incorretos." }, { status: 401 });
  }

  await startSession();
  return NextResponse.json({ ok: true });
}
