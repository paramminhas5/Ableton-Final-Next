"use client";
/**
 * WorldPathClient — Duolingo-style world path map.
 * Shows a vertical winding trail of lesson nodes per world.
 * Chapter banners break up sections. Nodes pulse when available.
 */
import Link from "next/link";
import { useProgress, getLessonStrength, REVIEW_THRESHOLD } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { rankFor } from "@/lib/ranks";
import type { Mission } from "@/content/types";

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
  const size = "w-20 h-20";
  const base = `${size} brutal-border flex flex-col items-center justify-center text-center px-1 select-none`;

  if (node.state === "locked") {
    return (
      <div className={`${base} bg-bone/50 opacity-30 cursor-not-allowed`}
        title={node.title}>
        <span className="text-xl">🔒</span>
        <span className="font-mono text-[7px] uppercase mt-1 leading-tight line-clamp-2">{node.title}</span>
      </div>
    );
  }

  if (node.state === "complete") {
    return (
      <Link href={`/learn/${node.slug}`}
        className={`${base} ${meta.nodeDone} brutal-press`}
        title={`${node.title} — completed`}>
        <span className="text-lg">✓</span>
        <span className="font-mono text-[7px] uppercase mt-0.5 leading-tight line-clamp-2">{node.title}</span>
      </Link>
    );
  }

  if (node.state === "review") {
    return (
      <Link href={`/learn/${node.slug}?review=1`}
        className={`${base} bg-hot text-bone brutal-press`}
        style={{ animation: "pulse 2s ease-in-out infinite" }}
        title={`${node.title} — needs review`}>
        <span className="text-lg">🔥</span>
        <span className="font-mono text-[7px] uppercase mt-0.5 leading-tight line-clamp-2">Review</span>
      </Link>
    );
  }

  // available — glowing accent
  return (
    <Link href={`/learn/${node.slug}`}
      className={`${base} ${meta.nodeAvail} brutal-press brutal-shadow`}
      style={{ boxShadow: "0 0 0 4px rgba(198,255,0,0.25), 0 0 16px rgba(198,255,0,0.15)" }}
      title={node.title}>
      <span className="font-display text-[11px] leading-tight font-bold line-clamp-2">{node.title}</span>
      <span className="font-mono text-[8px] opacity-70 mt-0.5">+{node.xp} XP</span>
    </Link>
  );
}
