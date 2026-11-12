import type { Metadata } from "next";
import { Italiana, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
import { AppProviders } from "@/features/shell/app-providers";
import { AppShell } from "@/features/shell/app-shell";
import { getAppMode, pilotBlockers } from "@/lib/app-mode";
import { appOrigin } from "@/lib/urls";
import { getPublicCatalog } from "@/server/public-catalog";
import "./globals.css";
import "./v2.css";

// Font decision (docs/DECISIONS.md, 2026-11-12): keep the repository's
// Italiana / Instrument Sans system; the hosted mockup's fonts are not mixed in.
const display = Italiana({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(appOrigin()),
  title: {
    default: "Glowdesk — Expert beauty looks with the exact products",
    template: "%s · Glowdesk",
  },
  description:
    "Recreatable beauty looks from experts, with the exact products and shades, application steps, and clear commercial disclosure.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const mode = getAppMode();
  const fonts = `${display.variable} ${body.variable} ${mono.variable} font-body`;

  if (mode === "pilot") {
    // Fail closed: never serve fictional fixtures or mock providers as live.
    return (
      <html lang="en">
        <body className={fonts}>
          <main className="pilot-blocked">
            <h1>Pilot mode is not available yet</h1>
            <p>
              APP_MODE is set to <code>pilot</code>, but the pilot cannot run
              safely until the following are in place:
            </p>
            <ul>
              {pilotBlockers().map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
            <p>
              Set <code>APP_MODE=demo</code> to run the labelled demo with
              fictional data.
            </p>
          </main>
        </body>
      </html>
    );
  }

  const catalog = await getPublicCatalog();
  return (
    <html lang="en">
      <body className={fonts}>
        <AppProviders
          mode={mode}
          catalog={catalog}
          configuredOrigin={process.env.NEXT_PUBLIC_APP_URL ? appOrigin() : null}
        >
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
