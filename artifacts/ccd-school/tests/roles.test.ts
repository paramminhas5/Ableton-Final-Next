import { describe, it, expect } from "vitest";
import { checkMemberChange, canManageMembers, canChangeRoles } from "../src/lib/roles";

describe("roles", () => {
  it("staff and owner manage members, only owner changes roles", () => {
    expect(canManageMembers("member")).toBe(false);
    expect(canManageMembers("staff")).toBe(true);
    expect(canChangeRoles("staff")).toBe(false);
    expect(canChangeRoles("owner")).toBe(true);
  });
  it("members cannot change anything", () => {
    const r = checkMemberChange("member", { plan: "pro" }, { role: "member" }, 1);
    expect(r.ok).toBe(false);
  });
  it("staff can change plans but not roles", () => {
    expect(checkMemberChange("staff", { plan: "pro" }, { role: "member" }, 1).ok).toBe(true);
    const r = checkMemberChange("staff", { role: "staff" }, { role: "member" }, 1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(403);
  });
  it("owner can change roles", () => {
    expect(checkMemberChange("owner", { role: "staff" }, { role: "member" }, 1).ok).toBe(true);
  });
  it("the last owner cannot be demoted, but can when another exists", () => {
    const r = checkMemberChange("owner", { role: "member" }, { role: "owner" }, 1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(409);
    expect(checkMemberChange("owner", { role: "member" }, { role: "owner" }, 2).ok).toBe(true);
  });
  it("the admin password can do everything and rejects empty or invalid changes", () => {
    expect(checkMemberChange("password", { role: "owner" }, { role: "member" }, 0).ok).toBe(true);
    expect(checkMemberChange("password", {}, { role: "member" }, 0).ok).toBe(false);
    expect(checkMemberChange("password", { plan: "gold" as never }, { role: "member" }, 0).ok).toBe(false);
  });
});
