import { QuietHoursConfig, QuietHoursEvaluation } from './types.js';
import {
  toUtcIso,
  getZonedParts,
  createUtcDateFromZonedParts,
  DEFAULT_ACADEMIC_TIMEZONE,
} from './timezone.js';

export interface QuietHoursOptions {
  isExplicitlyRequested?: boolean;
  isUrgent?: boolean;
}

/**
 * Evaluates whether a due time falls within the configured quiet hours window.
 * Preserves exact requested time and returns deterministic policy decision.
 */
export function evaluateQuietHours(
  dueAt: Date | string,
  config?: QuietHoursConfig | null,
  options?: QuietHoursOptions,
): QuietHoursEvaluation {
  const originalDueAt = toUtcIso(dueAt);

  if (!config || !config.enabled) {
    return {
      decision: 'DELIVER_NOW',
      inQuietHours: false,
      originalDueAt,
      reason: 'Quiet hours are not enabled.',
    };
  }

  const timeZone = config.timezone || DEFAULT_ACADEMIC_TIMEZONE;
  const parts = getZonedParts(dueAt, timeZone);
  const currentMinutesOfDay = parts.hour * 60 + parts.minute;
  const startMinutesOfDay = config.startHour * 60 + config.startMinute;
  const endMinutesOfDay = config.endHour * 60 + config.endMinute;

  let inQuietHours = false;

  if (startMinutesOfDay <= endMinutesOfDay) {
    // Same-day window (e.g. 01:00 to 06:00)
    inQuietHours =
      currentMinutesOfDay >= startMinutesOfDay && currentMinutesOfDay < endMinutesOfDay;
  } else {
    // Overnight window spanning midnight (e.g. 23:00 to 07:00)
    inQuietHours =
      currentMinutesOfDay >= startMinutesOfDay || currentMinutesOfDay < endMinutesOfDay;
  }

  if (!inQuietHours) {
    return {
      decision: 'DELIVER_NOW',
      inQuietHours: false,
      originalDueAt,
      reason: 'Due time is outside quiet hours.',
    };
  }

  // If inside quiet hours:
  if (options?.isUrgent) {
    return {
      decision: 'ALLOW_URGENT',
      inQuietHours: true,
      originalDueAt,
      reason: 'Urgent academic alert allowed during quiet hours.',
    };
  }

  if (options?.isExplicitlyRequested) {
    // Explicit user requests (e.g. "Remind me at 2 AM") must NOT be silently moved
    return {
      decision: 'REQUIRES_POLICY_DECISION',
      inQuietHours: true,
      originalDueAt,
      reason:
        'Reminder was explicitly requested during quiet hours; requires explicit student confirmation.',
    };
  }

  // Calculate the end of quiet hours for deferred automated reminders
  // If currentMinutesOfDay >= startMinutesOfDay (before midnight), end is next day.
  // If currentMinutesOfDay < endMinutesOfDay (after midnight), end is same day.
  const isBeforeMidnight = currentMinutesOfDay >= startMinutesOfDay;
  const targetDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (isBeforeMidnight) {
    targetDate.setUTCDate(targetDate.getUTCDate() + 1);
  }

  const endParts = {
    year: targetDate.getUTCFullYear(),
    month: targetDate.getUTCMonth() + 1,
    day: targetDate.getUTCDate(),
    hour: config.endHour,
    minute: config.endMinute,
    second: 0,
  };

  const deferredUtcDate = createUtcDateFromZonedParts(endParts, timeZone);

  return {
    decision: 'DEFER_UNTIL_QUIET_HOURS_END',
    inQuietHours: true,
    originalDueAt,
    suggestedDueAt: deferredUtcDate.toISOString(),
    reason: 'Automated reminder deferred to end of quiet hours.',
  };
}
