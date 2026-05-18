"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? "";
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL ?? "";

const FEATURES = [
  { free: "First 3 missions per path", pro: "Every mission in every path" },
  { free: "Core tier content only", pro: "Advanced (deep) tier unlocked" },
  { free: "All 3 worlds browsable", pro: "All 3 worlds fully playable" },
  { free: "XP + streak tracking", pro: "XP + streak + cloud sync" },
  { free: "Local progress only", pro: "Progress saved across devices" },
  { free: "Leaderboard view only", pro: "Compete on the global leaderboard" },
];

export function UpgradePageClient() {
  const { user, isPro } = useAuth();
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/login?callbackUrl=/upgrade");
      return;
    }
    const priceId = billing === "monthly" ? MONTHLY_PRICE_ID : ANNUAL_PRICE_ID;
    if (!priceId) {
      setError("Payments are not yet configured. Please check back soon.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (isPro) {
    return (
      <main className="min-h-screen bg-bone flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="brutal-border bg-volt text-ink p-8 brutal-shadow">
            <div className="font-display text-5xl mb-4">✓ PRO</div>
            <div className="font-display text-2xl mb-2">You&apos;re already on PRO</div>
            <div className="font-mono text-sm opacity-70 mb-6">All missions unlocked. Keep learning.</div>
            <Link href="/missions" className="brutal-border bg-ink text-bone px-6 py-3 font-mono text-xs uppercase brutal-press inline-block">START LEARNING →</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bone">
      <header className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2">// CCD.SCHOOL PRO</div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">UNLOCK EVERYTHING</h1>
          <p className="font-mono text-sm mt-4 opacity-60 max-w-lg mx-auto">
            Advanced missions, later courses in every path, cloud sync across devices, and a place on the global leaderboard.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 pb-24">
        <div className="flex justify-center gap-0">
          <button onClick={() => setBilling("monthly")}
            className={`brutal-border px-6 py-3 font-mono text-xs uppercase brutal-press ${billing === "monthly" ? "bg-ink text-bone" : "bg-bone hover:bg-sun"}`}>
            Monthly
          </button>
          <button onClick={() => setBilling("annual")}
            className={`brutal-border px-6 py-3 font-mono text-xs uppercase brutal-press ${billing === "annual" ? "bg-ink text-bone" : "bg-bone hover:bg-sun"}`}>
            Annual <span className="opacity-60">Save 27%</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="brutal-border bg-bone p-6">
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">FREE</div>
            <div className="font-display text-4xl mb-1">£0</div>
            <div className="font-mono text-xs opacity-60 mb-6">forever</div>
            <ul className="space-y-2 font-mono text-xs">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="opacity-40 shrink-0">—</span>
                  <span className="opacity-70">{f.free}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="brutal-border bg-acid p-6 brutal-shadow">
            <div className="font-mono text-[10px] uppercase opacity-60 mb-3">CCD PRO</div>
            {billing === "monthly" ? (
              <div>
                <div className="font-display text-4xl mb-1">£9</div>
                <div className="font-mono text-xs opacity-60 mb-6">per month</div>
              </div>
            ) : (
              <div>
                <div className="font-display text-4xl mb-1">£79</div>
                <div className="font-mono text-xs opacity-60 mb-1">per year <span className="line-through opacity-40">£108</span></div>
                <div className="font-mono text-[9px] bg-volt text-ink px-2 py-0.5 inline-block mb-4">SAVE £29</div>
              </div>
            )}
            <ul className="space-y-2 font-mono text-xs mb-8">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-ink font-bold shrink-0">✓</span>
                  <span>{f.pro}</span>
                </li>
              ))}
            </ul>
            {error && (
              <div className="brutal-border bg-hot text-bone px-3 py-2 font-mono text-xs mb-4">{error}</div>
            )}
            <button onClick={handleUpgrade} disabled={loading}
              className="brutal-border bg-ink text-bone px-6 py-3 font-mono text-xs uppercase brutal-press w-full disabled:opacity-50 hover:bg-volt hover:text-ink transition-colors">
              {loading ? "Redirecting..." : user ? `GET PRO — ${billing === "monthly" ? "£9/mo" : "£79/yr"} →` : "SIGN IN TO UPGRADE →"}
            </button>
            {!user && (
              <p className="font-mono text-[9px] opacity-50 mt-2 text-center">You&apos;ll be prompted to sign in first</p>
            )}
          </div>
        </div>

        <div className="brutal-border bg-bone p-6">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// WHAT&apos;S FREE, ALWAYS</div>
          <p className="font-mono text-sm opacity-70 leading-relaxed">
            The first 3 missions in every path are free — forever. No credit card, no account. 
            That&apos;s 30+ free missions across Fundamentals, DJ World, and Producer. 
            CCD.SCHOOL PRO is for people who want to go the distance.
          </p>
        </div>

        <div className="font-mono text-[9px] uppercase opacity-30 text-center">
          Cancel anytime · No hidden fees · Secure payment via Stripe
        </div>
      </div>
    </main>
  );
}
