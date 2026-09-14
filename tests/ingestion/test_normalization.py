"""
Tests for Arabic and English text normalization.
Ensures original text is preserved separately from normalized forms.
"""

from tools.ingestion.normalizer import (
    normalize_arabic,
    normalize_english,
    normalize_text,
    remove_tashkeel,
)


def test_arabic_alef_normalization():
    # أ / إ / آ / ٱ -> ا
    raw = "أحمد إبراهيم آلات ٱختبار"
    normalized = normalize_arabic(raw)
    assert normalized == "احمد ابراهيم الات اختبار"


def test_arabic_yaa_normalization():
    # ى -> ي
    raw = "محتوى المستودع حتى يرى"
    normalized = normalize_arabic(raw)
    assert normalized == "محتوي المستودع حتي يري"


def test_remove_tashkeel_and_tatweel():
    # Tashkeel: Fatha, Damma, Kasra, Shadda, Sukun, Tanwin; Tatweel
    raw = "مَلْزَمَةٌ دِرَاسِيَّةٌ لِـقِـسْـمِ الهَنْدَسَةِ"
    no_tashkeel = remove_tashkeel(raw)
    assert no_tashkeel == "ملزمة دراسية لقسم الهندسة"


def test_arabic_whitespace_normalization():
    raw = "مرحباً    بكم \n\n  في   جامعة  البصرة\t"
    normalized = normalize_text(raw)
    assert normalized == "مرحبا بكم في جامعة البصرة"


def test_english_normalization():
    raw = "  Mechatronics Engineering MCT314  \nFinal Exam  "
    normalized = normalize_english(raw)
    assert normalized == "  mechatronics engineering mct314  \nfinal exam  "
    # Unified normalization collapses whitespace and lowercases
    unified = normalize_text(raw)
    assert unified == "mechatronics engineering mct314 final exam"


def test_mixed_bilingual_normalization():
    raw = "مَلْزَمَةُ MCT314: Control Systems د. عَلِيّ"
    normalized = normalize_text(raw)
    assert normalized == "ملزمة mct314: control systems د. علي"


def test_preserves_original_text_separately():
    original = "  إِشَارَاتٌ وَأَنْظِمَةٌ - Signals & Systems  "
    normalized = normalize_text(original)

    # Verify original string remains untouched
    assert original == "  إِشَارَاتٌ وَأَنْظِمَةٌ - Signals & Systems  "
    assert normalized == "اشارات وانظمة - signals & systems"
