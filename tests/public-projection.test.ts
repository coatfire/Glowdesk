import { describe, expect, it } from "vitest";
import { toPublicExpert, toPublicLook, type ExpertProfile, type Look } from "@/core/looks";
import { experts } from "@/data/fixtures/experts";
import { looks } from "@/data/fixtures/looks";
import { getCatalogIndex, getPublicCatalog } from "@/server/public-catalog";

const expert = (id: string) => experts.find((item) => item.id === id)!;
const look = (id: string) => looks.find((item) => item.id === id)!;

describe("public projection", () => {
  it("publishes an approved look by an approved expert", () => {
    const projected = toPublicLook(look("soft-signal"), expert("amara"));
    expect(projected?.revisionId).toBe("soft-signal-r1");
    expect(projected?.disclosure.text).toMatch(/^Ad —/);
  });

  it("hides looks whose author is not approved", () => {
    expect(toPublicLook(look("silver-lining"), expert("celeste"))).toBeNull();
    for (const status of ["applicant", "under_review", "rejected", "suspended"] as const) {
      const author: ExpertProfile = { ...expert("amara"), status };
      expect(toPublicLook(look("soft-signal"), author)).toBeNull();
      expect(toPublicExpert(author)).toBeNull();
    }
  });

  it("never exposes a submitted revision while the approved one stays live", () => {
    const projected = toPublicLook(look("blue-note"), expert("maya-clarke"));
    expect(projected?.revisionId).toBe("blue-note-r1");
    expect(JSON.stringify(projected)).not.toContain("awaiting review");
  });

  it("rejects a pointer to an unapproved revision (no self-approval by pointer)", () => {
    const tampered: Look = { ...look("blue-note"), currentApprovedRevisionId: "blue-note-r2" };
    expect(toPublicLook(tampered, expert("maya-clarke"))).toBeNull();
  });

  it("hides unpublished looks and looks missing attestations or disclosure", () => {
    const base = look("soft-signal");
    const author = expert("amara");
    expect(toPublicLook({ ...base, visibility: "unpublished" }, author)).toBeNull();
    const withRevision = (patch: Partial<Look["revisions"][number]>): Look => ({
      ...base,
      revisions: [{ ...base.revisions[0], ...patch }],
    });
    expect(
      toPublicLook(withRevision({ attestations: { productUse: false, imageRights: true } }), author),
    ).toBeNull();
    expect(
      toPublicLook(
        withRevision({ disclosure: { kinds: ["affiliate"], text: " ", version: "x" } }),
        author,
      ),
    ).toBeNull();
  });

  it("refuses an author from a different tenant", () => {
    expect(toPublicLook(look("soft-signal"), expert("mina"))).toBeNull();
  });

  it("strips private expert fields from the public profile", () => {
    const projected = toPublicExpert(expert("maya-clarke"))!;
    expect(projected).not.toHaveProperty("status");
    expect(projected).not.toHaveProperty("enabledBrandIds");
  });
});

describe("public catalog (what the browser receives)", () => {
  it("contains no non-approved experts, their looks, or unreviewed revisions", async () => {
    const catalog = await getPublicCatalog();
    const serialised = JSON.stringify(catalog);
    expect(catalog.experts.map((item) => item.id)).not.toContain("celeste");
    expect(catalog.looks.map((item) => item.id)).not.toContain("silver-lining");
    expect(serialised).not.toContain("Celeste");
    expect(serialised).not.toContain("blue-note-r2");
    expect(catalog.looks).toHaveLength(7);
  });

  it("keeps shade choices inside the same product", async () => {
    const index = await getCatalogIndex();
    const view = index.variantView("vs-ember")!;
    expect(view.siblings.map((item) => item.id)).toEqual(["vs-ember", "vs-fig-ash"]);
    expect(view.siblings.every((item) => item.productId === view.product.id)).toBe(true);
  });

  it("marks only lips, blush and eyes as previewable, never as calibrated", async () => {
    const index = await getCatalogIndex();
    expect(index.variantView("vs-ember")?.capability?.calibrated).toBe(false);
    expect(index.variantView("btt-12")?.capability).toBeUndefined();
    expect(index.variantView("bc-50")?.capability).toBeUndefined();
  });

  it("only links curated looks that are themselves public", async () => {
    const index = await getCatalogIndex();
    const curated = index.curatedLooks("maya-clarke");
    expect(curated.length).toBeGreaterThan(0);
    expect(curated.every((item) => item.expertId !== "maya-clarke")).toBe(true);
  });
});
