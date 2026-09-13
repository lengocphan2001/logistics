/**
 * CSV for Excel on a Vietnamese desktop.
 *
 * Excel reads a bare UTF-8 file as the system codepage and mangles the
 * diacritics, so the output carries a byte order mark. It also splits on the
 * list separator from the locale, which is a semicolon in Vietnam, so that is
 * the delimiter here rather than a comma.
 */
const BOM = '﻿';
const DELIMITER = ';';

export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

function escapeCell(value: string | number | null | undefined): string {
  if (value == null) return '';
  const text = String(value);
  if (text.includes('"') || text.includes(DELIMITER) || /[\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const head = columns.map((c) => escapeCell(c.header)).join(DELIMITER);
  const body = rows.map((row) =>
    columns.map((c) => escapeCell(c.value(row))).join(DELIMITER),
  );
  return BOM + [head, ...body].join('\r\n');
}

/** `don-hang-2026-09-13.csv` */
export function csvFilename(prefix: string): string {
  return `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`;
}
