import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { actorRole, getAdminActor } from "@/lib/adminAuth";
import { checkMemberChange, isPlan, isRole, type Plan, type Role } from "@/lib/roles";

export const dynamic = "force-dynamic";

const PAGE = 50;

export async function GET(request: Request) {
  const actor = await getAdminActor(request);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
  const page = Math.max(0, Number(url.searchParams.get("page") ?? 0) || 0);
  const like = `%${q.replace(/[%_\\]/g, (c) => "\\" + c)}%`;
  const rows = await db.query(
    `SELECT id, email, name, plan, role, total_xp, created_at
       FROM users
      WHERE ($1 = '' OR email ILIKE $2 OR name ILIKE $2)
      ORDER BY created_at DESC
      LIMIT ${PAGE + 1} OFFSET $3`,
    [q, like, page * PAGE],
  );
  const counts = await db.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE plan = 'pro')::int AS pro,
            COUNT(*) FILTER (WHERE role <> 'member')::int AS team
       FROM users`,
  );
  return NextResponse.json({
    members: rows.rows.slice(0, PAGE),
    hasMore: rows.rows.length > PAGE,
    counts: counts.rows[0],
    viewer: actor.via === "password" ? { via: "password" } : { via: "session", role: actor.role, id: actor.userId },
  });
}

export async function PATCH(request: Request) {
  const actor = await getAdminActor(request);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { id?: string; plan?: unknown; role?: unknown };
  if (!body.id || typeof body.id !== "string") return NextResponse.json({ error: "Missing member id" }, { status: 400 });
  if (body.plan !== undefined && !isPlan(body.plan)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  if (body.role !== undefined && !isRole(body.role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  const change: { plan?: Plan; role?: Role } = { plan: body.plan as Plan | undefined, role: body.role as Role | undefined };
  const target = await db.query("SELECT id, role FROM users WHERE id = $1", [body.id]);
  if (!target.rows[0]) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  const owners = await db.query("SELECT COUNT(*)::int AS n FROM users WHERE role = 'owner'");
  const verdict = checkMemberChange(actorRole(actor), change, { role: target.rows[0].role }, owners.rows[0].n);
  if (!verdict.ok) return NextResponse.json({ error: verdict.error }, { status: verdict.status });
  await db.query(
    `UPDATE users SET plan = COALESCE($2, plan), role = COALESCE($3, role) WHERE id = $1`,
    [body.id, change.plan ?? null, change.role ?? null],
  );
  return NextResponse.json({ ok: true });
}
