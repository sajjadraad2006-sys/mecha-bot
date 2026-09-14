import { ReminderSourceType } from './types.js';
import { toUtcIso } from './timezone.js';

export const DEFAULT_ACADEMIC_REMINDER_OFFSETS_MINUTES = [
  -1440, // 24 hours before (1 day)
  -120, // 2 hours before
];

/**
 * Calculates reminder due times for an academic event given an array of relative minute offsets.
 * Negative offsets represent time before the event (e.g. -1440 for 1 day prior).
 */
export function buildReminderTimes(
  eventTime: Date | string,
  offsetMinutesList: number[],
): string[] {
  const eventDate = typeof eventTime === 'string' ? new Date(eventTime) : eventTime;
  if (isNaN(eventDate.getTime())) {
    throw new Error(`Invalid event time: ${String(eventTime)}`);
  }

  const eventTimestamp = eventDate.getTime();
  const times: string[] = [];

  for (const offset of offsetMinutesList) {
    if (!Number.isFinite(offset)) {
      throw new Error(`Invalid offset in minutes: ${offset}`);
    }
    const reminderTimestamp = eventTimestamp + offset * 60 * 1000;
    times.push(toUtcIso(new Date(reminderTimestamp)));
  }

  // Return sorted chronologically
  return times.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
}

/**
 * Enforces the core product rule:
 * infer -> suggest -> confirm, never silently assume.
 *
 * Inferred unconfirmed events MUST NOT be scheduled as active reminders without student confirmation.
 */
export function canScheduleAcademicReminder(sourceType: ReminderSourceType): boolean {
  return sourceType !== 'INFERRED_UNCONFIRMED';
}
