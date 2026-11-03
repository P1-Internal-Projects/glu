import { Playfair_Display, Inter } from "next/font/google";
import "../design-system/globals.css";

/**
 * The document around every route. The site and the editor are separate root
 * layouts, and both render through this.
 */

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

export function HtmlShell({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  return (
    // The font variables stay on <html>: design-system/globals.css resolves the
    // GLU font tokens at :root, and a wrapper element would put them out of scope
    // there, leaving every face silently falling back.
    <html lang={lang} className={`${playfair.variable} ${inter.variable}`}>
      {/* Puck's canvas-preview iframe copies this document's <body> attributes
          onto its own iframe <body> (@puckeditor/core's CopyHostStyles
          syncAttributes()), so a class/attribute placed directly on <body>
          cannot be used to keep a rule out of the iframe. `.p1-app-shell` is
          a child of <body> instead — Puck's canvas iframe never contains it
          (the iframe only ever renders the Puck root/block tree into its own
          #frame-root, not this layout). See styles.css for the scoped reset
          this enables. */}
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
