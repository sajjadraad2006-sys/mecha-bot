# AI Brain Architectural Rules & Governance

## 1. Zero-Cost & Fail-Closed Guardrails

- `ALLOW_PAID_AI = false`, `ALLOW_PAID_STORAGE = false`, `ALLOW_BILLING_FALLBACK = false`.
- Cloudflare Workers Free provides 10,000 Neurons/day. Free frontier providers (Gemini 2.0 Flash 1,500 RPD; Groq 30 RPM) must enforce local rate and quota monitoring.
- On quota exhaustion (Error 3036 / HTTP 429):
  - Fail closed immediately and lock AI for the remainder of the UTC day.
  - Never cascade to paid models or paid AI Gateway endpoints.
  - Return the standard Iraqi Arabic fallback message:
    _"حالياً المساعد الذكي غير متاح لاكتمال الحصة اليومية، بس تكدر تستخدم باقي وظائف البوت (الجداول، التذكيرات، البحث المباشر، والملفات) بشكل طبيعي."_

## 2. AI Invocation Gate

- Not every message calls the LLM!
- **Deterministic Handlers (NO AI)**: `/start`, `/menu`, `/courses`, "موادي", "الجدول", "وين وصلنا", button callbacks, quiz submissions, file downloads.
- **AI-Eligible**: Concept explanations, multi-source synthesis, follow-up clarification, lecture summaries.
- Deterministic heuristics must decide whether AI is needed before burning inference budget.

## 3. Hierarchical Context & Scope Lock

- **Context Hierarchy**: Student $\rightarrow$ Stage $\rightarrow$ Semester $\rightarrow$ Course $\rightarrow$ Topic $\rightarrow$ Subtopic $\rightarrow$ Thread $\rightarrow$ Intent.
- **Scope Lock**: Follow-up questions ("اشرح هاي الخطوة", "ليش غيرنا الإشارة؟") remain strictly scoped to the active course/topic.
- **Scoped Retrieval**: M7 Search queries are constrained to `exactCourseCode`. The AI must never search the whole university catalog when an active course scope is established.
- **Confidence Levels**:
  - `EXPLICIT`: User explicitly named the course/topic.
  - `INHERITED`: Thread continuation within active scope.
  - `INFERRED`: Derived cautiously from surrounding signals.
  - `AMBIGUOUS`: Multiple targets plausible $\rightarrow$ AI must ask a clarification question (_"تقصد Root Locus لو موضوع الاستقرار؟"_); never guess.
- **Scope Switch Authority**: The AI has NO authority to change academic scope unilaterally. Only explicit user navigation or confirmed button selection switches scope.
- **Context Lifecycle**: `ACTIVE` $\rightarrow$ `STALE` $\rightarrow$ `CLEARED` / `EXPIRED` (TTL bounded).

## 4. Model Health Registry & Smart Failover

- Track model state: `HEALTHY`, `DEGRADED`, `COOLDOWN`, `QUOTA_EXHAUSTED`, `PAID_ONLY`, `DISABLED`.
- Error code reactions:
  - `3036` (Quota Exhausted): Global fail-closed for the day.
  - `3040` (Out of Capacity): Cooldown model; failover to secondary free model.
  - `5035` (Paid Only): Mark model as `PAID_ONLY`; never retry while zero-cost mode is active.
  - `3007` (Timeout): Safe bounded retry, then failover.

## 5. Privacy & Prompt Injection Defense

- **Zero Identity Leakage**: Telegram IDs (`from.id`, `chat.id`), usernames, and phone numbers must NEVER enter LLM prompts. Use opaque internal hashes (`studentKey`).
- **Prompt Injection Boundary**: Academic evidence is treated as untrusted data wrapped in clear boundary tags (`<source_evidence>`). Instructions embedded in PDF/documents cannot override system rules.

## 6. Domain Invariants & Course Safety Policies

- **Progress Integrity:** `EXPECTED != CONFIRMED_BY_STUDENT` and `INFERRED != CONFIRMED`. The AI Brain MUST NEVER confirm student progress.
- **MCT124:** Must always be surfaced with `CONFLICTING / UNRESOLVED` disclaimer. AI must never invent a syllabus resolution.
- **P4MCT:** Must always be surfaced with `IDENTITY_ONLY` disclaimer. AI must never fabricate a topic map.
- **Authority Boundary:** M9 Study Navigator owns diagnostic and progress logic; M10 Exams owns quizzes; M12 Distribution owns file delivery. AI is strictly an explanation and synthesis layer.
