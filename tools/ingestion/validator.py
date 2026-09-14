"""
Validation utilities for Mecha Bot local ingestion.
Validates course codes syntactically and verifies manifest schema compliance.
"""

from __future__ import annotations

import re
from typing import Any

from tools.ingestion.models import (
    DistributionAllowed,
    DocumentType,
    EvidenceScope,
    SourceAuthority,
    TextExtractionStatus,
    VerificationStatus,
)

# Syntactic course code pattern:
# - MCT followed by stage digit 1-4 and 2 digits: MCT111, MCT314, MCT401
# - Graduation project pattern: P4MCT or P[1-4]MCT
# - Department prerequisite / college service courses: e.g. ME101, EE201, MATH101
COURSE_CODE_REGEX = re.compile(
    r"^(MCT[1-4]\d{2}|P[1-4]MCT|[A-Z]{2,4}\d{3})$", re.IGNORECASE
)

SHA256_REGEX = re.compile(r"^[a-f0-9]{64}$", re.IGNORECASE)


def validate_course_code(code: str | None) -> tuple[bool, str | None]:
    """
    Validate course code format syntactically without requiring access to M1 database.
    Accepts MCT314, MCT111, P4MCT, etc.
    Returns (is_valid, error_message).
    """
    if code is None:
        return True, None
    clean = code.strip()
    if not clean:
        return True, None
    if COURSE_CODE_REGEX.match(clean):
        return True, None
    return (
        False,
        f"Invalid course code format: '{code}'. Expected patterns like MCT314, MCT111, or P4MCT.",
    )


def validate_manifest(data: dict[str, Any]) -> tuple[bool, list[str]]:
    """
    Validate an ingestion manifest dictionary against Schema Version 1 rules.
    Returns (is_valid, error_list).
    """
    errors: list[str] = []

    # Required top-level fields
    required_fields = [
        "schemaVersion",
        "documentId",
        "sha256",
        "originalFilename",
        "fileSizeBytes",
        "mimeType",
        "pageCount",
        "documentType",
        "origin",
        "authority",
        "evidenceScope",
        "verificationStatus",
        "distributionAllowed",
        "permissions",
        "textExtractionStatus",
        "warnings",
        "extractedAt",
    ]

    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: '{field}'")

    if errors:
        return False, errors

    # Schema version
    if data["schemaVersion"] != 1:
        errors.append(f"Unsupported schemaVersion: {data['schemaVersion']}. Expected 1.")

    # documentId
    if not isinstance(data["documentId"], str) or not data["documentId"].startswith("doc_"):
        errors.append(f"Invalid documentId: '{data['documentId']}'. Must start with 'doc_'.")

    # SHA-256
    sha256_val = str(data.get("sha256", ""))
    if not SHA256_REGEX.match(sha256_val):
        errors.append(f"Invalid sha256 digest: '{sha256_val}'. Must be 64 hex characters.")

    # fileSizeBytes
    if not isinstance(data["fileSizeBytes"], int) or data["fileSizeBytes"] < 0:
        errors.append("fileSizeBytes must be a non-negative integer.")

    # pageCount
    if not isinstance(data["pageCount"], int) or data["pageCount"] < 0:
        errors.append("pageCount must be a non-negative integer.")

    # Course code syntactic check
    course_code = data.get("courseCode")
    if course_code is not None:
        is_valid_code, code_err = validate_course_code(str(course_code))
        if not is_valid_code and code_err:
            errors.append(code_err)

    # Document type
    doc_type = data.get("documentType")
    valid_doc_types = {m.value for m in DocumentType}
    if doc_type not in valid_doc_types:
        errors.append(f"Invalid documentType: '{doc_type}'. Allowed: {sorted(valid_doc_types)}")

    # Authority
    authority = data.get("authority")
    valid_authorities = {m.value for m in SourceAuthority}
    if authority not in valid_authorities:
        errors.append(f"Invalid authority: '{authority}'. Allowed: {sorted(valid_authorities)}")

    # Evidence scope
    scope = data.get("evidenceScope")
    valid_scopes = {m.value for m in EvidenceScope}
    if scope not in valid_scopes:
        errors.append(f"Invalid evidenceScope: '{scope}'. Allowed: {sorted(valid_scopes)}")

    # Verification status
    v_status = data.get("verificationStatus")
    valid_v_statuses = {m.value for m in VerificationStatus}
    if v_status not in valid_v_statuses:
        errors.append(
            f"Invalid verificationStatus: '{v_status}'. Allowed: {sorted(valid_v_statuses)}"
        )

    # Distribution allowed
    dist_allowed = data.get("distributionAllowed")
    valid_dist = {m.value for m in DistributionAllowed}
    if dist_allowed not in valid_dist:
        errors.append(
            f"Invalid distributionAllowed: '{dist_allowed}'. Allowed: {sorted(valid_dist)}"
        )

    # Permissions
    perms = data.get("permissions")
    if not isinstance(perms, dict):
        errors.append("permissions must be a dictionary object.")
    else:
        for p_key in ("canSearch", "canQuote", "canDistribute"):
            if p_key not in perms or not isinstance(perms[p_key], bool):
                errors.append(f"permissions.{p_key} must be a boolean.")

    # Text extraction status
    t_status = data.get("textExtractionStatus")
    valid_t_statuses = {m.value for m in TextExtractionStatus}
    if t_status not in valid_t_statuses:
        errors.append(
            f"Invalid textExtractionStatus: '{t_status}'. Allowed: {sorted(valid_t_statuses)}"
        )

    # Warnings
    if not isinstance(data.get("warnings"), list):
        errors.append("warnings must be a list of strings.")

    return len(errors) == 0, errors
