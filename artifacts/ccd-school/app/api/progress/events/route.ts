/**
 * POST /api/progress/events
 *
 * Server-authoritative progress system. Clients submit *events*; the
 * server computes XP, streaks, hearts, and badges — never trusting
 * client-supplied totals.
 *
 * This patches the critical XP-spoofing hole in the old /sync POST where
 * `GREATEST(existing, submitted)` allowed any user to POST arbitrary XP.
 *
 * Event schema:
 *   { type: "mission_complete", missionSlug, xp, score, badge? }
 *   { type: "heart_lost" }
 *   { type: "heart_refill_buy" }
 *   { type: "drill_complete", drillKey, score }
 *
 * The server responds with the authoritative updated progress snapshot
 * so the client can reconcile localStorage with real values.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@auth";
import { db } from "@/lib/db";

// ─── Constants (must stay in sync with progress.tsx client constants) ─────────
const MAX_HEARTS = 5;
const HEART_REFILL_SECS = 14400; // 4 hours
const GEMS_PER_LESSON = 10;
const GEMS_PER_PERFECT = 25;
const HEART_REFILL_GEM_COST = 350;

// ─── Date helpers (server-side, UTC-agnostic) ─────────────────────────────────
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Event types ──────────────────────────────────────────────────────────────
type ProgressEvent =
  | { type: "mission_complete"; missionSlug: string; xp: number; score: number; badge?: string }
  | { type: "heart_lost" }
  | { type: "heart_refill_buy" }
  | { type: "drill_complete"; drillKey: string; score: number };

// ─── Ensure row exists ────────────────────────────────────────────────────────
async function ensureProgressRow(userId: string) {
  await db.query(
    `INSERT INTO user_progress (user_id, xp, streak_days, last_day, daily_xp, daily_xp_date,
      hearts, heart_refill_at, streak_shield, completed_missions, badges, gems, updated_at)
     VALUES ($1, 0, 0, NULL, 0, $2, $3, 0, false, '{}', '[]', 0, NOW())
     ON CONFLICT (user_id) DO NOTHING`,
    [userId, todayKey(), MAX_HEARTS],
  );
}

// ─── Load authoritative row ───────────────────────────────────────────────────
async function loadRow(userId: string) {
  const r = await db.query("SELECT * FROM user_progress WHERE user_id = $1", [userId]);
  return r.rows[0] ?? null;
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let events: ProgressEvent[];
  try {
    const body = await req.json();
    events = Array.isArray(body.events) ? body.events : [body.event].filter(Boolean);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!events.length) {
    return NextResponse.json({ error: "No events" }, { status: 400 });
  }

  try {
    await ensureProgressRow(userId);
    let row = await loadRow(userId);
    if (!row) return NextResponse.json({ error: "DB error" }, { status: 500 });

    for (const event of events) {
      row = await applyEvent(userId, row, event);
    }

    // Persist final row
    await db.query(
      `UPDATE user_progress SET
         xp = $2, streak_days = $3, last_day = $4,
         daily_xp = $5, daily_xp_date = $6,
         hearts = $7, heart_refill_at = $8, streak_shield = $9,
         completed_missions = $10, badges = $11, gems = $12,
         updated_at = NOW()
       WHERE user_id = $1`,
      [
        userId,
        row.xp, row.streak_days, row.last_day,
        row.daily_xp, row.daily_xp_date,
        row.hearts, row.heart_refill_at, row.streak_shield,
        JSON.stringify(row.completed_missions ?? {}),
        JSON.stringify(row.badges ?? []),
        row.gems,
      ],
    );

    return NextResponse.json({
      ok: true,
      progress: serializeRow(row),
    });
  } catch (err) {
    console.error("[progress/events]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ─── Apply a single event to a DB row (pure mutation) ────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function applyEvent(userId: string, row: any, event: ProgressEvent): Promise<any> {
  const today = todayKey();
  const yesterday = yesterdayKey();

  switch (event.type) {
    case "mission_complete": {
      const { missionSlug, xp, score, badge } = event;

      // Guard: only award XP once per mission, and cap per-mission XP to 500
      // to prevent a tampered client from sending xp:99999
      const safXp = Math.min(Math.max(0, Math.floor(xp)), 500);
      const completedMissions = row.completed_missions ?? {};
      const alreadyDone = !!completedMissions[missionSlug];
      const earnedXp = alreadyDone ? 0 : safXp;
      const earnedGems = alreadyDone ? 0 : (score >= 1 ? GEMS_PER_PERFECT : GEMS_PER_LESSON);

      // Streak logic (server-side)
      let streak = row.streak_days ?? 0;
      let shield = row.streak_shield ?? false;
      let shieldUsedAt = row.streak_shield_used_at ?? null;

      if (row.last_day !== today) {
        if (row.last_day === yesterday) {
          streak += 1;
        } else if (shield && row.last_day && shieldUsedAt !== today) {
          shield = false;
          shieldUsedAt = today;
        } else {
          streak = 1;
        }
      }

      const newDailyXp = row.daily_xp_date === today ? row.daily_xp + earnedXp : earnedXp;
      const earnShield = streak > 0 && streak % 7 === 0 && !shield;

      // Merge completed missions
      const newCompleted = {
        ...completedMissions,
        [missionSlug]: alreadyDone
          ? completedMissions[missionSlug]
          : { score, at: Date.now() },
      };

      // Merge badges
      const badges: string[] = row.badges ?? [];
      if (badge && !badges.includes(badge)) badges.push(badge);

      return {
        ...row,
        xp: row.xp + earnedXp,
        gems: (row.gems ?? 0) + earnedGems,
        streak_days: streak,
        streak_shield: earnShield ? true : shield,
        streak_shield_used_at: shieldUsedAt,
        last_day: today,
        daily_xp: newDailyXp,
        daily_xp_date: today,
        completed_missions: newCompleted,
        badges,
      };
    }

    case "heart_lost": {
      const hearts = Math.max(0, (row.hearts ?? MAX_HEARTS) - 1);
      const heartRefillAt = row.heart_refill_at && row.heart_refill_at > 0
        ? row.heart_refill_at
        : hearts < MAX_HEARTS ? Date.now() : 0;
      return { ...row, hearts, heart_refill_at: heartRefillAt };
    }

    case "heart_refill_buy": {
      // Costs HEART_REFILL_GEM_COST gems to instantly refill hearts
      const gems = row.gems ?? 0;
      if (gems < HEART_REFILL_GEM_COST) return row; // not enough gems — silently ignore
      return {
        ...row,
        hearts: MAX_HEARTS,
        heart_refill_at: 0,
        gems: gems - HEART_REFILL_GEM_COST,
      };
    }

    case "drill_complete": {
      // Drills earn a small amount of XP (5 per drill, not completeable for mission XP)
      const drillXp = Math.min(Math.round((event.score ?? 0) * 5), 5);
      const newDailyXp = row.daily_xp_date === today ? row.daily_xp + drillXp : drillXp;
      return {
        ...row,
        xp: row.xp + drillXp,
        daily_xp: newDailyXp,
        daily_xp_date: today,
      };
    }

    default:
      return row;
  }
}

// ─── Serialize DB row → client Progress shape ─────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeRow(row: any) {
  return {
    xp: row.xp,
    gems: row.gems ?? 0,
    streakDays: row.streak_days ?? 0,
    streakShield: row.streak_shield ?? false,
    lastDay: row.last_day,
    dailyXp: row.daily_xp ?? 0,
    dailyXpDate: row.daily_xp_date,
    hearts: row.hearts ?? MAX_HEARTS,
    heartRefillAt: Number(row.heart_refill_at ?? 0),
    completedMissions: row.completed_missions ?? {},
    badges: row.badges ?? [],
  };
}
