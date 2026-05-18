// GrooveExtractorSim — visualise + audition extracting a groove from a sampled loop
// and applying it (timing + velocity) to a stiff MIDI loop.
import { useMemo, useState } from "react";
import { getCtx, getMaster, playKick, playHat } from "@/lib/audio";

// A "sampled" groove (offsets in ticks, velocities)
const SOURCE = [
  { step: 0,  off: 0,    vel: 110 },
  { step: 4,  off: 0.18, vel: 90 },
  { step: 8,  off: -0.1, vel: 120 },
  { step: 12, off: 0.22, vel: 80 },
  { step: 16, off: 0,    vel: 115 },
  { step: 20, off: 0.16, vel: 88 },
  { step: 24, off: -0.08,vel: 118 },
  { step: 28, off: 0.24, vel: 78 },
];

// A stiff MIDI loop
const TARGET = Array.from({ length: 8 }).map((_, i) => ({ step: i * 4, vel: 100 }));

export function GrooveExtractorSim() {
  const [timing, setTiming] = useState(1.0);
  const [velocity, setVelocity] = useState(0.8);
  const [committed, setCommitted] = useState(false);

  const grooved = useMemo(() => TARGET.map((n, i) => {
    const g = SOURCE[i] ?? SOURCE[i % SOURCE.length];
    return {
      step: n.step + g.off * timing,
      vel:  Math.round(n.vel * (1 - velocity) + g.vel * velocity),
    };
  }), [timing, velocity]);

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-3 items-center font-mono text-xs uppercase">
        <span>SOURCE LOOP → GROOVE POOL → TARGET MIDI</span>
        <label className="flex items-center gap-1">TIMING {Math.round(timing * 100)}
          <input type="range" min={0} max={1.5} step={0.01} value={timing} onChange={(e) => setTiming(+e.target.value)} />
        </label>
        <label className="flex items-center gap-1">VELOCITY {Math.round(velocity * 100)}
          <input type="range" min={0} max={1} step={0.01} value={velocity} onChange={(e) => setVelocity(+e.target.value)} />
        </label>
        <button onClick={async () => {
          const c = getCtx(); if (!c) return;
          if (c.state !== "running") { try { await c.resume(); } catch {} }
          const sec = 0.12;
          const out = getMaster();
          grooved.forEach((n) => {
            const t = n.step * sec * 0.5;
            playKick(t, out);
            if (n.vel > 100) playHat(t + sec * 0.5, false, out);
          });
        }} className="brutal-border bg-hot text-bone px-3 py-1.5 brutal-press">▶ AUDITION</button>
        <button onClick={() => setCommitted((c) => !c)} className={`brutal-border px-3 py-1.5 brutal-press ml-auto ${committed ? "bg-hot text-bone" : "bg-acid text-ink"}`}>
          {committed ? "COMMITTED" : "COMMIT"}
        </button>
      </div>

      <Lane title="SOURCE (sampled break)" notes={SOURCE.map((n) => ({ step: n.step, vel: n.vel }))} accent="bg-sun" />
      <Lane title="TARGET — STIFF MIDI" notes={TARGET} accent="bg-bone" />
      <Lane title="TARGET + GROOVE APPLIED" notes={grooved} accent="bg-acid" highlight />

      <p className="font-mono text-[11px] uppercase opacity-70">
        ▸ Timing amount = how far notes slide toward the sampled feel. Velocity amount = how much dynamics borrow from the source.
      </p>
    </div>
  );
}

function Lane({ title, notes, accent, highlight }: { title: string; notes: { step: number; vel: number }[]; accent: string; highlight?: boolean }) {
  const W = 640, H = 60, STEPS = 32;
  const stepW = W / STEPS;
  return (
    <div className={`brutal-border ${highlight ? "ring-2 ring-ink" : ""} p-2 bg-card`}>
      <div className="font-mono text-[10px] uppercase mb-1">{title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12">
        {Array.from({ length: STEPS + 1 }).map((_, i) => (
          <line key={i} x1={i * stepW} x2={i * stepW} y1={0} y2={H} stroke="hsl(var(--border))" strokeWidth={i % 4 === 0 ? 1 : 0.3} />
        ))}
        {notes.map((n, i) => (
          <rect key={i}
            x={n.step * stepW} y={H - (n.vel / 127) * H}
            width={6} height={(n.vel / 127) * H}
            className={accent}
            stroke="currentColor" strokeWidth={1}
          />
        ))}
      </svg>
    </div>
  );
}
