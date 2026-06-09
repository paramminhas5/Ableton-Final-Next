import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/../../auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { score: number; correct: number; date: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { score, correct, date } = body;

  try {
    await db.query(
      `INSERT INTO challenge_scores (user_id, score, correct, challenge_date)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, challenge_date)
       DO UPDATE SET score = GREATEST(challenge_scores.score, $2), correct = $3`,
      [session.user.id, score, correct, date],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[challenge/submit]", err);
    return NextResponse.json({ ok: false });
  }
}
