import type { Disclosure } from "@/core/looks";
import type { AppMode } from "@/lib/app-mode";
import { cx } from "@/lib/format";

/**
 * Commercial disclosure. Rendered as real text (never truncated, never
 * image-only) on look cards, look detail, and beside every shop action.
 */
export function DisclosureNote({
  disclosure,
  mode,
  onDark = false,
}: {
  disclosure: Disclosure;
  mode: AppMode;
  onDark?: boolean;
}) {
  return (
    <p className={cx("disclosure", onDark && "disclosure-dark")}>
      <strong>{disclosure.text}</strong>
      {mode === "demo" && (
        <span> Demo: no commission is tracked, earned or paid.</span>
      )}
    </p>
  );
}
