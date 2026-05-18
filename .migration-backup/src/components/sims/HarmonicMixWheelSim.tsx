// HarmonicMixWheelSim — Camelot wheel; pick a key and see compatible next keys.
import { useState } from "react";

// Camelot codes 1A..12A (minor) / 1B..12B (major)
const KEYS = Array.from({ length: 12 }, (_, i) => i + 1);

export function HarmonicMixWheelSim() {
  const [num, setNum] = useState(8);
  const [mode, setMode] = useState<"A" | "B">("A");

  const code = `${num}${mode}`;
  const compatible = [
    `${num}${mode}`,                                  // same
    `${num}${mode === "A" ? "B" : "A"}`,              // relative
    `${num === 12 ? 1 : num + 1}${mode}`,             // +1
    `${num === 1 ? 12 : num - 1}${mode}`,             // -1
  ];

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-3 items-center">
        <span className="font-mono text-[10px] uppercase">CURRENT KEY:</span>
        <span className="font-display text-3xl">{code}</span>
        <button onClick={() => setMode((m) => (m === "A" ? "B" : "A"))} className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase brutal-press">
          {mode === "A" ? "→ MAJOR (B)" : "→ MINOR (A)"}
        </button>
      </div>

      <div className="brutal-border bg-card p-4">
        <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
          {KEYS.map((n) => {
            const c = `${n}${mode}`;
            const ok = compatible.includes(c);
            const cur = n === num;
            return (
              <button key={c} onClick={() => setNum(n)}
                className={`brutal-border aspect-square font-mono text-xs brutal-press ${cur ? "bg-ink text-bone" : ok ? "bg-acid" : "bg-bone opacity-50"}`}>
                {c}
              </button>
            );
          })}
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase opacity-70">Green = harmonically compatible with {code}</div>
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ Harmonic mixing rule: same number, or ±1 on the wheel, or flip A↔B for relative major/minor.</p>
    </div>
  );
}
