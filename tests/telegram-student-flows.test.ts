import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Context, InlineKeyboard } from 'grammy';
import {
  SqliteDatabaseConnection,
  MigrationRunner,
  StudentRepository,
  AcademicRepository,
  type StudentProfile,
} from '@mecha-bot/database';
import {
  AcademicCalendarService,
  loadAcademicCoreDataset,
  type AcademicCoreDataset,
  type Stage,
  type ProgramSemester,
} from '@mecha-bot/academic';
import { FakeClock, JsonLogger, SystemClock } from '@mecha-bot/shared';
import {
  StudyNavigatorService,
  InMemoryStudentCoursePositionRepository,
} from '@mecha-bot/navigator';
import { CompanionService, InMemoryCompanionRepository } from '@mecha-bot/companion';
import { TimetableService, SYNTHETIC_STAGE2_SLOTS } from '@mecha-bot/timetable';
import { ReminderSchedulerService } from '@mecha-bot/scheduler';
import { SearchEngine } from '@mecha-bot/search';
import { FileDistributionService, InMemoryFileCatalogRepository } from '@mecha-bot/distribution';
import { ExamsService, InMemoryExamsRepository } from '@mecha-bot/exams';
import { AdminService, InMemoryAdminRepository } from '@mecha-bot/admin';
import { MechaBotApp } from '@mecha-bot/wiring';
import { OnboardingRouter, TelegramAppBridge } from '@mecha-bot/telegram';
import { importOfficialCurriculum } from '../scripts/import-curriculum.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../migrations');
const curriculumFilePath = path.resolve(
  __dirname,
  '../curriculum/official/uob-mechatronics-2025.json',
);

function createMockContext(options: {
  userId?: number;
  text?: string;
  callbackData?: string;
  messageId?: number;
}) {
  const userId = options.userId ?? 10001;
  const answerCallbackQuery = vi.fn().mockResolvedValue(true);
  const editMessageText = vi.fn().mockResolvedValue(true);
  const reply = vi.fn().mockResolvedValue({ message_id: 999 });

  const ctx = {
    from: { id: userId, is_bot: false, first_name: 'StudentUser' },
    message: options.text
      ? { text: options.text, message_id: options.messageId ?? 100 }
      : undefined,
    callbackQuery: options.callbackData
      ? {
          id: `cb_query_${Date.now()}`,
          data: options.callbackData,
          message: { message_id: options.messageId ?? 100 },
        }
      : undefined,
    answerCallbackQuery,
    editMessageText,
    reply,
  } as unknown as Context;

  return { ctx, answerCallbackQuery, editMessageText, reply };
}

function getCallbackDataList(keyboard: InlineKeyboard): string[] {
  return keyboard.inline_keyboard
    .flat()
    .map((b) => ('callback_data' in b ? (b.callback_data as string) : ''))
    .filter(Boolean);
}

describe('Telegram Application Layer — Student Flows (Cases A–T)', () => {
  let db: SqliteDatabaseConnection;
  let clock: FakeClock;
  let logger: JsonLogger;
  let studentRepo: StudentRepository;
  let academicRepo: AcademicRepository;
  let calendarService: AcademicCalendarService;
  let dataset: AcademicCoreDataset;

  let navigatorRepo: InMemoryStudentCoursePositionRepository;
  let companionRepo: InMemoryCompanionRepository;
  let examsRepo: InMemoryExamsRepository;
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
  let bridge: TelegramAppBridge;
  let router: OnboardingRouter;

  const TEST_USER_ID = 20001;

  function saveStudent(params: {
    telegramUserId: number;
    stage?: number | null;
    programSemester?: number | null;
    activeCourseId?: string | null;
  }): StudentProfile {
    const existing = studentRepo.findByTelegramId(params.telegramUserId);
    const now = clock.nowIso();
    const profile: StudentProfile = {
      id: existing?.id || `student_${params.telegramUserId}`,
      telegramUserId: params.telegramUserId,
      stage:
        ((params.stage !== undefined ? params.stage : existing?.stage) as Stage | null) ?? null,
      programSemester:
        ((params.programSemester !== undefined
          ? params.programSemester
          : existing?.programSemester) as ProgramSemester | null) ?? null,
      activeCourseId:
        (params.activeCourseId !== undefined ? params.activeCourseId : existing?.activeCourseId) ||
        null,
      activeCourseOfferingId: null,
      locale: 'ar',
      timezone: 'Asia/Baghdad',
      notificationPreferences: {},
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    studentRepo.upsert(profile);
    return profile;
  }

  beforeEach(() => {
    db = new SqliteDatabaseConnection(':memory:');
    const runner = new MigrationRunner(db, migrationsDir);
    runner.migrate();

    // Import official curriculum into SQLite
    importOfficialCurriculum(db, curriculumFilePath);

    clock = new FakeClock('2026-10-15T08:00:00.000Z');
    logger = new JsonLogger('error');
    studentRepo = new StudentRepository(db);
    academicRepo = new AcademicRepository(db);
    dataset = loadAcademicCoreDataset();

    // Setup teaching period for Stage 2, Semester 3 (2026-2027)
    const period = {
      id: 'period_sem3_teaching',
      academicYearId: 'ay_2026_2027',
      stageScope: 2 as const,
      programSemester: 3 as const,
      periodType: 'TEACHING' as const,
      startsOn: '2026-09-20',
      endsOn: '2027-01-10',
      nominalWeekCount: 15,
      evidenceMetadataJson: null,
      createdAt: clock.nowIso(),
    };
    academicRepo.createCalendarPeriod(period);
    calendarService = new AcademicCalendarService([period]);

    // Initialize domain services
    navigatorRepo = new InMemoryStudentCoursePositionRepository();
    companionRepo = new InMemoryCompanionRepository();
    examsRepo = new InMemoryExamsRepository();
    distributionRepo = new InMemoryFileCatalogRepository();

    navigatorService = new StudyNavigatorService({ dataset, repository: navigatorRepo });
    companionService = new CompanionService(companionRepo);
    timetableService = new TimetableService({
      clock: new SystemClock(),
      initialSlots: SYNTHETIC_STAGE2_SLOTS,
    });
    schedulerService = new ReminderSchedulerService({ clock: new SystemClock() });
    searchEngine = new SearchEngine();
    distributionService = new FileDistributionService({ repository: distributionRepo });
    examsService = new ExamsService(examsRepo, { clock });
    adminService = new AdminService({
      repository: new InMemoryAdminRepository({
        roles: { [String(TEST_USER_ID)]: 'STUDENT' },
      }),
    });

    // Seed file catalog
    distributionRepo.add({
      id: 'file_lecture_mct211',
      title: 'MCT211 Lecture Slides 1',
      courseCode: 'MCT211',
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
        value: 'tg_file_mct211_001',
      },
      visibility: 'COURSE_SHARED',
      archiveStatus: 'CURRENT',
      createdAt: clock.nowIso(),
      updatedAt: clock.nowIso(),
    });

    distributionRepo.add({
      id: 'file_solution_manual_mct211',
      title: 'MCT211 Complete Solution Manual',
      courseCode: 'MCT211',
      documentType: 'SOLUTION_MANUAL',
      sourceAuthority: 'EXTERNAL',
      verificationStatus: 'RAW',
      distributionPolicy: {
        canSearch: true,
        canQuote: false,
        canDistribute: false,
        policyState: 'PROHIBITED',
        reason: 'Solution manuals strictly prohibited.',
      },
      visibility: 'GLOBAL',
      archiveStatus: 'CURRENT',
      createdAt: clock.nowIso(),
      updatedAt: clock.nowIso(),
    });

    // Seed search engine
    searchEngine.indexDocument({
      id: 'search_doc_1',
      documentId: 'doc_laplace',
      courseCode: 'MCT211',
      topicKeys: ['laplace-transforms'],
      title: 'Laplace Transforms Principles',
      textOriginal:
        'Laplace transformation converts time domain differential equations into s-domain algebraic equations.',
      textNormalized:
        'laplace transformation converts time domain differential equations into s-domain algebraic equations',
      documentType: 'LECTURER_NOTE',
      sourceAuthority: 'FACULTY',
      evidenceScope: 'EXACT_COURSE',
      verificationStatus: 'VERIFIED',
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      provenance: {},
    });

    // Seed exam event & quiz
    examsService.createEvent({
      courseCode: 'MCT211',
      type: 'MIDTERM',
      title: 'امتحان منتصف الفصل لمادة الرياضيات الهندسية',
      occursAt: '2026-11-20T09:00:00.000Z',
      sourceStatus: 'OFFICIAL_SOURCE',
      confirmationStatus: 'CONFIRMED',
      coverage: [{ courseCode: 'MCT211', topicKey: 'laplace-transforms', status: 'CONFIRMED' }],
    });

    examsService.createPracticeQuiz({
      id: 'quiz_mct211_01',
      courseCode: 'MCT211',
      title: 'كويز تجريبي - تحويلات لابلاس',
      questions: [
        {
          id: 'q1',
          type: 'MULTIPLE_CHOICE',
          prompt: 'ما هو تحويل لابلاس للدالة الثابتة f(t) = 1؟',
          points: 5,
          options: [
            { id: 'opt_a', text: '1/s' },
            { id: 'opt_b', text: 's' },
            { id: 'opt_c', text: '1/s^2' },
          ],
          correctOptionId: 'opt_a',
        },
      ],
    });

    // Wire application and bridge
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

    bridge = new TelegramAppBridge({ app, studentRepo });

    router = new OnboardingRouter({
      db,
      clock,
      logger,
      calendarService,
      app,
      bridge,
    });
  });

  afterEach(() => {
    db.close();
  });

  // =========================================================================
  // Case A: /start for new student
  // =========================================================================
  it('Case A: /start for a new student presents stage selection without spam', async () => {
    const { ctx, reply } = createMockContext({ userId: 30001, text: '/start' });
    await router.handleStartOrMenu(ctx);

    expect(reply).toHaveBeenCalledOnce();
    const sentText = reply.mock.calls[0]![0] as string;
    const sentOptions = reply.mock.calls[0]![1] as { reply_markup: InlineKeyboard };

    expect(sentText).toContain('أهلاً بك في Mecha Bot');
    expect(sentText).toContain('حدد مرحلتك:');
    const callbacks = getCallbackDataList(sentOptions.reply_markup);
    expect(callbacks).toContain('m1:s:1');
    expect(callbacks).toContain('m1:s:2');
  });

  // =========================================================================
  // Case B: Returning student recognition
  // =========================================================================
  it('Case B: Returning student recognition presents status and active course options', async () => {
    const course = academicRepo.findCourseByCode('MCT211');
    saveStudent({
      telegramUserId: TEST_USER_ID,
      stage: 2,
      programSemester: 3,
      activeCourseId: course!.id,
    });

    const { ctx, reply } = createMockContext({ userId: TEST_USER_ID, text: '/start' });
    await router.handleStartOrMenu(ctx);

    expect(reply).toHaveBeenCalledOnce();
    const sentText = reply.mock.calls[0]![0] as string;
    expect(sentText).toContain('المرحلة الثانية');
    expect(sentText).toContain('الفصل الثالث');
    expect(sentText).toContain('MCT211');
  });

  // =========================================================================
  // Case C: Incomplete onboarding state
  // =========================================================================
  it('Case C: Incomplete onboarding prompts the missing step', async () => {
    // Only stage selected
    saveStudent({
      telegramUserId: 30002,
      stage: 2,
    });
    const { ctx: ctx1, reply: reply1 } = createMockContext({ userId: 30002, text: '/start' });
    await router.handleStartOrMenu(ctx1);

    expect(reply1).toHaveBeenCalledOnce();
    const sentText1 = reply1.mock.calls[0]![0] as string;
    expect(sentText1).toContain('اختر الفصل:');

    // Stage + semester selected, no course
    saveStudent({
      telegramUserId: 30002,
      stage: 2,
      programSemester: 3,
    });
    const { ctx: ctx2, reply: reply2 } = createMockContext({ userId: 30002, text: '/start' });
    await router.handleStartOrMenu(ctx2);

    expect(reply2).toHaveBeenCalledOnce();
    const sentText2 = reply2.mock.calls[0]![0] as string;
    expect(sentText2).toContain('اختر المادة:');
  });

  // =========================================================================
  // Case D: "موادي" (course list for student's stage & semester)
  // =========================================================================
  it('Case D: /courses or "موادي" presents semester course buttons', async () => {
    saveStudent({
      telegramUserId: TEST_USER_ID,
      stage: 2,
      programSemester: 3,
    });

    const { ctx, reply } = createMockContext({ userId: TEST_USER_ID, text: '/courses' });
    await router.handleCourses(ctx);

    expect(reply).toHaveBeenCalledOnce();
    const sentText = reply.mock.calls[0]![0] as string;
    const sentOptions = reply.mock.calls[0]![1] as { reply_markup: InlineKeyboard };

    expect(sentText).toContain('المرحلة الثانية');
    expect(sentText).toContain('الفصل الثالث');
    const callbacks = getCallbackDataList(sentOptions.reply_markup);
    expect(callbacks).toContain('m1:c:MCT211');
  });

  // =========================================================================
  // Case E: Course selection & home menu
  // =========================================================================
  it('Case E: Selecting course sets activeCourseId and presents Course Home Menu', async () => {
    saveStudent({
      telegramUserId: TEST_USER_ID,
      stage: 2,
      programSemester: 3,
    });

    const { ctx, editMessageText } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:c:MCT211',
    });
    await router.handleCallback(ctx);

    const updated = studentRepo.findByTelegramId(TEST_USER_ID);
    const mct211 = academicRepo.findCourseByCode('MCT211');
    expect(updated?.activeCourseId).toBe(mct211?.id);

    expect(editMessageText).toHaveBeenCalledOnce();
    const sentText = editMessageText.mock.calls[0]![0] as string;
    const sentOptions = editMessageText.mock.calls[0]![1] as { reply_markup: InlineKeyboard };
    expect(sentText).toContain('MCT211');
    expect(sentText).toContain('أصبحت هذه المادة الحالية');

    const callbacks = getCallbackDataList(sentOptions.reply_markup);
    expect(callbacks).toContain('m:where:MCT211');
    expect(callbacks).toContain('m:lost:MCT211');
    expect(callbacks).toContain('m:search:MCT211');
    expect(callbacks).toContain('m:exams:MCT211');
    expect(callbacks).toContain('m:files:MCT211');
  });

  // =========================================================================
  // Case F: whereAreWe Case A (Calendar only)
  // =========================================================================
  it('Case F: whereAreWe Case A (Calendar only) invites student confirmation', async () => {
    const course = academicRepo.findCourseByCode('MCT212');
    saveStudent({
      telegramUserId: TEST_USER_ID,
      stage: 2,
      programSemester: 3,
      activeCourseId: course?.id || null,
    });

    const { ctx, editMessageText } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:where:MCT212',
    });
    await router.handleCallback(ctx);

    expect(editMessageText).toHaveBeenCalledOnce();
    const sentText = editMessageText.mock.calls[0]![0] as string;
    const sentOptions = editMessageText.mock.calls[0]![1] as { reply_markup: InlineKeyboard };

    expect(sentText).toContain('حسب التقويم أنت تقريباً بموضوع');
    expect(sentText).toContain('بوت ميكا يقترح ويسألك للتأكيد');
    const callbacks = getCallbackDataList(sentOptions.reply_markup);
    expect(callbacks.some((c) => c.startsWith('m:conf:MCT212'))).toBe(true);
    expect(callbacks).toContain('m:noconf:MCT212');
  });

  // =========================================================================
  // Case G: whereAreWe Case B (Course pulse)
  // =========================================================================
  it('Case G: whereAreWe Case B (Course pulse) displays class progress evidence', async () => {
    const course = academicRepo.findCourseByCode('MCT212');
    saveStudent({
      telegramUserId: TEST_USER_ID,
      stage: 2,
      programSemester: 3,
      activeCourseId: course?.id || null,
    });

    // Record pulse progress signal from companion domain
    companionService.recordProgressSignal({
      studentKey: 'class_peer_1',
      courseCode: 'MCT212',
      topicKey: 'mct212-stress-and-strain',
      type: 'SELF_RATING',
      selfReportedConfidence: 4,
      occurredAt: clock.nowIso(),
    });

    const { ctx, editMessageText } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:where:MCT212',
    });
    await router.handleCallback(ctx);

    expect(editMessageText).toHaveBeenCalledOnce();
    const sentText = editMessageText.mock.calls[0]![0] as string;
    expect(sentText).toContain('حسب آخر نبض للمادة');
    expect(sentText).toContain('بوت ميكا يقترح ويسألك للتأكيد');
  });

  // =========================================================================
  // Case H: Explicit confirmation sets CONFIRMED_BY_STUDENT
  // =========================================================================
  it('Case H: Explicit confirmation sets CONFIRMED_BY_STUDENT', async () => {
    const course = academicRepo.findCourseByCode('MCT211');
    const student = saveStudent({
      telegramUserId: TEST_USER_ID,
      stage: 2,
      programSemester: 3,
      activeCourseId: course!.id,
    });

    const { ctx, editMessageText } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:conf:MCT211:laplace-transforms',
    });
    await router.handleCallback(ctx);

    expect(editMessageText).toHaveBeenCalledOnce();
    const sentText = editMessageText.mock.calls[0]![0] as string;
    expect(sentText).toContain('تم تأكيد موضعك بنجاح!');
    expect(sentText).toContain('MCT211');
    expect(sentText).toContain('laplace-transforms');

    // Verify domain state
    const studentPos = await navigatorService.getStudentPosition(student.id, 'MCT211');
    expect(studentPos?.status).toBe('CONFIRMED_BY_STUDENT');
    expect(studentPos?.lastUnderstoodTopicKey).toBe('laplace-transforms');
  });

  // =========================================================================
  // Case I: Invariant check (Zero silent confirmation)
  // =========================================================================
  it('Case I: Browsing or clicking decline NEVER confirms student position', async () => {
    const course = academicRepo.findCourseByCode('MCT211');
    const student = saveStudent({
      telegramUserId: TEST_USER_ID,
      stage: 2,
      programSemester: 3,
      activeCourseId: course!.id,
    });

    // 1. Browsing whereAreWe
    const { ctx: browseCtx } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:where:MCT211',
    });
    await router.handleCallback(browseCtx);

    let pos = await navigatorService.getStudentPosition(student.id, 'MCT211');
    expect(pos).toBeNull();

    // 2. Clicking Decline ("لا، بعدنا متأخرين / متقدمين")
    const { ctx: declCtx, editMessageText } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:noconf:MCT211',
    });
    await router.handleCallback(declCtx);

    pos = await navigatorService.getStudentPosition(student.id, 'MCT211');
    expect(pos).toBeNull(); // Still never confirmed!
    expect(editMessageText).toHaveBeenCalledOnce();
    const sentText = editMessageText.mock.calls[0]![0] as string;
    expect(sentText).toContain('موضعك يبقى كما هو');
    expect(sentText).toContain('ما غيرت موضعك');
  });

  // =========================================================================
  // Case J: MCT124 conflict surfaced without progression guess
  // =========================================================================
  it('Case J: Surfacing MCT124 curricular conflict without guessing', async () => {
    const { ctx, editMessageText } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:where:MCT124',
    });
    await router.handleCallback(ctx);

    expect(editMessageText).toHaveBeenCalledOnce();
    const sentText = editMessageText.mock.calls[0]![0] as string;
    expect(sentText).toContain('تضارب منهجي');
    expect(sentText).toContain('MCT124');
    expect(sentText).toContain('CONFLICTING');
  });

  // =========================================================================
  // Case K: P4MCT identity-only surfaced without fabricated topics
  // =========================================================================
  it('Case K: Surfacing P4MCT identity-only without fabricated topics', async () => {
    const { ctx, editMessageText } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:where:P4MCT',
    });
    await router.handleCallback(ctx);

    expect(editMessageText).toHaveBeenCalledOnce();
    const sentText = editMessageText.mock.calls[0]![0] as string;
    expect(sentText).toContain('معرفة بالهوية فقط');
    expect(sentText).toContain('P4MCT');
    expect(sentText).toContain('دون شجرة مواضيع تفصيلية');
  });

  // =========================================================================
  // Case L: imLost normal diagnosis path
  // =========================================================================
  it('Case L: imLost normal diagnosis path guides the student', async () => {
    // MCT212 is a Stage 2 course with detailed topic breakdown in academic dataset
    const { ctx, editMessageText } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:lost:MCT212',
    });
    await router.handleCallback(ctx);

    expect(editMessageText).toHaveBeenCalledOnce();
    const sentText = editMessageText.mock.calls[0]![0] as string;
    expect(sentText).toContain('MCT212');
    expect(sentText).toContain('Current class topic or study target is unknown');
  });

  // =========================================================================
  // Case M: imLost conflict / ambiguous path
  // =========================================================================
  it('Case M: imLost handles conflict courses safely without crashing', async () => {
    const { ctx, editMessageText } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:lost:MCT124',
    });
    await router.handleCallback(ctx);

    expect(editMessageText).toHaveBeenCalledOnce();
    const sentText = editMessageText.mock.calls[0]![0] as string;
    expect(sentText).toContain('MCT124');
  });

  // =========================================================================
  // Case N: Academic search with provenance
  // =========================================================================
  it('Case N: Academic search returns hits with provenance and authority tier', async () => {
    const { ctx, reply } = createMockContext({
      userId: TEST_USER_ID,
      text: 'Laplace transformation',
    });
    await router.handleSearchQuery(ctx, 'Laplace transformation', 'MCT211');

    expect(reply).toHaveBeenCalledOnce();
    const sentText = reply.mock.calls[0]![0] as string;
    expect(sentText).toContain('نتائج البحث الأكاديمي');
    expect(sentText).toContain('MCT211');
    expect(sentText).toContain('LECTURER_NOTE');
  });

  // =========================================================================
  // Case O: Blocked file delivery policy
  // =========================================================================
  it('Case O: Solution manual or restricted files return BLOCKED_POLICY', async () => {
    const { ctx, answerCallbackQuery } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:dl:file_solution_manual_mct211',
    });
    await router.handleCallback(ctx);

    expect(answerCallbackQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('الملف محجوب'),
        show_alert: true,
      }),
    );
  });

  // =========================================================================
  // Case P: Timetable display
  // =========================================================================
  it('Case P: /timetable or m:tt displays student timetable schedule', async () => {
    saveStudent({
      telegramUserId: TEST_USER_ID,
      stage: 2,
      programSemester: 3,
    });

    const { ctx, reply } = createMockContext({
      userId: TEST_USER_ID,
      text: '/timetable',
    });
    await router.handleTimetableCommand(ctx);

    expect(reply).toHaveBeenCalledOnce();
    const sentText = reply.mock.calls[0]![0] as string;
    expect(sentText).toContain('جدول المحاضرات اليوم');
    expect(sentText).toContain('المرحلة الثانية');
  });

  // =========================================================================
  // Case Q: Reminders in Asia/Baghdad
  // =========================================================================
  it('Case Q: Scheduling timetable reminders operates in Asia/Baghdad timezone', async () => {
    saveStudent({
      telegramUserId: TEST_USER_ID,
      stage: 2,
      programSemester: 3,
    });

    const { ctx, editMessageText } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:tt_rem',
    });
    await router.handleCallback(ctx);

    expect(editMessageText).toHaveBeenCalledOnce();
    const sentText = editMessageText.mock.calls[0]![0] as string;
    expect(sentText).toContain('تم جدولة');
  });

  // =========================================================================
  // Case R: Quiz start
  // =========================================================================
  it('Case R: Starting practice quiz initializes attempt and shows question 1', async () => {
    const { ctx, editMessageText } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:qz_start:quiz_mct211_01',
    });
    await router.handleCallback(ctx);

    expect(editMessageText).toHaveBeenCalledOnce();
    const sentText = editMessageText.mock.calls[0]![0] as string;
    const sentOptions = editMessageText.mock.calls[0]![1] as { reply_markup: InlineKeyboard };

    expect(sentText).toContain('كويز تجريبي - تحويلات لابلاس');
    expect(sentText).toContain('من 1');
    expect(sentText).toContain('ما هو تحويل لابلاس للدالة الثابتة');

    const callbacks = getCallbackDataList(sentOptions.reply_markup);
    expect(callbacks.some((c) => c.startsWith('m:qz_ans:quiz_mct211_01:0:'))).toBe(true);
    expect(callbacks).toContain('m:qz_sub:quiz_mct211_01');
  });

  // =========================================================================
  // Case S: Quiz submission & deterministic score
  // =========================================================================
  it('Case S: Answering and submitting quiz scores attempt deterministically', async () => {
    // 1. Start quiz
    const { ctx: startCtx } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:qz_start:quiz_mct211_01',
    });
    await router.handleCallback(startCtx);

    // 2. Select option A (opt_a is index 0)
    const { ctx: ansCtx } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:qz_ans:quiz_mct211_01:0:0',
    });
    await router.handleCallback(ansCtx);

    // 3. Submit quiz
    const { ctx: subCtx, editMessageText } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:qz_sub:quiz_mct211_01',
    });
    await router.handleCallback(subCtx);

    expect(editMessageText).toHaveBeenCalledOnce();
    const sentText = editMessageText.mock.calls[0]![0] as string;
    expect(sentText).toContain('نتيجة الكويز التجريبي');
    expect(sentText).toContain('5 / 5');
    expect(sentText).toContain('100.0%');
  });

  // =========================================================================
  // Case T: Duplicate callback / submission safety
  // =========================================================================
  it('Case T: Duplicate quiz submission is handled safely and idempotently', async () => {
    // Start and submit
    const { ctx: startCtx } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:qz_start:quiz_mct211_01',
    });
    await router.handleCallback(startCtx);

    const { ctx: subCtx1 } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:qz_sub:quiz_mct211_01',
    });
    await router.handleCallback(subCtx1);

    // Second submit attempt
    const { ctx: subCtx2, answerCallbackQuery } = createMockContext({
      userId: TEST_USER_ID,
      callbackData: 'm:qz_sub:quiz_mct211_01',
    });
    await router.handleCallback(subCtx2);

    expect(answerCallbackQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('لا يوجد محاولة نشطة للتسليم'),
      }),
    );
  });
});
