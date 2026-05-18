import { Fragment, useEffect, useRef, useState } from "react";
import { useMidi } from "@/lib/midi";
import { midiToFreq, playTone } from "@/lib/audio";

const ROWS = 16; // notes (C3 down to A1-ish)
const COLS = 16;
const BASE = 72; // C5 top

type Note = { r: number; c: number; len: number };

export function PianoRollSim() {
  const [notes, setNotes] = useState<Note[]>([
    { r: 7, c: 0, len: 2 },
    { r: 5, c: 2, len: 2 },
    { r: 3, c: 4, len: 2 },
    { r: 5, c: 6, len: 2 },
    { r: 7, c: 8, len: 2 },
    { r: 5, c: 10, len: 2 },
    { r: 3, c: 12, len: 2 },
    { r: 0, c: 14, len: 2 },
  ]);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(110);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const notesRef = useRef(notes);
  notesRef.current = notes;

  const { connected: midiConnected, inputNames: midiNames } = useMidi({
    onNoteOn: (note, vel) => {
      const row = BASE - note;
      if (row >= 0 && row < ROWS) {
        playTone(midiToFreq(note), 0, 0.5, "triangle", (vel / 127) * 0.3);
      }
    },
  });

  useEffect(() => {
    if (!playing) return;
    const ms = ((60 / bpm) * 1000) / 4;
    const id = window.setInterval(() => {
      const s = stepRef.current;
      notesRef.current
        .filter((n) => n.c === s)
        .forEach((n) => {
          playTone(midiToFreq(BASE - n.r), 0, ((n.len * ms) / 1000) * 0.9, "triangle", 0.2);
        });
      stepRef.current = (s + 1) % COLS;
      setStep(stepRef.current);
    }, ms);
    return () => clearInterval(id);
  }, [playing, bpm]);

  const toggle = (r: number, c: number) => {
    const i = notes.findIndex((n) => n.r === r && c >= n.c && c < n.c + n.len);
    if (i >= 0) setNotes(notes.filter((_, idx) => idx !== i));
    else {
      setNotes([...notes, { r, c, len: 1 }]);
      playTone(midiToFreq(BASE - r), 0, 0.2, "triangle", 0.2);
    }
  };

  const isBlack = (n: number) => [1, 3, 6, 8, 10].includes((((BASE - n) % 12) + 12) % 12);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="brutal-border bg-acid px-4 py-2 font-mono uppercase brutal-press"
        >
          {playing ? "■ Stop" : "▶ Play"}
        </button>
        <label className="font-mono text-xs uppercase flex items-center gap-2">
          BPM
          <input
            type="range"
            min={60}
            max={180}
            value={bpm}
            onChange={(e) => setBpm(+e.target.value)}
          />
          <span className="brutal-border bg-bone px-2 py-1">{bpm}</span>
        </label>
        <button
          onClick={() => setNotes([])}
          className="brutal-border bg-bone px-3 py-2 font-mono uppercase brutal-press"
        >
          Clear
        </button>
      </div>

      <div className="brutal-border bg-card overflow-x-auto">
        <div
          className="grid"
          style={{ gridTemplateColumns: `60px repeat(${COLS}, minmax(28px, 1fr))` }}
        >
          {Array.from({ length: ROWS }).map((_, r) => (
            <Fragment key={`row-${r}`}>
              <div
                className={`brutal-border border-y-0 border-l-0 px-2 py-1 font-mono text-[10px] ${isBlack(r) ? "bg-ink text-bone" : "bg-bone"}`}
              >
                {noteName(BASE - r)}
              </div>
              {Array.from({ length: COLS }).map((_, c) => {
                const n = notes.find((nn) => nn.r === r && c >= nn.c && c < nn.c + nn.len);
                const playingCol = playing && step === c;
                return (
                  <button
                    key={`c-${r}-${c}`}
                    onClick={() => toggle(r, c)}
                    className={`brutal-border border-y-0 border-l-0 h-7 ${n ? "bg-acid" : isBlack(r) ? "bg-muted" : "bg-card"} ${playingCol ? "outline outline-2 outline-hot" : ""}`}
                    aria-label={`note ${r}-${c}`}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
      <p className="font-mono text-xs uppercase opacity-70">
        Click cells to draw notes. Press Play to hear them.
      </p>
    </div>
  );
}

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function noteName(midi: number) {
  return `${NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}
