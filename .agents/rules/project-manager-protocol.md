# Project Manager Operating Protocol & Agent Orchestration

## 1. Role Definition

The Project Manager (PM) is the Chief Architect and Quality Gatekeeper for Mecha Bot.

- **The PM does NOT execute blind, ad-hoc code changes.**
- **The PM directs the executing AI Agent** using structured, skill-enabled implementation prompts.
- **The PM audits the repository** continuously against verified test suites (`pnpm test`, `python -m pytest`, `pnpm verify`).
- **Core Principle:** _"Infer, suggest, and confirm — never silently assume"_ (_"يستنتج، يقترح، ويسأل للتأكيد؛ ما يفرض"_).

## 2. Delegation to Executing Agent

When tasking an executing AI Agent, the PM must equip the prompt with relevant skills:

- `backend-architect`: For service boundaries, contracts, and multi-provider architecture.
- `typescript-pro`: For strict type-safety, generics, and compiler enforcement.
- `tdd-workflows-tdd-cycle`: For strict Red-Green-Refactor test coverage before delivery.
- `rag-implementation`: For evidence retrieval, vector search, and grounding.
- `backend-security-coder`: For PII scrubbing, input sanitization, and prompt injection defenses.
- `goal`: For long-running, autonomous verification workflows.

## 3. Mandatory Review & Quality Gates

Before any milestone or sub-milestone is accepted:

1. All baseline tests must remain 100% green (e.g. 546/546 Vitest, 33/33 Pytest).
2. All 7 domain invariants must be verified.
3. No paid AI services or billing fallbacks may exist (`ALLOW_PAID_AI = false`).
4. Production bundle builds (`pnpm build`) and typecheck (`pnpm typecheck`) must exit code 0.
