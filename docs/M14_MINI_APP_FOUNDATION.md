# Milestone 14: Telegram Mini App Foundation (`@mecha-bot/mini-app`)

## Overview

The **Telegram Mini App** (`apps/mini-app/`) is Mecha Bot's interactive web client designed for Telegram Desktop, iOS, and Android. It provides undergraduate students in the Mechatronics Engineering Department at the University of Basrah with:

1. **Interactive Weekly Timetable**: Live schedule filtering across days (Sunday–Thursday), stages (1–4), and sections (A, B) with real-time lecture status indicators based on local Baghdad time (`Asia/Baghdad`).
2. **Rich Syllabus & Curriculum Exploration**: Visual course browsing with credits, lecture/lab hours, learning topics breakdown, and prerequisite dependency chains.
3. **Domain Invariant Safeguards**: Explicit, prominent disclaimers for curriculum conflicts (`MCT124`) and identity-only graduation projects (`P4MCT`).
4. **Zero-Cost & Offline-Ready Client Execution**: 100% client-side pre-bundled static architecture with zero external paid APIs, zero egress costs, and microsecond bundling via `esbuild`.

---

## Architectural Principles & Standards

### 1. Technology Stack Compliance

- **Structure**: Semantic HTML5 with responsive mobile-first viewport.
- **Styling**: Pure **Vanilla CSS** with CSS Custom Properties (Tokens) for maximum performance, clean maintenance, and zero build tool overhead. No TailwindCSS.
- **Logic**: Modern TypeScript compiled to native ES Modules.
- **SDK**: Official Telegram WebApp JavaScript SDK (`https://telegram.org/js/telegram-web-app.js`) with haptic feedback (`Telegram.WebApp.HapticFeedback.impactOccurred`) and automatic dark/light theme adaptation.

### 2. Design Aesthetics (Mechatronics Dark Mode)

- **Palette**: Deep Space Navy (`#070b14`), Glass Surface (`rgba(15, 23, 42, 0.78)`), Electric Cyan (`#38bdf8`), Laser Blue (`#2563eb`), Neon Emerald (`#10b981`), Amber Warning (`#f59e0b`).
- **Typography**: Google Fonts `Readex Pro` for natural Iraqi Arabic reading and `Inter` for technical course codes and time intervals.
- **Micro-Animations**: Real-time pulsing Baghdad clock indicator, smooth tab switching, card elevation on hover/touch, and bottom modal slide-up animations.

### 3. Sacred Invariants Protection

- **`MCT124 = CONFLICTING / UNRESOLVED`**: Highlighted with an amber badge (`⚠️ تضارب منهجي`) and an informative alert explaining the divergence between the 2019 Curriculum Sheet (General Physics) and the Microcontroller Syllabus (Semiconductor Physics & Devices).
- **`P4MCT = IDENTITY_ONLY`**: Highlighted with an identity-only badge (`ℹ️ هوية فقط`), suppressing fabricated weekly topic progressions.
- **`Baghdad Weekend Realities`**: Friday and Saturday are explicitly marked as Iraqi academic weekends (`عطلة`).

---

## Directory Layout

```
apps/mini-app/
├── package.json              # @mecha-bot/mini-app
├── tsconfig.json             # ES2022 + DOM lib configuration
├── index.html                # Telegram WebApp HTML5 shell & fonts
├── src/
│   ├── index.css             # Vanilla CSS design system & dark mode tokens
│   ├── types.ts              # UI state, timetable slot, and course models
│   ├── data.ts               # Pre-compiled verified academic & timetable dataset
│   ├── app.ts                # Client controller & Telegram WebApp SDK bindings
│   └── server.ts             # Local preview HTTP server with on-the-fly esbuild bundling
└── dist/                     # Optional build artifacts
```

---

## Telegram Integration

### Launching the Mini App

1. **Command**: Sending `/app` in Telegram opens a dedicated launch message with an inline `web_app` button.
2. **Main Menu**: If `MINI_APP_URL` is set in the environment, the main menu displays the `📱 التطبيق المصغر` button.
3. **Dashboard View**: The dashboard includes a `📱 فتح التطبيق المصغر` quick action button.

### Local Development Runner

Run the local dev server:

```bash
pnpm mini-app:dev
# Running at http://localhost:5173
```

---

## Test & Verification Matrix

| Test Suite                           | Coverage                                                                                                         | Tests Passed         |
| :----------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :------------------- |
| `tests/mini-app-integration.test.ts` | Data integrity, MCT124/P4MCT invariants, esbuild bundling, HTTP preview server with CORS, and Telegram keyboards | 11 / 11              |
| Full Monorepo Vitest                 | All 14 packages and wiring integration                                                                           | 573 / 573            |
| Python Pytest                        | Document ingestion and extraction pipeline                                                                       | 33 / 33              |
| Local D1 Compatibility               | SQLite to Cloudflare D1 migrations and tables                                                                    | 29 tables (0 errors) |
