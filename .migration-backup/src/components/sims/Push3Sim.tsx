// Push3Sim — 8x8 pad grid, mode switcher (drum / melodic / step-seq),
// optional scale lock.
import { useMemo, useState } from "react";
import { getCtx, getMaster, startLoop, type SampleName } from "@/lib/audio";

type Mode = "drum" | "melodic" | "session";
const SCALES: Record<string, number[]> = {
  major:   [0, 2, 4, 5, 7, 9, 11],
  minor:   [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
};

const DRUM_SAMPLES: SampleName[] = ["drum-loop", "bass-loop", "chord-pad", "vox-chop"];

export function Push3Sim() {
  const [mode, setMode] = useState<Mode>("melodic");
  const [scaleId, setScaleId] = useState<keyof typeof SCALES>("minor");
  const [root, setRoot] = useState(60);
  const [steps, setSteps] = useState<boolean[]>(Array(16).fill(false));

  const scale = SCALES[scaleId];

  // Build melodic grid: 8x8, ascending in-scale notes starting at root.
  const melodicGrid = useMemo(() => {
    const out: number[] = [];
    let i = 0;
    while (out.length < 64) {
      const octave = Math.floor(i / scale.length);
      const deg = scale[i % scale.length];
      out.push(root + octave * 12 + deg);
      i++;
    }
    return out;
  }, [root, scale]);

  const playPad = async (idx: number) => {
    const c = getCtx(); if (!c) return;
    if (c.state !== "running") { try { await c.resume(); } catch {} }
    if (mode === "drum") {
      const sample = DRUM_SAMPLES[idx % DRUM_SAMPLES.length];
      const g = c.createGain(); g.gain.value = 0.5; g.connect(getMaster());
      const h = startLoop(sample, 100, g);
      setTimeout(() => { h.stop(); try { g.disconnect(); } catch {} }, 250);
    } else if (mode === "melodic") {
      // Simple sine ping at the pad's pitch
      const note = melodicGrid[idx];
      const freq = 440 * Math.pow(2, (note - 69) / 12);
      const osc = c.createOscillator(); osc.type = "triangle"; osc.frequency.value = freq;
      const g = c.createGain(); g.gain.value = 0; g.connect(getMaster());
      osc.connect(g);
      const t = c.currentTime;
      g.gain.linearRampToValueAtTime(0.3, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.start(t); osc.stop(t + 0.7);
    }
  };

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-2 items-center font-mono text-xs uppercase">
        <span className="font-display text-lg">PUSH 3</span>
        {(["melodic", "drum", "session"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`brutal-border px-3 py-1.5 brutal-press ${mode === m ? "bg-acid text-ink" : "bg-bone text-ink"}`}>
            {m}
          </button>
        ))}
        {mode === "melodic" && (
          <>
            <select value={scaleId} onChange={(e) => setScaleId(e.target.value as keyof typeof SCALES)} className="brutal-border bg-bone text-ink px-2 py-1">
              {Object.keys(SCALES).map((s) => <option key={s}>{s}</option>)}
            </select>
            <label className="flex items-center gap-1">ROOT
              <input type="range" min={48} max={72} value={root} onChange={(e) => setRoot(+e.target.value)} />
              {root}
            </label>
          </>
        )}
      </div>

      <div className="brutal-border bg-card p-3">
        <div className="grid grid-cols-8 gap-1 max-w-md mx-auto">
          {Array.from({ length: 64 }).map((_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const padIdx = (7 - row) * 8 + col; // bottom-left = 0
            if (mode === "session") {
              return <div key={i} className="brutal-border bg-bone aspect-square brutal-press flex items-center justify-center font-mono text-[8px]">{row + 1}.{col + 1}</div>;
            }
            const note = mode === "melodic" ? melodicGrid[padIdx] : 0;
            const isRoot = mode === "melodic" && ((note - root) % 12 === 0);
            const color = mode === "drum"
              ? (padIdx < 16 ? "bg-acid" : padIdx < 32 ? "bg-volt text-bone" : padIdx < 48 ? "bg-sun" : "bg-bone")
              : isRoot ? "bg-hot text-bone" : "bg-bone";
            return (
              <button key={i} onClick={() => playPad(padIdx)}
                className={`brutal-border ${color} aspect-square brutal-press flex items-end justify-center pb-0.5 font-mono text-[8px]`}>
                {mode === "melodic" && isRoot ? "R" : ""}
              </button>
            );
          })}
        </div>

        {mode === "drum" && (
          <div className="mt-3">
            <div className="font-mono text-[10px] uppercase mb-1">STEP SEQ (pad 1)</div>
            <div className="grid grid-cols-16 gap-1" style={{ display: "grid", gridTemplateColumns: "repeat(16, 1fr)" }}>
              {steps.map((on, i) => (
                <button key={i} onClick={() => setSteps((s) => s.map((v, k) => (k === i ? !v : v)))}
                  className={`brutal-border h-8 brutal-press ${on ? "bg-acid" : "bg-bone"} ${i % 4 === 0 ? "border-l-2" : ""}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="font-mono text-[11px] uppercase opacity-70">
        ▸ Melodic mode = scale-locked pads (root highlighted). Drum mode = 64 pads + step sequencer. Session mode = scene/clip grid.
      </p>
    </div>
  );
}
