# ARCHITECTURE.md

Describes the code as it is after the Phase 0/1 slice, and the requirements
later phases must meet. The target design is in
[`GLOWDESK_V2_IDE_HANDOVER.md`](./GLOWDESK_V2_IDE_HANDOVER.md) §8–§13.

## Stack

- **Next.js 16 (App Router) + React 19 + TypeScript.** Server Components render
  public look/expert content and metadata; camera and other interactive
  behaviour live in Client Components. The pilot needs a server-capable
  deployment — do not enable `output: "export"`.
- **Supabase** (Postgres/Auth/Storage) — planned for Phase 2. Installed, not used.
- **Stripe** — expert subscriptions only, Phase 5. Installed, not used. Not
  consumer checkout, and not the affiliate ledger.
- **Vitest** for domain rules.

## Layers

```text
app/ (routes)
  └─ src/server/        repositories + provider factory (server only)
       └─ src/core/     types and pure rules — no I/O, no vendor shapes
       └─ src/adapters/ vendor implementations of core contracts
       └─ src/data/fixtures/  fictional data (demo mode only)
  └─ src/features/      UI by feature; client components read the public
                        projection from context, never fixtures
  └─ src/lib/           app mode, URLs, formatting, saved-state store
```

Rules:

1. Routes get public data from `src/server/public-catalog.ts`, never by
   importing fixtures. Phase 2 swaps that module's body for Supabase reads.
   (`app/pro/page.tsx` is the one exception: a demo-only fictional workspace.)
2. `src/core/` knows nothing about vendors, React, or storage.
3. The browser receives only `PublicCatalog` (`src/core/public-catalog.ts`).

## Public projection

`toPublicLook` / `toPublicExpert` in `src/core/looks.ts` decide visibility. A
look is public only if its author is `approved` and in the same tenant, the
look is `published`, the current-approved pointer references a revision whose
status is `approved`, both attestations are true, and a disclosure exists.
Anything else is absent from lists, detail pages, metadata and static params,
and its URL is a plain 404.

Revisions are immutable. An edit is a new revision that stays private until
approved; the previous approved revision stays live. Try-on links, brief
drafts and the product sheet reference the **revision id**.

## Catalog and commerce

`brand → product → variant → retailer offer`. Money is integer minor units
plus ISO currency. A shade choice is always another variant of the same
product. Offers carry stock state and a checked-at date and are shown as
"price checked [date]", never as live. Totals come from `estimateLookTotal`,
which lists included/excluded items and refuses mixed currencies.

There is no redirect endpoint, click record, conversion intake or ledger yet
(Phase 3). The handover §12 rules apply when they are built: server-resolved
destinations from an allowlist, no client-supplied URLs or recipients, no
personal data in retailer links, and separate estimated / approved / received
/ paid states.

## Try-on

`TryOnProvider` (`src/core/try-on.ts`) is the vendor boundary. Only
`MockTryOnProvider` exists: it reports lips/blush/eyes as previewable with
`calibrated: false` and renders nothing — the UI draws a fixed-position tint
and says so. `getTryOnProvider()` refuses the mock outside demo mode. Provider
selection is unresolved; the Perfect Corp skin-analysis adapter is a different,
deferred capability and must not be wired to try-on.

## Guest state

`src/lib/saved-store.ts` is an external store (via `useSyncExternalStore`)
over `localStorage` key `glowdesk:saved`, schema version 2. Reads are validated
and filtered to known ids; writes go through one reducer; failures fall back to
in-memory state. It holds bookmarks and viewing history only — no media and no
"sent" flags.

## Security and privacy requirements (not yet implemented)

None of this exists in code today; `supabase/schema.sql` is a draft without
RLS. Before any real customer data:

- RLS and least-privilege grants on every exposed table; anonymous reads
  limited to public projections; service-role key server-side only with
  independent authorization checks.
- Same-tenant relationships enforced in the database (composite keys), not
  only in application code.
- Ownership derived from the session — never from client-sent `tenantId`,
  `role`, `approved`, `commissionRate` or `reviewerId`.
- Private image storage with object policies and short-lived authorized URLs.
- Consent as append-only records per purpose: camera permission, processing,
  private brief attachment, marketing, and public portfolio reuse are separate.
- Expert approval and content approval only through server-controlled
  transitions with reviewer, reason, timestamp and criteria version.

**Facial data.** Earlier versions of this file said "face scans are biometric
data". That is not a universal legal classification; it depends on purpose,
implementation and jurisdiction. Treat photos and landmarks as sensitive
operational data, default to on-device processing with no retained image, and
complete a launch-market assessment with qualified advice before processing
real faces. The demo uploads nothing: camera frames and photos stay in the tab.

**Claims.** Previews are visualizations, not efficacy forecasts. No medical
diagnosis, no guaranteed suitability, no calibrated-shade claim without
evidence.

## Deliberately not built

Open seller marketplace, resale, inventory, fulfilment, multi-retailer basket,
consumer payments, social feed/follower mechanics, live streaming, native apps,
custom domains, paid digital looks, hair or treatment simulation.
