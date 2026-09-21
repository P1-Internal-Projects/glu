/**
 * GLU's own collection datasources.
 *
 * Each one exposes `items`, which is the shape the data list block binds to
 * (`{{ <id>.items }}`). Records come from template-bound pages rather than an
 * external service, so the editor authors an event as an ordinary page and the
 * listing picks it up with nothing to sync.
 *
 * Records for every locale are returned together, each tagged with its own.
 * A translated page is a separate document, so its listing block carries its
 * own filter — that is how the Spanish page lists Spanish events without this
 * fetcher needing to know which page it is being resolved for.
 */

import type { RemoteDatasourceFetcher } from "@pantheon-systems/puck-css/server";
import type { RemoteDatasourceDefinition } from "@pantheon-systems/puck-css/server";
import { readCollection } from "./glu-collections";

export const EVENTS_DATASOURCE_ID = "gluEvents";
export const EVENTS_PATH_PREFIX = "events";
export const EVENT_RECORD_BLOCK = "GLUEventHeader";

export const PEOPLE_DATASOURCE_ID = "gluPeople";
export const PEOPLE_PATH_PREFIX = "counselors";
export const PERSON_RECORD_BLOCK = "GLUPersonProfile";

export const GLU_COLLECTION_DATASOURCES: RemoteDatasourceDefinition[] = [
  {
    id: EVENTS_DATASOURCE_ID,
    label: "GLU events",
    description:
      "Every published event page, in every locale. One record per page created from the Event template.",
    resolution:
      "Reads published pages under `events/` and under each locale prefix (for example `es/events/`), taking each record from the page's pinned GLUEventHeader block.",
    fields: [
      { path: "title", description: "Event title" },
      { path: "eventType", description: "Open House, Webinar, Deadline, and so on" },
      { path: "summary", description: "Short description for listing cards" },
      { path: "startDate", description: "Date as YYYY-MM-DD, sortable as a string" },
      { path: "startTime", description: "Start time as displayed" },
      { path: "endTime", description: "End time as displayed" },
      { path: "location", description: "Where the event takes place" },
      { path: "registrationUrl", description: "Registration link" },
      { path: "registrationLabel", description: "Registration button label" },
      { path: "imageUrl", description: "Background or card image" },
      { path: "url", description: "Path of this event's page, locale prefix included" },
      { path: "canonicalUrl", description: "Path with the locale prefix removed" },
      { path: "locale", description: "BCP-47 tag of the language this page is written in" },
    ],
  },
  {
    id: PEOPLE_DATASOURCE_ID,
    label: "GLU counselors",
    description:
      "Every published counselor page, in every locale. One record per page created from the Counselor template.",
    resolution:
      "Reads published pages under `counselors/` and under each locale prefix, taking each record from the page's pinned GLUPersonProfile block.",
    fields: [
      { path: "name", description: "Full name" },
      { path: "pronouns", description: "Pronouns, if given" },
      { path: "role", description: "Role or title" },
      { path: "focusArea", description: "What this counselor advises on" },
      { path: "territory", description: "Region or school group they cover" },
      { path: "languages", description: "Languages spoken, comma-separated" },
      { path: "email", description: "Contact email" },
      { path: "phone", description: "Contact phone" },
      { path: "officeLocation", description: "Office" },
      { path: "officeHours", description: "Drop-in hours as displayed" },
      { path: "bookingUrl", description: "Link to book a conversation" },
      { path: "photoUrl", description: "Headshot image; blank when the page shows the GLU silhouette" },
      { path: "bio", description: "Biography" },
      { path: "url", description: "Path of this person's page, locale prefix included" },
      { path: "canonicalUrl", description: "Path with the locale prefix removed" },
      { path: "locale", description: "BCP-47 tag of the language this page is written in" },
    ],
  },
];

export const GLU_COLLECTION_FETCHERS: RemoteDatasourceFetcher[] = [
  {
    id: EVENTS_DATASOURCE_ID,
    fetch: async () => {
      const items = await readCollection(EVENTS_PATH_PREFIX, EVENT_RECORD_BLOCK);
      // Soonest first. String compare is correct for YYYY-MM-DD, and an event
      // with no date sorts last rather than jumping to the top as "".
      items.sort((a, b) => {
        const da = String(a.startDate ?? "");
        const db = String(b.startDate ?? "");
        if (!da) return 1;
        if (!db) return -1;
        return da < db ? -1 : da > db ? 1 : 0;
      });
      return { items };
    },
  },
  {
    id: PEOPLE_DATASOURCE_ID,
    fetch: async () => {
      const read = await readCollection(PEOPLE_PATH_PREFIX, PERSON_RECORD_BLOCK);
      // The profile block also carries how that page chose to draw itself.
      // Those are not facts about the person, so a listing never sees them.
      const items = read.map(({ layout, background, photoShape, ...record }) => record);
      items.sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
      return { items };
    },
  },
];
