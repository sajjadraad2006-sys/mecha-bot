import { z } from 'zod';
import { ValidationError } from '@mecha-bot/shared';
import { ROLES } from './roles.js';
import { ADMIN_PERMISSIONS } from './permissions.js';
import { COURSE_CODE_REGEX } from './scopes.js';
import { ASSIGNMENT_STATUSES } from './assignments.js';
import { REVIEW_STATUSES, REVIEW_TYPES } from './review.js';
import { AUDIT_OUTCOMES } from './audit.js';

export const ActorKeySchema = z
  .string()
  .trim()
  .min(1, 'Actor key must not be empty')
  .max(100, 'Actor key is too long')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Actor key must contain only letters, numbers, hyphens, and underscores',
  );

export const RoleSchema = z.enum(ROLES);

export const AdminPermissionSchema = z.enum(ADMIN_PERMISSIONS);

export const CourseCodeSchema = z
  .string()
  .trim()
  .regex(COURSE_CODE_REGEX, 'Course code must match standard format (e.g. MCT314, MATH101)');

export const AssignmentStatusSchema = z.enum(ASSIGNMENT_STATUSES);

export const ReviewTypeSchema = z.enum(REVIEW_TYPES);

export const ReviewStatusSchema = z.enum(REVIEW_STATUSES);

export const AuditOutcomeSchema = z.enum(AUDIT_OUTCOMES);

const IsoDateStringSchema = z
  .string()
  .refine((val) => !isNaN(new Date(val).getTime()), { message: 'Invalid ISO date string' });

export const CourseEditorAssignmentSchema = z
  .object({
    id: z.string().min(1),
    actorKey: ActorKeySchema,
    courseCode: CourseCodeSchema,
    permissions: z.array(AdminPermissionSchema).optional(),
    validFrom: IsoDateStringSchema.optional(),
    validTo: IsoDateStringSchema.optional(),
    assignedBy: ActorKeySchema,
    assignedAt: IsoDateStringSchema,
    status: AssignmentStatusSchema,
    revokedAt: IsoDateStringSchema.optional(),
    revokedBy: ActorKeySchema.optional(),
    revocationReason: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.validFrom && data.validTo) {
        return new Date(data.validFrom).getTime() <= new Date(data.validTo).getTime();
      }
      return true;
    },
    { message: 'validFrom must be earlier than or equal to validTo' },
  );

export const CreateAssignmentInputSchema = z
  .object({
    actorKey: ActorKeySchema,
    courseCode: CourseCodeSchema,
    permissions: z.array(AdminPermissionSchema).optional(),
    validFrom: IsoDateStringSchema.optional(),
    validTo: IsoDateStringSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.validFrom && data.validTo) {
        return new Date(data.validFrom).getTime() <= new Date(data.validTo).getTime();
      }
      return true;
    },
    { message: 'validFrom must be earlier than or equal to validTo' },
  );

export const ReviewHistoryEntrySchema = z.object({
  fromStatus: ReviewStatusSchema,
  toStatus: ReviewStatusSchema,
  changedBy: ActorKeySchema,
  changedAt: IsoDateStringSchema,
  reason: z.string().max(500).optional(),
});

export const ReviewItemSchema = z.object({
  id: z.string().min(1),
  type: ReviewTypeSchema,
  submittedBy: ActorKeySchema,
  courseCode: CourseCodeSchema.optional(),
  targetRef: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(200).optional(),
  summary: z.string().max(1000).optional(),
  submittedAt: IsoDateStringSchema,
  status: ReviewStatusSchema,
  reviewedBy: ActorKeySchema.optional(),
  reviewedAt: IsoDateStringSchema.optional(),
  decisionReason: z.string().max(500).optional(),
  version: z.number().int().min(1),
  history: z.array(ReviewHistoryEntrySchema),
});

export const CreateReviewItemInputSchema = z.object({
  type: ReviewTypeSchema,
  courseCode: CourseCodeSchema.optional(),
  targetRef: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(200).optional(),
  summary: z.string().max(1000).optional(),
});

export const ReviewDecisionInputSchema = z.object({
  itemId: z.string().min(1),
  decision: z.enum(['APPROVED', 'REJECTED', 'NEEDS_CHANGES']),
  reason: z.string().min(1, 'Decision reason is required').max(500),
  allowSuperAdminOverride: z.boolean().optional(),
});

export const AdminAuditEventSchema = z.object({
  id: z.string().min(1),
  actorKey: ActorKeySchema,
  action: z.string().min(1).max(100),
  resourceType: z.string().min(1).max(50),
  resourceKey: z.string().max(200).optional(),
  courseCode: CourseCodeSchema.optional(),
  outcome: AuditOutcomeSchema,
  reason: z.string().max(500).optional(),
  timestamp: IsoDateStringSchema,
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Validation helper throwing ValidationError on failure.
 */
export function validateWithSchema<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    throw new ValidationError(
      `Validation failed for ${context}: ${errorDetails}`,
      result.error.format(),
    );
  }
  return result.data;
}
