"use client";
/**
 * MissionIntroCard — shown before a lesson starts.
 * DJ Pawsworth peeks in with a contextual tip.
 * CCD-style: chunk-shadow, border-4, Bowlby One headings.
 */
import type { Mission } from "@/content/types";
import { getMissionContext } from "@/lib/missionContext";
import { useProgress } from "@/lib/progress";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const WORLD_ACCENT: Record<string, string> = {
  foundations:        "bg-acid text-ink",
  "first-contact":    "bg-acid text-ink",
  "two-views":        "bg-hot text-bone",
  "midi-audio":       "bg-electric-blue text-bone",
  devices:            "bg-sun text-ink",
  mixing:             "bg-acid text-ink",
  performance:        "bg-hot text-bone",
  "midi-instruments": "bg-electric-blue text-bone",
  "live12-power":     "bg-sun text-ink",
  dj:                 "bg-ink text-bone",
};

const WORLD_BAR: Record<string, string> = {
  foundations: "bg-acid",
  dj:          "bg-electric-blue",
  producer:    "bg-sun",
};

// Contextual DJ Cat tip per world
const WORLD_TIPS: Record<string, string> = {
  foundations: "This is the foundation everything else is built on. Take your time here — it pays off later. 🎵",
  dj:          "Real DJ knowledge, straight from the rekordbox manual. No fluff, just the craft. 🎧",
  producer:    "This is straight from Ableton's official manual. Learning it here = using it in the real DAW. 🎛",
};

const ACTIVITY_STEPS = [
  { icon: "📖", label: "Read the concept" },
  { icon: "🔊", label: "Hear an audio example" },
  { icon: "🎛",  label: "Try it live with the simulator" },
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

export function MissionIntroCard({ mission: m, missionIndex = 1, missionTotal = 1, isReview = false, onStart }: Props) {
  const { progress } = useProgress();
  const ctx         = getMissionContext(m.slug);
  const alreadyDone = !!progress.completedMissions[m.slug];
  const accent      = WORLD_ACCENT[m.world] ?? "bg-bone text-ink";
  const bar         = WORLD_BAR[ctx.world ?? m.world] ?? "bg-acid";
  const xpEarned    = alreadyDone ? 0 : m.xp;
  const tip         = WORLD_TIPS[ctx.world ?? m.world] ?? "Every mission counts. Let's go! 🐱";

  const quizCount   = (m.screens ?? []).filter(s =>
    s.kind === "quiz" || s.kind === "audio-id" || s.kind === "type-answer" || s.kind === "sequence" || s.kind === "match"
  ).length;
  const hasInteract = (m.screens ?? []).some(s => s.kind === "interact");
  const screenCount = m.screens?.length ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 animate-fade-in">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 font-mono text-[9px] uppercase opacity-50 flex-wrap">
        <Link href={ctx.worldRoute} className="hover:opacity-100 transition-opacity">{ctx.worldLabel}</Link>
        {ctx.chapter && <><span>›</span><span>{ctx.chapter.title}</span></>}
        {ctx.path && <><span>›</span><span>{ctx.path.title}</span></>}
        {missionTotal > 1 && (
          <><span>›</span><span className="text-ink opacity-100 font-bold">{missionIndex} of {missionTotal}</span></>
        )}
      </div>

      {/* DJ Cat tip — peeking in from the side */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
        className="brutal-border bg-electric-blue text-bone p-4 flex items-center gap-4 chunk-shadow"
      >
        <div className="relative w-16 h-16 shrink-0 wiggle"
          style={{ filter: "drop-shadow(3px 3px 0 hsl(222 47% 4%))" }}>
          <Image src="/cats/cat-dj-new.png" alt="DJ Pawsworth" fill className="object-contain" sizes="64px" />
        </div>
        <div>
          <div className="font-display text-xs uppercase opacity-70 mb-1">DJ PAWSWORTH SAYS</div>
          <p className="font-sans text-sm leading-snug">{tip}</p>
        </div>
      </motion.div>

      {/* Mission header */}
      <header className={`brutal-border ${accent} p-5 md:p-7 chunk-shadow`}>
        <div className="font-mono text-[9px] uppercase opacity-60 mb-2">
          {isReview ? "🔄 REVIEW SESSION" : `MISSION ${String(m.number).padStart(3, "0")}`}
        </div>
        <h1 className="font-display text-4xl md:text-5xl leading-none">{m.title}</h1>
        <p className="font-sans text-sm md:text-base opacity-80 mt-3 leading-relaxed">{m.tagline}</p>
        <div className="flex flex-wrap gap-2 mt-4 font-mono text-[10px] uppercase">
          {xpEarned > 0 ? (
            <span className="brutal-border bg-bone/20 px-2 py-1">+{xpEarned} XP to earn</span>
          ) : (
            <span className="brutal-border bg-bone/20 px-2 py-1 opacity-60">✓ Already completed · review for free</span>
          )}
          {m.badge && <span className="brutal-border bg-bone/20 px-2 py-1">🏅 {m.badge.name}</span>}
          {screenCount > 0 && <span className="brutal-border bg-bone/20 px-2 py-1">{screenCount} screens</span>}
        </div>
      </header>

      {/* What you'll do */}
      <div className="brutal-border bg-bone p-5 chunk-shadow-sm">
        <div className={`brutal-border ${bar} text-ink px-3 py-1.5 font-display text-xs uppercase mb-4 inline-block chunk-shadow-sm`}>
          WHAT YOU&apos;LL DO IN THIS LESSON
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ACTIVITY_STEPS.filter(s => {
            if (s.icon === "🔊") return (m.screens ?? []).some(sc => sc.kind === "concept");
            if (s.icon === "🎛") return hasInteract;
            if (s.icon === "❓") return quizCount > 0;
            return true;
          }).map(step => (
            <div key={step.icon} className="flex items-center gap-3 brutal-border bg-bone p-3">
              <span className="text-lg shrink-0">{step.icon}</span>
              <span className="font-sans text-xs uppercase opacity-70">{step.label}</span>
            </div>
          ))}
        </div>
        {quizCount > 0 && (
          <div className="mt-3 font-mono text-[10px] uppercase opacity-50">
            {quizCount} question{quizCount > 1 ? "s" : ""} · immediate feedback after each
          </div>
        )}
      </div>

      {/* Source citation */}
      {ctx.path?.source && (
        <div className="brutal-border bg-bone px-4 py-3 flex items-start gap-2">
          <span className="font-mono text-[9px] uppercase opacity-40 shrink-0 mt-px">SOURCE</span>
          <span className="font-sans text-xs opacity-60 leading-relaxed">{ctx.path.source}</span>
        </div>
      )}

      {/* CTA */}
      <button onClick={onStart}
        className="w-full brutal-border bg-acid text-ink py-5 font-display text-2xl md:text-3xl brutal-press chunk-shadow hover:bg-sun transition-colors ccd-btn-hover animate-pulse-glow">
        {isReview ? "START REVIEW →" : "START LESSON →"}
      </button>

      <div className="text-center font-mono text-[9px] uppercase opacity-30">
        {isReview ? "Review strengthens your memory — no XP cost" : "Read · Interact · Quiz · Earn XP"}
      </div>
    </div>
  );
}
