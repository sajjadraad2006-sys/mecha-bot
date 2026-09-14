import { isValidAcademicDate, ValidationError } from '@mecha-bot/shared';
import {
  PROGRESS_SIGNAL_TYPES,
  SESSION_TYPES,
  STUDENT_TOPIC_STATES,
  type NewProgressSignal,
  type SaveDailyCheckInInput,
  type SelfReportedConfidence,
  type StartStudySessionInput,
  type UpdateStudentCourseCompanionStateInput,
} from './types.js';

const UTC_ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export function requireNonEmpty(value: string, field: string): string {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError(`${field} must not be empty`);
  }
  return normalized;
}

export function requireUtcIso(value: string, field: string): string {
  if (!UTC_ISO_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    throw new ValidationError(`${field} must be a valid UTC ISO timestamp`);
  }
  return value;
}

export function validateStartStudySessionInput(input: StartStudySessionInput): void {
  requireNonEmpty(input.studentKey, 'studentKey');
  if (!SESSION_TYPES.includes(input.type)) {
    throw new ValidationError(`Unsupported session type: ${String(input.type)}`);
  }
  if (
    input.plannedDurationMinutes !== undefined &&
    (!Number.isInteger(input.plannedDurationMinutes) || input.plannedDurationMinutes <= 0)
  ) {
    throw new ValidationError('plannedDurationMinutes must be a positive integer');
  }
}

export function parseSelfReportedConfidence(value: number): SelfReportedConfidence {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new ValidationError('selfReportedConfidence must be an integer from 1 to 5');
  }
  return value as SelfReportedConfidence;
}

export function validateDailyCheckInInput(input: SaveDailyCheckInInput): void {
  requireNonEmpty(input.studentKey, 'studentKey');
  if (input.localDate !== undefined && !isValidAcademicDate(input.localDate)) {
    throw new ValidationError('localDate must be a valid YYYY-MM-DD calendar date');
  }
  if (input.selfReportedConfidence !== undefined) {
    parseSelfReportedConfidence(input.selfReportedConfidence);
  }
}

export function validateProgressSignal(input: NewProgressSignal): void {
  requireNonEmpty(input.studentKey, 'studentKey');
  requireNonEmpty(input.courseCode, 'courseCode');
  requireNonEmpty(input.topicKey, 'topicKey');
  requireUtcIso(input.occurredAt, 'occurredAt');
  if (!PROGRESS_SIGNAL_TYPES.includes(input.type)) {
    throw new ValidationError(`Unsupported progress signal type: ${String(input.type)}`);
  }

  switch (input.type) {
    case 'SELF_RATING':
      parseSelfReportedConfidence(input.selfReportedConfidence);
      break;
    case 'QUIZ_RESULT': {
      const { score, maxScore, percentage } = input.quizDerivedPerformance;
      if (maxScore <= 0 || score < 0 || score > maxScore) {
        throw new ValidationError('Quiz score must be between zero and maxScore');
      }
      const expected = (score / maxScore) * 100;
      if (percentage < 0 || percentage > 100 || Math.abs(percentage - expected) > 0.000001) {
        throw new ValidationError('Quiz percentage must match score divided by maxScore');
      }
      break;
    }
    case 'STUDY_SESSION':
      requireNonEmpty(input.sessionId, 'sessionId');
      if (input.completedMinutes < 0 || !Number.isFinite(input.completedMinutes)) {
        throw new ValidationError('completedMinutes must be a non-negative number');
      }
      break;
    case 'REPEATED_QUESTION':
      if (!Number.isInteger(input.count) || input.count <= 0) {
        throw new ValidationError('Repeated-question count must be a positive integer');
      }
      break;
    case 'MANUAL_STUDENT_STATUS':
      if (!STUDENT_TOPIC_STATES.includes(input.state)) {
        throw new ValidationError(`Unsupported topic state: ${String(input.state)}`);
      }
      break;
  }
}

export function validateCourseCompanionStateInput(
  input: UpdateStudentCourseCompanionStateInput,
): void {
  requireNonEmpty(input.studentKey, 'studentKey');
  requireNonEmpty(input.courseCode, 'courseCode');
  if (input.missedFromDate !== undefined && !isValidAcademicDate(input.missedFromDate)) {
    throw new ValidationError('missedFromDate must be a valid YYYY-MM-DD calendar date');
  }
  if (input.catchUpRequestedAt !== undefined) {
    requireUtcIso(input.catchUpRequestedAt, 'catchUpRequestedAt');
  }
}
