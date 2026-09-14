import { StudentCoursePosition, StudentLearningSignal } from './types.js';
import { StudentCoursePositionRepository } from './repository.js';

export class InMemoryStudentCoursePositionRepository implements StudentCoursePositionRepository {
  private positions: Map<string, StudentCoursePosition> = new Map();
  private signals: StudentLearningSignal[] = [];

  private makeKey(studentKey: string, courseCode: string): string {
    return `${studentKey}:${courseCode.toUpperCase()}`;
  }

  async findByStudentAndCourse(
    studentKey: string,
    courseCode: string,
  ): Promise<StudentCoursePosition | null> {
    const key = this.makeKey(studentKey, courseCode);
    const pos = this.positions.get(key);
    return pos ? { ...pos } : null;
  }

  async findAllByStudent(studentKey: string): Promise<StudentCoursePosition[]> {
    const list: StudentCoursePosition[] = [];
    for (const [key, pos] of this.positions.entries()) {
      if (key.startsWith(`${studentKey}:`)) {
        list.push({ ...pos });
      }
    }
    return list;
  }

  async save(position: StudentCoursePosition): Promise<StudentCoursePosition> {
    const key = this.makeKey(position.studentKey, position.courseCode);
    const copy = { ...position, courseCode: position.courseCode.toUpperCase() };
    this.positions.set(key, copy);
    return { ...copy };
  }

  async delete(studentKey: string, courseCode: string): Promise<boolean> {
    const key = this.makeKey(studentKey, courseCode);
    return this.positions.delete(key);
  }

  async recordSignal(signal: StudentLearningSignal): Promise<StudentLearningSignal> {
    const copy = { ...signal, courseCode: signal.courseCode.toUpperCase() };
    this.signals.push(copy);
    return { ...copy };
  }

  async getSignals(
    studentKey: string,
    courseCode?: string | undefined,
  ): Promise<StudentLearningSignal[]> {
    return this.signals
      .filter((s) => {
        if (s.studentKey !== studentKey) return false;
        if (courseCode && s.courseCode !== courseCode.toUpperCase()) return false;
        return true;
      })
      .map((s) => ({ ...s }));
  }

  clear(): void {
    this.positions.clear();
    this.signals = [];
  }
}
