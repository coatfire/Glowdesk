import { describe, expect, it } from "vitest";
import {
  EMPTY_SAVED,
  SAVED_STORAGE_KEY,
  parseSavedState,
  savedReducer,
  serializeSavedState,
} from "@/core/saved";
import { createSavedStore } from "@/lib/saved-store";

const known = {
  lookIds: new Set(["a", "b"]),
  variantIds: new Set(["v1", "v2"]),
};

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

describe("savedReducer", () => {
  it("saves from try-on in one transition: bookmark and history together", () => {
    const next = savedReducer(EMPTY_SAVED, { type: "saveFromTryOn", lookId: "a" });
    expect(next.lookIds).toEqual(["a"]);
    expect(next.viewedLookIds).toEqual(["a"]);
  });

  it("is idempotent for repeated saves", () => {
    const once = savedReducer(EMPTY_SAVED, { type: "saveFromTryOn", lookId: "a" });
    const twice = savedReducer(once, { type: "saveFromTryOn", lookId: "a" });
    expect(twice.lookIds).toEqual(["a"]);
    expect(savedReducer(once, { type: "saveLook", lookId: "a" })).toBe(once);
  });

  it("toggles and de-duplicates history", () => {
    let state = savedReducer(EMPTY_SAVED, { type: "toggleLook", lookId: "a" });
    state = savedReducer(state, { type: "toggleLook", lookId: "a" });
    expect(state.lookIds).toEqual([]);
    state = savedReducer(state, { type: "recordView", lookId: "a" });
    state = savedReducer(state, { type: "recordView", lookId: "b" });
    state = savedReducer(state, { type: "recordView", lookId: "a" });
    expect(state.viewedLookIds).toEqual(["a", "b"]);
  });
});

describe("parseSavedState", () => {
  it("round-trips valid state", () => {
    const state = { lookIds: ["a"], variantIds: ["v2"], viewedLookIds: ["b", "a"] };
    expect(parseSavedState(serializeSavedState(state), known)).toEqual(state);
  });

  it.each([
    ["null", null],
    ["malformed JSON", "{nope"],
    ["an array", "[]"],
    ["a string", '"x"'],
    ["the legacy unversioned shape", '{"looks":["a"],"products":["v1"],"recent":[]}'],
    ["a future version", '{"version":99,"lookIds":["a"]}'],
  ])("returns empty state for %s", (_label, raw) => {
    expect(parseSavedState(raw, known)).toEqual(EMPTY_SAVED);
  });

  it("drops unknown ids, non-strings, duplicates and wrong-typed fields", () => {
    const raw = JSON.stringify({
      version: 2,
      lookIds: ["a", "ghost", 7, "a", null],
      variantIds: "v1",
      viewedLookIds: [{ id: "a" }, "b"],
    });
    expect(parseSavedState(raw, known)).toEqual({
      lookIds: ["a"],
      variantIds: [],
      viewedLookIds: ["b"],
    });
  });
});

describe("createSavedStore", () => {
  it("applies two dispatches in one tick without losing either", () => {
    const storage = memoryStorage();
    const store = createSavedStore(known, () => storage);
    store.dispatch({ type: "recordView", lookId: "a" });
    store.dispatch({ type: "toggleLook", lookId: "a" });
    expect(store.getSnapshot()).toEqual({
      lookIds: ["a"],
      variantIds: [],
      viewedLookIds: ["a"],
    });
    expect(parseSavedState(storage.getItem(SAVED_STORAGE_KEY), known)).toEqual(
      store.getSnapshot(),
    );
  });

  it("removes legacy keys, including the old fake 'sent' flag", () => {
    const storage = memoryStorage({
      "glowdesk-consultation-sent": "true",
      "glowdesk-saved": '{"looks":["a"]}',
    });
    createSavedStore(known, () => storage).getSnapshot();
    expect([...storage.data.keys()]).toEqual([]);
  });

  it("survives storage that throws, and reports it", () => {
    const store = createSavedStore(known, () => ({
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => undefined,
    }));
    expect(store.getSnapshot()).toEqual(EMPTY_SAVED);
    store.dispatch({ type: "toggleLook", lookId: "a" });
    expect(store.getSnapshot().lookIds).toEqual(["a"]);
    expect(store.persistFailed()).toBe(true);
  });

  it("is unhydrated on the server and notifies subscribers on change", () => {
    const store = createSavedStore(known, () => memoryStorage());
    expect(store.getServerSnapshot()).toBeNull();
    let calls = 0;
    const unsubscribe = store.subscribe(() => calls++);
    store.dispatch({ type: "toggleVariant", variantId: "v1" });
    unsubscribe();
    store.dispatch({ type: "toggleVariant", variantId: "v2" });
    expect(calls).toBe(1);
  });
});
