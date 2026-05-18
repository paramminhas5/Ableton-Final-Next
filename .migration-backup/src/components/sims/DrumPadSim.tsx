import { useEffect, useRef, useState, useCallback } from "react";
import { useMidi } from "@/lib/midi";
import { getCtx, playKick, playSnare, playHat, playClap, midiToFreq, playTone } from "@/lib/audio";

const PADS: { name: string; color: string; play: () => void }[] = [
  { name: "KICK", color: "bg-acid", play: () => playKick() },
  { name: "SNARE", color: "bg-hot text-bone", play: () => playSnare() },
  { name: "HAT", color: "bg-volt text-bone", play: () => playHat() },
  { name: "OPEN", color: "bg-sun", play: () => playHat(0, true) },
  { name: "CLAP", color: "bg-bone", play: () => playClap() },
  { name: "TOM", color: "bg-acid", play: () => playTone(120, 0, 0.25, "sine", 0.4) },
  {
    name: "BASS",
    color: "bg-hot text-bone",
    play: () => playTone(midiToFreq(36), 0, 0.4, "sawtooth", 0.3),
  },
  {
    name: "BLEEP",
    color: "bg-volt text-bone",
    play: () => playTone(midiToFreq(76), 0, 0.2, "square", 0.2),
  },
];

// Presets to help learners get started
const PRESETS: { name: string; steps: boolean[][] }[] = [
  {
    name: "4 ON THE FLOOR",
    steps: [
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0].map(Boolean),
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0].map(Boolean),
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0].map(Boolean),
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map(Boolean),
    ],
  },
  {
    name: "BOOM BAP",
    steps: [
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0].map(Boolean),
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0].map(Boolean),
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0].map(Boolean),
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1].map(Boolean),
    ],
  },
  {
    name: "TRAP HI-HATS",
    steps: [
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0].map(Boolean),
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0].map(Boolean),
      [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0].map(Boolean),
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0].map(Boolean),
    ],
  },
];

const LOOK_AHEAD = 0.3; // seconds to schedule ahead
const TICK_INTERVAL = 50; // ms between scheduler runs

export function DrumPadSim() {
  const [steps, setSteps] = useState<boolean[][]>(() =>
    Array.from({ length: 4 }, () => Array(16).fill(false)),
  );
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [step, setStep] = useState(-1);
  const [padFlash, setPadFlash] = useState<number | null>(null);

  // Refs for scheduler (avoids stale closure issues)
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const nextStepTime = useRef(0); // absolute Web Audio time of next step
  const nextStepIdx = useRef(0); // which 16th-note step fires next
  const scheduledRef = useRef<{ time: number; idx: number }[]>([]); // for visual sync
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Web Audio lookahead scheduler — schedules ONLY audio, never touches React state
  const scheduleStep = useCallback((stepIdx: number, time: number) => {
    const c = getCtx();
    if (!c) return;
    const row = stepsRef.current;
    const when = time - c.currentTime;
    if (row[0][stepIdx]) playKick(when);
    if (row[1][stepIdx]) playSnare(when);
    if (row[2][stepIdx]) playHat(when);
    if (row[3][stepIdx]) playClap(when);
    scheduledRef.current.push({ time, idx: stepIdx });
  }, []);

  const tick = useCallback(() => {
    const c = getCtx();
    if (!c) return;
    const stepDur = 60 / bpmRef.current / 4;
    while (nextStepTime.current < c.currentTime + LOOK_AHEAD) {
      scheduleStep(nextStepIdx.current, nextStepTime.current);
      nextStepIdx.current = (nextStepIdx.current + 1) % 16;
      nextStepTime.current += stepDur;
    }
    timerRef.current = setTimeout(tick, TICK_INTERVAL);
  }, [scheduleStep]);

  // rAF loop — updates visual cursor from Web Audio clock (never drifts)
  const drawLoop = useCallback(() => {
    const c = getCtx();
    if (c) {
      const now = c.currentTime;
      // Find the most recently started step
      const passed = scheduledRef.current.filter((s) => s.time <= now);
      if (passed.length) {
        const latest = passed[passed.length - 1];
        setStep(latest.idx);
        // Prune old entries
        scheduledRef.current = scheduledRef.current.filter((s) => s.time > now - 0.1);
      }
    }
    rafRef.current = requestAnimationFrame(drawLoop);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setStep(-1);
      return;
    }
    const c = getCtx();
    if (!c) return;
    scheduledRef.current = [];
    nextStepIdx.current = 0;
    nextStepTime.current = c.currentTime + 0.1;
    tick();
    rafRef.current = requestAnimationFrame(drawLoop);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [playing, tick, drawLoop]);

  // --- Web MIDI — plug in your controller to trigger pads ---
  const midiNoteMap: Record<number, number> = {
    36: 0,
    38: 1,
    42: 2,
    46: 3,
    37: 4,
    41: 5,
    45: 6,
    48: 7,
  };
  const { connected: midiConnected, inputNames: midiNames } = useMidi({
    onNoteOn: (note, _vel) => {
      const padIdx = midiNoteMap[note] ?? note % PADS.length;
      const pad = PADS[padIdx];
      if (pad) {
        pad.play();
        setPadFlash(padIdx);
        setTimeout(() => setPadFlash((f) => (f === padIdx ? null : f)), 100);
      }
    },
  });

  const toggle = (r: number, c: number) => {
    setSteps((prev) =>
      prev.map((row, i) => (i === r ? row.map((v, j) => (j === c ? !v : v)) : row)),
    );
  };

  const loadPreset = (p: (typeof PRESETS)[0]) => setSteps(p.steps.map((r) => [...r]));

  const handlePad = (pad: (typeof PADS)[0], idx: number) => {
    pad.play();
    setPadFlash(idx);
    setTimeout(() => setPadFlash((f) => (f === idx ? null : f)), 100);
  };

  const labels = ["KICK", "SNARE", "HAT", "CLAP"];
  const colors = ["bg-acid", "bg-hot", "bg-volt", "bg-sun"];

  return (
    <div className="space-y-4">
      {/* Transport */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="brutal-border bg-acid px-4 py-2 font-mono uppercase brutal-press"
        >
          {playing ? "■ Stop" : "▶ Play"}
        </button>
        <label className="font-mono text-xs uppercase flex items-center gap-2">
          BPM
          <input
            type="range"
            min={60}
            max={180}
            value={bpm}
            onChange={(e) => setBpm(+e.target.value)}
            className="accent-ink"
          />
          <span className="brutal-border bg-bone px-2 py-1 min-w-[3ch] text-center">{bpm}</span>
        </label>
        <button
          onClick={() => setSteps(Array.from({ length: 4 }, () => Array(16).fill(false)))}
          className="brutal-border bg-bone px-3 py-2 font-mono uppercase brutal-press"
        >
          Clear
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-mono text-[10px] uppercase opacity-60 mr-1">Presets:</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => loadPreset(p)}
            className="brutal-border bg-bone px-3 py-1 font-mono text-[10px] uppercase brutal-press"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Step grid — pointer events work on mouse + touch + stylus */}
      <div className="space-y-1">
        {labels.map((l, r) => (
          <div key={l} className="flex gap-1 items-center">
            <div className="w-16 brutal-border bg-ink text-bone font-mono text-[10px] uppercase px-2 py-2 text-center shrink-0">
              {l}
            </div>
            {steps[r].map((on, c) => {
              const isActive = step === c && playing;
              const groupBorder = c % 4 === 0 && c > 0 ? "ml-1" : "";
              return (
                <button
                  key={c}
                  onPointerDown={() => toggle(r, c)}
                  className={[
                    "flex-1 h-9 brutal-border touch-none select-none",
                    groupBorder,
                    on ? colors[r] : "bg-card",
                    isActive ? "outline outline-2 outline-offset-[-2px] outline-ink" : "",
                  ].join(" ")}
                  aria-label={`${l} step ${c + 1} ${on ? "on" : "off"}`}
                  aria-pressed={on}
                />
              );
            })}
          </div>
        ))}
        {/* Beat numbers */}
        <div className="flex gap-1 items-center">
          <div className="w-16 shrink-0" />
          {Array.from({ length: 16 }, (_, c) => (
            <div
              key={c}
              className={`flex-1 text-center font-mono text-[8px] opacity-40 ${c % 4 === 0 ? "opacity-70" : ""}`}
            >
              {c % 4 === 0 ? c / 4 + 1 : "·"}
            </div>
          ))}
        </div>
      </div>

      {/* Drum Rack pads — pointer events for mobile */}
      <div>
        <h4 className="font-display text-xl mb-2">DRUM RACK PADS</h4>
        <div className="grid grid-cols-4 gap-2">
          {PADS.map((p, i) => (
            <button
              key={p.name}
              onPointerDown={() => handlePad(p, i)}
              className={[
                p.color,
                "brutal-border h-20 font-display text-lg brutal-press touch-none select-none transition-opacity",
                padFlash === i ? "opacity-60" : "",
              ].join(" ")}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="brutal-border bg-ink text-bone p-3 font-mono text-[10px] uppercase opacity-80 leading-relaxed">
        TIP: In Ableton, the Drum Rack maps each pad to a MIDI note. Steps 1–4 = Beat 1, steps 5–8 =
        Beat 2, and so on. The highlighted step is the playhead — audio is scheduled{" "}
        <span className="text-acid">{LOOK_AHEAD * 1000}ms ahead</span> of the clock for glitch-free
        timing.
      </div>
    </div>
  );
}
