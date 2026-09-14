"""
Tests for PDF extraction, page-level records, image-only detection, and error handling.
"""

from pathlib import Path

from pypdf import PdfWriter

from tools.ingestion.extractor import PdfExtractor, get_extractor_for_file
from tools.ingestion.models import TextExtractionStatus


def create_minimal_text_pdf(path: Path, text: str = "Control Systems MCT314") -> None:
    """Generate a clean, syntactically valid PDF with text stream."""
    stream_content = f"BT /F1 18 Tf 50 700 Td ({text}) Tj ET"
    stream_len = len(stream_content)

    pdf_content = (
        f"%PDF-1.4\n"
        f"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
        f"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
        f"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        f"/Resources <</Font <</F1 4 0 R>>>> /Contents 5 0 R>> endobj\n"
        f"4 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
        f"5 0 obj <</Length {stream_len}>> stream\n"
        f"{stream_content}\n"
        f"endstream\n"
        f"endobj\n"
        f"xref\n"
        f"0 6\n"
        f"0000000000 65535 f \n"
        f"0000000010 00000 n \n"
        f"0000000060 00000 n \n"
        f"0000000117 00000 n \n"
        f"0000000240 00000 n \n"
        f"0000000309 00000 n \n"
        f"trailer <</Size 6 /Root 1 0 R>>\n"
        f"startxref\n"
        f"400\n"
        f"%%EOF"
    )
    path.write_bytes(pdf_content.encode("latin1"))


def create_blank_pdf(path: Path, page_count: int = 1, metadata: dict | None = None) -> None:
    """Create a valid PDF with blank/image-only pages (zero text stream)."""
    writer = PdfWriter()
    for _ in range(page_count):
        writer.add_blank_page(width=595, height=842)
    if metadata:
        writer.add_metadata(metadata)
    with path.open("wb") as f:
        writer.write(f)


def test_valid_pdf_extraction(tmp_path: Path):
    pdf_file = tmp_path / "valid_sample.pdf"
    create_minimal_text_pdf(pdf_file, "Mechatronics Engineering MCT314")

    extractor = PdfExtractor()
    assert extractor.can_handle(pdf_file)

    result = extractor.extract(pdf_file)
    assert result.textExtractionStatus == TextExtractionStatus.SUCCESS.value
    assert result.pageCount == 1
    assert len(result.pages) == 1
    assert "Mechatronics Engineering MCT314" in result.pages[0].textOriginal
    assert "mechatronics engineering mct314" in result.pages[0].textNormalized
    assert result.pages[0].charCount > 0
    assert len(result.errors) == 0


def test_image_only_or_scanned_pdf_detection(tmp_path: Path):
    """
    Image-only or scanned PDFs with no text streams must be identified as
    IMAGE_ONLY_OR_UNREADABLE without fabricating text.
    """
    pdf_file = tmp_path / "scanned_doc.pdf"
    create_blank_pdf(pdf_file, page_count=3)

    extractor = PdfExtractor()
    result = extractor.extract(pdf_file)

    assert result.textExtractionStatus == TextExtractionStatus.IMAGE_ONLY_OR_UNREADABLE.value
    assert result.pageCount == 3
    assert len(result.pages) == 3

    # Verify every page has zero fabricated text
    for page in result.pages:
        assert page.textOriginal == ""
        assert page.textNormalized == ""
        assert page.charCount == 0
        assert any("No text extracted" in w for w in page.warnings)


def test_metadata_extraction(tmp_path: Path):
    pdf_file = tmp_path / "with_metadata.pdf"
    create_blank_pdf(
        pdf_file,
        page_count=1,
        metadata={"/Title": "Robotics Notes", "/Author": "Prof. Hassan"},
    )

    extractor = PdfExtractor()
    result = extractor.extract(pdf_file)

    assert result.title == "Robotics Notes"
    assert result.metadata.get("Author") == "Prof. Hassan"


def test_corrupted_pdf_handling(tmp_path: Path):
    corrupt_file = tmp_path / "corrupted.pdf"
    corrupt_file.write_bytes(b"%PDF-1.4\nSome random garbage that is not valid PDF structure\n%%EOF")

    extractor = PdfExtractor()
    result = extractor.extract(corrupt_file)

    # Must fail gracefully without raising an unhandled exception
    assert result.textExtractionStatus == TextExtractionStatus.FAILED.value
    assert len(result.errors) > 0


def test_empty_file_handling(tmp_path: Path):
    empty_file = tmp_path / "empty.pdf"
    empty_file.write_bytes(b"")

    extractor = PdfExtractor()
    result = extractor.extract(empty_file)

    assert result.textExtractionStatus == TextExtractionStatus.FAILED.value
    assert any("empty" in e.lower() for e in result.errors)


def test_unsupported_format_rejection(tmp_path: Path):
    txt_file = tmp_path / "notes.txt"
    txt_file.write_text("plain text", encoding="utf-8")

    try:
        get_extractor_for_file(txt_file)
        assert False, "Should have raised ValueError for unsupported format"
    except ValueError as e:
        assert "Unsupported file format" in str(e)
