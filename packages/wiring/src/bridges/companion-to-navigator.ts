/**
 * Bridge A: Companion (M5) -> Navigator (M9)
 *
 * Translates student study sessions and check-in signals into learning signals
 * for the Study Navigator service, while guaranteeing that INFERRED progress
 * or background session records NEVER silently declare CONFIRMED_BY_STUDENT.
 *
 * Core Product Invariant:
 * "Mecha Bot should infer, suggest, and confirm — never silently assume."
 */

import type { ProgressSignal, StudySession } from '@mecha-bot/companion';
import type {
  LearningSignalType,
  StudentCoursePosition,
  StudentLearningSignal,
  StudyNavigatorService,
} from '@mecha-bot/navigator';
import type { ConfirmPositionInput } from '../types.js';

/**
 * Translates an M5 Companion progress signal into an M9 Navigator learning signal.
 */
export function adaptCompanionSignalToNavigatorSignal(
  signal: ProgressSignal,
): Omit<StudentLearningSignal, 'id' | 'recordedAt'> {
  let type: LearningSignalType;
  let value: number | string | undefined;

  switch (signal.type) {
    case 'SELF_RATING':
      type = 'SELF_REPORTED_DIFFICULTY';
      // Invert 1..5 confidence to 5..1 difficulty for diagnosis, or keep direct
      value = 6 - signal.selfReportedConfidence;
      break;

    case 'QUIZ_RESULT':
      type = 'QUIZ_LOW_SCORE';
      value = signal.quizDerivedPerformance.percentage;
      break;

    case 'STUDY_SESSION':
      type = 'STUDY_SESSION';
      value = signal.completedMinutes;
      break;

    case 'REPEATED_QUESTION':
      type = 'REPEATED_QUESTION';
      value = signal.count;
      break;

    case 'MANUAL_STUDENT_STATUS':
      type = 'MANUAL_STATUS';
      value = signal.state;
      break;
  }

  return {
    studentKey: signal.studentKey,
    courseCode: signal.courseCode,
    topicKey: signal.topicKey,
    type,
    value,
  };
}

/**
 * Forwards an M5 progress signal to the M9 StudyNavigatorService.
 */
export async function forwardCompanionSignalToNavigator(
  navigator: StudyNavigatorService,
  signal: ProgressSignal,
): Promise<StudentLearningSignal> {
  const adapted = adaptCompanionSignalToNavigatorSignal(signal);
  return navigator.recordLearningSignal({
    ...adapted,
    recordedAt: signal.occurredAt,
  });
}

/**
 * Forwards a completed study session from M5 into M9 as a STUDY_SESSION learning signal.
 * Note: A completed study session does NOT mutate StudentCoursePosition to CONFIRMED_BY_STUDENT.
 * It strictly records an evidence signal.
 */
export async function forwardCompletedSessionToNavigator(
  navigator: StudyNavigatorService,
  session: StudySession,
): Promise<StudentLearningSignal | null> {
  if (!session.courseCode || session.status !== 'COMPLETED') {
    return null;
  }

  const completedMinutes = session.actualDurationMinutes ?? session.plannedDurationMinutes ?? 0;

  return navigator.recordLearningSignal({
    studentKey: session.studentKey,
    courseCode: session.courseCode,
    topicKey: session.topicKey,
    type: 'STUDY_SESSION',
    value: completedMinutes,
    recordedAt: session.endedAt || session.startedAt,
  });
}

/**
 * Explicit student confirmation entry point.
 * This is the ONLY operation that sets status: 'CONFIRMED_BY_STUDENT' with source: 'STUDENT'.
 * Background signals, calendar weeks, or inference algorithms cannot call this.
 */
export async function confirmStudentCoursePosition(
  navigator: StudyNavigatorService,
  input: ConfirmPositionInput,
): Promise<StudentCoursePosition> {
  return navigator.recordStudentPosition({
    studentKey: input.studentKey,
    courseCode: input.courseCode,
    lastUnderstoodTopicKey: input.topicKey,
    currentStudyTopicKey: input.topicKey,
    status: 'CONFIRMED_BY_STUDENT',
    source: 'STUDENT',
    selfReportedConfidence: input.confidence,
    selfReportedDifficulty: input.difficulty,
  });
}
