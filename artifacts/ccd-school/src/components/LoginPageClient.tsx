"use client";
/**
 * Sign in, Model 1 (canvas board ZSignIn). The glass shows what you keep by signing in:
 * your track, xp and streak. Email and password, or Google. Progress in this browser is
 * merged into the account on sign in.
 */
import { useEffect, useState, type CSSProperties } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { useTrack } from "@/lib/track";
import { GoPill, Icon, Key, Screen, Silk, Switch } from "@/components/m1/controls";
import { CAT_SRC, Lanes } from "@/components/m1/shell";
import "@/components/m1/lesson.css";

function friendlyError(raw: string): string {
  const r = (raw || "").toLowerCase();
  if (!r) return "something went wrong. try again.";
  if (r.includes("credentialssignin")) return "that email and password don't match.";
  if (r.includes("configuration") || r.includes("no database") || r.includes("connection string")) return "accounts aren't switched on here yet. your progress is safe in this browser.";
  if (r.includes("already in use")) return "that email already has an account. sign in instead.";
  if (r.includes("network") || r.includes("fetch")) return "no connection. check it and try again.";
  if (r.includes("too many") || r.includes("rate limit")) return "too many tries. wait a minute and try again.";
  return raw.toLowerCase();
}

const field: CSSProperties = { flex: 1, minWidth: 0, background: "none", border: 0, outline: "none", font: "400 17px/1.3 Outfit, system-ui", color: "var(--ink)" };

export function LoginPageClient() {
  const { progress } = useProgress();
  const { track } = useTrack();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const e = searchParams?.get("error");
    if (e) setError(friendlyError(e));
  }, [searchParams]);

  const google = () => {
    setError("");
    setLoading(true);
    signIn("google", { callbackUrl: "/dashboard" }).catch(() => {
      setError("google sign-in isn't switched on here yet.");
      setLoading(false);
    });
  };

  const submit = async () => {
    if (!email || !password || loading) return;
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, name, action: mode, redirect: false });
      if (result?.error) { setError(friendlyError(result.error)); setLoading(false); return; }
      if (result?.ok) {
        if (progress.xp > 0 || Object.keys(progress.completedMissions).length > 0) {
          await fetch("/api/progress/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ progress }) }).catch(() => {});
        }
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(friendlyError(String(err)));
      setLoading(false);
    }
  };

  const lessons = Object.keys(progress.completedMissions).length;

  return (
    <div className="ls">
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: 56 }}>
        <Key href="/dashboard" ariaLabel="Close" style={{ width: 44, height: 44 }}><Icon name="close" /></Key>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>{mode === "signup" ? "make an account" : "sign in"}</h1>
      </div>
      <div className="ls-col">
        <Screen>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CAT_SRC} alt="" className="ls-sticker" />
          <span className="m1-ss">save your track</span>
          <div className="ls-title is-big" style={{ maxWidth: 230 }}>keep it on every device</div>
          {track.layers.length > 0 && <div style={{ marginTop: 16 }}><Lanes track={track} /></div>}
          <div className="ls-meta" style={{ marginTop: 14, justifyContent: "flex-start", gap: 14 }}>
            <span style={{ color: "var(--disp-ink)" }}>{progress.xp} xp</span>
            <span style={{ color: "var(--disp-ink)" }}>{track.layers.length} layers</span>
            <span style={{ color: "var(--disp-ink)" }}>{lessons} lessons</span>
            <span>all come with you</span>
          </div>
        </Screen>

        <div style={{ marginTop: 14 }}>
          <Switch label="Sign in or make an account" value={mode} onChange={id => { setMode(id as "signin" | "signup"); setError(""); }}
            options={[{ id: "signin", label: "sign in" }, { id: "signup", label: "new here" }]} />
        </div>

        <form onSubmit={e => { e.preventDefault(); void submit(); }}>
          <Silk label="your account" right="progress here is merged in" />
          <div className="ls-pads" style={{ gridTemplateColumns: "1fr", gap: 6 }}>
            {mode === "signup" && (
              <label className="ls-pad" style={{ minHeight: 54, flexDirection: "row", alignItems: "center", gap: 12, cursor: "text" }}>
                <Icon name="user" /><span className="sr-only">Name</span>
                <input style={field} value={name} onChange={e => setName(e.target.value)} placeholder="your name" autoComplete="name" />
              </label>
            )}
            <label className="ls-pad" style={{ minHeight: 54, flexDirection: "row", alignItems: "center", gap: 12, cursor: "text" }}>
              <svg viewBox="0 0 24 24" className="m1-ico" aria-hidden><rect x="3.5" y="6" width="17" height="12" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
              <span className="sr-only">Email</span>
              <input style={field} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email" autoComplete="email" required />
            </label>
            <label className="ls-pad" style={{ minHeight: 54, flexDirection: "row", alignItems: "center", gap: 12, cursor: "text" }}>
              <Icon name="lock" /><span className="sr-only">Password</span>
              <input style={field} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === "signup" ? "a password, 8 or more" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={mode === "signup" ? 8 : undefined} />
            </label>
          </div>
          <button type="submit" hidden />
        </form>

        {error && <div className="ls-panel" role="alert"><span className="ls-led" style={{ ["--c" as string]: "var(--led-red)" } as CSSProperties} /><span>{error}</span></div>}

        <Silk label="or" />
        <div className="ls-pads" style={{ gridTemplateColumns: "1fr" }}>
          <button type="button" className="ls-pad" style={{ minHeight: 56, alignItems: "center", justifyContent: "center" }} onClick={google} disabled={loading}>
            <span>continue with google</span>
          </button>
        </div>
        <p className="m1-t11" style={{ textAlign: "center", margin: "12px 0 0" }}>no account needed to learn. it only keeps your progress safe.</p>
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label="later" href="/dashboard" ariaLabel="Not now"><Icon name="back" /></Key>
          <GoPill onClick={() => void submit()} disabled={!email || !password || loading} style={{ gridColumn: "span 3" }}>
            {loading ? "one moment" : mode === "signup" ? "make my account" : "sign in"}
          </GoPill>
        </div>
      </div>
    </div>
  );
}
