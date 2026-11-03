import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  try {
    const result = await db.query(
      "SELECT value FROM app_settings WHERE key = 'gating_mode'",
    );
    // Everything is free until Param decides on Pro (3 Nov 2026). The admin switch can still set "paid".
    const mode = result.rows[0]?.value ?? "free";
    return NextResponse.json(
      { mode },
      {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
      },
    );
  } catch {
    return NextResponse.json({ mode: "free" });
  }
}
