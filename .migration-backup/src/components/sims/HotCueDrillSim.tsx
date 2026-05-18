// HotCueDrillSim — set 4 hot cues on a waveform, then recall them by name.
import { useState } from "react";

const POSITIONS = ["intro", "drop", "break", "outro"] as const;
type CueName = typeof POSITIONS[number];

export function HotCueDrillSim() {
  const [cues, setCues] = useState<Record<CueName, number | null>>({ intro: null, drop: null, break: null, outro: null });
  const [head, setHead] = useState(0);
  const [target, setTarget] = useState<CueName | null>(null);
  const [score, setScore] = useState({ hits: 0, miss: 0 });

  const setCue = (n: CueName) => setCues((c) => ({ ...c, [n]: head }));
  const jump = (n: CueName) => { const p = cues[n]; if (p !== null) setHead(p); };

  const startDrill = () => {
    const names = POSITIONS.filter((n) => cues[n] !== null);
    if (names.length === 0) return;
    setTarget(names[Math.floor(Math.random() * names.length)]);
  };
  const recall = (n: CueName) => {
    if (!target) return;
    if (n === target) setScore((s) => ({ ...s, hits: s.hits + 1 }));
    else setScore((s) => ({ ...s, miss: s.miss + 1 }));
    startDrill();
  };

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-2 items-center">
        <span className="font-mono text-[10px] uppercase">Head: {head}%</span>
        <input type="range" min={0} max={100} value={head} onChange={(e) => setHead(+e.target.value)} className="flex-1 min-w-[120px]" />
        <span className="font-mono text-[10px] uppercase opacity-80">Hits {score.hits} · Misses {score.miss}</span>
      </div>

      <div className="brutal-border bg-bone relative h-16 overflow-hidden">
        <div className="absolute inset-0 flex items-center px-2 gap-px">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="bg-ink" style={{ width: 2, height: `${20 + Math.abs(Math.sin(i * 0.4)) * 70}%` }} />
          ))}
        </div>
        {POSITIONS.map((n, i) => cues[n] !== null && (
          <div key={n} className={`absolute top-0 bottom-0 w-1 ${["bg-acid","bg-hot","bg-volt","bg-sun"][i]}`} style={{ left: `${cues[n]}%` }} />
        ))}
        <div className="absolute top-0 bottom-0 w-0.5 bg-ink animate-pulse" style={{ left: `${head}%` }} />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {POSITIONS.map((n) => (
          <div key={n} className="brutal-border bg-card p-2 space-y-1">
            <div className="font-mono text-[10px] uppercase">{n}</div>
            <button onClick={() => setCue(n)} className="w-full brutal-border bg-bone px-2 py-1 font-mono text-[9px] uppercase brutal-press">SET</button>
            <button onClick={() => jump(n)} disabled={cues[n] === null} className={`w-full brutal-border px-2 py-1 font-mono text-[9px] uppercase brutal-press ${cues[n] === null ? "bg-bone opacity-40" : "bg-acid"}`}>JUMP</button>
            {target && (
              <button onClick={() => recall(n)} className="w-full brutal-border bg-volt text-bone px-2 py-1 font-mono text-[9px] uppercase brutal-press">PICK</button>
            )}
          </div>
        ))}
      </div>

      <button onClick={startDrill} className="brutal-border bg-acid px-3 py-2 font-mono text-[10px] uppercase brutal-press">
        {target ? `▸ JUMP TO: ${target.toUpperCase()}` : "▶ START DRILL"}
      </button>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ Set cues at the structural moments, then drill recall under pressure.</p>
    </div>
  );
}
