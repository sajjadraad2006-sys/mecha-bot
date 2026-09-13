/**
 * Academic Date and Time Utilities
 *
 * Rules:
 * 1. Machine timestamps are stored in UTC (ISO 8601 strings: YYYY-MM-DDTHH:mm:ss.sssZ).
 * 2. Academic calendar boundaries are modeled deliberately as local calendar dates (YYYY-MM-DD).
 * 3. Local calendar dates are immune to timezone conversion shifts.
 * 4. Default student display timezone is Asia/Baghdad.
 */

const ACADEMIC_DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

export function isValidAcademicDate(dateStr: string): boolean {
  if (!ACADEMIC_DATE_REGEX.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

export function parseAcademicDateParts(dateStr: string): {
  year: number;
  month: number;
  day: number;
} {
  if (!isValidAcademicDate(dateStr)) {
    throw new Error(`Invalid academic date string: '${dateStr}'. Expected format YYYY-MM-DD.`);
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year: year!, month: month!, day: day! };
}

/**
 * Format a Date object as a local academic calendar date string (YYYY-MM-DD)
 * in the specified timezone (default Asia/Baghdad, UTC+3).
 */
export function formatToAcademicDate(date: Date, timeZone = 'Asia/Baghdad'): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // en-CA gives YYYY-MM-DD
}

/**
 * Calculate the difference in calendar days between two YYYY-MM-DD strings.
 */
export function daysBetweenAcademicDates(startDateStr: string, endDateStr: string): number {
  const start = parseAcademicDateParts(startDateStr);
  const end = parseAcademicDateParts(endDateStr);

  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((endUtc - startUtc) / msPerDay);
}

/**
 * Derives the academic teaching week (1-indexed) given the semester start date
 * and current academic date.
 * If current date is before start date, returns a non-positive number (0 or negative, indicating pre-semester).
 */
export function calculateAcademicWeek(
  semesterStartDateStr: string,
  currentDateStr: string,
): number {
  const daysDiff = daysBetweenAcademicDates(semesterStartDateStr, currentDateStr);
  if (daysDiff < 0) {
    return Math.floor(daysDiff / 7); // 0 or negative represents pre-semester weeks
  }
  return Math.floor(daysDiff / 7) + 1; // 1-indexed teaching week
}
