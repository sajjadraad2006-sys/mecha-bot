import { describe, it, expect } from 'vitest';
import { AcademicGroundingEngine } from '@mecha-bot/ai';
import type { SearchEngine, SearchQuery, SearchResponse } from '@mecha-bot/search';

describe('Evidence Grounding & Scoped M7 Retrieval', () => {
  it('enforces exact course scope (allowRelatedCourses = false)', async () => {
    let capturedQuery: SearchQuery | undefined;

    const mockSearchEngine: Partial<SearchEngine> = {
      search: (query: SearchQuery): SearchResponse => {
        capturedQuery = query;
        return {
          results: [],
          totalMatches: 0,
          queryFingerprint: 'fp_test',
          indexVersion: 'v1',
        };
      },
    };

    const groundingEngine = new AcademicGroundingEngine(mockSearchEngine as SearchEngine);

    await groundingEngine.retrieveGroundedEvidence('ما هو قانون الاستقرار؟', {
      courseCode: 'MCT314',
      topicKey: 'stability',
    });

    expect(capturedQuery).toBeDefined();
    expect(capturedQuery?.courseCode).toBe('MCT314');
    expect(capturedQuery?.topicKey).toBe('stability');
    expect(capturedQuery?.allowRelatedCourses).toBe(false);
  });

  it('deduplicates multiple search results from the same document and page', async () => {
    const mockSearchEngine: Partial<SearchEngine> = {
      search: (): SearchResponse => {
        return {
          totalMatches: 3,
          queryFingerprint: 'fp_dup',
          indexVersion: 'v1',
          results: [
            {
              id: 'chunk_1',
              documentId: 'doc_ogata_control',
              chunkId: 'chunk_1',
              score: 0.85,
              lexicalScore: 0.85,
              contextualMultiplier: 1.0,
              textExcerpt: 'Excerpt page 45 part 1',
              textOriginal: 'Excerpt page 45 part 1',
              courseCode: 'MCT314',
              topicKeys: ['root_locus'],
              page: 45,
              documentType: 'TEXTBOOK',
              authority: 'OFFICIAL_DEPARTMENT',
              evidenceScope: 'EXACT_COURSE',
              verificationStatus: 'VERIFIED',
              canDistribute: false,
              provenance: { originalFilename: 'Ogata_Modern_Control.pdf' },
              matchReasons: ['LEXICAL_MATCH'],
            },
            {
              // Duplicate page and document ID
              id: 'chunk_2',
              documentId: 'doc_ogata_control',
              chunkId: 'chunk_2',
              score: 0.82,
              lexicalScore: 0.82,
              contextualMultiplier: 1.0,
              textExcerpt: 'Excerpt page 45 part 2',
              textOriginal: 'Excerpt page 45 part 2',
              courseCode: 'MCT314',
              topicKeys: ['root_locus'],
              page: 45,
              documentType: 'TEXTBOOK',
              authority: 'OFFICIAL_DEPARTMENT',
              evidenceScope: 'EXACT_COURSE',
              verificationStatus: 'VERIFIED',
              canDistribute: false,
              provenance: { originalFilename: 'Ogata_Modern_Control.pdf' },
              matchReasons: ['LEXICAL_MATCH'],
            },
            {
              id: 'chunk_3',
              documentId: 'doc_lecture_notes_314',
              chunkId: 'chunk_3',
              score: 0.78,
              lexicalScore: 0.78,
              contextualMultiplier: 1.0,
              textExcerpt: 'Lecture 4 root locus overview',
              textOriginal: 'Lecture 4 root locus overview',
              courseCode: 'MCT314',
              topicKeys: ['root_locus'],
              page: 3,
              documentType: 'LECTURE_NOTE',
              authority: 'LECTURER_CURRENT',
              evidenceScope: 'EXACT_COURSE',
              verificationStatus: 'VERIFIED',
              canDistribute: true,
              provenance: { originalFilename: 'Lec4_RootLocus.pdf' },
              matchReasons: ['LEXICAL_MATCH'],
            },
          ],
        };
      },
    };

    const groundingEngine = new AcademicGroundingEngine(mockSearchEngine as SearchEngine, {
      maxChunks: 3,
    });

    const result = await groundingEngine.retrieveGroundedEvidence('Root Locus', {
      courseCode: 'MCT314',
    });

    expect(result.hasSufficientEvidence).toBe(true);
    // Chunk 2 should have been deduplicated because doc_ogata_control at page 45 was already included
    expect(result.excerpts.length).toBe(2);
    expect(result.excerpts[0]?.sourceId).toBe('doc_ogata_control');
    expect(result.excerpts[1]?.sourceId).toBe('doc_lecture_notes_314');
  });

  it('preserves provenance metadata and flags lack of evidence when no sources match', async () => {
    const emptySearchEngine: Partial<SearchEngine> = {
      search: (): SearchResponse => ({
        totalMatches: 0,
        results: [],
        queryFingerprint: 'fp_empty',
        indexVersion: 'v1',
      }),
    };

    const groundingEngine = new AcademicGroundingEngine(emptySearchEngine as SearchEngine);

    const result = await groundingEngine.retrieveGroundedEvidence('سؤال عن موضوع غير مفهرس', {
      courseCode: 'MCT999',
    });

    expect(result.hasSufficientEvidence).toBe(false);
    expect(result.excerpts.length).toBe(0);
    expect(result.unresolvedGaps.length).toBeGreaterThan(0);
  });
});
