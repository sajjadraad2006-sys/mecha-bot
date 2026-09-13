import { DatabaseConnection } from '../connection.js';
import {
  AcademicYear,
  AcademicCalendarPeriod,
  Course,
  CourseOffering,
  CoursePulse,
  StudentCourseState,
  CourseStaffAssignment,
  Stage,
  ProgramSemester,
  PulseConfidence,
  BaselineSource,
  BaselineConfidence,
  StaffRole,
  VerificationStatus,
  PeriodType,
} from '@mecha-bot/academic';

export class AcademicRepository {
  constructor(private db: DatabaseConnection) {}

  // --- Academic Years ---
  createAcademicYear(year: AcademicYear): void {
    this.db.run(
      'INSERT INTO academic_years (id, name, starts_on, ends_on, is_current, created_at) VALUES (?, ?, ?, ?, ?, ?);',
      [year.id, year.name, year.startsOn, year.endsOn, year.isCurrent ? 1 : 0, year.createdAt],
    );
  }

  getCurrentAcademicYear(): AcademicYear | null {
    const row = this.db.queryOne<Record<string, unknown>>(
      'SELECT * FROM academic_years WHERE is_current = 1 LIMIT 1;',
    );
    if (!row) return null;
    return {
      id: row['id'] as string,
      name: row['name'] as string,
      startsOn: row['starts_on'] as string,
      endsOn: row['ends_on'] as string,
      isCurrent: Boolean(row['is_current']),
      createdAt: row['created_at'] as string,
    };
  }

  // --- Calendar Periods ---
  createCalendarPeriod(period: AcademicCalendarPeriod): void {
    this.db.run(
      `INSERT INTO academic_calendar_periods (
        id, academic_year_id, period_type, program_semester, starts_on, ends_on, nominal_week_count, stage_scope, evidence_metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        period.id,
        period.academicYearId,
        period.periodType,
        period.programSemester,
        period.startsOn,
        period.endsOn,
        period.nominalWeekCount,
        period.stageScope,
        period.evidenceMetadataJson,
        period.createdAt,
      ],
    );
  }

  getCalendarPeriods(academicYearId: string): AcademicCalendarPeriod[] {
    const rows = this.db.query<Record<string, unknown>>(
      'SELECT * FROM academic_calendar_periods WHERE academic_year_id = ? ORDER BY starts_on ASC;',
      [academicYearId],
    );
    return rows.map((r) => ({
      id: r['id'] as string,
      academicYearId: r['academic_year_id'] as string,
      periodType: r['period_type'] as PeriodType,
      programSemester: r['program_semester'] as ProgramSemester | null,
      startsOn: r['starts_on'] as string,
      endsOn: r['ends_on'] as string,
      nominalWeekCount: r['nominal_week_count'] as number,
      stageScope: r['stage_scope'] as Stage | null,
      evidenceMetadataJson: r['evidence_metadata_json'] as string | null,
      createdAt: r['created_at'] as string,
    }));
  }

  // --- Curriculum Versions ---
  createCurriculumVersion(id: string, versionName: string, academicYear: string): void {
    this.db.run(
      'INSERT INTO curriculum_versions (id, version_name, academic_year, is_active, created_at) VALUES (?, ?, ?, 1, ?);',
      [id, versionName, academicYear, new Date().toISOString()],
    );
  }

  // --- Courses ---
  createCourse(course: Course): void {
    this.db.run(
      `INSERT INTO courses (
        id, code, name_ar, name_en, default_stage, default_program_semester, is_active, curriculum_version_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        course.id,
        course.code,
        course.nameAr,
        course.nameEn,
        course.defaultStage,
        course.defaultProgramSemester,
        course.isActive ? 1 : 0,
        course.curriculumVersionId,
        course.createdAt,
        course.updatedAt,
      ],
    );
  }

  findCourseByCode(code: string): Course | null {
    const row = this.db.queryOne<Record<string, unknown>>('SELECT * FROM courses WHERE code = ?;', [
      code,
    ]);
    if (!row) return null;
    return {
      id: row['id'] as string,
      code: row['code'] as string,
      nameAr: row['name_ar'] as string,
      nameEn: row['name_en'] as string,
      defaultStage: row['default_stage'] as Stage,
      defaultProgramSemester: row['default_program_semester'] as ProgramSemester,
      isActive: Boolean(row['is_active']),
      curriculumVersionId: row['curriculum_version_id'] as string,
      createdAt: row['created_at'] as string,
      updatedAt: row['updated_at'] as string,
    };
  }

  // --- Course Offerings ---
  createCourseOffering(offering: CourseOffering): void {
    this.db.run(
      `INSERT INTO course_offerings (
        id, course_id, academic_year_id, stage, program_semester, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        offering.id,
        offering.courseId,
        offering.academicYearId,
        offering.stage,
        offering.programSemester,
        offering.isActive ? 1 : 0,
        offering.createdAt,
      ],
    );
  }

  listOfferingsByCourse(courseId: string): CourseOffering[] {
    const rows = this.db.query<Record<string, unknown>>(
      'SELECT * FROM course_offerings WHERE course_id = ? ORDER BY program_semester ASC;',
      [courseId],
    );
    return rows.map((r) => ({
      id: r['id'] as string,
      courseId: r['course_id'] as string,
      academicYearId: r['academic_year_id'] as string,
      stage: r['stage'] as Stage,
      programSemester: r['program_semester'] as ProgramSemester,
      isActive: Boolean(r['is_active']),
      createdAt: r['created_at'] as string,
    }));
  }

  // --- Course Pulses ---
  upsertCoursePulse(pulse: CoursePulse): void {
    this.db.run(
      `INSERT INTO course_pulses (
        id, course_offering_id, current_topic_id, current_subtopic_id, actual_teaching_week, progress_note, confidence_status, updated_by, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(course_offering_id) DO UPDATE SET
        current_topic_id = excluded.current_topic_id,
        current_subtopic_id = excluded.current_subtopic_id,
        actual_teaching_week = excluded.actual_teaching_week,
        progress_note = excluded.progress_note,
        confidence_status = excluded.confidence_status,
        updated_by = excluded.updated_by,
        updated_at = excluded.updated_at;`,
      [
        pulse.id,
        pulse.courseOfferingId,
        pulse.currentTopicId,
        pulse.currentSubtopicId,
        pulse.actualTeachingWeek,
        pulse.progressNote,
        pulse.confidenceStatus,
        pulse.updatedBy,
        pulse.updatedAt,
      ],
    );
  }

  getCoursePulse(courseOfferingId: string): CoursePulse | null {
    const row = this.db.queryOne<Record<string, unknown>>(
      'SELECT * FROM course_pulses WHERE course_offering_id = ?;',
      [courseOfferingId],
    );
    if (!row) return null;
    return {
      id: row['id'] as string,
      courseOfferingId: row['course_offering_id'] as string,
      currentTopicId: row['current_topic_id'] as string | null,
      currentSubtopicId: row['current_subtopic_id'] as string | null,
      actualTeachingWeek: row['actual_teaching_week'] as number | null,
      progressNote: row['progress_note'] as string | null,
      confidenceStatus: row['confidence_status'] as PulseConfidence,
      updatedBy: row['updated_by'] as string | null,
      updatedAt: row['updated_at'] as string,
    };
  }

  // --- Student Course States ---
  upsertStudentCourseState(state: StudentCourseState): void {
    this.db.run(
      `INSERT INTO student_course_states (
        id, student_id, course_offering_id, joined_at, baseline_topic_id, baseline_source, baseline_confidence, last_active_topic_id, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id, course_offering_id) DO UPDATE SET
        baseline_topic_id = excluded.baseline_topic_id,
        baseline_source = excluded.baseline_source,
        baseline_confidence = excluded.baseline_confidence,
        last_active_topic_id = excluded.last_active_topic_id,
        updated_at = excluded.updated_at;`,
      [
        state.id,
        state.studentId,
        state.courseOfferingId,
        state.joinedAt,
        state.baselineTopicId,
        state.baselineSource,
        state.baselineConfidence,
        state.lastActiveTopicId,
        state.updatedAt,
      ],
    );
  }

  getStudentCourseState(studentId: string, courseOfferingId: string): StudentCourseState | null {
    const row = this.db.queryOne<Record<string, unknown>>(
      'SELECT * FROM student_course_states WHERE student_id = ? AND course_offering_id = ?;',
      [studentId, courseOfferingId],
    );
    if (!row) return null;
    return {
      id: row['id'] as string,
      studentId: row['student_id'] as string,
      courseOfferingId: row['course_offering_id'] as string,
      joinedAt: row['joined_at'] as string,
      baselineTopicId: row['baseline_topic_id'] as string | null,
      baselineSource: row['baseline_source'] as BaselineSource,
      baselineConfidence: row['baseline_confidence'] as BaselineConfidence,
      lastActiveTopicId: row['last_active_topic_id'] as string | null,
      updatedAt: row['updated_at'] as string,
    };
  }

  // --- Course Staff Assignments ---
  createStaffAssignment(assignment: CourseStaffAssignment): void {
    this.db.run(
      `INSERT INTO course_staff_assignments (
        id, course_offering_id, staff_name, staff_title, role, academic_year_id, evidence_source_id, verification_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        assignment.id,
        assignment.courseOfferingId,
        assignment.staffName,
        assignment.staffTitle,
        assignment.role,
        assignment.academicYearId,
        assignment.evidenceSourceId,
        assignment.verificationStatus,
        assignment.createdAt,
      ],
    );
  }

  listStaffAssignments(courseOfferingId: string): CourseStaffAssignment[] {
    const rows = this.db.query<Record<string, unknown>>(
      'SELECT * FROM course_staff_assignments WHERE course_offering_id = ?;',
      [courseOfferingId],
    );
    return rows.map((r) => ({
      id: r['id'] as string,
      courseOfferingId: r['course_offering_id'] as string,
      staffName: r['staff_name'] as string,
      staffTitle: r['staff_title'] as string | null,
      role: r['role'] as StaffRole,
      academicYearId: r['academic_year_id'] as string,
      evidenceSourceId: r['evidence_source_id'] as string | null,
      verificationStatus: r['verification_status'] as VerificationStatus,
      createdAt: r['created_at'] as string,
    }));
  }
}
