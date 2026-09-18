/**
 * Full read-only export of the GLU P1 content site.
 *
 * Version listings carry their snapshot inline, so this is one request per
 * document rather than one per version.
 *
 * Usage: [SOURCE_SITE=<uuid>] [OUT_DIR=<dir>] node scripts/export-p1-site.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { api, S } from "./p1-admin.mjs";

// Defaults to GLU (p1-admin's SITE_ID); set SOURCE_SITE to export any other site.
const S_ID = process.env.SOURCE_SITE ?? S;

const OUT = process.env.OUT_DIR ?? `${process.env.SP}/glu-export`;
mkdirSync(OUT, { recursive: true });

const site = await api(`/api/sites/${S_ID}`);
const settings = await api(`/api/sites/${S_ID}/settings`);
const { branches } = await api(`/api/sites/${S_ID}/branches`);
const main = branches.find((b) => b.isMain);
const { templates } = await api(`/api/sites/${S_ID}/branches/${main.id}/templates`);

// Full template bodies, not just the summaries the list returns.
const templateBodies = [];
for (const t of templates ?? []) {
  templateBodies.push(await api(`/api/sites/${S_ID}/branches/${main.id}/templates/${t.id}`).catch(() => t));
}

const out = { exportedAt: new Date().toISOString(), site, settings, templates: templateBodies, branches: [] };
let docCount = 0, verCount = 0, maxVers = { path: null, n: 0 };

for (const b of branches) {
  const { documents } = await api(`/api/sites/${S_ID}/branches/${b.id}/documents`);
  const cps = await api(`/api/sites/${S_ID}/branches/${b.id}/checkpoints`).catch(() => ({ checkpoints: [] }));
  const docs = [];
  for (const d of documents) {
    const r = await api(`/api/sites/${S_ID}/branches/${b.id}/documents/${d.id}/versions`).catch(() => ({ versions: [] }));
    const versions = (r.versions ?? []).slice().sort((x, y) => (x.versionNumber ?? 0) - (y.versionNumber ?? 0));
    // Translation edges, so the copy can re-link variants to canonicals.
    const variants = await api(`/api/sites/${S_ID}/branches/${b.id}/documents/${d.id}/translations`).catch(() => null);
    docs.push({ document: d, versions, variants: variants?.variants ?? null });
    docCount++; verCount += versions.length;
    if (versions.length > maxVers.n) maxVers = { path: d.path, n: versions.length };
  }
  out.branches.push({ branch: b, documents: docs, checkpoints: cps.checkpoints ?? [] });
  console.log(`  ${(b.name || "?").padEnd(22)} ${String(documents.length).padStart(3)} docs, ${docs.reduce((a,x)=>a+x.versions.length,0)} versions`);
}

writeFileSync(`${OUT}/glu-full.json`, JSON.stringify(out, null, 1));
const bytes = JSON.stringify(out).length;
console.log(`\n${docCount} documents, ${verCount} versions exported`);
console.log(`heaviest document: ${maxVers.path} with ${maxVers.n} versions`);
console.log(`written: ${OUT}/glu-full.json  (${(bytes/1048576).toFixed(1)} MB)`);
