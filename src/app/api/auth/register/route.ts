import { NextResponse } from "next/server";
import { registerUser, startSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    let fullName = "";
    let email = "";
    let password = "";
    try {
        const body = (await request.json()) as { fullName?: unknown; email?: unknown; password?: unknown };
        fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
        email = typeof body.email === "string" ? body.email.trim() : "";
        password = typeof body.password === "string" ? body.password : "";
    } catch {
        /* ignore */
    }

    if (!fullName || !email || !password) {
        return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ error: "A senha precisa ter pelo menos 6 caracteres." }, { status: 400 });
    }

    const err = await registerUser(fullName, email, password);
    if (err) {
        return NextResponse.json({ error: err }, { status: 400 });
    }

    // Auto-login after registration
    await startSession();
    return NextResponse.json({ ok: true });
}
