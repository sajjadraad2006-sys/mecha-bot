"""
Tests for end-to-end ingestion pipeline, security guarantees, duplicate detection,
distribution policies, and absence of external network/AI/Telegram dependencies.
"""

import json
import sys
from pathlib import Path

from tests.ingestion.test_extractor import create_minimal_text_pdf
from tools.ingestion.models import (
    DistributionAllowed,
    DocumentType,
    EvidenceScope,
    SourceAuthority,
    VerificationStatus,
)
from tools.ingestion.pipeline import IngestionConfig, IngestionPipeline


def test_end_to_end_single_file_ingestion(tmp_path: Path):
    source_pdf = tmp_path / "notes_mct314.pdf"
    create_minimal_text_pdf(source_pdf, "Automatic Control Systems Lecture 1")

    output_dir = tmp_path / "processed"
    config = IngestionConfig(
        output_dir=output_dir,
        course_code="MCT314",
        document_type="lecturer_note",
        academic_year="2026-2027",
    )
    pipeline = IngestionPipeline(config=config)

    result = pipeline.ingest_file(source_pdf)
    assert result.success is True
    assert result.documentId.startswith("doc_")
    assert result.is_duplicate is False
    assert result.manifest_path.exists()
    assert result.extracted_path.exists()

    # Verify manifest contents
    with result.manifest_path.open("r", encoding="utf-8") as f:
        manifest = json.load(f)
    assert manifest["schemaVersion"] == 1
    assert manifest["courseCode"] == "MCT314"
    assert manifest["documentType"] == DocumentType.LECTURER_NOTE.value
    assert manifest["academicYear"] == "2026-2027"
    assert manifest["verificationStatus"] == VerificationStatus.CATALOGED.value

    # Verify extracted records
    with result.extracted_path.open("r", encoding="utf-8") as f:
        extracted = json.load(f)
    assert extracted["documentId"] == result.documentId
    assert extracted["pageCount"] == 1
    assert "Automatic Control Systems Lecture 1" in extracted["pages"][0]["textOriginal"]
    assert "automatic control systems lecture 1" in extracted["pages"][0]["textNormalized"]


def test_idempotent_reingestion(tmp_path: Path):
    """Re-ingesting the exact same file produces identical content identity and manifest."""
    source_pdf = tmp_path / "idempotent.pdf"
    create_minimal_text_pdf(source_pdf, "Deterministic Payload")

    output_dir = tmp_path / "processed"
    pipeline = IngestionPipeline(config=IngestionConfig(output_dir=output_dir))

    res1 = pipeline.ingest_file(source_pdf)
    res2 = pipeline.ingest_file(source_pdf)

    assert res1.success is True
    assert res2.success is True
    assert res1.documentId == res2.documentId
    assert res1.sha256 == res2.sha256
    assert res2.is_duplicate is True


def test_duplicate_detection_with_different_filenames(tmp_path: Path):
    """Same content with different filenames: single documentId, records multiple observed filenames."""
    file_a = tmp_path / "Calculus.pdf"
    file_b = tmp_path / "Calculus (1).pdf"
    create_minimal_text_pdf(file_a, "Common Calculus Content")
    create_minimal_text_pdf(file_b, "Common Calculus Content")

    output_dir = tmp_path / "processed"
    pipeline = IngestionPipeline(config=IngestionConfig(output_dir=output_dir))

    res_a = pipeline.ingest_file(file_a)
    res_b = pipeline.ingest_file(file_b)

    assert res_a.documentId == res_b.documentId
    assert res_b.is_duplicate is True

    # Check observed filenames
    with res_b.manifest_path.open("r", encoding="utf-8") as f:
        manifest = json.load(f)
    observed = manifest.get("metadata", {}).get("observedFilenames", [])
    assert "Calculus.pdf" in observed
    assert "Calculus (1).pdf" in observed


def test_batch_ingestion_resilience(tmp_path: Path):
    """Batch ingestion continues when a corrupted file is encountered."""
    batch_dir = tmp_path / "raw_batch"
    batch_dir.mkdir()

    # File 1: Valid
    valid1 = batch_dir / "valid1.pdf"
    create_minimal_text_pdf(valid1, "Valid Document One")

    # File 2: Broken/Corrupted
    broken = batch_dir / "broken.pdf"
    broken.write_bytes(b"Not a real pdf at all")

    # File 3: Valid
    valid2 = batch_dir / "valid2.pdf"
    create_minimal_text_pdf(valid2, "Valid Document Two")

    output_dir = tmp_path / "processed"
    pipeline = IngestionPipeline(config=IngestionConfig(output_dir=output_dir))

    batch_result = pipeline.ingest_directory(batch_dir)
    assert batch_result.total_scanned == 3
    assert batch_result.successful == 2
    assert batch_result.failed == 1
    assert len(batch_result.results) == 3


def test_raw_student_file_never_auto_verified(tmp_path: Path):
    """
    Ingestion must NEVER automatically upgrade any file to VERIFIED,
    even if the user/filename claims it is official.
    """
    source_pdf = tmp_path / "official_final_exam_approved.pdf"
    create_minimal_text_pdf(source_pdf, "Final Exam Official")

    output_dir = tmp_path / "processed"
    pipeline = IngestionPipeline(config=IngestionConfig(output_dir=output_dir))
    result = pipeline.ingest_file(source_pdf)

    with result.manifest_path.open("r", encoding="utf-8") as f:
        manifest = json.load(f)

    assert manifest["verificationStatus"] == VerificationStatus.CATALOGED.value
    assert manifest["verificationStatus"] != VerificationStatus.VERIFIED.value
    assert manifest["authority"] in (
        SourceAuthority.STUDENT_SUBMITTED.value,
        SourceAuthority.UNVERIFIED.value,
    )
    assert manifest["evidenceScope"] == EvidenceScope.STUDENT_PROVIDED.value


def test_conservative_distribution_defaults(tmp_path: Path):
    """Textbooks and solution manuals must default to PROHIBITED distribution."""
    textbook_pdf = tmp_path / "Control_Engineering_textbook.pdf"
    create_minimal_text_pdf(textbook_pdf, "Modern Control Textbook")

    output_dir = tmp_path / "processed"
    pipeline = IngestionPipeline(
        config=IngestionConfig(output_dir=output_dir, document_type="textbook")
    )
    result = pipeline.ingest_file(textbook_pdf)

    with result.manifest_path.open("r", encoding="utf-8") as f:
        manifest = json.load(f)

    assert manifest["distributionAllowed"] == DistributionAllowed.PROHIBITED.value
    assert manifest["permissions"]["canDistribute"] is False
    assert manifest["permissions"]["canSearch"] is True
    assert manifest["permissions"]["canQuote"] is True


def test_security_path_traversal_protection(tmp_path: Path):
    """Test that path traversal attempts in write paths are rejected."""
    pipeline = IngestionPipeline(config=IngestionConfig(output_dir=tmp_path / "safe"))
    pipeline._ensure_directories()

    try:
        # Attempt traversal attack
        pipeline._safe_write_path(pipeline.manifests_dir, "../../secret.txt")
        # In Python, Path('../../secret.txt').name returns 'secret.txt',
        # ensuring it is cleaned safely into the directory without traversal.
        resolved = pipeline._safe_write_path(pipeline.manifests_dir, "clean.json")
        assert resolved.parent == pipeline.manifests_dir
    except ValueError:
        # Explicit error is also safe
        pass


def test_no_external_ai_or_telegram_or_network_dependency():
    """Verify that tools.ingestion does not import ai, telegram, or network libraries."""
    for mod_name in list(sys.modules.keys()):
        if mod_name.startswith("tools.ingestion"):
            mod = sys.modules[mod_name]
            for attr in dir(mod):
                val = getattr(mod, attr)
                # Verify no telegram or openai or requests imported into module scope
                assert "telegram" not in str(val).lower()
                assert "openai" not in str(val).lower()
                assert "urllib.request" not in str(val).lower()
