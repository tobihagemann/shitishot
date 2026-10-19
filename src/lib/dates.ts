const DAY_MS = 24 * 60 * 60 * 1000;

export function daysBefore(date: Date, days: number): Date {
  return new Date(date.getTime() - days * DAY_MS);
}

/** The UTC calendar date as `YYYYMMDD`, or with `separator` between the parts (e.g. `YYYY/MM/DD`). */
export function formatUtcDate(date: Date, separator = ''): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return [date.getUTCFullYear(), month, day].join(separator);
}

/** 30 days inclusive, ending two days back, where Wikimedia's pageview data typically ends. */
export function thirtyDayRange(now: Date): { start: string; end: string } {
  return { start: formatUtcDate(daysBefore(now, 31)), end: formatUtcDate(daysBefore(now, 2)) };
}
