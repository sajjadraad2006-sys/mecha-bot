import { z } from 'zod';
import type { AcademicFileRecord, StorageReference } from './types.js';

export const DOCUMENT_TYPES = [
  'LECTURER_NOTE',
  'LECTURE_SLIDES',
  'PAST_EXAM',
  'QUIZ',
  'ASSIGNMENT',
  'STUDENT_NOTE',
  'TEXTBOOK',
  'SOLUTION_MANUAL',
  'OFFICIAL_PROGRAM',
  'OFFICIAL_SYLLABUS',
  'SUPPORTING_REFERENCE',
  'OTHER',
  'UNKNOWN',
] as const;
export const DocumentTypeSchema = z.enum(DOCUMENT_TYPES);

export const SOURCE_AUTHORITIES = [
  'OFFICIAL',
  'FACULTY',
  'STUDENT',
  'EXTERNAL',
  'UNKNOWN',
] as const;
export const SourceAuthoritySchema = z.enum(SOURCE_AUTHORITIES);

export const VERIFICATION_STATUSES = ['RAW', 'CATALOGED', 'VERIFIED', 'REJECTED'] as const;
export const VerificationStatusSchema = z.enum(VERIFICATION_STATUSES);

export const POLICY_STATES = ['ALLOWED', 'RESTRICTED', 'UNKNOWN', 'PROHIBITED'] as const;
export const PolicyStateSchema = z.enum(POLICY_STATES);

export const STORAGE_KINDS = [
  'TELEGRAM_FILE_ID',
  'EXTERNAL_URL',
  'LOCAL_ARCHIVE_REFERENCE',
  'GOOGLE_DRIVE_REFERENCE',
  'UNKNOWN',
] as const;
export const StorageKindSchema = z.enum(STORAGE_KINDS);

export const FILE_VISIBILITIES = ['GLOBAL', 'COURSE_SHARED', 'PRIVATE_STUDENT'] as const;
export const FileVisibilitySchema = z.enum(FILE_VISIBILITIES);

export const ARCHIVE_STATUSES = ['CURRENT', 'ARCHIVE', 'UNKNOWN'] as const;
export const ArchiveStatusSchema = z.enum(ARCHIVE_STATUSES);

export const PROHIBITED_PIRACY_DOMAINS = [
  'z-lib',
  'zlibrary',
  'annas-archive',
  'anna-archive',
  'libgen',
  'librarygenesis',
  'sci-hub',
  'scihub',
  'torrent',
  'thepiratebay',
];

export function isProhibitedUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return PROHIBITED_PIRACY_DOMAINS.some((domain) => host.includes(domain));
  } catch {
    return true; // Malformed URLs are considered prohibited/invalid
  }
}

export const StorageReferenceMetadataSchema = z.object({
  telegramFileUniqueId: z.string().optional(),
  vaultChatReference: z.string().optional(),
  vaultMessageReference: z.string().optional(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
  mimeType: z.string().optional(),
});

export const StorageReferenceSchema = z
  .object({
    kind: StorageKindSchema,
    value: z.string().min(1, 'Storage reference value cannot be empty'),
    metadata: StorageReferenceMetadataSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kind === 'TELEGRAM_FILE_ID') {
      if (data.value.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Telegram file_id must not be empty or whitespace',
          path: ['value'],
        });
      }
    } else if (data.kind === 'EXTERNAL_URL') {
      try {
        const parsed = new URL(data.value);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'External URL must use http or https protocol',
            path: ['value'],
          });
        }
        if (isProhibitedUrl(data.value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'External URL points to a prohibited or piracy domain',
            path: ['value'],
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid external URL format',
          path: ['value'],
        });
      }
    }
  });

export const DistributionPolicyRecordSchema = z.object({
  canSearch: z.boolean(),
  canQuote: z.boolean(),
  canDistribute: z.boolean(),
  policyState: PolicyStateSchema,
  reason: z.string().optional(),
});

export const AcademicFileRecordSchema = z
  .object({
    id: z.string().min(1, 'File id is required'),
    contentHash: z.string().min(1).optional(),
    courseCode: z.string().min(1).optional(),
    title: z.string().min(1, 'Title is required'),
    originalFilename: z.string().optional(),
    documentType: DocumentTypeSchema,
    academicYear: z
      .string()
      .regex(/^\d{4}-\d{4}$/, 'Expected academic year format YYYY-YYYY')
      .optional(),
    sourceAuthority: SourceAuthoritySchema,
    evidenceScope: z.string().optional(),
    verificationStatus: VerificationStatusSchema,
    distributionPolicy: DistributionPolicyRecordSchema,
    storageReference: StorageReferenceSchema.optional(),
    visibility: FileVisibilitySchema,
    studentKey: z.string().optional(),
    archiveStatus: ArchiveStatusSchema,
    versionLabel: z.string().optional(),
    supersedes: z.string().optional(),
    createdAt: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/)),
    updatedAt: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/)),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.visibility === 'PRIVATE_STUDENT' &&
      (!data.studentKey || data.studentKey.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'studentKey is required when visibility is PRIVATE_STUDENT',
        path: ['studentKey'],
      });
    }
  });

export function validateAcademicFileRecord(input: unknown): {
  valid: boolean;
  errors?: string[] | undefined;
  data?: AcademicFileRecord | undefined;
} {
  const result = AcademicFileRecordSchema.safeParse(input);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
  }
  return {
    valid: true,
    data: result.data as AcademicFileRecord,
  };
}

export function validateStorageReference(input: unknown): {
  valid: boolean;
  errors?: string[] | undefined;
  data?: StorageReference | undefined;
} {
  const result = StorageReferenceSchema.safeParse(input);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
  }
  return {
    valid: true,
    data: result.data as StorageReference,
  };
}
