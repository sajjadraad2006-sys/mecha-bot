import { Reminder, OverdueClassification } from './types.js';

export const DEFAULT_OVERDUE_GRACE_WINDOW_MINUTES = 30;

/**
 * Classifies the due state of a reminder relative to the current clock time.
 *
 * Categories:
 * - DUE: Due currently or within 1 minute of current time.
 * - OVERDUE_RECENT: Past due, but within the configurable grace window (e.g. <= 30 mins, typical after bot restart).
 * - EXPIRED: Past due beyond the grace window (> 30 mins).
 */
export function classifyReminderDueState(
  dueAt: Date | string,
  now: Date | string,
  graceWindowMinutes = DEFAULT_OVERDUE_GRACE_WINDOW_MINUTES,
): OverdueClassification {
  const dueDate = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;
  const nowDate = typeof now === 'string' ? new Date(now) : now;

  const dueMs = dueDate.getTime();
  const nowMs = nowDate.getTime();

  if (isNaN(dueMs) || isNaN(nowMs)) {
    throw new Error('Invalid dates provided for overdue classification.');
  }

  const overdueMs = nowMs - dueMs;

  // Due in future or just now (<= 60 seconds overdue)
  if (overdueMs <= 60 * 1000) {
    return 'DUE';
  }

  const graceWindowMs = graceWindowMinutes * 60 * 1000;

  // Past due within grace window
  if (overdueMs <= graceWindowMs) {
    return 'OVERDUE_RECENT';
  }

  // Past due beyond grace window
  return 'EXPIRED';
}

export interface OverdueBatchResult {
  due: Reminder[];
  overdueRecent: Reminder[];
  expired: Reminder[];
}

/**
 * Categorizes an array of pending scheduled reminders upon process startup or polling.
 */
export function categorizeOverdueReminders(
  reminders: Reminder[],
  now: Date | string,
  graceWindowMinutes = DEFAULT_OVERDUE_GRACE_WINDOW_MINUTES,
): OverdueBatchResult {
  const result: OverdueBatchResult = {
    due: [],
    overdueRecent: [],
    expired: [],
  };

  for (const reminder of reminders) {
    if (reminder.status !== 'SCHEDULED') continue;

    const classification = classifyReminderDueState(reminder.dueAt, now, graceWindowMinutes);

    if (classification === 'DUE') {
      result.due.push(reminder);
    } else if (classification === 'OVERDUE_RECENT') {
      result.overdueRecent.push(reminder);
    } else if (classification === 'EXPIRED') {
      result.expired.push(reminder);
    }
  }

  return result;
}
