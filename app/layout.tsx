import { headers } from "next/headers";
import { Playfair_Display, Inter } from "next/font/google";
import type { Metadata } from "next";
import { DEFAULT_LOCALE, localeByTag } from "../lib/locales";
import { LOCALE_HEADER } from "../middleware";
import "../design-system/globals.css";
import "./styles.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The layout has no pathname, so the locale the middleware already resolved
  // travels on a request header rather than being parsed a second time here.
  const locale = (await headers()).get(LOCALE_HEADER) ?? DEFAULT_LOCALE;
  const dir = localeByTag(locale)?.dir ?? "ltr";

  return (
    // The font variables stay on <html>: design-system/globals.css resolves the
    // GLU font tokens at :root, and a wrapper element would put them out of scope
    // there, leaving every face silently falling back.
    <html lang={locale} dir={dir} className={`${playfair.variable} ${inter.variable}`}>
      {/* `.p1-app-shell` must be a direct child of <body>: Puck's canvas iframe
          copies <body> attributes onto its own body, so only a descendant can
          scope a reset out of the canvas. See styles.css. */}
      <body data-rm-theme="light">
        {/* The skip link, <main> and the page landmarks are rendered by the
            Puck root (components/puck/root.tsx), so that the editor canvas
            shows the same header and footer the visitor gets. Wrapping
            {children} in <main> here would nest the site header inside the
            main landmark. */}
        <div className="p1-app-shell">{children}</div>
      </body>
    </html>
  );
}
