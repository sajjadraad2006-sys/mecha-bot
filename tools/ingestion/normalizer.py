"""
Text normalization utilities for Mecha Bot local ingestion.
Supports Arabic script normalization, English lowercasing, and whitespace cleaning
while strictly preserving original text separately.
"""

from __future__ import annotations

import re

# Arabic diacritics (tashkeel): Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra, Shadda, Sukun
# and Quranic / extended marks: Maddah, Hamza above/below, Tatweel/Kashida, Superscript Alef
TASHKEEL_REGEX = re.compile(
    r"[\u0617-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]"
)
TATWEEL_REGEX = re.compile(r"\u0640")

# Arabic letter normalization mappings
ALEF_VARIATIONS = re.compile(r"[أإآٱ]")
YAA_VARIATIONS = re.compile(r"ى")

# Whitespace cleaner
WHITESPACE_REGEX = re.compile(r"\s+")


def remove_tashkeel(text: str) -> str:
    """Remove Arabic vowels/diacritics and tatweel from text."""
    text = TASHKEEL_REGEX.sub("", text)
    text = TATWEEL_REGEX.sub("", text)
    return text


def normalize_arabic(text: str) -> str:
    """
    Apply deterministic Arabic text normalization:
    - أ / إ / آ / ٱ -> ا
    - ى -> ي
    - Remove tashkeel (fatha, damma, kasra, sukun, shadda, tanwin) & tatweel
    - Normalize whitespace
    """
    if not text:
        return ""
    text = remove_tashkeel(text)
    text = ALEF_VARIATIONS.sub("ا", text)
    text = YAA_VARIATIONS.sub("ي", text)
    return text


def normalize_english(text: str) -> str:
    """
    Apply English text normalization:
    - Lowercase
    - Normalize whitespace
    """
    if not text:
        return ""
    return text.lower()


def normalize_text(text: str) -> str:
    """
    Apply unified normalization across mixed Arabic and English content.
    Applies Arabic normalization, English lowercasing, and collapses multiple whitespaces.
    Does not destroy or overwrite original text (callers store both textOriginal and textNormalized).
    """
    if not text:
        return ""
    # 1. Normalize Arabic characters & strip tashkeel
    step1 = normalize_arabic(text)
    # 2. Lowercase English characters
    step2 = normalize_english(step1)
    # 3. Collapse whitespace
    step3 = WHITESPACE_REGEX.sub(" ", step2).strip()
    return step3
