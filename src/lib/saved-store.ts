import {
  EMPTY_SAVED,
  LEGACY_STORAGE_KEYS,
  SAVED_STORAGE_KEY,
  parseSavedState,
  savedReducer,
  serializeSavedState,
  type KnownIds,
  type SavedAction,
  type SavedState,
} from "@/core/saved";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * External store for guest-local saves (for useSyncExternalStore).
 * - Every transition goes through the reducer against the latest state, so
 *   two updates in one event can never overwrite each other.
 * - Storage is validated on read and all storage failures are survivable:
 *   state then lives in memory for the tab and `persistFailed()` reports it.
 */
export function createSavedStore(
  known: KnownIds,
  getStorage: () => StorageLike | undefined,
) {
  let state: SavedState | null = null;
  let persistFailed = false;
  const listeners = new Set<() => void>();

  const read = (): SavedState => {
    try {
      const storage = getStorage();
      if (!storage) return EMPTY_SAVED;
      for (const key of LEGACY_STORAGE_KEYS) storage.removeItem(key);
      return parseSavedState(storage.getItem(SAVED_STORAGE_KEY), known);
    } catch {
      persistFailed = true;
      return EMPTY_SAVED;
    }
  };

  const ensure = () => (state ??= read());
  const emit = () => listeners.forEach((listener) => listener());

  return {
    getSnapshot: (): SavedState => ensure(),
    /** Null on the server and during hydration ⇒ "not hydrated yet". */
    getServerSnapshot: (): SavedState | null => null,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispatch(action: SavedAction) {
      const next = savedReducer(ensure(), action);
      if (next === state) return;
      state = next;
      try {
        const storage = getStorage();
        if (!storage) throw new Error("storage unavailable");
        storage.setItem(SAVED_STORAGE_KEY, serializeSavedState(next));
        persistFailed = false;
      } catch {
        persistFailed = true;
      }
      emit();
    },
    /** Re-read after another tab changed storage. */
    refresh() {
      state = read();
      emit();
    },
    persistFailed: () => persistFailed,
  };
}

export type SavedStore = ReturnType<typeof createSavedStore>;
