"use client";
/**
 * ShopPageClient — Gem Shop
 *
 * Items:
 *   • Streak Freeze (200 💎) — protect one missed day
 *   • Heart Refill (100 💎) — restore all 5 hearts immediately
 *   • XP Boost 2× 1hr (150 💎) — double XP for 60 minutes [placeholder]
 *   • Theme Unlock (300 💎) — unlock a locked premium theme
 *
 * Gems are earned: 10 per lesson, 25 per perfect score.
 */
import { useState } from "react";
import { useProgress, MAX_HEARTS } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import Link from "next/link";

type ShopItem = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  cost: number;
  color: string;
  action: () => boolean | void;
  disabled?: boolean;
  disabledReason?: string;
};

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 brutal-border px-5 py-3 font-mono text-sm uppercase z-50 ${ok ? "bg-acid text-ink" : "bg-hot text-bone"}`}>
      {ok ? "✓" : "✗"} {msg}
    </div>
  );
}

export function ShopPageClient() {
  const { progress, spendGems, refillHeart, reset } = useProgress();
  const { setLearnMode } = useLearnMode();
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const buyStreakFreeze = () => {
    if (progress.streakShield) { showToast("Streak freeze already active", false); return; }
    const ok = spendGems(200);
    if (!ok) { showToast("Not enough gems (need 200 💎)", false); return; }
    showToast("Streak freeze activated! 🛡 Miss a day and keep your streak.", true);
  };

  const buyHeartRefill = () => {
    if (progress.hearts >= MAX_HEARTS) { showToast("Hearts already full", false); return; }
    const ok = spendGems(100);
    if (!ok) { showToast("Not enough gems (need 100 💎)", false); return; }
    refillHeart();
    showToast(`Hearts refilled to ${MAX_HEARTS} ♥`, true);
  };

  const buyXpBoost = () => {
    const ok = spendGems(150);
    if (!ok) { showToast("Not enough gems (need 150 💎)", false); return; }
    // XP boost stored in localStorage — LessonPlayer checks it
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("ccd.xpboost", String(Date.now() + 60 * 60 * 1000));
    }
    showToast("2× XP active for 60 minutes! ⚡", true);
  };

  const buyTheme = () => {
    const ok = spendGems(300);
    if (!ok) { showToast("Not enough gems (need 300 💎)", false); return; }
    showToast("Theme unlocked! Check your profile to apply it.", true);
  };

  const ITEMS: ShopItem[] = [
    {
      id: "streak-freeze",
      emoji: "🛡",
      title: "Streak Freeze",
      desc: "Miss a day without losing your streak. Used automatically on your next missed day.",
      cost: 200,
      color: "bg-volt text-bone",
      action: buyStreakFreeze,
      disabled: progress.streakShield,
      disabledReason: "Already active",
    },
    {
      id: "heart-refill",
      emoji: "♥",
      title: "Heart Refill",
      desc: "Instantly restore all 5 hearts. Skip the 4-hour wait and keep learning.",
      cost: 100,
      color: "bg-hot text-bone",
      action: buyHeartRefill,
      disabled: progress.hearts >= MAX_HEARTS,
      disabledReason: "Hearts already full",
    },
    {
      id: "xp-boost",
      emoji: "⚡",
      title: "XP Boost 2×",
      desc: "Double all XP earned for the next 60 minutes. Perfect before a long study session.",
      cost: 150,
      color: "bg-acid text-ink",
      action: buyXpBoost,
    },
    {
      id: "theme-unlock",
      emoji: "🎨",
      title: "Unlock Premium Theme",
      desc: "Unlock a bonus theme for your profile. Flex it on the leaderboard.",
      cost: 300,
      color: "bg-sun text-ink",
      action: buyTheme,
    },
  ];

  return (
    <main className="min-h-screen bg-bone pb-24">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <header className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/" className="font-mono text-[10px] uppercase opacity-50 hover:opacity-100 mb-3 block">← Dashboard</Link>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// GEM SHOP</div>
          <h1 className="font-display text-5xl leading-none">
            SPEND YOUR<br /><span className="text-acid">GEMS</span>
          </h1>
          <p className="font-mono text-sm opacity-60 mt-3 leading-relaxed">
            Earn gems by completing lessons (10 💎) or scoring perfect (25 💎). Spend them on power-ups.
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Gem balance */}
        <div className="brutal-border bg-acid text-ink p-5 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase opacity-60 mb-1">YOUR BALANCE</div>
            <div className="font-display text-4xl">💎 {progress.gems}</div>
          </div>
          <div className="text-right font-mono text-xs opacity-70 max-w-[160px] leading-relaxed">
            +10 per lesson<br />+25 per perfect score<br />+10 per review
          </div>
        </div>

        {/* How to earn */}
        <div className="brutal-border bg-bone p-4">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2">HOW TO EARN GEMS</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Complete lesson", gems: 10 },
              { label: "Perfect score",  gems: 25 },
              { label: "Review session", gems: 10 },
            ].map(item => (
              <div key={item.label} className="brutal-border bg-bone p-3">
                <div className="font-display text-2xl">+{item.gems}</div>
                <div className="font-mono text-[8px] uppercase opacity-60 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Shop items */}
        <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// ITEMS</div>
        <div className="space-y-3">
          {ITEMS.map(item => (
            <div key={item.id} className="brutal-border bg-bone p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="font-display text-xl">{item.title}</div>
                    {item.disabled && (
                      <span className="brutal-border bg-bone px-2 py-0.5 font-mono text-[9px] uppercase opacity-60 ml-1">
                        {item.disabledReason}
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs opacity-70 leading-relaxed">{item.desc}</div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="font-display text-xl">💎 {item.cost}</div>
                  <button
                    onClick={item.action}
                    disabled={item.disabled || progress.gems < item.cost}
                    className={`brutal-border ${item.color} px-4 py-2.5 font-display text-base brutal-press disabled:opacity-40 disabled:cursor-not-allowed transition-opacity`}
                  >
                    {item.disabled ? "✓ Active" : progress.gems < item.cost ? "Need more gems" : "BUY →"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current power-ups active */}
        {(progress.streakShield || progress.hearts < MAX_HEARTS) && (
          <div className="brutal-border bg-ink text-bone p-4 space-y-2">
            <div className="font-mono text-[10px] uppercase opacity-50 mb-2">// ACTIVE POWER-UPS</div>
            {progress.streakShield && (
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="text-volt">🛡</span> Streak Freeze active — protects your next missed day
              </div>
            )}
            {progress.hearts < MAX_HEARTS && (
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="text-hot">♥</span> {progress.hearts}/{MAX_HEARTS} hearts — refills every 4 hours
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
