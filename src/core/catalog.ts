/**
 * Vendor-independent catalog domain: brand → product → exact variant → retailer offer.
 * Money is always integer minor units + ISO currency. No floats, no vendor shapes.
 */

export type Money = { amountMinor: number; currency: string };

export type ProductCategory =
  | "lips"
  | "blush"
  | "eyes"
  | "complexion"
  | "skincare";

export interface Brand {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  brandId: string;
  name: string;
  category: ProductCategory;
  description: string;
  /** Short formula/finish note. Not an efficacy claim. */
  finishNote: string;
}

/** An exact purchasable shade/size of one product. */
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  /** Shade name for colour cosmetics; format/strength label for skincare. */
  shadeName: string;
  swatchColor: string;
  size: string;
}

export interface Retailer {
  id: string;
  name: string;
}

export type StockState = "in_stock" | "out_of_stock" | "unknown";
export type OfferStatus = "active" | "paused" | "retired";

/** One authorised merchant's offer for one exact variant. */
export interface RetailerOffer {
  id: string;
  variantId: string;
  retailerId: string;
  market: string;
  price: Money;
  stock: StockState;
  /** ISO date the price/stock was last checked. Never implies live data. */
  checkedAt: string;
  status: OfferStatus;
}

/** Offers a shopper may be sent to. Paused/retired offers are never shoppable. */
export function isOfferShoppable(offer: RetailerOffer): boolean {
  return offer.status === "active" && offer.stock !== "out_of_stock";
}

export type LookTotal =
  | { kind: "unavailable" }
  | {
      kind: "estimate";
      total: Money;
      includedOfferIds: string[];
      /** Variants with no shoppable offer, excluded from the total. */
      excludedVariantIds: string[];
      /** Oldest check date among included offers. */
      checkedAt: string;
    };

/**
 * Estimated total across the chosen offer per variant. Refuses to aggregate
 * mixed currencies and reports exactly which offers were included.
 */
export function estimateLookTotal(
  variantIds: string[],
  offerFor: (variantId: string) => RetailerOffer | undefined,
): LookTotal {
  const included: RetailerOffer[] = [];
  const excluded: string[] = [];
  for (const variantId of variantIds) {
    const offer = offerFor(variantId);
    if (offer && isOfferShoppable(offer)) included.push(offer);
    else excluded.push(variantId);
  }
  if (!included.length) return { kind: "unavailable" };
  const currency = included[0].price.currency;
  if (included.some((offer) => offer.price.currency !== currency)) {
    return { kind: "unavailable" };
  }
  return {
    kind: "estimate",
    total: {
      amountMinor: included.reduce((sum, o) => sum + o.price.amountMinor, 0),
      currency,
    },
    includedOfferIds: included.map((offer) => offer.id),
    excludedVariantIds: excluded,
    checkedAt: included.map((offer) => offer.checkedAt).sort()[0],
  };
}
