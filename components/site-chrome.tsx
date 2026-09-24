"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { GLUNavComponent } from "./puck/glu-nav";
import { GLUFooterComponent } from "./puck/glu-footer";
import { navFor, footerFor } from "../lib/site-chrome";
import { DEFAULT_LOCALE, localeByTag, readLocaleFromPath } from "../lib/locales";

/**
 * The page landmarks, wrapped around whatever the page itself renders.
 *
 * This sits in the Puck root rather than in app/layout.tsx on purpose. The root
 * is rendered inside the editor canvas as well as on the published page, so the
 * editor shows the real header and footer instead of a bare content column —
 * and because they are not blocks, there is nothing to select, drag, delete or
 * reword.
 *
 * The landmarks live here rather than in the layout for a second reason: the
 * layout wraps everything in <main>, so a header rendered by a page would sit
 * inside the main landmark. Owning <main> here puts the header and footer
 * outside it, which is what a screen reader expects.
 */

/**
 * Which language to draw the chrome in.
 *
 * The prop wins where the caller knows the answer, which on the published site
 * is always: the route is resolved server-side and passed down, so no hook runs
 * and nothing depends on the URL the browser happens to show.
 *
 * The pathname fallback is for the editor, where the canvas renders a document
 * at `/p1/<path>`. Stripping that prefix is what lets the Spanish page's canvas
 * draw the Spanish nav.
 */
function useChromeLocale(explicit?: string): string {
  const pathname = usePathname();
  if (explicit) return explicit;
  if (!pathname) return DEFAULT_LOCALE;
  const withoutEditor = pathname.replace(/^\/p1(?=\/|$)/, "") || "/";
  return readLocaleFromPath(withoutEditor).locale;
}

export function SiteChrome({
  locale,
  bare = false,
  children,
}: {
  locale?: string;
  /** A full-screen page (Page Layout: Full-screen): no nav, footer or skip link. */
  bare?: boolean;
  children?: React.ReactNode;
}) {
  const tag = useChromeLocale(locale);
  const dir = localeByTag(tag)?.dir ?? "ltr";

  /**
   * `lang` sits here rather than on <html>, which has to stay free of dynamic
   * reads so the published routes can be prerendered. Everything a reader sees
   * is inside this element, so it is the nearest ancestor for all content and
   * assistive technology resolves the page's real language from it.
   */
  if (bare) {
    return (
      <div lang={tag} dir={dir}>
        <main id="main-content">{children}</main>
      </div>
    );
  }

  return (
    <div lang={tag} dir={dir}>
      <a className="glu-skip-link" href="#main-content">
        Skip to main content
      </a>
      <GLUNavComponent {...navFor(tag)} />
      <main id="main-content">{children}</main>
      <GLUFooterComponent {...footerFor(tag)} />
    </div>
  );
}
