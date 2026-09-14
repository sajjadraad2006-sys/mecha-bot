import type { Clock } from '@mecha-bot/shared';
import type { TimetableSlot, Weekday } from './types.js';

export const BAGHDAD_TIMEZONE = 'Asia/Baghdad';

export const WEEKDAY_ORDER: readonly Weekday[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

export const ACADEMIC_WEEKDAYS: readonly Weekday[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
] as const;

export const WEEKEND_DAYS: readonly Weekday[] = ['FRIDAY', 'SATURDAY'] as const;

export function isAcademicDay(weekday: Weekday): boolean {
  return ACADEMIC_WEEKDAYS.includes(weekday);
}

export function isWeekend(weekday: Weekday): boolean {
  return WEEKEND_DAYS.includes(weekday);
}

/**
 * Convert 'HH:MM' 24-hour string to minutes since midnight.
 * e.g. "08:30" -> 510
 */
export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time string: '${timeStr}'. Expected HH:MM (24-hour).`);
  }
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight back to 'HH:MM' string.
 * e.g. 510 -> "08:30"
 */
export function minutesToTime(minutes: number): string {
  const normalized = Math.max(0, Math.min(1439, Math.floor(minutes)));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Compare two 'HH:MM' time strings.
 * Returns -1 if t1 < t2, 0 if t1 === t2, 1 if t1 > t2.
 */
export function compareTimes(t1: string, t2: string): number {
  const m1 = timeToMinutes(t1);
  const m2 = timeToMinutes(t2);
  if (m1 < m2) return -1;
  if (m1 > m2) return 1;
  return 0;
}

/**
 * Check if two time intervals [start1, end1) and [start2, end2) overlap.
 * Touching boundaries (e.g. 08:30-10:30 and 10:30-12:30) do NOT overlap.
 */
export function intervalsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && s2 < e1;
}

/**
 * Calculate the overlap interval between two overlapping ranges.
 * Returns [overlapStart, overlapEnd] in HH:MM format.
 */
export function getOverlapRange(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): { overlapStart: string; overlapEnd: string } | null {
  if (!intervalsOverlap(start1, end1, start2, end2)) {
    return null;
  }
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  const overlapStartMin = Math.max(s1, s2);
  const overlapEndMin = Math.min(e1, e2);

  return {
    overlapStart: minutesToTime(overlapStartMin),
    overlapEnd: minutesToTime(overlapEndMin),
  };
}

export interface BaghdadDateInfo {
  date: Date;
  dateString: string; // 'YYYY-MM-DD'
  timeString: string; // 'HH:MM'
  weekday: Weekday;
  minutesSinceMidnight: number;
}

/**
 * Extract date, time, and weekday for a given instant in Asia/Baghdad timezone.
 */
export function getBaghdadDateInfo(date: Date): BaghdadDateInfo {
  // Use en-CA for ISO format YYYY-MM-DD
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BAGHDAD_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateString = dateFormatter.format(date);

  // Use en-GB with hourCycle h23 for 24-hour HH:MM
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: BAGHDAD_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  });
  const timeString = timeFormatter.format(date);

  const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BAGHDAD_TIMEZONE,
    weekday: 'long',
  });
  const weekdayName = weekdayFormatter.format(date).toUpperCase();
  const weekday = weekdayName as Weekday;

  const minutesSinceMidnight = timeToMinutes(timeString);

  return {
    date,
    dateString,
    timeString,
    weekday,
    minutesSinceMidnight,
  };
}

/**
 * Get current date string (YYYY-MM-DD) in Asia/Baghdad.
 */
export function getBaghdadToday(clock: Clock): string {
  return getBaghdadDateInfo(clock.now()).dateString;
}

/**
 * Get current weekday in Asia/Baghdad.
 */
export function getBaghdadCurrentWeekday(clock: Clock): Weekday {
  return getBaghdadDateInfo(clock.now()).weekday;
}

/**
 * Get tomorrow's date string (YYYY-MM-DD) in Asia/Baghdad.
 */
export function getBaghdadTomorrow(clock: Clock): string {
  const todayStr = getBaghdadToday(clock);
  return addDaysToDateString(todayStr, 1);
}

/**
 * Add or subtract calendar days from a 'YYYY-MM-DD' string safely.
 * Independent of local machine timezone.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const parts = dateStr.split('-').map(Number);
  const year = parts[0]!;
  const month = parts[1]!;
  const day = parts[2]!;

  const utcDate = new Date(Date.UTC(year, month - 1, day + days));
  const y = utcDate.getUTCFullYear();
  const m = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = utcDate.getUTCDate().toString().padStart(2, '0');

  return `${y}-${m}-${d}`;
}

/**
 * Derive Weekday from a 'YYYY-MM-DD' calendar date.
 */
export function getWeekdayFromDateString(dateStr: string): Weekday {
  const parts = dateStr.split('-').map(Number);
  const year = parts[0]!;
  const month = parts[1]!;
  const day = parts[2]!;

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const dayIdx = utcDate.getUTCDay(); // 0 is Sunday, 1 is Monday, etc.
  return WEEKDAY_ORDER[dayIdx]!;
}

/**
 * Check if a slot is effective on a given 'YYYY-MM-DD' academic date.
 * Respects validFrom and validTo bounds.
 */
export function isSlotEffectiveOnDate(slot: TimetableSlot, dateStr: string): boolean {
  if (slot.validFrom && dateStr < slot.validFrom) {
    return false;
  }
  if (slot.validTo && dateStr > slot.validTo) {
    return false;
  }
  return true;
}

/**
 * Get next weekday in standard academic sequence.
 */
export function getNextWeekday(weekday: Weekday): Weekday {
  const currentIndex = WEEKDAY_ORDER.indexOf(weekday);
  const nextIndex = (currentIndex + 1) % WEEKDAY_ORDER.length;
  return WEEKDAY_ORDER[nextIndex]!;
}
