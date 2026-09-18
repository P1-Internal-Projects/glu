/**
 * Flags translations stored outside this site's URL convention.
 *
 * The editor cannot choose a path: puck-css's `createTranslation` sends only
 * `{canonicalDocumentId, locale, mode}`, so a translation created in the UI
 * lands at the backend default `{canonicalPath}.{locale}` (lowercased) instead
 * of under this site's `/{prefix}/` convention. The app serves both — see
 * `findLocalizedDocument` and the middleware — but the prefixed form is the one
 * the nav, switcher and alternates link to, so a suffix page is worth knowing
 * about and renaming at leisure.
 *
 * Reports, and exits non-zero, on two kinds of drift:
 *   1. a locale-tagged document whose path is not under that locale's prefix
 *   2. a document under a locale prefix whose stored tag disagrees
 *
 * Usage: [SOURCE_SITE=<uuid>] [ALL_WORKSTREAMS=1] node scripts/check-locale-paths.mjs
 */
import { readFileSync } from "node:fs";
import { api, S } from "./p1-admin.mjs";

const SITE = process.env.SOURCE_SITE ?? S;

/**
 * The locale table lives in lib/locales.ts, which is TypeScript this script
 * cannot import. Rather than keep a second copy in sync by hand, the entries
 * are read out of that file — and the script refuses to run if it finds none,
 * so a rename there fails loudly instead of silently checking nothing.
 */
function readLocaleTable() {
  const src = readFileSync(new URL("../lib/locales.ts", import.meta.url), "utf8");
  const defaultLocale = /DEFAULT_LOCALE\s*=\s*"([^"]+)"/.exec(src)?.[1];
  const entries = [...src.matchAll(/\{\s*tag:\s*"([^"]+)",\s*prefix:\s*"([^"]*)"/g)].map(
    (m) => ({ tag: m[1], prefix: m[2] }),
  );
  if (!defaultLocale || entries.length === 0) {
    throw new Error("Could not read the locale table from lib/locales.ts — has its shape changed?");
  }
  return { defaultLocale, entries };
}

const { defaultLocale, entries } = readLocaleTable();
const prefixFor = new Map(entries.map((e) => [e.tag.toLowerCase(), e.prefix]));
const tagForPrefix = new Map(entries.filter((e) => e.prefix).map((e) => [e.prefix, e.tag]));

const { branches } = await api(`/api/sites/${SITE}/branches`);
const targets = process.env.ALL_WORKSTREAMS ? branches : branches.filter((b) => b.isMain);

let problems = 0;
for (const b of targets) {
  const { documents } = await api(`/api/sites/${SITE}/branches/${b.id}/documents`);
  const rows = [];

  for (const d of documents) {
    if (d.path.startsWith("_")) continue;
    const tag = d.locale ?? null;
    const head = d.path.split("/")[0];
    const prefixTag = tagForPrefix.get(head) ?? null;

    if (tag && tag !== defaultLocale) {
      const want = prefixFor.get(tag.toLowerCase());
      if (want === undefined) {
        rows.push(`${d.path}  tagged ${tag}, which this site does not configure`);
      } else if (want && head !== want) {
        rows.push(`${d.path}  tagged ${tag}, expected under "${want}/"  (id ${d.id})`);
      }
    } else if (prefixTag) {
      rows.push(`${d.path}  sits under "${head}/" but is tagged ${tag ?? "nothing"}, expected ${prefixTag}`);
    }
  }

  console.log(`${(b.name || "?").padEnd(16)} ${String(documents.length).padStart(3)} docs, ${rows.length} off-convention`);
  for (const r of rows) console.log(`   ${r}`);
  problems += rows.length;
}

if (problems) {
  console.log(
    `\n${problems} document(s) off-convention. To move one under the prefix, rename it — ` +
      `renaming frees the old path, while deleting poisons it. Renaming also cascades to ` +
      `descendants, so do the deepest paths first.`,
  );
} else {
  console.log("\nevery translation is under its locale's prefix");
}
process.exitCode = problems ? 1 : 0;
