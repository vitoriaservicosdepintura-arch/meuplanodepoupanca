"use client";

import { useState, useEffect } from "react";
import { useAppState } from "@/components/StateProvider";
import WeekEditor from "@/components/WeekEditor";
import { brl, eur, formatRange, round2, weekStatus } from "@/lib/plan";

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

function GoalEmoji(pct: number) {
  if (pct >= 100) return "🏆";
  if (pct >= 90) return "🔥";
  if (pct >= 50) return "📈";
  return "🎯";
}

export default function HomePage() {
  const { state } = useAppState();
  const { summary, weeks, settings } = state;
  const [editing, setEditing] = useState<number | null>(null);
  const [liveRate, setLiveRate] = useState<number | null>(null);

  const current =
    weeks.find((w) => w.weekNumber === summary.currentWeek) ?? weeks[0];
  const editingWeek = weeks.find((w) => w.weekNumber === editing) ?? null;

  // Fetch live EUR/BRL rate from AwesomeAPI
  useEffect(() => {
    fetch("https://economia.awesomeapi.com.br/last/EUR-BRL")
      .then((r) => r.json())
      .then((data) => {
        const rate = parseFloat(data?.EURBRL?.bid ?? "0");
        if (rate > 0) setLiveRate(rate);
      })
      .catch(() => null);
  }, []);

  const effectiveRate = liveRate ?? settings.eurToBrlRate;
  const liveBrl = round2(summary.totalSaved * effectiveRate);

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <p className="label">Meu Plano Financeiro</p>
          <h1 className="text-2xl font-black tracking-tight">
            Olá! <span className="text-[color:var(--color-gold-400)]">👋</span>
          </h1>
        </div>
        <span className="chip">Sem. {summary.currentWeek}/12</span>
      </header>

      {/* Hero Card — Total Guardado */}
      <section className="card card-gold pulse-gold relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-20 text-6xl">🏦</div>
        <p className="label">Total guardado</p>
        <p className="mt-1 text-[2.8rem] font-black leading-none tracking-tight text-[color:var(--color-gold-300)]">
          {eur(summary.totalSaved)}
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-green-400">
          ≈ {brl(liveBrl)}
          {liveRate ? (
            <span className="text-xs font-normal text-[color:var(--color-text-muted)]">
              Câmbio ao vivo: R$ {liveRate.toFixed(4)}
            </span>
          ) : null}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs text-[color:var(--color-text-muted)]">
            <span>{GoalEmoji(summary.goalPercentage)} {summary.goalPercentage.toFixed(1)}% da meta</span>
            <span>{eur(summary.goal)}</span>
          </div>
          <ProgressBar pct={summary.goalPercentage} />
          <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
            Faltam{" "}
            <strong className="text-[color:var(--color-text-warm)]">
              {eur(summary.remainingGoal)}
            </strong>{" "}
            para a meta
          </p>
        </div>
      </section>

      {/* Bancos */}
      <section className="grid grid-cols-3 gap-2">
        <div className="card p-3 text-center">
          <p className="label text-[9px] mb-1">Novo Banco</p>
          <div className="text-2xl mb-1">🏦</div>
          <p className="text-sm font-bold text-blue-300">{eur(summary.totalNovoBanco)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="label text-[9px] mb-1">Wise</p>
          <div className="text-2xl mb-1">💳</div>
          <p className="text-sm font-bold text-cyan-300">{eur(summary.totalWise)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="label text-[9px] mb-1">Conta BRL</p>
          <div className="text-2xl mb-1">🇧🇷</div>
          <p className="text-sm font-bold text-green-300">{brl(summary.totalBrl)}</p>
        </div>
      </section>

      {/* Cards de resumo */}
      <section className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="label">💰 Recebido</p>
          <p className="mt-1 text-lg font-bold">{eur(summary.totalReceived)}</p>
        </div>
        <div className="card p-4">
          <p className="label">🍽️ Alimentação</p>
          <p className="mt-1 text-lg font-bold text-amber-400">{eur(summary.totalFood)}</p>
        </div>
        <div className="card p-4">
          <p className="label">✅ Confirmadas</p>
          <p className="mt-1 text-lg font-bold text-[color:var(--color-gold-400)]">
            {summary.confirmedWeeks}/12
          </p>
        </div>
        <div className="card p-4">
          <p className="label">💸 Previsto</p>
          <p className="mt-1 text-lg font-bold">{eur(summary.totalExpectedSavings)}</p>
        </div>
      </section>

      {/* Semana Atual */}
      {current ? (
        <section className={`card ${current.weekNumber === summary.currentWeek
            ? "border-[color:var(--color-gold-400)]/35 ring-1 ring-[color:var(--color-gold-400)]/15"
            : ""
          }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="label">Semana atual</p>
              <p className="text-lg font-bold">
                Semana {current.weekNumber}
                <span className="ml-2 text-xs font-medium text-[color:var(--color-text-muted)]">
                  {formatRange(current.startDate, current.endDate)}
                </span>
              </p>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Recebido", value: eur(current.received), color: "" },
              { label: "Alimentação", value: eur(current.food), color: "text-amber-400" },
              { label: "Previsto guardar", value: eur(round2(current.received - current.food)), color: "" },
              { label: "Guardado real", value: eur(current.realSaved), color: "text-[color:var(--color-gold-400)]" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="label">{item.label}</dt>
                <dd className={`font-bold ${item.color}`}>{item.value}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={() => setEditing(current.weekNumber)}
            className="btn-primary mt-4"
          >
            ✏️ REGISTRAR SEMANA
          </button>
        </section>
      ) : null}

      {editingWeek ? (
        <WeekEditor week={editingWeek} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}
