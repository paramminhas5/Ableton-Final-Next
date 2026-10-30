"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ensureAudio } from "@/lib/audio";
import { track } from "@/lib/analytics";
import {
  GYM_DRILLS,
  SESSION_SECONDS,
  advance,
  makeCompressionQuestion,
  makeEqQuestion,
  makeGrooveQuestion,
  mulberry32,
  summarize,
  type AttackSetting,
  type CompressionQuestion,
  type EqQuestion,
  type GrooveKind,
  type GrooveQuestion,
  type GymDrill,
  type GymQuestion,
  type SessionResult,
} from "@/lib/gym/engine";
import { ABPlayer, renderMatchedPair } from "@/lib/gym/render";
import { freshSaved, loadGym, saveGym, type GymSaved } from "@/lib/gym/store";
import { canUsePass, recordSession, takeFreePass, weekStatus } from "@/lib/gym/week";

const DRILL_NAME: Record<GymDrill, string> = {
  eq: "EQ band",
  compression: "Compression",
  groove: "Tempo and groove",
};
const BARS_BEFORE_ANSWER = 8;

const fmtHz = (hz: number) => (hz >= 1000 ? `${hz / 1000}k` : `${hz}`);
const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

type Phase = "idle" | "loading" | "listening" | "feedback" | "done";

export function GymPageClient() {
  const [saved, setSaved] = useState<GymSaved>(freshSaved);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [q, setQ] = useState<GymQuestion | null>(null);
  const [selected, setSelected] = useState<"A" | "B">("A");
  const [bars, setBars] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; note: string } | null>(null);
  const [attackStep, setAttackStep] = useState(false);
  const [summary, setSummary] = useState<ReturnType<typeof summarize> | null>(null);
  const [error, setError] = useState("");

  const player = useRef<ABPlayer | null>(null);
  const token = useRef(0);
  const startedAt = useRef(0);
  const shownAt = useRef(0);
  const results = useRef<SessionResult[]>([]);
  const drillIdx = useRef(0);
  const lastGroove = useRef<GrooveKind | undefined>(undefined);
  const savedRef = useRef(saved);
  savedRef.current = saved;
  const rng = useMemo(() => mulberry32(Date.now() & 0xffffffff), []);

  useEffect(() => {
    setSaved(loadGym());
    setReady(true);
    return () => player.current?.stop();
  }, []);

  const now = new Date();
  const week = weekStatus(saved.week, now);

  // session clock and bar counter
  useEffect(() => {
    if (phase !== "listening" && phase !== "feedback" && phase !== "loading") return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
      if (q?.drill === "groove" && player.current) {
        setBars(player.current.barsPlayed((q as GrooveQuestion).baseBpm));
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase, q]);

  const persist = useCallback((next: GymSaved) => {
    setSaved(next);
    saveGym(next);
  }, []);

  const loadQuestion = useCallback(async () => {
    const my = ++token.current;
    player.current?.stop();
    player.current = null;
    setPhase("loading");
    setFeedback(null);
    setAttackStep(false);
    setBars(0);
    setSelected("A");
    setError("");

    const drill = GYM_DRILLS[drillIdx.current % GYM_DRILLS.length];
    drillIdx.current++;
    const level = savedRef.current.levels[drill].level;
    try {
      let question: GymQuestion;
      let pair;
      if (drill === "eq") {
        const e = makeEqQuestion(level, rng);
        question = e;
        pair = await renderMatchedPair(
          { bpm: 112 },
          { bpm: 112, eq: { hz: e.answerHz, db: e.boostDb, q: e.q } },
        );
      } else if (drill === "compression") {
        const k = makeCompressionQuestion(level, rng);
        question = k;
        pair = await renderMatchedPair(
          { bpm: 112 },
          {
            bpm: 112,
            comp: k.compressed
              ? { thresholdDb: k.thresholdDb, ratio: k.ratio, attack: k.attack }
              : undefined,
          },
        );
      } else {
        const g = makeGrooveQuestion(level, rng, lastGroove.current);
        lastGroove.current = g.kind;
        question = g;
        const aIsAnswer = g.answer === "A";
        const plain = { bpm: g.baseBpm };
        const special =
          g.kind === "tempo"
            ? { bpm: g.baseBpm + g.deltaBpm }
            : { bpm: g.baseBpm, swing: g.swing };
        pair = await renderMatchedPair(aIsAnswer ? special : plain, aIsAnswer ? plain : special);
      }
      if (my !== token.current) return;
      const p = new ABPlayer(pair.a, pair.b);
      player.current = p;
      p.start("A");
      setQ(question);
      shownAt.current = Date.now();
      setPhase("listening");
    } catch (e) {
      console.error("gym render failed", e);
      if (my === token.current) {
        setError("Could not prepare the audio on this device.");
        setPhase("idle");
      }
    }
  }, [rng]);

  const startSession = async () => {
    const ok = await ensureAudio();
    if (!ok) {
      setError("Tap again to allow sound.");
      return;
    }
    results.current = [];
    drillIdx.current = 0;
    startedAt.current = Date.now();
    setElapsed(0);
    setSummary(null);
    track("gym_session_started", { week: week.week });
    void loadQuestion();
  };

  const finishSession = useCallback(() => {
    token.current++;
    player.current?.stop();
    player.current = null;
    const s = summarize(results.current);
    let next = savedRef.current;
    if (s.counts) next = { ...next, week: recordSession(next.week, new Date()) };
    next = {
      ...next,
      history: [
        ...next.history,
        ...results.current.map((r) => ({ ...r, at: new Date().toISOString() })),
      ].slice(-300),
    };
    persist(next);
    setSummary(s);
    setPhase("done");
    if (s.counts) {
      track("gym_session_completed", {
        drills: Object.keys(s.byDrill).length,
        accuracy: Math.round(s.accuracy * 100) / 100,
        difficulty: Math.max(...Object.values(s.byDrill).map((d) => d.maxLevel)),
      });
    }
    // best effort: signed-in learners also get their results stored server side
    fetch("/api/gym/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: results.current }),
    }).catch(() => {});
  }, [persist]);

  const record = (drill: GymDrill, correct: boolean, note: string) => {
    const level = savedRef.current.levels[drill].level;
    results.current.push({ drill, level, correct, responseMs: Date.now() - shownAt.current });
    const levels = { ...savedRef.current.levels, [drill]: advance(savedRef.current.levels[drill], correct) };
    persist({ ...savedRef.current, levels });
    setFeedback({ correct, note });
    setPhase("feedback");
  };

  const answerEq = (hz: number) => {
    const e = q as EqQuestion;
    const ok = hz === e.answerHz;
    record("eq", ok, ok ? "Yes." : `It was ${fmtHz(e.answerHz)} Hz.`);
  };
  const answerCompressed = (said: boolean) => {
    const k = q as CompressionQuestion;
    if (said !== k.compressed) {
      record("compression", false, k.compressed ? "B was compressed." : "B was not compressed.");
    } else if (k.askAttack) {
      setAttackStep(true);
    } else {
      record("compression", true, k.compressed ? "Yes, compressed." : "Yes, no compression.");
    }
  };
  const answerAttack = (a: AttackSetting) => {
    const k = q as CompressionQuestion;
    record("compression", a === k.attack, a === k.attack ? "Yes." : `The attack was ${k.attack}.`);
  };
  const answerGroove = (pick: "A" | "B") => {
    const g = q as GrooveQuestion;
    const what = g.kind === "tempo" ? "faster" : "swung";
    record("groove", pick === g.answer, pick === g.answer ? "Yes." : `${g.answer} was the ${what} one.`);
  };

  const timeUp = elapsed >= SESSION_SECONDS;
  const next = () => (timeUp ? finishSession() : void loadQuestion());
  const toggle = (w: "A" | "B") => {
    player.current?.select(w);
    setSelected(w);
  };

  const g = q?.drill === "groove" ? (q as GrooveQuestion) : null;
  const locked = g ? bars < BARS_BEFORE_ANSWER : false;

  // ─── screens ───────────────────────────────────────────────────────────────

  if (phase === "idle" || phase === "done") {
    return (
      <main className="min-h-screen bg-bone">
        <div className="mx-auto w-full max-w-md px-4 py-8 space-y-6">
          <header>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// EAR GYM</div>
            <h1 className="font-display text-4xl leading-none">FIVE MINUTES. ONE THUMB.</h1>
            <p className="font-mono text-xs opacity-60 mt-3">
              EQ, compression, tempo and groove on real loops. It gets harder when you get it right.
            </p>
          </header>

          {phase === "done" && summary && (
            <section className="brutal-border bg-acid p-4 chunk-shadow" aria-live="polite">
              <div className="font-display text-2xl mb-1">
                {summary.counts ? "SESSION DONE" : "TOO SHORT TO COUNT"}
              </div>
              <div className="font-mono text-sm">
                {summary.correct} of {summary.answered} right ({Math.round(summary.accuracy * 100)}%)
              </div>
              {!summary.counts && (
                <div className="font-mono text-xs opacity-70 mt-1">
                  Answer at least 5 to count towards your week.
                </div>
              )}
            </section>
          )}

          <section className="brutal-border bg-bone p-4" aria-label="This week">
            <div className="font-mono text-[10px] uppercase opacity-40 mb-2">THIS WEEK</div>
            <div className="flex items-center gap-2 mb-2" role="img" aria-label={`${week.filled} of ${week.target} sessions`}>
              {Array.from({ length: week.target }).map((_, i) => (
                <span
                  key={i}
                  className={`h-8 w-8 brutal-border ${i < week.done ? "bg-ink" : i < week.filled ? "bg-sun" : "bg-bone"}`}
                />
              ))}
            </div>
            <div className="font-mono text-xs">
              {week.met
                ? "Week done. Anything more is a bonus."
                : `${week.remaining} more session${week.remaining === 1 ? "" : "s"} to hit your week.`}
              {week.passUsed && " Free pass used."}
            </div>
            <div className="font-mono text-[10px] opacity-50 mt-1">
              Missing a day never resets anything.
            </div>
            {ready && canUsePass(saved.week, now) && (
              <button
                onClick={() => persist({ ...saved, week: takeFreePass(saved.week, new Date()) })}
                className="mt-3 w-full min-h-12 brutal-border bg-bone px-4 font-mono text-xs uppercase brutal-press hover:bg-sun"
              >
                Use this week&apos;s free pass
              </button>
            )}
          </section>

          {error && <div className="brutal-border bg-hot text-bone px-3 py-2 font-mono text-xs">{error}</div>}

          <button
            onClick={startSession}
            className="w-full min-h-14 brutal-border bg-ink text-bone px-4 font-display text-xl uppercase brutal-press chunk-shadow hover:bg-volt hover:text-ink transition-colors"
          >
            {phase === "done" ? "GO AGAIN" : "START 5 MIN SESSION"}
          </button>
          <p className="font-mono text-[10px] opacity-50 text-center">Headphones help. Plays through your speakers if you have none.</p>

          <section className="brutal-border bg-bone p-4">
            <div className="font-mono text-[10px] uppercase opacity-40 mb-2">YOUR LEVELS</div>
            <ul className="space-y-1 font-mono text-xs">
              {GYM_DRILLS.map((d) => (
                <li key={d} className="flex justify-between">
                  <span>{DRILL_NAME[d]}</span>
                  <span>Level {saved.levels[d].level}</span>
                </li>
              ))}
            </ul>
          </section>

          <Link href="/train" className="block text-center font-mono text-[10px] uppercase underline opacity-60">
            More ear training
          </Link>
        </div>
      </main>
    );
  }

  const remaining = Math.max(0, SESSION_SECONDS - elapsed);

  return (
    <main className="min-h-screen bg-bone">
      <div className="mx-auto w-full max-w-md px-4 py-4 space-y-4">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="uppercase">{q ? DRILL_NAME[q.drill] : "Loading"}</span>
          <span aria-label="Time left">{fmtClock(remaining)}</span>
          <button onClick={finishSession} className="min-h-12 px-2 uppercase underline">
            End
          </button>
        </div>

        {phase === "loading" && (
          <div className="brutal-border bg-bone p-6 text-center font-mono text-sm" role="status">
            Getting the next clip ready…
          </div>
        )}

        {q && phase !== "loading" && (
          <>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Switch clip">
              {(["A", "B"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => toggle(w)}
                  aria-pressed={selected === w}
                  className={`min-h-16 brutal-border font-display text-3xl brutal-press ${selected === w ? "bg-ink text-bone chunk-shadow" : "bg-bone hover:bg-sun"}`}
                >
                  {w}
                </button>
              ))}
            </div>
            <p className="font-mono text-[10px] opacity-50 text-center">
              Levels are matched, so loudness will not give it away. Switch as often as you like.
            </p>

            {q.drill === "eq" && (
              <fieldset disabled={phase === "feedback"} className="space-y-2">
                <legend className="font-mono text-xs mb-2">B has one band boosted. Which one?</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(q as EqQuestion).options.map((hz) => (
                    <button
                      key={hz}
                      onClick={() => answerEq(hz)}
                      className="min-h-12 brutal-border bg-bone font-mono text-sm brutal-press hover:bg-acid disabled:opacity-60"
                    >
                      {fmtHz(hz)} Hz
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {q.drill === "compression" && !attackStep && (
              <fieldset disabled={phase === "feedback"} className="space-y-2">
                <legend className="font-mono text-xs mb-2">A is the original. Is B compressed?</legend>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => answerCompressed(true)} className="min-h-12 brutal-border bg-bone font-mono text-sm brutal-press hover:bg-acid disabled:opacity-60">
                    Compressed
                  </button>
                  <button onClick={() => answerCompressed(false)} className="min-h-12 brutal-border bg-bone font-mono text-sm brutal-press hover:bg-acid disabled:opacity-60">
                    Not compressed
                  </button>
                </div>
              </fieldset>
            )}
            {q.drill === "compression" && attackStep && phase !== "feedback" && (
              <fieldset className="space-y-2">
                <legend className="font-mono text-xs mb-2">Right. Which attack setting?</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(["fast", "medium", "slow"] as const).map((a) => (
                    <button key={a} onClick={() => answerAttack(a)} className="min-h-12 brutal-border bg-bone font-mono text-sm uppercase brutal-press hover:bg-acid">
                      {a}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {g && (
              <fieldset disabled={phase === "feedback" || locked} className="space-y-2">
                <legend className="font-mono text-xs mb-2">
                  {g.kind === "tempo" ? "Which clip is faster?" : "Which clip is swung?"}
                </legend>
                {locked && (
                  <div className="font-mono text-[10px] opacity-60" role="status">
                    Keep listening: bar {Math.min(bars, BARS_BEFORE_ANSWER)} of {BARS_BEFORE_ANSWER}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {(["A", "B"] as const).map((w) => (
                    <button key={w} onClick={() => answerGroove(w)} className="min-h-12 brutal-border bg-bone font-mono text-sm brutal-press hover:bg-acid disabled:opacity-40">
                      {w}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </>
        )}

        {phase === "feedback" && feedback && (
          <div
            className={`brutal-border p-4 ${feedback.correct ? "bg-volt text-ink" : "bg-hot text-bone"}`}
            role="status"
            aria-live="polite"
          >
            <div className="font-display text-2xl">{feedback.correct ? "RIGHT" : "NOT QUITE"}</div>
            <div className="font-mono text-xs mt-1">{feedback.note}</div>
            <button
              onClick={next}
              className="mt-3 w-full min-h-12 brutal-border bg-ink text-bone font-mono text-xs uppercase brutal-press"
            >
              {timeUp ? "Finish" : "Next"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
