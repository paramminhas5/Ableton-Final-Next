"use client";
import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { RANKS, rankFor } from "@/lib/ranks";
import { MISSIONS } from "@/content/missions";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { useAuth, signOut } from "@/lib/auth";
import { CHAPTERS, chaptersByWorld, WORLD_TROPHIES, MASTER_TROPHY } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useState } from "react";

type WorldId = "fundamentals" | "dj" | "producer";
const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];
const WORLD_META: Record<WorldId, { title: string; emoji: string; hero: string; accent: string }> = {
  fundamentals: { title: "Fundamentals", emoji: "🎵", hero: "bg-acid text-ink", accent: "bg-acid" },
  dj: { title: "DJ World", emoji: "🎧", hero: "bg-ink text-bone", accent: "bg-volt" },
  producer: { title: "Producer", emoji: "🎛", hero: "bg-sun text-ink", accent: "bg-sun" },
};

export function ProfilePageClient() {
  const { progress, reset } = useProgress();
  const { user, isPro } = useAuth();
  const completed = progress.completedMissions;
  const [portalLoading, setPortalLoading] = useState(false);

  const worldStats = (world: WorldId) => {
    const paths = pathsByWorld(world);
    const slugs = paths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    return { done, total: slugs.length, pct: slugs.length > 0 ? Math.round((done / slugs.length) * 100) : 0, complete: done === slugs.length && slugs.length > 0 };
  };

  const totalDone = ALL_MISSIONS.filter((m) => !!completed[m.slug]).length;
  const allWorldsComplete = (["fundamentals", "dj", "producer"] as WorldId[]).every((w) => worldStats(w).complete);
  const { current: rank, next: nextRank } = rankFor(progress.xp);

  const handleReset = () => {
    if (window.confirm("Reset all progress? This cannot be undone.")) reset();
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Could not open billing portal. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bone">
      <header className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// YOUR PROFILE</div>
          <div className="flex items-end gap-4">
            <h1 className="font-display text-5xl md:text-7xl leading-none">PROFILE</h1>
            {isPro && (
              <span className="brutal-border bg-volt text-ink px-3 py-1 font-mono text-xs uppercase mb-1">PRO</span>
            )}
          </div>
          {user && <div className="font-mono text-sm mt-2 opacity-60">{user.email}</div>}
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-24">

        {!user && (
          <div className="brutal-border bg-sun p-5">
            <div className="font-display text-xl mb-1">Save progress to cloud</div>
            <div className="font-mono text-xs opacity-70 mb-3">Create an account to sync progress across devices and unlock the leaderboard.</div>
            <Link href="/login" className="brutal-border bg-ink text-bone px-4 py-2 font-mono text-xs uppercase brutal-press inline-block">SIGN IN →</Link>
          </div>
        )}

        {user && !isPro && (
          <div className="brutal-border bg-acid p-5">
            <div className="font-display text-xl mb-1">Unlock PRO</div>
            <div className="font-mono text-xs opacity-70 mb-3">Get access to advanced missions, later courses in every path, and priority support.</div>
            <Link href="/upgrade" className="brutal-border bg-ink text-bone px-4 py-2 font-mono text-xs uppercase brutal-press inline-block">UPGRADE TO PRO →</Link>
          </div>
        )}

        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// STATS</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="brutal-border bg-acid p-4"><div className="font-display text-4xl">{progress.xp}</div><div className="font-mono text-[9px] uppercase mt-1">Total XP</div></div>
            <div className="brutal-border bg-volt text-bone p-4"><div className="font-display text-4xl">{progress.streakDays}</div><div className="font-mono text-[9px] uppercase mt-1">Day Streak 🔥</div></div>
            <div className="brutal-border p-4"><div className="font-display text-4xl">{totalDone}</div><div className="font-mono text-[9px] uppercase mt-1">Missions Done</div></div>
            <div className="brutal-border p-4"><div className="font-display text-2xl leading-tight mt-1">{rank.name}</div><div className="font-mono text-[9px] uppercase mt-1">Current Rank</div></div>
          </div>
          {nextRank && (
            <div className="mt-3 brutal-border p-3 bg-bone">
              <div className="flex items-center justify-between mb-1">
                <div className="font-mono text-[9px] uppercase opacity-60">Next rank: {nextRank.name}</div>
                <div className="font-mono text-[9px] uppercase opacity-60">{nextRank.minXp - progress.xp} XP to go</div>
              </div>
              <div className="h-2 brutal-border bg-ink/10 overflow-hidden">
                <div className="h-full bg-acid transition-all" style={{ width: `${Math.min(100, Math.round(((progress.xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100))}%` }} />
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// WORLD PROGRESS</div>
          <div className="space-y-3">
            {(["fundamentals", "dj", "producer"] as WorldId[]).map((world) => {
              const ws = worldStats(world);
              const meta = WORLD_META[world];
              const trophy = WORLD_TROPHIES[world];
              return (
                <div key={world} className={`brutal-border ${meta.hero} p-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-display text-2xl">{meta.emoji} {meta.title}</div>
                      {ws.complete && <div className="font-mono text-[10px] mt-1">🏆 {trophy.name}</div>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-3xl">{ws.pct}%</div>
                      <div className="font-mono text-[9px] uppercase opacity-60">{ws.done}/{ws.total}</div>
                    </div>
                  </div>
                  <div className={`mt-3 h-2 brutal-border overflow-hidden ${world === "dj" ? "bg-bone/10" : "bg-ink/10"}`}>
                    <div className={`h-full transition-all ${world === "dj" ? "bg-volt" : "bg-ink"}`} style={{ width: `${ws.pct}%` }} />
                  </div>
                </div>
              );
            })}
            {allWorldsComplete && (
              <div className="brutal-border bg-acid p-6 text-center">
                <div className="font-display text-4xl">🏆 CCD MASTER</div>
                <div className="font-mono text-sm mt-2 opacity-70">{MASTER_TROPHY.description}</div>
              </div>
            )}
          </div>
        </section>

        {progress.badges.length > 0 && (
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// BADGES ({progress.badges.length})</div>
            <div className="flex flex-wrap gap-2">
              {progress.badges.map((b) => (
                <div key={b} className="brutal-border bg-acid px-3 py-2 font-mono text-xs uppercase">🏅 {b}</div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// SETTINGS</div>
          <div className="space-y-3">
            <div className="brutal-border p-4 flex items-center justify-between gap-4">
              <div><div className="font-display text-lg">Theme</div><div className="font-mono text-xs opacity-60">Choose your colour theme</div></div>
              <ThemeSwitcher />
            </div>
            {user && isPro && (
              <div className="brutal-border p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-display text-lg">CCD PRO</div>
                  <div className="font-mono text-xs opacity-60">Manage your subscription and billing</div>
                </div>
                <button onClick={handleManageBilling} disabled={portalLoading} className="brutal-border bg-volt text-ink px-4 py-2 font-mono text-xs uppercase brutal-press disabled:opacity-50">
                  {portalLoading ? "..." : "MANAGE →"}
                </button>
              </div>
            )}
            <div className="brutal-border p-4">
              <div className="font-display text-lg mb-1">Placement Test</div>
              <div className="font-mono text-xs opacity-60 mb-3">Already know the basics? Skip ahead to the right chapter.</div>
              <a href="/placement" className="brutal-border bg-acid text-ink px-4 py-2 font-mono text-xs uppercase brutal-press inline-block">TAKE TEST →</a>
            </div>
              <div className="font-mono text-xs opacity-60 mb-3">
                {user ? "Progress synced to cloud. Local copy kept as backup." : "Progress stored locally in your browser."}
              </div>
              <button onClick={handleReset} className="brutal-border bg-hot text-bone px-4 py-2 font-mono text-xs uppercase brutal-press">Reset All Progress</button>
            </div>
          </div>
        </section>

        {user && (
          <button onClick={() => signOut()} className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun">Sign Out</button>
        )}
      </div>
    </main>
  );
}
