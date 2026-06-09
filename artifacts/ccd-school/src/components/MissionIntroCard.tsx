"use client";
/**
 * MissionIntroCard — shown before a lesson starts.
 *
 * Gives the learner context BEFORE diving in:
 *   - What this mission is about
 *   - Why it matters
 *   - What they will do (explain → hear → interact → quiz)
 *   - XP they'll earn
 *   - Path position (N of M)
 *
 * Design principle: never just jump into a lesson cold.
 * Every mission, every sound, every quiz needs context first.
 */
import type { Mission } from "@/content/types";
import { getMissionContext } from "@/lib/missionContext";
import { useProgress } from "@/lib/progress";
import Link from "next/link";

// World accent colours (maps to CSS tokens)
const WORLD_ACCENT: Record<string, string> = {
  foundations: "bg-acid text-ink",
  "first-contact": "bg-acid text-ink",
  "two-views": "bg-hot text-bone",
  "midi-audio": "bg-volt text-bone",
  devices: "bg-sun text-ink",
  mixing: "bg-acid text-ink",
  performance: "bg-hot text-bone",
  "midi-instruments": "bg-volt text-bone",
  "live12-power": "bg-sun text-ink",
  dj: "bg-ink text-bone",
};

const WORLD_BAR: Record<string, string> = {
  foundations: "bg-acid",
  dj: "bg-volt",
  producer: "bg-sun",
};

// What the learner will do in each screen type
const ACTIVITY_STEPS = [
  { icon: "📖", label: "Read the concept" },
  { icon: "🔊", label: "Hear an audio example" },
  { icon: "🎛", label: "Try it live with the simulator" },
  { icon: "❓", label: "Answer quiz questions" },
  { icon: "✓",  label: "Earn XP + badge" },
];

interface Props {
  mission: Mission;
  missionIndex?: number;
  missionTotal?: number;
  isReview?: boolean;
  onStart: () => void;
}

export function MissionIntroCard({
  mission: m,
  missionIndex = 1,
  missionTotal = 1,
  isReview = false,
  onStart,
}: Props) {
  const { progress } = useProgress();
  const ctx = getMissionContext(m.slug);
  const alreadyDone = !!progress.completedMissions[m.slug];
  const accent = WORLD_ACCENT[m.world] ?? "bg-bone text-ink";
  const bar = WORLD_BAR[ctx.worldSlug ?? m.world] ?? "bg-acid";
  const xpEarned = alreadyDone ? 0 : m.xp;

  // Count exercises in screens
  const quizCount = (m.screens ?? []).filter(
    s => s.kind === "quiz" || s.kind === "audio-id" || s.kind === "type-answer" || s.kind === "sequence" || s.kind === "match"
  ).length;
  const hasInteract = (m.screens ?? []).some(s => s.kind === "interact");
  const screenCount = m.screens?.length ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 animate-fade-in">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1 font-mono text-[9px] uppercase opacity-50 flex-wrap">
        <Link href={ctx.worldRoute} className="hover:opacity-100 transition-opacity">
          {ctx.worldLabel}
        </Link>
        {ctx.chapter && <><span>›</span><span>{ctx.chapter.title}</span></>}
        {ctx.path && <><span>›</span><span>{ctx.path.title}</span></>}
        {missionTotal > 1 && (
          <><span>›</span><span className="text-ink opacity-100 font-bold">{missionIndex} of {missionTotal}</span></>
        )}
      </div>

      {/* ── Mission header ── */}
      <header className={`brutal-border ${accent} p-5 md:p-7 brutal-shadow`}>
        <div className="font-mono text-[9px] uppercase opacity-60 mb-2">
          {isReview ? "🔄 REVIEW SESSION" : `MISSION ${String(m.number).padStart(3, "0")}`}
        </div>
        <h1 className="font-display text-4xl md:text-5xl leading-none">{m.title}</h1>
        <p className="font-mono text-sm md:text-base opacity-80 mt-3 leading-relaxed">{m.tagline}</p>

        {/* XP + badge row */}
        <div className="flex flex-wrap gap-2 mt-4 font-mono text-[10px] uppercase">
          {xpEarned > 0 ? (
            <span className="brutal-border bg-bone/20 px-2 py-1">+{xpEarned} XP to earn</span>
          ) : (
            <span className="brutal-border bg-bone/20 px-2 py-1 opacity-60">✓ Already completed · review for free</span>
          )}
          {m.badge && (
            <span className="brutal-border bg-bone/20 px-2 py-1">🏅 {m.badge.name}</span>
          )}
          {screenCount > 0 && (
            <span className="brutal-border bg-bone/20 px-2 py-1">{screenCount} screens</span>
          )}
        </div>
      </header>

      {/* ── What you'll do ── */}
      <div className="brutal-border bg-bone p-5">
        <div className={`brutal-border ${bar} text-ink px-3 py-1.5 font-mono text-[9px] uppercase font-bold mb-4 inline-block`}>
          WHAT YOU&apos;LL DO IN THIS LESSON
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ACTIVITY_STEPS.filter(s => {
            // Only show "hear audio" if there are concept screens
            if (s.icon === "🔊") return (m.screens ?? []).some(sc => sc.kind === "concept");
            // Only show simulator if there's an interact screen
            if (s.icon === "🎛") return hasInteract;
            // Only show quiz if there are quiz screens
            if (s.icon === "❓") return quizCount > 0;
            return true;
          }).map(step => (
            <div key={step.icon} className="flex items-center gap-3 brutal-border bg-bone p-3">
              <span className="text-lg shrink-0">{step.icon}</span>
              <span className="font-mono text-[11px] uppercase opacity-70">{step.label}</span>
            </div>
          ))}
        </div>
        {quizCount > 0 && (
          <div className="mt-3 font-mono text-[10px] uppercase opacity-50">
            {quizCount} question{quizCount > 1 ? "s" : ""} · immediate feedback after each
          </div>
        )}
      </div>

      {/* ── Source citation ── */}
      {ctx.path?.source && (
        <div className="brutal-border bg-bone px-4 py-3 flex items-start gap-2">
          <span className="font-mono text-[9px] uppercase opacity-40 shrink-0 mt-px">SOURCE</span>
          <span className="font-mono text-[10px] opacity-60 leading-relaxed">{ctx.path.source}</span>
        </div>
      )}

      {/* ── CTA ── */}
      <button
        onClick={onStart}
        className="w-full brutal-border bg-acid text-ink py-5 font-display text-2xl md:text-3xl brutal-press brutal-shadow hover:bg-sun transition-colors"
      >
        {isReview ? "START REVIEW →" : "START LESSON →"}
      </button>

      <div className="text-center font-mono text-[9px] uppercase opacity-30">
        {isReview
          ? "Review strengthens your memory — no XP cost"
          : "Read every screen · Interact with the sim · Answer the quiz"}
      </div>
    </div>
  );
}
