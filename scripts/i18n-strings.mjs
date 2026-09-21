/**
 * Extracts and applies the translatable strings of a locale variant.
 *
 * Which props hold language is decided by key, not by guessing at the value: a
 * prop named `href`, `id` or `accentColor` is never wording however much it
 * looks like a word, and translating one silently breaks a link or a colour.
 * Anything not on the allowlist is left exactly as the canonical had it.
 *
 * Usage:
 *   node scripts/i18n-strings.mjs extract <locale>   # dump strings to stdout
 *   node scripts/i18n-strings.mjs apply <file.json>  # write translations back
 */
import { readFileSync } from "node:fs";
import { api, mainBranchId, assertNobodyEditing, S } from "./p1-admin.mjs";

/**
 * Prop keys whose values are natural language.
 *
 * This list is the contract, and a key missing from it is silent: the string is
 * simply never offered for translation, so the page looks translated except for
 * that one button. `primaryCtaLabel`, `secondaryCtaLabel` and `imageAlt` were
 * missing for exactly that reason, which left "Start Your Application" sitting
 * in the middle of every Spanish page.
 *
 * Keep it in step with the component configs, whose field names are the real
 * source:
 *
 *   python3 - <<'EOF'   # top-level keys of every `fields: { ... }` block
 *   import re, pathlib
 *   ...brace-match `fields:` and diff against TEXT_KEYS and NEVER
 *   EOF
 *
 * A single-line grep is not enough — `primaryCtaLabel` is declared across four
 * lines and a line-oriented scan walks straight past it.
 */
const TEXT_KEYS = new Set([
  "title", "heading", "subheading", "eyebrow", "subtext", "text", "label",
  "description", "summary", "tagline", "copyright", "ctaLabel", "body", "bio",
  "role", "focusArea", "territory", "location", "registrationLabel", "quote",
  // Counselor profile fields that are prose, not data. `pronouns` stays as
  // written (a person's pronouns are theirs, not a translation target).
  "languages", "officeLocation", "officeHours", "bookingLabel",
  "attribution", "caption", "answer", "question", "name", "value", "stat",
  "buttonLabel", "linkLabel", "secondaryLabel", "viewAllLabel", "placeholder",
  "alt", "eventType", "logoText", "heading2", "intro", "blurb",
  // Button labels. The href beside each one is a destination, not wording.
  "primaryCtaLabel", "secondaryCtaLabel", "loggedInCtaLabel",
  "loggedInSecondaryLabel",
  // Alt text is read aloud, so it is translated like any other prose.
  "imageAlt",
  // Personalized variants of the blocks above, and the small print under a CTA.
  "loggedInHeading", "loggedInDescription", "loggedInFootnote", "footnote",
  // A degree and cohort, e.g. "Environmental Science, Class of 2025".
  "program",
]);

/**
 * Keys that look textual but must never be translated.
 *
 * Listing a key here skips its whole subtree, so only ever name a leaf. `items`
 * is deliberately absent: it is an array of objects whose own keys hold prose,
 * and excluding it would drop every string inside it.
 *
 * `startDate`, `startTime` and `endTime` are here because translating them is
 * not what they need — "10:00 AM" wants formatting for the locale, which is a
 * rendering decision, not a string swap. Left as data.
 *
 * `itemTitleTemplate` and `itemUrlTemplate` carry `{{ item.x }}` bindings.
 * Translating one would break the binding rather than the wording.
 */
const NEVER = new Set([
  "id", "href", "url", "src", "locale",
  "imageUrl", "photoUrl", "backgroundImageUrl",
  "ctaHref", "primaryCtaHref", "secondaryCtaHref", "loggedInCtaHref",
  "linkHref", "registrationUrl",
  "email", "phone",
  "startDate", "startTime", "endTime",
  "itemTitleTemplate", "itemUrlTemplate",
]);

/** Values that are not prose even when the key says they are. */
function isProse(v) {
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (!s || s.length < 2) return false;
  if (/^(https?:|\/|#|mailto:|data:)/.test(s)) return false;
  if (/^#[0-9a-fA-F]{3,8}$/.test(s)) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  if (/^[\d.,:%\s$€£+-]+$/.test(s)) return false;
  return true;
}

/** Every translatable string in a snapshot, as dot-path -> value. */
export function collect(node, path = "", out = {}) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => collect(v, `${path}.${i}`, out));
    return out;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      const next = path ? `${path}.${k}` : k;
      if (NEVER.has(k)) continue;
      if (typeof v === "string") {
        if (TEXT_KEYS.has(k) && isProse(v)) out[next] = v;
      } else {
        collect(v, next, out);
      }
    }
  }
  return out;
}

function setAt(obj, dotPath, value) {
  const keys = dotPath.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (cur[k] === undefined) return false;
    cur = cur[k];
  }
  const last = keys[keys.length - 1];
  if (cur[last] === undefined) return false;
  cur[last] = value;
  return true;
}

/** URL prefix per market. Mirrors LOCALES in lib/locales.ts. */
const PREFIX = { "es-US": "es" };

async function variantsFor(branchId, locale) {
  const { documents } = await api(`/api/sites/${S}/branches/${branchId}/documents`);
  const prefix = PREFIX[locale];
  if (!prefix) throw new Error(`Unknown locale ${locale}. Known: ${Object.keys(PREFIX).join(", ")}`);
  return documents
    .filter((d) => d.path === prefix || d.path.startsWith(`${prefix}/`))
    .sort((a, b) => a.path.localeCompare(b.path));
}

async function snapshotOf(branchId, id) {
  const v = await api(`/api/sites/${S}/branches/${branchId}/documents/${id}/versions/latest`);
  return v?.version?.snapshot ?? v?.snapshot;
}

async function extract(locale) {
  const branchId = await mainBranchId();
  const docs = await variantsFor(branchId, locale);
  const out = {};
  for (const d of docs) {
    const snap = await snapshotOf(branchId, d.id);
    out[d.path] = collect(snap);
  }
  process.stdout.write(JSON.stringify({ locale, pages: out }, null, 2));
}

async function apply(file) {
  const { locale, pages } = JSON.parse(readFileSync(file, "utf8"));
  const branchId = await mainBranchId();
  await assertNobodyEditing(branchId);
  const { documents } = await api(`/api/sites/${S}/branches/${branchId}/documents`);
  let changed = 0;
  let missed = 0;

  for (const [path, strings] of Object.entries(pages)) {
    const doc = documents.find((d) => d.path === path);
    if (!doc) { console.log(`  ! ${path}: no document`); continue; }
    const snap = await snapshotOf(branchId, doc.id);
    let hits = 0;
    for (const [dotPath, value] of Object.entries(strings)) {
      if (setAt(snap, dotPath, value)) hits++;
      else missed++;
    }
    await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/versions`, {
      method: "POST", body: JSON.stringify({ snapshot: snap }),
    });
    await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/publish`, { method: "POST" });
    console.log(`  ${path}: ${hits} strings`);
    changed++;
  }
  console.log(`\n${locale}: ${changed} pages published${missed ? `, ${missed} paths not found` : ""}`);
}

const [cmd, arg] = process.argv.slice(2);
const run = cmd === "extract" ? extract(arg) : cmd === "apply" ? apply(arg) : Promise.reject(new Error("usage: extract <locale> | apply <file>"));
run.catch((e) => { console.error("FAILED:", e.message); process.exitCode = 1; });
