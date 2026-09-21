/**
 * Reports which Puck components and fields carry AI hints, using the same
 * descriptor extraction the editor uses to write _registry/components/*.
 *
 * Usage: npx tsx scripts/audit-ai-hints.ts [--json]
 *
 * A component without `ai.instructions` is one the P1 agent has to guess at
 * from its label alone; a text field without `ai` is one it fills by
 * inference. Both are reported so the gaps can be closed deliberately.
 */
import { register } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { extractDescriptors } from "@pantheon-systems/puck-css/registry-sync";
import type { SerializedField } from "@pantheon-systems/puck-css/registry-sync";

register(pathToFileURL(path.resolve("scripts/fast-json-patch-hook.mjs")).href);
register(pathToFileURL(path.resolve("scripts/asset-stub-hooks.mjs")).href);

const mod = (await import(pathToFileURL(path.resolve("puck.config.tsx")).href)) as Record<string, unknown>;
const config = (mod.default ?? mod.config ?? mod) as Parameters<typeof extractDescriptors>[0];
const descriptors = extractDescriptors(config);

type Row = {
  component: string;
  instructions: string | undefined;
  /** An excluded component is hidden from the agent, so its fields need no hints. */
  excluded: boolean;
  fields: { name: string; type: string; hasAi: boolean; nested?: string[] }[];
};

function walk(fields: SerializedField[], prefix = ""): Row["fields"] {
  const out: Row["fields"] = [];
  for (const f of fields) {
    const rec = f as unknown as { name: string; type: string; ai?: unknown; arrayFields?: SerializedField[]; objectFields?: SerializedField[] };
    const name = prefix + rec.name;
    out.push({ name, type: rec.type, hasAi: rec.ai !== undefined });
    const nested = rec.arrayFields ?? rec.objectFields;
    if (nested) out.push(...walk(nested, `${name}.`));
  }
  return out;
}

const rows: Row[] = descriptors.map((d) => ({
  component: d.name,
  instructions: d.ai?.instructions,
  excluded: d.ai?.exclude === true,
  fields: walk(d.fields),
}));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  for (const r of rows.sort((a, b) => a.component.localeCompare(b.component))) {
    const missing = r.excluded ? [] : r.fields.filter((f) => !f.hasAi);
    const flag = r.excluded
      ? "EXCLUDED"
      : r.instructions
        ? `instructions ${r.instructions.length}ch`
        : "NO INSTRUCTIONS";
    console.log(`${r.component.padEnd(24)} ${flag.padEnd(22)} fields ${String(r.fields.length).padStart(2)}  missing ai ${String(missing.length).padStart(2)}: ${missing.map((f) => `${f.name}(${f.type})`).join(", ")}`);
  }
}
