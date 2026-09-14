"""
Tests for SHA-256 calculation, content identity, and determinism.
"""

from pathlib import Path

from tools.ingestion.hasher import (
    compute_file_info,
    compute_sha256,
    compute_sha256_from_bytes,
    derive_document_id,
)


def test_sha256_calculation_from_bytes():
    data = b"Hello Mecha Bot Academic Ingestion"
    sha = compute_sha256_from_bytes(data)
    assert isinstance(sha, str)
    assert len(sha) == 64
    assert sha == compute_sha256_from_bytes(data)


def test_same_bytes_produce_same_identity(tmp_path: Path):
    content = b"Deterministic academic note content for Mechatronics Engineering"
    file1 = tmp_path / "Calculus.pdf"
    file2 = tmp_path / "Calculus (1).pdf"

    file1.write_bytes(content)
    file2.write_bytes(content)

    sha1, size1, fn1 = compute_file_info(file1)
    sha2, size2, fn2 = compute_file_info(file2)

    assert sha1 == sha2
    assert size1 == size2
    assert fn1 == "Calculus.pdf"
    assert fn2 == "Calculus (1).pdf"

    doc_id1 = derive_document_id(sha1)
    doc_id2 = derive_document_id(sha2)
    assert doc_id1 == doc_id2
    assert doc_id1.startswith("doc_")


def test_different_bytes_produce_different_identity(tmp_path: Path):
    file1 = tmp_path / "note_v1.pdf"
    file2 = tmp_path / "note_v2.pdf"

    file1.write_bytes(b"Version 1 content")
    file2.write_bytes(b"Version 2 content - modified")

    sha1 = compute_sha256(file1)
    sha2 = compute_sha256(file2)

    assert sha1 != sha2
    assert derive_document_id(sha1) != derive_document_id(sha2)


def test_streaming_chunked_hash(tmp_path: Path):
    # Test streaming behavior on multi-block content
    large_file = tmp_path / "stream_test.bin"
    chunk = b"A" * 70000  # larger than default 64KB chunk
    large_file.write_bytes(chunk)

    sha = compute_sha256(large_file, chunk_size=1024)
    assert len(sha) == 64
    assert sha == compute_sha256_from_bytes(chunk)
