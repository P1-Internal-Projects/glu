/**
 * Replaces the retired `_ct` listing blocks on live pages.
 *
 * The old blocks read a `_ct/*` collection that was registered in code but
 * never held a record on this site, so each of these sections renders a heading
 * over an empty grid today. Two are rebuilt on the new datasource-backed
 * listing; the third had no content type behind it at all and is removed rather
 * than given invented records.
 *
 * Idempotent: a page already carrying the new block is left alone.
 */
import { api, mainBranchId, S } from "./p1-admin.mjs";

const LISTING = "GLUListing";

/** Shared defaults for the data list block, so a replacement is never half-configured. */
function listingProps({ id, heading, datasourceId, viewMode, fields, locale = "en-US" }) {
  return {
    id,
    heading,
    datasourceId,
    items: `{{ ${datasourceId}.items }}`,
    viewMode,
    titleField: fields.title,
    subtitleField: fields.subtitle ?? "",
    teaserField: fields.teaser,
    imageField: fields.image,
    iconField: "",
    showTitle: true,
    showSubtitle: !!fields.subtitle,
    showTeaser: true,
    showImage: true,
    showIcon: false,
    imagePosition: "top",
    imageLoading: "lazy",
    groupBy: "",
    startAt: 1,
    status: "Published",
    sortBy: "",
    sortDir: "asc",
    // A translated page is its own document, so its copy of this block carries
    // its own locale filter. That is what makes the Spanish page list Spanish
    // records without the datasource knowing which page it is resolving for.
    filterField: "{{ item.locale }}",
    filterContains: locale,
    maxItems: 0,
  };
}

const PLAN = {
  "about-our-counselors": {
    replace: "CounselorListing",
    build: (old) =>
      listingProps({
        id: old.id,
        heading: old.heading ?? "Get to Know Our Counselors",
        datasourceId: "gluPeople",
        viewMode: "peopleCards",
        fields: {
          title: "{{ item.name }}",
          subtitle: "{{ item.role }}",
          teaser: "{{ item.focusArea }}",
          image: "{{ item.photoUrl }}",
        },
      }),
  },
  "visit/open-house": {
    replace: "EventListing",
    build: (old) =>
      listingProps({
        id: old.id,
        heading: old.heading ?? "Reserve Your Spot",
        datasourceId: "gluEvents",
        viewMode: "eventCards",
        fields: {
          title: "{{ item.title }}",
          teaser: "{{ item.summary }}",
          image: "{{ item.imageUrl }}",
        },
      }),
  },
  scholarships: { replace: "AccoladeListing", build: null },
};

async function main() {
  const branchId = await mainBranchId();
  const { documents } = await api(`/api/sites/${S}/branches/${branchId}/documents`);

  for (const [path, plan] of Object.entries(PLAN)) {
    const doc = documents.find((d) => d.path === path);
    if (!doc) {
      console.log(`  ${path}: not found, skipped`);
      continue;
    }
    const v = await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/versions/latest`);
    const snapshot = v?.version?.snapshot ?? v?.snapshot;
    const idx = snapshot.content.findIndex((c) => c.type === plan.replace);
    if (idx === -1) {
      console.log(`  ${path}: no ${plan.replace}, already migrated`);
      continue;
    }

    const old = snapshot.content[idx].props ?? {};
    if (plan.build) {
      snapshot.content[idx] = { type: LISTING, props: plan.build(old) };
      console.log(`  ${path}: ${plan.replace} -> ${LISTING}`);
    } else {
      snapshot.content.splice(idx, 1);
      console.log(`  ${path}: removed ${plan.replace} (no content type behind it)`);
    }

    await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/versions`, {
      method: "POST",
      body: JSON.stringify({ snapshot }),
    });
    await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/publish`, { method: "POST" });
  }
  console.log("done");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
