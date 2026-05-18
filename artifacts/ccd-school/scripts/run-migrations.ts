#!/usr/bin/env npx tsx
import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const sql = readFileSync(join(__dirname, "init-db.sql"), "utf8");
  console.log("Running DB migrations…");
  await pool.query(sql);
  console.log("Migrations complete.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
