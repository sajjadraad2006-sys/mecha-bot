export enum EvidenceScope {
  EXACT_COURSE = 'EXACT_COURSE',
  SAME_DEPARTMENT_ARCHIVE = 'SAME_DEPARTMENT_ARCHIVE',
  SAME_UNIVERSITY_RELATED_COURSE = 'SAME_UNIVERSITY_RELATED_COURSE',
  OPEN_ACADEMIC_EQUIVALENT = 'OPEN_ACADEMIC_EQUIVALENT',
  BIBLIOGRAPHIC_ONLY = 'BIBLIOGRAPHIC_ONLY',
  STUDENT_PROVIDED = 'STUDENT_PROVIDED',
}

export interface SourceEvidence {
  id: string;
  sourceId: string;
  evidenceScope: EvidenceScope;
  originUrl: string | null;
  originDepartment: string | null;
  originUniversity: string | null;
  academicYear: string | null;
  validFromAcademicYear: string | null;
  validToAcademicYear: string | null;
  isVerified: boolean;
  verifiedAt: string | null; // UTC ISO string
  verifiedBy: string | null;
  distributionAllowed: boolean;
  accessRightsNotes: string | null;
  searchableCopyAvailable: boolean;
  isArchived: boolean;
  createdAt: string; // UTC ISO string
}

export interface Source {
  id: string;
  courseId: string;
  title: string;
  sourceType: string; // 'LECTURE_NOTE' | 'SYLLABUS' | 'TEXTBOOK' | 'EXAM_PAPER' | 'LAB_MANUAL'
  authorityClass: string; // SourceAuthority enum value
  academicYear: string | null;
  lecturerName: string | null;
  isVerified: boolean;
  distributionPermission: string; // 'ALLOWED' | 'RESTRICTED' | 'PROHIBITED'
  telegramFileId: string | null;
  driveFileId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SourceVersion {
  id: string;
  sourceId: string;
  versionNumber: number;
  checksum: string;
  fileSize: number | null;
  createdAt: string;
}

export interface SourceChunk {
  id: string;
  sourceVersionId: string;
  topicId: string | null;
  pageNumber: number | null;
  chunkIndex: number;
  content: string;
  metadataJson: string | null;
  createdAt: string;
}
