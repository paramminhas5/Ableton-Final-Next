// CompLakeSim — show 4 take lanes, swipe across them to comp a winning take.
import { useState } from "react";
import { getCtx, getMaster, midiToFreq, playTone } from "@/lib/audio";

const BARS = 8;
const TAKES = 4;

// Each take "quality" per bar (mocked) — lets us pretend-grade the comp
const QUALITY: number[][] = [
  [6, 4, 7, 9, 5, 6, 4, 5], // take 1
  [4, 8, 6, 4, 7, 5, 9, 6], // take 2
  [8, 5, 5, 6, 4, 8, 6, 9], // take 3
  [5, 6, 8, 5, 9, 7, 5, 4], // take 4
];

const BEST = QUALITY[0].map((_, b) => {
  let best = 0;
  for (let t = 0; t < TAKES; t++) if (QUALITY[t][b] > QUALITY[best][b]) best = t;
  return best;
});

export function CompLakeSim() {
  const [comp, setComp] = useState<number[]>(Array(BARS).fill(0));
  const score = comp.reduce((acc, t, b) => acc + QUALITY[t][b], 0);
  const max = QUALITY[0].map((_, b) => Math.max(...QUALITY.map((r) => r[b]))).reduce((a, b) => a + b, 0);
  const pct = Math.round((score / max) * 100);

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-2 items-center font-mono text-xs uppercase">
        <span>SCORE {score}/{max} ({pct}%)</span>
        <span className="opacity-70">Click a bar in each take lane to pick the winning slice.</span>
        <button onClick={async () => {
          const c = getCtx(); if (!c) return;
          if (c.state !== "running") { try { await c.resume(); } catch {} }
          // Each take has its own vocal "pitch lane"; play the comp's pitches with quality-mapped velocity.
          const PITCH_PER_TAKE = [60, 62, 64, 67];
          comp.forEach((t, b) => {
            const q = QUALITY[t][b];
            playTone(midiToFreq(PITCH_PER_TAKE[t]), b * 0.22, 0.2, "triangle", 0.08 + q * 0.015, getMaster());
          });
        }} className="brutal-border bg-hot text-bone px-3 py-1.5 brutal-press">▶ AUDITION COMP</button>
        <button onClick={() => setComp(BEST)} className="brutal-border bg-acid text-ink px-3 py-1.5 brutal-press ml-auto">AUTO-COMP</button>
        <button onClick={() => setComp(Array(BARS).fill(0))} className="brutal-border bg-bone text-ink px-3 py-1.5 brutal-press">RESET</button>
      </div>

      {QUALITY.map((take, t) => (
        <div key={t} className="grid grid-cols-9 gap-1 items-center">
          <div className="font-mono text-[10px] uppercase">TAKE {t + 1}</div>
          {take.map((q, b) => {
            const chosen = comp[b] === t;
            const hue = Math.round((q / 9) * 120); // 0=red,120=green
            return (
              <button
                key={b}
                onClick={() => setComp((c) => c.map((v, i) => (i === b ? t : v)))}
                style={{ background: chosen ? `hsl(${hue} 80% 55%)` : `hsl(${hue} 40% 75%)` }}
                className={`brutal-border h-10 brutal-press text-[10px] font-mono ${chosen ? "ring-2 ring-ink" : ""}`}
                title={`Quality ${q}/9`}
              >
                {q}
              </button>
            );
          })}
        </div>
      ))}

      <div className="grid grid-cols-9 gap-1 items-center mt-2">
        <div className="font-mono text-[10px] uppercase">COMP</div>
        {comp.map((t, b) => (
          <div key={b} className="brutal-border bg-volt text-bone h-10 flex items-center justify-center font-mono text-xs">
            T{t + 1}
          </div>
        ))}
      </div>

      <p className="font-mono text-[11px] uppercase opacity-70">
        ▸ This is exactly Live's Take Lanes — except your "quality scores" are your ears.
        Hit AUTO-COMP to see the optimal take per bar.
      </p>
    </div>
  );
}
