// BeatBuilderSim — 4×16 step sequencer (kick/snare/hat/perc) with swing slider.
// Models the learningmusic.ableton.com "Beats" exercise.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, playKick, playSnare, playHat, playClap } from "@/lib/audio";

type Voice = (dest: AudioNode) => void;
type Row = { id: string; label: string; play: Voice; color: string };
const ROWS: Row[] = [
  { id: "k", label: "KICK",  play: (d) => playKick(0, d),  color: "bg-acid" },
  { id: "s", label: "SNARE", play: (d) => playSnare(0, d), color: "bg-hot text-bone" },
  { id: "h", label: "HAT",   play: (d) => playHat(0, false, d), color: "bg-volt text-bone" },
  { id: "p", label: "PERC",  play: (d) => playClap(0, d),  color: "bg-sun" },
];
const STEPS = 16;

const PRESETS: Record<string, boolean[][]> = {
  "Four-on-the-floor": [
    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
    [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
    [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],
    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
  ],
  "Boom-bap": [
    [true,false,false,false,false,false,true,false,false,false,true,false,false,false,false,false],
    [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
    [true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false],
    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
  ],
  "Empty": ROWS.map(() => new Array(STEPS).fill(false)),
};

export function BeatBuilderSim() {
  const [grid, setGrid] = useState<boolean[][]>(PRESETS["Four-on-the-floor"].map((r) => [...r]));
  const [bpm, setBpm] = useState(120);
  const [swing, setSwing] = useState(0);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const stepRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const toggle = (r: number, s: number) =>
    setGrid((g) => g.map((row, ri) => (ri === r ? row.map((v, si) => (si === s ? !v : v)) : row)));

  useEffect(() => {
    if (!playing) return;
    const c = getCtx();
    if (!c) return;
    if (c.state !== "running") c.resume().catch(() => {});
    const tick = () => {
      const i = stepRef.current % STEPS;
      setStep(i);
      ROWS.forEach((row, ri) => {
        if (grid[ri][i]) row.play(getMaster());
      });
      stepRef.current++;
      const sixteenth = (60 / bpm) / 4 * 1000;
      const isOff = (i % 2) === 1;
      const swingMs = isOff ? sixteenth * (swing / 100) * 0.5 : 0;
      timerRef.current = window.setTimeout(tick, sixteenth + swingMs);
    };
    tick();
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [playing, bpm, swing, grid]);

  const stop = () => { setPlaying(false); setStep(-1); stepRef.current = 0; };

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-3 items-center">
        <button onClick={() => (playing ? stop() : setPlaying(true))}
          className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}>
          {playing ? "■ STOP" : "▶ PLAY"}
        </button>
        <label className="font-mono text-[10px] uppercase flex items-center gap-2">
          BPM <input type="range" min={60} max={180} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-24" /> <span className="w-8 text-right">{bpm}</span>
        </label>
        <label className="font-mono text-[10px] uppercase flex items-center gap-2">
          SWING <input type="range" min={0} max={70} value={swing} onChange={(e) => setSwing(+e.target.value)} className="w-24" /> <span className="w-8 text-right">{swing}%</span>
        </label>
        <select onChange={(e) => setGrid(PRESETS[e.target.value].map((r) => [...r]))}
          className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase">
          {Object.keys(PRESETS).map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="brutal-border bg-card p-2 space-y-1 overflow-x-auto">
        {ROWS.map((row, ri) => (
          <div key={row.id} className="flex gap-1 items-center">
            <div className={`${row.color} brutal-border w-16 shrink-0 text-center font-mono text-[10px] py-2`}>{row.label}</div>
            {grid[ri].map((on, si) => (
              <button key={si} onClick={() => toggle(ri, si)}
                className={`brutal-border w-7 h-9 brutal-press ${on ? row.color : "bg-bone"} ${step === si ? "ring-2 ring-ink" : ""} ${si % 4 === 0 ? "ml-1" : ""}`} />
            ))}
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ Click cells to toggle steps. Swing pushes off-beats later for a humanised groove.</p>
    </div>
  );
}
