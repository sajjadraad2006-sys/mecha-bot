#!/usr/bin/env python3
"""
CLI tool for inspecting an academic document without writing manifests or modifying disk.

Usage:
  python tools/ingestion/inspect_doc.py <file.pdf>
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from tools.ingestion.classifier import suggest_document_type_from_filename
from tools.ingestion.extractor import get_extractor_for_file
from tools.ingestion.hasher import compute_file_info, derive_document_id


def inspect_file(target_file: str | Path) -> int:
    path = Path(target_file).resolve()
    if not path.is_file():
        print(f"Error: File not found: {target_file}", file=sys.stderr)
        return 1

    try:
        sha256, file_size, filename = compute_file_info(path)
        doc_id = derive_document_id(sha256)
        suggested_type = suggest_document_type_from_filename(filename)

        print("=== Document Inspection ===")
        print(f"  Filename:          {filename}")
        print(f"  File Size:         {file_size:,} bytes")
        print(f"  SHA-256:           {sha256}")
        print(f"  Document ID:       {doc_id}")
        print(f"  Suggested Type:    {suggested_type or 'UNKNOWN'}")

        extractor = get_extractor_for_file(path)
        result = extractor.extract(path)

        print(f"  Page Count:        {result.pageCount}")
        print(f"  Extraction Status: {result.textExtractionStatus}")
        if result.title:
            print(f"  Document Title:    {result.title}")
        if result.metadata:
            print(f"  PDF Metadata:      {result.metadata}")

        if result.pages:
            p1 = result.pages[0]
            print("\n--- Page 1 Preview ---")
            print(f"  Character Count:   {p1.charCount}")
            preview_text = p1.textOriginal[:300].replace("\n", " ")
            if len(p1.textOriginal) > 300:
                preview_text += "..."
            print(f"  Text Snippet:      {preview_text or '[EMPTY]'}")

        if result.warnings:
            print("\n  Warnings:")
            for w in result.warnings:
                print(f"    - {w}")

        if result.errors:
            print("\n  Errors:")
            for e in result.errors:
                print(f"    - {e}", file=sys.stderr)
            return 1

        return 0

    except Exception as e:
        print(f"Inspection failed with error: {e}", file=sys.stderr)
        return 1


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Inspect document properties, hash, and extractable content without writing output."
    )
    parser.add_argument("file", help="Path to document file (e.g. PDF)")
    args = parser.parse_args()
    return inspect_file(args.file)


if __name__ == "__main__":
    sys.exit(main())
