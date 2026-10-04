import { STATUS_LABEL, formatDateBR, round2, weekStatus } from "@/lib/plan";
import type { AppState } from "@/lib/types";

export type ReportRow = {
  periodo: string;
  semana: number;
  recebido: number;
  alimentacao: number;
  previsto: number;
  guardado: number;
  acumulado: number;
  status: string;
  observacoes: string;
};

export function buildReportRows(state: AppState): ReportRow[] {
  let running = 0;
  return state.weeks.map((week) => {
    running = round2(running + week.realSaved);
    return {
      periodo: `${formatDateBR(week.startDate)} a ${formatDateBR(week.endDate)}`,
      semana: week.weekNumber,
      recebido: week.received,
      alimentacao: week.food,
      previsto: round2(week.received - week.food),
      guardado: week.realSaved,
      acumulado: running,
      status: STATUS_LABEL[weekStatus(week)],
      observacoes: week.notes,
    };
  });
}

const HEADERS = [
  "Período",
  "Semana",
  "Recebido (€)",
  "Alimentação (€)",
  "Previsto (€)",
  "Realmente guardado (€)",
  "Saldo acumulado (€)",
  "Status",
  "Observações",
];

function rowValues(row: ReportRow): (string | number)[] {
  return [
    row.periodo,
    row.semana,
    row.recebido,
    row.alimentacao,
    row.previsto,
    row.guardado,
    row.acumulado,
    row.status,
    row.observacoes,
  ];
}

export function download(filename: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportJson(state: AppState) {
  const payload = {
    app: "Meu Plano de Poupança",
    exportedAt: new Date().toISOString(),
    settings: state.settings,
    weeks: state.weeks,
    transactions: state.transactions,
    summary: state.summary,
  };
  download(
    `poupanca-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(payload, null, 2),
    "application/json",
  );
}

export function exportCsv(state: AppState) {
  const rows = buildReportRows(state);
  const lines = [HEADERS.join(";")];
  for (const row of rows) {
    lines.push(
      rowValues(row)
        .map((value) =>
          typeof value === "number"
            ? String(value).replace(".", ",")
            : `"${String(value).replace(/"/g, '""')}"`,
        )
        .join(";"),
    );
  }
  lines.push("");
  lines.push(`"Total guardado";${String(state.summary.totalSaved).replace(".", ",")}`);
  lines.push(`"Meta";${String(state.summary.goal).replace(".", ",")}`);
  lines.push(
    `"% da meta";${String(state.summary.goalPercentage).replace(".", ",")}`,
  );
  lines.push(`"Valor em BRL";${String(state.summary.brlValue).replace(".", ",")}`);

  download(
    `poupanca-${new Date().toISOString().slice(0, 10)}.csv`,
    `\uFEFF${lines.join("\n")}`,
    "text/csv;charset=utf-8",
  );
}

export function exportExcel(state: AppState) {
  const rows = buildReportRows(state);
  const head = HEADERS.map((header) => `<th>${header}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${rowValues(row)
          .map((value) => `<td>${String(value)}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  const footer = `
    <tr><td colspan="9"></td></tr>
    <tr><td>Total guardado</td><td>${state.summary.totalSaved}</td></tr>
    <tr><td>Meta</td><td>${state.summary.goal}</td></tr>
    <tr><td>% da meta</td><td>${state.summary.goalPercentage}</td></tr>
    <tr><td>Valor em BRL</td><td>${state.summary.brlValue}</td></tr>`;

  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /></head>
  <body><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}${footer}</tbody></table></body></html>`;

  download(
    `poupanca-${new Date().toISOString().slice(0, 10)}.xls`,
    html,
    "application/vnd.ms-excel",
  );
}
