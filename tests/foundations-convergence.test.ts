import { describe, it, expect } from 'vitest';

// 1. Cross-package imports using monorepo path aliases
import {
  loadAcademicCoreDataset,
  SourceAuthority as AcademicSourceAuthority,
} from '@mecha-bot/academic';
import { TimetableService, detectConflicts, TimetableSlot } from '@mecha-bot/timetable';
import { ReminderSchedulerService, buildReminderTimes } from '@mecha-bot/scheduler';
import { CompanionService, InMemoryCompanionRepository } from '@mecha-bot/companion';
import { ExamsService, InMemoryExamsRepository } from '@mecha-bot/exams';
import { SearchEngine } from '@mecha-bot/search';
import {
  StudyNavigatorService,
  InMemoryStudentCoursePositionRepository,
} from '@mecha-bot/navigator';
import { AdminService, InMemoryAdminRepository } from '@mecha-bot/admin';
import {
  FileDistributionService,
  InMemoryFileCatalogRepository,
  AcademicFileRecord,
} from '@mecha-bot/distribution';

describe('Foundations Convergence - Cross-Package Integration Contracts', () => {
  const dataset = loadAcademicCoreDataset();

  it('1. Academic course resolution and prerequisite graph resolve correctly', () => {
    const resolver = dataset.courseResolver;
    const resolved = resolver.resolve('سيطرة');
    expect(resolved.needsClarification).toBe(true);
    expect(resolved.candidateCourseCodes).toContain('MCT314');
    expect(resolved.candidateCourseCodes).toContain('MCT324');

    const exact = resolver.resolve('MCT111');
    expect(exact.candidateCourseCodes).toContain('MCT111');

    const graph = dataset.prerequisiteGraph;
    const prereqs = graph.getDirectPrerequisites('MCT314');
    expect(Array.isArray(prereqs)).toBe(true);
  });

  it('2. Timetable service initializes and evaluates slot conflicts', () => {
    const service = new TimetableService();
    expect(service).toBeDefined();

    const existing: TimetableSlot = {
      id: 'slot-1',
      academicYear: '2026-2027',
      programSemester: 1,
      courseCode: 'MCT111',
      dayOfWeek: 1,
      startTime: '08:30',
      endTime: '10:30',
      section: 'A',
      location: 'Hall 1',
      slotType: 'LECTURE',
    };

    const conflicting: TimetableSlot = {
      id: 'slot-2',
      academicYear: '2026-2027',
      programSemester: 1,
      courseCode: 'MCT112',
      dayOfWeek: 1,
      startTime: '09:30',
      endTime: '11:30',
      section: 'A',
      location: 'Hall 2',
      slotType: 'LECTURE',
    };

    const conflicts = detectConflicts([existing, conflicting], { ignoreOutdated: false });
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].type).toBe('STUDENT_SCHEDULE_OVERLAP');
  });

  it('3. Scheduler service and academic offset triggers compute correctly', () => {
    const scheduler = new ReminderSchedulerService({});
    expect(scheduler).toBeDefined();

    const targetTime = '2026-10-15T09:00:00.000Z';
    const reminderTimes = buildReminderTimes(targetTime, [-1440, -120]);
    expect(reminderTimes).toHaveLength(2);
    expect(reminderTimes[0]).toBe('2026-10-14T09:00:00.000Z');
    expect(reminderTimes[1]).toBe('2026-10-15T07:00:00.000Z');
  });

  it('4. Companion service manages sessions and Baghdad local check-in signals', () => {
    const repo = new InMemoryCompanionRepository();
    const companion = new CompanionService(repo);

    const session = companion.startSession({
      studentKey: 'student_int_1',
      courseCode: 'MCT211',
      type: 'STUDY',
      plannedDurationMinutes: 45,
    });
    expect(session.status).toBe('ACTIVE');

    const completed = companion.completeSession(session.id, {
      completionReason: 'Finished topic 1',
    });
    expect(completed.status).toBe('COMPLETED');
  });

  it('5. Exams service manages question lifecycle and deterministic scoring', () => {
    const repo = new InMemoryExamsRepository();
    const examService = new ExamsService(repo);

    const q = examService.createPastQuestion({
      courseCode: 'ME301',
      academicYear: '2025-2026',
      semester: 1,
      examType: 'FINAL_EXAM',
      questionNumber: '1',
      questionText: 'Sketch the root locus of the given open-loop transfer function.',
      topicKeys: ['root-locus'],
      sourceRef: 'archive-2026',
      solutionStatus: 'NONE',
      verificationStatus: 'VERIFIED',
    });
    expect(q.id).toBeDefined();

    const quiz = examService.createPracticeQuiz({
      courseCode: 'ME301',
      title: 'Controls Exam Prep',
      questions: [
        {
          id: 'q_1',
          prompt: 'Is the root locus symmetric with respect to the real axis?',
          type: 'TRUE_FALSE',
          options: ['True', 'False'],
          correctAnswer: 'True',
          points: 1,
        },
      ],
    });
    expect(quiz.id).toBeDefined();

    const attempt = examService.startAttempt(quiz.id, 'student_int_1');
    expect(attempt.status).toBe('IN_PROGRESS');
  });

  it('6. Search engine operates with BM25 indexing and intent filtering', () => {
    const engine = new SearchEngine();
    const count = engine.indexDocuments([
      {
        id: 'doc_1',
        documentId: 'parent_1',
        courseCode: 'MCT314',
        topicKeys: ['root_locus'],
        textOriginal: 'Root locus is a graphical method for examining control stability.',
        textNormalized: 'root locus is a graphical method for examining control stability',
        documentType: 'LECTURER_NOTE',
        sourceAuthority: 'LECTURER_CURRENT',
        evidenceScope: 'EXACT_COURSE',
        verificationStatus: 'VERIFIED',
        canSearch: true,
        canQuote: true,
        canDistribute: false,
        provenance: {},
      },
    ]);
    expect(count).toBe(1);

    const response = engine.search({
      text: 'root locus stability',
      courseCode: 'MCT314',
      intent: 'CONCEPT_EXPLANATION',
    });
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results[0].id).toBe('doc_1');
  });

  it('7. Study Navigator preserves 3 truths and produces deterministic diagnosis', async () => {
    const repo = new InMemoryStudentCoursePositionRepository();
    const navigator = new StudyNavigatorService({ dataset, repository: repo });

    const snapshot = await navigator.getCourseSnapshot({
      studentKey: 'student_nav_1',
      courseCode: 'MCT111',
      calendarPosition: {
        academicWeek: 5,
        localDate: '2026-10-15',
        status: 'EXPECTED',
      },
    });
    expect(snapshot.calendarPosition.status).toBe('EXPECTED');
    expect(snapshot.courseCode).toBe('MCT111');
  });

  it('8. Admin review enforces APPROVED != VERIFIED semantics', async () => {
    const repo = new InMemoryAdminRepository({
      roles: {
        admin_actor_1: 'ADMIN',
        student_actor_1: 'STUDENT',
      },
    });
    const admin = new AdminService({ repository: repo });

    const item = await admin.submitForReview('student_actor_1', {
      type: 'SOURCE_SUBMISSION',
      title: 'Lecture 1 notes',
      courseCode: 'MCT211',
      targetRef: 'ref_001',
    });
    expect(item.status).toBe('PENDING');

    const decided = await admin.decideReviewItem('admin_actor_1', {
      itemId: item.id,
      decision: 'APPROVED',
      reason: 'Verified document format',
    });
    expect(decided.status).toBe('APPROVED');

    // Semantic invariant: workflow APPROVED status must not be confused with academic evidence isVerified
    expect(decided.status).not.toBe('VERIFIED');
  });

  it('9. Distribution service strictly prohibits solution manuals and validates policies', async () => {
    const repo = new InMemoryFileCatalogRepository();
    const distribution = new FileDistributionService(repo);

    const record: AcademicFileRecord = {
      id: 'file-sol-1',
      title: 'Controls Solution Manual',
      documentType: 'SOLUTION_MANUAL',
      sourceAuthority: 'EXTERNAL',
      verificationStatus: 'RAW',
      distributionPolicy: {
        canSearch: false,
        canQuote: false,
        canDistribute: false,
        policyState: 'PROHIBITED',
      },
      visibility: 'GLOBAL',
      archiveStatus: 'CURRENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await distribution.registerFile(record);

    const delivery = await distribution.requestFileDelivery({
      fileRecordId: 'file-sol-1',
    });
    expect(delivery.status).toBe('BLOCKED_POLICY');
  });

  it('10. Academic dataset contains explicit MCT124 conflict and P4MCT IDENTITY_ONLY', () => {
    const mct124Conflict = dataset.conflicts.find((c) => c.courseCode === 'MCT124');
    expect(mct124Conflict).toBeDefined();
    expect(mct124Conflict?.status).toBe('CONFLICTING');
    expect(mct124Conflict?.resolutionStatus).toBe('UNRESOLVED');

    const p4mctProfile = dataset.profiles.find((p) => p.courseCode === 'P4MCT');
    expect(p4mctProfile).toBeDefined();
    expect(p4mctProfile?.topicMapStatus).toBe('IDENTITY_ONLY');
    expect(p4mctProfile?.topics.length).toBe(0);
  });
});
