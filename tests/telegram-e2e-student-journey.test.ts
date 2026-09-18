import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Context, InlineKeyboard } from 'grammy';
import {
  SqliteDatabaseConnection,
  MigrationRunner,
  StudentRepository,
  AcademicRepository,
} from '@mecha-bot/database';
import {
  AcademicCalendarService,
  loadAcademicCoreDataset,
  type AcademicCoreDataset,
} from '@mecha-bot/academic';
import { FakeClock, JsonLogger } from '@mecha-bot/shared';
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
  const userId = options.userId ?? 40001;
  const answerCallbackQuery = vi.fn().mockResolvedValue(true);
  const editMessageText = vi.fn().mockResolvedValue(true);
  const reply = vi.fn().mockResolvedValue({ message_id: 999 });

  const ctx = {
    from: { id: userId, is_bot: false, first_name: 'AliStudent' },
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

describe('End-to-End Student Journey: Full Lifecycle', () => {
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

  const STUDENT_TG_ID = 50001;

  beforeEach(() => {
    db = new SqliteDatabaseConnection(':memory:');
    const runner = new MigrationRunner(db, migrationsDir);
    runner.migrate();

    // Official curriculum in SQLite
    importOfficialCurriculum(db, curriculumFilePath);

    clock = new FakeClock('2026-10-15T08:00:00.000Z');
    logger = new JsonLogger('error');
    studentRepo = new StudentRepository(db);
    academicRepo = new AcademicRepository(db);
    dataset = loadAcademicCoreDataset();

    // Teaching period
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

    navigatorRepo = new InMemoryStudentCoursePositionRepository();
    companionRepo = new InMemoryCompanionRepository();
    examsRepo = new InMemoryExamsRepository();
    distributionRepo = new InMemoryFileCatalogRepository();

    navigatorService = new StudyNavigatorService({ dataset, repository: navigatorRepo });
    companionService = new CompanionService(companionRepo);
    timetableService = new TimetableService({
      clock,
      initialSlots: SYNTHETIC_STAGE2_SLOTS,
    });
    schedulerService = new ReminderSchedulerService({ clock });
    searchEngine = new SearchEngine();
    distributionService = new FileDistributionService({ repository: distributionRepo });
    examsService = new ExamsService(examsRepo, { clock });
    adminService = new AdminService({
      repository: new InMemoryAdminRepository({
        roles: { [String(STUDENT_TG_ID)]: 'STUDENT' },
      }),
    });

    // Seed distribution catalog
    distributionRepo.add({
      id: 'file_mct211_slides',
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
        value: 'tg_file_mct211_01',
      },
      visibility: 'COURSE_SHARED',
      archiveStatus: 'CURRENT',
      createdAt: clock.nowIso(),
      updatedAt: clock.nowIso(),
    });

    distributionRepo.add({
      id: 'file_mct211_manual_prohibited',
      title: 'MCT211 Solution Manual Full',
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
      id: 'doc_laplace_1',
      documentId: 'doc_laplace',
      courseCode: 'MCT211',
      topicKeys: ['laplace-transforms'],
      title: 'Laplace Transforms Principles',
      textOriginal:
        'Laplace transformation converts differential equations into algebraic equations in s-domain.',
      textNormalized:
        'laplace transformation converts differential equations into algebraic equations in s-domain',
      documentType: 'LECTURER_NOTE',
      sourceAuthority: 'FACULTY',
      evidenceScope: 'EXACT_COURSE',
      verificationStatus: 'VERIFIED',
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      provenance: {},
    });

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

  it('completes the entire student journey through Telegram without architectural invariant breaches', async () => {
    // -----------------------------------------------------------------------
    // Step 1: Student starts bot for the first time
    // -----------------------------------------------------------------------
    const { ctx: ctx1, reply: reply1 } = createMockContext({
      userId: STUDENT_TG_ID,
      text: '/start',
    });
    await router.handleStartOrMenu(ctx1);

    expect(reply1).toHaveBeenCalledOnce();
    const welcomeText = reply1.mock.calls[0]![0] as string;
    const stageMarkup = reply1.mock.calls[0]![1] as { reply_markup: InlineKeyboard };
    expect(welcomeText).toContain('أهلاً بك في Mecha Bot');
    expect(welcomeText).toContain('حدد مرحلتك:');
    expect(getCallbackDataList(stageMarkup.reply_markup)).toContain('m1:s:2');

    // -----------------------------------------------------------------------
    // Step 2: Student selects Stage 2
    // -----------------------------------------------------------------------
    const { ctx: ctx2, editMessageText: edit2 } = createMockContext({
      userId: STUDENT_TG_ID,
      callbackData: 'm1:s:2',
    });
    await router.handleCallback(ctx2);

    expect(edit2).toHaveBeenCalledOnce();
    const semText = edit2.mock.calls[0]![0] as string;
    const semMarkup = edit2.mock.calls[0]![1] as { reply_markup: InlineKeyboard };
    expect(semText).toContain('المرحلة الثانية');
    expect(semText).toContain('اختر الفصل:');
    expect(getCallbackDataList(semMarkup.reply_markup)).toContain('m1:sem:3');

    // -----------------------------------------------------------------------
    // Step 3: Student selects Semester 3
    // -----------------------------------------------------------------------
    const { ctx: ctx3, editMessageText: edit3 } = createMockContext({
      userId: STUDENT_TG_ID,
      callbackData: 'm1:sem:3',
    });
    await router.handleCallback(ctx3);

    expect(edit3).toHaveBeenCalledOnce();
    const courseText = edit3.mock.calls[0]![0] as string;
    const courseMarkup = edit3.mock.calls[0]![1] as { reply_markup: InlineKeyboard };
    expect(courseText).toContain('المرحلة الثانية');
    expect(courseText).toContain('الفصل الثالث');
    expect(courseText).toContain('اختر المادة:');
    expect(getCallbackDataList(courseMarkup.reply_markup)).toContain('m1:c:MCT211');

    // -----------------------------------------------------------------------
    // Step 4: Student selects Course MCT211
    // -----------------------------------------------------------------------
    const { ctx: ctx4, editMessageText: edit4 } = createMockContext({
      userId: STUDENT_TG_ID,
      callbackData: 'm1:c:MCT211',
    });
    await router.handleCallback(ctx4);

    expect(edit4).toHaveBeenCalledOnce();
    const courseHomeText = edit4.mock.calls[0]![0] as string;
    expect(courseHomeText).toContain('MCT211');
    expect(courseHomeText).toContain('أصبحت هذه المادة الحالية');

    // Verify DB state
    const studentProfile = studentRepo.findByTelegramId(STUDENT_TG_ID);
    expect(studentProfile).not.toBeNull();
    expect(studentProfile?.stage).toBe(2);
    expect(studentProfile?.programSemester).toBe(3);
    const mct211 = academicRepo.findCourseByCode('MCT211');
    expect(studentProfile?.activeCourseId).toBe(mct211?.id);

    // -----------------------------------------------------------------------
    // Step 5: Student opens Course Home menu (m:c:MCT211)
    // -----------------------------------------------------------------------
    const { ctx: ctx5, editMessageText: edit5 } = createMockContext({
      userId: STUDENT_TG_ID,
      callbackData: 'm:c:MCT211',
    });
    await router.handleCallback(ctx5);

    expect(edit5).toHaveBeenCalledOnce();
    const richHomeMarkup = edit5.mock.calls[0]![1] as { reply_markup: InlineKeyboard };
    const homeCallbacks = getCallbackDataList(richHomeMarkup.reply_markup);
    expect(homeCallbacks).toContain('m:where:MCT211');
    expect(homeCallbacks).toContain('m:lost:MCT211');
    expect(homeCallbacks).toContain('m:search:MCT211');
    expect(homeCallbacks).toContain('m:exams:MCT211');
    expect(homeCallbacks).toContain('m:files:MCT211');

    // -----------------------------------------------------------------------
    // Step 6: Student queries "وين وصلنا؟" (whereAreWe)
    // -----------------------------------------------------------------------
    const { ctx: ctx6, editMessageText: edit6 } = createMockContext({
      userId: STUDENT_TG_ID,
      callbackData: 'm:where:MCT211',
    });
    await router.handleCallback(ctx6);

    expect(edit6).toHaveBeenCalledOnce();
    const whereText = edit6.mock.calls[0]![0] as string;
    expect(whereText).toContain('معرفة بالهوية فقط');
    expect(whereText).toContain('MCT211');
    expect(whereText).toContain('دون شجرة مواضيع تفصيلية');

    // Critical Invariant: Viewing "وين وصلنا؟" did NOT confirm student position!
    let studentPos = await navigatorService.getStudentPosition(studentProfile!.id, 'MCT211');
    expect(studentPos).toBeNull();

    // -----------------------------------------------------------------------
    // Step 7: Student explicitly confirms current lecture position
    // -----------------------------------------------------------------------
    const { ctx: ctx7, editMessageText: edit7 } = createMockContext({
      userId: STUDENT_TG_ID,
      callbackData: 'm:conf:MCT211:laplace-transforms',
    });
    await router.handleCallback(ctx7);

    expect(edit7).toHaveBeenCalledOnce();
    const confirmSuccessText = edit7.mock.calls[0]![0] as string;
    expect(confirmSuccessText).toContain('تم تأكيد موضعك بنجاح!');
    expect(confirmSuccessText).toContain('MCT211');
    expect(confirmSuccessText).toContain('laplace-transforms');

    // Critical Invariant: NOW student position is confirmed in domain truth!
    studentPos = await navigatorService.getStudentPosition(studentProfile!.id, 'MCT211');
    expect(studentPos?.status).toBe('CONFIRMED_BY_STUDENT');
    expect(studentPos?.lastUnderstoodTopicKey).toBe('laplace-transforms');

    // -----------------------------------------------------------------------
    // Step 8: Student clicks "أني ضايع" (imLost) for diagnosis
    // -----------------------------------------------------------------------
    const { ctx: ctx8, editMessageText: edit8 } = createMockContext({
      userId: STUDENT_TG_ID,
      callbackData: 'm:lost:MCT211',
    });
    await router.handleCallback(ctx8);

    expect(edit8).toHaveBeenCalledOnce();
    const lostText = edit8.mock.calls[0]![0] as string;
    expect(lostText).toContain('MCT211');

    // -----------------------------------------------------------------------
    // Step 9: Student performs academic search
    // -----------------------------------------------------------------------
    const { ctx: ctx9, reply: reply9 } = createMockContext({
      userId: STUDENT_TG_ID,
      text: 'Laplace differential',
    });
    await router.handleSearchQuery(ctx9, 'Laplace differential', 'MCT211');

    expect(reply9).toHaveBeenCalledOnce();
    const searchText = reply9.mock.calls[0]![0] as string;
    expect(searchText).toContain('نتائج البحث الأكاديمي');
    expect(searchText).toContain('MCT211');
    expect(searchText).toContain('LECTURER_NOTE');

    // -----------------------------------------------------------------------
    // Step 10: Student attempts to download prohibited solution manual
    // -----------------------------------------------------------------------
    const { ctx: ctx10, answerCallbackQuery: answer10 } = createMockContext({
      userId: STUDENT_TG_ID,
      callbackData: 'm:dl:file_mct211_manual_prohibited',
    });
    await router.handleCallback(ctx10);

    // Critical Invariant: Prohibited file blocked at distribution policy boundary!
    expect(answer10).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('الملف محجوب'),
        show_alert: true,
      }),
    );

    // -----------------------------------------------------------------------
    // Step 11: Student views weekly timetable
    // -----------------------------------------------------------------------
    const { ctx: ctx11, reply: reply11 } = createMockContext({
      userId: STUDENT_TG_ID,
      text: '/timetable',
    });
    await router.handleTimetableCommand(ctx11);

    expect(reply11).toHaveBeenCalledOnce();
    const ttText = reply11.mock.calls[0]![0] as string;
    expect(ttText).toContain('جدول المحاضرات اليوم');
    expect(ttText).toContain('المرحلة الثانية');

    // -----------------------------------------------------------------------
    // Step 12: Student schedules lecture reminders
    // -----------------------------------------------------------------------
    const { ctx: ctx12, editMessageText: edit12 } = createMockContext({
      userId: STUDENT_TG_ID,
      callbackData: 'm:tt_rem',
    });
    await router.handleCallback(ctx12);

    expect(edit12).toHaveBeenCalledOnce();
    const remResultText = edit12.mock.calls[0]![0] as string;
    expect(remResultText).toContain('تم جدولة');

    // -----------------------------------------------------------------------
    // Step 13: Student checks /reminders list
    // -----------------------------------------------------------------------
    const { ctx: ctx13, reply: reply13 } = createMockContext({
      userId: STUDENT_TG_ID,
      text: '/reminders',
    });
    await router.handleRemindersCommand(ctx13);

    expect(reply13).toHaveBeenCalledOnce();
    const remindersListText = reply13.mock.calls[0]![0] as string;
    expect(remindersListText).toContain('توقيت بغداد');
    expect(remindersListText).toContain('🔔');
  });
});
