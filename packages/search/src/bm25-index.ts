/**
 * Deterministic In-Memory BM25 Lexical Search Index for Mecha Bot.
 * Zero external search service, zero network, zero embeddings.
 */

import { createHash } from 'node:crypto';
import { extractTermFrequencies, tokenize } from './tokenizer.js';
import type { SearchDocument } from './types.js';

export interface BM25Parameters {
  k1?: number; // Term frequency saturation parameter (default: 1.2)
  b?: number; // Length normalization parameter (default: 0.75)
}

export interface ScoredCandidate {
  document: SearchDocument;
  lexicalScore: number;
  matchedTokens: string[];
}

export class BM25Index {
  private readonly k1: number;
  private readonly b: number;

  // document.id -> SearchDocument
  private readonly docs = new Map<string, SearchDocument>();
  // document.id -> token count |D|
  private readonly docLengths = new Map<string, number>();
  // document.id -> Map<term, frequency>
  private readonly docTermFreqs = new Map<string, Map<string, number>>();
  // term -> Set of document.id
  private readonly invertedIndex = new Map<string, Set<string>>();

  private totalTokens = 0;

  constructor(params: BM25Parameters = {}) {
    this.k1 = params.k1 ?? 1.2;
    this.b = params.b ?? 0.75;
  }

  /**
   * Index a single SearchDocument.
   */
  public indexDocument(doc: SearchDocument): void {
    if (this.docs.has(doc.id)) {
      this.removeDocumentById(doc.id);
    }

    const tokens = tokenize(doc.textNormalized || doc.textOriginal);
    const docLen = tokens.length;
    const termFreqs = extractTermFrequencies(tokens);

    this.docs.set(doc.id, doc);
    this.docLengths.set(doc.id, docLen);
    this.docTermFreqs.set(doc.id, termFreqs);
    this.totalTokens += docLen;

    for (const term of termFreqs.keys()) {
      let postingList = this.invertedIndex.get(term);
      if (!postingList) {
        postingList = new Set<string>();
        this.invertedIndex.set(term, postingList);
      }
      postingList.add(doc.id);
    }
  }

  /**
   * Index multiple SearchDocuments.
   */
  public indexDocuments(documents: SearchDocument[]): void {
    for (const doc of documents) {
      this.indexDocument(doc);
    }
  }

  /**
   * Remove a single document by its unique chunk/record ID.
   */
  public removeDocumentById(id: string): boolean {
    const doc = this.docs.get(id);
    if (!doc) return false;

    const docLen = this.docLengths.get(id) ?? 0;
    this.totalTokens -= docLen;
    this.docLengths.delete(id);

    const termFreqs = this.docTermFreqs.get(id);
    if (termFreqs) {
      for (const term of termFreqs.keys()) {
        const postingList = this.invertedIndex.get(term);
        if (postingList) {
          postingList.delete(id);
          if (postingList.size === 0) {
            this.invertedIndex.delete(term);
          }
        }
      }
      this.docTermFreqs.delete(id);
    }

    this.docs.delete(id);
    return true;
  }

  /**
   * Remove all chunks associated with an M6 parent documentId.
   */
  public removeDocument(documentId: string): number {
    let removedCount = 0;
    const idsToRemove: string[] = [];

    for (const [id, doc] of this.docs.entries()) {
      if (doc.documentId === documentId) {
        idsToRemove.push(id);
      }
    }

    for (const id of idsToRemove) {
      if (this.removeDocumentById(id)) {
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Replace all chunks for a given M6 parent documentId with new documents.
   */
  public replaceDocument(documentId: string, newDocuments: SearchDocument[]): void {
    this.removeDocument(documentId);
    this.indexDocuments(newDocuments);
  }

  /**
   * Clear all indexed documents.
   */
  public clear(): void {
    this.docs.clear();
    this.docLengths.clear();
    this.docTermFreqs.clear();
    this.invertedIndex.clear();
    this.totalTokens = 0;
  }

  /**
   * Total number of indexed chunks.
   */
  public getDocumentCount(): number {
    return this.docs.size;
  }

  /**
   * Average document length across the index.
   */
  public getAvgDocLength(): number {
    const N = this.docs.size;
    if (N === 0) return 0;
    return this.totalTokens / N;
  }

  /**
   * Compute standard Robertson-Spärck Jones IDF with smoothing.
   */
  public computeIDF(term: string): number {
    const N = this.docs.size;
    const n = this.invertedIndex.get(term)?.size ?? 0;
    if (N === 0 || n === 0) return 0;
    // Smoothed non-negative BM25 IDF
    return Math.log(1 + (N - n + 0.5) / (n + 0.5));
  }

  /**
   * Search candidate documents using BM25.
   * Returns candidates with non-zero lexical scores sorted descending.
   */
  public searchCandidates(queryTokens: string[]): ScoredCandidate[] {
    if (queryTokens.length === 0 || this.docs.size === 0) {
      return [];
    }

    const avgdl = this.getAvgDocLength();
    const candidateScores = new Map<string, { score: number; matched: Set<string> }>();

    for (const token of queryTokens) {
      const postingList = this.invertedIndex.get(token);
      if (!postingList || postingList.size === 0) {
        continue;
      }

      const idf = this.computeIDF(token);

      for (const docId of postingList) {
        const tf = this.docTermFreqs.get(docId)?.get(token) ?? 0;
        const docLen = this.docLengths.get(docId) ?? avgdl;

        // BM25 term score
        const numerator = tf * (this.k1 + 1);
        const denominator = tf + this.k1 * (1 - this.b + this.b * (docLen / (avgdl || 1)));
        const termScore = idf * (numerator / denominator);

        const current = candidateScores.get(docId);
        if (!current) {
          const matchedSet = new Set<string>();
          matchedSet.add(token);
          candidateScores.set(docId, { score: termScore, matched: matchedSet });
        } else {
          current.score += termScore;
          current.matched.add(token);
        }
      }
    }

    const results: ScoredCandidate[] = [];
    for (const [docId, data] of candidateScores.entries()) {
      const doc = this.docs.get(docId);
      if (doc && data.score > 0) {
        results.push({
          document: doc,
          lexicalScore: data.score,
          matchedTokens: Array.from(data.matched),
        });
      }
    }

    // Sort descending by lexical score, breaking ties by documentId deterministically
    results.sort((a, b) => {
      if (Math.abs(b.lexicalScore - a.lexicalScore) > 1e-9) {
        return b.lexicalScore - a.lexicalScore;
      }
      return a.document.id.localeCompare(b.document.id);
    });

    return results;
  }

  /**
   * Retrieves all documents in the index (useful for filtered scans without query text).
   */
  public getAllDocuments(): SearchDocument[] {
    return Array.from(this.docs.values());
  }

  /**
   * Deterministically calculates an index version based on indexed content identities.
   */
  public getIndexVersion(): string {
    const sortedIds = Array.from(this.docs.keys()).sort();
    const hash = createHash('sha256');
    hash.update(`count:${this.docs.size};tokens:${this.totalTokens};`);
    for (const id of sortedIds) {
      const doc = this.docs.get(id);
      if (doc) {
        hash.update(`${doc.id}:${doc.documentId}:${doc.textNormalized.length};`);
      }
    }
    return `idx_${hash.digest('hex').substring(0, 16)}`;
  }
}
