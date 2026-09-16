import type { SearchEngine, SearchResult } from '@mecha-bot/search';
import type { AcademicScope, AcademicSourceExcerpt } from './interfaces.js';

export interface GroundingResult {
  hasSufficientEvidence: boolean;
  excerpts: AcademicSourceExcerpt[];
  searchScoreMax: number;
  unresolvedGaps: string[];
}

export interface GroundingOptions {
  maxChunks?: number | undefined;
  minRelevanceScore?: number | undefined;
}

export class AcademicGroundingEngine {
  private searchEngine?: SearchEngine | undefined;
  private maxChunks: number;
  private minRelevanceScore: number;

  constructor(searchEngine?: SearchEngine | undefined, options?: GroundingOptions | undefined) {
    this.searchEngine = searchEngine;
    this.maxChunks = options?.maxChunks ?? 3;
    this.minRelevanceScore = options?.minRelevanceScore ?? 0.1;
  }

  public setSearchEngine(searchEngine: SearchEngine): void {
    this.searchEngine = searchEngine;
  }

  /**
   * Retrieves strictly scoped academic evidence for a student query.
   * Enforces exact course scope and evidence budgeting.
   */
  public async retrieveGroundedEvidence(
    question: string,
    scope?: AcademicScope | null | undefined,
  ): Promise<GroundingResult> {
    if (!this.searchEngine) {
      return {
        hasSufficientEvidence: false,
        excerpts: [],
        searchScoreMax: 0,
        unresolvedGaps: ['SearchEngine is not configured.'],
      };
    }

    // Exact course scoped search
    const searchResponse = this.searchEngine.search({
      text: question,
      courseCode: scope?.courseCode,
      topicKey: scope?.topicKey,
      allowRelatedCourses: false, // Strict exact course boundary
      limit: this.maxChunks * 2, // Fetch slightly more to deduplicate
      intent: 'CONCEPT_EXPLANATION',
    });

    if (searchResponse.results.length === 0) {
      return {
        hasSufficientEvidence: false,
        excerpts: [],
        searchScoreMax: 0,
        unresolvedGaps: [
          `No verified academic source documents found for course ${scope?.courseCode ?? 'catalog'}.`,
        ],
      };
    }

    // Deduplicate and filter by score
    const deduplicated: SearchResult[] = [];
    const seenDocumentIds = new Set<string>();

    for (const result of searchResponse.results) {
      if (result.score < this.minRelevanceScore) continue;

      // Deduplicate overlapping excerpts from same document and page
      const docKey = `${result.documentId}_${result.page ?? '0'}`;
      if (seenDocumentIds.has(docKey)) continue;

      seenDocumentIds.add(docKey);
      deduplicated.push(result);

      if (deduplicated.length >= this.maxChunks) break;
    }

    const excerpts: AcademicSourceExcerpt[] = deduplicated.map((hit) => ({
      sourceId: hit.documentId,
      sourceVersion: hit.provenance?.originKind ?? undefined,
      chunkId: hit.chunkId ?? hit.id,
      title: hit.provenance?.originalFilename ?? `مصدر أكاديمي (${hit.courseCode ?? 'عام'})`,
      excerpt: hit.textOriginal || hit.textExcerpt,
      page: hit.page,
      pageRange: hit.pageRange,
      authority: hit.authority,
      evidenceScope: hit.evidenceScope,
      canDistribute: hit.canDistribute,
    }));

    const searchScoreMax = deduplicated[0]?.score ?? 0;
    const hasSufficientEvidence = excerpts.length > 0 && searchScoreMax >= this.minRelevanceScore;

    return {
      hasSufficientEvidence,
      excerpts,
      searchScoreMax,
      unresolvedGaps: hasSufficientEvidence
        ? []
        : ['Retrieved evidence does not meet minimum relevance threshold.'],
    };
  }
}
