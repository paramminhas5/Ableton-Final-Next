import { auth } from "../../auth";
import { db } from "@/lib/db";
import { timingSafeEqual, createHash } from "node:crypto";
import { canManageMembers, isRole, type Role } from "@/lib/roles";

export type AdminActor = { via: "password" } | { via: "session"; userId: string; role: Role };

/**
 * Who is calling an admin route? Either the admin password header (break-glass, also how
 * the first owner is made) or a signed-in staff or owner. The role is read from the database
 * on every call, so removing a role takes effect at once.
 */
export async function getAdminActor(request: Request): Promise<AdminActor | null> {
  const pw = process.env.ADMIN_PASSWORD;
  // Break-glass only: a long random ADMIN_PASSWORD, compared in constant time.
  if (pw && pw.length >= 16 && safeEqual(request.headers.get("x-admin-password") ?? "", pw)) return { via: "password" };
  try {
    const session = await auth();
    const id = session?.user?.id;
    if (!id) return null;
    const r = await db.query("SELECT role FROM users WHERE id = $1", [id]);
    const role = r.rows[0]?.role;
    if (isRole(role) && canManageMembers(role)) return { via: "session", userId: id, role };
  } catch {
    /* no database or no session */
  }
  return null;
}

export const actorRole = (a: AdminActor): Role | "password" => (a.via === "password" ? "password" : a.role);

/** Constant-time compare of two secrets (hashing first makes the lengths equal). */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}
