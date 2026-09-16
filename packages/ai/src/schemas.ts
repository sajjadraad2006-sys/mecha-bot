import { z } from 'zod';

export const AcademicResponseSchema = z.object({
  intent: z.enum([
    'EXAM_LOOKUP',
    'LECTURER_REQUIREMENTS',
    'COURSE_IDENTITY',
    'CONCEPT_EXPLANATION',
    'COMPARISON',
    'REASONING_FOLLOWUP',
    'SUMMARY',
    'CLARIFICATION_NEEDED',
    'GENERAL',
  ]),
  courseCode: z.string().nullable(),
  topic: z.string().nullable(),
  answer: z.string().min(1),
  equations: z.array(z.string()).default([]),
  sourceRefs: z
    .array(
      z.object({
        sourceId: z.string(),
        page: z.number().optional(),
        title: z.string(),
        chunkId: z.string().optional(),
        authority: z.string().optional(),
      }),
    )
    .default([]),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  assumptions: z.array(z.string()).default([]),
  needsClarification: z.boolean().default(false),
  clarificationPrompt: z.string().optional(),
  suggestedClarifications: z.array(z.string()).default([]),
  disclaimer: z.string().optional(),
});

export type AcademicResponse = z.infer<typeof AcademicResponseSchema>;

export const AcademicSourceExcerptSchema = z.object({
  sourceId: z.string().min(1),
  sourceVersion: z.string().optional(),
  chunkId: z.string().optional(),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  page: z.number().int().positive().optional(),
  pageRange: z.tuple([z.number().int(), z.number().int()]).optional(),
  authority: z.string().optional(),
  evidenceScope: z.string().optional(),
  canDistribute: z.boolean().optional(),
});

export const AcademicAiContextSchema = z
  .object({
    stage: z.number().int().min(1).max(4),
    programSemester: z.number().int().min(1).max(8),
    courseCode: z.string().min(1),
    topic: z.string().optional(),
    studentQuestion: z.string().min(1),
    retrievedExcerpts: z.array(AcademicSourceExcerptSchema).default([]),
    academicPreferences: z
      .object({
        language: z.enum(['ar', 'en', 'bilingual']).optional(),
        detailLevel: z.enum(['concise', 'detailed', 'step_by_step']).optional(),
      })
      .optional(),
  })
  .strict();

export type AcademicAiContext = z.infer<typeof AcademicAiContextSchema>;

export const BudgetStatsSchema = z.object({
  date: z.string(),
  requestsToday: z.number().int().nonnegative(),
  estimatedNeuronsToday: z.number().nonnegative(),
  isExhausted: z.boolean(),
  allowPaidAi: z.literal(false),
  allowPaidStorage: z.literal(false),
  allowBillingFallback: z.literal(false),
});

export type BudgetStats = z.infer<typeof BudgetStatsSchema>;
