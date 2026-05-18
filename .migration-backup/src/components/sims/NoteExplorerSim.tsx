// NoteExplorerSim — keyboard with scale overlay; click to hear interval names.
import { useState } from "react";
import { playTone, midiToFreq } from "@/lib/audio";

const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const SCALES: Record<string, number[]> = {
  Major:        [0,2,4,5,7,9,11],
  "Natural Minor":[0,2,3,5,7,8,10],
  Dorian:       [0,2,3,5,7,9,10],
  Mixolydian:   [0,2,4,5,7,9,10],
  "Minor Pentatonic":[0,3,5,7,10],
  "Blues":      [0,3,5,6,7,10],
  Chromatic:    [0,1,2,3,4,5,6,7,8,9,10,11],
};
const INTERVALS = ["R","♭2","2","♭3","3","4","♭5","5","♭6","6","♭7","7"];

export function NoteExplorerSim() {
  const [root, setRoot] = useState(0);
  const [scale, setScale] = useState<keyof typeof SCALES>("Major");
  const [last, setLast] = useState<{ note: string; interval: string } | null>(null);

  const inScale = (n: number) => SCALES[scale].includes((n - root + 12) % 12);
  const playNote = (n: number) => {
    playTone(midiToFreq(60 + root + n), 0, 0.6, "triangle", 0.25);
    setLast({ note: NOTES[(root + n) % 12], interval: INTERVALS[n % 12] });
  };

  // 2 octaves of white + black keys
  const keys = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-3 items-center">
        <label className="font-mono text-[10px] uppercase flex items-center gap-2">
          ROOT
          <select value={root} onChange={(e) => setRoot(+e.target.value)} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
            {NOTES.map((n, i) => <option key={n} value={i}>{n}</option>)}
          </select>
        </label>
        <label className="font-mono text-[10px] uppercase flex items-center gap-2">
          SCALE
          <select value={scale} onChange={(e) => setScale(e.target.value as keyof typeof SCALES)} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
            {Object.keys(SCALES).map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <span className="ml-auto font-mono text-[10px] uppercase">
          {last ? `${last.note} · ${last.interval}` : "Click a key →"}
        </span>
      </div>

      <div className="brutal-border bg-bone p-3 flex gap-0.5">
        {keys.map((n) => {
          const pc = (root + n) % 12;
          const isBlack = [1,3,6,8,10].includes(pc);
          const lit = inScale(n);
          return (
            <button key={n} onClick={() => playNote(n)}
              className={`brutal-border ${isBlack ? "h-16 w-6 bg-ink text-bone" : "h-24 w-8 bg-bone text-ink"} ${lit ? (isBlack ? "!bg-volt" : "!bg-acid") : ""} flex flex-col items-end justify-end p-1 font-mono text-[8px]`}>
              {NOTES[(root + n) % 12]}
            </button>
          );
        })}
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ Highlighted keys belong to the selected scale. Click to hear them and see the interval.</p>
    </div>
  );
}
