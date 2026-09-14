import { describe, it, expect, beforeEach } from 'vitest';
import { SearchEngine, normalizeText, type SearchDocument } from '@mecha-bot/search';

describe('Search Ranking & Lexical BM25 Scoring', () => {
  let engine: SearchEngine;

  const makeDoc = (
    id: string,
    text: string,
    overrides: Partial<SearchDocument> = {}
  ): SearchDocument => ({
    id,
    documentId: `parent_${id}`,
    topicKeys: [],
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'STUDENT_SUBMITTED',
    evidenceScope: 'EXACT_COURSE',
    verificationStatus: 'CATALOGED',
    canSearch: true,
    canQuote: true,
    canDistribute: false,
    provenance: {},
    ...overrides,
    textOriginal: text,
    textNormalized: overrides.textNormalized ?? normalizeText(text),
  });

  beforeEach(() => {
    engine = new SearchEngine();
  });

  it('ranks heavily relevant document above weakly relevant and unrelated documents', () => {
    const docRelevant = makeDoc(
      'd_rel',
      'Root locus analysis is fundamental for understanding control system poles and stability.'
    );
    const docWeak = makeDoc(
      'd_weak',
      'The control system incorporates sensors, actuators, and an occasional locus plot.'
    );
    const docUnrelated = makeDoc(
      'd_none',
      'Thermodynamic steam tables show properties of water and steam under pressure.'
    );

    engine.indexDocuments([docUnrelated, docWeak, docRelevant]);

    const res = engine.search({ text: 'root locus stability' });
    expect(res.results.length).toBe(2);
    expect(res.results[0]!.id).toBe('d_rel');
    expect(res.results[1]!.id).toBe('d_weak');
    expect(res.results[0]!.score).toBeGreaterThan(res.results[1]!.score);
  });

  it('treats English case and whitespace differences with identical ranking', () => {
    const doc = makeDoc('d1', 'State Space Representation and Controllability');
    engine.indexDocument(doc);

    const resLower = engine.search({ text: 'state space' });
    const resUpper = engine.search({ text: 'STATE SPACE' });
    const resMixed = engine.search({ text: '  State   Space  ' });

    expect(resLower.results[0]!.score).toBe(resUpper.results[0]!.score);
    expect(resLower.results[0]!.score).toBe(resMixed.results[0]!.score);
  });

  it('matches Arabic queries across orthographical variations', () => {
    // Document with Hamza Alef: إشارة
    const doc = makeDoc('d_ar', 'معالجة إشارة التحكم والأنظمة الخطية');
    engine.indexDocument(doc);

    // Search with bare alef "اشارة" vs hamza alef "إشارة"
    const res1 = engine.search({ text: 'اشارة' });
    const res2 = engine.search({ text: 'إشارة' });

    expect(res1.results.length).toBe(1);
    expect(res2.results.length).toBe(1);
    expect(res1.results[0]!.score).toBe(res2.results[0]!.score);
    expect(res1.results[0]!.id).toBe('d_ar');
  });

  it('creates clean representative excerpts centered on matched keywords', () => {
    const longText =
      'Introduction to robotics kinematics. Forward kinematics computes the end-effector position from joint angles. ' +
      'Inverse kinematics solves for the joint angles given a desired end-effector position. ' +
      'Singularities represent positions where the Jacobian matrix loses rank and the manipulator loses degrees of freedom.';

    const doc = makeDoc('d_kinematics', longText);
    engine.indexDocument(doc);

    const res = engine.search({ text: 'Jacobian matrix' });
    expect(res.results.length).toBe(1);
    const excerpt = res.results[0]!.textExcerpt;
    expect(excerpt.toLowerCase()).toContain('jacobian matrix');
  });

  it('respects limit and pagination', () => {
    const docs = Array.from({ length: 15 }, (_, i) =>
      makeDoc(`doc_${i}`, `Control system frequency response iteration number ${i}`)
    );
    engine.indexDocuments(docs);

    const resLimit5 = engine.search({ text: 'frequency response', limit: 5 });
    expect(resLimit5.results.length).toBe(5);
    expect(resLimit5.totalMatches).toBe(15);

    const resLimit10 = engine.search({ text: 'frequency response', limit: 10 });
    expect(resLimit10.results.length).toBe(10);
  });

  it('provides debug metadata when requested', () => {
    const doc = makeDoc('d1', 'Nyquist stability criterion and Cauchy argument principle');
    engine.indexDocument(doc);

    const res = engine.search({ text: 'nyquist stability', debug: true });
    expect(res.debug).toBeDefined();
    expect(res.debug!.tokens).toEqual(['nyquist', 'stability']);
    expect(res.debug!.candidateCount).toBe(1);
    expect(res.debug!.returnedCount).toBe(1);
    expect(res.debug!.durationMs).toBeGreaterThanOrEqual(0);
  });
});
