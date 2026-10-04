"use client";

import { useState } from "react";
import { useAppState } from "@/components/StateProvider";
import { brl, eur, formatDateBR, todayISO } from "@/lib/plan";
import { playSuccess, playError, playChime } from "@/lib/sounds";
import type { Transaction } from "@/lib/types";

const CATEGORIES = [
  "Alimentação", "Transporte", "Combustível", "Compras",
  "Viagem", "Casa", "Saúde", "Trabalho", "Lazer", "Outros",
];

function TransactionModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Transaction;
  onSave: (data: Omit<Transaction, "id">) => Promise<void>;
  onClose: () => void;
}) {
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [income, setIncome] = useState(String(initial?.income ?? 0));
  const [expense, setExpense] = useState(String(initial?.expense ?? 0));
  const [reason, setReason] = useState(initial?.reason ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const inc = Number(income) || 0;
    const exp = Number(expense) || 0;
    if (inc === 0 && exp === 0) return;
    setBusy(true);
    try {
      await onSave({ date, income: inc, expense: exp, reason, notes });
      playSuccess();
      onClose();
    } catch {
      playError();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-[color:var(--color-gold-400)]/20 bg-[color:var(--color-dark-900)] p-5 pb-8 slide-up">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black">
            {initial ? "✏️ Editar Movimento" : "➕ Novo Movimento"}
          </h2>
          <button onClick={onClose} className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-[color:var(--color-text-muted)]">
            Fechar ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">📅 Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field mt-2" />
          </div>
          <div>
            <label className="label">📝 Descrição</label>
            <select value={reason} onChange={(e) => { setReason(e.target.value); playChime(); }} className="field mt-2">
              <option value="">Selecione uma categoria…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">💰 Entrada (EUR)</label>
            <div className="relative mt-2">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[color:var(--color-text-muted)] font-semibold">€</span>
              <input type="number" inputMode="decimal" step="0.01" min="0" value={income}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setIncome(e.target.value)}
                className="field pl-9 text-lg font-semibold" />
            </div>
          </div>
          <div>
            <label className="label">💸 Saída (EUR)</label>
            <div className="relative mt-2">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[color:var(--color-text-muted)] font-semibold">€</span>
              <input type="number" inputMode="decimal" step="0.01" min="0" value={expense}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setExpense(e.target.value)}
                className="field pl-9 text-lg font-semibold" />
            </div>
          </div>
          <div>
            <label className="label">🗒️ Notas</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional…" className="field mt-2 resize-none" />
          </div>

          <button type="button" disabled={busy} onClick={submit} className="btn-primary">
            {busy ? "Salvando…" : initial ? "💾 Salvar Alterações" : "💾 Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinanceiroPage() {
  const { state, addTransaction, updateTransaction, removeTransaction } = useAppState();
  const { transactions, summary } = state;
  const [filter, setFilter] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const filtered = filter === "Todos"
    ? [...transactions].sort((a, b) => b.date.localeCompare(a.date))
    : [...transactions].filter((t) => t.reason === filter).sort((a, b) => b.date.localeCompare(a.date));

  const totalExpenses = transactions.reduce((s, t) => s + t.expense, 0);
  const totalIncome = transactions.reduce((s, t) => s + t.income, 0);

  async function handleSaveNew(data: Omit<Transaction, "id">) {
    await addTransaction(data);
  }

  async function handleSaveEdit(data: Omit<Transaction, "id">) {
    if (!editing) return;
    await updateTransaction({ ...data, id: editing.id });
  }

  async function handleDelete(id: number) {
    await removeTransaction(id);
    setConfirmDelete(null);
    playSuccess();
  }

  return (
    <div className="space-y-4 pb-24">
      <header className="pt-2 flex items-center justify-between">
        <div>
          <p className="label">Controlo financeiro</p>
          <h1 className="text-2xl font-black">Financeiro 💳</h1>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); playChime(); }}
          className="flex items-center gap-1.5 rounded-2xl bg-[color:var(--color-gold-400)] px-3 py-2 text-sm font-bold text-black shadow-lg shadow-yellow-500/20"
        >
          <span className="text-base">+</span> Adicionar
        </button>
      </header>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="label">💰 Receitas</p>
          <p className="mt-1 text-lg font-bold text-green-400">{eur(totalIncome)}</p>
        </div>
        <div className="card p-4">
          <p className="label">💸 Despesas</p>
          <p className="mt-1 text-lg font-bold text-red-400">{eur(totalExpenses)}</p>
        </div>
      </div>

      {/* Bancos */}
      <section className="card space-y-3">
        <p className="label">🏦 Distribuição por banco</p>
        <div className="flex items-center justify-between rounded-xl bg-blue-900/20 border border-blue-500/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏦</span>
            <div>
              <p className="text-xs font-semibold text-blue-300">Novo Banco</p>
              <p className="text-[10px] text-[color:var(--color-text-muted)]">Conta em EUR</p>
            </div>
          </div>
          <p className="text-lg font-black text-blue-300">{eur(summary.totalNovoBanco)}</p>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-cyan-900/20 border border-cyan-500/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <p className="text-xs font-semibold text-cyan-300">Wise</p>
              <p className="text-[10px] text-[color:var(--color-text-muted)]">Conta em EUR</p>
            </div>
          </div>
          <p className="text-lg font-black text-cyan-300">{eur(summary.totalWise)}</p>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-green-900/20 border border-green-500/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇧🇷</span>
            <div>
              <p className="text-xs font-semibold text-green-300">Conta Brasileira</p>
              <p className="text-[10px] text-[color:var(--color-text-muted)]">Conta em BRL</p>
            </div>
          </div>
          <p className="text-lg font-black text-green-300">{brl(summary.totalBrl)}</p>
        </div>
      </section>

      {/* Filtro */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {["Todos", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition ${filter === cat
              ? "bg-[color:var(--color-gold-400)]/15 border-[color:var(--color-gold-400)]/40 text-[color:var(--color-gold-400)]"
              : "border-white/10 bg-white/5 text-[color:var(--color-text-muted)]"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-[color:var(--color-text-warm)]">Sem movimentos</p>
          <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
            Toque em <strong>Adicionar</strong> para registar um movimento
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <div key={t.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.reason || "Sem descrição"}</p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">{formatDateBR(t.date)}</p>
                  {t.notes ? <p className="text-[11px] text-slate-500 mt-0.5 italic">{t.notes}</p> : null}
                </div>
                <div className="text-right ml-3">
                  {t.income > 0 && <p className="text-sm font-bold text-green-400">+{eur(t.income)}</p>}
                  {t.expense > 0 && <p className="text-sm font-bold text-red-400">-{eur(t.expense)}</p>}
                </div>
              </div>

              {/* botões editar/excluir */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => { setEditing(t); setShowModal(true); playChime(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[color:var(--color-gold-400)]/30 bg-[color:var(--color-gold-400)]/10 py-2 text-xs font-bold text-[color:var(--color-gold-400)] transition active:scale-95"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => setConfirmDelete(t.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-bold text-red-400 transition active:scale-95"
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adicionar/Editar */}
      {showModal && (
        <TransactionModal
          initial={editing ?? undefined}
          onSave={editing ? handleSaveEdit : handleSaveNew}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}

      {/* Modal Confirmar Delete */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-[color:var(--color-dark-900)] p-6 space-y-4">
            <p className="text-lg font-black text-center">🗑️ Excluir Movimento?</p>
            <p className="text-sm text-center text-[color:var(--color-text-muted)]">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 btn-ghost"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-black text-white active:scale-95 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
