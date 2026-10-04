"use client";

import { useAppState } from "@/components/StateProvider";
import { brl, eur } from "@/lib/plan";

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="progress-track">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function RelatoriosPage() {
  const { state } = useAppState();
  const { summary, weeks, settings } = state;

  const maxSaved = Math.max(...weeks.map((w) => w.realSaved), 1);

  return (
    <div className="space-y-4 pb-4">
      <header className="pt-2">
        <p className="label">Análise completa</p>
        <h1 className="text-2xl font-black">Relatórios 📊</h1>
      </header>

      {/* KPIs principais */}
      <div className="card card-gold space-y-3">
        <p className="label">📈 Resumo do plano</p>
        {[
          { label: "Total recebido", val: eur(summary.totalReceived), icon: "💰" },
          { label: "Total guardado", val: eur(summary.totalSaved), icon: "🔒" },
          { label: "Valor em BRL", val: brl(summary.brlValue), icon: "🇧🇷" },
          { label: "Total alimentação", val: eur(summary.totalFood), icon: "🍽️" },
          { label: "Meta", val: eur(summary.goal), icon: "🎯" },
          { label: "Progresso", val: `${summary.goalPercentage.toFixed(1)}%`, icon: "📈" },
          { label: "Semanas confirmadas", val: `${summary.confirmedWeeks}/12`, icon: "✅" },
        ].map((kpi) => (
          <div key={kpi.label} className="flex items-center justify-between">
            <span className="text-sm text-[color:var(--color-text-muted)]">
              {kpi.icon} {kpi.label}
            </span>
            <span className="text-sm font-bold text-[color:var(--color-text-warm)]">{kpi.val}</span>
          </div>
        ))}
      </div>

      {/* Distribuição bancária */}
      <div className="card space-y-3">
        <p className="label">🏦 Por banco</p>
        {[
          { label: "Novo Banco (EUR)", val: eur(summary.totalNovoBanco), max: summary.totalSaved, color: "bg-blue-500" },
          { label: "Wise (EUR)", val: eur(summary.totalWise), max: summary.totalSaved, color: "bg-cyan-500" },
          { label: "Conta BRL", val: brl(summary.totalBrl), max: summary.totalBrl + 1, color: "bg-green-500" },
        ].map((b) => (
          <div key={b.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[color:var(--color-text-muted)]">{b.label}</span>
              <span className="font-semibold">{b.val}</span>
            </div>
            <Bar value={parseFloat(b.val.replace(/[^0-9,.]/g, "").replace(",", "."))} max={b.max} color={b.color} />
          </div>
        ))}
      </div>

      {/* Evolução semanal */}
      <div className="card space-y-3">
        <p className="label">📅 Guardado por semana</p>
        {weeks.map((w) => (
          <div key={w.weekNumber}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[color:var(--color-text-muted)]">
                Sem. {w.weekNumber} {w.confirmed ? "✅" : ""}
              </span>
              <span className={w.realSaved > 0 ? "font-semibold text-[color:var(--color-gold-400)]" : "text-[color:var(--color-text-muted)]"}>
                {eur(w.realSaved)}
              </span>
            </div>
            <Bar value={w.realSaved} max={maxSaved} color="bg-gradient-to-r from-amber-600 to-yellow-400" />
          </div>
        ))}
      </div>

      {/* Cotação */}
      <div className="card">
        <p className="label">💱 Câmbio configurado</p>
        <p className="mt-2 text-lg font-black text-[color:var(--color-gold-400)]">
          1 EUR = R$ {settings.eurToBrlRate.toFixed(2)}
        </p>
        <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
          {eur(summary.totalSaved)} = {brl(summary.brlValue)}
        </p>
      </div>
    </div>
  );
}
