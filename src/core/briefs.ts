/**
 * Private brief payload and validation. Phase 1 only builds and previews the
 * payload; durable submission (auth, idempotency, snapshot) is Phase 4.
 */

export const BRIEF_NOTES_MAX = 1200;

export interface BriefDraft {
  recipientExpertId: string;
  serviceId: string;
  /** Revisions, so later edits to a look never rewrite what was sent. */
  lookRevisionIds: string[];
  variantIds: string[];
  notes: string;
  /** ISO date (YYYY-MM-DD). A preference, never a confirmed appointment. */
  preferredDate?: string;
  consents: {
    /** Share this brief with the single recipient studio. */
    shareWithRecipient: boolean;
  };
}

export type BriefIssue =
  | "RECIPIENT_REQUIRED"
  | "SERVICE_REQUIRED"
  | "ITEMS_REQUIRED"
  | "NOTES_TOO_LONG"
  | "DATE_INVALID"
  | "CONSENT_REQUIRED";

export const BRIEF_ISSUE_MESSAGES: Record<BriefIssue, string> = {
  RECIPIENT_REQUIRED: "Choose the expert who should receive this brief.",
  SERVICE_REQUIRED: "Choose a service.",
  ITEMS_REQUIRED: "Add at least one look or product.",
  NOTES_TOO_LONG: `Keep notes under ${BRIEF_NOTES_MAX} characters.`,
  DATE_INVALID: "Enter a valid preferred date that is not in the past.",
  CONSENT_REQUIRED: "Confirm you want to share this brief with the recipient.",
};

export function validateBriefDraft(
  draft: BriefDraft,
  context: { serviceIds: string[]; today: string },
): BriefIssue[] {
  const issues: BriefIssue[] = [];
  if (!draft.recipientExpertId) issues.push("RECIPIENT_REQUIRED");
  if (!context.serviceIds.includes(draft.serviceId)) {
    issues.push("SERVICE_REQUIRED");
  }
  if (!draft.lookRevisionIds.length && !draft.variantIds.length) {
    issues.push("ITEMS_REQUIRED");
  }
  if (draft.notes.length > BRIEF_NOTES_MAX) issues.push("NOTES_TOO_LONG");
  if (draft.preferredDate) {
    const valid =
      /^\d{4}-\d{2}-\d{2}$/.test(draft.preferredDate) &&
      !Number.isNaN(Date.parse(draft.preferredDate)) &&
      draft.preferredDate >= context.today;
    if (!valid) issues.push("DATE_INVALID");
  }
  if (!draft.consents.shareWithRecipient) issues.push("CONSENT_REQUIRED");
  return issues;
}
