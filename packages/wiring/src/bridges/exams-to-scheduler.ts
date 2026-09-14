/**
 * Bridge E: Exams & Academic Events (M10) -> Scheduler (M4)
 *
 * Maps academic events (quizzes, midterms, finals, deadlines) into reminders.
 * Enforces the core product rule:
 * "infer -> suggest -> confirm, never silently assume."
 * Unconfirmed inferred events MUST NOT be scheduled as active reminders.
 */

import type { AcademicEvent } from '@mecha-bot/exams';
import {
  buildReminderTimes,
  canScheduleAcademicReminder,
  DEFAULT_ACADEMIC_REMINDER_OFFSETS_MINUTES,
  DEFAULT_ACADEMIC_TIMEZONE,
  type QuietHoursConfig,
  type Reminder,
  type ReminderKind,
  type ReminderSchedulerService,
  type ReminderSourceType,
} from '@mecha-bot/scheduler';
import type { AcademicEventRemindersResult } from '../types.js';

/**
 * Maps M10 event type to M4 reminder kind.
 */
export function mapEventTypeToReminderKind(eventType: AcademicEvent['type']): ReminderKind {
  switch (eventType) {
    case 'QUIZ':
      return 'QUIZ';
    case 'MIDTERM':
    case 'FINAL_EXAM':
      return 'EXAM';
    case 'ASSIGNMENT':
    case 'REPORT':
    case 'PROJECT':
      return 'ASSIGNMENT';
    case 'DEADLINE':
      return 'DEADLINE';
    default:
      return 'STUDY';
  }
}

/**
 * Maps M10 confirmation status to M4 reminder source type.
 */
export function mapConfirmationStatusToSourceType(
  status: AcademicEvent['confirmationStatus'],
): ReminderSourceType {
  switch (status) {
    case 'CONFIRMED':
      return 'STUDENT_CONFIRMED';
    case 'STUDENT_ENTERED':
      return 'STUDENT_ENTERED';
    case 'ADMIN_ENTERED':
      return 'ADMIN_ENTERED';
    case 'INFERRED_UNCONFIRMED':
    case 'CANDIDATE':
    default:
      return 'INFERRED_UNCONFIRMED';
  }
}

export interface ScheduleEventRemindersParams {
  userKey: string;
  event: AcademicEvent;
  offsetMinutesList?: number[] | undefined;
  quietHoursConfig?: QuietHoursConfig | undefined;
}

/**
 * Schedules reminders for an academic event.
 * If the event is unconfirmed/inferred, scheduling is blocked and
 * requiresStudentConfirmation is returned as true.
 */
export async function scheduleRemindersForAcademicEvent(
  schedulerService: ReminderSchedulerService,
  params: ScheduleEventRemindersParams,
): Promise<AcademicEventRemindersResult> {
  const { userKey, event, offsetMinutesList, quietHoursConfig } = params;

  const eventTime = event.occursAt || event.dueAt;
  if (!eventTime) {
    return {
      scheduledCount: 0,
      reminders: [],
      requiresStudentConfirmation: false,
      reason: 'Academic event has neither occursAt nor dueAt timestamp.',
    };
  }

  const sourceType = mapConfirmationStatusToSourceType(event.confirmationStatus);

  // Invariant enforcement: Inferred unconfirmed events cannot be scheduled as active reminders
  if (!canScheduleAcademicReminder(sourceType)) {
    return {
      scheduledCount: 0,
      reminders: [],
      requiresStudentConfirmation: true,
      reason:
        'Event is INFERRED_UNCONFIRMED. Reminders require explicit student confirmation before activation.',
    };
  }

  const offsets = offsetMinutesList ?? DEFAULT_ACADEMIC_REMINDER_OFFSETS_MINUTES;
  const reminderTimes = buildReminderTimes(eventTime, offsets);
  const reminderKind = mapEventTypeToReminderKind(event.type);

  const scheduledReminders: Reminder[] = [];

  for (const dueAt of reminderTimes) {
    const res = await schedulerService.createReminder({
      userKey,
      kind: reminderKind,
      title: `${event.type}: ${event.title} (${event.courseCode})`,
      description: event.notes ?? `تذكير بموعد ${event.title} لمادة ${event.courseCode}`,
      dueAt,
      timezone: DEFAULT_ACADEMIC_TIMEZONE,
      sourceType,
      relatedCourseCode: event.courseCode,
      relatedAcademicEventId: event.id,
      quietHoursConfig,
      metadata: {
        academicEventId: event.id,
        eventType: event.type,
      },
    });
    scheduledReminders.push(res.reminder);
  }

  return {
    scheduledCount: scheduledReminders.length,
    reminders: scheduledReminders,
    requiresStudentConfirmation: false,
  };
}
