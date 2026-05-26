"use client";
// DuoPathMap — Duolingo-style vertical winding path with lesson nodes.
// States: locked | available | in-progress | complete | review-needed
import Link from "next/link";
import { useProgress, getLessonStrength, REVIEW_THRESHOLD } from "@/lib/progress";
import type { LearningPath } from "@/content/paths";
import type { Mission } from "@/content/types";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";

type WorldId = "fundamentals" | "dj" | "producer";

type NodeState = "locked" | "available" | "complete" | "review";

interface PathNode {
  slug: string;
  title: string;
  xp: number;
  pathTitle: string;
  chapterTitle: string;
  state: NodeState;
  isChapterStart: boolean;
  chapterEmoji: string;
  side: "left" | "center" | "right"; // winding path position
}

const WORLD_COLORS: Record<WorldId, { accent: string; node: string; locked: string; complete: string }> = {
  fundamentals: { accent: "bg-acid text-ink", node: "border-acid", locked: "border-ink/20", complete: "bg-ink text-bone" },
  dj:           { accent: "bg-volt text-ink", node: "border-volt", locked: "border-bone/20", complete: "bg-volt text-ink" },
  producer:     { accent: "bg-sun text-ink",  node: "border-sun",  locked: "border-ink/20", complete: "bg-sun text-ink"  },
};

const CHAPTER_EMOJIS: Record<string, string> = {
  "sound-science": "🔊", "rhythm-and-time": "🥁", "melody-and-pitch": "🎵",
  "harmony-and-chords": "🎹", "music-technology": "💻",
  "setup-and-culture": "🎧", "the-library": "📚", "the-mix-dj": "🎛",
  "dj-performance": "🎤", "dj-mastery": "🏆",
  "first-contact": "🖥", "sound-and-midi": "🎼", "the-mix-producer": "🎚",
  "performance-and-flow": "🎹", "advanced-producer": "⚡", "synthesis": "🌀",
};

const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];

function getMissionsForWorld(world: WorldId): Mission[] {
  switch (world) {
    case "fundamentals": return FOUNDATIONS_MISSIONS;
    case "dj": return DJ_WORLD_MISSIONS;
    case "producer": return MISSIONS;
  }
}

export function DuoPathMap({ world }: { world: WorldId }) {
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const strengths = progress.lessonStrengths;
  const colors = WORLD_COLORS[world];

  const chapters = chaptersByWorld(world);
  const paths = pathsByWorld(world);
  const missions = getMissionsForWorld(world);

  // Build ordered node list
  const nodes: PathNode[] = [];
  let prevComplete = true; // first mission always available

  chapters.forEach((ch, chIdx) => {
    const chPaths = paths.filter(p => p.chapter === ch.slug).sort((a, b) => a.number - b.number);
    chPaths.forEach((path, pIdx) => {
      path.missionSlugs.forEach((slug, mIdx) => {
        const mission = missions.find(m => m.slug === slug);
        if (!mission) return;
        const isDone = !!completed[slug];
        const ls = strengths[slug];
        const strength = ls ? getLessonStrength(ls) : 1;
        const needsReview = isDone && strength < REVIEW_THRESHOLD;

        let state: NodeState = "locked";
        if (isDone) state = needsReview ? "review" : "complete";
        else if (prevComplete) state = "available";

        // Winding pattern: left, center, right, center, left…
        const sidePattern: ("left" | "center" | "right")[] = ["left", "center", "right", "center"];
        const side = sidePattern[nodes.length % 4];

        nodes.push({
          slug,
          title: mission.title,
          xp: mission.xp,
          pathTitle: path.title,
          chapterTitle: ch.title,
          state,
          isChapterStart: pIdx === 0 && mIdx === 0,
          chapterEmoji: CHAPTER_EMOJIS[ch.slug] ?? "📖",
          side,
        });

        prevComplete = isDone;
      });
    });
  });

  return (
    <div className="relative max-w-sm mx-auto px-4 py-6 pb-32">
      {/* Vertical connector line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-ink/10 -translate-x-0.5 z-0" />

      {nodes.map((node, idx) => {
        const isLeft = node.side === "left";
        const isRight = node.side === "right";
        const isCenter = node.side === "center";

        return (
          <div key={node.slug}>
            {/* Chapter banner */}
            {node.isChapterStart && (
              <div className="relative z-10 my-6 mx-auto max-w-[240px]">
                <div className="brutal-border bg-ink text-bone px-4 py-3 text-center">
                  <div className="text-2xl">{node.chapterEmoji}</div>
                  <div className="font-display text-sm mt-1">{node.chapterTitle}</div>
                </div>
              </div>
            )}

            {/* Node row */}
            <div className={`relative z-10 flex items-center mb-4 ${
              isLeft ? "justify-start" :
              isRight ? "justify-end" :
              "justify-center"
            }`}>
              <NodeButton node={node} colors={colors} world={world} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NodeButton({
  node, colors, world,
}: {
  node: PathNode;
  colors: typeof WORLD_COLORS[WorldId];
  world: WorldId;
}) {
  const baseSize = "w-20 h-20";

  if (node.state === "locked") {
    return (
      <div className={`${baseSize} brutal-border bg-bone/50 flex flex-col items-center justify-center opacity-40 cursor-not-allowed select-none`}>
        <div className="text-2xl">🔒</div>
        <div className="font-mono text-[8px] uppercase mt-1 text-center px-1 leading-tight line-clamp-2">{node.title}</div>
      </div>
    );
  }

  if (node.state === "complete") {
    return (
      <Link href={`/learn/${node.slug}`} className={`${baseSize} brutal-border ${colors.complete} flex flex-col items-center justify-center brutal-press`}>
        <div className="text-2xl">✓</div>
        <div className="font-mono text-[8px] uppercase mt-1 text-center px-1 leading-tight line-clamp-2">{node.title}</div>
      </Link>
    );
  }

  if (node.state === "review") {
    return (
      <Link href={`/learn/${node.slug}?review=1`} className={`${baseSize} brutal-border bg-hot text-bone flex flex-col items-center justify-center brutal-press animate-pulse`}>
        <div className="text-xl">🔥</div>
        <div className="font-mono text-[8px] uppercase mt-1 text-center px-1 leading-tight">Review</div>
        <div className="font-mono text-[7px] text-center">{node.title}</div>
      </Link>
    );
  }

  // available — pulsing accent node
  return (
    <Link href={`/learn/${node.slug}`}
      className={`${baseSize} brutal-border ${colors.accent} flex flex-col items-center justify-center brutal-press brutal-shadow relative`}
      style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
    >
      <div className="font-mono text-[8px] uppercase text-center px-1 leading-tight font-bold">{node.title}</div>
      <div className="font-mono text-[7px] mt-1 opacity-70">+{node.xp} XP</div>
      {/* Glow ring */}
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: "0 0 0 4px rgba(198,255,0,0.3), 0 0 12px rgba(198,255,0,0.2)"
      }} />
    </Link>
  );
}
