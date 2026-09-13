export type PulseConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'ESTIMATED';

export type BaselineSource =
  'SHARED_COURSE_PULSE' | 'STUDENT_CONFIRMED' | 'STUDENT_ENTERED' | 'INFERRED';

export type BaselineConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CoursePulse {
  id: string;
  courseOfferingId: string;
  currentTopicId: string | null;
  currentSubtopicId: string | null;
  actualTeachingWeek: number | null;
  progressNote: string | null;
  confidenceStatus: PulseConfidence;
  updatedBy: string | null;
  updatedAt: string; // UTC ISO 8601 string
}

export interface StudentCourseState {
  id: string;
  studentId: string;
  courseOfferingId: string;
  joinedAt: string; // UTC ISO 8601 string
  baselineTopicId: string | null;
  baselineSource: BaselineSource;
  baselineConfidence: BaselineConfidence;
  lastActiveTopicId: string | null;
  updatedAt: string; // UTC ISO 8601 string
}
