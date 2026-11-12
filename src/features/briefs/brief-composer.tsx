"use client";

import { Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  BRIEF_ISSUE_MESSAGES,
  BRIEF_NOTES_MAX,
  validateBriefDraft,
  type BriefDraft,
  type BriefIssue,
} from "@/core/briefs";
import type { PublicExpert, PublicLook } from "@/core/looks";
import { ExpertSignature } from "@/features/experts/expert-signature";
import { useApp } from "@/features/shell/app-providers";
import { cx, formatDate } from "@/lib/format";
import { paths } from "@/lib/urls";

const toggleIn = (list: string[], id: string) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

/**
 * Single-recipient brief composer with a payload preview.
 *
 * Phase 1 stops at the preview: there is no authentication or durable
 * delivery yet, so nothing is submitted and no "sent" state can be reached.
 */
export function BriefComposer({ expert }: { expert: PublicExpert }) {
  const { index, saved, savedHydrated } = useApp();
  const firstName = expert.displayName.split(" ")[0];
  const [serviceId, setServiceId] = useState("");
  // null ⇒ "everything saved" until the customer changes the selection.
  const [lookIds, setLookIds] = useState<string[] | null>(null);
  const [variantIds, setVariantIds] = useState<string[] | null>(null);
  const [notes, setNotes] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [share, setShare] = useState(false);
  const [issues, setIssues] = useState<BriefIssue[]>([]);
  const [preview, setPreview] = useState<BriefDraft | null>(null);

  const savedLooks = saved.lookIds
    .map(index.look)
    .filter((look): look is PublicLook => Boolean(look));
  const savedVariants = saved.variantIds
    .map(index.variantView)
    .filter((view): view is NonNullable<typeof view> => Boolean(view));
  const chosenLookIds = lookIds ?? savedLooks.map((look) => look.id);
  const chosenVariantIds = variantIds ?? savedVariants.map((v) => v.variant.id);

  const buildPreview = () => {
    const draft: BriefDraft = {
      recipientExpertId: expert.id,
      serviceId,
      lookRevisionIds: savedLooks
        .filter((look) => chosenLookIds.includes(look.id))
        .map((look) => look.revisionId),
      variantIds: chosenVariantIds,
      notes: notes.trim(),
      preferredDate: preferredDate || undefined,
      consents: { shareWithRecipient: share },
    };
    const found = validateBriefDraft(draft, {
      serviceIds: expert.services.map((service) => service.id),
      today: new Date().toISOString().slice(0, 10),
    });
    setIssues(found);
    setPreview(found.length ? null : draft);
  };

  if (preview) {
    const service = expert.services.find((item) => item.id === preview.serviceId);
    const previewLooks = preview.lookRevisionIds
      .map(index.lookByRevision)
      .filter((look): look is PublicLook => Boolean(look));
    return (
      <section className="saved-page">
        <header className="page-heading">
          <div>
            <p className="eyebrow">Brief preview</p>
            <h1>What {firstName} would receive</h1>
          </div>
        </header>
        <div className="brief-preview">
          <dl>
            <dt>Recipient</dt>
            <dd>{expert.studioName ?? expert.displayName} only</dd>
            <dt>Service</dt>
            <dd>{service?.name}</dd>
            <dt>Preferred date</dt>
            <dd>
              {preview.preferredDate
                ? `${formatDate(preview.preferredDate)} — a request, not a confirmed appointment`
                : "None given"}
            </dd>
            <dt>Looks ({previewLooks.length})</dt>
            <dd>
              {previewLooks.length
                ? previewLooks
                    .map(
                      (look) =>
                        `${look.title} by ${index.expert(look.expertId)?.displayName}`,
                    )
                    .join("; ")
                : "None"}
            </dd>
            <dt>Products ({preview.variantIds.length})</dt>
            <dd>
              {preview.variantIds.length
                ? preview.variantIds
                    .map((id) => {
                      const view = index.variantView(id);
                      return view
                        ? `${view.product.name} in ${view.variant.shadeName}`
                        : id;
                    })
                    .join("; ")
                : "None"}
            </dd>
            <dt>Your notes</dt>
            <dd>{preview.notes || "None"}</dd>
            <dt>Photos</dt>
            <dd>None. Photo attachments aren&apos;t part of this demo.</dd>
          </dl>
          <p className="brief-not-sent" role="status">
            <strong>This brief has not been sent.</strong> Sending needs
            sign-in and secure delivery, which aren&apos;t built yet. Nothing
            left this browser and this draft isn&apos;t stored.
          </p>
          <div className="look-cta-row">
            <button className="secondary-button" onClick={() => setPreview(null)}>
              Back to edit
            </button>
            <Link className="text-button" href={paths.expert(expert.slug)}>
              Return to {firstName}&apos;s studio
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="saved-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">New private brief</p>
          <h1>A brief for {firstName}</h1>
        </div>
      </header>
      <div className="brief-recipient">
        <ExpertSignature expert={expert} compact />
        <p className="privacy-card">
          <ShieldCheck />
          <span>
            <strong>One recipient: {expert.studioName ?? expert.displayName}</strong>
            <small>
              Looks by other experts are included as inspiration only. Their
              authors never see your brief.
            </small>
          </span>
        </p>
      </div>

      <form
        className="consultation-form brief-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          buildPreview();
        }}
      >
        <fieldset>
          <legend>Service</legend>
          <div className="service-options">
            {expert.services.map((service) => (
              <button
                type="button"
                key={service.id}
                className={cx("service-option", serviceId === service.id && "active")}
                aria-pressed={serviceId === service.id}
                onClick={() => setServiceId(service.id)}
              >
                <span>
                  <strong>{service.name}</strong>
                  <small>{service.duration}</small>
                </span>
                <em>{service.priceLabel}</em>
                {serviceId === service.id && <Check />}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Saved looks to include</legend>
          {!savedHydrated ? (
            <p className="variant-meta">Loading your saved looks…</p>
          ) : savedLooks.length ? (
            <ul className="brief-picks">
              {savedLooks.map((look) => (
                <li key={look.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={chosenLookIds.includes(look.id)}
                      onChange={() => setLookIds(toggleIn(chosenLookIds, look.id))}
                    />
                    <span>
                      {look.title}{" "}
                      <small>by {index.expert(look.expertId)?.displayName}</small>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="variant-meta">
              No saved looks. <Link href={paths.home}>Browse looks</Link> and
              save some first.
            </p>
          )}
        </fieldset>

        {savedVariants.length > 0 && (
          <fieldset>
            <legend>Saved products to include</legend>
            <ul className="brief-picks">
              {savedVariants.map((view) => (
                <li key={view.variant.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={chosenVariantIds.includes(view.variant.id)}
                      onChange={() =>
                        setVariantIds(toggleIn(chosenVariantIds, view.variant.id))
                      }
                    />
                    <span>
                      {view.product.name} <small>{view.variant.shadeName}</small>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}

        <label>
          Preferred date (optional)
          <input
            type="date"
            value={preferredDate}
            onChange={(event) => setPreferredDate(event.target.value)}
          />
          <small className="field-hint">
            A request only. {firstName} confirms any appointment separately.
          </small>
        </label>
        <label>
          What should {firstName} know? (optional)
          <textarea
            value={notes}
            maxLength={BRIEF_NOTES_MAX}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
          />
        </label>
        <label className="consent-check">
          <input
            type="checkbox"
            checked={share}
            onChange={(event) => setShare(event.target.checked)}
          />
          <span>
            Share this brief with {expert.studioName ?? expert.displayName} for
            my consultation. This does not allow public use of anything I send.
          </span>
        </label>

        <div role="alert">
          {issues.length > 0 && (
            <ul className="form-issues">
              {issues.map((issue) => (
                <li key={issue}>{BRIEF_ISSUE_MESSAGES[issue]}</li>
              ))}
            </ul>
          )}
        </div>
        <button className="primary-button consultation-send" type="submit">
          Preview brief
        </button>
      </form>
    </section>
  );
}
