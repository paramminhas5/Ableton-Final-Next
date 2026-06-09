"use client";
/**
 * PlacementTest — 12-question skill check (4 per world).
 * Shown when user taps "Already know some music?" on onboarding step 1.
 * Result: unlocks starting chapter (1, 2 or 3) in selected world.
 *
 * UX flow:
 *   • One question per screen (same as LessonPlayer quiz screens)
 *   • Immediate colour feedback + short explanation
 *   • Progress bar across top
 *   • Results screen shows per-world scores → "Start at Chapter X"
 */
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { playCorrect, playWrong } from "@/lib/audio";
import { PLACEMENT_QUESTIONS, scorePlacement, type PlacementQ } from "@/content/placement-questions";
import { track } from "@/lib/analytics";

type Phase = "intro" | "quiz" | "results";
type PickPhase = "picking" | "answered";

// Which world to test — passed from caller
interface Props {
  world: "fundamentals" | "dj" | "producer";
  onSkip: () => void; // go back to normal onboarding
  /** Called with the first mission slug when the user applies a placement result.
   *  When provided, the caller is responsible for routing and setting onboardingDone.
   *  When omitted (standalone /placement page), PlacementTest routes itself. */
  onComplete?: (firstMissionSlug: string) => void;
}

const WORLD_LABELS: Record<string, string> = {
  fundamentals: "Fundamentals",
  dj: "DJ World",
  producer: "Producer",
};

const CHAPTER_FIRST_MISSION: Record<string, Record<number, string>> = {
  fundamentals: { 1: "what-is-sound", 2: "syncopation", 3: "chords-and-keys" },
  dj:           { 1: "what-is-djing", 2: "bpm-analysis-dj", 3: "beatmatching-manual" },
  producer:     { 1: "what-is-live",  2: "midi-piano-roll", 3: "the-mixer" },
};

export function PlacementTest({ world, onSkip, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIdx, setQIdx] = useState(0);
  const [pickPhase, setPickPhase] = useState<PickPhase>("picking");
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const { setPlacement } = useProgress();
  const router = useRouter();

  const questions = PLACEMENT_QUESTIONS.filter(q => q.world === world);
  const current: PlacementQ | undefined = questions[qIdx];
  const total = questions.length;

  const handlePick = useCallback((idx: number) => {
    if (pickPhase !== "picking" || !current) return;
    const isCorrect = idx === current.answer;
    setPicked(idx);
    setPickPhase("answered");
    setAnswers(prev => ({ ...prev, [current.id]: isCorrect }));
    isCorrect ? playCorrect() : playWrong();
  }, [pickPhase, current]);

  const handleNext = useCallback(() => {
    if (qIdx < total - 1) {
      setQIdx(i => i + 1);
      setPickPhase("picking");
      setPicked(null);
    } else {
      setPhase("results");
    }
  }, [qIdx, total]);

  const handleApplyResult = () => {
    const chapter = scorePlacement(answers, world);
    setPlacement(chapter);

    // Track placement completion with analytics
    track("placement_completed", {
      world,
      chapter,
      correctCount,
      totalQuestions: total,
      score: correctCount / Math.max(1, total),
    });

    const firstMission = CHAPTER_FIRST_MISSION[world]?.[chapter] ?? "what-is-sound";

    if (onComplete) {
      // Embedded in OnboardingFlow — let the parent handle routing + setOnboarding
      onComplete(firstMission);
    } else {
      // Standalone /placement page — route directly
      router.push(`/learn/${firstMission}`);
    }
  };

  const correctCount = Object.values(answers).filter(Boolean).length;

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-ink text-bone flex flex-col justify-center px-6 py-12 max-w-lg mx-auto space-y-8">
        <div>
          <div className="font-mono text-[10px] uppercase opacity-50 mb-2">PLACEMENT TEST</div>
          <h1 className="font-display text-5xl leading-none">
            LET&apos;S SEE<br />
            <span className="text-acid">WHAT YOU KNOW</span>
          </h1>
          <p className="font-mono text-sm opacity-60 mt-4 leading-relaxed">
            {total} quick questions about {WORLD_LABELS[world]}. Based on your answers,
            we&apos;ll skip you ahead to the right starting point.
          </p>
        </div>

        <div className="space-y-2 brutal-border bg-bone/10 p-4">
          {[
            `${total} questions`,
            "No hearts lost on wrong answers",
            "Takes about 2 minutes",
            "You can always go back and redo earlier lessons",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 font-mono text-sm">
              <span className="text-acid">✓</span> {item}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setPhase("quiz")}
            className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow"
          >
            START TEST →
          </button>
          <button
            onClick={onSkip}
            className="w-full brutal-border bg-bone/10 py-3 font-mono text-xs uppercase brutal-press hover:bg-bone/20"
          >
            Skip — start from Chapter 1
          </button>
        </div>
      </div>
    );
  }

  // ── QUIZ ──
  if (phase === "quiz" && current) {
    const pct = Math.round((qIdx / total) * 100);
    return (
      <div className="min-h-screen bg-ink text-bone flex flex-col max-w-lg mx-auto">
        {/* Top bar */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase opacity-60">
            <span>{WORLD_LABELS[world]} Placement</span>
            <span>{qIdx + 1} / {total}</span>
          </div>
          <div className="h-2 brutal-border bg-bone/10 overflow-hidden">
            <div className="h-full bg-acid transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex gap-1">
            {["beginner", "intermediate", "advanced"].map((lvl, i) => (
              <div key={i} className={`brutal-border px-2 py-0.5 font-mono text-[8px] uppercase ${
                current.difficulty === i + 1 ? "bg-acid text-ink" : "bg-bone/10"
              }`}>{lvl}</div>
            ))}
          </div>
        </div>

        <div className="flex-1 px-4 pb-8 space-y-4">
          {/* Question */}
          <div className="brutal-border bg-bone/10 p-5">
            <div className="font-display text-xl md:text-2xl leading-snug">{current.q}</div>
          </div>

          {/* Options */}
          <div className="grid gap-2">
            {current.options.map((opt, i) => {
              let cls = "bg-bone/10 hover:bg-bone/20 brutal-press cursor-pointer";
              if (pickPhase === "answered") {
                if (i === current.answer) cls = "bg-acid text-ink font-bold";
                else if (i === picked) cls = "bg-hot text-bone";
                else cls = "bg-bone/10 opacity-40 cursor-default";
              }
              return (
                <button
                  key={i}
                  onClick={() => handlePick(i)}
                  disabled={pickPhase === "answered"}
                  className={`brutal-border px-4 py-4 text-left font-mono text-sm transition-colors ${cls}`}
                >
                  <span className="opacity-40 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                  {pickPhase === "answered" && i === current.answer && <span className="ml-2">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {pickPhase === "answered" && (
            <>
              <div className={`brutal-border p-4 ${answers[current.id] ? "bg-volt text-bone" : "bg-hot text-bone"}`}>
                <div className="font-display text-xl mb-1">
                  {answers[current.id] ? "✓ Correct!" : "✗ Not quite"}
                </div>
                <div className="font-mono text-xs leading-relaxed opacity-90">{current.explain}</div>
              </div>
              <button
                onClick={handleNext}
                className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow"
              >
                {qIdx < total - 1 ? "NEXT →" : "SEE RESULTS →"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (phase === "results") {
    const chapter = scorePlacement(answers, world);
    const chapterLabels: Record<number, string> = {
      1: "Chapter 1 — Start from the beginning",
      2: "Chapter 2 — Skip the intro, start from intermediate",
      3: "Chapter 3 — Skip ahead to advanced content",
    };
    const pct = Math.round((correctCount / total) * 100);

    // P3 #37: Skill gap analysis — group questions by difficulty
    const byDifficulty = questions.reduce<Record<number, { total: number; correct: number }>>((acc, q) => {
      const d = q.difficulty ?? 1;
      if (!acc[d]) acc[d] = { total: 0, correct: 0 };
      acc[d].total++;
      if (answers[q.id]) acc[d].correct++;
      return acc;
    }, {});

    const difficultyLabels: Record<number, string> = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };
    const difficultyColors: Record<number, string> = { 1: "bg-acid text-ink", 2: "bg-volt text-bone", 3: "bg-hot text-bone" };

    return (
      <div className="min-h-screen bg-ink text-bone flex flex-col justify-center px-6 py-12 max-w-lg mx-auto space-y-8">
        <div>
          <div className="font-mono text-[10px] uppercase opacity-50 mb-2">PLACEMENT RESULT</div>
          <h1 className="font-display text-5xl leading-none">
            {pct >= 75 ? "IMPRESSIVE!" : pct >= 50 ? "SOLID BASE." : "LET'S BUILD IT."}<br />
            <span className="text-acid">{correctCount}/{total} CORRECT</span>
          </h1>
        </div>

        {/* P3 #37: Skill gap analysis by difficulty tier */}
        <div className="space-y-2">
          <div className="font-mono text-[10px] uppercase opacity-50 mb-1">// YOUR SKILL MAP</div>
          {Object.entries(byDifficulty).sort(([a], [b]) => Number(a) - Number(b)).map(([diff, data]) => {
            const diffNum = Number(diff);
            const diffPct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            const statusEmoji = diffPct === 100 ? "✓" : diffPct >= 50 ? "~" : "✗";
            return (
              <div key={diff} className="brutal-border bg-bone/10 p-3 flex items-center gap-3">
                <span className={`brutal-border ${difficultyColors[diffNum]} px-2 py-1 font-mono text-[9px] uppercase shrink-0`}>
                  {difficultyLabels[diffNum]}
                </span>
                <div className="flex-1 h-2 brutal-border bg-bone/20 overflow-hidden">
                  <div className={`h-full transition-all duration-700 ${diffPct >= 70 ? "bg-acid" : diffPct >= 40 ? "bg-sun" : "bg-hot"}`}
                    style={{ width: `${diffPct}%` }} />
                </div>
                <span className="font-mono text-[9px] shrink-0 opacity-70">{data.correct}/{data.total}</span>
                <span className="font-mono text-[9px] shrink-0">{statusEmoji}</span>
              </div>
            );
          })}
        </div>

        {/* Per-question recap */}
        <div className="space-y-1">
          {questions.map((q, i) => (
            <div key={q.id} className={`brutal-border px-3 py-2 flex items-center gap-2 font-mono text-xs ${
              answers[q.id] ? "bg-acid/20 text-bone" : "bg-hot/20 text-bone"
            }`}>
              <span className="shrink-0">{answers[q.id] ? "✓" : "✗"}</span>
              <span className="opacity-70">{q.q}</span>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div className="brutal-border bg-acid text-ink p-5 space-y-2">
          <div className="font-mono text-[10px] uppercase opacity-60">YOUR STARTING POINT</div>
          <div className="font-display text-2xl">{chapterLabels[chapter]}</div>
          <div className="font-sans text-xs opacity-70 leading-relaxed">
            {chapter === 1
              ? "We recommend starting from the top — the foundations matter."
              : chapter === 2
              ? "You know the basics. Skip the intro and go straight to the good stuff."
              : "You clearly know your stuff. Jump to advanced content."}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleApplyResult}
            className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow brutal-hover"
          >
            START AT CHAPTER {chapter} →
          </button>
          <button
            onClick={onSkip}
            className="w-full brutal-border bg-bone/10 py-3 font-mono text-xs uppercase brutal-press hover:bg-bone/20"
          >
            Start from Chapter 1 instead
          </button>
        </div>
      </div>
    );
  }

  return null;
}
