import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminActor } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Free is the default: until an admin switches to paid, every lesson is open.
export async function GET(request: Request) {
  if (!(await getAdminActor(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await db.query("SELECT value FROM app_settings WHERE key = 'gating_mode'");
  return NextResponse.json({ mode: result.rows[0]?.value ?? "free" });
}

export async function POST(request: Request) {
  if (!(await getAdminActor(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
