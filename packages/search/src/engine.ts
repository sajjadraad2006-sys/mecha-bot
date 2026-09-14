/**
 * Main Deterministic Search & Retrieval Engine for Mecha Bot.
 * Combines BM25 lexical ranking, intent-aware contextual policies,
 * deterministic query fingerprinting, and diagnostic reporting.
 */

import { BM25Index, type BM25Parameters } from './bm25-index.js';
import { ContextualPolicyEngine } from './contextual-policy.js';
import { computeQueryFingerprint } from './fingerprint.js';
import { normalizeText } from './normalizer.js';
import { tokenize } from './tokenizer.js';
import type {
  NoResultReason,
  SearchDocument,
  SearchQuery,
  SearchResponse,
  SearchResult,
} from './types.js';

export interface SearchEngineOptions {
  bm25Params?: BM25Parameters;
}

export class SearchEngine {
  private readonly index: BM25Index;
  private readonly policy: ContextualPolicyEngine;

  constructor(options: SearchEngineOptions = {}) {
    this.index = new BM25Index(options.bm25Params);
    this.policy = new ContextualPolicyEngine();
  }

  /**
   * Index a single SearchDocument.
   * If canSearch is false, the document is rejected from the index.
   */
  public indexDocument(doc: SearchDocument): boolean {
    if (!doc.canSearch) {
      return false;
    }
    this.index.indexDocument(doc);
    return true;
  }

  /**
   * Index multiple SearchDocuments.
   */
  public indexDocuments(docs: SearchDocument[]): number {
    let indexed = 0;
    for (const doc of docs) {
      if (this.indexDocument(doc)) {
        indexed++;
      }
    }
    return indexed;
  }

  /**
   * Remove all chunks associated with an M6 parent documentId.
   */
  public removeDocument(documentId: string): number {
    return this.index.removeDocument(documentId);
  }

  /**
   * Replace all chunks for an M6 parent documentId.
   */
  public replaceDocument(documentId: string, newDocuments: SearchDocument[]): void {
    this.removeDocument(documentId);
    this.indexDocuments(newDocuments);
  }

  /**
   * Clear the entire search index.
   */
  public clear(): void {
    this.index.clear();
  }

  /**
   * Total number of indexed chunks.
   */
  public getDocumentCount(): number {
    return this.index.getDocumentCount();
  }

  /**
   * Stable deterministic index version string.
   */
  public getIndexVersion(): string {
    return this.index.getIndexVersion();
  }

  /**
   * Execute a deterministic search query.
   */
  public search(query: SearchQuery): SearchResponse {
    const startTime = performance.now();
    const indexVersion = this.getIndexVersion();
    const fingerprint = computeQueryFingerprint(query, indexVersion);
    const limit = query.limit ?? 10;

    // Diagnostic case 1: Completely empty index
    if (this.index.getDocumentCount() === 0) {
      return {
        results: [],
        totalMatches: 0,
        queryFingerprint: fingerprint,
        indexVersion,
        diagnosticReason: 'NO_INDEXED_CONTENT',
        ...(query.debug
          ? {
              debug: {
                normalizedQuery: normalizeText(query.text),
                tokens: [],
                candidateCount: 0,
                returnedCount: 0,
                durationMs: performance.now() - startTime,
              },
            }
          : {}),
      };
    }

    const queryTokens = tokenize(query.text);
    const hasQueryText = queryTokens.length > 0;

    // Candidate selection
    interface CandidateItem {
      document: SearchDocument;
      lexicalScore: number;
      matchedTokens: string[];
    }

    let candidates: CandidateItem[];

    if (hasQueryText) {
      // BM25 lexical candidates
      candidates = this.index.searchCandidates(queryTokens);
    } else {
      // Filter-only search (no lexical text query)
      candidates = this.index.getAllDocuments().map((doc) => ({
        document: doc,
        lexicalScore: 1.0,
        matchedTokens: [],
      }));
    }

    // Two-stage ranking & policy filtering
    const scoredResults: SearchResult[] = [];
    let hadCourseMismatch = false;
    let hadVerificationExclusion = false;

    for (const candidate of candidates) {
      const doc = candidate.document;
      const evalResult = this.policy.evaluate(doc, query, candidate.matchedTokens.length > 0);

      if (!evalResult.isEligible) {
        if (evalResult.exclusionReason === 'COURSE_MISMATCH_EXCLUDED') {
          hadCourseMismatch = true;
        } else if (
          evalResult.exclusionReason === 'VERIFICATION_REJECTED' ||
          evalResult.exclusionReason === 'RAW_EXCLUDED_BY_DEFAULT' ||
          evalResult.exclusionReason === 'CATALOGED_EXCLUDED_BY_POLICY' ||
          evalResult.exclusionReason === 'FILTERED_BY_VERIFICATION_STATUS'
        ) {
          hadVerificationExclusion = true;
        }
        continue;
      }

      const finalScore = candidate.lexicalScore * evalResult.contextualMultiplier;

      // Extract brief clean excerpt
      const excerpt = this.createExcerpt(doc.textOriginal, candidate.matchedTokens);

      scoredResults.push({
        id: doc.id,
        documentId: doc.documentId,
        chunkId: doc.chunkId,
        score: Number(finalScore.toFixed(4)),
        lexicalScore: Number(candidate.lexicalScore.toFixed(4)),
        contextualMultiplier: Number(evalResult.contextualMultiplier.toFixed(4)),
        textExcerpt: excerpt,
        textOriginal: doc.textOriginal,
        courseCode: doc.courseCode,
        topicKeys: [...doc.topicKeys],
        page: doc.page,
        pageRange: doc.pageRange,
        documentType: doc.documentType,
        authority: doc.sourceAuthority,
        evidenceScope: doc.evidenceScope,
        verificationStatus: doc.verificationStatus,
        canDistribute: doc.canDistribute,
        provenance: { ...doc.provenance },
        matchReasons: evalResult.matchReasons,
      });
    }

    // Deterministic sort: primary by finalScore descending, secondary by doc ID
    scoredResults.sort((a, b) => {
      if (Math.abs(b.score - a.score) > 1e-6) {
        return b.score - a.score;
      }
      return a.id.localeCompare(b.id);
    });

    const totalMatches = scoredResults.length;
    const paginated = scoredResults.slice(0, limit);

    // Determine diagnostic reason if 0 results
    let diagnosticReason: NoResultReason | undefined = undefined;
    if (totalMatches === 0) {
      if (hadCourseMismatch && candidates.length > 0) {
        diagnosticReason = 'NO_COURSE_MATCH';
      } else if (hadVerificationExclusion && candidates.length > 0) {
        diagnosticReason = 'FILTERED_BY_VERIFICATION';
      } else if (hasQueryText && candidates.length === 0) {
        diagnosticReason = 'NO_LEXICAL_MATCH';
      } else {
        diagnosticReason = 'NO_LEXICAL_MATCH';
      }
    }

    return {
      results: paginated,
      totalMatches,
      queryFingerprint: fingerprint,
      indexVersion,
      diagnosticReason,
      ...(query.debug
        ? {
            debug: {
              normalizedQuery: normalizeText(query.text),
              tokens: queryTokens,
              candidateCount: candidates.length,
              returnedCount: paginated.length,
              durationMs: Number((performance.now() - startTime).toFixed(2)),
            },
          }
        : {}),
    };
  }

  /**
   * Helper to create a representative excerpt around matched terms or from beginning.
   */
  private createExcerpt(textOriginal: string, matchedTokens: string[]): string {
    const clean = textOriginal.replace(/\s+/g, ' ').trim();
    if (clean.length <= 220) return clean;

    if (matchedTokens.length > 0) {
      const lower = clean.toLowerCase();
      for (const token of matchedTokens) {
        const idx = lower.indexOf(token.toLowerCase());
        if (idx !== -1) {
          const start = Math.max(0, idx - 40);
          const end = Math.min(clean.length, idx + 160);
          const prefix = start > 0 ? '...' : '';
          const suffix = end < clean.length ? '...' : '';
          return `${prefix}${clean.substring(start, end).trim()}${suffix}`;
        }
      }
    }

    return `${clean.substring(0, 200).trim()}...`;
  }
}
