# Mecha Bot Universal Domain Invariants

## 1. The 7 Sacred Invariants

These invariants are non-negotiable across the entire codebase and must never be altered or relaxed:

1. **`EXPECTED != CONFIRMED_BY_STUDENT`**:
   - Academic calendar projections are purely expected markers.
   - An AI inference or system estimation can NEVER mark a topic as confirmed by the student.
   - Only explicit student interaction through domain APIs can confirm progress.

2. **`INFERRED != CONFIRMED`**:
   - Course pulse indicators or activity heuristics are strictly inferred signals.
   - They must never be conflated with verified student mastery or confirmation.

3. **`MCT124 = CONFLICTING / UNRESOLVED`**:
   - MCT124 contains known conflicting curriculum data.
   - Neither the AI Brain nor any domain service may synthesize or fabricate a false resolution.
   - Any query regarding MCT124 must surface the official unresolved/conflicting disclaimer.

4. **`P4MCT = IDENTITY_ONLY`**:
   - P4MCT has no verified topic progression map.
   - The system must treat it as identity-only and must never hallucinate a study topic hierarchy.

5. **`ADMIN APPROVED != ACADEMICALLY VERIFIED`**:
   - Administrative workflow approval does not equate to academic verification.
   - Verification status originates strictly from authorized academic sources.

6. **`Searchability != Distributability`**:
   - Finding an academic document via M7 Search does NOT grant permission to distribute or download it.
   - M12 File Distribution Service is the sole authoritative gatekeeper for delivery permissions.

7. **`Zero-Cost Fail-Closed & No Paid Fallback`**:
   - `ALLOW_PAID_AI = false`, `ALLOW_PAID_STORAGE = false`, `ALLOW_BILLING_FALLBACK = false`.
   - On quota exhaustion (HTTP 429 / CF Error 3036), the AI Brain must fail closed immediately.
   - It must NEVER cascade to a paid model or billing tier.

## 2. Separation of Domain Truth

The AI Brain (M8) is an interpreter and synthesizer, NOT a source of truth:

- **M2 Academic Core**: Owns course identity, official syllabus taxonomy, and prerequisites.
- **M7 Search**: Owns evidence retrieval and document ranking.
- **M9 Study Navigator**: Owns student diagnostics, catch-up logic, and progression.
- **M10 Exams**: Owns quizzes, exams, and scoring.
- **M12 Distribution**: Owns file download policies and licensing.
- **Telegram App Layer**: Owns user interaction and formatting.
