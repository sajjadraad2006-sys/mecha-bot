import { Stage, ProgramSemester } from './stage-semester.js';
import { SourceAuthority } from './authority.js';
import { EvidenceScope } from './evidence.js';
import { AcademicTopic } from './topic.js';

export type TopicMapStatus = 'COMPLETE' | 'PARTIAL' | 'IDENTITY_ONLY' | 'CONFLICTING';

export interface AcademicEvidenceRef {
  scope: EvidenceScope;
  sourceTitle: string;
  authorityClass: SourceAuthority;
  academicYear?: string | undefined;
  isVerified: boolean;
  notes?: string | undefined;
  pageReference?: string | undefined;
}

export interface CourseProfile {
  courseCode: string;
  stage: Stage;
  programSemester: ProgramSemester;
  programSemesters?: ProgramSemester[] | undefined;
  displayNames: {
    en: string;
    ar: string;
  };
  aliases: string[];
  description?: string | undefined;
  topicMapStatus: TopicMapStatus;
  topics: AcademicTopic[];
  evidenceRefs: AcademicEvidenceRef[];
  notes?: string[] | undefined;
}
