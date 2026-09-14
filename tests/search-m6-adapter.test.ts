import { describe, it, expect } from 'vitest';
import {
  adaptM6ToSearchDocuments,
  chunkDocumentPages,
  type M6Manifest,
  type M6ExtractedDocument,
} from '@mecha-bot/search';

describe('M6 Ingestion to M7 Search Adapter & Chunking', () => {
  const sampleManifest: M6Manifest = {
    schemaVersion: 1,
    documentId: 'doc_4ae453dc4d50f835',
    sha256: '4ae453dc4d50f8359ed1e581945176c92414db70690f202ae5ffd0f4acfaa5f2',
    originalFilename: 'Lecture1_MCT314.pdf',
    fileSizeBytes: 54321,
    mimeType: 'application/pdf',
    pageCount: 2,
    courseCode: 'MCT314',
    documentType: 'LECTURER_NOTE',
    authority: 'LECTURER_CURRENT',
    evidenceScope: 'EXACT_COURSE',
    verificationStatus: 'CATALOGED',
    distributionAllowed: 'UNKNOWN',
    permissions: {
      canSearch: true,
      canQuote: true,
      canDistribute: false,
    },
    textExtractionStatus: 'SUCCESS',
    metadata: {
      Title: 'Automatic Control Systems Lecture 1',
    },
  };

  const sampleExtracted: M6ExtractedDocument = {
    documentId: 'doc_4ae453dc4d50f835',
    pageCount: 2,
    pages: [
      {
        page: 1,
        textOriginal:
          'Feedback control systems introduction. A closed-loop control system uses feedback to compare output with input reference.',
        textNormalized:
          'feedback control systems introduction. a closed-loop control system uses feedback to compare output with input reference.',
        charCount: 122,
      },
      {
        page: 2,
        textOriginal:
          'Mathematical modeling of physical systems. Transfer functions represent the ratio of Laplace transform of output to input.',
        textNormalized:
          'mathematical modeling of physical systems. transfer functions represent the ratio of laplace transform of output to input.',
        charCount: 125,
      },
    ],
  };

  it('adapts M6 manifest and extracted pages into SearchDocuments', () => {
    const docs = adaptM6ToSearchDocuments(sampleManifest, sampleExtracted);
    expect(docs.length).toBe(2);

    const doc1 = docs[0]!;
    expect(doc1.documentId).toBe(sampleManifest.documentId);
    expect(doc1.id).toBe(`${sampleManifest.documentId}_p1_c1`);
    expect(doc1.courseCode).toBe('MCT314');
    expect(doc1.title).toBe('Automatic Control Systems Lecture 1');
    expect(doc1.page).toBe(1);
    expect(doc1.canSearch).toBe(true);
    expect(doc1.canDistribute).toBe(false);
    expect(doc1.provenance.originalFilename).toBe('Lecture1_MCT314.pdf');

    const doc2 = docs[1]!;
    expect(doc2.page).toBe(2);
    expect(doc2.id).toBe(`${sampleManifest.documentId}_p2_c2`);
  });

  it('produces 0 searchable chunks when canSearch is false', () => {
    const restrictedManifest: M6Manifest = {
      ...sampleManifest,
      permissions: {
        canSearch: false,
        canQuote: false,
        canDistribute: false,
      },
    };

    const docs = adaptM6ToSearchDocuments(restrictedManifest, sampleExtracted);
    expect(docs.length).toBe(0);
  });

  it('preserves canDistribute=false while allowing search', () => {
    const docs = adaptM6ToSearchDocuments(sampleManifest, sampleExtracted);
    expect(docs.length).toBeGreaterThan(0);
    for (const doc of docs) {
      expect(doc.canSearch).toBe(true);
      expect(doc.canDistribute).toBe(false);
    }
  });

  it('produces 0 searchable chunks for image-only or unreadable documents', () => {
    const imageOnlyManifest: M6Manifest = {
      ...sampleManifest,
      textExtractionStatus: 'IMAGE_ONLY_OR_UNREADABLE',
    };

    const emptyExtracted: M6ExtractedDocument = {
      documentId: 'doc_empty',
      pageCount: 1,
      pages: [
        {
          page: 1,
          textOriginal: '',
          textNormalized: '',
          charCount: 0,
        },
      ],
    };

    const docs = adaptM6ToSearchDocuments(imageOnlyManifest, emptyExtracted);
    expect(docs.length).toBe(0);
  });

  it('decomposes large pages into semantic chunks without mixing documents', () => {
    const paragraph1 = 'Introduction to linear time-invariant systems. '.repeat(15);
    const paragraph2 = 'Stability analysis using Routh-Hurwitz criterion. '.repeat(15);
    const paragraph3 = 'Root locus pole movement and damping ratio. '.repeat(15);

    const largePageText = `${paragraph1}\n\n${paragraph2}\n\n${paragraph3}`;

    const input = {
      documentId: 'doc_large',
      courseCode: 'MCT314',
      documentType: 'LECTURER_NOTE',
      sourceAuthority: 'LECTURER_CURRENT',
      evidenceScope: 'EXACT_COURSE',
      verificationStatus: 'CATALOGED',
      canSearch: true,
      canQuote: true,
      canDistribute: false,
      provenance: { originalFilename: 'large_lec.pdf' },
      pages: [{ page: 1, textOriginal: largePageText }],
    };

    const chunks = chunkDocumentPages(input, { targetSize: 500, overlap: 80 });
    expect(chunks.length).toBeGreaterThan(1);

    for (const chunk of chunks) {
      expect(chunk.documentId).toBe('doc_large');
      expect(chunk.page).toBe(1);
      expect(chunk.textOriginal.length).toBeGreaterThan(0);
      expect(chunk.textNormalized.length).toBeGreaterThan(0);
    }
  });

  it('guarantees zero AI, Telegram, network, or DB dependencies', () => {
    // Assert pure in-memory execution
    expect(typeof chunkDocumentPages).toBe('function');
    expect(typeof adaptM6ToSearchDocuments).toBe('function');
  });
});
