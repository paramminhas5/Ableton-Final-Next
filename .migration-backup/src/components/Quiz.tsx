import { useEffect, useRef, useState, useCallback } from "react";
import { XP_PER_CORRECT, XP_PERFECT_BONUS } from "@/lib/ranks";
import { playCorrect, playWrong, playFanfare } from "@/lib/audio";
import type { QuizQ } from "@/content/types";

export interface QuizMeta {
  missionTitle: string;
  missionNumber: number;
  xpEarned: number;
  badgeName?: string;
  nextSlug?: string;
}

interface Props {
  qs: QuizQ[];
  resetKey?: string; // reset the quiz when this changes (e.g. slug)
  meta?: QuizMeta;
  onComplete: (score: number) => void;
  onWrongAnswer?: () => void;
  onCorrectAnswer?: (xp: number) => void; // called per correct answer
  onPerfect?: (bonusXp: number) => void; // called when all correct
}

type Phase = "picking" | "feedback" | "done";

function scrollToCenter(el: HTMLElement | null) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const mid = rect.top + window.scrollY + rect.height / 2;
  window.scrollTo({ top: Math.max(0, mid - window.innerHeight / 2), behavior: "smooth" });
}

function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    left: `${(i / 28) * 100}%`,
    delay: `${(i * 0.05).toFixed(2)}s`,
    dur: `${(0.8 + (i % 5) * 0.1).toFixed(1)}s`,
    color: ["#CDFF00", "#FF2D2D", "#7B2FFF", "#FFB800", "#111111"][i % 5],
    size: `${7 + (i % 4)}px`,
  }));
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden" aria-hidden>
      <style>{`@keyframes cfall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(280px) rotate(540deg);opacity:0}}`}</style>
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.left,
            top: 0,
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `cfall ${p.dur} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

function ShareCard({
  meta,
  pct,
  passed,
  total,
}: {
  meta: QuizMeta;
  pct: number;
  passed: number;
  total: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = 1200,
      H = 630;
    c.width = W;
    c.height = H;
    ctx.fillStyle = pct === 100 ? "#CDFF00" : "#0B0B0B";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = pct === 100 ? "#0B0B0B" : "#F5F0E8";
    ctx.font = "bold 28px monospace";
    ctx.globalAlpha = 0.5;
    ctx.fillText("CCD.SCHOOL", 60, 70);
    ctx.globalAlpha = 1;
    ctx.font = "bold 52px sans-serif";
    ctx.fillText(`#${meta.missionNumber} ${meta.missionTitle}`, 60, 160);
    ctx.fillStyle = pct === 100 ? "#7B2FFF" : "#CDFF00";
    ctx.font = "bold 120px sans-serif";
    ctx.fillText(`${pct}%`, 60, 320);
    ctx.fillStyle = pct === 100 ? "#0B0B0B" : "#F5F0E8";
    ctx.font = "bold 36px monospace";
    ctx.fillText(`${passed}/${total} correct`, 60, 380);
    if (meta.xpEarned > 0) {
      ctx.fillStyle = "#FF2D2D";
      ctx.font = "bold 48px sans-serif";
      ctx.fillText(`+${meta.xpEarned} XP`, 60, 460);
    }
    ctx.font = "20px monospace";
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = pct === 100 ? "#0B0B0B" : "#F5F0E8";
    ctx.fillText("ccd.school", 60, H - 40);
    ctx.globalAlpha = 1;
    setUrl(c.toDataURL("image/png"));
  }, [meta, pct, passed, total]);
  return (
    <div className="space-y-3">
      <canvas ref={ref} className="w-full brutal-border" style={{ aspectRatio: "1200/630" }} />
      {url && (
        <a
          href={url}
          download={`ccd-school-${meta.missionNumber}.png`}
          className="brutal-border bg-acid text-ink px-5 py-3 font-display text-xl brutal-press block text-center"
        >
          ⬇ Download Card
        </a>
      )}
    </div>
  );
}

export function Quiz({
  qs,
  resetKey,
  meta,
  onComplete,
  onWrongAnswer,
  onCorrectAnswer,
  onPerfect,
}: Props) {
  // ALL mutable state needed by the scheduler lives in refs — zero stale-closure risk
  const qIdxRef = useRef(0);
  const resultsRef = useRef<boolean[]>([]);
  const phaseRef = useRef<Phase>("picking");
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // React state — only for triggering re-renders
  const [tick, setTick] = useState(0); // bump to re-render
  const [showShare, setShowShare] = useState(false);

  const doneRef = useRef<HTMLDivElement>(null);
  const explainRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const rerender = () => setTick((t) => t + 1);

  // Reset when the mission changes (resetKey = slug), NOT on qs reference change.
  // qs is m.quiz.slice() which creates a new reference on every parent render,
  // which would reset the quiz mid-session.
  const resetTarget = resetKey ?? qs.length.toString();
  useEffect(() => {
    if (autoRef.current) clearTimeout(autoRef.current);
    qIdxRef.current = 0;
    resultsRef.current = [];
    phaseRef.current = "picking";
    setShowShare(false);
    setTick(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTarget]);

  useEffect(
    () => () => {
      if (autoRef.current) clearTimeout(autoRef.current);
    },
    [],
  );

  // advance always reads live refs — never stale
  const advance = useCallback(() => {
    if (autoRef.current) {
      clearTimeout(autoRef.current);
      autoRef.current = null;
    }

    const idx = qIdxRef.current;
    const isLast = idx === qs.length - 1;

    if (isLast) {
      phaseRef.current = "done";
      const score = resultsRef.current.filter(Boolean).length / qs.length;
      rerender();
      onComplete(score);
      if (resultsRef.current.every(Boolean)) {
        playFanfare();
        onPerfect?.(XP_PERFECT_BONUS);
      }
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToCenter(doneRef.current)));
    } else {
      qIdxRef.current = idx + 1;
      phaseRef.current = "picking";
      rerender();
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToCenter(topRef.current)));
    }
  }, [qs.length, onComplete]);

  const pick = useCallback(
    (optIdx: number) => {
      if (phaseRef.current !== "picking") return;
      const q = qs[qIdxRef.current];
      if (!q) return;

      const isPass = optIdx === q.answer;
      resultsRef.current = [...resultsRef.current, isPass];
      phaseRef.current = "feedback";
      rerender();

      if (isPass) {
        playCorrect();
        onCorrectAnswer?.(XP_PER_CORRECT);
      } else {
        playWrong();
        onWrongAnswer?.();
      }
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToCenter(explainRef.current)));
      // No auto-advance — user controls pace with the Next button.
    },
    [qs, onWrongAnswer, onCorrectAnswer],
  );

  // ── Derived display values from refs ───────────────────────────────────
  const qIdx = qIdxRef.current;
  const phase = phaseRef.current;
  const q = qs[qIdx];
  const isLast = qIdx === qs.length - 1;
  const results = resultsRef.current;

  // ── Done screen ─────────────────────────────────────────────────────────
  if (phase === "done") {
    const passed = results.filter(Boolean).length;
    const pct = Math.round((passed / qs.length) * 100);
    const perfect = pct === 100;
    const grade = perfect
      ? { label: "PERFECT 🎉", color: "bg-acid text-ink" }
      : pct >= 70
        ? { label: "SOLID ✓", color: "bg-volt text-bone" }
        : { label: "RETRY", color: "bg-hot text-bone" };
    return (
      <div ref={doneRef} className="space-y-4 relative">
        {perfect && <Confetti />}

        {/* Grade */}
        <div className={`${grade.color} brutal-border p-5`}>
          <div className="font-mono text-[10px] uppercase opacity-70">Quiz complete</div>
          <div className="font-display text-5xl mt-1">{grade.label}</div>
          <div className="font-mono text-sm mt-2 flex items-center gap-3 flex-wrap">
            <span>
              {passed} / {qs.length} correct · {pct}%
            </span>
            {meta && meta.xpEarned > 0 && (
              <span className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-xs">
                +{meta.xpEarned} XP
              </span>
            )}
            {meta?.badgeName && (
              <span className="brutal-border bg-ink text-bone px-2 py-1 font-mono text-xs">
                🏅 {meta.badgeName}
              </span>
            )}
          </div>
        </div>

        {/* Share */}
        {pct >= 70 && meta && (
          <div className="space-y-2">
            {!showShare ? (
              <button
                onClick={() => setShowShare(true)}
                className="brutal-border bg-volt text-bone px-5 py-3 font-display text-xl brutal-press"
              >
                {perfect ? "🎉 Share your result" : "Share result"}
              </button>
            ) : (
              <ShareCard meta={meta} pct={pct} passed={passed} total={qs.length} />
            )}
          </div>
        )}

        {/* Per-question recap */}
        <div className="space-y-2">
          {qs.map((question, i) => (
            <div
              key={i}
              className={`brutal-border p-3 flex items-start gap-3 ${results[i] ? "bg-acid/20" : "bg-hot/10"}`}
            >
              <span className="font-display text-lg shrink-0 mt-0.5">{results[i] ? "✓" : "✗"}</span>
              <div className="min-w-0">
                <div className="font-mono text-xs leading-relaxed">{question.q}</div>
                <div className="font-mono text-[10px] mt-1 font-bold">
                  {results[i]
                    ? `✓ ${question.options[question.answer]}`
                    : `Correct: ${question.options[question.answer]}`}
                </div>
                {question.explain && (
                  <div className="font-mono text-[10px] mt-1 leading-relaxed opacity-80">
                    {question.explain}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          {pct < 70 && (
            <button
              onClick={() => {
                if (autoRef.current) {
                  clearTimeout(autoRef.current);
                  autoRef.current = null;
                }
                qIdxRef.current = 0;
                resultsRef.current = [];
                phaseRef.current = "picking";
                setShowShare(false);
                rerender();
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => scrollToCenter(topRef.current)),
                );
              }}
              className="brutal-border bg-ink text-bone px-5 py-3 font-display text-xl brutal-press"
            >
              ↺ RETRY
            </button>
          )}
          {meta?.nextSlug && (
            <a
              href={`/mission/${meta.nextSlug}`}
              className="brutal-border bg-acid text-ink px-5 py-3 font-display text-xl brutal-press"
            >
              NEXT MISSION →
            </a>
          )}
        </div>
      </div>
    );
  }

  // ── Active question ──────────────────────────────────────────────────────
  if (!q) return null;

  const progressPct = Math.round((results.length / qs.length) * 100);
  const pickedIdx = phase === "feedback" ? results.length - 1 : null; // last pick index
  // We can't know which option was picked from resultsRef alone — store it
  // Actually we need to track which option was picked for coloring
  // Let's use a separate ref for this
  const correctAns = q.answer;

  return (
    <div ref={topRef} className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between font-mono text-[10px] uppercase opacity-60">
          <span>
            Question {qIdx + 1} / {qs.length}
          </span>
          <span>{results.filter(Boolean).length} correct</span>
        </div>
        <div className="h-2 brutal-border bg-bone overflow-hidden">
          <div
            className="h-full bg-acid transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question text */}
      <div className="font-display text-xl md:text-2xl leading-snug">{q.q}</div>

      {/* Options */}
      <div className="grid sm:grid-cols-2 gap-2">
        {q.options.map((opt, oi) => {
          const isCorrect = oi === correctAns;
          // In feedback phase: color correct answer green, disable others
          let cls = "bg-bone hover:bg-sun/40 brutal-press cursor-pointer";
          if (phase === "feedback") {
            if (isCorrect) cls = "bg-acid text-ink font-bold";
            else cls = "bg-bone opacity-40 cursor-default";
          }
          return (
            <button
              key={oi}
              onClick={() => pick(oi)}
              disabled={phase === "feedback"}
              className={`brutal-border px-4 py-3 text-left font-mono text-sm transition-colors ${cls}`}
            >
              <span className="opacity-40 mr-2">{String.fromCharCode(65 + oi)}.</span>
              {opt}
              {phase === "feedback" && isCorrect && <span className="ml-2">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <HintBlock q={q} phase={phase} />

      {/* Explanation — shown after answering */}
      {phase === "feedback" && (
        <div ref={explainRef}>
          <div
            className={`brutal-border px-4 py-4 ${results[results.length - 1] ? "bg-volt text-bone" : "bg-ink text-bone"}`}
          >
            <div className="font-display text-2xl mb-1">
              {results[results.length - 1] ? "✓ CORRECT" : "✗ WRONG"}
            </div>
            {!results[results.length - 1] && (
              <div className="font-mono text-xs opacity-80 mb-2">
                Correct: <strong>{q.options[q.answer]}</strong>
              </div>
            )}
            {q.explain && (
              <div className="font-mono text-sm leading-relaxed border-t border-current/20 pt-2 mt-1">
                {q.explain}
              </div>
            )}
          </div>
          {/* Big, obvious primary action — replaces the tiny underline that
              auto-fired on the timer and felt premature. */}
          <button
            onClick={() => {
              if (autoRef.current) {
                clearTimeout(autoRef.current);
                autoRef.current = null;
              }
              advance();
            }}
            className="mt-3 w-full brutal-border bg-acid text-ink px-6 py-4 font-display text-2xl brutal-press brutal-shadow flex items-center justify-center gap-3"
          >
            {isLast ? "SEE RESULTS →" : "NEXT QUESTION →"}
          </button>
        </div>
      )}
    </div>
  );
}

// Separate component so it has its own state (avoids hint resetting on re-render)
function HintBlock({ q, phase }: { q: QuizQ; phase: Phase }) {
  const [shown, setShown] = useState(false);
  useEffect(() => setShown(false), [q]);
  if (phase !== "picking" || !q.hint) return null;
  if (!shown)
    return (
      <button
        onClick={() => setShown(true)}
        className="font-mono text-[10px] uppercase opacity-40 hover:opacity-70 underline underline-offset-2"
      >
        Stuck? See a hint
      </button>
    );
  return (
    <div className="brutal-border bg-sun/30 px-4 py-3 font-mono text-xs leading-relaxed">
      <span className="uppercase font-bold mr-2 opacity-60">Hint</span>
      {q.hint}
    </div>
  );
}
