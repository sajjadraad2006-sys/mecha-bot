import { Course, CourseOffering } from './course.js';
import { AcademicYear, AcademicCalendarPeriod } from './calendar.js';

export const SYNTHETIC_ACADEMIC_YEAR: AcademicYear = {
  id: 'ay_2026_2027',
  name: '2026-2027',
  startsOn: '2026-09-01',
  endsOn: '2027-06-30',
  isCurrent: true,
  createdAt: '2026-09-01T00:00:00.000Z',
};

export const SYNTHETIC_COURSES: Course[] = [
  {
    id: 'course_test101',
    code: 'TEST101',
    nameAr: 'مبادئ الهندسة التجريبية 1',
    nameEn: 'Synthetic Engineering Foundations I',
    defaultStage: 1,
    defaultProgramSemester: 1,
    isActive: true,
    curriculumVersionId: 'cv_synthetic_v1',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'course_test102',
    code: 'TEST102',
    nameAr: 'مبادئ الهندسة التجريبية 2',
    nameEn: 'Synthetic Engineering Foundations II',
    defaultStage: 1,
    defaultProgramSemester: 2,
    isActive: true,
    curriculumVersionId: 'cv_synthetic_v1',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'course_test201',
    code: 'TEST201',
    nameAr: 'أنظمة الميكاترونكس التجريبية 1',
    nameEn: 'Synthetic Mechatronic Systems I',
    defaultStage: 2,
    defaultProgramSemester: 3,
    isActive: true,
    curriculumVersionId: 'cv_synthetic_v1',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'course_test402_proj',
    code: 'TEST402_PROJ',
    nameAr: 'مشروع التخرج التجريبي',
    nameEn: 'Synthetic Graduation Project',
    defaultStage: 4,
    defaultProgramSemester: 7,
    isActive: true,
    curriculumVersionId: 'cv_synthetic_v1',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
];

/**
 * Demonstrates Course vs CourseOffering separation:
 * The single Graduation Project course (TEST402_PROJ) has two offerings spanning Semester 7 and Semester 8.
 */
export const SYNTHETIC_OFFERINGS: CourseOffering[] = [
  {
    id: 'offering_test101_2026_s1',
    courseId: 'course_test101',
    academicYearId: 'ay_2026_2027',
    stage: 1,
    programSemester: 1,
    isActive: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'offering_test102_2026_s2',
    courseId: 'course_test102',
    academicYearId: 'ay_2026_2027',
    stage: 1,
    programSemester: 2,
    isActive: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'offering_test201_2026_s3',
    courseId: 'course_test201',
    academicYearId: 'ay_2026_2027',
    stage: 2,
    programSemester: 3,
    isActive: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'offering_test402_part1_s7',
    courseId: 'course_test402_proj',
    academicYearId: 'ay_2026_2027',
    stage: 4,
    programSemester: 7,
    isActive: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'offering_test402_part2_s8',
    courseId: 'course_test402_proj',
    academicYearId: 'ay_2026_2027',
    stage: 4,
    programSemester: 8,
    isActive: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

/**
 * Calendar periods showing stage scoping:
 * Stages 2-4 start teaching on 2026-09-20.
 * Stage 1 starts teaching later on 2026-10-18.
 */
export const SYNTHETIC_CALENDAR_PERIODS: AcademicCalendarPeriod[] = [
  // Upper stages (Stage 2, 3, 4) Semester 1 teaching
  {
    id: 'period_2026_upper_teaching_s1',
    academicYearId: 'ay_2026_2027',
    periodType: 'TEACHING',
    programSemester: null,
    startsOn: '2026-09-20',
    endsOn: '2027-01-08',
    nominalWeekCount: 16,
    stageScope: null, // Default for stages unless overridden
    evidenceMetadataJson: JSON.stringify({ note: 'Synthetic test calendar for upper stages' }),
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  // Stage 1 specific teaching period (starts later)
  {
    id: 'period_2026_stage1_teaching_s1',
    academicYearId: 'ay_2026_2027',
    periodType: 'TEACHING',
    programSemester: 1,
    startsOn: '2026-10-18',
    endsOn: '2027-01-30',
    nominalWeekCount: 15,
    stageScope: 1, // Stage 1 specific
    evidenceMetadataJson: JSON.stringify({ note: 'Synthetic test calendar for Stage 1' }),
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  // Midterm exams period
  {
    id: 'period_2026_exams_s1',
    academicYearId: 'ay_2026_2027',
    periodType: 'EXAMS',
    programSemester: null,
    startsOn: '2027-01-10',
    endsOn: '2027-01-25',
    nominalWeekCount: 2,
    stageScope: null,
    evidenceMetadataJson: null,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];
