/**
 * Client-side table export helpers.
 * Excel exports prefer the server endpoint when available (real .xlsx);
 * these are used for generic modules and as a fallback.
 */

function cellText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** rows: array of objects; columns: [{ header, accessor(row) }] */
export function exportToCsv(filename, rows, columns) {
  const escape = (v) => `"${cellText(v).replace(/"/g, '""')}"`;
  const header = columns.map((c) => escape(c.header)).join(',');
  const body = rows
    .map((row) => columns.map((c) => escape(c.accessor(row))).join(','))
    .join('\n');
  const blob = new Blob([`﻿${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/** Opens a print-friendly window rendered from the table data (user saves as PDF). */
export function exportToPdf(title, rows, columns) {
  const esc = (s) =>
    cellText(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const win = window.open('', '_blank', 'width=1000,height=700');
  if (!win) return;
  win.document.write(`<!doctype html><html><head><title>${esc(title)}</title><style>
    body{font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#0f172a}
    h1{font-size:18px;margin-bottom:4px} p{color:#64748b;font-size:12px;margin-top:0}
    table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}
    th{text-align:left;background:#f1f5f9;padding:8px;border:1px solid #e2e8f0}
    td{padding:8px;border:1px solid #e2e8f0}
    tr:nth-child(even) td{background:#f8fafc}
    @media print { @page { size: landscape; margin: 12mm } }
  </style></head><body>
    <h1>${esc(title)}</h1>
    <p>Generated ${new Date().toLocaleString()} — ${rows.length} records</p>
    <table><thead><tr>${columns.map((c) => `<th>${esc(c.header)}</th>`).join('')}</tr></thead>
    <tbody>${rows
      .map((r) => `<tr>${columns.map((c) => `<td>${esc(c.accessor(r))}</td>`).join('')}</tr>`)
      .join('')}</tbody></table>
    <script>window.onload=function(){window.print()}</script>
  </body></html>`);
  win.document.close();
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
