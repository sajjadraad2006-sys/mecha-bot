import { ValidationError } from '@mecha-bot/shared';
import {
  CONFIRMATION_STATUSES,
  COVERAGE_STATUSES,
  EVENT_SOURCE_STATUSES,
  EVENT_TYPES,
  SOLUTION_STATUSES,
  VERIFICATION_STATUSES,
  type CreateAcademicEventInput,
  type CreatePastExamQuestionInput,
  type CreatePracticeQuizInput,
  type EventCoverageItem,
  type NewQuizQuestion,
} from './types.js';

const UTC_ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const ACADEMIC_YEAR_PATTERN = /^\d{4}-\d{4}$/;

export function requireText(value: string, field: string): string {
  const normalized = value.trim();
  if (normalized.length === 0) throw new ValidationError(`${field} must not be empty`);
  return normalized;
}

export function validateUtcTimestamp(value: string, field: string): void {
  if (!UTC_ISO_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    throw new ValidationError(`${field} must be a valid UTC ISO timestamp`);
  }
}

export function validateCoverageItem(item: EventCoverageItem, eventCourseCode: string): void {
  if (requireText(item.courseCode, 'coverage.courseCode') !== eventCourseCode.trim()) {
    throw new ValidationError('Coverage courseCode must match the event courseCode');
  }
  if (!COVERAGE_STATUSES.includes(item.status)) {
    throw new ValidationError(`Unsupported coverage status: ${String(item.status)}`);
  }
  if (
    (item.topicKey === undefined || item.topicKey.trim() === '') &&
    (item.freeTextLabel === undefined || item.freeTextLabel.trim() === '')
  ) {
    throw new ValidationError('Coverage requires a topicKey or freeTextLabel');
  }
}

export function validateAcademicEventInput(input: CreateAcademicEventInput): void {
  requireText(input.courseCode, 'courseCode');
  requireText(input.title, 'title');
  if (!EVENT_TYPES.includes(input.type)) {
    throw new ValidationError(`Unsupported event type: ${String(input.type)}`);
  }
  if (!EVENT_SOURCE_STATUSES.includes(input.sourceStatus)) {
    throw new ValidationError(`Unsupported event source status: ${String(input.sourceStatus)}`);
  }
  if (!CONFIRMATION_STATUSES.includes(input.confirmationStatus)) {
    throw new ValidationError(
      `Unsupported confirmation status: ${String(input.confirmationStatus)}`,
    );
  }
  if (input.sourceStatus === 'INFERRED' && input.confirmationStatus === 'CONFIRMED') {
    throw new ValidationError('An inferred event cannot be marked CONFIRMED without new evidence');
  }
  if (input.occursAt !== undefined) validateUtcTimestamp(input.occursAt, 'occursAt');
  if (input.dueAt !== undefined) validateUtcTimestamp(input.dueAt, 'dueAt');
  if (
    input.occursAt !== undefined &&
    input.dueAt !== undefined &&
    Date.parse(input.occursAt) > Date.parse(input.dueAt)
  ) {
    throw new ValidationError('occursAt cannot be after dueAt');
  }

  if (['QUIZ', 'MIDTERM', 'FINAL_EXAM'].includes(input.type) && input.occursAt === undefined) {
    throw new ValidationError(`${input.type} requires occursAt`);
  }
  if (
    ['ASSIGNMENT', 'REPORT', 'PROJECT', 'DEADLINE'].includes(input.type) &&
    input.dueAt === undefined
  ) {
    throw new ValidationError(`${input.type} requires dueAt`);
  }
  if (input.type === 'OTHER' && input.occursAt === undefined && input.dueAt === undefined) {
    throw new ValidationError('OTHER event requires occursAt or dueAt');
  }
  if (input.academicYear !== undefined && !ACADEMIC_YEAR_PATTERN.test(input.academicYear)) {
    throw new ValidationError('academicYear must use YYYY-YYYY format');
  }
  for (const item of input.coverage ?? []) validateCoverageItem(item, input.courseCode);
}

export function validatePastExamQuestionInput(input: CreatePastExamQuestionInput): void {
  requireText(input.courseCode, 'courseCode');
  requireText(input.questionText, 'questionText');
  if (!ACADEMIC_YEAR_PATTERN.test(input.academicYear)) {
    throw new ValidationError('academicYear must use YYYY-YYYY format');
  }
  if (input.examType !== undefined && !EVENT_TYPES.includes(input.examType)) {
    throw new ValidationError(`Unsupported exam type: ${String(input.examType)}`);
  }
  if (input.page !== undefined && (!Number.isInteger(input.page) || input.page <= 0)) {
    throw new ValidationError('page must be a positive integer');
  }
  if (!SOLUTION_STATUSES.includes(input.solutionStatus)) {
    throw new ValidationError(`Unsupported solution status: ${String(input.solutionStatus)}`);
  }
  if (!VERIFICATION_STATUSES.includes(input.verificationStatus)) {
    throw new ValidationError(
      `Unsupported verification status: ${String(input.verificationStatus)}`,
    );
  }
}

export function validateQuizQuestion(input: NewQuizQuestion): void {
  requireText(input.prompt, 'question.prompt');
  if (!Number.isFinite(input.points) || input.points <= 0) {
    throw new ValidationError('question.points must be a positive number');
  }
  if (input.type === 'MULTIPLE_CHOICE') {
    if (input.options.length < 2) {
      throw new ValidationError('A multiple-choice question requires at least two options');
    }
    const ids = input.options.map((option) => requireText(option.id, 'option.id'));
    if (new Set(ids).size !== ids.length) {
      throw new ValidationError('Multiple-choice option IDs must be unique');
    }
    for (const option of input.options) requireText(option.text, 'option.text');
    if (!ids.includes(input.correctOptionId)) {
      throw new ValidationError('correctOptionId must identify one of the question options');
    }
  } else if (input.type !== 'TRUE_FALSE') {
    throw new ValidationError(`Unsupported quiz question type: ${String(input)}`);
  }
}

export function validatePracticeQuizInput(input: CreatePracticeQuizInput): void {
  requireText(input.courseCode, 'courseCode');
  requireText(input.title, 'title');
  if (input.questions.length === 0) throw new ValidationError('A practice quiz requires questions');
  for (const question of input.questions) validateQuizQuestion(question);
}
