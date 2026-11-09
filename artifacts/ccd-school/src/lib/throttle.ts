import { db } from "@/lib/db";

/**
 * Failed sign-in throttle, kept in Postgres so it holds across serverless instances
 * (scripts/migrate-security.sql). Limits: 8 failures per email and 30 per IP in 15 minutes.
 * If the table is missing the throttle is off rather than locking everyone out.
 */
const WINDOW = "15 minutes";
const PER_EMAIL = 8;
const PER_IP = 30;

const keys = (email: string, ip: string | null) =>
  [`email:${email}`, ...(ip ? [`ip:${ip}`] : [])];

export async function isThrottled(email: string, ip: string | null): Promise<boolean> {
  try {
    const r = await db.query(
      `SELECT key, COUNT(*)::int AS n FROM auth_attempts
        WHERE key = ANY($1) AND at > NOW() - INTERVAL '${WINDOW}' GROUP BY key`,
      [keys(email, ip)],
    );
    return r.rows.some((row: { key: string; n: number }) =>
      row.key.startsWith("email:") ? row.n >= PER_EMAIL : row.n >= PER_IP);
  } catch {
    return false;
  }
}

export async function recordFailure(email: string, ip: string | null): Promise<void> {
  try {
    await db.query(`INSERT INTO auth_attempts (key) SELECT unnest($1::text[])`, [keys(email, ip)]);
    // Keep the table small.
    if (Math.random() < 0.02) await db.query(`DELETE FROM auth_attempts WHERE at < NOW() - INTERVAL '1 day'`);
  } catch {
    /* table missing: throttle off */
  }
}

export async function clearFailures(email: string): Promise<void> {
  try {
    await db.query(`DELETE FROM auth_attempts WHERE key = $1`, [`email:${email}`]);
  } catch {
    /* ignore */
  }
}

/** First address in x-forwarded-for (set by Vercel), or null. */
export function clientIp(headers: Headers | undefined): string | null {
  const v = headers?.get("x-forwarded-for")?.split(",")[0]?.trim();
  return v && v.length <= 64 ? v : null;
}
