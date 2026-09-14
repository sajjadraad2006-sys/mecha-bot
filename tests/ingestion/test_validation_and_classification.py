"""
Tests for course code validation, filename heuristic classification, and manifest schema validation.
"""

from tools.ingestion.classifier import (
    resolve_document_classification,
    suggest_document_type_from_filename,
)
from tools.ingestion.models import (
    DistributionAllowed,
    DistributionPermissions,
    DocumentType,
    EvidenceScope,
    IngestionManifest,
    OriginMetadata,
    SourceAuthority,
    TextExtractionStatus,
    VerificationStatus,
)
from tools.ingestion.validator import validate_course_code, validate_manifest


def test_valid_course_codes():
    # Valid MCT formats
    valid_codes = ["MCT111", "MCT314", "mct401", "P4MCT", "p4mct", "EE201", "MATH101"]
    for code in valid_codes:
        is_valid, err = validate_course_code(code)
        assert is_valid, f"Expected '{code}' to be valid, but got: {err}"
        assert err is None


def test_invalid_course_codes():
    invalid_codes = ["MCT9999", "INVALID", "123", "CS!!", "MCT", "P5MCT"]
    for code in invalid_codes:
        is_valid, err = validate_course_code(code)
        assert not is_valid, f"Expected '{code}' to be invalid"
        assert err is not None


def test_none_course_code_is_permitted():
    is_valid, err = validate_course_code(None)
    assert is_valid
    assert err is None


def test_filename_heuristic_suggestions():
    # Exam suggestions
    assert suggest_document_type_from_filename("final_2025.pdf") == DocumentType.PAST_EXAM.value
    assert suggest_document_type_from_filename("اسئلة_فاينل.pdf") == DocumentType.PAST_EXAM.value
    assert suggest_document_type_from_filename("midterm_exam.pdf") == DocumentType.PAST_EXAM.value

    # Slides suggestions
    assert suggest_document_type_from_filename("lecture_slides_ch1.pdf") == DocumentType.LECTURE_SLIDES.value
    assert suggest_document_type_from_filename("سلايدات_المادة.pdf") == DocumentType.LECTURE_SLIDES.value

    # Lecturer notes
    assert suggest_document_type_from_filename("ملزمة_التحكم.pdf") == DocumentType.LECTURER_NOTE.value

    # Textbooks
    assert suggest_document_type_from_filename("Modern_Control_Engineering_textbook.pdf") == DocumentType.TEXTBOOK.value

    # Solution manual
    assert suggest_document_type_from_filename("solution_manual_ch3.pdf") == DocumentType.SOLUTION_MANUAL.value

    # Unknown
    assert suggest_document_type_from_filename("file(7).pdf") is None


def test_heuristic_never_silently_sets_document_type():
    """
    CRITICAL: Filename heuristics may only suggest a type.
    documentType remains UNKNOWN unless manually specified.
    """
    doc_type, suggested = resolve_document_classification(
        manual_type=None, filename="final_2025.pdf"
    )
    assert doc_type == DocumentType.UNKNOWN.value
    assert suggested == DocumentType.PAST_EXAM.value


def test_manual_document_type_is_honored():
    doc_type, suggested = resolve_document_classification(
        manual_type="lecturer_note", filename="file(7).pdf"
    )
    assert doc_type == DocumentType.LECTURER_NOTE.value
    assert suggested is None


def test_valid_manifest_schema_validation():
    manifest = IngestionManifest(
        schemaVersion=1,
        documentId="doc_1234567890abcdef",
        sha256="a" * 64,
        originalFilename="lecture.pdf",
        fileSizeBytes=1024,
        mimeType="application/pdf",
        pageCount=10,
        courseCode="MCT314",
        documentType=DocumentType.LECTURER_NOTE.value,
        origin=OriginMetadata(kind="LOCAL_IMPORT"),
        academicYear="2026-2027",
        authority=SourceAuthority.STUDENT_SUBMITTED.value,
        evidenceScope=EvidenceScope.STUDENT_PROVIDED.value,
        verificationStatus=VerificationStatus.CATALOGED.value,
        distributionAllowed=DistributionAllowed.UNKNOWN.value,
        permissions=DistributionPermissions(canSearch=True, canQuote=True, canDistribute=False),
        textExtractionStatus=TextExtractionStatus.SUCCESS.value,
        warnings=[],
    )

    data = manifest.to_dict()
    is_valid, errors = validate_manifest(data)
    assert is_valid, f"Manifest validation failed with errors: {errors}"
    assert len(errors) == 0


def test_invalid_manifest_schema_rejection():
    # Missing required fields and bad sha
    bad_data = {
        "schemaVersion": 2,  # Invalid version
        "documentId": "invalid_id",  # Doesn't start with doc_
        "sha256": "short",
        "fileSizeBytes": -5,
    }
    is_valid, errors = validate_manifest(bad_data)
    assert not is_valid
    assert len(errors) > 0
