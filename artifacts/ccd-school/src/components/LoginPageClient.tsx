"use client";
import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { rankFor } from "@/lib/ranks";

// ─── Human-readable error messages ───────────────────────────────────────────
function friendlyError(raw: string): string {
  if (!raw) return "Something went wrong. Please try again.";
  const r = raw.toLowerCase();

  // next-auth v5 credential errors
  if (r.includes("credentialssignin") || r === "credentialssignin")
    return "Incorrect email or password.";
  if (r.includes("configuration"))
    return "Server not configured yet — database connection missing. Check your environment variables (DATABASE_URL, AUTH_SECRET).";
  if (r.includes("email already in use") || r.includes("already in use"))
    return "That email is already registered. Try signing in instead.";
  if (r.includes("no database") || r.includes("connection string"))
    return "No database configured. Add DATABASE_URL to your environment variables.";
  if (r.includes("network") || r.includes("fetch"))
    return "Network error. Check your connection and try again.";
  if (r.includes("too many") || r.includes("rate limit"))
    return "Too many attempts. Please wait a moment and try again.";

  return raw;
}

// ─── No-DB notice ─────────────────────────────────────────────────────────────
function NoDbNotice() {
  return (
    <div className="brutal-border bg-sun p-4 mb-6">
      <div className="font-mono text-[10px] uppercase font-bold mb-1">⚠ CLOUD SYNC NOT CONFIGURED</div>
      <p className="font-mono text-xs leading-relaxed opacity-80">
        Sign-in requires a database. Your progress is saved locally in this browser — you can
        keep learning without an account. To enable cloud accounts, add{" "}
        <code className="bg-ink/10 px-1 rounded-sm">DATABASE_URL</code> and{" "}
        <code className="bg-ink/10 px-1 rounded-sm">AUTH_SECRET</code> to your environment.
      </p>
      <Link
        href="/worlds"
        className="inline-block mt-3 brutal-border bg-ink text-bone px-4 py-2 font-mono text-[10px] uppercase brutal-press hover:bg-acid hover:text-ink transition-colors"
      >
        CONTINUE WITHOUT ACCOUNT →
      </Link>
    </div>
  );
}

export function LoginPageClient() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const { progress } = useProgress();
  const { current: rank } = rankFor(progress.xp);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbMissing, setDbMissing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Pick up ?error= param that NextAuth adds on redirect-based sign-in failures
  useEffect(() => {
    const urlError = searchParams?.get("error");
    if (!urlError) return;
    const msg = friendlyError(urlError);
    if (
      urlError === "Configuration" ||
      msg.toLowerCase().includes("database") ||
      msg.toLowerCase().includes("environment variable")
    ) {
      setDbMissing(true);
    }
    setError(msg);
  }, [searchParams]);

  const handleGoogle = () => {
    setError("");
    setLoading(true);
    signIn("google", { callbackUrl: "/worlds" }).catch(() => {
      setError("Google sign-in failed. Make sure AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET are set.");
      setLoading(false);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDbMissing(false);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        name,
        action: mode,
        redirect: false,
      });

      if (result?.error) {
        const msg = friendlyError(result.error);
        // Detect missing-DB scenario specifically
        if (
          result.error === "Configuration" ||
          msg.toLowerCase().includes("database") ||
          msg.toLowerCase().includes("environment variable")
        ) {
          setDbMissing(true);
        }
        setError(msg);
        setLoading(false);
        return;
      }

      if (result?.ok) {
        setSuccess(true);
        // Sync local progress to cloud on login
        if (progress.xp > 0 || Object.keys(progress.completedMissions).length > 0) {
          await fetch("/api/progress/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ progress }),
          }).catch(() => {});
        }
        router.push("/worlds");
        router.refresh();
      }
    } catch (err) {
      const msg = friendlyError(String(err));
      if (msg.toLowerCase().includes("database") || msg.toLowerCase().includes("connection")) {
        setDbMissing(true);
      }
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bone flex flex-col">
      <div className="max-w-lg mx-auto px-4 py-10 md:py-16 flex-1 flex flex-col justify-center w-full">

        {/* Header card */}
        <div className="brutal-border bg-acid p-5 md:p-6 brutal-shadow mb-6">
          <div className="font-mono text-[10px] uppercase opacity-60 mb-1">// CCD.SCHOOL</div>
          <h1 className="font-display text-4xl md:text-5xl leading-none">
            {mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}
          </h1>
          <p className="font-mono text-sm mt-2 opacity-70">
            Save your progress to the cloud and compete on the leaderboard.
          </p>
        </div>

        {/* DB missing — show helpful notice instead of a cryptic error */}
        {dbMissing && <NoDbNotice />}

        {/* Local progress card — shown when user has XP to sync */}
        {progress.xp > 0 && !dbMissing && (
          <div className="brutal-border bg-sun p-4 mb-6">
            <div className="font-mono text-[10px] uppercase opacity-60 mb-1">YOUR LOCAL PROGRESS</div>
            <div className="font-display text-2xl">{progress.xp} XP · {rank.name}</div>
            <div className="font-mono text-xs opacity-60 mt-1">
              {Object.keys(progress.completedMissions).length} missions · 🔥 {progress.streakDays} day streak
            </div>
            <div className="font-mono text-[9px] opacity-50 mt-2">
              Signing in will merge this progress with your cloud account.
            </div>
          </div>
        )}

        {/* Success state */}
        {success && (
          <div className="brutal-border bg-acid text-ink p-5 mb-6 text-center">
            <div className="font-display text-3xl mb-1">✓ SIGNED IN!</div>
            <div className="font-mono text-sm opacity-70">Redirecting…</div>
          </div>
        )}

        {!success && (
          <div className="brutal-border bg-bone p-5 md:p-6 space-y-4">

            {/* Google sign-in — only show if not in DB-missing state */}
            {!dbMissing && (
              <>
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="brutal-border bg-ink text-bone px-4 py-3 font-mono text-xs uppercase brutal-press w-full disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-volt hover:text-bone transition-colors"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-ink/10" />
                  <span className="font-mono text-[9px] uppercase opacity-40">or</span>
                  <div className="flex-1 h-px bg-ink/10" />
                </div>
              </>
            )}

            {/* Email / password form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <div>
                  <label className="font-mono text-[10px] uppercase opacity-60 block mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    className="brutal-border px-3 py-3 font-mono text-sm bg-bone w-full focus:outline-none focus:bg-sun/20 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="font-mono text-[10px] uppercase opacity-60 block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  autoComplete={mode === "signup" ? "email" : "username"}
                  className="brutal-border px-3 py-3 font-mono text-sm bg-bone w-full focus:outline-none focus:bg-sun/20 transition-colors"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase opacity-60 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="6+ characters"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="brutal-border px-3 py-3 font-mono text-sm bg-bone w-full focus:outline-none focus:bg-sun/20 transition-colors"
                />
              </div>

              {/* Error display — human-readable */}
              {error && !dbMissing && (
                <div className="brutal-border bg-hot text-bone px-4 py-3 font-mono text-xs leading-relaxed">
                  <span className="font-bold">⚠ </span>{error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="brutal-border bg-acid px-4 py-4 font-display text-xl brutal-press w-full disabled:opacity-50 hover:bg-sun transition-colors"
              >
                {loading
                  ? "…"
                  : mode === "signup"
                  ? "CREATE ACCOUNT →"
                  : "SIGN IN →"}
              </button>
            </form>

            {/* Toggle sign-in / sign-up */}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setDbMissing(false); }}
              className="font-mono text-[10px] uppercase opacity-50 hover:opacity-100 w-full text-center brutal-press transition-opacity"
            >
              {mode === "signin" ? "New here? Create account →" : "← Back to sign in"}
            </button>
          </div>
        )}

        {/* Bottom nav */}
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun transition-colors"
          >
            ← HOME
          </Link>
          <Link
            href="/worlds"
            className="brutal-border bg-acid px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun transition-colors"
          >
            START LEARNING →
          </Link>
        </div>

        <p className="font-mono text-[9px] uppercase opacity-30 mt-4 text-center">
          No account needed · Progress stored locally in your browser
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
