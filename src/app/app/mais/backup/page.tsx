"use client";

import { useAppState } from "@/components/StateProvider";
import { playSuccess } from "@/lib/sounds";

export default function BackupPage() {
    const { state } = useAppState();

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "meu_plano_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        playSuccess();
    };

    return (
        <div className="space-y-4 pb-24">
            <header className="pt-2">
                <p className="label">Exportar Dados</p>
                <h1 className="text-2xl font-black">Backup 💾</h1>
            </header>

            <div className="card space-y-4 p-5 text-center">
                <p className="text-sm text-slate-300">
                    Faça o download de todos os seus registros e configurações preenchidas num ficheiro seguro de JSON para usar como recupereção caso troque de telemóvel.
                </p>

                <button
                    onClick={handleExport}
                    className="btn-primary w-full mt-2"
                >
                    ⬇️ Baixar Backup (.json)
                </button>

                <div className="border-t border-slate-800 pt-4 mt-6">
                    <p className="text-xs text-[color:var(--color-text-muted)] mb-2">Restaurar via Arquivo</p>
                    <button className="btn-ghost w-full" onClick={() => alert("Restaurar base de dados estará disponível na próxima versão online da Supabase.")}>
                        ⬆️ Restaurar Backup
                    </button>
                </div>
            </div>
        </div>
    );
}
