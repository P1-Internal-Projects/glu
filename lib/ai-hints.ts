/**
 * Shared AI hints for the fields every block has some of.
 *
 * The P1 agent fills fields from these strings, so each one states the
 * constraint first and gives one example. Links and image sources are marked
 * `stream: false` because a partially streamed URL is a broken one.
 */

type FieldAi = NonNullable<import("@puckeditor/core").BaseField["ai"]>;

/** A destination on this site or elsewhere. */
export function linkAi(purpose: string, { optional = false } = {}): FieldAi {
  return {
    stream: false,
    instructions: `${purpose} Use a site path like /apply, or a full https URL for an external site.${optional ? " Leave blank to omit the link." : ""}`,
  };
}

/** An image chosen from the media library. */
export function imageAi(purpose: string, { optional = true } = {}): FieldAi {
  return {
    stream: false,
    instructions: `${purpose} Pick from the media library — never invent or paste an external URL.${optional ? " Leave blank if nothing fits; the block renders without it." : ""}`,
  };
}

/** A button label. */
export function buttonLabelAi(example: string, { optional = false } = {}): FieldAi {
  return {
    instructions: `Verb-first, 2–4 words, e.g. '${example}'.${optional ? " Leave blank to omit the button." : ""}`,
  };
}

/** The small uppercase label above a section heading. */
export const EYEBROW_AI: FieldAi = {
  instructions: "2–4 words naming the section's topic, e.g. 'Admissions' or 'Student Stories'. Leave blank if the heading stands on its own.",
};

/** The light section backgrounds every GLU section offers. */
export const BACKGROUND_AI: FieldAi = {
  instructions: "Alternate with the neighbouring sections so no two adjacent sections share a background. white is the default; offWhite and lightBlue are tints.",
};

/**
 * Attaches `ai` to fields produced by a factory (data list block, media block)
 * whose config this site composes rather than authors. Fields not named are
 * left as they are.
 */
export function withFieldAi<F extends Record<string, unknown>>(
  fields: F,
  ai: Partial<Record<keyof F, FieldAi>>,
): F {
  const out: Record<string, unknown> = { ...fields };
  for (const [name, meta] of Object.entries(ai)) {
    const field = out[name];
    if (field && typeof field === "object" && meta) {
      out[name] = { ...(field as Record<string, unknown>), ai: meta };
    }
  }
  return out as F;
}
