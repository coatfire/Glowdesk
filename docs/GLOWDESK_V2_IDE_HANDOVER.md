# Glowdesk V2 — Product pivot and implementation handover

Prepared: 12 November 2026
Audience: Founder, technical partner, and AI-assisted IDE
Document status: Implementation specification for the discussed V2 direction. Proposed technical defaults and unresolved business decisions are explicitly identified below.

> Progress against this handover is tracked in
> [`IMPLEMENTATION_CHECKLIST.md`](./IMPLEMENTATION_CHECKLIST.md).

## 1. The product we are building

Glowdesk becomes the expert-led platform for verified shoppable beauty looks, with the professional consultation and rebooking workflow underneath it.

An expert publishes a recreatable look containing exact products and shades, application guidance, commercial disclosures, and an optional illustrative try-on. A customer discovers the look, tries supported products, saves it, buys from an authorised retailer, or sends a private brief to the expert and requests an appointment.

The commercial direction combines professional/studio software subscriptions with an agreed share of affiliate commission. The distribution strategy starts with experts bringing their existing audiences through shareable look and studio links. Glowdesk is not initially trying to build its own general-purpose social network.

The product's core sequence changes from:

```text
Original: skin analysis → consultation record → recommendations → rebook
V2: expert look → confidence/optional try-on → shop or brief/book → follow-up/rebook
```

The existing workflow remains valuable; it is no longer necessary for a customer to complete a consultation before discovering or shopping a look. Cosmetic skin analysis is a separate, deferred capability, not the launch dependency or a substitute for makeup try-on.

Do not interpret this pivot as an unrestricted marketplace. Anyone may eventually apply, but application is not approval. For the first pilot, use invite-led onboarding, vetted experts, controlled product supply, and retailer-direct checkout. Customers buy the recommended products, not ownership of the creator's image or look. Paid digital tutorials, paid filter licences, and downloadable look products are outside the initial scope.

### Decision language used throughout this document

**Agreed direction** means the V2 proposition discussed with the founder: expert-led shoppable looks, existing professional relationships, affiliate-first retailer checkout, and phased expansion.

**Recommended default** means a proposed engineering/product choice that can be changed through an explicit decision record. These include the route names, schema additions, state machines, and specific pilot implementation boundaries.

**Unresolved** means something the founder must decide before the affected production feature goes live. No subscription price, affiliate commission split, provider licence, retailer agreement, launch jurisdiction, or proven conversion uplift has been established.

## 2. Repository baseline and source of truth

The public repository is `coatfire/Glowdesk`. This handover inspected `main` at commit `41060d44cdab580203241ee68e92373c27cbd1ed` on 12 November 2026. The commit date is 4 September 2026. Its source is still a front-end prototype rather than an operational commerce or consultation backend.

The shareable Glowdesk concept demo was created from a separate Manus-managed copy at commit `e60445d4b1c0899a10d04f1a4fb8e26321f24cf0`. It adds static-export settings, local fonts, share metadata, a logo, and a route manifest. Those changes were not pushed into the user's GitHub repository. Use GitHub as the IDE implementation baseline; use the hosted demo as a visual reference, not as proof of completed backend functionality.

Before changing anything, the IDE must inspect its actual branch, commit, working tree, and database migration history. Preserve any work newer than the baseline. Do not reset the branch to the reviewed commit, overwrite local changes, or apply a draft schema against a populated production database.

### What the source actually contains

`app/page.tsx` renders `GlowdeskApp`. The approximately 2,429-line client component in `src/components/glowdesk-app.tsx` switches between camera, discovery, brief, and professional views using React state. These are not separate shareable routes.

`src/data/catalog.ts` contains five fictional creators, thirteen fictional products, and eight looks. `src/data/practice.ts` contains one featured professional, Maya Clarke, three services, enabled brand names, and demo consultation briefs. Maya is a separate fixture from the five catalog creators; the current UI mixes her curation with their authorship.

The app genuinely implements local bookmarking, mood filtering, a live camera request, a locally uploaded photo preview, and browser share/clipboard calls. However, its makeup effects are fixed-position CSS gradients. The analysis animation is a timer. Capture saves a look ID, not a photo. Shop, booking, messaging, follow, and several workspace actions are simulations or in-memory changes.

The brief form collects fields but its submit callback does not persist those fields or deliver them to the professional inbox. The stored sent state is just a browser-local flag. Product ratings, follower counts, saved counts, dashboard metrics, and professional verification badges are fixtures or unconditional UI claims.

### Production blockers already visible in source

The Perfect Corp adapter's `analyze()` throws `Not implemented`; its estimated scan cost returns `NaN`. `SkinAnalysisProvider` describes concern scores and cosmetic analysis, not shade-specific virtual try-on. Do not wire it into a try-on button as if it were the same product.

`supabase/schema.sql` defines draft tables, but contains no RLS enablement or actual access policies. Its comments are not security enforcement. It also lacks same-tenant relationship constraints, implemented consent immutability, storage policies, commerce tables, and a booking system. Installed Supabase and Stripe packages do not imply functioning integrations.

This documentation task did not install dependencies, run a fresh build of GitHub `main`, implement the pivot, or update the live demo. The earlier hosted-demo build passed typecheck, lint, and static export in October; rerun checks on the actual IDE working copy.

## 3. Scope: pilot versus later expansion

### Pilot requirements

Build curated, publicly shareable look pages and expert studios. Each monetised look must have an approved expert, exact product variants, application guidance, rights-cleared imagery, a product-use attestation, and visible commercial disclosure. It must work on mobile, desktop, and direct shared links.

Provide optional try-on for a small set of supported colour-cosmetic variants. Unsupported products stay visible and shoppable without pretending they can be rendered. Preserve saved looks, add durable private briefs, provide a professional inbox, and support appointment-request/follow-up tracking.

Use authorised retailer offers, tracked outbound links, and partner-provided conversion information where available. Provide basic expert conversion reporting, an internal review queue, and a clear separation between estimated, approved, received, and paid commission.

Start with 10–20 vetted experts and 50–100 looks in one colour-cosmetic use case, such as bridal makeup or lip-and-blush looks. Treat those numbers as pilot scope, not an achieved user base. Other beauty professionals may join later, but hair rendering, treatment forecasting, and foundation matching are not implied by this first category.

### Explicitly out of scope

Do not build an open seller marketplace, peer-to-peer resale, inventory management, product fulfilment, a universal multi-retailer basket, native consumer payments, a short-video social network, live streaming, or follower-based algorithmic discovery in the pilot.

Do not promise medical diagnosis, acne cures, future skincare results, guaranteed product suitability, or calibrated shade accuracy without supporting evidence. Cosmetic skin analysis, generative hair transformations, paid digital look downloads, brand bidding, custom-domain automation, native mobile apps, and international rollout are later decisions.

A cosmetic preview is a visualization, not a product efficacy forecast. Retire the existing simulated weeks-to-skincare-result timeline from the V2 launch experience.

## 4. Users, permissions, and meaning of verification

A **guest shopper** can browse published looks, view expert studios, save locally, use allowed try-on after informed opt-in, and leave for retailer checkout without creating an account.

A **signed-in customer** can keep cross-device saves, submit private briefs, see their own submitted snapshots and replies, and manage consent/deletion requests. Durable brief submission requires authentication under the recommended default. Guest local saves do not require it.

An **applicant expert** can submit an application and prepare drafts but cannot publish monetised looks. An **approved expert** can manage their own studio, looks, approved catalog selections, client briefs, recommendations, and performance reports. A **platform reviewer** can assess applications/content and handle reports, but this role does not automatically grant access to all private customer photos. A tightly scoped support escalation can permit necessary access with an audit trail.

Use `applicant → under_review → approved/rejected`, with `suspended` as a separate enforcement state. Store reviewer, reason, timestamp, and criteria version. Only server-controlled transitions can grant approval.

“Verified expert” must have an explainable meaning: for example, identity and portfolio reviewed, with professional credentials reviewed only where applicable. It does not mean every creator is a licensed clinician, every look has been clinically validated, or every recommended product is certified by Glowdesk. Do not require a universal professional licence for specialties where that credential is not applicable.

For the pilot, expert approval and content approval are separate controls. A reviewer checks each initial look before publication. A later trusted-publisher policy may reduce review friction, but it is not part of the first implementation.

## 5. Customer and expert journeys

### Discover, inspect, and shop

An expert shares a look-specific URL. The customer lands on that look, not a generic homepage or camera introduction. The page identifies its author, shows the applicable disclosure before commercial engagement, displays application guidance and exact variants, and explains the optional try-on's limitations.

The customer can inspect every product in the look. “Shop this look” opens a complete product list with retailer choices. “Shop at [Retailer]” leads to that retailer for the selected exact variant. The UI must state that checkout occurs at the retailer and that shipping/returns are governed there.

Products from different merchants are separate retailer purchases, not one Glowdesk order. If a retailer does not support a prefilled basket, use explicit per-product links rather than inventing a bundle checkout. Estimated look totals must identify the included offers, currency, timestamp, and any excluded shipping/taxes. Avoid aggregating incompatible currencies.

If an offer is out of stock or stale, show that status. An alternative is a separate product/variant and must be labelled a substitution, not silently treated as the original shade.

### Try and save

The customer explicitly opts into camera or photo preview. Support denying camera access, using a local photo, and browsing without try-on. Show the supported products and modes before processing. Do not mark a full look “tried” if only its lip colour can be rendered.

The shopper can reset, compare, change a genuine shade variant, and capture a real preview if the implemented mode supports capture. Capture must produce a frame/image artifact; otherwise label the action “Save look” and do not display it as a captured selfie.

Guest bookmarks can remain local. Authenticated saves are durable and can be merged from validated guest IDs with an explicit, idempotent merge. Do not use one persistent boolean to represent every past brief or every saved draft.

### Send a private brief and request an appointment

A customer selects looks, products, a service, notes, and an optional appointment preference, then previews the payload before submission. A brief goes to one selected professional's tenant. Saved looks by other authors may be included as inspiration; that does not share the customer's identity or images with those authors.

Explain what the receiving professional will see. Sharing a selfie privately, processing it with a provider, and allowing public portfolio reuse are separate permissions. Public reuse is off by default and not bundled into sending a brief.

Persist the submitted snapshot and return a real brief ID. Only then show “Brief sent.” An appointment preference is an appointment request, not a confirmed booking. Without a calendar integration, the professional manually confirms time and status through the workspace. This is sufficient for the pilot if clearly labelled.

### Expert onboarding, publishing, and follow-up

An invited expert authenticates, completes the application, and is reviewed. Once approved, they configure a studio and services, create a draft look, select 2–5 exact variants from the controlled catalog, add ordered instructions, attest to product use, disclose commercial relationships, and submit for review.

An accepted look receives a stable public URL and approved content revision. Editing imagery, variants, instructions, or disclosures creates a new revision for review. Keep the last approved version live until a replacement is approved unless safety action requires immediate withdrawal.

The expert can read briefs addressed to their tenant, reply with a complete recommendation edit, create an appointment request, confirm a booking, mark completion, and record a follow-up. Outbound email reminders need a real transactional provider and appropriate permissions; do not confuse a local toast or saved follow-up date with a sent reminder.

## 6. UX, routes, and design continuity

Preserve the editorial beauty identity and co-branded studio experience. The hosted mockup uses a Soft Atelier direction: warm neutral surfaces, restrained botanical tones, editorial display type, and compact readable controls. The GitHub source uses Italiana/Instrument Sans; the demo uses Cormorant Garamond/DM Sans. Choose deliberately rather than accidentally mixing both font systems. No wholesale rebrand is needed.

Change the default consumer entry from camera-first to looks-first. Use real URL navigation so refresh, browser Back/Forward, sharing, and route metadata retain context. Keep optional try-on easy to access without forcing it on shoppers.

Recommended route map:

```text
/                              Curated public discovery, not personalised unless implemented
/looks/[slug]                  Approved look detail and complete product list
/experts/[slug]                Expert identity, explained verification, authored looks/services
/try-on?look=[id]&revision=[id] Optional supported-products studio; no image bytes in URL
/saved                         Local/authenticated bookmarks; optional brief builder
/briefs/new?expert=[id]         Single-recipient private brief composer
/briefs/[id]                   Authenticated customer's own brief and replies
/login                         Authentication and validated same-origin return path
/apply                         Expert application; invite-led pilot
/pro                           Professional overview, private and authenticated
/pro/looks                     Own drafts and published looks
/pro/looks/[id]/edit            Look composer and review status
/pro/inbox                     Tenant's received briefs/recommendations
/pro/appointments              Requests, confirmations, follow-up dates
/pro/analytics                 Supported funnel and commission reporting
/pro/settings                  Branding, services, account and subscription state
/admin/review                  Role-protected applications, looks, and content reports
```

These are proposed routes, not existing ones. Product detail can remain an accessible sheet in the pilot; a separate product route is optional. A global discovery page may contain curated experts, but an individual studio must not divert a client's private brief or insert competing-expert recommendations into that relationship.

Use four simple consumer navigation labels, such as Looks, Try on, Saved, and My briefs. Keep “Expert workspace” as a distinct entry, protected server-side, not a public tab that implies any visitor can inspect a real inbox.

Essential UI states include loading, empty, signed-out, unavailable product, unsupported preview, denied camera, pending verification, pending review, rejected revision, suspended expert, failed brief delivery, and unknown conversion tracking. Add clear retry or next-step actions rather than fabricated success.

Maintain keyboard navigation, focus restoration, sensible modal stacking, screen-reader labels, reduced motion, readable disclosure contrast, and mobile safe areas. Test widths of 320/390/768/1024/1440 pixels and short-height phones. Do not lock important CTAs beneath an oversized onboarding panel.

## 7. What to retain, refactor, and correct

Retain the Next.js/TypeScript foundation, visual tokens, editorial imagery patterns, look/product/creator relationships, mood filters, reusable cards, local-save concept, sheet layouts, and professional-client workflow idea. Existing photographs are reference/demo assets; verify their usage rights before presenting them as a real expert's portfolio.

Split `glowdesk-app.tsx` into feature modules rather than growing the monolith. Reuse `DiscoverFeed` as the basis of discovery; `ProductSheet`, `ProductRow`, and `CompactProduct` for full product edits; `CreatorSheet` and `ProfessionalSignature` for expert profiles; `ConsultationBuilder` and `ConsultationSheet` for private brief composition; and `ProfessionalWorkspace` for the inbox/recommendation workflow plus a new look composer.

Correct these concrete source problems during the refactor:

1. Share currently copies `window.location.href` without the selected look/expert. Use the item's canonical URL and route-specific metadata.
2. The capture handler calls `addRecent` and `toggleLook` from the same state snapshot; the later update can discard the first. Use one functional reducer transition and distinguish bookmarks, viewing history, and genuine captured media.
3. Local storage is parsed by TypeScript cast without shape validation. Add a versioned schema, recognised-ID filtering, storage-failure handling, and an explicit hydration state.
4. “Shade choices” currently list other products in the same category, possibly another brand/formula. Add a real product-to-variant relationship; label unrelated items as alternatives.
5. Full-look preview uses a single tint and no face tracking. Do not present it as calibrated multi-product rendering.
6. Uploaded object URLs are not consistently revoked. Handle replacement/unmount cleanup, pending camera requests, duplicate starts, MIME/size validation, and image decode failures.
7. Brief submit discards actual form values. Implement a validated request and persistent submitted snapshot, not a sent flag.
8. The professional picker uses `.slice(0,8)`, hiding items, including some selected products. Display/filter the full allowed catalog and always surface selected items.
9. Recommendation status changes are in-memory and not delivered. Persist the selected products, note, snapshot, sender, recipient, and timestamps together.
10. Remove fake ratings, followers, saved counts, appointments, product clicks, unconditional verified badges, and unconditional endorsements from non-demo mode. Unknown metrics are unavailable, not zero.

Source-based file observations are grounded in the reviewed component and fixtures, not a current runtime test.

## 8. Technical architecture and proposed project structure

Keep Next.js App Router + React + TypeScript + Supabase Postgres/Auth/Storage for the IDE implementation. Continue provider adapters and use Stripe only for professional subscriptions when commercial billing is approved. An affiliate-commission ledger is not the same as Stripe subscription billing or consumer checkout.

Use Server Components for public look/expert content and metadata. Isolate camera and other interactive browser behaviour in Client Components. Use server route handlers/services for protected mutations, publication, private image access, tracked redirects, provider callbacks, and billing.

A production pilot with those handlers requires a server-capable Next deployment. The separate hosted demo's `output: "export"` is appropriate for a static mockup, not the target private/persistent pilot. The GitHub baseline's `next.config.ts` does not enable static export. Do not copy the demo's export constraint into the production branch. Configure image hosts only for approved sources.

Suggested structure, introduced incrementally:

```text
app/
  page.tsx                     Public discovery entry
  looks/[slug]/page.tsx        Public approved-look rendering/metadata
  experts/[slug]/page.tsx      Public expert studio
  try-on/page.tsx              Browser studio container
  saved/                      Saved collections
  briefs/                     Private composer and customer detail
  pro/                        Authenticated professional routes
  admin/review/                Moderation interface
  api/                        Validated handlers and partner callbacks
src/
  components/ui/              Buttons, accessible dialogs, fields, badges
  features/looks/             Cards, complete edit, instructions, composer
  features/experts/            Profiles, application, verification UI
  features/try-on/             Consent, device lifecycle, renderer UI
  features/briefs/             Draft, submit, reply, private snapshots
  features/pro/               Workspace and follow-up UI
  features/commerce/          Offers, disclosures, tracked handoff, earnings
  core/                       Vendor-independent types and business rules
  server/                     Authorization, repositories, services, provider factory
  adapters/                   try-on/, skin-analysis/, affiliate/, booking/, billing/
  lib/                        Supabase client/server helpers, money, validation, URLs
  data/fixtures/              Clearly fictional demo catalog and scenarios
supabase/
  migrations/                 Versioned schema, constraints, grants, RLS and storage rules
  tests/                      Tenant isolation and protected-state tests
  seed.sql                    Synthetic development data only
tests/                       Unit, integration, route and interaction tests
docs/                        Pivot, architecture, decisions, setup, API and pilot metrics
```

Do not let vendor payloads leak into `src/core/` or UI components. Import a server-only guard in private adapters/services; comments saying “server only” are not a bundling boundary. If a browser SDK needs a licence token, follow its verified documentation for restricted browser credentials; never expose a private provider API key.

## 9. Domain model and migrations

The model below is a recommended target, not a ready-to-run SQL migration. The IDE should turn it into reviewed migrations and policies after checking any existing data. Use UUID identifiers, UTC timestamps, integer minor units for money, ISO currency codes, and stable external IDs. Avoid floating-point money and unversioned JSON as the only durable record.

### Identity and tenant ownership

Retain `tenants` for professional/studio businesses and evolve the current `users` assumption. Recommended additions are `profiles` linked to `auth.users` and `tenant_memberships(tenant_id, user_id, role, status)`. A customer can exist without a tenant; an expert may also be a customer. Platform reviewer/admin authority must be server-managed, not a user-editable profile field.

Create `expert_profiles` for public-facing identity: tenant, author user, unique slug, display name, specialty, bio, approved public images, service region, public verification label, and published status. Keep application evidence, identity documents, rejection reasons, and internal reviews in separate private records such as `expert_applications` and `verification_reviews`.

### Catalog, variants, retailer offers

Use `brands`, `products`, and `product_variants`. A product records brand, formula/name, category, approved description and asset source. A variant records stable SKU/external identity, shade name, swatch, size, asset, and optional provider mapping. Categories for the first renderer are lips/blush/eyes, with exact supported subsets determined by the integration spike.

Use `retailers` and `retailer_offers` for the relationship between a variant and an authorised merchant: external offer ID, market, currency, price in minor units, stock state, checked timestamp, destination, tracking configuration, and offer status. A product variant may have multiple offers. Only controlled ingestion/admin tools may create monetisable offers; creators do not paste arbitrary redirect destinations into public commerce actions.

Price freshness and stock expiry must be configurable per partner. With manual catalog maintenance, show “Price checked [date]; retailer confirms final price” rather than claiming live data. A supported-preview asset mapping is not evidence of live inventory.

### Looks and approved revisions

Use `looks` for stable identity, tenant, expert author, slug, and current approved revision. Use immutable `look_revisions` for title, description, ordered steps, technique/occasion tags, fit notes, disclosure, rights attestation, product-use attestation, cover image, reviewer outcome, and content version.

Use `look_revision_items` to link each approved revision to exact variants, item order, application note, and default offer when appropriate. Keep “authored by” distinct from “curated by.” Reference the revision from try-on events, briefs, recommendations, and commerce clicks so editing a look does not rewrite historical attribution.

Recommended revision states:

```text
draft → submitted → approved OR changes_requested/rejected
approved revision → published through current-approved-revision pointer
published look → unpublished/archived; suspension overrides public visibility
```

A creator cannot self-approve, self-verify, or change a published revision in place. Any safety suspension immediately disables affected public commerce; any evidence needed for investigation remains private under an approved retention policy.

### Saved collections, briefs, and consent

Use `saved_looks` and `saved_products` for authenticated users. Enforce uniqueness per owner/item; make save and guest-merge requests idempotent.

Retain tenant-private `clients` and `consultations`, but create `consultation_briefs` as the pre-consultation intent object. Store recipient tenant/expert, authenticated submitter, selected service, requested date/time where provided, notes, state, submission time, and immutable submission snapshot. Link selected look revisions and variant IDs through `brief_items`.

Use `brief_media` only for separately consented private attachments. Raw selfie/frame bytes never belong in a public look, analytics payload, URL, or affiliate callback. Use `consent_records` with purpose, policy version, subject, recipient scope, grant time, and append-only withdrawal/event records. Do not describe a mutable database column as an enforced immutable consent history.

Recommended brief states are `draft → submitted → viewed → replied → closed`, with explicit cancellation and failure handling. Appointment requests and confirmations are separate records, not brief state aliases.

Extend `recommendations` to support durable recommendation sets/items with exact variants, offers, notes, sender, recipient, and submitted snapshot. Use `appointment_requests` and `appointments` to separate preferred dates from confirmations. Follow-up dates need an explicit task status; delivery attempts for reminders are separate from the task itself.

### Commerce, review, and observability

Use `affiliate_clicks`, partner `conversion_events`, and `commission_ledger_entries` for traceable referral accounting. Record exact look revision, expert/tenant, variant/offer, partner click/sub-ID, experiment assignment, and effective commission-terms version. Financial entries require restricted access and append-only adjustments rather than untraceable balance edits.

Use `content_reports`, `moderation_reviews`, and `audit_events` to record reporting, review, suspension, administrative corrections, and sensitive access. General analytics events should not carry customer notes or images. Store try-on usage/cost measurements separately from face/media content.

### Small vendor-independent type sketch

This sketch demonstrates the intended boundaries; it is not an implemented provider API:

```ts
type Money = { amountMinor: number; currency: string };
type TryOnCategory = "lips" | "blush" | "eyes";
type ExpertStatus = "applicant" | "under_review" | "approved" | "rejected" | "suspended";

interface LookItem {
  variantId: string;
  applicationOrder: number;
  applicationNote: string;
  defaultOfferId?: string;
}

interface ApprovedLook {
  id: string;
  revisionId: string;
  tenantId: string;
  expertId: string;
  slug: string;
  title: string;
  disclosureText: string;
  items: LookItem[];
}

interface TryOnCapability {
  variantId: string;
  category: TryOnCategory;
  supportedModes: Array<"live" | "photo">;
  calibrated: boolean;
}

interface TryOnUsage {
  requestId: string;
  provider: string;
  status: "completed" | "failed" | "cancelled";
  usageUnits?: number;
  measuredCost?: Money;
}

interface TryOnSession {
  stop(): Promise<void>;
  capturePreview?(): Promise<Blob>;
}

interface TryOnProvider {
  readonly name: string;
  getCapabilities(variantIds: string[]): Promise<TryOnCapability[]>;
  // Live and still-image implementations adapt separately behind this contract.
  createSession(input: {
    lookRevisionId: string;
    variantIds: string[];
    mode: "live" | "photo";
    consentReceiptId: string;
  }): Promise<TryOnSession>;
}
```

A production live renderer will need explicit rendering-target/device lifecycle parameters. A still-image provider may need a different render method. Define those after the spike; do not force all providers into an imagined common endpoint or treat this sketch as vendor documentation. Unknown usage/cost is `undefined` and displayed as unknown, not `NaN`, free, or zero.

## 10. Security and privacy requirements

### Database and server authorization

Enable RLS and least-privilege grants on every exposed table. Keep public presentation separate from private operational records. Supabase's secret/service-role credentials can bypass RLS; they must remain server-side, and any handler using them needs independent authorization checks. Review public database views explicitly rather than assuming they inherit secure policies.

The anonymous role may read only approved public expert fields, published approved-look projections, and authorised public catalog offers. It must not read client contacts, draft looks, verification evidence, private briefs/media, consent histories, internal moderation notes, or finance identifiers.

Tenant members may access their tenant's appropriate records. Customers may access their own saves and submitted briefs/replies, but not internal professional notes. Reviewer permissions are purpose-scoped. Revoke unnecessary operations as well as writing row policies.

Enforce same-tenant relationships at the database boundary. A row carrying tenant A must not reference tenant B's client, consultation, expert, or private media record. Use composite foreign keys/unique constraints or equivalent reviewed constraints; application checks alone are insufficient.

Derive tenant/user ownership from the authenticated session and validated resource relationship. Do not trust client-submitted `tenantId`, `approved`, `role`, `commissionRate`, or `reviewerId`. Apply input schemas, request-size limits, rate limiting, and same-origin/CSRF protection to authenticated mutations as appropriate.

Private image storage needs bucket/object policies and short-lived authorized retrieval. UUIDs, obscure paths, and public asset URLs are not access control. Validate real file type and size; strip unnecessary metadata; test deletion of originals and derived copies.

### Consent, facial processing, and retention

Default to on-device processing and no retained raw selfie where the actual integration allows it. A cloud implementation must state that images leave the device, identify the processing purpose/provider, and document deletion/retention behaviour before use. Remove “Processed on this device” if it is not true for the selected mode.

Separate camera permission from informed processing permission, private brief attachment consent, marketing/reminder preferences, and public portfolio consent. No training on customer images and no identity recognition are recommended pilot constraints, subject to enforceable vendor terms.

The existing architecture says all face scans are biometric data. Do not repeat that as a universal legal classification. In UK guidance, biometric recognition used to uniquely identify someone involves special-category biometric data; the actual processing purpose and implementation matter. Other markets have different facial-data rules. Treat photos and landmarks as sensitive operational data and complete a launch-market assessment with qualified advice.

An 18+ pilot is recommended, but a checkbox alone is not a complete age/privacy control. Decide the jurisdiction, data region, processor terms, lawful basis, retention periods, and impact-assessment needs before processing real faces. Avoid indefinitely retaining raw vendor payloads merely for debugging. Apply a defined minimal retention policy and delete linked artifacts upon withdrawal/erasure where required, including vendor-side deletion where applicable.

### Disclosure and claims

Commercial disclosure appears on the look card/detail and near product actions, with gifted/sponsored relationships included where applicable. For the UK, use clear upfront advertising wording rather than “affiliate” alone; for US audiences, disclose material relationships visibly with the endorsement. Candidate copy is: “Ad — the creator and Glowdesk may earn commission if you buy.” Validate the final wording for the launch market.

Store the applicable disclosure and its version in the approved look revision. Do not let CSS, truncation, exports, share cards, or an expert's theme hide it. A generated share image intended as advertising also needs the required visible label.

Require creators to attest that their experience statements are genuine. An automated banned-terms check can flag content, but does not establish legal compliance. Review unsupported efficacy/medical claims and ensure moderation can withdraw problematic looks or offers quickly.

## 11. Virtual try-on: a separate validation stream

The goal is a believable product-specific visual preview, not a generic beauty filter that falsely appears to model the linked products. “Snapchat-like” describes interaction speed and familiarity, not permission to claim true-to-life shade or treatment outcomes.

Run a bounded vendor spike before making implementation commitments. Record supported categories/shades, live versus photo rendering, product-asset mapping, licence terms, latency, devices/browsers, skin-tone/lighting performance, pricing, rate limits, retention, training restrictions, and error behaviour. Provider selection remains unresolved. Perfect Corp is an existing integration candidate, not a working or contracted solution.

Use a deterministic mock provider in development, marked “Demo preview — not calibrated to this product.” Do not describe it as real face mapping, successful AI analysis, or a tested colour match. In pilot mode, unsupported/unconfigured rendering must be disabled or labelled honestly; a renderer failure must not fall back silently to a fake success.

Map exact variants to provider render assets and keep mapping versions. Ensure UI and rendering use the same selected shade. If several products are supported, apply them together or explain which subset is active. Never retouch unrelated facial features merely to make the product look better.

Measure actual usage, retries, failures, and cost per eligible session/order. Set configurable session/product limits, client cancellation handling, server timeouts, quotas, and a kill switch. Continuous live frames are not equivalent to billable server generations; reflect the actual licence model.

Maintain cleanup for streams, frames, object URLs, worker/SDK resources, and timers. Test low-end phones, mobile Safari/Chrome, rotation, camera denial, losing page focus, navigation while permission is pending, and unsupported image formats. The non-AR shopping path must stay usable throughout.

Recommended visible disclaimer: “Virtual visualization only. Colour and finish vary with lighting, skin tone, device, and application.” Do not infer undertone, identity, health conditions, or sensitive attributes without a separately approved purpose and implementation.

## 12. Affiliate model, attribution, and commission accounting

“Take a cut of everything” is not the pilot commercial contract. With retailer-direct checkout, Glowdesk does not automatically receive a percentage of a customer's whole basket. Its revenue is whatever eligible referral commission and sharing arrangement the retailer/network contract permits.

Choose one attribution operating model before live monetisation. The recommended model is an approved affiliate/sub-affiliate arrangement where Glowdesk receives partner-attributed commission and shares an agreed portion with the expert. This requires the partner to permit that structure. If experts retain their own pre-existing affiliate accounts, Glowdesk may not control tracking or collect a cut; in that case subscription revenue or a separate commercial agreement is needed. Do not silently rewrite existing creator links or claim revenue share without authorisation.

### Safe outbound handoff

On a shop action, resolve a published look revision and active exact-variant offer server-side. Generate a unique click ID, record the expert/offer/revision and eligible experiment assignment, and produce the authorised partner tracking link. Use only approved HTTPS destinations and an allowlist. Reject arbitrary `url`/`redirect` parameters, private-network destinations, credentials in URLs, and unsupported hosts.

Use a same-origin redirect endpoint such as `/api/affiliate/redirect?offerId=...&lookRevisionId=...`. The client must not be able to set the merchant destination or commission recipient. If recording fails, either visibly retry or allow a documented untracked retailer handoff; never imply tracked earnings when tracking is absent.

Attach only partner-permitted pseudonymous sub-IDs. Never include selfies, notes, customer email, or private brief IDs in retailer links. Preserve the retailer's final authority over price, delivery, checkout, and returns.

### Conversion evidence and settlement

A click is not an order. A retailer landing is not a checkout. A browser return is not a settled commission. Accept conversion evidence only from authenticated partner webhooks, permitted API imports, or controlled reconciliation uploads with audit records.

Verify signatures or the actual partner authentication scheme; enforce idempotency with provider event/order IDs. Handle duplicates, delayed callbacks, partial refunds, cancellations, amended commission, and out-of-order status updates without double-crediting. Preserve raw event evidence minimally and privately; normalize it into a stable internal model.

Recommended display states are `estimated`, `approved_by_partner`, `received_by_platform`, `eligible_for_payout`, `paid`, and `reversed/adjusted`. Partner approval does not prove cash receipt. A settlement rule and applicable return/dispute window must be defined before payout. Do not invent a universal number of days.

Version the revenue-share agreement and define its base: net eligible commission after partner reversals, not ambiguous gross GMV. Payouts require an agreed provider/process, verification and tax handling appropriate to the market, reconciliation, and audit controls. Manual pilot payout can be acceptable if controlled and documented; it must not be a fake “Withdraw” button.

If the partner cannot return order attribution, show “Purchase tracking unavailable” and limit reporting to clicks/known referral revenue. Do not fabricate conversion rate, GMV, settled earnings, or profitability from click events.

### Economics to instrument

```text
Net partner commission = approved/refinalised commission less reversals
Expert share            = contract-defined share of eligible net commission
Glowdesk retained       = net partner commission less expert share
Order contribution      = retained revenue less allocated try-on,
                          tracking, payout, support/moderation and other variable costs
Cohort contribution     = total order contribution less acquisition spend
```

Include processing of failed/repeated preview attempts in cost measurements. If subscription revenue subsidises the workflow, report that separately rather than disguising negative commerce economics. Rates and allocation rules are decisions to record; they are not specified by this handover.

## 13. Server operations and API behaviour

The following are proposed same-origin contracts; implement consistent typed responses and validation, not arbitrary ad-hoc success toasts.

Public look/expert reads return only approved public projections. Draft and private identifiers must not reveal data through detail, list, metadata, search, or cached responses. Unpublished or unknown public slugs return an appropriate not-found/unavailable page without leaking moderation details.

Expert mutations include application submit, draft save, revision submit, and look unpublish. Every request requires session-derived ownership and a permitted state transition. Admin review requires a trusted server-managed role, review reason, and auditable actor.

Brief submit receives selected recipient, revision/variant references, service, notes, and consent receipts. Validate recipient availability and item eligibility, persist a snapshot transactionally, and return `briefId`, state, and timestamps. Use an idempotency key so retrying after a timeout does not duplicate a brief.

Preview capability/session handlers validate exact mappings and informed permission. Apply quotas before costly work; record usage/failure without media in analytics. Direct SDK/browser rendering may need capability metadata rather than a server image endpoint. Determine that from the actual provider.

Affiliate redirect and conversion-import contracts follow Section 12. Billing webhooks verify provider authentication, use idempotency, and update subscription entitlements server-side. Never let a client-set `subscriptionActive` flag grant access.

Use errors such as `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_FAILED`, `NOT_FOUND`, `EXPERT_NOT_APPROVED`, `LOOK_NOT_PUBLISHED`, `OFFER_UNAVAILABLE`, `CONSENT_REQUIRED`, `TRY_ON_UNSUPPORTED`, `RATE_LIMITED`, and `PROVIDER_UNAVAILABLE`, with safe messages and request IDs. Avoid leaking secrets or private evidence through logs or errors.

## 14. Analytics and the validation experiment

Instrument the funnel as actual observable events: look viewed, product edit opened, eligible try-on assignment, try-on started/completed/failed, look saved, affiliate handoff clicked, partner order pending/settled/reversed, brief submitted/replied, appointment requested/confirmed/completed, and follow-up/rebooking recorded.

Use a stable `event_id`, schema version, timestamp, pseudonymous session or authenticated subject reference, look/revision/expert/offer references where applicable, environment, and experiment assignment. Never include uploaded media, facial landmarks, free-text customer notes, or plain customer contact details. Minimise retention and respect the launch-market consent rules for nonessential analytics/tracking.

To assess try-on, compare the same eligible looks and offers, randomly assigned to a no-try-on control or a try-on-available treatment. Use a sticky assignment and analyse all assigned eligible sessions, not only users who voluntarily completed try-on. Avoid simply comparing enthusiastic camera users with everybody else.

Measure settled commission contribution per eligible session as well as clicks/orders, with consistent attribution and return windows. Report completion/latency/cost and expert repeat publishing. Watch for look, creator, device, and traffic-source differences; document missing partner conversions and tracking-consent selection bias.

The 50–100 look pilot is for feasibility and directional evidence; it does not guarantee adequate statistical power. Set the exposure period, minimum useful uplift, confidence approach, and decision threshold before observing results. Do not claim causality or conversion improvement from novelty-driven engagement alone.

Proceed toward expansion only when expert repeat use, credible incremental value, compliant operations, and positive contribution can be demonstrated. If try-on does not improve economics, keep shoppable expert looks and the workflow; do not force AR into every purchase path.

## 15. IDE import, dependencies, and environment setup

For a fresh working copy:

```bash
git clone https://github.com/coatfire/Glowdesk.git
cd Glowdesk
git status --short --branch
git switch -c feat/verified-shoppable-looks
cp .env.example .env.local
npm ci
npm run typecheck
npm run lint
npm run build
npm run dev
```

If a working copy already exists, do not clone over it. Inspect its branch and uncommitted changes first; choose a new feature branch only when safe. The commands are proposed developer steps, not commands executed against the user's repository by this handover.

Use Node 22 or a compatible supported version as the documented baseline: the lockfile's Next package requires Node `>=20.9.0`, but its Supabase JS package requires Node `>=22.0.0`. Declare the chosen Node/package-manager versions through `engines`, an appropriate version file, and `packageManager` after confirming the developer environment. Keep the existing lockfile unless a deliberate dependency update is needed.

Locked versions inspected include Next 16.2.11, React/React DOM 19.0.0, TypeScript 5.9.3, Tailwind 3.4.19, Supabase SSR 0.5.2, Supabase JS 2.110.8, and Stripe 17.7.0. Manifest ranges are not identical to installed versions. Audit compatibility/security before live deployment; do not run a broad automatic major-version upgrade as part of the product refactor.

The existing demo does not instantiate the unimplemented provider during ordinary browsing; a fictional mock experience should run without private production keys. The production pilot needs actual Supabase auth/schema/storage configuration and approved providers. Do not disable security to make missing credentials appear to work.

### Proposed configuration contract

Keep the current Supabase public URL/client key and private service-role key names where compatible with the selected SDK. Keep `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `PERFECTCORP_API_KEY` private and optional until their relevant integrations exist.

Recommended additions are explicit `APP_MODE=demo|pilot`, a browser-safe mode label, `TRY_ON_PROVIDER=mock|[approved-provider]`, and `NEXT_PUBLIC_APP_URL` containing the real deployed origin. Provider-specific credential names, affiliate authentication secrets, transactional-email secrets, subscription price IDs, and payout settings must follow verified integration documentation; they are not supplied in this handover.

Fail closed in pilot mode when required security or provider configuration is missing. Demo mode must show a persistent demo label and use fictional data. Never automatically fall back to a mock provider while reporting live results.

Commit only placeholder `.env.example` values. Never commit `.env.local`, private keys, identity evidence, or real client fixture data. Decide on separate development, staging, and production databases before testing writes; do not assume a hosted development DB is isolated from production.

Public share URLs and metadata use a configured real HTTPS origin, not internal request hosts. Validate return URLs as same-origin paths. Public look imagery/metadata must never include client attachments. Private routes and APIs require private/no-store caching; public caching must not serve personalized private data.

## 16. Phased implementation plan with exit criteria

These are dependency-ordered slices, not delivery-date promises. Record actual duration after the first implementation slice. Do not build all integrations in one unreviewable change.

### Phase 0 — Confirm baseline and remove misleading prototype claims

Inspect the working tree and dependencies. Add the handover to `docs/`, record the pivot in `DECISIONS.md`, and explicitly distinguish demo/pilot modes. Correct fake-success messaging, permanent brief-sent flags, misleading captured-preview labels, fictional trust metrics, and unsupported skincare forecasting.

Update `README.md`, create `DEVELOPMENT_SETUP.md`, and revise `ARCHITECTURE.md` and `ORCHESTRATION.md` so the old skin-analysis-first milestone is no longer treated as the only entry gate. Retain useful historical decisions rather than erasing them.

Exit criteria: the repo boots in labelled demo mode; docs describe the new product and exact remaining mocks; no action claims real delivery, checkout, booking, verification, or payout when it is simulated; existing typecheck/lint/build checks pass or concrete pre-existing failures are documented.

### Phase 1 — Structured looks and shareable public UX

Extract domain types and feature components. Introduce genuine product/variant/offer fixtures, look instructions, revision identity, authored-versus-curated attribution, and realistic disclosure states. Build first-class look/expert routes and a complete “Shop this look” edit. Make route sharing, reload, Back/Forward, and empty/unavailable states work.

Fix local-save/capture state races, validate storage, complete modal accessibility, and maintain browser-resource cleanup. Keep unsupported mock preview explicitly illustrative.

Exit criteria: a direct look link restores the correct content; the full edit shows all variants; shade selection stays within a real product; authored/curated identity and disclosures are clear; dummy metrics are absent outside labelled fixtures; mobile/tablet layout and keyboard journeys pass focused checks. No backend production-readiness claim yet.

### Phase 2 — Secure persistence, verification, and publication

Implement Supabase auth and reviewed migrations, RLS/grants, storage policies, tenant relationship constraints, public projections, invite applications, admin review, and versioned look publication. Seed synthetic scenarios in a non-production environment.

Exit criteria: anonymous users read only approved public content; experts cannot self-approve; another tenant cannot access or modify drafts/client data; an approved expert's draft is still private; revocation/suspension removes public commerce; private media is inaccessible without authorization; policy tests cover both allow and deny outcomes. No real customer data before these gates.

### Phase 3 — Retailer handoff and measurable commerce

Confirm a permitted affiliate operating model and integrate a small authorised catalog. Add safe tracked redirects, visible offer freshness/availability, authenticated conversion intake, idempotent event processing, versioned commission terms, and honest earnings states. Manual reconciliation is acceptable if auditable.

Exit criteria: exact-variant retailer handoff works; malicious redirect destinations are blocked; duplicate/refund/out-of-order callback tests do not double-credit; unknown conversion evidence stays unknown; settled/received/paid states are distinct. Live monetisation requires agreements and payout/legal decisions, not just code completion.

### Phase 4 — Real private briefs and professional retention loop

Implement payload preview, durable single-recipient brief submission, private attachments under separate permission, inbox delivery, durable recommendation replies, appointment requests/manual confirmation, and follow-up/rebooking tracking. Add transactional notifications only after configuration and delivery handling exist.

Exit criteria: submitted form data reaches the correct inbox; retry does not duplicate; only the customer and permitted recipient see the brief; other look authors receive no customer data; recommendation edits arrive intact; requested dates are never displayed as confirmed appointments; failed notifications are reported separately from successful persistence.

### Parallel bounded spike — Real product try-on

Run the technical/commercial/privacy spike after the Phase 1 domain model is stable. It can proceed alongside Phases 2–4, but real facial processing requires the security, permission, and vendor gates. AR must not block building the non-AR shopping path.

Exit criteria: measured capabilities/costs and a documented provider decision; supported exact variants render consistently; unsupported states and failures are truthful; privacy copy matches actual data flow; the selected provider is replaceable without changing look/brief/commerce business rules.

### Phase 5 — Live pilot and subscription validation

Configure agreed billing/entitlements and a small controlled payout process as appropriate. Recruit the target experts, publish the target look set, and run the predefined experiment. Deliver expert reports based on observable events, not seed counts.

Exit criteria: the team can reconcile money and revoke access/content, respond to deletion/report requests, explain tracking limits, and monitor errors/costs. Expansion is a founder decision based on evidence; “feature complete” does not prove product-market fit.

## 17. Test scenarios the IDE must cover

Use existing typecheck, lint, and build, then add an explicit test runner/script for new business rules. Suggested tools are Vitest for domain/unit tests, Playwright for targeted browser workflows, and Supabase policy tests for RLS. These are recommendations; do not imply they are already configured.

At minimum, demonstrate:

- Anonymous browsing succeeds for a published approved look and fails for draft/private fields.
- An applicant cannot publish by editing an API payload; an expert cannot grant their own verification or admin role.
- Tenant A cannot read/write tenant B's clients, briefs, drafts, photos, or finance entries, including cross-tenant foreign-key insertion attempts.
- A customer can read their own submitted brief/reply but not another customer's brief or internal professional notes.
- A public profile contains no review evidence, identity documents, private contact information, or raw financial identifiers.
- Share/reload preserves the exact look. An unpublished look is not exposed through metadata/search/cache.
- Selecting a shade changes the exact variant/render mapping, not another formula; unsupported variants remain honestly labelled.
- Camera denial, unmount during permission, image replacement, storage failure, and repeated save/capture do not leak resources or corrupt state.
- Submission preserves service/notes/items/consent and produces one durable brief under retry; a failed request cannot show success.
- A malicious affiliate destination is rejected; tracking payloads contain no personal image/contact data.
- Duplicate conversions and partial refunds adjust commission correctly; partner approval does not mark cash as received or expert as paid.
- Suspension disables publication/handoff; changes to published content create a revision requiring review.
- Withdrawing image permission/deleting an attachment removes authorized access and schedules/executes required downstream deletion.
- Try-on experiment assignment remains stable and both arms emit comparable eligible-session events; shopper refusal of tracking does not prevent permitted core shopping.

Do not test against real customers, live payout accounts, or a shared production database without explicit operational authorization and safeguards.

## 18. Decisions that must be resolved before the affected launch gate

**Launch market:** UK, US, or another jurisdiction; corresponding disclosures, facial-data treatment, contracts, tax/payout expectations, and data region. The repo uses GBP fixtures, but this is not proof of a confirmed UK launch.

**Pilot niche and verification standard:** bridal versus lips/blush; portfolio/identity checks; credential criteria where relevant; who reviews content and owns reports. Avoid a generic “verified” badge with no documented standard.

**Commercial agreement:** subscription price/trial, platform share, whether Glowdesk or the expert receives partner commissions, what net amount is shared, and whether network terms permit sub-affiliate distribution. Do not treat the original ≥£25 willingness-to-pay research gate as agreed pricing.

**Partners and providers:** actual catalog licences, retailer destinations, conversion/postback support, try-on vendor capabilities/licence/privacy, transactional notifications, appointment integration if later needed, and a payout provider/process.

**Data and operations:** specific retention periods, vendor deletion assurances, storage region, lawful basis/consent design, moderation response ownership, and who can approve production migrations.

**Pilot decision thresholds:** exposure period, minimum useful uplift/contribution, sample-size approach, supported conversion window, and the distinction between feasibility evidence and statistically persuasive lift.

Prototype work can proceed with clearly fictional defaults. Real monetisation, facial processing, public claims, and private-customer operations must wait for their applicable decisions and gates.

## 19. First IDE assignment and documentation obligations

Place this file at `docs/GLOWDESK_V2_IDE_HANDOVER.md`. Ask the IDE to read it alongside the repository before writing code. Its first response should inventory current implementation, list deviations from this baseline, identify security/production blockers, and propose a Phase 0/1-only file-level plan.

The first coding slice should produce honest demo/pilot mode boundaries, structured product variants/look revisions, reusable feature modules, first-class look/expert URLs, complete product edits, corrected attribution/disclosure, and updated setup/pivot documentation. It should not attempt every billing/provider/backend phase at once.

Required documentation outcomes are an updated `README.md`, a new `DEVELOPMENT_SETUP.md`, an appended pivot decision in `DECISIONS.md`, revised `ARCHITECTURE.md` and `ORCHESTRATION.md`, and a maintained implementation checklist that distinguishes finished, mocked, blocked, and deferred work. Add API, catalog/variant mapping, disclosure/verification policy, and pilot metrics documentation when their slices are implemented.

Every completed slice should report changed files, actual checks run, what is functional, what is mocked, migration implications, and remaining blockers. Commit/push/deploy only through the developer's authorized workflow. This handover does not authorize a force push, destructive migration, real payout, new public claim, or automatic publication.

The practical definition of success is simple: a vetted expert can publish a trusted exact-product look; a shopper can understand, optionally preview, save and shop it; and the same relationship can continue privately into a real consultation and follow-up—without fake commerce, fake verification, or leaked client data.
