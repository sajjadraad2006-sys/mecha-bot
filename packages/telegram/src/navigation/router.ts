import { Context } from 'grammy';
import { DatabaseConnection, StudentRepository, AcademicRepository } from '@mecha-bot/database';
import { AcademicCalendarService, Stage, ProgramSemester } from '@mecha-bot/academic';
import { Clock, Logger } from '@mecha-bot/shared';
import {
  createStageSelectionKeyboard,
  createSemesterSelectionKeyboard,
  createCourseSelectionKeyboard,
  createCourseHomeKeyboard,
  createReturningStudentKeyboard,
  createStudyPlaceholderKeyboard,
  createSettingsKeyboard,
} from './keyboards.js';
import {
  renderStageSelectionView,
  renderSemesterSelectionView,
  renderCourseSelectionView,
  renderCourseHomeView,
  renderReturningStudentView,
  renderStudyPlaceholderView,
  renderSettingsView,
} from './views.js';
import { safeEditMenu } from './helper.js';

export interface OnboardingRouterDeps {
  db: DatabaseConnection;
  clock: Clock;
  logger: Logger;
  calendarService?: AcademicCalendarService | undefined;
}

export class OnboardingRouter {
  private studentRepo: StudentRepository;
  private academicRepo: AcademicRepository;
  private clock: Clock;
  private logger: Logger;
  private calendarService?: AcademicCalendarService | undefined;

  constructor(deps: OnboardingRouterDeps) {
    this.studentRepo = new StudentRepository(deps.db);
    this.academicRepo = new AcademicRepository(deps.db);
    this.clock = deps.clock;
    this.logger = deps.logger;
    this.calendarService = deps.calendarService;
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
          replyMarkup: createReturningStudentKeyboard(),
          logger: this.logger,
        });
        return;
      }
    }

    // New student or incomplete onboarding
    await safeEditMenu(ctx, {
      text: renderStageSelectionView(),
      replyMarkup: createStageSelectionKeyboard(),
      logger: this.logger,
    });
  }

  /**
   * Dispatches all m1:* inline button callbacks.
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
      // Deterministically set stage and clear dependent semester & course
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

      // Validate semester corresponds to selected stage
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

      // Deterministically set semester and clear dependent active course
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

    // --- 3. Course Selection: m1:c:<courseCode> ---
    const courseMatch = data.match(/^m1:c:([A-Za-z0-9_]+)$/);
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

      // Resolve CourseOffering server-side using code + programSemester
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

      // Persist active course and offering
      this.studentRepo.updateActiveCourse(telegramUserId, offering.courseId, offering.id);

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

      // Check if calendar service has configured calendar period data
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
        replyMarkup: createStudyPlaceholderKeyboard(),
        logger: this.logger,
      });
      return;
    }

    // --- 5. Change Course: m1:chg:course ---
    if (data === 'm1:chg:course') {
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
      return;
    }

    // --- 6. Change Semester: m1:chg:sem ---
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

    // --- 9. Return to Main Menu: m1:menu ---
    if (data === 'm1:menu') {
      await this.handleStartOrMenu(ctx);
      return;
    }

    // Fallback: unrecognized or malformed callback
    await ctx.answerCallbackQuery({ text: 'طلب غير معروف' });
  }
}
