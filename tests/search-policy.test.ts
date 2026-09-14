import { describe, it, expect, beforeEach } from 'vitest';
import { SearchEngine, normalizeText, type SearchDocument } from '@mecha-bot/search';
import { EvidenceScope, SourceAuthority } from '@mecha-bot/academic';

describe('Search Policy Engine & Contextual Intent Ranking', () => {
  let engine: SearchEngine;

  const makeDoc = (overrides: Partial<SearchDocument>): SearchDocument => {
    const textOriginal =
      overrides.textOriginal ?? 'Feedback control systems stability and pole placement.';
    const textNormalized = overrides.textNormalized ?? normalizeText(textOriginal);
    return {
      id: 'doc_' + Math.random().toString(36).substring(7),
      documentId: 'p_doc',
      courseCode: 'MCT314',
      topicKeys: ['root_locus'],
      page: 1,
      documentType: 'LECTURER_NOTE',
      sourceAuthority: SourceAuthority.STUDENT_SUBMITTED,
      evidenceScope: EvidenceScope.EXACT_COURSE,
      verificationStatus: 'CATALOGED',
      academicYear: '2026-2027',
      canSearch: true,
      canQuote: true,
      canDistribute: false,
      provenance: {},
      ...overrides,
      textOriginal,
      textNormalized,
    };
  };

  beforeEach(() => {
    engine = new SearchEngine();
  });

  it('enforces exact course filtering and blocks cross-course leakage by default', () => {
    const docMCT314 = makeDoc({
      id: 'doc_314',
      courseCode: 'MCT314',
      textOriginal: 'Control stability in MCT314',
    });
    const docMCT217 = makeDoc({
      id: 'doc_217',
      courseCode: 'MCT217',
      textOriginal: 'Thermal stability in MCT217',
    });

    engine.indexDocuments([docMCT314, docMCT217]);

    // Default: allowRelatedCourses = false
    const res = engine.search({ text: 'stability', courseCode: 'MCT314' });
    expect(res.results.length).toBe(1);
    expect(res.results[0]!.id).toBe('doc_314');
    expect(res.results[0]!.matchReasons).toContain('EXACT_COURSE_FILTER');
  });

  it('permits cross-course documents when allowRelatedCourses is enabled, while keeping exact course higher', () => {
    const docMCT314 = makeDoc({
      id: 'doc_314',
      courseCode: 'MCT314',
      evidenceScope: EvidenceScope.EXACT_COURSE,
      textOriginal: 'Mathematical stability analysis',
    });
    const docRelated = makeDoc({
      id: 'doc_related',
      courseCode: 'MATH101',
      evidenceScope: EvidenceScope.SAME_UNIVERSITY_RELATED_COURSE,
      textOriginal: 'Mathematical stability analysis',
    });

    engine.indexDocuments([docMCT314, docRelated]);

    const res = engine.search({
      text: 'mathematical stability',
      courseCode: 'MCT314',
      allowRelatedCourses: true,
    });

    expect(res.results.length).toBe(2);
    expect(res.results[0]!.id).toBe('doc_314');
    expect(res.results[1]!.id).toBe('doc_related');
    expect(res.results[0]!.score).toBeGreaterThan(res.results[1]!.score);
    expect(res.results[1]!.evidenceScope).toBe(EvidenceScope.SAME_UNIVERSITY_RELATED_COURSE);
  });

  it('filters by topicKey accurately', () => {
    const doc1 = makeDoc({ id: 't1', topicKeys: ['root_locus'], textOriginal: 'System dynamics' });
    const doc2 = makeDoc({ id: 't2', topicKeys: ['bode_plot'], textOriginal: 'System dynamics' });

    engine.indexDocuments([doc1, doc2]);

    const res = engine.search({ text: 'system dynamics', topicKey: 'root_locus' });
    expect(res.results.length).toBe(1);
    expect(res.results[0]!.id).toBe('t1');
    expect(res.results[0]!.matchReasons).toContain('TOPIC_MATCH');
  });

  it('filters by documentTypes whitelist', () => {
    const note = makeDoc({ id: 'n1', documentType: 'LECTURER_NOTE', textOriginal: 'Exam details' });
    const exam = makeDoc({ id: 'e1', documentType: 'PAST_EXAM', textOriginal: 'Exam details' });

    engine.indexDocuments([note, exam]);

    const res = engine.search({ text: 'exam details', documentTypes: ['PAST_EXAM'] });
    expect(res.results.length).toBe(1);
    expect(res.results[0]!.id).toBe('e1');
  });

  it('never returns REJECTED verification status', () => {
    const rejectedDoc = makeDoc({
      id: 'rej',
      verificationStatus: 'REJECTED',
      textOriginal: 'High match keyword payload',
    });
    engine.indexDocument(rejectedDoc);

    const res = engine.search({ text: 'keyword payload' });
    expect(res.results.length).toBe(0);
    expect(res.diagnosticReason).toBe('FILTERED_BY_VERIFICATION');
  });

  it('excludes RAW verification status by default unless explicitly allowed', () => {
    const rawDoc = makeDoc({
      id: 'raw1',
      verificationStatus: 'RAW',
      textOriginal: 'Unchecked raw document text',
    });
    engine.indexDocument(rawDoc);

    // Default search
    const resDefault = engine.search({ text: 'raw document' });
    expect(resDefault.results.length).toBe(0);

    // Explicitly allowed
    const resExplicit = engine.search({ text: 'raw document', verificationStatuses: ['RAW'] });
    expect(resExplicit.results.length).toBe(1);
  });

  it('allows CATALOGED content by default but honors allowUnverifiedCataloged=false', () => {
    const catDoc = makeDoc({
      id: 'cat1',
      verificationStatus: 'CATALOGED',
      textOriginal: 'Cataloged student note',
    });
    engine.indexDocument(catDoc);

    // Default search permits cataloged
    const resDefault = engine.search({ text: 'cataloged' });
    expect(resDefault.results.length).toBe(1);

    // When disabled, cataloged is filtered out
    const resStrict = engine.search({ text: 'cataloged', allowUnverifiedCataloged: false });
    expect(resStrict.results.length).toBe(0);
  });

  it('strictly enforces canSearch permission', () => {
    const privateDoc = makeDoc({
      id: 'pvt',
      canSearch: false,
      textOriginal: 'Secret exam questions',
    });
    const accepted = engine.indexDocument(privateDoc);
    expect(accepted).toBe(false);
    expect(engine.getDocumentCount()).toBe(0);

    const res = engine.search({ text: 'secret exam' });
    expect(res.results.length).toBe(0);
  });

  it('allows canDistribute=false documents to be searchable while preserving flag', () => {
    const textbook = makeDoc({
      id: 'tb1',
      canSearch: true,
      canDistribute: false,
      documentType: 'TEXTBOOK',
      textOriginal: 'Modern Control Engineering Ogata textbook',
    });
    engine.indexDocument(textbook);

    const res = engine.search({ text: 'ogata textbook' });
    expect(res.results.length).toBe(1);
    expect(res.results[0]!.canDistribute).toBe(false);
  });

  it('prioritizes past exams and verified exam authorities during EXAM_LOOKUP intent', () => {
    const lectureNote = makeDoc({
      id: 'd_note',
      documentType: 'LECTURER_NOTE',
      sourceAuthority: SourceAuthority.LECTURER_CURRENT,
      textOriginal: 'Control systems final exam review questions',
    });
    const pastExam = makeDoc({
      id: 'd_exam',
      documentType: 'PAST_EXAM',
      sourceAuthority: SourceAuthority.PAST_EXAM_VERIFIED,
      textOriginal: 'Control systems final exam questions',
    });

    engine.indexDocuments([lectureNote, pastExam]);

    const res = engine.search({ text: 'final exam questions', intent: 'EXAM_LOOKUP' });
    expect(res.results[0]!.id).toBe('d_exam');
    expect(res.results[0]!.matchReasons).toContain('EXAM_INTENT_MATCH');
    expect(res.results[0]!.score).toBeGreaterThan(res.results[1]!.score);
  });

  it('does NOT blindly prioritize past exams during CONCEPT_EXPLANATION intent', () => {
    const lectureNote = makeDoc({
      id: 'd_note',
      documentType: 'LECTURER_NOTE',
      sourceAuthority: SourceAuthority.LECTURER_CURRENT,
      textOriginal: 'Concept explanation of Root Locus method',
    });
    const pastExam = makeDoc({
      id: 'd_exam',
      documentType: 'PAST_EXAM',
      sourceAuthority: SourceAuthority.PAST_EXAM_VERIFIED,
      textOriginal: 'Concept explanation of Root Locus method',
    });

    engine.indexDocuments([pastExam, lectureNote]);

    const res = engine.search({ text: 'root locus method', intent: 'CONCEPT_EXPLANATION' });
    expect(res.results[0]!.id).toBe('d_note');
    expect(res.results[0]!.score).toBeGreaterThan(res.results[1]!.score);
  });

  it('strongly prefers LECTURER_CURRENT during LECTURER_REQUIREMENTS intent', () => {
    const studentNote = makeDoc({
      id: 's_note',
      sourceAuthority: SourceAuthority.STUDENT_SUBMITTED,
      textOriginal: 'Homework submission instructions and project deadlines',
    });
    const lecturerNote = makeDoc({
      id: 'l_note',
      sourceAuthority: SourceAuthority.LECTURER_CURRENT,
      textOriginal: 'Homework submission instructions and project deadlines',
    });

    engine.indexDocuments([studentNote, lecturerNote]);

    const res = engine.search({ text: 'submission instructions', intent: 'LECTURER_REQUIREMENTS' });
    expect(res.results[0]!.id).toBe('l_note');
    expect(res.results[0]!.matchReasons).toContain('AUTHORITY_CONTEXT_MATCH');
  });

  it('strongly prefers OFFICIAL_DEPARTMENT during OFFICIAL_IDENTITY intent', () => {
    const deptDoc = makeDoc({
      id: 'dept',
      sourceAuthority: SourceAuthority.OFFICIAL_DEPARTMENT,
      documentType: 'OFFICIAL_SYLLABUS',
      textOriginal: 'Mechatronics engineering program curriculum syllabus',
    });
    const externalDoc = makeDoc({
      id: 'ext',
      sourceAuthority: SourceAuthority.OPEN_ACADEMIC,
      documentType: 'SUPPORTING_REFERENCE',
      textOriginal: 'Mechatronics engineering program curriculum syllabus',
    });

    engine.indexDocuments([externalDoc, deptDoc]);

    const res = engine.search({ text: 'curriculum syllabus', intent: 'OFFICIAL_IDENTITY' });
    expect(res.results[0]!.id).toBe('dept');
    expect(res.results[0]!.score).toBeGreaterThan(res.results[1]!.score);
  });
});
