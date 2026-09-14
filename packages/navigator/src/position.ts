import {
  StudentCoursePosition,
  CalendarPosition,
  CoursePulsePosition,
  CoursePositionSnapshot,
  PositionStatus,
  PositionSource,
} from './types.js';

export interface UpdateStudentPositionInput {
  studentKey: string;
  courseCode: string;
  lastAttendedTopicKey?: string | undefined;
  lastUnderstoodTopicKey?: string | undefined;
  currentStudyTopicKey?: string | undefined;
  status?: PositionStatus | undefined;
  source?: PositionSource | undefined;
  selfReportedDifficulty?: number | undefined;
  selfReportedConfidence?: number | undefined;
  updatedAt?: string | undefined;
}

/**
 * Creates or updates a student course position.
 * Respects strict evidence rules: student self-reports have status 'CONFIRMED_BY_STUDENT'
 * and source 'STUDENT', and do not declare objective mastery or mutate shared class pulses.
 */
export function createOrUpdateStudentPosition(
  existing: StudentCoursePosition | null,
  input: UpdateStudentPositionInput,
): StudentCoursePosition {
  const now = input.updatedAt || new Date().toISOString();

  const status: PositionStatus = input.status || 'CONFIRMED_BY_STUDENT';
  const source: PositionSource = input.source || 'STUDENT';

  // Rule: INFERRED never becomes VERIFIED automatically
  if (existing?.status === 'INFERRED' && status === 'VERIFIED' && source === 'SYSTEM_INFERENCE') {
    throw new Error('SYSTEM_INFERENCE cannot promote INFERRED position to VERIFIED');
  }

  // Rule: EXPECTED never becomes CONFIRMED automatically without student or editor action
  if (status === 'CONFIRMED_BY_STUDENT' && source === 'ACADEMIC_CALENDAR') {
    throw new Error('ACADEMIC_CALENDAR cannot set CONFIRMED_BY_STUDENT status');
  }

  return {
    id: existing ? existing.id : `pos_${input.studentKey}_${input.courseCode}_${Date.now()}`,
    studentKey: input.studentKey,
    courseCode: input.courseCode.toUpperCase(),
    lastAttendedTopicKey:
      input.lastAttendedTopicKey !== undefined
        ? input.lastAttendedTopicKey
        : existing?.lastAttendedTopicKey,
    lastUnderstoodTopicKey:
      input.lastUnderstoodTopicKey !== undefined
        ? input.lastUnderstoodTopicKey
        : existing?.lastUnderstoodTopicKey,
    currentStudyTopicKey:
      input.currentStudyTopicKey !== undefined
        ? input.currentStudyTopicKey
        : existing?.currentStudyTopicKey,
    status,
    source,
    selfReportedDifficulty:
      input.selfReportedDifficulty !== undefined
        ? input.selfReportedDifficulty
        : existing?.selfReportedDifficulty,
    selfReportedConfidence:
      input.selfReportedConfidence !== undefined
        ? input.selfReportedConfidence
        : existing?.selfReportedConfidence,
    updatedAt: now,
  };
}

/**
 * Constructs a multi-truth unified snapshot for a course.
 * Preserves the 3 separate positions without collapsing them.
 */
export function buildCoursePositionSnapshot(params: {
  courseCode: string;
  calendarPosition?: CalendarPosition | undefined;
  coursePulse?: CoursePulsePosition | undefined;
  studentPosition?: StudentCoursePosition | undefined;
}): CoursePositionSnapshot {
  return {
    courseCode: params.courseCode.toUpperCase(),
    calendarPosition: params.calendarPosition,
    coursePulse: params.coursePulse,
    studentPosition: params.studentPosition,
  };
}
