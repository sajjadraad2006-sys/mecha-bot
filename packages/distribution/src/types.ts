export type DocumentType =
  | 'LECTURER_NOTE'
  | 'LECTURE_SLIDES'
  | 'PAST_EXAM'
  | 'QUIZ'
  | 'ASSIGNMENT'
  | 'STUDENT_NOTE'
  | 'TEXTBOOK'
  | 'SOLUTION_MANUAL'
  | 'OFFICIAL_PROGRAM'
  | 'OFFICIAL_SYLLABUS'
  | 'SUPPORTING_REFERENCE'
  | 'OTHER'
  | 'UNKNOWN';

export type SourceAuthority = 'OFFICIAL' | 'FACULTY' | 'STUDENT' | 'EXTERNAL' | 'UNKNOWN';

export type VerificationStatus = 'RAW' | 'CATALOGED' | 'VERIFIED' | 'REJECTED';

export type PolicyState = 'ALLOWED' | 'RESTRICTED' | 'UNKNOWN' | 'PROHIBITED';

export interface DistributionPolicyRecord {
  canSearch: boolean;
  canQuote: boolean;
  canDistribute: boolean;
  policyState: PolicyState;
  reason?: string | undefined;
}

export type StorageKind =
  | 'TELEGRAM_FILE_ID'
  | 'EXTERNAL_URL'
  | 'LOCAL_ARCHIVE_REFERENCE'
  | 'GOOGLE_DRIVE_REFERENCE'
  | 'UNKNOWN';

export interface StorageReferenceMetadata {
  telegramFileUniqueId?: string | undefined;
  vaultChatReference?: string | undefined;
  vaultMessageReference?: string | undefined;
  fileSizeBytes?: number | undefined;
  mimeType?: string | undefined;
}

export interface StorageReference {
  kind: StorageKind;
  value: string;
  metadata?: StorageReferenceMetadata | undefined;
}

export type FileVisibility = 'GLOBAL' | 'COURSE_SHARED' | 'PRIVATE_STUDENT';

export type ArchiveStatus = 'CURRENT' | 'ARCHIVE' | 'UNKNOWN';

export interface AcademicFileRecord {
  id: string;
  contentHash?: string | undefined;
  courseCode?: string | undefined;
  title: string;
  originalFilename?: string | undefined;
  documentType: DocumentType;
  academicYear?: string | undefined;
  sourceAuthority: SourceAuthority;
  evidenceScope?: string | undefined;
  verificationStatus: VerificationStatus;
  distributionPolicy: DistributionPolicyRecord;
  storageReference?: StorageReference | undefined;
  visibility: FileVisibility;
  studentKey?: string | undefined;
  archiveStatus: ArchiveStatus;
  versionLabel?: string | undefined;
  supersedes?: string | undefined;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  notes?: string | undefined;
}

export interface FileLookupCriteria {
  courseCode?: string | undefined;
  documentType?: DocumentType | undefined;
  academicYear?: string | undefined;
  verificationStatus?: VerificationStatus | undefined;
  archiveStatus?: ArchiveStatus | undefined;
  query?: string | undefined;
  requesterStudentKey?: string | undefined;
  distributableOnly?: boolean | undefined;
}

export type DeliveryDecisionStatus =
  | 'READY_TELEGRAM_FILE'
  | 'READY_EXTERNAL_LINK'
  | 'BLOCKED_POLICY'
  | 'NEEDS_SELECTION'
  | 'NOT_FOUND'
  | 'MISSING_STORAGE_REFERENCE';

export interface DeliveryDecision {
  status: DeliveryDecisionStatus;
  fileRecord?: AcademicFileRecord | undefined;
  storageReference?: StorageReference | undefined;
  externalUrl?: string | undefined;
  policy?: DistributionPolicyRecord | undefined;
  candidates?: AcademicFileRecord[] | undefined;
  reason: string;
}
