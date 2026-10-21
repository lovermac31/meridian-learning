// CSV for the owner's private export. Cells that a spreadsheet would treat as a
// formula (= + - @ tab CR) are prefixed with an apostrophe (CSV injection).
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function csvSection(title: string, rows: Record<string, unknown>[]): string {
  if (!rows.length) return `${csvCell(title)}\n(none)\n`;
  const cols = Object.keys(rows[0]);
  return [csvCell(title), cols.map(csvCell).join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\n") + "\n";
}
