"use client";
/**
 * WorldPathClient — Duolingo-style world path map.
 *
 * Flow Mode default view at /world/[slug].
 * Shows a vertical winding trail of lesson nodes per world.
 * Chapter banners + cat mascot break up sections.
 * "YOU ARE HERE" paw-marker auto-scrolls on mount.
 * First-visit welcome card from DJ Pawsworth.
 * Single "Browse Lessons" pill to escape to Free mode.
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
  emoji: string; title: string; tagline: string; catSrc: string;
  glowColor: string;
}> = {
  fundamentals: {
    bg: "bg-bone", accent: "bg-acid text-ink", nodeAvail: "bg-acid text-ink",
    nodeDone: "bg-ink text-bone", emoji: "🎵", title: "Fundamentals",
    tagline: "Sound · Rhythm · Melody · Harmony · Music Tech",
    catSrc: "/cats/cat-handstand.png",
    glowColor: "rgba(198,255,0,0.3)",
  },
  dj: {
    bg: "bg-ink", accent: "bg-volt text-ink", nodeAvail: "bg-volt text-ink",
    nodeDone: "bg-volt/30 text-bone", emoji: "🎧", title: "DJ World",
    tagline: "Setup · Library · The Mix · Performance · Mastery",
    catSrc: "/cats/cat-dj.png",
    glowColor: "rgba(198,255,0,0.3)",
  },
  producer: {
    bg: "bg-bone", accent: "bg-sun text-ink", nodeAvail: "bg-sun text-ink",
    nodeDone: "bg-ink text-bone", emoji: "🎛", title: "Producer",
    tagline: "First Contact · Sound & MIDI · Mix · Performance · Advanced",
    catSrc: "/cats/cat-dj-hero.png",
    glowColor: "rgba(255,184,0,0.3)",
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

// Cat commentary per world for chapter banners
const CHAPTER_CAT_QUIPS: Record<string, string[]> = {
  fundamentals: ["Let's learn this! 🎵", "Building your foundation!", "Theory time 🧠", "Almost there!", "Final chapter!"],
  dj: ["DJ school is in! 🎧", "Your library is your weapon.", "Time to mix! 🎚", "Read the crowd.", "Master level unlocked! 🏆"],
  producer: ["Welcome to Live! 🖥", "Sound design time!", "Mix it down 🎛", "Take it live! 🚀", "Expert territory!"],
};

function getMissions(world: WorldId): Mission[] {
  if (world === "fundamentals") return FOUNDATIONS_MISSIONS;
  if (world === "dj") return DJ_WORLD_MISSIONS;
  return MISSIONS;
}

const SIDE_PATTERN: ("left" | "center" | "right")[] = ["left", "center", "right", "center"];

// ─── Chapter Dots — progress indicator below world header ─────────────────────
function ChapterDots({
  chapters,
  nodes,
  world,
  meta,
}: {
  chapters: Chapter[];
  nodes: PathNode[];
  world: WorldId;
  meta: typeof WORLD_META[string];
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 px-4 py-3 flex-wrap">
      {chapters.map((ch, i) => {
        const chNodes = nodes.filter(n => n.chapterSlug === ch.slug);
        const done = chNodes.filter(n => n.state === "complete" || n.state === "review").length;
        const total = chNodes.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const complete = pct === 100;
        const started = done > 0;
        const emoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";

        return (
          <div key={ch.slug} className="flex items-center gap-1">
            <div
              title={`${ch.title} — ${pct}%`}
              className={`flex items-center gap-1 px-2 py-1 brutal-border font-mono text-[9px] uppercase transition-all ${
                complete
                  ? world === "dj" ? "bg-volt text-ink" : "bg-ink text-bone"
                  : started
                  ? world === "dj" ? "bg-volt/30 text-bone" : "bg-acid/60 text-ink"
                  : world === "dj" ? "bg-bone/10 text-bone/40" : "bg-ink/10 text-ink/30"
              }`}
            >
              <span className="text-sm leading-none">{complete ? "✓" : emoji}</span>
              <span className="hidden sm:inline">{i + 1}</span>
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

// ─── Beginner welcome card ─────────────────────────────────────────────────────
function BeginnerWelcomeCard({
  meta,
  world,
  firstSlug,
}: {
  meta: typeof WORLD_META[string];
  world: WorldId;
  firstSlug: string;
}) {
  const WELCOME: Record<WorldId, { headline: string; body: string }> = {
    fundamentals: {
      headline: "Hi! I'm DJ Pawsworth 🐱",
      body: "We'll start with the basics of sound. Each lesson takes about 5 minutes. Just tap START and follow along!",
    },
    dj: {
      headline: "Ready to DJ? Let's go! 🎧",
      body: "I'll guide you through the art of mixing step by step. First lesson: what DJing actually is. 5 minutes, let's do this!",
    },
    producer: {
      headline: "Welcome to the studio 🎛",
      body: "We'll start by touring Ableton Live together. One lesson at a time — before you know it, you'll be making tracks!",
    },
  };
  const w = WELCOME[world];

  return (
    <div className={`relative z-10 flex justify-center mb-8`}>
      <div className={`brutal-border p-5 max-w-[300px] w-full brutal-shadow ${
        world === "dj" ? "bg-ink text-bone border-t-4 border-t-volt"
        : world === "fundamentals" ? "bg-acid text-ink"
        : "bg-sun text-ink"
      }`}>
        {/* Cat */}
        <div className="flex items-start gap-3 mb-4">
          <div style={{ filter: "drop-shadow(3px 3px 0 hsl(222 47% 4%))" }} className="shrink-0">
            <Image src={meta.catSrc} alt="DJ Pawsworth" width={56} height={56} className="object-contain" />
          </div>
          <div>
            <div className="font-display text-lg leading-tight">{w.headline}</div>
            <div className="font-mono text-[9px] uppercase opacity-60 mt-0.5">Your guide</div>
          </div>
        </div>
        <p className="font-mono text-xs leading-relaxed opacity-80 mb-4">{w.body}</p>
        <Link
          href={`/learn/${firstSlug}`}
          className={`block w-full text-center font-display text-base py-3 brutal-border brutal-press transition-colors ${
            world === "dj" ? "bg-volt text-ink hover:bg-acid" : "bg-ink text-bone hover:bg-electric-blue"
          }`}
        >
          START FIRST LESSON →
        </Link>
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

  // "YOU ARE HERE" auto-scroll
  const youAreHereRef = useRef<HTMLDivElement>(null);
  const firstAvailableIdx = nodes.findIndex(n => n.state === "available");

  useEffect(() => {
    if (!isNewUser && youAreHereRef.current) {
      setTimeout(() => {
        youAreHereRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, [isNewUser]);

  if (!meta) return <div className="p-8 font-mono">World not found: {worldSlug}</div>;

  const firstAvailableSlug = nodes.find(n => n.state === "available")?.slug;

  return (
    <div className={`min-h-screen ${meta.bg}`}>

      {/* ── World header ───────────────────────────────────────────────── */}
      <div className={`brutal-border border-x-0 border-t-0 ${meta.accent} px-4 py-6 md:py-8`}>
        <div className="max-w-lg mx-auto">
          <Link
            href="/worlds"
            className="font-mono text-[10px] uppercase opacity-60 hover:opacity-100 block mb-3"
          >
            ← ALL WORLDS
          </Link>

          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{meta.emoji}</span>
              <div>
                <h1 className="font-display text-4xl md:text-5xl leading-none">{meta.title}</h1>
                <p className="font-mono text-[10px] uppercase opacity-70 mt-0.5">{meta.tagline}</p>
              </div>
            </div>
            {/* Cat decoration */}
            <div
              className="shrink-0 w-16 h-16 wiggle"
              style={{ filter: "drop-shadow(3px 3px 0 hsl(222 47% 4%))" }}
              aria-hidden
            >
              <Image src={meta.catSrc} alt="" width={64} height={64} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 brutal-border bg-bone/30 overflow-hidden mb-2">
            <div
              className="h-full bg-ink/70 transition-all duration-700"
              style={{ width: `${pct}%`, boxShadow: `0 0 8px ${meta.glowColor}` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[9px] uppercase opacity-70">
            <span>{done}/{total} lessons · {rank.name}</span>
            <span>{pct}%</span>
          </div>

          {/* Browse lessons pill — single escape to free mode */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <div className="brutal-border bg-ink/20 px-3 py-1 font-mono text-[10px] uppercase">
                🔥 {progress.streakDays}d
              </div>
              <div className="brutal-border bg-ink/20 px-3 py-1 font-mono text-[10px] uppercase">
                💎 {progress.gems}
              </div>
            </div>
            <Link
              href={`/world/${worldSlug}?view=free`}
              className={`brutal-border px-3 py-1.5 font-mono text-[9px] uppercase brutal-press transition-colors ${
                world === "dj"
                  ? "bg-bone/10 text-bone hover:bg-bone/20"
                  : "bg-ink/10 text-ink hover:bg-ink/20"
              }`}
            >
              📋 Browse Lessons
            </Link>
          </div>
        </div>
      </div>

      {/* ── Chapter progress dots ──────────────────────────────────────── */}
      <div className={`brutal-border border-x-0 border-b-0 ${world === "dj" ? "bg-ink/50" : "bg-bone/80"}`}>
        <div className="max-w-lg mx-auto">
          <ChapterDots chapters={chapters} nodes={nodes} world={world} meta={meta} />
        </div>
      </div>

      {/* ── The snake path ─────────────────────────────────────────────── */}
      <div className="relative max-w-sm mx-auto px-4 py-8 pb-32">
        {/* Spine line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-ink/10 -translate-x-px pointer-events-none" />

        {/* First-visit welcome card */}
        {isNewUser && firstAvailableSlug && (
          <BeginnerWelcomeCard meta={meta} world={world} firstSlug={firstAvailableSlug} />
        )}

        {nodes.map((node, idx) => {
          const isChapterStart = node.isFirstInChapter;
          const chEmoji = CHAPTER_EMOJIS[node.chapterSlug] ?? "📖";
          const chapter = chapters.find(c => c.slug === node.chapterSlug);
          const chQuip = (CHAPTER_CAT_QUIPS[world] ?? [])[node.chapterIndex] ?? "Let's go!";

          return (
            <div key={node.slug}>
              {/* Chapter banner with cat quip */}
              {isChapterStart && (
                <div className="relative z-10 flex justify-center my-8">
                  <div className={`brutal-border px-5 py-4 text-center max-w-[280px] brutal-shadow ${
                    world === "dj"
                      ? "bg-ink text-bone border-t-4 border-t-volt"
                      : world === "fundamentals"
                      ? "bg-acid/20 text-ink border-t-4 border-t-acid"
                      : "bg-sun/20 text-ink border-t-4 border-t-sun"
                  }`}>
                    <div className="text-4xl mb-1">{chEmoji}</div>
                    <div className="font-display text-base leading-tight">{chapter?.title ?? node.chapterSlug}</div>
                    <div className="font-mono text-[9px] opacity-50 mt-0.5 uppercase">{chapter?.tagline ?? ""}</div>
                    {/* Cat speech bubble */}
                    <div className={`mt-3 font-mono text-[9px] italic opacity-70 px-2 py-1 brutal-border ${
                      world === "dj" ? "bg-bone/10 text-bone" : "bg-ink/10 text-ink"
                    }`}>
                      🐱 &ldquo;{chQuip}&rdquo;
                    </div>
                  </div>
                </div>
              )}

              {/* Node */}
              <div className={`relative z-10 flex mb-6 ${
                node.side === "left" ? "justify-start pl-4" :
                node.side === "right" ? "justify-end pr-4" :
                "justify-center"
              }`}>
                {idx === firstAvailableIdx ? (
                  <div ref={youAreHereRef} className="flex flex-col items-center gap-1">
                    {/* Paw "you are here" marker */}
                    {!isNewUser && (
                      <div className={`brutal-border px-2 py-0.5 font-mono text-[8px] uppercase mb-1 animate-pulse ${
                        world === "dj" ? "bg-volt text-ink" : "bg-acid text-ink"
                      }`}>
                        🐾 YOU ARE HERE
                      </div>
                    )}
                    <LessonNode node={node} meta={meta} />
                  </div>
                ) : (
                  <LessonNode node={node} meta={meta} />
                )}
              </div>
            </div>
          );
        })}

        {/* World complete banner */}
        {pct === 100 && (
          <div className="relative z-10 mt-8 brutal-border bg-acid text-ink p-6 text-center brutal-shadow">
            <div className="flex justify-center mb-3">
              <Image
                src={meta.catSrc}
                alt="Cat celebrating"
                width={80}
                height={80}
                className="drop-shadow-[3px_3px_0_hsl(222_47%_4%)] animate-bounce-bob"
              />
            </div>
            <div className="text-4xl mb-2">🏆</div>
            <div className="font-display text-3xl">WORLD COMPLETE!</div>
            <div className="font-mono text-sm opacity-70 mt-1">You finished {meta.title}</div>
            <Link href="/worlds" className="mt-4 brutal-border bg-ink text-bone px-6 py-3 font-display text-base inline-block brutal-press hover:bg-electric-blue transition-colors">
              EXPLORE OTHER WORLDS →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lesson Node ───────────────────────────────────────────────────────────────
function LessonNode({
  node,
  meta,
}: {
  node: PathNode;
  meta: typeof WORLD_META[string];
}) {
  const Wrap = ({
    children, href, className, title,
  }: { children: ReactNode; href?: string; className?: string; title?: string }) => {
    const inner = (
      <div className="flex flex-col items-center gap-1.5 group" title={title}>
        {children}
      </div>
    );
    if (href) {
      return (
        <a href={href} className={`block brutal-press ${className ?? ""}`}>
          {inner}
        </a>
      );
    }
    return <div className={className}>{inner}</div>;
  };

  const Label = ({ text, dim }: { text: string; dim?: boolean }) => (
    <span className={`font-mono text-xs uppercase leading-tight text-center max-w-[88px] line-clamp-2 ${dim ? "opacity-30" : "opacity-70"}`}>
      {text}
    </span>
  );

  if (node.state === "locked") {
    return (
      <Wrap title={node.title} className="cursor-not-allowed">
        <div className="w-14 h-14 rounded-full brutal-border bg-bone/30 opacity-30 flex items-center justify-center">
          <span className="text-xl">🔒</span>
        </div>
        <Label text={node.title} dim />
      </Wrap>
    );
  }

  if (node.state === "complete") {
    return (
      <Wrap href={`/learn/${node.slug}`} title={`${node.title} — completed`}>
        <div className={`w-14 h-14 rounded-full brutal-border flex items-center justify-center ${meta.nodeDone} transition-transform group-hover:scale-105`}>
          <span className="text-2xl">✓</span>
        </div>
        <Label text={node.title} />
      </Wrap>
    );
  }

  if (node.state === "review") {
    return (
      <Wrap href={`/learn/${node.slug}?review=1`} title={`${node.title} — needs review`}>
        <div
          className="w-14 h-14 rounded-full brutal-border bg-hot text-bone flex items-center justify-center transition-transform group-hover:scale-105"
          style={{ animation: "pulse 2s ease-in-out infinite" }}
        >
          <span className="text-2xl">🔥</span>
        </div>
        <Label text="Review" />
      </Wrap>
    );
  }

  // Available — glowing, pulsing
  return (
    <Wrap href={`/learn/${node.slug}`} title={node.title}>
      <div
        className={`w-20 h-20 rounded-full brutal-border flex flex-col items-center justify-center gap-0.5 ${meta.nodeAvail} transition-transform group-hover:scale-110`}
        style={{ boxShadow: `0 0 0 6px ${meta.glowColor}, 0 0 24px ${meta.glowColor}` }}
      >
        <span className="font-display text-xs font-bold leading-tight text-center px-1 line-clamp-2">
          {node.title}
        </span>
        <span className="font-mono text-[8px] opacity-70">+{node.xp} XP</span>
      </div>
      <Label text={node.title} />
    </Wrap>
  );
}
