"""
Core ingestion pipeline for Mecha Bot local academic documents.
Executes the deterministic RAW -> INSPECTED -> HASHED -> TEXT_EXTRACTED -> CATALOGED -> READY_FOR_REVIEW lifecycle.
Includes path-traversal security checks, duplicate detection, and batch resilience.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from tools.ingestion.classifier import resolve_document_classification
from tools.ingestion.extractor import get_extractor_for_file
from tools.ingestion.hasher import compute_file_info, derive_document_id
from tools.ingestion.models import (
    ExtractedDocument,
    IngestionManifest,
    OriginMetadata,
    TextExtractionStatus,
)
from tools.ingestion.policy import (
    resolve_authority_and_scope,
    resolve_distribution_policy,
    resolve_verification_status,
)
from tools.ingestion.validator import validate_course_code, validate_manifest


@dataclass
class IngestionConfig:
    output_dir: Path = field(default_factory=lambda: Path("data/processed"))
    course_code: str | None = None
    document_type: str | None = None
    academic_year: str | None = None
    origin_kind: str = "LOCAL_IMPORT"
    origin_url: str | None = None
    authority: str | None = None
    evidence_scope: str | None = None
    can_distribute: bool | None = None


@dataclass
class IngestFileResult:
    success: bool
    documentId: str = ""
    sha256: str = ""
    originalFilename: str = ""
    is_duplicate: bool = False
    manifest_path: Path | None = None
    extracted_path: Path | None = None
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "success": self.success,
            "documentId": self.documentId,
            "sha256": self.sha256,
            "originalFilename": self.originalFilename,
            "is_duplicate": self.is_duplicate,
            "manifest_path": str(self.manifest_path) if self.manifest_path else None,
            "extracted_path": str(self.extracted_path) if self.extracted_path else None,
            "warnings": self.warnings,
            "errors": self.errors,
        }


@dataclass
class BatchIngestResult:
    total_scanned: int = 0
    successful: int = 0
    failed: int = 0
    duplicates: int = 0
    results: list[IngestFileResult] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "total_scanned": self.total_scanned,
            "successful": self.successful,
            "failed": self.failed,
            "duplicates": self.duplicates,
            "results": [r.to_dict() for r in self.results],
        }


class IngestionPipeline:
    """
    Local-first, deterministic, offline document ingestion pipeline.
    """

    def __init__(self, config: IngestionConfig | None = None):
        self.config = config or IngestionConfig()
        self.output_dir = Path(self.config.output_dir).resolve()
        self.manifests_dir = self.output_dir / "manifests"
        self.extracted_dir = self.output_dir / "extracted"

    def _ensure_directories(self) -> None:
        """Create target directories safely."""
        self.manifests_dir.mkdir(parents=True, exist_ok=True)
        self.extracted_dir.mkdir(parents=True, exist_ok=True)

    def _safe_write_path(self, target_dir: Path, filename: str) -> Path:
        """
        Prevent path traversal security vulnerabilities.
        Ensures target file is strictly inside the target_dir.
        """
        clean_name = Path(filename).name
        target_path = (target_dir / clean_name).resolve()
        if not str(target_path).startswith(str(target_dir.resolve())):
            raise ValueError(f"Path traversal detected for filename: {filename}")
        return target_path

    def ingest_file(self, file_path: str | Path) -> IngestFileResult:
        """
        Ingest a single document file through the full deterministic pipeline.
        Never throws unhandled exceptions out of the function; captures errors gracefully.
        """
        path = Path(file_path).resolve()
        result = IngestFileResult(success=False, originalFilename=path.name)

        # Stage 1: RAW
        if not path.is_file():
            result.errors.append(f"Input path is not a file or does not exist: {path}")
            return result

        # Stage 2: INSPECTED
        file_size = path.stat().st_size
        if file_size == 0:
            result.errors.append("File is empty (0 bytes).")
            return result

        # Validate Course Code Syntactically
        if self.config.course_code:
            is_valid_code, code_err = validate_course_code(self.config.course_code)
            if not is_valid_code and code_err:
                result.errors.append(code_err)
                return result

        # Stage 3: HASHED (Deterministic Content Identity)
        try:
            sha256, file_size_bytes, filename = compute_file_info(path)
            result.sha256 = sha256
            result.originalFilename = filename
            document_id = derive_document_id(sha256)
            result.documentId = document_id
        except Exception as e:
            result.errors.append(f"Error computing hash: {e}")
            return result

        # Duplicate detection check
        self._ensure_directories()
        manifest_file = self._safe_write_path(
            self.manifests_dir, f"{document_id}.json"
        )
        extracted_file = self._safe_write_path(
            self.extracted_dir, f"{document_id}.json"
        )

        existing_manifest: dict[str, Any] | None = None
        if manifest_file.exists():
            try:
                with manifest_file.open("r", encoding="utf-8") as f:
                    existing_manifest = json.load(f)
                if existing_manifest.get("sha256") == sha256:
                    result.is_duplicate = True
                    result.warnings.append(
                        f"Exact duplicate detected for content {document_id}. "
                        f"Already ingested as '{existing_manifest.get('originalFilename')}'."
                    )
            except Exception as e:
                result.warnings.append(f"Could not read existing manifest for duplicate check: {e}")

        # Stage 4: TEXT_EXTRACTED
        try:
            extractor = get_extractor_for_file(path)
            extraction_result = extractor.extract(path)
        except Exception as e:
            result.errors.append(f"Extractor failed: {e}")
            return result

        if extraction_result.errors:
            result.errors.extend(extraction_result.errors)
            if extraction_result.textExtractionStatus in (
                TextExtractionStatus.FAILED.value,
                TextExtractionStatus.ENCRYPTED.value,
            ):
                return result

        if extraction_result.warnings:
            result.warnings.extend(extraction_result.warnings)

        # Stage 5: CATALOGED
        # Resolve document classification (Heuristics only create suggestions)
        doc_type, suggested_type = resolve_document_classification(
            self.config.document_type, filename
        )

        # Resolve authority & evidence scope (never automatically trusted)
        authority, scope = resolve_authority_and_scope(
            origin_kind=self.config.origin_kind,
            explicit_authority=self.config.authority,
            explicit_scope=self.config.evidence_scope,
        )

        # Resolve copyright & distribution permissions
        distribution_allowed, permissions = resolve_distribution_policy(
            document_type=doc_type,
            suggested_type=suggested_type,
            explicit_distribute=self.config.can_distribute,
        )

        # Resolve verification status (RAW or CATALOGED, never VERIFIED)
        verification_status = resolve_verification_status(
            extraction_result.textExtractionStatus
        )

        # Manage observed filenames across duplicates
        observed_filenames = [filename]
        if existing_manifest and "metadata" in existing_manifest:
            old_observed = existing_manifest["metadata"].get("observedFilenames", [])
            for old_name in old_observed:
                if old_name not in observed_filenames:
                    observed_filenames.append(old_name)

        combined_metadata = dict(extraction_result.metadata)
        combined_metadata["observedFilenames"] = observed_filenames

        manifest = IngestionManifest(
            schemaVersion=1,
            documentId=document_id,
            sha256=sha256,
            originalFilename=filename,
            fileSizeBytes=file_size_bytes,
            mimeType="application/pdf",
            pageCount=extraction_result.pageCount,
            courseCode=self.config.course_code.upper() if self.config.course_code else None,
            documentType=doc_type,
            suggestedDocumentType=suggested_type,
            origin=OriginMetadata(
                kind=self.config.origin_kind,
                originalUrl=self.config.origin_url,
            ),
            academicYear=self.config.academic_year,
            authority=authority,
            evidenceScope=scope,
            verificationStatus=verification_status,
            distributionAllowed=distribution_allowed,
            permissions=permissions,
            textExtractionStatus=extraction_result.textExtractionStatus,
            warnings=result.warnings,
            metadata=combined_metadata,
        )

        # Validate manifest schema before writing
        manifest_dict = manifest.to_dict()
        is_schema_valid, schema_errors = validate_manifest(manifest_dict)
        if not is_schema_valid:
            result.errors.extend([f"Manifest schema violation: {err}" for err in schema_errors])
            return result

        # Write manifest JSON
        try:
            with manifest_file.open("w", encoding="utf-8") as f:
                json.dump(manifest_dict, f, indent=2, ensure_ascii=False)
            result.manifest_path = manifest_file
        except Exception as e:
            result.errors.append(f"Failed to write manifest file: {e}")
            return result

        # Write extracted text JSON (Page records)
        extracted_doc = ExtractedDocument(
            documentId=document_id,
            pageCount=extraction_result.pageCount,
            pages=extraction_result.pages,
        )
        try:
            with extracted_file.open("w", encoding="utf-8") as f:
                json.dump(extracted_doc.to_dict(), f, indent=2, ensure_ascii=False)
            result.extracted_path = extracted_file
        except Exception as e:
            result.errors.append(f"Failed to write extracted text file: {e}")
            return result

        # Stage 6: READY_FOR_REVIEW
        result.success = True
        return result

    def ingest_directory(
        self, directory_path: str | Path, recursive: bool = False
    ) -> BatchIngestResult:
        """
        Ingest all supported documents in a directory.
        Batch resilience rule: One broken file must never crash the entire batch.
        """
        target_dir = Path(directory_path).resolve()
        batch_result = BatchIngestResult()

        if not target_dir.is_dir():
            raise NotADirectoryError(f"Directory not found: {target_dir}")

        pattern = "**/*.pdf" if recursive else "*.pdf"
        pdf_files = sorted(target_dir.glob(pattern))
        batch_result.total_scanned = len(pdf_files)

        for pdf_file in pdf_files:
            file_result = self.ingest_file(pdf_file)
            batch_result.results.append(file_result)
            if file_result.success:
                batch_result.successful += 1
                if file_result.is_duplicate:
                    batch_result.duplicates += 1
            else:
                batch_result.failed += 1

        return batch_result
