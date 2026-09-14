import { StudentCoursePosition, StudentLearningSignal } from './types.js';

export interface StudentCoursePositionRepository {
  findByStudentAndCourse(
    studentKey: string,
    courseCode: string,
  ): Promise<StudentCoursePosition | null>;
  findAllByStudent(studentKey: string): Promise<StudentCoursePosition[]>;
  save(position: StudentCoursePosition): Promise<StudentCoursePosition>;
  delete(studentKey: string, courseCode: string): Promise<boolean>;
  recordSignal(signal: StudentLearningSignal): Promise<StudentLearningSignal>;
  getSignals(studentKey: string, courseCode?: string | undefined): Promise<StudentLearningSignal[]>;
}
