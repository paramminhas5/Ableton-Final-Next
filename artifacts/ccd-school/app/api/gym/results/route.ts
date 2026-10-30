import { NextResponse } from "next/server";
import { auth } from "@auth";
import { db } from "@/lib/db";
import { GYM_DRILLS } from "@/lib/gym/engine";

export const dynamic = "force-dynamic";

interface Incoming {
  drill?: string;
  level?: number;
  correct?: boolean;
  responseMs?: number;
}

/** Stores a finished session's answers. Anonymous learners keep results on their device only. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ stored: 0 });
  let body: { results?: Incoming[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  const rows = (Array.isArray(body.results) ? body.results : [])
    .slice(0, 200)
    .filter(
      (r) =>
        GYM_DRILLS.includes(r.drill as never) &&
        Number.isInteger(r.level) &&
        typeof r.correct === "boolean" &&
        Number.isFinite(r.responseMs),
    );
  if (!rows.length) return NextResponse.json({ stored: 0 });
  try {
    const values: unknown[] = [];
    const tuples = rows.map((r, i) => {
      values.push(session.user!.id, r.drill, r.level, r.correct, Math.round(r.responseMs!));
      const o = i * 5;
      return `($${o + 1},$${o + 2},$${o + 3},$${o + 4},$${o + 5})`;
    });
    await db.query(
      `INSERT INTO drill_results (user_id, drill, difficulty, correct, response_ms) VALUES ${tuples.join(",")}`,
      values,
    );
    return NextResponse.json({ stored: rows.length });
  } catch (e) {
    console.error("gym results error:", e);
    // the table may not exist yet; the learner's device copy is the source of truth
    return NextResponse.json({ stored: 0 });
  }
}
