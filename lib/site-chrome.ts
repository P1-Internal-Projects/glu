/**
 * The site chrome: one nav and one footer, for the whole site.
 *
 * This is the single definition. Nav and footer are rendered by the Puck root
 * (components/puck/root.tsx), not placed as blocks on pages, so there is no
 * per-page copy that can drift and nothing for an editor to move, delete or
 * reword. Changing a menu item is a change to this file and it reaches every
 * page in every language at once.
 *
 * Before this existed the chrome was copied onto 71 pages and had already
 * diverged: the home page carried a fifth nav link the other 23 English pages
 * did not, in every language the site published.
 *
 * Hrefs are CANONICAL paths, without a locale prefix. They are localized at
 * render time, so the Spanish nav points at Spanish pages. Storing prefixed
 * hrefs per locale would be one copy of the same destinations per language,
 * which is the drift this module exists to remove — and it was already wrong:
 * every translated page's nav linked back to the English pages.
 */

import { DEFAULT_LOCALE, localizedPath } from "./locales";

export interface NavLink {
  label: string;
  /** Canonical path, no locale prefix. Localized at render. */
  href: string;
}

export interface NavDefinition {
  logoText: string;
  /**
   * Where the wordmark links. Localized like every other destination — a
   * Spanish page whose logo returned to the English home page would drop the
   * reader out of their language on the most-clicked link in the header.
   */
  homeHref: string;
  links: NavLink[];
  ctaLabel: string;
  ctaHref: string;
}

export interface FooterColumn {
  heading: string;
  links: NavLink[];
}

export interface FooterDefinition {
  logoText: string;
  tagline: string;
  columns: FooterColumn[];
  copyright: string;
  socialLinks: { platform: string; href: string }[];
}

/**
 * Social destinations and the wordmark are the same in every language, so they
 * live once here rather than being repeated in each locale's block.
 */
const SOCIAL_LINKS = [
  { platform: "Twitter", href: "#" },
  { platform: "Instagram", href: "#" },
  { platform: "LinkedIn", href: "#" },
  { platform: "YouTube", href: "#" },
];

const LOGO_TEXT = "Grand Lakes University";

const NAV: Record<string, NavDefinition> = {
  "en-US": {
    logoText: LOGO_TEXT,
    homeHref: "/",
    links: [
      { label: "Admissions", href: "/apply" },
      { label: "Academics", href: "/academics" },
      { label: "Cost & Aid", href: "/cost-aid" },
      { label: "Campus Life", href: "/campus-life" },
    ],
    ctaLabel: "Apply Now",
    ctaHref: "/apply",
  },
  "es-US": {
    logoText: LOGO_TEXT,
    homeHref: "/",
    links: [
      { label: "Admisiones", href: "/apply" },
      { label: "Estudios", href: "/academics" },
      { label: "Costo y ayuda financiera", href: "/cost-aid" },
      { label: "Vida universitaria", href: "/campus-life" },
    ],
    ctaLabel: "Solicita tu admisión",
    ctaHref: "/apply",
  },
  "fr-CA": {
    logoText: LOGO_TEXT,
    homeHref: "/",
    links: [
      { label: "Admission", href: "/apply" },
      { label: "Programmes", href: "/academics" },
      { label: "Frais et aide financière", href: "/cost-aid" },
      { label: "Vie sur le campus", href: "/campus-life" },
    ],
    ctaLabel: "Faire une demande",
    ctaHref: "/apply",
  },
};

const FOOTER: Record<string, FooterDefinition> = {
  "en-US": {
    logoText: LOGO_TEXT,
    tagline:
      "Advancing knowledge and enriching lives through excellence in teaching, research, and community engagement since 1887.",
    columns: [
      {
        heading: "Admissions",
        links: [
          { label: "How to Apply", href: "/apply" },
          { label: "Deadlines", href: "/apply" },
          { label: "Requirements", href: "/apply" },
          { label: "Visit Campus", href: "/campus-life" },
        ],
      },
      {
        heading: "Academics",
        links: [
          { label: "Programs & Majors", href: "/academics" },
          { label: "Research", href: "/academics" },
          { label: "Academic Calendar", href: "/academics" },
          { label: "Library", href: "/academics" },
        ],
      },
      {
        heading: "Campus Life",
        links: [
          { label: "Housing", href: "/campus-life" },
          { label: "Dining", href: "/campus-life" },
          { label: "Student Clubs", href: "/campus-life" },
          { label: "Athletics", href: "/campus-life" },
        ],
      },
    ],
    copyright:
      "© 2025 Grand Lakes University. 1887 University Drive, Grand Lakes, Michigan 48901. All rights reserved.",
    socialLinks: SOCIAL_LINKS,
  },
  "es-US": {
    logoText: LOGO_TEXT,
    tagline:
      "Impulsamos el conocimiento y enriquecemos vidas mediante la excelencia en la docencia, la investigación y el compromiso con la comunidad desde 1887.",
    columns: [
      {
        heading: "Admisiones",
        links: [
          { label: "Cómo solicitar admisión", href: "/apply" },
          { label: "Plazos", href: "/apply" },
          { label: "Requisitos", href: "/apply" },
          { label: "Visita el campus", href: "/campus-life" },
        ],
      },
      {
        heading: "Estudios",
        links: [
          { label: "Programas y carreras", href: "/academics" },
          { label: "Investigación", href: "/academics" },
          { label: "Calendario académico", href: "/academics" },
          { label: "Biblioteca", href: "/academics" },
        ],
      },
      {
        heading: "Vida universitaria",
        links: [
          { label: "Alojamiento", href: "/campus-life" },
          { label: "Comedores", href: "/campus-life" },
          { label: "Asociaciones estudiantiles", href: "/campus-life" },
          { label: "Deportes", href: "/campus-life" },
        ],
      },
    ],
    copyright:
      "© 2025 Grand Lakes University. 1887 University Drive, Grand Lakes, Michigan 48901. Todos los derechos reservados.",
    socialLinks: SOCIAL_LINKS,
  },
  "fr-CA": {
    logoText: LOGO_TEXT,
    tagline:
      "Faire progresser le savoir et enrichir les vies par l'excellence en enseignement, en recherche et en engagement communautaire depuis 1887.",
    columns: [
      {
        heading: "Admission",
        links: [
          { label: "Comment faire une demande", href: "/apply" },
          { label: "Dates limites", href: "/apply" },
          { label: "Conditions d'admission", href: "/apply" },
          { label: "Visiter le campus", href: "/campus-life" },
        ],
      },
      {
        heading: "Programmes",
        links: [
          { label: "Programmes et majeures", href: "/academics" },
          { label: "Recherche", href: "/academics" },
          { label: "Calendrier universitaire", href: "/academics" },
          { label: "Bibliothèque", href: "/academics" },
        ],
      },
      {
        heading: "Vie sur le campus",
        links: [
          { label: "Résidences", href: "/campus-life" },
          { label: "Services alimentaires", href: "/campus-life" },
          { label: "Associations étudiantes", href: "/campus-life" },
          { label: "Sports", href: "/campus-life" },
        ],
      },
    ],
    copyright:
      "© 2025 Grand Lakes University. 1887 University Drive, Grand Lakes, Michigan 48901. Tous droits réservés.",
    socialLinks: SOCIAL_LINKS,
  },
};

/** A locale we publish chrome for, falling back to the default. */
function chromeLocale(locale: string | undefined): string {
  return locale && NAV[locale] ? locale : DEFAULT_LOCALE;
}

/** External and in-page destinations pass through; site paths get prefixed. */
function localizeHref(href: string, locale: string): string {
  if (!href.startsWith("/")) return href;
  return localizedPath(href, locale);
}

export function navFor(locale: string | undefined): NavDefinition {
  const tag = chromeLocale(locale);
  const nav = NAV[tag]!;
  return {
    ...nav,
    homeHref: localizedPath("/", tag),
    links: nav.links.map((l) => ({ ...l, href: localizeHref(l.href, tag) })),
    ctaHref: localizeHref(nav.ctaHref, tag),
  };
}

export function footerFor(locale: string | undefined): FooterDefinition {
  const tag = chromeLocale(locale);
  const footer = FOOTER[tag]!;
  return {
    ...footer,
    columns: footer.columns.map((c) => ({
      ...c,
      links: c.links.map((l) => ({ ...l, href: localizeHref(l.href, tag) })),
    })),
  };
}
