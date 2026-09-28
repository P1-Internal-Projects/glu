/**
 * Creates the route template behind /academic-programs/:code.
 *
 * A route template is an ordinary document whose path carries a `:param`
 * segment. P1 serves it for every concrete URL that matches the pattern, and
 * the datasource loader hands the captured param to the fetchers as
 * `urlParams`. So one document renders all 28 programs, and each one has a real
 * URL a visitor can bookmark.
 *
 * Nothing about that is bespoke to this site. What is bespoke is the
 * `gluProgram` datasource in lib/glu-programs.ts, which reads `urlParams.code`
 * and fetches that program from Drupal. The blocks below only bind to it.
 *
 * The blocks are a deliberate mix: GLU's own sections (page hero, stats bar,
 * feature section, CTA banner) and two stock ones (heading, list). Any block
 * with a string prop can bind a token, which is the point worth showing.
 *
 * Why this cannot be done in the editor instead: every slug field in the create
 * -page UI strips colons, so the only UI that produces a `:param` path is the
 * external-data wizard, and that wizard always creates its own index page at
 * the same slug — which here already exists and holds the listing.
 *
 *   node scripts/create-program-detail-template.mjs --branch=<id> [--publish]
 */
import { api, S, mainBranchId, assertNobodyEditing } from "./p1-admin.mjs";
import { createHash } from "node:crypto";

/**
 * Deterministic block id for a migrated component, matching the mapping the
 * content migration uses. Ids created by this script must line up exactly
 * with ids already written to existing pages, so this is computed rather
 * than hard-coded as a plain slug like "program-hero".
 */
function newId(type, old) {
  const h = createHash("sha256").update(`${type}:${old}`).digest("hex");
  return `${type}-${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${"89ab"[parseInt(h[16], 16) & 3]}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const ARGS = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

const PATH = "academic-programs/:code";

/**
 * The page body.
 *
 * `{{ gluProgram.x }}` resolves per request. A prop whose whole value is one
 * token receives the real value rather than a string, which is how `stats`
 * gets an array of rows — see resolveWholeTemplateValue in puck-css.
 */
const CONTENT = [
  {
    type: "GLUPageHero",
    props: {
      id: newId("GLUPageHero", "program-hero"),
      eyebrow: "{{ gluProgram.college }}",
      heading: "{{ gluProgram.title }}",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Academic Programs", href: "/academic-programs" },
      ],
      // The program's own photograph. The hero is the one place the page
      // announces which program this is, and a per-program image says that
      // before the heading is read. The campus banner sits below instead: the
      // hero crops to a 340px band at 30% height, which on that photo is
      // roofline and sky under a crimson wash, and reads as an empty header.
      backgroundImageUrl: "{{ gluProgram.heroImageUrl }}",
    },
  },
  {
    type: "GLUStatsBar",
    props: {
      id: newId("GLUStatsBar", "program-facts"),
      // The stats bar draws its own heading; the facts speak for themselves
      // here and a second title above them only pushes the page down.
      heading: "",
      background: "crimson",
      stats: "{{ gluProgram.stats }}",
    },
  },
  // A GLU section rather than a heading and a paragraph: it brings the
  // container, the column rhythm and a frame for the program's photo, which
  // plain blocks at full page width do not.
  {
    type: "GLUFeatureSection",
    props: {
      id: newId("GLUFeatureSection", "program-about"),
      eyebrow: "{{ gluProgram.department }}",
      heading: "{{ gluProgram.aboutHeading }}",
      body: "{{ gluProgram.description }}",
      // No CTA here. The banner at the foot of the page already says Apply,
      // and two of the same button on one page is one too many.
      ctaLabel: "",
      ctaHref: "",
      // The campus photograph, shown whole in the section's frame rather
      // than cropped to a band.
      imageUrl: "{{ gluProgram.bannerImageUrl }}",
      imageAlt: "The Grand Lakes University quadrangle",
      imagePosition: "right",
      background: "white",
    },
  },
  // Everything the listing's expanded panel shows and the stats bar does not:
  // degree, award, college, department, accreditation, code, career outcomes.
  // Following a permalink should never lose information the listing had.
  //
  // This replaced a Heading and a List block. Those sit in a flat 64px side
  // padding with no max width, while every GLU section is centred and capped
  // at 1200px, so on a wide screen they started well to the left of the
  // section above and the page looked misaligned.
  {
    type: "GLUFactGrid",
    props: {
      id: newId("GLUFactGrid", "program-facts-grid"),
      eyebrow: "",
      heading: "Program details",
      background: "offWhite",
      facts: "{{ gluProgram.facts }}",
    },
  },
  {
    type: "GLUCtaBanner",
    props: {
      id: newId("GLUCtaBanner", "program-cta"),
      // Heading, subtext and the primary button all come from the
      // datasource: a code that matches nothing must not close with an
      // invitation to apply to it.
      heading: "{{ gluProgram.ctaHeading }}",
      subtext: "{{ gluProgram.ctaSubtext }}",
      primaryCtaLabel: "{{ gluProgram.ctaPrimaryLabel }}",
      primaryCtaHref: "{{ gluProgram.ctaPrimaryHref }}",
      secondaryCtaLabel: "{{ gluProgram.ctaSecondaryLabel }}",
      secondaryCtaHref: "{{ gluProgram.ctaSecondaryHref }}",
      background: "crimson",
    },
  },
];

const SNAPSHOT = {
  root: {
    props: {
      // Resolved for the <head> too: resolvePageMetadata runs the same token
      // pass with the same route params.
      title: "{{ gluProgram.title }} | Grand Lakes University",
      description: "{{ gluProgram.summary }}",
    },
  },
  zones: {},
  content: CONTENT,
};

async function main() {
  const branchId = ARGS.get("branch") ?? (await mainBranchId());
  await assertNobodyEditing(branchId);

  const { documents } = await api(`/api/sites/${S}/branches/${branchId}/documents`);
  let doc = documents.find((d) => d.path === PATH && !d.archived);

  if (!doc) {
    const created = await api(`/api/sites/${S}/branches/${branchId}/documents`, {
      method: "POST",
      body: JSON.stringify({ path: PATH, title: "Academic program", locale: "en-US" }),
    });
    doc = created.document ?? created;
    console.log(`created ${PATH} -> ${doc.id}`);
  } else {
    console.log(`reusing ${PATH} -> ${doc.id}`);
  }

  await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/versions`, {
    method: "POST",
    body: JSON.stringify({ snapshot: SNAPSHOT }),
  });
  console.log("wrote version");

  if (ARGS.get("publish")) {
    await api(`/api/sites/${S}/branches/${branchId}/documents/${doc.id}/publish`, {
      method: "POST",
    });
    console.log("published");
  } else {
    console.log("not published — pass --publish when the code that reads gluProgram is deployed");
  }

  console.log(`\nbranch ${branchId}\ndocument ${doc.id}`);
}

await main();
