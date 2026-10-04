"use client";

import { useAppState } from "@/components/StateProvider";
import { eur } from "@/lib/plan";

export default function RecibosPage() {
    const { state } = useAppState();
    const { weeks, transactions } = state;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="pb-24">
            <header className="pt-12 pb-6 px-6 relative z-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-sm">
                        Recibos
                    </h1>
                    <p className="text-sm text-yellow-500/80 font-medium tracking-wide">
                        Exportar dados em PDF
                    </p>
                </div>
                <button
                    onClick={handlePrint}
                    className="print:hidden px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-lg shadow-lg shadow-yellow-500/20"
                >
                    Salvar PDF
                </button>
            </header>

            <main className="px-6 space-y-8 print:p-0 print:m-0">
                <section className="bg-white/5 border border-yellow-500/20 rounded-2xl p-6 backdrop-blur-xl print:border-none print:shadow-none print:bg-transparent">
                    <h2 className="text-xl font-bold text-yellow-300 mb-4 print:text-black">
                        Resumo Bancário Semanal
                    </h2>
                    <div className="space-y-4">
                        {weeks.map((week) => (
                            <div
                                key={week.weekNumber}
                                className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-yellow-500/10 print:border-gray-300 print:bg-white"
                            >
                                <div>
                                    <h3 className="font-bold text-yellow-100 print:text-black">
                                        Semana {week.weekNumber}
                                    </h3>
                                    <p className="text-xs text-yellow-500/60 print:text-gray-600">
                                        {week.startDate} até {week.endDate}
                                    </p>
                                </div>
                                <div className="text-right text-sm space-y-1">
                                    <p>
                                        <span className="text-white/60 print:text-gray-600">Novo Banco:</span>{" "}
                                        <span className="font-bold text-yellow-400 print:text-black">
                                            {eur(week.savedNovoBanco ?? 0)}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="text-white/60 print:text-gray-600">Wise:</span>{" "}
                                        <span className="font-bold text-yellow-400 print:text-black">
                                            {eur(week.savedWise ?? 0)}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="text-white/60 print:text-gray-600">Brasil:</span>{" "}
                                        <span className="font-bold text-yellow-400 print:text-black">
                                            R$ {(week.savedBrl ?? 0).toFixed(2)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-white/5 border border-yellow-500/20 rounded-2xl p-6 backdrop-blur-xl print:border-none print:shadow-none print:bg-transparent">
                    <h2 className="text-xl font-bold text-yellow-300 mb-4 print:text-black">
                        Transações Avulsas
                    </h2>
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <p className="text-yellow-500/60 text-sm">Nenhuma transação registrada.</p>
                        ) : (
                            transactions.map((t) => (
                                <div
                                    key={t.id}
                                    className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-yellow-500/10 print:border-gray-300 print:bg-white"
                                >
                                    <div>
                                        <h3 className="font-bold text-yellow-100 print:text-black">{t.reason}</h3>
                                        <p className="text-xs text-yellow-500/60 print:text-gray-600">{t.date}</p>
                                    </div>
                                    <div className="text-right">
                                        {t.income > 0 && (
                                            <p className="font-bold text-green-400 print:text-green-700">
                                                + {eur(t.income)}
                                            </p>
                                        )}
                                        {t.expense > 0 && (
                                            <p className="font-bold text-rose-400 print:text-rose-700">
                                                - {eur(t.expense)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {/* Print styles using global CSS or inline style for media query if necessary, although tailwind print: classes should work */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .pb-24 {
            padding-bottom: 0 !important;
          }
          nav {
            display: none !important;
          }
        }
      `}} />
        </div>
    );
}
