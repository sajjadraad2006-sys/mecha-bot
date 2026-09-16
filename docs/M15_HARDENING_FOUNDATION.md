# Milestone 15: Hardening & Cloudflare Deployment Foundation (`@mecha-bot/worker`)

## Overview

Milestone 15 (**M15: Hardening & Cloudflare Edge Deployment**) hardens Mecha Bot for production release, providing:

1. **Cloudflare Workers Webhook Edge Runtime (`apps/worker/`)**: Direct integration with Telegram using grammY's native `cloudflare-mod` webhook callback, eliminating persistent long-polling processes and running at ultra-low latency (<100ms) on Cloudflare's global edge network.
2. **Anti-Spam & Sliding Window Rate Limiting (`SlidingWindowRateLimiter`)**: Protection against request flooding and DoS attacks by restricting burst updates per user, protecting free-tier AI quotas and serverless resources.
3. **Telegram Secret Token Validation**: Cryptographic verification of the `X-Telegram-Bot-Api-Secret-Token` header, ensuring webhook requests originate strictly from Telegram's servers.
4. **Health Diagnostics Endpoint (`GET /health`)**: Real-time diagnostic reporting on worker uptime, environment configuration, database bindings, and secret tokens.
5. **Zero-Cost & Free-Tier Guardrails**: 100% serverless edge execution within Cloudflare's 100,000 free requests/day allocation, matching the non-negotiable Zero-Cost project rule.

---

## Architectural Principles & Security Boundaries

### 1. Webhook Handshake & Authentication

- In production, Telegram pushes updates to `POST /webhook`.
- If `TELEGRAM_SECRET_TOKEN` is configured:
  - The worker checks `request.headers.get('X-Telegram-Bot-Api-Secret-Token')`.
  - If invalid or missing, it immediately rejects the request with `HTTP 403 Forbidden` before invoking any bot logic or database queries.

### 2. Sliding Window Rate Limiter

- Configured with a default limit of 20 requests per 10-second sliding window per student ID.
- Excess requests are rejected with a polite Iraqi Arabic rate-limit notice:
  ```
  ⚠️ عيني على كيفك شوية! أرسلت رسائل كثيرة بوقت قصير. انتظر لحظات وارجع راسلني.
  ```
- Protects downstream AI providers (Gemini, Groq, OpenRouter) and Cloudflare D1 from exhaustion.

### 3. Worker Environment (`apps/worker/src/index.ts`)

```ts
export interface WorkerEnv {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_SECRET_TOKEN?: string | undefined;
  NODE_ENV?: string | undefined;
  DEFAULT_TIMEZONE?: string | undefined;
  MINI_APP_URL?: string | undefined;
  DB?: unknown;
  AI_PROVIDER?: string | undefined;
  GEMINI_API_KEY?: string | undefined;
  GROQ_API_KEY?: string | undefined;
  OPENROUTER_API_KEY?: string | undefined;
}
```

---

## Deployment & Verification Commands

### 1. Local Worker Preview

```bash
npx wrangler dev --local
```

### 2. Setting Up the Webhook on Telegram

To link your Telegram Bot to your Cloudflare Worker:

```bash
curl -F "url=https://<your-worker-subdomain>.workers.dev/webhook" \
     -F "secret_token=<your-secret-token>" \
     https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook
```

### 3. Testing the Health Check

```bash
curl https://<your-worker-subdomain>.workers.dev/health
# Returns:
# {"status":"healthy","service":"mecha-bot-cloudflare-worker","uptimeSeconds":42,...}
```

---

## Test Verification Matrix

| Test Suite                       | Coverage                                                                                                                | Tests Passed      |
| :------------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :---------------- |
| `tests/hardening-worker.test.ts` | Sliding window rate limiting, anti-spam middleware, /health, /webhook 403/405 validation, and safe database connections | 9 / 9             |
| Full Vitest Suite                | All monorepo packages, bridges, AI brain, dashboard, and mini app                                                       | 582 / 582         |
| Python Pytest                    | PDF extraction and text normalization pipeline                                                                          | 33 / 33           |
| Cloudflare D1 Local Compat       | 29 verified tables and clean migration smoke testing                                                                    | Passed (0 errors) |
