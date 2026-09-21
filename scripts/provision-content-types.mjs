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
    recordDefaults: {
      eventType: "Open House",
      title: "New Event",
      summary: "",
      startDate: "",
      startTime: "",
      endTime: "",
      location: "Grand Lakes campus",
      registrationUrl: "/visit/open-house",
      registrationLabel: "Register",
      imageUrl: "",
    },
    body: eventBody,
  },
  {
    name: "counselor",
    label: "Counselor",
    description:
      "An admissions counselor's profile page. Carries their territory, focus area and contact details, and feeds the Meet Your Counselors listing. Creates a page under /counselors.",
    defaultUrlPattern: "/counselors/:slug",
    recordBlock: "GLUPersonProfile",
    recordDefaults: {
      name: "New Counselor",
      pronouns: "",
      role: "Admissions Counselor",
      focusArea: "",
      territory: "",
      languages: "English",
      email: "",
      phone: "",
      officeLocation: "Visitor Center, Room 120",
      officeHours: "",
      bookingUrl: "/visit/open-house",
      bookingLabel: "Schedule a conversation",
      photoUrl: "",
      bio: "",
      layout: "split",
      background: "white",
      photoShape: "rounded",
    },
    body: counselorBody,
  },
];

/**
 * A GLU Listing block bound to the events collection: the three soonest
 * English events. Shared by both templates — a counselor page lists sessions
 * where you can meet them, an event page lists what else is coming up — and
 * kept to one definition so the two cannot drift.
 *
 * The prop set is the factory's, so every key here is one the block already
 * has a field for. A translated page's copy of this block gets its own
 * `filterContains` (see scripts/localize-listing-filters.mjs).
 */
function upcomingEventsListing(id, { eyebrow, heading, subtext, background, exclude }) {
  return {
    type: "GLUListing",
    props: {
      id,
      datasourceId: "gluEvents",
      items: "{{ gluEvents.items }}",
      viewMode: "eventCards",
      titleField: "{{ item.title }}",
      subtitleField: "{{ item.eventType }}",
      teaserField: "{{ item.summary }}",
      imageField: "{{ item.imageUrl }}",
      iconField: "",
      showTitle: true,
      showSubtitle: true,
      showTeaser: true,
      showImage: true,
      showIcon: false,
      imagePosition: "top",
      imageLoading: "lazy",
      filterField: "{{ item.locale }}",
      filterContains: "en-US",
      sortBy: "{{ item.startDate }}",
      sortDir: "asc",
      groupBy: "",
      status: "Published",
      startAt: 1,
      maxItems: 3,
      heading,
      eyebrow,
      subtext,
      align: "center",
      columns: "3",
      cardStyle: "elevated",
      background,
      ...(exclude ? { exclude } : {}),
    },
  };
}

function ctaBanner(id, { heading, subtext }) {
  return {
    type: "GLUCtaBanner",
    props: {
      id,
      heading,
      subtext,
      primaryCtaLabel: "Start Your Application",
      primaryCtaHref: "/apply",
      secondaryCtaLabel: "Plan a Visit",
      secondaryCtaHref: "/visit/open-house",
      background: "navy",
    },
  };
}

/**
 * What a counselor page holds below the pinned profile.
 *
 * Every block arrives with real default copy, so a page created from the
 * template reads as finished before anyone has typed: the point of a template
 * is that the first preview already looks like the site. The FAQ is written
 * from the counselor's side and is true of any counselor; the events listing
 * and the banner are live and need no editing at all.
 */
function counselorBody() {
  return [
    {
      type: "GLUAccordion",
      props: {
        id: "template-faq",
        eyebrow: "How I can help",
        heading: "Questions I hear most often",
        background: "white",
        items: [
          {
            question: "Do I need to talk to a counselor before I apply?",
            answer:
              "No, but most students find it helps. A twenty-minute conversation is usually enough to settle which application round fits you, what to send with your file, and whether a campus visit makes sense. Book a time using the button above, or just email.",
          },
          {
            question: "What happens after I submit my application?",
            answer:
              "I read every file from my territory myself. You will hear from me within two weeks of submitting to confirm your application is complete, and again if anything is missing. Decisions go out on the dates published on the Admissions page.",
          },
          {
            question: "Can you help with financial aid questions?",
            answer:
              "Yes. I can walk you through the FAFSA, the scholarships you are automatically considered for, and the ones that need a separate application. For anything about your specific award letter, I will connect you directly with the Office of Financial Aid.",
          },
        ],
      },
    },
    upcomingEventsListing("template-events", {
      eyebrow: "Meet in person",
      heading: "Upcoming Events",
      subtext:
        "Sessions, tours and deadlines where you can talk with an admissions counselor.",
      background: "lightBlue",
    }),
    ctaBanner("template-cta", {
      heading: "Ready to take the next step?",
      subtext:
        "Start your application, or come see the campus first. Either way, your counselor is one email away.",
    }),
  ];
}

/** What an event page holds below the pinned header. */
function eventBody() {
  return [
    {
      type: "ParagraphBlock",
      props: {
        id: "template-body",
        text: "Describe what happens at this event, who it is for, and anything to bring or prepare.",
      },
    },
    upcomingEventsListing("template-more-events", {
      eyebrow: "More to come",
      heading: "Other Upcoming Events",
      subtext: "",
      background: "offWhite",
    }),
    ctaBanner("template-cta", {
      heading: "Can't make this one?",
      subtext:
        "Schedule a conversation with an admissions counselor, or start your application whenever you are ready.",
    }),
  ];
}

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
 * The blocks below it are not pinned: they are a strong starting point, and an
 * editor is free to reorder, restyle or remove them.
 *
 * The record block carries its starting values here, not only in the
 * component's `defaultProps`. Puck applies `defaultProps` when a block is
 * dragged in from the drawer; a page scaffolded from a template gets the
 * template's props verbatim, so a bare `{ id }` produced a page with no role,
 * no office and no booking button — exactly the unfinished look this is meant
 * to avoid. Keep these in step with the component's defaultProps.
 */
function templateSnapshot({ label, description, defaultUrlPattern, recordBlock, recordDefaults = {}, body }) {
  return {
    root: {
      props: {
        _template: { label, description, deprecated: false, defaultUrlPattern },
        _pinMap: { "template-record": true },
      },
    },
    zones: {},
    content: [
      { type: recordBlock, props: { id: "template-record", ...recordDefaults } },
      ...body(),
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
    if (tpl.defaultUrlPattern !== def.defaultUrlPattern) {
      await api(`/api/sites/${S}/branches/${branchId}/templates/${tpl.id}`, {
        method: "PATCH",
        body: JSON.stringify({ defaultUrlPattern: def.defaultUrlPattern, description: def.description }),
      });
      console.log(`  set ${def.name} URL pattern ${def.defaultUrlPattern}`);
    }
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

/**
 * `--branch=<id>` targets a workstream other than main; `--templates-only`
 * updates the templates and leaves the seeded pages alone. Templates on a
 * non-main workstream are inherited from main until written to, and writing
 * to one here makes the change part of that workstream's review, which is
 * where a template change belongs.
 */
const ARGS = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

async function main() {
  const branchId = ARGS.get("branch") ?? (await mainBranchId());
  console.log("workstream:", branchId);

  const ids = {};
  for (const def of TEMPLATES) {
    console.log(`template ${def.name}:`);
    ids[def.name] = await ensureTemplate(branchId, def);
  }

  if (ARGS.has("templates-only")) {
    console.log("templates only; pages left as they are");
    return;
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
