"use client";
/**
 * LessonPlayer — Duolingo-style 5-8 screen lesson engine.
 *
 * Screen types (from types.ts):
 *   hook     → full-bleed emoji + bold headline, tap anywhere to continue
 *   concept  → title + body (≤30 words) + optional key-fact callout + optional visual
 *   interact → full simulator with a short prompt
 *   quiz     → one question, 4 options, immediate colour feedback + explanation
 *   summary  → 3 bullet recap + XP award + confetti
 *
 * Features:
 *   • Green progress bar across top (fills as screens advance)
 *   • Heart counter top-right (CCD mode only)
 *   • Wrong answer loses a heart, shows shake animation
 *   • NEXT button only appears after answering / completing interaction
 *   • Summary triggers CompletionModal
 *   • "Classic" tab escape hatch links back to /mission/[slug]
 */

import { useState, useRef, useCallback, useEffect } from "react";
import type { LessonScreen, Mission } from "@/content/types";
import { Simulator } from "@/components/sims/Simulator";
import { InlineVisual, DiagramVisual } from "@/components/LessonVisuals";
import { useProgress, MAX_HEARTS } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { playCorrect, playWrong, playFanfare } from "@/lib/audio";
import { rankFor } from "@/lib/ranks";
import Link from "next/link";

// ─── tiny visual helpers ──────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="h-3 brutal-border bg-bone overflow-hidden">
      <div
        className="h-full bg-acid transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function HeartsRow({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: MAX_HEARTS }).map((_, i) => (
        <span key={i} className={`text-lg leading-none ${i < count ? "text-hot" : "opacity-20"}`}>
          ♥
        </span>
      ))}
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    left: `${(i / 30) * 100}%`,
    delay: `${(i * 0.04).toFixed(2)}s`,
    dur: `${(0.7 + (i % 5) * 0.12).toFixed(2)}s`,
    color: ["#C6FF00", "#FF2D2D", "#7B2FFF", "#FFB800", "#111"][i % 5],
    size: `${6 + (i % 5)}px`,
  }));
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-48 overflow-hidden" aria-hidden>
      <style>{`@keyframes cfall{0%{transform:translateY(-8px) rotate(0deg);opacity:1}100%{transform:translateY(220px) rotate(600deg);opacity:0}}`}</style>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: p.left, top: 0,
          width: p.size, height: p.size, background: p.color,
          animation: `cfall ${p.dur} ${p.delay} ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

// ─── individual screen renderers ─────────────────────────────────────────────

function HookScreen({ screen, onNext }: { screen: Extract<LessonScreen, { kind: "hook" }>; onNext: () => void }) {
  return (
    <button
      onClick={onNext}
      className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-ink text-bone brutal-border brutal-press"
      aria-label="Tap to continue"
    >
      <div className="text-7xl mb-6 select-none">{screen.emoji}</div>
      <h2 className="font-display text-4xl md:text-5xl leading-none mb-4">{screen.headline}</h2>
      <p className="font-mono text-base opacity-70 max-w-xs leading-relaxed">{screen.subtext}</p>
      <div className="mt-8 font-mono text-[10px] uppercase opacity-40 animate-bounce">TAP TO CONTINUE</div>
    </button>
  );
}

function ConceptScreen({ screen, onNext }: { screen: Extract<LessonScreen, { kind: "concept" }>; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <div className="brutal-border bg-ink text-bone p-5">
        <h2 className="font-display text-3xl md:text-4xl leading-tight">{screen.title}</h2>
      </div>

      {screen.visual && screen.visual !== "none" && (
        <InlineVisual type={screen.visual} />
      )}

      <div className="brutal-border bg-bone p-5">
        <p className="font-mono text-base md:text-lg leading-relaxed">{screen.body}</p>
      </div>

      {screen.keyFact && (
        <div className="brutal-border bg-acid text-ink px-5 py-4">
          <div className="font-mono text-[10px] uppercase opacity-60 mb-1">KEY FACT</div>
          <div className="font-display text-xl">{screen.keyFact}</div>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow"
      >
        GOT IT →
      </button>
    </div>
  );
}

function InteractScreen({
  screen,
  onNext,
}: {
  screen: Extract<LessonScreen, { kind: "interact" }>;
  onNext: () => void;
}) {
  const [interacted, setInteracted] = useState(false);

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-volt text-bone p-4">
        <div className="font-mono text-[10px] uppercase opacity-70 mb-1">TRY IT</div>
        <div className="font-display text-xl">{screen.prompt}</div>
      </div>

      {/* Wrap simulator — first click counts as "interacted" */}
      <div onClick={() => !interacted && setInteracted(true)}>
        <Simulator type={screen.sim} preset={screen.preset} />
      </div>

      <button
        onClick={onNext}
        disabled={!interacted}
        className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {interacted ? "NEXT →" : "INTERACT FIRST ↑"}
      </button>
    </div>
  );
}

type QuizPhase = "picking" | "correct" | "wrong";

function QuizScreen({
  screen,
  onCorrect,
  onWrong,
  onNext,
}: {
  screen: Extract<LessonScreen, { kind: "quiz" }>;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
}) {
  const [phase, setPhase] = useState<QuizPhase>("picking");
  const [picked, setPicked] = useState<number | null>(null);
  const [shake, setShake] = useState(false);

  const pick = (idx: number) => {
    if (phase !== "picking") return;
    setPicked(idx);
    if (idx === screen.answer) {
      setPhase("correct");
      playCorrect();
      onCorrect();
    } else {
      setPhase("wrong");
      playWrong();
      onWrong();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className={`space-y-4 ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>

      <div className="brutal-border bg-bone p-5">
        <div className="font-mono text-[10px] uppercase opacity-60 mb-2">QUESTION</div>
        <div className="font-display text-xl md:text-2xl leading-snug">{screen.q}</div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {screen.options.map((opt, i) => {
          let cls = "bg-bone hover:bg-sun/40 brutal-press cursor-pointer";
          if (phase !== "picking") {
            if (i === screen.answer) cls = "bg-acid text-ink font-bold";
            else if (i === picked && phase === "wrong") cls = "bg-hot text-bone";
            else cls = "bg-bone opacity-40 cursor-default";
          }
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={phase !== "picking"}
              className={`brutal-border px-4 py-4 text-left font-mono text-sm transition-colors ${cls}`}
            >
              <span className="opacity-40 mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
              {phase !== "picking" && i === screen.answer && <span className="ml-2">✓</span>}
            </button>
          );
        })}
      </div>

      {phase !== "picking" && (
        <div className={`brutal-border p-4 ${phase === "correct" ? "bg-volt text-bone" : "bg-hot text-bone"}`}>
          <div className="font-display text-2xl mb-1">
            {phase === "correct" ? "✓ CORRECT!" : "✗ NOT QUITE"}
          </div>
          {phase === "wrong" && (
            <div className="font-mono text-xs opacity-80 mb-1">
              Correct answer: <strong>{screen.options[screen.answer]}</strong>
            </div>
          )}
          <div className="font-mono text-sm leading-relaxed border-t border-current/20 pt-2 mt-1">
            {screen.explain}
          </div>
        </div>
      )}

      {phase !== "picking" && (
        <button
          onClick={onNext}
          className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow"
        >
          NEXT →
        </button>
      )}
    </div>
  );
}

function SummaryScreen({
  screen,
  mission,
  xpEarned,
  nextSlug,
  onClose,
}: {
  screen: Extract<LessonScreen, { kind: "summary" }>;
  mission: Mission;
  xpEarned: number;
  nextSlug?: string;
  onClose: () => void;
}) {
  useEffect(() => { playFanfare(); }, []);

  return (
    <div className="relative space-y-4">
      <Confetti />

      <div className="brutal-border bg-acid text-ink p-6 text-center brutal-shadow">
        <div className="font-display text-5xl mb-2">🎉</div>
        <div className="font-display text-4xl">LESSON COMPLETE</div>
        <div className="font-mono text-sm opacity-70 mt-1">{mission.title}</div>
      </div>

      <div className="brutal-border bg-ink text-bone p-5 flex items-center gap-4">
        <div className="brutal-border bg-acid text-ink px-5 py-3 font-display text-4xl shrink-0">
          +{xpEarned}
        </div>
        <div>
          <div className="font-display text-lg">XP EARNED</div>
          <div className="font-mono text-xs opacity-60">First completion only</div>
        </div>
      </div>

      {screen.badge && (
        <div className="brutal-border bg-volt text-bone p-4 flex items-center gap-3">
          <span className="text-3xl">🏅</span>
          <div>
            <div className="font-mono text-[10px] uppercase opacity-70">Badge unlocked</div>
            <div className="font-display text-xl">{screen.badge.name}</div>
          </div>
        </div>
      )}

      <div className="brutal-border bg-bone p-5">
        <div className="font-mono text-[10px] uppercase opacity-60 mb-3">YOU LEARNED</div>
        <ul className="space-y-2">
          {screen.learned.map((item, i) => (
            <li key={i} className="flex items-start gap-2 font-mono text-sm">
              <span className="text-acid font-bold shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        {nextSlug && (
          <Link
            href={`/learn/${nextSlug}`}
            className="flex-1 brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press text-center"
          >
            NEXT LESSON →
          </Link>
        )}
        <button
          onClick={onClose}
          className="brutal-border bg-bone px-5 py-4 font-mono text-xs uppercase brutal-press"
        >
          Back to path
        </button>
      </div>
    </div>
  );
}

function DiagramScreen({ screen, onNext }: { screen: Extract<LessonScreen, { kind: "diagram" }>; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <DiagramVisual screen={screen} />
      <button
        onClick={onNext}
        className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow"
      >
        GOT IT →
      </button>
    </div>
  );
}

// ─── main LessonPlayer ────────────────────────────────────────────────────────

interface Props {
  mission: Mission;
  nextSlug?: string;
  isReview?: boolean;
  onComplete: () => void;
  onWrong?: () => void;
  onCorrect?: () => void;
}

export function LessonPlayer({ mission, nextSlug, isReview, onComplete, onWrong, onCorrect }: Props) {
  const screens = mission.screens ?? [];
  const [screenIdx, setScreenIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const { progress, completeMission, reviewMission, loseHeart } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const alreadyDone = !!progress.completedMissions[mission.slug];
  const xpEarned = alreadyDone ? 0 : mission.xp;

  const currentScreen = screens[screenIdx];
  const total = screens.length;

  // Persist lesson progress to sessionStorage — survives page refresh
  const SESSION_KEY = `lesson_progress_${mission.slug}`;

  // Restore on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const { idx, correct } = JSON.parse(saved);
        if (typeof idx === 'number' && idx > 0 && idx < screens.length) {
          setScreenIdx(idx);
          setCorrectCount(correct ?? 0);
        }
      }
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save on every screen advance
  useEffect(() => {
    if (done) {
      try { sessionStorage.removeItem(SESSION_KEY); } catch {}
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ idx: screenIdx, correct: correctCount }));
    } catch {}
  }, [screenIdx, correctCount, done, SESSION_KEY]);

  const advance = useCallback(() => {
    if (screenIdx < total - 1) {
      setScreenIdx(idx => idx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Lesson complete
      const score = correctCount / Math.max(1, screens.filter(s => s.kind === "quiz").length);
      if (isReview) {
        reviewMission(mission.slug, score);
      } else {
        completeMission(mission.slug, mission.xp, score, mission.badge?.slug);
      }
      setDone(true);
      onComplete();
    }
  }, [screenIdx, total, correctCount, screens, mission, isReview, completeMission, reviewMission, onComplete]);

  const handleCorrect = () => { setCorrectCount(c => c + 1); onCorrect?.(); };
  const handleWrong = () => {
    if (learnMode === "ccd") loseHeart();
    onWrong?.();
  };

  // No screens — LessonPageClient handles this case with InlineClassicLesson fallback
  if (!screens.length) return null;

  const summaryScreen = done ? screens.find(s => s.kind === "summary") as Extract<LessonScreen, { kind: "summary" }> | undefined : undefined;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <Link href={`/learn/${mission.world === "foundations" ? "fundamentals" : mission.world}`}
          className="brutal-border bg-bone px-3 py-2 font-mono text-[10px] uppercase brutal-press shrink-0">
          ✕
        </Link>
        <div className="flex-1">
          <ProgressBar current={screenIdx} total={total} />
        </div>
        {learnMode === "ccd" && <HeartsRow count={progress.hearts} />}
      </div>

      {/* Mode indicator + Classic escape */}
      <div className="flex items-center justify-between">
        <div className="brutal-border bg-volt text-bone px-2.5 py-1 font-mono text-[9px] uppercase">
          🔒 PATH MODE · ♥ {progress.hearts}
        </div>
        <button
          onClick={() => { setLearnMode("classic"); }}
          className="font-mono text-[9px] uppercase opacity-40 hover:opacity-70 underline underline-offset-2"
        >
          Switch to Classic →
        </button>
      </div>

      {/* Screen renderer — key={screenIdx} ensures React remounts each screen
          fresh, resetting all internal state (quiz phase, interacted flag, etc.) */}
      {done && summaryScreen ? (
        <SummaryScreen
          key="summary-done"
          screen={summaryScreen}
          mission={mission}
          xpEarned={xpEarned}
          nextSlug={nextSlug}
          onClose={onComplete}
        />
      ) : currentScreen?.kind === "hook" ? (
        <HookScreen key={screenIdx} screen={currentScreen} onNext={advance} />
      ) : currentScreen?.kind === "concept" ? (
        <ConceptScreen key={screenIdx} screen={currentScreen} onNext={advance} />
      ) : currentScreen?.kind === "interact" ? (
        <InteractScreen key={screenIdx} screen={currentScreen} onNext={advance} />
      ) : currentScreen?.kind === "diagram" ? (
        <DiagramScreen key={screenIdx} screen={currentScreen} onNext={advance} />
      ) : currentScreen?.kind === "quiz" ? (
        <QuizScreen
          key={screenIdx}
          screen={currentScreen}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          onNext={advance}
        />
      ) : currentScreen?.kind === "summary" ? (
        <SummaryScreen
          key={screenIdx}
          screen={currentScreen}
          mission={mission}
          xpEarned={xpEarned}
          nextSlug={nextSlug}
          onClose={onComplete}
        />
      ) : null}

      {/* Screen counter */}
      {!done && (
        <div className="text-center font-mono text-[9px] uppercase opacity-30">
          {screenIdx + 1} / {total}
        </div>
      )}
    </div>
  );
}
