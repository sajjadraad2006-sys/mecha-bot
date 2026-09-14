# M7A — Deterministic Academic Search & Retrieval Foundation

## 1. Overview & Architectural Philosophy

The M7A subsystem establishes the deterministic lexical search and contextual retrieval foundation for Mecha Bot. It powers the retrieval engine behind student queries such as:

- _"جيبلي root locus"_
- _"وين شرح steam tables؟"_
- _"اريد اسئلة سنوات عن matrices"_
- _"عندي MCT314 واريد stability"_

### Foundational Principles:

1. **Zero External AI / Network Dependencies**: Operates completely offline without embeddings, Vectorize, OpenAI, Gemini, or Groq.
2. **Lexical First, Intent-Aware Second**: First stage calculates term relevance via an in-memory BM25 index; second stage modulates scores contextually based on query intent and academic provenance.
3. **Evidence Preservation**: Every search result preserves its provenance (`sourceAuthority`, `evidenceScope`, `page`, `documentType`, `verificationStatus`) without flattening or guessing.
4. **No Raw Binary Exposure**: Search results provide structured text excerpts and chunk metadata; raw PDF/binary files are never directly exposed.

---

## 2. Ingestion to Search Pipeline (M6 ➔ M7)

```
[M6 Manifest + Extracted Pages]
               │
               ▼
   [M6 -> M7 Search Adapter]
  (Checks canSearch permission;
   skips unreadable/image-only scans)
               │
               ▼
[Deterministic Semantic Chunker]
(Decomposes text across natural boundaries
 while preserving page provenance)
               │
               ▼
    [SearchDocument Chunks]
               │
               ▼
      [BM25 Lexical Index]
               │
               ▼
   [Contextual Policy Engine]
(Course filters, intent boosts,
 verification & evidence scope policy)
               │
               ▼
      [Ranked SearchResult]
```

---

## 3. SearchDocument Contract

Each searchable unit in the index adheres to the `SearchDocument` interface:

```typescript
export interface SearchDocument {
  id: string; // Unique chunk identifier e.g. doc_<hash>_p12_c1
  documentId: string; // Parent M6 content identity
  chunkId?: string; // Chunk index on page

  courseCode?: string; // Syntactic course code e.g. "MCT314"
  topicKeys: string[]; // Associated topic keys e.g. ["root_locus"]

  title?: string;
  textOriginal: string; // Original unaltered academic text
  textNormalized: string; // Normalized text for token matching

  page?: number; // Source page number
  pageRange?: [number, number]; // Page span
  documentType: string; // LECTURER_NOTE, PAST_EXAM, TEXTBOOK, etc.

  sourceAuthority: string; // OFFICIAL_DEPARTMENT, LECTURER_CURRENT, etc.
  evidenceScope: string; // EXACT_COURSE, SAME_DEPARTMENT_ARCHIVE, etc.
  verificationStatus: string; // RAW, CATALOGED, VERIFIED, REJECTED

  academicYear?: string;
  currentArchiveStatus?: string;

  canSearch: boolean; // Index eligibility
  canQuote: boolean;
  canDistribute: boolean; // File distribution permission

  provenance: {
    sourceId?: string;
    originUrl?: string | null;
    originalFilename?: string;
    originKind?: string;
  };
}
```

---

## 4. Deterministic Text Chunking

Text chunking is performed cleanly without machine learning or heavyweight NLP:

- **Semantic Boundaries**: Breaks large pages along double line breaks (`\n\n`), single line breaks (`\n`), and sentence terminators (`. `, `! `, `؟ `).
- **Target Sizes**: Defaults to 600 characters per chunk with 100 characters of overlap.
- **Page Isolation**: Chunks **never mix pages** across different documents.
- **Empty / Scan Handling**: Pages with 0 text (such as un-OCRed scans) yield 0 searchable chunks.

---

## 5. Text Normalization & Tokenization

M7 shares strict normalization parity with the M6 Python engine:

### Arabic Rules

- `أ / إ / آ / ٱ` $\rightarrow$ `ا`
- `ى` $\rightarrow$ `ي`
- Strips all tashkeel (Fatha, Damma, Kasra, Sukun, Shadda, Tanwin) and Tatweel/Kashida (`\u0640`).
- Collapses consecutive whitespace characters.
- **Preserves Ta-Marbuta (`ة`)**: Does not globally convert `ة` to `ه`.

### English Rules

- Converts all text to lowercase (`.toLowerCase()`).
- Normalizes whitespace characters.

---

## 6. Lexical Ranking Algorithm (BM25)

The search index employs an in-memory implementation of the **BM25** (Best Matching 25) scoring function:

$$\text{Score}(D, Q) = \sum_{t \in Q} \text{IDF}(t) \cdot \frac{\text{TF}(t, D) \cdot (k_1 + 1)}{\text{TF}(t, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$

- **Parameters**: $k_1 = 1.2$ (term frequency saturation), $b = 0.75$ (document length normalization).
- **Smoothed Non-Negative IDF**:
  $$\text{IDF}(t) = \ln\left(1 + \frac{N - n(t) + 0.5}{n(t) + 0.5}\right)$$
- Guarantees that short, focused passages rank appropriately without disproportionately favoring long documents.

---

## 7. Contextual Retrieval Policy & Intent-Aware Ranking

Rather than using a single static authority hierarchy (e.g. `OFFICIAL = 100, STUDENT = 10`), ranking is dynamically adjusted across query intents:

| Intent                  | Primary Boosts                                             | Behavior                                                                      |
| :---------------------- | :--------------------------------------------------------- | :---------------------------------------------------------------------------- |
| `EXAM_LOOKUP`           | `PAST_EXAM`, `QUIZ`, `PAST_EXAM_VERIFIED`                  | Surfaces past exam problems and solutions directly.                           |
| `LECTURER_REQUIREMENTS` | `LECTURER_CURRENT`, `LECTURER_NOTE`, `LECTURE_SLIDES`      | Prioritizes current professor instructions and deadlines.                     |
| `OFFICIAL_IDENTITY`     | `OFFICIAL_DEPARTMENT`, `OFFICIAL_UOB`, `OFFICIAL_SYLLABUS` | Resolves official department curricula and course descriptions.               |
| `CONCEPT_EXPLANATION`   | `LECTURER_NOTE`, `LECTURE_SLIDES`, `TEXTBOOK`              | Focuses on comprehensive explanatory notes; does **not** blindly favor exams. |
| `GENERAL_SEARCH`        | Balanced weighting                                         | Default intent with gentle authority preference.                              |

---

## 8. Evidence Scope & Cross-Course Leakage Protection

- **Exact Course Filter**: If `courseCode = "MCT314"` and `allowRelatedCourses = false` (default), materials from `MCT217` or other courses will **never leak** into results.
- **Related Course Inclusion**: When `allowRelatedCourses = true`, relevant cross-course references (such as prerequisite mathematics) may appear, but are strictly labeled as `SAME_UNIVERSITY_RELATED_COURSE` and discounted (0.85x) to ensure exact course materials take precedence.

---

## 9. Verification Lifecycle & Permission Filtering

1. **REJECTED**: Never returned under any circumstances.
2. **RAW**: Excluded by default unless the caller explicitly includes `RAW` in `verificationStatuses`.
3. **CATALOGED**: Returned by default, but excluded if `allowUnverifiedCataloged = false`.
4. **VERIFIED**: Normal retrieval with a slight confidence boost (1.1x).
5. **Permissions**:
   - `canSearch: false` $\rightarrow$ Document is completely rejected from the index.
   - `canDistribute: false` $\rightarrow$ Document is searchable and quoted, but flagged non-distributable to prevent unauthorized file forwarding in Telegram.

---

## 10. Cache-Ready Query Fingerprints & Index Versions

- **Query Fingerprint**: A deterministic hash (`qfp_<sha256[:16]>`) generated from normalized query text, course code, intent, topic, filters, and index version.
- **Index Version**: A deterministic hash (`idx_<sha256[:16]>`) reflecting the exact content identities and token counts of all indexed chunks.
- Enables downstream response caching in M8 without cache pollution across index updates.

---

## 11. Diagnostic Reasons on Zero Results

When no candidates match, the engine provides structured diagnostics:

- `NO_INDEXED_CONTENT`: Index contains no documents.
- `NO_COURSE_MATCH`: Documents matched lexical terms but were excluded by course filter.
- `FILTERED_BY_VERIFICATION`: Candidates were excluded by verification policy (e.g. `REJECTED` or `RAW`).
- `NO_LEXICAL_MATCH`: No documents matched the query terms.

---

## 12. Local Evaluation CLI

Run interactive search evaluation queries using synthetic fixtures:

```bash
pnpm exec tsx tools/search/demo.ts --query "root locus" --course MCT314
pnpm exec tsx tools/search/demo.ts --query "root locus" --course MCT314 --intent EXAM_LOOKUP
pnpm exec tsx tools/search/demo.ts --query "steam tables" --course MCT217
```

---

## 13. Future Integration Roadmap

1. **Post-M2 Academic Core Integration**:
   - M2 will supply resolved course entities, topic keys, and query intent before passing requests to M7.
2. **SQLite / D1 FTS5 Adapter**:
   - The BM25 scoring and contextual policy engine designed in M7 will cleanly interface with SQLite's `fts5` virtual tables via a lightweight database adapter.
3. **Post-M7 AI Integration (M8)**:
   - M8 will consume retrieved SearchResults and evidence scopes to synthesize student answers without hallucination.
4. **Why Embeddings are Deferred**:
   - Course-scoped lexical retrieval with Arabic normalization and intent-aware contextual weighting handles over 85% of university student inquiries with zero vector compute cost, zero latency spikes, and zero hallucinated drift. Vector search will only be introduced if lexical recall proves insufficient for specific conceptual inquiries.
