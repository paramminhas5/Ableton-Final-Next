/**
 * POST /api/learn/events: learning events from a signed-in learner (src/lib/learnEvents.ts), stored in the
 * existing progress_events table (event_type, payload) so no new table or key is needed. Signed-out learners
 * keep their events on the device until they sign in; this answers 401 so the client keeps them queued.
 */
import { NextResponse } from "next/server";
import { auth } from "@auth";
import { db } from "@/lib/db";
import { LEARN_EVENTS } from "@/lib/learnFunnel";

export const dynamic = "force-dynamic";

type In = { e?: unknown; t?: unknown; p?: unknown };

export async function POST(req: Request) {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return NextResponse.json({ error: "Sign in to send events" }, { status: 401 });
  let body: { events?: In[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }
  const now = Date.now();
  const rows = (Array.isArray(body.events) ? body.events : []).slice(0, 200).filter(
    (r): r is { e: string; t: number; p: Record<string, unknown> } =>
      typeof r.e === "string" && (LEARN_EVENTS as readonly string[]).includes(r.e) &&
      typeof r.t === "number" && r.t > now - 90 * 86400000 && r.t < now + 86400000 &&
      !!r.p && typeof r.p === "object" && JSON.stringify(r.p).length <= 2000,
  );
  // The client drops what we accepted plus what we refused, so a bad event never blocks the queue.
  const taken = Math.min(200, Array.isArray(body.events) ? body.events.length : 0);
  if (!rows.length) return NextResponse.json({ stored: 0, taken });
  try {
    const values: unknown[] = [];
    const tuples = rows.map((r, i) => {
      values.push(id, `learn:${r.e}`, JSON.stringify({ ...r.p, t: r.t }), new Date(r.t).toISOString());
      const o = i * 4;
      return `($${o + 1},$${o + 2},$${o + 3}::jsonb,$${o + 4}::timestamptz)`;
    });
    await db.query(`INSERT INTO progress_events (user_id, event_type, payload, created_at) VALUES ${tuples.join(",")}`, values);
    return NextResponse.json({ stored: rows.length, taken });
  } catch (e) {
    console.error("learn events:", e);
    // Keep them on the device: a 503 tells the client to try again later.
    return NextResponse.json({ error: "Not stored" }, { status: 503 });
  }
}
