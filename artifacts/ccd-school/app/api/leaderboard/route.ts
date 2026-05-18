import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@auth";

export const revalidate = 30;

export async function GET() {
  try {
    const session = await auth();
    const rows = await db.query(`
      SELECT
        u.id,
        u.name,
        u.image,
        u.plan,
        COALESCE(p.xp, 0) as xp,
        COALESCE(p.streak_days, 0) as streak_days,
        COALESCE(
          (SELECT COUNT(*) FROM jsonb_object_keys(p.completed_missions)),
          0
        ) as missions_count
      FROM users u
      LEFT JOIN user_progress p ON p.user_id = u.id
      ORDER BY COALESCE(p.xp, 0) DESC
      LIMIT 50
    `);

    const entries = rows.rows.map((r: Record<string, unknown>, i: number) => ({
      rank: i + 1,
      id: r.id,
      name: r.name || "Anonymous",
      image: r.image,
      plan: r.plan,
      xp: Number(r.xp),
      streakDays: Number(r.streak_days),
      missionsCount: Number(r.missions_count),
      isCurrentUser: session?.user?.id === r.id,
    }));

    const currentUserRank = session?.user?.id
      ? entries.findIndex((e) => e.id === session.user.id) + 1
      : null;

    return NextResponse.json({ entries, currentUserRank });
  } catch (e) {
    console.error("Leaderboard error:", e);
    return NextResponse.json({ entries: [], currentUserRank: null });
  }
}
