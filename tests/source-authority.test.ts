import { describe, it, expect } from 'vitest';
import { SourceAuthority, RetrievalPolicy, EvidenceScope } from '@mecha-bot/academic';

describe('Source Authority & Evidence Provenance', () => {
  it('contains all required source authority tiers', () => {
    const expected = [
      'OFFICIAL_DEPARTMENT',
      'LECTURER_CURRENT',
      'OFFICIAL_UOB',
      'PAST_EXAM_VERIFIED',
      'OPEN_ACADEMIC',
      'STUDENT_SUBMITTED',
      'UNVERIFIED',
    ];
    for (const auth of expected) {
      expect(Object.values(SourceAuthority)).toContain(auth);
    }
  });

  it('ranks source authority contextually based on query intent', () => {
    // For EXAM_LOOKUP: PAST_EXAM_VERIFIED outranks LECTURER_CURRENT and OFFICIAL_DEPARTMENT
    const examPriority = RetrievalPolicy.getPriorityList('EXAM_LOOKUP');
    expect(examPriority[0]).toBe(SourceAuthority.PAST_EXAM_VERIFIED);
    expect(
      RetrievalPolicy.compare(
        SourceAuthority.PAST_EXAM_VERIFIED,
        SourceAuthority.OFFICIAL_DEPARTMENT,
        'EXAM_LOOKUP',
      ),
    ).toBeLessThan(0); // Lower index = higher priority

    // For LECTURER_REQUIREMENTS: LECTURER_CURRENT outranks PAST_EXAM_VERIFIED
    const lecturerPriority = RetrievalPolicy.getPriorityList('LECTURER_REQUIREMENTS');
    expect(lecturerPriority[0]).toBe(SourceAuthority.LECTURER_CURRENT);
    expect(
      RetrievalPolicy.compare(
        SourceAuthority.LECTURER_CURRENT,
        SourceAuthority.PAST_EXAM_VERIFIED,
        'LECTURER_REQUIREMENTS',
      ),
    ).toBeLessThan(0);

    // For COURSE_IDENTITY: OFFICIAL_DEPARTMENT is highest
    const identityPriority = RetrievalPolicy.getPriorityList('COURSE_IDENTITY');
    expect(identityPriority[0]).toBe(SourceAuthority.OFFICIAL_DEPARTMENT);

    // For CONCEPT_EXPLANATION: OPEN_ACADEMIC is prioritized ahead of PAST_EXAM_VERIFIED
    const conceptPriority = RetrievalPolicy.getPriorityList('CONCEPT_EXPLANATION');
    expect(conceptPriority).toContain(SourceAuthority.OPEN_ACADEMIC);
    expect(
      RetrievalPolicy.compare(
        SourceAuthority.OPEN_ACADEMIC,
        SourceAuthority.PAST_EXAM_VERIFIED,
        'CONCEPT_EXPLANATION',
      ),
    ).toBeLessThan(0);
  });

  it('validates evidence scope classifications', () => {
    const scopes = Object.values(EvidenceScope);
    expect(scopes).toContain('EXACT_COURSE');
    expect(scopes).toContain('SAME_DEPARTMENT_ARCHIVE');
    expect(scopes).toContain('SAME_UNIVERSITY_RELATED_COURSE');
    expect(scopes).toContain('OPEN_ACADEMIC_EQUIVALENT');
    expect(scopes).toContain('BIBLIOGRAPHIC_ONLY');
    expect(scopes).toContain('STUDENT_PROVIDED');
  });
});
