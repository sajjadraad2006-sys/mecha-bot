/**
 * Bridge B: Ingestion (M6) -> Search (M7)
 *
 * Adapts ingested document manifests and extracted page texts into
 * deterministic search documents and indexes them in the SearchEngine.
 * Strictly guarantees that canSearch=false documents are never indexed.
 */

import {
  adaptM6ToSearchDocuments,
  type ChunkerOptions,
  type M6ExtractedDocument,
  type M6Manifest,
  type SearchDocument,
  type SearchEngine,
} from '@mecha-bot/search';

export interface IngestDocumentResult {
  documentId: string;
  indexedChunkCount: number;
  isSearchable: boolean;
  chunks: SearchDocument[];
}

/**
 * Transforms an M6 ingested document pair (manifest + extracted content)
 * into search documents and indexes them directly into the given SearchEngine.
 */
export function indexIngestedDocument(
  engine: SearchEngine,
  manifest: M6Manifest,
  extracted: M6ExtractedDocument,
  options?: ChunkerOptions,
): IngestDocumentResult {
  const chunks = adaptM6ToSearchDocuments(manifest, extracted, options);

  if (chunks.length === 0) {
    return {
      documentId: manifest.documentId,
      indexedChunkCount: 0,
      isSearchable: Boolean(manifest.permissions?.canSearch),
      chunks: [],
    };
  }

  const indexedCount = engine.indexDocuments(chunks);

  return {
    documentId: manifest.documentId,
    indexedChunkCount: indexedCount,
    isSearchable: true,
    chunks,
  };
}

/**
 * Removes all indexed chunks for an M6 document and indexes new ones atomically.
 */
export function replaceIngestedDocument(
  engine: SearchEngine,
  manifest: M6Manifest,
  extracted: M6ExtractedDocument,
  options?: ChunkerOptions,
): IngestDocumentResult {
  engine.removeDocument(manifest.documentId);
  return indexIngestedDocument(engine, manifest, extracted, options);
}
