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
import { startSlug } from "@/lib/startPoint";
import Link from "next/link";
import { type CSSProperties } from "react";
import { GoPill, Icon, Screen, Silk, WORLD_LED } from "@/components/m1/controls";
import { SevenSeg } from "@/components/m1/SevenSeg";
import { SegBar } from "@/components/m1/parts";
import "@/components/m1/lesson.css";

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
  fundamentals: "basics",
  dj: "dj",
  producer: "producer",
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

    const firstMission = startSlug(world, chapter);

    if (onComplete) {
      // Embedded in OnboardingFlow — let the parent handle routing + setOnboarding
      onComplete(firstMission);
    } else {
      // Standalone /placement page — route directly
      router.push(`/learn/${firstMission}`);
    }
  };

  const correctCount = Object.values(answers).filter(Boolean).length;

  const led = WORLD_LED[world];
  const bottom = (children: React.ReactNode) => <div className="ls-bottom"><div className="m1-g">{children}</div></div>;

  // intro
  if (phase === "intro") {
    return (
      <div className="ls">
        <div className="ls-top"><Link href="/worlds" className="ls-x" aria-label="Close"><Icon name="close" /></Link><span style={{ flex: 1 }} /></div>
        <div className="ls-col">
          <Screen>
            <div className="ls-meta"><span>find my level</span><span>{WORLD_LABELS[world]}</span></div>
            <div className="ls-title">what do you already know?</div>
            <p className="ls-sub">{total} quick questions. your answers decide where you start, so you skip what you know.</p>
          </Screen>
          <Silk label="before you start" />
          {[`${total} questions, about two minutes`, "wrong answers cost nothing", "you can always go back to earlier lessons"].map(t => (
            <div key={t} className="ls-panel" style={{ marginTop: 8, alignItems: "center", padding: "12px 16px" }}>
              <span className="ls-led" style={{ ["--c" as string]: led, marginTop: 0 } as CSSProperties} />{t}
            </div>
          ))}
        </div>
        {bottom(<>
          <button type="button" className="m1-m" onClick={onSkip} aria-label="Skip the test"><span className="m1-cap" style={{ width: "56%", marginTop: -12 }}><Icon name="back" /></span><span className="m1-ml">skip</span></button>
          <GoPill onClick={() => setPhase("quiz")} style={{ gridColumn: "span 3" }}>start test</GoPill>
        </>)}
      </div>
    );
  }

  // quiz
  if (phase === "quiz" && current) {
    const answered = pickPhase === "answered";
    const right = !!answers[current.id];
    return (
      <div className="ls">
        <div className="ls-top">
          <button type="button" className="ls-x" aria-label="Close the test" onClick={onSkip}><Icon name="close" /></button>
          <div className="ls-seg" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={qIdx} aria-label={`Question ${qIdx + 1} of ${total}`} style={{ ["--c" as string]: led } as CSSProperties}>
            {Array.from({ length: total }, (_, i) => <i key={i} className={i < qIdx ? "is-done" : i === qIdx ? "is-now" : ""} />)}
          </div>
          <span className="m1-tag">{["easy", "medium", "hard"][(current.difficulty ?? 1) - 1]}</span>
        </div>
        <div className="ls-col">
          <Screen>
            <div className="ls-meta">
              <span style={answered ? { color: right ? "var(--led-mint)" : "var(--led-red)" } : undefined}>{answered ? (right ? "right" : "not quite") : `question ${qIdx + 1} of ${total}`}</span>
              <span>{WORLD_LABELS[world]}</span>
            </div>
            <div className="ls-title is-small">{current.q}</div>
            {answered && <p className="ls-hint">{current.explain}</p>}
          </Screen>
          <div className={`ls-pads ${current.options.some(o => o.length > 28) || current.options.length > 4 ? "is-one" : ""}`} role="radiogroup" aria-label="Answers" style={{ marginTop: 14 }}>
            {current.options.map((o, i) => {
              const cls = !answered ? (picked === i ? "is-lit" : "") : i === current.answer ? (right ? "is-lit is-right" : "is-ring") : picked === i ? "is-lit is-wrong" : "is-dim";
              return (
                <button key={i} type="button" role="radio" aria-checked={picked === i} disabled={answered} className={`ls-pad ${cls}`}
                  style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties} onClick={() => handlePick(i)}>
                  <small>{String.fromCharCode(97 + i)}</small><span>{o}</span>
                </button>
              );
            })}
          </div>
        </div>
        {bottom(<GoPill onClick={handleNext} disabled={!answered} style={{ gridColumn: "1 / -1" }}>{qIdx < total - 1 ? "next" : "see my level"}</GoPill>)}
      </div>
    );
  }

  // results
  if (phase === "results") {
    const chapter = scorePlacement(answers, world);
    const pct = Math.round((correctCount / total) * 100);
    const by = questions.reduce<Record<number, { total: number; correct: number }>>((acc, q) => {
      const d = q.difficulty ?? 1;
      (acc[d] ??= { total: 0, correct: 0 }).total++;
      if (answers[q.id]) acc[d].correct++;
      return acc;
    }, {});
    const names: Record<number, string> = { 1: "beginner", 2: "intermediate", 3: "advanced" };
    const line = chapter === 1 ? "start from the top. the foundations matter." : chapter === 2 ? "you know the basics. skip the intro." : "you know your stuff. jump to the advanced lessons.";
    return (
      <div className="ls">
        <div className="ls-top"><button type="button" className="ls-x" aria-label="Close" onClick={onSkip}><Icon name="close" /></button><span style={{ flex: 1 }} /></div>
        <div className="ls-col">
          <Screen>
            <div className="ls-meta"><span>your level</span><span>{pct >= 75 ? "strong" : pct >= 50 ? "solid base" : "fresh start"}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
              <span className="ls-lcd" style={{ marginTop: 0 }}><SevenSeg text={`${correctCount}`} color={led} digits={2} height={44} /></span>
              <span style={{ color: "var(--disp-sub)", fontSize: 16 }}>of {total} right</span>
            </div>
            <p className="ls-sub">start at chapter {chapter}. {line}</p>
          </Screen>
          <Silk label="skill map" />
          {Object.entries(by).sort(([a], [b]) => Number(a) - Number(b)).map(([d, v]) => (
            <div key={d} className="ls-panel" style={{ alignItems: "center", marginTop: 8, padding: "12px 16px" }}>
              <span style={{ width: 96, flex: "none", color: "var(--sub)" }}>{names[Number(d)]}</span>
              <SegBar value={v.total ? v.correct / v.total : 0} color={led} n={10} height={8} label={`${v.correct} of ${v.total}`} />
              <span className="m1-t11" style={{ width: 28, textAlign: "right" }}>{v.correct}/{v.total}</span>
            </div>
          ))}
        </div>
        {bottom(<>
          <button type="button" className="m1-m" onClick={onSkip} aria-label="Start from chapter 1 instead"><span className="m1-cap" style={{ width: "56%", marginTop: -12 }}><Icon name="back" /></span><span className="m1-ml">chapter 1</span></button>
          <GoPill onClick={handleApplyResult} style={{ gridColumn: "span 3" }}>start chapter {chapter}</GoPill>
        </>)}
      </div>
    );
  }

  return null;
}
