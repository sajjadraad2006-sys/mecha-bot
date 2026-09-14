import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import { loadAcademicCoreDataset, AcademicCoreDataset } from '@mecha-bot/academic';
import { ValidationError } from '@mecha-bot/shared';
import {
  StudyNavigatorService,
  evaluateCourseProgress,
  partitionStudyBudget,
  generateCatchUpPath,
  buildCatchUpPlan,
  CatchUpStep,
} from '@mecha-bot/navigator';

describe('Milestone M9A — Navigator Catch-Up & Progress Suite ("وين وصلنا؟" & Planning)', () => {
  let dataset: AcademicCoreDataset;
  let service: StudyNavigatorService;

  beforeAll(() => {
    const curriculumDir = path.resolve(__dirname, '../curriculum/academic-core');
    dataset = loadAcademicCoreDataset(curriculumDir);
    service = new StudyNavigatorService({ dataset });
  });

  describe('1. "وين وصلنا؟" Course Progress Engine', () => {
    it('Case A1: returns CONFIRM_COURSE_PULSE with VERIFIED status when official pulse exists', () => {
      const result = service.whereAreWe({
        courseCode: 'MCT314',
        coursePulse: {
          courseCode: 'MCT314',
          topicKey: 'mct314-root-locus-analysis',
          status: 'VERIFIED',
          source: 'COURSE_EDITOR',
          scope: 'GLOBAL',
          updatedAt: '2026-10-20T10:00:00.000Z',
        },
      });

      expect(result.mode).toBe('CONFIRM_COURSE_PULSE');
      expect(result.suggestedTopicKey).toBe('mct314-root-locus-analysis');
      expect(result.evidenceStatus).toBe('VERIFIED');
      expect(result.evidenceSource).toBe('COURSE_EDITOR');
      expect(result.needsStudentConfirmation).toBe(true); // infer -> suggest -> confirm
      expect(result.confirmationPromptKey).toBe('CONFIRM_VERIFIED_PULSE');
    });

    it('Case A2: returns CONFIRM_COURSE_PULSE with INFERRED status for unverified peer pulse', () => {
      const result = service.whereAreWe({
        courseCode: 'MCT314',
        coursePulse: {
          courseCode: 'MCT314',
          freeTextTopic: 'Bode Plots Introduction',
          status: 'INFERRED',
          source: 'SYSTEM_INFERENCE',
          scope: 'GLOBAL',
          updatedAt: '2026-10-20T10:00:00.000Z',
        },
      });

      expect(result.mode).toBe('CONFIRM_COURSE_PULSE');
      expect(result.suggestedTopicTitleEn).toBe('Bode Plots Introduction');
      expect(result.evidenceStatus).toBe('INFERRED');
      expect(result.evidenceSource).toBe('SYSTEM_INFERENCE');
      expect(result.needsStudentConfirmation).toBe(true);
      expect(result.confirmationPromptKey).toBe('CONFIRM_UNVERIFIED_PULSE');
    });

    it('Case A3: respects section scope and filters out pulses for other sections', () => {
      // Pulse is for Section B, but student asks for Section A
      const result = service.whereAreWe({
        courseCode: 'MCT111',
        sectionKey: 'A',
        coursePulse: {
          courseCode: 'MCT111',
          topicKey: 'mct111-w10-integrals-part-1',
          status: 'VERIFIED',
          source: 'COURSE_EDITOR',
          scope: 'SECTION',
          sectionKey: 'B',
          updatedAt: '2026-10-20T10:00:00.000Z',
        },
      });

      // Section B pulse is not accepted for Section A -> falls back to Case C or Case B
      expect(result.mode).not.toBe('CONFIRM_COURSE_PULSE');
    });

    it('Case B: returns EXPECTED_RANGE when calendar position is available without pulse', () => {
      const result = service.whereAreWe({
        courseCode: 'MCT111',
        calendarPosition: {
          academicWeek: 6,
          localDate: '2026-10-20',
          status: 'EXPECTED',
        },
      });

      expect(result.mode).toBe('EXPECTED_RANGE');
      expect(result.evidenceStatus).toBe('EXPECTED');
      expect(result.evidenceSource).toBe('ACADEMIC_CALENDAR');
      expect(result.academicWeek).toBe(6);
      expect(result.suggestedRange).toBeDefined();
      expect(result.suggestedRange!.length).toBeGreaterThan(0);
      expect(result.needsStudentConfirmation).toBe(true);
      expect(result.confirmationPromptKey).toBe('CONFIRM_EXPECTED_RANGE');
    });

    it('Case C: returns ASK_STUDENT_DIRECTLY when neither pulse nor calendar schedule exists', () => {
      const result = service.whereAreWe({
        courseCode: 'P4MCT',
      });

      expect(result.mode).toBe('ASK_STUDENT_DIRECTLY');
      expect(result.evidenceStatus).toBe('UNKNOWN');
      expect(result.needsStudentConfirmation).toBe(true);
      expect(result.confirmationPromptKey).toBe('ASK_STUDENT_DIRECTLY');
    });
  });

  describe('2. Catch-Up Path Generation & Ordering', () => {
    it('generates multi-level verified prerequisite chain in MCT121', () => {
      // In MCT121:
      // mct121-w6 requires mct121-w5 which requires mct111-w10
      const targetTopic = dataset.topics.find(
        (t) => t.topicKey === 'mct121-w6-methods-of-integration-trigonometri',
      )!;
      const lastTopic = dataset.topics.find((t) => t.topicKey === 'mct111-w10-integrals-part-1')!;

      const pathResult = generateCatchUpPath({
        courseCode: 'MCT121',
        targetTopic,
        lastUnderstoodTopic: lastTopic,
        prerequisiteGraph: dataset.prerequisiteGraph,
      });

      expect(pathResult.hasPrerequisitePath).toBe(true);
      expect(pathResult.hasOrderPath).toBe(false);
      expect(pathResult.missingPrerequisiteKeys).toEqual([
        'mct121-w5-methods-of-integration-integration-',
      ]);

      const steps = pathResult.steps;
      expect(steps.length).toBe(2);
      expect(steps[0]?.topicKey).toBe('mct121-w5-methods-of-integration-integration-');
      expect(steps[0]?.reason).toBe('DIRECT_PREREQUISITE');
      expect(steps[1]?.topicKey).toBe('mct121-w6-methods-of-integration-trigonometri');
      expect(steps[1]?.reason).toBe('TARGET_TOPIC');
    });

    it('generates full prerequisite dependency chain when student baseline is absent', () => {
      const targetTopic = dataset.topics.find(
        (t) => t.topicKey === 'mct121-w6-methods-of-integration-trigonometri',
      )!;

      const pathResult = generateCatchUpPath({
        courseCode: 'MCT121',
        targetTopic,
        prerequisiteGraph: dataset.prerequisiteGraph,
      });

      expect(pathResult.hasPrerequisitePath).toBe(true);
      expect(pathResult.missingPrerequisiteKeys).toEqual([
        'mct111-w10-integrals-part-1',
        'mct121-w5-methods-of-integration-integration-',
      ]);
      expect(pathResult.steps[pathResult.steps.length - 1]?.reason).toBe('TARGET_TOPIC');
    });

    it('distinguishes ORDER_BASED_REVIEW from PREREQUISITE strictly without creating fake edges', () => {
      const targetTopic = dataset.topics.find((t) => t.topicKey === 'mct314-root-locus-analysis')!;
      const lastTopic = dataset.topics.find(
        (t) => t.topicKey === 'mct314-transfer-function-modeling',
      )!;
      const mct314Topics = dataset.topics.filter((t) => t.courseCode === 'MCT314');

      const pathResult = generateCatchUpPath({
        courseCode: 'MCT314',
        targetTopic,
        lastUnderstoodTopic: lastTopic,
        prerequisiteGraph: dataset.prerequisiteGraph,
        courseTopics: mct314Topics,
      });

      expect(pathResult.hasPrerequisitePath).toBe(false);
      expect(pathResult.hasOrderPath).toBe(true);
      expect(pathResult.missingPrerequisiteKeys).toHaveLength(0); // Zero fake prerequisites
      expect(pathResult.orderBasedReviewKeys).toEqual([
        'mct314-time-domain-transient-response',
        'mct314-stability-and-routh-hurwitz',
      ]);

      const steps = pathResult.steps;
      expect(steps.length).toBe(3);
      expect(steps[0]?.reason).toBe('ORDER_BASED_REVIEW');
      expect(steps[1]?.reason).toBe('ORDER_BASED_REVIEW');
      expect(steps[2]?.reason).toBe('TARGET_TOPIC');
    });

    it('ensures target topic is included exactly once with zero duplicate topics', () => {
      const targetTopic = dataset.topics.find(
        (t) => t.topicKey === 'mct123-w12-design-of-adders-half-adder-and-ful',
      )!;
      const lastTopic = dataset.topics.find(
        (t) => t.topicKey === 'mct123-w4-binary-logic-gates-and-or-not-xor-x',
      )!;

      const pathResult = generateCatchUpPath({
        courseCode: 'MCT123',
        targetTopic,
        lastUnderstoodTopic: lastTopic,
        prerequisiteGraph: dataset.prerequisiteGraph,
      });

      const keys = pathResult.steps.map((s) => s.topicKey);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size); // Zero duplicates
      expect(keys[keys.length - 1]).toBe(targetTopic.topicKey);
    });
  });

  describe('3. Short Study Modes & Budget Partitioner', () => {
    const stepsWithPrereqs: CatchUpStep[] = [
      {
        topicKey: 'prereq_1',
        titleEn: 'Prerequisite Topic 1',
        reason: 'DIRECT_PREREQUISITE',
      },
      {
        topicKey: 'target_1',
        titleEn: 'Target Topic',
        reason: 'TARGET_TOPIC',
      },
    ];

    const stepsTargetOnly: CatchUpStep[] = [
      {
        topicKey: 'target_1',
        titleEn: 'Target Topic',
        reason: 'TARGET_TOPIC',
      },
    ];

    it('partitions 10-minute study budget with and without prerequisites', () => {
      const planWithPrereqs = partitionStudyBudget(10, stepsWithPrereqs);
      expect(planWithPrereqs.totalBudgetMinutes).toBe(10);
      expect(planWithPrereqs.label).toBe('PLANNING_HEURISTIC');
      expect(planWithPrereqs.blocks).toEqual([
        {
          kind: 'PREREQUISITE_REVIEW',
          durationMinutes: 5,
          recommendedTopicKeys: ['prereq_1'],
          description: expect.any(String),
        },
        {
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 5,
          recommendedTopicKeys: ['target_1'],
          description: expect.any(String),
        },
      ]);

      const planTargetOnly = partitionStudyBudget(10, stepsTargetOnly);
      expect(planTargetOnly.blocks).toEqual([
        {
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 8,
          recommendedTopicKeys: ['target_1'],
          description: expect.any(String),
        },
        {
          kind: 'SELF_CHECK',
          durationMinutes: 2,
          recommendedTopicKeys: ['target_1'],
          description: expect.any(String),
        },
      ]);
    });

    it('partitions 15-minute study budget with prerequisites', () => {
      const plan = partitionStudyBudget(15, stepsWithPrereqs);
      expect(plan.totalBudgetMinutes).toBe(15);
      const sum = plan.blocks.reduce((acc, b) => acc + b.durationMinutes, 0);
      expect(sum).toBe(15);
      expect(plan.blocks.map((b) => b.kind)).toEqual([
        'PREREQUISITE_REVIEW',
        'TARGET_TOPIC_FOCUS',
        'SELF_CHECK',
      ]);
    });

    it('partitions 30-minute study budget with prerequisites', () => {
      const plan = partitionStudyBudget(30, stepsWithPrereqs);
      expect(plan.totalBudgetMinutes).toBe(30);
      expect(plan.blocks).toEqual([
        {
          kind: 'PREREQUISITE_REVIEW',
          durationMinutes: 10,
          recommendedTopicKeys: ['prereq_1'],
          description: expect.any(String),
        },
        {
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 15,
          recommendedTopicKeys: ['target_1'],
          description: expect.any(String),
        },
        {
          kind: 'SELF_CHECK',
          durationMinutes: 5,
          recommendedTopicKeys: ['target_1'],
          description: expect.any(String),
        },
      ]);
    });

    it('partitions 45-minute and 60-minute study budgets', () => {
      const plan45 = partitionStudyBudget(45, stepsWithPrereqs);
      expect(plan45.totalBudgetMinutes).toBe(45);
      expect(plan45.blocks.reduce((a, b) => a + b.durationMinutes, 0)).toBe(45);

      const plan60 = partitionStudyBudget(60, stepsWithPrereqs);
      expect(plan60.totalBudgetMinutes).toBe(60);
      expect(plan60.blocks.reduce((a, b) => a + b.durationMinutes, 0)).toBe(60);
    });

    it('supports custom duration heuristics (e.g. 25 minutes)', () => {
      const planCustom = partitionStudyBudget(25, stepsWithPrereqs);
      expect(planCustom.totalBudgetMinutes).toBe(25);
      expect(planCustom.blocks.reduce((a, b) => a + b.durationMinutes, 0)).toBe(25);
    });

    it('strictly rejects invalid study durations (<=0, NaN, non-integer)', () => {
      expect(() => partitionStudyBudget(0, stepsWithPrereqs)).toThrow(ValidationError);
      expect(() => partitionStudyBudget(-15, stepsWithPrereqs)).toThrow(ValidationError);
      expect(() => partitionStudyBudget(NaN, stepsWithPrereqs)).toThrow(ValidationError);
      expect(() => partitionStudyBudget(12.5, stepsWithPrereqs)).toThrow(ValidationError);
    });
  });

  describe('4. Determinism & Safety Constraints', () => {
    it('produces identical repeated catch-up plans (deterministic output)', () => {
      const plan1 = service.planCatchUp({
        courseCode: 'MCT121',
        targetTopicKey: 'mct121-w6-methods-of-integration-trigonometri',
        lastUnderstoodTopicKey: 'mct111-w10-integrals-part-1',
        studyBudgetMinutes: 30,
      });

      const plan2 = service.planCatchUp({
        courseCode: 'MCT121',
        targetTopicKey: 'mct121-w6-methods-of-integration-trigonometri',
        lastUnderstoodTopicKey: 'mct111-w10-integrals-part-1',
        studyBudgetMinutes: 30,
      });

      expect(plan1.steps).toEqual(plan2.steps);
      expect(plan1.studyBudgetPlan).toEqual(plan2.studyBudgetPlan);
    });

    it('throws when target topic key does not exist in dataset', () => {
      expect(() => {
        service.planCatchUp({
          courseCode: 'MCT121',
          targetTopicKey: 'non-existent-topic',
        });
      }).toThrow(/not found in dataset/);
    });

    it('invokes evaluateCourseProgress and buildCatchUpPlan pure functions directly', () => {
      const progress = evaluateCourseProgress({
        courseCode: 'MCT111',
      });
      expect(progress.mode).toBe('ASK_STUDENT_DIRECTLY');

      const plan = buildCatchUpPlan({
        courseCode: 'MCT111',
        targetTopicKey: 't1',
        steps: [],
      });
      expect(plan.courseCode).toBe('MCT111');
      expect(plan.targetTopicKey).toBe('t1');
      expect(plan.steps).toHaveLength(0);
    });
  });
});
