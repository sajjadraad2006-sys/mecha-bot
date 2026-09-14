/**
 * Deterministic text chunking engine for Mecha Bot academic documents.
 * Employs semantic-safe boundaries (paragraphs, lines, sentence terminals)
 * without mixing pages across documents or relying on heavyweight NLP.
 */

import { normalizeText } from './normalizer.js';
import type { DocumentProvenance, SearchDocument } from './types.js';

export interface ChunkerOptions {
  targetSize?: number | undefined; // Target characters per chunk (default: 600)
  overlap?: number | undefined; // Overlap characters between chunks (default: 100)
  minSize?: number | undefined; // Minimum meaningful chunk size (default: 60)
}

export interface RawPageInput {
  page: number;
  textOriginal: string;
  textNormalized?: string | undefined;
}

export interface DocumentChunkingInput {
  documentId: string;
  courseCode?: string | undefined;
  topicKeys?: string[] | undefined;
  title?: string | undefined;
  documentType: string;
  sourceAuthority: string;
  evidenceScope: string;
  verificationStatus: string;
  academicYear?: string | undefined;
  currentArchiveStatus?: string | undefined;
  canSearch: boolean;
  canQuote: boolean;
  canDistribute: boolean;
  provenance: DocumentProvenance;
  pages: RawPageInput[];
}

/**
 * Splits text into blocks using natural boundaries (paragraphs, lines, sentence ends).
 */
function splitIntoSemanticBlocks(text: string): string[] {
  if (!text) return [];

  // Split on double newlines (paragraphs) first
  const paragraphs = text.split(/\n\s*\n/);
  const blocks: string[] = [];

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    // If paragraph is already reasonably short, keep it as a unit
    if (trimmedPara.length <= 400) {
      blocks.push(trimmedPara);
    } else {
      // Split large paragraph into sentences or line blocks
      const sentences = trimmedPara.split(/(?<=[.!?؟\n])\s+/);
      for (const sent of sentences) {
        const trimmedSent = sent.trim();
        if (trimmedSent) {
          blocks.push(trimmedSent);
        }
      }
    }
  }

  return blocks;
}

/**
 * Deterministically chunks document pages into SearchDocuments.
 */
export function chunkDocumentPages(
  input: DocumentChunkingInput,
  options: ChunkerOptions = {},
): SearchDocument[] {
  if (!input.canSearch) {
    // If the document is marked non-searchable, produce zero searchable chunks
    return [];
  }

  const targetSize = options.targetSize ?? 600;
  const overlap = options.overlap ?? 100;
  const minSize = options.minSize ?? 60;

  const chunks: SearchDocument[] = [];
  let globalChunkIdx = 1;

  for (const pageRecord of input.pages) {
    const originalText = pageRecord.textOriginal?.trim() ?? '';
    if (!originalText || originalText.length < minSize) {
      // Empty or trivial page text (scans or whitespace) produces no searchable chunks
      continue;
    }

    // Case 1: Page text fits within targetSize comfortably
    if (originalText.length <= targetSize + overlap) {
      const normText = pageRecord.textNormalized || normalizeText(originalText);
      const chunkId = `c${globalChunkIdx}`;
      chunks.push({
        id: `${input.documentId}_p${pageRecord.page}_${chunkId}`,
        documentId: input.documentId,
        chunkId,
        courseCode: input.courseCode,
        topicKeys: input.topicKeys ? [...input.topicKeys] : [],
        title: input.title,
        textOriginal: originalText,
        textNormalized: normText,
        page: pageRecord.page,
        pageRange: [pageRecord.page, pageRecord.page],
        documentType: input.documentType,
        sourceAuthority: input.sourceAuthority,
        evidenceScope: input.evidenceScope,
        verificationStatus: input.verificationStatus,
        academicYear: input.academicYear,
        currentArchiveStatus: input.currentArchiveStatus,
        canSearch: input.canSearch,
        canQuote: input.canQuote,
        canDistribute: input.canDistribute,
        provenance: { ...input.provenance },
      });
      globalChunkIdx++;
      continue;
    }

    // Case 2: Multi-chunk decomposition for large pages
    const blocks = splitIntoSemanticBlocks(originalText);
    let currentChunkOriginal = '';
    let lastBlock = '';

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]!;

      if (!currentChunkOriginal) {
        currentChunkOriginal = block;
      } else {
        const prospective = `${currentChunkOriginal}\n\n${block}`;
        if (prospective.length <= targetSize) {
          currentChunkOriginal = prospective;
        } else {
          // Finalize current chunk
          if (currentChunkOriginal.length >= minSize) {
            const normText = normalizeText(currentChunkOriginal);
            const chunkId = `c${globalChunkIdx}`;
            chunks.push({
              id: `${input.documentId}_p${pageRecord.page}_${chunkId}`,
              documentId: input.documentId,
              chunkId,
              courseCode: input.courseCode,
              topicKeys: input.topicKeys ? [...input.topicKeys] : [],
              title: input.title,
              textOriginal: currentChunkOriginal,
              textNormalized: normText,
              page: pageRecord.page,
              pageRange: [pageRecord.page, pageRecord.page],
              documentType: input.documentType,
              sourceAuthority: input.sourceAuthority,
              evidenceScope: input.evidenceScope,
              verificationStatus: input.verificationStatus,
              academicYear: input.academicYear,
              currentArchiveStatus: input.currentArchiveStatus,
              canSearch: input.canSearch,
              canQuote: input.canQuote,
              canDistribute: input.canDistribute,
              provenance: { ...input.provenance },
            });
            globalChunkIdx++;
          }

          // Compute overlap for next chunk
          const carryOver =
            lastBlock.length > 0 && lastBlock.length <= overlap ? `${lastBlock}\n\n` : '';
          currentChunkOriginal = `${carryOver}${block}`;
        }
      }

      lastBlock = block;
    }

    // Emit remaining tail chunk
    if (currentChunkOriginal.trim().length >= minSize) {
      const normText = normalizeText(currentChunkOriginal);
      const chunkId = `c${globalChunkIdx}`;
      chunks.push({
        id: `${input.documentId}_p${pageRecord.page}_${chunkId}`,
        documentId: input.documentId,
        chunkId,
        courseCode: input.courseCode,
        topicKeys: input.topicKeys ? [...input.topicKeys] : [],
        title: input.title,
        textOriginal: currentChunkOriginal,
        textNormalized: normText,
        page: pageRecord.page,
        pageRange: [pageRecord.page, pageRecord.page],
        documentType: input.documentType,
        sourceAuthority: input.sourceAuthority,
        evidenceScope: input.evidenceScope,
        verificationStatus: input.verificationStatus,
        academicYear: input.academicYear,
        currentArchiveStatus: input.currentArchiveStatus,
        canSearch: input.canSearch,
        canQuote: input.canQuote,
        canDistribute: input.canDistribute,
        provenance: { ...input.provenance },
      });
      globalChunkIdx++;
    }
  }

  return chunks;
}
