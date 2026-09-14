"""
Mecha Bot Local Academic Source Ingestion Package.
M6A Foundation: Local-first, deterministic, offline document processing.
"""

from tools.ingestion.classifier import (
    resolve_document_classification,
    suggest_document_type_from_filename,
)
from tools.ingestion.extractor import (
    BaseExtractor,
    ExtractionResult,
    PdfExtractor,
    get_extractor_for_file,
)
from tools.ingestion.hasher import (
    compute_file_info,
    compute_sha256,
    compute_sha256_from_bytes,
    derive_document_id,
)
from tools.ingestion.models import (
    DistributionAllowed,
    DistributionPermissions,
    DocumentType,
    EvidenceScope,
    ExtractedDocument,
    IngestionManifest,
    OriginMetadata,
    PageRecord,
    SourceAuthority,
    TextExtractionStatus,
    VerificationStatus,
)
from tools.ingestion.normalizer import (
    normalize_arabic,
    normalize_english,
    normalize_text,
    remove_tashkeel,
)
from tools.ingestion.pipeline import (
    BatchIngestResult,
    IngestFileResult,
    IngestionConfig,
    IngestionPipeline,
)
from tools.ingestion.policy import (
    resolve_authority_and_scope,
    resolve_distribution_policy,
    resolve_verification_status,
)
from tools.ingestion.validator import validate_course_code, validate_manifest

__all__ = [
    "BaseExtractor",
    "BatchIngestResult",
    "DistributionAllowed",
    "DistributionPermissions",
    "DocumentType",
    "EvidenceScope",
    "ExtractedDocument",
    "ExtractionResult",
    "IngestFileResult",
    "IngestionConfig",
    "IngestionManifest",
    "IngestionPipeline",
    "OriginMetadata",
    "PageRecord",
    "PdfExtractor",
    "SourceAuthority",
    "TextExtractionStatus",
    "VerificationStatus",
    "compute_file_info",
    "compute_sha256",
    "compute_sha256_from_bytes",
    "derive_document_id",
    "get_extractor_for_file",
    "normalize_arabic",
    "normalize_english",
    "normalize_text",
    "remove_tashkeel",
    "resolve_authority_and_scope",
    "resolve_distribution_policy",
    "resolve_document_classification",
    "resolve_verification_status",
    "suggest_document_type_from_filename",
    "validate_course_code",
    "validate_manifest",
]
