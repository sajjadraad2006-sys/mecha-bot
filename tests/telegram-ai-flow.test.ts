import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Context } from 'grammy';
import {
  SqliteDatabaseConnection,
  MigrationRunner,
  StudentRepository,
  AcademicRepository,
} from '@mecha-bot/database';
import { loadAcademicCoreDataset } from '@mecha-bot/academic';
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
  AiBrainService,
  AIRouter,
  FakeAIProvider,
  ModelHealthRegistry,
  BudgetManager,
} from '@mecha-bot/ai';
import { importOfficialCurriculum } from '../scripts/import-curriculum.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../migrations');
const curriculumFilePath = path.resolve(
  __dirname,
  '../curriculum/official/uob-mechatronics-2025.json',
);

function createMockContext(options: { userId?: number; text?: string; callbackData?: string }) {
  const userId = options.userId ?? 10001;
  const reply = vi.fn().mockResolvedValue({ message_id: 999 });
  const answerCallbackQuery = vi.fn().mockResolvedValue(true);
  const editMessageText = vi.fn().mockResolvedValue(true);

  const ctx = {
    from: { id: userId, is_bot: false, first_name: 'Ahmed' },
    message: options.text ? { text: options.text, message_id: 100 } : undefined,
    callbackQuery: options.callbackData
      ? {
          id: `cb_${Date.now()}`,
          data: options.callbackData,
          message: { message_id: 100 },
        }
      : undefined,
    reply,
    answerCallbackQuery,
    editMessageText,
  } as unknown as Context;

  return { ctx, reply, answerCallbackQuery, editMessageText };
}

describe('Telegram AI Brain Student Flows', () => {
  let db: SqliteDatabaseConnection;
  let clock: FakeClock;
  let logger: JsonLogger;
  let studentRepo: StudentRepository;
  let fakeProvider: FakeAIProvider;
  let router: AIRouter;
  let aiBrain: AiBrainService;
  let app: MechaBotApp;
  let bridge: TelegramAppBridge;
  let onboardingRouter: OnboardingRouter;

  beforeEach(async () => {
    db = new SqliteDatabaseConnection(':memory:');
    const runner = new MigrationRunner(db, migrationsDir);
    runner.migrate();
    importOfficialCurriculum(db, curriculumFilePath);

    clock = new FakeClock('2026-03-10T10:00:00.000Z');
    logger = new JsonLogger('error');
    studentRepo = new StudentRepository(db);

    const dataset = loadAcademicCoreDataset();
    fakeProvider = new FakeAIProvider('telegram-ai-provider');
    router = new AIRouter(fakeProvider, [], new ModelHealthRegistry(), new BudgetManager());
    const searchEngine = new SearchEngine();

    aiBrain = new AiBrainService({
      router,
      searchEngine,
    });

    const navigatorService = new StudyNavigatorService({
      dataset,
      repository: new InMemoryStudentCoursePositionRepository(),
    });

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

    bridge = new TelegramAppBridge({
      app,
      studentRepo,
    });

    onboardingRouter = new OnboardingRouter({
      db,
      clock,
      logger,
      app,
      bridge,
    });
  });

  afterEach(() => {
    db.close();
  });

  it('routes academic concept question to AI Brain and replies with Iraqi Arabic explanation', async () => {
    const studentUserId = 20001;
    // Set up student in Stage 3, Semester 5, active course MCT314
    studentRepo.findOrCreate(studentUserId);
    studentRepo.updateStage(studentUserId, 3);
    studentRepo.updateSemester(studentUserId, 5);

    const academicRepo = new AcademicRepository(db);
    const mct314 = academicRepo.findCourseByCode('MCT314');
    if (mct314) {
      const year = academicRepo.getCurrentAcademicYear();
      const offerings = academicRepo.listOfferingsBySemester(year?.id ?? '', 5);
      const mct314Offering = offerings.find((o) => o.courseId === mct314.id);
      studentRepo.updateActiveCourse(
        studentUserId,
        mct314.id,
        mct314Offering?.id ?? 'offering_mct314',
      );
    }

    fakeProvider.setMockResponse({
      intent: 'CONCEPT_EXPLANATION',
      courseCode: 'MCT314',
      topic: 'Root Locus',
      answer: 'طريقة المحل الهندسي للجذور تمثل حركة الأقطاب مع تغير الكسب K.',
      equations: ['1 + K * G(s) * H(s) = 0'],
      sourceRefs: [
        {
          sourceId: 'src_control_notes',
          page: 25,
          title: 'محاضرات السيطرة للمرحلة الثالثة',
        },
      ],
      confidence: 'HIGH',
      assumptions: [],
      needsClarification: false,
    });

    const { ctx, reply } = createMockContext({
      userId: studentUserId,
      text: 'اشرحلي طريقة Root Locus بالتفصيل',
    });

    await onboardingRouter.handleTextMessage(ctx);

    expect(reply).toHaveBeenCalled();
    const replyText = reply.mock.calls[0]![0] as string;
    expect(replyText).toContain('المخ الذكي');
    expect(replyText).toContain('MCT314');
    expect(replyText).toContain('طريقة المحل الهندسي للجذور');
    expect(replyText).toContain('1 + K * G(s) * H(s) = 0');
    expect(replyText).toContain('محاضرات السيطرة للمرحلة الثالثة');
  });

  it('responds with clarification options when inquiry is ambiguous', async () => {
    const studentUserId = 20002;
    // Student with no active course asks general concept
    studentRepo.findOrCreate(studentUserId);

    const { ctx, reply } = createMockContext({
      userId: studentUserId,
      text: 'اشرحلي الاستقرارية والنظام الخطي',
    });

    await onboardingRouter.handleTextMessage(ctx);

    expect(reply).toHaveBeenCalled();
    const replyText = reply.mock.calls[0]![0] as string;
    expect(replyText).toContain('تقصد هذا الموضوع لأي مادة؟');
  });

  it('gracefully degrades on quota exhaustion with friendly Iraqi Arabic message', async () => {
    const studentUserId = 20003;
    studentRepo.findOrCreate(studentUserId);

    fakeProvider.setSimulateQuotaExhausted('Daily allocation exceeded (3036)');

    const { ctx, reply } = createMockContext({
      userId: studentUserId,
      text: 'اشرحلي قانون كيرشوف لمادة MCT111',
    });

    await onboardingRouter.handleTextMessage(ctx);

    expect(reply).toHaveBeenCalled();
    const replyText = reply.mock.calls[0]![0] as string;
    expect(replyText).toContain('حالياً المساعد الذكي غير متاح');
    expect(replyText).toContain('بشكل طبيعي');
  });
});
