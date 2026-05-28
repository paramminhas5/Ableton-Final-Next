"use client";
/**
 * WorldPathClient — Duolingo-style world path map.
 * Shows a vertical winding trail of lesson nodes per world.
 * Chapter banners break up sections. Nodes pulse when available.
 */
import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
// Note: LessonNode uses <a> tags for simplicity; Link is used elsewhere in this file
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
import type { LearningPath } from "@/content/paths";

type WorldId = "fundamentals" | "dj" | "producer";

type NodeState = "locked" | "available" | "complete" | "review";

interface PathNode {
  slug: string;
  title: string;
  xp: number;
  chapterSlug: string;
  state: NodeState;
  isFirstInChapter: boolean;
  side: "left" | "center" | "right";
}

const WORLD_META: Record<string, {
  bg: string; accent: string; nodeAvail: string; nodeDone: string;
  emoji: string; title: string; tagline: string;
}> = {
  fundamentals: {
    bg: "bg-bone", accent: "bg-acid text-ink", nodeAvail: "bg-acid text-ink border-acid",
    nodeDone: "bg-ink text-bone border-ink", emoji: "🎵", title: "Fundamentals",
    tagline: "Sound · Rhythm · Melody · Harmony · Music Tech",
  },
  dj: {
    bg: "bg-ink", accent: "bg-volt text-ink", nodeAvail: "bg-volt text-ink border-volt",
    nodeDone: "bg-volt/20 text-bone border-volt", emoji: "🎧", title: "DJ World",
    tagline: "Setup · Library · The Mix · Performance · Mastery",
  },
  producer: {
    bg: "bg-bone", accent: "bg-sun text-ink", nodeAvail: "bg-sun text-ink border-sun",
    nodeDone: "bg-ink text-bone border-ink", emoji: "🎛", title: "Producer",
    tagline: "First Contact · Sound & MIDI · Mix · Performance · Advanced",
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

// ─── World Overview — collapsible chapter/path breakdown ──────────────────────

function WorldOverview({
  world,
  meta,
  chapters,
  paths,
  nodes,
}: {
  world: WorldId;
  meta: typeof WORLD_META[string];
  chapters: Chapter[];
  paths: LearningPath[];
  nodes: PathNode[];
}) {
  const [open, setOpen] = useState(false);
  const totalMissions = paths.flatMap((p) => p.missionSlugs).length;
  const doneMissions = nodes.filter((n) => n.state === "complete" || n.state === "review").length;

  return (
    <div className={`brutal-border border-x-0 border-t-0 ${world === "dj" ? "bg-ink/40" : "bg-bone/80"}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-5 py-3 brutal-press transition-colors ${
          world === "dj" ? "hover:bg-bone/10 text-bone" : "hover:bg-ink/5 text-ink"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase opacity-60">// WHAT&apos;S IN THIS WORLD</span>
          <span className="font-mono text-[9px] uppercase opacity-40">
            {chapters.length} chapters · {paths.length} paths · {totalMissions} missions
          </span>
        </div>
        <span className={`font-display text-lg opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="px-4 pb-5 space-y-3 border-t border-current/10">
          <div className="font-mono text-[9px] uppercase opacity-40 pt-3">
            {doneMissions}/{totalMissions} missions complete
          </div>
          {chapters.map((ch) => {
            const chPaths = paths.filter((p) => p.chapter === ch.slug);
            const chMissions = chPaths.flatMap((p) => p.missionSlugs);
            const chDone = nodes.filter(
              (n) => n.chapterSlug === ch.slug && (n.state === "complete" || n.state === "review")
            ).length;
            const chPct = chMissions.length > 0 ? Math.round((chDone / chMissions.length) * 100) : 0;
            const emoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";

            return (
              <div
                key={ch.slug}
                className={`brutal-border p-4 ${world === "dj" ? "bg-bone/5" : "bg-bone"}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className={`font-display text-base leading-tight ${world === "dj" ? "text-bone" : "text-ink"}`}>
                        {ch.title}
                      </div>
                      <div className="font-mono text-[9px] uppercase opacity-50 shrink-0">
                        {chDone}/{chMissions.length}
                      </div>
                    </div>
                    <div className={`font-mono text-xs opacity-60 mt-0.5 leading-snug ${world === "dj" ? "text-bone" : ""}`}>
                      {ch.tagline}
                    </div>
                    {/* Chapter progress bar */}
                    <div className="mt-2 h-1.5 brutal-border bg-ink/10 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${meta.accent.split(" ")[0]}`}
                        style={{ width: `${chPct}%` }}
                      />
                    </div>
                    {/* Paths within chapter */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {chPaths.map((p) => (
                        <span
                          key={p.slug}
                          className={`font-mono text-[9px] uppercase brutal-border px-1.5 py-0.5 ${
                            world === "dj" ? "bg-bone/10 text-bone opacity-60" : "bg-ink/5 opacity-60"
                          }`}
                        >
                          {p.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getMissions(world: WorldId): Mission[] {
  if (world === "fundamentals") return FOUNDATIONS_MISSIONS;
  if (world === "dj") return DJ_WORLD_MISSIONS;
  return MISSIONS;
}

const SIDE_PATTERN: ("left" | "center" | "right" | "center")[] = ["left", "center", "right", "center"];

export function WorldPathClient({ worldSlug }: { worldSlug: string }) {
  const world = worldSlug as WorldId;
  const meta = WORLD_META[world];
  const { progress } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const strengths = progress.lessonStrengths;

  const chapters = chaptersByWorld(world);
  const paths = pathsByWorld(world);
  const missions = getMissions(world);

  // Build flat ordered node list
  const nodes: PathNode[] = [];
  let prevComplete = true;

  chapters.forEach(ch => {
    const chPaths = paths.filter(p => p.chapter === ch.slug).sort((a, b) => a.number - b.number);
    chPaths.forEach((path, pIdx) => {
      path.missionSlugs.forEach((slug, mIdx) => {
        const isDone = !!completed[slug];
        const ls = strengths[slug];
        const strength = ls ? getLessonStrength(ls) : 1;
        const needsReview = isDone && strength < REVIEW_THRESHOLD;

        let state: NodeState = "locked";
        if (isDone) state = needsReview ? "review" : "complete";
        else if (prevComplete) state = "available";

        nodes.push({
          slug, xp: missions.find(m => m.slug === slug)?.xp ?? 40,
          title: missions.find(m => m.slug === slug)?.title ?? slug,
          chapterSlug: ch.slug, state,
          isFirstInChapter: pIdx === 0 && mIdx === 0,
          side: SIDE_PATTERN[nodes.length % 4],
        });

        prevComplete = isDone;
      });
    });
  });

  // Stats
  const total = nodes.length;
  const done = nodes.filter(n => n.state === "complete" || n.state === "review").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const { current: rank } = rankFor(progress.xp);

  if (!meta) return <div className="p-8 font-mono">World not found: {worldSlug}</div>;

  return (
    <div className={`min-h-screen ${meta.bg}`}>
      {/* World header */}
      <div className={`brutal-border border-x-0 border-t-0 ${meta.accent} p-5`}>
        <Link href="/worlds" className="font-mono text-[10px] uppercase opacity-60 hover:opacity-100 block mb-2">← ALL WORLDS</Link>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{meta.emoji}</span>
          <div>
            <h1 className="font-display text-4xl leading-none">{meta.title}</h1>
            <p className="font-mono text-xs opacity-70 mt-0.5">{meta.tagline}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 space-y-1">
          <div className="h-3 brutal-border bg-bone/30 overflow-hidden">
            <div className="h-full bg-ink/70 transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between font-mono text-[9px] uppercase opacity-60">
            <span>{done}/{total} lessons</span>
            <span>{pct}% complete</span>
          </div>
        </div>
        {/* Stats pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="brutal-border bg-ink/20 px-3 py-1 font-mono text-[10px] uppercase">
            🔥 {progress.streakDays} day streak
          </div>
          <div className="brutal-border bg-ink/20 px-3 py-1 font-mono text-[10px] uppercase">
            {progress.xp} XP · {rank.name}
          </div>
          <div className="brutal-border bg-ink/20 px-3 py-1 font-mono text-[10px] uppercase">
            💎 {progress.gems} gems
          </div>
        </div>
      </div>

      {/* World overview — collapsible chapter breakdown */}
      <WorldOverview world={world} meta={meta} chapters={chapters} paths={paths} nodes={nodes} />

      {/* Mode banner */}
      <div className={`brutal-border border-x-0 border-t-0 px-4 py-3 flex items-center justify-between gap-3
        ${learnMode === "ccd" ? "bg-volt text-ink" : "bg-bone text-ink"}`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{learnMode === "ccd" ? "🔒" : "🗺"}</span>
          <div>
            <div className="font-mono text-[9px] uppercase opacity-70 leading-tight">
              {learnMode === "ccd" ? "Path Mode" : "Explorer Mode"}
            </div>
            <div className="font-mono text-[10px] font-bold leading-tight">
              {learnMode === "ccd"
                ? "Sequential · ❤️ hearts on · XP gated"
                : "All lessons open · No hearts · Jump anywhere"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setLearnMode(learnMode === "ccd" ? "classic" : "ccd")}
          className="brutal-border bg-ink text-bone px-3 py-1.5 font-mono text-[9px] uppercase brutal-press shrink-0 hover:bg-volt hover:text-ink transition-colors"
        >
          Switch →
        </button>
      </div>

      {/* Path */}
      <div className="relative max-w-sm mx-auto px-4 py-8 pb-32">
        {/* Spine line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-ink/10 -translate-x-px pointer-events-none" />

        {nodes.map((node, idx) => {
          // Chapter banner
          const isChapterStart = node.isFirstInChapter;
          const chMeta = CHAPTER_EMOJIS[node.chapterSlug] ?? "📖";
          const chapter = chapters.find(c => c.slug === node.chapterSlug);

          return (
            <div key={node.slug}>
              {isChapterStart && (
                <div className="relative z-10 flex justify-center my-8">
                  <div className="brutal-border bg-ink text-bone px-5 py-3 text-center max-w-[220px]">
                    <div className="text-3xl mb-1">{chMeta}</div>
                    <div className="font-display text-base leading-tight">{chapter?.title ?? node.chapterSlug}</div>
                    <div className="font-mono text-[9px] opacity-50 mt-0.5 uppercase">{chapter?.tagline ?? ""}</div>
                  </div>
                </div>
              )}

              {/* Node */}
              <div className={`relative z-10 flex mb-6 ${
                node.side === "left" ? "justify-start pl-4" :
                node.side === "right" ? "justify-end pr-4" :
                "justify-center"
              }`}>
                <LessonNode node={node} meta={meta} />
              </div>
            </div>
          );
        })}

        {/* World complete banner */}
        {pct === 100 && (
          <div className="relative z-10 mt-8 brutal-border bg-acid text-ink p-6 text-center brutal-shadow">
            <div className="text-5xl mb-2">🏆</div>
            <div className="font-display text-3xl">WORLD COMPLETE!</div>
            <div className="font-mono text-sm opacity-70 mt-1">You finished {meta.title}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function LessonNode({
  node,
  meta,
}: {
  node: PathNode;
  meta: typeof WORLD_META[string];
}) {
  // Outer wrapper: icon circle on top, label below
  const Wrap = ({ children, href, className, title }: {
    children: ReactNode;
    href?: string;
    className?: string;
    title?: string;
  }) => {
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

  // Label shown below every node
  const Label = ({ text, dim }: { text: string; dim?: boolean }) => (
    <span className={`font-mono text-[10px] uppercase leading-tight text-center max-w-[88px] line-clamp-2
      ${dim ? "opacity-30" : "opacity-70"}`}>
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
        <div className={`w-14 h-14 rounded-full brutal-border flex items-center justify-center
          ${meta.nodeDone} transition-transform group-hover:scale-105`}>
          <span className="text-2xl">✓</span>
        </div>
        <Label text={node.title} />
      </Wrap>
    );
  }

  if (node.state === "review") {
    return (
      <Wrap href={`/learn/${node.slug}?review=1`} title={`${node.title} — needs review`}>
        <div className="w-14 h-14 rounded-full brutal-border bg-hot text-bone flex items-center justify-center
          transition-transform group-hover:scale-105"
          style={{ animation: "pulse 2s ease-in-out infinite" }}>
          <span className="text-2xl">🔥</span>
        </div>
        <Label text="Review" />
      </Wrap>
    );
  }

  // available — glowing, pulsing accent
  return (
    <Wrap href={`/learn/${node.slug}`} title={node.title}>
      <div
        className={`w-16 h-16 rounded-full brutal-border flex flex-col items-center justify-center gap-0.5
          ${meta.nodeAvail} transition-transform group-hover:scale-110`}
        style={{ boxShadow: "0 0 0 5px rgba(198,255,0,0.2), 0 0 18px rgba(198,255,0,0.15)" }}
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
