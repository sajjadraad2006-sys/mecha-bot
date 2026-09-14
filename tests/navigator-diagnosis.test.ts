import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import { loadAcademicCoreDataset, AcademicCoreDataset } from '@mecha-bot/academic';
import { diagnoseStudyPosition, StudyNavigatorService } from '@mecha-bot/navigator';

describe('Milestone M9A — Navigator Diagnosis Suite ("أني ضايع")', () => {
  let dataset: AcademicCoreDataset;
  let service: StudyNavigatorService;

  beforeAll(() => {
    const curriculumDir = path.resolve(__dirname, '../curriculum/academic-core');
    dataset = loadAcademicCoreDataset(curriculumDir);
    service = new StudyNavigatorService({ dataset });
  });

  describe('1. Course Resolution Safety & Ambiguity', () => {
    it('returns COURSE_CLARIFICATION_REQUIRED when "سيطرة" is queried without semester context', () => {
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'سيطرة',
      });

      expect(result.status).toBe('COURSE_CLARIFICATION_REQUIRED');
      expect(result.needsStudentConfirmation).toBe(true);
      expect(result.candidateCourseCodes).toBeDefined();
      expect(result.candidateCourseCodes?.sort()).toEqual(['MCT314', 'MCT324']);
      expect(
        result.reasonCodes.includes('AMBIGUOUS_COURSE_ALIAS') ||
          result.reasonCodes.includes('AMBIGUOUS_COURSE_QUERY'),
      ).toBe(true);
    });

    it('disambiguates "سيطرة" to MCT314 when semester 5 is provided', () => {
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'سيطرة',
        programSemester: 5,
        targetTopicKey: 'mct314-root-locus-analysis',
      });

      expect(result.courseCode).toBe('MCT314');
      expect(result.status).toBe('NEEDS_BASELINE');
    });

    it('disambiguates "سيطرة" to MCT324 when semester 6 is provided', () => {
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'سيطرة',
        programSemester: 6,
        targetTopicKey: 'mct324-controllability-and-observability',
      });

      expect(result.courseCode).toBe('MCT324');
      expect(result.status).toBe('NEEDS_BASELINE');
    });

    it('returns COURSE_CLARIFICATION_REQUIRED for unknown/unresolvable course query', () => {
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'كيمياء نووية متقدمة',
      });

      expect(result.status).toBe('COURSE_CLARIFICATION_REQUIRED');
      expect(result.needsStudentConfirmation).toBe(true);
    });
  });

  describe('2. Course Profile Integrity Safety (MCT124 Conflict & P4MCT IDENTITY_ONLY)', () => {
    it('returns ACADEMIC_DATA_CONFLICT when diagnosing MCT124 (conflicting academic data)', () => {
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'MCT124',
      });

      expect(result.status).toBe('ACADEMIC_DATA_CONFLICT');
      expect(result.courseCode).toBe('MCT124');
      expect(result.needsStudentConfirmation).toBe(true);
      expect(result.reasonCodes).toContain('ACADEMIC_DATA_CONFLICT');
      expect(result.reasonCodes).toContain('MCT124_CONFLICT');
      expect(result.explanationNote).toContain('documented academic contradictions');
    });

    it('returns INSUFFICIENT_ACADEMIC_MAP when diagnosing P4MCT (IDENTITY_ONLY course)', () => {
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'P4MCT',
      });

      expect(result.status).toBe('INSUFFICIENT_ACADEMIC_MAP');
      expect(result.courseCode).toBe('P4MCT');
      expect(result.reasonCodes).toContain('IDENTITY_ONLY_COURSE');
      expect(result.needsStudentConfirmation).toBe(false);
    });
  });

  describe('3. Topic Resolution Safety', () => {
    it('returns TOPIC_CLARIFICATION_REQUIRED when student mentions an unknown topic ("البطيخة")', () => {
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'MCT314',
        lastUnderstoodQuery: 'البطيخة',
        targetTopicKey: 'mct314-root-locus-analysis',
      });

      expect(result.status).toBe('TOPIC_CLARIFICATION_REQUIRED');
      expect(result.courseCode).toBe('MCT314');
      expect(result.reasonCodes).toContain('LAST_UNDERSTOOD_TOPIC_UNRESOLVED');
      expect(result.needsStudentConfirmation).toBe(true);
      expect(result.explanationNote).toContain('البطيخة');
    });

    it('resolves topic by exact and normalized topic names where dataset supports it', () => {
      const resultEn = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'MCT111',
        targetTopicQuery: 'Continuity',
        lastUnderstoodTopicKey: 'mct111-w5-limits-and-continuity-part-2',
      });

      expect(resultEn.courseCode).toBe('MCT111');
      expect(resultEn.targetTopicKey).toBe('mct111-w6-continuity');

      const resultControl = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'MCT314',
        programSemester: 5,
        targetTopicQuery: 'Root Locus Method for Control Design',
        lastUnderstoodTopicKey: 'mct314-root-locus-analysis',
      });

      expect(resultControl.courseCode).toBe('MCT314');
      expect(resultControl.status).toBe('ON_TRACK');
      expect(resultControl.targetTopicKey).toBe('mct314-root-locus-analysis');
    });
  });

  describe('4. "أني ضايع" Diagnosis Flow', () => {
    it('returns TARGET_UNKNOWN if class position or target topic is missing', () => {
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'MCT314',
      });

      expect(result.status).toBe('TARGET_UNKNOWN');
      expect(result.courseCode).toBe('MCT314');
      expect(result.reasonCodes).toContain('CURRENT_CLASS_TOPIC_UNKNOWN');
      expect(result.needsStudentConfirmation).toBe(true);
    });

    it('returns NEEDS_BASELINE when target is known but student baseline is unknown', () => {
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'MCT314',
        targetTopicKey: 'mct314-root-locus-analysis',
      });

      expect(result.status).toBe('NEEDS_BASELINE');
      expect(result.courseCode).toBe('MCT314');
      expect(result.targetTopicKey).toBe('mct314-root-locus-analysis');
      expect(result.reasonCodes).toContain('BASELINE_UNKNOWN');
      expect(result.needsStudentConfirmation).toBe(true);
    });

    it('returns ON_TRACK when student last understood the target topic itself', () => {
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'MCT123',
        targetTopicKey: 'mct123-w4-binary-logic-gates-and-or-not-xor-x',
        lastUnderstoodTopicKey: 'mct123-w4-binary-logic-gates-and-or-not-xor-x',
      });

      expect(result.status).toBe('ON_TRACK');
      expect(result.courseCode).toBe('MCT123');
      expect(result.missingPrerequisites).toHaveLength(0);
      expect(result.needsStudentConfirmation).toBe(false);
    });

    it('returns CATCH_UP_REQUIRED with missing verified prerequisite chain in MCT123', () => {
      // In MCT123:
      // mct123-w12 (Adders) requires mct123-w11 (Combinational logic design)
      // which requires mct123-w4 (Binary logic gates)
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'MCT123',
        targetTopicKey: 'mct123-w12-design-of-adders-half-adder-and-ful',
        lastUnderstoodTopicKey: 'mct123-w4-binary-logic-gates-and-or-not-xor-x',
      });

      expect(result.status).toBe('CATCH_UP_REQUIRED');
      expect(result.courseCode).toBe('MCT123');
      expect(result.missingPrerequisites).toContain(
        'mct123-w11-combinational-logic-design-procedur',
      );
      expect(result.catchUpPlan).toBeDefined();
      expect(result.catchUpPlan?.steps.length).toBeGreaterThanOrEqual(2);
      expect(result.reasonCodes).toContain('UNMET_PREREQUISITE_DEPENDENCIES');
    });

    it('returns REVIEW_RECOMMENDED when order gap exists without verified prerequisite edges (MCT314)', () => {
      // In MCT314:
      // orderIndex 1 = transfer-function-modeling
      // orderIndex 2 = time-domain-transient-response
      // orderIndex 3 = stability-and-routh-hurwitz
      // orderIndex 4 = root-locus-analysis
      // There are no verified prerequisite edges between them in prerequisites.v1.json
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'MCT314',
        targetTopicKey: 'mct314-root-locus-analysis',
        lastUnderstoodTopicKey: 'mct314-transfer-function-modeling',
      });

      expect(result.status).toBe('REVIEW_RECOMMENDED');
      expect(result.courseCode).toBe('MCT314');
      expect(result.missingPrerequisites).toHaveLength(0); // Strict safety: no fake prerequisite created
      expect(result.orderBasedReviewTopics).toBeDefined();
      expect(result.orderBasedReviewTopics).toEqual([
        'mct314-time-domain-transient-response',
        'mct314-stability-and-routh-hurwitz',
      ]);
      expect(result.reasonCodes).toContain('ORDER_BASED_REVIEW_GAP');

      // Verify steps in catch-up plan are marked as ORDER_BASED_REVIEW, not PREREQUISITE
      const plan = result.catchUpPlan;
      expect(plan).toBeDefined();
      const intermediateSteps = plan!.steps.filter((s) => s.reason !== 'TARGET_TOPIC');
      for (const step of intermediateSteps) {
        expect(step.reason).toBe('ORDER_BASED_REVIEW');
      }
    });

    it('returns INSUFFICIENT_EVIDENCE when neither prerequisite path nor order relationship exists', () => {
      // Two unrelated topics with no order or prerequisite link
      const result = service.diagnose({
        studentKey: 'stu_1',
        courseQuery: 'MCT111',
        targetTopicKey: 'mct111-w2-functions-and-their-types', // week 2 (earlier)
        lastUnderstoodTopicKey: 'mct111-w10-integrals-part-1', // week 10 (later)
      });

      expect(result.status).toBe('INSUFFICIENT_EVIDENCE');
      expect(result.courseCode).toBe('MCT111');
      expect(result.missingPrerequisites).toHaveLength(0);
      expect(result.reasonCodes).toContain('NO_PREREQUISITE_OR_ORDER_PATH_FOUND');
    });

    it('invokes diagnoseStudyPosition function directly with dataset', () => {
      const result = diagnoseStudyPosition({
        studentKey: 'stu_direct',
        courseQuery: 'MCT111',
        targetTopicKey: 'mct111-w2-functions-and-their-types',
        lastUnderstoodTopicKey: 'mct111-w2-functions-and-their-types',
        dataset,
      });

      expect(result.status).toBe('ON_TRACK');
      expect(result.courseCode).toBe('MCT111');
    });
  });
});
