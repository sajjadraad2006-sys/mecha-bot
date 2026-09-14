# M6A — Local Source Ingestion Foundation

## 1. Overview & Purpose

The Mecha Bot academic ingestion pipeline provides a local-first, deterministic, offline subsystem for processing raw student-provided, lecturer-provided, and departmental academic documents.

Raw incoming files from legacy student bots, Telegram channels, and student submissions often have irregular filenames, such as:

- `file(7).pdf`
- `ملزمة جديد.pdf`
- `اسئلة مهمه.pdf`

M6A standardizes these raw inputs into structured, verifiable ingestion manifests (`manifests/<documentId>.json`) and page-level extracted text records (`extracted/<documentId>.json`).

### Non-Production Scope

M6A is strictly an ingestion foundation:

- It runs **locally and offline**.
- It does **not** push documents to production.
- It does **not** insert records into production databases (D1/SQLite).
- It does **not** perform vectorization, semantic search, or RAG chunking (reserved for subsequent milestones).

---

## 2. Core Ingestion Lifecycle

The pipeline processes documents through a 6-stage deterministic progression:

```
[RAW]
  │
  ▼
[INSPECTED]       -> File size, MIME validation, path-traversal security
  │
  ▼
[HASHED]          -> SHA-256 digest computation, deterministic document ID
  │
  ▼
[TEXT_EXTRACTED]  -> Page extraction, bilingual normalization, image-only detection
  │
  ▼
[CATALOGED]       -> Manifest & page records serialized to local disk
  │
  ▼
[READY_FOR_REVIEW] -> Awaiting human / administrator academic verification
```

### Lifecycle Rules:

1. **Never Automatically Mark as VERIFIED**: Automatic pipeline execution can only produce `RAW` (on failure/encryption) or `CATALOGED` (on successful extraction). Verification is strictly a human workflow.
2. **Never Automatically Index**: Indexing and vector chunking occur in subsequent milestones after catalog review.

---

## 3. File Hashing & Deterministic Content Identity

Content identity is established solely by hashing the raw binary bytes using **SHA-256**:

- Digest: Standard 64-character hexadecimal string.
- Document ID: Deterministically derived as `doc_<sha256[:16]>`.
- Determinism Guarantee: Ingesting the same unchanged file multiple times will always yield the exact same `documentId` and `sha256`. No random UUIDs are generated.

---

## 4. Duplicate Detection & Handling

Duplicate files often appear under altered names (e.g., `Calculus.pdf` and `Calculus (1).pdf`):

- When a document with an identical SHA-256 has already been cataloged, the pipeline flags it as a duplicate (`is_duplicate = True`).
- **Files are NEVER deleted automatically**.
- The manifest maintains an `observedFilenames` list in its metadata, tracking all filenames associated with that specific content hash.
- A dedicated CLI tool (`duplicates.py`) scans manifests and outputs an audit report of duplicate groups.

---

## 5. Text Extraction & Image-Only Detection

Text extraction is executed using `pypdf`:

- **Page Records**: Extracted on a per-page basis with `page`, `textOriginal`, `textNormalized`, `charCount`, and `warnings`.
- **Zero OCR by Default**: M6A does not run OCR models or heavy ML dependencies.
- **Image-Only / Scanned Document Handling**:
  - If a PDF yields 0 total extractable characters across all pages, its status is marked as:
    ```
    textExtractionStatus = "IMAGE_ONLY_OR_UNREADABLE"
    ```
  - **Text is NEVER fabricated**. Empty pages are recorded with `charCount = 0` and appropriate diagnostic warnings.
- **Corrupted & Encrypted Files**: Corrupted streams and encrypted PDFs are trapped gracefully and recorded with status `FAILED` or `ENCRYPTED` without terminating batch execution.

---

## 6. Text Normalization Rules

To prepare content for search, indexing, and comparison while maintaining full fidelity:

1. `textOriginal` is preserved **unmodified**.
2. `textNormalized` stores normalized text computed according to standardized linguistic rules:

### Arabic Normalization

- Alef normalization: `أ / إ / آ / ٱ` $\rightarrow$ `ا`
- Yaa normalization: `ى` $\rightarrow$ `ي`
- Tashkeel removal: Strips Fatha, Damma, Kasra, Sukun, Shadda, Tanwin, and Tatweel/Kashida (`\u0640`).
- Whitespace collapsing: Consecutive spaces, tabs, and line breaks are collapsed into single spaces.

### English Normalization

- Lowercasing: `text.lower()`
- Whitespace collapsing and trimming.

---

## 7. Provenance & Authority Model

M6A models provenance in accordance with the project's evidence hierarchy (`@mecha-bot/academic`):

| Entity                  | Allowed Values                                                                                                                                                | Ingestion Default                   |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------- |
| **Source Authority**    | `OFFICIAL_DEPARTMENT`, `LECTURER_CURRENT`, `OFFICIAL_UOB`, `PAST_EXAM_VERIFIED`, `OPEN_ACADEMIC`, `STUDENT_USED_REFERENCE`, `STUDENT_SUBMITTED`, `UNVERIFIED` | `STUDENT_SUBMITTED` or `UNVERIFIED` |
| **Evidence Scope**      | `EXACT_COURSE`, `SAME_DEPARTMENT_ARCHIVE`, `SAME_UNIVERSITY_RELATED_COURSE`, `OPEN_ACADEMIC_EQUIVALENT`, `BIBLIOGRAPHIC_ONLY`, `STUDENT_PROVIDED`             | `STUDENT_PROVIDED`                  |
| **Verification Status** | `RAW`, `CATALOGED`, `VERIFIED`, `REJECTED`                                                                                                                    | `CATALOGED`                         |

### Provenance Security Rule:

Even if a filename claims to be official (e.g., `official_final_exam_2025.pdf`), the pipeline **never** elevates authority above `STUDENT_SUBMITTED` or `UNVERIFIED`. Elevation requires manual review.

---

## 8. Copyright & Distribution Policy

To prevent unauthorized redistribution of copyrighted material (such as commercial textbooks and solution manuals), permissions are segmented:

```json
"permissions": {
  "canSearch": true,
  "canQuote": true,
  "canDistribute": false
}
```

- **Textbooks & Solution Manuals**: Automatically assigned:
  - `distributionAllowed = "PROHIBITED"`
  - `canDistribute = false`
- **Default Documents**:
  - `distributionAllowed = "UNKNOWN"`
  - `canDistribute = false` (conservative default)
- The pipeline contains no external downloading mechanisms or links to pirate repositories.

---

## 9. Manifest Schema (Version 1)

Every ingested file produces a manifest stored at `data/processed/manifests/<documentId>.json`:

```json
{
  "schemaVersion": 1,
  "documentId": "doc_4ae453dc4d50f835",
  "sha256": "4ae453dc4d50f8359ed1e581945176c92414db70690f202ae5ffd0f4acfaa5f2",
  "originalFilename": "Lecture1_MCT314.pdf",
  "fileSizeBytes": 128450,
  "mimeType": "application/pdf",
  "pageCount": 14,
  "courseCode": "MCT314",
  "documentType": "LECTURER_NOTE",
  "suggestedDocumentType": "LECTURER_NOTE",
  "origin": {
    "kind": "LOCAL_IMPORT",
    "originalUrl": null,
    "uploadedBy": null
  },
  "academicYear": "2026-2027",
  "authority": "STUDENT_SUBMITTED",
  "evidenceScope": "STUDENT_PROVIDED",
  "verificationStatus": "CATALOGED",
  "distributionAllowed": "UNKNOWN",
  "permissions": {
    "canSearch": true,
    "canQuote": true,
    "canDistribute": false
  },
  "textExtractionStatus": "SUCCESS",
  "warnings": [],
  "metadata": {
    "observedFilenames": ["Lecture1_MCT314.pdf"]
  },
  "extractedAt": "2026-09-14T17:40:00Z"
}
```

---

## 10. CLI Reference

### Ingest a Single File

```bash
python tools/ingestion/ingest.py "path/to/ملزمة.pdf" --course MCT314 --type lecturer_note --academic-year 2026-2027
```

### Ingest a Directory Recursively

```bash
python tools/ingestion/ingest.py ./raw-folder --recursive --origin legacy_student_bot
```

### Inspect a File (Read-Only)

```bash
python tools/ingestion/inspect_doc.py "path/to/exam.pdf"
# or
python tools/ingestion/ingest.py --inspect "path/to/exam.pdf"
```

### Generate Duplicate Audit Report

```bash
python tools/ingestion/duplicates.py data/processed/manifests
```

### Validate a Manifest JSON

```bash
python tools/ingestion/validate.py data/processed/manifests/doc_4ae453dc4d50f835.json
```

---

## 11. Security Architecture & Threat Model

1. **Untrusted Input Handling**: PDFs are treated as hostile, untrusted inputs. The ingestion engine executes no macros, shell commands, embedded JavaScript, or attachment extractors.
2. **Path Traversal Protection**: All output paths are sanitized through `_safe_write_path`, ensuring manifests and extracted files cannot be written outside the configured output root.
3. **Repository Cleanliness**:
   - Raw binary files are excluded from Git via `.gitignore` (`/data/raw/`, `/data/processed/`, `/مصادر/`).
   - Test fixtures are generated synthetically in-memory or in temporary test directories.
4. **Zero Network / AI Dependencies**: The ingestion pipeline operates completely offline with no network calls, no Telegram dependencies, and no AI API calls.

---

## 12. Verification & Test Suite

The ingestion test suite is located in `tests/ingestion/` and contains 33 automated tests covering:

- Deterministic SHA-256 calculation & identity derivation.
- Same bytes producing identical document IDs.
- Duplicate detection & tracking across different filenames.
- Per-page PDF extraction and metadata extraction.
- Image-only / scanned PDF detection without text fabrication.
- Arabic normalization (Alef, Yaa, Tashkeel, Tatweel, whitespace).
- English normalization and original text preservation.
- Malformed, empty, and corrupted PDF resilience.
- Batch ingestion continuity when individual files fail.
- Syntactic course code validation (`MCT314`, `MCT111`, `P4MCT`).
- Filename heuristic suggestions without altering explicit document types.
- Conservative copyright & distribution policy defaults.
- Manifest schema version 1 validation.
- Idempotency upon re-ingesting identical files.

### Running the Tests:

```bash
python -m pytest tests/ingestion -v -p no:cacheprovider
```

---

## 13. Roadmap & Future Milestones

- **M6 Database Integration**: Once parallel branches merge (Agent 1: M1 Onboarding & DB schema), ingestion manifests will map to the `sources`, `source_versions`, and `source_evidence` tables in D1/SQLite.
- **M7 Retrieval & Search**: Integration with chunking strategies, topic associations, Vectorize embeddings, and full-text search (FTS).
- **OCR Subsystem**: Optional secondary pipeline for processing documents flagged as `IMAGE_ONLY_OR_UNREADABLE`.
