/**
 * POST /api/push/send-streak-reminder
 *
 * Sends streak reminder push notifications to users who:
 *   - Have a streak > 0
 *   - Have NOT met their daily XP goal today
 *   - Have a push subscription registered
 *
 * Call this from a cron job at 20:00 UTC each day.
 * Protected by CRON_SECRET env var.
 *
 * Env vars required:
 *   CRON_SECRET          — bearer token for cron authentication
 *   VAPID_PRIVATE_KEY    — VAPID private key
 *   VAPID_PUBLIC_KEY     — VAPID public key
 *   VAPID_EMAIL          — contact email for VAPID
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const DAILY_GOAL_XP = 50;

export async function POST(req: NextRequest) {
  // Authenticate cron caller
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidEmail = process.env.VAPID_EMAIL ?? "mailto:hello@ccd.school";

  if (!vapidPrivate || !vapidPublic) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Find users with: streak > 0 AND daily_xp < goal AND have push sub
  const { rows } = await db.query(
    `SELECT ps.endpoint, ps.p256dh, ps.auth, up.streak_days
     FROM push_subscriptions ps
     JOIN user_progress up ON up.user_id = ps.user_id
     WHERE up.streak_days > 0
       AND (up.daily_xp_date != $1 OR up.daily_xp < $2)
     LIMIT 500`,
    [today, DAILY_GOAL_XP],
  );

  if (!rows.length) {
    return NextResponse.json({ sent: 0 });
  }

  // Dynamic import to avoid breaking the build if web-push is not installed
  let webpush: typeof import("web-push");
  try {
    webpush = await import("web-push");
    webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);
  } catch {
    return NextResponse.json({ error: "web-push not installed — run: pnpm add web-push" }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows.map(async (row: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          JSON.stringify({
            title: "🔥 Don't break your streak!",
            body: `${row.streak_days}-day streak at risk. Do one lesson before midnight.`,
            url: "/learn",
          }),
        );
        sent++;
      } catch (err) {
        failed++;
        // If subscription is expired/invalid, clean it up
        if ((err as { statusCode?: number }).statusCode === 410) {
          await db.query("DELETE FROM push_subscriptions WHERE endpoint = $1", [row.endpoint]);
        }
      }
    }),
  );

  return NextResponse.json({ sent, failed });
}
