"use client";

import { CalendarDays, Check, Clock3, Inbox, Link2, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PublicExpert, RevisionStatus } from "@/core/looks";
import type { DemoBrief, DemoBriefStatus } from "@/data/fixtures/workspace";
import { ExpertSignature } from "@/features/experts/expert-signature";
import { useApp } from "@/features/shell/app-providers";
import { cx, formatMoney } from "@/lib/format";
import { paths } from "@/lib/urls";

type OwnLook = {
  id: string;
  title: string;
  version: number;
  status: RevisionStatus;
  live: boolean;
};

const REVISION_LABEL: Record<RevisionStatus, string> = {
  draft: "Draft",
  submitted: "Pending review",
  approved: "Approved",
  changes_requested: "Changes requested",
  rejected: "Rejected",
};

const statusClass = (status: DemoBriefStatus) =>
  status === "reply drafted" ? "status-recommendation-sent" : `status-${status}`;

/** Fictional single-expert workspace. Every change lives in this tab only. */
export function ProWorkspace({
  expert,
  enabledBrandIds,
  briefs: initialBriefs,
  ownLooks,
}: {
  expert: PublicExpert;
  enabledBrandIds: string[];
  briefs: DemoBrief[];
  ownLooks: OwnLook[];
}) {
  const { index, openVariant } = useApp();
  const firstName = expert.displayName.split(" ")[0];
  const [briefs, setBriefs] = useState(initialBriefs);
  const [activeId, setActiveId] = useState(initialBriefs[0]?.id ?? "");
  // Reply drafts keyed by brief so switching briefs never loses or leaks one.
  const [drafts, setDrafts] = useState<
    Record<string, { variantIds: string[]; note: string }>
  >({});
  const [category, setCategory] = useState("all");

  const active = briefs.find((brief) => brief.id === activeId) ?? briefs[0];
  if (!active) {
    return (
      <section className="professional-workspace">
        <div className="empty-state">
          <h2>No briefs yet.</h2>
          <p>Briefs sent to your studio will appear here.</p>
        </div>
      </section>
    );
  }

  const draft = drafts[active.id] ?? { variantIds: active.variantIds, note: "" };
  const setDraft = (next: Partial<typeof draft>) =>
    setDrafts((current) => ({ ...current, [active.id]: { ...draft, ...next } }));
  const setStatus = (id: string, status: DemoBriefStatus) =>
    setBriefs((current) =>
      current.map((brief) => (brief.id === id ? { ...brief, status } : brief)),
    );
  const serviceName = (id: string) =>
    expert.services.find((service) => service.id === id)?.name ?? "Service";

  // The full allowed catalog: every variant of every enabled brand.
  const allowed = index.catalog.variants
    .map((variant) => index.variantView(variant.id))
    .filter(
      (view): view is NonNullable<typeof view> =>
        Boolean(view) && enabledBrandIds.includes(view!.brand.id),
    );
  const categories = ["all", ...new Set(allowed.map((view) => view.product.category))];
  // Selected items always stay visible, whatever the filter.
  const visible = allowed
    .filter(
      (view) =>
        category === "all" ||
        view.product.category === category ||
        draft.variantIds.includes(view.variant.id),
    )
    .sort(
      (a, b) =>
        Number(draft.variantIds.includes(b.variant.id)) -
        Number(draft.variantIds.includes(a.variant.id)),
    );

  return (
    <section className="professional-workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Expert workspace · demo scenario</p>
          <h1>{firstName}&apos;s workspace</h1>
          <p>
            A fictional inbox for one fictional expert. In the pilot this area
            requires sign-in and shows only your own studio&apos;s data.
          </p>
        </div>
        <div className="workspace-profile">
          <ExpertSignature expert={expert} compact />
          <Link className="secondary-button" href={paths.expert(expert.slug)}>
            View public studio
          </Link>
        </div>
      </header>

      <div className="workspace-metrics" aria-label="Practice summary">
        <article>
          <Inbox />
          <span>
            <strong>{briefs.length}</strong> demo briefs
          </span>
          <small>fictional clients</small>
        </article>
        <article>
          <CalendarDays />
          <span>
            <strong>—</strong> appointments
          </span>
          <small>Unavailable: booking isn&apos;t built</small>
        </article>
        <article>
          <Link2 />
          <span>
            <strong>—</strong> clicks and earnings
          </span>
          <small>Unavailable: nothing is tracked</small>
        </article>
      </div>

      <section className="own-looks" aria-labelledby="own-looks-heading">
        <h2 id="own-looks-heading">Your looks</h2>
        <ul>
          {ownLooks.map((look) => (
            <li key={look.id}>
              <span>
                <strong>{look.title}</strong>
                <small>Revision {look.version}</small>
              </span>
              <em>
                {REVISION_LABEL[look.status]}
                {look.live && " · live"}
              </em>
            </li>
          ))}
        </ul>
        <p className="variant-meta">
          Edits become a new revision and stay private until a reviewer approves
          them. The look composer and review queue aren&apos;t built yet.
        </p>
      </section>

      <div className="workspace-grid">
        <aside className="consultation-inbox">
          <div className="inbox-heading">
            <div>
              <p className="eyebrow">Inbox</p>
              <h2>Client briefs</h2>
            </div>
          </div>
          <div className="inbox-list">
            {briefs.map((brief) => (
              <button
                key={brief.id}
                className={cx("inbox-item", active.id === brief.id && "active")}
                aria-current={active.id === brief.id ? "true" : undefined}
                onClick={() => {
                  setActiveId(brief.id);
                  if (brief.status === "new") setStatus(brief.id, "reviewing");
                }}
              >
                <span className="client-initials">{brief.initials}</span>
                <span className="inbox-copy">
                  <strong>{brief.clientName}</strong>
                  <small>
                    {serviceName(brief.serviceId)} · {brief.preferredDateLabel}
                  </small>
                  <em>{brief.note}</em>
                </span>
                <span className={cx("status-pill", statusClass(brief.status))}>
                  {brief.status}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <article className="consultation-detail">
          <header className="consultation-detail-head">
            <div>
              <p className="eyebrow">{active.id} · fictional client</p>
              <h2>{active.clientName}</h2>
              <span>
                {serviceName(active.serviceId)} · {active.preferredDateLabel} (not
                a confirmed appointment)
              </span>
            </div>
            <span className={cx("status-pill", statusClass(active.status))}>
              {active.status}
            </span>
          </header>

          <div className="client-note">
            <MessageCircle />
            <p>“{active.note}”</p>
          </div>

          <section className="client-inspiration">
            <div className="section-title">
              <div>
                <p className="eyebrow">Client inspiration</p>
                <h3>{active.lookIds.length} looks in the brief</h3>
              </div>
              <span>
                <Clock3 /> {active.submittedLabel}
              </span>
            </div>
            <div className="client-look-grid">
              {active.lookIds.map((lookId) => {
                const look = index.look(lookId);
                if (!look) return null;
                return (
                  <div key={look.id}>
                    <Image
                      src={look.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 46vw, 240px"
                    />
                    <span>
                      {look.title} · by {index.expert(look.expertId)?.displayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="recommendation-builder">
            <div className="section-title">
              <div>
                <p className="eyebrow">Reply</p>
                <h3>Recommend exact products</h3>
              </div>
            </div>
            <div className="mood-filter" role="group" aria-label="Filter catalog by category">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "active" : undefined}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="recommendation-products">
              {visible.map((view) => {
                const selected = draft.variantIds.includes(view.variant.id);
                return (
                  <button
                    key={view.variant.id}
                    className={selected ? "active" : undefined}
                    aria-pressed={selected}
                    onClick={() =>
                      setDraft({
                        variantIds: selected
                          ? draft.variantIds.filter((id) => id !== view.variant.id)
                          : [...draft.variantIds, view.variant.id],
                      })
                    }
                  >
                    <span style={{ background: view.variant.swatchColor }} />
                    <strong>
                      {view.product.name} · {view.variant.shadeName}
                    </strong>
                    <small>
                      {view.brand.name}
                      {view.bestOffer
                        ? ` · ${formatMoney(view.bestOffer.price)}`
                        : " · no offer available"}
                    </small>
                    {selected && <Check />}
                  </button>
                );
              })}
            </div>
            <label>
              Note to {active.clientName.split(" ")[0]}
              <textarea
                value={draft.note}
                onChange={(event) => setDraft({ note: event.target.value })}
                rows={4}
              />
            </label>
            <div className="recommendation-actions">
              <button
                className="secondary-button"
                disabled={!draft.variantIds.length}
                onClick={() => openVariant({ variantId: draft.variantIds[0] })}
              >
                Preview first product
              </button>
              <button
                className="primary-button"
                disabled={!draft.variantIds.length}
                onClick={() => {
                  setDraft({});
                  setStatus(active.id, "reply drafted");
                }}
              >
                Keep reply draft
              </button>
            </div>
            <p className="brief-not-sent" role="status">
              {active.status === "reply drafted" ? (
                <>
                  <strong>Draft kept in this tab only — not delivered.</strong>{" "}
                  {draft.variantIds.length} product(s) selected. It will be gone
                  when you reload.
                </>
              ) : (
                <>
                  <strong>Replies can&apos;t be sent in the demo.</strong>{" "}
                  Delivery to clients, appointment confirmation and follow-up
                  reminders aren&apos;t built yet.
                </>
              )}
            </p>
          </section>
        </article>
      </div>
    </section>
  );
}
