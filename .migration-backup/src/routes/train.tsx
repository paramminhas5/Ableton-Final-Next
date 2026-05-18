import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AudioUnlock } from "@/components/AudioUnlock";
import { TempoCompareSim } from "@/components/sims/TempoCompareSim";
import {
  CHORDS,
  DRILL_LABELS,
  DRILL_WHY,
  EQ_BANDS,
  INTERVALS,
  PAN_POSITIONS,
  REVERB_LENGTHS,
  TEMPO_OPTIONS,
  type DrillKey,
  getLocalDrillStats,
  pickRootMidi,
  playAtTempo,
  playChord,
  playCompressedLoop,
  playEqExcerpt,
  playInterval,
  playPanned,
  playReverbHit,
  saveDrillScore,
} from "@/lib/drills";

export const Route = createFileRoute("/train")({
  head: () => ({
    meta: [
      { title: "Ear Training — CCD.SCHOOL" },
      {
        name: "description",
        content:
          "Five drills for production ears: intervals, chord quality, EQ cuts, compression, reverb time.",
      },
    ],
  }),
  component: TrainPage,
});

function TrainPage() {
  const [active, setActive] = useState<DrillKey | null>(null);
  const stats = getLocalDrillStats();
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-4">
      <AudioUnlock />
      <header className="brutal-border bg-hot text-bone p-6 brutal-shadow">
        <div className="font-mono text-xs uppercase">// PRACTICE</div>
        <h1 className="text-5xl md:text-7xl mt-2">EAR TRAINING</h1>
        <p className="font-mono mt-2">
          Real producer ears come from drills, not lectures. Pick one and run 10.
        </p>
      </header>
      {!active ? (
        <div className="grid md:grid-cols-2 gap-3">
          {(Object.keys(DRILL_LABELS) as DrillKey[]).map((k) => {
            const s = stats[k];
            const meta = DRILL_LABELS[k];
            return (
              <button
                key={k}
                onClick={() => setActive(k)}
                className="brutal-border bg-card p-4 brutal-shadow brutal-press text-left space-y-2"
              >
                <div className="text-3xl">{meta.emoji}</div>
                <div className="font-display text-2xl mt-1">{meta.name}</div>
                <div className="font-mono text-sm opacity-80">{meta.tagline}</div>
                {DRILL_WHY[k]?.[0] && (
                  <div className="border-l-4 border-l-[#CDFF00] pl-3 font-mono text-xs leading-relaxed opacity-80">
                    {DRILL_WHY[k][0]}
                  </div>
                )}
                <div className="font-mono text-xs uppercase opacity-70">
                  {s ? `Played ${s.played} · Best ${s.best}/10` : "Not played yet"}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <DrillRunner key={active} drill={active} onExit={() => setActive(null)} />
      )}
      <Link
        to="/"
        className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press inline-block"
      >
        ← HOME
      </Link>
    </div>
  );
}

const ROUNDS = 10;

function DrillRunner({ drill, onExit }: { drill: DrillKey; onExit: () => void }) {
  // Standalone sims for new drill types
  if (drill === "tempo-compare") {
    return (
      <div className="space-y-3">
        <button
          onClick={onExit}
          className="brutal-border bg-bone px-3 py-2 font-mono text-xs uppercase brutal-press"
        >
          ← Back
        </button>
        <TempoCompareSim />
      </div>
    );
  }

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; correct: string } | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  // Build the round's question
  const question = useMemo(() => buildQuestion(drill), [drill, round]);

  useEffect(() => {
    // play on round start
    setFeedback(null);
    stopRef.current?.();
    const handle = playQuestion(drill, question);
    stopRef.current = handle?.stop ?? null;
    return () => stopRef.current?.();
  }, [drill, question]);

  const replay = () => {
    stopRef.current?.();
    const handle = playQuestion(drill, question);
    stopRef.current = handle?.stop ?? null;
  };

  const choose = (id: string) => {
    if (feedback) return;
    const ok = id === question.answerId;
    setFeedback({ ok, correct: question.answerLabel });
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        setDone(true);
        void saveDrillScore(drill, score + (ok ? 1 : 0), ROUNDS);
      } else {
        setRound((r) => r + 1);
      }
    }, 900);
  };

  if (done) {
    const pct = Math.round((score / ROUNDS) * 100);
    return (
      <div className="brutal-border bg-acid p-6 brutal-shadow text-center space-y-3">
        <div className="font-mono text-xs uppercase">DRILL COMPLETE</div>
        <div className="font-display text-6xl">
          {score} / {ROUNDS}
        </div>
        <div className="font-mono">
          {pct >= 80
            ? "🔥 Solid ears."
            : pct >= 50
              ? "Keep going — repetition wires the brain."
              : "First runs are always rough. Try again."}
        </div>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => {
              setRound(0);
              setScore(0);
              setDone(false);
            }}
            className="brutal-border bg-volt text-bone px-4 py-2 font-mono text-xs uppercase brutal-press"
          >
            ▶ AGAIN
          </button>
          <button
            onClick={onExit}
            className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press"
          >
            ← MENU
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-card p-3 flex justify-between font-mono text-xs uppercase">
        <span>
          {DRILL_LABELS[drill].emoji} {DRILL_LABELS[drill].name}
        </span>
        <span>
          ROUND {round + 1}/{ROUNDS} · SCORE {score}
        </span>
        <button onClick={onExit} className="underline">
          QUIT
        </button>
      </div>
      <div className="brutal-border bg-bone p-3">
        <div className="font-mono text-[10px] uppercase font-bold mb-1">▸ WHY THIS DRILL</div>
        <ul className="font-mono text-[11px] space-y-0.5">
          {DRILL_WHY[drill].map((w, i) => (
            <li key={i}>▸ {w}</li>
          ))}
        </ul>
      </div>
      <div className="brutal-border bg-sun p-6 brutal-shadow">
        <div className="font-mono text-xs uppercase mb-2">{question.prompt}</div>
        <button
          onClick={replay}
          className="brutal-border bg-bone px-3 py-2 font-mono text-xs uppercase brutal-press"
        >
          ▶ REPLAY
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {question.options.map((o) => {
          const isAns = feedback && o.id === question.answerId;
          const tone = !feedback
            ? "bg-card hover:bg-acid"
            : isAns
              ? "bg-acid"
              : "bg-card opacity-60";
          return (
            <button
              key={o.id}
              onClick={() => choose(o.id)}
              disabled={!!feedback}
              className={`brutal-border ${tone} p-3 font-mono text-sm brutal-press text-left`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {feedback && (
        <div
          className={`brutal-border p-3 font-mono text-sm ${feedback.ok ? "bg-acid" : "bg-hot text-bone"}`}
        >
          {feedback.ok ? "✓ Correct" : `✗ Was: ${feedback.correct}`}
        </div>
      )}
    </div>
  );
}

type Question = {
  prompt: string;
  options: { id: string; label: string }[];
  answerId: string;
  answerLabel: string;
  payload: any;
};

function buildQuestion(drill: DrillKey): Question {
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  const sample = <T,>(arr: T[], n: number, must: T) => {
    const set = new Set<T>([must]);
    while (set.size < n) set.add(pick(arr));
    return Array.from(set).sort(() => Math.random() - 0.5);
  };

  if (drill === "interval") {
    const ans = pick(INTERVALS);
    const opts = sample(INTERVALS, 4, ans);
    const rootMidi = pickRootMidi();
    return {
      prompt: "Two notes played. Name the interval.",
      options: opts.map((o) => ({ id: String(o.semis), label: o.name })),
      answerId: String(ans.semis),
      answerLabel: ans.name,
      payload: { semis: ans.semis, rootMidi },
    };
  }
  if (drill === "chord") {
    const ans = pick(CHORDS);
    const opts = sample(CHORDS, 4, ans);
    const rootMidi = pickRootMidi();
    return {
      prompt: "What kind of chord did you hear?",
      options: opts.map((o) => ({ id: o.id, label: o.name })),
      answerId: ans.id,
      answerLabel: ans.name,
      payload: { offsets: ans.offsets, rootMidi },
    };
  }
  if (drill === "eq-cut") {
    const ans = pick(EQ_BANDS);
    const opts = sample(EQ_BANDS, 4, ans);
    return {
      prompt: "Pink noise has a deep notch. Where is the cut?",
      options: opts.map((o) => ({ id: String(o.hz), label: o.name })),
      answerId: String(ans.hz),
      answerLabel: ans.name,
      payload: ans.hz,
    };
  }
  if (drill === "compression") {
    const ans: "none" | "light" | "heavy" = pick(["none", "light", "heavy"] as const);
    return {
      prompt: "Listen. How much compression is on this loop?",
      options: [
        { id: "none", label: "None / Dry" },
        { id: "light", label: "Light (3:1, gentle)" },
        { id: "heavy", label: "Heavy (smashed)" },
      ],
      answerId: ans,
      answerLabel: ans,
      payload: ans,
    };
  }
  if (drill === "reverb") {
    const ans = pick(REVERB_LENGTHS);
    const opts = sample(REVERB_LENGTHS, 3, ans);
    return {
      prompt: "Listen to the tail. How long is the reverb?",
      options: opts.map((o) => ({ id: String(o.sec), label: o.name })),
      answerId: String(ans.sec),
      answerLabel: ans.name,
      payload: ans.sec,
    };
  }
  if (drill === "panning") {
    const ans = pick(PAN_POSITIONS);
    const opts = sample(PAN_POSITIONS, 4, ans);
    return {
      prompt: "Where in the stereo field is this drum loop?",
      options: opts.map((o) => ({ id: o.id, label: o.name })),
      answerId: ans.id,
      answerLabel: ans.name,
      payload: ans.val,
    };
  }
  // tempo
  const ans = pick(TEMPO_OPTIONS);
  const opts = sample(TEMPO_OPTIONS, 4, ans);
  return {
    prompt: "What tempo is this loop running at?",
    options: opts.map((o) => ({ id: String(o), label: `${o} BPM` })),
    answerId: String(ans),
    answerLabel: `${ans} BPM`,
    payload: ans,
  };
}

function playQuestion(drill: DrillKey, q: Question): { stop: () => void } | undefined {
  if (drill === "interval") {
    playInterval(q.payload.semis, q.payload.rootMidi);
    return;
  }
  if (drill === "chord") {
    playChord(q.payload.offsets, q.payload.rootMidi);
    return;
  }
  if (drill === "eq-cut") return playEqExcerpt(q.payload);
  if (drill === "compression") return playCompressedLoop(q.payload);
  if (drill === "reverb") return playReverbHit(q.payload);
  if (drill === "panning") return playPanned(q.payload);
  if (drill === "tempo") return playAtTempo(q.payload);
}
