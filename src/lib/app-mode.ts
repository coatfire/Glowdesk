/**
 * APP_MODE=demo|pilot. Server-evaluated; the result is passed to the client
 * as a prop so no secret-adjacent env var needs a NEXT_PUBLIC_ twin.
 *
 * demo  — fictional fixtures, persistent demo label, every commerce/brief/
 *         booking action is an explicit simulation.
 * pilot — real persistence/providers. None exist yet, so pilot fails closed.
 */

export type AppMode = "demo" | "pilot";

export function getAppMode(): AppMode {
  const raw = (process.env.APP_MODE || "demo").trim().toLowerCase();
  if (raw === "demo" || raw === "pilot") return raw;
  throw new Error(`APP_MODE must be "demo" or "pilot" (received "${raw}").`);
}

/**
 * Requirements the pilot cannot run without. Until Phases 2–4 land, this list
 * is never empty: pilot mode must not serve fixtures as if they were live.
 */
export function pilotBlockers(): string[] {
  const blockers = [
    "Authentication, reviewed migrations and RLS policies are not implemented (Phase 2).",
    "Authorised retailer offers and tracked handoff are not implemented (Phase 3).",
    "Durable private briefs are not implemented (Phase 4).",
  ];
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    blockers.push("NEXT_PUBLIC_APP_URL is not set to the deployed HTTPS origin.");
  }
  const provider = process.env.TRY_ON_PROVIDER ?? "mock";
  if (provider === "mock") {
    blockers.push(
      "TRY_ON_PROVIDER is the mock; pilot must use an approved provider or disable try-on.",
    );
  }
  return blockers;
}
