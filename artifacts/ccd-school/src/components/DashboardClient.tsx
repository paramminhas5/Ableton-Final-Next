"use client";
/**
 * DashboardClient — the unified progress hub.
 *
 * Sections:
 *  1. Hero "Next Step" card — smart continue button  [skeleton on cold load]
 *  2. Today's Stats strip — 5 stat cards             [scroll dots on mobile]
 *  3. My Worlds — 3 world progress cards
 *  4. Skill Radar
 *  5. Recent Badges
 *  6. Review Queue
 *  7. Beat Coach card
 *  8. Leaderboard peek
 */
import Link from "next/link";
import Image from "next/image";
import { useProgress, DAILY_GOAL_XP, MAX_HEARTS, getLessonStrength } from "@/lib/progress";

const DASHBOARD_BG = "https://v3b.fal.media/files/b/0a9d85a6/5ncScsflwn_0wVLbzZJlu.jpg";
const WORLD_BANNERS: Record<string, string> = {
  fundamentals: "https://v3b.fal.media/files/b/0a9d8573/T1yPDNCVhxrVLWBs3vPLK.jpg",
  dj: "https://v3b.fal.media/files/b/0a9d8573/vkzVEVke8UdYZtUAJEt5P.jpg",
};
import { useAuth } from "@/lib/auth";
import { useLearnMode } from "@/lib/mode";
import { rankFor } from "@/lib/ranks";
import { MISSIONS } from "@/content/missions";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { getMissionContext } from "@/lib/missionContext";
import { CoachPanel } from "@/components/BeatCoach";
import { useEffect, useState, useMemo, useRef } from "react";

// ─── Badge Registry ───────────────────────────────────────────────────────────
const BADGE_REGISTRY: Record<string, { name: string; emoji: string; description: string }> = {
  "first-wave":       { name: "First Wave",       emoji: "🌊", description: "Completed: What Is Sound?" },
  "dj-initiate":      { name: "DJ Initiate",       emoji: "🎧", description: "Completed: What Is DJing?" },
  "first-mix":        { name: "First Mix",         emoji: "🎚", description: "Completed: Your First Mix" },
  "first-boot":       { name: "First Boot",        emoji: "💻", description: "Completed: What Is Live?" },
  "acoustician":      { name: "Acoustician",       emoji: "🔬", description: "Completed Sound Science chapter" },
  "timekeeper-trophy":{ name: "Timekeeper",        emoji: "⏱", description: "Completed Rhythm & Time chapter" },
  "melodist":         { name: "Melodist",          emoji: "🎵", description: "Completed Melody & Pitch chapter" },
  "harmonist":        { name: "Harmonist",         emoji: "🎼", description: "Completed Harmony & Chords chapter" },
  "studio-ready":     { name: "Studio Ready",      emoji: "🎛", description: "Completed Music Technology chapter" },
  "dj-initiate-chapter": { name: "DJ Initiate",   emoji: "🎧", description: "Completed Setup & Culture chapter" },
  "library-curator":  { name: "Library Curator",   emoji: "📚", description: "Completed The Library chapter" },
  "blendmaster":      { name: "Blendmaster",       emoji: "🎚", description: "Completed The Mix chapter" },
  "crowd-reader":     { name: "Crowd Reader",      emoji: "👁", description: "Completed Performance chapter" },
  "club-ready":       { name: "Club Ready",        emoji: "🕺", description: "Completed DJ Mastery chapter" },
  "live-initiated":   { name: "Live Initiated",    emoji: "🟢", description: "Completed First Contact chapter" },
  "sound-sculptor":   { name: "Sound Sculptor",    emoji: "🌀", description: "Completed Sound & MIDI chapter" },
  "mix-engineer":     { name: "Mix Engineer",      emoji: "🎛", description: "Completed The Mix chapter" },
  "performance-ready":{ name: "Performance Ready", emoji: "🎤", description: "Completed Performance & Flow chapter" },
  "live12-expert":    { name: "Live 12 Expert",    emoji: "👑", description: "Completed Advanced chapter" },
  "synth-architect":  { name: "Synth Architect",   emoji: "⚡", description: "Completed Synthesis chapter" },
};

function getBadge(slug: string) {
  return BADGE_REGISTRY[slug] ?? { name: slug.replace(/-/g, " "), emoji: "🏅", description: "Achievement unlocked" };
}


// ─── World Config ─────────────────────────────────────────────────────────────
type WorldKey = "fundamentals" | "dj" | "producer";

const WORLD_CONFIG: Record<WorldKey, {
  emoji: string;
  label: string;
  color: string;
  headerText: string;
  bar: string;
  href: string;
  pillActive: string;
  pillPartial: string;
}> = {
  fundamentals: {
    emoji: "🎵",
    label: "Fundamentals",
    color: "bg-acid text-ink",
    headerText: "text-ink",
    bar: "bg-ink",
    href: "/world/fundamentals",
    pillActive: "bg-ink text-bone",
    pillPartial: "bg-ink/40 text-ink",
  },
  dj: {
    emoji: "🎧",
    label: "DJ World",
    color: "bg-ink text-bone",
    headerText: "text-bone",
    bar: "bg-volt",
    href: "/world/dj",
    pillActive: "bg-volt text-bone",
    pillPartial: "bg-volt/40 text-bone",
  },
  producer: {
    emoji: "🎛",
    label: "Producer",
    color: "bg-sun text-ink",
    headerText: "text-ink",
    bar: "bg-ink",
    href: "/world/producer",
    pillActive: "bg-ink text-bone",
    pillPartial: "bg-ink/40 text-ink",
  },
};

// ─── Skill Radar ──────────────────────────────────────────────────────────────
function SkillRadar({ skills }: { skills: { label: string; pct: number }[] }) {
  const cx = 120, cy = 120, r = 85;
  const n = skills.length;

  const point = (i: number, scale: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * r * scale,
      y: cy + Math.sin(angle) * r * scale,
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const polyPoints = skills
    .map((s, i) => {
      const p = point(i, Math.max(0.04, s.pct / 100));
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[280px]" aria-label="Skill radar chart">
      {/* Grid polygons */}
      {gridLevels.map((scale) => {
        const pts = skills
          .map((_, i) => {
            const p = point(i, scale);
            return `${p.x},${p.y}`;
          })
          .join(" ");
        return (
          <polygon
            key={scale}
            points={pts}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.15"
          />
        );
      })}

      {/* Axis lines */}
      {skills.map((_, i) => {
        const p = point(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.2"
          />
        );
      })}

      {/* Filled area */}
      <polygon
        points={polyPoints}
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Labels */}
      {skills.map((s, i) => {
        const p = point(i, 1.28);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-mono"
            fontSize="7.5"
            fill="currentColor"
            opacity="0.7"
          >
            {s.label}
          </text>
        );
      })}

      {/* Pct labels on filled area */}
      {skills.map((s, i) => {
        const p = point(i, Math.max(0.1, s.pct / 100) + 0.1);
        if (s.pct === 0) return null;
        return (
          <text
            key={`pct-${i}`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="6"
            fill="currentColor"
            opacity="0.9"
            fontWeight="bold"
          >
            {s.pct}%
          </text>
        );
      })}
    </svg>
  );
}


// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color,
  href,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  href?: string;
}) {
  // Map card background to top border color
  const topBorder =
    color.includes("bg-volt") ? "border-t-4 border-t-[#7B2FFF]"
    : color.includes("bg-acid") ? "border-t-4 border-t-[#C6FF00]"
    : color.includes("bg-hot") ? "border-t-4 border-t-[#FF2D2D]"
    : color.includes("bg-sun") ? "border-t-4 border-t-[#FFB800]"
    : "";
  const inner = (
    <div className={`brutal-border ${color} ${topBorder} p-4 flex flex-col gap-1 min-w-[120px] h-full`}>
      <div className="font-mono text-[9px] uppercase opacity-50 leading-none">{label}</div>
      <div className="font-display text-2xl leading-tight">{value}</div>
      <div className="font-mono text-[9px] opacity-60 leading-tight">{sub}</div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="brutal-press hover:opacity-90 transition-opacity shrink-0">
        {inner}
      </Link>
    );
  }
  return <div className="shrink-0">{inner}</div>;
}

// ─── Strength Bar ─────────────────────────────────────────────────────────────
function StrengthBar({ pct }: { pct: number }) {
  const color =
    pct >= 70 ? "bg-acid" : pct >= 40 ? "bg-sun" : "bg-hot";
  return (
    <div className="h-1 brutal-border bg-bone/20 overflow-hidden w-16 shrink-0">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-ink/10 ${className ?? ""}`}
    />
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────
export function DashboardClient() {
  const {
    progress,
    missionsNeedingReview,
    dailyGoalPct,
    dailyGoalDone,
    heartRefillSeconds,
  } = useProgress();
  const { user } = useAuth();
  const { learnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const { current: rank, next: nextRank } = rankFor(progress.xp);

  const allMissions = useMemo(
    () => [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS],
    []
  );
  const totalDone = allMissions.filter((m) => !!completed[m.slug]).length;
  const totalMissions = allMissions.length;

  // ── Leaderboard state ──────────────────────────────────────────────────────
  const [leaders, setLeaders] = useState<
    { name: string; xp: number; rank: number; isCurrentUser?: boolean }[]
  >([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [coachOpen, setCoachOpen] = useState(false);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        const entries: { name: string; xp: number; rank: number; isCurrentUser?: boolean }[] =
          (d.entries ?? []).slice(0, 3).map(
            (e: { name?: string; xp?: number; rank?: number; isCurrentUser?: boolean }) => ({
              name: e.name ?? "Anonymous",
              xp: e.xp ?? 0,
              rank: e.rank ?? 0,
              isCurrentUser: e.isCurrentUser ?? false,
            })
          );
        setLeaders(entries);
        setCurrentUserRank(d.currentUserRank ?? null);
        setLoadingLeaders(false);
      })
      .catch(() => setLoadingLeaders(false));
  }, []);

  // ── Hero: find next mission ────────────────────────────────────────────────
  const { continueSlug, lastCtx } = useMemo(() => {
    const allDoneSlugs = Object.entries(completed)
      .filter(([, v]) => v)
      .sort(([, a], [, b]) => (b?.at ?? 0) - (a?.at ?? 0))
      .map(([slug]) => slug);
    const lastSlug = allDoneSlugs[0];
    const ctx = lastSlug ? getMissionContext(lastSlug) : null;
    const nextSlug = ctx?.path
      ? (() => {
          const idx = ctx.path.missionSlugs.indexOf(lastSlug!);
          const ns = ctx.path.missionSlugs[idx + 1];
          return ns && !completed[ns] ? ns : null;
        })()
      : null;
    const slug = nextSlug ?? (totalDone === 0 ? "what-is-sound" : null);
    return { continueSlug: slug, lastCtx: ctx };
  }, [completed, totalDone]);

  const continueTitle = useMemo(() => {
    if (!continueSlug) return null;
    const m = allMissions.find((m) => m.slug === continueSlug);
    return m?.title ?? continueSlug.replace(/-/g, " ");
  }, [continueSlug, allMissions]);

  const continueXp = useMemo(() => {
    if (!continueSlug) return 0;
    return allMissions.find((m) => m.slug === continueSlug)?.xp ?? 0;
  }, [continueSlug, allMissions]);


  // ── World stats ───────────────────────────────────────────────────────────
  const worldStats = useMemo(() => {
    const compute = (world: WorldKey) => {
      const paths = pathsByWorld(world);
      const chapters = chaptersByWorld(world);
      const slugs = paths.flatMap((p) => p.missionSlugs);
      const done = slugs.filter((s) => !!completed[s]).length;
      const chapterData = chapters.map((ch) => {
        const chPaths = paths.filter((p) => p.chapter === ch.slug);
        const chSlugs = chPaths.flatMap((p) => p.missionSlugs);
        const chDone = chSlugs.filter((s) => !!completed[s]).length;
        return {
          slug: ch.slug,
          number: ch.number,
          title: ch.title,
          done: chDone,
          total: chSlugs.length,
          pct: chSlugs.length ? Math.round((chDone / chSlugs.length) * 100) : 0,
        };
      });
      return {
        done,
        total: slugs.length,
        pct: slugs.length ? Math.round((done / slugs.length) * 100) : 0,
        chapters: chapterData,
      };
    };
    return {
      fundamentals: compute("fundamentals"),
      dj: compute("dj"),
      producer: compute("producer"),
    };
  }, [completed]);

  // ── Skill Radar — shows the world the user is most active in ─────────────
  // Priority: world with most completed missions → fallback to fundamentals
  const radarWorld = useMemo((): WorldKey => {
    const counts = (["fundamentals", "dj", "producer"] as WorldKey[]).map((w) => {
      const slugs = pathsByWorld(w).flatMap((p) => p.missionSlugs);
      return { world: w, done: slugs.filter((s) => !!completed[s]).length };
    });
    const best = counts.reduce((a, b) => (b.done > a.done ? b : a), counts[0]);
    return best.done > 0 ? best.world : "fundamentals";
  }, [completed]);

  // Short label map per world
  const RADAR_LABELS: Record<string, Record<string, string>> = {
    fundamentals: {
      "Sound Science": "Sound", "Rhythm & Time": "Rhythm",
      "Melody & Pitch": "Melody", "Harmony & Chords": "Harmony", "Music Technology": "Tech",
    },
    dj: {
      "Setup & Culture": "Setup", "The Library": "Library",
      "The Mix": "The Mix", "DJ Performance": "Perform", "DJ Mastery": "Mastery",
    },
    producer: {
      "First Contact": "Contact", "Sound & MIDI": "S&MIDI",
      "The Mix": "Mix", "Performance & Flow": "Perform", "Advanced Producer": "Advanced",
    },
  };

  const radarSkills = useMemo(() => {
    const chapters = chaptersByWorld(radarWorld);
    const paths = pathsByWorld(radarWorld);
    const labelMap = RADAR_LABELS[radarWorld] ?? {};
    return chapters.map((ch) => {
      const chPaths = paths.filter((p) => p.chapter === ch.slug);
      const slugs = chPaths.flatMap((p) => p.missionSlugs);
      const done = slugs.filter((s) => !!completed[s]).length;
      const pct = slugs.length ? Math.round((done / slugs.length) * 100) : 0;
      const shortLabel = labelMap[ch.title] ?? ch.title.split(" ")[0];
      return { label: shortLabel, pct };
    });
  }, [completed, radarWorld]);

  // ── Stats strip ───────────────────────────────────────────────────────────
  const stats = [
    {
      label: "Streak",
      value: `🔥 ${progress.streakDays}${progress.streakShield ? "🛡" : ""}`,
      sub: progress.streakDays === 1 ? "1 day" : `${progress.streakDays} days`,
      color: "bg-volt text-bone",
      href: undefined,
    },
    {
      label: "Daily XP",
      value: `${progress.dailyXp}/${DAILY_GOAL_XP}`,
      sub: dailyGoalDone ? "✓ Goal done!" : `${DAILY_GOAL_XP - progress.dailyXp} to go`,
      color: dailyGoalDone ? "bg-acid text-ink" : "bg-bone text-ink",
      href: undefined,
    },
    {
      label: "Hearts",
      value: `${progress.hearts}/${MAX_HEARTS}`,
      sub:
        heartRefillSeconds > 0
          ? `+1 in ${Math.ceil(heartRefillSeconds / 60)}m`
          : "Full",
      color: "bg-bone text-ink",
      href: undefined,
    },
    {
      label: "Gems",
      value: `💎 ${progress.gems}`,
      sub: "visit shop →",
      color: "bg-bone text-ink",
      href: "/shop",
    },
    {
      label: "Rank",
      value: `${rank.emoji} ${rank.name}`,
      sub: nextRank
        ? `${nextRank.minXp - progress.xp} XP to ${nextRank.name}`
        : "Max rank!",
      color: "bg-bone text-ink",
      href: "/profile",
    },
  ];


  // ── Review queue with strength data ──────────────────────────────────────
  const reviewData = useMemo(() => {
    return missionsNeedingReview.slice(0, 8).map((slug) => {
      const m = allMissions.find((m) => m.slug === slug);
      const ls = progress.lessonStrengths[slug];
      const pct = ls ? Math.round(getLessonStrength(ls) * 100) : 0;
      return { slug, title: m?.title ?? slug.replace(/-/g, " "), pct };
    });
  }, [missionsNeedingReview, allMissions, progress.lessonStrengths]);

  // ── Recent badges ─────────────────────────────────────────────────────────
  const recentBadges = useMemo(() => {
    return [...progress.badges].reverse().slice(0, 3);
  }, [progress.badges]);

  const modeLabel = learnMode === "ccd" ? "🗺 Path Mode" : "🔓 Explore Mode";

  // Fix #5: hydration guard — progress reads from localStorage, which is
  // unavailable during SSR. Show skeleton for the first render tick.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // Fix #6: scroll-dot tracking for the stats strip on mobile
  const statsRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardW = el.scrollWidth / stats.length;
      setActiveDot(Math.round(el.scrollLeft / cardW));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.length]);

  return (
    <main className="min-h-screen bg-bone pb-24">

      {/* ══ SECTION 1: Hero Next Step ══════════════════════════════════════ */}
      <section className="brutal-border border-x-0 border-t-0 bg-ink text-bone relative overflow-hidden">
        {/* DASHBOARD_BG layer */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src={DASHBOARD_BG}
            alt=""
            fill
            className="object-cover opacity-15 mix-blend-luminosity"
            sizes="100vw"
            priority
          />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="font-mono text-[10px] uppercase opacity-40">// YOUR NEXT LESSON</div>
            <span className="font-mono text-[9px] brutal-border px-2 py-0.5 opacity-60">
              {modeLabel}
            </span>
          </div>

          {/* Fix #5: skeleton while localStorage hydrates */}
          {!hydrated ? (
            <div className="brutal-border overflow-hidden animate-pulse">
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="flex-1 p-5 md:p-7 space-y-3">
                  <div className="h-3 w-32 bg-bone/20 rounded" />
                  <div className="h-10 w-3/4 bg-bone/20 rounded" />
                  <div className="h-6 w-24 bg-bone/20 rounded" />
                </div>
                <div className="bg-bone/10 flex items-center justify-center px-8 py-6 min-w-[100px]">
                  <div className="w-12 h-12 rounded-full bg-bone/20" />
                </div>
              </div>
            </div>
          ) : continueSlug ? (
            <div className="brutal-border flex flex-col md:flex-row items-stretch overflow-hidden border-l-4 border-l-acid">
              <div className="flex-1 p-5 md:p-7">
                <div className="font-mono text-[9px] uppercase opacity-50 mb-2">
                  {lastCtx?.worldLabel ?? "Fundamentals"}
                  {lastCtx?.chapter ? ` › ${lastCtx.chapter.title}` : ""}
                  {lastCtx?.path ? ` › ${lastCtx.path.title}` : ""}
                </div>
                <div className="font-display text-3xl md:text-5xl leading-tight mb-3">
                  {continueTitle}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {continueXp > 0 && (
                    <span className="brutal-border bg-acid text-ink px-3 py-1 font-mono text-[10px] uppercase">
                      +{continueXp} XP
                    </span>
                  )}
                  <span className="font-mono text-[9px] opacity-50">
                    {totalDone}/{totalMissions} complete
                  </span>
                </div>
              </div>
              <Link
                href={`/learn/${continueSlug}`}
                className="brutal-border border-y-0 border-r-0 md:border-l-2 bg-acid text-ink flex items-center justify-center px-8 py-6 md:py-0 brutal-press brutal-shadow hover:bg-sun transition-colors min-w-[100px]"
                aria-label="Start lesson"
              >
                <span className="font-display text-5xl md:text-6xl">▶</span>
              </Link>
            </div>
          ) : (
            <div className="brutal-border bg-volt text-bone p-6">
              <div className="font-display text-2xl md:text-3xl">
                🎉 ALL CAUGHT UP
              </div>
              <div className="font-mono text-sm opacity-70 mt-1">
                Check your review queue below or explore another world.
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* ══ SECTION 2: Today's Stats ════════════════════════════════════ */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// TODAY&apos;S STATS</div>

          {/* Fix #5: skeleton for stats strip */}
          {!hydrated ? (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="brutal-border p-4 space-y-2 animate-pulse">
                  <div className="h-2 w-12 bg-ink/10 rounded" />
                  <div className="h-7 w-16 bg-ink/10 rounded" />
                  <div className="h-2 w-14 bg-ink/10 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Fix #6: scroll-dots container */}
              <div
                ref={statsRef}
                className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible scrollbar-hide snap-x snap-mandatory"
              >
                {stats.map((s) => (
                  <div key={s.label} className="snap-start shrink-0 md:shrink w-[calc(33vw-1rem)] md:w-auto min-w-[120px]">
                    <StatCard {...s} />
                  </div>
                ))}
              </div>

              {/* Scroll dots — mobile only, hidden on md+ */}
              <div className="flex justify-center gap-1.5 mt-2 md:hidden" aria-hidden>
                {stats.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const el = statsRef.current;
                      if (!el) return;
                      const cardW = el.scrollWidth / stats.length;
                      el.scrollTo({ left: cardW * i, behavior: "smooth" });
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200
                      ${activeDot === i ? "bg-ink scale-125" : "bg-ink/25"}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* ══ SECTION 3: My Worlds ════════════════════════════════════════ */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// MY WORLDS</div>
          <div className="space-y-4">
            {(["fundamentals", "dj", "producer"] as WorldKey[]).map((world) => {
              const cfg = WORLD_CONFIG[world];
              const ws = worldStats[world];
              return (
                <div key={world} className={`brutal-border ${cfg.color} overflow-hidden relative`}>
                  {/* World banner image for fundamentals and dj */}
                  {WORLD_BANNERS[world] && (
                    <div className="absolute inset-0 pointer-events-none">
                      <Image
                        src={WORLD_BANNERS[world]}
                        alt=""
                        fill
                        className="object-cover opacity-10 mix-blend-multiply"
                        sizes="100vw"
                      />
                    </div>
                  )}
                  {/* World header */}
                  <div className="p-4 pb-2 relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-display text-xl flex items-center gap-2">
                        <span>{cfg.emoji}</span>
                        <span>{cfg.label}</span>
                      </div>
                      <div className="font-mono text-[10px] opacity-60">
                        {ws.pct}% · {ws.done}/{ws.total}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 brutal-border bg-bone/20 overflow-hidden mt-2">
                      <div
                        className={`h-full ${cfg.bar} transition-all duration-700`}
                        style={{ width: `${ws.pct}%` }}
                      />
                    </div>
                  </div>
                  {/* Chapter pills */}
                  <div className="px-4 pb-3 flex flex-wrap gap-2 mt-2 relative z-10">
                    {ws.chapters.map((ch) => {
                      const pillColor =
                        ch.pct === 100
                          ? cfg.pillActive
                          : ch.pct > 0
                          ? cfg.pillPartial
                          : "bg-bone/10";
                      return (
                        <Link
                          key={ch.slug}
                          href={`${cfg.href}#${ch.slug}`}
                          className={`brutal-border ${pillColor} px-2.5 py-1 font-mono text-[9px] uppercase brutal-press hover:opacity-90 transition-opacity`}
                        >
                          Ch{ch.number} {ch.pct}%
                        </Link>
                      );
                    })}
                  </div>
                  {/* CTA */}
                  <div className="border-t-2 border-current/20 relative z-10">
                    <Link
                      href={cfg.href}
                      className="block p-3 px-4 font-display text-sm brutal-press hover:bg-bone/10 transition-colors text-right"
                    >
                      {ws.done === 0 ? "Start →" : ws.pct === 100 ? "Completed ✓" : "Continue →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══ SECTION 4: Skill Radar ══════════════════════════════════════ */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// YOUR SKILL RADAR</div>
          <div className="brutal-border p-5 flex flex-col md:flex-row items-center gap-6">
            <div className="flex justify-center w-full md:w-auto">
              <SkillRadar skills={radarSkills} />
            </div>
            <div className="flex-1">
              <div className="font-display text-xl mb-1">
                {radarWorld === "fundamentals" ? "Fundamentals" : radarWorld === "dj" ? "DJ World" : "Producer"} Coverage
              </div>
              <div className="font-mono text-[10px] opacity-50 mb-4">
                Based on your most active world
              </div>
              <div className="space-y-2">
                {radarSkills.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="font-mono text-[10px] uppercase w-16 shrink-0 opacity-70">
                      {s.label}
                    </div>
                    <div className="flex-1 h-2 brutal-border bg-bone/20 overflow-hidden">
                      <div
                        className="h-full bg-acid transition-all duration-700"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                    <div className="font-mono text-[9px] w-8 text-right opacity-60">
                      {s.pct}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ SECTION 5: Recent Badges ════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-[10px] uppercase opacity-40">// RECENT BADGES</div>
            <Link href="/profile" className="font-mono text-[9px] uppercase opacity-50 hover:opacity-100 brutal-press">
              VIEW ALL BADGES →
            </Link>
          </div>

          {recentBadges.length === 0 ? (
            <div className="brutal-border p-5 text-center">
              <div className="text-4xl mb-2">🏅</div>
              <div className="font-mono text-[10px] uppercase opacity-50">
                Complete your first lesson to earn your first badge!
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recentBadges.map((slug) => {
                const badge = getBadge(slug);
                return (
                  <div key={slug} className="brutal-border p-4 flex flex-col items-center text-center gap-2">
                    <div className="text-4xl">{badge.emoji}</div>
                    <div className="font-display text-lg leading-tight">{badge.name}</div>
                    <div className="font-mono text-[9px] opacity-50 leading-snug">{badge.description}</div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ══ SECTION 6: Review Queue (conditional) ═══════════════════════ */}
        {reviewData.length > 0 && (
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">
              // REVIEW QUEUE ({missionsNeedingReview.length} lessons fading)
            </div>
            <div className="brutal-border p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="font-display text-xl mb-0.5">REVIEW SESSION</div>
                  <div className="font-mono text-[10px] opacity-50">
                    {missionsNeedingReview.length} lesson
                    {missionsNeedingReview.length !== 1 ? "s" : ""} need a refresh
                  </div>
                </div>
                <Link
                  href={`/learn/${missionsNeedingReview[0]}?review=1`}
                  className="brutal-border bg-hot text-bone px-4 py-2 font-display text-sm brutal-press brutal-shadow shrink-0"
                >
                  START REVIEW →
                </Link>
              </div>
              {/* Lesson chips with strength bars */}
              <div className="flex flex-wrap gap-2">
                {reviewData.map(({ slug, title, pct }) => (
                  <Link
                    key={slug}
                    href={`/learn/${slug}?review=1`}
                    className="brutal-border bg-bone/10 px-3 py-2 flex items-center gap-2 brutal-press hover:bg-bone/20 transition-colors"
                  >
                    <span className="font-mono text-[9px] uppercase max-w-[120px] truncate">
                      {title}
                    </span>
                    <StrengthBar pct={pct} />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ SECTION 7: Beat Coach Card ══════════════════════════════════ */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// AI TUTOR</div>
          <button
            onClick={() => setCoachOpen(true)}
            className="w-full brutal-border bg-volt text-bone p-5 flex items-center gap-4 brutal-press hover:bg-volt/90 transition-colors brutal-shadow text-left border-l-4 border-l-[#7B2FFF]"
          >
            <div className="w-16 h-16 brutal-border bg-bone/10 flex items-center justify-center text-4xl shrink-0">
              🎧
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-xl">Ask Beat Coach</div>
              <div className="font-mono text-xs opacity-80 mt-0.5 leading-relaxed">
                AI music tutor. Ask anything about music production, DJing, or Ableton Live. Powered by Kimi AI.
              </div>
            </div>
            <div className="font-display text-3xl shrink-0 opacity-60">→</div>
          </button>
          {coachOpen && (
            <CoachPanel
              context="CCD.SCHOOL Dashboard — music production and DJing tutor"
              onClose={() => setCoachOpen(false)}
            />
          )}
        </section>

        {/* ══ SECTION 8: Leaderboard Peek ════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-[10px] uppercase opacity-40">// LEADERBOARD</div>
            <Link href="/leaderboard" className="font-mono text-[9px] uppercase opacity-50 hover:opacity-100 brutal-press">
              FULL LEADERBOARD →
            </Link>
          </div>
          <div className="brutal-border overflow-hidden">
            {loadingLeaders ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-6 h-6" />
                    <Skeleton className="flex-1 h-4" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                ))}
              </div>
            ) : leaders.length === 0 ? (
              <div className="p-5 font-mono text-[10px] opacity-50 text-center uppercase">
                No leaderboard data yet
              </div>
            ) : (
              <>
                {leaders.map((entry, i) => {
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
                  return (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-3 px-4 py-3 ${
                        i < leaders.length - 1 ? "border-b-2 border-ink" : ""
                      } ${entry.isCurrentUser ? "bg-acid/20" : ""}`}
                    >
                      <span className="text-xl w-7 shrink-0">{medal}</span>
                      <span className="font-mono text-sm flex-1 truncate">
                        {entry.name}
                        {entry.isCurrentUser && (
                          <span className="opacity-50 ml-1">(you)</span>
                        )}
                      </span>
                      <span className="font-display text-sm tabular-nums shrink-0">
                        {entry.xp.toLocaleString()} XP
                      </span>
                    </div>
                  );
                })}
                {user && currentUserRank && currentUserRank > 3 && (
                  <>
                    <div className="px-4 py-1 font-mono text-[9px] uppercase opacity-30 text-center border-t-2 border-ink border-dashed">
                      ···
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-acid/20 border-t-2 border-ink">
                      <span className="font-mono text-sm w-7 shrink-0">#{currentUserRank}</span>
                      <span className="font-mono text-sm flex-1 truncate">
                        {user.name ?? "You"}
                        <span className="opacity-50 ml-1">(you)</span>
                      </span>
                      <span className="font-display text-sm tabular-nums shrink-0">
                        {progress.xp.toLocaleString()} XP
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>

        {/* ══ Footer nudge ══════════════════════════════════════════════════ */}
        {!user && (
          <div className="brutal-border bg-ink text-bone p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-display text-lg">Save your progress</div>
              <div className="font-mono text-[10px] opacity-60 mt-0.5">
                Create a free account to sync across devices and appear on the leaderboard.
              </div>
            </div>
            <Link
              href="/login"
              className="brutal-border bg-acid text-ink px-5 py-2.5 font-display text-base brutal-press brutal-shadow shrink-0"
            >
              SIGN UP FREE →
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
