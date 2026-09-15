/**
 * Points each translated page's listing block at its own language.
 *
 * A translation is seeded as a copy of its canonical, so its listing block
 * arrives filtering for en-US records — which would show English events on the
 * Spanish page. The block props are the translation's own to change, so the
 * filter is simply retargeted here.
 *
 * This is the whole mechanism behind locale-aware listings: no datasource
 * change, no routing hook, just a per-document prop.
 */
import { api, mainBranchId, assertNobodyEditing, S } from "./p1-admin.mjs";

const PREFIX_TO_TAG = { es: "es-ES", fr: "fr-FR" };

async function main() {
  const branchId = await mainBranchId();
  await assertNobodyEditing(branchId);
  const { documents } = await api(`/api/sites/${S}/branches/${branchId}/documents`);

  const translated = documents.filter((d) => {
    const head = d.path.split("/")[0];
    return PREFIX_TO_TAG[head] !== undefined;
  });

  let touched = 0;
  for (const doc of translated) {
    const tag = PREFIX_TO_TAG[doc.path.split("/")[0]];
    const v = await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/versions/latest`);
    const snapshot = v?.version?.snapshot ?? v?.snapshot;

    let changed = false;
    for (const block of snapshot.content ?? []) {
      if (block.type !== "GLUListing") continue;
      if (block.props?.filterContains === tag) continue;
      block.props.filterField = "{{ item.locale }}";
      block.props.filterContains = tag;
      changed = true;
    }
    if (!changed) continue;

    await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/versions`, {
      method: "POST", body: JSON.stringify({ snapshot }),
    });
    await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/publish`, { method: "POST" });
    console.log(`  ${doc.path}: listing now filters on ${tag}`);
    touched++;
  }
  console.log(`\n${touched} pages updated`);
}

main().catch((e) => { console.error("FAILED:", e.message); process.exitCode = 1; });
