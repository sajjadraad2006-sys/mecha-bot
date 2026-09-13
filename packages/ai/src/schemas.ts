import { z } from 'zod';

export const AcademicResponseSchema = z.object({
  intent: z.enum([
    'EXAM_LOOKUP',
    'LECTURER_REQUIREMENTS',
    'COURSE_IDENTITY',
    'CONCEPT_EXPLANATION',
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
      }),
    )
    .default([]),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  assumptions: z.array(z.string()).default([]),
  needsClarification: z.boolean().default(false),
});

export type AcademicResponse = z.infer<typeof AcademicResponseSchema>;
