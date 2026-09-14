/**
 * Bridge D: Timetable (M3) -> Scheduler (M4)
 *
 * Generates and schedules reminders for upcoming lectures from the Timetable service.
 * Honors Baghdad timezone, suppresses OUTDATED slots, and respects Quiet Hours.
 */

import type { TimetableService, TimetableSlot } from '@mecha-bot/timetable';
import {
  createUtcDateFromZonedParts,
  DEFAULT_ACADEMIC_TIMEZONE,
  type Reminder,
  type ReminderSchedulerService,
  type ReminderSourceType,
} from '@mecha-bot/scheduler';
import type {
  LectureRemindersResult,
  StudentScheduleRequest,
  TimetableReminderOptions,
} from '../types.js';

export interface ScheduleTimetableRemindersParams {
  request: StudentScheduleRequest;
  options?: TimetableReminderOptions | undefined;
}

/**
 * Schedules lecture reminders for a student on a specific academic calendar date.
 */
export async function scheduleLectureRemindersFromTimetable(
  timetableService: TimetableService,
  schedulerService: ReminderSchedulerService,
  params: ScheduleTimetableRemindersParams,
): Promise<LectureRemindersResult> {
  const { request, options } = params;
  const offsetMinutes = options?.offsetMinutes ?? -30; // default 30 minutes before lecture
  const quietHoursConfig = options?.quietHoursConfig;

  // 1. Fetch slots for the student/date
  const slots: TimetableSlot[] =
    request.stage !== undefined && request.programSemester !== undefined
      ? timetableService.getScheduleForStudentDate({
          stage: request.stage,
          programSemester: request.programSemester,
          date: request.date,
          section: request.section,
          subgroup: request.subgroup,
        })
      : timetableService.getScheduleForDay({
          stage: request.stage,
          programSemester: request.programSemester,
          date: request.date,
          section: request.section,
          subgroup: request.subgroup,
        });

  // 2. Filter out outdated slots
  const validSlots = slots.filter((slot) => slot.sourceStatus !== 'OUTDATED');

  const scheduledReminders: Reminder[] = [];
  let deferredCount = 0;

  for (const slot of validSlots) {
    const [startHourStr, startMinStr] = slot.startTime.split(':');
    const startHour = parseInt(startHourStr || '8', 10);
    const startMinute = parseInt(startMinStr || '0', 10);

    const [yearStr, monthStr, dayStr] = (request.date || '2026-10-15').split('-');
    const year = parseInt(yearStr || '2026', 10);
    const month = parseInt(monthStr || '10', 10);
    const day = parseInt(dayStr || '15', 10);

    // Compute lecture start in UTC
    const lectureUtcDate = createUtcDateFromZonedParts(
      { year, month, day, hour: startHour, minute: startMinute },
      DEFAULT_ACADEMIC_TIMEZONE,
    );

    // Reminder dueAt = lectureStart + offsetMinutes
    const reminderTimestamp = lectureUtcDate.getTime() + offsetMinutes * 60 * 1000;
    const dueAt = new Date(reminderTimestamp);

    const sourceType: ReminderSourceType =
      slot.sourceStatus === 'VERIFIED' ? 'STUDENT_CONFIRMED' : 'SYSTEM_DERIVED';

    const result = await schedulerService.createReminder({
      userKey: request.studentKey,
      kind: 'LECTURE',
      title: `محاضرة: ${slot.courseCode}`,
      description: `${slot.type} (${slot.room || 'القاعة'}) من ${slot.startTime} إلى ${slot.endTime}`,
      dueAt,
      timezone: DEFAULT_ACADEMIC_TIMEZONE,
      sourceType,
      relatedCourseCode: slot.courseCode,
      quietHoursConfig,
      isExplicitlyRequested: false,
      metadata: {
        slotId: slot.id,
        weekday: slot.weekday,
        room: slot.room,
        section: slot.section,
        subgroup: slot.subgroup,
      },
    });

    scheduledReminders.push(result.reminder);
    if (result.quietHoursEvaluation?.decision === 'DEFER_UNTIL_QUIET_HOURS_END') {
      deferredCount++;
    }
  }

  return {
    scheduledCount: scheduledReminders.length,
    reminders: scheduledReminders,
    deferredDueToQuietHours: deferredCount,
  };
}
