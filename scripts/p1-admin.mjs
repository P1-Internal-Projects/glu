/**
 * Shared admin helper for GLU provisioning scripts.
 *
 * Talks to the CCR REST API directly with an `aak_` agent key sent as
 * `X-API-Key` — the same header the app has always used. The app's own
 * CSS_API_KEY is a `sat_` site token scoped read-only, so template and document
 * writes come back 403 under it; that is why these scripts take a separate key.
 *
 * The worker URL in ~/.p1-demo.env points at a sandbox, so the production base
 * URL is hard-coded rather than read from the environment. A script that
 * provisions the wrong backend is worse than one that refuses to run.
 */
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const BASE_URL = "https://ccr.p1.pantheon.io";
export const SITE_ID = "92f403e4-b910-4a1d-bb22-7e2c02edf5c3";

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")];
      }),
  );
}

function agentKey() {
  const candidates = [
    process.env.P1_AGENT_KEY,
    readEnvFile(join(homedir(), "p1/newsites/p1-sd-zoo-events/.env.local")).CSS_AGENT_KEY,
  ].filter(Boolean);
  const key = candidates.find((k) => k.startsWith("aak_"));
  if (!key) {
    throw new Error(
      "No aak_ agent key found. Set P1_AGENT_KEY. A sat_ site token cannot create templates or documents.",
    );
  }
  return key;
}

const KEY = agentKey();

export async function api(path, init = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "X-API-Key": KEY, ...(init.headers ?? {}) },
  });
  if (res.status === 204) return null;
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const detail = typeof body === "string" ? body : JSON.stringify(body);
    throw new Error(`${init.method ?? "GET"} ${path} -> ${res.status} ${detail}`);
  }
  return body;
}

export async function mainBranchId() {
  const { branches } = await api(`/api/sites/${SITE_ID}/branches`);
  const main = branches.find((b) => b.isMain);
  if (!main) throw new Error("No main workstream on this site");
  return main.id;
}

export const S = SITE_ID;

/**
 * Refuse to bulk-write while a person has the editor open.
 *
 * The editor syncs in realtime. If a script republishes a document underneath
 * an open session, that session can diff its stale in-memory copy against the
 * new one and persist the difference — which is how `academics` lost every
 * block on 2026-09-15: a strip script wrote a correct version at 18:02:37 and
 * the open editor wrote an empty one 37 seconds later.
 *
 * The published version survived, because publishing is a separate step, but
 * the draft had to be rolled back by hand. Checking first is much cheaper.
 *
 * Pass --force to proceed anyway, for when you are the one at the keyboard and
 * know the tab is closed.
 */
export async function assertNobodyEditing(branchId, { force = process.argv.includes("--force") } = {}) {
  let presence;
  try {
    presence = await api(`/api/sites/${SITE_ID}/branches/${branchId}/presence`);
  } catch {
    // Presence is a safety check, not the job. If it cannot be read, say so and
    // continue rather than blocking a migration on a secondary endpoint.
    console.warn("[presence] could not be read; continuing without the check");
    return;
  }

  const actors = presence?.actors ?? presence?.presence?.actors ?? [];
  const humans = (Array.isArray(actors) ? actors : []).filter(
    (a) => (a.actorType ?? a.type) !== "agent",
  );
  if (humans.length === 0) return;

  const who = humans.map((a) => a.email ?? a.name ?? a.actorId ?? "someone").join(", ");
  if (force) {
    console.warn(`[presence] ${who} has the editor open; continuing because --force was passed`);
    return;
  }
  throw new Error(
    `${who} currently has this site open in the visual editor. A bulk write now can be ` +
      `overwritten by that session, emptying the document. Close the editor tab and re-run, ` +
      `or pass --force if you know it is safe.`,
  );
}
