# Glowdesk — agent instructions

Before doing anything, read [`docs/AGENT_RUNBOOK.md`](docs/AGENT_RUNBOOK.md)
in full, then `docs/agent/PROGRESS.md` and `docs/agent/QUESTIONS.md`.

The non-negotiables (full list in runbook section 2):

- Never push to `main` or `devin/*`, never force-push, never merge or approve
  a PR, never touch PR #5.
- No real data, keys, payments, payouts, emails or remote databases.
- Nothing simulated may claim to be real. Unknown is "unavailable", not zero.
- Pilot mode fails closed; never fall back silently to mocks or fixtures.
- Never disable RLS or weaken a test to get green.
- Don't make the founder's business decisions; make them configuration and
  log the question.
- Keep `docs/agent/PROGRESS.md` current — it is how the next session resumes.

Checks: `npm run typecheck && npm run lint && npm test && npm run build`
(use `npm run verify` once WP-01 adds it).
