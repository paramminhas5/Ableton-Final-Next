import { Pool } from "pg";

const globalForPg = globalThis as unknown as { _pgPool?: Pool };

function getConnectionString() {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL;
  if (!url) throw new Error("No database connection string found in env");
  try {
    const u = new URL(url);
    // Strip params that conflict with raw pg or cause SSL issues
    u.searchParams.delete("pgbouncer");
    u.searchParams.delete("connection_limit");
    u.searchParams.delete("sslmode");
    return u.toString();
  } catch {
    return url;
  }
}

function getPool(): Pool {
  if (!globalForPg._pgPool) {
    globalForPg._pgPool = new Pool({
      connectionString: getConnectionString(),
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return globalForPg._pgPool;
}

// Lazy proxy — the pool (and DB connection string check) is only
// created on first actual query, not at module-import time.
export const db: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    return (getPool() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
