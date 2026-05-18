// ScaleAwareSim — set a scale + root, toggle Scale Awareness on/off,
// see out-of-scale notes get folded. Audition the result.
import { useMemo, useState } from "react";
import { getCtx, getMaster, midiToFreq, playTone } from "@/lib/audio";

const ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
type ScaleId = "major" | "minor" | "dorian" | "phrygian" | "lydian" | "mixolydian" | "harmonic-minor" | "pentatonic";
const SCALES: Record<ScaleId, number[]> = {
  major:           [0, 2, 4, 5, 7, 9, 11],
  minor:           [0, 2, 3, 5, 7, 8, 10],
  dorian:          [0, 2, 3, 5, 7, 9, 10],
  phrygian:        [0, 1, 3, 5, 7, 8, 10],
  lydian:          [0, 2, 4, 6, 7, 9, 11],
  mixolydian:      [0, 2, 4, 5, 7, 9, 10],
  "harmonic-minor":[0, 2, 3, 5, 7, 8, 11],
  pentatonic:      [0, 2, 4, 7, 9],
};

// A random off-scale melody
const SEED = [60, 61, 63, 64, 66, 67, 69, 70, 72, 73];

function fold(pitch: number, root: number, scale: number[]): number {
  const rel = ((pitch - root) % 12 + 12) % 12;
  // Find closest scale degree
  let best = scale[0], bestDist = 99;
  for (const s of scale) {
    const d = Math.min(Math.abs(s - rel), 12 - Math.abs(s - rel));
    if (d < bestDist) { bestDist = d; best = s; }
  }
  return pitch + (best - rel);
}

export function ScaleAwareSim() {
  const [root, setRoot] = useState(0); // C
  const [scaleId, setScaleId] = useState<ScaleId>("minor");
  const [aware, setAware] = useState(true);

  const scale = SCALES[scaleId];
  const folded = useMemo(() => SEED.map((p) => fold(p, root, scale)), [root, scale]);

  const audition = async () => {
    const c = getCtx(); if (!c) return;
    if (c.state !== "running") { try { await c.resume(); } catch {} }
    const pitches = aware ? folded : SEED;
    pitches.forEach((p, i) => playTone(midiToFreq(p), i * 0.25, 0.3, "triangle", 0.18, getMaster()));
  };

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-2 items-center">
        <label className="font-mono text-xs uppercase flex items-center gap-1">
          ROOT
          <select value={root} onChange={(e) => setRoot(+e.target.value)} className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-xs">
            {ROOTS.map((r, i) => <option key={r} value={i}>{r}</option>)}
          </select>
        </label>
        <label className="font-mono text-xs uppercase flex items-center gap-1">
          SCALE
          <select value={scaleId} onChange={(e) => setScaleId(e.target.value as ScaleId)} className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-xs">
            {(Object.keys(SCALES) as ScaleId[]).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <button onClick={() => setAware((a) => !a)}
          className={`brutal-border px-3 py-1.5 font-mono text-xs uppercase brutal-press ${aware ? "bg-acid text-ink" : "bg-bone text-ink"}`}>
          SCALE AWARE: {aware ? "ON" : "OFF"}
        </button>
        <button onClick={audition} className="brutal-border bg-hot text-bone px-3 py-1.5 font-mono text-xs uppercase brutal-press ml-auto">▶ AUDITION</button>
      </div>

      <Keyboard root={root} scale={scale} active={aware ? folded : SEED} />

      <div className="grid md:grid-cols-2 gap-3">
        <Notes title="Raw notes (random)" pitches={SEED} />
        <Notes title={aware ? "Folded to scale" : "Off — raw passes through"} pitches={aware ? folded : SEED} accent />
      </div>

      <p className="font-mono text-[11px] uppercase opacity-70">
        ▸ With scale awareness ON, every out-of-scale note snaps to the nearest in-scale degree.
        Push 3's grid hides the same notes physically.
      </p>
    </div>
  );
}

function Keyboard({ root, scale, active }: { root: number; scale: number[]; active: number[] }) {
  const start = 48, end = 84;
  const inScale = (p: number) => scale.includes(((p - root) % 12 + 12) % 12);
  const activeSet = new Set(active);
  return (
    <div className="brutal-border bg-bone p-2 overflow-x-auto">
      <div className="flex" style={{ minWidth: 600 }}>
        {Array.from({ length: end - start }).map((_, i) => {
          const p = start + i;
          const inS = inScale(p);
          const isActive = activeSet.has(p);
          return (
            <div key={p} title={`${p}`}
              className={`flex-1 brutal-border h-14 flex items-end justify-center pb-1 font-mono text-[8px] ${
                isActive ? "bg-hot text-bone" : inS ? "bg-acid text-ink" : "bg-card text-ink opacity-40"
              }`}>
              {p % 12 === 0 ? `C${Math.floor(p / 12) - 1}` : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Notes({ title, pitches, accent }: { title: string; pitches: number[]; accent?: boolean }) {
  return (
    <div className={`brutal-border ${accent ? "bg-acid" : "bg-bone"} p-2`}>
      <div className="font-mono text-[10px] uppercase mb-1">{title}</div>
      <div className="font-mono text-xs">{pitches.join(" · ")}</div>
    </div>
  );
}
