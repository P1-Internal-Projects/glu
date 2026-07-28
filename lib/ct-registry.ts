/**
 * Content type registry.
 *
 * To add a new content type:
 *   1. Create components/puck/ct-your-type.tsx with a ComponentConfig export.
 *   2. Add one entry below — the key becomes the URL slug (/admin/ct/<key>)
 *      and the CSS collection path (_ct/<key>). The underscore prefix
 *      prevents the document from appearing in the Puck editor page dropdown.
 */

import type { ComponentConfig } from "@puckeditor/core";
import { ctEventConfig } from "../components/puck/ct-event";
import { ctCounselorConfig } from "../components/puck/ct-counselor";
import { ctAccoladeConfig } from "../components/puck/ct-accolade";

export type CTRegistryEntry = {
  label: string;
  pluralLabel: string;
  cssPath: string;
  config: ComponentConfig<any>;
};

export const ctRegistry: Record<string, CTRegistryEntry> = {
  events: {
    label: "Event",
    pluralLabel: "Events",
    cssPath: "_ct/events",
    config: ctEventConfig,
  },
  counselors: {
    label: "Counselor",
    pluralLabel: "Counselors",
    cssPath: "_ct/counselors",
    config: ctCounselorConfig,
  },
  accolades: {
    label: "Accolade",
    pluralLabel: "Accolades",
    cssPath: "_ct/accolades",
    config: ctAccoladeConfig,
  },
};
