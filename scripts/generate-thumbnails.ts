#!/usr/bin/env tsx
/**
 * generate-thumbnails.ts
 *
 * Generates `lib/component-thumbnails.tsx` from the Puck component
 * configuration. Run this whenever you add, remove, or rename a component.
 *
 * ─── Manual usage ────────────────────────────────────────────────────────────
 *
 *   pnpm generate-thumbnails
 *   # or directly:
 *   npx tsx scripts/generate-thumbnails.ts
 *
 * ─── CI/CD (GitHub Actions) ──────────────────────────────────────────────────
 *
 *   Add a job step that runs on changes to `puck.config.tsx`:
 *
 *   - name: Regenerate component thumbnails
 *     if: |
 *       contains(github.event.head_commit.modified, 'puck.config.tsx') ||
 *       contains(github.event.head_commit.modified, 'components/puck/')
 *     run: npx tsx scripts/generate-thumbnails.ts
 *
 *   - name: Commit updated thumbnails
 *     run: |
 *       git config user.name  "github-actions[bot]"
 *       git config user.email "github-actions[bot]@users.noreply.github.com"
 *       git add lib/component-thumbnails.tsx
 *       git diff --cached --quiet || git commit -m "chore: regenerate component thumbnails"
 *       git push
 *
 * ─── Behaviour ───────────────────────────────────────────────────────────────
 *
 * Layout classification uses two strategies in priority order:
 *
 * 1. Field-signature classifier — parses the component's actual Puck field
 *    definitions (works for inline configs and import-traced configs) and
 *    derives layout from structural patterns: hasImage, hasItems, textFieldCount,
 *    isFormControl, hasSlot, etc. Works across any naming convention.
 *
 * 2. Name heuristics — regex patterns on the component name. Used as fallback
 *    when field parsing returns no result (e.g. spread-imported components).
 *
 * Set DEBUG_THUMBNAILS=1 to log classification decisions per component.
 *
 * ─── Adding a new component ──────────────────────────────────────────────────
 *
 * 1. Add the component to `puck.config.tsx` as normal.
 * 2. Run `pnpm generate-thumbnails`.
 * 3. Inspect the generated stub in `lib/component-thumbnails.tsx`.
 * 4. Refine the SVG geometry if the auto-generated stub isn't distinctive
 *    enough, then commit both files.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── Field type definitions ───────────────────────────────────────────────────

type FieldType = "text" | "textarea" | "number" | "select" | "radio" | "array" | "slot" | string;

interface ParsedField {
  name: string;
  type: FieldType;
  arrayFields?: ParsedField[];
}

interface FieldSignature {
  hasImage: boolean;          // field name matches image/img/photo/logo/background/bg/etc.
  hasVideo: boolean;          // field name matches video/mp4/clip
  hasItems: boolean;          // has at least one array field
  hasOnlyButtonsArray: boolean; // all arrays are named buttons/ctas/actions/links
  hasButtonsArray: boolean;   // any array named buttons/ctas/actions
  hasSlot: boolean;           // has a slot field (layout container)
  hasLinkField: boolean;      // top-level text field named url/href/link
  itemHasImage: boolean;      // array's arrayFields contain an image-named field
  itemHasText: boolean;       // array's arrayFields contain text/textarea
  itemHasUrl: boolean;        // array's arrayFields contain url/href/link named field
  textFieldCount: number;     // content text/textarea fields (excludes image, link, control meta)
  hasTextarea: boolean;       // any textarea field
  hasNumber: boolean;         // any number field
  isFormControl: boolean;     // leaf-level UI control: no image/items/slot, mostly select/radio/number
  totalFieldCount: number;
}

// ─── Field name predicates ────────────────────────────────────────────────────

function isImageFieldName(name: string): boolean {
  return /(image|img|photo|logo|background|bg|thumbnail|poster|banner|cover|avatar)(?!color|size|position|align|mode)/i.test(name);
}

function isVideoFieldName(name: string): boolean {
  return /video|mp4|clip|movie|webm/i.test(name);
}

function isLinkFieldName(name: string): boolean {
  return /^(url|href|link|src)$/i.test(name);
}

function isButtonArrayName(name: string): boolean {
  return /^(buttons?|ctas?|actions?|links?)$/i.test(name);
}

// Fields that describe a UI control's configuration rather than page content.
// Excluded from textFieldCount so that form components (AudiTextField etc.)
// with label/placeholder/hint/error still classify as isFormControl.
function isControlMetaField(name: string): boolean {
  return /^(label|placeholder|hint|error(Message)?|helperText|ariaLabel|aria[-_]label|caption|legend|tooltip)$/i.test(name);
}

// ─── Field signature builder ──────────────────────────────────────────────────

function buildFieldSignature(fields: ParsedField[]): FieldSignature {
  let hasImage = false;
  let hasVideo = false;
  let hasItems = false;
  let hasSlot = false;
  let hasLinkField = false;
  let hasTextarea = false;
  let hasNumber = false;
  let itemHasImage = false;
  let itemHasText = false;
  let itemHasUrl = false;
  let textFieldCount = 0;
  let selectRadioNumberCount = 0;
  const arrayFields: ParsedField[] = [];

  for (const f of fields) {
    if (f.type === "slot") {
      hasSlot = true;
    } else if (f.type === "array") {
      hasItems = true;
      arrayFields.push(f);
      for (const af of f.arrayFields ?? []) {
        if (isImageFieldName(af.name)) itemHasImage = true;
        if (af.type === "text" || af.type === "textarea") itemHasText = true;
        if (isLinkFieldName(af.name)) itemHasUrl = true;
      }
    } else if (f.type === "text" || f.type === "textarea") {
      if (isImageFieldName(f.name)) {
        hasImage = true;
      } else if (isVideoFieldName(f.name)) {
        hasVideo = true;
      } else if (isLinkFieldName(f.name)) {
        hasLinkField = true;
      } else if (!isControlMetaField(f.name)) {
        textFieldCount++;
        if (f.type === "textarea") hasTextarea = true;
      }
    } else if (f.type === "number") {
      hasNumber = true;
      selectRadioNumberCount++;
    } else if (f.type === "select" || f.type === "radio") {
      selectRadioNumberCount++;
    }
  }

  const hasButtonsArray = arrayFields.some((a) => isButtonArrayName(a.name));
  const hasOnlyButtonsArray = hasItems && arrayFields.every((a) => isButtonArrayName(a.name));

  // A form control has no content image/items/slot, at least one
  // select/radio/number field, and at most one content text field.
  const isFormControl =
    !hasImage &&
    !hasItems &&
    !hasSlot &&
    selectRadioNumberCount >= 1 &&
    textFieldCount <= 1 &&
    fields.length > 0;

  return {
    hasImage, hasVideo, hasItems, hasOnlyButtonsArray, hasButtonsArray,
    hasSlot, hasLinkField, itemHasImage, itemHasText, itemHasUrl,
    textFieldCount, hasTextarea, hasNumber, isFormControl,
    totalFieldCount: fields.length,
  };
}

// ─── Signature-based layout classifier ───────────────────────────────────────

function classifyBySignature(sig: FieldSignature): Layout | null {
  if (sig.totalFieldCount === 0) return null;

  // Slot → layout container
  if (sig.hasSlot) return "container";

  // Leaf UI control (form input, button, indicator)
  if (sig.isFormControl) return "form-control";

  // Items-driven — ignore buttons-only arrays (they're CTAs, not content rows)
  if (sig.hasItems && !sig.hasOnlyButtonsArray) {
    if (sig.itemHasImage && sig.itemHasText) return "card-strip";
    if (sig.itemHasImage && !sig.itemHasText) return "image-grid";
    if (!sig.itemHasImage && sig.itemHasUrl) return "list-rows";
    return "card-strip";
  }

  // Image-driven
  if (sig.hasImage && sig.textFieldCount >= 2) return "split-image";
  if (sig.hasImage) return "hero";

  // Text-only
  if (sig.hasTextarea && !sig.hasImage && !sig.hasItems) return "article-body";
  if (sig.textFieldCount >= 1) return "centered-text";

  return null;
}

// ─── Field parsing ────────────────────────────────────────────────────────────

/**
 * String-aware bracket balancer. Extracts the balanced {...} block starting
 * at or after `fromIdx`. Returns the slice from the opening `{` through its
 * matching `}` inclusive.
 */
function extractBlock(src: string, fromIdx: number): string {
  let i = fromIdx;
  while (i < src.length && src[i] !== "{") i++;
  if (i >= src.length) return "";
  const start = i;
  let depth = 0;
  let inStr = false;
  let strChar = "";

  while (i < src.length) {
    const ch = src[i];
    if (inStr) {
      if (ch === "\\" && strChar !== "`") { i += 2; continue; }
      if (ch === strChar) inStr = false;
    } else if (ch === '"' || ch === "'" || ch === "`") {
      inStr = true; strChar = ch;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      if (--depth === 0) return src.slice(start, i + 1);
    }
    i++;
  }
  return src.slice(start);
}

/**
 * Parses the top-level Puck field definitions from a `fields: { ... }` block.
 * Only entries with a `type:` property are treated as fields.
 */
function parseTopLevelFields(fieldsBlock: string): ParsedField[] {
  const fields: ParsedField[] = [];
  let i = 0;
  // Advance past the opening brace
  while (i < fieldsBlock.length && fieldsBlock[i] !== "{") i++;
  i++;

  while (i < fieldsBlock.length) {
    while (i < fieldsBlock.length && /[\s,]/.test(fieldsBlock[i])) i++;
    if (i >= fieldsBlock.length || fieldsBlock[i] === "}") break;

    // Skip single-line comments
    if (fieldsBlock[i] === "/" && fieldsBlock[i + 1] === "/") {
      while (i < fieldsBlock.length && fieldsBlock[i] !== "\n") i++;
      continue;
    }

    const identMatch = fieldsBlock.slice(i).match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/);
    if (!identMatch) { i++; continue; }

    const fieldName = identMatch[1];
    i += identMatch[0].length;
    while (i < fieldsBlock.length && /\s/.test(fieldsBlock[i])) i++;

    if (i < fieldsBlock.length && fieldsBlock[i] === "{") {
      const valueBlock = extractBlock(fieldsBlock, i);
      i += valueBlock.length;

      // Only treat as a Puck field if the value object has a `type:` property
      const typeMatch = valueBlock.match(/\btype\s*:\s*["']([^"']+)["']/);
      if (typeMatch) {
        const fieldType = typeMatch[1];
        const field: ParsedField = { name: fieldName, type: fieldType };

        if (fieldType === "array") {
          const afMatch = valueBlock.match(/\barrayFields\s*:/);
          if (afMatch && afMatch.index !== undefined) {
            const afBlock = extractBlock(valueBlock, afMatch.index + afMatch[0].length);
            if (afBlock) field.arrayFields = parseTopLevelFields(afBlock);
          }
        }
        fields.push(field);
      }
    } else {
      // Skip non-object value (primitive, array literal, etc.)
      let bracketDepth = 0;
      let inStr2 = false;
      let strChar2 = "";
      while (i < fieldsBlock.length) {
        const ch = fieldsBlock[i];
        if (inStr2) {
          if (ch === "\\" && strChar2 !== "`") { i += 2; continue; }
          if (ch === strChar2) inStr2 = false;
        } else if (ch === '"' || ch === "'" || ch === "`") {
          inStr2 = true; strChar2 = ch;
        } else if (ch === "[" || ch === "{" || ch === "(") {
          bracketDepth++;
        } else if (ch === "]" || ch === "}" || ch === ")") {
          if (bracketDepth === 0) break;
          bracketDepth--;
        } else if (ch === "," && bracketDepth === 0) {
          break;
        }
        i++;
      }
    }
  }
  return fields;
}

/**
 * Tries to extract field definitions for a component defined inline in `src`
 * (my-app style: `ComponentName: { fields: { ... } }`).
 * Returns null if the component is not found, [] if found but has no fields.
 */
function extractFieldsFromSrc(src: string, componentName: string): ParsedField[] | null {
  const rx = new RegExp(`(?<![a-zA-Z0-9_$])${componentName}\\s*:`, "g");
  let match: RegExpExecArray | null;

  while ((match = rx.exec(src)) !== null) {
    let pos = match.index + match[0].length;
    // Skip whitespace after the colon
    while (pos < src.length && /[ \t\r\n]/.test(src[pos])) pos++;
    // Must be followed by { to be an inline definition (not an imported var)
    if (src[pos] !== "{") continue;

    const compBlock = extractBlock(src, pos);
    if (!compBlock) continue;

    // Skip TypeScript type/interface definitions — real Puck components always have a `render:` key
    if (!compBlock.match(/\brender\s*:/)) continue;

    const fieldsMatch = compBlock.match(/\bfields\s*:/);
    if (!fieldsMatch || fieldsMatch.index === undefined) return []; // component found, no fields

    const fieldsBlock = extractBlock(compBlock, fieldsMatch.index + fieldsMatch[0].length);
    if (!fieldsBlock) return null;

    return parseTopLevelFields(fieldsBlock);
  }
  return null;
}

/** Recursively collects all .ts/.tsx files under `dir`, skipping `exclude` dirs. */
function findTSFiles(dir: string, exclude: string[]): string[] {
  const results: string[] = [];
  function walk(d: string) {
    let entries: string[];
    try { entries = fs.readdirSync(d); } catch { return; }
    for (const e of entries) {
      if (exclude.includes(e)) continue;
      const full = path.join(d, e);
      let stat: fs.Stats;
      try { stat = fs.statSync(full); } catch { continue; }
      if (stat.isDirectory()) walk(full);
      else if (e.endsWith(".tsx") || e.endsWith(".ts")) results.push(full);
    }
  }
  walk(dir);
  return results;
}

/**
 * Handles imported-config style (airbus: `TopNav: topNavConfig`).
 * Finds the variable name assigned to the component in the main config,
 * then traces it to the source file containing `const topNavConfig = { fields: {...} }`.
 */
function findImportedVarFields(
  puckConfigSrc: string,
  componentName: string,
  rootDir: string,
): ParsedField[] | null {
  // Find `ComponentName: someVar` in the main config
  const assignRx = new RegExp(
    `(?<![a-zA-Z0-9_$])${componentName}\\s*:\\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*[,}\\n]`,
    "m",
  );
  const assignMatch = assignRx.exec(puckConfigSrc);
  if (!assignMatch) return null;

  const varName = assignMatch[1];
  if (!varName || ["true", "false", "null", "undefined"].includes(varName)) return null;

  const files = findTSFiles(rootDir, ["node_modules", "vendor", "dist", ".next", ".cache", "__tests__", "tests"]);

  for (const filePath of files) {
    if (filePath.endsWith("puck.config.tsx") || filePath.endsWith("puck.config.ts")) continue;
    if (filePath.includes("generate-thumbnails")) continue;

    let src: string;
    try { src = fs.readFileSync(filePath, "utf8"); } catch { continue; }
    if (!src.includes(varName)) continue;

    // Find `const varName` or `export const varName`
    const varRx = new RegExp(`(?:export\\s+)?const\\s+${varName}\\b`);
    const varMatch = varRx.exec(src);
    if (!varMatch || varMatch.index === undefined) continue;

    // Skip past the declaration to the `=` sign, then find the opening `{`
    const afterDecl = src.slice(varMatch.index + varMatch[0].length);
    const eqIdx = afterDecl.indexOf("=");
    if (eqIdx === -1) continue;

    const objBlock = extractBlock(afterDecl, eqIdx + 1);
    if (!objBlock) continue;

    const fieldsMatch = objBlock.match(/\bfields\s*:/);
    if (!fieldsMatch || fieldsMatch.index === undefined) continue;

    const fieldsBlock = extractBlock(objBlock, fieldsMatch.index + fieldsMatch[0].length);
    if (!fieldsBlock) continue;

    const parsed = parseTopLevelFields(fieldsBlock);
    if (parsed.length > 0) return parsed;
  }
  return null;
}

/**
 * Strategy 3: component is spread-imported into the main config (e.g. `...pccConfigs`).
 * Finds all `...someVar` spreads in the components block, traces each to its
 * source file, and looks for `ComponentName: { fields: ... }` inside that object.
 */
function findInSpreadImports(
  puckConfigSrc: string,
  componentName: string,
  rootDir: string,
): ParsedField[] | null {
  // Find the components: { ... } block
  const compBlockMatch = puckConfigSrc.match(/\bcomponents\s*:\s*\{/);
  if (!compBlockMatch || compBlockMatch.index === undefined) return null;
  const compBlock = extractBlock(puckConfigSrc, compBlockMatch.index + compBlockMatch[0].length - 1);
  if (!compBlock) return null;

  // Collect all spread variable names: `...someVar`
  const spreadRx = /\.\.\.([\w$]+)/g;
  let m: RegExpExecArray | null;
  const spreadVars: string[] = [];
  while ((m = spreadRx.exec(compBlock)) !== null) {
    spreadVars.push(m[1]);
  }

  for (const varName of spreadVars) {
    // Find the import that brings varName into scope
    const importRx = new RegExp(
      `import\\s*\\{[^}]*\\b${varName}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
    );
    const importMatch = importRx.exec(puckConfigSrc);
    if (!importMatch) continue;

    const relPath = importMatch[1];
    const candidates = [
      path.resolve(rootDir, relPath) + ".tsx",
      path.resolve(rootDir, relPath) + ".ts",
      path.resolve(rootDir, relPath),
    ];
    let src: string | null = null;
    for (const c of candidates) {
      try { src = fs.readFileSync(c, "utf8"); break; } catch { /* try next */ }
    }
    if (!src) continue;

    // Find `const varName = { ... }` or `export const varName = { ... }`
    const defRx = new RegExp(`(?:export\\s+)?const\\s+${varName}\\s*=\\s*\\{`);
    const defMatch = defRx.exec(src);
    if (!defMatch || defMatch.index === undefined) continue;

    const objBlock = extractBlock(src, defMatch.index + defMatch[0].length - 1);
    if (!objBlock) continue;

    // Now look for ComponentName: { ... render: ..., fields: ... } inside that object
    const result = extractFieldsFromSrc(objBlock, componentName);
    if (result !== null) return result;
  }
  return null;
}

/**
 * Master resolver: tries inline extraction first, then import tracing,
 * then spread-import tracing.
 * Returns null if the component's fields cannot be found statically.
 */
function findComponentFields(
  rootDir: string,
  puckConfigSrc: string,
  name: string,
): ParsedField[] | null {
  const inline = extractFieldsFromSrc(puckConfigSrc, name);
  if (inline !== null) return inline;
  const imported = findImportedVarFields(puckConfigSrc, name, rootDir);
  if (imported !== null) return imported;
  return findInSpreadImports(puckConfigSrc, name, rootDir);
}

// ─── Read component names from puck.config.tsx ────────────────────────────────

function readComponentNames(src: string, rootDir: string): string[] {
  const names: string[] = [];

  // Find the `components: { ... }` block once — used by strategies 1 and 3.
  const compBlockMatch = src.match(/\bcomponents\s*:\s*\{/);
  const compBlock = compBlockMatch && compBlockMatch.index !== undefined
    ? extractBlock(src, compBlockMatch.index + compBlockMatch[0].length - 1)
    : null;

  // Strategy 1: inline keys inside the components block (PascalCase key followed by colon).
  if (compBlock) {
    const keyPattern = /^\s{2,4}([A-Z][A-Za-z0-9]*)\s*:/;
    for (const line of compBlock.split("\n")) {
      const m = line.match(keyPattern);
      if (m) names.push(m[1]);
    }
  }

  // Strategy 2: names inside `components: [...]` arrays within the categories block.
  // Only extract from component arrays, not from title: strings (which may start with uppercase).
  const categoriesMatch = src.match(/categories\s*:\s*\{([\s\S]*?)\}\s*[;,]?\s*\n\}/);
  if (categoriesMatch) {
    const compArrayRx = /\bcomponents\s*:\s*\[([^\]]*)\]/g;
    let arrMatch: RegExpExecArray | null;
    while ((arrMatch = compArrayRx.exec(categoriesMatch[1])) !== null) {
      const quoted = arrMatch[1].match(/"[A-Z][A-Za-z0-9]*"/g) ?? [];
      for (const q of quoted) names.push(q.slice(1, -1));
    }
  }

  // Strategy 3: trace spread imports (`...blockConfigs`) inside the components block
  // and collect top-level PascalCase keys from the spread object's source file.
  if (compBlock) {
    const spreadRx = /\.\.\.([\w$]+)/g;
    let sm: RegExpExecArray | null;
    while ((sm = spreadRx.exec(compBlock)) !== null) {
      const varName = sm[1];
      // Find the import for varName
      const importRx = new RegExp(
        `import\\s*\\{[^}]*\\b${varName}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
      );
      const importMatch = importRx.exec(src);
      if (!importMatch) continue;

      const relPath = importMatch[1];
      const candidates = [
        path.resolve(rootDir, relPath) + ".tsx",
        path.resolve(rootDir, relPath) + ".ts",
        path.resolve(rootDir, relPath),
      ];
      let spreadSrc: string | null = null;
      for (const c of candidates) {
        try { spreadSrc = fs.readFileSync(c, "utf8"); break; } catch { /* try next */ }
      }
      if (!spreadSrc) continue;

      // Find `export const varName = { ... }` and extract its top-level PascalCase keys
      const defRx = new RegExp(`(?:export\\s+)?const\\s+${varName}\\s*=\\s*\\{`);
      const defMatch = defRx.exec(spreadSrc);
      if (!defMatch || defMatch.index === undefined) continue;

      const objBlock = extractBlock(spreadSrc, defMatch.index + defMatch[0].length - 1);
      if (!objBlock) continue;

      const keyRx = /^\s{2,4}([A-Z][A-Za-z0-9]*)\s*:/mg;
      let km: RegExpExecArray | null;
      while ((km = keyRx.exec(objBlock)) !== null) {
        names.push(km[1]);
      }
    }
  }

  if (names.length === 0) {
    throw new Error(
      "No components found in puck.config.tsx. " +
      "Ensure components are defined in a `components: { ... }` block " +
      "or listed in a `categories: { ... }` block.",
    );
  }

  return Array.from(new Set(names));
}

// ─── Layout heuristics ────────────────────────────────────────────────────────

type Layout =
  | "nav-bar"        // horizontal navigation bar
  | "hero"           // full-bleed image + centered text overlay
  | "split-image"    // half image / half text
  | "hero-overlay"   // full-bleed image with bottom text band
  | "card-strip"     // horizontal scrolling card row
  | "image-grid"     // grid of image placeholders
  | "main-thumbs"    // large image + thumbnail strip below
  | "mosaic"         // asymmetric image mosaic
  | "columns"        // equal-width stat/pillar columns
  | "centered-text"  // centred heading only
  | "card-grid"      // card grid with image + text
  | "list-rows"      // list of items with icon/download
  | "footer"         // dark multi-column footer
  | "article-header" // article header with breadcrumbs + meta
  | "article-body"   // centred text column
  | "animated"       // full-bleed image with arrow navigation
  | "container"      // slot-based layout wrapper
  | "form-control"   // leaf-level UI input / control
  | "default";

function inferLayout(name: string, fields: ParsedField[] | null): Layout {
  // Primary: name heuristics — component names carry strong semantic signal.
  // These take priority because names like Hero, Carousel, Subnav uniquely
  // identify a layout regardless of field structure.
  const n = name.toLowerCase();
  if (/(subnav|topnav|navbar|nav$|header$|menu$)/.test(n)) return "nav-bar";
  if (/hero/.test(n)) return "hero";
  if (/(footer)/.test(n)) return "footer";
  if (/(featurecalloutlarge|herolarge|bannerlarge)/.test(n)) return "hero-overlay";
  if (/(featurecallout|cta|factbox|mediatext|profilecard|split)/.test(n)) return "split-image";
  if (/(carousel|news|related|blog)/.test(n)) return "card-strip";
  if (/(lightboxcarousel)/.test(n)) return "main-thumbs";
  if (/(featuregallery|mosaic)/.test(n)) return "mosaic";
  if (/(lightbox|gallery)/.test(n)) return "image-grid";
  if (/(animatedgallery|slider)/.test(n)) return "animated";
  if (/(stats|facts|pillars|metrics)/.test(n)) return "columns";
  if (/(sectionheader|sectiontitle|divider)/.test(n)) return "centered-text";
  if (/(infocard|card.*grid|grid.*card|feature.*grid)/.test(n)) return "card-grid";
  if (/(download|file|attachment|resource)/.test(n)) return "list-rows";
  if (/(pccarticleheader|articleheader)/.test(n)) return "article-header";
  if (/(pccarticlebody|articlebody|richtext|content)/.test(n)) return "article-body";

  // Secondary: field-signature classification — for components with opaque names
  // (e.g. design-system components like AudiButton, AudiLayout, AudiTextField)
  // where name gives no layout signal but field structure does.
  if (fields && fields.length > 0) {
    const sig = buildFieldSignature(fields);
    const layout = classifyBySignature(sig);
    if (process.env.DEBUG_THUMBNAILS) {
      console.log(
        `  ${name}: fields=${fields.length}, sig=${JSON.stringify({ hasImage: sig.hasImage, hasItems: sig.hasItems, hasSlot: sig.hasSlot, isFormControl: sig.isFormControl, textFieldCount: sig.textFieldCount })}, layout=${layout ?? "default"}`,
      );
    }
    if (layout) return layout;
  }

  return "default";
}

// ─── SVG code generators ──────────────────────────────────────────────────────

type Lines = string[];

function navBar(name: string): Lines {
  return [
    `/** ${name} — navigation bar */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_DARK} />`,
    `      <R w={60} h={14} fill={BG_PANEL} />`,
    `      <R x={4} y={4} w={7} h={6} fill={TEXT_BRIGHT} rx={0.5} />`,
    `      <line x1={14} y1={2} x2={14} y2={12} stroke={SEP} strokeWidth={0.5} />`,
    `      <T x={17} y={5.5} w={7} fill={TEXT_DIM} />`,
    `      <T x={27} y={5.5} w={6} fill={TEXT_DIM} />`,
    `      <T x={36} y={5.5} w={8} fill={TEXT_DIM} />`,
    `      <Btn x={47} y={4} w={9} h={6} />`,
    `      <T x={10} y={22} w={40} h={2.5} fill={TEXT_VERY_DIM} />`,
    `      <T x={14} y={28} w={32} h={2} fill={TEXT_VERY_DIM} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function hero(name: string): Lines {
  return [
    `/** ${name} — full-bleed image with centered heading + CTA */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <Img x={0} y={0} w={60} h={40} fill="#2a2f34" />`,
    `      <T x={10} y={12} w={40} h={4} fill={TEXT_BRIGHT} />`,
    `      <T x={18} y={19} w={24} h={2.5} fill={TEXT_DIM} />`,
    `      <Btn x={16} y={27} w={14} />`,
    `      <circle cx={30} cy={37} r={1.5} fill={TEXT_DIM} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function heroOverlay(name: string): Lines {
  return [
    `/** ${name} — full-bleed image with bottom text band */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <Img x={0} y={0} w={60} h={40} fill="#2a2f34" />`,
    `      <defs>`,
    `        <linearGradient id="grad-${name.toLowerCase()}" x1="0" y1="0" x2="0" y2="1">`,
    `          <stop offset="0%" stopColor="transparent" />`,
    `          <stop offset="100%" stopColor="#1e2023" stopOpacity={0.95} />`,
    `        </linearGradient>`,
    `      </defs>`,
    `      <rect x={0} y={16} width={60} height={24} fill="url(#grad-${name.toLowerCase()})" />`,
    `      <T x={4} y={20} w={10} h={1.8} fill={ACCENT} />`,
    `      <T x={4} y={24} w={36} h={3.5} fill={TEXT_BRIGHT} />`,
    `      <T x={4} y={30} w={28} h={2} fill={TEXT_DIM} />`,
    `      <Btn x={4} y={34} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function splitImage(name: string): Lines {
  return [
    `/** ${name} — image left, text + button right */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_DARK} />`,
    `      <Img x={0} y={0} w={28} h={40} />`,
    `      <T x={32} y={8} w={10} h={2} fill={ACCENT} />`,
    `      <T x={32} y={13} w={24} h={3} fill={TEXT_BRIGHT} />`,
    `      <T x={32} y={18} w={20} h={3} fill={TEXT_BRIGHT} />`,
    `      <T x={32} y={24} w={22} h={1.8} fill={TEXT_DIM} />`,
    `      <T x={32} y={27} w={18} h={1.8} fill={TEXT_DIM} />`,
    `      <Btn x={32} y={32} w={16} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function cardStrip(name: string): Lines {
  return [
    `/** ${name} — heading + horizontal card strip */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_DARK} />`,
    `      <T x={4} y={4} w={8} h={2} fill={TEXT_DIM} />`,
    `      <T x={4} y={8} w={22} h={3} fill={TEXT_BRIGHT} />`,
    `      {[0, 1, 2].map((i) => {`,
    `        const cx = 4 + i * 19;`,
    `        return (`,
    `          <g key={i}>`,
    `            <Img x={cx} y={14} w={16} h={11} />`,
    `            <T x={cx} y={27} w={14} h={2.5} />`,
    `            <T x={cx} y={31} w={10} h={2} fill={TEXT_DIM} />`,
    `          </g>`,
    `        );`,
    `      })}`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function imageGrid(name: string): Lines {
  return [
    `/** ${name} — 3×2 image grid */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_DARK} />`,
    `      {[0, 1, 2].map((col) =>`,
    `        [0, 1].map((row) => {`,
    `          const gx = 2 + col * 20;`,
    `          const gy = 2 + row * 19;`,
    `          return (`,
    `            <g key={\`\${col}-\${row}\`}>`,
    `              <Img x={gx} y={gy} w={17} h={16} />`,
    `            </g>`,
    `          );`,
    `        }),`,
    `      )}`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function mainThumbs(name: string): Lines {
  return [
    `/** ${name} — large image + thumbnail strip */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_DARK} />`,
    `      <Img x={1} y={1} w={58} h={26} />`,
    `      {[0, 1, 2, 3, 4].map((i) => (`,
    `        <Img key={i} x={2 + i * 12} y={29} w={10} h={9}`,
    `          fill={i === 1 ? BG_PANEL : BG_IMAGE} />`,
    `      ))}`,
    `      <rect x={14} y={29} width={10} height={9} fill="none"`,
    `        stroke={ACCENT} strokeWidth={0.8} rx={0.5} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function mosaic(name: string): Lines {
  return [
    `/** ${name} — mosaic: large left + 2 stacked right */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_DARK} />`,
    `      <Img x={1} y={1} w={35} h={38} />`,
    `      <Img x={38} y={1} w={21} h={18} />`,
    `      <Img x={38} y={21} w={21} h={18} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function animated(name: string): Lines {
  return [
    `/** ${name} — full-bleed image with prev/next arrows */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <Img x={0} y={0} w={60} h={40} fill="#2a2f34" />`,
    `      <R x={2} y={14} w={8} h={12} fill="rgba(0,0,0,0.45)" rx={1} />`,
    `      <polyline points="8,16 4,20 8,24" fill="none"`,
    `        stroke={TEXT_BRIGHT} strokeWidth={1.2} strokeLinejoin="round" />`,
    `      <R x={50} y={14} w={8} h={12} fill="rgba(0,0,0,0.45)" rx={1} />`,
    `      <polyline points="52,16 56,20 52,24" fill="none"`,
    `        stroke={TEXT_BRIGHT} strokeWidth={1.2} strokeLinejoin="round" />`,
    `      <R x={0} y={32} w={60} h={8} fill="rgba(0,0,0,0.6)" />`,
    `      <T x={4} y={35} w={30} h={2} fill={TEXT_DIM} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function columns(name: string): Lines {
  return [
    `/** ${name} — 3-column stat/pillar layout */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_LIGHT} />`,
    `      {[0, 1, 2].map((i) => {`,
    `        const cx = 4 + i * 19;`,
    `        return (`,
    `          <g key={i}>`,
    `            <T x={cx} y={10} w={14} h={5} fill={TEXT_ON_LIGHT} />`,
    `            <T x={cx} y={18} w={12} h={2} fill={TEXT_ON_LIGHT_DIM} />`,
    `            <T x={cx} y={22} w={10} h={2} fill={TEXT_ON_LIGHT_DIM} />`,
    `            {i < 2 && (`,
    `              <line x1={cx + 17} y1={6} x2={cx + 17} y2={34}`,
    `                stroke="rgba(0,0,0,0.12)" strokeWidth={0.5} />`,
    `            )}`,
    `          </g>`,
    `        );`,
    `      })}`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function centeredText(name: string): Lines {
  return [
    `/** ${name} — centered heading */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_DARK} />`,
    `      <T x={8} y={14} w={44} h={4.5} fill={TEXT_BRIGHT} />`,
    `      <T x={16} y={21} w={28} h={2.5} fill={TEXT_DIM} />`,
    `      <line x1={24} y1={26} x2={36} y2={26} stroke={SEP} strokeWidth={0.8} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function cardGrid(name: string): Lines {
  return [
    `/** ${name} — 3-column card grid */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_DARK} />`,
    `      <T x={4} y={3} w={18} h={2.5} fill={TEXT_BRIGHT} />`,
    `      {[0, 1, 2].map((i) => {`,
    `        const cx = 4 + i * 19;`,
    `        return (`,
    `          <g key={i}>`,
    `            <R x={cx} y={8} w={16} h={28} fill={BG_PANEL} rx={1} />`,
    `            <Img x={cx} y={8} w={16} h={12} fill="#32373d" />`,
    `            <T x={cx + 2} y={23} w={12} h={2.5} />`,
    `            <T x={cx + 2} y={27} w={10} h={2} fill={TEXT_DIM} />`,
    `          </g>`,
    `        );`,
    `      })}`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function listRows(name: string): Lines {
  return [
    `/** ${name} — list of downloadable items */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_LIGHT} />`,
    `      <T x={4} y={4} w={24} h={3} fill={TEXT_ON_LIGHT} />`,
    `      {[0, 1, 2].map((i) => {`,
    `        const ry = 11 + i * 9;`,
    `        return (`,
    `          <g key={i}>`,
    `            <R x={4} y={ry} w={52} h={7} fill="rgba(0,0,0,0.06)" rx={1} />`,
    `            <R x={7} y={ry + 1.5} w={5} h={4} fill={IMG_LIGHT} rx={0.5} />`,
    `            <T x={15} y={ry + 2} w={28} h={2} fill={TEXT_ON_LIGHT} />`,
    `            <T x={48} y={ry + 2} w={4} h={2} fill={TEXT_ON_LIGHT_DIM} />`,
    `          </g>`,
    `        );`,
    `      })}`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function footer(name: string): Lines {
  return [
    `/** ${name} — dark footer with link columns + social circles */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill="#111315" />`,
    `      <line x1={0} y1={6} x2={60} y2={6} stroke={SEP} strokeWidth={0.5} />`,
    `      <R x={4} y={2} w={8} h={3.5} fill={TEXT_DIM} rx={0.5} />`,
    `      {[0, 1, 2].map((col) => {`,
    `        const cx = 18 + col * 12;`,
    `        return (`,
    `          <g key={col}>`,
    `            <T x={cx} y={9} w={9} h={2} fill={TEXT_DIM} />`,
    `            <T x={cx} y={13} w={7} h={1.5} fill={TEXT_VERY_DIM} />`,
    `            <T x={cx} y={16} w={8} h={1.5} fill={TEXT_VERY_DIM} />`,
    `            <T x={cx} y={19} w={6} h={1.5} fill={TEXT_VERY_DIM} />`,
    `          </g>`,
    `        );`,
    `      })}`,
    `      {[0, 1, 2, 3].map((j) => (`,
    `        <circle key={j} cx={5 + j * 6} cy={30} r={2.5}`,
    `          fill={BG_PANEL} stroke={SEP} strokeWidth={0.5} />`,
    `      ))}`,
    `      <line x1={0} y1={35} x2={60} y2={35} stroke={SEP} strokeWidth={0.5} />`,
    `      <T x={4} y={37} w={30} h={1.5} fill={TEXT_VERY_DIM} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function articleHeader(name: string): Lines {
  return [
    `/** ${name} — article header: breadcrumbs + heading + meta row */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <Img x={0} y={0} w={60} h={40} fill="#1e2428" />`,
    `      <defs>`,
    `        <linearGradient id="grad-${name.toLowerCase()}" x1="0" y1="0" x2="0" y2="1">`,
    `          <stop offset="0%" stopColor="#1e2023" stopOpacity={0.5} />`,
    `          <stop offset="100%" stopColor="#1e2023" stopOpacity={0.92} />`,
    `        </linearGradient>`,
    `      </defs>`,
    `      <rect x={0} y={0} width={60} height={40} fill="url(#grad-${name.toLowerCase()})" />`,
    `      <T x={4} y={4} w={6} h={1.5} fill={TEXT_DIM} />`,
    `      <T x={12} y={4} w={1} h={1.5} fill={TEXT_VERY_DIM} />`,
    `      <T x={15} y={4} w={8} h={1.5} fill={TEXT_DIM} />`,
    `      <T x={4} y={10} w={48} h={4} fill={TEXT_BRIGHT} />`,
    `      <T x={4} y={16} w={36} h={4} fill={TEXT_BRIGHT} />`,
    `      <T x={4} y={23} w={44} h={2} fill={TEXT_DIM} />`,
    `      <T x={4} y={33} w={10} h={2} fill={TEXT_DIM} />`,
    `      <R x={17} y={32} w={12} h={3.5} fill={BG_PANEL} rx={2} />`,
    `      <R x={31} y={32} w={10} h={3.5} fill={BG_PANEL} rx={2} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function articleBody(name: string): Lines {
  return [
    `/** ${name} — centred article body text column */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_LIGHT} />`,
    `      <T x={10} y={4} w={40} h={3} fill={TEXT_ON_LIGHT} />`,
    `      <T x={10} y={9} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />`,
    `      <T x={10} y={13} w={36} h={2} fill={TEXT_ON_LIGHT_DIM} />`,
    `      <T x={10} y={17} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />`,
    `      <R x={10} y={22} w={2} h={10} fill={IMG_LIGHT} rx={1} />`,
    `      <T x={14} y={23} w={34} h={2} fill={TEXT_ON_LIGHT} />`,
    `      <T x={14} y={27} w={30} h={2} fill={TEXT_ON_LIGHT_DIM} />`,
    `      <T x={10} y={35} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function container(name: string): Lines {
  return [
    `/** ${name} — slot container (holds child components) */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_DARK} />`,
    `      <rect x={4} y={4} width={52} height={32} fill="none"`,
    `        stroke={SEP} strokeWidth={0.8} strokeDasharray="2 1.5" rx={1} />`,
    `      <T x={12} y={15} w={36} h={2.5} fill={TEXT_VERY_DIM} />`,
    `      <T x={16} y={20} w={28} h={2} fill={TEXT_VERY_DIM} />`,
    `      <T x={20} y={25} w={20} h={2} fill={TEXT_VERY_DIM} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function formControl(name: string): Lines {
  return [
    `/** ${name} — form control / UI input */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_DARK} />`,
    `      <T x={4} y={9} w={18} h={2} fill={TEXT_DIM} />`,
    `      <R x={4} y={14} w={52} h={10} fill={BG_PANEL} rx={1.5} />`,
    `      <T x={8} y={18} w={20} h={2} fill={TEXT_VERY_DIM} />`,
    `      <T x={4} y={29} w={28} h={1.5} fill={TEXT_VERY_DIM} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function defaultLayout(name: string): Lines {
  return [
    `/** ${name} — generic content block */`,
    `function ${name}Thumb() {`,
    `  return (`,
    `    <Thumb>`,
    `      <R w={60} h={40} fill={BG_DARK} />`,
    `      <T x={4} y={6} w={32} h={3.5} fill={TEXT_BRIGHT} />`,
    `      <T x={4} y={13} w={52} h={2} fill={TEXT_DIM} />`,
    `      <T x={4} y={17} w={48} h={2} fill={TEXT_DIM} />`,
    `      <T x={4} y={21} w={44} h={2} fill={TEXT_DIM} />`,
    `      <Btn x={4} y={28} />`,
    `    </Thumb>`,
    `  );`,
    `}`,
  ];
}

function generateThumbFn(name: string, fields: ParsedField[] | null): Lines {
  const layout = inferLayout(name, fields);
  switch (layout) {
    case "nav-bar":        return navBar(name);
    case "hero":           return hero(name);
    case "hero-overlay":   return heroOverlay(name);
    case "split-image":    return splitImage(name);
    case "card-strip":     return cardStrip(name);
    case "image-grid":     return imageGrid(name);
    case "main-thumbs":    return mainThumbs(name);
    case "mosaic":         return mosaic(name);
    case "animated":       return animated(name);
    case "columns":        return columns(name);
    case "centered-text":  return centeredText(name);
    case "card-grid":      return cardGrid(name);
    case "list-rows":      return listRows(name);
    case "footer":         return footer(name);
    case "article-header": return articleHeader(name);
    case "article-body":   return articleBody(name);
    case "container":      return container(name);
    case "form-control":   return formControl(name);
    default:               return defaultLayout(name);
  }
}

// ─── Palette extraction ────────────────────────────────────────────────────────
//
// Derives a real brand ACCENT color from the site's own code — no visual
// inspection, no screenshots, no model judgment calls. Two strategies, in
// priority order:
//
// 1. Shared design-tokens file (design-system/tokens.ts and similar) — reads
//    the exported `colors`/`palette`/`theme` object literal and picks the
//    first recognized semantic key (accent, then primary, brand, highlight,
//    secondary) whose value is a non-neutral color.
// 2. No tokens file — scans every component source file for hex and
//    rgb/rgba color literals, normalizes them to RGB tuples (so `#7C3AED`
//    and `rgba(124,58,237,0.4)` count as the same color), discards
//    near-white/near-black/gray neutrals, and takes the most frequent
//    remaining color. This is genuinely how the color gets used most in the
//    UI, which is a reasonable proxy for "the brand accent" absent a formal
//    tokens file.
//
// Falls back to a generic neutral tan if neither strategy finds anything
// (e.g. an all-grayscale component library).

interface ExtractedPalette {
  accent: string;       // hex
  accentLight: string;  // rgba tint of accent (~0.16 alpha) — card/highlight backgrounds
  accentBorder: string; // rgba tint of accent (~0.12 alpha) — hairline borders/underlines
  source: string;       // human-readable provenance, written into the file header comment
}

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB | null {
  const m = hex.replace("#", "").match(/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex([r, g, b]: RGB): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function rgbaTint([r, g, b]: RGB, alpha: number): string {
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Near-white, near-black, or low-saturation (gray) — not useful as a brand accent. */
function isNeutral([r, g, b]: RGB): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 12) return true; // grayscale (including black/white)
  if (r > 235 && g > 235 && b > 235) return true;
  if (r < 20 && g < 20 && b < 20) return true;
  return false;
}

/** Extracts every hex and rgb/rgba color literal in source text as normalized RGB tuples. */
function findColorLiterals(src: string): RGB[] {
  const found: RGB[] = [];
  const hexRx = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
  let m: RegExpExecArray | null;
  while ((m = hexRx.exec(src)) !== null) {
    let hex = m[1];
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const rgb = hexToRgb("#" + hex);
    if (rgb) found.push(rgb);
  }
  const rgbaRx = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
  while ((m = rgbaRx.exec(src)) !== null) {
    found.push([Number(m[1]), Number(m[2]), Number(m[3])]);
  }
  return found;
}

const TOKENS_FILE_CANDIDATES = [
  "design-system/tokens.ts",
  "design-system/tokens.tsx",
  "lib/tokens.ts",
  "lib/design-tokens.ts",
  "styles/tokens.ts",
  "theme.ts",
];

function findTokensFile(rootDir: string): string | null {
  for (const rel of TOKENS_FILE_CANDIDATES) {
    const full = path.join(rootDir, rel);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

/** Extracts flat `key: "value"` string pairs from an exported colors/palette/theme object literal. */
function parseTokensObject(src: string): Record<string, string> {
  const result: Record<string, string> = {};
  const declRx = /export\s+const\s+(colors|palette|theme)\s*=\s*\{/;
  const m = declRx.exec(src);
  if (!m || m.index === undefined) return result;
  const block = extractBlock(src, m.index + m[0].length - 1);
  const entryRx = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*["']([^"']+)["']/g;
  let em: RegExpExecArray | null;
  while ((em = entryRx.exec(block)) !== null) {
    result[em[1]] = em[2];
  }
  return result;
}

const ACCENT_KEY_PRIORITY = ["accent", "primary", "brand", "highlight", "secondary"];

function deriveSitePalette(rootDir: string): ExtractedPalette {
  const fallback: ExtractedPalette = {
    accent: "#b8956a",
    accentLight: "rgba(184,149,106,0.16)",
    accentBorder: "rgba(184,149,106,0.12)",
    source: "generic default (no tokens file, no non-neutral colors found in components)",
  };

  // Strategy 1 — shared design-tokens file.
  const tokensPath = findTokensFile(rootDir);
  if (tokensPath) {
    const src = fs.readFileSync(tokensPath, "utf8");
    const tokens = parseTokensObject(src);

    // 1a. Preferred semantic key names (accent, primary, brand, ...).
    for (const key of ACCENT_KEY_PRIORITY) {
      const val = tokens[key];
      if (!val || !val.startsWith("#")) continue;
      const rgb = hexToRgb(val);
      if (rgb && !isNeutral(rgb)) {
        return {
          accent: rgbToHex(rgb),
          accentLight: rgbaTint(rgb, 0.16),
          accentBorder: rgbaTint(rgb, 0.12),
          source: `${path.relative(rootDir, tokensPath)} (colors.${key})`,
        };
      }
    }

    // 1b. No semantic key matched (e.g. the site names its tokens navy/gold/blue
    // instead of accent/primary/brand) — fall back to the first non-neutral color
    // declared in the tokens object itself, in source order. This is still a real
    // brand color from the site's own design system, unlike Strategy 2 below
    // (which scans unrelated component files and can pick up an incidental gray).
    for (const [key, val] of Object.entries(tokens)) {
      if (!val.startsWith("#")) continue;
      const rgb = hexToRgb(val);
      if (rgb && !isNeutral(rgb)) {
        return {
          accent: rgbToHex(rgb),
          accentLight: rgbaTint(rgb, 0.16),
          accentBorder: rgbaTint(rgb, 0.12),
          source: `${path.relative(rootDir, tokensPath)} (colors.${key} — first non-neutral token; no accent/primary/brand/highlight/secondary key present)`,
        };
      }
    }
  }

  // Strategy 2 — aggregate color literals across every component/app source file.
  const scanDirs = ["components", "app"].map((d) => path.join(rootDir, d));
  const files = scanDirs.flatMap((d) => findTSFiles(d, ["node_modules", ".next"]));
  const tally = new Map<string, { rgb: RGB; count: number }>();
  for (const file of files) {
    let src: string;
    try { src = fs.readFileSync(file, "utf8"); } catch { continue; }
    for (const rgb of findColorLiterals(src)) {
      if (isNeutral(rgb)) continue;
      const key = rgb.join(",");
      const existing = tally.get(key);
      if (existing) existing.count++;
      else tally.set(key, { rgb, count: 1 });
    }
  }
  const ranked = Array.from(tally.values()).sort((a, b) => b.count - a.count);
  if (ranked.length > 0) {
    const { rgb } = ranked[0];
    return {
      accent: rgbToHex(rgb),
      accentLight: rgbaTint(rgb, 0.16),
      accentBorder: rgbaTint(rgb, 0.12),
      source: `most-frequent non-neutral color across ${files.length} component/app source files (no tokens file found at any of: ${TOKENS_FILE_CANDIDATES.join(", ")})`,
    };
  }

  return fallback;
}

// ─── File template ────────────────────────────────────────────────────────────

function buildFile(names: string[], configSrc: string, rootDir: string): string {
  // Pre-compute fields for all components
  const fieldsMap = new Map<string, ParsedField[] | null>();
  for (const name of names) {
    fieldsMap.set(name, findComponentFields(rootDir, configSrc, name));
  }

  const thumbFns = names
    .map((n) => generateThumbFn(n, fieldsMap.get(n) ?? null).join("\n"))
    .join("\n\n");

  const mapEntries = names.map((n) => `  ${n}: ${n}Thumb,`).join("\n");

  const palette = deriveSitePalette(rootDir);
  console.log(`Palette: ACCENT=${palette.accent} (source: ${palette.source})`);

  return `/**
 * component-thumbnails.tsx
 *
 * AUTO-GENERATED — do not edit by hand.
 * Run \`pnpm generate-thumbnails\` to regenerate from puck.config.tsx.
 *
 * Layout is inferred from field definitions (field-signature classifier)
 * with name-based heuristics as fallback. Set DEBUG_THUMBNAILS=1 to
 * see classification decisions.
 *
 * ACCENT is derived from the site's own code, not chosen by hand or by
 * looking at screenshots — see "Palette extraction" in generate-thumbnails.ts.
 * Source for this run: ${palette.source}
 *
 * To customise a thumbnail: edit the generated SVG geometry in the
 * corresponding *Thumb function below, then commit the file. Re-running
 * the generator will overwrite your changes, so note any customisations
 * in a comment so they can be reapplied.
 *
 * ViewBox: 60×40 (3:2). Displayed at any size via CSS — no blur at any DPR.
 */

import React from "react";
import type { ThumbnailMap } from "@pantheon-systems/puck-css";

// ─── Palette ──────────────────────────────────────────────────────────────────

const BG_DARK = "#1e2023";
const BG_PANEL = "#2c3035";
const BG_IMAGE = "#3d4349";
const TEXT_BRIGHT = "rgba(255,255,255,0.82)";
const TEXT_DIM = "rgba(255,255,255,0.40)";
const TEXT_VERY_DIM = "rgba(255,255,255,0.14)";
const ACCENT = "${palette.accent}"; // auto-derived — see file header
const ACCENT_LIGHT = "${palette.accentLight}"; // ACCENT at ~16% — card/highlight fills
const ACCENT_BORDER = "${palette.accentBorder}"; // ACCENT at ~12% — hairline borders/underlines
const SEP = "rgba(255,255,255,0.12)";
const BG_LIGHT = "#e8e6e2";
const IMG_LIGHT = "#bdbbb7";
const TEXT_ON_LIGHT = "rgba(0,0,0,0.55)";
const TEXT_ON_LIGHT_DIM = "rgba(0,0,0,0.25)";

// ─── Primitives ────────────────────────────────────────────────────────────────

function R({ x = 0, y = 0, w, h, fill, rx = 0, opacity }: {
  x?: number; y?: number; w: number; h: number;
  fill: string; rx?: number; opacity?: number;
}) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} rx={rx} opacity={opacity} />;
}

function T({ x, y, w, h = 2.5, fill = TEXT_BRIGHT, rx = 0.8 }: {
  x: number; y: number; w: number; h?: number; fill?: string; rx?: number;
}) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} rx={rx} />;
}

function Img({ x, y, w, h, fill = BG_IMAGE }: {
  x: number; y: number; w: number; h: number; fill?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fill} />
      <line x1={x} y1={y} x2={x + w} y2={y + h} stroke={TEXT_VERY_DIM} strokeWidth={0.6} />
      <line x1={x + w} y1={y} x2={x} y2={y + h} stroke={TEXT_VERY_DIM} strokeWidth={0.6} />
    </g>
  );
}

function Btn({ x, y, w = 14, h = 5, fill = ACCENT }: {
  x: number; y: number; w?: number; h?: number; fill?: string;
}) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} rx={2} />;
}

function Thumb({ children }: { children: React.ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"
      style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {children}
    </svg>
  );
}

// ─── Component wireframes ─────────────────────────────────────────────────────

${thumbFns}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const THUMBNAIL_MAP: ThumbnailMap = {
${mapEntries}
};
`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const configPath = path.join(ROOT, "puck.config.tsx");
const configSrc = fs.readFileSync(configPath, "utf8");

const names = readComponentNames(configSrc, ROOT);
console.log(`Found ${names.length} components: ${names.join(", ")}`);

const output = buildFile(names, configSrc, ROOT);
const outPath = path.join(ROOT, "lib", "component-thumbnails.tsx");
fs.writeFileSync(outPath, output, "utf8");

console.log(`✓ Written to ${path.relative(ROOT, outPath)}`);
console.log("  Run `pnpm tsc --noEmit` to verify, then commit both files.");
