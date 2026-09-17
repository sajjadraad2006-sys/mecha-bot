import { Context } from 'grammy';
import { DatabaseConnection, StudentRepository, AcademicRepository } from '@mecha-bot/database';
import { AcademicCalendarService, Stage, ProgramSemester } from '@mecha-bot/academic';
import { Clock, Logger } from '@mecha-bot/shared';
import type { MechaBotApp } from '@mecha-bot/wiring';
import type { QuizQuestion } from '@mecha-bot/exams';
import { TelegramAppBridge } from '../application-bridge.js';
import {
  createStageSelectionKeyboard,
  createSemesterSelectionKeyboard,
  createCourseSelectionKeyboard,
  createCourseHomeKeyboard,
  createReturningStudentKeyboard,
  createStudyPlaceholderKeyboard,
  createSettingsKeyboard,
  createMainMenuKeyboard,
  createDashboardKeyboard,
  createWhereAreWeKeyboard,
  createImLostKeyboard,
  createTimetableKeyboard,
  createRemindersKeyboard,
  createExamsKeyboard,
  createQuizQuestionKeyboard,
  createSearchResultsKeyboard,
  createFilesKeyboard,
  createAiExplanationKeyboard,
  createMiniAppLaunchKeyboard,
  createAdminMenuKeyboard,
  createAdminCourseSelectKeyboard,
} from './keyboards.js';
import {
  renderStageSelectionView,
  renderSemesterSelectionView,
  renderCourseSelectionView,
  renderCourseHomeView,
  renderReturningStudentView,
  renderStudyPlaceholderView,
  renderSettingsView,
  renderMainMenuView,
  renderWhereAreWeView,
  renderConfirmPositionSuccessView,
  renderDeclineConfirmationView,
  renderImLostView,
  renderQuizQuestionView,
  renderAdminMenuView,
  renderAdminSelectCourseView,
  renderAdminAwaitingUploadView,
  renderAdminMaterialSuccessView,
} from './views.js';
import { safeEditMenu } from './helper.js';

export interface TelegramUserSession {
  awaitingSearchQuery?: boolean | undefined;
  searchCourseCode?: string | undefined;
  activeCourseCode?: string | undefined;
  activeTopicId?: string | undefined;
  activeQuizAttemptId?: string | undefined;
  activeQuizId?: string | undefined;
  activeQuizQuestionIndex?: number | undefined;
  quizAnswers?: Record<string, string | boolean> | undefined;
  awaitingAdminUpload?:
    | {
        materialType: 'LECTURER_NOTE' | 'STUDENT_NOTE';
        courseCode: string;
      }
    | undefined;
}

export interface OnboardingRouterDeps {
  db: DatabaseConnection;
  clock: Clock;
  logger: Logger;
  calendarService?: AcademicCalendarService | undefined;
  app?: MechaBotApp | undefined;
  bridge?: TelegramAppBridge | undefined;
  miniAppUrl?: string | undefined;
}

export class OnboardingRouter {
  private studentRepo: StudentRepository;
  private academicRepo: AcademicRepository;
  private clock: Clock;
  private logger: Logger;
  private calendarService?: AcademicCalendarService | undefined;
  private bridge?: TelegramAppBridge | undefined;
  private miniAppUrl?: string | undefined;
  private sessions = new Map<number, TelegramUserSession>();

  constructor(deps: OnboardingRouterDeps) {
    this.studentRepo = new StudentRepository(deps.db);
    this.academicRepo = new AcademicRepository(deps.db);
    this.clock = deps.clock;
    this.logger = deps.logger;
    this.calendarService = deps.calendarService;
    this.miniAppUrl = deps.miniAppUrl;

    if (deps.bridge) {
      this.bridge = deps.bridge;
    } else if (deps.app) {
      this.bridge = new TelegramAppBridge({
        app: deps.app,
        studentRepo: this.studentRepo,
      });
    }
  }

  public getBridge(): TelegramAppBridge | undefined {
    return this.bridge;
  }

  private getOrCreateSession(telegramUserId: number): TelegramUserSession {
    let session = this.sessions.get(telegramUserId);
    if (!session) {
      session = {};
      this.sessions.set(telegramUserId, session);
    }
    return session;
  }

  /**
   * Resolves the active academic year ID from database or default.
   */
  private getActiveAcademicYearId(): string {
    const currentYear = this.academicRepo.getCurrentAcademicYear();
    return currentYear ? currentYear.id : 'ay_2026_2027';
  }

  /**
   * Handles /start and /menu commands.
   * If student has already chosen a course, shows the returning student home card.
   * Otherwise displays the stage selection menu.
   */
  async handleStartOrMenu(ctx: Context): Promise<void> {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) return;

    const student = this.studentRepo.findByTelegramId(telegramUserId);

    if (student?.stage && student?.programSemester && student?.activeCourseId) {
      const course = this.academicRepo.findCourseById(student.activeCourseId);
      if (course) {
        await safeEditMenu(ctx, {
          text: renderReturningStudentView(
            course.code,
            course.nameAr,
            student.stage,
            student.programSemester,
          ),
          replyMarkup: createReturningStudentKeyboard(course.code),
          logger: this.logger,
        });
        return;
      }
    }

    if (student?.stage && !student?.programSemester) {
      await safeEditMenu(ctx, {
        text: renderSemesterSelectionView(student.stage),
        replyMarkup: createSemesterSelectionKeyboard(student.stage),
        logger: this.logger,
      });
      return;
    }

    if (student?.stage && student?.programSemester && !student?.activeCourseId) {
      await this.handleCourses(ctx);
      return;
    }

    // New student or incomplete onboarding
    await safeEditMenu(ctx, {
      text: renderStageSelectionView(),
      replyMarkup: createStageSelectionKeyboard(),
      logger: this.logger,
    });
  }

  /**
   * Renders the Main Student Menu.
   */
  async handleMainMenu(ctx: Context): Promise<void> {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) return;

    const student = this.studentRepo.findByTelegramId(telegramUserId);
    if (!student?.stage || !student?.programSemester) {
      await this.handleStartOrMenu(ctx);
      return;
    }

    const course = student.activeCourseId
      ? this.academicRepo.findCourseById(student.activeCourseId)
      : null;

    await safeEditMenu(ctx, {
      text: renderMainMenuView(
        student.stage,
        student.programSemester,
        course?.code,
        course?.nameAr,
      ),
      replyMarkup: createMainMenuKeyboard(Boolean(course), course?.code, this.miniAppUrl),
      logger: this.logger,
    });
  }

  /**
   * Handles "موادي" (courses list for student's stage & semester).
   */
  async handleCourses(ctx: Context): Promise<void> {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) return;

    const student = this.studentRepo.findByTelegramId(telegramUserId);
    if (!student?.stage || !student?.programSemester) {
      await this.handleStartOrMenu(ctx);
      return;
    }

    const academicYearId = this.getActiveAcademicYearId();
    const offerings = this.academicRepo.listOfferingsBySemester(
      academicYearId,
      student.programSemester,
    );

    await safeEditMenu(ctx, {
      text: renderCourseSelectionView(student.stage, student.programSemester),
      replyMarkup: createCourseSelectionKeyboard(offerings),
      logger: this.logger,
    });
  }

  /**
   * Handles /dashboard command and "m:dashboard" callback.
   */
  async handleDashboardCommand(ctx: Context): Promise<void> {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) return;

    const student = this.studentRepo.findByTelegramId(telegramUserId);
    if (!student?.stage || !student?.programSemester) {
      await this.handleStartOrMenu(ctx);
      return;
    }

    if (!this.bridge) {
      await ctx.reply('لوحة التحكم غير متوفرة حالياً.');
      return;
    }

    const { text } = await this.bridge.handleDashboardView(ctx);
    let activeCourseCode: string | undefined;
    if (student.activeCourseId) {
      const course = this.academicRepo.findCourseById(student.activeCourseId);
      activeCourseCode = course?.code;
    }

    await safeEditMenu(ctx, {
      text,
      replyMarkup: createDashboardKeyboard(activeCourseCode, this.miniAppUrl),
      logger: this.logger,
    });
  }

  /**
   * Handles /app command to open the Telegram Mini App.
   */
  async handleAppCommand(ctx: Context): Promise<void> {
    if (this.miniAppUrl) {
      await ctx.reply(
        '⚡ *تطبيق Mecha Bot المصغر (Web App)*\n\n' +
          'تصفح جدول المحاضرات الأسبوعي، ومفردات المناهج الدراسية، ومخطط المتطلبات التفاعلي مباشرة داخل تيليجرام:',
        {
          reply_markup: createMiniAppLaunchKeyboard(this.miniAppUrl),
          parse_mode: 'Markdown',
        },
      );
    } else {
      await ctx.reply(
        'ℹ️ رابط التطبيق المصغر غير معرّف حالياً في متغيرات البيئة (`MINI_APP_URL`).\n' +
          'يمكنك استخدام الأوامر المباشرة مثل `/timetable` للجدول أو `/courses` للمواد أو `/dashboard` للوحة التحكم.',
        {
          parse_mode: 'Markdown',
        },
      );
    }
  }

  /**
   * Handles /where command (whereAreWe for active course).
   */
  async handleWhereAreWeCommand(ctx: Context): Promise<void> {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) return;

    const student = this.studentRepo.findByTelegramId(telegramUserId);
    if (!student?.activeCourseId) {
      await ctx.reply('⚠️ يرجى اختيار مادة أولاً لعرض موضع التقدم الدراسي.');
      await this.handleCourses(ctx);
      return;
    }

    const course = this.academicRepo.findCourseById(student.activeCourseId);
    if (!course || !this.bridge) {
      await ctx.reply('المادة غير موجودة أو الخدمة غير متوفرة.');
      return;
    }

    const response = await this.bridge.getWhereAreWeData(ctx, course.code);
    const profile = this.bridge.getApp().dataset.profilesByCode.get(course.code.toUpperCase());
    const text = renderWhereAreWeView(response, profile?.displayNames?.ar);

    await safeEditMenu(ctx, {
      text,
      replyMarkup: createWhereAreWeKeyboard(
        course.code,
        response.suggestedTopicKey,
        response.needsStudentConfirmation && Boolean(response.suggestedTopicKey),
      ),
      logger: this.logger,
    });
  }

  /**
   * Handles /lost command (imLost for active course).
   */
  async handleImLostCommand(ctx: Context): Promise<void> {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) return;

    const student = this.studentRepo.findByTelegramId(telegramUserId);
    if (!student?.activeCourseId) {
      await ctx.reply('⚠️ يرجى اختيار مادة أولاً لتشخيص مسار الاستدراك.');
      await this.handleCourses(ctx);
      return;
    }

    const course = this.academicRepo.findCourseById(student.activeCourseId);
    if (!course || !this.bridge) {
      await ctx.reply('المادة غير موجودة أو الخدمة غير متوفرة.');
      return;
    }

    const diagnosis = await this.bridge.getImLostData(ctx, course.code);
    const profile = this.bridge.getApp().dataset.profilesByCode.get(course.code.toUpperCase());
    const text = renderImLostView(diagnosis, profile?.displayNames?.ar);

    await safeEditMenu(ctx, {
      text,
      replyMarkup: createImLostKeyboard(course.code),
      logger: this.logger,
    });
  }

  /**
   * Handles /timetable command.
   */
  async handleTimetableCommand(ctx: Context): Promise<void> {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) return;

    const student = this.studentRepo.findByTelegramId(telegramUserId);
    if (!student?.stage || !student?.programSemester) {
      await this.handleStartOrMenu(ctx);
      return;
    }

    if (this.bridge) {
      const { text } = this.bridge.handleTimetable(ctx, student.stage, student.programSemester);
      await safeEditMenu(ctx, {
        text,
        replyMarkup: createTimetableKeyboard(),
        logger: this.logger,
      });
    }
  }

  /**
   * Handles /reminders command.
   */
  async handleRemindersCommand(ctx: Context): Promise<void> {
    if (!this.bridge) return;
    const text = this.bridge.handleRemindersView(ctx);
    await safeEditMenu(ctx, {
      text,
      replyMarkup: createRemindersKeyboard(),
      logger: this.logger,
    });
  }

  /**
   * Prompts the user to enter a search query.
   */
  async handleSearchPrompt(ctx: Context, courseCode?: string): Promise<void> {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) return;
    const session = this.getOrCreateSession(telegramUserId);
    session.awaitingSearchQuery = true;
    session.searchCourseCode = courseCode;

    const suffix = courseCode ? ` لمادة (${courseCode})` : '';
    await safeEditMenu(ctx, {
      text: `🔍 *البحث الأكاديمي${suffix}*\n\nأرسل الكلمة أو الموضوع المطلوب للبحث في المصادر والمقررات:`,
      replyMarkup: createSearchResultsKeyboard([], courseCode),
      logger: this.logger,
    });
  }

  /**
   * Handles search command (/search <query> or text query).
   */
  async handleSearchQuery(ctx: Context, queryText: string, courseCode?: string): Promise<void> {
    if (!this.bridge) return;
    const text = await this.bridge.handleSearch(ctx, queryText, courseCode);
    const searchData = await this.bridge.getSearchData(ctx, queryText, courseCode);
    const fileButtons = searchData.hits
      .filter((h) => h.deliveryDecision && h.deliveryDecision.status !== 'BLOCKED_POLICY')
      .map((h) => ({
        fileId: h.deliveryDecision?.fileRecord?.id,
        label: h.deliveryDecision?.fileRecord?.title ?? 'تحميل الملف',
      }));

    await safeEditMenu(ctx, {
      text,
      replyMarkup: createSearchResultsKeyboard(fileButtons, courseCode),
      logger: this.logger,
    });
  }

  /**
   * Handles the /admin command for course editors and administrators.
   */
  async handleAdminCommand(ctx: Context): Promise<void> {
    await ctx.reply(renderAdminMenuView(), {
      parse_mode: 'Markdown',
      reply_markup: createAdminMenuKeyboard(),
    });
  }

  /**
   * Handles incoming documents (e.g. lecture notes and summaries uploaded by admin).
   */
  async handleDocumentMessage(ctx: Context): Promise<void> {
    const telegramUserId = ctx.from?.id;
    const doc = ctx.message?.document;
    if (!telegramUserId || !doc) return;

    const session = this.getOrCreateSession(telegramUserId);
    if (session.awaitingAdminUpload) {
      const { materialType, courseCode } = session.awaitingAdminUpload;
      session.awaitingAdminUpload = undefined;

      const title =
        ctx.message?.caption?.trim() ||
        doc.file_name ||
        (materialType === 'LECTURER_NOTE' ? 'ملزمة أستاذ' : 'ملخص دراسي');
      const fileId = doc.file_id;

      const app = this.bridge?.getApp();
      if (app) {
        const nowIso = new Date().toISOString();
        await app.distribution.registerFile({
          id: `tg_${doc.file_unique_id || Date.now()}`,
          title,
          courseCode,
          originalFilename: doc.file_name,
          documentType: materialType,
          sourceAuthority: materialType === 'LECTURER_NOTE' ? 'FACULTY' : 'STUDENT',
          verificationStatus: 'VERIFIED',
          archiveStatus: 'CURRENT',
          distributionPolicy: {
            canSearch: true,
            canQuote: true,
            canDistribute: true,
            policyState: 'ALLOWED',
          },
          storageReference: {
            kind: 'TELEGRAM_FILE_ID',
            value: fileId,
            metadata: {
              telegramFileUniqueId: doc.file_unique_id,
              fileSizeBytes: doc.file_size,
              mimeType: doc.mime_type,
            },
          },
          visibility: 'COURSE_SHARED',
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }

      await ctx.reply(renderAdminMaterialSuccessView(materialType, courseCode, title), {
        parse_mode: 'Markdown',
        reply_markup: createAdminMenuKeyboard(),
      });
    }
  }

  /**
   * Handles incoming text messages (e.g. search queries or user input).
   */
  async handleTextMessage(ctx: Context): Promise<void> {
    const telegramUserId = ctx.from?.id;
    const text = ctx.message?.text?.trim();
    if (!telegramUserId || !text) return;

    const session = this.getOrCreateSession(telegramUserId);

    // Admin uploading material via text/link
    if (session.awaitingAdminUpload) {
      const { materialType, courseCode } = session.awaitingAdminUpload;
      session.awaitingAdminUpload = undefined;

      const urlMatch = text.match(/https?:\/\/[^\s]+/);
      const isUrl = Boolean(urlMatch);
      const storageValue = urlMatch ? urlMatch[0] : text;
      const title =
        text.replace(/https?:\/\/[^\s]+/, '').trim() ||
        (materialType === 'LECTURER_NOTE' ? 'ملزمة أستاذ' : 'ملخص دراسي');
      const fileId = `ext_${Date.now()}`;

      const app = this.bridge?.getApp();
      if (app) {
        const nowIso = new Date().toISOString();
        await app.distribution.registerFile({
          id: fileId,
          title,
          courseCode,
          documentType: materialType,
          sourceAuthority: materialType === 'LECTURER_NOTE' ? 'FACULTY' : 'STUDENT',
          verificationStatus: 'VERIFIED',
          archiveStatus: 'CURRENT',
          distributionPolicy: {
            canSearch: true,
            canQuote: true,
            canDistribute: true,
            policyState: 'ALLOWED',
          },
          storageReference: {
            kind: isUrl ? 'EXTERNAL_URL' : 'TELEGRAM_FILE_ID',
            value: storageValue,
          },
          visibility: 'COURSE_SHARED',
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }

      await ctx.reply(renderAdminMaterialSuccessView(materialType, courseCode, title), {
        parse_mode: 'Markdown',
        reply_markup: createAdminMenuKeyboard(),
      });
      return;
    }

    if (session.awaitingSearchQuery) {
      session.awaitingSearchQuery = false;
      await this.handleSearchQuery(ctx, text, session.searchCourseCode);
      return;
    }

    // If message starts with /search
    if (text.startsWith('/search')) {
      const query = text.replace(/^\/search\s*/, '').trim();
      if (query) {
        await this.handleSearchQuery(ctx, query);
      } else {
        session.awaitingSearchQuery = true;
        await ctx.reply('🔍 أرسل الكلمة أو الموضوع المطلوب للبحث في المصادر:');
      }
      return;
    }

    // AI Brain pipeline
    const app = this.bridge?.getApp();
    const student = this.studentRepo.findByTelegramId(telegramUserId);
    let activeCourseCode = session.activeCourseCode;
    if (!activeCourseCode && student?.activeCourseId) {
      const course = this.academicRepo.findCourseById(student.activeCourseId);
      if (course) {
        activeCourseCode = course.code;
      }
    }

    const gate = app?.aiBrain?.getGate();
    const gateDecision = gate
      ? gate.evaluate(text, activeCourseCode)
      : { shouldInvokeAi: false, reason: 'AI disabled' };

    if (gateDecision.shouldInvokeAi && this.bridge) {
      try {
        const { text: replyText, response } = await this.bridge.handleAiQuery(
          ctx,
          text,
          activeCourseCode,
        );
        await ctx.reply(replyText, {
          parse_mode: 'Markdown',
          reply_markup: createAiExplanationKeyboard(
            response.courseCode ?? activeCourseCode,
            response.suggestedClarifications,
          ),
        });
      } catch (err: unknown) {
        this.logger.warn('Failed to handle AI query via Telegram bridge', {
          error: String(err),
        });
        await ctx.reply(
          'حالياً المساعد الذكي غير متاح، بس تكدر تستخدم باقي وظائف البوت بشكل طبيعي.',
        );
      }
    }
  }

  /**
   * Dispatches all callback queries (both M1 and full student journey).
   */
  async handleCallback(ctx: Context): Promise<void> {
    const data = ctx.callbackQuery?.data;
    const telegramUserId = ctx.from?.id;

    if (!data || !telegramUserId) {
      if (ctx.callbackQuery) {
        await ctx.answerCallbackQuery({ text: 'طلب غير صالح' });
      }
      return;
    }

    // --- 1. Stage Selection: m1:s:<stage> ---
    const stageMatch = data.match(/^m1:s:([1-4])$/);
    if (stageMatch) {
      const stage = parseInt(stageMatch[1]!, 10) as Stage;
      this.studentRepo.updateStage(telegramUserId, stage);

      await safeEditMenu(ctx, {
        text: renderSemesterSelectionView(stage),
        replyMarkup: createSemesterSelectionKeyboard(stage),
        logger: this.logger,
      });
      return;
    }

    // --- 2. Semester Selection: m1:sem:<sem> ---
    const semMatch = data.match(/^m1:sem:([1-8])$/);
    if (semMatch) {
      const semester = parseInt(semMatch[1]!, 10) as ProgramSemester;
      const student = this.studentRepo.findByTelegramId(telegramUserId);

      if (!student?.stage) {
        await ctx.answerCallbackQuery({ text: 'يرجى تحديد المرحلة أولاً' });
        await safeEditMenu(ctx, {
          text: renderStageSelectionView(),
          replyMarkup: createStageSelectionKeyboard(),
          logger: this.logger,
        });
        return;
      }

      const expectedSemesters = [student.stage * 2 - 1, student.stage * 2];
      if (!expectedSemesters.includes(semester)) {
        await ctx.answerCallbackQuery({ text: 'الفصل غير مطابق للمرحلة المختارة' });
        await safeEditMenu(ctx, {
          text: renderSemesterSelectionView(student.stage),
          replyMarkup: createSemesterSelectionKeyboard(student.stage),
          logger: this.logger,
        });
        return;
      }

      this.studentRepo.updateSemester(telegramUserId, semester);

      const academicYearId = this.getActiveAcademicYearId();
      const offerings = this.academicRepo.listOfferingsBySemester(academicYearId, semester);

      await safeEditMenu(ctx, {
        text: renderCourseSelectionView(student.stage, semester),
        replyMarkup: createCourseSelectionKeyboard(offerings),
        logger: this.logger,
      });
      return;
    }

    // --- 3. Course Selection: m1:c:<courseCode> or m:c:<courseCode> ---
    const courseMatch = data.match(/^(?:m1:c|m:c):([A-Za-z0-9_]+)$/);
    if (courseMatch) {
      const courseCode = courseMatch[1]!;
      const student = this.studentRepo.findByTelegramId(telegramUserId);

      if (!student?.stage || !student?.programSemester) {
        await ctx.answerCallbackQuery({ text: 'يرجى اختيار المرحلة والفصل أولاً' });
        await safeEditMenu(ctx, {
          text: renderStageSelectionView(),
          replyMarkup: createStageSelectionKeyboard(),
          logger: this.logger,
        });
        return;
      }

      const academicYearId = this.getActiveAcademicYearId();
      const offering = this.academicRepo.findOfferingByCourseCodeAndSemester(
        courseCode,
        student.programSemester,
        academicYearId,
      );

      if (!offering) {
        await ctx.answerCallbackQuery({ text: 'المادة غير متاحة في هذا الفصل' });
        return;
      }

      this.studentRepo.updateActiveCourse(telegramUserId, offering.courseId, offering.id);

      // If called from student menu (m:c:CODE), show rich course home
      if (data.startsWith('m:c:')) {
        await safeEditMenu(ctx, {
          text: renderCourseHomeView(
            offering.code,
            offering.nameAr,
            student.stage,
            student.programSemester,
          ),
          replyMarkup: createCourseHomeKeyboard(offering.code),
          logger: this.logger,
        });
      } else {
        // M1 backwards compatibility (m1:c:CODE)
        await safeEditMenu(ctx, {
          text: renderCourseHomeView(
            offering.code,
            offering.nameAr,
            student.stage,
            student.programSemester,
          ),
          replyMarkup: createCourseHomeKeyboard(),
          logger: this.logger,
        });
      }
      return;
    }

    // --- 4. Start/Resume Course: m1:start_course ---
    if (data === 'm1:start_course') {
      const student = this.studentRepo.findByTelegramId(telegramUserId);
      if (!student?.activeCourseId || !student?.stage || !student?.programSemester) {
        await ctx.answerCallbackQuery({ text: 'يرجى اختيار مادة أولاً' });
        await this.handleStartOrMenu(ctx);
        return;
      }

      const course = this.academicRepo.findCourseById(student.activeCourseId);
      if (!course) {
        await ctx.answerCallbackQuery({ text: 'المادة غير موجودة' });
        await this.handleStartOrMenu(ctx);
        return;
      }

      let calendarWeek: number | null = null;
      if (this.calendarService) {
        try {
          const now = this.clock.now();
          const period = this.calendarService.getCurrentAcademicPeriod(student.stage, now);
          if (period && period.periodType === 'TEACHING') {
            const weekStatus = this.calendarService.getAcademicWeek(
              student.stage,
              now,
              student.programSemester,
            );
            calendarWeek = weekStatus.weekNumber;
          }
        } catch {
          calendarWeek = null;
        }
      }

      await safeEditMenu(ctx, {
        text: renderStudyPlaceholderView(course.code, course.nameAr, calendarWeek),
        replyMarkup: createStudyPlaceholderKeyboard(course.code),
        logger: this.logger,
      });
      return;
    }

    // --- 5. Change Course: m1:chg:course or m:courses ---
    if (data === 'm1:chg:course' || data === 'm:courses') {
      await this.handleCourses(ctx);
      return;
    }

    // --- 6. Change Semester: m1:chg:sem or m1:back:sem ---
    if (data === 'm1:chg:sem' || data === 'm1:back:sem') {
      const student = this.studentRepo.findByTelegramId(telegramUserId);
      if (!student?.stage) {
        await this.handleStartOrMenu(ctx);
        return;
      }

      await safeEditMenu(ctx, {
        text: renderSemesterSelectionView(student.stage),
        replyMarkup: createSemesterSelectionKeyboard(student.stage),
        logger: this.logger,
      });
      return;
    }

    // --- 7. Change Stage / Back to Stage: m1:chg:stage or m1:back:stage ---
    if (data === 'm1:chg:stage' || data === 'm1:back:stage') {
      await safeEditMenu(ctx, {
        text: renderStageSelectionView(),
        replyMarkup: createStageSelectionKeyboard(),
        logger: this.logger,
      });
      return;
    }

    // --- 8. Settings: m1:settings ---
    if (data === 'm1:settings') {
      const student = this.studentRepo.findByTelegramId(telegramUserId);
      const course = student?.activeCourseId
        ? this.academicRepo.findCourseById(student.activeCourseId)
        : null;

      await safeEditMenu(ctx, {
        text: renderSettingsView(
          student?.stage || null,
          student?.programSemester || null,
          course?.code || null,
          course?.nameAr || null,
        ),
        replyMarkup: createSettingsKeyboard(),
        logger: this.logger,
      });
      return;
    }

    // --- 9. Return to Main Menu: m1:menu or m:menu ---
    if (data === 'm1:menu' || data === 'm:menu') {
      await this.handleMainMenu(ctx);
      return;
    }

    // --- Dashboard: m:dashboard ---
    if (data === 'm:dashboard') {
      await this.handleDashboardCommand(ctx);
      return;
    }

    // --- 10. "وين وصلنا؟": m:where:<courseCode> ---
    const whereMatch = data.match(/^m:where:([A-Za-z0-9_]+)$/);
    if (whereMatch) {
      const courseCode = whereMatch[1]!;
      if (!this.bridge) {
        await ctx.answerCallbackQuery({ text: 'خدمة التتبع غير متوفرة' });
        return;
      }

      const response = await this.bridge.getWhereAreWeData(ctx, courseCode);
      const profile = this.bridge.getApp().dataset.profilesByCode.get(courseCode.toUpperCase());
      const text = renderWhereAreWeView(response, profile?.displayNames?.ar);

      await safeEditMenu(ctx, {
        text,
        replyMarkup: createWhereAreWeKeyboard(
          courseCode,
          response.suggestedTopicKey,
          response.needsStudentConfirmation && Boolean(response.suggestedTopicKey),
        ),
        logger: this.logger,
      });
      return;
    }

    // --- 11. Explicit Confirmation: m:conf:<courseCode>:<topicKey> ---
    const confMatch = data.match(/^m:conf:([A-Za-z0-9_]+):(.+)$/);
    if (confMatch) {
      const courseCode = confMatch[1]!;
      const topicKey = confMatch[2]!;

      if (!this.bridge) return;
      await this.bridge.handleConfirmPosition(ctx, courseCode, topicKey);

      await safeEditMenu(ctx, {
        text: renderConfirmPositionSuccessView(courseCode, topicKey),
        replyMarkup: createWhereAreWeKeyboard(courseCode),
        logger: this.logger,
      });
      return;
    }

    // --- 12. Decline Confirmation: m:noconf:<courseCode> ---
    const noconfMatch = data.match(/^m:noconf:([A-Za-z0-9_]+)$/);
    if (noconfMatch) {
      const courseCode = noconfMatch[1]!;
      await safeEditMenu(ctx, {
        text: renderDeclineConfirmationView(courseCode),
        replyMarkup: createWhereAreWeKeyboard(courseCode),
        logger: this.logger,
      });
      return;
    }

    // --- 13. "أني ضايع": m:lost:<courseCode> ---
    const lostMatch = data.match(/^m:lost:([A-Za-z0-9_]+)$/);
    if (lostMatch) {
      const courseCode = lostMatch[1]!;
      if (!this.bridge) {
        await ctx.answerCallbackQuery({ text: 'خدمة الاستدراك غير متوفرة' });
        return;
      }

      const diagnosis = await this.bridge.getImLostData(ctx, courseCode);
      const profile = this.bridge.getApp().dataset.profilesByCode.get(courseCode.toUpperCase());
      const text = renderImLostView(diagnosis, profile?.displayNames?.ar);

      await safeEditMenu(ctx, {
        text,
        replyMarkup: createImLostKeyboard(courseCode),
        logger: this.logger,
      });
      return;
    }

    // --- 14. Timetable: m:tt ---
    if (data === 'm:tt') {
      await this.handleTimetableCommand(ctx);
      return;
    }

    // --- 15. Schedule Timetable Reminders: m:tt_rem ---
    if (data === 'm:tt_rem') {
      const student = this.studentRepo.findByTelegramId(telegramUserId);
      if (!student?.stage || !student?.programSemester || !this.bridge) {
        await ctx.answerCallbackQuery({ text: 'يرجى إكمال الإعدادات أولاً' });
        return;
      }

      const text = await this.bridge.handleScheduleLectureReminders(
        ctx,
        student.stage,
        student.programSemester,
      );
      await ctx.answerCallbackQuery({ text: 'تم تفعيل التذكيرات بنجاح!' });
      await safeEditMenu(ctx, {
        text,
        replyMarkup: createTimetableKeyboard(),
        logger: this.logger,
      });
      return;
    }

    // --- 16. Reminders: m:rem ---
    if (data === 'm:rem') {
      await this.handleRemindersCommand(ctx);
      return;
    }

    // --- 17. Search Prompt: m:search or m:search:<courseCode> ---
    const searchMatch = data.match(/^m:search(?::([A-Za-z0-9_]+))?$/);
    if (searchMatch) {
      const courseCode = searchMatch[1];
      const session = this.getOrCreateSession(telegramUserId);
      session.awaitingSearchQuery = true;
      session.searchCourseCode = courseCode;

      const suffix = courseCode ? ` لمادة (${courseCode})` : '';
      await safeEditMenu(ctx, {
        text: `🔍 *البحث الأكاديمي${suffix}*\n\nأرسل الكلمة أو الموضوع المطلوب للبحث في المصادر والمقررات:`,
        replyMarkup: createSearchResultsKeyboard([], courseCode),
        logger: this.logger,
      });
      return;
    }

    // --- 18. File Delivery: m:dl:<fileId> ---
    const dlMatch = data.match(/^m:dl:(.+)$/);
    if (dlMatch) {
      const fileId = dlMatch[1]!;
      if (!this.bridge) return;

      const { text, decision } = await this.bridge.handleRequestDelivery(ctx, fileId);
      if (decision.status === 'BLOCKED_POLICY') {
        await ctx.answerCallbackQuery({
          text: 'الملف محجوب عن التوزيع وفق سياسة المصدر',
          show_alert: true,
        });
      }
      await safeEditMenu(ctx, {
        text,
        replyMarkup: createSearchResultsKeyboard([], decision.fileRecord?.courseCode),
        logger: this.logger,
      });
      return;
    }

    // --- 19. Course Files List: m:files or m:files:<courseCode> ---
    const filesMatch = data.match(/^m:files(?::([A-Za-z0-9_]+))?$/);
    if (filesMatch) {
      let courseCode = filesMatch[1];
      if (!courseCode) {
        const student = this.studentRepo.findByTelegramId(telegramUserId);
        if (student?.activeCourseId) {
          const c = this.academicRepo.findCourseById(student.activeCourseId);
          courseCode = c?.code;
        }
      }

      if (!courseCode) {
        await ctx.answerCallbackQuery({ text: 'يرجى اختيار مادة أولاً لعرض الملفات' });
        await this.handleCourses(ctx);
        return;
      }

      if (!this.bridge) return;

      const studentKey = this.bridge.resolveStudentKey(ctx);
      const files = await this.bridge.getApp().distribution.listCourseFiles(courseCode, studentKey);

      if (files.length === 0) {
        await safeEditMenu(ctx, {
          text: `📁 *ملفات ومصادر مادة (${courseCode})*\n\nلا توجد ملفات مسجلة حالياً لهذه المادة في السجل الأكاديمي.`,
          replyMarkup: createCourseHomeKeyboard(courseCode),
          logger: this.logger,
        });
        return;
      }

      const fileButtons = files.map((f) => ({
        id: f.id,
        title: f.title,
        canDistribute: f.distributionPolicy.canDistribute,
      }));

      await safeEditMenu(ctx, {
        text: `📁 *ملفات ومصادر مادة (${courseCode})*\n\nاختر الملف للتحميل أو التحقق من سياسته:`,
        replyMarkup: createFilesKeyboard(fileButtons, courseCode),
        logger: this.logger,
      });
      return;
    }

    // --- 20. Exams & Quizzes View: m:exams or m:exams:<courseCode> ---
    const examsMatch = data.match(/^m:exams(?::([A-Za-z0-9_]+))?$/);
    if (examsMatch) {
      let courseCode = examsMatch[1];
      if (!courseCode) {
        const student = this.studentRepo.findByTelegramId(telegramUserId);
        if (student?.activeCourseId) {
          const c = this.academicRepo.findCourseById(student.activeCourseId);
          courseCode = c?.code;
        }
      }

      if (!courseCode) {
        await ctx.answerCallbackQuery({ text: 'يرجى اختيار مادة أولاً لعرض الامتحانات' });
        await this.handleCourses(ctx);
        return;
      }

      if (!this.bridge) return;

      const { text, events } = this.bridge.handleExamsView(ctx, courseCode);
      const eventButtons = events.map((e) => ({ id: e.id, title: e.title }));

      await safeEditMenu(ctx, {
        text,
        replyMarkup: createExamsKeyboard(courseCode, eventButtons),
        logger: this.logger,
      });
      return;
    }

    // --- 21. Exam Reminder Schedule: m:ex_rem:<eventId> ---
    const examRemMatch = data.match(/^m:ex_rem:(.+)$/);
    if (examRemMatch) {
      const eventId = examRemMatch[1]!;
      if (!this.bridge) return;

      const text = await this.bridge.handleScheduleExamReminder(ctx, eventId);
      await ctx.answerCallbackQuery({ text });
      return;
    }

    // --- 22. Practice Quiz Start: m:qz_start:<quizId> ---
    const quizStartMatch = data.match(/^m:qz_start:(.+)$/);
    if (quizStartMatch) {
      const quizId = quizStartMatch[1]!;
      if (!this.bridge) return;

      try {
        const { attempt, quiz } = this.bridge.handleStartQuiz(ctx, quizId);
        const session = this.getOrCreateSession(telegramUserId);
        session.activeQuizAttemptId = attempt.id;
        session.activeQuizId = quizId;
        session.activeQuizQuestionIndex = 0;
        session.quizAnswers = {};

        const repo = (
          this.bridge.getApp().exams as unknown as {
            repository?: { getQuestion: (id: string) => unknown };
          }
        ).repository;
        const question = repo?.getQuestion(quiz.questionIds[0]!) as QuizQuestion | undefined;

        if (question) {
          const text = renderQuizQuestionView(quiz, question, 0, quiz.questionIds.length);
          const choiceCount = question.type === 'MULTIPLE_CHOICE' ? question.options.length : 2;
          await safeEditMenu(ctx, {
            text,
            replyMarkup: createQuizQuestionKeyboard(
              quizId,
              0,
              quiz.questionIds.length,
              choiceCount,
            ),
            logger: this.logger,
          });
          return;
        }
      } catch (err: unknown) {
        this.logger.warn('Failed to start quiz attempt', { error: String(err) });
        await ctx.answerCallbackQuery({ text: 'تعذر بدء الكويز حالياً' });
      }
      return;
    }

    // --- 23. Quiz Answer Selection: m:qz_ans:<quizId>:<qIdx>:<choiceIdx> ---
    const quizAnsMatch = data.match(/^m:qz_ans:([^:]+):(\d+):(\d+)$/);
    if (quizAnsMatch) {
      const quizId = quizAnsMatch[1]!;
      const qIdx = parseInt(quizAnsMatch[2]!, 10);
      const choiceIdx = parseInt(quizAnsMatch[3]!, 10);

      const session = this.getOrCreateSession(telegramUserId);
      if (!this.bridge || session.activeQuizId !== quizId) {
        await ctx.answerCallbackQuery({ text: 'جلسة الكويز غير نشطة' });
        return;
      }

      const quiz = this.bridge.getApp().exams.getQuiz(quizId);
      const questionId = quiz.questionIds[qIdx];
      if (questionId) {
        const repo = (
          this.bridge.getApp().exams as unknown as {
            repository?: { getQuestion: (id: string) => unknown };
          }
        ).repository;
        const question = repo?.getQuestion(questionId) as
          | {
              type: 'MULTIPLE_CHOICE';
              options: Array<{ id: string; text: string }>;
            }
          | { type: 'TRUE_FALSE' }
          | undefined;

        session.quizAnswers = session.quizAnswers || {};
        if (question?.type === 'MULTIPLE_CHOICE' && question.options[choiceIdx]) {
          session.quizAnswers[questionId] = question.options[choiceIdx]!.id;
        } else if (question?.type === 'TRUE_FALSE') {
          session.quizAnswers[questionId] = choiceIdx === 0;
        } else {
          session.quizAnswers[questionId] = String(choiceIdx);
        }
      }

      await ctx.answerCallbackQuery({ text: `تم اختيار الإجابة (${choiceIdx + 1})` });
      return;
    }

    // --- 24. Quiz Submit: m:qz_sub:<quizId> ---
    const quizSubMatch = data.match(/^m:qz_sub:(.+)$/);
    if (quizSubMatch) {
      const quizId = quizSubMatch[1]!;
      const session = this.getOrCreateSession(telegramUserId);

      if (!this.bridge || !session.activeQuizAttemptId || session.activeQuizId !== quizId) {
        await ctx.answerCallbackQuery({ text: 'لا يوجد محاولة نشطة للتسليم' });
        return;
      }

      try {
        const { text } = this.bridge.handleSubmitQuiz(
          ctx,
          session.activeQuizAttemptId,
          session.quizAnswers || {},
        );
        session.activeQuizAttemptId = undefined;
        session.activeQuizId = undefined;

        await safeEditMenu(ctx, {
          text,
          replyMarkup: createMainMenuKeyboard(false),
          logger: this.logger,
        });
      } catch {
        // Idempotency: repeated submit safely handled
        await ctx.answerCallbackQuery({ text: 'تم تسليم الكويز مسبقاً!', show_alert: true });
      }
      return;
    }

    // --- 25. Admin Menu: m:admin:menu ---
    if (data === 'm:admin:menu') {
      await safeEditMenu(ctx, {
        text: renderAdminMenuView(),
        replyMarkup: createAdminMenuKeyboard(),
        logger: this.logger,
      });
      return;
    }

    // --- 26. Admin Add Material: m:admin:add:(LECTURER_NOTE|STUDENT_NOTE) ---
    const adminAddMatch = data.match(/^m:admin:add:(LECTURER_NOTE|STUDENT_NOTE)$/);
    if (adminAddMatch) {
      const materialType = adminAddMatch[1] as 'LECTURER_NOTE' | 'STUDENT_NOTE';
      const courses = this.academicRepo.listAllActiveCourses();
      await safeEditMenu(ctx, {
        text: renderAdminSelectCourseView(materialType),
        replyMarkup: createAdminCourseSelectKeyboard(materialType, courses),
        logger: this.logger,
      });
      return;
    }

    // --- 27. Admin Select Course: m:admin:sel:(LECTURER_NOTE|STUDENT_NOTE):([A-Za-z0-9_]+) ---
    const adminSelMatch = data.match(/^m:admin:sel:(LECTURER_NOTE|STUDENT_NOTE):([A-Za-z0-9_]+)$/);
    if (adminSelMatch) {
      const materialType = adminSelMatch[1] as 'LECTURER_NOTE' | 'STUDENT_NOTE';
      const courseCode = adminSelMatch[2]!;
      const session = this.getOrCreateSession(telegramUserId);
      session.awaitingAdminUpload = { materialType, courseCode };

      await safeEditMenu(ctx, {
        text: renderAdminAwaitingUploadView(materialType, courseCode),
        replyMarkup: createAdminMenuKeyboard(),
        logger: this.logger,
      });
      return;
    }

    // Fallback: unrecognized or malformed callback
    await ctx.answerCallbackQuery({ text: 'طلب غير معروف' });
  }
}
