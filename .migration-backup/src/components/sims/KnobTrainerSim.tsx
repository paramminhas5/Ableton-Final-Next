// Knob Trainer — match a target sound by ear. Win flash when you land it.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, startLoop, type LoopHandle } from "@/lib/audio";

type Mode = "cutoff" | "attack" | "decay";

const MODE_META: Record<
  Mode,
  {
    label: string;
    unit: string;
    min: number;
    max: number;
    format: (v: number) => string;
    cue: string;
  }
> = {
  cutoff: {
    label: "LOWPASS CUTOFF",
    unit: "Hz",
    min: 200,
    max: 12000,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}kHz` : `${Math.round(v)}Hz`),
    cue: "Listen for the brightness. High cutoff = open and bright. Low cutoff = dark and muffled.",
  },
  attack: {
    label: "COMP ATTACK",
    unit: "ms",
    min: 1,
    max: 80,
    format: (v) => `${Math.round(v)}ms`,
    cue: "Listen to the transients. Slow attack = punch/snap preserved. Fast attack = transients clamped, softer hits.",
  },
  decay: {
    label: "REVERB DECAY",
    unit: "s",
    min: 0.3,
    max: 4.0,
    format: (v) => `${v.toFixed(2)}s`,
    cue: "Listen to the tail. Short = tight room. Long = cathedral. How long does the sound ring out?",
  },
};

function randInRange(min: number, max: number, mode: Mode): number {
  if (mode === "cutoff") {
    const logMin = Math.log2(min),
      logMax = Math.log2(max);
    return Math.pow(2, logMin + Math.random() * (logMax - logMin));
  }
  return min + Math.random() * (max - min);
}

export function KnobTrainerSim({ preset }: { preset?: Record<string, unknown> }) {
  const initialMode = (preset?.mode as Mode) ?? "cutoff";
  const [mode, setMode] = useState<Mode>(initialMode);
  const meta = MODE_META[mode];
  const [target, setTarget] = useState(() => randInRange(meta.min, meta.max, mode));
  const [val, setVal] = useState(() => (meta.min + meta.max) / 2);
  const [locked, setLocked] = useState(false); // true = submitted
  const [hit, setHit] = useState(false); // true = within tolerance
  const [win, setWin] = useState(false); // flash state
  const [round, setRound] = useState(1);
  const [score, setScore] = useState({ hits: 0, tries: 0 });
  const loopRef = useRef<LoopHandle | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const stopAll = () => {
    loopRef.current?.stop();
    loopRef.current = null;
    cleanupRef.current?.();
    cleanupRef.current = null;
  };
  useEffect(() => () => stopAll(), []);

  const buildChain = (ctx: AudioContext, v: number) => {
    const out = ctx.createGain();
    out.gain.value = 0.75;
    out.connect(getMaster());
    if (mode === "cutoff") {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = v;
      lp.Q.value = 0.8;
      lp.connect(out);
      return {
        inputNode: lp as AudioNode,
        cleanup: () => {
          try {
            out.disconnect();
          } catch {}
        },
      };
    } else if (mode === "attack") {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -24;
      comp.ratio.value = 8;
      comp.attack.value = v / 1000;
      comp.release.value = 0.15;
      comp.knee.value = 3;
      const mg = ctx.createGain();
      mg.gain.value = 1.8;
      comp.connect(mg).connect(out);
      return {
        inputNode: comp as AudioNode,
        cleanup: () => {
          try {
            out.disconnect();
          } catch {}
        },
      };
    } else {
      const len = Math.max(0.1, v) * ctx.sampleRate;
      const ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < d.length; i++)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.4);
      }
      const conv = ctx.createConvolver();
      conv.buffer = ir;
      const dry = ctx.createGain();
      dry.gain.value = 0.3;
      const wet = ctx.createGain();
      wet.gain.value = 0.85;
      const split = ctx.createGain();
      split.connect(dry).connect(out);
      split.connect(conv).connect(wet).connect(out);
      return {
        inputNode: split as AudioNode,
        cleanup: () => {
          try {
            out.disconnect();
          } catch {}
        },
      };
    }
  };

  const playOne = async (which: "target" | "user") => {
    stopAll();
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state !== "running") {
      try {
        await ctx.resume();
      } catch {}
    }
    const v = which === "target" ? target : val;
    const { inputNode, cleanup } = buildChain(ctx, v);
    const sampleName = mode === "cutoff" ? "chord-pad" : "drum-loop";
    loopRef.current = startLoop(sampleName, 100, inputNode);
    cleanupRef.current = cleanup;
  };

  const checkHit = () => {
    const tol =
      mode === "cutoff"
        ? Math.abs(Math.log2(val) - Math.log2(target)) < 0.22 // ±22% in log scale
        : mode === "attack"
          ? Math.abs(val - target) < 7 // ±7ms
          : Math.abs(val - target) < 0.45; // ±0.45s
    return tol;
  };

  const submit = () => {
    stopAll();
    const isHit = checkHit();
    setLocked(true);
    setHit(isHit);
    setScore((s) => ({ hits: s.hits + (isHit ? 1 : 0), tries: s.tries + 1 }));
    if (isHit) {
      setWin(true);
      setTimeout(() => setWin(false), 1200);
    }
  };

  const nextRound = () => {
    const newMode = mode; // keep current mode
    const newTarget = randInRange(MODE_META[newMode].min, MODE_META[newMode].max, newMode);
    setTarget(newTarget);
    setVal((MODE_META[newMode].min + MODE_META[newMode].max) / 2);
    setLocked(false);
    setHit(false);
    setWin(false);
    setRound((r) => r + 1);
    stopAll();
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    const newTarget = randInRange(MODE_META[m].min, MODE_META[m].max, m);
    setTarget(newTarget);
    setVal((MODE_META[m].min + MODE_META[m].max) / 2);
    setLocked(false);
    setHit(false);
    setWin(false);
    setRound(1);
    setScore({ hits: 0, tries: 0 });
    stopAll();
  };

  const accuracy = score.tries > 0 ? Math.round((score.hits / score.tries) * 100) : 0;

  return (
    <div
      className={`space-y-4 relative transition-all duration-200 ${win ? "outline outline-4 outline-acid" : ""}`}
    >
      {/* Win flash overlay */}
      {win && (
        <div className="absolute inset-0 bg-acid/40 z-10 pointer-events-none flex items-center justify-center">
          <div className="font-display text-6xl text-ink animate-fade-in">✓ MATCH!</div>
        </div>
      )}

      {/* Mode selector */}
      <div className="flex gap-1">
        {(Object.keys(MODE_META) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`brutal-border px-3 py-1 font-mono text-[10px] uppercase brutal-press flex-1 ${mode === m ? "bg-ink text-bone" : "bg-bone"}`}
          >
            {MODE_META[m].label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="brutal-border bg-ink text-bone p-4">
        <div className="font-mono text-[10px] uppercase opacity-60">
          Round {round} · {score.hits}/{score.tries} correct · {accuracy}%
        </div>
        <div className="font-display text-2xl mt-1">{meta.label}</div>
        <div className="font-mono text-xs mt-1 opacity-80 leading-relaxed">{meta.cue}</div>
      </div>

      {/* Play buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => playOne("target")}
          className="brutal-border bg-volt text-bone px-4 py-3 font-display text-lg brutal-press"
        >
          ▶ TARGET
        </button>
        <button
          onClick={() => playOne("user")}
          className="brutal-border bg-sun px-4 py-3 font-display text-lg brutal-press"
        >
          ▶ YOURS
        </button>
      </div>

      {/* Knob */}
      <div className="brutal-border bg-card p-4 space-y-3">
        <div className="flex justify-between font-mono text-[10px] uppercase opacity-60">
          <span>Your value</span>
          <span
            className={`font-bold text-sm ${locked ? (hit ? "text-green-600" : "text-red-600") : ""}`}
          >
            {meta.format(val)}
          </span>
        </div>
        <input
          type="range"
          min={meta.min}
          max={meta.max}
          step={mode === "cutoff" ? 10 : mode === "attack" ? 0.5 : 0.01}
          value={val}
          onChange={(e) => {
            if (!locked) setVal(+e.target.value);
          }}
          disabled={locked}
          className="w-full accent-ink"
        />
        <div className="flex justify-between font-mono text-[9px] opacity-40">
          <span>{meta.format(meta.min)}</span>
          <span>{meta.format(meta.max)}</span>
        </div>
      </div>

      {/* Submit / next */}
      {!locked ? (
        <button
          onClick={submit}
          className="brutal-border bg-acid text-ink px-5 py-3 font-display text-xl brutal-press w-full"
        >
          LOCK IN
        </button>
      ) : (
        <div className="space-y-2">
          <div className={`brutal-border p-4 ${hit ? "bg-acid text-ink" : "bg-hot text-bone"}`}>
            <div className="font-display text-2xl">{hit ? "✓ MATCHED" : "✗ MISS"}</div>
            <div className="font-mono text-xs mt-1">
              Target was <strong>{meta.format(target)}</strong>. You guessed{" "}
              <strong>{meta.format(val)}</strong>.
              {hit
                ? " Within tolerance — your ear is calibrated."
                : ` Off by ${meta.format(Math.abs(val - target))} — try again.`}
            </div>
          </div>
          <button
            onClick={nextRound}
            className="brutal-border bg-ink text-bone px-5 py-3 font-display text-xl brutal-press w-full"
          >
            NEXT ROUND →
          </button>
        </div>
      )}
    </div>
  );
}
