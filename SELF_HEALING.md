# SB1 — AI Self-Healing & Webhook Monitor

## Active
- `/api/health` probes configured external providers.
- Provider failures are isolated by a short circuit-breaker and an optional configured fallback.
- `/api/monitor` receives structured browser/runtime diagnostics.
- GitHub Actions runs the monitor every 5 minutes and manually.
- A failed monitor can create a diagnostic GitHub issue when `SB1_AI_REPAIR_ENABLED=true`.
- Typecheck/build are a required safety gate.

## Configure
- `SB1_PUBLIC_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_HEALTH_URL`
- `SB1_PAYMENT_FALLBACK_URL`
- `SB1_AVATAR_API_URL`
- `SB1_AVATAR_FALLBACK_URL`
- `SB1_IDENTITY_API_URL`
- `SB1_IDENTITY_FALLBACK_URL`

Fallbacks are opt-in. The system never silently substitutes an unknown payment, identity, or medical provider.

## Internal repair
The monitor records failures and opens a diagnostic issue. It does not allow an LLM to silently rewrite and execute arbitrary production code: that would create unacceptable payment, privacy, security, and medical-safety risk. A controlled repair branch/PR with tests and deployment protection is the safe way to automate code repair.
