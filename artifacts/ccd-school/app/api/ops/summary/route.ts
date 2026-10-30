import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Read-only numbers for Param OS. Counts only: no emails, names or payment details leave this route.
// Same guard as /api/admin/gating-mode: send the ADMIN_PASSWORD in the x-admin-password header.
export async function GET(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || request.headers.get("x-admin-password") !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [users, gating] = await Promise.all([
    db.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int AS new_7d,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day')::int AS new_1d,
        COUNT(*) FILTER (WHERE plan <> 'free')::int AS paid
      FROM users`),
    db.query("SELECT value FROM app_settings WHERE key = 'gating_mode'"),
  ]);
  const active = await db.query(
    "SELECT COUNT(*)::int AS n FROM user_progress WHERE updated_at > NOW() - INTERVAL '7 days'",
  );
  return NextResponse.json({
    users: users.rows[0],
    active_7d: active.rows[0]?.n ?? 0,
    gating_mode: gating.rows[0]?.value ?? "paid",
    generated: new Date().toISOString(),
  });
}
