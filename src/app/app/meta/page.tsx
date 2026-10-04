"use client";

import ProgressBar from "@/components/ProgressBar";
import SavingsChart from "@/components/SavingsChart";
import { useAppState } from "@/components/StateProvider";
import { brl, eur, formatDateBR, round2 } from "@/lib/plan";

export default function GoalPage() {
  const { state } = useAppState();
  const { summary, settings, weeks } = state;

  const weeksLeft = Math.max(12 - summary.currentWeek + 1, 0);
  const neededPerWeek =
    weeksLeft > 0 ? round2(summary.remainingGoal / weeksLeft) : summary.remainingGoal;

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">Minha Meta</h1>
        <p className="text-sm text-slate-400">
          {formatDateBR(settings.startDate)} até {formatDateBR(settings.endDate)}
        </p>
      </header>

      <section className="card text-center">
        <p className="label">Meta total</p>
        <p className="mt-1 text-4xl font-extrabold">{eur(summary.goal)}</p>
        <p className="mt-1 text-xs text-slate-400">
          ≈ {brl(round2(summary.goal * settings.eurToBrlRate))}
        </p>

        <div className="mt-6">
          <ProgressBar percentage={summary.goalPercentage} height="h-4" />
          <p className="mt-3 text-3xl font-bold text-emerald-300">
            {summary.goalPercentage.toFixed(1)}%
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="label">Já guardado</p>
          <p className="mt-1 text-lg font-bold text-emerald-300">
            {eur(summary.totalSaved)}
          </p>
        </div>
        <div className="card p-4">
          <p className="label">Falta</p>
          <p className="mt-1 text-lg font-bold text-amber-300">
            {eur(summary.remainingGoal)}
          </p>
        </div>
        <div className="card p-4">
          <p className="label">Em reais</p>
          <p className="mt-1 text-lg font-bold">{brl(summary.brlValue)}</p>
        </div>
        <div className="card p-4">
          <p className="label">Necessário / semana</p>
          <p className="mt-1 text-lg font-bold">{eur(neededPerWeek)}</p>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 text-base font-semibold">Evolução da minha poupança</h2>
        <SavingsChart points={summary.cumulative} goal={settings.goal} />
      </section>

      <section className="card space-y-2 text-sm">
        <h2 className="text-base font-semibold">Resumo do plano</h2>
        <Row label="Total recebido previsto" value={eur(summary.totalReceived)} />
        <Row label="Total alimentação" value={eur(summary.totalFood)} />
        <Row label="Previsto para guardar" value={eur(summary.totalExpectedSavings)} />
        <Row
          label="Realmente guardado"
          value={eur(summary.totalSaved)}
          highlight
        />
        <Row
          label="Semanas confirmadas"
          value={`${weeks.filter((w) => w.confirmed).length} de 12`}
        />
        <Row label="Câmbio usado" value={`1 € = ${settings.eurToBrlRate} R$`} />
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? "font-bold text-emerald-300" : "font-semibold"}>
        {value}
      </span>
    </div>
  );
}
