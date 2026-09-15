/**
 * Points a translated page's in-body links at the translated pages.
 *
 * `mode: "copy"` seeds a locale version with the canonical's props, hrefs
 * included, and the translation pass only rewrites wording — a prop named
 * `href` is never prose. The result reads as translated and behaves as English:
 * a Spanish page whose breadcrumb says "Inicio" sends the reader to the English
 * home page. That is the same fault the wordmark had before lib/site-chrome.ts
 * localized it, except it lives in page content rather than in the chrome.
 *
 * Only rewrites a link whose localized target is actually published. A page
 * that exists in English and not in this language keeps its English href: the
 * reader reaches a real page and can see it is not translated, which is better
 * than a localized URL that the fallback quietly answers in English.
 *
 * Fragments and query strings are preserved — `/campus-life#dining` is a link
 * to a section of a page that does have a translation.
 *
 * Idempotent, and republishes only what was already published.
 *
 *   node scripts/localize-internal-links.mjs          # report, change nothing
 *   node scripts/localize-internal-links.mjs --apply
 */
import { api, mainBranchId, assertNobodyEditing, S } from "./p1-admin.mjs";

/** Locale tag to URL prefix, matching lib/locales.ts. */
const PREFIX = { "es-US": "es" };

/**
 * Props that hold a destination, taken from the component configs rather than
 * guessed — the first version of this list invented `secondaryHref` and missed
 * `primaryCtaHref`, which left the "Start Your Application" button on every
 * Spanish page pointing at the English form.
 *
 *   grep -rhoE "^\\s+\\w*([Hh]ref|[Uu]rl)\\w*\\s*:\\s*\\{\\s*type:" components/puck/
 *
 * `imageUrl`, `photoUrl` and `backgroundImageUrl` are image sources and must
 * never be prefixed. A bare `url` key is excluded deliberately: it is the URL
 * inside a p1-media value, not a link.
 */
const HREF_KEYS = new Set([
  "href",
  "ctaHref",
  "primaryCtaHref",
  "secondaryCtaHref",
  "loggedInCtaHref",
  "linkHref",
  "registrationUrl",
]);

const APPLY = process.argv.includes("--apply");

/** `/visit/open-house#map` -> { bare: "/visit/open-house", suffix: "#map" } */
function splitHref(href) {
  const i = href.search(/[#?]/);
  return i === -1 ? { bare: href, suffix: "" } : { bare: href.slice(0, i), suffix: href.slice(i) };
}

/** The document path a public path maps to, without its leading slash. */
const docPath = (p) => (p === "/" ? "/" : p.replace(/^\/+/, ""));

function rewrite(node, prefix, published, stats) {
  if (Array.isArray(node)) {
    node.forEach((n) => rewrite(n, prefix, published, stats));
    return;
  }
  if (!node || typeof node !== "object") return;

  for (const [key, value] of Object.entries(node)) {
    if (!HREF_KEYS.has(key) || typeof value !== "string") {
      rewrite(value, prefix, published, stats);
      continue;
    }
    // Site-relative only: external, mailto and in-page links are destinations
    // of their own and carry no language.
    if (!value.startsWith("/")) continue;
    if (value === `/${prefix}` || value.startsWith(`/${prefix}/`)) {
      stats.alreadyLocalized++;
      continue;
    }

    const { bare, suffix } = splitHref(value);
    const target = docPath(bare) === "/" ? prefix : `${prefix}/${docPath(bare)}`;
    if (!published.has(target)) {
      stats.noTranslation.set(value, (stats.noTranslation.get(value) ?? 0) + 1);
      continue;
    }
    node[key] = `/${target}${suffix}`;
    stats.rewritten++;
  }
}

async function main() {
  const branchId = await mainBranchId();
  if (APPLY) await assertNobodyEditing(branchId);
  const { documents } = await api(`/api/sites/${S}/branches/${branchId}/documents`);
  const published = new Set(documents.filter((d) => d.isPublished).map((d) => d.path));

  let touched = 0;
  const stats = { rewritten: 0, alreadyLocalized: 0, noTranslation: new Map() };

  for (const prefix of Object.values(PREFIX)) {
    const pages = documents
      .filter((d) => d.path === prefix || d.path.startsWith(`${prefix}/`))
      .sort((a, b) => a.path.localeCompare(b.path));

    for (const doc of pages) {
      const v = await api(
        `/api/sites/${S}/branches/${branchId}/documents/${doc.id}/versions/latest`,
      ).catch(() => null);
      const snapshot = v?.version?.snapshot ?? v?.snapshot;
      if (!snapshot) {
        console.log(`  ${doc.path}: no readable version, skipped`);
        continue;
      }

      const before = stats.rewritten;
      rewrite(snapshot.content ?? [], prefix, published, stats);
      rewrite(snapshot.zones ?? {}, prefix, published, stats);
      const changed = stats.rewritten - before;
      if (changed === 0) continue;

      if (APPLY) {
        await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/versions`, {
          method: "POST",
          body: JSON.stringify({ snapshot }),
        });
        if (doc.isPublished) {
          await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/publish`, {
            method: "POST",
          });
        }
      }
      touched++;
      console.log(`  ${doc.path.padEnd(38)} ${changed} link${changed === 1 ? "" : "s"}`);
    }
  }

  console.log(
    `\n${stats.rewritten} links on ${touched} pages${APPLY ? " rewritten" : " would be rewritten (dry run)"}` +
      `; ${stats.alreadyLocalized} already localized`,
  );
  if (stats.noTranslation.size) {
    console.log(`\nLeft as-is — no published page at the localized path:`);
    for (const [href, n] of [...stats.noTranslation].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${href.padEnd(32)} x${n}`);
    }
  }
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
