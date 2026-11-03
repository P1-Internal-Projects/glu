import "../styles.css";
import type { Metadata } from "next";
import { HtmlShell } from "../../components/html-shell";
import { DEFAULT_LOCALE } from "../../lib/locales";
import { published } from "../published-pages";

/**
 * Relative `alternates` are resolved against metadataBase, and Next drops them
 * entirely when it is unset — so the hreflang tags this site emits per locale
 * would silently never ship. The localhost fallback keeps that working in
 * development; production sets NEXT_PUBLIC_SITE_URL to the real origin.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);

// A page-level openGraph replaces (not merges) this one, so buildPageMetadata
// re-declares og:type and the env site-name fallback; this covers routes that
// return no openGraph (e.g. not-found early returns).
export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  openGraph: {
    type: "website",
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
  },
};

/**
 * Root layout for the site: `<html lang>` is the language of the page shown,
 * read from the document the route resolves to. A page with no locale gets the
 * site default.
 *
 * Nothing here may read headers(), cookies() or any other dynamic API. This
 * layout wraps the published catch-all, which Next renders statically — a
 * dynamic read makes that render throw DYNAMIC_SERVER_USAGE and every
 * localized URL returns a 500 in production, while dev looks fine.
 * getDocumentLanguage reads the route params only.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ puckPath?: string[] }>;
}) {
  const lang = (await published.getDocumentLanguage({ params })) ?? DEFAULT_LOCALE;
  return <HtmlShell lang={lang}>{children}</HtmlShell>;
}
