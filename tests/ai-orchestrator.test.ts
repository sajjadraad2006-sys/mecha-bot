import { describe, it, expect, beforeEach } from 'vitest';
import { loadAcademicCoreDataset } from '@mecha-bot/academic';
import { SearchEngine } from '@mecha-bot/search';
import {
  AiBrainService,
  AIRouter,
  FakeAIProvider,
  ModelHealthRegistry,
  BudgetManager,
} from '@mecha-bot/ai';
import { MechaBotApp } from '@mecha-bot/wiring';
import {
  StudyNavigatorService,
  InMemoryStudentCoursePositionRepository,
} from '@mecha-bot/navigator';
import { CompanionService, InMemoryCompanionRepository } from '@mecha-bot/companion';
import { TimetableService } from '@mecha-bot/timetable';
import { ReminderSchedulerService } from '@mecha-bot/scheduler';
import { FileDistributionService, InMemoryFileCatalogRepository } from '@mecha-bot/distribution';
import { ExamsService, InMemoryExamsRepository } from '@mecha-bot/exams';
import { AdminService, InMemoryAdminRepository } from '@mecha-bot/admin';
import { SystemClock } from '@mecha-bot/shared';

describe('AI Brain Orchestrator & Domain Isolation (@mecha-bot/wiring)', () => {
  const dataset = loadAcademicCoreDataset();

  let clock: SystemClock;
  let fakeProvider: FakeAIProvider;
  let router: AIRouter;
  let aiBrain: AiBrainService;
  let searchEngine: SearchEngine;
  let navigatorRepo: InMemoryStudentCoursePositionRepository;
  let navigatorService: StudyNavigatorService;
  let app: MechaBotApp;

  beforeEach(() => {
    clock = new SystemClock();
    fakeProvider = new FakeAIProvider('test-ai-provider');
    router = new AIRouter(fakeProvider, [], new ModelHealthRegistry(), new BudgetManager());
    searchEngine = new SearchEngine();

    aiBrain = new AiBrainService({
      router,
      searchEngine,
    });

    navigatorRepo = new InMemoryStudentCoursePositionRepository();
    navigatorService = new StudyNavigatorService({ dataset, repository: navigatorRepo });

    app = new MechaBotApp({
      academicDataset: dataset,
      navigatorService,
      companionService: new CompanionService(new InMemoryCompanionRepository()),
      timetableService: new TimetableService({ clock }),
      schedulerService: new ReminderSchedulerService({ clock }),
      searchEngine,
      distributionService: new FileDistributionService({
        repository: new InMemoryFileCatalogRepository(),
      }),
      examsService: new ExamsService(new InMemoryExamsRepository()),
      adminService: new AdminService({ repository: new InMemoryAdminRepository() }),
      aiBrainService: aiBrain,
    });
  });

  it('orchestrates academic question answering via app.askAi()', async () => {
    fakeProvider.setMockResponse({
      intent: 'CONCEPT_EXPLANATION',
      courseCode: 'MCT314',
      topic: 'Root Locus',
      answer: 'طريقة المحل الهندسي للجذور تتبع حركة الأقطاب مع تغير K.',
      equations: ['1 + K G(s) H(s) = 0'],
      sourceRefs: [
        {
          sourceId: 'src_control_book',
          title: 'Ogata Modern Control',
          page: 55,
        },
      ],
      confidence: 'HIGH',
      assumptions: ['نظام خطي متصل بالزمن'],
      needsClarification: false,
    });

    const response = await app.askAi({
      studentKey: 'student_stu_1',
      question: 'اشرحلي طريقة Root Locus بالتفصيل',
      activeCourseCode: 'MCT314',
    });

    expect(response.courseCode).toBe('MCT314');
    expect(response.answer).toContain('طريقة المحل الهندسي للجذور');
    expect(response.equations).toContain('1 + K G(s) H(s) = 0');
    expect(response.citations.length).toBe(1);
    expect(response.citations[0]?.title).toBe('Ogata Modern Control');
  });

  it('surfaces CONFLICTING disclaimer for MCT124 without inventing a syllabus resolution', async () => {
    fakeProvider.setMockResponse({
      intent: 'CONCEPT_EXPLANATION',
      courseCode: 'MCT124',
      topic: 'Curriculum',
      answer: 'مقرر MCT124 يواجه تضارباً بين مصادر القسم ولجنة المناهج.',
      equations: [],
      sourceRefs: [],
      confidence: 'MEDIUM',
      assumptions: [],
      needsClarification: false,
    });

    const response = await app.askAi({
      studentKey: 'student_stu_2',
      question: 'ما هي مفردات مادة MCT124؟',
      activeCourseCode: 'MCT124',
    });

    expect(response.courseCode).toBe('MCT124');
    expect(response.disclaimer).toBeDefined();
    expect(response.disclaimer).toContain('تضارب منهجي');
    expect(response.disclaimer).toContain('CONFLICTING');
  });

  it('surfaces IDENTITY_ONLY disclaimer for P4MCT without fabricating topic map', async () => {
    fakeProvider.setMockResponse({
      intent: 'COURSE_IDENTITY',
      courseCode: 'P4MCT',
      topic: null,
      answer: 'مشروع التخرج P4MCT هو مقرر عملي لمشاريع التخرج للمرحلة الرابعة.',
      equations: [],
      sourceRefs: [],
      confidence: 'HIGH',
      assumptions: [],
      needsClarification: false,
    });

    const response = await app.askAi({
      studentKey: 'student_stu_3',
      question: 'اشرحلي مادة P4MCT شنو مواضيعها؟',
      activeCourseCode: 'P4MCT',
    });

    expect(response.courseCode).toBe('P4MCT');
    expect(response.disclaimer).toBeDefined();
    expect(response.disclaimer).toContain('IDENTITY_ONLY');
  });

  it('enforces authority boundary: AI answers NEVER confirm or update student progress', async () => {
    const studentKey = 'student_unconfirmed';
    const courseCode = 'MCT314';

    // Verify initial state has no confirmed position
    const initialPos = await navigatorService.getStudentPosition(studentKey, courseCode);
    expect(initialPos).toBeNull();

    // Student asks a question
    await app.askAi({
      studentKey,
      question: 'اشرحلي موضوع Root Locus وشلون أحسب نقاط الانفصال',
      activeCourseCode: courseCode,
    });

    // Position MUST still be null; asking questions never confirms progress
    const postAiPos = await navigatorService.getStudentPosition(studentKey, courseCode);
    expect(postAiPos).toBeNull();
  });

  it('emits clarification prompt when student question is ambiguous across courses', async () => {
    const response = await app.askAi({
      studentKey: 'student_ambiguous',
      question: 'اشرحلي موضوع الاستقرارية',
      // No activeCourseCode provided
    });

    expect(response.needsClarification).toBe(true);
    expect(response.intent).toBe('CLARIFICATION_NEEDED');
    expect(response.clarificationPrompt).toBeDefined();
    expect(response.suggestedClarifications?.length).toBeGreaterThan(0);
  });

  it('gracefully degrades on daily quota exhaustion (Error 3036)', async () => {
    fakeProvider.setSimulateQuotaExhausted('Cloudflare 3036 daily allocation exceeded');

    const response = await app.askAi({
      studentKey: 'student_quota_test',
      question: 'اشرحلي Root Locus',
      activeCourseCode: 'MCT314',
    });

    expect(response.usedFallback).toBe(true);
    expect(response.answer).toContain('حالياً المساعد الذكي غير متاح');
    expect(response.answer).toContain('الحصة اليومية');
  });
});
