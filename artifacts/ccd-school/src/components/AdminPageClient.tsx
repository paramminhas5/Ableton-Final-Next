"use client";
import { useState, useEffect } from "react";

export function AdminPageClient() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [mode, setMode] = useState<"free" | "paid" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadMode = async (pw: string) => {
    const res = await fetch("/api/admin/gating-mode", {
      headers: { "x-admin-password": pw },
    });
    if (res.status === 401) {
      setAuthError("Wrong password");
      return false;
    }
    const data = await res.json();
    setMode(data.mode ?? "paid");
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const ok = await loadMode(password);
    if (ok) setAuthed(true);
  };

  const handleToggle = async (newMode: "free" | "paid") => {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/gating-mode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
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
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// ADMIN</div>
          <h1 className="font-display text-5xl leading-none">ADMIN</h1>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {!authed ? (
          <form onSubmit={handleAuth} className="brutal-border bg-bone p-6 space-y-4">
            <div className="font-display text-2xl mb-4">Admin Access</div>
            <div>
              <label className="font-mono text-[9px] uppercase opacity-60 block mb-1">Admin Password</label>
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
              <div className="font-mono text-[10px] uppercase opacity-40 mb-4">// SITE MODE</div>
              <div className="font-display text-lg mb-2">
                Current mode: <span className={mode === "free" ? "text-acid" : ""}>{mode?.toUpperCase()}</span>
              </div>
              <p className="font-mono text-xs opacity-60 mb-6 leading-relaxed">
                <strong>FREE:</strong> All missions open to everyone — no account or payment required.<br />
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

            <div className="brutal-border bg-bone p-6">
              <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// ENV VARS NEEDED</div>
              <div className="font-mono text-xs opacity-60 space-y-1">
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
