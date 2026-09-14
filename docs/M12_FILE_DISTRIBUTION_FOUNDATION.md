# M12A Academic File Distribution Foundation

**Milestone**: M12A — File Catalog & Distribution Foundation  
**Package**: `@mecha-bot/distribution` (`packages/distribution`)  
**Status**: Completed  
**Base Commit**: `ddae9f2`  
**Target Branch**: `feature/m12-file-distribution-foundation-parallel`

---

## 1. Executive Summary

Milestone **M12A** establishes the pure, deterministic file catalog and distribution foundation for Mecha Bot. Built in strict isolation from concurrently running milestones, M12A allows the bot to resolve academic file requests (e.g. _"دزلي ملزمة السيطرة"_, _"جيب أسئلة 2025"_, _"اريد محاضرات ثرمو"_) without storing raw PDF blobs inside Cloudflare/D1 or tracking heavy binaries in Git.

Instead, the architecture relies on lightweight metadata catalog records bound to abstract storage references (such as opaque Telegram `file_id` pointers from a private source data vault or authorized external departmental links), mediated by a conservative, multi-tiered distribution policy engine.

---

## 2. Architecture & The Telegram Data Vault Concept

```
┌────────────────────────────────────────────────────────┐
│               Telegram Source Data Vault                │
│     (Private Channel where files are uploaded once)     │
└───────────────────────────┬────────────────────────────┘
                            │ (telegramFileId, vaultMessageId)
                            ▼
┌────────────────────────────────────────────────────────┐
│            AcademicFileRecord (Metadata Only)           │
│  - courseCode, title, documentType, academicYear       │
│  - verificationStatus (RAW / CATALOGED / VERIFIED)     │
│  - distributionPolicy (ALLOWED / RESTRICTED / ...)     │
│  - storageReference (TELEGRAM_FILE_ID / EXTERNAL_URL)  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              Distribution Policy Engine                │
│  - canSearch vs. canQuote vs. canDistribute            │
│  - Copyright protection & anti-piracy domain filters   │
│  - Student privacy boundaries (GLOBAL/PRIVATE_STUDENT) │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 File Resolver & Service                │
│  - Deterministic candidate ranking & deduplication     │
│  - DeliveryDecision (READY_TELEGRAM_FILE / BLOCKED...) │
└────────────────────────────────────────────────────────┘
```

### Key Principles

1. **No Raw Files in Database or Git**: Storage references contain only metadata and pointers (`TELEGRAM_FILE_ID`, `EXTERNAL_URL`, `LOCAL_ARCHIVE_REFERENCE`, `GOOGLE_DRIVE_REFERENCE`).
2. **Opaque Telegram `file_id` Tokens**:
   - `file_id` strings are treated as opaque identifiers.
   - Never parsed or exposed directly in user-facing message text.
   - Handled directly by future bot sendDocument routines.
3. **Telegram Data Vault**:
   - Files are backed up to a dedicated private Telegram channel (the "Vault").
   - Telegram generates a permanent `file_id` for that bot context, eliminating the need to download or store files locally.
4. **No Piracy or Copyright Bypass**:
   - External URLs are strictly validated to prevent linking to illicit repositories (e.g. Z-Library, Anna's Archive, LibGen, torrents).
   - Commercial textbooks can have searchable bibliographic metadata without permitting unauthorized file distribution.

---

## 3. Package Structure

```
packages/distribution/
├── package.json          # @mecha-bot/distribution
├── tsconfig.json         # Extends tsconfig.base.json
└── src/
    ├── types.ts          # AcademicFileRecord, StorageReference, DeliveryDecision
    ├── schemas.ts        # Zod runtime schemas & anti-piracy URL guards
    ├── telegram-reference.ts # Telegram file_id & external URL abstractions
    ├── policy.ts         # Multi-tiered policy engine & privacy boundaries
    ├── catalog.ts        # Content deduplication & version superseding
    ├── repository.ts     # FileCatalogRepository interface
    ├── in-memory-repository.ts # InMemoryFileCatalogRepository implementation
    ├── resolver.ts       # Deterministic candidate ranking & delivery resolver
    ├── service.ts        # FileDistributionService entrypoint
    ├── fixtures.ts       # Synthetic non-production test fixtures (TEST-DIST-xxx)
    └── index.ts          # Public package re-exports
```

---

## 4. Domain Models

### Document Types

Compatible with ingestion vocabulary:

- `LECTURER_NOTE`
- `LECTURE_SLIDES`
- `PAST_EXAM`
- `QUIZ`
- `ASSIGNMENT`
- `STUDENT_NOTE`
- `TEXTBOOK`
- `SOLUTION_MANUAL`
- `OFFICIAL_PROGRAM`
- `OFFICIAL_SYLLABUS`
- `SUPPORTING_REFERENCE`
- `OTHER`
- `UNKNOWN`

### Source Authority

- `OFFICIAL`: Departmental/University administration
- `FACULTY`: Course professors and lecturers
- `STUDENT`: Student-authored or shared
- `EXTERNAL`: Publishers or third parties
- `UNKNOWN`

### Verification Status vs. Distribution Policy

Verification and distribution permissions are strictly orthogonal:

- `VerificationStatus`: `RAW` | `CATALOGED` | `VERIFIED` | `REJECTED`
- `PolicyState`: `ALLOWED` | `RESTRICTED` | `UNKNOWN` | `PROHIBITED`

> [!IMPORTANT]
> A `CATALOGED` or `VERIFIED` file is **not** automatically distributable. For example, a verified commercial textbook remains `RESTRICTED` from distribution, while retaining `canSearch = true` for syllabus/bibliographic references.
> Furthermore, permission is never granted based solely on filenames (e.g., naming a file `official_note.pdf` does not escalate privileges).

---

## 5. Visibility & Privacy Boundaries

Files are tagged with three visibility scopes:

1. `GLOBAL`: Publicly visible to all students.
2. `COURSE_SHARED`: Accessible within the context of a course.
3. `PRIVATE_STUDENT`: Accessible **only** to the student whose `studentKey` matches the record.
   - If Student A uploads a handwritten summary as `PRIVATE_STUDENT`, Student B will never receive or see it in search or distribution results.

---

## 6. Delivery Decision Matrix

When a student queries the catalog for a file, `FileDistributionService.requestFileDelivery` produces a deterministic `DeliveryDecision`:

| Decision Status             | Description                                       | Action Required                                            |
| --------------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| `READY_TELEGRAM_FILE`       | Authorized file with valid Telegram `file_id`.    | Dispatch via bot `sendDocument(file_id)`.                  |
| `READY_EXTERNAL_LINK`       | Authorized file with verified legal external URL. | Return clickable link to student.                          |
| `BLOCKED_POLICY`            | File is prohibited, restricted, or unverified.    | Inform student of policy restriction reason.               |
| `NEEDS_SELECTION`           | Multiple distinct files match the query.          | Render interactive inline keyboard with candidate options. |
| `NOT_FOUND`                 | No matching records exist.                        | Suggest alternative search or course code.                 |
| `MISSING_STORAGE_REFERENCE` | Catalog record exists without active storage ref. | Alert admin / trigger ingestion pipeline.                  |

---

## 7. Content Deduplication & Versioning

- **Deduplication by `contentHash`**:
  If multiple catalog records point to the same binary payload (matching `contentHash`), `deduplicateByContentHash` retains the highest-quality record (`VERIFIED` > `CATALOGED` > `RAW`, `CURRENT` > `ARCHIVE`) and suppresses duplicate candidates so students are never prompted to choose between identical copies.
- **Schedule/Course Versioning**:
  Files track `archiveStatus`: `CURRENT` | `ARCHIVE` | `UNKNOWN`.
  When a new edition or notes set is uploaded, `supersedeFile` marks previous versions as `ARCHIVE` with explicit `supersedes` pointers, preserving historical provenance.
  Fresh upload dates never automatically infer `CURRENT` status.

---

## 8. Future Integration Roadmap

- **M6 (Academic Ingestion Pipeline)**:
  Ingestion workers extract text and metadata from new vault uploads, compute content hashes, and register `AcademicFileRecord` entries into the catalog repository.
- **M7 (RAG & Retrieval Engine)**:
  Respects `canSearch` and `canQuote` flags. RAG answers can quote from `canQuote = true` documents while checking `canDistribute` before offering full document download buttons.
- **Telegram Bot Integration**:
  A dedicated distribution handler will map `READY_TELEGRAM_FILE` directly to `ctx.replyWithDocument(storageReference.value)` and `NEEDS_SELECTION` to inline selection keyboards.
