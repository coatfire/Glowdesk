/**
 * Server-side repository for public content. In demo mode this reads the
 * fictional fixtures; Phase 2 replaces the body with Supabase reads of public
 * projections. Callers must go through here rather than importing fixtures.
 */
import { MockTryOnProvider } from "@/adapters/try-on/mock";
import type { PublicCatalog } from "@/core/public-catalog";
import { createCatalogIndex } from "@/core/public-catalog";
import {
  toPublicExpert,
  toPublicLook,
  type PublicExpert,
  type PublicLook,
} from "@/core/looks";
import type { TryOnProvider } from "@/core/try-on";
import {
  brands,
  offers,
  products,
  retailers,
  variants,
} from "@/data/fixtures/catalog";
import { experts } from "@/data/fixtures/experts";
import { looks } from "@/data/fixtures/looks";
import { getAppMode } from "@/lib/app-mode";

/** Provider factory. Fails closed: the mock is only ever returned in demo. */
export function getTryOnProvider(): TryOnProvider {
  const configured = process.env.TRY_ON_PROVIDER ?? "mock";
  if (configured === "mock") {
    if (getAppMode() !== "demo") {
      throw new Error("The mock try-on provider is only available in demo mode.");
    }
    const productById = new Map(products.map((item) => [item.id, item]));
    const variantById = new Map(variants.map((item) => [item.id, item]));
    return new MockTryOnProvider(
      (variantId) =>
        productById.get(variantById.get(variantId)?.productId ?? "")?.category,
    );
  }
  throw new Error(`TRY_ON_PROVIDER "${configured}" has no adapter yet.`);
}

let cached: Promise<PublicCatalog> | undefined;

const EMPTY_CATALOG: PublicCatalog = {
  looks: [],
  experts: [],
  brands: [],
  products: [],
  variants: [],
  retailers: [],
  offers: [],
  tryOnCapabilities: [],
  tryOnProvider: "none",
};

async function build(): Promise<PublicCatalog> {
  // Fixtures are demo-only. Pilot has no data source yet, so it serves nothing.
  if (getAppMode() !== "demo") return EMPTY_CATALOG;
  const publicExperts = experts
    .map(toPublicExpert)
    .filter((expert): expert is PublicExpert => Boolean(expert));
  const publicLooks = looks
    .map((look) =>
      toPublicLook(
        look,
        experts.find((expert) => expert.id === look.authorExpertId),
      ),
    )
    .filter((look): look is PublicLook => Boolean(look));
  const visibleLookIds = new Set(publicLooks.map((look) => look.id));
  const provider = getTryOnProvider();
  return {
    looks: publicLooks,
    experts: publicExperts.map((expert) => ({
      ...expert,
      curatedLookIds: expert.curatedLookIds.filter((id) => visibleLookIds.has(id)),
    })),
    brands,
    products,
    variants,
    retailers,
    offers: offers.filter((offer) => offer.status === "active"),
    tryOnCapabilities: await provider.getCapabilities(variants.map((v) => v.id)),
    tryOnProvider: provider.name,
  };
}

export function getPublicCatalog(): Promise<PublicCatalog> {
  cached ??= build();
  return cached;
}

export async function getCatalogIndex() {
  return createCatalogIndex(await getPublicCatalog());
}
