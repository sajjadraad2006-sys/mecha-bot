import { RecurrenceRule, Weekday } from './types.js';
import {
  getZonedParts,
  createUtcDateFromZonedParts,
  DEFAULT_ACADEMIC_TIMEZONE,
  WEEKDAY_NAMES,
} from './timezone.js';

export function validateRecurrenceRule(rule: RecurrenceRule): void {
  if (!rule) {
    throw new Error('RecurrenceRule cannot be null or undefined.');
  }

  const { hour, minute } = rule.timeOfDay;
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error(`Invalid hour in recurrence rule: ${hour}. Expected 0..23.`);
  }

  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error(`Invalid minute in recurrence rule: ${minute}. Expected 0..59.`);
  }

  if (rule.type === 'SELECTED_WEEKDAYS') {
    if (!rule.weekdays || rule.weekdays.length === 0) {
      throw new Error('SELECTED_WEEKDAYS recurrence requires at least one weekday.');
    }
    for (const wd of rule.weekdays) {
      if (!WEEKDAY_NAMES.includes(wd)) {
        throw new Error(`Invalid weekday: ${wd}`);
      }
    }
  }
}

/**
 * Calculates the next UTC occurrence timestamp strictly after fromDate based on the recurrence rule.
 * Handles month/year transitions accurately using student academic timezone (Asia/Baghdad).
 */
export function calculateNextOccurrence(rule: RecurrenceRule, fromDate: Date | string): string {
  validateRecurrenceRule(rule);

  const timeZone = rule.timezone || DEFAULT_ACADEMIC_TIMEZONE;
  const fromParts = getZonedParts(fromDate, timeZone);
  const fromUtcTime = (typeof fromDate === 'string' ? new Date(fromDate) : fromDate).getTime();

  // Reference base date in UTC representing 00:00 of the zoned date
  const baseDate = new Date(Date.UTC(fromParts.year, fromParts.month - 1, fromParts.day));

  // Search ahead up to 14 days for the next valid occurrence
  for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
    const candidateDay = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const candidateParts = getZonedParts(candidateDay, timeZone);
    const weekday = candidateParts.weekday;

    let matchesDay = false;
    if (rule.type === 'DAILY') {
      matchesDay = true;
    } else if (rule.type === 'WEEKLY') {
      const targetWeekday: Weekday = rule.weekdays?.[0] || fromParts.weekday;
      matchesDay = weekday === targetWeekday;
    } else if (rule.type === 'SELECTED_WEEKDAYS') {
      matchesDay = (rule.weekdays || []).includes(weekday);
    }

    if (matchesDay) {
      const candidateUtc = createUtcDateFromZonedParts(
        {
          year: candidateParts.year,
          month: candidateParts.month,
          day: candidateParts.day,
          hour: rule.timeOfDay.hour,
          minute: rule.timeOfDay.minute,
          second: 0,
        },
        timeZone,
      );

      if (candidateUtc.getTime() > fromUtcTime) {
        return candidateUtc.toISOString();
      }
    }
  }

  throw new Error('Failed to find next occurrence within 14-day search window.');
}
