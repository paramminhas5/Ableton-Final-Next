// TempoCompareSim — hear two loops, pick which is faster.
// The #1 ear training exercise for tempo perception.
import { useCallback, useRef, useState } from "react";
import { getCtx, playKick, playSnare, playHat } from "@/lib/audio";

function makeBeat(
  ctx: AudioContext,
  bpm: number,
  dest: AudioNode,
  bars = 8,
): ReturnType<typeof setTimeout>[] {
  const step = 60 / bpm / 4; // 16th note
  const timers: ReturnType<typeof setTimeout>[] = [];
  let next = ctx.currentTime + 0.05;
  const totalSteps = bars * 16;

  for (let s = 0; s < totalSteps; s++) {
    const beat16 = s % 16;
    const when = next - ctx.currentTime;
    if (beat16 === 0 || beat16 === 8) setTimeout(() => playKick(0, dest), when * 1000);
    if (beat16 === 4 || beat16 === 12) setTimeout(() => playSnare(0, dest), when * 1000);
    if (beat16 % 2 === 0) setTimeout(() => playHat(0, false, dest), when * 1000);
    next += step;
  }
  return timers;
}

const BPM_PAIRS = [
  [90, 110],
  [85, 105],
  [95, 120],
  [80, 100],
  [110, 130],
  [92, 108],
  [88, 115],
  [100, 125],
  [75, 95],
];

type State = "idle" | "playingA" | "playingB" | "answered";

export function TempoCompareSim() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [state, setState] = useState<State>("idle");
  const [picked, setPicked] = useState<"A" | "B" | null>(null);
  const [reveal, setReveal] = useState(false);

  const pairIdx = round % BPM_PAIRS.length;
  const [bpmA, bpmB] = BPM_PAIRS[pairIdx];
  // Randomly swap which is actually faster each round
  const swapped = round % 3 === 2;
  const realA = swapped ? bpmB : bpmA;
  const realB = swapped ? bpmA : bpmB;
  const fasterSide = realA > realB ? "A" : "B";

  const destRef = useRef<GainNode | null>(null);

  const stopAll = useCallback(() => {
    destRef.current?.gain.setTargetAtTime(0, getCtx()?.currentTime ?? 0, 0.05);
    setTimeout(() => {
      const ctx = getCtx();
      if (!ctx) return;
      destRef.current?.disconnect();
      const g = ctx.createGain();
      g.connect(ctx.destination);
      destRef.current = g;
    }, 200);
  }, []);

  const ensureDest = () => {
    const ctx = getCtx();
    if (!ctx) return null;
    if (!destRef.current) {
      const g = ctx.createGain();
      g.connect(ctx.destination);
      destRef.current = g;
    }
    return destRef.current;
  };

  const playA = () => {
    stopAll();
    setState("playingA");
    const ctx = getCtx();
    const d = ensureDest();
    if (!ctx || !d) return;
    d.gain.setValueAtTime(1, ctx.currentTime);
    makeBeat(ctx, realA, d);
    setTimeout(() => setState((s) => (s === "playingA" ? "idle" : s)), 3500);
  };

  const playB = () => {
    stopAll();
    setState("playingB");
    const ctx = getCtx();
    const d = ensureDest();
    if (!ctx || !d) return;
    d.gain.setValueAtTime(1, ctx.currentTime);
    makeBeat(ctx, realB, d);
    setTimeout(() => setState((s) => (s === "playingB" ? "idle" : s)), 3500);
  };

  const answer = (side: "A" | "B") => {
    if (state === "answered") return;
    stopAll();
    setPicked(side);
    setState("answered");
    setReveal(true);
    if (side === fasterSide) setScore((s) => s + 1);
  };

  const next = () => {
    setRound((r) => r + 1);
    setPicked(null);
    setReveal(false);
    setState("idle");
  };

  const correct = picked === fasterSide;

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-ink text-bone p-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase opacity-60">
            Tempo Perception · Round {round + 1}
          </div>
          <div className="font-display text-2xl mt-1">WHICH IS FASTER?</div>
        </div>
        <div className="brutal-border bg-acid text-ink px-3 py-2 font-display text-2xl">
          {score}
        </div>
      </div>

      <div className="brutal-border bg-sun/20 p-3 font-mono text-xs leading-relaxed">
        Listen to both loops then pick which tempo is faster. Play each as many times as you need.
      </div>

      {/* Play buttons */}
      <div className="grid grid-cols-2 gap-3">
        {(["A", "B"] as const).map((side) => {
          const isPlaying = state === `playing${side}`;
          const isFaster = reveal && side === fasterSide;
          const isWrong = reveal && picked === side && side !== fasterSide;
          let bg = "bg-bone hover:bg-sun";
          if (isPlaying) bg = "bg-volt text-bone";
          if (isFaster) bg = "bg-acid text-ink";
          if (isWrong) bg = "bg-hot text-bone";
          return (
            <div key={side} className="space-y-2">
              <button
                onClick={side === "A" ? playA : playB}
                className={`brutal-border w-full py-4 font-display text-3xl brutal-press transition-colors ${bg}`}
              >
                {isPlaying ? "▶ PLAYING..." : `▶ LOOP ${side}`}
                {reveal && isFaster && <div className="font-mono text-[10px] mt-1">FASTER</div>}
                {reveal && !reveal && (
                  <div className="font-mono text-[10px] mt-1 opacity-60">
                    {side === "A" ? `${realA} BPM` : `${realB} BPM`}
                  </div>
                )}
              </button>
              {state !== "answered" && (
                <button
                  onClick={() => answer(side)}
                  className="brutal-border w-full py-2 font-mono text-[10px] uppercase brutal-press bg-bone hover:bg-ink hover:text-bone"
                >
                  THIS ONE IS FASTER
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Result */}
      {reveal && (
        <div
          className={`brutal-border p-4 animate-fade-in ${correct ? "bg-acid text-ink" : "bg-hot text-bone"}`}
        >
          <div className="font-display text-2xl">{correct ? "✓ CORRECT" : "✗ WRONG"}</div>
          <div className="font-mono text-xs mt-1">
            Loop A = {realA} BPM · Loop B = {realB} BPM · Difference = {Math.abs(realA - realB)} BPM
          </div>
          <div className="font-mono text-[10px] opacity-70 mt-1">
            {Math.abs(realA - realB) <= 10
              ? "Close tempos — harder to hear. Listen to the kick attack rate."
              : "Large difference — easier at this gap. Closer gaps train the real skill."}
          </div>
          <button
            onClick={next}
            className="brutal-border bg-ink text-bone px-4 py-2 font-display text-lg brutal-press mt-3"
          >
            NEXT ROUND →
          </button>
        </div>
      )}
    </div>
  );
}
