"""
Domain models and schema definitions for local academic source ingestion.
Compatible with Mecha Bot academic evidence and provenance standards.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from enum import Enum
from typing import Any


class DocumentType(str, Enum):
    LECTURER_NOTE = "LECTURER_NOTE"
    LECTURE_SLIDES = "LECTURE_SLIDES"
    PAST_EXAM = "PAST_EXAM"
    QUIZ = "QUIZ"
    ASSIGNMENT = "ASSIGNMENT"
    STUDENT_NOTE = "STUDENT_NOTE"
    TEXTBOOK = "TEXTBOOK"
    SOLUTION_MANUAL = "SOLUTION_MANUAL"
    OFFICIAL_PROGRAM = "OFFICIAL_PROGRAM"
    OFFICIAL_SYLLABUS = "OFFICIAL_SYLLABUS"
    SUPPORTING_REFERENCE = "SUPPORTING_REFERENCE"
    UNKNOWN = "UNKNOWN"

    @classmethod
    def from_string(cls, val: str | None) -> DocumentType:
        if not val:
            return cls.UNKNOWN
        normalized = val.strip().upper().replace("-", "_").replace(" ", "_")
        for member in cls:
            if member.value == normalized:
                return member
        return cls.UNKNOWN


class SourceAuthority(str, Enum):
    OFFICIAL_DEPARTMENT = "OFFICIAL_DEPARTMENT"
    LECTURER_CURRENT = "LECTURER_CURRENT"
    OFFICIAL_UOB = "OFFICIAL_UOB"
    PAST_EXAM_VERIFIED = "PAST_EXAM_VERIFIED"
    OPEN_ACADEMIC = "OPEN_ACADEMIC"
    STUDENT_USED_REFERENCE = "STUDENT_USED_REFERENCE"
    STUDENT_SUBMITTED = "STUDENT_SUBMITTED"
    UNVERIFIED = "UNVERIFIED"


class EvidenceScope(str, Enum):
    EXACT_COURSE = "EXACT_COURSE"
    SAME_DEPARTMENT_ARCHIVE = "SAME_DEPARTMENT_ARCHIVE"
    SAME_UNIVERSITY_RELATED_COURSE = "SAME_UNIVERSITY_RELATED_COURSE"
    OPEN_ACADEMIC_EQUIVALENT = "OPEN_ACADEMIC_EQUIVALENT"
    BIBLIOGRAPHIC_ONLY = "BIBLIOGRAPHIC_ONLY"
    STUDENT_PROVIDED = "STUDENT_PROVIDED"


class VerificationStatus(str, Enum):
    RAW = "RAW"
    CATALOGED = "CATALOGED"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class DistributionAllowed(str, Enum):
    ALLOWED = "ALLOWED"
    RESTRICTED = "RESTRICTED"
    PROHIBITED = "PROHIBITED"
    UNKNOWN = "UNKNOWN"


class TextExtractionStatus(str, Enum):
    SUCCESS = "SUCCESS"
    PARTIAL_SUCCESS = "PARTIAL_SUCCESS"
    IMAGE_ONLY_OR_UNREADABLE = "IMAGE_ONLY_OR_UNREADABLE"
    FAILED = "FAILED"
    ENCRYPTED = "ENCRYPTED"


@dataclass
class DistributionPermissions:
    canSearch: bool = True
    canQuote: bool = True
    canDistribute: bool = False

    def to_dict(self) -> dict[str, bool]:
        return asdict(self)


@dataclass
class OriginMetadata:
    kind: str = "LOCAL_IMPORT"
    originalUrl: str | None = None
    uploadedBy: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class PageRecord:
    page: int
    textOriginal: str
    textNormalized: str
    charCount: int
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class ExtractedDocument:
    documentId: str
    pageCount: int
    pages: list[PageRecord] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "documentId": self.documentId,
            "pageCount": self.pageCount,
            "pages": [p.to_dict() for p in self.pages],
        }


@dataclass
class IngestionManifest:
    schemaVersion: int = 1
    documentId: str = ""
    sha256: str = ""
    originalFilename: str = ""
    fileSizeBytes: int = 0
    mimeType: str = "application/pdf"
    pageCount: int = 0
    courseCode: str | None = None
    documentType: str = DocumentType.UNKNOWN.value
    suggestedDocumentType: str | None = None
    origin: OriginMetadata = field(default_factory=OriginMetadata)
    academicYear: str | None = None
    authority: str = SourceAuthority.STUDENT_SUBMITTED.value
    evidenceScope: str = EvidenceScope.STUDENT_PROVIDED.value
    verificationStatus: str = VerificationStatus.CATALOGED.value
    distributionAllowed: str = DistributionAllowed.UNKNOWN.value
    permissions: DistributionPermissions = field(default_factory=DistributionPermissions)
    textExtractionStatus: str = TextExtractionStatus.SUCCESS.value
    warnings: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    extractedAt: str = field(
        default_factory=lambda: datetime.now(UTC).isoformat()
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "schemaVersion": self.schemaVersion,
            "documentId": self.documentId,
            "sha256": self.sha256,
            "originalFilename": self.originalFilename,
            "fileSizeBytes": self.fileSizeBytes,
            "mimeType": self.mimeType,
            "pageCount": self.pageCount,
            "courseCode": self.courseCode,
            "documentType": self.documentType,
            "suggestedDocumentType": self.suggestedDocumentType,
            "origin": self.origin.to_dict() if isinstance(self.origin, OriginMetadata) else self.origin,
            "academicYear": self.academicYear,
            "authority": self.authority,
            "evidenceScope": self.evidenceScope,
            "verificationStatus": self.verificationStatus,
            "distributionAllowed": self.distributionAllowed,
            "permissions": self.permissions.to_dict() if isinstance(self.permissions, DistributionPermissions) else self.permissions,
            "textExtractionStatus": self.textExtractionStatus,
            "warnings": list(self.warnings),
            "metadata": dict(self.metadata),
            "extractedAt": self.extractedAt,
        }
