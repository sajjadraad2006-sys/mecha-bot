"""
Document extraction engine for Mecha Bot local ingestion.
Extracts per-page text, metadata, and structural records from PDFs using pypdf.
Detects image-only/scanned documents without fabricating text or invoking OCR.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from pypdf import PdfReader
from pypdf.errors import PdfReadError

from tools.ingestion.models import (
    PageRecord,
    TextExtractionStatus,
)
from tools.ingestion.normalizer import normalize_text


@dataclass
class ExtractionResult:
    pageCount: int = 0
    pages: list[PageRecord] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    title: str | None = None
    textExtractionStatus: str = TextExtractionStatus.SUCCESS.value
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


class BaseExtractor(ABC):
    """Abstract interface for document extractors."""

    @abstractmethod
    def can_handle(self, file_path: Path) -> bool:
        """Return True if this extractor can process the given file."""

    @abstractmethod
    def extract(self, file_path: Path) -> ExtractionResult:
        """Extract content from file."""


class PdfExtractor(BaseExtractor):
    """
    Robust PDF extractor utilizing pypdf.
    Extracts text per page, captures metadata, flags image-only or unreadable documents,
    and prevents fabrication of text.
    """

    def can_handle(self, file_path: Path) -> bool:
        return file_path.suffix.lower() == ".pdf"

    def extract(self, file_path: Path) -> ExtractionResult:
        result = ExtractionResult()
        path = Path(file_path)

        if not path.exists():
            result.errors.append(f"File not found: {path}")
            result.textExtractionStatus = TextExtractionStatus.FAILED.value
            return result

        if path.stat().st_size == 0:
            result.errors.append("File is empty (0 bytes).")
            result.textExtractionStatus = TextExtractionStatus.FAILED.value
            return result

        try:
            reader = PdfReader(str(path))
        except PdfReadError as e:
            result.errors.append(f"Invalid or corrupted PDF file: {e}")
            result.textExtractionStatus = TextExtractionStatus.FAILED.value
            return result
        except Exception as e:
            result.errors.append(f"Unexpected error opening PDF: {e}")
            result.textExtractionStatus = TextExtractionStatus.FAILED.value
            return result

        # Handle encryption
        if reader.is_encrypted:
            try:
                # Attempt decrypting with empty password for unencrypted permissions
                decrypt_success = reader.decrypt("")
                if decrypt_success == 0:  # 0 indicates decryption failed
                    result.errors.append("PDF is password-protected or encrypted.")
                    result.textExtractionStatus = TextExtractionStatus.ENCRYPTED.value
                    return result
            except Exception as e:
                result.errors.append(f"Failed to decrypt PDF: {e}")
                result.textExtractionStatus = TextExtractionStatus.ENCRYPTED.value
                return result

        # Extract document metadata safely
        try:
            pdf_meta = reader.metadata
            if pdf_meta:
                meta_dict: dict[str, Any] = {}
                for key, val in pdf_meta.items():
                    # Clean up keys like /Title, /Author
                    clean_key = key.lstrip("/")
                    if val is not None:
                        meta_dict[clean_key] = str(val)
                result.metadata = meta_dict
                if "Title" in meta_dict and meta_dict["Title"].strip():
                    result.title = meta_dict["Title"].strip()
        except Exception as e:
            result.warnings.append(f"Could not read PDF metadata: {e}")

        # Page count
        try:
            page_count = len(reader.pages)
            result.pageCount = page_count
        except Exception as e:
            result.errors.append(f"Could not determine page count: {e}")
            result.textExtractionStatus = TextExtractionStatus.FAILED.value
            return result

        if page_count == 0:
            result.warnings.append("PDF contains 0 pages.")
            result.textExtractionStatus = TextExtractionStatus.IMAGE_ONLY_OR_UNREADABLE.value
            return result

        total_extracted_chars = 0
        pages_with_no_text = 0

        for idx, page in enumerate(reader.pages):
            page_num = idx + 1
            page_warnings: list[str] = []
            try:
                raw_text = page.extract_text() or ""
            except Exception as e:
                raw_text = ""
                page_warnings.append(f"Page extraction exception: {e}")

            stripped = raw_text.strip()
            char_count = len(stripped)

            if char_count == 0:
                pages_with_no_text += 1
                page_warnings.append(f"Page {page_num}: No text extracted (empty or image/scan)")
                norm_text = ""
            else:
                total_extracted_chars += char_count
                norm_text = normalize_text(raw_text)

            record = PageRecord(
                page=page_num,
                textOriginal=raw_text,
                textNormalized=norm_text,
                charCount=char_count,
                warnings=page_warnings,
            )
            result.pages.append(record)
            if page_warnings:
                result.warnings.extend(page_warnings)

        # Classify overall extraction status
        if total_extracted_chars == 0:
            result.textExtractionStatus = TextExtractionStatus.IMAGE_ONLY_OR_UNREADABLE.value
            result.warnings.append(
                "Document contains no extractable text; appears to be image-only or scanned."
            )
        elif pages_with_no_text > 0:
            result.textExtractionStatus = TextExtractionStatus.PARTIAL_SUCCESS.value
            result.warnings.append(
                f"{pages_with_no_text} of {page_count} pages had no extractable text."
            )
        else:
            result.textExtractionStatus = TextExtractionStatus.SUCCESS.value

        return result


def get_extractor_for_file(file_path: str | Path) -> BaseExtractor:
    """Factory function returning the appropriate extractor for the file extension."""
    path = Path(file_path)
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return PdfExtractor()
    raise ValueError(f"Unsupported file format for ingestion: '{suffix}'. Primary support is PDF.")
