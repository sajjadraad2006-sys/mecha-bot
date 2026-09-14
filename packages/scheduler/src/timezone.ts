import { Weekday } from './types.js';

export const DEFAULT_ACADEMIC_TIMEZONE = 'Asia/Baghdad';

export const WEEKDAY_NAMES: Weekday[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export interface ZonedDateParts {
  year: number;
  month: number; // 1..12
  day: number; // 1..31
  hour: number; // 0..23
  minute: number; // 0..59
  second: number; // 0..59
  weekday: Weekday;
}

/**
 * Parses any Date or ISO string into a standard UTC ISO 8601 string.
 */
export function toUtcIso(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date provided: ${String(date)}`);
  }
  return d.toISOString();
}

/**
 * Extracts wall-clock date/time parts in the specified IANA timezone.
 */
export function getZonedParts(
  date: Date | string,
  timeZone = DEFAULT_ACADEMIC_TIMEZONE,
): ZonedDateParts {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date provided: ${String(date)}`);
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'long',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  let year = 1970;
  let month = 1;
  let day = 1;
  let hour = 0;
  let minute = 0;
  let second = 0;
  let weekdayStr = 'Sunday';

  for (const part of parts) {
    if (part.type === 'year') year = parseInt(part.value, 10);
    else if (part.type === 'month') month = parseInt(part.value, 10);
    else if (part.type === 'day') day = parseInt(part.value, 10);
    else if (part.type === 'hour') {
      const h = parseInt(part.value, 10);
      hour = h === 24 ? 0 : h;
    } else if (part.type === 'minute') minute = parseInt(part.value, 10);
    else if (part.type === 'second') second = parseInt(part.value, 10);
    else if (part.type === 'weekday') weekdayStr = part.value;
  }

  const upperWeekday = weekdayStr.toUpperCase() as Weekday;
  const validWeekday = WEEKDAY_NAMES.includes(upperWeekday) ? upperWeekday : 'SUNDAY';

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    weekday: validWeekday,
  };
}

/**
 * Constructs the UTC Date corresponding to a specific local wall-clock time in a timezone.
 */
export function createUtcDateFromZonedParts(
  parts: {
    year: number;
    month: number; // 1..12
    day: number; // 1..31
    hour: number; // 0..23
    minute: number; // 0..59
    second?: number; // 0..59
  },
  timeZone = DEFAULT_ACADEMIC_TIMEZONE,
): Date {
  const { year, month, day, hour, minute, second = 0 } = parts;

  // Initial naive UTC approximation
  const naiveUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  // Determine timezone offset for this approximation
  const zoned = getZonedParts(naiveUtc, timeZone);
  const zonedAsUtc = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
    zoned.second,
  );

  const offsetMs = zonedAsUtc - naiveUtc.getTime();
  return new Date(naiveUtc.getTime() - offsetMs);
}
