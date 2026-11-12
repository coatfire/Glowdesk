/**
 * FICTIONAL demo catalog. No brand, product, retailer, price or stock state
 * here is real. Prices are GBP minor units; GBP is a fixture choice, not a
 * confirmed launch market.
 */
import type {
  Brand,
  Product,
  ProductCategory,
  ProductVariant,
  Retailer,
  RetailerOffer,
  StockState,
} from "@/core/catalog";

export const FIXTURE_CHECKED_AT = "2026-11-03";

export const brands: Brand[] = [
  { id: "serein", name: "Serein" },
  { id: "morrow", name: "Morrow" },
  { id: "morrow-lab", name: "Morrow Lab" },
  { id: "onda", name: "Onda" },
  { id: "vela", name: "Vela" },
  { id: "common-ground", name: "Common Ground" },
];

type Seed = {
  id: string;
  brandId: string;
  name: string;
  category: ProductCategory;
  priceMinor: number;
  size: string;
  description: string;
  finishNote: string;
  variants: Array<[id: string, shadeName: string, swatchColor: string]>;
};

const seeds: Seed[] = [
  {
    id: "velvet-signal",
    brandId: "serein",
    name: "Velvet Signal",
    category: "lips",
    priceMinor: 2400,
    size: "3.5 g",
    description: "A blurred, soft-matte lip colour with a diffused editorial finish.",
    finishNote: "Soft matte with a petal-soft edge.",
    variants: [
      ["vs-ember", "Ember", "#a8353d"],
      ["vs-fig-ash", "Fig Ash", "#7d4a4f"],
    ],
  },
  {
    id: "lip-veil",
    brandId: "morrow",
    name: "Lip Veil",
    category: "lips",
    priceMinor: 2100,
    size: "4 ml",
    description: "A buildable balm-gloss that leaves a translucent stain.",
    finishNote: "Sheer, cushiony and non-sticky.",
    variants: [
      ["lv-orchid-jam", "Orchid Jam", "#7f365e"],
      ["lv-bare-petal", "Bare Petal", "#c98a8f"],
    ],
  },
  {
    id: "second-skin-lip",
    brandId: "onda",
    name: "Second Skin Lip",
    category: "lips",
    priceMinor: 2600,
    size: "3 g",
    description: "A satin lip colour balanced between warm rose and soft brown.",
    finishNote: "Satin; wears down evenly.",
    variants: [
      ["ssl-rosewood", "Rosewood", "#9c625b"],
      ["ssl-toffee", "Toffee", "#8a5a44"],
    ],
  },
  {
    id: "cloud-flush",
    brandId: "morrow",
    name: "Cloud Flush",
    category: "blush",
    priceMinor: 2800,
    size: "12 g",
    description: "A whipped cream blush that melts into skin without masking texture.",
    finishNote: "Cream with a skin-like sheen.",
    variants: [
      ["cf-guava-hour", "Guava Hour", "#ee766d"],
      ["cf-soft-peony", "Soft Peony", "#e59aa6"],
    ],
  },
  {
    id: "afterglow-stick",
    brandId: "serein",
    name: "Afterglow Stick",
    category: "blush",
    priceMinor: 3100,
    size: "6 g",
    description: "A richly toned cheek stick that sheers out to a soft flush.",
    finishNote: "Buildable stick; sheers out when blended.",
    variants: [["as-night-plum", "Night Plum", "#743f58"]],
  },
  {
    id: "chromatic-ink",
    brandId: "vela",
    name: "Chromatic Ink",
    category: "eyes",
    priceMinor: 2300,
    size: "5 ml",
    description: "A long-wear liquid shadow with a soft metallic shift.",
    finishNote: "Metallic; blends before it sets.",
    variants: [
      ["ci-afterimage", "Afterimage", "#5450a4"],
      ["ci-deep-tide", "Deep Tide", "#2f5d6e"],
    ],
  },
  {
    id: "lightcatcher",
    brandId: "onda",
    name: "Lightcatcher",
    category: "eyes",
    priceMinor: 2900,
    size: "2 g",
    description: "A finely milled cream-to-powder shimmer for lids and inner corners.",
    finishNote: "Shimmer without visible glitter.",
    variants: [
      ["lc-molten-tea", "Molten Tea", "#b56c45"],
      ["lc-rose-quartz", "Rose Quartz", "#c9978f"],
    ],
  },
  {
    id: "barely-there-tint",
    brandId: "onda",
    name: "Barely There Tint",
    category: "complexion",
    priceMinor: 3800,
    size: "30 ml",
    description: "A flexible skin tint with light coverage and a radiant finish.",
    finishNote: "Light coverage; real skin stays visible.",
    variants: [
      ["btt-12", "12 Medium Neutral", "#c99a78"],
      ["btt-18", "18 Tan Warm", "#b7795c"],
      ["btt-22", "22 Deep Golden", "#7a4a30"],
    ],
  },
  {
    id: "dew-point",
    brandId: "vela",
    name: "Dew Point",
    category: "complexion",
    priceMinor: 3300,
    size: "8 g",
    description: "A translucent highlighting balm with no glitter particles.",
    finishNote: "Soft-focus gleam on high points.",
    variants: [["dp-moon-milk", "Moon Milk", "#e8cbbd"]],
  },
  {
    id: "barrier-cloud",
    brandId: "common-ground",
    name: "Barrier Cloud",
    category: "skincare",
    priceMinor: 3400,
    size: "50 ml",
    description: "A comforting moisturiser with ceramides and squalane.",
    finishNote: "Cushioned, supple-looking finish.",
    variants: [["bc-50", "Fragrance-free", "#d8e3d7"]],
  },
  {
    id: "morning-current",
    brandId: "common-ground",
    name: "Morning Current",
    category: "skincare",
    priceMinor: 3900,
    size: "30 ml",
    description: "A lightweight vitamin C serum.",
    finishNote: "Lightweight daytime serum.",
    variants: [["mc-30", "15% vitamin C", "#f2bd69"]],
  },
  {
    id: "quiet-water",
    brandId: "morrow-lab",
    name: "Quiet Water",
    category: "skincare",
    priceMinor: 2900,
    size: "100 ml",
    description: "A weightless hydrating essence.",
    finishNote: "Milky essence texture.",
    variants: [["qw-100", "Milky essence", "#b9d5db"]],
  },
  {
    id: "night-rhythm",
    brandId: "morrow-lab",
    name: "Night Rhythm",
    category: "skincare",
    priceMinor: 4400,
    size: "30 ml",
    description: "An evening serum for experienced vitamin A users.",
    finishNote: "Evening serum.",
    variants: [["nr-30", "0.1% retinal", "#536174"]],
  },
];

export const products: Product[] = seeds.map(
  ({ id, brandId, name, category, description, finishNote }) => ({
    id,
    brandId,
    name,
    category,
    description,
    finishNote,
  }),
);

export const variants: ProductVariant[] = seeds.flatMap((seed) =>
  seed.variants.map(([id, shadeName, swatchColor]) => ({
    id,
    productId: seed.id,
    sku: `DEMO-${id.toUpperCase()}`,
    shadeName,
    swatchColor,
    size: seed.size,
  })),
);

export const retailers: Retailer[] = [
  { id: "hartwell", name: "Hartwell Beauty" },
  { id: "coda", name: "Coda & Vale" },
];

/** Deliberate edge cases so unavailable/stale states are exercised. */
const stockOverrides: Record<string, StockState> = {
  "as-night-plum:hartwell": "out_of_stock",
  "dp-moon-milk:hartwell": "out_of_stock",
  "lc-rose-quartz:hartwell": "unknown",
};
/** Variants with no authorised offer at all. */
const noOffers = new Set(["ssl-toffee"]);
/** Variants that also have a second-retailer offer. */
const secondRetailer = new Set([
  "vs-ember",
  "as-night-plum",
  "cf-guava-hour",
  "ci-afterimage",
  "btt-18",
  "lc-molten-tea",
]);

export const offers: RetailerOffer[] = seeds.flatMap((seed) =>
  seed.variants.flatMap(([variantId]) => {
    if (noOffers.has(variantId)) return [];
    const make = (retailerId: string, extraMinor: number): RetailerOffer => ({
      id: `offer-${variantId}-${retailerId}`,
      variantId,
      retailerId,
      market: "GB",
      price: { amountMinor: seed.priceMinor + extraMinor, currency: "GBP" },
      stock: stockOverrides[`${variantId}:${retailerId}`] ?? "in_stock",
      checkedAt: FIXTURE_CHECKED_AT,
      status: "active",
    });
    return secondRetailer.has(variantId)
      ? [make("hartwell", 0), make("coda", 150)]
      : [make("hartwell", 0)];
  }),
);
