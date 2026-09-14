import { EvidenceScope } from './evidence.js';
import { AcademicEvidenceRef } from './profile.js';

export type AcademicFactStatus =
  'CONFIRMED' | 'CANDIDATE' | 'CONFLICTING' | 'OUTDATED' | 'SUPERSEDED' | 'REJECTED' | 'UNKNOWN';

export interface AcademicSubtopic {
  subtopicKey: string;
  titleEn: string;
  titleAr?: string | undefined;
  orderIndex?: number | undefined;
  status: AcademicFactStatus;
  evidenceRefs: AcademicEvidenceRef[];
  notes?: string[] | undefined;
}

export interface AcademicTopic {
  topicKey: string;
  courseCode: string;
  titleEn: string;
  titleAr?: string | undefined;
  orderIndex?: number | undefined;
  nominalWeek?: number | undefined;
  parentTopicKey?: string | undefined;
  subtopics?: AcademicSubtopic[] | undefined;
  status: AcademicFactStatus;
  evidenceRefs: AcademicEvidenceRef[];
  notes?: string[] | undefined;
}

export interface TopicPrerequisite {
  topicKey: string;
  prerequisiteTopicKey: string;
  status: AcademicFactStatus;
  evidenceScope: EvidenceScope;
  notes?: string | undefined;
}

export type AliasStatus = 'CURATED' | 'STUDENT_SUGGESTED' | 'REJECTED';

export interface CuratedCourseAlias {
  courseCode: string;
  alias: string;
  normalizedAlias: string;
  locale: 'ar' | 'en' | 'all';
  status: AliasStatus;
  notes?: string | undefined;
}

export interface TopicAlias {
  courseCode: string;
  topicKey: string;
  alias: string;
  normalizedAlias: string;
  locale: 'ar' | 'en' | 'all';
  status: AliasStatus;
}
