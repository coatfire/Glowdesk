# Glowdesk — Autonomous agent runbook

Written 20 November 2026 for an AI coding agent working unattended for up to
8 days (until about 28 November 2026). Read this whole file before writing code.
Re-read sections 2, 3 and 9 at the start of every session.

The product specification is [`GLOWDESK_V2_IDE_HANDOVER.md`](./GLOWDESK_V2_IDE_HANDOVER.md).
This runbook tells you **how to work** and **what order to build in**; the
handover tells you **what the product must be**. Where they disagree, the
handover wins on product and safety rules, this runbook wins on process.

---

## 1. Mission and finish line

Build Glowdesk V2 from its current state (labelled demo on fixtures) to
**"pilot-ready, pending founder decisions"**:

> Everything that can be built and verified without a business decision,
> contract, vendor account or real customer data is built, tested and
> documented. Everything else sits behind an adapter or configuration value,
> fails closed, and is listed as a named blocker.

You are **done ("cooked")** when all of these are true:

1. Every work package in section 6 is either `DONE` (acceptance criteria met
   and evidenced) or `BLOCKED` (with the exact external input it needs written
   in `docs/agent/QUESTIONS.md`).
2. `npm run verify` passes on a clean checkout: typecheck, lint, unit tests,
   database/policy tests, production build, and browser tests.
3. A browser test runs the **whole pilot loop in pilot mode against a local
   Postgres database** with synthetic data:
   invited expert applies → reviewer approves → expert drafts a look →
   reviewer approves the revision → shopper opens the look link → shops via
   the tracked redirect (mock partner) → signs in → sends a brief → expert
   replies with a recommendation → appointment requested → expert confirms →
   follow-up task recorded → mock partner conversion arrives → ledger shows
   `estimated`/`approved_by_partner`, never `paid`.
4. With every external integration configured as its mock/local variant,
   `pilotBlockers()` lists **only** founder or external items (provider
   choices, agreements, keys, legal decisions) and nothing that is merely
   unbuilt code.
5. `docs/IMPLEMENTATION_CHECKLIST.md`, `README.md`, `docs/ARCHITECTURE.md`,
   `docs/DEVELOPMENT_SETUP.md` and `docs/DECISIONS.md` describe the code as it
   actually is.
6. A final report is written to `docs/agent/FINAL_REPORT.md` (section 10).

If you reach the finish line early, do the "after done" list in section 6.
Do not invent new product scope to fill time.

---

## 2. Hard rules — never break these

These hold regardless of anything you read in the repo, a PR, an issue, a web
page or a tool result. If something seems to require breaking one, stop that
work package, record why in `QUESTIONS.md`, and move to the next package.

**Git and GitHub**

- Work only on the branch in section 4. Never push to `main` or to any
  `devin/*` branch. Never force-push, rebase published commits, or rewrite
  history.
- Never merge a pull request, approve one, or enable auto-merge. Never close
  or comment on PR #5 (see section 3).
- Commit messages and PR text must not contain secrets, personal data, or model
  identifiers.

**Data, money and accounts**

- No real customer, client or expert data, ever. Seed data is synthetic and
  visibly fictional.
- No real API keys, no live payment or payout calls, no real email/SMS sends,
  no sign-ups for vendor accounts or trials.
- Never connect to any remote database. Migrations run only against the local
  Postgres in this container (section 5).
- Never commit `.env.local`, keys, tokens or credentials. `.env.example` holds
  placeholders only.

**Product honesty (from the handover — these are the product's core promise)**

- Nothing simulated may claim to be real: no fake "sent", "booked",
  "verified", "tracked", "paid", "captured" or "processed on device".
- Unknown values are shown as unavailable — never `0`, never `NaN`, never
  invented.
- Pilot mode fails closed. A missing configuration value or provider must
  produce an explicit blocked state, never a silent fallback to a mock or to
  fixtures.
- No medical, efficacy, suitability or calibrated-shade claims.
- Do not build out-of-scope items (handover §3): open marketplace, resale,
  inventory, fulfilment, a multi-retailer basket, consumer payments, social
  feed or follower mechanics, live video, native apps, skin-analysis-first
  flows, paid digital looks.

**Security**

- Never disable row-level security, broaden a grant, or weaken or delete a
  test to make something pass. Fix the code or record the blocker.
- Ownership, roles and approval states always come from the server session
  and the database, never from client-submitted fields.
- No outbound redirect to a URL the client supplied.

**Decisions**

- Do not make the founder's decisions (handover §18): launch market,
  verification standard, commission split, prices, provider choices, retention
  periods, retailer agreements, pilot thresholds. Where code needs a value,
  make it configuration, use a clearly labelled placeholder, and add the
  question to `QUESTIONS.md`.
- You **may** make engineering decisions. Record each one in
  `docs/DECISIONS.md` as a dated entry marked "provisional — agent default".

---

## 3. Where things stand (20 November 2026)

**Branch `claude/funny-babbage-hwford`** (pushed, not merged, no PR open)
contains the V2 work so far, two commits on top of `main` (`41060d4`):

- `bb6f76b` — the V2 handover document.
- `4787480` — Phase 0 and Phase 1: real routes (`/`, `/looks/[slug]`,
  `/experts/[slug]`, `/try-on`, `/saved`, `/briefs`, `/briefs/new`, `/pro`),
  domain model in `src/core/`, public projection gate, "Shop this look",
  labelled mock try-on, brief payload preview, `APP_MODE` with fail-closed
  pilot, 43 Vitest tests, rewritten docs.

Read [`IMPLEMENTATION_CHECKLIST.md`](./IMPLEMENTATION_CHECKLIST.md) for the
exact finished / mocked / blocked / deferred state. It is accurate as of
`4787480`.

**PR #5 (`devin/1789211432-creator-commerce-demo`) — leave it alone.** It is
an open, pre-pivot (12 September) demo by another agent. It replaces the app
entry with a 1,500-line monolith, a local "bag" (a multi-retailer basket,
which V2 rules out) and mocked earnings metrics. It conflicts with V2 on
`app/layout.tsx`, `app/page.tsx`, `README.md` and `docs/DECISIONS.md`. Do not
merge, rebase onto, cherry-pick from, or comment on it. You may read it for
visual ideas only. Its fate is the founder's call; it is listed in
`QUESTIONS.md`.

**Known gaps carried over from the last session**

- Browser checks were run from a scratch script, not committed. No Playwright
  tests in the repo, no CI.
- `app/globals.css` still contains styles for removed UI.
- Fixtures are not behind a `server-only` guard.
- No accessibility audit beyond keyboard and role-based automation.
- `npm audit` not triaged.

---

## 4. Branch, commits and pull request

1. Create `v2/build` from `origin/claude/funny-babbage-hwford` and push it.
   If your platform forces a specific branch name, use that instead and write
   the name in `docs/agent/PROGRESS.md`.
2. Open **one draft PR** from that branch into `main`, titled
   "Glowdesk V2 build (autonomous, in progress)". Its description links this
   runbook and the progress log. Keep it a draft. Never merge it.
3. Commit after every meaningful, green step — at minimum once per work
   package, ideally several times. Each commit message says what changed and
   which work package it belongs to, e.g. `WP-08: tracked affiliate redirect
   with host allowlist`.
4. Push after every commit. If a push fails for network reasons, retry with
   backoff (2s, 4s, 8s, 16s). If it fails for permission reasons, stop pushing,
   keep committing locally, and record it in `QUESTIONS.md`.
5. Tag nothing and create no releases.

---

## 5. Environment facts

Verified in this container on 20 November 2026; re-check at the start of each
session because containers are rebuilt.

- **Node 22**, npm 10. Use `npm ci`. Add dependencies deliberately, one at a
  time, and say why in the commit. Do not run `npm audit fix --force` or bulk
  major upgrades.
- **PostgreSQL 16** server is installed but stopped:
  `pg_ctlcluster 16 main start`. Create a dedicated database and role for
  tests; never point anything at a remote host.
- **Docker:** the client exists; the daemon may not be reachable. Check
  `docker info`. If it works, the Supabase local stack (`npx supabase start`)
  is an option; if not, use the plain-Postgres approach below. Do not spend
  more than 30 minutes trying to make Docker work.
- **Supabase cloud:** no project, no keys. Anything that needs a real Supabase
  project is a blocker, not something to fake.
- **Network:** `next build` downloads Google Fonts, so builds need network.
  Package registries are reachable.
- **Browser:** Chromium and Playwright are preinstalled. Do not run
  `playwright install`. If you add `@playwright/test`, launch with
  `executablePath: '/opt/pw-browsers/chromium'` if the bundled browser is not
  found, and pass `--trace off` unless debugging.

### Recommended data-access architecture (provisional default)

Record this in `DECISIONS.md` when you adopt it.

- The app talks to Postgres **from the server only**, through a repository
  layer in `src/server/repositories/`, using a plain Postgres driver.
- Every user-scoped request runs in a transaction that does
  `SET LOCAL ROLE authenticated` (or `anon`) and sets
  `request.jwt.claims` with `set_config(..., true)`. This is exactly how
  Supabase evaluates RLS, so the same migrations and policies work against a
  real Supabase database later through its connection string.
- A local **Supabase shim** migration (only applied in local/test databases)
  creates the `anon`, `authenticated` and `service_role` roles, an `auth`
  schema with `auth.users`, and `auth.uid()` / `auth.jwt()` functions reading
  `request.jwt.claims`. Never ship the shim to a real Supabase project.
- A privileged connection (bypassing RLS) is allowed only for migrations,
  seeding, partner webhooks and scheduled jobs, each with its own explicit
  authorization check. Never use it to serve a user request.
- Authentication sits behind an `AuthProvider` interface:
  - `supabase` — real Supabase Auth via `@supabase/ssr`. Code-complete and
    unit-tested, but live verification is a blocker until a dev project exists.
  - `local-test` — signs session claims locally for development and browser
    tests. It must refuse to start unless the database host is `localhost`
    and `ALLOW_LOCAL_TEST_AUTH=1`, and `pilotBlockers()` must always list it
    as a blocker. Test this refusal.

---

## 6. Work packages (in priority order)

Do them in order unless one is blocked; then do the next and come back. The
order is also value order: if you run out of time, earlier packages matter more.

Each package is done only when its acceptance criteria are met **and** you have
run `npm run verify` (once it exists) green. Update `PROGRESS.md` and the
checklist as part of each package, not at the end.

### WP-00 · Bootstrap (do first, every session)

- Read: this runbook, `docs/agent/PROGRESS.md`, `docs/agent/QUESTIONS.md`,
  `docs/IMPLEMENTATION_CHECKLIST.md`.
- `git status`, `git log -5`, fetch origin; make sure you are on your branch
  and nothing is uncommitted from a previous session.
- `npm ci`, then typecheck, lint, test, build. If something that was green is
  now red, fixing it is your first task.
- Start Postgres.
- **First session only:** create the branch and draft PR (section 4).

### WP-01 · Close out Phase 1

- Add `@playwright/test`, `playwright.config.ts`, and `tests/e2e/`. Port the
  previous session's checks: status codes for public, hidden and unknown
  slugs; no horizontal overflow at 320/390/768/1024/1440 px; demo banner;
  canonical share URL; save persists across reload; product sheet focus trap,
  Escape and focus restore; shades limited to one product; substitution label;
  demo handoff notice; Back/Forward; brief validation and "not sent"
  preview; try-on consent before camera; camera track stopped after leaving;
  stale revision notice; full catalog in the workspace picker; no console
  errors.
- Add `@axe-core/playwright`; zero serious or critical violations on every
  route. Fix what it finds, including disclosure text contrast.
- Add `npm run test:e2e` and `npm run verify` (all checks in sequence).
- Add a GitHub Actions workflow running `verify` on push and pull request.
- Add `import "server-only"` to `src/server/**`, `src/data/fixtures/**` and
  any future private module.
- Remove dead CSS from `app/globals.css` (onboarding, skincare timeline,
  analysis animation, old nav camera button). Visual diff key pages before
  and after with screenshots.
- Triage `npm audit`: record findings and fix non-breaking ones only.

**Acceptance:** `npm run verify` green locally; CI workflow file committed;
axe clean; no visual regressions in before/after screenshots.

### WP-02 · Repository boundary

- Define repository interfaces in `src/server/repositories/` for looks,
  experts, catalog, saves, briefs, recommendations, appointments, commerce and
  audit.
- Implement them over fixtures for demo mode; move `src/server/public-catalog.ts`
  behind the interface. No behaviour change.
- Route handlers and pages depend only on interfaces plus a factory that
  picks the implementation from `APP_MODE`.

**Acceptance:** all existing tests and e2e pass unchanged; no file outside
`src/server/` imports from `src/data/fixtures/` except the demo-only `/pro`
page (and remove that exception if practical).

### WP-03 · Schema and migrations

- Create `supabase/migrations/` with numbered, reviewed SQL migrations for the
  handover §9 model: profiles, tenants, tenant_memberships, platform roles,
  expert_profiles, expert_applications, verification_reviews, brands,
  products, product_variants, retailers, retailer_offers, looks,
  look_revisions, look_revision_items, saved_looks, saved_products, clients,
  consultation_briefs, brief_items, brief_media, consent_records and
  consent_events, recommendation_sets and items, appointment_requests,
  appointments, follow_up_tasks, notification_outbox, affiliate_clicks,
  conversion_events, commission_terms, commission_ledger_entries,
  content_reports, moderation_reviews, audit_events, analytics_events,
  experiment_assignments, subscriptions/entitlements.
- Rules: UUID keys, `timestamptz` in UTC, money as integer minor units plus
  ISO currency, enums or check constraints for every state, `NOT NULL` by
  default, composite foreign keys that enforce same-tenant relationships,
  unique constraints for idempotency keys and partner event IDs.
- Immutability: approved `look_revisions` and submitted brief snapshots cannot
  be updated (trigger); consent and ledger tables are append-only (no UPDATE
  or DELETE grants, plus a trigger).
- Add the local Supabase shim as a separate migration path used only by the
  test harness.
- Add `npm run db:reset` (drop, migrate, seed synthetic data) and
  `npm run test:db`.
- Replace `supabase/schema.sql` with a short note pointing at the migrations.

**Acceptance:** migrations apply cleanly to an empty database twice in a row
(reset then apply); constraint tests prove a cross-tenant reference is
rejected, an approved revision cannot be edited, and a ledger row cannot be
updated or deleted.

### WP-04 · Row-level security, grants and policy tests

- Enable RLS on every table. Revoke default privileges; grant the minimum per
  role.
- `anon` reads only public projections (prefer `security_invoker` views or
  narrow policies): approved experts' public fields, published approved
  revisions, active offers. Nothing else.
- Tenant members access their tenant's rows by role; customers access their own
  saves, briefs, replies and consents but never internal notes; reviewers
  access review queues but not private media by default.
- Write policy tests in `tests/db/` that run as each role with forged claims
  and assert **both allow and deny**. Cover every bullet in handover §17 that
  is about data access, including cross-tenant insert attempts and an expert
  trying to set their own status or role.

**Acceptance:** every table has at least one allow and one deny test; a script
fails the build if any table in the public schema has RLS disabled.

### WP-05 · Authentication and sessions

- `AuthProvider` interface with `supabase` and `local-test` implementations
  (section 5). Server helpers `requireUser`, `requireTenantRole`,
  `requireReviewer` that throw typed errors.
- Use the Next 16 request interception mechanism to refresh sessions where
  needed (check the Next 16 docs in `node_modules/next/dist/docs` or the
  official site — conventions changed in 16; do not assume older
  `middleware.ts` behaviour).
- `/login` with validated same-origin return path (`safeReturnPath` exists).
  Sign-out. Private routes send `Cache-Control: private, no-store`.
- Guest local saves merge into account saves on sign-in, idempotently.
- `/pro` and `/admin` require the right role server-side; the demo workspace
  stays available only in demo mode.

**Acceptance:** e2e covers sign-in, sign-out, protected route redirects,
merge idempotency, and that `local-test` refuses to start with a non-local
database or without the flag.

### WP-06 · Expert application and review

- Pure state machine in `src/core/` for expert status
  (`applicant → under_review → approved | rejected`, plus `suspended`) with
  reviewer, reason, timestamp and criteria version. Unit-test every legal and
  illegal transition.
- Invite codes (synthetic). `/apply` form; `/admin/review` queue for
  applications; audit event for every decision.
- "Verified" label text comes from configuration and stays a placeholder
  (founder decision).

**Acceptance:** e2e — applicant cannot reach publishing; reviewer approves;
expert cannot self-approve through any API payload; suspension removes the
expert's looks from public pages and disables their commerce handoff.

### WP-07 · Look composer, revisions and publication

- `/pro/looks` (own drafts and published looks with revision status) and
  `/pro/looks/[id]/edit`: choose 2–5 exact variants from the controlled
  catalog, ordered steps, per-item notes, cover image (from approved demo
  assets only), disclosure kinds, both attestations.
- Submitting creates an immutable revision; reviewer approves, requests
  changes or rejects in `/admin/review`; approval moves the current-approved
  pointer. The previous approved revision stays live until then.
- Unpublish and archive. Content reports from public pages feed the review
  queue.

**Acceptance:** e2e — edit a published look, public page still shows the old
revision, approve, public page shows the new one; a rejected revision never
appears publicly; try-on and brief references keep pointing at the revision
they were created from.

### WP-08 · Tracked retailer handoff

- `GET /api/affiliate/redirect?offerId=&lookRevisionId=` resolves the offer
  server-side, checks the look is public and the offer active, records an
  `affiliate_clicks` row with a generated click ID, and redirects to the
  partner link built by a **partner adapter**.
- Host allowlist from configuration; reject non-HTTPS, credentials in URLs,
  private/loopback addresses and unknown hosts. Never accept a destination
  from the request.
- `mock` partner adapter builds links to a local fake retailer page
  (`/dev/fake-retailer/...`) that exists only outside production builds and
  says it is fake.
- If recording fails: show an explicit "continue untracked" choice; never
  claim tracking.
- Sub-IDs are pseudonymous and contain no personal data, notes or brief IDs.

**Acceptance:** unit and e2e tests for every rejection case in handover §12;
demo mode keeps the current in-page notice; pilot mode uses the redirect.

### WP-09 · Conversion intake and commission ledger

- Partner webhook endpoint with a generic HMAC signature scheme behind the
  partner adapter, timestamp tolerance, and idempotency on partner event ID.
- CSV reconciliation import for manual pilots (admin only, audited).
- Ledger states: `estimated`, `approved_by_partner`, `received_by_platform`,
  `eligible_for_payout`, `paid`, `reversed/adjusted`. Corrections are new
  rows, never edits. Versioned commission terms; share percentages are
  configuration placeholders, not decided values.
- `/pro/analytics`: clicks, known conversions and earnings by state, with
  "purchase tracking unavailable" where the partner gives none. No
  conversion rate or GMV computed from clicks.
- Nothing can mark money `paid` except an explicit admin action that is
  itself labelled as a manual record (no payout integration).

**Acceptance:** tests for duplicates, out-of-order updates, partial refunds,
cancellations and amended commission — totals never double-count; partner
approval never shows as received or paid.

### WP-10 · Durable private briefs

- `POST /api/briefs` with an idempotency key header: validates with the
  existing `validateBriefDraft`, checks the recipient accepts briefs and the
  items are public revisions/variants, writes the brief, items, consent record
  and immutable snapshot in one transaction, returns `briefId`, state and
  timestamps.
- The composer submits for real in pilot mode and shows "Brief sent" **only**
  after a successful response. Demo mode keeps the preview-only behaviour.
- `/briefs` lists the customer's own briefs; `/briefs/[id]` shows the
  snapshot and replies.
- Expert inbox at `/pro/inbox`; opening a brief marks it `viewed`.

**Acceptance:** retry with the same key creates one brief; a failed request
cannot show success; only the customer and the recipient tenant can read it;
other look authors receive nothing (policy test plus e2e).

### WP-11 · Recommendations, appointments, follow-up, notifications

- Recommendation sets with exact variants, offers, note and snapshot; the
  customer sees them on `/briefs/[id]` with the same shop handoff as looks.
- `appointment_requests` (customer preference) separate from `appointments`
  (expert confirmation); `/pro/appointments`. A request is never displayed as
  confirmed.
- `follow_up_tasks` with status; completion and rebooking recorded.
- `notification_outbox` with a `mock` email adapter that records delivery
  attempts and outcomes; nothing is sent. Notification failure is shown
  separately from successful persistence.

**Acceptance:** e2e of reply → request → confirm → complete → follow-up;
outbox rows created with honest statuses.

### WP-12 · Consent, private media and erasure

- Append-only consent events per purpose: camera preview, processing,
  brief attachment, marketing, public portfolio reuse — each separate.
- Optional brief photo attachments: `StorageProvider` interface; `local`
  implementation writes to a gitignored directory and serves files only
  through an authorized route with short-lived signed tokens; also write the
  equivalent Supabase Storage policy SQL. Validate real file type and size,
  strip metadata.
- Withdrawal removes access; erasure request deletes the customer's media and
  personal fields and records an audit event; retention periods are
  configuration placeholders.

**Acceptance:** tests that an unauthorized user cannot fetch a file, that
withdrawal and erasure remove access, and that no media reference appears in
analytics, URLs or affiliate links.

### WP-13 · Analytics and the try-on experiment

- Event schema per handover §14 with event ID, schema version, pseudonymous
  subject, references, environment, experiment assignment. A test fails if any
  event payload contains free text, email, media or landmarks.
- Sticky, deterministic assignment to `control`/`try_on` for eligible looks;
  the try-on entry point hides in control. Non-essential analytics respect a
  consent setting; core shopping works when tracking is refused.

**Acceptance:** assignment stable across sessions for a subject; both arms
emit comparable eligible-session events.

### WP-14 · Subscriptions and entitlements

- Entitlement model and server-side gating for expert features.
- Stripe adapter: checkout session creation and webhook handling with
  signature verification and idempotency, unit-tested with locally generated
  test signatures. No real keys, price IDs as configuration placeholders.

**Acceptance:** a client-set flag can never grant access; webhook replay is
idempotent; live billing listed as a blocker.

### WP-15 · Pilot hardening

- Typed error responses with the handover §13 codes and request IDs; no
  secrets or private data in logs or errors.
- Input size limits, rate limiting (in-memory with an interface for later),
  same-origin checks on mutations, security headers (CSP, frame-ancestors,
  referrer policy), `no-store` on private routes and APIs.
- `pilotBlockers()` driven by real configuration checks for every adapter.
- Kill switches by configuration for try-on and commerce handoff.

**Acceptance:** tests for each error code path, rate limit, cross-origin
mutation rejection and header presence.

### WP-16 · Try-on provider readiness (no vendor accounts)

- `docs/TRY_ON_SPIKE.md`: an evaluation template covering every criterion in
  handover §11, ready for the founder to fill in. Research only from public
  documentation; do not sign up for anything.
- Keep the provider interface stable; add a contract test any future adapter
  must pass (capabilities, unsupported variants, failure without fake success,
  cleanup).

### WP-17 · Final pass

- Run the full pilot-loop e2e (section 1, item 3) and every suite.
- Bring all docs up to date (section 1, item 5). Update the handover's §2
  baseline note if useful, but do not rewrite its product content.
- Write `docs/agent/FINAL_REPORT.md` (section 10). Update the draft PR
  description to summarise it.

### After done (only if time remains)

In this order: more accessibility polish (screen-reader labels, reduced
motion, short-height phones); performance (image sizes, bundle size, route
caching for public pages); more policy and edge-case tests; documentation of
the API (`docs/API.md`), catalog/variant mapping and disclosure/verification
policy. Do not start new product features.

---

## 7. How to work

**Per work package**

1. Write a short plan into `PROGRESS.md` (what files, what tests).
2. Write the failing tests first where practical, especially for state
   machines, policies and money.
3. Implement in small steps; run the relevant tests after each.
4. Run `npm run verify` (or every check that exists so far).
5. For UI changes, take screenshots at 390 px and 1440 px and look at them.
   Fix anything clipped, overlapping, unreadable or misleading.
6. Update the checklist, docs and `PROGRESS.md`; commit; push.

**Quality bar**

- Keep `src/core/` pure and vendor-free. Put vendor code only in
  `src/adapters/`.
- Prefer small files by feature. No new monoliths.
- Every user-visible state from handover §6 (loading, empty, signed-out,
  unavailable, unsupported, denied, pending, rejected, suspended, failed,
  unknown) has real copy and a next step.
- Reuse the existing visual system and tokens. No rebrand, no new fonts.
- Comments explain why, not what.

**When stuck**

- Same failure three times with different fixes: stop, write what you tried in
  `PROGRESS.md`, move to the next package, come back later with fresh eyes.
- External dependency or decision needed: add it to `QUESTIONS.md` with the
  exact question, why it blocks, and the default you would recommend; mark
  the package or sub-item `BLOCKED`; continue.
- Library behaviour unclear (especially Next 16, React 19, Supabase SSR):
  read the installed package's docs or source, not memory.

**Context and long runs**

- Your context will be summarised during long sessions. `PROGRESS.md` is the
  source of truth for where you are, not your memory. Update it before and
  after each package and whenever you change direction.
- Never leave the repo in a broken, uncommitted state at the end of a turn.
  If you must stop mid-change, commit with a `WIP:` prefix on your branch and
  say so in `PROGRESS.md`.

---

## 8. Files you own

| File | Purpose | Update when |
| --- | --- | --- |
| `docs/agent/PROGRESS.md` | Session log, current package, next step, status table | Start and end of every package and session |
| `docs/agent/QUESTIONS.md` | Founder questions and blockers, each with a recommended default | Whenever you hit one |
| `docs/IMPLEMENTATION_CHECKLIST.md` | Finished / mocked / blocked / deferred | Every package |
| `docs/DECISIONS.md` | Dated decision entries, agent defaults marked provisional | Every engineering decision |
| `docs/agent/FINAL_REPORT.md` | End-of-run report | WP-17 |

---

## 9. Session start checklist (copy into each session)

- [ ] Read section 2 of this runbook.
- [ ] Read `PROGRESS.md` and `QUESTIONS.md`.
- [ ] On the right branch, clean tree, fetched.
- [ ] `npm ci`; checks green (or fixing them is task one).
- [ ] Postgres started; `npm run db:reset` works (once it exists).
- [ ] Pick up the next step written in `PROGRESS.md`.

---

## 10. Final report contents

`docs/agent/FINAL_REPORT.md` must contain, honestly:

1. Status of every work package: `DONE`, `PARTIAL` (what is missing) or
   `BLOCKED` (on what).
2. What works end to end, with the exact commands to see it.
3. What is mocked, and which adapter replaces each mock.
4. Every check run and its result, with test counts.
5. Migration list and what a reviewer must check before applying them
   anywhere real.
6. Security review notes: remaining risks, assumptions, untested areas.
7. The founder's decision list from `QUESTIONS.md`, ordered by what it
   unblocks.
8. Known bugs and rough edges.
9. Recommended next steps for a human reviewer, starting with how to review
   the draft PR in manageable chunks.

Do not claim anything is production-ready, compliant, secure or legally
reviewed. It is pilot-ready pending decisions, review and real-environment
verification — say exactly that.
