"use client";

import { Bookmark, ChevronRight, Share2 } from "lucide-react";
import { useEffect } from "react";
import { estimateLookTotal } from "@/core/catalog";
import type { PublicLook } from "@/core/looks";
import { OfferList } from "@/features/commerce/offer-list";
import { useApp } from "@/features/shell/app-providers";
import { formatDate, formatMoney } from "@/lib/format";
import { paths } from "@/lib/urls";

/** Save + share for the look page. Also records the view in local history. */
export function LookActions({ look }: { look: PublicLook }) {
  const { saved, savedHydrated, dispatchSaved, share } = useApp();
  const isSaved = saved.lookIds.includes(look.id);

  useEffect(() => {
    if (savedHydrated) dispatchSaved({ type: "recordView", lookId: look.id });
  }, [savedHydrated, dispatchSaved, look.id]);

  return (
    <div className="look-actions">
      <button
        className="secondary-button"
        aria-pressed={isSaved}
        onClick={() => dispatchSaved({ type: "toggleLook", lookId: look.id })}
      >
        <Bookmark className={isSaved ? "filled-icon" : ""} />
        {isSaved ? "Saved" : "Save look"}
      </button>
      <button
        className="secondary-button"
        onClick={() => void share(look.title, paths.look(look.slug))}
      >
        <Share2 />
        Share
      </button>
    </div>
  );
}

/**
 * "Shop this look": every exact variant in application order, each with its
 * own retailer choices. Separate retailers are separate purchases — there is
 * no Glowdesk basket.
 */
export function ShopThisLook({ look }: { look: PublicLook }) {
  const { index, openVariant } = useApp();
  const entries = index.lookVariantViews(look);
  const total = estimateLookTotal(
    entries.map(({ view }) => view.variant.id),
    (variantId) => index.variantView(variantId)?.bestOffer,
  );

  return (
    <div className="shop-look">
      <ol className="shop-look-items">
        {entries.map(({ item, view }) => (
          <li key={view.variant.id}>
            <div className="shop-look-item-head">
              <span
                className="shop-look-swatch"
                style={{ background: view.variant.swatchColor }}
                aria-hidden="true"
              />
              <div>
                <p className="eyebrow">
                  Step {item.applicationOrder} · {view.brand.name}
                </p>
                <h3>{view.product.name}</h3>
                <p className="variant-meta">
                  Exact shade: <strong>{view.variant.shadeName}</strong> ·{" "}
                  {view.variant.size}
                </p>
                <p className="shop-look-note">“{item.applicationNote}”</p>
              </div>
              <button
                className="text-button"
                onClick={() =>
                  openVariant({
                    variantId: view.variant.id,
                    lookRevisionId: look.revisionId,
                  })
                }
              >
                Details <ChevronRight />
              </button>
            </div>
            <OfferList view={view} />
          </li>
        ))}
      </ol>
      <p className="shop-look-total">
        {total.kind === "estimate" ? (
          <>
            <strong>Estimated total {formatMoney(total.total)}</strong> for{" "}
            {total.includedOfferIds.length} of {entries.length} products at the
            first available retailer, prices checked {formatDate(total.checkedAt)}.
            Excludes shipping and taxes.
            {total.excludedVariantIds.length > 0 &&
              ` ${total.excludedVariantIds.length} unavailable product(s) not included.`}{" "}
            Each retailer is a separate purchase.
          </>
        ) : (
          "No estimated total: these products have no available offers right now."
        )}
      </p>
    </div>
  );
}
