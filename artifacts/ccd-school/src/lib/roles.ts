/** Member roles. Plain functions so the rules can be tested without a database. */
export const ROLES = ["member", "staff", "owner"] as const;
export type Role = (typeof ROLES)[number];
export const PLANS = ["free", "pro"] as const;
export type Plan = (typeof PLANS)[number];

export const isRole = (v: unknown): v is Role => typeof v === "string" && (ROLES as readonly string[]).includes(v);
export const isPlan = (v: unknown): v is Plan => typeof v === "string" && (PLANS as readonly string[]).includes(v);

/** Staff and owners can open the admin area and change a member's plan. */
export const canManageMembers = (role: unknown): boolean => role === "staff" || role === "owner";
/** Only owners can change roles. */
export const canChangeRoles = (role: unknown): boolean => role === "owner";

export interface MemberChange { plan?: Plan; role?: Role }

/**
 * Decides whether `actor` may apply `change` to a member.
 * `actor` is "password" for the break-glass admin password, which can do everything.
 * `ownerCount` is how many owners exist now, so the last owner cannot be demoted.
 */
export function checkMemberChange(
  actor: Role | "password",
  change: MemberChange,
  target: { role: Role },
  ownerCount: number,
): { ok: true } | { ok: false; status: number; error: string } {
  if (change.plan === undefined && change.role === undefined) return { ok: false, status: 400, error: "Nothing to change" };
  if (change.plan !== undefined && !isPlan(change.plan)) return { ok: false, status: 400, error: "Invalid plan" };
  if (change.role !== undefined && !isRole(change.role)) return { ok: false, status: 400, error: "Invalid role" };
  if (actor !== "password" && !canManageMembers(actor)) return { ok: false, status: 403, error: "Not allowed" };
  if (change.role !== undefined && change.role !== target.role) {
    if (actor !== "password" && !canChangeRoles(actor)) return { ok: false, status: 403, error: "Only an owner can change roles" };
    if (target.role === "owner" && change.role !== "owner" && ownerCount <= 1) {
      return { ok: false, status: 409, error: "This is the last owner. Make someone else an owner first." };
    }
  }
  return { ok: true };
}
