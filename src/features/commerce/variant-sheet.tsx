"use client";

import { Bookmark, WandSparkles } from "lucide-react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { MOCK_PREVIEW_LABEL } from "@/core/try-on";
import { useApp } from "@/features/shell/app-providers";
import { paths } from "@/lib/urls";
import { DisclosureNote } from "./disclosure";
import { OfferList } from "./offer-list";

/** Product detail for one exact variant, with real same-product shades. */
export function VariantSheet({
  variantId,
  lookRevisionId,
  onSelectVariant,
  onClose,
}: {
  variantId: string;
  /** The look this was opened from, for attribution and disclosure. */
  lookRevisionId?: string;
  onSelectVariant: (variantId: string) => void;
  onClose: () => void;
}) {
  const { index, mode, saved, dispatchSaved } = useApp();
  const view = index.variantView(variantId);
  const look = lookRevisionId ? index.lookByRevision(lookRevisionId) : undefined;
  const lookItem = look?.items.find((item) => item.variantId === variantId);
  const author = look ? index.expert(look.expertId) : undefined;

  if (!view) {
    return (
      <BottomSheet title="Product detail" onClose={onClose}>
        <p className="offer-empty">This product is no longer available.</p>
      </BottomSheet>
    );
  }

  const { variant, product, brand, siblings } = view;
  const isSaved = saved.variantIds.includes(variant.id);
  const inLook = look?.items.some((item) => item.variantId === variant.id);

  return (
    <BottomSheet title="Product detail" onClose={onClose} wide>
      <div className="product-detail-grid">
        <div
          className="product-hero-art"
          style={{
            background: `radial-gradient(circle at 65% 22%, #fff9, transparent 16%), linear-gradient(145deg, color-mix(in srgb, ${variant.swatchColor} 48%, #f8eee6), ${variant.swatchColor})`,
          }}
        >
          <span>{brand.name}</span>
          <div className="product-object">
            <i>{product.name}</i>
          </div>
          {mode === "demo" && <small>Fictional product · demo only</small>}
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow">{brand.name}</p>
          <div className="product-title-row">
            <h2>{product.name}</h2>
            <button
              className="icon-button outlined"
              aria-pressed={isSaved}
              aria-label={isSaved ? "Remove product from saved" : "Save product"}
              onClick={() =>
                dispatchSaved({ type: "toggleVariant", variantId: variant.id })
              }
            >
              <Bookmark className={isSaved ? "filled-icon" : ""} />
            </button>
          </div>
          <p className="variant-meta">
            {variant.shadeName} · {variant.size} · {product.finishNote}
          </p>
          <p className="product-description">{product.description}</p>

          {siblings.length > 1 ? (
            <div className="shade-picker">
              <span>
                Shade: <strong>{variant.shadeName}</strong>
              </span>
              <div role="group" aria-label={`${product.name} shades`}>
                {siblings.map((item) => (
                  <button
                    key={item.id}
                    className={item.id === variant.id ? "active" : undefined}
                    style={{ background: item.swatchColor }}
                    aria-label={item.shadeName}
                    aria-pressed={item.id === variant.id}
                    title={item.shadeName}
                    onClick={() => onSelectVariant(item.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="variant-meta">This product comes in one option.</p>
          )}

          {look && author && (
            <p className="variant-context">
              {inLook ? (
                <>
                  Used in <strong>{look.title}</strong> by {author.displayName}
                  {lookItem ? <> — “{lookItem.applicationNote}”</> : null}
                </>
              ) : (
                <>
                  <strong>Substitution:</strong> this shade is not the one{" "}
                  {author.displayName} used in {look.title}.
                </>
              )}
            </p>
          )}

          <p className="variant-meta">
            {view.capability
              ? `Illustrative preview available. ${MOCK_PREVIEW_LABEL}`
              : "Preview not supported for this product. It stays shoppable."}
          </p>

          {look && <DisclosureNote disclosure={look.disclosure} mode={mode} />}
          <OfferList view={view} />

          {look && view.capability && inLook && (
            <Link
              className="text-button"
              href={paths.tryOn(look.id, look.revisionId)}
              onClick={onClose}
            >
              <WandSparkles /> Preview in the try-on studio
            </Link>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
