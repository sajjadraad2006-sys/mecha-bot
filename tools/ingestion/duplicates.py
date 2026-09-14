#!/usr/bin/env python3
"""
CLI tool for detecting and reporting duplicate documents among ingested manifests.

Usage:
  python tools/ingestion/duplicates.py [manifests_directory]

Example:
  python tools/ingestion/duplicates.py data/processed/manifests
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any


def scan_for_duplicates(manifests_dir: Path) -> dict[str, list[dict[str, Any]]]:
    """Scan manifests directory and group by content SHA-256."""
    sha_groups: dict[str, list[dict[str, Any]]] = defaultdict(list)

    if not manifests_dir.is_dir():
        return sha_groups

    for json_file in manifests_dir.glob("*.json"):
        try:
            with json_file.open("r", encoding="utf-8") as f:
                data = json.load(f)
            sha = data.get("sha256")
            if sha:
                data["_manifestPath"] = str(json_file)
                sha_groups[sha].append(data)
        except Exception as e:
            print(f"Warning: Could not read manifest '{json_file}': {e}", file=sys.stderr)

    return sha_groups


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Mecha Bot Ingestion Duplicate Report"
    )
    parser.add_argument(
        "manifests_dir",
        nargs="?",
        default="data/processed/manifests",
        help="Path to manifests directory (default: data/processed/manifests)",
    )
    args = parser.parse_args()

    dir_path = Path(args.manifests_dir).resolve()
    if not dir_path.exists():
        print(f"Directory not found: {dir_path}", file=sys.stderr)
        return 1

    sha_groups = scan_for_duplicates(dir_path)
    total_manifests = sum(len(items) for items in sha_groups.values())
    unique_contents = len(sha_groups)

    print("=== Mecha Bot Ingestion Duplicate Report ===")
    print(f"  Scanned Directory: {dir_path}")
    print(f"  Total Manifests:   {total_manifests}")
    print(f"  Unique Identities: {unique_contents}")

    # Check for content duplicates (either multiple manifests with same sha or manifests with multiple observedFilenames)
    detected_duplicates = 0

    for sha, items in sha_groups.items():
        # Case A: Multiple manifest files sharing the exact same sha256
        # Case B: Manifest records multiple observedFilenames
        all_observed: set[str] = set()
        for item in items:
            all_observed.add(item.get("originalFilename", ""))
            obs = item.get("metadata", {}).get("observedFilenames", [])
            for o in obs:
                all_observed.add(o)

        all_observed.discard("")

        if len(items) > 1 or len(all_observed) > 1:
            detected_duplicates += 1
            sample = items[0]
            print(f"\n[!] Duplicate Group #{detected_duplicates}:")
            print(f"    Document ID: {sample.get('documentId')}")
            print(f"    SHA-256:     {sha}")
            print(f"    Course:      {sample.get('courseCode') or 'N/A'}")
            print(f"    Doc Type:    {sample.get('documentType')}")
            print("    Observed Filenames:")
            for fn in sorted(all_observed):
                print(f"      - {fn}")

    print("\n-------------------------------------------")
    if detected_duplicates == 0:
        print("  No duplicate documents detected. All content identities are unique.")
    else:
        print(f"  Found {detected_duplicates} content identity groups with multiple observed filenames.")
        print("  Notice: Raw files are preserved safely without automatic deletion.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
