/**
 * GET /api/admin/learning?days=30: the learning funnel (src/lib/learnFunnel.ts) over learners' events in
 * progress_events. Behind the admin check (password header or a signed-in staff or owner).
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminActor } from "@/lib/adminAuth";
import { funnel, type Row } from "@/lib/learnFunnel";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const actor = await getAdminActor(request);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const days = Math.max(1, Math.min(365, Number(new URL(request.url).searchParams.get("days") ?? 30) || 30));
  try {
    const r = await db.query(
      `SELECT user_id::text AS who, substring(event_type from 7) AS e, (extract(epoch from created_at) * 1000)::bigint AS t, payload AS p
         FROM progress_events
        WHERE event_type LIKE 'learn:%' AND created_at > NOW() - ($1 || ' days')::interval
        ORDER BY created_at
        LIMIT 200000`,
      [String(days)],
    );
    const rows: Row[] = r.rows.map((x: { who: string; e: string; t: string | number; p: Record<string, unknown> }) => ({ who: x.who, e: x.e, t: Number(x.t), p: x.p ?? {} }));
    return NextResponse.json({ days, funnel: funnel(rows) });
  } catch (e) {
    console.error("admin learning:", e);
    return NextResponse.json({ error: "No database", days }, { status: 503 });
  }
}
