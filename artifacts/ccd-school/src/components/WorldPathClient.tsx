"use client";
/**
 * WorldPathClient — Duolingo-style world path map.
 *
 * Fixes in this version:
 * ✓ ChapterStrip → compact LINEAR PROGRESS TRACK (numbered nodes on a line,
 *   scrollable horizontally, each node is a clickable anchor to that chapter)
 * ✓ Chapter banners have a "Skip chapter →" button that opens an inline
 *   MINI PLACEMENT TEST (3-4 questions). Pass → chapter unlocked. Skip → nothing.
 * ✓ Nodes past unlockedChapter are available (placement jump logic preserved)
 * ✓ Solid color hero — no images
 * ✓ Header ModeTogglePill is the one toggle — only inline info shown here
 */
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { useProgress, getLessonStrength, REVIEW_THRESHOLD } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { rankFor } from "@/lib/ranks";
import { PLACEMENT_QUESTIONS, scorePlacement } from "@/content/placement-questions";
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
  bg: string; heroBg: string; heroBorder: string; textColor: string;
  nodeAvail: string; nodeDone: string; nodeReview: string;
  accentBg: string; accentText: string;
  emoji: string; title: string; tagline: string;
  catMain: string; catDeco1: string; catDeco2: string;
  deco1: string; deco2: string;
  glowColor: string;
  trackDone: string; trackPartial: string; trackEmpty: string; trackLine: string;
  chapterBannerBg: string; chapterBannerBorder: string;
  freeModeLinkClass: string;
  skipBtnClass: string;
  modalBg: string; modalText: string;
  pillDone: string; pillPartial: string; pillEmpty: string;
}> = {
  fundamentals: {
    bg: "bg-bone", heroBg: "bg-acid", heroBorder: "border-b-4 border-ink",
    textColor: "text-ink",
    accentBg: "bg-acid", accentText: "text-ink",
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
    trackDone: "bg-ink text-bone border-ink",
    trackPartial: "bg-acid/60 text-ink border-ink",
    trackEmpty: "bg-ink/10 text-ink/40 border-ink/20",
    trackLine: "bg-ink/20",
    chapterBannerBg: "bg-acid/20",
    chapterBannerBorder: "border-t-4 border-t-acid border-b-0",
    freeModeLinkClass: "bg-ink/10 text-ink hover:bg-ink/25 border-ink/30",
    skipBtnClass: "bg-ink/10 text-ink hover:bg-ink/20 border-ink/20",
    modalBg: "bg-bone", modalText: "text-ink",
    pillDone: "bg-ink text-bone", pillPartial: "bg-acid text-ink", pillEmpty: "bg-ink/10 text-ink/50",
  },
  dj: {
    bg: "bg-[#0a0f2e]", heroBg: "bg-[#0a0f2e]", heroBorder: "border-b-4 border-volt",
    textColor: "text-bone",
    accentBg: "bg-volt", accentText: "text-ink",
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
    trackDone: "bg-volt text-ink border-volt",
    trackPartial: "bg-volt/40 text-bone border-volt/50",
    trackEmpty: "bg-bone/10 text-bone/30 border-bone/15",
    trackLine: "bg-volt/20",
    chapterBannerBg: "bg-volt/10",
    chapterBannerBorder: "border-t-4 border-t-volt border-b-0",
    freeModeLinkClass: "bg-bone/10 text-bone hover:bg-bone/20 border-bone/20",
    skipBtnClass: "bg-bone/10 text-bone hover:bg-bone/20 border-bone/15",
    modalBg: "bg-[#0a1228]", modalText: "text-bone",
    pillDone: "bg-volt text-ink", pillPartial: "bg-volt/40 text-bone", pillEmpty: "bg-bone/10 text-bone/40",
  },
  producer: {
    bg: "bg-bone", heroBg: "bg-sun", heroBorder: "border-b-4 border-ink",
    textColor: "text-ink",
    accentBg: "bg-sun", accentText: "text-ink",
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
    trackDone: "bg-ink text-bone border-ink",
    trackPartial: "bg-sun/70 text-ink border-ink/50",
    trackEmpty: "bg-ink/10 text-ink/40 border-ink/20",
    trackLine: "bg-ink/20",
    chapterBannerBg: "bg-sun/20",
    chapterBannerBorder: "border-t-4 border-t-sun border-b-0",
    freeModeLinkClass: "bg-ink/10 text-ink hover:bg-ink/25 border-ink/30",
    skipBtnClass: "bg-ink/10 text-ink hover:bg-ink/20 border-ink/20",
    modalBg: "bg-bone", modalText: "text-ink",
    pillDone: "bg-ink text-bone", pillPartial: "bg-sun text-ink", pillEmpty: "bg-ink/10 text-ink/50",
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

// Chapter first missions — for jumping to when test passed
const CHAPTER_FIRST_MISSION: Record<WorldId, Record<number, string>> = {
  fundamentals: { 1: "what-is-sound", 2: "syncopation", 3: "chords-and-keys", 4: "the-digital-studio", 5: "the-digital-studio" },
  dj:           { 1: "what-is-djing", 2: "bpm-analysis-dj", 3: "beatmatching-manual", 4: "crowd-reading", 5: "advanced-effects-dj" },
  producer:     { 1: "what-is-live",  2: "midi-piano-roll", 3: "the-mixer", 4: "push-3-intro", 5: "sampler-deep", 6: "synth-oscillators" },
};

function getMissions(world: WorldId): Mission[] {
  if (world === "fundamentals") return FOUNDATIONS_MISSIONS;
  if (world === "dj") return DJ_WORLD_MISSIONS;
  return MISSIONS;
}

const SIDE_PATTERN: ("left" | "center" | "right")[] = ["left", "center", "right", "center"];

// ─── Mini placement test modal ────────────────────────────────────────────────
interface MiniTestProps {
  world: WorldId;
  chapterNumber: number;
  meta: typeof WORLD_META[string];
  onUnlock: (chapter: number) => void;
  onClose: () => void;
}

function MiniPlacementTest({ world, chapterNumber, meta, onUnlock, onClose }: MiniTestProps) {
  const questions = PLACEMENT_QUESTIONS.filter(q => q.world === world);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<"picking" | "answered" | "done">("picking");
  const total = questions.length;
  const current = questions[qIdx];

  const handlePick = useCallback((idx: number) => {
    if (phase !== "picking" || !current) return;
    const isCorrect = idx === current.answer;
    setPicked(idx);
    setPhase("answered");
    setAnswers(prev => ({ ...prev, [current.id]: isCorrect }));
  }, [phase, current]);

  const handleNext = useCallback(() => {
    if (qIdx < total - 1) {
      setQIdx(i => i + 1);
      setPhase("picking");
      setPicked(null);
    } else {
      setPhase("done");
    }
  }, [qIdx, total]);

  const handleApply = useCallback(() => {
    const scored = scorePlacement(answers, world);
    // Only unlock if they scored well enough to reach this chapter
    const unlockTo = Math.max(scored, chapterNumber);
    onUnlock(unlockTo);
  }, [answers, world, chapterNumber, onUnlock]);

  const correctCount = Object.values(answers).filter(Boolean).length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div
        className={`fixed inset-x-4 top-[10vh] z-[60] max-w-md mx-auto brutal-border brutal-shadow animate-pop-in ${meta.modalBg} ${meta.modalText}`}
        role="dialog"
        aria-modal="true"
        aria-label="Chapter placement test"
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b-4 border-ink flex items-center justify-between ${meta.accentBg} ${meta.accentText}`}>
          <div>
            <div className="font-mono text-[9px] uppercase opacity-60">Chapter {chapterNumber} — Skip Test</div>
            <div className="font-display text-xl leading-tight">Can you skip ahead?</div>
          </div>
          <button
            onClick={onClose}
            className="brutal-border bg-ink/20 px-3 py-1.5 font-display text-xs brutal-press hover:bg-ink/40 transition-colors"
            aria-label="Close test"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">

          {/* DONE phase */}
          {phase === "done" ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="text-5xl mb-3">{pct >= 75 ? "🎉" : pct >= 50 ? "👍" : "📚"}</div>
                <div className="font-display text-3xl mb-1">
                  {correctCount}/{total} correct
                </div>
                <div className="font-mono text-xs opacity-55">
                  {pct >= 75
                    ? "Great score — you can skip this chapter!"
                    : pct >= 50
                    ? "Decent — you can still skip if you want."
                    : "Might be worth going through this chapter."}
                </div>
              </div>

              {/* Per-question recap */}
              <div className="space-y-1">
                {questions.map(q => (
                  <div key={q.id} className={`flex items-center gap-2 px-3 py-2 brutal-border font-mono text-xs ${answers[q.id] ? "bg-acid/20 text-ink" : "bg-hot/15 text-ink"}`}>
                    <span className="shrink-0">{answers[q.id] ? "✓" : "✗"}</span>
                    <span className="opacity-60 truncate">{q.q}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleApply}
                  className="flex-1 brutal-border bg-acid text-ink py-3 font-display text-base brutal-press hover:bg-sun transition-colors"
                >
                  SKIP TO CHAPTER {chapterNumber} →
                </button>
                <button
                  onClick={onClose}
                  className="brutal-border px-4 py-3 font-mono text-xs uppercase brutal-press hover:bg-ink/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

          ) : current ? (
            /* QUIZ phase */
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 brutal-border bg-ink/10 overflow-hidden">
                  <div
                    className="h-full bg-acid transition-all duration-300"
                    style={{ width: `${(qIdx / total) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] opacity-50">{qIdx + 1}/{total}</span>
              </div>

              {/* Question */}
              <div className="brutal-border bg-ink/5 p-4">
                <div className="font-display text-lg leading-snug">{current.q}</div>
              </div>

              {/* Options */}
              <div className="grid gap-1.5">
                {current.options.map((opt, i) => {
                  let cls = "bg-ink/5 hover:bg-ink/15 brutal-press cursor-pointer";
                  if (phase === "answered") {
                    if (i === current.answer) cls = "bg-acid text-ink font-bold";
                    else if (i === picked) cls = "bg-hot text-bone";
                    else cls = "bg-ink/5 opacity-40 cursor-default";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handlePick(i)}
                      disabled={phase === "answered"}
                      className={`brutal-border px-4 py-3 text-left font-mono text-sm transition-colors ${cls}`}
                    >
                      <span className="opacity-40 mr-2">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                      {phase === "answered" && i === current.answer && <span className="ml-2">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Feedback + Next */}
              {phase === "answered" && (
                <div className="space-y-2">
                  <div className={`brutal-border p-3 font-mono text-xs leading-relaxed ${answers[current.id] ? "bg-acid/20" : "bg-hot/15"}`}>
                    {answers[current.id] ? "✓ Correct! " : "✗ Not quite — "}
                    {current.explain}
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full brutal-border bg-ink text-bone py-3 font-display text-base brutal-press hover:bg-electric-blue transition-colors"
                  >
                    {qIdx < total - 1 ? "NEXT →" : "SEE RESULTS →"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Skip-without-testing link */}
        <div className="px-5 py-3 border-t-4 border-ink flex items-center justify-between">
          <span className="font-mono text-[9px] opacity-40">No hearts lost · just for placement</span>
          <button
            onClick={() => { onUnlock(chapterNumber); }}
            className="font-mono text-[9px] uppercase opacity-40 hover:opacity-80 transition-opacity"
          >
            Skip test &amp; unlock anyway →
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Free mode link — sets context AND navigates ─────────────────────────────
function FreeModeLink({ worldSlug, linkClass }: { worldSlug: string; linkClass: string }) {
  const { setLearnMode } = useLearnMode();
  return (
    <Link
      href={`/world/${worldSlug}?view=free`}
      onClick={() => setLearnMode("classic")}
      className={`brutal-border px-3 py-1 font-display text-xs brutal-press transition-colors ${linkClass}`}
    >
      Free Mode →
    </Link>
  );
}

// ─── Linear chapter progress track ───────────────────────────────────────────
// Horizontal numbered track, each node is an anchor to that chapter's banner
// in the snake. Compact — only one row height.
function ChapterTrack({
  chapters,
  nodes,
  world,
  meta,
  worldSlug,
  onChapterClick,
}: {
  chapters: Chapter[];
  nodes: PathNode[];
  world: WorldId;
  meta: typeof WORLD_META[string];
  worldSlug: string;
  onChapterClick: (chapterSlug: string) => void;
}) {
  return (
    <div className={`border-b-4 border-ink ${world === "dj" ? "bg-[#060b1e]" : "bg-bone"}`}>

      {/* Track row */}
      <div className="px-4 pt-3 pb-2">
        <div className="font-mono text-[9px] uppercase opacity-40 mb-2.5">
          CHAPTERS — tap to scroll
        </div>

        {/* Horizontal scrollable track */}
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex items-center min-w-max gap-0 relative">

            {/* Connecting line behind nodes */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 h-0.5 ${meta.trackLine} pointer-events-none`}
              style={{ left: 16, right: 16 }}
              aria-hidden
            />

            {chapters.map((ch, i) => {
              const chNodes = nodes.filter(n => n.chapterSlug === ch.slug);
              const done = chNodes.filter(n => n.state === "complete" || n.state === "review").length;
              const total = chNodes.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const complete = pct === 100;
              const started = done > 0 && !complete;
              const emoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";

              const nodeClass = complete
                ? meta.trackDone
                : started
                ? meta.trackPartial
                : meta.trackEmpty;

              return (
                <div key={ch.slug} className="flex items-center">
                  {/* Gap between nodes — connection implied by the line */}
                  {i > 0 && <div className="w-5 shrink-0" />}

                  {/* Track node — click scrolls to that chapter */}
                  <button
                    onClick={() => onChapterClick(ch.slug)}
                    title={`${ch.title} — ${complete ? "done" : started ? `${pct}%` : "not started"}`}
                    className={`brutal-border w-11 h-11 flex flex-col items-center justify-center shrink-0 brutal-press transition-all hover:scale-110 relative z-10 ${nodeClass}`}
                  >
                    <span className="text-base leading-none">{complete ? "✓" : emoji}</span>
                    <span className="font-mono text-[7px] opacity-60 mt-0.5 leading-none">
                      {String(ch.number).padStart(2, "0")}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chapter names row — small labels under the track */}
        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <div className="flex items-start min-w-max gap-0">
            {chapters.map((ch, i) => (
              <div key={ch.slug} className="flex items-start">
                {i > 0 && <div className="w-5 shrink-0" />}
                <button
                  onClick={() => onChapterClick(ch.slug)}
                  className={`w-11 text-center font-mono text-[7px] leading-tight opacity-45 hover:opacity-80 transition-opacity ${world === "dj" ? "text-bone" : "text-ink"}`}
                >
                  {ch.title.split(" ").slice(0, 2).join(" ")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mode indicator + switch */}
      <div className={`border-t-2 ${world === "dj" ? "border-bone/10" : "border-ink/10"} px-4 py-2.5 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🌊</span>
          <span className={`font-display text-xs ${world === "dj" ? "text-bone/70" : "text-ink/70"}`}>
            Flow Mode
          </span>
          <span className={`font-mono text-[8px] uppercase ${world === "dj" ? "text-bone/35" : "text-ink/35"}`}>
            · sequential · hearts on
          </span>
        </div>
        <FreeModeLink worldSlug={worldSlug} linkClass={meta.freeModeLinkClass} />
      </div>
    </div>
  );
}

// ─── World hero — solid color, no images ──────────────────────────────────────
function WorldHero({
  world, meta, done, total, pct, rank,
  streakDays, xp, gems,
}: {
  world: WorldId; meta: typeof WORLD_META[string];
  done: number; total: number; pct: number; rank: string;
  streakDays: number; xp: number; gems: number;
}) {
  return (
    <div className={`${meta.heroBg} ${meta.textColor} ${meta.heroBorder} relative overflow-hidden`}>
      {/* Deco */}
      <div className="absolute top-4 right-44 w-11 h-11 opacity-[0.18] float pointer-events-none" aria-hidden style={{ animationDelay: "0.5s" }}>
        <Image src={meta.deco1} alt="" fill className="object-contain" />
      </div>
      <div className="absolute bottom-6 right-10 w-14 h-14 opacity-[0.12] spin-slow pointer-events-none" aria-hidden>
        <Image src={meta.deco2} alt="" fill className="object-contain" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-5 pb-7 md:pt-7 md:pb-9">
        <Link href="/worlds" className={`font-mono text-[10px] uppercase opacity-55 hover:opacity-90 block mb-4 transition-opacity`}>
          ← ALL WORLDS
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl md:text-6xl leading-none">{meta.emoji}</span>
              <div>
                <h1 className="font-display text-4xl md:text-5xl leading-none">{meta.title.toUpperCase()}</h1>
                <p className="font-mono text-[10px] uppercase opacity-65 mt-1">{meta.tagline}</p>
              </div>
            </div>

            {/* Progress */}
            <div className={`h-2.5 brutal-border overflow-hidden mb-1.5 max-w-sm ${world === "dj" ? "bg-bone/10" : "bg-ink/12"}`}>
              <div
                className={`h-full transition-all duration-700 ${world === "dj" ? "bg-volt" : "bg-ink"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center gap-3 font-mono text-[9px] uppercase opacity-60 mb-4">
              <span>{done}/{total}</span>
              <span>{pct}%</span>
              <span>{rank}</span>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-1.5">
              {[`🔥 ${streakDays}d`, `${xp} XP`, `💎 ${gems}`].map(label => (
                <div key={label} className={`brutal-border px-2.5 py-1 font-mono text-[9px] uppercase ${world === "dj" ? "bg-bone/10 text-bone" : "bg-ink/10 text-ink"}`}>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Cat + deco cats */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="w-20 h-20 md:w-28 md:h-28 wiggle" style={{ filter: "drop-shadow(4px 4px 0 rgba(0,0,0,0.2))" }} aria-hidden>
              <Image src={meta.catMain} alt="" width={112} height={112} className="w-full h-full object-contain" />
            </div>
            <div className="flex gap-1.5">
              <div className="w-7 h-7 float opacity-65" style={{ animationDelay: "0.4s" }} aria-hidden>
                <Image src={meta.catDeco1} alt="" width={28} height={28} className="w-full h-full object-contain" style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.18))" }} />
              </div>
              <div className="w-6 h-6 float opacity-55" style={{ animationDelay: "1.3s" }} aria-hidden>
                <Image src={meta.catDeco2} alt="" width={24} height={24} className="w-full h-full object-contain" style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.15))" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
              <Image src={meta.catMain} alt="" width={64} height={64} className="object-contain" />
            </div>
            <div className={`transition-all duration-[400ms] ease-out ${bubbleVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}>
              <div className="font-display text-xl leading-tight">{w.headline}</div>
              <div className="font-mono text-[10px] uppercase opacity-55 mt-0.5">Your guide for this world</div>
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

// ─── Chapter banner with skip button ─────────────────────────────────────────
function ChapterBanner({
  chapter, chapterIndex, world, meta,
  quip, isUnlocked, onSkipClick,
}: {
  chapter: Chapter; chapterIndex: number; world: WorldId;
  meta: typeof WORLD_META[string]; quip: string;
  isUnlocked: boolean; onSkipClick: () => void;
}) {
  const chEmoji = CHAPTER_EMOJIS[chapter.slug] ?? "📖";
  const chNum = String(chapterIndex + 1).padStart(2, "0");

  return (
    <div className={`flex justify-center my-10`} id={`chapter-${chapter.slug}`}>
      <div className={`brutal-border max-w-[320px] w-full brutal-shadow overflow-hidden ${meta.chapterBannerBg} ${meta.chapterBannerBorder} ${meta.textColor}`}>
        {/* Main content */}
        <div className="px-5 pt-4 pb-3">
          <div className="font-mono text-[9px] uppercase opacity-55 mb-1">CH {chNum}</div>
          <div className="text-5xl mb-2">{chEmoji}</div>
          <div className="font-display text-xl leading-tight">{chapter.title}</div>
          <div className="font-mono text-[10px] opacity-55 mt-1 leading-snug uppercase">{chapter.tagline}</div>
        </div>

        {/* Cat quip */}
        <div className={`px-4 py-2.5 flex items-center gap-2 font-mono text-[10px] italic border-t-2 border-current/15 ${
          world === "dj" ? "bg-volt/8 text-bone" : "bg-ink/5 text-ink"
        }`}>
          <span className="shrink-0">🐱</span>
          <span className="opacity-70">&ldquo;{quip}&rdquo;</span>
        </div>

        {/* Skip / test button — only on locked chapters */}
        {!isUnlocked && (
          <div className="px-4 py-3 border-t-2 border-current/15 flex items-center justify-between gap-3">
            <span className={`font-mono text-[8px] uppercase opacity-45`}>
              Know this already?
            </span>
            <button
              onClick={onSkipClick}
              className={`brutal-border px-3 py-1.5 font-display text-xs brutal-press transition-colors ${meta.skipBtnClass}`}
            >
              Skip chapter →
            </button>
          </div>
        )}
        {isUnlocked && chapterIndex > 0 && (
          <div className="px-4 py-2.5 border-t-2 border-current/15">
            <span className={`font-mono text-[8px] uppercase opacity-40`}>🔓 Chapter unlocked via test</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function WorldPathClient({ worldSlug, embedded = false }: { worldSlug: string; embedded?: boolean }) {
  const world = worldSlug as WorldId;
  const meta = WORLD_META[world];
  const { progress, setPlacement } = useProgress();
  const { learnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const strengths = progress.lessonStrengths;
  const unlockedChapter = progress.unlockedChapter ?? 1;

  // Track which chapter-jump modal is open (by chapterIndex, 1-based)
  const [jumpModalChapter, setJumpModalChapter] = useState<number | null>(null);

  // Refs map for scrolling to chapter banners
  const chapterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToChapter = useCallback((chapterSlug: string) => {
    const el = document.getElementById(`chapter-${chapterSlug}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

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

  const handleUnlock = (chapterNumber: number) => {
    setPlacement(chapterNumber);
    setJumpModalChapter(null);
    // Scroll to the first node of the newly unlocked chapter
    const ch = chapters[chapterNumber - 1];
    if (ch) {
      setTimeout(() => {
        const el = document.getElementById(`chapter-${ch.slug}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  };

  return (
    <div className={`min-h-screen ${meta.bg}`}>

      {/* Hero — hidden when embedded in /learn (has its own header) */}
      {!embedded && (
        <WorldHero
          world={world} meta={meta}
          done={done} total={total} pct={pct} rank={rank.name}
          streakDays={progress.streakDays} xp={progress.xp} gems={progress.gems}
        />
      )}

      {/* Linear chapter track — hidden when embedded */}
      {!embedded && (
        <ChapterTrack
          chapters={chapters} nodes={nodes}
          world={world} meta={meta}
          worldSlug={worldSlug}
          onChapterClick={scrollToChapter}
        />
      )}

      {/* Snake path */}
      <div className="max-w-sm mx-auto px-4 pt-10 pb-32">

        {isNewUser && firstAvailableSlug && (
          <AnimatedCatIntro meta={meta} world={world} firstSlug={firstAvailableSlug} />
        )}

        {nodes.map((node, idx) => {
          const chapter = chapters.find(c => c.slug === node.chapterSlug);
          const quip = (CHAPTER_CAT_QUIPS[world] ?? [])[node.chapterIndex] ?? "Let's go!";
          // Chapter is "unlocked" if unlockedChapter > chapterIndex+1 or chapterIndex === 0
          const isChapterUnlocked = (node.chapterIndex + 1) < unlockedChapter || node.chapterIndex === 0;

          return (
            <div key={node.slug}>
              {/* Chapter banner with skip button */}
              {node.isFirstInChapter && chapter && (
                <ChapterBanner
                  chapter={chapter}
                  chapterIndex={node.chapterIndex}
                  world={world}
                  meta={meta}
                  quip={quip}
                  isUnlocked={isChapterUnlocked}
                  onSkipClick={() => setJumpModalChapter(node.chapterIndex + 1)}
                />
              )}

              {/* Node */}
              <div className={`relative flex mb-12 ${
                node.side === "left"  ? "justify-start pl-8"  :
                node.side === "right" ? "justify-end pr-8"    :
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
              <Image src={meta.catMain} alt="" width={100} height={100} className="drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)] animate-bounce-bob" />
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
            <div className="font-mono text-sm opacity-65 mt-2">You finished {meta.title}. Incredible.</div>
            <Link href="/worlds" className="mt-5 brutal-border bg-ink text-bone px-7 py-3.5 font-display text-base inline-block brutal-press hover:bg-electric-blue transition-colors">
              EXPLORE OTHER WORLDS →
            </Link>
          </div>
        )}
      </div>

      {/* Chapter jump modal */}
      {jumpModalChapter !== null && (
        <MiniPlacementTest
          world={world}
          chapterNumber={jumpModalChapter}
          meta={meta}
          onUnlock={handleUnlock}
          onClose={() => setJumpModalChapter(null)}
        />
      )}
    </div>
  );
}

// ─── Lesson Node ──────────────────────────────────────────────────────────────
function LessonNode({ node, meta }: { node: PathNode; meta: typeof WORLD_META[string] }) {
  const Wrap = ({ children, href, className, title }: {
    children: ReactNode; href?: string; className?: string; title?: string;
  }) => {
    const inner = <div className="flex flex-col items-center gap-2 group" title={title}>{children}</div>;
    if (href) return <a href={href} className={`block brutal-press ${className ?? ""}`}>{inner}</a>;
    return <div className={className}>{inner}</div>;
  };

  const Label = ({ text, dim }: { text: string; dim?: boolean }) => (
    <span className={`font-mono text-[10px] uppercase leading-tight text-center max-w-[88px] line-clamp-2 ${dim ? "opacity-20" : "opacity-55"}`}>
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
        <span className="font-mono text-[9px] opacity-85 font-bold">+{node.xp} XP</span>
      </div>
      <Label text={node.title} />
    </Wrap>
  );
}
