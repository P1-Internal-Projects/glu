import { NextResponse } from "next/server";
import { ctRegistry } from "../../../../lib/ct-registry";
import { getRecords, saveRecords, type CTRecord } from "../../../../lib/ct-client";

type Params = { params: Promise<{ type: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { type } = await params;
  const entry = ctRegistry[type];
  if (!entry) return NextResponse.json({ error: "Unknown content type" }, { status: 404 });

  const records = await getRecords(entry.cssPath);
  return NextResponse.json(records);
}

export async function POST(request: Request, { params }: Params) {
  const { type } = await params;
  const entry = ctRegistry[type];
  if (!entry) return NextResponse.json({ error: "Unknown content type" }, { status: 404 });

  // Forward the user's auth token for write operations if present
  const authHeader = request.headers.get("Authorization");
  const authToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  try {
    const records = (await request.json()) as CTRecord[];
    await saveRecords(entry.cssPath, records, authToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[ct/${type} POST]`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
