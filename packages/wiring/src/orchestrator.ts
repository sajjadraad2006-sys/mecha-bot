/**
 * MechaBotApp: Application Orchestration Layer (@mecha-bot/wiring)
 *
 * Orchestrates cross-domain use-cases between verified domain services
 * without owning domain truth or violating package boundaries.
 *
 * BOUNDARY RULES:
 * - Operates strictly on application-level student references (studentKey: string).
 * - Never imports Telegram or GrammY types.
 * - Enforces the non-negotiable product principle:
 *   "infer -> suggest -> confirm, never silently assume."
 * - MCT124 conflict and P4MCT identity-only states are explicitly surfaced.
 */

import { AcademicCalendarService, type AcademicCoreDataset } from '@mecha-bot/academic';
import { DashboardService, type StudentDashboardSummary } from '@mecha-bot/dashboard';
import type { TimetableService, TimetableSlot } from '@mecha-bot/timetable';
import type { ReminderSchedulerService } from '@mecha-bot/scheduler';
import type { CompanionService } from '@mecha-bot/companion';
import type { SearchEngine, SearchQuery } from '@mecha-bot/search';
import type {
  CoursePulsePosition,
  StudentCoursePosition,
  StudyNavigatorService,
} from '@mecha-bot/navigator';
import type { ExamsService } from '@mecha-bot/exams';
import type {
  AdminService,
  DecideReviewParams,
  ReviewItem,
  SubmitReviewParams,
} from '@mecha-bot/admin';
import type { DeliveryDecision, FileDistributionService } from '@mecha-bot/distribution';

import type {
  AcademicEventRemindersResult,
  AdminReviewDecisionResult,
  ConfirmPositionInput,
  ImLostAppResponse,
  LectureRemindersResult,
  SearchAndDeliverResponse,
  StudentScheduleRequest,
  TimetableReminderOptions,
  WhereAreWeAppResponse,
} from './types.js';
import { confirmStudentCoursePosition } from './bridges/companion-to-navigator.js';
import { resolveSearchHitsDelivery } from './bridges/search-to-distribution.js';
import { scheduleLectureRemindersFromTimetable } from './bridges/timetable-to-scheduler.js';
import { scheduleRemindersForAcademicEvent } from './bridges/exams-to-scheduler.js';
import {
  type AcademicEvidenceMetadata,
  executeAdminReviewDecisionSafely,
} from './bridges/admin-to-academic.js';
import type { AiBrainService, AiBrainResponse } from '@mecha-bot/ai';
import type { AskAiInput, StudentDashboardRequest } from './types.js';

export interface MechaBotAppDependencies {
  academicDataset: AcademicCoreDataset;
  navigatorService: StudyNavigatorService;
  companionService: CompanionService;
  timetableService: TimetableService;
  schedulerService: ReminderSchedulerService;
  searchEngine: SearchEngine;
  distributionService: FileDistributionService;
  examsService: ExamsService;
  adminService: AdminService;
  aiBrainService?: AiBrainService | undefined;
  calendarService?: AcademicCalendarService | undefined;
  dashboardService?: DashboardService | undefined;
}

export class MechaBotApp {
  public readonly dataset: AcademicCoreDataset;
  public readonly navigator: StudyNavigatorService;
  public readonly companion: CompanionService;
  public readonly timetable: TimetableService;
  public readonly scheduler: ReminderSchedulerService;
  public readonly searchEngine: SearchEngine;
  public readonly distribution: FileDistributionService;
  public readonly exams: ExamsService;
  public readonly admin: AdminService;
  public readonly aiBrain?: AiBrainService | undefined;
  public readonly calendar?: AcademicCalendarService | undefined;
  public readonly dashboard: DashboardService;

  constructor(deps: MechaBotAppDependencies) {
    this.dataset = deps.academicDataset;
    this.navigator = deps.navigatorService;
    this.companion = deps.companionService;
    this.timetable = deps.timetableService;
    this.scheduler = deps.schedulerService;
    this.searchEngine = deps.searchEngine;
    this.distribution = deps.distributionService;
    this.exams = deps.examsService;
    this.admin = deps.adminService;
    this.aiBrain = deps.aiBrainService;
    this.calendar = deps.calendarService;
    this.dashboard =
      deps.dashboardService ??
      new DashboardService({
        academicDataset: this.dataset,
        calendarService: this.calendar ?? new AcademicCalendarService([]),
        navigatorService: this.navigator,
        companionService: this.companion,
        examsService: this.exams,
        timetableService: this.timetable,
        schedulerService: this.scheduler,
      });
  }

  /**
   * "وين وصلنا؟" (Where are we?)
   * Unified progress evaluation preserving 3 separate truths and academic safety.
   */
  public async whereAreWe(
    studentKey: string,
    courseCode: string,
    referenceDate?: string,
    coursePulseInput?: CoursePulsePosition,
  ): Promise<WhereAreWeAppResponse> {
    const code = courseCode.trim().toUpperCase();

    // 1. Check for explicit curriculum conflicts (e.g. MCT124)
    const conflict = this.dataset.conflicts.find((c) => c.courseCode === code);
    if (conflict && conflict.status === 'CONFLICTING') {
      return {
        courseCode: code,
        hasConflict: true,
        conflictDetails: {
          status: conflict.status,
          resolutionStatus: conflict.resolutionStatus,
          description: conflict.fact ?? conflict.notes ?? 'Conflict in curriculum dataset',
        },
        hasTopics: false,
        needsStudentConfirmation: false,
        confirmationPromptKey: 'COURSE_CONFLICT_REQUIRES_CLARIFICATION',
        notes: [
          `المقرر ${code} يعاني من تضارب منهجي (${conflict.resolutionStatus}). يرجى التأكد من المصدر الأكاديمي.`,
        ],
      };
    }

    // 2. Check topic map status (e.g. P4MCT IDENTITY_ONLY)
    const profile = this.dataset.profilesByCode.get(code);
    const hasTopics = Boolean(profile && profile.topics.length > 0);
    const topicMapStatus = profile?.topicMapStatus;

    if (topicMapStatus === 'IDENTITY_ONLY' || !hasTopics) {
      return {
        courseCode: code,
        hasConflict: false,
        hasTopics: false,
        topicMapStatus: topicMapStatus ?? 'EMPTY',
        needsStudentConfirmation: false,
        confirmationPromptKey: 'IDENTITY_ONLY_NO_TOPICS',
        notes: [`المقرر ${code} مسجل كمعرف فقط (IDENTITY_ONLY) ولا يحتوي على شجرة مواضيع مفصلة.`],
      };
    }

    // Check course pulse from input or companion signals
    let coursePulse = coursePulseInput;
    if (!coursePulse) {
      try {
        const repo = (
          this.companion as unknown as { repository?: { progressSignals?: Map<string, unknown> } }
        ).repository;
        if (repo?.progressSignals) {
          const signals = [...repo.progressSignals.values()] as Array<{
            courseCode: string;
            topicKey?: string;
            occurredAt: string;
            selfReportedConfidence?: number;
          }>;
          const matching = signals.filter((s) => s.courseCode === code && s.topicKey);
          if (matching.length > 0) {
            const latest = matching.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0]!;
            coursePulse = {
              courseCode: code,
              topicKey: latest.topicKey,
              status: 'INFERRED',
              source: 'COURSE_PULSE',
              updatedAt: latest.occurredAt,
            };
          }
        }
      } catch {
        // Fallback
      }
    }

    // 3. Multi-truth snapshot from navigator
    const localDate = referenceDate || new Date().toISOString().slice(0, 10);
    const snapshot = await this.navigator.getCourseSnapshot({
      studentKey,
      courseCode: code,
      calendarPosition: {
        localDate,
        status: 'EXPECTED',
      },
      coursePulse,
    });

    // 4. Progress evaluation
    const progressResult = this.navigator.whereAreWe({
      courseCode: code,
      calendarPosition: snapshot.calendarPosition,
      coursePulse: snapshot.coursePulse,
    });

    let suggestedTopicKey = progressResult.suggestedTopicKey;
    let suggestedTopicTitleEn = progressResult.suggestedTopicTitleEn;
    let suggestedTopicTitleAr = progressResult.suggestedTopicTitleAr;

    if (!suggestedTopicKey && profile?.topics && profile.topics.length > 0) {
      const firstTopic = profile.topics[0]!;
      suggestedTopicKey = firstTopic.topicKey;
      suggestedTopicTitleEn = firstTopic.titleEn;
      suggestedTopicTitleAr = firstTopic.titleAr;
    }

    return {
      courseCode: code,
      hasConflict: false,
      hasTopics: true,
      topicMapStatus: profile?.topicMapStatus,
      calendarPosition: snapshot.calendarPosition,
      coursePulse: snapshot.coursePulse,
      studentPosition: snapshot.studentPosition,
      suggestedTopicKey,
      suggestedTopicTitleEn,
      suggestedTopicTitleAr,
      needsStudentConfirmation: true, // Always requires student confirmation
      confirmationPromptKey: progressResult.confirmationPromptKey,
      notes: progressResult.notes,
    };
  }

  /**
   * "أني ضايع" (I'm lost / Diagnosis Engine)
   */
  public async imLost(
    studentKey: string,
    courseCode: string,
    targetTopicKey?: string,
  ): Promise<ImLostAppResponse> {
    const code = courseCode.trim().toUpperCase();

    // Check conflict
    const conflict = this.dataset.conflicts.find((c) => c.courseCode === code);
    if (conflict && conflict.status === 'CONFLICTING') {
      return {
        courseCode: code,
        status: 'ACADEMIC_DATA_CONFLICT',
        missingPrerequisites: [],
        explanationNote: `تعذر تشخيص المقرر ${code} لوجود تضارب منهجي غير محلول.`,
        needsStudentConfirmation: false,
      };
    }

    // Check identity-only
    const profile = this.dataset.profilesByCode.get(code);
    if (profile?.topicMapStatus === 'IDENTITY_ONLY') {
      return {
        courseCode: code,
        status: 'INSUFFICIENT_ACADEMIC_MAP',
        missingPrerequisites: [],
        explanationNote: `المقرر ${code} لا يملك مواضيع دراسية مفصلة لتوليد خطة استدراك.`,
        needsStudentConfirmation: false,
      };
    }

    // Fetch existing student position
    const studentPos = await this.navigator.getStudentPosition(studentKey, code);

    const diagnosis = this.navigator.diagnose({
      studentKey,
      courseQuery: code,
      targetTopicKey,
      lastUnderstoodTopicKey: studentPos?.lastUnderstoodTopicKey,
    });

    return {
      courseCode: diagnosis.courseCode,
      status: diagnosis.status,
      targetTopicKey: diagnosis.targetTopicKey,
      lastUnderstoodTopicKey: diagnosis.lastUnderstoodTopicKey,
      missingPrerequisites: diagnosis.missingPrerequisites,
      explanationNote: diagnosis.explanationNote,
      catchUpPlan: diagnosis.catchUpPlan,
      needsStudentConfirmation: diagnosis.needsStudentConfirmation,
      candidateCourseCodes: diagnosis.candidateCourseCodes,
    };
  }

  /**
   * Confirms a student's self-reported position.
   */
  public async confirmPosition(input: ConfirmPositionInput): Promise<StudentCoursePosition> {
    return confirmStudentCoursePosition(this.navigator, input);
  }

  /**
   * Academic search with optional delivery policy resolution.
   */
  public async search(
    studentKey: string,
    query: SearchQuery,
    autoResolveDelivery = true,
  ): Promise<SearchAndDeliverResponse> {
    const searchResp = this.searchEngine.search(query);

    if (!autoResolveDelivery || searchResp.results.length === 0) {
      return {
        totalMatches: searchResp.totalMatches,
        hits: searchResp.results.map((result) => ({ searchResult: result })),
        diagnosticReason: searchResp.diagnosticReason,
      };
    }

    const hits = await resolveSearchHitsDelivery(this.distribution, searchResp.results, studentKey);

    return {
      totalMatches: searchResp.totalMatches,
      hits,
      diagnosticReason: searchResp.diagnosticReason,
    };
  }

  /**
   * Requests delivery for a specific catalog file.
   */
  public async requestDelivery(
    studentKey: string,
    fileRecordId: string,
  ): Promise<DeliveryDecision> {
    return this.distribution.requestFileDelivery({
      fileRecordId,
      requesterStudentKey: studentKey,
    });
  }

  /**
   * Retrieves timetable schedule for a student date.
   */
  public getSchedule(request: StudentScheduleRequest): TimetableSlot[] {
    if (request.stage !== undefined && request.programSemester !== undefined) {
      return this.timetable.getScheduleForStudentDate({
        stage: request.stage,
        programSemester: request.programSemester,
        date: request.date,
        section: request.section,
        subgroup: request.subgroup,
      });
    }

    return this.timetable.getScheduleForDay({
      stage: request.stage,
      programSemester: request.programSemester,
      date: request.date,
      section: request.section,
      subgroup: request.subgroup,
    });
  }

  /**
   * Schedules reminders for upcoming timetable lectures.
   */
  public async scheduleLectureReminders(
    request: StudentScheduleRequest,
    options?: TimetableReminderOptions,
  ): Promise<LectureRemindersResult> {
    return scheduleLectureRemindersFromTimetable(this.timetable, this.scheduler, {
      request,
      options,
    });
  }

  /**
   * Schedules reminders for an academic exam or event.
   */
  public async scheduleAcademicEventReminders(
    studentKey: string,
    eventId: string,
    options?: { offsetMinutesList?: number[] },
  ): Promise<AcademicEventRemindersResult> {
    const event = this.exams.getEvent(eventId);
    if (!event) {
      return {
        scheduledCount: 0,
        reminders: [],
        requiresStudentConfirmation: false,
        reason: `Academic event with ID '${eventId}' was not found.`,
      };
    }

    return scheduleRemindersForAcademicEvent(this.scheduler, {
      userKey: studentKey,
      event,
      offsetMinutesList: options?.offsetMinutesList,
    });
  }

  /**
   * Submits an item for administrative review.
   */
  public async submitForReview(callerKey: string, params: SubmitReviewParams): Promise<ReviewItem> {
    return this.admin.submitForReview(callerKey, params);
  }

  /**
   * Administrative review decision with semantic safety.
   */
  public async decideReviewItem(
    callerKey: string,
    params: DecideReviewParams,
    academicEvidence?: {
      original: AcademicEvidenceMetadata;
      targetCandidate?: AcademicEvidenceMetadata | undefined;
    },
  ): Promise<AdminReviewDecisionResult> {
    return executeAdminReviewDecisionSafely(this.admin, callerKey, params, academicEvidence);
  }

  /**
   * "اسأل المخ الذكي" (Ask AI Brain)
   * Orchestrates academic synthesis without mutating domain truth or violating invariants.
   * Student progress is NEVER confirmed or updated by AI answers.
   */
  public async askAi(input: AskAiInput): Promise<AiBrainResponse> {
    if (!this.aiBrain) {
      return {
        intent: 'GENERAL',
        courseCode: input.activeCourseCode ?? null,
        topic: input.activeTopicKey ?? null,
        answer: 'خدمة المساعد الذكي غير مفعلة حالياً في النظام.',
        equations: [],
        citations: [],
        confidence: 'LOW',
        assumptions: [],
        needsClarification: false,
        usedFallback: true,
      };
    }

    return this.aiBrain.answerQuestion({
      studentKey: input.studentKey,
      question: input.question,
      activeCourseCode: input.activeCourseCode,
      activeTopicKey: input.activeTopicKey,
      stage: input.stage,
      programSemester: input.programSemester,
    });
  }

  /**
   * "لوحة تحكم الطالب" (Student Dashboard)
   * Aggregates academic progress, timetable, exams, reminders, and streaks deterministically.
   */
  public async getStudentDashboard(
    request: StudentDashboardRequest,
  ): Promise<StudentDashboardSummary> {
    return this.dashboard.getDashboard(request);
  }
}
