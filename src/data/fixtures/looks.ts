/**
 * FICTIONAL looks with immutable revisions. Attestations and review outcomes
 * are fixture values, not evidence that any real review took place.
 */
import type { Disclosure, Look, LookItem, LookRevision } from "@/core/looks";

export const AFFILIATE_DISCLOSURE: Disclosure = {
  kinds: ["affiliate"],
  text: "Ad — the creator and Glowdesk may earn commission if you buy.",
  version: "candidate-1",
};

const GIFTED_DISCLOSURE: Disclosure = {
  kinds: ["affiliate", "gifted"],
  text: "Ad — includes a gifted product. The creator and Glowdesk may earn commission if you buy.",
  version: "candidate-1",
};

type Seed = {
  id: string;
  tenantId: string;
  authorExpertId: string;
  title: string;
  description: string;
  occasion: string;
  coverImage: string;
  accentColor: string;
  steps: string[];
  items: Array<[variantId: string, note: string]>;
  disclosure?: Disclosure;
};

const seeds: Seed[] = [
  {
    id: "soft-signal",
    tenantId: "tenant-amara",
    authorExpertId: "amara",
    title: "Soft Signal",
    description: "Diffused berry, brushed brows, and skin that still looks like yours.",
    occasion: "Evening",
    coverImage: "/images/look-afro.jpg",
    accentColor: "#9f334b",
    steps: [
      "Press a thin layer of tint into the centre of the face and blend outwards.",
      "Tap the cheek stick high on the cheekbone and diffuse towards the temple.",
      "Apply lip colour to the centre of the lips, then blur the edge with a fingertip.",
    ],
    items: [
      ["btt-22", "One pump, pressed in with fingers. Skip where you don't need it."],
      ["as-night-plum", "Two taps per cheek, blended upwards."],
      ["vs-ember", "Centre of the lips first; blur outwards."],
    ],
  },
  {
    id: "star-skin",
    tenantId: "tenant-ines",
    authorExpertId: "ines",
    title: "Star Skin",
    description: "Tiny constellations, untouched freckles, and a wash of candlelit gold.",
    occasion: "Editorial",
    coverImage: "/images/look-starlight.jpg",
    accentColor: "#d39b63",
    steps: [
      "Leave skin bare where freckles show; balm only on the high points.",
      "Press shimmer onto the centre of the lid and the inner corner.",
      "Finish with one swipe of satin lip colour.",
    ],
    items: [
      ["dp-moon-milk", "Cheekbones, bridge of the nose, cupid's bow."],
      ["lc-molten-tea", "Pressed on with a fingertip, not swept."],
      ["ssl-rosewood", "One swipe, no liner."],
    ],
  },
  {
    id: "electric-hour",
    tenantId: "tenant-mina",
    authorExpertId: "mina",
    title: "Electric Hour",
    description: "A neon-night eye made wearable with quiet skin and a rosewood lip.",
    occasion: "Bold",
    coverImage: "/images/look-neon.jpg",
    accentColor: "#5951da",
    steps: [
      "Keep the base sheer so the eye stays the only statement.",
      "Draw liquid shadow along the upper lash line and smudge outwards before it sets.",
      "Balance with a quiet lip.",
    ],
    items: [
      ["btt-12", "Half a pump, centre of the face only."],
      ["ci-afterimage", "Work one eye at a time; it sets quickly."],
      ["ssl-rosewood", "Blot once after applying."],
    ],
  },
  {
    id: "heirloom-light",
    tenantId: "tenant-zara",
    authorExpertId: "zara",
    title: "Heirloom Light",
    description: "Polished copper, ceremonial colour, and luminosity built in fine layers.",
    occasion: "Bridal",
    coverImage: "/images/look-indian.jpg",
    accentColor: "#c47b42",
    steps: [
      "Build copper shimmer across the lid in two thin layers.",
      "Blend cream blush from the apple of the cheek up towards the ear.",
      "Add balm highlight last, only where light naturally lands.",
    ],
    items: [
      ["lc-molten-tea", "Two thin layers rather than one heavy one."],
      ["cf-guava-hour", "Warm it on the back of the hand first."],
      ["dp-moon-milk", "A touch on cheekbones after everything else."],
    ],
    disclosure: GIFTED_DISCLOSURE,
  },
  {
    id: "bare-focus",
    tenantId: "tenant-ines",
    authorExpertId: "ines",
    title: "Bare Focus",
    description: "Freckles forward. Tonal warmth and a soft, rested-looking finish.",
    occasion: "Natural",
    coverImage: "/images/look-freckled.jpg",
    accentColor: "#b6684f",
    steps: [
      "Spot-apply tint only where you want evening out.",
      "Tap blush across the cheeks and lightly over the nose.",
      "Press lip colour on with a finger for a stained finish.",
    ],
    items: [
      ["btt-12", "Spot-apply; leave freckles uncovered."],
      ["cf-guava-hour", "Across cheeks and the bridge of the nose."],
      ["ssl-rosewood", "Pressed on with a fingertip."],
    ],
  },
  {
    id: "blue-note",
    tenantId: "tenant-maya",
    authorExpertId: "maya-clarke",
    title: "Blue Note",
    description: "A graphic midnight eye softened by luminous cheeks and a glassy nude lip.",
    occasion: "Editorial",
    coverImage: "/images/look-sudan.jpg",
    accentColor: "#4d62b7",
    steps: [
      "Map the eye shape with liquid shadow, then soften the outer edge.",
      "Keep cheeks luminous with balm rather than powder.",
      "Finish with a sheer nude lip so the eye stays in focus.",
    ],
    items: [
      ["ci-afterimage", "Outer two-thirds of the lid, winged slightly."],
      ["dp-moon-milk", "Tops of the cheekbones only."],
      ["lv-bare-petal", "One coat for a glassy finish."],
    ],
  },
  {
    id: "new-romantic",
    tenantId: "tenant-zara",
    authorExpertId: "zara",
    title: "New Romantic",
    description: "Petal tones, soft-focus skin, and bridal beauty without the rulebook.",
    occasion: "Bridal",
    coverImage: "/images/look-jewel.jpg",
    accentColor: "#d9858f",
    steps: [
      "Blend peony blush high on the cheeks for a lifted flush.",
      "Wash rose shimmer over the whole lid.",
      "Stain the lips with two sheer coats.",
    ],
    items: [
      ["cf-soft-peony", "High on the cheek, blended towards the temple."],
      ["lc-rose-quartz", "A sheer wash; no hard edges."],
      ["lv-orchid-jam", "Two sheer coats, blotted between."],
    ],
  },
  {
    // Authored by an expert still under review ⇒ must never be public.
    id: "silver-lining",
    tenantId: "tenant-celeste",
    authorExpertId: "celeste",
    title: "Silver Lining",
    description: "Statement frames, saturated colour, and absolutely no age limit.",
    occasion: "Bold",
    coverImage: "/images/look-senior.jpg",
    accentColor: "#7359a7",
    steps: ["Stain the lips.", "Add balm highlight.", "Line the eyes with colour."],
    items: [
      ["lv-orchid-jam", "Two coats."],
      ["dp-moon-milk", "Cheekbones."],
      ["ci-afterimage", "Upper lash line."],
    ],
  },
];

const toItems = (items: Seed["items"]): LookItem[] =>
  items.map(([variantId, applicationNote], index) => ({
    variantId,
    applicationOrder: index + 1,
    applicationNote,
  }));

function approvedRevision(seed: Seed): LookRevision {
  return {
    id: `${seed.id}-r1`,
    lookId: seed.id,
    version: 1,
    status: "approved",
    title: seed.title,
    description: seed.description,
    occasion: seed.occasion,
    coverImage: seed.coverImage,
    accentColor: seed.accentColor,
    steps: seed.steps,
    items: toItems(seed.items),
    disclosure: seed.disclosure ?? AFFILIATE_DISCLOSURE,
    attestations: { productUse: true, imageRights: true },
  };
}

export const looks: Look[] = seeds.map((seed) => {
  const approved = approvedRevision(seed);
  const revisions = [approved];
  if (seed.id === "blue-note") {
    // An unreviewed edit: stays private while r1 remains live.
    revisions.push({
      ...approved,
      id: "blue-note-r2",
      version: 2,
      status: "submitted",
      title: "Blue Note (edited)",
      items: toItems([
        ["ci-afterimage", "Outer two-thirds of the lid."],
        ["dp-moon-milk", "Tops of the cheekbones only."],
        ["lv-orchid-jam", "Swapped shade — awaiting review."],
      ]),
    });
  }
  return {
    id: seed.id,
    tenantId: seed.tenantId,
    authorExpertId: seed.authorExpertId,
    slug: seed.id,
    currentApprovedRevisionId: approved.id,
    visibility: "published",
    revisions,
  };
});
