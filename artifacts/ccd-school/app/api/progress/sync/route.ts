import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@auth";

/**
 * The browser sends its progress; the server never trusts it blindly (9 Nov 2026 audit).
 * Types and sizes are checked here, and XP and streak can only grow by a bounded step per sync,
 * so a hand-made request cannot put a billion XP on the leaderboard.
 */
const MAX_XP_PER_SYNC = 3000;
const MAX_MISSIONS = 2000;
const MAX_BADGES = 300;

type Progress = {
  xp: number; streakDays: number; lastDay: string | null; dailyXp: number; dailyXpDate: string;
  hearts: number; heartRefillAt: number; streakShield: boolean;
  completedMissions: Record<string, unknown>; badges: string[];
};

const int = (v: unknown, max: number) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.min(Math.floor(v), max) : null;
const day = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

function cleanProgress(p: unknown): Progress | null {
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  const xp = int(o.xp, 10_000_000), streakDays = int(o.streakDays, 10_000), dailyXp = int(o.dailyXp, 100_000);
  const hearts = int(o.hearts, 5), heartRefillAt = int(o.heartRefillAt, 9_999_999_999_999);
  const dailyXpDate = day(o.dailyXpDate) ?? new Date().toISOString().slice(0, 10);
  if (xp === null || streakDays === null || dailyXp === null || hearts === null || heartRefillAt === null) return null;
  const lastDay = o.lastDay == null ? null : day(o.lastDay);
  const cm = o.completedMissions;
  if (!cm || typeof cm !== "object" || Array.isArray(cm)) return null;
  const missionKeys = Object.keys(cm);
  if (missionKeys.length > MAX_MISSIONS || missionKeys.some((k) => k.length > 120)) return null;
  if (JSON.stringify(cm).length > 400_000) return null;
  const badges = Array.isArray(o.badges)
    ? o.badges.filter((b): b is string => typeof b === "string" && b.length <= 80).slice(0, MAX_BADGES)
    : [];
  return {
    xp, streakDays, lastDay, dailyXp, dailyXpDate, hearts, heartRefillAt,
    streakShield: o.streakShield === true,
    completedMissions: cm as Record<string, unknown>, badges,
  };
}

export const dynamic = "force-dynamic";

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
  const body = (await request.json().catch(() => null)) as { progress?: unknown } | null;
  const progress = cleanProgress(body?.progress);
  if (!progress) {
    return NextResponse.json({ error: "Bad progress" }, { status: 400 });
  }

  await db.query(
    `INSERT INTO user_progress (
      user_id, xp, streak_days, last_day, daily_xp, daily_xp_date,
      hearts, heart_refill_at, streak_shield, completed_missions, badges, updated_at
    ) VALUES ($1, LEAST($2::int, $12::int * 8), LEAST($3::int, 400), $4,$5,$6,$7,$8,$9,$10,$11,NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      xp = GREATEST(user_progress.xp, LEAST(EXCLUDED.xp, user_progress.xp + $12)),
      streak_days = GREATEST(user_progress.streak_days, LEAST(EXCLUDED.streak_days, user_progress.streak_days + 2)),
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
      MAX_XP_PER_SYNC,
    ],
  );

  return NextResponse.json({ ok: true });
}
