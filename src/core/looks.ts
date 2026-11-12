/**
 * Looks, immutable revisions, experts, and the public projection rules that
 * decide what an anonymous visitor may see. Pure functions; no I/O.
 */

export type ExpertStatus =
  | "applicant"
  | "under_review"
  | "approved"
  | "rejected"
  | "suspended";

export interface Service {
  id: string;
  name: string;
  duration: string;
  /** Display-only fixture text; services are not sold through Glowdesk. */
  priceLabel: string;
  description: string;
}

export interface ExpertProfile {
  id: string;
  tenantId: string;
  slug: string;
  displayName: string;
  studioName?: string;
  handle: string;
  specialty: string;
  bio: string;
  image: string;
  serviceRegion?: string;
  status: ExpertStatus;
  /** What "verified" means for this expert. Absent ⇒ show no badge at all. */
  verification?: {
    label: string;
    checks: Array<"identity" | "portfolio" | "credentials">;
    criteriaVersion: string;
  };
  services: Service[];
  /** Looks by other authors this expert features in their studio. */
  curatedLookIds: string[];
  /** Brand ids this expert may recommend from in the workspace. */
  enabledBrandIds: string[];
}

export type RevisionStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "changes_requested"
  | "rejected";

export type DisclosureKind = "affiliate" | "gifted" | "sponsored" | "none";

export interface Disclosure {
  kinds: DisclosureKind[];
  text: string;
  version: string;
}

export interface LookItem {
  variantId: string;
  applicationOrder: number;
  applicationNote: string;
  defaultOfferId?: string;
}

export interface LookRevision {
  id: string;
  lookId: string;
  version: number;
  status: RevisionStatus;
  title: string;
  description: string;
  occasion: string;
  coverImage: string;
  /** Presentation accent only; not a product colour. */
  accentColor: string;
  steps: string[];
  items: LookItem[];
  disclosure: Disclosure;
  attestations: { productUse: boolean; imageRights: boolean };
}

export interface Look {
  id: string;
  tenantId: string;
  authorExpertId: string;
  slug: string;
  /** Pointer to the live revision. Null ⇒ never published. */
  currentApprovedRevisionId: string | null;
  visibility: "published" | "unpublished" | "archived";
  revisions: LookRevision[];
}

/** The only shape public pages, metadata, and share cards may consume. */
export interface PublicLook {
  id: string;
  revisionId: string;
  tenantId: string;
  expertId: string;
  slug: string;
  title: string;
  description: string;
  occasion: string;
  coverImage: string;
  accentColor: string;
  steps: string[];
  items: LookItem[];
  disclosure: Disclosure;
}

export type PublicExpert = Omit<ExpertProfile, "status" | "enabledBrandIds">;

export function isExpertPublic(expert: ExpertProfile): boolean {
  return expert.status === "approved";
}

export function toPublicExpert(expert: ExpertProfile): PublicExpert | null {
  if (!isExpertPublic(expert)) return null;
  const { status, enabledBrandIds, ...rest } = expert;
  void status;
  void enabledBrandIds;
  return rest;
}

/**
 * Projects a look to its public form, or null when it must not be visible:
 * unpublished/archived, no approved revision, missing attestations or
 * disclosure, or an author who is not currently approved (suspension
 * overrides publication).
 */
export function toPublicLook(
  look: Look,
  author: ExpertProfile | undefined,
): PublicLook | null {
  if (!author || !isExpertPublic(author)) return null;
  if (author.tenantId !== look.tenantId) return null;
  if (look.visibility !== "published" || !look.currentApprovedRevisionId) {
    return null;
  }
  const revision = look.revisions.find(
    (item) => item.id === look.currentApprovedRevisionId,
  );
  if (!revision || revision.status !== "approved") return null;
  if (!revision.attestations.productUse || !revision.attestations.imageRights) {
    return null;
  }
  if (!revision.disclosure.text.trim() || !revision.items.length) return null;
  return {
    id: look.id,
    revisionId: revision.id,
    tenantId: look.tenantId,
    expertId: look.authorExpertId,
    slug: look.slug,
    title: revision.title,
    description: revision.description,
    occasion: revision.occasion,
    coverImage: revision.coverImage,
    accentColor: revision.accentColor,
    steps: revision.steps,
    items: [...revision.items].sort(
      (a, b) => a.applicationOrder - b.applicationOrder,
    ),
    disclosure: revision.disclosure,
  };
}
