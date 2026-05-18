// ChordStackerSim — pick root, quality, inversion. Hear strummed or arpeggiated.
// Optional in-context demo plays chord over a soft drum beat.
import { useEffect, useRef, useState } from "react";
import { ensureAudio, getCtx, getMaster, midiToFreq, playKick, playHat, playSnare, playTone } from "@/lib/audio";

const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const QUALITIES: Record<string, number[]> = {
  "Major":      [0,4,7],
  "Minor":      [0,3,7],
  "Diminished": [0,3,6],
  "Augmented":  [0,4,8],
  "Sus2":       [0,2,7],
  "Sus4":       [0,5,7],
  "Maj7":       [0,4,7,11],
  "Min7":       [0,3,7,10],
  "Dom7":       [0,4,7,10],
  "Maj9":       [0,4,7,11,14],
  "Min9":       [0,3,7,10,14],
  "Add9":       [0,4,7,14],
};

function invert(intervals: number[], inv: number): number[] {
  const r = [...intervals];
  for (let i = 0; i < inv; i++) {
    const first = r.shift()!;
    r.push(first + 12);
  }
  return r;
}

export function ChordStackerSim() {
  const [root, setRoot] = useState(0);
  const [quality, setQuality] = useState<keyof typeof QUALITIES>("Maj7");
  const [inv, setInv] = useState(0);
  const [arp, setArp] = useState(false);
  const [withBeat, setWithBeat] = useState(false);
  const beatRef = useRef<{ stop: () => void } | null>(null);

  const ivBase = QUALITIES[quality];
  const ivPlayed = invert(ivBase, Math.min(inv, ivBase.length - 1));
  const chordName = `${NOTES[root]} ${quality}${inv > 0 ? ` / ${inv}` : ""}`;

  const playChord = async () => {
    const ok = await ensureAudio(); if (!ok) return;
    ivPlayed.forEach((iv, i) => {
      playTone(midiToFreq(60 + root + iv), arp ? i * 0.09 : i * 0.005, 1.4, "triangle", 0.18);
    });
  };

  const stopBeat = () => { beatRef.current?.stop(); beatRef.current = null; setWithBeat(false); };

  const startBeat = async () => {
    const ok = await ensureAudio(); if (!ok) return;
    const ctx = getCtx()!;
    const dest = getMaster();
    const bpm = 90, beat = 60 / bpm;
    let stopped = false;
    let next = ctx.currentTime + 0.15;
    const tick = () => {
      if (stopped) return;
      while (next < ctx.currentTime + 0.4) {
        for (let b = 0; b < 4; b++) {
          const t = next + b * beat - ctx.currentTime;
          playKick(t, dest);
          playHat(t + beat / 2, false, dest);
        }
        playSnare(next + beat - ctx.currentTime, dest);
        playSnare(next + 3 * beat - ctx.currentTime, dest);
        // Chord on downbeat
        ivPlayed.forEach((iv, i) => {
          playTone(midiToFreq(60 + root + iv), next - ctx.currentTime + (arp ? i * 0.09 : 0), beat * 3.5, "triangle", 0.12, dest);
        });
        next += beat * 4;
      }
      setTimeout(tick, 60);
    };
    tick();
    beatRef.current = { stop: () => { stopped = true; } };
    setWithBeat(true);
  };

  useEffect(() => () => beatRef.current?.stop(), []);

  // Highlight: which pitch classes are in the chord
  const litPcs = new Set(ivPlayed.map((iv) => (root + iv) % 12));
  const keys = Array.from({ length: 36 }, (_, i) => i); // 3 octaves

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
          QUALITY
          <select value={quality} onChange={(e) => { setQuality(e.target.value as keyof typeof QUALITIES); setInv(0); }} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
            {Object.keys(QUALITIES).map((q) => <option key={q}>{q}</option>)}
          </select>
        </label>
        <label className="font-mono text-[10px] uppercase flex items-center gap-2">
          INV
          <select value={inv} onChange={(e) => setInv(+e.target.value)} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
            {ivBase.map((_, i) => <option key={i} value={i}>{i === 0 ? "root" : `${i}${i === 1 ? "st" : i === 2 ? "nd" : "rd"}`}</option>)}
          </select>
        </label>
        <button onClick={() => setArp((a) => !a)}
          className={`brutal-border px-2 py-1 font-mono text-[10px] uppercase brutal-press ${arp ? "bg-volt text-bone" : "bg-bone text-ink"}`}>
          ARP {arp ? "ON" : "OFF"}
        </button>
        <button onClick={playChord} className="brutal-border bg-acid text-ink px-3 py-1 font-mono text-[10px] uppercase brutal-press">▶ STRUM</button>
        <button onClick={() => (withBeat ? stopBeat() : startBeat())}
          className={`brutal-border px-3 py-1 font-mono text-[10px] uppercase brutal-press ${withBeat ? "bg-hot text-bone" : "bg-sun text-ink"}`}>
          {withBeat ? "■ BEAT" : "▶ IN SONG"}
        </button>
        <span className="ml-auto font-display text-lg">{chordName}</span>
      </div>

      <div className="brutal-border bg-bone p-3 flex gap-0.5 overflow-x-auto">
        {keys.map((n) => {
          const pc = (n + 60) % 12;
          const isBlack = [1,3,6,8,10].includes(pc);
          const lit = litPcs.has(pc);
          const isRoot = pc === root && lit;
          return (
            <div key={n}
              className={`brutal-border ${isBlack ? "h-16 w-6 bg-ink text-bone" : "h-24 w-8 bg-bone text-ink"} ${lit ? (isRoot ? "!bg-hot !text-bone" : isBlack ? "!bg-volt" : "!bg-acid") : ""} flex flex-col items-center justify-end p-1 font-mono text-[8px]`}>
              {lit ? NOTES[pc] : ""}
            </div>
          );
        })}
      </div>

      <div className="brutal-border bg-card p-3 font-mono text-[10px] uppercase opacity-80">
        <div>NOTES: <span className="font-bold">{ivPlayed.map((iv) => NOTES[(root + iv) % 12]).join(" · ")}</span></div>
        <div className="mt-1">▸ HOT pink = root · ACID green = chord tones. Try INV 1 → bass note shifts up an octave; same chord, new voicing.</div>
      </div>
    </div>
  );
}
