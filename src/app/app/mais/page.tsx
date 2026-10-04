"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { playChime, playSuccess } from "@/lib/sounds";

const TOOLS = [
  { emoji: "🧮", label: "Calculadora", desc: "Salário, poupança e diária", href: "/app/mais/calculadora" },
  { emoji: "💱", label: "Conversor EUR/BRL", desc: "Cotação ao vivo", href: "/app/mais/conversor" },
  { emoji: "🧾", label: "Recibos", desc: "Gerar e exportar PDF", href: "/app/mais/recibos" },
  { emoji: "⚙️", label: "Configurações", desc: "Metas, datas e taxas", href: "/app/mais/config" },
  { emoji: "🔔", label: "Notificações", desc: "Lembretes e alertas", href: "/app/mais/notificacoes" },
  { emoji: "💾", label: "Backup", desc: "Exportar e restaurar dados", href: "/app/mais/backup" },
];

export default function MaisPage() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    setLeaving(true);
    playChime();
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  function go(href: string) {
    playChime();
    router.push(href);
  }

  return (
    <div className="space-y-4 pb-4">
      <header className="pt-2">
        <p className="label">Ferramentas e opções</p>
        <h1 className="text-2xl font-black">Mais ⚡</h1>
      </header>

      <div className="space-y-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.label}
            onClick={() => go(tool.href)}
            className="card w-full flex items-center gap-4 p-4 text-left active:scale-[0.99] transition-transform"
          >
            <span className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10">
              {tool.emoji}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-[color:var(--color-text-warm)]">{tool.label}</p>
              <p className="text-xs text-[color:var(--color-text-muted)]">{tool.desc}</p>
            </div>
            <svg className="w-4 h-4 text-[color:var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Notificações */}
      <section className="card">
        <p className="label mb-3">🔔 Lembretes activos</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">1 dia antes do pagamento</p>
            <p className="text-xs text-[color:var(--color-text-muted)]">Todos os domingos às 18:00</p>
          </div>
          <div className="h-5 w-10 rounded-full bg-[color:var(--color-gold-500)] relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
          </div>
        </div>
      </section>

      {/* Sair */}
      <button
        type="button"
        onClick={logout}
        disabled={leaving}
        className="btn-ghost"
      >
        {leaving ? "A sair…" : "🚪 Sair da conta"}
      </button>

      <p className="text-center text-[10px] text-[color:var(--color-text-muted)] pb-2">
        Aplicativo privado · dados protegidos · v2.0
      </p>
    </div>
  );
}
