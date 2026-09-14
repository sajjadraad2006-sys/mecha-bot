import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SqliteDatabaseConnection, MigrationRunner, AcademicRepository } from '@mecha-bot/database';
import {
  importOfficialCurriculum,
  OfficialCurriculumSchema,
} from '../scripts/import-curriculum.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../migrations');
const curriculumFilePath = path.resolve(
  __dirname,
  '../curriculum/official/uob-mechatronics-2025.json',
);

describe('Milestone M1 — Curriculum Importer & Baseline Verification', () => {
  let db: SqliteDatabaseConnection;

  beforeEach(() => {
    db = new SqliteDatabaseConnection(':memory:');
    const runner = new MigrationRunner(db, migrationsDir);
    runner.migrate();
  });

  afterEach(() => {
    db.close();
  });

  it('validates schema of official curriculum JSON file', () => {
    expect(fs.existsSync(curriculumFilePath)).toBe(true);
    const raw = fs.readFileSync(curriculumFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    const result = OfficialCurriculumSchema.safeParse(parsed);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.curriculumVersion).toBe('cv_uob_mct_2025');
      expect(result.data.academicYear).toBe('2026-2027');
      expect(result.data.courses.length).toBe(55);
      expect(result.data.offerings.length).toBe(56);
    }
  });

  it('imports exactly 55 canonical courses and 56 offerings into database', () => {
    const res = importOfficialCurriculum(db, curriculumFilePath);
    expect(res.coursesImported).toBe(55);
    expect(res.offeringsImported).toBe(56);
    expect(res.curriculumVersion).toBe('cv_uob_mct_2025');

    const totalCourses = db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM courses WHERE is_active = 1;',
    );
    expect(totalCourses?.count).toBe(55);

    const totalOfferings = db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM course_offerings WHERE is_active = 1;',
    );
    expect(totalOfferings?.count).toBe(56);
  });

  it('models P4MCT as exactly 1 canonical course with exactly 2 offerings (Semesters 7 & 8)', () => {
    importOfficialCurriculum(db, curriculumFilePath);

    const p4Courses = db.query<{ id: string; code: string }>(
      "SELECT id, code FROM courses WHERE code = 'P4MCT';",
    );
    expect(p4Courses.length).toBe(1);
    expect(p4Courses[0]?.code).toBe('P4MCT');

    const p4Offerings = db.query<{
      id: string;
      stage: number;
      program_semester: number;
    }>(
      "SELECT o.id, o.stage, o.program_semester FROM course_offerings o JOIN courses c ON o.course_id = c.id WHERE c.code = 'P4MCT' ORDER BY o.program_semester ASC;",
    );
    expect(p4Offerings.length).toBe(2);
    expect(p4Offerings[0]?.stage).toBe(4);
    expect(p4Offerings[0]?.program_semester).toBe(7);
    expect(p4Offerings[1]?.stage).toBe(4);
    expect(p4Offerings[1]?.program_semester).toBe(8);
  });

  it('is completely idempotent when run multiple times against the same database', () => {
    // Run 1
    const run1 = importOfficialCurriculum(db, curriculumFilePath);
    expect(run1.coursesImported).toBe(55);
    expect(run1.offeringsImported).toBe(56);

    // Run 2 (duplicate run)
    const run2 = importOfficialCurriculum(db, curriculumFilePath);
    expect(run2.coursesImported).toBe(55);
    expect(run2.offeringsImported).toBe(56);

    // Verify unchanged counts
    const coursesCount = db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM courses;');
    expect(coursesCount?.count).toBe(55);

    const offeringsCount = db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM course_offerings;',
    );
    expect(offeringsCount?.count).toBe(56);

    const curriculumVersionsCount = db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM curriculum_versions;',
    );
    expect(curriculumVersionsCount?.count).toBe(1);

    // P4MCT still exactly 1 course and 2 offerings
    const p4Offerings = db.query(
      "SELECT o.* FROM course_offerings o JOIN courses c ON o.course_id = c.id WHERE c.code = 'P4MCT';",
    );
    expect(p4Offerings.length).toBe(2);
  });

  it('atomically rolls back transaction on invalid curriculum data or schema mismatch', () => {
    // Initial state: empty
    const initialCourses = db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM courses;');
    expect(initialCourses?.count).toBe(0);

    // Prepare a temporary malformed curriculum file (invalid stage 5)
    const malformedData = {
      curriculumVersion: 'cv_broken',
      versionName: 'Broken Version',
      department: 'Mechatronics Engineering',
      college: 'College of Engineering',
      university: 'University of Basrah',
      academicYear: '2026-2027',
      provenance: {
        evidenceScope: 'EXACT_CURRICULUM',
        sourceDescription: 'Test malformed',
        verified: false,
      },
      courses: [
        {
          code: 'GOOD101',
          nameEn: 'Good Course',
          nameAr: 'مادة سليمة',
          stage: 1,
          semester: 1,
        },
        {
          code: 'BAD501',
          nameEn: 'Bad Course',
          nameAr: 'مادة غير سليمة',
          stage: 5, // Invalid stage (> 4)
          semester: 9, // Invalid semester (> 8)
        },
      ],
      offerings: [],
    };

    const tempFilePath = path.resolve(__dirname, '../data/test-malformed-curriculum.json');
    const tempDir = path.dirname(tempFilePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    fs.writeFileSync(tempFilePath, JSON.stringify(malformedData), 'utf8');

    try {
      expect(() => {
        importOfficialCurriculum(db, tempFilePath);
      }).toThrow(/Curriculum validation failed/);

      // Verify transaction atomicity: GOOD101 must NOT have been persisted
      const afterCount = db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM courses;');
      expect(afterCount?.count).toBe(0);
    } finally {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  });

  it('treats Arabic course names as localized display labels without assuming official source wording', () => {
    importOfficialCurriculum(db, curriculumFilePath);

    const academicRepo = new AcademicRepository(db);
    const course = academicRepo.findCourseByCode('MCT314');
    expect(course).not.toBeNull();
    // English name is official
    expect(course?.nameEn).toBe('Control Systems 1');
    // Arabic name is localized display label
    expect(course?.nameAr).toBe('أنظمة السيطرة 1');
  });

  it('models curriculum version != academic year != course pulse with zero synthetic progress', () => {
    importOfficialCurriculum(db, curriculumFilePath);

    // 1. Curriculum version exists
    const cv = db.queryOne<{ id: string; version_name: string }>(
      "SELECT id, version_name FROM curriculum_versions WHERE id = 'cv_uob_mct_2025';",
    );
    expect(cv?.id).toBe('cv_uob_mct_2025');

    // 2. Academic year exists separately
    const ay = db.queryOne<{ id: string; name: string }>(
      "SELECT id, name FROM academic_years WHERE id = 'ay_2026_2027';",
    );
    expect(ay?.name).toBe('2026-2027');

    // 3. No Course Pulse or fake progress records were generated
    const eventCount = db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM academic_events;',
    );
    expect(eventCount?.count).toBe(0);
  });
});
