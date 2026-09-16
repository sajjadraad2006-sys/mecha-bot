import type { AcademicTopic, Stage, ProgramSemester } from '@mecha-bot/academic';
import type { StudentCoursePosition } from '@mecha-bot/navigator';
import type { AcademicProgressMetrics, CatchUpStatus, CourseMasteryStatus } from './types.js';

export interface CourseMasteryInput {
  courseCode: string;
  courseTitle: string;
  topics: AcademicTopic[];
  topicMapStatus?:
    'COMPLETE' | 'PARTIAL' | 'IDENTITY_ONLY' | 'CONFLICTING' | 'VERIFIED' | undefined;
  position?: StudentCoursePosition | null | undefined;
  academicWeek: number;
  isTeachingWeek: boolean;
  totalTeachingWeeks?: number | undefined;
}

export function calculateCourseMastery(input: CourseMasteryInput): CourseMasteryStatus {
  const {
    courseCode,
    courseTitle,
    topics,
    topicMapStatus,
    position,
    academicWeek,
    isTeachingWeek,
    totalTeachingWeeks = 15,
  } = input;

  const normalizedCode = courseCode.toUpperCase();

  // Invariant 3: MCT124 CONFLICTING / UNRESOLVED
  if (normalizedCode === 'MCT124' || topicMapStatus === 'CONFLICTING') {
    return {
      courseCode,
      courseTitle,
      totalTopics: topics.length,
      confirmedTopicsCount: 0,
      confirmedMasteryPercentage: null,
      calendarExpectedTopicsCount: 0,
      calendarExpectedPercentage: null,
      hasConflict: true,
      isIdentityOnly: false,
      catchUpStatus: 'CONFLICTING',
      catchUpGapCount: 0,
    };
  }

  // Invariant 4: P4MCT IDENTITY_ONLY
  if (normalizedCode === 'P4MCT' || topicMapStatus === 'IDENTITY_ONLY') {
    return {
      courseCode,
      courseTitle,
      totalTopics: topics.length,
      confirmedTopicsCount: 0,
      confirmedMasteryPercentage: null,
      calendarExpectedTopicsCount: 0,
      calendarExpectedPercentage: null,
      hasConflict: false,
      isIdentityOnly: true,
      catchUpStatus: 'IDENTITY_ONLY',
      catchUpGapCount: 0,
    };
  }

  const sortedTopics = [...topics].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const totalTopics = sortedTopics.length;

  if (totalTopics === 0) {
    return {
      courseCode,
      courseTitle,
      totalTopics: 0,
      confirmedTopicsCount: 0,
      confirmedMasteryPercentage: 0,
      calendarExpectedTopicsCount: 0,
      calendarExpectedPercentage: 0,
      hasConflict: false,
      isIdentityOnly: false,
      catchUpStatus: 'ON_TRACK',
      catchUpGapCount: 0,
    };
  }

  // Invariant 1: EXPECTED != CONFIRMED_BY_STUDENT
  // Confirmed mastery is derived solely from student confirmation.
  let confirmedTopicsCount = 0;
  if (position && position.status === 'CONFIRMED_BY_STUDENT') {
    const key =
      position.lastUnderstoodTopicKey ??
      position.lastAttendedTopicKey ??
      position.currentStudyTopicKey;

    if (key) {
      const idx = sortedTopics.findIndex((t) => t.topicKey === key);
      if (idx >= 0) {
        confirmedTopicsCount = idx + 1;
      }
    }
  }

  // Calendar expected mastery is derived from academic calendar week
  let calendarExpectedTopicsCount = 0;
  if (isTeachingWeek && academicWeek > 0) {
    const byNominal = sortedTopics.filter(
      (t) => t.nominalWeek !== undefined && t.nominalWeek <= academicWeek,
    );
    if (byNominal.length > 0) {
      calendarExpectedTopicsCount = Math.min(totalTopics, byNominal.length);
    } else {
      calendarExpectedTopicsCount = Math.min(
        totalTopics,
        Math.round((academicWeek / totalTeachingWeeks) * totalTopics),
      );
    }
  }

  const confirmedMasteryPercentage = Math.min(
    100,
    Math.round((confirmedTopicsCount / totalTopics) * 100),
  );
  const calendarExpectedPercentage = Math.min(
    100,
    Math.round((calendarExpectedTopicsCount / totalTopics) * 100),
  );

  const catchUpGapCount = Math.max(0, calendarExpectedTopicsCount - confirmedTopicsCount);

  let catchUpStatus: CatchUpStatus = 'ON_TRACK';
  if (confirmedTopicsCount === 0 && calendarExpectedTopicsCount > 0) {
    catchUpStatus = 'NEEDS_BASELINE';
  } else if (confirmedTopicsCount < calendarExpectedTopicsCount) {
    catchUpStatus = 'BEHIND';
  } else if (confirmedTopicsCount > calendarExpectedTopicsCount) {
    catchUpStatus = 'AHEAD';
  } else {
    catchUpStatus = 'ON_TRACK';
  }

  return {
    courseCode,
    courseTitle,
    totalTopics,
    confirmedTopicsCount,
    confirmedMasteryPercentage,
    calendarExpectedTopicsCount,
    calendarExpectedPercentage,
    hasConflict: false,
    isIdentityOnly: false,
    catchUpStatus,
    catchUpGapCount,
  };
}

export interface AcademicProgressInput {
  courses: CourseMasteryStatus[];
  stage: Stage;
  programSemester: ProgramSemester;
  academicWeek: number;
  isTeachingWeek: boolean;
}

export function calculateAcademicProgress(input: AcademicProgressInput): AcademicProgressMetrics {
  const { courses, stage, programSemester, academicWeek, isTeachingWeek } = input;

  // Exclude null-percentage courses (MCT124, P4MCT) from numeric aggregate
  const scorableCourses = courses.filter(
    (c) => c.confirmedMasteryPercentage !== null && c.totalTopics > 0,
  );

  let totalTopics = 0;
  let totalConfirmedTopics = 0;
  let totalCalendarExpectedTopics = 0;

  for (const c of scorableCourses) {
    totalTopics += c.totalTopics;
    totalConfirmedTopics += c.confirmedTopicsCount;
    totalCalendarExpectedTopics += c.calendarExpectedTopicsCount;
  }

  const overallConfirmedMasteryPercentage =
    totalTopics > 0 ? Math.min(100, Math.round((totalConfirmedTopics / totalTopics) * 100)) : 0;

  const overallCalendarExpectedPercentage =
    totalTopics > 0
      ? Math.min(100, Math.round((totalCalendarExpectedTopics / totalTopics) * 100))
      : 0;

  const coursesNeedingCatchUpCount = courses.filter(
    (c) => c.catchUpStatus === 'BEHIND' || c.catchUpStatus === 'NEEDS_BASELINE',
  ).length;

  return {
    stage,
    programSemester,
    academicWeek,
    isTeachingWeek,
    overallConfirmedMasteryPercentage,
    overallCalendarExpectedPercentage,
    coursesTrackedCount: courses.length,
    coursesNeedingCatchUpCount,
  };
}
