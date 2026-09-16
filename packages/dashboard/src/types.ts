import type { Stage, ProgramSemester } from '@mecha-bot/academic';

export type CatchUpStatus =
  'ON_TRACK' | 'BEHIND' | 'AHEAD' | 'NEEDS_BASELINE' | 'CONFLICTING' | 'IDENTITY_ONLY';

export interface CourseMasteryStatus {
  courseCode: string;
  courseTitle: string;
  totalTopics: number;
  confirmedTopicsCount: number;
  confirmedMasteryPercentage: number | null;
  calendarExpectedTopicsCount: number;
  calendarExpectedPercentage: number | null;
  hasConflict: boolean;
  isIdentityOnly: boolean;
  catchUpStatus: CatchUpStatus;
  catchUpGapCount: number;
}

export interface AcademicProgressMetrics {
  stage: Stage;
  programSemester: ProgramSemester;
  academicWeek: number;
  isTeachingWeek: boolean;
  overallConfirmedMasteryPercentage: number;
  overallCalendarExpectedPercentage: number;
  coursesTrackedCount: number;
  coursesNeedingCatchUpCount: number;
}

export interface StudyActivityMetrics {
  currentStudyDayStreak: number;
  last7DaysSessionCount: number;
  last30DaysSessionCount: number;
  totalStudyMinutes: number;
  hasActiveSession: boolean;
  activeSessionCourseCode?: string | undefined;
}

export interface UpcomingEventSummary {
  id: string;
  courseCode: string;
  title: string;
  eventType: string;
  eventDate: string;
  daysRemaining: number;
}

export interface QuizPerformanceSummary {
  totalAttempts: number;
  averageScorePercentage: number;
  quizzesAttemptedCount: number;
  lastAttemptDate?: string | null | undefined;
}

export interface TimetableLectureSummary {
  courseCode: string;
  subjectName: string;
  room: string;
  startTime: string;
  endTime: string;
}

export interface TimetableSummary {
  todayLectureCount: number;
  nextLecture?: TimetableLectureSummary | null | undefined;
}

export interface PendingReminderSummary {
  id: string;
  title: string;
  scheduledFor: string;
}

export interface RemindersSummary {
  activePendingRemindersCount: number;
  nextReminder?: PendingReminderSummary | null | undefined;
}

export interface StudentDashboardSummary {
  studentKey: string;
  generatedAt: string;
  academicProgress: AcademicProgressMetrics;
  courses: CourseMasteryStatus[];
  studyActivity: StudyActivityMetrics;
  upcomingEvents: UpcomingEventSummary[];
  quizPerformance: QuizPerformanceSummary;
  timetable: TimetableSummary;
  reminders: RemindersSummary;
}

export interface StudentDashboardCriteria {
  studentKey: string;
  stage: Stage;
  programSemester: ProgramSemester;
  referenceDate?: Date | string | undefined;
  timeZone?: string | undefined;
  section?: string | undefined;
  subgroup?: string | undefined;
}
