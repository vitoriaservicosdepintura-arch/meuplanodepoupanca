"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setSuccess(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "login") {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) {
          setError(data.error ?? "Não foi possível entrar.");
          setLoading(false);
          return;
        }
        router.replace("/app");
        router.refresh();
      } else {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, password }),
        });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) {
          setError(data.error ?? "Não foi possível criar a conta.");
          setLoading(false);
          return;
        }
        router.replace("/app");
        router.refresh();
      }
    } catch {
      setError("Sem conexão com o servidor.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${mode === "login"
              ? "bg-[color:var(--color-gold-400)] text-black shadow"
              : "text-[color:var(--color-text-muted)]"
            }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => switchMode("register")}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${mode === "register"
              ? "bg-[color:var(--color-gold-400)] text-black shadow"
              : "text-[color:var(--color-text-muted)]"
            }`}
        >
          Cadastrar
        </button>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4">
        {/* Nome (só no cadastro) */}
        {mode === "register" && (
          <div>
            <label className="label" htmlFor="fullName">Nome Completo</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Vitória da Silva"
              className="field mt-2"
              required
            />
          </div>
        )}

        {/* Email */}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            className="field mt-2"
            required
          />
        </div>

        {/* Senha */}
        <div>
          <label className="label" htmlFor="password">Senha</label>
          <div className="relative mt-2">
            <input
              id="password"
              name="password"
              type={showPwd ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="field pr-16"
              required
              minLength={mode === "register" ? 6 : 1}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400"
            >
              {showPwd ? "Ocultar" : "Ver"}
            </button>
          </div>
          {mode === "register" && (
            <p className="mt-1 text-[11px] text-[color:var(--color-text-muted)]">Mínimo 6 caracteres</p>
          )}
        </div>

        {error && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-200">
            {success}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading
            ? mode === "login" ? "Entrando…" : "Criando conta…"
            : mode === "login" ? "✨ ENTRAR" : "🚀 CRIAR CONTA"}
        </button>
      </form>
    </div>
  );
}
