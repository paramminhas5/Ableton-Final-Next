"use client";
import { useState, useEffect } from "react";

type Role = "member" | "staff" | "owner";
type Member = { id: string; email: string; name: string | null; plan: "free" | "pro"; role: Role; total_xp: number | null; created_at: string };

export function AdminPageClient() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [mode, setMode] = useState<"free" | "paid" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [counts, setCounts] = useState<{ total: number; pro: number; team: number } | null>(null);
  const [viewerRole, setViewerRole] = useState<"password" | "staff" | "owner">("password");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [memberMsg, setMemberMsg] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);

  const loadMode = async (pw: string) => {
    const res = await fetch("/api/admin/gating-mode", {
      headers: { "x-admin-password": pw },
    });
    if (res.status === 401) {
      setAuthError("Wrong password");
      return false;
    }
    const data = await res.json();
    setMode(data.mode ?? "free");
    return true;
  };

  const loadMembers = async (pw: string, q: string, pg: number) => {
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/admin/members?q=${encodeURIComponent(q)}&page=${pg}`, {
        headers: pw ? { "x-admin-password": pw } : {},
      });
      if (!res.ok) return false;
      const data = await res.json();
      setMembers(data.members);
      setCounts(data.counts);
      setHasMore(data.hasMore);
      setViewerRole(data.viewer.via === "password" ? "password" : data.viewer.role);
      return true;
    } finally {
      setLoadingMembers(false);
    }
  };

  // Signed-in staff and owners get straight in. Everyone else sees the password form.
  useEffect(() => {
    (async () => {
      if (await loadMembers("", "", 0)) {
        if (await loadMode("")) setAuthed(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authed) loadMembers(password, query, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const changeMember = async (m: Member, change: { plan?: string; role?: string }) => {
    setMemberMsg("");
    const res = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(password ? { "x-admin-password": password } : {}) },
      body: JSON.stringify({ id: m.id, ...change }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setMemberMsg(data.error ?? "Could not save that change");
    else setMemberMsg(`Saved ${m.email}`);
    loadMembers(password, query, page);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const ok = await loadMode(password);
    if (ok) {
      setAuthed(true);
      loadMembers(password, "", 0);
    }
  };

  const handleToggle = async (newMode: "free" | "paid") => {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/gating-mode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(password ? { "x-admin-password": password } : {}),
      },
      body: JSON.stringify({ mode: newMode }),
    });
    const data = await res.json();
    if (data.ok) {
      setMode(newMode);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-bone">
      <header className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="font-mono text-[10px] uppercase opacity-70 mb-1">// ADMIN</div>
          <h1 className="font-display text-5xl leading-none">ADMIN</h1>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {!authed ? (
          <form onSubmit={handleAuth} className="brutal-border bg-bone p-6 space-y-4">
            <div className="font-display text-2xl mb-4">Admin Access</div>
            <div>
              <label className="font-mono text-[9px] uppercase opacity-70 block mb-1">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="brutal-border px-3 py-2 font-mono text-sm bg-bone w-full focus:outline-none focus:bg-sun/20"
                placeholder="Enter admin password"
              />
            </div>
            {authError && (
              <div className="brutal-border bg-hot text-bone px-3 py-2 font-mono text-xs">{authError}</div>
            )}
            <button type="submit" className="brutal-border bg-ink text-bone px-6 py-3 font-mono text-xs uppercase brutal-press hover:bg-acid hover:text-ink transition-colors">
              ENTER →
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="brutal-border bg-bone p-6">
              <div className="font-mono text-[10px] uppercase opacity-70 mb-4">// SITE MODE</div>
              <div className="font-display text-lg mb-2">
                Current mode: <span className={mode === "free" ? "text-acid" : ""}>{mode?.toUpperCase()}</span>
              </div>
              <p className="font-mono text-xs opacity-70 mb-6 leading-relaxed">
                <strong>FREE (default):</strong> All missions open to everyone — no account or payment required.<br />
                <strong>PAID:</strong> First 3 missions per path free; advanced + later missions require PRO.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleToggle("free")}
                  disabled={saving || mode === "free"}
                  className={`brutal-border px-6 py-3 font-mono text-xs uppercase brutal-press disabled:opacity-50 transition-colors ${mode === "free" ? "bg-acid text-ink" : "bg-bone hover:bg-acid"}`}
                >
                  {mode === "free" ? "✓ FREE" : "SET FREE"}
                </button>
                <button
                  onClick={() => handleToggle("paid")}
                  disabled={saving || mode === "paid"}
                  className={`brutal-border px-6 py-3 font-mono text-xs uppercase brutal-press disabled:opacity-50 transition-colors ${mode === "paid" ? "bg-ink text-bone" : "bg-bone hover:bg-ink hover:text-bone"}`}
                >
                  {mode === "paid" ? "✓ PAID" : "SET PAID"}
                </button>
              </div>
              {saved && (
                <div className="mt-3 brutal-border bg-acid px-3 py-2 font-mono text-xs uppercase">✓ Saved — takes effect within 60 seconds</div>
              )}
            </div>

            <div className="brutal-border bg-bone p-6" data-testid="members-panel">
              <div className="font-mono text-[10px] uppercase opacity-70 mb-1">// MEMBERS</div>
              {counts && (
                <p className="font-mono text-xs opacity-70 mb-4">
                  {counts.total} members · {counts.pro} pro · {counts.team} on the team. You are {viewerRole === "password" ? "in with the admin password" : viewerRole}.
                  {viewerRole === "staff" && " Staff can change plans. Only an owner can change roles."}
                </p>
              )}
              <form
                onSubmit={(e) => { e.preventDefault(); setPage(0); loadMembers(password, query, 0); }}
                className="flex gap-2 mb-4"
              >
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or email"
                  className="brutal-border px-3 py-2 font-mono text-xs bg-bone flex-1 focus:outline-none focus:bg-sun/20"
                />
                <button type="submit" className="brutal-border bg-ink text-bone px-4 py-2 font-mono text-xs uppercase">SEARCH</button>
              </form>
              {memberMsg && <div className="brutal-border bg-sun/40 px-3 py-2 font-mono text-xs mb-3" role="status">{memberMsg}</div>}
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-xs">
                  <thead>
                    <tr className="text-left uppercase opacity-70">
                      <th className="py-2 pr-3">Member</th><th className="py-2 pr-3">Plan</th><th className="py-2 pr-3">Role</th><th className="py-2 pr-3">XP</th><th className="py-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-t border-ink/20" data-testid="member-row">
                        <td className="py-2 pr-3"><div>{m.name || "(no name)"}</div><div className="opacity-60">{m.email}</div></td>
                        <td className="py-2 pr-3">
                          <select value={m.plan} onChange={(e) => changeMember(m, { plan: e.target.value })} className="brutal-border bg-bone px-1 py-1" aria-label={`Plan for ${m.email}`}>
                            <option value="free">free</option><option value="pro">pro</option>
                          </select>
                        </td>
                        <td className="py-2 pr-3">
                          <select
                            value={m.role}
                            disabled={viewerRole === "staff"}
                            onChange={(e) => changeMember(m, { role: e.target.value })}
                            className="brutal-border bg-bone px-1 py-1 disabled:opacity-50"
                            aria-label={`Role for ${m.email}`}
                          >
                            <option value="member">member</option><option value="staff">staff</option><option value="owner">owner</option>
                          </select>
                        </td>
                        <td className="py-2 pr-3">{m.total_xp ?? 0}</td>
                        <td className="py-2">{new Date(m.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {!members.length && !loadingMembers && (
                      <tr><td colSpan={5} className="py-6 opacity-60">No members found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2 mt-4">
                <button disabled={page === 0} onClick={() => setPage(page - 1)} className="brutal-border px-3 py-1 font-mono text-xs uppercase disabled:opacity-40">← Prev</button>
                <button disabled={!hasMore} onClick={() => setPage(page + 1)} className="brutal-border px-3 py-1 font-mono text-xs uppercase disabled:opacity-40">Next →</button>
              </div>
            </div>

            <div className="brutal-border bg-bone p-6">
              <div className="font-mono text-[10px] uppercase opacity-70 mb-3">// ENV VARS NEEDED</div>
              <div className="font-mono text-xs opacity-70 space-y-1">
                <div><code className="bg-ink/10 px-1">AUTH_SECRET</code> — random string for JWT signing</div>
                <div><code className="bg-ink/10 px-1">AUTH_GOOGLE_ID</code> + <code className="bg-ink/10 px-1">AUTH_GOOGLE_SECRET</code> — Google OAuth credentials</div>
                <div><code className="bg-ink/10 px-1">ADMIN_PASSWORD</code> — this admin page password</div>
                <div><code className="bg-ink/10 px-1">NEXT_PUBLIC_STRIPE_PRICE_MONTHLY</code> — Stripe monthly price ID</div>
                <div><code className="bg-ink/10 px-1">NEXT_PUBLIC_STRIPE_PRICE_ANNUAL</code> — Stripe annual price ID</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
