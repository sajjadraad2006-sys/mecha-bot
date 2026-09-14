/**
 * Search & Retrieval Foundation Types and Contracts for Mecha Bot.
 * Compatible with Mecha Bot academic evidence model.
 */

export type RetrievalIntent =
  | 'CONCEPT_EXPLANATION'
  | 'EXAM_LOOKUP'
  | 'LECTURER_REQUIREMENTS'
  | 'OFFICIAL_IDENTITY'
  | 'GENERAL_SEARCH';

export type MatchReason =
  | 'LEXICAL_MATCH'
  | 'EXACT_COURSE_FILTER'
  | 'TOPIC_MATCH'
  | 'EXAM_INTENT_MATCH'
  | 'AUTHORITY_CONTEXT_MATCH'
  | 'VERIFICATION_FILTER_MATCH';

export type NoResultReason =
  'NO_INDEXED_CONTENT' | 'NO_COURSE_MATCH' | 'FILTERED_BY_VERIFICATION' | 'NO_LEXICAL_MATCH';

export interface DocumentProvenance {
  sourceId?: string | undefined;
  originUrl?: string | null | undefined;
  originalFilename?: string | undefined;
  originKind?: string | undefined;
}

/**
 * Fundamental searchable unit.
 * NEVER contains raw binary file buffers or paths directly exposed to end users.
 */
export interface SearchDocument {
  id: string; // Unique chunk/record ID
  documentId: string; // Parent M6 Document ID (e.g. doc_<hash>)
  chunkId?: string | undefined;

  courseCode?: string | undefined; // e.g. MCT314, MCT111
  topicKeys: string[]; // Associated topic keys e.g. ["root_locus", "stability"]

  title?: string | undefined;
  textOriginal: string;
  textNormalized: string;

  page?: number | undefined;
  pageRange?: [number, number] | undefined;
  documentType: string; // LECTURER_NOTE, PAST_EXAM, TEXTBOOK, etc.

  sourceAuthority: string; // OFFICIAL_DEPARTMENT, LECTURER_CURRENT, STUDENT_SUBMITTED, etc.
  evidenceScope: string; // EXACT_COURSE, SAME_DEPARTMENT_ARCHIVE, SAME_UNIVERSITY_RELATED_COURSE, etc.
  verificationStatus: string; // RAW, CATALOGED, VERIFIED, REJECTED

  academicYear?: string | undefined;
  currentArchiveStatus?: string | undefined;

  canSearch: boolean;
  canQuote: boolean;
  canDistribute: boolean;

  provenance: DocumentProvenance;
}

export interface SearchQuery {
  text: string;
  courseCode?: string | undefined;
  topicKey?: string | undefined;
  documentTypes?: string[] | undefined;
  academicYear?: string | undefined;
  sourceAuthorities?: string[] | undefined;
  evidenceScopes?: string[] | undefined;
  verificationStatuses?: string[] | undefined;
  limit?: number | undefined;
  intent?: RetrievalIntent | undefined;
  allowRelatedCourses?: boolean | undefined; // default false (exact course scoped)
  allowUnverifiedCataloged?: boolean | undefined; // default true for CATALOGED if query policy allows
  debug?: boolean | undefined;
}

export interface SearchResult {
  id: string;
  documentId: string;
  chunkId?: string | undefined;
  score: number;
  lexicalScore: number;
  contextualMultiplier: number;
  textExcerpt: string;
  textOriginal: string;
  courseCode?: string | undefined;
  topicKeys: string[];
  page?: number | undefined;
  pageRange?: [number, number] | undefined;
  documentType: string;
  authority: string;
  evidenceScope: string;
  verificationStatus: string;
  canDistribute: boolean;
  provenance: DocumentProvenance;
  matchReasons: MatchReason[];
}

export interface SearchResponse {
  results: SearchResult[];
  totalMatches: number;
  queryFingerprint: string;
  indexVersion: string;
  diagnosticReason?: NoResultReason | undefined;
  debug?:
    | {
        normalizedQuery: string;
        tokens: string[];
        candidateCount: number;
        returnedCount: number;
        durationMs: number;
      }
    | undefined;
}
