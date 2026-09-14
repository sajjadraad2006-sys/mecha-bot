import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import dotenv from 'dotenv';
import { DatabaseConnection, SqliteDatabaseConnection } from '@mecha-bot/database';
import { Stage, ProgramSemester, validateStageSemester } from '@mecha-bot/academic';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CourseSchema = z.object({
  code: z.string().min(2),
  nameEn: z.string().min(2),
  nameAr: z.string().min(2),
  stage: z.number().int().min(1).max(4),
  semester: z.number().int().min(1).max(8),
});

const OfferingSchema = z.object({
  courseCode: z.string().min(2),
  stage: z.number().int().min(1).max(4),
  programSemester: z.number().int().min(1).max(8),
});

export const OfficialCurriculumSchema = z.object({
  curriculumVersion: z.string().min(1),
  versionName: z.string().min(1),
  department: z.string().min(1),
  college: z.string().min(1),
  university: z.string().min(1),
  academicYear: z.string().min(1),
  provenance: z.object({
    evidenceScope: z.string(),
    sourceDescription: z.string(),
    verified: z.boolean(),
  }),
  courses: z.array(CourseSchema).min(1),
  offerings: z.array(OfferingSchema).min(1),
});

export type OfficialCurriculumData = z.infer<typeof OfficialCurriculumSchema>;

export function importOfficialCurriculum(
  db: DatabaseConnection,
  curriculumFilePath?: string,
): { coursesImported: number; offeringsImported: number; curriculumVersion: string } {
  const filePath =
    curriculumFilePath ||
    path.join(rootDir, 'curriculum', 'official', 'uob-mechatronics-2025.json');

  if (!fs.existsSync(filePath)) {
    throw new Error(`Curriculum file not found: ${filePath}`);
  }

  const rawJson = fs.readFileSync(filePath, 'utf8');
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJson);
  } catch {
    throw new Error(`Invalid JSON syntax in curriculum file: ${filePath}`);
  }

  const parseResult = OfficialCurriculumSchema.safeParse(parsedJson);
  if (!parseResult.success) {
    throw new Error(
      `Curriculum validation failed: ${parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`,
    );
  }

  const data = parseResult.data;
  const now = new Date().toISOString();

  db.transaction(() => {
    // 1. Ensure Academic Year exists idempotently
    const academicYearId = `ay_${data.academicYear.replace('-', '_')}`;
    db.run(
      `INSERT INTO academic_years (id, name, starts_on, ends_on, is_current, created_at)
       VALUES (?, ?, ?, ?, 1, ?)
       ON CONFLICT(id) DO NOTHING;`,
      [
        academicYearId,
        data.academicYear,
        `${data.academicYear.split('-')[0]}-09-15`,
        `${data.academicYear.split('-')[1]}-06-30`,
        now,
      ],
    );

    // 2. Ensure Curriculum Version exists idempotently (separated from academic year)
    db.run(
      `INSERT INTO curriculum_versions (id, version_name, academic_year, is_active, created_at)
       VALUES (?, ?, ?, 1, ?)
       ON CONFLICT(id) DO NOTHING;`,
      [data.curriculumVersion, data.versionName, data.academicYear, now],
    );

    // 3. Insert canonical courses idempotently
    for (const c of data.courses) {
      validateStageSemester(c.stage as Stage, c.semester as ProgramSemester);
      const courseId = `course_${c.code.toLowerCase()}`;

      db.run(
        `INSERT INTO courses (
          id, code, name_ar, name_en, default_stage, default_program_semester, is_active, curriculum_version_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        ON CONFLICT(code) DO UPDATE SET
          name_ar = excluded.name_ar,
          name_en = excluded.name_en,
          default_stage = excluded.default_stage,
          default_program_semester = excluded.default_program_semester,
          updated_at = excluded.updated_at;`,
        [
          courseId,
          c.code,
          c.nameAr,
          c.nameEn,
          c.stage,
          c.semester,
          data.curriculumVersion,
          now,
          now,
        ],
      );
    }

    // 4. Insert course offerings idempotently
    for (const off of data.offerings) {
      validateStageSemester(off.stage as Stage, off.programSemester as ProgramSemester);
      const courseId = `course_${off.courseCode.toLowerCase()}`;
      const offeringId = `offering_${off.courseCode.toLowerCase()}_s${off.programSemester}`;

      db.run(
        `INSERT INTO course_offerings (
          id, course_id, academic_year_id, stage, program_semester, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, 1, ?)
        ON CONFLICT(course_id, academic_year_id, program_semester) DO NOTHING;`,
        [offeringId, courseId, academicYearId, off.stage, off.programSemester, now],
      );
    }
  });

  return {
    coursesImported: data.courses.length,
    offeringsImported: data.offerings.length,
    curriculumVersion: data.curriculumVersion,
  };
}

// Standalone CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dbPath = process.env['DATABASE_PATH'] || path.join(rootDir, 'data', 'mecha_bot.sqlite');
  console.log(`[import-curriculum] Target database: ${dbPath}`);
  const db = new SqliteDatabaseConnection(dbPath);

  try {
    const result = importOfficialCurriculum(db);
    console.log(`[import-curriculum] Successfully imported official curriculum:`);
    console.log(`  Curriculum Version: ${result.curriculumVersion}`);
    console.log(`  Canonical Courses:  ${result.coursesImported}`);
    console.log(`  Course Offerings:   ${result.offeringsImported}`);
  } catch (error) {
    console.error('[import-curriculum] Error importing curriculum:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}
