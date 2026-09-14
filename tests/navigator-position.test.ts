import { describe, it, expect, beforeEach } from 'vitest';
import {
  CalendarPosition,
  CoursePulsePosition,
  StudentCoursePosition,
  createOrUpdateStudentPosition,
  buildCoursePositionSnapshot,
  InMemoryStudentCoursePositionRepository,
  CalendarPositionSchema,
  CoursePulsePositionSchema,
  StudentCoursePositionSchema,
  StudentLearningSignalSchema,
  StudyNavigatorService,
} from '@mecha-bot/navigator';
import { AcademicCoreDataset } from '@mecha-bot/academic';

describe('Milestone M9A — Navigator Position Suite', () => {
  let repository: InMemoryStudentCoursePositionRepository;

  beforeEach(() => {
    repository = new InMemoryStudentCoursePositionRepository();
  });

  describe('1. The Three Separate Truths', () => {
    it('models Truth 1: Academic Calendar Position (EXPECTED only)', () => {
      const calendarPos: CalendarPosition = {
        academicWeek: 6,
        period: 'TEACHING',
        localDate: '2026-10-20',
        status: 'EXPECTED',
      };

      const parsed = CalendarPositionSchema.safeParse(calendarPos);
      expect(parsed.success).toBe(true);
      expect(calendarPos.status).toBe('EXPECTED');
      expect(calendarPos.academicWeek).toBe(6);
    });

    it('rejects invalid Academic Calendar Position status', () => {
      const invalidPos = {
        academicWeek: 6,
        localDate: '2026-10-20',
        status: 'CONFIRMED_BY_STUDENT', // Invalid: calendar can never be confirmed by student
      };

      const parsed = CalendarPositionSchema.safeParse(invalidPos);
      expect(parsed.success).toBe(false);
    });

    it('models Truth 2: Course Pulse Position (VERIFIED or INFERRED)', () => {
      const verifiedPulse: CoursePulsePosition = {
        courseCode: 'MCT314',
        topicKey: 'mct314-root-locus',
        status: 'VERIFIED',
        source: 'COURSE_EDITOR',
        scope: 'GLOBAL',
        updatedAt: '2026-10-20T10:00:00.000Z',
      };

      const inferredPulse: CoursePulsePosition = {
        courseCode: 'MCT314',
        freeTextTopic: 'Bode Plots',
        status: 'INFERRED',
        source: 'SYSTEM_INFERENCE',
        scope: 'SECTION',
        sectionKey: 'A',
        updatedAt: '2026-10-20T11:00:00.000Z',
      };

      expect(CoursePulsePositionSchema.safeParse(verifiedPulse).success).toBe(true);
      expect(CoursePulsePositionSchema.safeParse(inferredPulse).success).toBe(true);
    });

    it('models Truth 3: Student Course Position (CONFIRMED_BY_STUDENT)', () => {
      const studentPos: StudentCoursePosition = {
        id: 'pos_101_mct314',
        studentKey: 'student_101',
        courseCode: 'MCT314',
        lastUnderstoodTopicKey: 'mct314-transfer-function-modeling',
        status: 'CONFIRMED_BY_STUDENT',
        source: 'STUDENT',
        selfReportedDifficulty: 4,
        selfReportedConfidence: 2,
        updatedAt: '2026-10-20T12:00:00.000Z',
      };

      const parsed = StudentCoursePositionSchema.safeParse(studentPos);
      expect(parsed.success).toBe(true);
      expect(studentPos.status).toBe('CONFIRMED_BY_STUDENT');
      expect(studentPos.source).toBe('STUDENT');
    });

    it('builds a unified snapshot preserving all three separate truths without collapsing', () => {
      const calendarPos: CalendarPosition = {
        academicWeek: 8,
        localDate: '2026-11-01',
        status: 'EXPECTED',
      };

      const coursePulse: CoursePulsePosition = {
        courseCode: 'MCT314',
        topicKey: 'mct314-frequency-response-and-bode-plots',
        status: 'VERIFIED',
        source: 'COURSE_EDITOR',
        updatedAt: '2026-11-01T08:00:00.000Z',
      };

      const studentPos: StudentCoursePosition = {
        id: 'pos_stu_1',
        studentKey: 'stu_1',
        courseCode: 'MCT314',
        lastUnderstoodTopicKey: 'mct314-transfer-function-modeling',
        status: 'CONFIRMED_BY_STUDENT',
        source: 'STUDENT',
        updatedAt: '2026-11-01T09:00:00.000Z',
      };

      const snapshot = buildCoursePositionSnapshot({
        courseCode: 'MCT314',
        calendarPosition: calendarPos,
        coursePulse,
        studentPosition: studentPos,
      });

      expect(snapshot.courseCode).toBe('MCT314');
      // Calendar position is EXPECTED
      expect(snapshot.calendarPosition?.status).toBe('EXPECTED');
      expect(snapshot.calendarPosition?.academicWeek).toBe(8);
      // Course pulse is VERIFIED and points to Bode Plots
      expect(snapshot.coursePulse?.status).toBe('VERIFIED');
      expect(snapshot.coursePulse?.topicKey).toBe('mct314-frequency-response-and-bode-plots');
      // Student position is CONFIRMED_BY_STUDENT and points to Transfer Function
      expect(snapshot.studentPosition?.status).toBe('CONFIRMED_BY_STUDENT');
      expect(snapshot.studentPosition?.lastUnderstoodTopicKey).toBe(
        'mct314-transfer-function-modeling',
      );
    });
  });

  describe('2. Position State Transitions & Invariant Guards', () => {
    it('creates student position with default CONFIRMED_BY_STUDENT and STUDENT source', () => {
      const pos = createOrUpdateStudentPosition(null, {
        studentKey: 'stu_42',
        courseCode: 'mct121',
        lastUnderstoodTopicKey: 'mct121-w5-methods-of-integration-integration-',
      });

      expect(pos.status).toBe('CONFIRMED_BY_STUDENT');
      expect(pos.source).toBe('STUDENT');
      expect(pos.courseCode).toBe('MCT121');
      expect(pos.lastUnderstoodTopicKey).toBe('mct121-w5-methods-of-integration-integration-');
    });

    it('updates existing student position while preserving untouched fields', () => {
      const initial = createOrUpdateStudentPosition(null, {
        studentKey: 'stu_42',
        courseCode: 'MCT121',
        lastAttendedTopicKey: 'mct121-w6-methods-of-integration-trigonometri',
        lastUnderstoodTopicKey: 'mct121-w5-methods-of-integration-integration-',
        selfReportedDifficulty: 3,
      });

      const updated = createOrUpdateStudentPosition(initial, {
        studentKey: 'stu_42',
        courseCode: 'MCT121',
        lastUnderstoodTopicKey: 'mct121-w6-methods-of-integration-trigonometri',
      });

      expect(updated.id).toBe(initial.id);
      expect(updated.lastAttendedTopicKey).toBe('mct121-w6-methods-of-integration-trigonometri');
      expect(updated.lastUnderstoodTopicKey).toBe('mct121-w6-methods-of-integration-trigonometri');
      expect(updated.selfReportedDifficulty).toBe(3);
    });

    it('prevents SYSTEM_INFERENCE from silently promoting INFERRED position to VERIFIED', () => {
      const existing: StudentCoursePosition = {
        id: 'pos_1',
        studentKey: 'stu_1',
        courseCode: 'MCT314',
        status: 'INFERRED',
        source: 'SYSTEM_INFERENCE',
        updatedAt: '2026-10-01T00:00:00.000Z',
      };

      expect(() => {
        createOrUpdateStudentPosition(existing, {
          studentKey: 'stu_1',
          courseCode: 'MCT314',
          status: 'VERIFIED',
          source: 'SYSTEM_INFERENCE',
        });
      }).toThrow(/SYSTEM_INFERENCE cannot promote INFERRED position to VERIFIED/);
    });

    it('prevents ACADEMIC_CALENDAR from creating CONFIRMED_BY_STUDENT status', () => {
      expect(() => {
        createOrUpdateStudentPosition(null, {
          studentKey: 'stu_1',
          courseCode: 'MCT314',
          status: 'CONFIRMED_BY_STUDENT',
          source: 'ACADEMIC_CALENDAR',
        });
      }).toThrow(/ACADEMIC_CALENDAR cannot set CONFIRMED_BY_STUDENT status/);
    });
  });

  describe('3. Repository & Learning Signals', () => {
    it('saves and retrieves student position by studentKey and courseCode', async () => {
      const pos = createOrUpdateStudentPosition(null, {
        studentKey: 'stu_99',
        courseCode: 'MCT111',
        lastUnderstoodTopicKey: 'mct111-w2-functions-and-their-types',
      });

      await repository.save(pos);

      const found = await repository.findByStudentAndCourse('stu_99', 'mct111');
      expect(found).not.toBeNull();
      expect(found?.courseCode).toBe('MCT111');
      expect(found?.lastUnderstoodTopicKey).toBe('mct111-w2-functions-and-their-types');
    });

    it('retrieves all course positions for a given student', async () => {
      await repository.save(
        createOrUpdateStudentPosition(null, {
          studentKey: 'stu_multi',
          courseCode: 'MCT111',
        }),
      );
      await repository.save(
        createOrUpdateStudentPosition(null, {
          studentKey: 'stu_multi',
          courseCode: 'MCT112',
        }),
      );
      await repository.save(
        createOrUpdateStudentPosition(null, {
          studentKey: 'other_stu',
          courseCode: 'MCT111',
        }),
      );

      const list = await repository.findAllByStudent('stu_multi');
      expect(list.length).toBe(2);
      expect(list.map((p) => p.courseCode).sort()).toEqual(['MCT111', 'MCT112']);
    });

    it('records and retrieves learning signals without mutating position or declaring automatic mastery', async () => {
      const signal1 = {
        id: 'sig_1',
        studentKey: 'stu_signals',
        courseCode: 'MCT314',
        type: 'REPEATED_QUESTION' as const,
        topicKey: 'mct314-root-locus',
        value: 3,
        recordedAt: '2026-10-15T10:00:00.000Z',
      };

      const signal2 = {
        id: 'sig_2',
        studentKey: 'stu_signals',
        courseCode: 'MCT314',
        type: 'SELF_REPORTED_DIFFICULTY' as const,
        topicKey: 'mct314-root-locus',
        value: 5,
        recordedAt: '2026-10-15T11:00:00.000Z',
      };

      expect(StudentLearningSignalSchema.safeParse(signal1).success).toBe(true);
      await repository.recordSignal(signal1);
      await repository.recordSignal(signal2);

      const signals = await repository.getSignals('stu_signals', 'MCT314');
      expect(signals.length).toBe(2);
      expect(signals[0]?.type).toBe('REPEATED_QUESTION');
      expect(signals[1]?.type).toBe('SELF_REPORTED_DIFFICULTY');

      // Crucial safety check: recording signals did NOT automatically create or advance student course position
      const pos = await repository.findByStudentAndCourse('stu_signals', 'MCT314');
      expect(pos).toBeNull();
    });

    it('deletes student position cleanly', async () => {
      await repository.save(
        createOrUpdateStudentPosition(null, {
          studentKey: 'stu_del',
          courseCode: 'MCT111',
        }),
      );

      const deleted = await repository.delete('stu_del', 'MCT111');
      expect(deleted).toBe(true);
      const after = await repository.findByStudentAndCourse('stu_del', 'MCT111');
      expect(after).toBeNull();
    });

    it('clears all positions and signals', async () => {
      await repository.save(
        createOrUpdateStudentPosition(null, {
          studentKey: 'stu_clear',
          courseCode: 'MCT111',
        }),
      );
      repository.clear();
      expect(await repository.findAllByStudent('stu_clear')).toHaveLength(0);
    });
  });

  describe('4. StudyNavigatorService Position & Snapshot Facade', () => {
    it('records and gets student position through StudyNavigatorService', async () => {
      const dummyDataset = { topics: [] } as unknown as AcademicCoreDataset;
      const service = new StudyNavigatorService({ dataset: dummyDataset, repository });

      const recorded = await service.recordStudentPosition({
        studentKey: 'stu_serv',
        courseCode: 'MCT314',
        lastUnderstoodTopicKey: 'mct314-transfer-function-modeling',
      });

      expect(recorded.courseCode).toBe('MCT314');
      const retrieved = await service.getStudentPosition('stu_serv', 'MCT314');
      expect(retrieved?.lastUnderstoodTopicKey).toBe('mct314-transfer-function-modeling');

      const signal = await service.recordLearningSignal({
        studentKey: 'stu_serv',
        courseCode: 'MCT314',
        type: 'MANUAL_STATUS',
        value: 'STUDYING',
      });
      expect(signal.type).toBe('MANUAL_STATUS');
    });

    it('builds course snapshots with and without student data via service', async () => {
      const dummyDataset = { topics: [] } as unknown as AcademicCoreDataset;
      const service = new StudyNavigatorService({ dataset: dummyDataset, repository });

      await service.recordStudentPosition({
        studentKey: 'stu_snap',
        courseCode: 'MCT111',
        lastUnderstoodTopicKey: 'mct111-w5-limits-and-continuity-part-2',
      });

      const snapWithStudent = await service.getCourseSnapshot({
        studentKey: 'stu_snap',
        courseCode: 'MCT111',
        calendarPosition: {
          academicWeek: 5,
          localDate: '2026-10-15',
          status: 'EXPECTED',
        },
      });

      expect(snapWithStudent.studentPosition).toBeDefined();
      expect(snapWithStudent.calendarPosition?.academicWeek).toBe(5);

      const snapWithoutStudent = await service.getCourseSnapshot({
        courseCode: 'MCT111',
      });
      expect(snapWithoutStudent.studentPosition).toBeUndefined();
    });
  });
});
