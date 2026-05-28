import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await db.query(
    "SELECT * FROM user_progress WHERE user_id = $1",
    [session.user.id],
  );
  if (!result.rows.length) {
    return NextResponse.json({ progress: null });
  }
  const r = result.rows[0];
  return NextResponse.json({
    progress: {
      xp: r.xp,
      streakDays: r.streak_days,
      lastDay: r.last_day,
      dailyXp: r.daily_xp,
      dailyXpDate: r.daily_xp_date,
      hearts: r.hearts,
      heartRefillAt: Number(r.heart_refill_at),
      streakShield: r.streak_shield,
      completedMissions: r.completed_missions,
      badges: r.badges,
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { progress } = body as {
    progress: {
      xp: number;
      streakDays: number;
      lastDay: string | null;
      dailyXp: number;
      dailyXpDate: string;
      hearts: number;
      heartRefillAt: number;
      streakShield: boolean;
      completedMissions: Record<string, unknown>;
      badges: string[];
    };
  };
  if (!progress) {
    return NextResponse.json({ error: "Missing progress" }, { status: 400 });
  }

  await db.query(
    `INSERT INTO user_progress (
      user_id, xp, streak_days, last_day, daily_xp, daily_xp_date,
      hearts, heart_refill_at, streak_shield, completed_missions, badges, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      xp = GREATEST(user_progress.xp, EXCLUDED.xp),
      streak_days = GREATEST(user_progress.streak_days, EXCLUDED.streak_days),
      last_day = CASE WHEN user_progress.last_day IS NULL OR EXCLUDED.last_day > user_progress.last_day
                      THEN EXCLUDED.last_day ELSE user_progress.last_day END,
      daily_xp = EXCLUDED.daily_xp,
      daily_xp_date = EXCLUDED.daily_xp_date,
      hearts = LEAST(GREATEST(user_progress.hearts, EXCLUDED.hearts), 5),
      heart_refill_at = EXCLUDED.heart_refill_at,
      streak_shield = (user_progress.streak_shield OR EXCLUDED.streak_shield),
      completed_missions = user_progress.completed_missions || EXCLUDED.completed_missions,
      badges = (
        SELECT jsonb_agg(DISTINCT elem)
        FROM jsonb_array_elements(user_progress.badges || EXCLUDED.badges) AS elem
      ),
      updated_at = NOW()`,
    [
      session.user.id,
      progress.xp,
      progress.streakDays,
      progress.lastDay,
      progress.dailyXp,
      progress.dailyXpDate,
      progress.hearts,
      progress.heartRefillAt,
      progress.streakShield,
      JSON.stringify(progress.completedMissions),
      JSON.stringify(progress.badges),
    ],
  );

  return NextResponse.json({ ok: true });
}
