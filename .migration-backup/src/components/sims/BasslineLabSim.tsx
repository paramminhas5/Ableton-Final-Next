// BasslineLabSim — 16-step bass pattern with octave + note picker, synced against a drum loop.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, playTone, midiToFreq, startLoop, type LoopHandle } from "@/lib/audio";

const STEPS = 16;
const SCALE = [0,2,3,5,7,8,10]; // natural minor

export function BasslineLabSim() {
  const [notes, setNotes] = useState<(number | null)[]>(() => {
    const arr = new Array(STEPS).fill(null) as (number | null)[];
    arr[0] = 0; arr[4] = 0; arr[8] = 5; arr[12] = 3;
    return arr;
  });
  const [octave, setOctave] = useState(-1);
  const [bpm] = useState(120);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const stepRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const drumLoop = useRef<LoopHandle | null>(null);

  const cycleNote = (i: number) =>
    setNotes((ns) => ns.map((v, j) => {
      if (j !== i) return v;
      if (v === null) return SCALE[0];
      const idx = SCALE.indexOf(v);
      if (idx === SCALE.length - 1) return null;
      return SCALE[idx + 1];
    }));

  useEffect(() => {
    if (!playing) return;
    const c = getCtx(); if (!c) return;
    if (c.state !== "running") c.resume().catch(() => {});
    drumLoop.current = startLoop("drum-loop", bpm, getMaster());
    const tick = () => {
      const i = stepRef.current % STEPS;
      setStep(i);
      const n = notes[i];
      if (n !== null) {
        const midi = 45 + n + octave * 12; // A2 root
        playTone(midiToFreq(midi), 0, 0.2, "sawtooth", 0.3);
      }
      stepRef.current++;
      timerRef.current = window.setTimeout(tick, (60 / bpm) / 4 * 1000);
    };
    tick();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      drumLoop.current?.stop();
    };
  }, [playing, bpm, notes, octave]);

  const stop = () => { setPlaying(false); setStep(-1); stepRef.current = 0; drumLoop.current?.stop(); };

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-3 items-center">
        <button onClick={() => (playing ? stop() : setPlaying(true))}
          className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}>
          {playing ? "■ STOP" : "▶ PLAY w/ DRUMS"}
        </button>
        <label className="font-mono text-[10px] uppercase flex items-center gap-2">
          OCTAVE
          <select value={octave} onChange={(e) => setOctave(+e.target.value)} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
            <option value={-2}>−2</option><option value={-1}>−1</option><option value={0}>0</option>
          </select>
        </label>
        <span className="ml-auto font-mono text-[10px] uppercase opacity-80">A-minor scale · click steps to cycle notes</span>
      </div>

      <div className="brutal-border bg-card p-2 flex gap-1 overflow-x-auto">
        {notes.map((n, i) => (
          <button key={i} onClick={() => cycleNote(i)}
            className={`brutal-border w-8 h-16 flex items-end justify-center pb-1 font-mono text-[10px] brutal-press ${n === null ? "bg-bone" : "bg-volt text-bone"} ${step === i ? "ring-2 ring-ink" : ""} ${i % 4 === 0 ? "ml-1" : ""}`}>
            {n === null ? "·" : n}
          </button>
        ))}
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ A bassline locks rhythm + harmony. Stay on root notes (0) for a heavy groove; add 5 and 3 for movement.</p>
    </div>
  );
}
