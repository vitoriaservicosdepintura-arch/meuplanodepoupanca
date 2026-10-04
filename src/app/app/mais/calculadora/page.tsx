"use client";

import { useState } from "react";
import { eur } from "@/lib/plan";

export default function CalculadoraPage() {
    const [horas, setHoras] = useState("40");
    const [valorHora, setValorHora] = useState("8.5");

    const salarioSemanal = (Number(horas) || 0) * (Number(valorHora) || 0);

    return (
        <div className="space-y-4 pb-24">
            <header className="pt-2">
                <p className="label">Projeções</p>
                <h1 className="text-2xl font-black">Calculadora 🧮</h1>
            </header>

            <div className="card space-y-4 p-5">
                <div>
                    <label className="label mb-2 block">Horas Trabalhadas (Semana)</label>
                    <input
                        type="number"
                        value={horas}
                        onChange={(e) => setHoras(e.target.value)}
                        className="field font-bold text-lg"
                    />
                </div>
                <div>
                    <label className="label mb-2 block">Valor da Hora (EUR)</label>
                    <input
                        type="number"
                        value={valorHora}
                        onChange={(e) => setValorHora(e.target.value)}
                        className="field font-bold text-lg"
                        step="0.1"
                    />
                </div>

                <div className="rounded-2xl border border-[color:var(--color-gold-400)]/15 bg-[color:var(--color-gold-400)]/5 px-4 py-4 text-center">
                    <p className="text-[color:var(--color-text-muted)] text-sm mb-1">Previsão Semanal</p>
                    <p className="text-3xl font-black text-[color:var(--color-gold-400)]">
                        {eur(salarioSemanal)}
                    </p>
                </div>
            </div>
        </div>
    );
}
