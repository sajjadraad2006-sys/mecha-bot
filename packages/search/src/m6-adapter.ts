/**
 * M6 Ingestion to M7 Search Adapter.
 * Converts M6 Manifests and Extracted Page Records into SearchDocument chunks.
 * Enforces strict permission filtering (canSearch=false documents never enter search).
 */

import { type ChunkerOptions, chunkDocumentPages } from './chunker.js';
import type { SearchDocument } from './types.js';

export interface M6ManifestOrigin {
  kind?: string;
  originalUrl?: string | null;
  uploadedBy?: string | null;
}

export interface M6ManifestPermissions {
  canSearch: boolean;
  canQuote: boolean;
  canDistribute: boolean;
}

export interface M6Manifest {
  schemaVersion: number;
  documentId: string;
  sha256: string;
  originalFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  pageCount: number;
  courseCode?: string | null;
  documentType: string;
  suggestedDocumentType?: string | null;
  origin?: M6ManifestOrigin;
  academicYear?: string | null;
  authority: string;
  evidenceScope: string;
  verificationStatus: string;
  distributionAllowed: string;
  permissions: M6ManifestPermissions;
  textExtractionStatus: string;
  warnings?: string[];
  metadata?: Record<string, unknown>;
  extractedAt?: string;
}

export interface M6ExtractedPage {
  page: number;
  textOriginal: string;
  textNormalized: string;
  charCount: number;
  warnings?: string[];
}

export interface M6ExtractedDocument {
  documentId: string;
  pageCount: number;
  pages: M6ExtractedPage[];
}

/**
 * Transforms an M6 Ingestion Manifest and its corresponding Extracted Document
 * into a collection of deterministic SearchDocuments.
 */
export function adaptM6ToSearchDocuments(
  manifest: M6Manifest,
  extracted: M6ExtractedDocument,
  options: ChunkerOptions = {},
): SearchDocument[] {
  // CRITICAL RULE: If canSearch is false, never emit searchable chunks
  if (!manifest.permissions || manifest.permissions.canSearch === false) {
    return [];
  }

  // If the extraction failed or is image-only with 0 text, no chunks can be created
  if (
    manifest.textExtractionStatus === 'IMAGE_ONLY_OR_UNREADABLE' ||
    manifest.textExtractionStatus === 'FAILED' ||
    manifest.textExtractionStatus === 'ENCRYPTED'
  ) {
    return [];
  }

  const courseCode = manifest.courseCode ? manifest.courseCode.trim().toUpperCase() : undefined;

  return chunkDocumentPages(
    {
      documentId: manifest.documentId,
      courseCode,
      topicKeys: [], // M2 topic resolution or caller can augment
      title: (manifest.metadata?.['Title'] as string | undefined) ?? manifest.originalFilename,
      documentType: manifest.documentType,
      sourceAuthority: manifest.authority,
      evidenceScope: manifest.evidenceScope,
      verificationStatus: manifest.verificationStatus,
      academicYear: manifest.academicYear ?? undefined,
      canSearch: manifest.permissions.canSearch,
      canQuote: manifest.permissions.canQuote,
      canDistribute: manifest.permissions.canDistribute, // Independent permission
      provenance: {
        originalFilename: manifest.originalFilename,
        originUrl: manifest.origin?.originalUrl ?? null,
        originKind: manifest.origin?.kind,
      },
      pages: extracted.pages.map((p) => ({
        page: p.page,
        textOriginal: p.textOriginal,
        textNormalized: p.textNormalized,
      })),
    },
    options,
  );
}
