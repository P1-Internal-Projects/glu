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
