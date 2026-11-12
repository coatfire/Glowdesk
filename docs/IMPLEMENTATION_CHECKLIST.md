# Implementation checklist

Maintained alongside the code. Sections map to the phases in
[`ORCHESTRATION.md`](./ORCHESTRATION.md) and the
[V2 handover](./GLOWDESK_V2_IDE_HANDOVER.md).

Last updated: 12 November 2026 (Phase 0 + Phase 1 slice).

## Finished (real, working code)

- Real URL routes with reload/Back/Forward/share: `/`, `/looks/[slug]`,
  `/experts/[slug]`, `/try-on`, `/saved`, `/briefs`, `/briefs/new`, `/pro`.
- Per-route metadata: title, canonical URL, Open Graph; the disclosure text is
  included in look share descriptions.
- Domain model in `src/core/`: brand → product → exact variant → retailer
  offer; looks with immutable revisions; expert status; public projection.
- Public projection gate: only approved experts and approved, published,
  attested, disclosed revisions reach pages, metadata, or the browser bundle
  data. Non-public slugs return 404 with no moderation detail.
- "Shop this look": every exact variant in application order, per-retailer
  offers with price, stock state and "price checked" date; estimated total
  that names what it includes and refuses mixed currencies.
- Shade selection restricted to variants of the same product; a different
  shade from the look's is labelled a substitution.
- Authored-versus-curated attribution on cards, look pages and studios.
- Guest saves: versioned, validated local storage; unknown ids dropped;
  storage failures handled; explicit hydration state; single-reducer
  transitions (no lost updates); bookmarks separate from viewing history.
- Share uses the item's canonical URL.
- Try-on browser-resource handling: explicit opt-in before camera/photo;
  duplicate-start guard; cancellation of pending permission requests;
  stream stop on unmount, tab hide and track end; object-URL revocation on
  replace/reset/unmount; MIME, size and decode validation.
- Brief composer: single recipient, validated draft, payload preview.
- Sheets: focus trap, focus restoration, Escape on topmost only, scroll lock.
- `APP_MODE` with fail-closed pilot mode; persistent demo label.
- Vitest suite for the rules above (`npm test`).

## Mocked (works only as a labelled simulation)

| Area | What the demo does | What is not real |
| --- | --- | --- |
| Catalog, experts, looks | Fictional fixtures in `src/data/fixtures/` | Brands, products, retailers, prices, stock, people |
| Verification badge | Labelled "Demo verification" with an explanation | No review took place; criteria are undecided |
| Attestations / review outcomes | Fixture booleans and statuses | No reviewer, no review queue |
| Retailer handoff | In-page notice: "you have not left Glowdesk" | No destination, redirect endpoint, tracking or commission |
| Try-on | Fixed-position CSS tint, one product, labelled "not calibrated" | No face tracking, no provider, no capture |
| Brief | Preview of the payload, then "not sent" | No auth, persistence, delivery, attachments |
| Expert workspace | One fictional inbox; reply drafts live in the tab | No auth, no tenant isolation, no delivery, no look composer |
| Look photographs | Stock reference imagery | Usage rights not verified for portfolio use |

## Blocked (needs a founder decision or external agreement first)

- Launch market → disclosure wording, facial-data treatment, data region.
- Meaning of "verified" and who reviews applications/content.
- Affiliate operating model, commission share, retailer/network agreements.
- Try-on provider (capabilities, licence, privacy terms, cost).
- Subscription pricing; payout provider/process.
- Retention periods, lawful basis/consent design, migration approver.
- Pilot experiment thresholds.

## Deferred (planned, not started)

- **Phase 2:** Supabase auth, reviewed migrations, RLS/grants, storage
  policies, same-tenant constraints, public projection views, `/login`,
  `/apply`, `/admin/review`, look composer and revision submission, policy
  tests. `server-only` guards on private services.
- **Phase 3:** authorised offers, `/api/affiliate/redirect` with allowlist,
  conversion intake, idempotent ledger, earnings states, `/pro/analytics`.
- **Phase 4:** durable brief submit with idempotency key, `/briefs/[id]`,
  private attachments with separate consent, inbox delivery, recommendation
  replies, appointment requests/confirmation, follow-ups, notifications.
- **Try-on spike:** vendor evaluation and a real provider adapter.
- **Phase 5:** Stripe subscriptions/entitlements, payouts, live experiment.
- Analytics events and experiment assignment (handover §14).
- Playwright browser tests in the repo; CI.
- Cosmetic skin analysis (`src/adapters/skin-analysis/`) — separate, deferred
  capability; the Perfect Corp adapter still throws and returns `NaN` cost.

## Known gaps in this slice

- `app/globals.css` still contains styles for removed UI (onboarding,
  skincare timeline, analysis animation). Harmless; prune separately.
- Fixtures are not behind a `server-only` guard. The browser receives only the
  projection as data, but this is a convention, not yet a bundling boundary.
- Accessibility was checked by keyboard/role-based browser automation at
  320–1440px, not with assistive technology or a contrast audit.
- `npm audit` has not been triaged.
