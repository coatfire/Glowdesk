# Glowdesk

Expert-led, shoppable beauty looks — with the professional consultation and
rebooking workflow underneath.

An expert publishes a recreatable look: the exact products and shades,
application steps, and a clear commercial disclosure. A shopper opens the
look's link, optionally previews supported products, saves it, shops at a
retailer, or sends the expert a private brief.

```text
expert look → optional try-on → shop or brief/book → follow-up/rebook
```

> **Status: labelled demo, not a product.** Everything runs on fictional
> fixtures. There is no authentication, database, retailer integration,
> tracking, real try-on rendering, brief delivery, booking, or payment.
> See [`docs/IMPLEMENTATION_CHECKLIST.md`](docs/IMPLEMENTATION_CHECKLIST.md)
> for exactly what is finished, mocked, blocked, and deferred.

## Run it

```bash
npm ci
```

```bash
npm run dev
```

Requires Node 22+. Full setup, environment variables and checks:
[`docs/DEVELOPMENT_SETUP.md`](docs/DEVELOPMENT_SETUP.md).

## Routes

| Route | What it is |
| --- | --- |
| `/` | Curated list of published looks (not personalised) |
| `/looks/[slug]` | Look detail: author, disclosure, steps, complete "Shop this look" |
| `/experts/[slug]` | Expert studio: authored looks, curated looks, services |
| `/try-on?look=&revision=` | Optional illustrative preview (mock renderer) |
| `/saved` | Bookmarks and viewing history stored in this browser |
| `/briefs`, `/briefs/new?expert=` | Brief composer with payload preview (nothing is sent) |
| `/pro` | Fictional single-expert workspace (demo mode only) |

## Golden rules

- **Nothing simulated may claim to be real.** No fake "sent", "booked",
  "verified", "tracked" or "paid". Unknown metrics are *unavailable*, not zero.
- **The browser only receives the public projection** (`src/core/public-catalog.ts`):
  approved experts, approved look revisions, active offers.
- **Vendors are swappable.** Provider calls go through `src/adapters/`; vendor
  shapes never reach `src/core/` or the UI.
- **`APP_MODE=pilot` fails closed** until real persistence and providers exist.

## Repo layout

```text
app/                 Routes (Server Components for public content + metadata)
src/core/            Vendor-independent types and business rules
src/server/          Server-side repositories and the provider factory
src/features/        looks, experts, commerce, try-on, briefs, pro, shell
src/components/ui/   Shared accessible primitives
src/adapters/        try-on/ (mock), skin-analysis/ (deferred)
src/lib/             App mode, URLs, formatting, saved-state store
src/data/fixtures/   Clearly fictional demo data
supabase/schema.sql  DRAFT only — no RLS; never apply to a real database
tests/               Vitest domain tests
docs/                Handover, architecture, decisions, plan, checklist
```

## Docs

- [`GLOWDESK_V2_IDE_HANDOVER.md`](docs/GLOWDESK_V2_IDE_HANDOVER.md) — the V2 specification
- [`IMPLEMENTATION_CHECKLIST.md`](docs/IMPLEMENTATION_CHECKLIST.md) — finished / mocked / blocked / deferred
- [`ORCHESTRATION.md`](docs/ORCHESTRATION.md) — phases and exit gates
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) — structure, boundaries, security requirements
- [`DECISIONS.md`](docs/DECISIONS.md) — decision log
