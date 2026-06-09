"use client";
/**
 * ChallengePageClient — Daily Challenge Mode
 *
 * Rules:
 *   • 5 questions, drawn from all 3 worlds
 *   • 30 seconds per question — timer counts down
 *   • Timeout = wrong answer (costs a heart in Flow Mode)
 *   • Score is speed × accuracy: (correct / 5) × (avg remaining seconds)
 *   • Global challenge leaderboard score saved to /api/challenge/submit
 *   • Resets daily (date-keyed in localStorage)
 *   • Weekly theme: pulls questions tagged with the week's theme
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useProgress } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import { playCorrect, playWrong } from "@/lib/audio";
import { PLACEMENT_QUESTIONS } from "@/content/placement-questions";
import Link from "next/link";

const QUESTION_TIME = 30; // seconds
const QUESTION_COUNT = 5;
const DAILY_KEY = "ccd.challenge.v1";

type Phase = "intro" | "playing" | "done";
type QPhase = "picking" | "correct" | "wrong" | "timeout";

// Combine placement questions with some rotated ones for daily variety
function getDailyQuestions() {
  const today = new Date().toISOString().slice(0, 10);
  const seed = today.split("-").reduce((a, b) => a + parseInt(b), 0);
  const shuffled = [...PLACEMENT_QUESTIONS].sort((a, b) => {
    const ha = Math.sin(seed + a.id.charCodeAt(0)) * 10000;
    const hb = Math.sin(seed + b.id.charCodeAt(0)) * 10000;
    return (ha - Math.floor(ha)) - (hb - Math.floor(hb));
  });
  return shuffled.slice(0, QUESTION_COUNT);
}

function hasPlayedToday(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    const d = JSON.parse(localStorage.getItem(DAILY_KEY) ?? "{}");
    return d.date === new Date().toISOString().slice(0, 10);
  } catch { return false; }
}

function saveResult(score: number, correct: number) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(DAILY_KEY, JSON.stringify({
    date: new Date().toISOString().slice(0, 10),
    score, correct,
  }));
}

function getWeeklyTheme() {
  const themes = ["🎵 Music Theory Week", "🎧 DJ Techniques Week", "🎛 Production Week", "🔊 Sound Science Week"];
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return themes[week % themes.length];
}

export function ChallengePageClient() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIdx, setQIdx] = useState(0);
  const [qPhase, setQPhase] = useState<QPhase>("picking");
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [results, setResults] = useState<{ correct: boolean; timeUsed: number }[]>([]);
  const [score, setScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questions = useRef(getDailyQuestions());
  const { progress, loseHeart, addXp } = useProgress();
  const { user } = useAuth();
  const alreadyPlayed = hasPlayedToday();

  const currentQ = questions.current[qIdx];

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const advance = useCallback((correct: boolean, timeUsed: number) => {
    stopTimer();
    const newResults = [...results, { correct, timeUsed }];
    setResults(newResults);
    if (qIdx < QUESTION_COUNT - 1) {
      setTimeout(() => {
        setQIdx(i => i + 1);
        setQPhase("picking");
        setTimeLeft(QUESTION_TIME);
      }, 1200);
    } else {
      // Done
      const correctCount = newResults.filter(r => r.correct).length;
      const avgTime = newResults.reduce((a, r) => a + (QUESTION_TIME - r.timeUsed), 0) / QUESTION_COUNT;
      const finalScore = Math.round((correctCount / QUESTION_COUNT) * 100 + avgTime * 2);
      setScore(finalScore);
      saveResult(finalScore, correctCount);
      if (correctCount > 0) addXp(correctCount * 5);
      setPhase("done");
      // Submit to leaderboard
      if (user) {
        fetch("/api/challenge/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: finalScore, correct: correctCount, date: new Date().toISOString().slice(0, 10) }),
        }).catch(() => {});
      }
    }
  }, [qIdx, results, addXp, user]);

  // Timer
  useEffect(() => {
    if (phase !== "playing" || qPhase !== "picking") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setQPhase("timeout");
          playWrong();
          loseHeart();
          advance(false, QUESTION_TIME);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return stopTimer;
  }, [phase, qPhase, qIdx, advance, loseHeart]);

  const pick = (idx: number) => {
    if (qPhase !== "picking") return;
    stopTimer();
    const timeUsed = QUESTION_TIME - timeLeft;
    const isCorrect = idx === currentQ.answer;
    setQPhase(isCorrect ? "correct" : "wrong");
    if (isCorrect) { playCorrect(); }
    else { playWrong(); loseHeart(); }
    advance(isCorrect, timeUsed);
  };

  const timerPct = timeLeft / QUESTION_TIME;
  const timerColor = timeLeft > 15 ? "bg-acid" : timeLeft > 7 ? "bg-sun" : "bg-hot";

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <main className="min-h-screen bg-ink text-bone flex flex-col justify-center px-6 py-12 max-w-lg mx-auto space-y-8">
        <div>
          <div className="font-mono text-[10px] uppercase opacity-50 mb-2">DAILY CHALLENGE</div>
          <div className="font-mono text-xs opacity-40 mb-3">{getWeeklyTheme()}</div>
          <h1 className="font-display text-5xl leading-none">
            5 QUESTIONS.<br /><span className="text-acid">30 SECONDS EACH.</span>
          </h1>
        </div>
        {alreadyPlayed && (
          <div className="brutal-border bg-volt text-bone p-4">
            <div className="font-display text-xl">✓ Already played today</div>
            <div className="font-mono text-xs opacity-80 mt-1">Come back tomorrow for a new challenge!</div>
          </div>
        )}
        <div className="space-y-2 font-mono text-sm opacity-70">
          {["5 questions from all 3 worlds", "30 seconds per question or it's wrong", "Speed + accuracy = your score", "Wrong answers cost a heart in Flow Mode", "Resets every day at midnight UTC"].map((rule, i) => (
            <div key={i} className="flex items-center gap-2"><span className="text-acid">→</span>{rule}</div>
          ))}
        </div>
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-hot">♥</span>
          <span className="opacity-60">{progress.hearts}/{5} hearts remaining</span>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => { setPhase("playing"); setQPhase("picking"); setTimeLeft(QUESTION_TIME); }}
            disabled={progress.hearts === 0}
            className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow disabled:opacity-40">
            {alreadyPlayed ? "PLAY AGAIN →" : "START CHALLENGE →"}
          </button>
          {progress.hearts === 0 && (
            <p className="font-mono text-xs text-center opacity-60">No hearts left — visit the Gem Shop to refill</p>
          )}
          <Link href="/" className="block text-center font-mono text-[10px] uppercase opacity-40 hover:opacity-70">← Back to dashboard</Link>
        </div>
      </main>
    );
  }

  // ── PLAYING ──
  if (phase === "playing" && currentQ) {
    return (
      <main className="min-h-screen bg-ink text-bone max-w-lg mx-auto flex flex-col">
        {/* Top bar */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase opacity-60">
            <span>Question {qIdx + 1} / {QUESTION_COUNT}</span>
            <span className={timeLeft <= 7 ? "text-hot font-bold animate-pulse" : ""}>{timeLeft}s</span>
          </div>
          {/* Timer bar */}
          <div className="h-3 brutal-border bg-bone/10 overflow-hidden">
            <div className={`h-full ${timerColor} transition-all duration-1000`} style={{ width: `${timerPct * 100}%` }} />
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: QUESTION_COUNT }).map((_, i) => (
              <div key={i} className={`w-2 h-2 brutal-border ${i < results.length ? (results[i].correct ? "bg-acid" : "bg-hot") : i === qIdx ? "bg-volt" : "bg-bone/20"}`} />
            ))}
          </div>
        </div>

        <div className="flex-1 px-4 pb-8 space-y-4">
          <div className="brutal-border bg-bone/10 p-5">
            <div className="font-mono text-[9px] uppercase opacity-50 mb-2">{currentQ.world.toUpperCase()}</div>
            <div className="font-display text-xl md:text-2xl leading-snug">{currentQ.q}</div>
          </div>

          <div className="grid gap-2">
            {currentQ.options.map((opt, i) => {
              let cls = "bg-bone/10 hover:bg-bone/20 brutal-press cursor-pointer";
              if (qPhase !== "picking") {
                if (i === currentQ.answer) cls = "bg-acid text-ink font-bold";
                else cls = "bg-bone/10 opacity-30 cursor-default";
              }
              return (
                <button key={i} onClick={() => pick(i)} disabled={qPhase !== "picking"}
                  className={`brutal-border px-4 py-4 text-left font-mono text-sm transition-colors ${cls}`}>
                  <span className="opacity-40 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                  {qPhase !== "picking" && i === currentQ.answer && <span className="ml-2">✓</span>}
                </button>
              );
            })}
          </div>

          {qPhase === "timeout" && (
            <div className="brutal-border bg-hot text-bone p-3 font-mono text-sm">⏱ Time&apos;s up! The answer was: <strong>{currentQ.options[currentQ.answer]}</strong></div>
          )}
          {qPhase === "correct" && (
            <div className="brutal-border bg-volt text-bone p-3 font-display text-xl">✓ CORRECT! +{QUESTION_TIME - (QUESTION_TIME - timeLeft)} speed bonus</div>
          )}
          {qPhase === "wrong" && (
            <div className="brutal-border bg-hot text-bone p-3 font-mono text-sm">✗ Wrong. Correct: <strong>{currentQ.options[currentQ.answer]}</strong></div>
          )}
        </div>
      </main>
    );
  }

  // ── DONE ──
  const correctCount = results.filter(r => r.correct).length;
  const pct = Math.round((correctCount / QUESTION_COUNT) * 100);
  return (
    <main className="min-h-screen bg-ink text-bone flex flex-col justify-center px-6 py-12 max-w-lg mx-auto space-y-8">
      <div>
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">CHALLENGE COMPLETE</div>
        <h1 className="font-display text-6xl leading-none">
          {pct === 100 ? "PERFECT!" : pct >= 60 ? "SOLID!" : "KEEP AT IT."}<br />
          <span className="text-acid">{correctCount}/{QUESTION_COUNT}</span>
        </h1>
      </div>
      <div className="brutal-border bg-acid text-ink p-5">
        <div className="font-mono text-[10px] uppercase opacity-60 mb-1">CHALLENGE SCORE</div>
        <div className="font-display text-5xl">{score}</div>
        <div className="font-mono text-xs opacity-70 mt-1">Speed × accuracy = final score</div>
      </div>
      <div className="space-y-1">
        {questions.current.map((q, i) => (
          <div key={q.id} className={`brutal-border px-3 py-2 flex items-center gap-2 font-mono text-xs ${results[i]?.correct ? "bg-acid/20" : "bg-hot/20"}`}>
            <span>{results[i]?.correct ? "✓" : "✗"}</span>
            <span className="opacity-70 truncate">{q.q}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Link href="/leaderboard" className="w-full brutal-border bg-volt text-bone py-3 font-mono text-xs uppercase brutal-press block text-center">
          🏆 View Challenge Leaderboard →
        </Link>
        <Link href="/" className="w-full brutal-border bg-bone/10 py-3 font-mono text-xs uppercase brutal-press block text-center">
          ← Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
