import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { SqliteDatabaseConnection, AcademicRepository } from '@mecha-bot/database';
import {
  SYNTHETIC_ACADEMIC_YEAR,
  SYNTHETIC_COURSES,
  SYNTHETIC_OFFERINGS,
  SYNTHETIC_CALENDAR_PERIODS,
} from '@mecha-bot/academic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const dbPath = process.env.DATABASE_PATH || './data/mecha_bot.sqlite';
const resolvedDbPath = path.resolve(rootDir, dbPath);

console.log(`[seed-test] Seeding synthetic academic fixtures into: ${resolvedDbPath}`);
const db = new SqliteDatabaseConnection(resolvedDbPath);
const academicRepo = new AcademicRepository(db);

try {
  // Seed Academic Year
  console.log(`[seed-test] Seeding Academic Year: ${SYNTHETIC_ACADEMIC_YEAR.name}`);
  academicRepo.createAcademicYear(SYNTHETIC_ACADEMIC_YEAR);

  // Seed Curriculum Version
  console.log('[seed-test] Seeding Curriculum Version: cv_synthetic_v1');
  academicRepo.createCurriculumVersion(
    'cv_synthetic_v1',
    'Synthetic Test Curriculum v1',
    '2026-2027',
  );

  // Seed Courses
  for (const course of SYNTHETIC_COURSES) {
    console.log(`[seed-test] Seeding Course: ${course.code} - ${course.nameEn}`);
    academicRepo.createCourse(course);
  }

  // Seed Offerings
  for (const offering of SYNTHETIC_OFFERINGS) {
    console.log(
      `[seed-test] Seeding Offering: ${offering.id} (Semester ${offering.programSemester})`,
    );
    academicRepo.createCourseOffering(offering);
  }

  // Seed Calendar Periods
  for (const period of SYNTHETIC_CALENDAR_PERIODS) {
    console.log(`[seed-test] Seeding Calendar Period: ${period.id} (${period.periodType})`);
    academicRepo.createCalendarPeriod(period);
  }

  // Seed Sample Course Pulse for TEST101
  academicRepo.upsertCoursePulse({
    id: 'pulse_test101_offering',
    courseOfferingId: 'offering_test101_2026_s1',
    currentTopicId: null,
    currentSubtopicId: null,
    actualTeachingWeek: 3,
    progressNote: 'Synthetic teaching progress note: Reached week 3 introduction',
    confidenceStatus: 'HIGH',
    updatedBy: 'system_test',
    updatedAt: new Date().toISOString(),
  });

  // Seed Course Staff Assignment
  academicRepo.createStaffAssignment({
    id: 'staff_assign_test101',
    courseOfferingId: 'offering_test101_2026_s1',
    staffName: 'Dr. Synthetic Lecturer',
    staffTitle: 'Assistant Professor',
    role: 'PRIMARY_LECTURER',
    academicYearId: 'ay_2026_2027',
    evidenceSourceId: null,
    verificationStatus: 'VERIFIED',
    createdAt: new Date().toISOString(),
  });

  console.log('[seed-test] Synthetic seeding completed successfully!');
} finally {
  db.close();
}
