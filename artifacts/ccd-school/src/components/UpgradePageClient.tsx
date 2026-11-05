"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { GoPill, Silk, Switch } from "@/components/m1/controls";
import { ListRow, RefPage } from "@/components/m1/parts";

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? "";
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL ?? "";

const INR_PRICE = {
  monthly: process.env.NEXT_PUBLIC_INR_PRICE_MONTHLY ?? "",
  annual: process.env.NEXT_PUBLIC_INR_PRICE_ANNUAL ?? "",
};

type Region = "global" | "india";

const FEATURES = [
  { free: "First 3 missions per path", pro: "Every mission in every path" },
  { free: "Core tier content only", pro: "Advanced (deep) tier unlocked" },
  { free: "All 3 worlds browsable", pro: "All 3 worlds fully playable" },
  { free: "XP + streak tracking", pro: "XP + streak + cloud sync" },
  { free: "Local progress only", pro: "Progress saved across devices" },
  { free: "Leaderboard view only", pro: "Compete on the global leaderboard" },
];

/**
 * /upgrade on Model 1 parts. Layout only: the copy, the pound prices and the free-tier claims are
 * unchanged until Param answers on ccd/school-pro.md (everything is free by default today).
 */
export function UpgradePageClient() {
  const { user, isPro } = useAuth();
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [region, setRegion] = useState<Region>("global");
  const [indiaOn, setIndiaOn] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/payments/options")
      .then((r) => r.json())
      .then((o: { razorpay?: boolean }) => {
        if (!alive || !o.razorpay) return;
        setIndiaOn(true);
        try {
          if (Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Calcutta" ||
              Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Kolkata") {
            setRegion("india");
          }
        } catch { /* default stays global */ }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/login?callbackUrl=/upgrade");
      return;
    }
    const priceId = billing === "monthly" ? MONTHLY_PRICE_ID : ANNUAL_PRICE_ID;
    if (region === "global" && !priceId) {
      setError("Payments are not yet configured. Please check back soon.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        region === "india" ? "/api/razorpay/checkout" : "/api/stripe/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(region === "india" ? { billing } : { priceId }),
        },
      );
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
      <RefPage title="pro" back="/dashboard" meta="ccd.school pro" intro="you are already on pro. every lesson is open.">
        <div style={{ marginTop: 16 }}><GoPill href="/worlds">start learning</GoPill></div>
      </RefPage>
    );
  }

  const priceLine = region === "india"
    ? (INR_PRICE[billing] || "inr")
    : billing === "monthly" ? "£9" : "£79";
  const per = region === "india"
    ? `per ${billing === "monthly" ? "month" : "year"}, billed in rupees`
    : billing === "monthly" ? "per month" : "per year, save £29 (was £108)";

  return (
    <RefPage title="unlock everything" back="/dashboard" meta="ccd.school pro"
      intro="advanced missions, later courses in every path, cloud sync across devices, and a place on the global leaderboard.">
      {indiaOn && (
        <div style={{ marginTop: 14 }}>
          <Switch label="Payment region" value={region} onChange={id => setRegion(id as Region)}
            options={[{ id: "global", label: "global, card" }, { id: "india", label: "india, upi or card" }]} />
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <Switch label="Billing" value={billing} onChange={id => setBilling(id as "monthly" | "annual")}
          options={[{ id: "monthly", label: "monthly" }, { id: "annual", label: "annual, save 27%" }]} />
      </div>

      <Silk label="free" right="forever" />
      <div className="ls-panel" style={{ flexDirection: "column", gap: 4, marginTop: 8 }}>
        <b style={{ fontSize: 22, fontWeight: 500 }}>£0</b>
        {FEATURES.map((f, i) => (
          <span key={i} style={{ fontSize: 13, color: "var(--sub)" }}>{f.free}</span>
        ))}
      </div>

      <Silk label="ccd pro" right={per} />
      <div className="ls-panel" style={{ flexDirection: "column", gap: 4, marginTop: 8 }}>
        <b style={{ fontSize: 22, fontWeight: 500 }}>{priceLine}</b>
        {FEATURES.map((f, i) => (
          <span key={i} style={{ fontSize: 13 }}>{f.pro}</span>
        ))}
      </div>
      {error && <p role="alert" style={{ color: "var(--led-red)", fontSize: 13, marginTop: 10 }}>{error}</p>}
      <div style={{ marginTop: 14 }}>
        <GoPill onClick={handleUpgrade} disabled={loading}>
          {loading ? "redirecting" : user ? `get pro${region === "india" ? (INR_PRICE[billing] ? `, ${INR_PRICE[billing]}` : "") : `, ${billing === "monthly" ? "£9 a month" : "£79 a year"}`}` : "sign in to upgrade"}
        </GoPill>
      </div>
      {!user && <p className="m1-t11" style={{ textAlign: "center", marginTop: 8 }}>you will be asked to sign in first</p>}

      <Silk label="what is free, always" />
      <div className="ls-panel" style={{ marginTop: 8 }}>
        <span style={{ fontSize: 14, lineHeight: 1.5, color: "var(--sub)" }}>
          the first 3 missions in every path are free, forever. no credit card, no account. that is 30 or more free missions across fundamentals, dj and producer. ccd.school pro is for people who want to go the distance.
        </span>
      </div>
      <ListRow title="cancel anytime. no hidden fees." sub={`secure payment via ${region === "india" ? "razorpay" : "stripe"}`} style={{ marginTop: 12 }} />
    </RefPage>
  );
}
