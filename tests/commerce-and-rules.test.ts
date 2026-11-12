import { afterEach, describe, expect, it, vi } from "vitest";
import { validateBriefDraft, type BriefDraft } from "@/core/briefs";
import { estimateLookTotal, isOfferShoppable, type RetailerOffer } from "@/core/catalog";
import { getAppMode, pilotBlockers } from "@/lib/app-mode";
import { formatMoney } from "@/lib/format";
import { absoluteUrl, paths, safeReturnPath } from "@/lib/urls";
import { getTryOnProvider } from "@/server/public-catalog";

const offer = (patch: Partial<RetailerOffer> & { variantId: string }): RetailerOffer => ({
  id: `o-${patch.variantId}`,
  retailerId: "r",
  market: "GB",
  price: { amountMinor: 1000, currency: "GBP" },
  stock: "in_stock",
  checkedAt: "2026-11-03",
  status: "active",
  ...patch,
});

afterEach(() => vi.unstubAllEnvs());

describe("offers and totals", () => {
  it("treats out-of-stock and non-active offers as not shoppable", () => {
    expect(isOfferShoppable(offer({ variantId: "a" }))).toBe(true);
    expect(isOfferShoppable(offer({ variantId: "a", stock: "unknown" }))).toBe(true);
    expect(isOfferShoppable(offer({ variantId: "a", stock: "out_of_stock" }))).toBe(false);
    expect(isOfferShoppable(offer({ variantId: "a", status: "paused" }))).toBe(false);
  });

  it("totals only shoppable offers and reports exclusions and the oldest check date", () => {
    const offers: Record<string, RetailerOffer | undefined> = {
      a: offer({ variantId: "a", price: { amountMinor: 2400, currency: "GBP" } }),
      b: offer({ variantId: "b", checkedAt: "2026-10-01", price: { amountMinor: 3150, currency: "GBP" } }),
      c: offer({ variantId: "c", stock: "out_of_stock" }),
    };
    const total = estimateLookTotal(["a", "b", "c", "d"], (id) => offers[id]);
    expect(total).toEqual({
      kind: "estimate",
      total: { amountMinor: 5550, currency: "GBP" },
      includedOfferIds: ["o-a", "o-b"],
      excludedVariantIds: ["c", "d"],
      checkedAt: "2026-10-01",
    });
    expect(formatMoney({ amountMinor: 5550, currency: "GBP" })).toBe("£55.50");
  });

  it("refuses to add up different currencies or invent a total from nothing", () => {
    const mixed: Record<string, RetailerOffer> = {
      a: offer({ variantId: "a" }),
      b: offer({ variantId: "b", price: { amountMinor: 1000, currency: "USD" } }),
    };
    expect(estimateLookTotal(["a", "b"], (id) => mixed[id]).kind).toBe("unavailable");
    expect(estimateLookTotal(["x"], () => undefined).kind).toBe("unavailable");
  });
});

describe("brief validation", () => {
  const context = { serviceIds: ["bridal"], today: "2026-11-12" };
  const valid: BriefDraft = {
    recipientExpertId: "maya-clarke",
    serviceId: "bridal",
    lookRevisionIds: ["soft-signal-r1"],
    variantIds: [],
    notes: "",
    consents: { shareWithRecipient: true },
  };

  it("accepts a complete draft", () => {
    expect(validateBriefDraft(valid, context)).toEqual([]);
  });

  it("requires recipient, a real service, items and consent", () => {
    expect(
      validateBriefDraft(
        {
          ...valid,
          recipientExpertId: "",
          serviceId: "not-offered",
          lookRevisionIds: [],
          consents: { shareWithRecipient: false },
        },
        context,
      ),
    ).toEqual(["RECIPIENT_REQUIRED", "SERVICE_REQUIRED", "ITEMS_REQUIRED", "CONSENT_REQUIRED"]);
  });

  it("rejects past or malformed dates and over-long notes", () => {
    expect(validateBriefDraft({ ...valid, preferredDate: "2026-11-11" }, context)).toEqual(["DATE_INVALID"]);
    expect(validateBriefDraft({ ...valid, preferredDate: "soon" }, context)).toEqual(["DATE_INVALID"]);
    expect(validateBriefDraft({ ...valid, preferredDate: "2026-11-12" }, context)).toEqual([]);
    expect(validateBriefDraft({ ...valid, notes: "x".repeat(1201) }, context)).toEqual(["NOTES_TOO_LONG"]);
  });
});

describe("urls", () => {
  it("builds canonical share URLs from the configured origin only", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://glowdesk.example/some/path?x=1");
    expect(absoluteUrl(paths.look("soft-signal"))).toBe("https://glowdesk.example/looks/soft-signal");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "javascript:alert(1)");
    expect(absoluteUrl("/")).toBe("http://localhost:3000/");
  });

  it("keeps try-on links to ids only", () => {
    expect(paths.tryOn("blue-note", "blue-note-r1")).toBe("/try-on?look=blue-note&revision=blue-note-r1");
  });

  it.each([
    ["/saved?tab=looks#x", "/saved?tab=looks#x"],
    ["https://evil.example/", "/"],
    ["//evil.example/", "/"],
    ["/\\evil.example", "/"],
    ["javascript:alert(1)", "/"],
    ["", "/"],
    [null, "/"],
  ])("safeReturnPath(%j) → %j", (input, expected) => {
    expect(safeReturnPath(input)).toBe(expected);
  });
});

describe("app mode", () => {
  it("defaults to demo and rejects unknown values", () => {
    vi.stubEnv("APP_MODE", "");
    expect(getAppMode()).toBe("demo");
    vi.stubEnv("APP_MODE", "production");
    expect(() => getAppMode()).toThrow(/demo.*pilot/);
  });

  it("fails closed in pilot: blockers are listed and the mock provider is refused", () => {
    vi.stubEnv("APP_MODE", "pilot");
    expect(getAppMode()).toBe("pilot");
    expect(pilotBlockers().length).toBeGreaterThan(0);
    expect(() => getTryOnProvider()).toThrow(/demo mode/);
  });
});
