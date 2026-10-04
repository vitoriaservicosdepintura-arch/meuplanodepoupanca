"use client";

import { useAppState } from "@/components/StateProvider";
import { useState } from "react";
import { playSuccess } from "@/lib/sounds";

export default function ConfigPage() {
    const { state, updateSettings } = useAppState();
    const { settings } = state;
    const [goal, setGoal] = useState(String(settings.goal));
    const [income, setIncome] = useState(String(settings.weeklyIncome));
    const [food, setFood] = useState(String(settings.weeklyFoodBudget));
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await updateSettings({
            goal: Number(goal) || 0,
            weeklyIncome: Number(income) || 0,
            weeklyFoodBudget: Number(food) || 0,
        });
        playSuccess();
        setSaving(false);
    };

    return (
        <div className="space-y-4 pb-24">
            <header className="pt-2">
                <p className="label">Ajustes do Plano</p>
                <h1 className="text-2xl font-black">Configurações ⚙️</h1>
            </header>

            <div className="space-y-4">
                <div className="card space-y-4 p-5">
                    <div>
                        <label className="label mb-2 block">Meta Principal (EUR)</label>
                        <input
                            type="number"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="field font-bold text-lg"
                        />
                    </div>
                    <div>
                        <label className="label mb-2 block">Renda Semanal (EUR)</label>
                        <input
                            type="number"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            className="field font-bold text-lg"
                        />
                    </div>
                    <div>
                        <label className="label mb-2 block">Orçamento Alimentação (EUR)</label>
                        <input
                            type="number"
                            value={food}
                            onChange={(e) => setFood(e.target.value)}
                            className="field font-bold text-lg"
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary w-full mt-4"
                    >
                        {saving ? "Salvando..." : "Salvar Configurações"}
                    </button>
                </div>
            </div>
        </div>
    );
}
