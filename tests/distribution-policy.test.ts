import { describe, expect, it } from 'vitest';
import {
  evaluateDistributionPolicy,
  getBaselinePolicyForType,
  isFileVisibleToStudent,
  type AcademicFileRecord,
} from '../packages/distribution/src/index.js';

describe('Distribution Policy - Evaluation Rules', () => {
  const baseRecord: AcademicFileRecord = {
    id: 'test-policy-01',
    courseCode: 'TEST-DIST-MCT314',
    title: 'Control Systems Lecture Notes',
    originalFilename: 'control_systems_official_notes.pdf',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
      reason: 'Faculty authorized',
    },
    visibility: 'GLOBAL',
    archiveStatus: 'CURRENT',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  };

  it('allows distribution when policyState is ALLOWED and canDistribute is true', () => {
    const res = evaluateDistributionPolicy(baseRecord);
    expect(res.allowed).toBe(true);
    expect(res.canSearch).toBe(true);
    expect(res.canQuote).toBe(true);
  });

  it('strictly blocks distribution when policyState is PROHIBITED', () => {
    const prohibitedRecord: AcademicFileRecord = {
      ...baseRecord,
      distributionPolicy: {
        canSearch: false,
        canQuote: false,
        canDistribute: false,
        policyState: 'PROHIBITED',
        reason: 'Solution manual distribution is forbidden',
      },
    };

    const res = evaluateDistributionPolicy(prohibitedRecord);
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('forbidden');
  });

  it('conservatively blocks distribution when policyState is UNKNOWN', () => {
    const unknownRecord: AcademicFileRecord = {
      ...baseRecord,
      distributionPolicy: {
        canSearch: true,
        canQuote: false,
        canDistribute: false,
        policyState: 'UNKNOWN',
      },
    };

    const res = evaluateDistributionPolicy(unknownRecord);
    expect(res.allowed).toBe(false);
    expect(res.canSearch).toBe(true); // Searchable metadata preserved
    expect(res.canQuote).toBe(false);
    expect(res.reason).toContain('UNKNOWN');
  });

  it('supports searchable but non-distributable commercial textbooks', () => {
    const textbookPolicy = getBaselinePolicyForType('TEXTBOOK', 'EXTERNAL');
    expect(textbookPolicy.canSearch).toBe(true);
    expect(textbookPolicy.canDistribute).toBe(false);
    expect(textbookPolicy.policyState).toBe('RESTRICTED');

    const textbookRecord: AcademicFileRecord = {
      ...baseRecord,
      documentType: 'TEXTBOOK',
      distributionPolicy: textbookPolicy,
    };

    const evalResult = evaluateDistributionPolicy(textbookRecord);
    expect(evalResult.allowed).toBe(false);
    expect(evalResult.canSearch).toBe(true);
  });

  it('guarantees that verification and distribution permission are independent', () => {
    // 1. VERIFIED file with PROHIBITED policy must be blocked!
    const verifiedProhibited: AcademicFileRecord = {
      ...baseRecord,
      verificationStatus: 'VERIFIED',
      distributionPolicy: {
        canSearch: true,
        canQuote: false,
        canDistribute: false,
        policyState: 'PROHIBITED',
      },
    };
    expect(evaluateDistributionPolicy(verifiedProhibited).allowed).toBe(false);

    // 2. REJECTED file is always blocked regardless of policy
    const rejectedRecord: AcademicFileRecord = {
      ...baseRecord,
      verificationStatus: 'REJECTED',
      distributionPolicy: {
        canSearch: true,
        canQuote: true,
        canDistribute: true,
        policyState: 'ALLOWED',
      },
    };
    expect(evaluateDistributionPolicy(rejectedRecord).allowed).toBe(false);
  });

  it('prevents filename-based permission escalation', () => {
    // Even if filename says "official_faculty_approved.pdf", if authority is STUDENT, policy is UNKNOWN
    const baseline = getBaselinePolicyForType('STUDENT_NOTE', 'STUDENT');
    expect(baseline.policyState).toBe('UNKNOWN');
    expect(baseline.canDistribute).toBe(false);
  });
});

describe('Distribution Policy - Privacy & Visibility Boundaries', () => {
  const baseRecord: AcademicFileRecord = {
    id: 'test-vis-01',
    courseCode: 'TEST-DIST-MCT314',
    title: 'Control Note',
    documentType: 'STUDENT_NOTE',
    sourceAuthority: 'STUDENT',
    verificationStatus: 'RAW',
    distributionPolicy: {
      canSearch: true,
      canQuote: false,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    visibility: 'GLOBAL',
    archiveStatus: 'CURRENT',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  };

  it('makes GLOBAL and COURSE_SHARED files visible to any requester', () => {
    expect(isFileVisibleToStudent(baseRecord, 'student_synth_1')).toBe(true);
    expect(isFileVisibleToStudent(baseRecord, undefined)).toBe(true);

    const courseShared: AcademicFileRecord = {
      ...baseRecord,
      visibility: 'COURSE_SHARED',
    };
    expect(isFileVisibleToStudent(courseShared, 'student_synth_1')).toBe(true);
  });

  it('strictly protects PRIVATE_STUDENT files: visible ONLY to the owner', () => {
    const privateRecord: AcademicFileRecord = {
      ...baseRecord,
      visibility: 'PRIVATE_STUDENT',
      studentKey: 'student_synth_alice',
    };

    // Alice sees her own file
    expect(isFileVisibleToStudent(privateRecord, 'student_synth_alice')).toBe(true);

    // Bob CANNOT see Alice's file
    expect(isFileVisibleToStudent(privateRecord, 'student_synth_bob')).toBe(false);

    // Anonymous requester CANNOT see Alice's file
    expect(isFileVisibleToStudent(privateRecord, undefined)).toBe(false);
  });

  it('evaluates baseline policies across various document types and authorities', () => {
    const facultyNote = getBaselinePolicyForType('LECTURER_NOTE', 'FACULTY');
    expect(facultyNote.policyState).toBe('ALLOWED');
    expect(facultyNote.canDistribute).toBe(true);

    const facultySlides = getBaselinePolicyForType('LECTURE_SLIDES', 'FACULTY');
    expect(facultySlides.policyState).toBe('ALLOWED');

    const officialExam = getBaselinePolicyForType('PAST_EXAM', 'OFFICIAL');
    expect(officialExam.policyState).toBe('ALLOWED');

    const studentExam = getBaselinePolicyForType('PAST_EXAM', 'STUDENT');
    expect(studentExam.policyState).toBe('UNKNOWN');
    expect(studentExam.canDistribute).toBe(false);

    const otherDoc = getBaselinePolicyForType('OTHER', 'UNKNOWN');
    expect(otherDoc.policyState).toBe('UNKNOWN');
    expect(otherDoc.canDistribute).toBe(false);
  });

  it('detects prohibited external URLs during policy evaluation', () => {
    const pirateUrlRecord: AcademicFileRecord = {
      ...baseRecord,
      distributionPolicy: {
        canSearch: true,
        canQuote: true,
        canDistribute: true,
        policyState: 'ALLOWED',
      },
      storageReference: {
        kind: 'EXTERNAL_URL',
        value: 'https://z-lib.is/book/123.pdf',
      },
    };

    const res = evaluateDistributionPolicy(pirateUrlRecord);
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('unauthorized or illegal');
  });

  it('blocks distribution if canDistribute is explicitly false even with ALLOWED state', () => {
    const inconsistentRecord: AcademicFileRecord = {
      ...baseRecord,
      distributionPolicy: {
        canSearch: true,
        canQuote: false,
        canDistribute: false,
        policyState: 'ALLOWED',
      },
    };

    const res = evaluateDistributionPolicy(inconsistentRecord);
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('explicitly flags canDistribute as false');
  });
});
