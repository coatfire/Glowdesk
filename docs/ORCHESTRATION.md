# ORCHESTRATION.md — build plan and exit gates

Source of truth for sequencing. Phases follow
[`GLOWDESK_V2_IDE_HANDOVER.md`](./GLOWDESK_V2_IDE_HANDOVER.md) §16; item-level
status is in [`IMPLEMENTATION_CHECKLIST.md`](./IMPLEMENTATION_CHECKLIST.md).
These are dependency-ordered slices, not dates.

## Phase 0 — Honest baseline · done (12 Nov 2026)

- [x] Handover in `docs/`, pivot recorded in `DECISIONS.md`
- [x] Explicit demo/pilot modes; persistent demo label
- [x] No action claims real delivery, checkout, booking, verification or payout
- [x] Fake metrics, unconditional badges, the permanent "brief sent" flag and
      the skincare-result timeline removed
- [x] typecheck, lint, build pass

## Phase 1 — Structured looks and shareable public UX · done, pending review

- [x] Domain types, variant/offer fixtures, look steps, revision identity
- [x] `/looks/[slug]`, `/experts/[slug]` and supporting routes
- [x] Complete "Shop this look"; shade selection within one product
- [x] Authored vs curated attribution; disclosure on cards, detail, product actions
- [x] Save/capture race fixed; storage validated; browser resources cleaned up
- [x] Direct link, reload, Back/Forward verified at 320/390/768/1024/1440px
- [ ] Assistive-technology and contrast review
- [ ] Browser tests committed to the repo

No backend production-readiness is claimed.

## Phase 2 — Secure persistence, verification, publication · not started

Supabase auth, reviewed migrations, RLS/grants, storage policies, same-tenant
constraints, public projections, invite applications, admin review, versioned
publication.

Gate: anonymous users read only approved public content; experts cannot
self-approve; cross-tenant access fails (including foreign-key insertion);
drafts stay private; suspension removes public commerce; private media needs
authorization; policy tests cover allow **and** deny. No real customer data
before this gate.

## Phase 3 — Retailer handoff and measurable commerce · blocked on agreements

Gate: exact-variant handoff works; malicious destinations rejected;
duplicate/refund/out-of-order callbacks never double-credit; unknown stays
unknown; estimated/approved/received/paid are distinct.

## Phase 4 — Private briefs and retention loop · not started (needs Phase 2)

Gate: submitted data reaches the right inbox once under retry; only customer
and recipient can read it; requested dates never shown as confirmed;
notification failure reported separately from persistence.

## Parallel spike — Real product try-on · blocked on provider choice

May run alongside Phases 2–4. Real facial processing needs the security,
consent and vendor gates. Must not block the non-AR shopping path.

## Phase 5 — Live pilot and subscription validation · not started

Gate: money reconciles; access/content can be revoked; deletion and report
requests handled; tracking limits explained. Expansion is a founder decision.

---

## Superseded plan (kept for history)

The original plan (M0 skin-analysis validation spike → M1 multi-tenant core →
M2 analysis behind an adapter → M3 recommendations/rebooking/Stripe → M4
white-label pilot) made a skin-analysis spike the entry gate. After the
12 November 2026 pivot it no longer is:

- M0's Perfect Corp cost/quality spike becomes an optional, deferred
  evaluation of cosmetic skin analysis.
- M0's "≥ 3 practitioners would pay ≥ £25/mo" was a research gate, not agreed
  pricing.
- M1's tenant isolation requirement is carried into Phase 2.
- M3's recommendation and rebooking loop is carried into Phase 4; Stripe moves
  to Phase 5.
- The adapter rule stands: vendor types leaking outside `src/adapters/` is a
  blocking review comment.

## Working agreement

- Changes go through the developer's authorized branch/PR workflow. No force
  pushes, destructive migrations, real payouts, or new public claims without
  explicit sign-off.
- Every slice reports changed files, checks actually run, what is functional,
  what is mocked, migration implications and remaining blockers.
- Deviations and decisions are recorded in `docs/DECISIONS.md`.
