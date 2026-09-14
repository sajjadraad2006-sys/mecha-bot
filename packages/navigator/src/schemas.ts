import { z } from 'zod';

export const PositionStatusSchema = z.enum([
  'CONFIRMED_BY_STUDENT',
  'VERIFIED',
  'INFERRED',
  'EXPECTED',
  'UNKNOWN',
]);

export const PositionSourceSchema = z.enum([
  'STUDENT',
  'COURSE_EDITOR',
  'ACADEMIC_CALENDAR',
  'COURSE_PULSE',
  'SYSTEM_INFERENCE',
]);

export const PulseScopeSchema = z.enum(['GLOBAL', 'SECTION']);

export const CalendarPositionSchema = z.object({
  academicWeek: z.number().int().min(1).max(30).optional(),
  period: z.string().optional(),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.literal('EXPECTED'),
});

export const CoursePulsePositionSchema = z.object({
  courseCode: z.string().min(1),
  topicKey: z.string().optional(),
  freeTextTopic: z.string().optional(),
  status: PositionStatusSchema,
  source: PositionSourceSchema,
  scope: PulseScopeSchema.optional(),
  sectionKey: z.string().optional(),
  updatedAt: z.string().datetime({ offset: true }).or(z.string()),
});

export const StudentCoursePositionSchema = z.object({
  id: z.string().min(1),
  studentKey: z.string().min(1),
  courseCode: z.string().min(1),
  lastAttendedTopicKey: z.string().optional(),
  lastUnderstoodTopicKey: z.string().optional(),
  currentStudyTopicKey: z.string().optional(),
  status: PositionStatusSchema,
  source: PositionSourceSchema,
  selfReportedDifficulty: z.number().int().min(1).max(5).optional(),
  selfReportedConfidence: z.number().int().min(1).max(5).optional(),
  updatedAt: z.string().datetime({ offset: true }).or(z.string()),
});

export const StudentLearningSignalSchema = z.object({
  id: z.string().min(1),
  studentKey: z.string().min(1),
  courseCode: z.string().min(1),
  type: z.enum([
    'SELF_REPORTED_DIFFICULTY',
    'QUIZ_LOW_SCORE',
    'REPEATED_QUESTION',
    'STUDY_SESSION',
    'MANUAL_STATUS',
  ]),
  topicKey: z.string().optional(),
  value: z.union([z.number(), z.string()]).optional(),
  recordedAt: z.string().datetime({ offset: true }).or(z.string()),
});

export const StudyBudgetMinutesSchema = z
  .number()
  .int()
  .positive('Study budget duration must be a positive integer in minutes');
