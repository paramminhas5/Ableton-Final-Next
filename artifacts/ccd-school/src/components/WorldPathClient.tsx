"use client";
/**
 * WorldPathClient — Duolingo-style world path map.
 *
 * ✓ Inline Flow/Browse toggle in the header
 * ✓ Animated cat intro that slides up on first visit
 * ✓ Bigger nodes (available: w-24 h-24, complete: w-16 h-16)
 * ✓ Thicker spine, more breathing room between nodes
 * ✓ Chapter banners with cat speech bubbles
 * ✓ YOU ARE HERE paw marker
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

// ─── World config ─────────────────────────────────────────────────────────────
const WORLD_META: Record<string, {
  bg: string; accent: string; nodeAvail: string; nodeDone: string;
  nodeReview: string; emoji: string; title: string; tagline: string;
  catSrc: string; glowColor: string; toggleActive: string; toggleInactive: string;
}> = {
  fundamentals: {
    bg: "bg-bone",
    accent: "bg-acid text-ink",
    nodeAvail: "bg-acid text-ink border-4 border-ink",
    nodeDone: "bg-ink text-bone border-4 border-ink",
    nodeReview: "bg-hot text-bone border-4 border-hot",
    emoji: "🎵", title: "Fundamentals",
    tagline: "Sound · Rhythm · Melody · Harmony · Music Tech",
    catSrc: "/cats/cat-handstand.png",
    glowColor: "rgba(198,255,0,0.35)",
    toggleActive: "bg-ink text-bone",
    toggleInactive: "bg-bone/30 text-ink hover:bg-bone/50",
  },
  dj: {
    bg: "bg-ink",
    accent: "bg-volt text-ink",
    nodeAvail: "bg-volt text-ink border-4 border-volt",
    nodeDone: "bg-bone/20 text-bone border-4 border-bone/40",
    nodeReview: "bg-hot text-bone border-4 border-hot",
    emoji: "🎧", title: "DJ World",
    tagline: "Setup · Library · The Mix · Performance · Mastery",
    catSrc: "/cats/cat-dj.png",
    glowColor: "rgba(198,255,0,0.35)",
    toggleActive: "bg-ink text-bone",
    toggleInactive: "bg-bone/10 text-bone hover:bg-bone/20",
  },
  producer: {
    bg: "bg-bone",
    accent: "bg-sun text-ink",
    nodeAvail: "bg-sun text-ink border-4 border-ink",
    nodeDone: "bg-ink text-bone border-4 border-ink",
    nodeReview: "bg-hot text-bone border-4 border-hot",
    emoji: "🎛", title: "Producer",
    tagline: "First Contact · Sound & MIDI · Mix · Performance · Advanced",
    catSrc: "/cats/cat-dj-hero.png",
    glowColor: "rgba(255,184,0,0.35)",
    toggleActive: "bg-ink text-bone",
    toggleInactive: "bg-bone/30 text-ink hover:bg-bone/50",
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
  producer: ["Welcome to Live! 🖥", "Sound design time!", "Mix it down 🎛", "Take it live! 🚀", "Expert territory!"],
};

function getMissions(world: WorldId): Mission[] {
  if (world === "fundamentals") return FOUNDATIONS_MISSIONS;
  if (world === "dj") return DJ_WORLD_MISSIONS;
  return MISSIONS;
}

const SIDE_PATTERN: ("left" | "center" | "right")[] = ["left", "center", "right", "center"];

// ─── Animated cat intro card (slides up on mount) ─────────────────────────────
function AnimatedCatIntro({
  meta, world, firstSlug,
}: {
  meta: typeof WORLD_META[string];
  world: WorldId;
  firstSlug: string;
}) {
  const [visible, setVisible] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setBubbleVisible(true), 350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const WELCOME: Record<WorldId, { headline: string; body: string }> = {
    fundamentals: {
      headline: "Hi! I'm DJ Pawsworth 🐱",
      body: "Start with the basics of sound. Each lesson takes ~5 min. Tap START and follow along!",
    },
    dj: {
      headline: "Ready to DJ? 🎧",
      body: "I'll guide you through mixing step by step. First lesson: what DJing actually is.",
    },
    producer: {
      headline: "Welcome to the studio 🎛",
      body: "We'll tour Ableton Live together. One lesson at a time — before long you'll be making tracks!",
    },
  };
  const w = WELCOME[world];

  return (
    <div className="relative z-10 flex justify-center mb-10">
      {/* Outer slide-up wrapper */}
      <div
        className={`transition-all duration-500 ease-out w-full max-w-[320px] ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className={`brutal-border brutal-shadow p-5 ${
          world === "dj"
            ? "bg-ink text-bone border-t-4 border-t-volt"
            : world === "fundamentals"
            ? "bg-acid text-ink"
            : "bg-sun text-ink"
        }`}>
          {/* Cat + headline row */}
          <div className="flex items-start gap-3 mb-3">
            <div
              style={{ filter: "drop-shadow(3px 3px 0 hsl(222 47% 4%))" }}
              className="shrink-0 animate-bounce-bob"
            >
              <Image src={meta.catSrc} alt="DJ Pawsworth" width={60} height={60} className="object-contain" />
            </div>
            <div
              className={`transition-all duration-400 ease-out ${
                bubbleVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
              }`}
            >
              <div className="font-display text-xl leading-tight">{w.headline}</div>
              <div className="font-mono text-[9px] uppercase opacity-60 mt-0.5">Your guide for this world</div>
            </div>
          </div>

          {/* Body text */}
          <p
            className={`font-mono text-xs leading-relaxed opacity-80 mb-4 transition-all duration-500 ease-out delay-100 ${
              bubbleVisible ? "opacity-80 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {w.body}
          </p>

          {/* CTA */}
          <Link
            href={`/learn/${firstSlug}`}
            className={`block w-full text-center font-display text-base py-3.5 brutal-border brutal-press transition-colors ${
              world === "dj"
                ? "bg-volt text-ink hover:bg-acid"
                : "bg-ink text-bone hover:bg-electric-blue"
            }`}
          >
            START FIRST LESSON →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Chapter progress dots ─────────────────────────────────────────────────────
function ChapterDots({
  chapters, nodes, world,
}: {
  chapters: Chapter[];
  nodes: PathNode[];
  world: WorldId;
}) {
  return (
    <div className="flex items-center justify-center gap-1 px-4 py-2.5 flex-wrap">
      {chapters.map((ch, i) => {
        const chNodes = nodes.filter(n => n.chapterSlug === ch.slug);
        const done = chNodes.filter(n => n.state === "complete" || n.state === "review").length;
        const total = chNodes.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const complete = pct === 100;
        const started = done > 0;
        const emoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";

        return (
          <div key={ch.slug} className="flex items-center gap-0.5">
            <div
              title={`${ch.title} — ${pct}%`}
              className={`flex items-center gap-1 px-2 py-1 brutal-border font-mono text-[9px] uppercase transition-all cursor-default ${
                complete
                  ? world === "dj" ? "bg-volt text-ink" : "bg-ink text-bone"
                  : started
                  ? world === "dj" ? "bg-volt/30 text-bone" : "bg-acid/60 text-ink"
                  : world === "dj" ? "bg-bone/10 text-bone/40" : "bg-ink/10 text-ink/30"
              }`}
            >
              <span className="text-sm leading-none">{complete ? "✓" : emoji}</span>
              <span className="hidden sm:inline opacity-70">{i + 1}</span>
            </div>
            {i < chapters.length - 1 && (
              <div className={`w-3 h-px ${world === "dj" ? "bg-bone/20" : "bg-ink/20"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Inline Flow / Browse toggle ──────────────────────────────────────────────
function ModeToggle({ worldSlug, meta }: { worldSlug: string; meta: typeof WORLD_META[string] }) {
  return (
    <div className="flex items-center brutal-border overflow-hidden">
      {/* Flow Mode — active (no ?view param) */}
      <div className={`px-3 py-1.5 flex items-center gap-1.5 font-display text-xs ${meta.toggleActive}`}>
        <span>🌊</span>
        <span>Flow</span>
        <span className="font-mono text-[8px] opacity-60 ml-0.5">● ON</span>
      </div>
      {/* Browse — inactive link */}
      <Link
        href={`/world/${worldSlug}?view=free`}
        className={`px-3 py-1.5 flex items-center gap-1.5 font-display text-xs border-l-2 border-current/20 brutal-press transition-colors ${meta.toggleInactive}`}
      >
        <span>📋</span>
        <span>Browse</span>
      </Link>
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

  // Build flat ordered node list
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
          chapterSlug: ch.slug,
          chapterIndex: chIdx,
          state,
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

      {/* ── World header ───────────────────────────────────────────────── */}
      <div className={`${meta.accent} px-4 pt-5 pb-6 md:pt-7 md:pb-8 border-b-4 border-ink`}>
        <div className="max-w-lg mx-auto">
          {/* Back link */}
          <Link href="/worlds" className="font-mono text-[10px] uppercase opacity-60 hover:opacity-100 block mb-4">
            ← ALL WORLDS
          </Link>

          {/* Title row with cat */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-5xl leading-none shrink-0">{meta.emoji}</span>
              <div className="min-w-0">
                <h1 className="font-display text-4xl md:text-5xl leading-none">{meta.title}</h1>
                <p className="font-mono text-[10px] uppercase opacity-70 mt-0.5 truncate">{meta.tagline}</p>
              </div>
            </div>
            <div
              className="shrink-0 w-16 h-16 md:w-20 md:h-20 wiggle"
              style={{ filter: "drop-shadow(3px 3px 0 hsl(222 47% 4%))" }}
              aria-hidden
            >
              <Image src={meta.catSrc} alt="" width={80} height={80} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 brutal-border bg-bone/30 overflow-hidden mb-1.5">
            <div
              className="h-full bg-ink/70 transition-all duration-700"
              style={{ width: `${pct}%`, boxShadow: `0 0 10px ${meta.glowColor}` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[9px] uppercase opacity-70 mb-4">
            <span>{done}/{total} lessons · {rank.name}</span>
            <span>{pct}%</span>
          </div>

          {/* Stats + mode toggle row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2">
              <div className="brutal-border bg-ink/20 px-2.5 py-1 font-mono text-[10px] uppercase">
                🔥 {progress.streakDays}d
              </div>
              <div className="brutal-border bg-ink/20 px-2.5 py-1 font-mono text-[10px] uppercase">
                💎 {progress.gems}
              </div>
              <div className="brutal-border bg-ink/20 px-2.5 py-1 font-mono text-[10px] uppercase">
                {progress.xp} XP
              </div>
            </div>
            {/* Inline Flow/Browse toggle */}
            <ModeToggle worldSlug={worldSlug} meta={meta} />
          </div>
        </div>
      </div>

      {/* ── Chapter dots ───────────────────────────────────────────────── */}
      <div className={`border-b-4 border-ink ${world === "dj" ? "bg-ink/60" : "bg-bone/90"}`}>
        <div className="max-w-lg mx-auto">
          <ChapterDots chapters={chapters} nodes={nodes} world={world} />
        </div>
      </div>

      {/* ── Snake path ─────────────────────────────────────────────────── */}
      <div className="relative max-w-sm mx-auto px-4 pt-10 pb-32">
        {/* Spine — thicker & more visible */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-ink/15 -translate-x-px pointer-events-none" />

        {/* First-visit animated cat intro */}
        {isNewUser && firstAvailableSlug && (
          <AnimatedCatIntro meta={meta} world={world} firstSlug={firstAvailableSlug} />
        )}

        {nodes.map((node, idx) => {
          const isChapterStart = node.isFirstInChapter;
          const chEmoji = CHAPTER_EMOJIS[node.chapterSlug] ?? "📖";
          const chapter = chapters.find(c => c.slug === node.chapterSlug);
          const chQuip = (CHAPTER_CAT_QUIPS[world] ?? [])[node.chapterIndex] ?? "Let's go!";

          return (
            <div key={node.slug}>
              {/* Chapter banner */}
              {isChapterStart && (
                <div className="relative z-10 flex justify-center my-10">
                  <div className={`brutal-border px-5 py-5 text-center max-w-[290px] w-full brutal-shadow ${
                    world === "dj"
                      ? "bg-ink text-bone border-t-4 border-t-volt"
                      : world === "fundamentals"
                      ? "bg-acid/25 text-ink border-t-4 border-t-acid"
                      : "bg-sun/25 text-ink border-t-4 border-t-sun"
                  }`}>
                    <div className="text-5xl mb-2">{chEmoji}</div>
                    <div className="font-display text-lg leading-tight">{chapter?.title ?? node.chapterSlug}</div>
                    <div className="font-mono text-[9px] opacity-50 mt-0.5 uppercase leading-snug">{chapter?.tagline ?? ""}</div>
                    <div className={`mt-3 flex items-center justify-center gap-2 font-mono text-[9px] italic px-2 py-1.5 brutal-border ${
                      world === "dj" ? "bg-bone/10 text-bone" : "bg-ink/10 text-ink"
                    }`}>
                      <span className="shrink-0">🐱</span>
                      <span className="opacity-70">&ldquo;{chQuip}&rdquo;</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Node */}
              <div className={`relative z-10 flex mb-10 ${
                node.side === "left" ? "justify-start pl-2" :
                node.side === "right" ? "justify-end pr-2" :
                "justify-center"
              }`}>
                {idx === firstAvailableIdx ? (
                  <div className="flex flex-col items-center gap-1">
                    {!isNewUser && (
                      <div className={`brutal-border px-2.5 py-1 font-mono text-[8px] uppercase mb-1.5 animate-pulse font-bold ${
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
          <div className="relative z-10 mt-8 brutal-border bg-acid text-ink p-7 text-center brutal-shadow">
            <div className="flex justify-center mb-3">
              <Image
                src={meta.catSrc} alt="Cat celebrating"
                width={90} height={90}
                className="drop-shadow-[3px_3px_0_hsl(222_47%_4%)] animate-bounce-bob"
              />
            </div>
            <div className="text-5xl mb-2">🏆</div>
            <div className="font-display text-4xl">WORLD COMPLETE!</div>
            <div className="font-mono text-sm opacity-70 mt-1">You finished {meta.title}</div>
            <Link href="/worlds" className="mt-5 brutal-border bg-ink text-bone px-6 py-3 font-display text-base inline-block brutal-press hover:bg-electric-blue transition-colors">
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
    const inner = (
      <div className="flex flex-col items-center gap-2 group" title={title}>
        {children}
      </div>
    );
    if (href) {
      return (
        <a href={href} className={`block brutal-press ${className ?? ""}`}>{inner}</a>
      );
    }
    return <div className={className}>{inner}</div>;
  };

  const Label = ({ text, dim }: { text: string; dim?: boolean }) => (
    <span className={`font-mono text-[10px] uppercase leading-tight text-center max-w-[96px] line-clamp-2 ${
      dim ? "opacity-25" : "opacity-65"
    }`}>
      {text}
    </span>
  );

  // ── LOCKED ──
  if (node.state === "locked") {
    return (
      <Wrap title={node.title} className="cursor-not-allowed">
        <div className="w-14 h-14 rounded-full border-2 border-ink/20 bg-ink/5 flex items-center justify-center opacity-30">
          <span className="text-lg">🔒</span>
        </div>
        <Label text={node.title} dim />
      </Wrap>
    );
  }

  // ── COMPLETE ──
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

  // ── REVIEW ──
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

  // ── AVAILABLE — glowing, big, pulsing ──
  return (
    <Wrap href={`/learn/${node.slug}`} title={node.title}>
      <div
        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 ${meta.nodeAvail} transition-all group-hover:scale-110`}
        style={{
          boxShadow: `0 0 0 6px ${meta.glowColor}, 0 0 28px ${meta.glowColor}, 0 0 50px ${meta.glowColor}`,
        }}
      >
        <span className="font-display text-sm font-bold leading-tight text-center px-2 line-clamp-2">
          {node.title}
        </span>
        <span className="font-mono text-[9px] opacity-80 font-bold">+{node.xp} XP</span>
      </div>
      <Label text={node.title} />
    </Wrap>
  );
}
