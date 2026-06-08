"use client";
/**
 * LessonPlayer — Duolingo-style 5-8 screen lesson engine.
 *
 * Fixes applied:
 *   #5  — Back button (✕) uses getMissionContext for correct world route
 *   #7  — Breadcrumb bar: World › Chapter › Path › Mission N of M
 *   #8  — Quiz screens show "Question N of M" + hearts warning on first quiz
 *   #9  — First-time hearts explainer modal, −1 heart message on wrong answer
 *   #10 — Mode indicator only shows in PATH mode (not in classic fallback)
 *   #11 — "Save progress" nudge on SummaryScreen for logged-out users
 *   #EB — Error boundary wraps entire lesson to catch bad content data gracefully
 */

import { useState, useRef, useCallback, useEffect, Component, type ReactNode, type ErrorInfo } from "react";
import type { LessonScreen, Mission } from "@/content/types";
import { Simulator } from "@/components/sims/Simulator";
import { InlineVisual, DiagramVisual } from "@/components/LessonVisuals";
import { useProgress, MAX_HEARTS } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { useAuth } from "@/lib/auth";
import { playCorrect, playWrong, playFanfare } from "@/lib/audio";
import { getMissionContext } from "@/lib/missionContext";
import { track } from "@/lib/analytics";
import { ConceptAudioButton } from "@/components/ConceptAudio";
import { AudioIdScreen, MatchScreen, TypeAnswerScreen, SequenceScreen } from "@/components/ExerciseScreens";
import Link from "next/link";
import Image from "next/image";

const HOOK_BG = "https://v3b.fal.media/files/b/0a9d85ab/DsI5ZMF4jHgvpcE6JERhJ.jpg";
const COMPLETION_BG = "https://v3b.fal.media/files/b/0a9d85ab/gJ3EpG-ChAh0FOsmJgoNq.jpg";

// ─── Error boundary ───────────────────────────────────────────────────────────

class LessonErrorBoundary extends Component<
  { children: ReactNode; missionSlug: string },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[LessonPlayer] Content error in mission", this.props.missionSlug, error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
          <div className="brutal-border bg-hot text-bone p-6">
            <div className="font-display text-3xl mb-2">LESSON ERROR</div>
            <div className="font-mono text-sm opacity-80 mb-4 leading-relaxed">
              This lesson has malformed content data. The error has been logged.
            </div>
            <div className="font-mono text-xs opacity-60 brutal-border bg-bone/10 p-3 leading-relaxed break-all">
              {(this.state.error as Error).message}
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => this.setState({ error: null })}
              className="brutal-border bg-acid text-ink px-5 py-3 font-display text-xl brutal-press"
            >
              ↺ Retry
            </button>
            <Link
              href="/learn"
              className="brutal-border bg-bone text-ink px-5 py-3 font-display text-xl brutal-press"
            >
              ← Back to Paths
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── tiny visual helpers ──────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="h-3 brutal-border bg-bone overflow-hidden">
      <div
        className="h-full bg-acid transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, boxShadow: '0 0 8px #C6FF00' }}
      />
    </div>
  );
}

function HeartsRow({ count }: { count: number }) {
  // Track which heart index just got lost so we can animate it
  const prevCount = useRef(count);
  const [crumbling, setCrumbling] = useState<number | null>(null);

  useEffect(() => {
    if (count < prevCount.current) {
      // The heart at index `count` just disappeared (0-indexed)
      setCrumbling(count);
      const t = setTimeout(() => setCrumbling(null), 600);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <div className="flex items-center gap-0.5" title={`${count}/${MAX_HEARTS} hearts — wrong answers cost 1 heart`}>
      {Array.from({ length: MAX_HEARTS }).map((_, i) => (
        <span
          key={i}
          className={`text-lg leading-none transition-all select-none
            ${i < count ? "text-hot" : "opacity-20"}
            ${crumbling === i ? "animate-heart-crumble inline-block" : ""}`}
        >
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

// ─── XP Float — "+N XP" rises and fades after a correct answer ───────────────

function XpFloat({ xp, active }: { xp: number; active: boolean }) {
  if (!active || xp <= 0) return null;
  return (
    <span
      aria-hidden
      className="absolute -top-6 left-1/2 -translate-x-1/2 font-display text-base text-acid animate-xp-float whitespace-nowrap select-none"
    >
      +{xp} XP
    </span>
  );
}

// ─── Hearts explainer modal — shown once per session ─────────────────────────

const HEARTS_SEEN_KEY = "ccd.hearts_explained";

function HeartsExplainerModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Hearts explained">
      <div className="brutal-border bg-bone max-w-sm w-full brutal-shadow">
        <div className="brutal-border border-x-0 border-t-0 bg-acid text-ink px-5 py-4">
          <div className="font-display text-3xl">🗺 PATH MODE HEARTS</div>
        </div>
        <div className="p-5 space-y-3 font-mono text-sm leading-relaxed">
          <p>You have <strong>5 hearts</strong>. Each wrong answer costs <strong>1 heart</strong>.</p>
          <p>Hearts refill at <strong>1 per 4 hours</strong>. Run out and you&apos;ll need to wait — or switch to <strong>Explore Mode</strong> (no hearts) to keep going.</p>
          <p className="opacity-60 text-xs">Switch modes anytime using the toggle in the header.</p>
        </div>
        <div className="p-4">
          <button
            onClick={onDismiss}
            className="w-full brutal-border bg-acid text-ink py-3 font-display text-xl brutal-press"
          >
            GOT IT — LET&apos;S GO →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── individual screen renderers ─────────────────────────────────────────────

function HookScreen({ screen, onNext }: { screen: Extract<LessonScreen, { kind: "hook" }>; onNext: () => void }) {
  return (
    <button
      onClick={onNext}
      className="w-full min-h-[75vh] flex flex-col items-center justify-center text-center p-8 bg-ink text-bone brutal-border brutal-press relative overflow-hidden"
      aria-label="Tap to continue"
    >
      {/* Background image */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={HOOK_BG}
          alt=""
          fill
          className="object-cover opacity-30 mix-blend-luminosity"
          sizes="100vw"
        />
      </div>
      {/* Pulsing acid bottom border animation */}
      <style>{`@keyframes pulse-border{0%,100%{opacity:1;box-shadow:0 4px 0 0 #C6FF00,0 0 20px #C6FF00}50%{opacity:0.5;box-shadow:0 4px 0 0 #C6FF00,0 0 40px #C6FF00}}`}</style>
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-acid" style={{ animation: 'pulse-border 2s ease-in-out infinite' }} />
      <div className="relative z-10">
        <div className="text-8xl mb-6 select-none">{screen.emoji}</div>
        <h2 className="font-display text-5xl md:text-7xl leading-none mb-4">{screen.headline}</h2>
        <p className="font-mono text-base opacity-70 max-w-xs leading-relaxed">{screen.subtext}</p>
        <div className="mt-8 font-mono text-[10px] uppercase opacity-40 animate-bounce">TAP TO CONTINUE</div>
      </div>
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
        <InlineVisual
          type={screen.visual}
          bpm={screen.visualProps?.bpm}
          minor={screen.visualProps?.minor}
          root={screen.visualProps?.root}
          scaleLabel={screen.visualProps?.scaleLabel}
          signalNodes={screen.visualProps?.signalNodes}
        />
      )}

      <div className="brutal-border bg-bone p-5">
        <p className="font-mono text-sm md:text-base leading-relaxed">{screen.body}</p>
      </div>

      {screen.keyFact && (
        <div className="brutal-border bg-acid text-ink px-5 py-4">
          <div className="font-mono text-[10px] uppercase opacity-60 mb-1">KEY FACT</div>
          <div className="font-display text-xl">{screen.keyFact}</div>
        </div>
      )}

      {/* Audio-first: always show a "hear it" button */}
      <div className="flex items-center gap-3">
        <ConceptAudioButton visual={screen.visual} />
        <span className="font-mono text-[9px] uppercase opacity-40">tap to hear an example</span>
      </div>

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
  quizNumber,
  quizTotal,
  isPathMode,
  xpPerCorrect,
  missionSlug,
  onCorrect,
  onWrong,
  onNext,
}: {
  screen: Extract<LessonScreen, { kind: "quiz" }>;
  quizNumber: number;
  quizTotal: number;
  isPathMode: boolean;
  xpPerCorrect?: number;
  missionSlug: string;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
}) {
  const [phase, setPhase] = useState<QuizPhase>("picking");
  const [picked, setPicked] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [showXpFloat, setShowXpFloat] = useState(false);

  // Keyboard shortcuts: 1-4 to pick, Enter to advance
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const n = parseInt(e.key);
      if (n >= 1 && n <= screen.options.length && phase === "picking") {
        pick(n - 1);
        return;
      }
      if ((e.key === "Enter" || e.key === " ") && phase !== "picking") {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, screen.options.length]);

  const pick = (idx: number) => {
    if (phase !== "picking") return;
    setPicked(idx);
    if (idx === screen.answer) {
      setPhase("correct");
      playCorrect();
      track("quiz_answered", {
        missionSlug: missionSlug,
        questionIndex: quizNumber,
        correct: true,
        isPathMode,
      });
      onCorrect();
      // Trigger XP float animation
      if (xpPerCorrect && xpPerCorrect > 0) {
        setShowXpFloat(true);
        setTimeout(() => setShowXpFloat(false), 950);
      }
    } else {
      setPhase("wrong");
      playWrong();
      track("quiz_answered", {
        missionSlug: missionSlug,
        questionIndex: quizNumber,
        correct: false,
        isPathMode,
      });
      onWrong();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className={`space-y-4 ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>

      <div className="brutal-border bg-bone p-5">
        {/* Question counter + hearts warning */}
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-[10px] uppercase opacity-60">
            QUESTION {quizNumber} OF {quizTotal}
          </div>
          {isPathMode && phase === "picking" && (
            <div className="font-mono text-[9px] uppercase opacity-50 text-hot">
              ❤️ wrong = −1 heart
            </div>
          )}
        </div>
        <div className="font-display text-xl md:text-2xl leading-snug">{screen.q}</div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2" role="group" aria-label="Answer options">
        {screen.options.map((opt, i) => {
          let cls = "bg-bone hover:bg-sun/40 brutal-press cursor-pointer";
          let leftBorder = "";
          if (phase !== "picking") {
            if (i === screen.answer) {
              cls = "bg-acid text-ink font-bold";
              leftBorder = "border-l-4 border-l-[#C6FF00]";
            } else if (i === picked && phase === "wrong") {
              cls = "bg-hot text-bone";
              leftBorder = "border-l-4 border-l-[#FF2D2D]";
            } else cls = "bg-bone opacity-40 cursor-default";
          }
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={phase !== "picking"}
              data-kbd-hint={phase === "picking" ? String(i + 1) : undefined}
              aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}${phase !== "picking" ? (i === screen.answer ? " (correct)" : "") : ""}`}
              className={`relative brutal-border px-4 py-5 text-left font-mono text-sm transition-colors flex items-center gap-3 ${cls} ${leftBorder}`}
            >
              <span className={`brutal-border w-8 h-8 flex items-center justify-center font-display text-sm shrink-0 ${phase === "picking" ? "bg-ink/10" : i === screen.answer ? "bg-ink/20" : "bg-bone/20"}`} aria-hidden>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {phase !== "picking" && i === screen.answer && <span aria-hidden>✓</span>}
              {/* XP float anchored to the correct answer button */}
              {i === screen.answer && (
                <XpFloat xp={xpPerCorrect ?? 0} active={showXpFloat} />
              )}
            </button>
          );
        })}
      </div>

      {phase !== "picking" && (
        <div
          className={`brutal-border p-4 ${phase === "correct" ? "bg-volt text-bone" : "bg-hot text-bone"}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="font-display text-2xl mb-1">
            {phase === "correct" ? "✓ CORRECT!" : "✗ NOT QUITE"}
          </div>
          {phase === "wrong" && (
            <>
              <div className="font-mono text-xs opacity-80 mb-1">
                Correct answer: <strong>{screen.options[screen.answer]}</strong>
              </div>
              {isPathMode && (
                <div className="font-mono text-[10px] uppercase opacity-80 mb-1">
                  −1 heart deducted
                </div>
              )}
            </>
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

function AdaptiveDifficultyNudge({ score, missionSlug }: { score: number; missionSlug: string }) {
  if (score >= 0.7) return null; // Good score — no nudge needed
  return (
    <div className="brutal-border bg-sun/30 text-ink p-4 flex items-start gap-3">
      <span className="text-2xl shrink-0">💡</span>
      <div>
        <div className="font-display text-base mb-1">
          {score < 0.4 ? "Tough one! Review recommended." : "Almost there — keep going!"}
        </div>
        <div className="font-mono text-xs opacity-70 leading-relaxed">
          {score < 0.4
            ? "This lesson will come up in your Review queue soon. A second pass always helps."
            : "You got most of it. Try the lesson again for a perfect score and bonus gems."}
        </div>
        {score < 0.4 && (
          <Link
            href="/review"
            className="inline-block brutal-border bg-ink text-bone px-3 py-1.5 font-mono text-[10px] uppercase mt-2 brutal-press"
          >
            Review Session →
          </Link>
        )}
      </div>
    </div>
  );
}

function SummaryScreen({
  screen,
  mission,
  xpEarned,
  nextSlug,
  isLoggedIn,
  correctCount,
  quizTotal,
  onClose,
}: {
  screen: Extract<LessonScreen, { kind: "summary" }>;
  mission: Mission;
  xpEarned: number;
  nextSlug?: string;
  isLoggedIn: boolean;
  correctCount: number;
  quizTotal: number;
  onClose: () => void;
}) {
  useEffect(() => { playFanfare(); }, []);

  return (
    <div className="relative space-y-4">
      <Confetti />

      <div className="brutal-border bg-acid text-ink p-6 text-center brutal-shadow relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(198,255,0,0.3)' }}>
        {/* Completion BG */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src={COMPLETION_BG}
            alt=""
            fill
            className="object-cover opacity-15 mix-blend-luminosity"
            sizes="100vw"
          />
        </div>
        <div className="relative z-10">
          <div className="font-display text-5xl mb-2">🎉</div>
          <div className="font-display text-6xl leading-none">LESSON COMPLETE</div>
          <div className="font-mono text-sm opacity-70 mt-1">{mission.title}</div>
        </div>
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

      {/* Save progress nudge for logged-out users */}
      {!isLoggedIn && (
        <Link
          href="/login"
          className="brutal-border bg-volt text-bone p-4 flex items-start gap-3 hover:opacity-90 transition-opacity block"
        >
          <span className="text-2xl shrink-0">🔒</span>
          <div>
            <div className="font-display text-lg">Save your progress — sign up free</div>
            <div className="font-mono text-xs opacity-80 mt-0.5 leading-relaxed">
              Your XP & completed lessons are stored locally right now. Create a free account to back them up and access from any device.
            </div>
          </div>
        </Link>
      )}

      {/* Adaptive difficulty nudge — shown when score is low */}
      {xpEarned > 0 && screen.learned && (
        <AdaptiveDifficultyNudge score={correctCount / Math.max(1, quizTotal)} missionSlug={mission.slug} />
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

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function LessonBreadcrumb({
  mission,
  missionIndex,
  missionTotal,
}: {
  mission: Mission;
  missionIndex: number;
  missionTotal: number;
}) {
  const ctx = getMissionContext(mission.slug);
  const worldLabel = ctx.worldLabel || "Unknown";
  const chapterTitle = ctx.chapter?.title || null;
  const pathTitle = ctx.path?.title || null;

  return (
    <div className="flex items-center gap-1 flex-wrap font-mono text-[9px] uppercase opacity-50 tracking-wide border-t-2 border-acid/30 pt-2">
      <Link href={ctx.worldRoute} className="hover:opacity-100 hover:text-acid transition-colors">
        {worldLabel}
      </Link>
      {chapterTitle && (
        <>
          <span>›</span>
          <span>{chapterTitle}</span>
        </>
      )}
      {pathTitle && (
        <>
          <span>›</span>
          <Link
            href={ctx.path ? `/path/${ctx.path.slug}` : "#"}
            className="hover:opacity-100 hover:text-acid transition-colors"
          >
            {pathTitle}
          </Link>
        </>
      )}
      {missionTotal > 1 && (
        <>
          <span>›</span>
          <span className="opacity-100 text-ink font-bold">
            {mission.title} ({missionIndex}/{missionTotal})
          </span>
        </>
      )}
    </div>
  );
}

// ─── main LessonPlayer ────────────────────────────────────────────────────────

interface Props {
  mission: Mission;
  nextSlug?: string;
  isReview?: boolean;
  /** Index (1-based) of this mission within its path */
  missionIndex?: number;
  /** Total missions in the path */
  missionTotal?: number;
  onComplete: () => void;
  onWrong?: () => void;
  onCorrect?: () => void;
}

export function LessonPlayer(props: Props) {
  return (
    <LessonErrorBoundary missionSlug={props.mission.slug}>
      <LessonPlayerInner {...props} />
    </LessonErrorBoundary>
  );
}

function LessonPlayerInner({ mission, nextSlug, isReview, missionIndex = 1, missionTotal = 1, onComplete, onWrong, onCorrect }: Props) {
  const screens = mission.screens ?? [];
  const [screenIdx, setScreenIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [showHeartsExplainer, setShowHeartsExplainer] = useState(false);

  const { progress, completeMission, reviewMission, loseHeart } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const { user } = useAuth();
  const alreadyDone = !!progress.completedMissions[mission.slug];
  const xpEarned = alreadyDone ? 0 : mission.xp;
  const isPathMode = learnMode === "ccd";

  // Analytics: track lesson start once
  useEffect(() => {
    track("lesson_started", {
      missionSlug: mission.slug,
      world: mission.world,
      xp: mission.xp,
      isReview: !!isReview,
      alreadyCompleted: alreadyDone,
      learnMode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve correct back-route via missionContext (fixes Producer world slug bug)
  const ctx = getMissionContext(mission.slug);
  const backRoute = ctx.worldRoute || "/worlds";

  const currentScreen = screens[screenIdx];
  const total = screens.length;

  // Count quiz screens (MCQ + audio-id + type-answer + sequence all count as "quiz-like")
  const quizScreens = screens.filter(s =>
    s.kind === "quiz" || s.kind === "audio-id" || s.kind === "type-answer" || s.kind === "sequence"
  );
  const quizScreenIndices = screens.reduce<number[]>((acc, s, i) => {
    if (s.kind === "quiz" || s.kind === "audio-id" || s.kind === "type-answer" || s.kind === "sequence") acc.push(i);
    return acc;
  }, []);
  const currentQuizNumber = currentScreen?.kind === "quiz"
    ? quizScreenIndices.indexOf(screenIdx) + 1
    : 0;

  // Show hearts explainer on first CCD lesson if never seen
  useEffect(() => {
    if (!isPathMode) return;
    try {
      const seen = sessionStorage.getItem(HEARTS_SEEN_KEY);
      if (!seen) setShowHeartsExplainer(true);
    } catch {}
  }, [isPathMode]);

  const dismissHeartsExplainer = () => {
    try { sessionStorage.setItem(HEARTS_SEEN_KEY, "1"); } catch {}
    setShowHeartsExplainer(false);
  };

  // Persist lesson progress to sessionStorage — survives page refresh
  const SESSION_KEY = `lesson_progress_${mission.slug}`;

  // Restore on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const { idx, correct } = JSON.parse(saved);
        if (typeof idx === "number" && idx > 0 && idx < screens.length) {
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
      // Track per-screen progress for drop-off analysis
      const screen = screens[screenIdx];
      track("lesson_screen_viewed", {
        missionSlug: mission.slug,
        world: mission.world,
        screenIndex: screenIdx,
        screenKind: screen?.kind ?? "unknown",
        totalScreens: total,
      });
      setScreenIdx(idx => idx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const score = correctCount / Math.max(1, quizScreens.length);
      if (isReview) {
        reviewMission(mission.slug, score);
      } else {
        completeMission(mission.slug, mission.xp, score, mission.badge?.slug);
        // Fire server-authoritative event (patches XP spoofing)
        window.dispatchEvent(new CustomEvent("progress:server_event", {
          detail: {
            type: "mission_complete",
            missionSlug: mission.slug,
            xp: mission.xp,
            score,
            badge: mission.badge?.slug,
          },
        }));
      }
      // Track completion
      track("lesson_completed", {
        missionSlug: mission.slug,
        world: mission.world,
        xpEarned: alreadyDone ? 0 : mission.xp,
        score,
        quizTotal: quizScreens.length,
        correctCount,
        isReview: !!isReview,
        learnMode,
      });
      setDone(true);
      onComplete();
    }
  }, [screenIdx, total, correctCount, quizScreens.length, mission, isReview, completeMission, reviewMission, onComplete, alreadyDone, learnMode, screens]);

  const handleCorrect = () => { setCorrectCount(c => c + 1); onCorrect?.(); };
  const handleWrong = () => {
    if (isPathMode) {
      loseHeart();
      // Server-authoritative heart deduction
      window.dispatchEvent(new CustomEvent("progress:server_event", {
        detail: { type: "heart_lost" },
      }));
    }
    onWrong?.();
  };

  // No screens — LessonPageClient handles this with InlineClassicLesson fallback
  if (!screens.length) return null;

  const summaryScreen = done
    ? (screens.find(s => s.kind === "summary") as Extract<LessonScreen, { kind: "summary" }> | undefined)
    : undefined;

  return (
    <>
      {/* Hearts explainer modal — shown once per session in path mode */}
      {showHeartsExplainer && (
        <HeartsExplainerModal onDismiss={dismissHeartsExplainer} />
      )}

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* ── Top bar: close button + progress bar + hearts ── */}
        <div className="flex items-center gap-3">
          <Link
            href={backRoute}
            className="brutal-border bg-bone px-3 py-2 font-mono text-[10px] uppercase brutal-press shrink-0"
            title="Back to world"
          >
            ✕
          </Link>
          <div className="flex-1">
            <ProgressBar current={screenIdx} total={total} />
          </div>
          {isPathMode && <HeartsRow count={progress.hearts} />}
        </div>

        {/* ── Breadcrumb: World › Chapter › Path › Mission N/M ── */}
        <LessonBreadcrumb
          mission={mission}
          missionIndex={missionIndex}
          missionTotal={missionTotal}
        />

        {/* ── Mode indicator — only show in PATH mode ── */}
        {isPathMode && (
          <div className="flex items-center justify-between">
            <div className="brutal-border bg-acid text-ink px-2.5 py-1 font-mono text-[9px] uppercase font-bold">
              🗺 PATH MODE · ❤️ {progress.hearts}/{MAX_HEARTS}
            </div>
            <button
              onClick={() => setLearnMode("classic")}
              className="font-mono text-[9px] uppercase opacity-40 hover:opacity-70 underline underline-offset-2"
            >
              Switch to Explore →
            </button>
          </div>
        )}

        {/* ── Screen renderer ──
            key={screenIdx} ensures React remounts each screen,
            resetting internal state (quiz phase, interacted flag, etc.) */}
        {done && summaryScreen ? (
          <SummaryScreen
            key="summary-done"
            screen={summaryScreen}
            mission={mission}
            xpEarned={xpEarned}
            nextSlug={nextSlug}
            isLoggedIn={!!user}
            correctCount={correctCount}
            quizTotal={quizScreens.length}
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
            quizNumber={currentQuizNumber}
            quizTotal={quizScreens.length}
            isPathMode={isPathMode}
            xpPerCorrect={alreadyDone ? 0 : Math.round(mission.xp / Math.max(1, quizScreens.length))}
            missionSlug={mission.slug}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onNext={advance}
          />
        ) : currentScreen?.kind === "audio-id" ? (
          <AudioIdScreen
            key={screenIdx}
            screen={currentScreen}
            isPathMode={isPathMode}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onNext={advance}
          />
        ) : currentScreen?.kind === "match" ? (
          <MatchScreen
            key={screenIdx}
            screen={currentScreen}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onNext={advance}
          />
        ) : currentScreen?.kind === "type-answer" ? (
          <TypeAnswerScreen
            key={screenIdx}
            screen={currentScreen}
            isPathMode={isPathMode}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onNext={advance}
          />
        ) : currentScreen?.kind === "sequence" ? (
          <SequenceScreen
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
            isLoggedIn={!!user}
            correctCount={correctCount}
            quizTotal={quizScreens.length}
            onClose={onComplete}
          />
        ) : null}

        {/* ── Screen counter ── */}
        {!done && (
          <div className="text-center font-mono text-[9px] uppercase opacity-30">
            {screenIdx + 1} / {total}
          </div>
        )}
      </div>
    </>
  );
}
