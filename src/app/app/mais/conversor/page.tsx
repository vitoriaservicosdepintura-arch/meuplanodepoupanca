"use client";

import { useState, useEffect } from "react";
import { eur, brl } from "@/lib/plan";

export default function ConversorPage() {
    const [eurAmount, setEurAmount] = useState("100");
    const [rate, setRate] = useState<number | null>(null);

    useEffect(() => {
        fetch("https://economia.awesomeapi.com.br/last/EUR-BRL")
            .then((r) => r.json())
            .then((d) => {
                const liveRate = parseFloat(d?.EURBRL?.bid ?? "0");
                if (liveRate > 0) setRate(liveRate);
            })
            .catch(() => null);
    }, []);

    const converted = rate ? (Number(eurAmount) || 0) * rate : 0;

    return (
        <div className="space-y-4 pb-24">
            <header className="pt-2">
                <p className="label">Euro para Real</p>
                <h1 className="text-2xl font-black">Conversor 💱</h1>
            </header>

            <div className="card space-y-4 p-5">
                <div>
                    <label className="label mb-2 block">Valor em Euros (EUR)</label>
                    <input
                        type="number"
                        value={eurAmount}
                        onChange={(e) => setEurAmount(e.target.value)}
                        className="field font-bold text-xl"
                        placeholder="Ex: 100"
                    />
                </div>

                <div className="rounded-2xl border border-[color:var(--color-gold-400)]/15 bg-[color:var(--color-gold-400)]/5 px-4 py-4 text-center">
                    <p className="text-[color:var(--color-text-muted)] text-sm mb-1">Valor em Reais (BRL)</p>
                    <p className="text-4xl font-black text-[color:var(--color-gold-400)]">
                        {brl(converted)}
                    </p>
                </div>

                <div className="text-center text-xs text-slate-500 pt-2">
                    {rate ? `Câmbio Atual: 1 EUR = R$ ${rate.toFixed(4)}` : "Carregando cotação..."}
                </div>
            </div>
        </div>
    );
}
