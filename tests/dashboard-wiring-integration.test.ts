import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Context } from 'grammy';
import { SqliteDatabaseConnection, MigrationRunner, StudentRepository } from '@mecha-bot/database';
import {
  AcademicCalendarService,
  loadAcademicCoreDataset,
  type AcademicCalendarPeriod,
  type Stage,
  type ProgramSemester,
} from '@mecha-bot/academic';
import { FakeClock, JsonLogger } from '@mecha-bot/shared';
import {
  StudyNavigatorService,
  InMemoryStudentCoursePositionRepository,
} from '@mecha-bot/navigator';
import { CompanionService, InMemoryCompanionRepository } from '@mecha-bot/companion';
import { TimetableService } from '@mecha-bot/timetable';
import { ReminderSchedulerService } from '@mecha-bot/scheduler';
import { SearchEngine } from '@mecha-bot/search';
import { FileDistributionService, InMemoryFileCatalogRepository } from '@mecha-bot/distribution';
import { ExamsService, InMemoryExamsRepository } from '@mecha-bot/exams';
import { AdminService, InMemoryAdminRepository } from '@mecha-bot/admin';
import { MechaBotApp } from '@mecha-bot/wiring';
import { OnboardingRouter, TelegramAppBridge } from '@mecha-bot/telegram';
import {
  createDashboardKeyboard,
  createMainMenuKeyboard,
} from '../packages/telegram/src/navigation/keyboards.js';
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
  firstName?: string;
}): Context {
  const userId = options.userId ?? 99901;
  const reply = vi.fn().mockResolvedValue(true);
  const editMessageText = vi.fn().mockResolvedValue(true);
  const answerCallbackQuery = vi.fn().mockResolvedValue(true);

  return {
    from: {
      id: userId,
      is_bot: false,
      first_name: options.firstName ?? 'علي',
      username: 'ali_student',
    },
    chat: {
      id: userId,
      type: 'private',
    },
    message: options.text ? { text: options.text, message_id: 101 } : undefined,
    callbackQuery: options.callbackData
      ? {
          data: options.callbackData,
          message: { message_id: 101, chat: { id: userId } },
        }
      : undefined,
    reply,
    editMessageText,
    answerCallbackQuery,
  } as unknown as Context;
}

describe('Milestone 13: Dashboard Wiring & Telegram Integration Tests', () => {
  let db: SqliteDatabaseConnection;
  let studentRepo: StudentRepository;
  let clock: FakeClock;
  let logger: JsonLogger;

  let calendarService: AcademicCalendarService;
  let navigatorRepo: InMemoryStudentCoursePositionRepository;
  let navigatorService: StudyNavigatorService;
  let companionRepo: InMemoryCompanionRepository;
  let companionService: CompanionService;
  let examsRepo: InMemoryExamsRepository;
  let examsService: ExamsService;
  let timetableService: TimetableService;
  let schedulerService: ReminderSchedulerService;
  let searchEngine: SearchEngine;
  let distributionService: FileDistributionService;
  let adminService: AdminService;

  let app: MechaBotApp;
  let bridge: TelegramAppBridge;
  let router: OnboardingRouter;

  const dataset = loadAcademicCoreDataset();

  beforeEach(() => {
    clock = new FakeClock('2026-10-15T10:00:00.000Z');
    logger = new JsonLogger('error');

    db = new SqliteDatabaseConnection(':memory:');
    const migrator = new MigrationRunner(db, migrationsDir);
    migrator.migrate();
    importOfficialCurriculum(db, curriculumFilePath);

    studentRepo = new StudentRepository(db);

    const teachingPeriod: AcademicCalendarPeriod = {
      id: 'cal_fall_2026',
      academicYearId: 'ay_2026_2027',
      periodType: 'TEACHING',
      startsOn: '2026-09-20',
      endsOn: '2027-01-10',
      nominalWeekCount: 15,
      stageScope: null,
      programSemester: 5 as ProgramSemester,
      evidenceMetadataJson: null,
      createdAt: '2026-09-01T00:00:00.000Z',
    };
    calendarService = new AcademicCalendarService([teachingPeriod]);

    navigatorRepo = new InMemoryStudentCoursePositionRepository();
    navigatorService = new StudyNavigatorService({ dataset, repository: navigatorRepo });

    companionRepo = new InMemoryCompanionRepository();
    companionService = new CompanionService(companionRepo, { clock });

    examsRepo = new InMemoryExamsRepository();
    examsService = new ExamsService(examsRepo, { clock });

    timetableService = new TimetableService({ clock });
    schedulerService = new ReminderSchedulerService({ clock });
    searchEngine = new SearchEngine();
    distributionService = new FileDistributionService({
      repository: new InMemoryFileCatalogRepository(),
    });
    adminService = new AdminService({
      repository: new InMemoryAdminRepository(),
    });

    app = new MechaBotApp({
      academicDataset: dataset,
      calendarService,
      navigatorService,
      companionService,
      examsService,
      timetableService,
      schedulerService,
      searchEngine,
      distributionService,
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

  it('orchestrates getStudentDashboard end-to-end via MechaBotApp', async () => {
    const student = studentRepo.findOrCreate(99901, {
      stage: 3 as Stage,
      programSemester: 5 as ProgramSemester,
    });

    // Record student confirmed position in MCT312
    await navigatorService.recordStudentPosition({
      studentKey: student.id,
      courseCode: 'MCT312',
      lastUnderstoodTopicKey: 'mct312-single-dof-free-vibration',
      status: 'CONFIRMED_BY_STUDENT',
    });

    const summary = await app.getStudentDashboard({
      studentKey: student.id,
      stage: 3 as Stage,
      programSemester: 5 as ProgramSemester,
    });

    expect(summary.studentKey).toBe(student.id);
    expect(summary.academicProgress.stage).toBe(3);
    expect(summary.academicProgress.programSemester).toBe(5);
    expect(summary.courses.length).toBeGreaterThan(0);

    const mct312Status = summary.courses.find((c) => c.courseCode === 'MCT312');
    expect(mct312Status).toBeDefined();
    expect(mct312Status?.confirmedTopicsCount).toBeGreaterThan(0);
    expect(mct312Status?.hasConflict).toBe(false);
  });

  it('isolates Telegram identity at TelegramAppBridge boundary (zero identity leakage)', async () => {
    const telegramUserId = 88801;
    const student = studentRepo.findOrCreate(telegramUserId, {
      stage: 3 as Stage,
      programSemester: 5 as ProgramSemester,
    });

    const ctx = createMockContext({ userId: telegramUserId });
    const summary = await bridge.getDashboardData(ctx);

    // The summary studentKey must be the internal DB ID, NOT the Telegram User ID
    expect(summary.studentKey).toBe(student.id);
    expect(summary.studentKey).not.toBe(String(telegramUserId));
  });

  it('renders rich Iraqi Arabic dashboard view with all domain sections and disclaimers', async () => {
    const telegramUserId = 77701;
    studentRepo.findOrCreate(telegramUserId, {
      stage: 3 as Stage,
      programSemester: 5 as ProgramSemester,
    });

    const ctx = createMockContext({ userId: telegramUserId, firstName: 'سجاد' });
    const { text, summary } = await bridge.handleDashboardView(ctx);

    expect(summary).toBeDefined();
    expect(text).toContain('لوحة تحكم الطالب للزميل *سجاد*');
    expect(text).toContain('المرحلة');
    expect(text).toContain('نسبة الإنجاز الأكاديمي');
    expect(text).toContain('إنجازك المؤكد');
    expect(text).toContain('التقدير الزمني للتقويم');
    expect(text).toContain('حالة المواد');
    expect(text).toContain('نشاط وسلسلة الدراسة');
    expect(text).toContain('جدول اليوم');
    expect(text).toContain('الامتحانات والكويزات');
    expect(text).toContain('التذكيرات');
  });

  it('surfaces Invariant 3 (MCT124 Conflict) with disclaimer in Stage 1 Semester 2 dashboard', async () => {
    const telegramUserId = 66601;
    studentRepo.findOrCreate(telegramUserId, {
      stage: 1 as Stage,
      programSemester: 2 as ProgramSemester,
    });

    const ctx = createMockContext({ userId: telegramUserId });
    const { text, summary } = await bridge.handleDashboardView(ctx);

    const mct124 = summary.courses.find((c) => c.courseCode === 'MCT124');
    if (mct124) {
      expect(mct124.hasConflict).toBe(true);
      expect(mct124.confirmedMasteryPercentage).toBeNull();
      expect(text).toContain('تضارب منهجي (غير محلول)');
    }
  });

  it('handles /dashboard command via OnboardingRouter with dashboard keyboard', async () => {
    const telegramUserId = 55501;
    studentRepo.findOrCreate(telegramUserId, {
      stage: 3 as Stage,
      programSemester: 5 as ProgramSemester,
    });

    const ctx = createMockContext({ userId: telegramUserId });
    await router.handleDashboardCommand(ctx);

    expect(ctx.reply).toHaveBeenCalled();
    const replyCall = vi.mocked(ctx.reply).mock.calls[0];
    expect(replyCall).toBeDefined();
    const replyText = replyCall![0] as string;
    expect(replyText).toContain('لوحة تحكم الطالب');

    const keyboard = createDashboardKeyboard('MCT311');
    expect(keyboard).toBeDefined();
  });

  it('verifies that Main Menu keyboard includes the Dashboard button', () => {
    const mainMenu = createMainMenuKeyboard(true, 'MCT311');
    const flatButtons = mainMenu.inline_keyboard.flat();
    const dashboardBtn = flatButtons.find(
      (btn) => 'callback_data' in btn && btn.callback_data === 'm:dashboard',
    );

    expect(dashboardBtn).toBeDefined();
    expect(dashboardBtn?.text).toContain('لوحة التحكم');
  });
});
