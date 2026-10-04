"use client";

import { useAppState } from "@/components/StateProvider";

export default function StatusBar() {
  const { online, pending, saving, error } = useAppState();

  if (online && pending === 0 && !saving && !error) return null;

  return (
    <div className="no-print px-4 pt-3">
      <div
        className={`rounded-2xl border px-4 py-2 text-xs ${
          error
            ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
            : online
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              : "border-amber-400/30 bg-amber-400/10 text-amber-200"
        }`}
      >
        {error
          ? error
          : !online
            ? `Offline — ${pending} alteração(ões) serão sincronizadas ao reconectar.`
            : pending > 0
              ? `Sincronizando ${pending} alteração(ões)…`
              : "Salvando…"}
      </div>
    </div>
  );
}
