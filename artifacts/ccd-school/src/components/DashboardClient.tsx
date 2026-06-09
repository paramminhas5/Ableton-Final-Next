"use client";
/**
 * DashboardClient — visual progress hub.
 *
 * Sections:
 *  1. Hero header
 *  2. Next Lesson card
 *  3. Daily Goal ring + Daily Challenge cards  ← NEW
 *  4. Stats 2×2 grid
 *  5. Rank progress bar
 *  6. World progress bars (DJ uses deep blue)
 *  7. Skill radar + Recent badges
 *  8. Review queue
 *  9. Beat Coach + Leaderboard
 * 10. Footer nudge
 */
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useProgress, DAILY_GOAL_XP, MAX_HEARTS, getLessonStrength } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import { useLearnMode } from "@/lib/mode";
import { rankFor, RANKS } from "@/lib/ranks";
import { MISSIONS } from "@/content/missions";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { getMissionContext } from "@/lib/missionContext";
import { CoachPanel } from "@/components/BeatCoach";
import { formatDashboardContext } from "@/types/coach";
import { useEffect, useState, useMemo, useRef } from "react";
import SectionReveal from "@/components/SectionReveal";

// ─── Daily Goal Ring ──────────────────────────────────────────────────────────
function GoalRing({ pct, done }: { pct: number; done: boolean }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" aria-label={`Daily goal ${Math.round(pct * 100)}%`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="7" opacity="0.15" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={done ? "#7B2FFF" : "#C6FF00"}
        strokeWidth="7"
        strokeDasharray={`${circ * Math.min(pct, 1)} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text x="50" y="54" textAnchor="middle" dominantBaseline="middle"
        fontSize="18" fontWeight="bold" fill="currentColor" fontFamily="inherit">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

// ─── Badge Registry ───────────────────────────────────────────────────────────
const BADGE_REGISTRY: Record<string, { name: string; emoji: string; description: string }> = {
  "first-wave":           { name: "First Wave",       emoji: "🌊", description: "Completed: What Is Sound?" },
  "dj-initiate":          { name: "DJ Initiate",       emoji: "🎧", description: "Completed: What Is DJing?" },
  "first-mix":            { name: "First Mix",         emoji: "🎚", description: "Completed: Your First Mix" },
  "first-boot":           { name: "First Boot",        emoji: "💻", description: "Completed: What Is Live?" },
  "acoustician":          { name: "Acoustician",       emoji: "🔬", description: "Completed Sound Science" },
  "timekeeper-trophy":    { name: "Timekeeper",        emoji: "⏱",  description: "Completed Rhythm & Time" },
  "melodist":             { name: "Melodist",          emoji: "🎵", description: "Completed Melody & Pitch" },
  "harmonist":            { name: "Harmonist",         emoji: "🎼", description: "Completed Harmony & Chords" },
  "studio-ready":         { name: "Studio Ready",      emoji: "🎛", description: "Completed Music Technology" },
  "dj-initiate-chapter":  { name: "DJ Initiate",       emoji: "🎧", description: "Completed Setup & Culture" },
  "library-curator":      { name: "Library Curator",   emoji: "📚", description: "Completed The Library" },
  "blendmaster":          { name: "Blendmaster",       emoji: "🎚", description: "Completed The Mix" },
  "crowd-reader":         { name: "Crowd Reader",      emoji: "👁",  description: "Completed Performance" },
  "club-ready":           { name: "Club Ready",        emoji: "🕺", description: "Completed DJ Mastery" },
  "live-initiated":       { name: "Live Initiated",    emoji: "🟢", description: "Completed First Contact" },
  "sound-sculptor":       { name: "Sound Sculptor",    emoji: "🌀", description: "Completed Sound & MIDI" },
  "mix-engineer":         { name: "Mix Engineer",      emoji: "🎛", description: "Completed The Mix" },
  "performance-ready":    { name: "Performance Ready", emoji: "🎤", description: "Completed Performance & Flow" },
  "live12-expert":        { name: "Live 12 Expert",    emoji: "👑", description: "Completed Advanced" },
  "synth-architect":      { name: "Synth Architect",   emoji: "⚡", description: "Completed Synthesis" },
};
function getBadge(slug: string) {
  return BADGE_REGISTRY[slug] ?? { name: slug.replace(/-/g, " "), emoji: "🏅", description: "Achievement unlocked" };
}

type WorldKey = "fundamentals" | "dj" | "producer";
const WORLD_CONFIG: Record<WorldKey, {
  emoji: string; label: string; bg: string; textColor: string;
  bar: string; href: string; catSrc: string;
}> = {
  fundamentals: { emoji: "🎵", label: "Fundamentals", bg: "bg-acid",     textColor: "text-ink",  bar: "bg-ink",  href: "/world/fundamentals", catSrc: "/cats/cat-handstand.png" },
  dj:           { emoji: "🎧", label: "DJ World",     bg: "bg-[#0a0f2e]",  textColor: "text-bone", bar: "bg-volt", href: "/world/dj",           catSrc: "/cats/cat-dj.png" },
  producer:     { emoji: "🎛", label: "Producer",     bg: "bg-sun",      textColor: "text-ink",  bar: "bg-ink",  href: "/world/producer",     catSrc: "/cats/cat-dj-hero.png" },
};

// ─── Skill Radar ──────────────────────────────────────────────────────────────
function SkillRadar({ skills }: { skills: { label: string; pct: number }[] }) {
  const cx = 120, cy = 120, r = 82;
  const n = skills.length;
  const allZero = skills.every(s => s.pct === 0);
  const point = (i: number, scale: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + Math.cos(angle) * r * scale, y: cy + Math.sin(angle) * r * scale };
  };
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const polyPoints = skills.map((s, i) => {
    const scale = allZero ? 0.07 : Math.max(0.04, s.pct / 100);
    const p = point(i, scale);
    return `${p.x},${p.y}`;
  }).join(" ");
  const ghostPoints = allZero ? skills.map((_, i) => { const p = point(i, 1.0); return `${p.x},${p.y}`; }).join(" ") : null;

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[260px]" aria-label="Skill radar chart">
      {gridLevels.map(scale => {
        const pts = skills.map((_, i) => { const p = point(i, scale); return `${p.x},${p.y}`; }).join(" ");
        return <polygon key={scale} points={pts} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />;
      })}
      {skills.map((_, i) => {
        const p = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="currentColor" strokeWidth="0.5" opacity="0.18" />;
      })}
      {ghostPoints && <polygon points={ghostPoints} fill="currentColor" opacity="0.04" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />}
      <polygon points={polyPoints} fill="currentColor" opacity={allZero ? 0.06 : 0.18} stroke="currentColor" strokeWidth={allZero ? 1 : 2} strokeDasharray={allZero ? "3 2" : undefined} />
      {allZero && (
        <>
          <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="currentColor" opacity="0.35" fontFamily="monospace">COMPLETE LESSONS</text>
          <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="currentColor" opacity="0.35" fontFamily="monospace">TO FILL THIS</text>
        </>
      )}
      {skills.map((s, i) => {
        const p = point(i, 1.3);
        return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="7.5" fill="currentColor" opacity="0.7">{s.label}</text>;
      })}
    </svg>
  );
}

// ─── Strength Bar ─────────────────────────────────────────────────────────────
function StrengthBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? "bg-acid" : pct >= 40 ? "bg-sun" : "bg-hot";
  return (
    <div className="h-1 brutal-border bg-bone/20 overflow-hidden w-14 shrink-0">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-ink/10 ${className ?? ""}`} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DashboardClient() {
  const { progress, missionsNeedingReview, dailyGoalPct, dailyGoalDone, heartRefillSeconds } = useProgress();
  const { user } = useAuth();
  const { learnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const { current: rank, next: nextRank, progress: rankPct } = rankFor(progress.xp);

  const allMissions = useMemo(() => [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS], []);
  const totalDone = allMissions.filter(m => !!completed[m.slug]).length;
  const totalMissions = allMissions.length;

  const [leaders, setLeaders] = useState<{ name: string; xp: number; rank: number; isCurrentUser?: boolean }[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [coachOpen, setCoachOpen] = useState(false);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(d => {
        setLeaders((d.entries ?? []).slice(0, 3).map((e: { name?: string; xp?: number; rank?: number; isCurrentUser?: boolean }) => ({
          name: e.name ?? "Anonymous", xp: e.xp ?? 0, rank: e.rank ?? 0, isCurrentUser: e.isCurrentUser ?? false,
        })));
        setCurrentUserRank(d.currentUserRank ?? null);
        setLoadingLeaders(false);
      })
      .catch(() => setLoadingLeaders(false));
  }, []);

  // Next mission
  const { continueSlug, lastCtx } = useMemo(() => {
    const allDoneSlugs = Object.entries(completed).filter(([, v]) => v).sort(([, a], [, b]) => (b?.at ?? 0) - (a?.at ?? 0)).map(([slug]) => slug);
    const lastSlug = allDoneSlugs[0];
    const ctx = lastSlug ? getMissionContext(lastSlug) : null;
    const nextSlug = ctx?.path ? (() => {
      const idx = ctx.path.missionSlugs.indexOf(lastSlug!);
      const ns = ctx.path.missionSlugs[idx + 1];
      return ns && !completed[ns] ? ns : null;
    })() : null;
    return { continueSlug: nextSlug ?? (totalDone === 0 ? "what-is-sound" : null), lastCtx: ctx };
  }, [completed, totalDone]);

  const continueTitle = useMemo(() => {
    if (!continueSlug) return null;
    return allMissions.find(m => m.slug === continueSlug)?.title ?? continueSlug.replace(/-/g, " ");
  }, [continueSlug, allMissions]);

  const continueTagline = useMemo(() => {
    if (!continueSlug) return null;
    return allMissions.find(m => m.slug === continueSlug)?.tagline ?? null;
  }, [continueSlug, allMissions]);

  const continueXp = useMemo(() => {
    if (!continueSlug) return 0;
    return allMissions.find(m => m.slug === continueSlug)?.xp ?? 0;
  }, [continueSlug, allMissions]);

  // World stats
  const worldStats = useMemo(() => {
    const compute = (world: WorldKey) => {
      const paths = pathsByWorld(world);
      const slugs = paths.flatMap(p => p.missionSlugs);
      const done = slugs.filter(s => !!completed[s]).length;
      return { done, total: slugs.length, pct: slugs.length ? Math.round((done / slugs.length) * 100) : 0 };
    };
    return { fundamentals: compute("fundamentals"), dj: compute("dj"), producer: compute("producer") };
  }, [completed]);

  // Radar
  const radarWorld = useMemo((): WorldKey => {
    const counts = (["fundamentals", "dj", "producer"] as WorldKey[]).map(w => ({
      world: w, done: pathsByWorld(w).flatMap(p => p.missionSlugs).filter(s => !!completed[s]).length,
    }));
    const best = counts.reduce((a, b) => b.done > a.done ? b : a, counts[0]);
    return best.done > 0 ? best.world : "fundamentals";
  }, [completed]);

  const RADAR_LABELS: Record<string, Record<string, string>> = {
    fundamentals: { "Sound Science": "Sound", "Rhythm & Time": "Rhythm", "Melody & Pitch": "Melody", "Harmony & Chords": "Harmony", "Music Technology": "Tech" },
    dj: { "Setup & Culture": "Setup", "The Library": "Library", "The Mix": "Mix", "DJ Performance": "Perform", "DJ Mastery": "Mastery" },
    producer: { "First Contact": "Contact", "Sound & MIDI": "S&MIDI", "The Mix": "Mix", "Performance & Flow": "Perform", "Advanced Producer": "Advanced" },
  };

  const radarSkills = useMemo(() => {
    const chapters = chaptersByWorld(radarWorld);
    const paths = pathsByWorld(radarWorld);
    const labelMap = RADAR_LABELS[radarWorld] ?? {};
    return chapters.map(ch => {
      const slugs = paths.filter(p => p.chapter === ch.slug).flatMap(p => p.missionSlugs);
      const done = slugs.filter(s => !!completed[s]).length;
      const pct = slugs.length ? Math.round((done / slugs.length) * 100) : 0;
      return { label: labelMap[ch.title] ?? ch.title.split(" ")[0], pct };
    });
  }, [completed, radarWorld]);

  // Review
  const reviewData = useMemo(() => missionsNeedingReview.slice(0, 8).map(slug => {
    const m = allMissions.find(m => m.slug === slug);
    const ls = progress.lessonStrengths[slug];
    return { slug, title: m?.title ?? slug.replace(/-/g, " "), pct: ls ? Math.round(getLessonStrength(ls) * 100) : 0 };
  }), [missionsNeedingReview, allMissions, progress.lessonStrengths]);

  const recentBadges = useMemo(() => [...progress.badges].reverse().slice(0, 3), [progress.badges]);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const modeLabel = learnMode === "flow" ? "🌊 Flow" : "🔓 Free";

  return (
    <main className="min-h-screen bg-bone pb-24">

      {/* ══ HERO HEADER ════════════════════════════════════════════════════ */}
      <header className="border-b-4 border-ink bg-electric-blue text-bone relative overflow-hidden">
        {/* Cat decoration */}
        <div
          className="absolute right-4 bottom-0 w-28 h-28 md:w-36 md:h-36 pointer-events-none animate-bounce-bob"
          style={{ filter: "drop-shadow(4px 4px 0 hsl(222 47% 4%))" }}
          aria-hidden
        >
          <Image src="/cats/cat-dj-hero.png" alt="" width={144} height={144} className="w-full h-full object-contain" />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 relative z-10">
          <div className="font-mono text-xs uppercase opacity-60 mb-2">// YOUR PROGRESS</div>
          <h1 className="font-display text-5xl md:text-7xl leading-none mb-4" style={{ textShadow: "4px 4px 0 hsl(222 47% 4%)" }}>
            PROGRESS
          </h1>
          {/* Rank badge */}
          <div className="inline-flex items-center gap-3 brutal-border bg-ink text-bone px-4 py-2 chunk-shadow mb-3">
            <span className="text-2xl">{rank.emoji}</span>
            <div>
              <div className="font-display text-xl">{rank.name}</div>
              <div className="font-mono text-[10px] uppercase opacity-50">{rank.tagline}</div>
            </div>
            <div className="font-mono text-[9px] brutal-border bg-bone/10 px-2 py-0.5 ml-2 uppercase opacity-70">{modeLabel}</div>
          </div>
          {user && (
            <div className="flex items-center gap-3 mt-1">
              <div className="font-mono text-sm opacity-60">{user.email}</div>
              <a href={`/u/${user.name ?? user.email?.split("@")[0] ?? "me"}`}
                className="brutal-border bg-acid text-ink px-3 py-1 font-display text-xs hover:bg-sun transition-colors">
                Public Profile →
              </a>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* ══ NEXT LESSON ════════════════════════════════════════════════ */}
        <SectionReveal>
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// NEXT LESSON</div>
          {!hydrated ? (
            <div className="brutal-border animate-pulse p-5 space-y-3">
              <div className="h-3 w-32 bg-ink/10 rounded" /><div className="h-8 w-2/3 bg-ink/10 rounded" /><div className="h-5 w-24 bg-ink/10 rounded" />
            </div>
          ) : continueSlug ? (
            <div className="brutal-border flex flex-col md:flex-row items-stretch overflow-hidden border-l-4 border-l-acid chunk-shadow">
              <div className="flex-1 p-5">
                <div className="font-mono text-[9px] uppercase opacity-50 mb-1">
                  {lastCtx?.worldLabel ?? "Fundamentals"}{lastCtx?.chapter ? ` › ${lastCtx.chapter.title}` : ""}{lastCtx?.path ? ` › ${lastCtx.path.title}` : ""}
                </div>
                <div className="font-display text-3xl md:text-4xl leading-tight mb-1">{continueTitle}</div>
                {continueTagline && <div className="font-sans text-sm opacity-60 mb-3 leading-snug">{continueTagline}</div>}
                <div className="flex items-center gap-3 flex-wrap">
                  {continueXp > 0 && <span className="brutal-border bg-acid text-ink px-3 py-1 font-mono text-[10px] uppercase">+{continueXp} XP</span>}
                  <span className="font-mono text-[9px] opacity-50">{totalDone}/{totalMissions} complete</span>
                </div>
              </div>
              <Link href={`/learn/${continueSlug}`}
                className="brutal-border border-y-0 border-r-0 md:border-l-4 bg-acid text-ink flex items-center justify-center px-8 py-5 md:py-0 brutal-press chunk-shadow hover:bg-sun transition-colors min-w-[80px] ccd-btn-hover"
                aria-label="Start lesson">
                <span className="font-display text-5xl">▶</span>
              </Link>
            </div>
          ) : (
            <div className="brutal-border bg-volt text-bone p-6">
              <div className="font-display text-2xl">🎉 ALL CAUGHT UP</div>
              <div className="font-mono text-sm opacity-70 mt-1">Check your review queue below or explore another world.</div>
            </div>
          )}
        </section>
        </SectionReveal>

        {/* ══ DAILY GOAL + CHALLENGE ══════════════════════════════════ */}
        {hydrated && (
          <SectionReveal delay={0.03}>
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// TODAY&apos;S PRACTICE</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Daily Goal card */}
              <Link href="/daily" className="brutal-border bg-ink text-bone p-5 flex items-center gap-5 brutal-press hover:bg-[#0a1a3e] transition-colors chunk-shadow">
                <div className="shrink-0">
                  <GoalRing pct={dailyGoalPct} done={dailyGoalDone} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-xl leading-tight mb-1">
                    {dailyGoalDone ? "Goal Done! 🎉" : "Daily Goal"}
                  </div>
                  <div className="font-mono text-xs opacity-60 mb-2">
                    {progress.dailyXp} / {DAILY_GOAL_XP} XP today
                  </div>
                  {dailyGoalDone ? (
                    <div className="font-mono text-[10px] uppercase text-acid">✓ Streak protected</div>
                  ) : (
                    <div className="font-mono text-[10px] uppercase opacity-50">
                      {DAILY_GOAL_XP - progress.dailyXp} XP to go
                    </div>
                  )}
                  {progress.streakDays > 0 && (
                    <div className="font-mono text-[10px] uppercase opacity-60 mt-1">
                      🔥 {progress.streakDays}-day streak{progress.streakShield ? " 🛡" : ""}
                    </div>
                  )}
                </div>
              </Link>

              {/* Daily Challenge card */}
              <Link href="/challenge" className="brutal-border bg-volt text-ink p-5 flex items-center gap-4 brutal-press hover:bg-acid transition-colors chunk-shadow border-l-4 border-l-[#7B2FFF]">
                <div className="text-5xl shrink-0">⚡</div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-xl leading-tight mb-1">Daily Challenge</div>
                  <div className="font-mono text-xs opacity-70 mb-3 leading-snug">
                    Test your knowledge with today&apos;s timed challenge. New every day.
                  </div>
                  <div className="brutal-border bg-ink text-bone px-4 py-2 font-display text-sm inline-block">
                    START CHALLENGE →
                  </div>
                </div>
              </Link>

            </div>
          </section>
          </SectionReveal>
        )}

        {/* ══ STATS 2×2 GRID ═════════════════════════════════════════════ */}
        <SectionReveal delay={0.04}>
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// TODAY</div>
          {!hydrated ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="brutal-border p-5 space-y-2 animate-pulse"><div className="h-10 bg-ink/10 rounded" /><div className="h-3 w-16 bg-ink/10 rounded" /></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* XP */}
              <div className="brutal-border bg-acid text-ink p-5 chunk-shadow">
                <motion.div className="font-display text-4xl md:text-5xl tabular-nums leading-none" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  {progress.xp.toLocaleString()}
                </motion.div>
                <div className="font-mono text-[10px] uppercase opacity-60 mt-2">Total XP</div>
              </div>
              {/* Streak */}
              <div className="brutal-border bg-hot text-bone p-5 chunk-shadow">
                <motion.div className="font-display text-4xl md:text-5xl leading-none" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}>
                  🔥{progress.streakDays}{progress.streakShield && <span className="text-2xl ml-1">🛡</span>}
                </motion.div>
                <div className="font-mono text-[10px] uppercase opacity-60 mt-2">Day Streak</div>
              </div>
              {/* Missions */}
              <div className="brutal-border bg-bone p-5 chunk-shadow">
                <motion.div className="font-display text-4xl md:text-5xl tabular-nums leading-none" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.10 }}>
                  {totalDone}
                </motion.div>
                <div className="font-mono text-[10px] uppercase opacity-60 mt-2">Missions Done</div>
              </div>
              {/* Gems */}
              <div className="brutal-border bg-electric-blue text-bone p-5 chunk-shadow">
                <motion.div className="font-display text-4xl md:text-5xl leading-none" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
                  💎{progress.gems}
                </motion.div>
                <div className="font-mono text-[10px] uppercase opacity-60 mt-2">Gems</div>
              </div>
            </div>
          )}
        </section>
        </SectionReveal>

        {/* ══ RANK PROGRESS ══════════════════════════════════════════════ */}
        {hydrated && nextRank && (
          <SectionReveal delay={0.06}>
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// RANK PROGRESS</div>
            <div className="brutal-border p-4 chunk-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{rank.emoji}</span>
                  <div className="font-display text-base">{rank.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-display text-base">{nextRank.emoji} {nextRank.name}</div>
                </div>
              </div>
              <div className="h-4 brutal-border bg-ink/10 overflow-hidden">
                <motion.div
                  className="h-full bg-acid"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(rankPct * 100)}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <div className="font-mono text-[10px] uppercase opacity-50">{progress.xp} XP</div>
                <div className="font-mono text-[10px] uppercase opacity-50">{nextRank.minXp - progress.xp} XP to go</div>
              </div>
            </div>
          </section>
          </SectionReveal>
        )}

        {/* ══ WORLD PROGRESS ═════════════════════════════════════════════ */}
        <SectionReveal delay={0.08}>
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-[10px] uppercase opacity-40">// WORLD PROGRESS</div>
            <Link href="/worlds" className="font-mono text-[9px] uppercase opacity-50 hover:opacity-100 brutal-press">ALL WORLDS →</Link>
          </div>
          <div className="space-y-3">
            {(["fundamentals", "dj", "producer"] as WorldKey[]).map((world, i) => {
              const cfg = WORLD_CONFIG[world];
              const ws = worldStats[world];
              return (
                <Link key={world} href={cfg.href}
                  className={`brutal-border ${cfg.bg} ${cfg.textColor} p-4 flex items-center gap-4 brutal-press hover:opacity-90 transition-opacity chunk-shadow relative overflow-hidden`}>
                  {/* Cat */}
                  <div className="absolute right-3 bottom-0 w-14 h-14 pointer-events-none wiggle opacity-50" aria-hidden>
                    <Image src={cfg.catSrc} alt="" width={56} height={56} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-3xl shrink-0">{cfg.emoji}</div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div className="font-display text-lg">{cfg.label}</div>
                      <div className="font-display text-2xl tabular-nums">{ws.pct}%</div>
                    </div>
                    <div className="h-2.5 brutal-border bg-bone/25 overflow-hidden">
                      <motion.div
                        className={`h-full ${cfg.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${ws.pct}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.15 }}
                      />
                    </div>
                    <div className="font-mono text-[9px] uppercase opacity-60 mt-1">
                      {ws.done}/{ws.total} missions · {ws.done === 0 ? "Start →" : ws.pct === 100 ? "Completed ✓" : "Continue →"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
        </SectionReveal>

        {/* ══ SKILL RADAR + RECENT BADGES (side by side) ═════════════════ */}
        <SectionReveal delay={0.1}>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Skill radar */}
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// SKILL COVERAGE</div>
            <div className="brutal-border p-5 flex flex-col items-center gap-4">
              <SkillRadar skills={radarSkills} />
              <div className="w-full space-y-1.5">
                {radarSkills.map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className="font-mono text-[9px] uppercase w-12 shrink-0 opacity-60">{s.label}</div>
                    <div className="flex-1 h-1.5 brutal-border bg-ink/10 overflow-hidden">
                      <div className="h-full bg-acid transition-all duration-700" style={{ width: `${s.pct}%` }} />
                    </div>
                    <div className="font-mono text-[9px] w-7 text-right opacity-50">{s.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent badges */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] uppercase opacity-40">// RECENT BADGES</div>
              <Link href="/profile" className="font-mono text-[9px] uppercase opacity-50 hover:opacity-100 brutal-press">ALL →</Link>
            </div>
            {recentBadges.length === 0 ? (
              <div className="brutal-border p-6 text-center h-full flex flex-col items-center justify-center gap-3">
                <div className="text-5xl">🏅</div>
                <div className="font-mono text-[10px] uppercase opacity-40">Complete your first lesson to earn a badge</div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBadges.map((slug, i) => {
                  const badge = getBadge(slug);
                  const BADGE_COLORS = ["bg-acid text-ink", "bg-electric-blue text-bone", "bg-magenta text-bone"];
                  return (
                    <div key={slug} className={`brutal-border ${BADGE_COLORS[i % BADGE_COLORS.length]} p-4 flex items-center gap-4 chunk-shadow`}>
                      <div className="text-4xl shrink-0">{badge.emoji}</div>
                      <div>
                        <div className="font-display text-lg leading-tight">{badge.name}</div>
                        <div className="font-mono text-[9px] opacity-60 leading-snug">{badge.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
        </SectionReveal>

        {/* ══ REVIEW QUEUE ═══════════════════════════════════════════════ */}
        {reviewData.length > 0 && (
          <SectionReveal delay={0.12}>
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// REVIEW QUEUE — {missionsNeedingReview.length} FADING</div>
            <div className="brutal-border overflow-hidden chunk-shadow">
              <div className="flex items-center justify-between p-4 border-b-2 border-ink/10">
                <div>
                  <div className="font-display text-lg">Review Session</div>
                  <div className="font-mono text-[9px] uppercase opacity-40">{missionsNeedingReview.length} lesson{missionsNeedingReview.length !== 1 ? "s" : ""} need a refresh</div>
                </div>
                <Link href={`/learn/${missionsNeedingReview[0]}?review=1`}
                  className="brutal-border bg-hot text-bone px-4 py-2 font-display text-sm brutal-press shrink-0">
                  START →
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 p-4">
                {reviewData.map(({ slug, title, pct }) => (
                  <Link key={slug} href={`/learn/${slug}?review=1`}
                    className="brutal-border bg-bone px-3 py-2 flex items-center gap-2 brutal-press hover:bg-acid/20 transition-colors">
                    <span className="font-mono text-xs uppercase flex-1 min-w-0 truncate">{title}</span>
                    <StrengthBar pct={pct} />
                  </Link>
                ))}
              </div>
            </div>
          </section>
          </SectionReveal>
        )}

        {/* ══ BEAT COACH + LEADERBOARD ═══════════════════════════════════ */}
        <SectionReveal delay={0.14}>
        <div className="grid md:grid-cols-2 gap-4">

          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// AI TUTOR</div>
            <button onClick={() => setCoachOpen(true)}
              className="w-full brutal-border bg-volt text-bone p-5 flex items-center gap-4 brutal-press hover:bg-volt/90 transition-colors text-left border-l-4 border-l-[#7B2FFF] chunk-shadow">
              <div className="text-4xl shrink-0">🎧</div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-lg">Ask Beat Coach</div>
                <div className="font-mono text-[9px] uppercase opacity-60 mt-0.5">AI music tutor · Powered by Kimi AI</div>
              </div>
              <div className="font-display text-2xl shrink-0 opacity-50">→</div>
            </button>
            {coachOpen && (
              <CoachPanel
                context={formatDashboardContext({ streak: progress.streakDays ?? 0, xp: progress.xp ?? 0, world: lastCtx?.world ?? null, nextSlug: continueSlug ?? null })}
                onClose={() => setCoachOpen(false)}
              />
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] uppercase opacity-40">// LEADERBOARD</div>
              <Link href="/leaderboard" className="font-mono text-[9px] uppercase opacity-50 hover:opacity-100 brutal-press">FULL →</Link>
            </div>
            <div className="brutal-border overflow-hidden chunk-shadow">
              {loadingLeaders ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="flex items-center gap-3"><Skeleton className="w-6 h-6" /><Skeleton className="flex-1 h-4" /><Skeleton className="w-16 h-4" /></div>)}
                </div>
              ) : leaders.length === 0 ? (
                <div className="p-5 font-mono text-[10px] opacity-40 text-center uppercase">No data yet</div>
              ) : (
                <>
                  {leaders.map((entry, i) => {
                    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
                    return (
                      <div key={entry.rank} className={`flex items-center gap-3 px-4 py-3 border-b border-ink/10 last:border-b-0 ${entry.isCurrentUser ? "bg-acid/20" : ""}`}>
                        <span className="text-lg w-7 shrink-0">{medal}</span>
                        <span className="font-mono text-sm flex-1 truncate">{entry.name}{entry.isCurrentUser && <span className="opacity-40 ml-1">(you)</span>}</span>
                        <span className="font-display text-sm tabular-nums shrink-0">{entry.xp.toLocaleString()} XP</span>
                      </div>
                    );
                  })}
                  {user && currentUserRank && currentUserRank > 3 && (
                    <>
                      <div className="px-4 py-1 font-mono text-[9px] opacity-25 text-center border-t border-ink/10">···</div>
                      <div className="flex items-center gap-3 px-4 py-3 bg-acid/20">
                        <span className="font-mono text-sm w-7 shrink-0">#{currentUserRank}</span>
                        <span className="font-mono text-sm flex-1 truncate">{user.name ?? "You"}<span className="opacity-40 ml-1">(you)</span></span>
                        <span className="font-display text-sm tabular-nums shrink-0">{progress.xp.toLocaleString()} XP</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
        </SectionReveal>

        {/* ══ FOOTER NUDGE ═══════════════════════════════════════════════ */}
        {!user && (
          <div className="brutal-border bg-ink text-bone p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-display text-lg">Save your progress</div>
              <div className="font-mono text-[10px] opacity-50 mt-0.5">Sync across devices · appear on the leaderboard</div>
            </div>
            <Link href="/login" className="brutal-border bg-acid text-ink px-5 py-2.5 font-display text-base brutal-press brutal-shadow shrink-0">
              SIGN UP FREE →
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
