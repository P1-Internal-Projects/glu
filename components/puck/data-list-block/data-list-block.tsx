"use client";

import { createDataListBlock } from "@pantheon-systems/puck-css/fields";
import { blockPaddingClass } from "../block-padding";

const baseDataList = createDataListBlock({
  wrapperClassName: blockPaddingClass,
});

// Superseded by GLUListing, which is the same factory with GLU card modes and
// section chrome. Kept for pages that already use it.
export const dataListBlock = {
  ...baseDataList,
  ai: {
    exclude: true,
    instructions: "Unbranded data list. Use GLUListing instead.",
  },
};
