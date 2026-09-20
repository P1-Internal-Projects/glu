/**
 * Recreates the non-main workstreams.
 *
 * Each is created FROM the copied main, which is how they came to exist on the
 * source, then any document whose content differs on that branch gets its own
 * version. Documents present on the branch but not on main are created there.
 *
 * Usage: TARGET_SITE=<uuid> node scripts/import-p1-workstreams.mjs
 */
import { readFileSync } from "node:fs";
import { api } from "./p1-admin.mjs";
const T = process.env.TARGET_SITE;
if (!T) throw new Error("Set TARGET_SITE to the destination site id.");
const data = JSON.parse(readFileSync(process.env.EXPORT_FILE ?? `${process.env.SP}/glu-export/glu-full.json`, "utf8"));
const snapOf = (v) => (typeof v?.snapshot === "string" ? JSON.parse(v.snapshot) : v?.snapshot);
const latestWithSnapshot = (vs) => [...vs].reverse().find((v) => snapOf(v));

const { branches: tb } = await api(`/api/sites/${T}/branches`);
const mainId = tb.find((b) => b.isMain).id;

for (const srcBranch of data.branches.filter((b) => !b.branch.isMain)) {
  const name = srcBranch.branch.name;
  let target = (await api(`/api/sites/${T}/branches`)).branches.find((b) => b.name === name);
  if (!target) {
    const r = await api(`/api/sites/${T}/branches`, {
      method: "POST", body: JSON.stringify({ name, sourceBranchId: mainId }),
    });
    target = r.branch ?? r;
    console.log(`\n${name}: created workstream ${target.id} from main`);
  } else console.log(`\n${name}: already exists ${target.id}`);

  const { documents } = await api(`/api/sites/${T}/branches/${target.id}/documents`);
  const byPath = new Map(documents.map((d) => [d.path, d]));
  let wrote = 0, created = 0, same = 0;

  for (const d of srcBranch.documents) {
    const path = d.document.path;
    if (path.startsWith("_datasources/") || path.startsWith("_registry/templates/")) continue;
    const want = latestWithSnapshot(d.versions);
    if (!want) continue;
    let doc = byPath.get(path);
    if (!doc) {
      const r = await api(`/api/sites/${T}/branches/${target.id}/documents`, {
        method: "POST",
        body: JSON.stringify({ path, ...(d.document.locale ? { locale: d.document.locale } : {}) }),
      }).catch(() => null);
      if (!r) continue;
      doc = { id: r.document?.id ?? r.id }; created++;
    }
    // Only write when the branch's content actually differs from what the
    // branch inherited, so the copy does not invent a revision per document.
    const cur = await api(`/api/sites/${T}/branches/${target.id}/documents/${doc.id}/versions/latest`).catch(() => null);
    const curSnap = cur?.version?.snapshot ?? cur?.snapshot;
    if (curSnap && JSON.stringify(curSnap) === JSON.stringify(snapOf(want))) { same++; continue; }
    await api(`/api/sites/${T}/branches/${target.id}/documents/${doc.id}/versions`, {
      method: "POST", body: JSON.stringify({ snapshot: snapOf(want) }),
    });
    wrote++;
    if (d.document.isPublished) {
      await api(`/api/sites/${T}/branches/${target.id}/documents/${doc.id}/publish`, { method: "POST" }).catch(() => {});
    }
  }
  console.log(`  ${srcBranch.documents.length} source docs: ${created} created, ${wrote} versions written, ${same} already identical`);
}
