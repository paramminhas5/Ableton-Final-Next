// LoopRollSim — chop a playing loop into ever-smaller divisions for build-ups.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, startLoop, type LoopHandle } from "@/lib/audio";

const DIVS = [1, 0.5, 0.25, 0.125, 0.0625] as const; // 1 bar → 1/16
const LABELS = ["1 BAR", "1/2", "1/4", "1/8", "1/16"];

export function LoopRollSim() {
  const [div, setDiv] = useState(0);
  const [playing, setPlaying] = useState(false);
  const loopRef = useRef<LoopHandle | null>(null);

  useEffect(() => {
    if (!playing) return;
    const c = getCtx(); if (!c) return;
    if (c.state !== "running") c.resume().catch(() => {});
    loopRef.current?.stop();
    // We approximate by scheduling drum-loop at a faster effective tempo.
    const bpm = 120 * (1 / Math.max(DIVS[div], 0.0625));
    loopRef.current = startLoop("drum-loop", Math.min(bpm, 480), getMaster());
    return () => loopRef.current?.stop();
  }, [playing, div]);

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-2 items-center">
        <button onClick={() => setPlaying((p) => !p)}
          className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}>
          {playing ? "■ STOP" : "▶ PLAY"}
        </button>
        <span className="ml-auto font-mono text-[10px] uppercase">Loop size: {LABELS[div]}</span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {DIVS.map((_, i) => (
          <button key={i} onClick={() => setDiv(i)}
            className={`brutal-border px-2 py-3 font-mono text-[10px] uppercase brutal-press ${i === div ? "bg-volt text-bone" : "bg-bone"}`}>
            {LABELS[i]}
          </button>
        ))}
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ Halve the loop, then halve again — instant build-up. Release back to 1 bar for the drop.</p>
    </div>
  );
}
