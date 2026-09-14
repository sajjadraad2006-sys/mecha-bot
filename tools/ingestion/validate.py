#!/usr/bin/env python3
"""
CLI tool for validating an ingestion manifest against Mecha Bot Schema Version 1.

Usage:
  python tools/ingestion/validate.py <path/to/manifest.json>
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from tools.ingestion.validator import validate_manifest


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate an ingestion manifest JSON against Mecha Bot Schema v1."
    )
    parser.add_argument("manifest", help="Path to manifest JSON file")
    args = parser.parse_args()

    path = Path(args.manifest).resolve()
    if not path.is_file():
        print(f"Error: File not found: {args.manifest}", file=sys.stderr)
        return 1

    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON: {e}", file=sys.stderr)
        return 1

    is_valid, errors = validate_manifest(data)

    print("=== Manifest Schema Validation ===")
    print(f"  Target File: {path.name}")
    print(f"  Document ID: {data.get('documentId')}")
    print(f"  Status:      {'VALID' if is_valid else 'INVALID'}")

    if not is_valid:
        print("\nValidation Errors:")
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    print("  Schema v1 checks passed successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
