/**
 * Writes the exported GLU content into a fresh site.
 *
 * Phases run in a forced order:
 *   A settings      markets must exist before a locale-tagged doc is created
 *   B registry      template writes strip props absent from _registry/components/*
 *   C templates     47 documents bind to one, and the binding is set at create time
 *   D canonicals    a translation variant is created FROM its canonical
 *   E variants      re-linked via the translations endpoint, not created loose
 *   F publish       publishing snapshots whatever is current, so content comes first
 *
 * Idempotent per phase: a path that already exists gets a new version rather
 * than a duplicate document, so a failed run can be repeated.
 *
 * Usage: TARGET_SITE=<uuid> node scripts/import-p1-site.mjs [ABCDEF]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { api } from "./p1-admin.mjs";

const T = process.env.TARGET_SITE;
if (!T) throw new Error("Set TARGET_SITE to the destination site id.");
const PHASES = (process.argv[2] ?? "ABCDEF").toUpperCase();
const data = JSON.parse(readFileSync(process.env.EXPORT_FILE ?? `${process.env.SP}/glu-export/glu-full.json`, "utf8"));
const src = data.branches.find((b) => b.branch.isMain);
// Keyed by target site: sharing one state file across targets makes the
// second run believe every document already exists and create nothing.
const mapPath = process.env.STATE_FILE ?? `${process.env.SP}/import-state-${T}.json`;
let state = { templateIds: {}, docIds: {} };
try { state = JSON.parse(readFileSync(mapPath, "utf8")); } catch {}
const save = () => writeFileSync(mapPath, JSON.stringify(state, null, 2));

const { branches } = await api(`/api/sites/${T}/branches`);
const B = branches.find((b) => b.isMain).id;
const existing = new Map(
  (await api(`/api/sites/${T}/branches/${B}/documents`)).documents.map((d) => [d.path, d]),
);
console.log(`target ${T} main ${B}; ${existing.size} documents already present\n`);

const snapOf = (v) => (typeof v?.snapshot === "string" ? JSON.parse(v.snapshot) : v?.snapshot);
const variantIds = new Set();
for (const d of src.documents) for (const v of d.variants ?? []) variantIds.add(v.document?.id ?? v.documentId);

async function putVersions(docId, versions, { all }) {
  const list = all ? versions : versions.slice(-1);
  let n = 0;
  for (const v of list) {
    const snapshot = snapOf(v);
    if (!snapshot) continue;
    await api(`/api/sites/${T}/branches/${B}/documents/${docId}/versions`, {
      method: "POST", body: JSON.stringify({ snapshot }),
    });
    n++;
  }
  return n;
}

// ---- A: settings ---------------------------------------------------------
if (PHASES.includes("A")) {
  const locales = data.settings.settings?.locales;
  await api(`/api/sites/${T}/settings`, { method: "PATCH", body: JSON.stringify({ locales }) });
  console.log(`A settings: markets ${locales.markets.join(", ")} policy ${locales.policy}`);
}

// ---- B: internal / registry docs (latest only) ---------------------------
if (PHASES.includes("B")) {
  // The templates API owns _registry/templates/* and generates _datasources/*
  // itself, so creating those as plain documents here takes the paths it needs
  // and phase C then fails with 409. `_datasources/show` is skipped outright:
  // it is the orphan left by a deleted template on the source and would arrive
  // here with no template either.
  const OWNED = (p) => p.startsWith("_registry/templates/") || p.startsWith("_datasources/");
  const internal = src.documents.filter((d) => d.document.path.startsWith("_") && !OWNED(d.document.path));
  let made = 0, vers = 0;
  for (const d of internal) {
    const path = d.document.path;
    let id = existing.get(path)?.id ?? state.docIds[path];
    if (!id) {
      const r = await api(`/api/sites/${T}/branches/${B}/documents`, {
        method: "POST", body: JSON.stringify({ path, ...(d.document.locale ? { locale: d.document.locale } : {}) }),
      });
      id = r.document?.id ?? r.id; made++;
      state.docIds[path] = id;
    }
    vers += await putVersions(id, d.versions, { all: false });
  }
  save();
  console.log(`B registry: ${internal.length} docs (${made} created), ${vers} versions at latest`);
}

// ---- C: templates --------------------------------------------------------
if (PHASES.includes("C")) {
  for (const t of data.templates) {
    const meta = t.root?.props?._template ?? {};
    if (state.templateIds[t.name]) { console.log(`C template ${t.name}: already mapped`); continue; }
    const created = await api(`/api/sites/${T}/branches/${B}/templates`, {
      method: "POST",
      body: JSON.stringify({
        name: t.name, label: meta.label ?? t.name,
        ...(meta.description ? { description: meta.description } : {}),
        ...(meta.defaultUrlPattern ? { defaultUrlPattern: meta.defaultUrlPattern } : {}),
      }),
    });
    const newId = created.template?.id ?? created.id;
    state.templateIds[t.name] = newId;
    // The skeleton is content on the template's own document.
    await api(`/api/sites/${T}/branches/${B}/documents/${newId}/versions`, {
      method: "POST",
      body: JSON.stringify({ snapshot: { root: t.root ?? {}, zones: t.zones ?? {}, content: t.content ?? [] } }),
    });
    save();
    console.log(`C template ${t.name}: ${newId} (+skeleton, ${(t.content??[]).length} blocks)`);
  }
}

// ---- D: canonical pages --------------------------------------------------
if (PHASES.includes("D")) {
  const canon = src.documents.filter((d) => !d.document.path.startsWith("_") && !variantIds.has(d.document.id));
  const oldToName = Object.fromEntries(data.templates.map((t) => [t.id, t.name]));
  let made = 0, vers = 0;
  for (const d of canon) {
    const path = d.document.path;
    let id = existing.get(path)?.id ?? state.docIds[path];
    if (!id) {
      const tplName = d.document.templateId ? oldToName[d.document.templateId] : null;
      const tplId = tplName ? state.templateIds[tplName] : null;
      const body = { path, ...(d.document.locale ? { locale: d.document.locale } : {}),
                     ...(tplId ? { templateId: tplId } : {}) };
      const r = await api(`/api/sites/${T}/branches/${B}/documents`, { method: "POST", body: JSON.stringify(body) });
      id = r.document?.id ?? r.id; made++;
      state.docIds[path] = id;
    }
    vers += await putVersions(id, d.versions, { all: true });
  }
  save();
  console.log(`D canonicals: ${canon.length} docs (${made} created), ${vers} versions replayed`);
}

// ---- E: translation variants --------------------------------------------
if (PHASES.includes("E")) {
  let made = 0, vers = 0, skipped = 0;
  for (const c of src.documents) {
    for (const v of c.variants ?? []) {
      const vdoc = v.document ?? v;
      const path = vdoc.path;
      if (!path) { skipped++; continue; }
      let id = existing.get(path)?.id ?? state.docIds[path];
      if (!id) {
        // The home page is pre-seeded by create_site, so its id is in `existing`
        // rather than in the created-id map.
        const canonId = state.docIds[c.document.path] ?? existing.get(c.document.path)?.id;
        if (!canonId) { console.log(`  ! no canonical for ${path}`); skipped++; continue; }
        // Created through the translations endpoint so the localization edge
        // exists; a plain document at the same path would look right and carry
        // no relationship to its canonical.
        const r = await api(`/api/sites/${T}/branches/${B}/documents/${canonId}/translations`, {
          method: "POST",
          body: JSON.stringify({ locale: vdoc.locale, path, mode: "copy" }),
        });
        id = r.document?.id ?? r.id; made++;
        state.docIds[path] = id;
      }
      const source = src.documents.find((x) => x.document.path === path);
      if (source) vers += await putVersions(id, source.versions, { all: true });
    }
  }
  save();
  console.log(`E variants: ${made} created, ${vers} versions, ${skipped} skipped`);
}

// ---- F: publish ----------------------------------------------------------
if (PHASES.includes("F")) {
  let pub = 0, fail = 0;
  for (const d of src.documents) {
    if (!d.document.isPublished) continue;
    const id = state.docIds[d.document.path] ?? existing.get(d.document.path)?.id;
    if (!id) continue;
    try {
      await api(`/api/sites/${T}/branches/${B}/documents/${id}/publish`, { method: "POST" });
      pub++;
    } catch (e) { fail++; if (fail < 4) console.log(`  ! publish ${d.document.path}: ${e.message.slice(0, 90)}`); }
  }
  console.log(`F publish: ${pub} published${fail ? `, ${fail} failed` : ""} (each creates a publish checkpoint)`);
}

console.log("\ndone");
