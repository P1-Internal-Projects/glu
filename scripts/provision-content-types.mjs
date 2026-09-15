/**
 * Provisions GLU's content types: the Event and Counselor templates, and the
 * pages built from them.
 *
 * Idempotent — a template or page that already exists is updated in place
 * rather than duplicated, so this can be re-run after editing the content below.
 *
 * Why a script rather than the editor: the same definitions have to exist on
 * every environment this demo is rebuilt on, and a template authored by hand on
 * a canvas is not reviewable in a pull request.
 *
 * The event and counselor copy here is newly authored demo content for a
 * fictional university. It is not migrated from anywhere — the previous `_ct`
 * collections were registered in code but never held a single record.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { api, mainBranchId, S } from "./p1-admin.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

const TEMPLATES = [
  {
    name: "event",
    label: "Event",
    description:
      "A single Grand Lakes event: open house, webinar, campus tour or deadline. Use for anything with a date, a time and a place that people register for. Creates a page under /events and feeds the Upcoming Events listings.",
    defaultUrlPattern: "/events/:slug",
    recordBlock: "GLUEventHeader",
  },
  {
    name: "counselor",
    label: "Counselor",
    description:
      "An admissions counselor's profile page. Carries their territory, focus area and contact details, and feeds the Meet Your Counselors listing.",
    defaultUrlPattern: "/counselors/:slug",
    recordBlock: "GLUPersonProfile",
  },
];

/**
 * The template's component tree.
 *
 * No nav and no footer: those are rendered by the Puck root from
 * lib/site-chrome.ts, so a template that placed them would create a second,
 * competing definition of the site chrome — the per-page copies this repo
 * moved away from.
 *
 * The record block is pinned. An event page without its event block is not an
 * event, and the listings read that block, so letting an editor delete it
 * would silently drop the page out of every listing rather than fail visibly.
 */
function templateSnapshot({ label, description, recordBlock }) {
  return {
    root: {
      props: {
        _template: { label, description, deprecated: false },
        _pinMap: { "template-record": true },
      },
    },
    zones: {},
    content: [
      { type: recordBlock, props: { id: "template-record" } },
      {
        type: "ParagraphBlock",
        props: { id: "template-body", text: "Add the details for this page here." },
      },
    ],
  };
}

async function ensureTemplate(branchId, def) {
  const { templates } = await api(`/api/sites/${S}/branches/${branchId}/templates`);
  let tpl = templates.find((t) => t.name === def.name);
  if (!tpl) {
    const created = await api(`/api/sites/${S}/branches/${branchId}/templates`, {
      method: "POST",
      body: JSON.stringify({
        name: def.name,
        label: def.label,
        description: def.description,
        defaultUrlPattern: def.defaultUrlPattern,
      }),
    });
    tpl = created.template ?? created;
    console.log(`  created template ${def.name} (${tpl.id})`);
  } else {
    console.log(`  template ${def.name} exists (${tpl.id})`);
  }

  const docs = (await api(`/api/sites/${S}/branches/${branchId}/documents`)).documents;
  const doc = docs.find((d) => d.path === `_registry/templates/${def.name}`);
  if (!doc) throw new Error(`Template document for ${def.name} not found`);

  await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/versions`, {
    method: "POST",
    body: JSON.stringify({ snapshot: templateSnapshot(def) }),
  });
  console.log(`  wrote ${def.name} template snapshot`);
  return tpl.id;
}

async function upsertPage(branchId, { path, templateId, title, recordBlock, record, body }) {
  const snapshot = {
    root: { props: { title, description: record.summary ?? record.bio ?? "" } },
    zones: {},
    content: [
      { type: recordBlock, props: { id: "template-record", ...record } },
      { type: "ParagraphBlock", props: { id: "template-body", text: body } },
    ],
  };

  const docs = (await api(`/api/sites/${S}/branches/${branchId}/documents`)).documents;
  let doc = docs.find((d) => d.path === path);

  if (!doc) {
    // A document created from a template takes its content from that template,
    // and the API refuses a snapshot in the same call. So the page is created
    // bound to the template first and its content written as the next version.
    const created = await api(`/api/sites/${S}/branches/${branchId}/documents`, {
      method: "POST",
      body: JSON.stringify({ path, templateId, title, locale: "en-US" }),
    });
    doc = created.document ?? created;
    console.log(`  created ${path}`);
  }

  await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/versions`, {
    method: "POST",
    body: JSON.stringify({ snapshot }),
  });

  await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/publish`, { method: "POST" });
  return doc.id;
}

const EVENTS = JSON.parse(readFileSync(join(HERE, "content-types.events.json"), "utf8"));
const COUNSELORS = JSON.parse(readFileSync(join(HERE, "content-types.counselors.json"), "utf8"));

async function main() {
  const branchId = await mainBranchId();
  console.log("workstream:", branchId);

  const ids = {};
  for (const def of TEMPLATES) {
    console.log(`template ${def.name}:`);
    ids[def.name] = await ensureTemplate(branchId, def);
  }

  console.log("event pages:");
  for (const e of EVENTS) {
    const { slug, body, ...record } = e;
    await upsertPage(branchId, {
      path: `events/${slug}`,
      templateId: ids.event,
      title: record.title,
      recordBlock: "GLUEventHeader",
      record,
      body,
    });
  }

  console.log("counselor pages:");
  for (const c of COUNSELORS) {
    const { slug, body, ...record } = c;
    await upsertPage(branchId, {
      path: `counselors/${slug}`,
      templateId: ids.counselor,
      title: record.name,
      recordBlock: "GLUPersonProfile",
      record,
      body,
    });
  }

  console.log("done");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
