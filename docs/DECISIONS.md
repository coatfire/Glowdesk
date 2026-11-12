# Decisions log

## 2026-09-04 — Professional-led visual consultations

Glowdesk is positioned as a shoppable visual consultation platform rather than
an open consumer marketplace. Each client enters through a professional's
shareable storefront, explores that professional's services, curated looks,
and enabled product brands, then turns saved looks and captured previews into
a private pre-appointment brief.

The default brand architecture is co-branded: **"[Professional or studio name],
powered by Glowdesk."** The professional remains the primary relationship and
visual identity while Glowdesk earns recognition as the trusted consultation
layer. Custom domains and fully hidden Glowdesk branding are later premium
features for larger studios, not the default.

The client experience is guest-first. An account should be requested only when
a client sends, saves, messages, or returns to a consultation. The professional
workspace centers on an inbox, client intent, appointment context, and a
recommendation builder using only brands that professional has enabled.
Affiliate disclosure stays attached to every shoppable recommendation.

Instagram is treated as acquisition and portfolio proof, not launch-critical
infrastructure. Professionals initially link their profile and manually add
their strongest consented work. A cross-professional marketplace is deferred
until Glowdesk can support quality control, availability, location, content
rights, and moderation.

The frontend demonstrates the complete loop with fictional data:

1. enter a professional-branded storefront;
2. browse curated looks and services;
3. try and capture visual ideas;
4. review and consent to a consultation brief;
5. send it to the professional;
6. review the brief and return products from a configurable catalog.

Authentication, secure image transfer, messaging, appointment booking,
affiliate attribution, and persistence remain mocked pending backend and
compliance implementation.

## 2026-09-04 — Camera-first editorial discovery MVP

Glowdesk now leads with an immersive try-on studio rather than a consultation
dashboard. The visual system pairs warm porcelain, near-black, coral, butter
yellow, lilac, and sage with an editorial display serif and compact utility
type. Glass surfaces are reserved for controls over photography; elsewhere,
the interface uses tactile solid surfaces and restrained motion.

The experience combines patterns that are proving useful in current beauty
commerce: camera-led product trial, creator context at the point of discovery,
decision-support inside product details, and a full-bleed editorial feed.
Skincare remains a visibly labeled simulation with subtle changes and no
medical or guaranteed claims. Saved state and selfie previews stay local to
the browser, while existing provider adapters remain available as future
integration seams.

Useful research:

- [Pinterest Palette 2025](https://business.pinterest.com/en-gb/blog/pinterest-palette-2025/)
- [Pinterest Predicts 2025](https://business.pinterest.com/pinterest-predicts/)
- [TikTok Shop beauty discovery and creator education](https://newsroom.tiktok.com/en-us/tiktok-shop-announces-beauty-month)
- [McKinsey: The beauty industry in 2025 and beyond](https://www.mckinsey.com/industries/consumer-packaged-goods/our-insights/a-close-look-at-the-global-beauty-industry-in-2025)
- [Baymard: Beauty e-commerce UX](https://baymard.com/blog/beauty-cosmetics-ecommerce)
- [Unsplash License](https://unsplash.com/license)
- [Pexels License](https://www.pexels.com/license/)

## 2026-11-12 — V2 pivot: expert-led verified shoppable looks

**Agreed direction.** Glowdesk becomes the expert-led platform for shoppable
beauty looks, with the consultation and rebooking workflow underneath. The
core sequence changes from *skin analysis → consultation → recommendations →
rebook* to *expert look → optional try-on → shop or brief/book → follow-up*.
A customer no longer needs a consultation to discover or shop a look. The full
specification is `docs/GLOWDESK_V2_IDE_HANDOVER.md`.

This supersedes parts of the two 2026-09-04 entries above, which are kept as
history:

- Entry is now **looks-first**, not camera-first. Try-on is optional.
- Discovery is a curated cross-expert list; an expert's studio still keeps the
  co-branded "powered by Glowdesk" relationship, and a private brief always
  goes to exactly one studio.
- The simulated weeks-to-skincare-result timeline is retired. Cosmetic skin
  analysis is a separate, deferred capability, not a launch dependency.
- It is not an open marketplace: invite-led onboarding, vetted experts,
  controlled catalog, retailer-direct checkout.

**Recommended defaults adopted in the first slice** (changeable by a new entry):

- Route map and domain model as in the handover §6 and §9.
- `APP_MODE=demo|pilot`; pilot fails closed until persistence and providers
  exist. Demo shows a persistent label and never claims a real outcome.
- Public content is served only through a projection that requires an approved
  expert and an approved, attested, disclosed revision.
- Candidate disclosure copy: "Ad — the creator and Glowdesk may earn
  commission if you buy." Not yet validated for any launch market.
- **Fonts:** keep the repository's Italiana / Instrument Sans / Spline Sans
  Mono system. The hosted mockup's Cormorant Garamond / DM Sans are not mixed
  in. No rebrand.
- One fixture change: the look "Blue Note" is now authored by Maya Clarke (it
  uses her portrait), so the demo studio shows both authored and curated looks.
- Vitest for domain tests.

**Unresolved** (must be decided before the affected feature goes live): launch
market, verification standard, affiliate model and commission split,
subscription price, try-on provider, retailer agreements, retention periods,
payout process, pilot thresholds. The earlier "≥ £25/mo" research gate is not
agreed pricing.
