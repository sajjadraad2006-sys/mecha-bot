import { AcademicCoreDataset } from '@mecha-bot/academic';
import {
  StudentCoursePosition,
  CoursePositionSnapshot,
  WhereAreWeResult,
  StudyDiagnosis,
  CatchUpPlan,
  StudentLearningSignal,
  CoursePulsePosition,
  CalendarPosition,
} from './types.js';
import { StudentCoursePositionRepository } from './repository.js';
import { InMemoryStudentCoursePositionRepository } from './in-memory-repository.js';
import {
  createOrUpdateStudentPosition,
  buildCoursePositionSnapshot,
  UpdateStudentPositionInput,
} from './position.js';
import { evaluateCourseProgress, EvaluateCourseProgressInput } from './course-progress.js';
import { diagnoseStudyPosition, DiagnoseStudyInput } from './diagnosis.js';
import { generateCatchUpPath, buildCatchUpPlan } from './catchup.js';
import { partitionStudyBudget } from './plan.js';

export interface StudyNavigatorServiceConfig {
  dataset: AcademicCoreDataset;
  repository?: StudentCoursePositionRepository | undefined;
}

export class StudyNavigatorService {
  private dataset: AcademicCoreDataset;
  private repository: StudentCoursePositionRepository;

  constructor(config: StudyNavigatorServiceConfig) {
    this.dataset = config.dataset;
    this.repository = config.repository || new InMemoryStudentCoursePositionRepository();
  }

  /**
   * Retrieves the current recorded position for a student in a course.
   */
  async getStudentPosition(
    studentKey: string,
    courseCode: string,
  ): Promise<StudentCoursePosition | null> {
    return this.repository.findByStudentAndCourse(studentKey, courseCode);
  }

  /**
   * Retrieves all recorded positions for a student across courses.
   */
  async getAllStudentPositions(studentKey: string): Promise<StudentCoursePosition[]> {
    return this.repository.findAllByStudent(studentKey);
  }

  /**
   * Records or updates student-confirmed position in a course.
   */
  async recordStudentPosition(input: UpdateStudentPositionInput): Promise<StudentCoursePosition> {
    const existing = await this.repository.findByStudentAndCourse(
      input.studentKey,
      input.courseCode,
    );
    const updated = createOrUpdateStudentPosition(existing, input);
    return this.repository.save(updated);
  }

  /**
   * Records a student learning signal (e.g. repeated question, self-reported difficulty).
   */
  async recordLearningSignal(
    signal: Omit<StudentLearningSignal, 'id' | 'recordedAt'> & {
      id?: string | undefined;
      recordedAt?: string | undefined;
    },
  ): Promise<StudentLearningSignal> {
    const fullSignal: StudentLearningSignal = {
      id: signal.id || `sig_${signal.studentKey}_${signal.courseCode}_${Date.now()}`,
      studentKey: signal.studentKey,
      courseCode: signal.courseCode.toUpperCase(),
      type: signal.type,
      topicKey: signal.topicKey,
      value: signal.value,
      recordedAt: signal.recordedAt || new Date().toISOString(),
    };
    return this.repository.recordSignal(fullSignal);
  }

  /**
   * Builds a multi-truth snapshot for a course combining calendar, class pulse, and student position.
   */
  async getCourseSnapshot(params: {
    studentKey?: string | undefined;
    courseCode: string;
    calendarPosition?: CalendarPosition | undefined;
    coursePulse?: CoursePulsePosition | undefined;
  }): Promise<CoursePositionSnapshot> {
    let studentPos: StudentCoursePosition | undefined;
    if (params.studentKey) {
      const found = await this.repository.findByStudentAndCourse(
        params.studentKey,
        params.courseCode,
      );
      if (found) studentPos = found;
    }

    return buildCoursePositionSnapshot({
      courseCode: params.courseCode,
      calendarPosition: params.calendarPosition,
      coursePulse: params.coursePulse,
      studentPosition: studentPos,
    });
  }

  /**
   * "وين وصلنا؟" Engine: Evaluates where the class is using Course Pulse or Calendar.
   */
  whereAreWe(
    input: Omit<EvaluateCourseProgressInput, 'topics'> & {
      topics?: undefined;
    },
  ): WhereAreWeResult {
    const courseCode = input.courseCode.toUpperCase();
    const courseTopics = this.dataset.topics.filter((t) => t.courseCode === courseCode);

    return evaluateCourseProgress({
      ...input,
      topics: courseTopics,
    });
  }

  /**
   * "أني ضايع" Diagnosis Engine: Evaluates student position and generates a catch-up plan.
   */
  diagnose(
    input: Omit<DiagnoseStudyInput, 'dataset'> & {
      dataset?: undefined;
    },
  ): StudyDiagnosis {
    return diagnoseStudyPosition({
      ...input,
      dataset: this.dataset,
    });
  }

  /**
   * Generates a deterministic CatchUpPlan between two topics.
   */
  planCatchUp(params: {
    courseCode: string;
    targetTopicKey: string;
    lastUnderstoodTopicKey?: string | undefined;
    studyBudgetMinutes?: number | undefined;
  }): CatchUpPlan {
    const courseCode = params.courseCode.toUpperCase();
    const targetTopic = this.dataset.topics.find((t) => t.topicKey === params.targetTopicKey);
    if (!targetTopic) {
      throw new Error(`Target topic '${params.targetTopicKey}' not found in dataset.`);
    }

    let lastUnderstoodTopic;
    if (params.lastUnderstoodTopicKey) {
      lastUnderstoodTopic = this.dataset.topics.find(
        (t) => t.topicKey === params.lastUnderstoodTopicKey,
      );
    }

    const courseTopics = this.dataset.topics.filter((t) => t.courseCode === courseCode);

    const pathResult = generateCatchUpPath({
      courseCode,
      targetTopic,
      lastUnderstoodTopic,
      prerequisiteGraph: this.dataset.prerequisiteGraph,
      courseTopics,
    });

    const plan = buildCatchUpPlan({
      courseCode,
      targetTopicKey: params.targetTopicKey,
      steps: pathResult.steps,
    });

    if (params.studyBudgetMinutes !== undefined) {
      plan.studyBudgetPlan = partitionStudyBudget(params.studyBudgetMinutes, pathResult.steps);
    }

    return plan;
  }
}
