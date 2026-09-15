/**
 * Removes the per-page nav and footer, everywhere.
 *
 * The site chrome is now rendered once by the Puck root from
 * lib/site-chrome.ts. Until these blocks are gone, every page still carries its
 * own copy, so the canvas would draw two headers and the old copies would keep
 * drifting. This strips them from every document and every template, and clears
 * the pin entries that referenced them.
 *
 * Templates matter as much as pages: a template that still placed a nav would
 * hand a fresh copy to each new page created from it, quietly recreating the
 * problem one page at a time.
 *
 * Idempotent, and it only republishes what was already published — a draft
 * stays a draft rather than being pushed live as a side effect of this change.
 */
import { api, mainBranchId, assertNobodyEditing, S } from "./p1-admin.mjs";

const CHROME = new Set(["GLUNav", "GLUFooter"]);

/** Pin ids the old template shell used, which now point at nothing. */
const CHROME_PINS = ["template-nav", "template-footer"];

function stripChrome(snapshot) {
  const before = (snapshot.content ?? []).length;
  snapshot.content = (snapshot.content ?? []).filter((c) => !CHROME.has(c?.type));

  // Zones can hold blocks too. A nav nested in one is still a second header.
  for (const [zone, items] of Object.entries(snapshot.zones ?? {})) {
    if (Array.isArray(items)) {
      snapshot.zones[zone] = items.filter((c) => !CHROME.has(c?.type));
    }
  }

  let pinsCleared = 0;
  const pinMap = snapshot.root?.props?._pinMap;
  if (pinMap) {
    for (const id of CHROME_PINS) {
      if (id in pinMap) {
        delete pinMap[id];
        pinsCleared++;
      }
    }
  }

  return { removed: before - snapshot.content.length, pinsCleared };
}

async function main() {
  const branchId = await mainBranchId();
  await assertNobodyEditing(branchId);
  const { documents } = await api(`/api/sites/${S}/branches/${branchId}/documents`);

  let touched = 0;
  let blocks = 0;
  let pins = 0;
  const skipped = [];

  for (const doc of documents) {
    const v = await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/versions/latest`)
      .catch(() => null);
    const snapshot = v?.version?.snapshot ?? v?.snapshot;
    if (!snapshot) {
      skipped.push(doc.path);
      continue;
    }

    const { removed, pinsCleared } = stripChrome(snapshot);
    if (removed === 0 && pinsCleared === 0) continue;

    await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/versions`, {
      method: "POST",
      body: JSON.stringify({ snapshot }),
    });
    if (doc.isPublished) {
      await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/publish`, {
        method: "POST",
      });
    }

    touched++;
    blocks += removed;
    pins += pinsCleared;
    const note = [
      removed ? `${removed} block${removed === 1 ? "" : "s"}` : null,
      pinsCleared ? `${pinsCleared} pin${pinsCleared === 1 ? "" : "s"}` : null,
      doc.isPublished ? "republished" : "draft, left unpublished",
    ]
      .filter(Boolean)
      .join(", ");
    console.log(`  ${doc.path}: ${note}`);
  }

  console.log(
    `\n${touched} documents updated; ${blocks} chrome blocks and ${pins} pin entries removed`,
  );
  if (skipped.length) console.log(`no readable version, skipped: ${skipped.join(", ")}`);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
