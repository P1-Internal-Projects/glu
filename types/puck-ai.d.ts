/**
 * The `ai` metadata P1 reads off Puck configs.
 *
 * Puck itself ignores it; puck-css serializes it into each component's
 * descriptor at _registry/components/<Name> when the editor loads, and the P1
 * agent (MCP `list_components`) reads it from there when building pages. It
 * is not in @puckeditor/core's published types, so it is declared here once
 * rather than cast per field. Shapes match puck-css's FieldAiMeta and
 * ComponentDescriptor.ai.
 *
 * Also covers the block installed from components.p1.pantheon.io, which used
 * to ship its own narrower augmentation of the same interface.
 */
import "@puckeditor/core";

declare module "@puckeditor/core" {
  interface BaseField {
    ai?: {
      /** What to put here and how — front-load the constraint. */
      instructions?: string;
      required?: boolean;
      /** False for URLs and identifiers: a streamed partial URL is a broken link. */
      stream?: boolean;
      /** Hide from the agent entirely (developer-only or derived values). */
      exclude?: boolean;
      schema?: unknown;
      bind?: string;
    };
  }
  interface ComponentConfigExtensions {
    ai?: {
      /**
       * When and where to use the block. The agent's component list shows
       * roughly the first 60 characters, so lead with what sets it apart.
       */
      instructions?: string;
      defaultZone?: string;
      exclude?: boolean;
    };
  }
}
