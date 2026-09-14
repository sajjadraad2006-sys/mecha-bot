import { z } from 'zod';
import type { TimetableSlot } from './types.js';

export const WEEKDAYS = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

export const WeekdaySchema = z.enum(WEEKDAYS);

export const TIMETABLE_SLOT_TYPES = ['LECTURE', 'LAB', 'TUTORIAL', 'OTHER'] as const;
export const TimetableSlotTypeSchema = z.enum(TIMETABLE_SLOT_TYPES);

export const SOURCE_STATUSES = [
  'VERIFIED',
  'STUDENT_CONFIRMED',
  'ADMIN_ENTERED',
  'CANDIDATE',
  'OUTDATED',
] as const;
export const SourceStatusSchema = z.enum(SOURCE_STATUSES);

export const TIME_STRING_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export const TimeStringSchema = z
  .string()
  .regex(TIME_STRING_REGEX, 'Invalid time format. Expected HH:MM (24-hour)');

export const ACADEMIC_DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
export const AcademicDateSchema = z
  .string()
  .regex(ACADEMIC_DATE_REGEX, 'Invalid academic date format. Expected YYYY-MM-DD');

export const TimetableSlotSchema = z
  .object({
    id: z.string().min(1, 'id is required'),
    courseCode: z.string().min(1, 'courseCode is required'),
    courseOfferingId: z.string().optional(),
    stage: z.number().int().min(1).max(4),
    programSemester: z.number().int().min(1).max(8),
    section: z.string().min(1).optional(),
    subgroup: z.string().min(1).optional(),
    type: TimetableSlotTypeSchema,
    weekday: WeekdaySchema,
    startTime: TimeStringSchema,
    endTime: TimeStringSchema,
    room: z.string().min(1).optional(),
    lecturerDisplayName: z.string().min(1).optional(),
    validFrom: AcademicDateSchema.optional(),
    validTo: AcademicDateSchema.optional(),
    academicYearId: z.string().min(1).optional(),
    sourceStatus: SourceStatusSchema,
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      return data.startTime < data.endTime;
    },
    {
      message: 'startTime must be strictly before endTime',
      path: ['endTime'],
    },
  )
  .refine(
    (data) => {
      if (data.validFrom && data.validTo) {
        return data.validFrom <= data.validTo;
      }
      return true;
    },
    {
      message: 'validFrom must be before or equal to validTo',
      path: ['validTo'],
    },
  );

export const TimetableQueryFilterSchema = z.object({
  stage: z.number().int().min(1).max(4).optional(),
  programSemester: z.number().int().min(1).max(8).optional(),
  section: z.string().optional(),
  subgroup: z.string().optional(),
  weekday: WeekdaySchema.optional(),
  date: AcademicDateSchema.optional(),
  includeOutdated: z.boolean().optional(),
  sourceStatuses: z.array(SourceStatusSchema).optional(),
  courseCode: z.string().optional(),
  type: TimetableSlotTypeSchema.optional(),
});

export function validateSlot(input: unknown): {
  valid: boolean;
  errors?: string[];
  data?: TimetableSlot;
} {
  const result = TimetableSlotSchema.safeParse(input);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
    };
  }
  return {
    valid: true,
    data: result.data as TimetableSlot,
  };
}
