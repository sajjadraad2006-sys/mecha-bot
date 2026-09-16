import { formatToAcademicDate, SystemClock, type Clock } from '@mecha-bot/shared';
import type { AcademicCalendarService, AcademicCoreDataset } from '@mecha-bot/academic';
import type { StudyNavigatorService, StudentCoursePosition } from '@mecha-bot/navigator';
import type { CompanionService } from '@mecha-bot/companion';
import type { ExamsService } from '@mecha-bot/exams';
import type { TimetableService } from '@mecha-bot/timetable';
import type { ReminderSchedulerService } from '@mecha-bot/scheduler';
import { calculateAcademicProgress, calculateCourseMastery } from './metrics.js';
import type {
  CourseMasteryStatus,
  PendingReminderSummary,
  QuizPerformanceSummary,
  RemindersSummary,
  StudentDashboardCriteria,
  StudentDashboardSummary,
  StudyActivityMetrics,
  TimetableLectureSummary,
  TimetableSummary,
  UpcomingEventSummary,
} from './types.js';

export interface DashboardServiceConfig {
  academicDataset: AcademicCoreDataset;
  calendarService: AcademicCalendarService;
  navigatorService: StudyNavigatorService;
  companionService: CompanionService;
  examsService: ExamsService;
  timetableService?: TimetableService | undefined;
  schedulerService?: ReminderSchedulerService | undefined;
  clock?: Clock | undefined;
  timeZone?: string | undefined;
}

export class DashboardService {
  private readonly dataset: AcademicCoreDataset;
  private readonly calendarService: AcademicCalendarService;
  private readonly navigatorService: StudyNavigatorService;
  private readonly companionService: CompanionService;
  private readonly examsService: ExamsService;
  private readonly timetableService?: TimetableService | undefined;
  private readonly schedulerService?: ReminderSchedulerService | undefined;
  private readonly clock: Clock;
  private readonly timeZone: string;

  constructor(config: DashboardServiceConfig) {
    this.dataset = config.academicDataset;
    this.calendarService = config.calendarService;
    this.navigatorService = config.navigatorService;
    this.companionService = config.companionService;
    this.examsService = config.examsService;
    this.timetableService = config.timetableService;
    this.schedulerService = config.schedulerService;
    this.clock = config.clock ?? new SystemClock();
    this.timeZone = config.timeZone ?? 'Asia/Baghdad';
  }

  public async getDashboard(criteria: StudentDashboardCriteria): Promise<StudentDashboardSummary> {
    const referenceDate = criteria.referenceDate
      ? typeof criteria.referenceDate === 'string'
        ? new Date(criteria.referenceDate)
        : criteria.referenceDate
      : this.clock.now();

    const targetDateStr = formatToAcademicDate(referenceDate, this.timeZone);

    // 1. Derive Academic Week
    const weekStatus = this.calendarService.getAcademicWeek(
      criteria.stage,
      referenceDate,
      criteria.programSemester,
      this.timeZone,
    );

    // 2. Fetch Student Confirmed Positions
    const studentPositions = await this.navigatorService.getAllStudentPositions(
      criteria.studentKey,
    );
    const positionMap = new Map<string, StudentCoursePosition>();
    for (const pos of studentPositions) {
      positionMap.set(pos.courseCode.toUpperCase(), pos);
    }

    // 3. Collect Profiles for Stage & Semester
    const semesterProfiles = this.dataset.profiles.filter((p) => {
      if (p.stage !== criteria.stage) return false;
      if (p.programSemesters && p.programSemesters.length > 0) {
        return p.programSemesters.includes(criteria.programSemester);
      }
      return p.programSemester === criteria.programSemester;
    });

    // 4. Calculate Course Masteries
    const courseStatuses: CourseMasteryStatus[] = semesterProfiles.map((profile) => {
      const courseTopics =
        profile.topics && profile.topics.length > 0
          ? profile.topics
          : this.dataset.topics.filter(
              (t) => t.courseCode.toUpperCase() === profile.courseCode.toUpperCase(),
            );

      const pos = positionMap.get(profile.courseCode.toUpperCase()) ?? null;

      return calculateCourseMastery({
        courseCode: profile.courseCode,
        courseTitle: profile.displayNames?.ar || profile.displayNames?.en || profile.courseCode,
        topics: courseTopics,
        topicMapStatus: profile.topicMapStatus,
        position: pos,
        academicWeek: weekStatus.weekNumber,
        isTeachingWeek: weekStatus.isTeaching,
      });
    });

    // 5. Calculate Overall Academic Progress
    const academicProgress = calculateAcademicProgress({
      courses: courseStatuses,
      stage: criteria.stage,
      programSemester: criteria.programSemester,
      academicWeek: weekStatus.weekNumber,
      isTeachingWeek: weekStatus.isTeaching,
    });

    // 6. Aggregate Study Activity & Streaks
    const consistency = this.companionService.getStudyConsistency(criteria.studentKey);
    const activeSession = this.companionService.getActiveSession
      ? this.companionService.getActiveSession(criteria.studentKey)
      : null;

    const studyActivity: StudyActivityMetrics = {
      currentStudyDayStreak: consistency.currentStudyDayStreak,
      last7DaysSessionCount: consistency.daysStudiedLast7Days,
      last30DaysSessionCount: consistency.daysStudiedLast30Days,
      totalStudyMinutes: consistency.totalCompletedStudyMinutes,
      hasActiveSession: activeSession !== null,
      activeSessionCourseCode: activeSession?.courseCode,
    };

    // 7. Aggregate Upcoming Events / Exams
    const semesterCourseCodes = new Set(semesterProfiles.map((p) => p.courseCode.toUpperCase()));
    const allEvents = this.examsService.listEvents();
    const upcomingEvents: UpcomingEventSummary[] = allEvents
      .filter((event) => {
        const isCourseRelevant = semesterCourseCodes.has(event.courseCode.toUpperCase());
        const isStudentRelevant = !event.studentKey || event.studentKey === criteria.studentKey;
        if (!isCourseRelevant || !isStudentRelevant) return false;

        const eventDate = event.occursAt || event.dueAt;
        if (!eventDate) return false;
        const eventDateFormatted = formatToAcademicDate(new Date(eventDate), this.timeZone);
        return eventDateFormatted >= targetDateStr;
      })
      .sort((a, b) => {
        const dateA = a.occursAt || a.dueAt || '';
        const dateB = b.occursAt || b.dueAt || '';
        return dateA.localeCompare(dateB);
      })
      .slice(0, 5)
      .map((event) => {
        const dateStr = event.occursAt || event.dueAt || targetDateStr;
        const diffDays = Math.max(
          0,
          Math.ceil(
            (new Date(dateStr).getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24),
          ),
        );

        return {
          id: event.id,
          courseCode: event.courseCode,
          title: event.title,
          eventType: event.type,
          eventDate: dateStr,
          daysRemaining: diffDays,
        };
      });

    // 8. Aggregate Quiz Performance
    const attempts = this.examsService.listStudentAttempts(criteria.studentKey);
    const completedAttempts = attempts.filter((a) => a.status === 'SUBMITTED');
    const totalScore = completedAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0);
    const averageScorePercentage =
      completedAttempts.length > 0 ? Math.round(totalScore / completedAttempts.length) : 0;
    const distinctQuizzes = new Set(attempts.map((a) => a.quizId));

    const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

    const quizPerformance: QuizPerformanceSummary = {
      totalAttempts: attempts.length,
      averageScorePercentage,
      quizzesAttemptedCount: distinctQuizzes.size,
      lastAttemptDate: lastAttempt?.submittedAt || lastAttempt?.startedAt || null,
    };

    // 9. Aggregate Timetable
    let timetable: TimetableSummary = {
      todayLectureCount: 0,
      nextLecture: null,
    };

    if (this.timetableService) {
      const todaySlots = this.timetableService.getScheduleForDay({
        stage: criteria.stage,
        programSemester: criteria.programSemester,
        date: targetDateStr,
        section: criteria.section,
        subgroup: criteria.subgroup,
      });

      const nextClass = this.timetableService.getNextClass({
        stage: criteria.stage,
        programSemester: criteria.programSemester,
        section: criteria.section,
        subgroup: criteria.subgroup,
        from: referenceDate,
      });

      let nextLectureSummary: TimetableLectureSummary | null = null;
      if (nextClass && nextClass.slot) {
        const courseProf = this.dataset.profilesByCode.get(nextClass.slot.courseCode.toUpperCase());
        const name =
          courseProf?.displayNames?.ar || courseProf?.displayNames?.en || nextClass.slot.courseCode;

        nextLectureSummary = {
          courseCode: nextClass.slot.courseCode,
          subjectName: name,
          room: nextClass.slot.room || 'غير محدد',
          startTime: nextClass.slot.startTime,
          endTime: nextClass.slot.endTime,
        };
      }

      timetable = {
        todayLectureCount: todaySlots.length,
        nextLecture: nextLectureSummary,
      };
    }

    // 10. Aggregate Reminders
    let reminders: RemindersSummary = {
      activePendingRemindersCount: 0,
      nextReminder: null,
    };

    if (this.schedulerService) {
      const upcoming = this.schedulerService.getUpcomingReminders(criteria.studentKey, 10080); // 7 days
      let nextRemSummary: PendingReminderSummary | null = null;
      if (upcoming.length > 0) {
        const first = upcoming[0]!;
        nextRemSummary = {
          id: first.id,
          title: first.title,
          scheduledFor: first.dueAt,
        };
      }

      reminders = {
        activePendingRemindersCount: upcoming.length,
        nextReminder: nextRemSummary,
      };
    }

    return {
      studentKey: criteria.studentKey,
      generatedAt: this.clock.nowIso(),
      academicProgress,
      courses: courseStatuses,
      studyActivity,
      upcomingEvents,
      quizPerformance,
      timetable,
      reminders,
    };
  }
}
