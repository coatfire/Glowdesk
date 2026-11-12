/**
 * The serialisable public projection handed to the browser, plus pure lookups
 * over it. Client code only ever sees this — never drafts, non-approved
 * experts, inactive offers, or workspace data.
 */
import {
  isOfferShoppable,
  type Brand,
  type Product,
  type ProductVariant,
  type Retailer,
  type RetailerOffer,
} from "./catalog";
import type { PublicExpert, PublicLook } from "./looks";
import type { TryOnCapability } from "./try-on";

export interface PublicCatalog {
  looks: PublicLook[];
  experts: PublicExpert[];
  brands: Brand[];
  products: Product[];
  variants: ProductVariant[];
  retailers: Retailer[];
  /** Active offers only. */
  offers: RetailerOffer[];
  tryOnCapabilities: TryOnCapability[];
  tryOnProvider: string;
}

export interface OfferView extends RetailerOffer {
  retailerName: string;
}

export interface VariantView {
  variant: ProductVariant;
  product: Product;
  brand: Brand;
  /** Other shades of the SAME product. Never other formulas. */
  siblings: ProductVariant[];
  offers: OfferView[];
  /** First shoppable offer, if any. */
  bestOffer?: OfferView;
  capability?: TryOnCapability;
}

export type CatalogIndex = ReturnType<typeof createCatalogIndex>;

export function createCatalogIndex(catalog: PublicCatalog) {
  const by = <T extends { id: string }>(list: T[]) =>
    new Map(list.map((item) => [item.id, item]));
  const looks = by(catalog.looks);
  const looksBySlug = new Map(catalog.looks.map((look) => [look.slug, look]));
  const looksByRevision = new Map(
    catalog.looks.map((look) => [look.revisionId, look]),
  );
  const experts = by(catalog.experts);
  const expertsBySlug = new Map(catalog.experts.map((e) => [e.slug, e]));
  const brands = by(catalog.brands);
  const products = by(catalog.products);
  const variants = by(catalog.variants);
  const retailers = by(catalog.retailers);
  const capabilities = new Map(
    catalog.tryOnCapabilities.map((item) => [item.variantId, item]),
  );

  const variantView = (variantId: string): VariantView | undefined => {
    const variant = variants.get(variantId);
    const product = variant && products.get(variant.productId);
    const brand = product && brands.get(product.brandId);
    if (!variant || !product || !brand) return undefined;
    const offers: OfferView[] = catalog.offers
      .filter((offer) => offer.variantId === variantId)
      .map((offer) => ({
        ...offer,
        retailerName: retailers.get(offer.retailerId)?.name ?? "Retailer",
      }));
    return {
      variant,
      product,
      brand,
      siblings: catalog.variants.filter(
        (item) => item.productId === product.id,
      ),
      offers,
      bestOffer: offers.find(isOfferShoppable),
      capability: capabilities.get(variantId),
    };
  };

  return {
    catalog,
    look: (id: string) => looks.get(id),
    lookBySlug: (slug: string) => looksBySlug.get(slug),
    lookByRevision: (revisionId: string) => looksByRevision.get(revisionId),
    expert: (id: string) => experts.get(id),
    expertBySlug: (slug: string) => expertsBySlug.get(slug),
    looksByExpert: (expertId: string) =>
      catalog.looks.filter((look) => look.expertId === expertId),
    curatedLooks: (expertId: string) =>
      (experts.get(expertId)?.curatedLookIds ?? [])
        .map((id) => looks.get(id))
        .filter((look): look is PublicLook => Boolean(look)),
    variantView,
    lookVariantViews: (look: PublicLook) =>
      look.items
        .map((item) => {
          const view = variantView(item.variantId);
          return view ? { item, view } : undefined;
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    knownIds: () => ({
      lookIds: new Set(looks.keys()),
      variantIds: new Set(variants.keys()),
    }),
  };
}
