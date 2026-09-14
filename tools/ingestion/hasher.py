"""
Hashing and content identity utilities for Mecha Bot local ingestion.
Guarantees deterministic document identity based on raw content SHA-256.
"""

from __future__ import annotations

import hashlib
from pathlib import Path


def compute_sha256_from_bytes(data: bytes) -> str:
    """Compute SHA-256 hexadecimal digest from bytes."""
    return hashlib.sha256(data).hexdigest()


def compute_sha256(file_path: str | Path, chunk_size: int = 65536) -> str:
    """
    Stream and compute SHA-256 hexadecimal digest for a file.
    Efficient for both small files and large textbook PDFs.
    """
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"File not found for hashing: {file_path}")

    hasher = hashlib.sha256()
    with path.open("rb") as f:
        while chunk := f.read(chunk_size):
            hasher.update(chunk)
    return hasher.hexdigest()


def derive_document_id(sha256_hex: str) -> str:
    """
    Deterministically derive documentId from SHA-256 digest.
    Same bytes will always produce identical documentId without random UUIDs.
    """
    clean_hash = sha256_hex.lower().strip()
    return f"doc_{clean_hash[:16]}"


def compute_file_info(file_path: str | Path) -> tuple[str, int, str]:
    """
    Extract basic file identity tuple:
    Returns (sha256, fileSizeBytes, originalFilename).
    """
    path = Path(file_path)
    sha256 = compute_sha256(path)
    file_size = path.stat().st_size
    filename = path.name
    return sha256, file_size, filename
