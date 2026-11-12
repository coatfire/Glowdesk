"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  createCatalogIndex,
  type CatalogIndex,
  type PublicCatalog,
} from "@/core/public-catalog";
import { EMPTY_SAVED, type SavedAction, type SavedState } from "@/core/saved";
import { VariantSheet } from "@/features/commerce/variant-sheet";
import type { AppMode } from "@/lib/app-mode";
import { createSavedStore } from "@/lib/saved-store";

type SheetTarget = { variantId: string; lookRevisionId?: string };

type AppContextValue = {
  mode: AppMode;
  index: CatalogIndex;
  saved: SavedState;
  /** False until the browser's stored saves have been read. */
  savedHydrated: boolean;
  dispatchSaved: (action: SavedAction) => void;
  notify: (message: string) => void;
  share: (title: string, path: string) => Promise<void>;
  openVariant: (target: SheetTarget) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside <AppProviders>.");
  return value;
}

export function AppProviders({
  mode,
  catalog,
  configuredOrigin,
  children,
}: {
  mode: AppMode;
  catalog: PublicCatalog;
  /** NEXT_PUBLIC_APP_URL origin, or null to use the browser's own origin. */
  configuredOrigin: string | null;
  children: ReactNode;
}) {
  const index = useMemo(() => createCatalogIndex(catalog), [catalog]);
  const [store] = useState(() =>
    createSavedStore(index.knownIds(), () =>
      typeof window === "undefined" ? undefined : window.localStorage,
    ),
  );
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const [toast, setToast] = useState("");
  const [sheet, setSheet] = useState<SheetTarget | null>(null);

  useEffect(() => {
    const onStorage = () => store.refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [store]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const dispatchSaved = useCallback(
    (action: SavedAction) => {
      store.dispatch(action);
      if (store.persistFailed()) {
        setToast("Saved for this tab only — this browser is blocking storage.");
      }
    },
    [store],
  );

  const share = useCallback(
    async (title: string, path: string) => {
      const url = new URL(path, configuredOrigin ?? window.location.origin).toString();
      try {
        if (navigator.share) {
          await navigator.share({ title: `${title} · Glowdesk`, url });
          return;
        }
        await navigator.clipboard.writeText(url);
        setToast("Link copied");
      } catch (error) {
        // The user dismissing the share sheet is not an error worth reporting.
        if (error instanceof DOMException && error.name === "AbortError") return;
        setToast("Couldn't share. Copy the address from your browser instead.");
      }
    },
    [configuredOrigin],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      mode,
      index,
      saved: snapshot ?? EMPTY_SAVED,
      savedHydrated: snapshot !== null,
      dispatchSaved,
      notify: setToast,
      share,
      openVariant: setSheet,
    }),
    [mode, index, snapshot, dispatchSaved, share],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {sheet && (
        <VariantSheet
          variantId={sheet.variantId}
          lookRevisionId={sheet.lookRevisionId}
          onSelectVariant={(variantId) => setSheet({ ...sheet, variantId })}
          onClose={() => setSheet(null)}
        />
      )}
      <div
        className={toast ? "toast toast-visible" : "toast"}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    </AppContext.Provider>
  );
}
