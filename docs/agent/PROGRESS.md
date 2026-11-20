# Agent progress log

Source of truth for where autonomous work stands. Update it at the start and
end of every work package and session. Newest session at the top of the log.

## Current position

- **Branch:** not yet created (WP-00 creates `v2/build` from
  `origin/claude/funny-babbage-hwford`)
- **Draft PR:** not yet opened
- **Current work package:** WP-00
- **Next step:** follow WP-00 in `docs/AGENT_RUNBOOK.md`

## Status

| WP | Title | Status | Notes |
| --- | --- | --- | --- |
| 00 | Bootstrap | TODO | |
| 01 | Close out Phase 1 | TODO | |
| 02 | Repository boundary | TODO | |
| 03 | Schema and migrations | TODO | |
| 04 | RLS, grants, policy tests | TODO | |
| 05 | Authentication and sessions | TODO | |
| 06 | Expert application and review | TODO | |
| 07 | Look composer and publication | TODO | |
| 08 | Tracked retailer handoff | TODO | |
| 09 | Conversion intake and ledger | TODO | |
| 10 | Durable private briefs | TODO | |
| 11 | Recommendations, appointments, follow-up | TODO | |
| 12 | Consent, private media, erasure | TODO | |
| 13 | Analytics and experiment | TODO | |
| 14 | Subscriptions and entitlements | TODO | |
| 15 | Pilot hardening | TODO | |
| 16 | Try-on provider readiness | TODO | |
| 17 | Final pass | TODO | |

Statuses: `TODO`, `IN PROGRESS`, `DONE`, `PARTIAL`, `BLOCKED`.

## Session log

### 2026-11-20 — handover written (not an agent session)

Starting state: `claude/funny-babbage-hwford` at the commit that added this
log, on top of `4787480` (Phase 0 + Phase 1). All checks were green at
`4787480`: typecheck, lint, 43 Vitest tests, production build, 150 scripted
browser checks (not committed).
