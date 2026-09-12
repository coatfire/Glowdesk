# Glowdesk

Creator-led beauty commerce where people watch a look being made, try the
creator's virtual edit, and shop every tagged product.

## Product loop

1. A beauty creator publishes a short product demo and tags the exact products
   and shades used.
2. A viewer discovers the demo in an immersive feed.
3. One tap opens the complete virtual look in the try-on studio.
4. The viewer buys one item or the complete edit.
5. Creator attribution remains attached through the commerce handoff.

The current branch is a frontend concept. Product demos, virtual makeup,
inventory, checkout, affiliate attribution, and creator earnings are simulated.
Uploaded selfies remain local to the browser.

## Integration rule

**Analysis and try-on vendors remain swappable.** Perfect Corp or another
provider must be integrated behind `src/adapters/`; client components must not
import vendor SDKs or know vendor response shapes.

## Repo layout

```
docs/            Specs — read ORCHESTRATION.md first
src/adapters/    Vendor integrations (Perfect Corp, payments, comms)
src/core/        Domain types + business logic (vendor-agnostic)
supabase/        Schema + RLS policies (multi-tenant from day one)
```

## Getting started

```bash
npm install
npm run dev
```

No external credentials are required for the demo.
