import { describe, it, expect } from 'vitest';
import { SYNTHETIC_COURSES, SYNTHETIC_OFFERINGS } from '@mecha-bot/academic';

describe('Course vs CourseOffering Architecture Separation', () => {
  it('allows a single course to have multiple offerings across semesters', () => {
    // TEST402_PROJ is a graduation project spanning Semester 7 and Semester 8
    const projectCourse = SYNTHETIC_COURSES.find((c) => c.code === 'TEST402_PROJ');
    expect(projectCourse).toBeDefined();

    const offerings = SYNTHETIC_OFFERINGS.filter((o) => o.courseId === projectCourse?.id);
    expect(offerings.length).toBe(2);

    const sem7Offering = offerings.find((o) => o.programSemester === 7);
    const sem8Offering = offerings.find((o) => o.programSemester === 8);

    expect(sem7Offering).toBeDefined();
    expect(sem8Offering).toBeDefined();
    expect(sem7Offering?.academicYearId).toBe('ay_2026_2027');
    expect(sem8Offering?.academicYearId).toBe('ay_2026_2027');
  });

  it('keeps course catalog identity independent of yearly offerings', () => {
    const course = SYNTHETIC_COURSES.find((c) => c.code === 'TEST101');
    expect(course?.nameEn).toBe('Synthetic Engineering Foundations I');
    expect(course?.defaultStage).toBe(1);
    expect(course?.defaultProgramSemester).toBe(1);

    const offering = SYNTHETIC_OFFERINGS.find((o) => o.courseId === course?.id);
    expect(offering).toBeDefined();
    expect(offering?.academicYearId).toBe('ay_2026_2027');
  });
});
