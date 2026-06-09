"use client";
/**
 * WorldPathClient — Duolingo-style world path map.
 *
 * Overhaul:
 * ✓ NO full-bleed images — solid color hero block with cat + decorative elements
 * ✓ Inline mode indicator (not a sticky toggle band) — synced to Header pill
 * ✓ Chapter progress strip: expanded full-width pills, not tiny squished dots
 * ✓ ModeToggleBand removed — Header ModeTogglePill is the single source of truth
 * ✓ All cats used liberally
 * ✓ DJ world: deep blue (#0a0f2e)
 */
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useProgress, getLessonStrength, REVIEW_THRESHOLD } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { rankFor } from "@/lib/ranks";
import type { Mission } from "@/content/types";
import type { Chapter } from "@/content/chapters";

type WorldId = "fundamentals" | "dj" | "producer";
type NodeState = "locked" | "available" | "complete" | "review";

interface PathNode {
  slug: string;
  title: string;
  xp: number;
  chapterSlug: string;
  chapterIndex: number;
  state: NodeState;
  isFirstInChapter: boolean;
  side: "left" | "center" | "right";
}

// ─── World config — NO images, pure color ─────────────────────────────────────
const WORLD_META: Record<string, {
  bg: string; heroBg: string; textColor: string; accent: string;
  nodeAvail: string; nodeDone: string; nodeReview: string;
  emoji: string; title: string; tagline: string;
  catMain: string; catDeco1: string; catDeco2: string;
  deco1: string; deco2: string;
  glowColor: string;
  heroBorder: string;
  pillDone: string; pillPartial: string; pillEmpty: string;
  chapterBannerBg: string; chapterBannerBorder: string;
  modeBg: string; modeText: string;
  freeModeLinkClass: string;
}> = {
  fundamentals: {
    bg: "bg-bone", heroBg: "bg-acid", textColor: "text-ink", accent: "bg-acid text-ink",
    nodeAvail: "bg-acid text-ink border-4 border-ink",
    nodeDone: "bg-ink text-bone border-4 border-ink",
    nodeReview: "bg-hot text-bone border-4 border-hot",
    emoji: "🎵", title: "Fundamentals",
    tagline: "Sound · Rhythm · Melody · Harmony · Music Tech",
    catMain: "/cats/cat-handstand.png",
    catDeco1: "/cats/cat-headphones.png",
    catDeco2: "/cats/cat-dancer.png",
    deco1: "/cats/music-note.png",
    deco2: "/cats/star.png",
    glowColor: "rgba(198,255,0,0.45)",
    heroBorder: "border-b-4 border-ink",
    pillDone: "bg-ink text-bone",
    pillPartial: "bg-ink/30 text-ink",
    pillEmpty: "bg-ink/10 text-ink/40",
    chapterBannerBg: "bg-acid/25",
    chapterBannerBorder: "border-t-4 border-t-acid",
    modeBg: "bg-ink text-bone",
    modeText: "text-bone",
    freeModeLinkClass: "bg-ink/10 text-ink hover:bg-ink/20",
  },
  dj: {
    bg: "bg-[#0a0f2e]", heroBg: "bg-[#0a0f2e]", textColor: "text-bone", accent: "bg-volt text-ink",
    nodeAvail: "bg-volt text-ink border-4 border-volt",
    nodeDone: "bg-volt/20 text-bone border-4 border-volt/50",
    nodeReview: "bg-hot text-bone border-4 border-hot",
    emoji: "🎧", title: "DJ World",
    tagline: "Setup · Library · The Mix · Performance · Mastery",
    catMain: "/cats/cat-dj.png",
    catDeco1: "/cats/cat-dj-new.png",
    catDeco2: "/cats/cat-cap.png",
    deco1: "/cats/disco-ball.png",
    deco2: "/cats/headphones.png",
    glowColor: "rgba(198,255,0,0.45)",
    heroBorder: "border-b-4 border-volt",
    pillDone: "bg-volt text-ink",
    pillPartial: "bg-volt/30 text-bone",
    pillEmpty: "bg-bone/10 text-bone/30",
    chapterBannerBg: "bg-volt/10",
    chapterBannerBorder: "border-t-4 border-t-volt",
    modeBg: "bg-volt text-ink",
    modeText: "text-ink",
    freeModeLinkClass: "bg-bone/10 text-bone hover:bg-bone/20",
  },
  producer: {
    bg: "bg-bone", heroBg: "bg-sun", textColor: "text-ink", accent: "bg-sun text-ink",
    nodeAvail: "bg-sun text-ink border-4 border-ink",
    nodeDone: "bg-ink text-bone border-4 border-ink",
    nodeReview: "bg-hot text-bone border-4 border-hot",
    emoji: "🎛", title: "Producer",
    tagline: "First Contact · Sound & MIDI · Mix · Performance · Advanced",
    catMain: "/cats/cat-dj-hero.png",
    catDeco1: "/cats/cat-raver.png",
    catDeco2: "/cats/cat-source.png",
    deco1: "/cats/boombox.png",
    deco2: "/cats/vinyl-music.png",
    glowColor: "rgba(255,184,0,0.45)",
    heroBorder: "border-b-4 border-ink",
    pillDone: "bg-ink text-bone",
    pillPartial: "bg-ink/30 text-ink",
    pillEmpty: "bg-ink/10 text-ink/40",
    chapterBannerBg: "bg-sun/25",
    chapterBannerBorder: "border-t-4 border-t-sun",
    modeBg: "bg-ink text-bone",
    modeText: "text-bone",
    freeModeLinkClass: "bg-ink/10 text-ink hover:bg-ink/20",
  },
};

const CHAPTER_EMOJIS: Record<string, string> = {
  "sound-science": "🔊", "rhythm-and-time": "🥁", "melody-and-pitch": "🎵",
  "harmony-and-chords": "🎹", "music-technology": "💻",
  "setup-and-culture": "🎧", "the-library": "📚", "the-mix-dj": "🎛",
  "dj-performance": "🎤", "dj-mastery": "🏆",
  "first-contact": "🖥", "sound-and-midi": "🎼", "the-mix-producer": "🎚",
  "performance-and-flow": "🚀", "advanced-producer": "⚡", "synthesis": "🌀",
};

const CHAPTER_CAT_QUIPS: Record<string, string[]> = {
  fundamentals: ["Let's start with sound! 🎵", "Rhythm is everything.", "Melody unlocked 🎶", "Chords = emotion.", "Final stretch!"],
  dj: ["DJ school is in! 🎧", "Your library is power.", "Time to mix! 🎚", "Read the crowd.", "Master level! 🏆"],
  producer: ["Welcome to Live! 🖥", "Sound design time!", "Mix it down 🎛", "Take it live! 🚀", "Expert territory!", "Synths unlocked 🌀"],
};

function getMissions(world: WorldId): Mission[] {
  if (world === "fundamentals") return FOUNDATIONS_MISSIONS;
  if (world === "dj") return DJ_WORLD_MISSIONS;
  return MISSIONS;
}

const SIDE_PATTERN: ("left" | "center" | "right")[] = ["left", "center", "right", "center"];

// ─── Animated cat intro ───────────────────────────────────────────────────────
function AnimatedCatIntro({ meta, world, firstSlug }: {
  meta: typeof WORLD_META[string]; world: WorldId; firstSlug: string;
}) {
  const [visible, setVisible] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setBubbleVisible(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const WELCOME: Record<WorldId, { headline: string; body: string }> = {
    fundamentals: { headline: "Hi! I'm DJ Pawsworth 🐱", body: "Start with the basics of sound. Each lesson takes ~5 min. Tap START and follow along!" },
    dj: { headline: "Ready to DJ? 🎧", body: "I'll guide you through mixing step by step. First: what DJing actually is." },
    producer: { headline: "Welcome to the studio 🎛", body: "We'll tour Ableton Live together. One lesson at a time — you'll be making tracks before long!" },
  };
  const w = WELCOME[world];

  return (
    <div className="flex justify-center mb-12">
      <div className={`transition-all duration-500 ease-out w-full max-w-[340px] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className={`brutal-border brutal-shadow p-6 ${
          world === "dj" ? "bg-[#0a1a3e] text-bone border-t-4 border-t-volt"
          : world === "fundamentals" ? "bg-acid text-ink"
          : "bg-sun text-ink"
        }`}>
          <div className="flex items-start gap-4 mb-4">
            <div style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.4))" }} className="shrink-0 animate-bounce-bob">
              <Image src={meta.catMain} alt="DJ Pawsworth" width={68} height={68} className="object-contain" />
            </div>
            <div className={`transition-all duration-[400ms] ease-out ${bubbleVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}>
              <div className="font-display text-xl leading-tight">{w.headline}</div>
              <div className="font-mono text-[10px] uppercase opacity-60 mt-0.5">Your guide for this world</div>
            </div>
          </div>
          <p className={`font-mono text-xs leading-relaxed mb-5 transition-all duration-500 delay-100 ${bubbleVisible ? "opacity-80 translate-y-0" : "opacity-0 translate-y-2"}`}>
            {w.body}
          </p>
          <Link href={`/learn/${firstSlug}`} className={`block w-full text-center font-display text-base py-4 brutal-border brutal-press transition-colors ${
            world === "dj" ? "bg-volt text-ink hover:bg-acid" : "bg-ink text-bone hover:bg-electric-blue"
          }`}>
            START FIRST LESSON →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Chapter progress strip — expanded pills ──────────────────────────────────
function ChapterStrip({ chapters, nodes, world, meta, worldSlug }: {
  chapters: Chapter[]; nodes: PathNode[]; world: WorldId;
  meta: typeof WORLD_META[string]; worldSlug: string;
}) {
  return (
    <div className={`border-b-4 border-ink ${world === "dj" ? "bg-[#0a0f2e]" : "bg-bone"}`}>
      {/* Section label */}
      <div className={`px-4 pt-3 pb-2 font-mono text-[9px] uppercase ${world === "dj" ? "text-bone/40" : "text-ink/40"}`}>
        // CHAPTERS
      </div>
      <div className="px-4 pb-4 flex flex-col gap-2">
        {chapters.map((ch) => {
          const chNodes = nodes.filter(n => n.chapterSlug === ch.slug);
          const done = chNodes.filter(n => n.state === "complete" || n.state === "review").length;
          const total = chNodes.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const complete = pct === 100;
          const started = done > 0;
          const emoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";

          const stateClass = complete
            ? meta.pillDone
            : started
            ? meta.pillPartial
            : meta.pillEmpty;

          return (
            <div
              key={ch.slug}
              className={`brutal-border flex items-center gap-3 px-3 py-2.5 transition-all ${stateClass}`}
            >
              {/* Number + emoji */}
              <div className="shrink-0 flex items-center gap-2 w-12">
                <span className="font-mono text-[9px] opacity-50">{String(ch.number).padStart(2, "0")}</span>
                <span className="text-base leading-none">{complete ? "✓" : emoji}</span>
              </div>

              {/* Title + tagline */}
              <div className="flex-1 min-w-0">
                <div className="font-display text-sm leading-tight">{ch.title}</div>
                <div className="font-mono text-[9px] opacity-55 mt-0.5 truncate">{ch.tagline}</div>
              </div>

              {/* Progress */}
              <div className="shrink-0 text-right min-w-[48px]">
                {complete ? (
                  <span className="font-mono text-[9px] uppercase opacity-70">done</span>
                ) : started ? (
                  <span className="font-display text-base tabular-nums">{pct}%</span>
                ) : (
                  <span className="font-mono text-[9px] opacity-40">{total}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline mode indicator — NOT a toggle, just shows current state */}
      <div className={`border-t-4 border-ink px-4 py-3 flex items-center justify-between gap-3 ${world === "dj" ? "bg-[#060b1e]" : "bg-bone/50"}`}>
        <div className="flex items-center gap-2">
          <span className="text-base">🌊</span>
          <div>
            <div className={`font-display text-sm leading-none ${world === "dj" ? "text-bone" : "text-ink"}`}>
              Flow Mode
            </div>
            <div className={`font-mono text-[9px] uppercase mt-0.5 ${world === "dj" ? "text-bone/50" : "text-ink/50"}`}>
              Sequential · hearts on · XP gated
            </div>
          </div>
        </div>
        <Link
          href={`/world/${worldSlug}?view=free`}
          className={`brutal-border px-3 py-1.5 font-display text-xs brutal-press transition-colors ${meta.freeModeLinkClass}`}
        >
          Switch to Free →
        </Link>
      </div>
    </div>
  );
}

// ─── Solid color hero — NO images ─────────────────────────────────────────────
function WorldHero({ world, meta, done, total, pct, rank, progress: prog }: {
  world: WorldId;
  meta: typeof WORLD_META[string];
  done: number; total: number; pct: number;
  rank: string;
  progress: { streakDays: number; xp: number; gems: number };
}) {
  return (
    <div className={`${meta.heroBg} ${meta.textColor} ${meta.heroBorder} relative overflow-hidden`}>

      {/* Decorative floating elements */}
      <div className="absolute top-4 right-48 w-12 h-12 opacity-20 float pointer-events-none" aria-hidden style={{ animationDelay: "0.5s" }}>
        <Image src={meta.deco1} alt="" fill className="object-contain" />
      </div>
      <div className="absolute bottom-8 right-16 w-16 h-16 opacity-15 spin-slow pointer-events-none" aria-hidden>
        <Image src={meta.deco2} alt="" fill className="object-contain" />
      </div>
      <div className="absolute top-12 right-4 w-10 h-10 opacity-10 float pointer-events-none" aria-hidden style={{ animationDelay: "1.8s" }}>
        <Image src={meta.deco1} alt="" fill className="object-contain" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-8 md:pt-8 md:pb-10">
        {/* Back link */}
        <Link href="/worlds" className={`font-mono text-[10px] uppercase opacity-60 hover:opacity-100 block mb-5 transition-opacity ${meta.textColor}`}>
          ← ALL WORLDS
        </Link>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-6xl md:text-7xl leading-none">{meta.emoji}</span>
              <div>
                <h1 className="font-display text-4xl md:text-6xl leading-none">
                  {meta.title.toUpperCase()}
                </h1>
                <p className={`font-mono text-xs uppercase mt-1 opacity-70`}>{meta.tagline}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className={`h-3 brutal-border overflow-hidden mb-2 max-w-md ${world === "dj" ? "bg-bone/10" : "bg-ink/15"}`}>
              <div
                className={`h-full transition-all duration-700 ${world === "dj" ? "bg-volt" : "bg-ink"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className={`flex items-center gap-4 font-mono text-[10px] uppercase opacity-70 mb-5`}>
              <span>{done}/{total} lessons</span>
              <span>{pct}%</span>
              <span>{rank}</span>
            </div>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: `🔥 ${prog.streakDays}d streak` },
                { label: `${prog.xp} XP` },
                { label: `💎 ${prog.gems}` },
              ].map(({ label }) => (
                <div
                  key={label}
                  className={`brutal-border px-3 py-1 font-mono text-[10px] uppercase ${world === "dj" ? "bg-bone/10 text-bone" : "bg-ink/10 text-ink"}`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Main cat — large, prominent */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div
              className="w-24 h-24 md:w-32 md:h-32 wiggle"
              style={{ filter: "drop-shadow(4px 4px 0 rgba(0,0,0,0.25))" }}
              aria-hidden
            >
              <Image src={meta.catMain} alt="" width={128} height={128} className="w-full h-full object-contain" />
            </div>
            {/* Deco cats below */}
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 opacity-70 float" style={{ animationDelay: "0.4s" }} aria-hidden>
                <Image src={meta.catDeco1} alt="" width={32} height={32} className="w-full h-full object-contain" style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.2))" }} />
              </div>
              <div className="w-7 h-7 opacity-60 float" style={{ animationDelay: "1.2s" }} aria-hidden>
                <Image src={meta.catDeco2} alt="" width={28} height={28} className="w-full h-full object-contain" style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.2))" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function WorldPathClient({ worldSlug }: { worldSlug: string }) {
  const world = worldSlug as WorldId;
  const meta = WORLD_META[world];
  const { progress } = useProgress();
  const { learnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const strengths = progress.lessonStrengths;
  const unlockedChapter = progress.unlockedChapter ?? 1;

  const chapters = chaptersByWorld(world);
  const paths = pathsByWorld(world);
  const missions = getMissions(world);

  // Build flat node list
  const nodes: PathNode[] = [];
  let prevComplete = true;

  chapters.forEach((ch, chIdx) => {
    const chapterNumber = chIdx + 1;
    const placedPast = chapterNumber < unlockedChapter;
    const chPaths = paths.filter(p => p.chapter === ch.slug).sort((a, b) => a.number - b.number);

    chPaths.forEach((path, pIdx) => {
      path.missionSlugs.forEach((slug, mIdx) => {
        const isDone = !!completed[slug];
        const ls = strengths[slug];
        const needsReview = isDone && ls && getLessonStrength(ls) < REVIEW_THRESHOLD;
        const effectivelyDone = isDone || placedPast;

        let state: NodeState = "locked";
        if (isDone) state = needsReview ? "review" : "complete";
        else if (placedPast) state = "available";
        else if (prevComplete) state = "available";

        nodes.push({
          slug,
          xp: missions.find(m => m.slug === slug)?.xp ?? 40,
          title: missions.find(m => m.slug === slug)?.title ?? slug,
          chapterSlug: ch.slug, chapterIndex: chIdx, state,
          isFirstInChapter: pIdx === 0 && mIdx === 0,
          side: SIDE_PATTERN[nodes.length % 4],
        });

        prevComplete = effectivelyDone;
      });
    });
  });

  const total = nodes.length;
  const done = nodes.filter(n => n.state === "complete" || n.state === "review").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const { current: rank } = rankFor(progress.xp);
  const isNewUser = done === 0;

  const youAreHereRef = useRef<HTMLDivElement>(null);
  const firstAvailableIdx = nodes.findIndex(n => n.state === "available");

  useEffect(() => {
    if (!isNewUser && youAreHereRef.current) {
      setTimeout(() => {
        youAreHereRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, [isNewUser]);

  if (!meta) return <div className="p-8 font-mono">World not found: {worldSlug}</div>;

  const firstAvailableSlug = nodes.find(n => n.state === "available")?.slug;

  return (
    <div className={`min-h-screen ${meta.bg}`}>

      {/* ── Solid color hero — no image ────────────────────────────────── */}
      <WorldHero
        world={world}
        meta={meta}
        done={done}
        total={total}
        pct={pct}
        rank={rank.name}
        progress={{ streakDays: progress.streakDays, xp: progress.xp, gems: progress.gems }}
      />

      {/* ── Chapter progress strip — expanded pills ─────────────────────── */}
      <ChapterStrip
        chapters={chapters}
        nodes={nodes}
        world={world}
        meta={meta}
        worldSlug={worldSlug}
      />

      {/* ── Snake path ──────────────────────────────────────────────────── */}
      <div className="max-w-sm mx-auto px-4 pt-10 pb-32">

        {/* First-visit animated cat */}
        {isNewUser && firstAvailableSlug && (
          <AnimatedCatIntro meta={meta} world={world} firstSlug={firstAvailableSlug} />
        )}

        {nodes.map((node, idx) => {
          const isChapterStart = node.isFirstInChapter;
          const chEmoji = CHAPTER_EMOJIS[node.chapterSlug] ?? "📖";
          const chapter = chapters.find(c => c.slug === node.chapterSlug);
          const chQuip = (CHAPTER_CAT_QUIPS[world] ?? [])[node.chapterIndex] ?? "Let's go!";
          const chNum = String(node.chapterIndex + 1).padStart(2, "0");

          return (
            <div key={node.slug}>
              {/* Chapter banner */}
              {isChapterStart && (
                <div className="flex justify-center my-10">
                  <div className={`brutal-border text-center max-w-[300px] w-full brutal-shadow overflow-hidden ${meta.chapterBannerBg} ${meta.chapterBannerBorder} ${meta.textColor}`}>
                    <div className="px-5 pt-4 pb-3">
                      <div className="font-mono text-[10px] uppercase opacity-60 mb-1">CH {chNum}</div>
                      <div className="text-5xl mb-2">{chEmoji}</div>
                      <div className="font-display text-xl leading-tight">{chapter?.title ?? node.chapterSlug}</div>
                      <div className="font-mono text-[10px] opacity-60 mt-1 leading-snug uppercase">{chapter?.tagline ?? ""}</div>
                    </div>
                    <div className={`px-4 py-2.5 border-t-2 border-current/20 flex items-center justify-center gap-2 font-mono text-[10px] italic ${
                      world === "dj" ? "bg-volt/10 text-bone" : "bg-ink/5 text-ink"
                    }`}>
                      <span className="shrink-0">🐱</span>
                      <span className="opacity-75">&ldquo;{chQuip}&rdquo;</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Node */}
              <div className={`relative flex mb-12 ${
                node.side === "left"   ? "justify-start pl-8" :
                node.side === "right"  ? "justify-end pr-8"   :
                "justify-center"
              }`}>
                {idx === firstAvailableIdx ? (
                  <div className="flex flex-col items-center gap-1.5">
                    {!isNewUser && (
                      <div className={`brutal-border px-3 py-1 font-display text-[10px] uppercase mb-2 animate-pulse ${
                        world === "dj" ? "bg-volt text-ink" : "bg-acid text-ink"
                      }`}>
                        🐾 YOU ARE HERE
                      </div>
                    )}
                    <div ref={youAreHereRef}>
                      <LessonNode node={node} meta={meta} />
                    </div>
                  </div>
                ) : (
                  <LessonNode node={node} meta={meta} />
                )}
              </div>
            </div>
          );
        })}

        {/* World complete */}
        {pct === 100 && (
          <div className={`brutal-border p-8 text-center brutal-shadow mt-8 ${
            world === "dj" ? "bg-volt text-ink" : "bg-acid text-ink"
          }`}>
            <div className="flex justify-center mb-4">
              <Image src={meta.catMain} alt="" width={100} height={100}
                className="drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)] animate-bounce-bob" />
            </div>
            <div className="flex justify-center gap-3 mb-3">
              <div className="w-10 h-10 float" aria-hidden style={{ animationDelay: "0.2s" }}>
                <Image src={meta.catDeco1} alt="" width={40} height={40} className="w-full h-full object-contain" />
              </div>
              <span className="text-5xl">🏆</span>
              <div className="w-10 h-10 float" aria-hidden style={{ animationDelay: "0.8s" }}>
                <Image src={meta.catDeco2} alt="" width={40} height={40} className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="font-display text-4xl">WORLD COMPLETE!</div>
            <div className="font-mono text-sm opacity-70 mt-2">You finished {meta.title}. Incredible.</div>
            <Link href="/worlds" className="mt-5 brutal-border bg-ink text-bone px-7 py-3.5 font-display text-base inline-block brutal-press hover:bg-electric-blue transition-colors">
              EXPLORE OTHER WORLDS →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lesson Node ───────────────────────────────────────────────────────────────
function LessonNode({ node, meta }: { node: PathNode; meta: typeof WORLD_META[string] }) {
  const Wrap = ({ children, href, className, title }: {
    children: ReactNode; href?: string; className?: string; title?: string;
  }) => {
    const inner = <div className="flex flex-col items-center gap-2 group" title={title}>{children}</div>;
    if (href) return <a href={href} className={`block brutal-press ${className ?? ""}`}>{inner}</a>;
    return <div className={className}>{inner}</div>;
  };

  const Label = ({ text, dim }: { text: string; dim?: boolean }) => (
    <span className={`font-mono text-[10px] uppercase leading-tight text-center max-w-[88px] line-clamp-2 ${dim ? "opacity-20" : "opacity-60"}`}>
      {text}
    </span>
  );

  if (node.state === "locked") {
    return (
      <Wrap title={node.title} className="cursor-not-allowed">
        <div className="w-14 h-14 rounded-full border-2 border-current/15 bg-current/5 flex items-center justify-center opacity-25">
          <span className="text-lg">🔒</span>
        </div>
        <Label text={node.title} dim />
      </Wrap>
    );
  }

  if (node.state === "complete") {
    return (
      <Wrap href={`/learn/${node.slug}`} title={`${node.title} — completed`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${meta.nodeDone} transition-transform group-hover:scale-110`}>
          <span className="text-2xl font-bold">✓</span>
        </div>
        <Label text={node.title} />
      </Wrap>
    );
  }

  if (node.state === "review") {
    return (
      <Wrap href={`/learn/${node.slug}?review=1`} title={`${node.title} — needs review`}>
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${meta.nodeReview} transition-transform group-hover:scale-110`}
          style={{ animation: "pulse 2s ease-in-out infinite" }}
        >
          <span className="text-2xl">🔥</span>
        </div>
        <Label text="Review" />
      </Wrap>
    );
  }

  // Available
  return (
    <Wrap href={`/learn/${node.slug}`} title={node.title}>
      <div
        className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1.5 ${meta.nodeAvail} transition-all group-hover:scale-110`}
        style={{ boxShadow: `0 0 0 8px ${meta.glowColor}, 0 0 32px ${meta.glowColor}` }}
      >
        <span className="font-display text-sm font-bold leading-tight text-center px-3 line-clamp-2">
          {node.title}
        </span>
        <span className="font-mono text-[9px] opacity-90 font-bold">+{node.xp} XP</span>
      </div>
      <Label text={node.title} />
    </Wrap>
  );
}
