#!/usr/bin/env npx tsx
import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const sql = readFileSync(join(__dirname, "init-db.sql"), "utf8");
  console.log("Running DB migrations…");
  await pool.query(sql);
  // world-class adds gems, review cards, push subscriptions, progress events and challenge scores
  await pool.query(readFileSync(join(__dirname, "migrate-world-class.sql"), "utf8"));
  await pool.query(readFileSync(join(__dirname, "migrate-razorpay.sql"), "utf8"));
  await pool.query(readFileSync(join(__dirname, "migrate-gym.sql"), "utf8"));
  console.log("Migrations complete.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
