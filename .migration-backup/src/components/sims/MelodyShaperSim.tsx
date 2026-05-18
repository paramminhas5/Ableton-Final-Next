// MelodyShaperSim — draw a melodic contour on a grid; hear it played back.
import { useRef, useState } from "react";
import { playTone, midiToFreq } from "@/lib/audio";

const STEPS = 16;
const PITCHES = 12; // 1 octave in semitones

export function MelodyShaperSim() {
  const [notes, setNotes] = useState<(number | null)[]>(new Array(STEPS).fill(null));
  const drawing = useRef(false);

  const set = (col: number, row: number) =>
    setNotes((ns) => ns.map((v, i) => (i === col ? row : v)));

  const play = async () => {
    for (let i = 0; i < STEPS; i++) {
      const n = notes[i];
      if (n !== null) playTone(midiToFreq(60 + n), 0, 0.18, "triangle", 0.25);
      await new Promise((r) => setTimeout(r, 150));
    }
  };

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex gap-3 items-center">
        <button onClick={play} className="brutal-border bg-acid text-ink px-4 py-2 font-display text-lg brutal-press">▶ PLAY MELODY</button>
        <button onClick={() => setNotes(new Array(STEPS).fill(null))} className="brutal-border bg-bone text-ink px-3 py-2 font-mono text-[10px] uppercase brutal-press">CLEAR</button>
        <span className="ml-auto font-mono text-[10px] uppercase opacity-80">Click / drag to draw</span>
      </div>

      <div className="brutal-border bg-card p-1"
        onMouseDown={() => (drawing.current = true)}
        onMouseUp={() => (drawing.current = false)}
        onMouseLeave={() => (drawing.current = false)}>
        {Array.from({ length: PITCHES }).map((_, r) => {
          const row = PITCHES - 1 - r;
          return (
            <div key={row} className="flex gap-0.5 mb-0.5">
              {Array.from({ length: STEPS }).map((_, c) => {
                const active = notes[c] === row;
                return (
                  <button key={c}
                    onMouseDown={() => set(c, row)}
                    onMouseEnter={() => drawing.current && set(c, row)}
                    className={`brutal-border w-6 h-5 ${active ? "bg-acid" : "bg-bone"} ${c % 4 === 0 ? "ml-1" : ""}`} />
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ A melody is contour + rhythm. Move stepwise for singable lines; jump for hooks.</p>
    </div>
  );
}
