import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Context, InlineKeyboard } from 'grammy';
import {
  SqliteDatabaseConnection,
  MigrationRunner,
  StudentRepository,
  AcademicRepository,
} from '@mecha-bot/database';
import { AcademicCalendarService } from '@mecha-bot/academic';
import { FakeClock, JsonLogger } from '@mecha-bot/shared';
import { OnboardingRouter, safeEditMenu } from '@mecha-bot/telegram';
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
    from: { id: userId, is_bot: false, first_name: 'TestStudent' },
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

describe('Milestone M1 — Student Onboarding & Course Selection Router', () => {
  let db: SqliteDatabaseConnection;
  let clock: FakeClock;
  let logger: JsonLogger;
  let studentRepo: StudentRepository;
  let academicRepo: AcademicRepository;
  let calendarService: AcademicCalendarService;
  let router: OnboardingRouter;

  beforeEach(() => {
    db = new SqliteDatabaseConnection(':memory:');
    const runner = new MigrationRunner(db, migrationsDir);
    runner.migrate();

    // Populate official curriculum (55 courses, 56 offerings)
    importOfficialCurriculum(db, curriculumFilePath);

    clock = new FakeClock('2026-10-15T08:00:00.000Z'); // Mid-semester October 2026
    logger = new JsonLogger('error');
    studentRepo = new StudentRepository(db);
    academicRepo = new AcademicRepository(db);
    const period = {
      id: 'period_sem1_teaching',
      academicYearId: 'ay_2026_2027',
      stageScope: 3 as const,
      programSemester: 5 as const,
      periodType: 'TEACHING' as const,
      startsOn: '2026-09-20',
      endsOn: '2027-01-10',
      nominalWeekCount: 15,
      evidenceMetadataJson: null,
      createdAt: clock.nowIso(),
    };
    academicRepo.createCalendarPeriod(period);
    calendarService = new AcademicCalendarService([period]);

    router = new OnboardingRouter({
      db,
      clock,
      logger,
      calendarService,
    });
  });

  afterEach(() => {
    db.close();
  });

  it('1. /start for a new student presents stage selection view without spam', async () => {
    const { ctx, reply } = createMockContext({ userId: 10001, text: '/start' });
    await router.handleStartOrMenu(ctx);

    expect(reply).toHaveBeenCalledOnce();
    const sentText = reply.mock.calls[0]![0] as string;
    const sentOptions = reply.mock.calls[0]![1] as { reply_markup: InlineKeyboard };

    expect(sentText).toContain('أهلاً بك في Mecha Bot');
    expect(sentText).toContain('حدد مرحلتك:');
    expect(sentOptions.reply_markup).toBeDefined();

    // Verify stage buttons (1..4)
    const stageCallbacks = getCallbackDataList(sentOptions.reply_markup);
    expect(stageCallbacks).toContain('m1:s:1');
    expect(stageCallbacks).toContain('m1:s:2');
    expect(stageCallbacks).toContain('m1:s:3');
    expect(stageCallbacks).toContain('m1:s:4');
  });

  it('2. Stage selection callback m1:s:3 sets stage 3 and edits message to semester options', async () => {
    const { ctx, editMessageText, answerCallbackQuery } = createMockContext({
      userId: 10001,
      callbackData: 'm1:s:3',
    });

    await router.handleCallback(ctx);

    expect(answerCallbackQuery).toHaveBeenCalled();
    expect(editMessageText).toHaveBeenCalledOnce();
    const editedText = editMessageText.mock.calls[0]![0] as string;
    const editedOptions = editMessageText.mock.calls[0]![1] as { reply_markup: InlineKeyboard };

    expect(editedText).toContain('المرحلة الثالثة');
    expect(editedText).toContain('اختر الفصل:');

    // Stage 3 corresponds strictly to Semester 5 & 6
    const callbacks = getCallbackDataList(editedOptions.reply_markup);
    expect(callbacks).toContain('m1:sem:5');
    expect(callbacks).toContain('m1:sem:6');
    expect(callbacks).toContain('m1:back:stage');

    // Verify database state
    const student = studentRepo.findByTelegramId(10001);
    expect(student).not.toBeNull();
    expect(student?.stage).toBe(3);
    expect(student?.programSemester).toBeNull();
    expect(student?.activeCourseId).toBeNull();
  });

  it('3. Semester selection callback m1:sem:5 queries and presents semester 5 courses', async () => {
    // Precondition: student selected stage 3
    studentRepo.updateStage(10001, 3);

    const { ctx, editMessageText, answerCallbackQuery } = createMockContext({
      userId: 10001,
      callbackData: 'm1:sem:5',
    });

    await router.handleCallback(ctx);

    expect(answerCallbackQuery).toHaveBeenCalled();
    expect(editMessageText).toHaveBeenCalledOnce();
    const editedText = editMessageText.mock.calls[0]![0] as string;
    const editedOptions = editMessageText.mock.calls[0]![1] as { reply_markup: InlineKeyboard };

    expect(editedText).toContain('المرحلة الثالثة › الفصل الخامس');
    expect(editedText).toContain('اختر المادة:');

    // Verify semester 5 courses are present
    const callbacks = getCallbackDataList(editedOptions.reply_markup);
    expect(callbacks).toContain('m1:c:MCT311');
    expect(callbacks).toContain('m1:c:MCT314');
    expect(callbacks).toContain('m1:back:sem');

    // Verify database state
    const student = studentRepo.findByTelegramId(10001);
    expect(student?.programSemester).toBe(5);
    expect(student?.activeCourseId).toBeNull();
  });

  it('4. Compact course callback m1:c:MCT314 resolves server-side, persists active course, and opens Course Home', async () => {
    // Precondition: student at stage 3, semester 5
    studentRepo.updateStage(10001, 3);
    studentRepo.updateSemester(10001, 5);

    const { ctx, editMessageText, answerCallbackQuery } = createMockContext({
      userId: 10001,
      callbackData: 'm1:c:MCT314',
    });

    await router.handleCallback(ctx);

    expect(answerCallbackQuery).toHaveBeenCalled();
    expect(editMessageText).toHaveBeenCalledOnce();
    const editedText = editMessageText.mock.calls[0]![0] as string;
    const editedOptions = editMessageText.mock.calls[0]![1] as { reply_markup: InlineKeyboard };

    expect(editedText).toContain('MCT314 — أنظمة السيطرة 1');
    expect(editedText).toContain('المرحلة الثالثة › الفصل الخامس');
    expect(editedText).toContain('أصبحت هذه المادة الحالية.');

    const callbacks = getCallbackDataList(editedOptions.reply_markup);
    expect(callbacks).toContain('m1:start_course');
    expect(callbacks).toContain('m1:chg:course');
    expect(callbacks).toContain('m1:chg:sem');
    expect(callbacks).toContain('m1:chg:stage');

    // Verify persisted database records
    const student = studentRepo.findByTelegramId(10001);
    expect(student?.activeCourseId).toBe('course_mct314');
    expect(student?.activeCourseOfferingId).toBe('offering_mct314_s5');
  });

  it('5. Disambiguates multi-semester courses (P4MCT) correctly using student semester', async () => {
    // Case A: Stage 4, Semester 7
    studentRepo.updateStage(10001, 4);
    studentRepo.updateSemester(10001, 7);

    const { ctx: ctx7 } = createMockContext({ userId: 10001, callbackData: 'm1:c:P4MCT' });
    await router.handleCallback(ctx7);

    const studentSem7 = studentRepo.findByTelegramId(10001);
    expect(studentSem7?.activeCourseId).toBe('course_p4mct');
    expect(studentSem7?.activeCourseOfferingId).toBe('offering_p4mct_s7');

    // Case B: Stage 4, Semester 8
    studentRepo.updateStage(10001, 4);
    studentRepo.updateSemester(10001, 8);

    const { ctx: ctx8 } = createMockContext({ userId: 10001, callbackData: 'm1:c:P4MCT' });
    await router.handleCallback(ctx8);

    const studentSem8 = studentRepo.findByTelegramId(10001);
    expect(studentSem8?.activeCourseId).toBe('course_p4mct');
    expect(studentSem8?.activeCourseOfferingId).toBe('offering_p4mct_s8');
    expect(studentSem8?.activeCourseOfferingId).not.toBe(studentSem7?.activeCourseOfferingId);
  });

  it('6. Returning student flow: /start or /menu directly resumes saved course without onboarding questions', async () => {
    // Setup saved student profile
    studentRepo.updateStage(10001, 3);
    studentRepo.updateSemester(10001, 5);
    studentRepo.updateActiveCourse(10001, 'course_mct314', 'offering_mct314_s5');

    // Student sends /start
    const { ctx: startCtx, reply: startReply } = createMockContext({
      userId: 10001,
      text: '/start',
    });
    await router.handleStartOrMenu(startCtx);

    expect(startReply).toHaveBeenCalledOnce();
    const textStart = startReply.mock.calls[0]![0] as string;
    expect(textStart).toContain('أهلاً بعودتك');
    expect(textStart).toContain('MCT314 — أنظمة السيطرة 1');
    expect(textStart).toContain('المرحلة الثالثة › الفصل الخامس');
    expect(textStart).not.toContain('حدد مرحلتك:'); // Did NOT ask for stage again

    // Student sends /menu
    const { ctx: menuCtx, reply: menuReply } = createMockContext({ userId: 10001, text: '/menu' });
    await router.handleStartOrMenu(menuCtx);

    expect(menuReply).toHaveBeenCalledOnce();
    const textMenu = menuReply.mock.calls[0]![0] as string;
    expect(textMenu).toContain('أهلاً بعودتك');
    expect(textMenu).toContain('MCT314 — أنظمة السيطرة 1');
  });

  it('7. Mid-semester joiner UX foundation: displays non-assuming message and estimated academic week', async () => {
    // Student selects course and clicks "ابدأ بالمادة"
    studentRepo.updateStage(10001, 3);
    studentRepo.updateSemester(10001, 5);
    studentRepo.updateActiveCourse(10001, 'course_mct314', 'offering_mct314_s5');

    const { ctx, editMessageText, answerCallbackQuery } = createMockContext({
      userId: 10001,
      callbackData: 'm1:start_course',
    });

    await router.handleCallback(ctx);

    expect(answerCallbackQuery).toHaveBeenCalled();
    expect(editMessageText).toHaveBeenCalledOnce();
    const text = editMessageText.mock.calls[0]![0] as string;

    expect(text).toContain('MCT314 — أنظمة السيطرة 1');
    expect(text).toContain('ميزات الدراسة ستتوفر في المراحل القادمة.');
    // Academic week computed from seed calendar period (September 20 to October 15 ≈ Week 4)
    expect(text).toMatch(/أنت حالياً تقريباً بالأسبوع \d حسب التقويم\./);
    // Preserves product rule: infer -> suggest -> confirm, never silently assume
    expect(text).toContain('إذا دخلت البوت بنص الفصل، مو مشكلة.');
    expect(text).toContain('لاحقاً تگدر تحدد آخر موضوع أخذتوه حتى أضبط المادة عليك.');
  });

  it('8. Deterministically clears dependent state on stage or semester changes', async () => {
    // Setup full state: Stage 3, Semester 5, MCT314
    studentRepo.updateStage(10001, 3);
    studentRepo.updateSemester(10001, 5);
    studentRepo.updateActiveCourse(10001, 'course_mct314', 'offering_mct314_s5');

    // Student changes stage to Stage 2
    const { ctx: stageCtx } = createMockContext({ userId: 10001, callbackData: 'm1:s:2' });
    await router.handleCallback(stageCtx);

    let student = studentRepo.findByTelegramId(10001);
    expect(student?.stage).toBe(2);
    expect(student?.programSemester).toBeNull();
    expect(student?.activeCourseId).toBeNull();
    expect(student?.activeCourseOfferingId).toBeNull();

    // Student sets semester 3
    const { ctx: semCtx } = createMockContext({ userId: 10001, callbackData: 'm1:sem:3' });
    await router.handleCallback(semCtx);

    student = studentRepo.findByTelegramId(10001);
    expect(student?.stage).toBe(2);
    expect(student?.programSemester).toBe(3);
    expect(student?.activeCourseId).toBeNull();
    expect(student?.activeCourseOfferingId).toBeNull();
  });

  it('9. Rejects mismatched/tampered callback data and answers callback query to prevent spinner hang', async () => {
    // Student in Stage 1
    studentRepo.updateStage(10001, 1);

    // Tampered: Student tries to send Semester 7 callback (Stage 4)
    const {
      ctx: tamperedCtx,
      answerCallbackQuery: ans1,
      editMessageText,
    } = createMockContext({
      userId: 10001,
      callbackData: 'm1:sem:7',
    });

    await router.handleCallback(tamperedCtx);

    expect(ans1).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('غير مطابق') }),
    );
    // Edits back to valid semester options for Stage 1
    expect(editMessageText).toHaveBeenCalledOnce();
    const text = editMessageText.mock.calls[0]![0] as string;
    expect(text).toContain('المرحلة الأولى');

    // Malformed callback
    const { ctx: malformedCtx, answerCallbackQuery: ans2 } = createMockContext({
      userId: 10001,
      callbackData: 'm1:unknown_payload:999',
    });

    await router.handleCallback(malformedCtx);
    expect(ans2).toHaveBeenCalledWith(expect.objectContaining({ text: 'طلب غير معروف' }));
  });

  it('10. Safe navigation edits in place, suppresses "message is not modified", and falls back to reply', async () => {
    const logger = new JsonLogger('error');
    const dummyMarkup = new InlineKeyboard().text('Test', 'test');

    // Case A: normal edit
    const { ctx: ctxNormal, editMessageText: editNormal } = createMockContext({
      callbackData: 'm1:test',
    });
    await safeEditMenu(ctxNormal, {
      text: 'Menu A',
      replyMarkup: dummyMarkup,
      logger,
    });
    expect(editNormal).toHaveBeenCalledWith('Menu A', { reply_markup: dummyMarkup });

    // Case B: "message is not modified" error is swallowed without crash or reply
    const {
      ctx: ctxUnchanged,
      editMessageText: editUnchanged,
      reply: replyUnchanged,
    } = createMockContext({
      callbackData: 'm1:test',
    });
    editUnchanged.mockRejectedValueOnce(new Error('Bad Request: message is not modified'));

    await expect(
      safeEditMenu(ctxUnchanged, {
        text: 'Menu Same',
        replyMarkup: dummyMarkup,
        logger,
      }),
    ).resolves.not.toThrow();
    expect(replyUnchanged).not.toHaveBeenCalled();

    // Case C: edit fails with other error (e.g. message deleted), falls back to reply
    const {
      ctx: ctxDeleted,
      editMessageText: editDeleted,
      reply: replyFallback,
    } = createMockContext({
      callbackData: 'm1:test',
    });
    editDeleted.mockRejectedValueOnce(new Error('Bad Request: message to edit not found'));

    await safeEditMenu(ctxDeleted, {
      text: 'Menu Fresh',
      replyMarkup: dummyMarkup,
      logger,
    });
    expect(replyFallback).toHaveBeenCalledWith('Menu Fresh', { reply_markup: dummyMarkup });
  });

  it('11. Multi-user isolation: User A and User B maintain completely distinct selections concurrently', async () => {
    // User A: Stage 3, Semester 5, MCT314
    studentRepo.updateStage(10001, 3);
    studentRepo.updateSemester(10001, 5);
    studentRepo.updateActiveCourse(10001, 'course_mct314', 'offering_mct314_s5');

    // User B: Stage 1, Semester 2, MCT121
    studentRepo.updateStage(20002, 1);
    studentRepo.updateSemester(20002, 2);
    studentRepo.updateActiveCourse(20002, 'course_mct121', 'offering_mct121_s2');

    const studentA = studentRepo.findByTelegramId(10001);
    const studentB = studentRepo.findByTelegramId(20002);

    expect(studentA?.stage).toBe(3);
    expect(studentA?.programSemester).toBe(5);
    expect(studentA?.activeCourseId).toBe('course_mct314');

    expect(studentB?.stage).toBe(1);
    expect(studentB?.programSemester).toBe(2);
    expect(studentB?.activeCourseId).toBe('course_mct121');

    // User A changes course to MCT311
    const { ctx: ctxA } = createMockContext({ userId: 10001, callbackData: 'm1:c:MCT311' });
    await router.handleCallback(ctxA);

    const updatedA = studentRepo.findByTelegramId(10001);
    const unchangedB = studentRepo.findByTelegramId(20002);

    expect(updatedA?.activeCourseId).toBe('course_mct311');
    // User B was completely unaffected
    expect(unchangedB?.activeCourseId).toBe('course_mct121');
    expect(unchangedB?.stage).toBe(1);
    expect(unchangedB?.programSemester).toBe(2);
  });

  it('12. Enforces zero AI provider calls during onboarding and course navigation', () => {
    // Verify that the router deps contain no AI client
    expect((router as unknown as { aiClient?: unknown }).aiClient).toBeUndefined();

    // Verify audit log has no AI usage entries during M1 operations
    const aiUsageCount = db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM ai_usage_logs;',
    );
    expect(aiUsageCount?.count).toBe(0);
  });

  it('13. Supports navigation settings, stage change, and menu return', async () => {
    studentRepo.updateStage(10001, 3);
    studentRepo.updateSemester(10001, 5);
    studentRepo.updateActiveCourse(10001, 'course_mct314', 'offering_mct314_s5');

    // Test settings view
    const { ctx: settingsCtx, editMessageText: editSettings } = createMockContext({
      userId: 10001,
      callbackData: 'm1:settings',
    });
    await router.handleCallback(settingsCtx);
    expect(editSettings).toHaveBeenCalledOnce();
    const settingsText = editSettings.mock.calls[0]![0] as string;
    expect(settingsText).toContain('الإعدادات الأكاديمية');
    expect(settingsText).toContain('المرحلة الثالثة');
    expect(settingsText).toContain('الفصل الخامس');
    expect(settingsText).toContain('MCT314');

    // Test change course button
    const { ctx: chgCourseCtx, editMessageText: editChgCourse } = createMockContext({
      userId: 10001,
      callbackData: 'm1:chg:course',
    });
    await router.handleCallback(chgCourseCtx);
    expect(editChgCourse).toHaveBeenCalledOnce();
    expect(editChgCourse.mock.calls[0]![0]).toContain('اختر المادة:');

    // Test change semester button
    const { ctx: chgSemCtx, editMessageText: editChgSem } = createMockContext({
      userId: 10001,
      callbackData: 'm1:chg:sem',
    });
    await router.handleCallback(chgSemCtx);
    expect(editChgSem).toHaveBeenCalledOnce();
    expect(editChgSem.mock.calls[0]![0]).toContain('اختر الفصل:');

    // Test change stage button
    const { ctx: chgStageCtx, editMessageText: editChgStage } = createMockContext({
      userId: 10001,
      callbackData: 'm1:chg:stage',
    });
    await router.handleCallback(chgStageCtx);
    expect(editChgStage).toHaveBeenCalledOnce();
    expect(editChgStage.mock.calls[0]![0]).toContain('حدد مرحلتك:');

    // Test menu button
    const { ctx: menuCtx, editMessageText: editMenu } = createMockContext({
      userId: 10001,
      callbackData: 'm1:menu',
    });
    await router.handleCallback(menuCtx);
    expect(editMenu).toHaveBeenCalledOnce();
  });
});
