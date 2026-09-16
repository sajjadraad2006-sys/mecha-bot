/**
 * Telegram Application Bridge
 *
 * Enforces the strict hexagonal adapter boundary:
 * Telegram user/chat/update
 *         ↓
 * application request (opaque studentKey)
 *         ↓
 * wiring/application layer (MechaBotApp)
 *         ↓
 * domain operation
 *         ↓
 * application response
 *         ↓
 * Telegram rendering
 *
 * RULES:
 * - NO grammY types or Telegram IDs cross into MechaBotApp or domain packages.
 * - Converts ctx.from.id -> opaque studentKey via StudentRepository.
 * - Renders localized Arabic responses.
 */

import type { Context } from 'grammy';
import type { StudentProfile, StudentRepository } from '@mecha-bot/database';
import type {
  MechaBotApp,
  WhereAreWeAppResponse,
  ImLostAppResponse,
  SearchAndDeliverResponse,
  StudentDashboardSummary,
} from '@mecha-bot/wiring';
import type { Stage, ProgramSemester } from '@mecha-bot/academic';
import type { TimetableSlot } from '@mecha-bot/timetable';
import type { AcademicEvent, PracticeQuiz, QuizAttempt, QuizAnswers } from '@mecha-bot/exams';
import type { DeliveryDecision } from '@mecha-bot/distribution';
import {
  renderWhereAreWeView,
  renderImLostView,
  renderSearchResultsView,
  renderDeliveryResultView,
  renderTimetableView,
  renderRemindersView,
  renderExamsView,
  renderQuizResultView,
  renderAiExplanationView,
  renderStudentDashboardView,
} from './navigation/views.js';
import type { AiBrainResponse } from '@mecha-bot/wiring';

export interface TelegramAppBridgeDeps {
  app: MechaBotApp;
  studentRepo: StudentRepository;
}

export class TelegramAppBridge {
  private app: MechaBotApp;
  private studentRepo: StudentRepository;

  constructor(deps: TelegramAppBridgeDeps) {
    this.app = deps.app;
    this.studentRepo = deps.studentRepo;
  }

  /**
   * Access the underlying MechaBotApp instance.
   */
  public getApp(): MechaBotApp {
    return this.app;
  }

  /**
   * Access the student repository instance.
   */
  public getStudentRepo(): StudentRepository {
    return this.studentRepo;
  }

  /**
   * Resolves an opaque application studentKey from the Telegram Context.
   * Isolates the Telegram user ID at the boundary.
   */
  public resolveStudentKey(ctx: Context): string {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) {
      throw new Error('Telegram context missing user identifier (ctx.from.id).');
    }

    const studentProfile = this.studentRepo.findOrCreate(telegramUserId);
    return studentProfile.id;
  }

  /**
   * Resolves the student profile from the database.
   */
  public getStudentProfile(ctx: Context): StudentProfile | null {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) return null;
    return this.studentRepo.findByTelegramId(telegramUserId);
  }

  /**
   * Retrieves raw WhereAreWe DTO from application wiring.
   */
  public async getWhereAreWeData(
    ctx: Context,
    courseCode: string,
    referenceDate?: string,
  ): Promise<WhereAreWeAppResponse> {
    const studentKey = this.resolveStudentKey(ctx);
    return this.app.whereAreWe(studentKey, courseCode, referenceDate);
  }

  /**
   * Handles "وين وصلنا؟" command and returns localized Iraqi Arabic view text.
   */
  public async handleWhereAreWe(
    ctx: Context,
    courseCode: string,
    referenceDate?: string,
  ): Promise<string> {
    const response = await this.getWhereAreWeData(ctx, courseCode, referenceDate);
    const profile = this.app.dataset.profilesByCode.get(courseCode.trim().toUpperCase());
    return renderWhereAreWeView(response, profile?.displayNames?.ar);
  }

  /**
   * Retrieves raw ImLost diagnosis DTO from application wiring.
   */
  public async getImLostData(
    ctx: Context,
    courseCode: string,
    targetTopicKey?: string,
  ): Promise<ImLostAppResponse> {
    const studentKey = this.resolveStudentKey(ctx);
    return this.app.imLost(studentKey, courseCode, targetTopicKey);
  }

  /**
   * Handles "أني ضايع" diagnosis command and returns localized view text.
   */
  public async handleImLost(
    ctx: Context,
    courseCode: string,
    targetTopicKey?: string,
  ): Promise<string> {
    const diagnosis = await this.getImLostData(ctx, courseCode, targetTopicKey);
    const profile = this.app.dataset.profilesByCode.get(courseCode.trim().toUpperCase());
    return renderImLostView(diagnosis, profile?.displayNames?.ar);
  }

  /**
   * Confirms the student's study position explicitly.
   * Enforces the invariant: only explicit student interaction sets CONFIRMED_BY_STUDENT.
   */
  public async handleConfirmPosition(
    ctx: Context,
    courseCode: string,
    topicKey: string,
    confidence?: number,
  ): Promise<string> {
    const studentKey = this.resolveStudentKey(ctx);
    await this.app.confirmPosition({
      studentKey,
      courseCode,
      topicKey,
      confidence,
    });

    return `✅ تم تأكيد موضعك الدراسي في مادة (${courseCode}) عند الموضوع (${topicKey}) بنجاح!`;
  }

  /**
   * Retrieves raw search & delivery DTO from application wiring.
   */
  public async getSearchData(
    ctx: Context,
    queryText: string,
    courseCode?: string,
  ): Promise<SearchAndDeliverResponse> {
    const studentKey = this.resolveStudentKey(ctx);
    return this.app.search(
      studentKey,
      { text: queryText, courseCode },
      true, // auto-resolve delivery policy
    );
  }

  /**
   * Handles search and delivery query and returns localized view text.
   */
  public async handleSearch(ctx: Context, queryText: string, courseCode?: string): Promise<string> {
    const searchResult = await this.getSearchData(ctx, queryText, courseCode);
    return renderSearchResultsView(searchResult, queryText);
  }

  /**
   * Requests file delivery from distribution service adhering to M12 policy.
   */
  public async handleRequestDelivery(
    ctx: Context,
    fileRecordId: string,
  ): Promise<{ text: string; decision: DeliveryDecision }> {
    const studentKey = this.resolveStudentKey(ctx);
    const decision = await this.app.requestDelivery(studentKey, fileRecordId);
    const text = renderDeliveryResultView(decision);
    return { text, decision };
  }

  /**
   * Retrieves student schedule for day/date via M3 timetable service.
   */
  public handleTimetable(
    ctx: Context,
    stage: Stage,
    programSemester: ProgramSemester,
    dateStr?: string,
  ): { text: string; slots: TimetableSlot[] } {
    const studentKey = this.resolveStudentKey(ctx);
    const slots = this.app.getSchedule({
      studentKey,
      stage,
      programSemester,
      date: dateStr,
    });
    const text = renderTimetableView(slots, stage, programSemester, dateStr);
    return { text, slots };
  }

  /**
   * Schedules reminders for student's lectures via timetable-to-scheduler bridge.
   */
  public async handleScheduleLectureReminders(
    ctx: Context,
    stage: Stage,
    programSemester: ProgramSemester,
    dateStr?: string,
  ): Promise<string> {
    const studentKey = this.resolveStudentKey(ctx);
    const result = await this.app.scheduleLectureReminders({
      studentKey,
      stage,
      programSemester,
      date: dateStr,
    });
    if (result.scheduledCount > 0) {
      return `✅ تم جدولة (${result.scheduledCount}) تذكير للمحاضرات القادمة بنجاح!`;
    }
    return 'ℹ️ لم يتم العثور على محاضرات جديدة بحاجة لجدولة تذكير.';
  }

  /**
   * Retrieves upcoming reminders from M4 scheduler in Baghdad timezone.
   */
  public handleRemindersView(ctx: Context, windowMinutes = 1440): string {
    const studentKey = this.resolveStudentKey(ctx);
    const reminders = this.app.scheduler.getUpcomingReminders(studentKey, windowMinutes);
    return renderRemindersView(reminders);
  }

  /**
   * Retrieves upcoming exams and overview for a course via M10 exams service.
   */
  public handleExamsView(
    ctx: Context,
    courseCode: string,
  ): {
    text: string;
    events: AcademicEvent[];
  } {
    this.resolveStudentKey(ctx);
    const code = courseCode.trim().toUpperCase();
    const events = this.app.exams.listEvents(code);
    const profile = this.app.dataset.profilesByCode.get(code);
    const nameAr = profile?.displayNames?.ar || code;
    const text = renderExamsView(code, nameAr, events, 0);
    return { text, events };
  }

  /**
   * Schedules academic event reminder for an exam or assessment.
   */
  public async handleScheduleExamReminder(ctx: Context, eventId: string): Promise<string> {
    const studentKey = this.resolveStudentKey(ctx);
    const result = await this.app.scheduleAcademicEventReminders(studentKey, eventId);
    if (result.scheduledCount > 0) {
      return '✅ تم تفعيل التذكير بالامتحان بنجاح!';
    }
    return result.reason || 'تعذر جدولة التذكير.';
  }

  /**
   * Starts a practice quiz attempt via M10 exams service.
   */
  public handleStartQuiz(
    ctx: Context,
    quizId: string,
  ): { attempt: QuizAttempt; quiz: PracticeQuiz } {
    const studentKey = this.resolveStudentKey(ctx);
    const quiz = this.app.exams.getQuiz(quizId);
    const attempt = this.app.exams.startAttempt(quizId, studentKey);
    return { attempt, quiz };
  }

  /**
   * Submits a practice quiz attempt and renders deterministic score.
   */
  public handleSubmitQuiz(
    ctx: Context,
    attemptId: string,
    answers: QuizAnswers,
  ): { text: string; attempt: QuizAttempt } {
    this.resolveStudentKey(ctx);
    const attempt = this.app.exams.submitAttempt(attemptId, answers);
    const quiz = this.app.exams.getQuiz(attempt.quizId);
    const text = renderQuizResultView(attempt, quiz.title);
    return { text, attempt };
  }

  /**
   * Handles student natural language academic queries via AI Brain.
   * Isolates Telegram user identity; maps ctx.from.id to opaque studentKey.
   */
  public async handleAiQuery(
    ctx: Context,
    queryText: string,
    activeCourseCode?: string,
  ): Promise<{ text: string; response: AiBrainResponse }> {
    const studentKey = this.resolveStudentKey(ctx);
    const profile = this.getStudentProfile(ctx);

    let courseCode = activeCourseCode;
    if (!courseCode && profile?.activeCourseId) {
      const course =
        this.app.dataset.profilesByCode.get(profile.activeCourseId) ||
        this.app.dataset.profiles.find((p) => p.courseCode === profile.activeCourseId);
      if (course) {
        courseCode = course.courseCode;
      }
    }

    const response = await this.app.askAi({
      studentKey,
      question: queryText,
      activeCourseCode: courseCode,
      stage: profile?.stage ?? undefined,
      programSemester: profile?.programSemester ?? undefined,
    });

    const courseProfile = response.courseCode
      ? this.app.dataset.profilesByCode.get(response.courseCode)
      : undefined;

    const text = renderAiExplanationView(response, courseProfile?.displayNames?.ar);

    return { text, response };
  }

  /**
   * Retrieves raw StudentDashboardSummary DTO from application wiring.
   */
  public async getDashboardData(
    ctx: Context,
    referenceDate?: string | Date,
  ): Promise<StudentDashboardSummary> {
    const studentKey = this.resolveStudentKey(ctx);
    const profile = this.getStudentProfile(ctx);
    const stage = (profile?.stage ?? 1) as Stage;
    const programSemester = (profile?.programSemester ?? 1) as ProgramSemester;

    return this.app.getStudentDashboard({
      studentKey,
      stage,
      programSemester,
      referenceDate,
    });
  }

  /**
   * Handles /dashboard command and returns rendered view + DTO.
   */
  public async handleDashboardView(
    ctx: Context,
    referenceDate?: string | Date,
  ): Promise<{ text: string; summary: StudentDashboardSummary }> {
    const summary = await this.getDashboardData(ctx, referenceDate);
    const studentName = ctx.from?.first_name;
    const text = renderStudentDashboardView(
      summary,
      studentName !== undefined ? { studentName } : undefined,
    );
    return { text, summary };
  }
}
