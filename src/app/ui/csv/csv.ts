/** One CSV column: its header text and how to read its cell from a row. */
export interface CsvColumn<T> {
  readonly header: string;
  value(row: T): string | number;
}

/** A cell starting with one of these is read by a spreadsheet as a formula (OWASP "CSV injection"). */
const FORMULA_START = /^[=+\-@\t\r]/;

/**
 * One quoted field. A leading `=`, `+`, `-`, `@`, tab or carriage return gets a single quote in
 * front, so a spreadsheet opens the cell as text; inner quotes are doubled.
 */
function field(value: string | number): string {
  const text = String(value);
  const safe = FORMULA_START.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

/** The rows as CSV text: a header row, then one line per row, CRLF between lines, every field quoted. */
export function toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
  const header = columns.map((column) => field(column.header)).join(',');
  const lines = rows.map((row) => columns.map((column) => field(column.value(row))).join(','));
  return [header, ...lines].join('\r\n');
}

/**
 * Saves `csv` as a file through a temporary `<a download>`. The Blob starts with a UTF-8 byte-order
 * mark so spreadsheets read accents. Call it from a click handler: it uses the browser's `Blob`,
 * `URL` and `document`, which the prerender does not have.
 */
export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoked a moment later, not at once: some browsers (Safari) fail a download whose Blob URL is
  // revoked in the same task as the click.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, REVOKE_DELAY_MS);
}

/** How long the download link's Blob URL outlives the click. */
const REVOKE_DELAY_MS = 1_000;
