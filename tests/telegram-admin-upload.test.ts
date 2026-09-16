import { describe, it, expect, beforeEach } from 'vitest';
import { OnboardingRouter } from '../packages/telegram/src/navigation/router.js';
import { SqliteDatabaseConnection } from '@mecha-bot/database';
import { AcademicRepository } from '../packages/database/src/repositories/academic-repository.js';
import { FakeClock } from '../packages/shared/src/clock.js';
import { JsonLogger } from '../packages/shared/src/logger.js';
import { MechaBotApp } from '../packages/wiring/src/orchestrator.js';
import { FileDistributionService } from '../packages/distribution/src/service.js';

describe('Admin Material Upload Flow (Telegram)', () => {
  let db: SqliteDatabaseConnection;
  let academicRepo: AcademicRepository;
  let distributionService: FileDistributionService;
  let app: MechaBotApp;
  let router: OnboardingRouter;
  let clock: FakeClock;
  let logger: JsonLogger;

  beforeEach(() => {
    db = new SqliteDatabaseConnection(':memory:');
    db.exec(`
      CREATE TABLE IF NOT EXISTS academic_years (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        starts_on TEXT NOT NULL,
        ends_on TEXT NOT NULL,
        is_current INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        default_stage INTEGER NOT NULL,
        default_program_semester INTEGER NOT NULL,
        is_active INTEGER NOT NULL,
        curriculum_version_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        telegram_id INTEGER NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        username TEXT,
        stage INTEGER,
        program_semester INTEGER,
        section TEXT,
        group_id TEXT,
        preferred_locale TEXT NOT NULL,
        active_course_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    academicRepo = new AcademicRepository(db);
    distributionService = new FileDistributionService();
    clock = new FakeClock('2026-10-20T10:00:00.000Z');
    logger = new JsonLogger('error');

    // Seed test course
    academicRepo.createCourse({
      id: 'c_mct112',
      code: 'MCT112',
      nameAr: 'الدوائر الكهربائية 1',
      nameEn: 'Electrical Circuits 1',
      defaultStage: 1,
      defaultProgramSemester: 1,
      isActive: true,
      curriculumVersionId: 'cv_2026',
      createdAt: '2026-10-20T10:00:00.000Z',
      updatedAt: '2026-10-20T10:00:00.000Z',
    });

    app = new MechaBotApp({
      distributionService,
    } as any);

    router = new OnboardingRouter({
      db,
      clock,
      logger,
      app,
    });
  });

  it('handles /admin command and displays control panel', async () => {
    let replyText = '';
    let replyMarkup: any = null;

    const ctx = {
      from: { id: 999111, first_name: 'Dr. Ali' },
      reply: async (text: string, opts?: any) => {
        replyText = text;
        replyMarkup = opts?.reply_markup;
      },
    } as any;

    await router.handleAdminCommand(ctx);

    expect(replyText).toContain('لوحة إدارة المواد والمصادر الأكاديمية');
    expect(replyMarkup).toBeDefined();
  });

  it('selects course and uploads lecturer note successfully via document', async () => {
    const adminTelegramId = 999111;

    // 1. Admin clicks "إضافة ملزمة أستاذ"
    let editText = '';

    const addCallbackCtx = {
      from: { id: adminTelegramId },
      callbackQuery: { data: 'm:admin:add:LECTURER_NOTE' },
      answerCallbackQuery: async () => {},
      reply: async (text: string) => {
        editText = text;
      },
      editMessageText: async (text: string) => {
        editText = text;
      },
    } as any;

    await router.handleCallback(addCallbackCtx);
    expect(editText).toContain('إضافة ملزمة أستاذ جديدة');

    // 2. Admin selects MCT112
    const selCallbackCtx = {
      from: { id: adminTelegramId },
      callbackQuery: { data: 'm:admin:sel:LECTURER_NOTE:MCT112' },
      answerCallbackQuery: async () => {},
      reply: async (text: string) => {
        editText = text;
      },
      editMessageText: async (text: string) => {
        editText = text;
      },
    } as any;

    await router.handleCallback(selCallbackCtx);
    expect(editText).toContain('بانتظار إرسال (ملزمة أستاذ) لمادة (MCT112)');

    // 3. Admin sends a PDF document
    let successReply = '';
    const docMessageCtx = {
      from: { id: adminTelegramId },
      message: {
        document: {
          file_id: 'tg_file_lecture_1_circuit_laws',
          file_unique_id: 'uniq_circ_1',
          file_name: 'Circuits_Lecture_1.pdf',
          mime_type: 'application/pdf',
          file_size: 1048576,
        },
        caption: 'المحاضرة الأولى - قوانين كيرشوف وتطبيقاتها',
      },
      reply: async (text: string) => {
        successReply = text;
      },
    } as any;

    await router.handleDocumentMessage(docMessageCtx);

    expect(successReply).toContain('تم نشر الملزمة بنجاح');
    expect(successReply).toContain('MCT112');
    expect(successReply).toContain('المحاضرة الأولى - قوانين كيرشوف وتطبيقاتها');

    // 4. Verify the file is now registered in the distribution service catalog
    const files = await distributionService.listCourseFiles('MCT112');
    expect(files.length).toBe(1);
    expect(files[0]!.title).toBe('المحاضرة الأولى - قوانين كيرشوف وتطبيقاتها');
    expect(files[0]!.documentType).toBe('LECTURER_NOTE');
    expect(files[0]!.storageReference?.value).toBe('tg_file_lecture_1_circuit_laws');
    expect(files[0]!.distributionPolicy.canDistribute).toBe(true);
  });

  it('selects course and uploads student summary via Drive link text', async () => {
    const adminTelegramId = 888222;

    // 1. Admin selects summary for MCT112
    const selCallbackCtx = {
      from: { id: adminTelegramId },
      callbackQuery: { data: 'm:admin:sel:STUDENT_NOTE:MCT112' },
      answerCallbackQuery: async () => {},
      reply: async () => {},
      editMessageText: async () => {},
    } as any;

    await router.handleCallback(selCallbackCtx);

    // 2. Admin sends Drive URL in text
    let successReply = '';
    const textMessageCtx = {
      from: { id: adminTelegramId },
      message: {
        text: 'ملخص كيرشوف ونودل أناليسز\nhttps://drive.google.com/file/d/12345/view',
      },
      reply: async (text: string) => {
        successReply = text;
      },
    } as any;

    await router.handleTextMessage(textMessageCtx);

    expect(successReply).toContain('تم نشر الملخص بنجاح');
    expect(successReply).toContain('MCT112');

    // Verify file in catalog
    const files = await distributionService.listCourseFiles('MCT112');
    expect(files.length).toBe(1);
    expect(files[0]!.documentType).toBe('STUDENT_NOTE');
    expect(files[0]!.storageReference?.kind).toBe('EXTERNAL_URL');
  });
});
