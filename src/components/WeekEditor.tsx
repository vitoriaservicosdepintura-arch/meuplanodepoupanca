"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/components/StateProvider";
import { brl, eur, formatRange, round2 } from "@/lib/plan";
import { playSuccess, playError, playChime } from "@/lib/sounds";
import type { Week } from "@/lib/types";

function CurrencyInput({
  id, label, value, onChange, prefix = "€",
}: {
  id: string; label: string; value: string;
  onChange: (value: string) => void; prefix?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative mt-2">
        <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[color:var(--color-text-muted)] font-semibold">
          {prefix}
        </span>
        <input
          id={id} type="number" inputMode="decimal" step="0.01" min="0"
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => { onChange(e.target.value); playChime(); }}
          className="field pl-9 text-lg font-semibold"
        />
      </div>
    </div>
  );
}

export default function WeekEditor({ week, onClose }: { week: Week; onClose: () => void }) {
  const { updateWeek } = useAppState();
  const [received, setReceived] = useState(String(week.received));
  const [food, setFood] = useState(String(week.food));
  const [realSaved, setRealSaved] = useState(String(week.realSaved));
  const [novoBanco, setNovoBanco] = useState(String(week.savedNovoBanco ?? 0));
  const [wise, setWise] = useState(String(week.savedWise ?? 0));
  const [savedBrl, setSavedBrl] = useState(String(week.savedBrl ?? 0));
  const [workedSaturday, setWorkedSaturday] = useState(week.workedSaturday ?? false);
  const [notes, setNotes] = useState(week.notes);
  const [confirmed, setConfirmed] = useState(week.confirmed);
  const [busy, setBusy] = useState(false);
  const [liveRate, setLiveRate] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    // Fetch live EUR/BRL rate
    fetch("https://economia.awesomeapi.com.br/last/EUR-BRL")
      .then((r) => r.json())
      .then((d) => {
        const rate = parseFloat(d?.EURBRL?.bid ?? "0");
        if (rate > 0) setLiveRate(rate);
      })
      .catch(() => null);
    return () => { document.body.style.overflow = ""; };
  }, []);

  const expected = round2((Number(received) || 0) - (Number(food) || 0));
  const brlEquiv = liveRate ? round2((Number(realSaved) || 0) * liveRate) : null;

  async function save(confirmWeek: boolean) {
    setBusy(true);
    try {
      await updateWeek(week.weekNumber, {
        received: Number(received) || 0,
        food: Number(food) || 0,
        realSaved: Number(realSaved) || 0,
        notes,
        confirmed: confirmWeek,
        savedNovoBanco: Number(novoBanco) || 0,
        savedWise: Number(wise) || 0,
        savedBrl: Number(savedBrl) || 0,
        workedSaturday,
      });
      playSuccess();
      onClose();
    } catch {
      playError();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-[color:var(--color-gold-400)]/20 bg-[color:var(--color-dark-900)] p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] slide-up">

        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black">Semana {week.weekNumber}</h2>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              {formatRange(week.startDate, week.endDate)}
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-[color:var(--color-text-muted)]">
            Fechar ✕
          </button>
        </div>

        <div className="space-y-4">
          <CurrencyInput id="received" label="💰 Quanto recebeu?" value={received} onChange={setReceived} />
          <CurrencyInput id="food" label="🍽️ Quanto gastou com alimentação?" value={food} onChange={setFood} />

          {/* Previsto */}
          <div className="rounded-2xl border border-[color:var(--color-gold-400)]/15 bg-[color:var(--color-gold-400)]/5 px-4 py-3">
            <p className="label">Previsto para guardar</p>
            <p className="text-2xl font-black text-[color:var(--color-gold-400)]">{eur(expected)}</p>
          </div>

          {/* Guardado real */}
          <div>
            <CurrencyInput id="realSaved" label="🔒 Quanto realmente guardou?" value={realSaved} onChange={setRealSaved} />
            {brlEquiv !== null && (
              <p className="mt-1.5 text-xs text-green-400 font-semibold">
                ≈ {brl(brlEquiv)} ao câmbio do dia (R$ {liveRate?.toFixed(4)})
              </p>
            )}
            <button type="button" onClick={() => setRealSaved(String(expected))}
              className="mt-2 text-xs font-semibold text-[color:var(--color-gold-400)]">
              Usar valor previsto ({eur(expected)})
            </button>
          </div>

          {/* Bancos */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4 space-y-3">
            <p className="label">🏦 Onde guardou?</p>
            <CurrencyInput id="novoBanco" label="🏦 Novo Banco (EUR)" value={novoBanco} onChange={setNovoBanco} />
            <CurrencyInput id="wise" label="💳 Wise (EUR)" value={wise} onChange={setWise} />
            <CurrencyInput id="savedBrl" label="🇧🇷 Conta Brasileira (BRL)" value={savedBrl} onChange={setSavedBrl} prefix="R$" />
            {liveRate && (
              <p className="text-[10px] text-[color:var(--color-text-muted)]">
                Câmbio ao vivo: 1 EUR = R$ {liveRate.toFixed(4)}
              </p>
            )}
          </div>

          {/* Sábado */}
          <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm font-medium">👷‍♂️ Trabalhou no Sábado? (+€112)</span>
            <input type="checkbox" checked={workedSaturday}
              onChange={(e) => {
                const checked = e.target.checked;
                setWorkedSaturday(checked);
                setReceived((prev) => {
                  const val = Number(prev) || 0;
                  return String(val + (checked ? 112 : -112));
                });
              }}
              className="h-6 w-6 accent-yellow-500"
            />
          </label>

          {/* Confirmado */}
          <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm font-medium">✅ Semana confirmada?</span>
            <input type="checkbox" checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="h-6 w-6 accent-yellow-500"
            />
          </label>

          {/* Notas */}
          <div>
            <label className="label" htmlFor="notes">📝 Observações</label>
            <textarea id="notes" rows={2} value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional…"
              className="field mt-2 resize-none"
            />
          </div>

          {/* Botões */}
          <div className="space-y-2 pt-1">
            <button type="button" disabled={busy} onClick={() => save(true)} className="btn-primary">
              {busy ? "Salvando…" : "💾 SALVAR E CONFIRMAR"}
            </button>
            <button type="button" disabled={busy} onClick={() => save(confirmed)} className="btn-ghost">
              Salvar sem confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
