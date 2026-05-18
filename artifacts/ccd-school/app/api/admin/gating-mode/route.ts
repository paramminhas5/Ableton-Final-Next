import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

function checkAdmin(request: Request): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const authHeader = request.headers.get("x-admin-password");
  return authHeader === adminPassword;
}

export async function GET() {
  const result = await db.query(
    "SELECT value FROM app_settings WHERE key = 'gating_mode'",
  );
  return NextResponse.json({ mode: result.rows[0]?.value ?? "paid" });
}

export async function POST(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { mode } = (await request.json()) as { mode: string };
  if (mode !== "free" && mode !== "paid") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }
  await db.query(
    `INSERT INTO app_settings (key, value) VALUES ('gating_mode', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [mode],
  );
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, mode });
}
