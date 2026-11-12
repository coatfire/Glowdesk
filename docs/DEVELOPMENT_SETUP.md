# Development setup

## Requirements

- **Node 22 or newer** (`.nvmrc`, `engines`). Next 16 accepts Node 20.9+, but
  the locked Supabase JS package requires Node 22.
- npm (the repo uses `package-lock.json`; use `npm ci`, not `npm install`,
  unless you are deliberately changing dependencies). `packageManager` is not
  pinned yet — pin it once the team's npm version is agreed.

## First run

```bash
cp .env.example .env.local
```

```bash
npm ci
```

```bash
npm run dev
```

The demo needs **no keys**. Open http://localhost:3000.

## Checks

Run all four before pushing:

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm test
```

```bash
npm run build
```

`npm test` runs Vitest over `tests/` (domain rules: public projection,
saved-state validation and reducer, offers/totals, brief validation, URL
safety, app mode). There are no browser or database tests in the repo yet.

The build downloads Google Fonts (`next/font/google`), so it needs network
access to `fonts.googleapis.com`.

## Environment variables

| Variable | Used now? | Notes |
| --- | --- | --- |
| `APP_MODE` | Yes | `demo` (default) or `pilot`. Read on the server **at build time** for static pages — rebuild after changing it. Any other value throws. |
| `NEXT_PUBLIC_APP_URL` | Yes | Deployed origin for canonical/share URLs. Unset ⇒ `http://localhost:3000` in metadata and the browser's own origin for share links. |
| `TRY_ON_PROVIDER` | Yes | Only `mock` exists. The mock is refused outside demo mode. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | No | Phase 2. The service-role key bypasses RLS and must stay server-side. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | No | Expert subscriptions only, Phase 5. |
| `PERFECTCORP_API_KEY` | No | Deferred skin-analysis candidate; adapter is unimplemented. |

Never commit `.env.local`, real keys, identity evidence, or real client data.

## Modes

- **demo** — fictional fixtures, a persistent "Demo" label, and every
  commerce/brief/booking action explains itself instead of pretending.
- **pilot** — renders a "not available yet" page listing what is missing.
  This is deliberate: there is no auth, RLS, retailer handoff or brief
  delivery, so pilot mode must not serve fixtures as if they were live.

## Database

`supabase/schema.sql` is a **draft with no RLS or policies**. Do not apply it
to any database holding real data. Phase 2 replaces it with reviewed,
versioned migrations under `supabase/migrations/` plus policy tests. Decide on
separate development/staging/production projects before testing any writes.

## Working agreement

- Branch from the latest default branch; never reset or force-push shared work.
- Each slice reports: changed files, checks actually run, what is functional,
  what is mocked, migration implications, remaining blockers.
- Update `docs/IMPLEMENTATION_CHECKLIST.md` in the same change.
