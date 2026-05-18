// BeatmatchTrainerSim — two decks, pitch fader, listen for phase lock.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, startLoop, type LoopHandle } from "@/lib/audio";

export function BeatmatchTrainerSim() {
  const [deckABpm] = useState(124);
  const [deckBBpm, setDeckBBpm] = useState(120);
  const [pitch, setPitch] = useState(0); // ±8% of deckBBpm
  const [playing, setPlaying] = useState(false);
  const aRef = useRef<LoopHandle | null>(null);
  const bRef = useRef<LoopHandle | null>(null);

  const adjustedB = Math.round(deckBBpm * (1 + pitch / 100) * 10) / 10;
  const diff = Math.round((deckABpm - adjustedB) * 10) / 10;
  const matched = Math.abs(diff) < 0.2;

  useEffect(() => {
    if (!playing) return;
    const c = getCtx(); if (!c) return;
    if (c.state !== "running") c.resume().catch(() => {});
    aRef.current?.stop(); bRef.current?.stop();
    aRef.current = startLoop("drum-loop", deckABpm, getMaster());
    bRef.current = startLoop("drum-loop", adjustedB, getMaster());
    return () => { aRef.current?.stop(); bRef.current?.stop(); };
  }, [playing, deckABpm, adjustedB]);

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-3 items-center">
        <button onClick={() => setPlaying((p) => !p)}
          className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}>
          {playing ? "■ STOP BOTH" : "▶ PLAY BOTH"}
        </button>
        <span className="ml-auto font-mono text-[10px] uppercase">{matched ? "✓ PHASE LOCK" : `Δ ${diff > 0 ? "+" : ""}${diff} BPM`}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-2">
        <div className="brutal-border bg-acid p-3 space-y-2">
          <div className="font-display text-2xl">DECK A</div>
          <div className="font-mono text-xs">BPM: {deckABpm} (locked)</div>
          <div className="font-mono text-[10px] uppercase opacity-70">This is the playing track. Match deck B to it.</div>
        </div>
        <div className="brutal-border bg-volt text-bone p-3 space-y-2">
          <div className="font-display text-2xl">DECK B</div>
          <div className="font-mono text-xs">Track BPM: {deckBBpm} → Adjusted: {adjustedB}</div>
          <label className="font-mono text-[10px] uppercase flex items-center gap-2">
            PITCH
            <input type="range" min={-8} max={8} step={0.1} value={pitch} onChange={(e) => setPitch(+e.target.value)} className="flex-1" />
            <span className="w-10 text-right">{pitch > 0 ? "+" : ""}{pitch}%</span>
          </label>
          <button onClick={() => setDeckBBpm(115 + Math.floor(Math.random() * 15))}
            className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase brutal-press">↻ NEW TRACK</button>
        </div>
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ Move the pitch fader until the two loops lock into one. That is beatmatching.</p>
    </div>
  );
}
