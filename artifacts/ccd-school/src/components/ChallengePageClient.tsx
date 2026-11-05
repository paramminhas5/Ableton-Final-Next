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
 * Model 1 look: glass intro, one go key, option pads, a segment bar for the clock.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useProgress } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import { playCorrect, playWrong } from "@/lib/audio";
import { PLACEMENT_QUESTIONS } from "@/content/placement-questions";
import { GoPill, Pad, Silk } from "@/components/m1/controls";
import { ListRow, PageHead, RefPage, SegBar } from "@/components/m1/parts";

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
  const themes = ["Music Theory Week", "DJ Techniques Week", "Production Week", "Sound Science Week"];
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

  const timerColor = timeLeft > 15 ? "var(--led-mint)" : timeLeft > 7 ? "#F3C14F" : "var(--led-red)";

  // intro
  if (phase === "intro") {
    return (
      <RefPage title="daily challenge" back="/dashboard" meta={getWeeklyTheme().toLowerCase()} right={`${progress.hearts} of 5 hearts`}
        intro="5 questions from all three worlds. 30 seconds each, or it counts as wrong.">
        {alreadyPlayed && (
          <div className="ls-panel" style={{ flexDirection: "column", gap: 2 }}>
            <b style={{ fontSize: 15, fontWeight: 500 }}>already played today</b>
            <span className="m1-t11">come back tomorrow for a new challenge.</span>
          </div>
        )}
        <Silk label="the rules" />
        {["speed and accuracy make your score", "a wrong answer costs a heart in flow mode", "resets every day at midnight utc"].map(rule => (
          <ListRow key={rule} led="var(--led-cobalt)" title={rule} />
        ))}
        <div style={{ marginTop: 18 }}>
          <GoPill onClick={() => { setPhase("playing"); setQPhase("picking"); setTimeLeft(QUESTION_TIME); }} disabled={progress.hearts === 0}>
            {alreadyPlayed ? "play again" : "start the challenge"}
          </GoPill>
        </div>
        {progress.hearts === 0 && <p className="m1-t11" style={{ textAlign: "center", marginTop: 10 }}>no hearts left. visit the shop to refill.</p>}
      </RefPage>
    );
  }

  // playing
  if (phase === "playing" && currentQ) {
    return (
      <main className="m1-page" style={{ paddingTop: 4 }}>
        <PageHead title={`question ${qIdx + 1} of ${QUESTION_COUNT}`} back="/dashboard" right={<span className="m1-t11" aria-live="off">{timeLeft}s</span>} />
        <div style={{ marginTop: 4 }} role="timer" aria-label={`${timeLeft} seconds left`}>
          <SegBar value={timeLeft / QUESTION_TIME} color={timerColor} />
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }} aria-hidden>
          {Array.from({ length: QUESTION_COUNT }).map((_, i) => (
            <span key={i} className="ls-led" style={{ ["--c" as string]: i < results.length ? (results[i].correct ? "var(--led-mint)" : "var(--led-red)") : i === qIdx ? "var(--led-mint)" : "var(--ledoff)", marginTop: 0 }} />
          ))}
        </div>
        <div className="m1-scr"><div className="m1-glass" style={{ padding: 16, marginTop: 12 }}>
          <div className="ls-meta"><span>{currentQ.world}</span></div>
          <p className="ls-sub" style={{ marginTop: 10, fontSize: 17 }}>{currentQ.q}</p>
        </div></div>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {currentQ.options.map((opt, i) => {
            const over = qPhase !== "picking";
            const lit = over && i === currentQ.answer ? "var(--led-mint)" : null;
            return (
              <Pad key={i} height={56} lit={lit} onClick={() => pick(i)} ariaLabel={`${String.fromCharCode(65 + i)}. ${opt}`}
                style={{ justifyContent: "flex-start", padding: "0 16px", textAlign: "left", fontSize: 14, opacity: over && i !== currentQ.answer ? 0.45 : 1, pointerEvents: over ? "none" : undefined }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left" }}>
                  <span className="m1-t11">{String.fromCharCode(65 + i)}</span><span>{opt}</span>
                </span>
              </Pad>
            );
          })}
        </div>
        <div aria-live="polite" style={{ marginTop: 12, minHeight: 40 }}>
          {qPhase === "timeout" && <div className="ls-panel" style={{ marginTop: 0 }}>time is up. the answer was {currentQ.options[currentQ.answer]}.</div>}
          {qPhase === "correct" && <div className="ls-panel" style={{ marginTop: 0 }}>correct.</div>}
          {qPhase === "wrong" && <div className="ls-panel" style={{ marginTop: 0 }}>not quite. the answer was {currentQ.options[currentQ.answer]}.</div>}
        </div>
      </main>
    );
  }

  // done
  const correctCount = results.filter(r => r.correct).length;
  const pct = Math.round((correctCount / QUESTION_COUNT) * 100);
  return (
    <RefPage title="challenge done" back="/dashboard" meta={pct === 100 ? "perfect" : pct >= 60 ? "solid" : "keep at it"} right={`${correctCount} of ${QUESTION_COUNT}`}
      intro={`score ${score}. speed and accuracy count.`}>
      <Silk label="your answers" />
      {questions.current.map((q, i) => (
        <ListRow key={q.id} led={results[i]?.correct ? "var(--led-mint)" : "var(--led-red)"} title={q.q} sub={results[i]?.correct ? "right" : `answer: ${q.options[q.answer]}`} />
      ))}
      <div style={{ marginTop: 18 }}><GoPill href="/leaderboard">challenge leaderboard</GoPill></div>
      <ListRow href="/dashboard" title="back to today" style={{ marginTop: 14 }} />
    </RefPage>
  );
}
