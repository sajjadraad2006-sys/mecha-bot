import { describe, it, expect, beforeEach } from 'vitest';
import { SystemClock } from '@mecha-bot/shared';
import { loadAcademicCoreDataset } from '@mecha-bot/academic';
import { TimetableService, type TimetableSlot } from '@mecha-bot/timetable';
import { ReminderSchedulerService } from '@mecha-bot/scheduler';
import { CompanionService, InMemoryCompanionRepository } from '@mecha-bot/companion';
import { ExamsService, InMemoryExamsRepository } from '@mecha-bot/exams';
import { SearchEngine, type SearchDocument } from '@mecha-bot/search';
import {
  StudyNavigatorService,
  InMemoryStudentCoursePositionRepository,
} from '@mecha-bot/navigator';
import { AdminService, InMemoryAdminRepository } from '@mecha-bot/admin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Context } from 'grammy';
import { SqliteDatabaseConnection, MigrationRunner, StudentRepository } from '@mecha-bot/database';
import { TelegramAppBridge } from '@mecha-bot/telegram';
import {
  FileDistributionService,
  InMemoryFileCatalogRepository,
  type AcademicFileRecord,
} from '@mecha-bot/distribution';

import {
  MechaBotApp,
  forwardCompanionSignalToNavigator,
  forwardCompletedSessionToNavigator,
  confirmStudentCoursePosition,
  indexIngestedDocument,
  resolveSearchDelivery,
  scheduleLectureRemindersFromTimetable,
  scheduleRemindersForAcademicEvent,
  executeAdminReviewDecisionSafely,
  assertAdminApprovalDoesNotMutateAcademicEvidence,
} from '@mecha-bot/wiring';

describe('Cross-Domain Wiring Layer (@mecha-bot/wiring)', () => {
  const dataset = loadAcademicCoreDataset();

  let navigatorRepo: InMemoryStudentCoursePositionRepository;
  let companionRepo: InMemoryCompanionRepository;
  let examsRepo: InMemoryExamsRepository;
  let adminRepo: InMemoryAdminRepository;
  let distributionRepo: InMemoryFileCatalogRepository;

  let navigatorService: StudyNavigatorService;
  let companionService: CompanionService;
  let timetableService: TimetableService;
  let schedulerService: ReminderSchedulerService;
  let searchEngine: SearchEngine;
  let distributionService: FileDistributionService;
  let examsService: ExamsService;
  let adminService: AdminService;

  let app: MechaBotApp;

  beforeEach(() => {
    navigatorRepo = new InMemoryStudentCoursePositionRepository();
    companionRepo = new InMemoryCompanionRepository();
    examsRepo = new InMemoryExamsRepository();
    adminRepo = new InMemoryAdminRepository({
      roles: {
        admin_reviewer: 'ADMIN',
        student_user: 'STUDENT',
      },
    });
    distributionRepo = new InMemoryFileCatalogRepository();

    navigatorService = new StudyNavigatorService({ dataset, repository: navigatorRepo });
    companionService = new CompanionService(companionRepo);
    timetableService = new TimetableService({ clock: new SystemClock() });
    schedulerService = new ReminderSchedulerService({ clock: new SystemClock() });
    searchEngine = new SearchEngine();
    distributionService = new FileDistributionService({ repository: distributionRepo });
    examsService = new ExamsService(examsRepo);
    adminService = new AdminService({ repository: adminRepo });

    app = new MechaBotApp({
      academicDataset: dataset,
      navigatorService,
      companionService,
      timetableService,
      schedulerService,
      searchEngine,
      distributionService,
      examsService,
      adminService,
    });
  });

  // =========================================================================
  // BRIDGE A: Companion (M5) -> Navigator (M9)
  // =========================================================================
  describe('Bridge A: Companion -> Navigator', () => {
    it('translates companion progress signal to navigator learning signal', async () => {
      const signal = companionService.recordProgressSignal({
        studentKey: 'student_bridge_1',
        courseCode: 'MCT211',
        topicKey: 'laplace-transforms',
        type: 'STUDY_SESSION',
        sessionId: 'sess_101',
        completedMinutes: 45,
        occurredAt: '2026-10-15T10:00:00.000Z',
      });

      const navSignal = await forwardCompanionSignalToNavigator(navigatorService, signal);
      expect(navSignal.type).toBe('STUDY_SESSION');
      expect(navSignal.value).toBe(45);
      expect(navSignal.courseCode).toBe('MCT211');
      expect(navSignal.studentKey).toBe('student_bridge_1');
    });

    it('completed study session records signal but does NOT declare CONFIRMED_BY_STUDENT', async () => {
      const session = companionService.startSession({
        studentKey: 'student_bridge_2',
        courseCode: 'MCT211',
        topicKey: 'laplace-transforms',
        type: 'STUDY',
        plannedDurationMinutes: 50,
      });

      const completed = companionService.completeSession(session.id, {
        completionReason: 'Completed study',
      });

      const navSignal = await forwardCompletedSessionToNavigator(navigatorService, completed);
      expect(navSignal).not.toBeNull();
      expect(navSignal?.type).toBe('STUDY_SESSION');

      // Crucial verification: student course position is still unset / not confirmed
      const pos = await navigatorService.getStudentPosition('student_bridge_2', 'MCT211');
      expect(pos).toBeNull();
    });

    it('only explicit student confirmation sets CONFIRMED_BY_STUDENT', async () => {
      const confirmed = await confirmStudentCoursePosition(navigatorService, {
        studentKey: 'student_bridge_3',
        courseCode: 'MCT211',
        topicKey: 'laplace-transforms',
        confidence: 4,
      });

      expect(confirmed.status).toBe('CONFIRMED_BY_STUDENT');
      expect(confirmed.source).toBe('STUDENT');
      expect(confirmed.lastUnderstoodTopicKey).toBe('laplace-transforms');
      expect(confirmed.selfReportedConfidence).toBe(4);

      // Verify stored in repository
      const stored = await navigatorService.getStudentPosition('student_bridge_3', 'MCT211');
      expect(stored?.status).toBe('CONFIRMED_BY_STUDENT');
    });
  });

  // =========================================================================
  // BRIDGE B: Ingestion (M6) -> Search (M7)
  // =========================================================================
  describe('Bridge B: Ingestion -> Search', () => {
    it('indexes searchable M6 manifest documents into BM25 index', () => {
      const manifest = {
        schemaVersion: 1,
        documentId: 'doc_ingest_1',
        sha256: 'abc123hash',
        originalFilename: 'lecture_01_kinematics.pdf',
        fileSizeBytes: 102400,
        mimeType: 'application/pdf',
        pageCount: 1,
        courseCode: 'MCT314',
        documentType: 'LECTURER_NOTE',
        authority: 'FACULTY',
        evidenceScope: 'EXACT_COURSE',
        verificationStatus: 'VERIFIED',
        distributionAllowed: 'ALLOWED',
        permissions: {
          canSearch: true,
          canQuote: true,
          canDistribute: true,
        },
        textExtractionStatus: 'SUCCESS',
      };

      const extracted = {
        documentId: 'doc_ingest_1',
        pageCount: 1,
        pages: [
          {
            page: 1,
            textOriginal:
              'Forward kinematics describes the end effector position in robot arm coordinate frame.',
            textNormalized:
              'forward kinematics describes the end effector position in robot arm coordinate frame',
            charCount: 88,
          },
        ],
      };

      const result = indexIngestedDocument(searchEngine, manifest, extracted);
      expect(result.isSearchable).toBe(true);
      expect(result.indexedChunkCount).toBeGreaterThan(0);

      const searchResp = searchEngine.search({
        text: 'robot kinematics end effector',
        courseCode: 'MCT314',
      });
      expect(searchResp.results.length).toBeGreaterThan(0);
      expect(searchResp.results[0]?.courseCode).toBe('MCT314');
    });

    it('strictly rejects documents where canSearch is false', () => {
      const manifest = {
        schemaVersion: 1,
        documentId: 'doc_private_1',
        sha256: 'def456hash',
        originalFilename: 'private_notes.pdf',
        fileSizeBytes: 50000,
        mimeType: 'application/pdf',
        pageCount: 1,
        courseCode: 'MCT314',
        documentType: 'STUDENT_NOTE',
        authority: 'STUDENT',
        evidenceScope: 'SECTION',
        verificationStatus: 'RAW',
        distributionAllowed: 'PROHIBITED',
        permissions: {
          canSearch: false, // Disallowed
          canQuote: false,
          canDistribute: false,
        },
        textExtractionStatus: 'SUCCESS',
      };

      const extracted = {
        documentId: 'doc_private_1',
        pageCount: 1,
        pages: [
          {
            page: 1,
            textOriginal: 'Unpublished confidential draft calculations.',
            textNormalized: 'unpublished confidential draft calculations',
            charCount: 44,
          },
        ],
      };

      const result = indexIngestedDocument(searchEngine, manifest, extracted);
      expect(result.isSearchable).toBe(false);
      expect(result.indexedChunkCount).toBe(0);

      const searchResp = searchEngine.search({ text: 'confidential calculations' });
      expect(searchResp.results.length).toBe(0);
    });
  });

  // =========================================================================
  // BRIDGE C: Search (M7) -> Distribution (M12)
  // =========================================================================
  describe('Bridge C: Search -> Distribution', () => {
    it('blocks file delivery with BLOCKED_POLICY when canDistribute is false', async () => {
      const doc: SearchDocument = {
        id: 'chunk_textbook_1',
        documentId: 'textbook_ogata_controls',
        courseCode: 'MCT314',
        topicKeys: ['root_locus'],
        title: 'Modern Control Engineering (Ogata)',
        textOriginal: 'The root locus method was introduced by W. R. Evans in 1948.',
        textNormalized: 'the root locus method was introduced by w r evans in 1948',
        documentType: 'TEXTBOOK',
        sourceAuthority: 'EXTERNAL',
        evidenceScope: 'GENERAL',
        verificationStatus: 'VERIFIED',
        canSearch: true,
        canQuote: true,
        canDistribute: false, // Distribution blocked
        provenance: {},
      };

      searchEngine.indexDocument(doc);
      const searchResp = searchEngine.search({ text: 'root locus method Evans' });
      expect(searchResp.results.length).toBeGreaterThan(0);

      const delivery = await resolveSearchDelivery(
        distributionService,
        searchResp.results[0]!,
        'student_user_1',
      );

      expect(delivery.status).toBe('BLOCKED_POLICY');
      expect(delivery.reason).toContain('not authorized for direct file distribution');
    });

    it('prohibits delivery of solution manuals through search and distribution integration', async () => {
      const record: AcademicFileRecord = {
        id: 'file_solution_manual_1',
        title: 'Modern Control Solution Manual',
        documentType: 'SOLUTION_MANUAL',
        sourceAuthority: 'EXTERNAL',
        verificationStatus: 'RAW',
        distributionPolicy: {
          canSearch: false,
          canQuote: false,
          canDistribute: false,
          policyState: 'PROHIBITED',
          reason: 'Solution manuals strictly prohibited.',
        },
        visibility: 'GLOBAL',
        archiveStatus: 'CURRENT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await distributionRepo.add(record);

      const delivery = await app.requestDelivery('student_user_1', 'file_solution_manual_1');
      expect(delivery.status).toBe('BLOCKED_POLICY');
    });

    it('allows delivery of authorized lecture notes with storage references', async () => {
      const record: AcademicFileRecord = {
        id: 'file_lecture_01',
        title: 'MCT314 Lecture 1 Slides',
        courseCode: 'MCT314',
        documentType: 'LECTURE_SLIDES',
        sourceAuthority: 'FACULTY',
        verificationStatus: 'VERIFIED',
        distributionPolicy: {
          canSearch: true,
          canQuote: true,
          canDistribute: true,
          policyState: 'ALLOWED',
        },
        storageReference: {
          kind: 'TELEGRAM_FILE_ID',
          value: 'tg_file_id_xyz987',
        },
        visibility: 'COURSE_SHARED',
        archiveStatus: 'CURRENT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await distributionRepo.add(record);

      const delivery = await app.requestDelivery('student_user_1', 'file_lecture_01');
      expect(delivery.status).toBe('READY_TELEGRAM_FILE');
      expect(delivery.storageReference?.value).toBe('tg_file_id_xyz987');
    });
  });

  // =========================================================================
  // BRIDGE D: Timetable (M3) -> Scheduler (M4)
  // =========================================================================
  describe('Bridge D: Timetable -> Scheduler', () => {
    it('schedules lecture reminders with Baghdad timezone and suppresses outdated slots', async () => {
      const slot1: TimetableSlot = {
        id: 'slot_verified_1',
        stage: 3,
        programSemester: 1,
        courseCode: 'MCT314',
        weekday: 'MONDAY',
        startTime: '08:30',
        endTime: '10:30',
        room: 'Hall 3',
        type: 'LECTURE',
        sourceStatus: 'VERIFIED',
      };

      const slotOutdated: TimetableSlot = {
        id: 'slot_outdated_1',
        stage: 3,
        programSemester: 1,
        courseCode: 'MCT315',
        weekday: 'MONDAY',
        startTime: '10:30',
        endTime: '12:30',
        room: 'Hall 4',
        type: 'LECTURE',
        sourceStatus: 'OUTDATED', // Must be ignored
      };

      timetableService.setSlots([slot1, slotOutdated]);

      const result = await scheduleLectureRemindersFromTimetable(
        timetableService,
        schedulerService,
        {
          request: {
            studentKey: 'student_sched_1',
            date: '2026-10-19', // Monday
            stage: 3,
            programSemester: 1,
          },
          options: {
            offsetMinutes: -30, // 30 minutes before 08:30 (08:00 Baghdad)
          },
        },
      );

      expect(result.scheduledCount).toBe(1);
      expect(result.reminders[0]?.relatedCourseCode).toBe('MCT314');
      expect(result.reminders[0]?.kind).toBe('LECTURE');
      expect(result.reminders[0]?.timezone).toBe('Asia/Baghdad');
    });

    it('evaluates quiet hours deferral for early morning reminders', async () => {
      const earlySlot: TimetableSlot = {
        id: 'slot_early_1',
        stage: 3,
        programSemester: 1,
        courseCode: 'MCT314',
        weekday: 'MONDAY',
        startTime: '06:00',
        endTime: '08:00',
        type: 'LECTURE',
        sourceStatus: 'VERIFIED',
      };
      timetableService.setSlots([earlySlot]);

      // Quiet hours from 23:00 to 07:00
      const result = await scheduleLectureRemindersFromTimetable(
        timetableService,
        schedulerService,
        {
          request: {
            studentKey: 'student_sched_2',
            date: '2026-10-19',
            stage: 3,
            programSemester: 1,
          },
          options: {
            offsetMinutes: -60, // 05:00 AM (inside quiet hours)
            quietHoursConfig: {
              enabled: true,
              startHour: 23,
              startMinute: 0,
              endHour: 7,
              endMinute: 0,
              timezone: 'Asia/Baghdad',
            },
          },
        },
      );

      expect(result.scheduledCount).toBe(1);
      expect(result.deferredDueToQuietHours).toBe(1);
    });
  });

  // =========================================================================
  // BRIDGE E: Exams & Events (M10) -> Scheduler (M4)
  // =========================================================================
  describe('Bridge E: Exams -> Scheduler', () => {
    it('schedules reminders for CONFIRMED academic events at academic offsets', async () => {
      const event = examsService.createEvent({
        courseCode: 'MCT314',
        title: 'Midterm Exam Controls',
        type: 'MIDTERM',
        occursAt: '2026-11-20T06:00:00.000Z', // 09:00 Baghdad
        sourceStatus: 'OFFICIAL_SOURCE',
        confirmationStatus: 'CONFIRMED',
      });

      const res = await scheduleRemindersForAcademicEvent(schedulerService, {
        userKey: 'student_exam_1',
        event,
        offsetMinutesList: [-1440, -120], // 1 day and 2 hours before
      });

      expect(res.scheduledCount).toBe(2);
      expect(res.requiresStudentConfirmation).toBe(false);
      expect(res.reminders[0]?.kind).toBe('EXAM');
      expect(res.reminders[0]?.sourceType).toBe('STUDENT_CONFIRMED');
    });

    it('refuses to schedule active reminders for INFERRED_UNCONFIRMED events', async () => {
      const inferredEvent = examsService.createEvent({
        courseCode: 'MCT314',
        title: 'Possible Pop Quiz',
        type: 'QUIZ',
        occursAt: '2026-11-25T07:00:00.000Z',
        sourceStatus: 'INFERRED',
        confirmationStatus: 'INFERRED_UNCONFIRMED',
      });

      const res = await scheduleRemindersForAcademicEvent(schedulerService, {
        userKey: 'student_exam_2',
        event: inferredEvent,
      });

      // Product principle: infer -> suggest -> confirm, never silently assume
      expect(res.scheduledCount).toBe(0);
      expect(res.reminders).toHaveLength(0);
      expect(res.requiresStudentConfirmation).toBe(true);
      expect(res.reason).toContain('INFERRED_UNCONFIRMED');
    });
  });

  // =========================================================================
  // BRIDGE F: Admin Moderation (M11) -> Academic Semantic Safety (M2/M12)
  // REGRESSION TEST: ADMIN APPROVED != ACADEMICALLY VERIFIED
  // =========================================================================
  describe('Bridge F: Admin Semantic Safety (ADMIN APPROVED != VERIFIED)', () => {
    it('executes admin workflow approval without mutative side effects on evidence', async () => {
      const item = await adminService.submitForReview('student_user', {
        type: 'SOURCE_SUBMISSION',
        courseCode: 'MCT211',
        title: 'Student lecture summary',
        targetRef: 'ref_submission_1',
      });

      const originalEvidence = {
        sourceAuthority: 'STUDENT',
        verificationStatus: 'RAW',
        evidenceScope: 'SECTION',
      };

      const result = await executeAdminReviewDecisionSafely(
        adminService,
        'admin_reviewer',
        {
          itemId: item.id,
          decision: 'APPROVED',
          reason: 'Format meets guidelines',
        },
        {
          original: originalEvidence,
          targetCandidate: {
            // Safe candidate: workflow state approved, academic evidence unmutated
            sourceAuthority: 'STUDENT',
            verificationStatus: 'RAW',
            evidenceScope: 'SECTION',
          },
        },
      );

      expect(result.reviewItem.status).toBe('APPROVED');
      expect(result.academicEvidencePreserved).toBe(true);
      expect(result.disclaimer).toContain(
        'APPROVED review status indicates acceptance into workflow only',
      );
    });

    it('REGRESSION TEST: prevents admin approval from mutating sourceAuthority, verificationStatus, or evidenceScope into stronger academic states', () => {
      const originalEvidence = {
        sourceAuthority: 'STUDENT',
        verificationStatus: 'RAW',
        evidenceScope: 'SECTION',
      };

      // 1. Attempting to promote sourceAuthority to FACULTY or OFFICIAL
      expect(() => {
        assertAdminApprovalDoesNotMutateAcademicEvidence(originalEvidence, {
          sourceAuthority: 'FACULTY', // Illegal promotion
          verificationStatus: 'RAW',
          evidenceScope: 'SECTION',
        });
      }).toThrowError(/ADMIN_SEMANTIC_SAFETY_VIOLATION.*sourceAuthority/);

      // 2. Attempting to promote verificationStatus to VERIFIED
      expect(() => {
        assertAdminApprovalDoesNotMutateAcademicEvidence(originalEvidence, {
          sourceAuthority: 'STUDENT',
          verificationStatus: 'VERIFIED', // Illegal promotion
          evidenceScope: 'SECTION',
        });
      }).toThrowError(/ADMIN_SEMANTIC_SAFETY_VIOLATION.*verificationStatus/);

      // 3. Attempting to elevate evidenceScope to EXACT_COURSE
      expect(() => {
        assertAdminApprovalDoesNotMutateAcademicEvidence(originalEvidence, {
          sourceAuthority: 'STUDENT',
          verificationStatus: 'RAW',
          evidenceScope: 'EXACT_COURSE', // Illegal elevation
        });
      }).toThrowError(/ADMIN_SEMANTIC_SAFETY_VIOLATION.*evidenceScope/);
    });
  });

  // =========================================================================
  // APPLICATION ORCHESTRATION & SAFETY CASES 1-5
  // =========================================================================
  describe('Application Orchestrator: Product Safety Cases 1-5', () => {
    it('Safety Case 1: Academic calendar position is always EXPECTED, never confirmed', async () => {
      const resp = await app.whereAreWe('student_case_1', 'MCT111', '2026-10-15');
      expect(resp.calendarPosition?.status).toBe('EXPECTED');
      expect(resp.needsStudentConfirmation).toBe(true);
    });

    it('Safety Case 2: Course pulse position is preserved without collapsing into student position', async () => {
      const resp = await app.whereAreWe('student_case_2', 'MCT111');
      // If no student position yet, studentPosition is undefined
      expect(resp.studentPosition).toBeUndefined();
      expect(resp.needsStudentConfirmation).toBe(true);
    });

    it('Safety Case 3: Student position becomes CONFIRMED_BY_STUDENT only upon explicit student confirmation', async () => {
      await app.confirmPosition({
        studentKey: 'student_case_3',
        courseCode: 'MCT111',
        topicKey: 'vectors-and-matrices',
        confidence: 5,
      });

      const resp = await app.whereAreWe('student_case_3', 'MCT111');
      expect(resp.studentPosition?.status).toBe('CONFIRMED_BY_STUDENT');
      expect(resp.studentPosition?.source).toBe('STUDENT');
      expect(resp.studentPosition?.lastUnderstoodTopicKey).toBe('vectors-and-matrices');
    });

    it('Safety Case 4: MCT124 conflict is explicitly surfaced without guessing or silently resolving', async () => {
      const resp = await app.whereAreWe('student_case_4', 'MCT124');
      expect(resp.hasConflict).toBe(true);
      expect(resp.conflictDetails?.status).toBe('CONFLICTING');
      expect(resp.conflictDetails?.resolutionStatus).toBe('UNRESOLVED');
      expect(resp.needsStudentConfirmation).toBe(false);
      expect(resp.notes?.[0]).toContain('تضارب منهجي');
    });

    it('Safety Case 5: P4MCT identity-only state is explicitly surfaced without inventing topics', async () => {
      const resp = await app.whereAreWe('student_case_5', 'P4MCT');
      expect(resp.hasTopics).toBe(false);
      expect(resp.topicMapStatus).toBe('IDENTITY_ONLY');
      expect(resp.needsStudentConfirmation).toBe(false);
      expect(resp.notes?.[0]).toContain('معرف فقط');
    });
  });

  // =========================================================================
  // TELEGRAM BOUNDARY PRIVACY & ISOLATION
  // =========================================================================
  describe('Telegram Boundary Privacy & Isolation', () => {
    it('MechaBotApp operates strictly on studentKey without Telegram types or Telegram IDs', async () => {
      // Valid application-level studentKey
      const studentKey = 'student_profile_999';
      const schedule = app.getSchedule({
        studentKey,
        stage: 2,
        programSemester: 1,
        date: '2026-10-18',
      });
      expect(Array.isArray(schedule)).toBe(true);

      // Verify no Telegram ID field exists on domain responses
      const resp = await app.whereAreWe(studentKey, 'MCT211');
      expect(JSON.stringify(resp)).not.toContain('telegramUserId');
      expect(JSON.stringify(resp)).not.toContain('chatId');
    });
  });

  // =========================================================================
  // TELEGRAM APPLICATION BRIDGE (BOUNDARY ISOLATION & ARABIC FORMATTING)
  // =========================================================================
  describe('Telegram Application Bridge (Boundary Isolation & Arabic Formatting)', () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const migrationsDir = path.resolve(__dirname, '../migrations');

    let db: SqliteDatabaseConnection;
    let studentRepo: StudentRepository;
    let bridge: TelegramAppBridge;

    beforeEach(() => {
      db = new SqliteDatabaseConnection(':memory:');
      const runner = new MigrationRunner(db, migrationsDir);
      runner.migrate();
      studentRepo = new StudentRepository(db);
      bridge = new TelegramAppBridge({ app, studentRepo });
    });

    it('translates Telegram context to studentKey and renders whereAreWe prompt', async () => {
      const mockCtx = {
        from: { id: 777123, is_bot: false, first_name: 'Ahmed' },
      } as unknown as Context;

      const output = await bridge.handleWhereAreWe(mockCtx, 'MCT111');
      expect(output).toContain('متابعة مادة (MCT111)');
      expect(output).toContain('بوت ميكا يقترح ويسألك للتأكيد');

      // Verify student was created in database with opaque ID
      const profile = studentRepo.findByTelegramId(777123);
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe('student_777123');
    });

    it('renders explicit academic conflict warning for MCT124 in Telegram', async () => {
      const mockCtx = {
        from: { id: 777124, is_bot: false, first_name: 'Ali' },
      } as unknown as Context;

      const output = await bridge.handleWhereAreWe(mockCtx, 'MCT124');
      expect(output).toContain('تضارب منهجي');
      expect(output).toContain('MCT124');
      expect(output).toContain('CONFLICTING');
    });

    it('renders identity-only notice for P4MCT in Telegram without hallucinating topics', async () => {
      const mockCtx = {
        from: { id: 777125, is_bot: false, first_name: 'Hassan' },
      } as unknown as Context;

      const output = await bridge.handleWhereAreWe(mockCtx, 'P4MCT');
      expect(output).toContain('معرفة بالهوية فقط');
      expect(output).toContain('P4MCT');
      expect(output).toContain('دون شجرة مواضيع تفصيلية');
    });

    it('handles explicit student position confirmation and returns confirmation message', async () => {
      const mockCtx = {
        from: { id: 777126, is_bot: false, first_name: 'Noor' },
      } as unknown as Context;

      const output = await bridge.handleConfirmPosition(mockCtx, 'MCT211', 'laplace-transforms', 4);
      expect(output).toContain('تم تأكيد موضعك الدراسي');
      expect(output).toContain('MCT211');
      expect(output).toContain('laplace-transforms');

      // Verify domain state
      const studentPos = await navigatorService.getStudentPosition('student_777126', 'MCT211');
      expect(studentPos?.status).toBe('CONFIRMED_BY_STUDENT');
    });

    it('handles search queries and formats Arabic responses with delivery status', async () => {
      const mockCtx = {
        from: { id: 777127, is_bot: false, first_name: 'Zainab' },
      } as unknown as Context;

      // Index a test document in search
      searchEngine.indexDocument({
        id: 'chunk_sensor_1',
        documentId: 'doc_sensor_lecture',
        courseCode: 'MCT311',
        topicKeys: ['sensors'],
        title: 'Sensor Principles',
        textOriginal:
          'Thermocouple operates based on the Seebeck effect generating voltage from temperature differential.',
        textNormalized:
          'thermocouple operates based on the seebeck effect generating voltage from temperature differential',
        documentType: 'LECTURER_NOTE',
        sourceAuthority: 'FACULTY',
        evidenceScope: 'EXACT_COURSE',
        verificationStatus: 'VERIFIED',
        canSearch: true,
        canQuote: true,
        canDistribute: false,
        provenance: {},
      });

      const output = await bridge.handleSearch(mockCtx, 'Seebeck effect thermocouple');
      expect(output).toContain('نتائج البحث الأكاديمي');
      expect(output).toContain('MCT311');
      expect(output).toContain('BLOCKED_POLICY'); // canDistribute is false
    });
  });
});
