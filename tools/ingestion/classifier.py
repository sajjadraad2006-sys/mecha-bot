"""
Document type classification heuristics for Mecha Bot local ingestion.
Extracts non-binding suggestions from filenames (e.g. 'final_2025.pdf' -> PAST_EXAM)
without silently trusting them as verified document types.
"""

from __future__ import annotations

import re
from pathlib import Path

from tools.ingestion.models import DocumentType
from tools.ingestion.normalizer import normalize_text

# Deterministic filename pattern rules
HEURISTIC_RULES: list[tuple[re.Pattern, DocumentType]] = [
    # Past exams
    (
        re.compile(
            r"(final|midterm|exam|past_exam|فاينل|مد|امتحان|اسئلة|امتحانات)",
            re.IGNORECASE,
        ),
        DocumentType.PAST_EXAM,
    ),
    # Quizzes
    (re.compile(r"(quiz|كويز|اختبار)", re.IGNORECASE), DocumentType.QUIZ),
    # Assignments
    (
        re.compile(r"(assignment|homework|hw|واجب|واجبات|تقرير|شيت)", re.IGNORECASE),
        DocumentType.ASSIGNMENT,
    ),
    # Lecture slides
    (
        re.compile(r"(slide|slides|presentation|سلايد|سلايدات|عروض)", re.IGNORECASE),
        DocumentType.LECTURE_SLIDES,
    ),
    # Solution manuals
    (
        re.compile(r"(solution|solutions|manual|answers|حلول|اجوبة)", re.IGNORECASE),
        DocumentType.SOLUTION_MANUAL,
    ),
    # Textbooks
    (
        re.compile(r"(textbook|book|edition|كتاب|مرجع)", re.IGNORECASE),
        DocumentType.TEXTBOOK,
    ),
    # Official syllabus / curriculum
    (
        re.compile(r"(syllabus|curriculum|منهاج|مفردات|خطة)", re.IGNORECASE),
        DocumentType.OFFICIAL_SYLLABUS,
    ),
    # Lecturer notes / lectures
    (
        re.compile(
            r"(ملزمة|ملازم|محاضرة|محاضرات|lecture|notes?|lec\b|ch\d+|chapter)",
            re.IGNORECASE,
        ),
        DocumentType.LECTURER_NOTE,
    ),
]


def suggest_document_type_from_filename(filename: str) -> str | None:
    """
    Safely inspect filename to produce a suggested document type.
    Uses normalized filename text to support Arabic and English terms.
    Returns suggested DocumentType value or None.
    """
    stem = Path(filename).stem
    normalized_stem = normalize_text(stem)

    for pattern, doc_type in HEURISTIC_RULES:
        if pattern.search(stem) or pattern.search(normalized_stem):
            return doc_type.value

    return None


def resolve_document_classification(
    manual_type: str | None, filename: str
) -> tuple[str, str | None]:
    """
    Resolve (documentType, suggestedDocumentType).
    CRITICAL RULE:
    Suggested types from filename heuristics NEVER overwrite documentType
    unless manually specified via CLI/input.
    """
    suggested = suggest_document_type_from_filename(filename)

    if manual_type:
        explicit_type = DocumentType.from_string(manual_type).value
        return explicit_type, suggested

    return DocumentType.UNKNOWN.value, suggested
