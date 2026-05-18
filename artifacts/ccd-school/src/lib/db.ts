import { Pool } from "pg";

const globalForPg = globalThis as unknown as { _pgPool?: Pool };

// Vercel's Supabase integration exposes POSTGRES_PRISMA_URL (with pgbouncer params).
// Strip those params so the raw pg Pool can use it cleanly.
function getConnectionString() {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL;
  if (!url) throw new Error("No database connection string found in env");
  // Remove pgbouncer / connection_limit params that break raw pg
  try {
    const u = new URL(url);
    u.searchParams.delete("pgbouncer");
    u.searchParams.delete("connection_limit");
    return u.toString();
  } catch {
    return url;
  }
}

export const db: Pool =
  globalForPg._pgPool ??
  new Pool({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

if (process.env.NODE_ENV !== "production") globalForPg._pgPool = db;
