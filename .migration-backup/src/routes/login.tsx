import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — CCD.SCHOOL" }, { name: "description", content: "Sign in to save your XP, streak and badges across devices." }]}),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const fn = mode === "signin"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    const { error } = await fn;
    setBusy(false);
    if (error) { setErr(error.message); return; }
    nav({ to: "/profile" });
  };

  const google = async () => {
    setErr(null);
    try {
      const r: any = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (r?.error) {
        const msg = r.error instanceof Error ? r.error.message : (typeof r.error === "string" ? r.error : "Google sign-in failed");
        setErr(msg);
      } else if (!r?.redirected) {
        nav({ to: "/profile" });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Google sign-in failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 md:p-12 space-y-4">
      <Link to="/" className="font-mono text-xs uppercase underline">← HOME</Link>
      <h1 className="text-5xl">// {mode === "signin" ? "SIGN IN" : "SIGN UP"}</h1>
      <p className="font-mono text-sm opacity-80">Save your XP, streak and badges across devices.</p>

      <button onClick={google} className="w-full brutal-border bg-bone p-3 font-mono text-sm uppercase brutal-press">
        ▶ Continue with Google
      </button>

      <div className="font-mono text-xs uppercase opacity-50 text-center">— or —</div>

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <div className="font-mono text-xs uppercase mb-1">Email</div>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full brutal-border bg-bone p-2 font-mono text-sm" />
        </label>
        <label className="block">
          <div className="font-mono text-xs uppercase mb-1">Password</div>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full brutal-border bg-bone p-2 font-mono text-sm" />
        </label>
        {err && <div className="brutal-border bg-hot text-bone p-2 font-mono text-xs">{err}</div>}
        <button disabled={busy} type="submit" className="w-full brutal-border bg-acid p-3 font-mono text-sm uppercase brutal-press disabled:opacity-50">
          {busy ? "..." : (mode === "signin" ? "Sign in" : "Create account")}
        </button>
      </form>

      <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="font-mono text-xs uppercase underline opacity-70">
        {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
      </button>
    </div>
  );
}
