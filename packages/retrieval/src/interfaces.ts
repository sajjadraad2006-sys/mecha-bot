import { SourceAuthority, RetrievalIntent, EvidenceScope } from '@mecha-bot/academic';

export interface RetrievalQuery {
  query: string;
  courseId?: string;
  topicId?: string;
  intent?: RetrievalIntent;
  limit?: number;
}

export interface RetrievalSnippet {
  sourceId: string;
  sourceVersionId: string;
  courseId: string;
  topicId: string | null;
  pageNumber: number | null;
  snippet: string;
  authority: SourceAuthority;
  evidenceScope: EvidenceScope;
  score: number;
}

export interface RetrievalResult {
  query: string;
  snippets: RetrievalSnippet[];
  totalFound: number;
}

export interface RetrievalProvider {
  search(query: RetrievalQuery): Promise<RetrievalResult>;
}
