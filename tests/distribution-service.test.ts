import { describe, expect, it } from 'vitest';
import {
  FileDistributionService,
  InMemoryFileCatalogRepository,
  SYNTHETIC_FILE_RECORDS,
} from '../packages/distribution/src/index.js';

describe('FileDistributionService - Catalog Queries & Ranking', () => {
  const repo = new InMemoryFileCatalogRepository(SYNTHETIC_FILE_RECORDS);
  const service = new FileDistributionService({ repository: repo });

  it('performs course-specific lookup accurately', async () => {
    const courseFiles = await service.listCourseFiles('TEST-DIST-MCT314');
    expect(courseFiles.length).toBeGreaterThan(0);
    for (const f of courseFiles) {
      expect(f.courseCode).toBe('TEST-DIST-MCT314');
    }
  });

  it('performs past exam year lookup accurately', async () => {
    const exams = await service.findFiles({
      courseCode: 'TEST-DIST-MCT314',
      documentType: 'PAST_EXAM',
      academicYear: '2024-2025',
    });

    expect(exams).toHaveLength(1);
    expect(exams[0]?.title).toContain('Final Exam 2024-2025');
    expect(exams[0]?.academicYear).toBe('2024-2025');
  });

  it('filters by verificationStatus', async () => {
    const verified = await service.findFiles({
      courseCode: 'TEST-DIST-MCT314',
      verificationStatus: 'VERIFIED',
    });
    expect(verified.length).toBeGreaterThan(0);
    for (const f of verified) {
      expect(f.verificationStatus).toBe('VERIFIED');
    }
  });

  it('respects private student files during search: hidden from unauthorized students', async () => {
    // Requester Alice (student_synth_123)
    const aliceFiles = await service.findFiles({
      courseCode: 'TEST-DIST-MCT314',
      requesterStudentKey: 'student_synth_123',
    });
    const aliceHasPrivate = aliceFiles.some((f) => f.id === 'file-rec-priv-123');
    expect(aliceHasPrivate).toBe(true);

    // Requester Bob (student_synth_bob)
    const bobFiles = await service.findFiles({
      courseCode: 'TEST-DIST-MCT314',
      requesterStudentKey: 'student_synth_bob',
    });
    const bobHasPrivate = bobFiles.some((f) => f.id === 'file-rec-priv-123');
    expect(bobHasPrivate).toBe(false);

    // Anonymous requester
    const anonFiles = await service.findFiles({
      courseCode: 'TEST-DIST-MCT314',
    });
    expect(anonFiles.some((f) => f.id === 'file-rec-priv-123')).toBe(false);
  });
});

describe('FileDistributionService - Delivery Decision Engine', () => {
  const repo = new InMemoryFileCatalogRepository(SYNTHETIC_FILE_RECORDS);
  const service = new FileDistributionService({ repository: repo });

  it('returns READY_TELEGRAM_FILE for a single authorized Telegram candidate', async () => {
    const decision = await service.requestFileDelivery({
      fileRecordId: 'file-rec-ctrl-01',
    });

    expect(decision.status).toBe('READY_TELEGRAM_FILE');
    expect(decision.storageReference?.kind).toBe('TELEGRAM_FILE_ID');
    expect(decision.storageReference?.value).toBe('BAACAgIAAxkBAAICsynthetic_tg_file_ctrl_01');
    expect(decision.fileRecord?.id).toBe('file-rec-ctrl-01');
  });

  it('returns READY_EXTERNAL_LINK for an authorized external URL candidate', async () => {
    const decision = await service.requestFileDelivery({
      fileRecordId: 'file-rec-syl-01',
    });

    expect(decision.status).toBe('READY_EXTERNAL_LINK');
    expect(decision.externalUrl).toBe(
      'https://department.example.edu/academic/mct314_syllabus.pdf',
    );
    expect(decision.storageReference?.kind).toBe('EXTERNAL_URL');
  });

  it('returns BLOCKED_POLICY when requesting a prohibited file (solution manual)', async () => {
    const decision = await service.requestFileDelivery({
      fileRecordId: 'file-rec-sol-01',
    });

    expect(decision.status).toBe('BLOCKED_POLICY');
    expect(decision.policy?.policyState).toBe('PROHIBITED');
    expect(decision.reason).toContain('prohibits');
  });

  it('returns BLOCKED_POLICY when requesting an unverified student file (UNKNOWN policy)', async () => {
    const decision = await service.requestFileDelivery({
      fileRecordId: 'file-rec-stu-unverified',
    });

    expect(decision.status).toBe('BLOCKED_POLICY');
    expect(decision.policy?.policyState).toBe('UNKNOWN');
  });

  it('returns MISSING_STORAGE_REFERENCE when a file record has no storage reference', async () => {
    const decision = await service.requestFileDelivery({
      fileRecordId: 'file-rec-missing-ref',
    });

    expect(decision.status).toBe('MISSING_STORAGE_REFERENCE');
    expect(decision.reason).toContain('no associated storage reference');
  });

  it('returns NOT_FOUND when requesting non-existent file or criteria', async () => {
    const decisionById = await service.requestFileDelivery({
      fileRecordId: 'non-existent-id-999',
    });
    expect(decisionById.status).toBe('NOT_FOUND');

    const decisionByCriteria = await service.requestFileDelivery({
      criteria: { courseCode: 'NON_EXISTENT_COURSE' },
    });
    expect(decisionByCriteria.status).toBe('NOT_FOUND');
  });

  it('deduplicates identical contentHash files so they do not cause false selection ambiguity', async () => {
    // file-rec-ctrl-01 and file-rec-ctrl-dup have SAME contentHash ('hash-ctrl-notes-2025')
    // Searching specifically for lecture notes of MCT314 should deduplicate to file-rec-ctrl-01 (VERIFIED)
    const decision = await service.requestFileDelivery({
      criteria: {
        courseCode: 'TEST-DIST-MCT314',
        documentType: 'LECTURER_NOTE',
      },
    });

    expect(decision.status).toBe('READY_TELEGRAM_FILE');
    expect(decision.fileRecord?.id).toBe('file-rec-ctrl-01');
  });

  it('returns NEEDS_SELECTION when multiple genuinely distinct files match the query', async () => {
    // Searching broadly for TEST-DIST-MCT314 matches lecture notes, syllabus, past exam, textbook, etc.
    const decision = await service.requestFileDelivery({
      criteria: {
        courseCode: 'TEST-DIST-MCT314',
      },
    });

    expect(decision.status).toBe('NEEDS_SELECTION');
    expect(decision.candidates).toBeDefined();
    expect(decision.candidates!.length).toBeGreaterThan(1);
    expect(decision.reason).toContain('selection is required');
  });

  it('supports version superseding via service', async () => {
    const freshRepo = new InMemoryFileCatalogRepository(SYNTHETIC_FILE_RECORDS);
    const freshService = new FileDistributionService({ repository: freshRepo });

    await freshService.supersedeFile('file-rec-exam-2024', 'file-rec-exam-2025');
    const updated = await freshService.getFile('file-rec-exam-2024');

    expect(updated?.archiveStatus).toBe('ARCHIVE');
    expect(updated?.notes).toContain('Superseded by file-rec-exam-2025');
  });

  it('handles repository lifecycle and mutations: registerFile, updateFile, getFile, count, and clear', async () => {
    const mutableRepo = new InMemoryFileCatalogRepository();
    const mutableService = new FileDistributionService({ repository: mutableRepo });

    expect(await mutableRepo.count()).toBe(0);

    const newRecord = { ...SYNTHETIC_FILE_RECORDS[0]!, id: 'dyn-01', title: 'Dynamic File' };
    await mutableService.registerFile(newRecord);
    expect(await mutableRepo.count()).toBe(1);

    const fetched = await mutableService.getFile('dyn-01');
    expect(fetched?.title).toBe('Dynamic File');
    expect(mutableService.getRepository()).toBe(mutableRepo);

    // Update file
    const updatedRecord = { ...newRecord, title: 'Updated Dynamic File' };
    await mutableService.updateFile(updatedRecord);
    const updatedFetched = await mutableService.getFile('dyn-01');
    expect(updatedFetched?.title).toBe('Updated Dynamic File');

    // Throws when updating non-existent file
    await expect(mutableService.updateFile({ ...newRecord, id: 'does-not-exist' })).rejects.toThrow(
      /Cannot update non-existent/,
    );

    // Throws when adding invalid record
    expect(() => mutableRepo.add({ ...newRecord, id: '', title: '' })).toThrow(
      /Cannot add invalid file record/,
    );

    // Throws when superseding non-existent file
    await expect(mutableService.supersedeFile('ghost-file', 'ghost-v2')).rejects.toThrow(
      /Cannot supersede non-existent file/,
    );

    mutableRepo.clear();
    expect(await mutableRepo.count()).toBe(0);
  });

  it('filters with text query substring and distributableOnly option', async () => {
    // 1. Text query matching title or notes
    const queryMatches = await service.findFiles({ query: 'Official Department Syllabus' });
    expect(queryMatches).toHaveLength(1);
    expect(queryMatches[0]?.id).toBe('file-rec-syl-01');

    // 2. Query matching notes
    const noteMatches = await service.findFiles({ query: 'Primary lecture note' });
    expect(noteMatches).toHaveLength(1);
    expect(noteMatches[0]?.id).toBe('file-rec-ctrl-01');

    // 3. distributableOnly = true excludes prohibited and restricted files
    const distributableFiles = await service.findFiles({
      courseCode: 'TEST-DIST-MCT314',
      distributableOnly: true,
    });
    expect(distributableFiles.some((f) => f.id === 'file-rec-sol-01')).toBe(false); // Solution manual excluded
    expect(distributableFiles.some((f) => f.id === 'file-rec-book-01')).toBe(false); // Commercial textbook excluded
    expect(distributableFiles.some((f) => f.id === 'file-rec-ctrl-01')).toBe(true); // Allowed note included
  });

  it('returns MISSING_STORAGE_REFERENCE when delivery is requested for a local archive reference', async () => {
    // file-rec-book-01 has LOCAL_ARCHIVE_REFERENCE
    const decision = await service.requestFileDelivery({
      fileRecordId: 'file-rec-book-01',
    });
    // First it hits policy since textbook is RESTRICTED
    expect(decision.status).toBe('BLOCKED_POLICY');

    // If an ALLOWED file has LOCAL_ARCHIVE_REFERENCE
    const localAllowedRecord = {
      ...SYNTHETIC_FILE_RECORDS[0]!,
      id: 'local-allowed-01',
      storageReference: {
        kind: 'LOCAL_ARCHIVE_REFERENCE' as const,
        value: 'local://archive/file.pdf',
      },
    };
    const localRepo = new InMemoryFileCatalogRepository([localAllowedRecord]);
    const localService = new FileDistributionService({ repository: localRepo });

    const localDecision = await localService.requestFileDelivery({
      fileRecordId: 'local-allowed-01',
    });
    expect(localDecision.status).toBe('MISSING_STORAGE_REFERENCE');
    expect(localDecision.reason).toContain('cannot be distributed directly');
  });
});
