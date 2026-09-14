import { describe, expect, it } from 'vitest';
import {
  createExternalUrlReference,
  createTelegramStorageReference,
  deduplicateByContentHash,
  DocumentTypeSchema,
  isExternalUrlReference,
  isProhibitedUrl,
  isTelegramStorageReference,
  markFileSuperseded,
  PolicyStateSchema,
  sanitizeStorageReferenceForDisplay,
  SourceAuthoritySchema,
  validateAcademicFileRecord,
  validateStorageReference,
  VerificationStatusSchema,
  type AcademicFileRecord,
} from '../packages/distribution/src/index.js';

describe('Distribution Domain - Schemas & Enums', () => {
  it('validates document types accurately', () => {
    expect(DocumentTypeSchema.parse('LECTURER_NOTE')).toBe('LECTURER_NOTE');
    expect(DocumentTypeSchema.parse('PAST_EXAM')).toBe('PAST_EXAM');
    expect(DocumentTypeSchema.parse('TEXTBOOK')).toBe('TEXTBOOK');
    expect(DocumentTypeSchema.parse('SOLUTION_MANUAL')).toBe('SOLUTION_MANUAL');
    expect(() => DocumentTypeSchema.parse('RANDOM_TYPE')).toThrow();
  });

  it('validates source authority and verification statuses', () => {
    expect(SourceAuthoritySchema.parse('OFFICIAL')).toBe('OFFICIAL');
    expect(SourceAuthoritySchema.parse('FACULTY')).toBe('FACULTY');
    expect(SourceAuthoritySchema.parse('STUDENT')).toBe('STUDENT');
    expect(() => SourceAuthoritySchema.parse('PIRATE_SITE')).toThrow();

    expect(VerificationStatusSchema.parse('RAW')).toBe('RAW');
    expect(VerificationStatusSchema.parse('CATALOGED')).toBe('CATALOGED');
    expect(VerificationStatusSchema.parse('VERIFIED')).toBe('VERIFIED');
    expect(VerificationStatusSchema.parse('REJECTED')).toBe('REJECTED');
  });

  it('validates policy states', () => {
    expect(PolicyStateSchema.parse('ALLOWED')).toBe('ALLOWED');
    expect(PolicyStateSchema.parse('RESTRICTED')).toBe('RESTRICTED');
    expect(PolicyStateSchema.parse('UNKNOWN')).toBe('UNKNOWN');
    expect(PolicyStateSchema.parse('PROHIBITED')).toBe('PROHIBITED');
  });
});

describe('Distribution Domain - Storage References', () => {
  it('creates valid Telegram file storage reference with synthetic metadata', () => {
    const ref = createTelegramStorageReference('BAACAgIAAxkBAAICsynthetic_file_id_01', {
      telegramFileUniqueId: 'AQADsynthetic_uniq_01',
      vaultChatReference: '-1001234567890',
      vaultMessageReference: '42',
      fileSizeBytes: 2048000,
      mimeType: 'application/pdf',
    });

    expect(ref.kind).toBe('TELEGRAM_FILE_ID');
    expect(ref.value).toBe('BAACAgIAAxkBAAICsynthetic_file_id_01');
    expect(ref.metadata?.vaultChatReference).toBe('-1001234567890');
    expect(isTelegramStorageReference(ref)).toBe(true);
    expect(isExternalUrlReference(ref)).toBe(false);
  });

  it('rejects empty or whitespace-only Telegram file_ids', () => {
    expect(() => createTelegramStorageReference('')).toThrow(/cannot be empty/);
    expect(() => createTelegramStorageReference('   ')).toThrow(/must not be empty or whitespace/);
  });

  it('creates valid external URL reference', () => {
    const ref = createExternalUrlReference('https://department.example.edu/academic/syllabus.pdf');
    expect(ref.kind).toBe('EXTERNAL_URL');
    expect(ref.value).toBe('https://department.example.edu/academic/syllabus.pdf');
    expect(isExternalUrlReference(ref)).toBe(true);
  });

  it('rejects malformed external URLs and non-http/https protocols', () => {
    expect(() => createExternalUrlReference('not-a-url')).toThrow(/Invalid external URL format/);
    expect(() => createExternalUrlReference('ftp://example.com/file.pdf')).toThrow(
      /must use http or https protocol/,
    );
  });

  it('strictly detects and blocks prohibited piracy domains', () => {
    expect(isProhibitedUrl('https://z-lib.is/book/123')).toBe(true);
    expect(isProhibitedUrl('https://annas-archive.org/md5/abc')).toBe(true);
    expect(isProhibitedUrl('https://libgen.is/book/index.php')).toBe(true);
    expect(isProhibitedUrl('https://thepiratebay.org/torrent/123')).toBe(true);
    expect(isProhibitedUrl('https://uobasrah.edu.iq/syllabus.pdf')).toBe(false);

    expect(() => createExternalUrlReference('https://z-lib.is/book/123')).toThrow(
      /prohibited or piracy domain/,
    );
  });

  it('sanitizes storage reference for student display without leaking raw file_id', () => {
    const tgRef = createTelegramStorageReference('SECRET_INTERNAL_FILE_ID_123');
    const sanitized = sanitizeStorageReferenceForDisplay(tgRef);

    expect(sanitized.hasDirectTelegramDelivery).toBe(true);
    expect(sanitized.hasExternalLink).toBe(false);
    expect('value' in sanitized).toBe(false); // raw token never exposed

    const emptySanitized = sanitizeStorageReferenceForDisplay(undefined);
    expect(emptySanitized.kind).toBe('NONE');
    expect(emptySanitized.hasDirectTelegramDelivery).toBe(false);

    // Test validateStorageReference helper
    const valResult = validateStorageReference(tgRef);
    expect(valResult.valid).toBe(true);
    const badResult = validateStorageReference({ kind: 'INVALID_KIND', value: '' });
    expect(badResult.valid).toBe(false);
  });
});

describe('Distribution Domain - AcademicFileRecord Validation', () => {
  const validRecord: AcademicFileRecord = {
    id: 'test-file-01',
    courseCode: 'TEST-DIST-MCT314',
    title: 'Control Systems Lecture Notes',
    originalFilename: 'control_notes.pdf',
    documentType: 'LECTURER_NOTE',
    academicYear: '2025-2026',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    visibility: 'GLOBAL',
    archiveStatus: 'CURRENT',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  };

  it('validates a complete academic file record', () => {
    const res = validateAcademicFileRecord(validRecord);
    expect(res.valid).toBe(true);
    expect(res.data?.id).toBe('test-file-01');
  });

  it('enforces studentKey when visibility is PRIVATE_STUDENT', () => {
    const privateWithoutKey: AcademicFileRecord = {
      ...validRecord,
      visibility: 'PRIVATE_STUDENT',
      studentKey: undefined,
    };
    const res = validateAcademicFileRecord(privateWithoutKey);
    expect(res.valid).toBe(false);
    expect(res.errors?.some((e) => e.includes('studentKey is required'))).toBe(true);

    const privateWithKey: AcademicFileRecord = {
      ...validRecord,
      visibility: 'PRIVATE_STUDENT',
      studentKey: 'student_synth_123',
    };
    expect(validateAcademicFileRecord(privateWithKey).valid).toBe(true);
  });

  it('rejects invalid academic year formats', () => {
    const invalidYear: AcademicFileRecord = {
      ...validRecord,
      academicYear: '2025/2026', // wrong delimiter
    };
    expect(validateAcademicFileRecord(invalidYear).valid).toBe(false);
  });
});

describe('Distribution Domain - Catalog Deduplication & Superseding', () => {
  const baseRecord: AcademicFileRecord = {
    id: 'rec-orig',
    contentHash: 'hash-abc-123',
    courseCode: 'TEST-DIST-MCT314',
    title: 'Original Upload',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'CATALOGED',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    visibility: 'GLOBAL',
    archiveStatus: 'ARCHIVE',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  };

  it('deduplicates records with identical contentHash preferring higher verification status', () => {
    const verifiedDuplicate: AcademicFileRecord = {
      ...baseRecord,
      id: 'rec-verified',
      title: 'Verified Official Copy',
      verificationStatus: 'VERIFIED',
      archiveStatus: 'CURRENT',
      updatedAt: '2026-09-02T08:00:00.000Z',
    };

    const records = [baseRecord, verifiedDuplicate];
    const deduplicated = deduplicateByContentHash(records);

    expect(deduplicated).toHaveLength(1);
    expect(deduplicated[0]?.id).toBe('rec-verified');
  });

  it('marks a file as superseded and updates archiveStatus to ARCHIVE', () => {
    const superseded = markFileSuperseded(baseRecord, 'rec-v2', '2026-09-10T10:00:00.000Z');
    expect(superseded.archiveStatus).toBe('ARCHIVE');
    expect(superseded.notes).toContain('Superseded by rec-v2');
    expect(superseded.updatedAt).toBe('2026-09-10T10:00:00.000Z');
  });
});
