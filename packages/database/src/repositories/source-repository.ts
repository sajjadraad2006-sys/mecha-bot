import { DatabaseConnection } from '../connection.js';
import {
  Source,
  SourceEvidence,
  SourceVersion,
  SourceChunk,
  EvidenceScope,
} from '@mecha-bot/academic';

export class SourceRepository {
  constructor(private db: DatabaseConnection) {}

  createSource(source: Source): void {
    this.db.run(
      `INSERT INTO sources (
        id, course_id, title, source_type, authority_class, academic_year, lecturer_name, is_verified, distribution_permission, telegram_file_id, drive_file_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        source.id,
        source.courseId,
        source.title,
        source.sourceType,
        source.authorityClass,
        source.academicYear,
        source.lecturerName,
        source.isVerified ? 1 : 0,
        source.distributionPermission,
        source.telegramFileId,
        source.driveFileId,
        source.createdAt,
        source.updatedAt,
      ],
    );
  }

  getSourceById(id: string): Source | null {
    const row = this.db.queryOne<Record<string, unknown>>('SELECT * FROM sources WHERE id = ?;', [
      id,
    ]);
    if (!row) return null;
    return {
      id: row['id'] as string,
      courseId: row['course_id'] as string,
      title: row['title'] as string,
      sourceType: row['source_type'] as string,
      authorityClass: row['authority_class'] as string,
      academicYear: row['academic_year'] as string | null,
      lecturerName: row['lecturer_name'] as string | null,
      isVerified: Boolean(row['is_verified']),
      distributionPermission: row['distribution_permission'] as string,
      telegramFileId: row['telegram_file_id'] as string | null,
      driveFileId: row['drive_file_id'] as string | null,
      createdAt: row['created_at'] as string,
      updatedAt: row['updated_at'] as string,
    };
  }

  createSourceEvidence(evidence: SourceEvidence): void {
    this.db.run(
      `INSERT INTO source_evidence (
        id, source_id, evidence_scope, origin_url, origin_department, origin_university, academic_year, valid_from_academic_year, valid_to_academic_year, is_verified, verified_at, verified_by, distribution_allowed, access_rights_notes, searchable_copy_available, is_archived, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        evidence.id,
        evidence.sourceId,
        evidence.evidenceScope,
        evidence.originUrl,
        evidence.originDepartment,
        evidence.originUniversity,
        evidence.academicYear,
        evidence.validFromAcademicYear,
        evidence.validToAcademicYear,
        evidence.isVerified ? 1 : 0,
        evidence.verifiedAt,
        evidence.verifiedBy,
        evidence.distributionAllowed ? 1 : 0,
        evidence.accessRightsNotes,
        evidence.searchableCopyAvailable ? 1 : 0,
        evidence.isArchived ? 1 : 0,
        evidence.createdAt,
      ],
    );
  }

  getSourceEvidence(sourceId: string): SourceEvidence | null {
    const row = this.db.queryOne<Record<string, unknown>>(
      'SELECT * FROM source_evidence WHERE source_id = ?;',
      [sourceId],
    );
    if (!row) return null;
    return {
      id: row['id'] as string,
      sourceId: row['source_id'] as string,
      evidenceScope: row['evidence_scope'] as EvidenceScope,
      originUrl: row['origin_url'] as string | null,
      originDepartment: row['origin_department'] as string | null,
      originUniversity: row['origin_university'] as string | null,
      academicYear: row['academic_year'] as string | null,
      validFromAcademicYear: row['valid_from_academic_year'] as string | null,
      validToAcademicYear: row['valid_to_academic_year'] as string | null,
      isVerified: Boolean(row['is_verified']),
      verifiedAt: row['verified_at'] as string | null,
      verifiedBy: row['verified_by'] as string | null,
      distributionAllowed: Boolean(row['distribution_allowed']),
      accessRightsNotes: row['access_rights_notes'] as string | null,
      searchableCopyAvailable: Boolean(row['searchable_copy_available']),
      isArchived: Boolean(row['is_archived']),
      createdAt: row['created_at'] as string,
    };
  }

  createSourceVersion(version: SourceVersion): void {
    this.db.run(
      'INSERT INTO source_versions (id, source_id, version_number, checksum, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?);',
      [
        version.id,
        version.sourceId,
        version.versionNumber,
        version.checksum,
        version.fileSize,
        version.createdAt,
      ],
    );
  }

  createSourceChunk(chunk: SourceChunk): void {
    this.db.run(
      'INSERT INTO source_chunks (id, source_version_id, topic_id, page_number, chunk_index, content, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      [
        chunk.id,
        chunk.sourceVersionId,
        chunk.topicId,
        chunk.pageNumber,
        chunk.chunkIndex,
        chunk.content,
        chunk.metadataJson,
        chunk.createdAt,
      ],
    );
  }
}
