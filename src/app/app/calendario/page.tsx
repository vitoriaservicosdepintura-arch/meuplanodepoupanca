"use client";

import { useState } from "react";
import { useAppState } from "@/components/StateProvider";
import WeekEditor from "@/components/WeekEditor";
import { STATUS_LABEL, eur, formatRange, round2, weekStatus } from "@/lib/plan";

export default function WeeksPage() {
  const { state } = useAppState();
  const [editing, setEditing] = useState<number | null>(null);
  const editingWeek = state.weeks.find((week) => week.weekNumber === editing) ?? null;

  let running = 0;

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">Calendário</h1>
        <p className="text-sm text-slate-400">
          Toque em uma semana para registrar os valores.
        </p>
      </header>

      <div className="space-y-3">
        {state.weeks.map((week) => {
          running = round2(running + week.realSaved);
          const expected = round2(week.received - week.food);
          const isCurrent = week.weekNumber === state.summary.currentWeek;
          return (
            <button
              key={week.weekNumber}
              type="button"
              onClick={() => setEditing(week.weekNumber)}
              className={`card w-full text-left transition active:scale-[0.99] ${isCurrent ? "border-[color:var(--color-gold-400)]/40 ring-1 ring-[color:var(--color-gold-400)]/20" : ""
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold flex items-center gap-2">
                    Semana {week.weekNumber}
                    {week.workedSaturday ? (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-full font-bold">
                        👷 SÁB
                      </span>
                    ) : null}
                    {isCurrent ? (
                      <span className="text-[11px] font-semibold text-[color:var(--color-gold-400)]">
                        ATUAL
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatRange(week.startDate, week.endDate)}
                  </p>
                </div>
                <span className="text-[11px] text-slate-300">
                  {STATUS_LABEL[weekStatus(week)]}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px]">
                <div>
                  <p className="text-slate-500">Receb.</p>
                  <p className="font-semibold text-[color:var(--color-text-warm)]">{eur(week.received)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Alim.</p>
                  <p className="font-semibold text-[color:var(--color-text-warm)]">{eur(week.food)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Previsto</p>
                  <p className="font-semibold text-[color:var(--color-text-warm)]">{eur(expected)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Guardado</p>
                  <p className="font-semibold text-[color:var(--color-gold-400)]">{eur(week.realSaved)}</p>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-slate-500">
                Acumulado: <span className="text-[color:var(--color-text-warm)]">{eur(running)}</span>
                {week.notes ? ` · ${week.notes}` : ""}
              </p>
            </button>
          );
        })}
      </div>

      {editingWeek ? (
        <WeekEditor week={editingWeek} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}
