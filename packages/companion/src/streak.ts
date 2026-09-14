import {
  daysBetweenAcademicDates,
  formatToAcademicDate,
  parseAcademicDateParts,
} from '@mecha-bot/shared';
import {
  DEFAULT_STUDENT_TIME_ZONE,
  type StudyConsistencyMetrics,
  type StudySession,
} from './types.js';

function addCalendarDays(localDate: string, days: number): string {
  const { year, month, day } = parseAcademicDateParts(localDate);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function calculateStudyConsistency(
  sessions: StudySession[],
  referenceTime: Date,
  timeZone = DEFAULT_STUDENT_TIME_ZONE,
): StudyConsistencyMetrics {
  const completed = sessions.filter(
    (session) =>
      session.status === 'COMPLETED' &&
      session.type !== 'BREAK' &&
      session.endedAt !== undefined &&
      session.actualDurationMinutes !== undefined,
  );
  const referenceDate = formatToAcademicDate(referenceTime, timeZone);
  const studiedDates = new Set(
    completed.map((session) => formatToAcademicDate(new Date(session.endedAt!), timeZone)),
  );
  const daysInWindow = (days: number): number =>
    [...studiedDates].filter((date) => {
      const age = daysBetweenAcademicDates(date, referenceDate);
      return age >= 0 && age < days;
    }).length;

  let cursor = referenceDate;
  if (!studiedDates.has(cursor)) {
    const yesterday = addCalendarDays(referenceDate, -1);
    if (!studiedDates.has(yesterday)) {
      cursor = '';
    } else {
      cursor = yesterday;
    }
  }

  let currentStudyDayStreak = 0;
  while (cursor !== '' && studiedDates.has(cursor)) {
    currentStudyDayStreak += 1;
    cursor = addCalendarDays(cursor, -1);
  }

  return {
    daysStudiedLast7Days: daysInWindow(7),
    daysStudiedLast30Days: daysInWindow(30),
    currentStudyDayStreak,
    totalCompletedStudyMinutes: completed.reduce(
      (total, session) => total + session.actualDurationMinutes!,
      0,
    ),
  };
}
