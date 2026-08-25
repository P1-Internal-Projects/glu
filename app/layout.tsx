import { Playfair_Display, Inter } from "next/font/google";
import type { Metadata } from "next";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The font variables stay on <html>: design-system/globals.css resolves the
    // GLU font tokens at :root, and a wrapper element would put them out of scope
    // there, leaving every face silently falling back.
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      {/* `.p1-app-shell` must be a direct child of <body>: Puck's canvas iframe
          copies <body> attributes onto its own body, so only a descendant can
          scope a reset out of the canvas. See styles.css. */}
      <body data-rm-theme="light">
        <div className="p1-app-shell">
          <a className="glu-skip-link" href="#main-content">
            Skip to main content
          </a>
          <main id="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
