/** Canonical paths and absolute share URLs. Never derived from request hosts. */

export const paths = {
  home: "/",
  look: (slug: string) => `/looks/${encodeURIComponent(slug)}`,
  expert: (slug: string) => `/experts/${encodeURIComponent(slug)}`,
  tryOn: (lookId: string, revisionId: string) =>
    `/try-on?look=${encodeURIComponent(lookId)}&revision=${encodeURIComponent(revisionId)}`,
  saved: "/saved",
  briefs: "/briefs",
  newBrief: (expertId: string) =>
    `/briefs/new?expert=${encodeURIComponent(expertId)}`,
  pro: "/pro",
};

const LOCAL_ORIGIN = "http://localhost:3000";

/** Configured public origin. Only http(s) origins are accepted. */
export function appOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw) return LOCAL_ORIGIN;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return LOCAL_ORIGIN;
    }
    return url.origin;
  } catch {
    return LOCAL_ORIGIN;
  }
}

export function absoluteUrl(path: string): string {
  return new URL(path, appOrigin()).toString();
}

/**
 * Accepts only same-origin relative paths for post-login returns:
 * rejects absolute URLs, protocol-relative URLs and backslash tricks.
 */
export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/")) return paths.home;
  if (value.startsWith("//") || value.includes("\\")) return paths.home;
  try {
    const url = new URL(value, LOCAL_ORIGIN);
    if (url.origin !== LOCAL_ORIGIN) return paths.home;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return paths.home;
  }
}
