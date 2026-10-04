"use client";

import { useState } from "react";
import { playSuccess } from "@/lib/sounds";

export default function NotificacoesPage() {
    const [enabled, setEnabled] = useState(true);

    const toggle = () => {
        setEnabled(!enabled);
        if (!enabled) playSuccess();
    };

    return (
        <div className="space-y-4 pb-24">
            <header className="pt-2">
                <p className="label">Avisos</p>
                <h1 className="text-2xl font-black">Notificações 🔔</h1>
            </header>

            <div className="card space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold">Lembretes Dominicais</h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Avisar 1 dia antes aos sábados sobre o registro
                        </p>
                    </div>
                    <button
                        onClick={toggle}
                        className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? "bg-yellow-500" : "bg-slate-700"}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? "left-7" : "left-1"}`} />
                    </button>
                </div>

                <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                    Nota: Para que funcione corretamente, garanta que as permissões de notificação do seu navegador ou celular estejam ativadas para este App.
                </p>
            </div>
        </div>
    );
}
