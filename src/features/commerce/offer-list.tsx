"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { isOfferShoppable } from "@/core/catalog";
import type { VariantView } from "@/core/public-catalog";
import { useApp } from "@/features/shell/app-providers";
import { formatDate, formatMoney } from "@/lib/format";

const STOCK_LABEL = {
  in_stock: "In stock when checked",
  out_of_stock: "Out of stock when checked",
  unknown: "Stock not confirmed",
} as const;

/**
 * Retailer choices for ONE exact variant. In demo mode the shop action
 * explains the handoff instead of leaving the site: there is no authorised
 * retailer destination, tracking, or checkout behind these fixtures.
 */
export function OfferList({ view }: { view: VariantView }) {
  const { mode } = useApp();
  const [handoffOfferId, setHandoffOfferId] = useState<string | null>(null);
  const handoff = view.offers.find((offer) => offer.id === handoffOfferId);
  const label = `${view.brand.name} ${view.product.name} in ${view.variant.shadeName}`;

  if (!view.offers.length) {
    return (
      <p className="offer-empty">
        No authorised retailer offer for {view.variant.shadeName} right now.
      </p>
    );
  }

  return (
    <div className="offer-list">
      <ul>
        {view.offers.map((offer) => {
          const shoppable = isOfferShoppable(offer);
          return (
            <li key={offer.id}>
              <span>
                <strong>{formatMoney(offer.price)}</strong>
                <small>
                  {STOCK_LABEL[offer.stock]} · price checked{" "}
                  {formatDate(offer.checkedAt)}
                </small>
              </span>
              <button
                className="secondary-button"
                disabled={!shoppable}
                onClick={() => setHandoffOfferId(offer.id)}
              >
                <ExternalLink />
                {shoppable
                  ? `Shop at ${offer.retailerName}`
                  : `Unavailable at ${offer.retailerName}`}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="offer-terms">
        Checkout happens at the retailer, who confirms the final price. Shipping
        and returns are governed by the retailer.
      </p>
      <div role="status" aria-live="polite">
        {handoff && mode === "demo" && (
          <p className="offer-handoff">
            <strong>Demo handoff — you have not left Glowdesk.</strong> In the
            pilot this would open {handoff.retailerName} for {label}.{" "}
            {handoff.retailerName} is a fictional retailer: nothing was
            purchased and no click was tracked.
          </p>
        )}
      </div>
    </div>
  );
}
