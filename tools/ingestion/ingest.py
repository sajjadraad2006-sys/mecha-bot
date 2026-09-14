#!/usr/bin/env python3
"""
CLI tool for local document ingestion.

Usage:
  python tools/ingestion/ingest.py <file-or-dir> [options]

Examples:
  python tools/ingestion/ingest.py "lecture.pdf"
  python tools/ingestion/ingest.py "ملزمة.pdf" --course MCT314 --type lecturer_note
  python tools/ingestion/ingest.py ./raw-folder --recursive
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Add project root to sys.path to allow running directly
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from tools.ingestion.pipeline import IngestionConfig, IngestionPipeline


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Mecha Bot Local Academic Document Ingestion CLI",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("target", help="Path to PDF file or directory to ingest")
    parser.add_argument(
        "--inspect",
        action="store_true",
        help="Inspect document without writing manifests or modifying disk",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="Recursively ingest documents if target is a directory",
    )
    parser.add_argument(
        "--course",
        dest="course_code",
        default=None,
        help="Syntactic course code (e.g. MCT314, MCT111, P4MCT)",
    )
    parser.add_argument(
        "--type",
        dest="document_type",
        default=None,
        help="Explicit document type (e.g. lecturer_note, past_exam, textbook)",
    )
    parser.add_argument(
        "--academic-year",
        dest="academic_year",
        default=None,
        help="Academic year tag (e.g. 2026-2027)",
    )
    parser.add_argument(
        "--origin",
        dest="origin_kind",
        default="LOCAL_IMPORT",
        help="Source origin kind (e.g. legacy_student_bot, student_upload)",
    )
    parser.add_argument(
        "--origin-url",
        dest="origin_url",
        default=None,
        help="Original download URL if known",
    )
    parser.add_argument(
        "--authority",
        dest="authority",
        default=None,
        help="Explicit authority tier (defaults to STUDENT_SUBMITTED)",
    )
    parser.add_argument(
        "--scope",
        dest="evidence_scope",
        default=None,
        help="Explicit evidence scope (defaults to STUDENT_PROVIDED)",
    )
    parser.add_argument(
        "--output-dir",
        dest="output_dir",
        default="data/processed",
        help="Destination directory for manifests and extracted text",
    )

    args = parser.parse_args()

    config = IngestionConfig(
        output_dir=Path(args.output_dir),
        course_code=args.course_code,
        document_type=args.document_type,
        academic_year=args.academic_year,
        origin_kind=args.origin_kind,
        origin_url=args.origin_url,
        authority=args.authority,
        evidence_scope=args.evidence_scope,
    )

    pipeline = IngestionPipeline(config=config)
    target_path = Path(args.target).resolve()

    if not target_path.exists():
        print(f"Error: Target path does not exist: {args.target}", file=sys.stderr)
        return 1

    if args.inspect:
        from tools.ingestion.inspect_doc import inspect_file
        return inspect_file(target_path)

    if target_path.is_file():
        print(f"[*] Ingesting single file: {target_path.name}")
        result = pipeline.ingest_file(target_path)
        if result.success:
            print("\n=== Ingestion Successful ===")
            print(f"  Document ID:    {result.documentId}")
            print(f"  SHA-256:        {result.sha256}")
            print(f"  Filename:       {result.originalFilename}")
            print(f"  Is Duplicate:   {result.is_duplicate}")
            print(f"  Manifest:       {result.manifest_path}")
            print(f"  Extracted Text: {result.extracted_path}")
            if result.warnings:
                print("  Warnings:")
                for w in result.warnings:
                    print(f"    - {w}")
            return 0
        else:
            print("\n=== Ingestion Failed ===")
            print(f"  File: {result.originalFilename}")
            for err in result.errors:
                print(f"  - Error: {err}", file=sys.stderr)
            return 1

    elif target_path.is_dir():
        print(
            f"[*] Ingesting directory: {target_path} (recursive={args.recursive})"
        )
        batch = pipeline.ingest_directory(target_path, recursive=args.recursive)

        print("\n=== Batch Ingestion Summary ===")
        print(f"  Total Scanned: {batch.total_scanned}")
        print(f"  Successful:    {batch.successful}")
        print(f"  Failed:        {batch.failed}")
        print(f"  Duplicates:    {batch.duplicates}")

        if batch.failed > 0:
            print("\nFailed documents:")
            for item in batch.results:
                if not item.success:
                    print(f"  - {item.originalFilename}: {'; '.join(item.errors)}")
            return 1

        return 0

    else:
        print(f"Error: Target is neither a file nor a directory: {args.target}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
