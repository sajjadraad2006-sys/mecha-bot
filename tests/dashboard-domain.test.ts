import { describe, it, expect, beforeEach } from 'vitest';
import {
  AcademicCalendarPeriod,
  AcademicCalendarService,
  AcademicTopic,
  loadAcademicCoreDataset,
  Stage,
  ProgramSemester,
} from '@mecha-bot/academic';
import {
  StudyNavigatorService,
  InMemoryStudentCoursePositionRepository,
} from '@mecha-bot/navigator';
import { CompanionService, InMemoryCompanionRepository } from '@mecha-bot/companion';
import { ExamsService, InMemoryExamsRepository } from '@mecha-bot/exams';
import { TimetableService, type TimetableSlot } from '@mecha-bot/timetable';
import { ReminderSchedulerService } from '@mecha-bot/scheduler';
import { FakeClock } from '@mecha-bot/shared';
import {
  calculateCourseMastery,
  calculateAcademicProgress,
  DashboardService,
} from '@mecha-bot/dashboard';

describe('Milestone 13: Student Dashboard Domain & Metrics (@mecha-bot/dashboard)', () => {
  const dataset = loadAcademicCoreDataset();

  const sampleTopics: AcademicTopic[] = [
    {
      topicKey: 'top_1',
      courseCode: 'TEST101',
      titleEn: 'Topic 1',
      orderIndex: 0,
      nominalWeek: 2,
      status: 'CONFIRMED',
      evidenceRefs: [],
    },
    {
      topicKey: 'top_2',
      courseCode: 'TEST101',
      titleEn: 'Topic 2',
      orderIndex: 1,
      nominalWeek: 4,
      status: 'CONFIRMED',
      evidenceRefs: [],
    },
    {
      topicKey: 'top_3',
      courseCode: 'TEST101',
      titleEn: 'Topic 3',
      orderIndex: 2,
      nominalWeek: 6,
      status: 'CONFIRMED',
      evidenceRefs: [],
    },
    {
      topicKey: 'top_4',
      courseCode: 'TEST101',
      titleEn: 'Topic 4',
      orderIndex: 3,
      nominalWeek: 8,
      status: 'CONFIRMED',
      evidenceRefs: [],
    },
    {
      topicKey: 'top_5',
      courseCode: 'TEST101',
      titleEn: 'Topic 5',
      orderIndex: 4,
      nominalWeek: 10,
      status: 'CONFIRMED',
      evidenceRefs: [],
    },
  ];

  describe('Pure Metric Calculations', () => {
    it('calculates 0% confirmed and NEEDS_BASELINE when student has no confirmed position', () => {
      const mastery = calculateCourseMastery({
        courseCode: 'TEST101',
        courseTitle: 'تجربة',
        topics: sampleTopics,
        position: null,
        academicWeek: 4,
        isTeachingWeek: true,
      });

      expect(mastery.confirmedTopicsCount).toBe(0);
      expect(mastery.confirmedMasteryPercentage).toBe(0);
      expect(mastery.calendarExpectedTopicsCount).toBe(2);
      expect(mastery.calendarExpectedPercentage).toBe(40);
      expect(mastery.catchUpStatus).toBe('NEEDS_BASELINE');
      expect(mastery.catchUpGapCount).toBe(2);
    });

    it('calculates ON_TRACK when confirmed position matches expected calendar progress', () => {
      const mastery = calculateCourseMastery({
        courseCode: 'TEST101',
        courseTitle: 'تجربة',
        topics: sampleTopics,
        position: {
          id: 'pos_1',
          studentKey: 'stu_1',
          courseCode: 'TEST101',
          status: 'CONFIRMED_BY_STUDENT',
          source: 'STUDENT',
          lastUnderstoodTopicKey: 'top_2',
          updatedAt: '2026-10-01T00:00:00.000Z',
        },
        academicWeek: 4,
        isTeachingWeek: true,
      });

      expect(mastery.confirmedTopicsCount).toBe(2);
      expect(mastery.confirmedMasteryPercentage).toBe(40);
      expect(mastery.calendarExpectedTopicsCount).toBe(2);
      expect(mastery.calendarExpectedPercentage).toBe(40);
      expect(mastery.catchUpStatus).toBe('ON_TRACK');
      expect(mastery.catchUpGapCount).toBe(0);
    });

    it('calculates BEHIND with correct gap count when student is behind calendar', () => {
      const mastery = calculateCourseMastery({
        courseCode: 'TEST101',
        courseTitle: 'تجربة',
        topics: sampleTopics,
        position: {
          id: 'pos_1',
          studentKey: 'stu_1',
          courseCode: 'TEST101',
          status: 'CONFIRMED_BY_STUDENT',
          source: 'STUDENT',
          lastUnderstoodTopicKey: 'top_1',
          updatedAt: '2026-10-01T00:00:00.000Z',
        },
        academicWeek: 8,
        isTeachingWeek: true,
      });

      expect(mastery.confirmedTopicsCount).toBe(1);
      expect(mastery.confirmedMasteryPercentage).toBe(20);
      expect(mastery.calendarExpectedTopicsCount).toBe(4);
      expect(mastery.calendarExpectedPercentage).toBe(80);
      expect(mastery.catchUpStatus).toBe('BEHIND');
      expect(mastery.catchUpGapCount).toBe(3);
    });

    it('calculates AHEAD when student is ahead of the current calendar week', () => {
      const mastery = calculateCourseMastery({
        courseCode: 'TEST101',
        courseTitle: 'تجربة',
        topics: sampleTopics,
        position: {
          id: 'pos_1',
          studentKey: 'stu_1',
          courseCode: 'TEST101',
          status: 'CONFIRMED_BY_STUDENT',
          source: 'STUDENT',
          lastUnderstoodTopicKey: 'top_4',
          updatedAt: '2026-10-01T00:00:00.000Z',
        },
        academicWeek: 2,
        isTeachingWeek: true,
      });

      expect(mastery.confirmedTopicsCount).toBe(4);
      expect(mastery.confirmedMasteryPercentage).toBe(80);
      expect(mastery.calendarExpectedTopicsCount).toBe(1);
      expect(mastery.calendarExpectedPercentage).toBe(20);
      expect(mastery.catchUpStatus).toBe('AHEAD');
      expect(mastery.catchUpGapCount).toBe(0);
    });

    // Invariant 1: EXPECTED != CONFIRMED_BY_STUDENT
    it('strictly preserves Invariant 1: advancing calendar week does NOT increase confirmed mastery', () => {
      const position = {
        id: 'pos_1',
        studentKey: 'stu_1',
        courseCode: 'TEST101',
        status: 'CONFIRMED_BY_STUDENT' as const,
        source: 'STUDENT' as const,
        lastUnderstoodTopicKey: 'top_2',
        updatedAt: '2026-10-01T00:00:00.000Z',
      };

      const week3 = calculateCourseMastery({
        courseCode: 'TEST101',
        courseTitle: 'تجربة',
        topics: sampleTopics,
        position,
        academicWeek: 3,
        isTeachingWeek: true,
      });

      const week12 = calculateCourseMastery({
        courseCode: 'TEST101',
        courseTitle: 'تجربة',
        topics: sampleTopics,
        position,
        academicWeek: 12,
        isTeachingWeek: true,
      });

      expect(week3.confirmedMasteryPercentage).toBe(40);
      expect(week12.confirmedMasteryPercentage).toBe(40); // Did not increase!
      expect(week3.calendarExpectedPercentage).toBe(20);
      expect(week12.calendarExpectedPercentage).toBe(100);
      expect(week3.catchUpStatus).toBe('AHEAD');
      expect(week12.catchUpStatus).toBe('BEHIND');
    });

    // Invariant 2: INFERRED != CONFIRMED
    it('strictly preserves Invariant 2: non-student-confirmed status gives 0% confirmed mastery', () => {
      const mastery = calculateCourseMastery({
        courseCode: 'TEST101',
        courseTitle: 'تجربة',
        topics: sampleTopics,
        position: {
          id: 'pos_1',
          studentKey: 'stu_1',
          courseCode: 'TEST101',
          status: 'INFERRED', // Not CONFIRMED_BY_STUDENT
          source: 'COURSE_PULSE',
          lastUnderstoodTopicKey: 'top_3',
          updatedAt: '2026-10-01T00:00:00.000Z',
        },
        academicWeek: 6,
        isTeachingWeek: true,
      });

      expect(mastery.confirmedTopicsCount).toBe(0);
      expect(mastery.confirmedMasteryPercentage).toBe(0);
    });

    // Invariant 3: MCT124 CONFLICTING / UNRESOLVED
    it('strictly preserves Invariant 3: MCT124 surfaces conflict and null percentages', () => {
      const mastery = calculateCourseMastery({
        courseCode: 'MCT124',
        courseTitle: 'مادة تضارب',
        topics: sampleTopics,
        topicMapStatus: 'CONFLICTING',
        position: {
          id: 'pos_1',
          studentKey: 'stu_1',
          courseCode: 'MCT124',
          status: 'CONFIRMED_BY_STUDENT',
          source: 'STUDENT',
          lastUnderstoodTopicKey: 'top_2',
          updatedAt: '2026-10-01T00:00:00.000Z',
        },
        academicWeek: 6,
        isTeachingWeek: true,
      });

      expect(mastery.hasConflict).toBe(true);
      expect(mastery.confirmedMasteryPercentage).toBeNull();
      expect(mastery.calendarExpectedPercentage).toBeNull();
      expect(mastery.catchUpStatus).toBe('CONFLICTING');
      expect(mastery.confirmedTopicsCount).toBe(0);
    });

    // Invariant 4: P4MCT IDENTITY_ONLY
    it('strictly preserves Invariant 4: P4MCT surfaces identity-only and null percentages', () => {
      const mastery = calculateCourseMastery({
        courseCode: 'P4MCT',
        courseTitle: 'مشروع التخرج',
        topics: [],
        topicMapStatus: 'IDENTITY_ONLY',
        position: null,
        academicWeek: 6,
        isTeachingWeek: true,
      });

      expect(mastery.isIdentityOnly).toBe(true);
      expect(mastery.hasConflict).toBe(false);
      expect(mastery.confirmedMasteryPercentage).toBeNull();
      expect(mastery.calendarExpectedPercentage).toBeNull();
      expect(mastery.catchUpStatus).toBe('IDENTITY_ONLY');
    });

    // Overall Progress Aggregator
    it('aggregates overall progress excluding null-percentage anomaly courses', () => {
      const course1 = calculateCourseMastery({
        courseCode: 'TEST101',
        courseTitle: 'مادة 1',
        topics: sampleTopics, // 5 topics
        position: {
          id: 'pos_1',
          studentKey: 'stu_1',
          courseCode: 'TEST101',
          status: 'CONFIRMED_BY_STUDENT',
          source: 'STUDENT',
          lastUnderstoodTopicKey: 'top_5', // 5 of 5
          updatedAt: '2026-10-01T00:00:00.000Z',
        },
        academicWeek: 10,
        isTeachingWeek: true,
      });

      const course2 = calculateCourseMastery({
        courseCode: 'MCT124', // Conflicting course
        courseTitle: 'مادة تضارب',
        topics: sampleTopics,
        topicMapStatus: 'CONFLICTING',
        position: null,
        academicWeek: 10,
        isTeachingWeek: true,
      });

      const progress = calculateAcademicProgress({
        courses: [course1, course2],
        stage: 3 as Stage,
        programSemester: 5 as ProgramSemester,
        academicWeek: 10,
        isTeachingWeek: true,
      });

      expect(progress.coursesTrackedCount).toBe(2);
      expect(progress.overallConfirmedMasteryPercentage).toBe(100); // Only TEST101 counted
      expect(progress.overallCalendarExpectedPercentage).toBe(100);
      expect(progress.coursesNeedingCatchUpCount).toBe(0);
    });
  });

  describe('DashboardService Integration', () => {
    let navigatorRepo: InMemoryStudentCoursePositionRepository;
    let companionRepo: InMemoryCompanionRepository;
    let examsRepo: InMemoryExamsRepository;
    let clock: FakeClock;
    let calendarService: AcademicCalendarService;
    let navigatorService: StudyNavigatorService;
    let companionService: CompanionService;
    let examsService: ExamsService;
    let timetableService: TimetableService;
    let schedulerService: ReminderSchedulerService;
    let dashboardService: DashboardService;

    beforeEach(() => {
      clock = new FakeClock('2026-10-15T10:00:00.000Z'); // Thursday Week 4
      navigatorRepo = new InMemoryStudentCoursePositionRepository();
      companionRepo = new InMemoryCompanionRepository();
      examsRepo = new InMemoryExamsRepository();

      const teachingPeriod: AcademicCalendarPeriod = {
        id: 'cal_fall_2026',
        periodType: 'TEACHING',
        startsOn: '2026-09-20',
        endsOn: '2027-01-10',
        academicYearId: 'ay_2026_2027',
        stageScope: null,
        programSemester: 5 as ProgramSemester,
        nominalWeekCount: 15,
        evidenceMetadataJson: null,
        createdAt: '2026-09-01T00:00:00.000Z',
      };
      calendarService = new AcademicCalendarService([teachingPeriod]);

      navigatorService = new StudyNavigatorService({
        dataset,
        repository: navigatorRepo,
      });

      companionService = new CompanionService(companionRepo, { clock });
      examsService = new ExamsService(examsRepo, { clock });
      timetableService = new TimetableService({ clock });
      schedulerService = new ReminderSchedulerService({ clock });

      dashboardService = new DashboardService({
        academicDataset: dataset,
        calendarService,
        navigatorService,
        companionService,
        examsService,
        timetableService,
        schedulerService,
        clock,
      });
    });

    it('generates a full dashboard summary for a student', async () => {
      const studentKey = 'stu_dashboard_test';

      // 1. Setup student study streak
      companionService.startSession({
        studentKey,
        type: 'FOCUS',
        courseCode: 'MCT311',
      });

      // 2. Setup upcoming exam
      examsService.createEvent({
        courseCode: 'MCT311',
        title: 'امتحان الشهر الأول كهروميكانيك',
        type: 'MIDTERM',
        sourceStatus: 'OFFICIAL_SOURCE',
        confirmationStatus: 'CONFIRMED',
        occursAt: '2026-10-25T09:00:00.000Z',
      });

      // 3. Setup timetable slot for Thursday
      const slot: TimetableSlot = {
        id: 'slot_1',
        courseCode: 'MCT311',
        stage: 3,
        programSemester: 5,
        type: 'LECTURE',
        weekday: 'THURSDAY',
        startTime: '11:00',
        endTime: '13:00',
        room: 'قاعة 302',
        sourceStatus: 'VERIFIED',
      };
      timetableService.addSlot(slot);

      // 4. Setup reminder
      schedulerService.scheduleAfter({
        userKey: studentKey,
        kind: 'EXAM',
        title: 'مراجعة الكهروميكانيك',
        durationMinutes: 60,
      });

      // Execute dashboard query
      const summary = await dashboardService.getDashboard({
        studentKey,
        stage: 3 as Stage,
        programSemester: 5 as ProgramSemester,
      });

      expect(summary.studentKey).toBe(studentKey);
      expect(summary.academicProgress.stage).toBe(3);
      expect(summary.academicProgress.programSemester).toBe(5);
      expect(summary.academicProgress.academicWeek).toBeGreaterThan(0);
      expect(summary.courses.length).toBeGreaterThan(0);

      // Study Activity assertions
      expect(summary.studyActivity.hasActiveSession).toBe(true);
      expect(summary.studyActivity.activeSessionCourseCode).toBe('MCT311');

      // Upcoming Event assertions
      expect(summary.upcomingEvents.length).toBe(1);
      expect(summary.upcomingEvents[0]?.title).toBe('امتحان الشهر الأول كهروميكانيك');
      expect(summary.upcomingEvents[0]?.courseCode).toBe('MCT311');

      // Timetable assertions
      expect(summary.timetable.todayLectureCount).toBe(1);
      expect(summary.timetable.nextLecture).not.toBeNull();
      expect(summary.timetable.nextLecture?.courseCode).toBe('MCT311');
      expect(summary.timetable.nextLecture?.startTime).toBe('11:00');

      // Reminders assertions
      expect(summary.reminders.activePendingRemindersCount).toBe(1);
      expect(summary.reminders.nextReminder?.title).toBe('مراجعة الكهروميكانيك');
    });
  });
});
