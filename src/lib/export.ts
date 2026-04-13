/**
 * Export utilities for generating CSV downloads.
 */

export function toCsvRow(fields: (string | number | null)[]): string {
  return fields
    .map((f) => {
      if (f === null || f === undefined) return "";
      const str = String(f);
      // Proper CSV escaping: quote fields that contain commas, newlines, or quotes
      if (str.includes(",") || str.includes("\n") || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    })
    .join(",");
}

export function toCsv(
  headers: string[],
  rows: (string | number | null)[][]
): string {
  const headerRow = toCsvRow(headers);
  const dataRows = rows.map(toCsvRow);
  return [headerRow, ...dataRows].join("\n");
}
