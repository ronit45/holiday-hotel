import { startOfDay, addDays, format, parse } from "date-fns";

/** Local calendar helpers for <input type="date"> — avoid UTC day-shift from toISOString / Date("YYYY-MM-DD"). */

/** Start of local calendar day. */
export function startOfLocalDay(date: Date): Date {
  return startOfDay(date);
}

/** Add whole local days (handles month/year rollover). */
export function addLocalDays(date: Date, days: number): Date {
  return addDays(startOfDay(date), days);
}

/** Format Date → YYYY-MM-DD for controlled date inputs (local). */
export function formatDateInputValue(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
}

/** Parse YYYY-MM-DD as local midnight; empty/invalid → null. */
export function parseDateInputValue(value: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
