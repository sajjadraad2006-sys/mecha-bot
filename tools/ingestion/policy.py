"""
Authority, provenance, verification, and distribution policies for Mecha Bot local ingestion.
Enforces non-negotiable conservative rules:
1. Never automatically mark any file as VERIFIED.
2. Never automatically upgrade raw student files to trusted authority.
3. Default distribution to prohibited/unknown for textbooks, solution manuals, and raw submissions.
"""

from __future__ import annotations

from tools.ingestion.models import (
    DistributionAllowed,
    DistributionPermissions,
    DocumentType,
    EvidenceScope,
    SourceAuthority,
    TextExtractionStatus,
    VerificationStatus,
)


def resolve_authority_and_scope(
    origin_kind: str | None = None,
    explicit_authority: str | None = None,
    explicit_scope: str | None = None,
) -> tuple[str, str]:
    """
    Determine source authority and evidence scope.
    CRITICAL RULE:
    Local ingestion NEVER automatically upgrades raw files to trusted authorities
    (e.g., OFFICIAL_DEPARTMENT or LECTURER_CURRENT).
    Even if the filename says 'official_exam.pdf', default to STUDENT_SUBMITTED / UNVERIFIED.
    """
    # 1. Authority resolution
    if explicit_authority:
        try:
            authority = SourceAuthority(explicit_authority).value
        except ValueError:
            authority = SourceAuthority.UNVERIFIED.value
    else:
        # Default for local imports and student bots
        authority = SourceAuthority.STUDENT_SUBMITTED.value

    # 2. Evidence scope resolution
    if explicit_scope:
        try:
            scope = EvidenceScope(explicit_scope).value
        except ValueError:
            scope = EvidenceScope.STUDENT_PROVIDED.value
    else:
        scope = EvidenceScope.STUDENT_PROVIDED.value

    return authority, scope


def resolve_distribution_policy(
    document_type: str,
    suggested_type: str | None = None,
    explicit_distribute: bool | None = None,
) -> tuple[str, DistributionPermissions]:
    """
    Evaluate copyright and distribution permissions.
    Commercial textbooks and solution manuals MUST NEVER be marked redistributable.
    All unknown/unverified documents default to conservative distribution (canDistribute = False).
    """
    effective_type = document_type
    if effective_type == DocumentType.UNKNOWN.value and suggested_type:
        effective_type = suggested_type

    # High-risk copyright materials
    if effective_type in (DocumentType.TEXTBOOK.value, DocumentType.SOLUTION_MANUAL.value):
        return (
            DistributionAllowed.PROHIBITED.value,
            DistributionPermissions(
                canSearch=True,
                canQuote=True,
                canDistribute=False,
            ),
        )

    # If distribution permission is explicitly passed
    if explicit_distribute is True:
        return (
            DistributionAllowed.ALLOWED.value,
            DistributionPermissions(
                canSearch=True,
                canQuote=True,
                canDistribute=True,
            ),
        )
    elif explicit_distribute is False:
        return (
            DistributionAllowed.RESTRICTED.value,
            DistributionPermissions(
                canSearch=True,
                canQuote=True,
                canDistribute=False,
            ),
        )

    # Conservative default for student notes, unverified notes, etc.
    return (
        DistributionAllowed.UNKNOWN.value,
        DistributionPermissions(
            canSearch=True,
            canQuote=True,
            canDistribute=False,
        ),
    )


def resolve_verification_status(text_status: str) -> str:
    """
    Resolve lifecycle state for ingested document.
    CRITICAL RULE:
    Automatic pipeline may only emit RAW or CATALOGED.
    NEVER emit VERIFIED.
    """
    if text_status in (
        TextExtractionStatus.FAILED.value,
        TextExtractionStatus.ENCRYPTED.value,
    ):
        return VerificationStatus.RAW.value

    return VerificationStatus.CATALOGED.value
