"use client";
/**
 * ProfilePageClient — CCD.SCHOOL profile.
 * Fully visual: graphic stat cards, rank ladder, world progress strips,
 * cat decorations, SectionReveal on every section, badges grid.
 */
import Link from "next/link";
import Image from "next/image";
import { useProgress } from "@/lib/progress";
import { RANKS, rankFor } from "@/lib/ranks";
import { MISSIONS } from "@/content/missions";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { useAuth, signOut } from "@/lib/auth";
import { WORLD_TROPHIES, MASTER_TROPHY } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import SectionReveal from "@/components/SectionReveal";
import { useState } from "react";
import { motion } from "framer-motion";

type WorldId = "fundamentals" | "dj" | "producer";
const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];

const WORLD_META: Record<WorldId, { title: string; emoji: string; hero: string; bar: string; cat: string; trophy: string }> = {
  fundamentals: { title: "Fundamentals", emoji: "🎵", hero: "bg-acid text-ink",          bar: "bg-ink",          cat: "/cats/cat-handstand.png", trophy: "🏆" },
  dj:           { title: "DJ World",     emoji: "🎧", hero: "bg-ink text-bone",            bar: "bg-electric-blue",cat: "/cats/cat-dj.png",        trophy: "🥇" },
  producer:     { title: "Producer",     emoji: "🎛", hero: "bg-electric-blue text-bone",  bar: "bg-acid",         cat: "/cats/cat-dj-hero.png",   trophy: "🏅" },
};

// Badge colours cycling
const BADGE_BG = ["bg-acid text-ink","bg-electric-blue text-bone","bg-magenta text-bone","bg-ink text-bone","bg-sun text-ink"];

export function ProfilePageClient() {
  const { progress, reset } = useProgress();
  const { user, isPro }     = useAuth();
  const completed           = progress.completedMissions;
  const [portalLoading, setPortalLoading] = useState(false);
  const [confirmReset, setConfirmReset]   = useState(false);

  const worldStats = (world: WorldId) => {
    const slugs = pathsByWorld(world).flatMap(p => p.missionSlugs);
    const done  = slugs.filter(s => !!completed[s]).length;
    return { done, total: slugs.length, pct: slugs.length > 0 ? Math.round((done / slugs.length) * 100) : 0, complete: done === slugs.length && slugs.length > 0 };
  };

  const totalDone        = ALL_MISSIONS.filter(m => !!completed[m.slug]).length;
  const allWorldsComplete = (["fundamentals","dj","producer"] as WorldId[]).every(w => worldStats(w).complete);
  const { current: rank, next: nextRank, progress: rankPct } = rankFor(progress.xp);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res  = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { alert("Could not open billing portal."); }
    finally { setPortalLoading(false); }
  };

  return (
    <main className="min-h-screen bg-bone pb-24">

      {/* ── HERO HEADER ── */}
      <header className="border-b-4 border-ink bg-electric-blue text-bone relative overflow-hidden">
        {/* Dancing cat */}
        <div className="absolute right-4 bottom-0 w-28 h-28 md:w-36 md:h-36 pointer-events-none animate-bounce-bob" aria-hidden
          style={{ filter: "drop-shadow(4px 4px 0 hsl(222 47% 4%))" }}>
          <Image src="/cats/cat-dj-hero.png" alt="" width={144} height={144} className="w-full h-full object-contain" />
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 relative z-10">
          <div className="font-mono text-xs uppercase opacity-60 mb-1">// YOUR PROFILE</div>
          <div className="flex items-end gap-3 mb-3">
            <h1 className="font-display text-5xl md:text-7xl leading-none" style={{ textShadow: "4px 4px 0 hsl(222 47% 4%)" }}>
              PROFILE
            </h1>
            {isPro && (
              <span className="brutal-border bg-acid text-ink px-3 py-1 font-display text-sm mb-2 chunk-shadow-sm">PRO ⚡</span>
            )}
          </div>

          {/* Rank badge */}
          <div className="inline-flex items-center gap-3 brutal-border bg-ink text-bone px-4 py-2 chunk-shadow">
            <span className="text-2xl">{rank.emoji}</span>
            <div>
              <div className="font-display text-xl">{rank.name}</div>
              <div className="font-mono text-[10px] uppercase opacity-50">{rank.tagline}</div>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3 mt-3">
              <div className="font-mono text-sm opacity-70">{user.email}</div>
              <a href={`/u/${user.name ?? user.email?.split("@")[0] ?? "me"}`}
                className="brutal-border bg-acid text-ink px-3 py-1 font-display text-xs hover:bg-sun transition-colors">
                Public Profile →
              </a>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">

        {/* ── STAT CARDS ── */}
        <SectionReveal>
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-4">// STATS</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* XP */}
              <div className="brutal-border bg-acid text-ink p-5 chunk-shadow">
                <div className="font-display text-4xl md:text-5xl tabular-nums leading-none">{progress.xp.toLocaleString()}</div>
                <div className="font-mono text-[10px] uppercase opacity-60 mt-2">Total XP</div>
              </div>
              {/* Streak */}
              <div className="brutal-border bg-magenta text-bone p-5 chunk-shadow">
                <div className="font-display text-4xl md:text-5xl leading-none">
                  🔥{progress.streakDays}
                  {progress.streakShield && <span className="text-2xl ml-1">🛡</span>}
                </div>
                <div className="font-mono text-[10px] uppercase opacity-60 mt-2">Day Streak</div>
              </div>
              {/* Missions */}
              <div className="brutal-border bg-bone p-5 chunk-shadow">
                <div className="font-display text-4xl md:text-5xl tabular-nums leading-none">{totalDone}</div>
                <div className="font-mono text-[10px] uppercase opacity-60 mt-2">Missions Done</div>
              </div>
              {/* Gems */}
              <div className="brutal-border bg-electric-blue text-bone p-5 chunk-shadow">
                <div className="font-display text-4xl md:text-5xl leading-none">💎{progress.gems}</div>
                <div className="font-mono text-[10px] uppercase opacity-60 mt-2">Gems</div>
              </div>
            </div>

            {/* Rank progress bar */}
            {nextRank && (
              <div className="mt-4 brutal-border p-4 bg-bone chunk-shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-display text-sm">{rank.emoji} {rank.name}</div>
                  <div className="font-display text-sm">{nextRank.emoji} {nextRank.name}</div>
                </div>
                <div className="h-4 brutal-border bg-ink/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-acid"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(rankPct * 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="font-mono text-[10px] uppercase opacity-50">{progress.xp} XP</div>
                  <div className="font-mono text-[10px] uppercase opacity-50">{nextRank.minXp - progress.xp} XP to go</div>
                </div>
              </div>
            )}
          </section>
        </SectionReveal>

        {/* ── RANK LADDER ── */}
        <SectionReveal delay={0.05}>
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-4">// RANK LADDER</div>
            <div className="brutal-border chunk-shadow overflow-hidden">
              {RANKS.map((r, i) => {
                const isCurrentRank = r.name === rank.name;
                const isPast        = progress.xp >= r.minXp;
                return (
                  <div key={r.name}
                    className={`flex items-center gap-3 px-4 py-3 border-b-2 border-ink/10 last:border-b-0 transition-colors
                      ${isCurrentRank ? "bg-acid text-ink" : isPast ? "bg-ink/5" : "bg-bone opacity-40"}`}>
                    <span className="text-xl w-8 text-center">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-display text-base ${isCurrentRank ? "" : "opacity-70"}`}>{r.name}</div>
                      <div className="font-mono text-[9px] uppercase opacity-50">{r.minXp.toLocaleString()} XP required</div>
                    </div>
                    {isCurrentRank && (
                      <span className="brutal-border bg-ink text-bone px-2 py-0.5 font-display text-[10px] uppercase">YOU ARE HERE</span>
                    )}
                    {isPast && !isCurrentRank && (
                      <span className="font-mono text-[9px] uppercase opacity-40">✓ achieved</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </SectionReveal>

        {/* ── WORLD PROGRESS ── */}
        <SectionReveal delay={0.08}>
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-4">// WORLD PROGRESS</div>
            <div className="space-y-4">
              {(["fundamentals","dj","producer"] as WorldId[]).map(world => {
                const ws   = worldStats(world);
                const meta = WORLD_META[world];
                const trophy = WORLD_TROPHIES[world];
                return (
                  <div key={world} className={`brutal-border ${meta.hero} p-5 chunk-shadow relative overflow-hidden`}>
                    {/* Cat decoration */}
                    <div className="absolute right-3 bottom-0 w-20 h-20 pointer-events-none wiggle opacity-40" aria-hidden>
                      <Image src={meta.cat} alt="" width={80} height={80} className="w-full h-full object-contain" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-display text-2xl md:text-3xl">{meta.emoji} {meta.title}</div>
                          {ws.complete && <div className="font-display text-sm mt-0.5 opacity-80">{meta.trophy} {trophy.name}</div>}
                        </div>
                        <div className="text-right">
                          <div className="font-display text-4xl md:text-5xl tabular-nums">{ws.pct}%</div>
                          <div className="font-mono text-[9px] uppercase opacity-60">{ws.done}/{ws.total}</div>
                        </div>
                      </div>
                      <div className="h-3 brutal-border bg-bone/20 overflow-hidden">
                        <motion.div
                          className={`h-full ${meta.bar}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${ws.pct}%` }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {allWorldsComplete && (
                <div className="brutal-border bg-acid p-6 text-center chunk-shadow">
                  <div className="font-display text-5xl mb-2">🏆 CCD MASTER</div>
                  <div className="font-sans text-sm mt-2 opacity-70">{MASTER_TROPHY.description}</div>
                  <div className="flex justify-center mt-4">
                    <Image src="/cats/cat-handstand.png" alt="" width={80} height={80} className="drop-shadow-[3px_3px_0_hsl(222_47%_4%)] animate-cat-celebrate" />
                  </div>
                </div>
              )}
            </div>
          </section>
        </SectionReveal>

        {/* ── BADGES ── */}
        {progress.badges.length > 0 && (
          <SectionReveal delay={0.1}>
            <section>
              <div className="font-mono text-[10px] uppercase opacity-40 mb-4">// BADGES ({progress.badges.length})</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {progress.badges.map((b, i) => (
                  <div key={b} className={`brutal-border ${BADGE_BG[i % BADGE_BG.length]} p-3 chunk-shadow-sm text-center`}>
                    <div className="font-display text-2xl mb-1">🏅</div>
                    <div className="font-display text-xs uppercase leading-tight">{b.replace(/-/g," ")}</div>
                  </div>
                ))}
              </div>
            </section>
          </SectionReveal>
        )}

        {/* ── UPSELLS ── */}
        {!user && (
          <SectionReveal delay={0.12}>
            <div className="brutal-border bg-electric-blue text-bone p-5 chunk-shadow flex items-center gap-4">
              <Image src="/cats/cat-dj-new.png" alt="" width={60} height={60} className="drop-shadow-[3px_3px_0_hsl(222_47%_4%)] wiggle shrink-0" />
              <div>
                <div className="font-display text-xl mb-1">Save progress to cloud</div>
                <div className="font-sans text-sm opacity-80 mb-3">Create an account to sync progress across devices and unlock the leaderboard.</div>
                <Link href="/login" className="brutal-border bg-acid text-ink px-4 py-2 font-display text-sm inline-block chunk-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform">SIGN IN →</Link>
              </div>
            </div>
          </SectionReveal>
        )}

        {user && !isPro && (
          <SectionReveal delay={0.12}>
            <div className="brutal-border bg-acid text-ink p-5 chunk-shadow flex items-center gap-4">
              <Image src="/cats/cat-raver.png" alt="" width={60} height={60} className="drop-shadow-[3px_3px_0_hsl(222_47%_4%)] wiggle shrink-0" />
              <div>
                <div className="font-display text-xl mb-1">Unlock PRO ⚡</div>
                <div className="font-sans text-sm opacity-70 mb-3">Advanced missions, later courses in every path, and priority support.</div>
                <Link href="/upgrade" className="brutal-border bg-ink text-bone px-4 py-2 font-display text-sm inline-block chunk-shadow-sm hover:bg-electric-blue transition-colors">UPGRADE TO PRO →</Link>
              </div>
            </div>
          </SectionReveal>
        )}

        {/* ── SETTINGS ── */}
        <SectionReveal delay={0.14}>
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-4">// SETTINGS</div>
            <div className="space-y-3">
              <div className="brutal-border p-4 flex items-center justify-between gap-4 chunk-shadow-sm">
                <div><div className="font-display text-lg">Theme</div><div className="font-mono text-xs opacity-60">Choose your colour theme</div></div>
                <ThemeSwitcher />
              </div>
              {user && isPro && (
                <div className="brutal-border p-4 flex items-center justify-between gap-4 chunk-shadow-sm">
                  <div><div className="font-display text-lg">CCD PRO</div><div className="font-mono text-xs opacity-60">Manage subscription and billing</div></div>
                  <button onClick={handleManageBilling} disabled={portalLoading}
                    className="brutal-border bg-electric-blue text-bone px-4 py-2 font-display text-sm hover:bg-ink transition-colors disabled:opacity-50 chunk-shadow-sm">
                    {portalLoading ? "..." : "MANAGE →"}
                  </button>
                </div>
              )}
              <div className="brutal-border p-4 chunk-shadow-sm">
                <div className="font-display text-lg mb-1">Placement Test</div>
                <div className="font-sans text-sm opacity-60 mb-3">Already know the basics? Skip ahead to the right chapter.</div>
                <a href="/placement" className="brutal-border bg-acid text-ink px-4 py-2 font-display text-sm inline-block chunk-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform">TAKE TEST →</a>
              </div>
              <div className="brutal-border p-4 chunk-shadow-sm">
                <div className="font-sans text-xs opacity-60 mb-3">
                  {user ? "Progress synced to cloud. Local copy kept as backup." : "Progress stored locally in your browser."}
                </div>
                {!confirmReset ? (
                  <button onClick={() => setConfirmReset(true)}
                    className="brutal-border bg-hot text-bone px-4 py-2 font-display text-sm chunk-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform">
                    Reset All Progress
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm">Are you sure?</span>
                    <button onClick={() => { reset(); setConfirmReset(false); }}
                      className="brutal-border bg-hot text-bone px-3 py-1.5 font-display text-sm">YES, RESET</button>
                    <button onClick={() => setConfirmReset(false)}
                      className="brutal-border bg-bone text-ink px-3 py-1.5 font-display text-sm">CANCEL</button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </SectionReveal>

        {user && (
          <button onClick={() => signOut()}
            className="brutal-border bg-bone text-ink px-4 py-2 font-display text-sm hover:bg-acid transition-colors chunk-shadow-sm">
            Sign Out
          </button>
        )}
      </div>
    </main>
  );
}
