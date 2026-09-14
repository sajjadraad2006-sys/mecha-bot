import { describe, it, expect, beforeEach } from 'vitest';
import {
  BM25Index,
  SearchEngine,
  normalizeArabic,
  normalizeEnglish,
  normalizeText,
  removeTashkeel,
  tokenize,
  computeQueryFingerprint,
  type SearchDocument,
} from '@mecha-bot/search';

describe('Search Index, Normalization & Query Determinism', () => {
  let engine: SearchEngine;

  const createSampleDoc = (overrides: Partial<SearchDocument> = {}): SearchDocument => {
    const textOriginal =
      overrides.textOriginal ??
      'Root locus shows the trajectory of closed-loop poles in the s-plane.';
    const textNormalized = overrides.textNormalized ?? normalizeText(textOriginal);
    return {
      id: 'doc1_p1_c1',
      documentId: 'doc1',
      chunkId: 'c1',
      courseCode: 'MCT314',
      topicKeys: ['root_locus', 'stability'],
      title: 'Control Systems Notes',
      page: 1,
      pageRange: [1, 1],
      documentType: 'LECTURER_NOTE',
      sourceAuthority: 'LECTURER_CURRENT',
      evidenceScope: 'EXACT_COURSE',
      verificationStatus: 'CATALOGED',
      academicYear: '2026-2027',
      canSearch: true,
      canQuote: true,
      canDistribute: false,
      provenance: {
        originalFilename: 'control_lecture_1.pdf',
      },
      ...overrides,
      textOriginal,
      textNormalized,
    };
  };

  beforeEach(() => {
    engine = new SearchEngine();
  });

  it('indexes a single document and retrieves it by lexical query', () => {
    const doc = createSampleDoc();
    const indexed = engine.indexDocument(doc);
    expect(indexed).toBe(true);
    expect(engine.getDocumentCount()).toBe(1);

    const response = engine.search({ text: 'root locus' });
    expect(response.results.length).toBe(1);
    expect(response.results[0]!.id).toBe(doc.id);
    expect(response.results[0]!.lexicalScore).toBeGreaterThan(0);
    expect(response.results[0]!.matchReasons).toContain('LEXICAL_MATCH');
  });

  it('indexes multiple documents and maintains accurate counts', () => {
    const doc1 = createSampleDoc({
      id: 'd1_c1',
      documentId: 'd1',
      textOriginal: 'Root locus analysis',
    });
    const doc2 = createSampleDoc({
      id: 'd2_c1',
      documentId: 'd2',
      textOriginal: 'Bode plot frequency response',
    });
    const doc3 = createSampleDoc({
      id: 'd3_c1',
      documentId: 'd3',
      textOriginal: 'State space representation',
    });

    engine.indexDocuments([doc1, doc2, doc3]);
    expect(engine.getDocumentCount()).toBe(3);

    const response = engine.search({ text: 'bode frequency' });
    expect(response.results.length).toBe(1);
    expect(response.results[0]!.id).toBe('d2_c1');
  });

  it('guarantees deterministic repeated search results', () => {
    const doc1 = createSampleDoc({
      id: 'd1_c1',
      documentId: 'd1',
      textOriginal: 'Stability margins and Gain margin',
    });
    const doc2 = createSampleDoc({
      id: 'd2_c1',
      documentId: 'd2',
      textOriginal: 'Phase margin stability analysis',
    });
    engine.indexDocuments([doc1, doc2]);

    const res1 = engine.search({ text: 'stability margin' });
    const res2 = engine.search({ text: 'stability margin' });

    expect(res1.results.length).toBe(res2.results.length);
    expect(res1.queryFingerprint).toBe(res2.queryFingerprint);
    expect(res1.indexVersion).toBe(res2.indexVersion);
    for (let i = 0; i < res1.results.length; i++) {
      expect(res1.results[i]!.id).toBe(res2.results[i]!.id);
      expect(res1.results[i]!.score).toBe(res2.results[i]!.score);
    }
  });

  it('applies Arabic normalization accurately', () => {
    // Alef variations: أ / إ / آ / ٱ -> ا
    expect(normalizeArabic('أحمد إبراهيم آلات ٱختبار')).toBe('احمد ابراهيم الات اختبار');

    // Yaa variations: ى -> ي
    expect(normalizeArabic('محتوى حتى يرى')).toBe('محتوي حتي يري');

    // Tashkeel and tatweel removal
    expect(removeTashkeel('مَلْـزَمَـةٌ دِرَاسِيَّةٌ')).toBe('ملزمة دراسية');

    // Ta-Marbuta preserved (not globally transformed into ha)
    expect(normalizeArabic('هندسة الميكاترونكس')).toBe('هندسة الميكاترونكس');
  });

  it('applies English normalization and whitespace collapsing', () => {
    expect(normalizeEnglish('  ROOT Locus  \nAnalysis ')).toBe('  root locus  \nanalysis ');
    expect(normalizeText('  ROOT   Locus \n\t  Analysis ')).toBe('root locus analysis');
  });

  it('tokenizes mixed Arabic, English, and course code text properly', () => {
    const tokens = tokenize('مادة MCT314: Root Locus!');
    expect(tokens).toContain('مادة');
    expect(tokens).toContain('mct314');
    expect(tokens).toContain('root');
    expect(tokens).toContain('locus');
  });

  it('removes documents by parent documentId', () => {
    const docA1 = createSampleDoc({
      id: 'docA_p1_c1',
      documentId: 'docA',
      textOriginal: 'PID Controller tuning',
    });
    const docA2 = createSampleDoc({
      id: 'docA_p2_c1',
      documentId: 'docA',
      textOriginal: 'Ziegler-Nichols method',
    });
    const docB1 = createSampleDoc({
      id: 'docB_p1_c1',
      documentId: 'docB',
      textOriginal: 'Nyquist stability criterion',
    });

    engine.indexDocuments([docA1, docA2, docB1]);
    expect(engine.getDocumentCount()).toBe(3);

    const removed = engine.removeDocument('docA');
    expect(removed).toBe(2);
    expect(engine.getDocumentCount()).toBe(1);

    const searchAfterRemoval = engine.search({ text: 'PID Controller' });
    expect(searchAfterRemoval.results.length).toBe(0);
  });

  it('replaces documents for an existing documentId', () => {
    const docOld = createSampleDoc({
      id: 'd_v1',
      documentId: 'd',
      textOriginal: 'Old outdated notes',
    });
    engine.indexDocument(docOld);

    const docNew = createSampleDoc({
      id: 'd_v2',
      documentId: 'd',
      textOriginal: 'New updated revised notes',
    });
    engine.replaceDocument('d', [docNew]);

    expect(engine.getDocumentCount()).toBe(1);
    expect(engine.search({ text: 'outdated' }).results.length).toBe(0);
    expect(engine.search({ text: 'revised' }).results.length).toBe(1);
  });

  it('clears all documents from the index', () => {
    engine.indexDocuments([createSampleDoc({ id: '1' }), createSampleDoc({ id: '2' })]);
    expect(engine.getDocumentCount()).toBe(2);

    engine.clear();
    expect(engine.getDocumentCount()).toBe(0);

    const response = engine.search({ text: 'test' });
    expect(response.results.length).toBe(0);
    expect(response.diagnosticReason).toBe('NO_INDEXED_CONTENT');
  });

  it('handles empty query text by returning eligible indexed documents', () => {
    engine.indexDocuments([
      createSampleDoc({ id: '1', courseCode: 'MCT314' }),
      createSampleDoc({ id: '2', courseCode: 'MCT217' }),
    ]);

    const res = engine.search({ text: '', courseCode: 'MCT314' });
    expect(res.results.length).toBe(1);
    expect(res.results[0]!.id).toBe('1');
  });

  it('returns structured diagnostic reason when no results match', () => {
    engine.indexDocuments([
      createSampleDoc({ id: '1', textOriginal: 'Modern control engineering' }),
    ]);
    const res = engine.search({ text: 'aerodynamics spacecraft propulsion' });
    expect(res.results.length).toBe(0);
    expect(res.diagnosticReason).toBe('NO_LEXICAL_MATCH');
  });

  it('generates a stable deterministic index version string', () => {
    const index1 = new BM25Index();
    const index2 = new BM25Index();

    const docs = [
      createSampleDoc({ id: 'a', documentId: 'docA', textNormalized: 'alpha' }),
      createSampleDoc({ id: 'b', documentId: 'docB', textNormalized: 'beta' }),
    ];

    index1.indexDocuments(docs);
    index2.indexDocuments(docs);

    expect(index1.getIndexVersion()).toBe(index2.getIndexVersion());
    expect(index1.getIndexVersion().startsWith('idx_')).toBe(true);
  });

  it('computes identical query fingerprints for identical query parameters and index state', () => {
    const q1 = { text: 'Root Locus', courseCode: 'MCT314', limit: 5 };
    const q2 = { text: '  root   locus  ', courseCode: 'mct314', limit: 5 };

    const fp1 = computeQueryFingerprint(q1, 'idx_123456');
    const fp2 = computeQueryFingerprint(q2, 'idx_123456');

    expect(fp1).toBe(fp2);
    expect(fp1.startsWith('qfp_')).toBe(true);
  });
});
