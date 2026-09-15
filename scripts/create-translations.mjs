/**
 * Creates a market version of every translatable page, in every configured
 * locale, at a prefixed path (`/es/academics`).
 *
 * The platform's default path is `{canonicalPath}.{locale}`. Passing `path`
 * explicitly opts out of that, which is what gives this site readable URLs and
 * lets the existing catch-all route serve translations with no extra routing.
 * The cost is that a translation's path can no longer be derived from the page
 * and the tag, so the variant list is the authority for what exists — which is
 * why lib/locale-pages.ts reads published paths rather than constructing them.
 *
 * `mode: "copy"` seeds each version with the canonical's wording, slot for slot.
 * A version created here therefore reads as English until it is translated;
 * that is the intended starting state, and the editor reports it as work
 * outstanding rather than as finished.
 *
 * Idempotent: a locale that already has a version is skipped.
 */
import { api, mainBranchId, S } from "./p1-admin.mjs";

const LOCALES = [
  { tag: "es-US", prefix: "es" },
];

/**
 * Pages deliberately left untranslated, with the reason.
 *   star-wars / test-basic-page — scratch pages, not part of the site
 *   articles/* — bodies come from Content Publisher, so the Puck document is
 *     empty and a translation of it would carry no words at all
 */
const SKIP = new Set(["star-wars", "test-basic-page"]);
const SKIP_PREFIXES = ["articles/", "_"];

function translatable(path) {
  if (SKIP.has(path)) return false;
  if (SKIP_PREFIXES.some((p) => path.startsWith(p))) return false;
  if (LOCALES.some((l) => path === l.prefix || path.startsWith(`${l.prefix}/`))) return false;
  return true;
}

async function main() {
  const branchId = await mainBranchId();
  const { documents } = await api(`/api/sites/${S}/branches/${branchId}/documents`);

  const canonicals = documents
    .filter((d) => translatable(d.path))
    .sort((a, b) => a.path.localeCompare(b.path));

  console.log(`${canonicals.length} translatable pages\n`);
  let created = 0;
  let existing = 0;

  for (const doc of canonicals) {
    const { variants } = await api(
      `/api/sites/${S}/branches/${branchId}/documents/${doc.id}/translations`,
    );
    const have = new Set((variants ?? []).map((v) => v.document.locale));

    for (const loc of LOCALES) {
      if (have.has(loc.tag)) {
        existing++;
        continue;
      }
      const canonicalPath = doc.path === "/" ? "" : doc.path;
      const path = canonicalPath ? `${loc.prefix}/${canonicalPath}` : loc.prefix;
      try {
        await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/translations`, {
          method: "POST",
          body: JSON.stringify({ locale: loc.tag, path, mode: "copy" }),
        });
        console.log(`  + ${path}`);
        created++;
      } catch (e) {
        console.log(`  ! ${path}: ${e.message.slice(0, 120)}`);
      }
    }
  }

  console.log(`\ncreated ${created}, already present ${existing}`);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
