/**
 * Guest-local saved state: bookmarks and viewing history only.
 * There is deliberately no "captured media" and no "brief sent" flag here —
 * neither exists until real capture and durable briefs are implemented.
 */

export const SAVED_STORAGE_KEY = "glowdesk:saved";
export const SAVED_SCHEMA_VERSION = 2;
/** Pre-V2 keys that stored unvalidated data or a fake "sent" flag. */
export const LEGACY_STORAGE_KEYS = [
  "glowdesk-saved",
  "glowdesk-consultation-sent",
  "glowdesk-onboarding",
];

const MAX_SAVED = 200;
const MAX_HISTORY = 12;

export interface SavedState {
  lookIds: string[];
  variantIds: string[];
  /** Recently viewed looks, newest first. Not captures. */
  viewedLookIds: string[];
}

export const EMPTY_SAVED: SavedState = {
  lookIds: [],
  variantIds: [],
  viewedLookIds: [],
};

export type SavedAction =
  | { type: "hydrate"; state: SavedState }
  | { type: "toggleLook"; lookId: string }
  | { type: "saveLook"; lookId: string }
  | { type: "toggleVariant"; variantId: string }
  | { type: "recordView"; lookId: string }
  /** Single transition for "save from try-on": bookmark + history together. */
  | { type: "saveFromTryOn"; lookId: string };

const prepend = (list: string[], id: string, max: number) =>
  [id, ...list.filter((item) => item !== id)].slice(0, max);

const toggle = (list: string[], id: string) =>
  list.includes(id)
    ? list.filter((item) => item !== id)
    : prepend(list, id, MAX_SAVED);

export function savedReducer(state: SavedState, action: SavedAction): SavedState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "toggleLook":
      return { ...state, lookIds: toggle(state.lookIds, action.lookId) };
    case "saveLook":
      return state.lookIds.includes(action.lookId)
        ? state
        : { ...state, lookIds: prepend(state.lookIds, action.lookId, MAX_SAVED) };
    case "toggleVariant":
      return { ...state, variantIds: toggle(state.variantIds, action.variantId) };
    case "recordView":
      return {
        ...state,
        viewedLookIds: prepend(state.viewedLookIds, action.lookId, MAX_HISTORY),
      };
    case "saveFromTryOn":
      return {
        ...state,
        lookIds: state.lookIds.includes(action.lookId)
          ? state.lookIds
          : prepend(state.lookIds, action.lookId, MAX_SAVED),
        viewedLookIds: prepend(state.viewedLookIds, action.lookId, MAX_HISTORY),
      };
  }
}

export interface KnownIds {
  lookIds: ReadonlySet<string>;
  variantIds: ReadonlySet<string>;
}

function cleanIds(value: unknown, known: ReadonlySet<string>, max: number) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item === "string" && known.has(item)) seen.add(item);
    if (seen.size >= max) break;
  }
  return [...seen];
}

/**
 * Parses untrusted storage text. Unknown versions, malformed JSON, wrong
 * shapes and unrecognised ids all degrade to an empty/filtered state rather
 * than being trusted by cast.
 */
export function parseSavedState(raw: string | null, known: KnownIds): SavedState {
  if (!raw) return EMPTY_SAVED;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY_SAVED;
  }
  if (typeof parsed !== "object" || parsed === null) return EMPTY_SAVED;
  const record = parsed as Record<string, unknown>;
  if (record.version !== SAVED_SCHEMA_VERSION) return EMPTY_SAVED;
  return {
    lookIds: cleanIds(record.lookIds, known.lookIds, MAX_SAVED),
    variantIds: cleanIds(record.variantIds, known.variantIds, MAX_SAVED),
    viewedLookIds: cleanIds(record.viewedLookIds, known.lookIds, MAX_HISTORY),
  };
}

export function serializeSavedState(state: SavedState): string {
  return JSON.stringify({ version: SAVED_SCHEMA_VERSION, ...state });
}
