import { Stage, ProgramSemester } from './stage-semester.js';

export interface Course {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  defaultStage: Stage;
  defaultProgramSemester: ProgramSemester;
  isActive: boolean;
  curriculumVersionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseOffering {
  id: string;
  courseId: string;
  academicYearId: string;
  stage: Stage;
  programSemester: ProgramSemester;
  isActive: boolean;
  createdAt: string;
}

export interface CourseAlias {
  id: string;
  courseId: string;
  alias: string;
  locale: 'ar' | 'en' | 'all';
}
