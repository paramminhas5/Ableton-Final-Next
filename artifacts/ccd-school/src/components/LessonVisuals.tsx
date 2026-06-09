"use client";
/**
 * LessonVisuals — inline SVG/HTML visuals for Duolingo concept screens.
 * Each visual is self-contained, no external deps, no audio.
 * Used by LessonPlayer ConceptScreen and DiagramScreen.
 */
import { useEffect, useRef, useState } from "react";
import type { LessonScreen } from "@/content/types";

// ─── types ────────────────────────────────────────────────────────────────────
type VisualType = Extract<LessonScreen, { kind: "concept" }>["visual"];
type DiagramScreen = Extract<LessonScreen, { kind: "diagram" }>;

// ─── AnimatedWaveform ─────────────────────────────────────────────────────────
function AnimatedWaveform({ color = "#C6FF00" }: { color?: string }) {
  const [t, setT] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    let start: number;
    const tick = (now: number) => {
      if (!start) start = now;
      setT((now - start) / 1000);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  const pts = Array.from({ length: 100 }, (_, i) => {
    const x = (i / 99) * 200;
    const y = 30 + Math.sin((i / 99) * Math.PI * 4 + t * 2) * 20;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="brutal-border bg-ink overflow-hidden">
      <svg viewBox="0 0 200 60" className="w-full h-20" fill="none">
        <polyline points={pts} stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
      <div className="flex justify-between px-3 pb-2 font-mono text-[9px] text-bone/40 uppercase">
        <span>compression →</span><span>rarefaction</span>
      </div>
    </div>
  );
}


// ─── WaveformCompare ──────────────────────────────────────────────────────────
function WaveformCompare() {
  const waves: { label: string; fn: (x: number) => number; color: string }[] = [
    { label: "Sine", color: "#C6FF00", fn: x => Math.sin(x * Math.PI * 2) },
    { label: "Square", color: "#FFB800", fn: x => Math.sign(Math.sin(x * Math.PI * 2)) },
    { label: "Saw", color: "#FF2D2D", fn: x => 2 * (x % 1) - 1 },
  ];
  return (
    <div className="brutal-border bg-ink p-3 space-y-2">
      {waves.map(w => {
        const pts = Array.from({ length: 80 }, (_, i) => {
          const x = (i / 79) * 200;
          const y = 20 - w.fn(i / 79 * 2) * 14;
          return `${x},${y}`;
        }).join(" ");
        return (
          <div key={w.label} className="flex items-center gap-3">
            <span className="font-mono text-[9px] uppercase w-10 shrink-0" style={{ color: w.color }}>{w.label}</span>
            <svg viewBox="0 0 200 40" className="flex-1 h-8" fill="none">
              <polyline points={pts} stroke={w.color} strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

// ─── FrequencyBars ────────────────────────────────────────────────────────────
function FrequencyBars() {
  const zones = [
    { label: "Sub", hz: "20–60", bars: [30, 50, 70], color: "#7B2FFF" },
    { label: "Bass", hz: "60–250", bars: [80, 90, 75, 60], color: "#FF2D2D" },
    { label: "Mid", hz: "250–4k", bars: [55, 70, 85, 65, 50], color: "#C6FF00" },
    { label: "Hi-Mid", hz: "4–8k", bars: [40, 35, 45], color: "#FFB800" },
    { label: "Air", hz: "8–20k", bars: [20, 15, 10], color: "#7FFFFF" },
  ];
  return (
    <div className="brutal-border bg-ink p-3">
      <div className="flex items-end gap-px h-16">
        {zones.flatMap(z => z.bars.map((h, i) => (
          <div key={`${z.label}-${i}`} className="flex-1 transition-all duration-300"
            style={{ height: `${h}%`, background: z.color, opacity: 0.85 }} />
        )))}
      </div>
      <div className="flex mt-1">
        {zones.map(z => (
          <div key={z.label} className="flex-1 text-center">
            <div className="font-mono text-[8px] uppercase" style={{ color: z.color }}>{z.label}</div>
            <div className="font-mono text-[7px] text-bone/30">{z.hz}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── Piano (2 octaves, labelled) ──────────────────────────────────────────────
function PianoKeys({ octaves = 2 }: { octaves?: number }) {
  const notes = ["C", "D", "E", "F", "G", "A", "B"];
  const blackPos = [1, 2, 4, 5, 6]; // indices with a black key after them
  const whites: string[] = [];
  const blacks: { label: string; afterIdx: number }[] = [];
  for (let o = 0; o < octaves; o++) {
    notes.forEach((n, i) => {
      whites.push(`${n}${o + 3}`);
      if (blackPos.includes(i)) blacks.push({ label: `${n}#${o + 3}`, afterIdx: whites.length - 1 });
    });
  }
  const W = 100 / whites.length;
  return (
    <div className="brutal-border bg-ink p-2 overflow-hidden">
      <div className="relative" style={{ height: 64 }}>
        {whites.map((n, i) => (
          <div key={n} className="absolute bottom-0 brutal-border border-ink bg-bone flex items-end justify-center pb-1"
            style={{ left: `${i * W}%`, width: `${W}%`, height: "100%" }}>
            <span className="font-mono text-[7px] text-ink/50">{n}</span>
          </div>
        ))}
        {blacks.map(b => (
          <div key={b.label} className="absolute top-0 bg-ink z-10 flex items-end justify-center pb-0.5"
            style={{ left: `${(b.afterIdx + 1) * W - W * 0.3}%`, width: `${W * 0.6}%`, height: "60%" }}>
            <span className="font-mono text-[6px] text-bone/30">{b.label.replace(/\d/, "")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PianoOctave with Hz labels ───────────────────────────────────────────────
function PianoOctave() {
  const keys = [
    { note: "C4", hz: "262", black: false },
    { note: "C#4", hz: "277", black: true },
    { note: "D4", hz: "294", black: false },
    { note: "D#4", hz: "311", black: true },
    { note: "E4", hz: "330", black: false },
    { note: "F4", hz: "349", black: false },
    { note: "F#4", hz: "370", black: true },
    { note: "G4", hz: "392", black: false },
    { note: "G#4", hz: "415", black: true },
    { note: "A4", hz: "440", black: false },
    { note: "A#4", hz: "466", black: true },
    { note: "B4", hz: "494", black: false },
  ];
  const whites = keys.filter(k => !k.black);
  const W = 100 / whites.length;
  return (
    <div className="brutal-border bg-ink p-2">
      <div className="relative" style={{ height: 72 }}>
        {whites.map((k, i) => (
          <div key={k.note} className="absolute bottom-0 brutal-border border-ink bg-bone flex flex-col items-center justify-end pb-1 gap-0"
            style={{ left: `${i * W}%`, width: `${W}%`, height: "100%" }}>
            <span className="font-mono text-[7px] text-ink font-bold">{k.note.replace(/\d/, "")}</span>
            <span className="font-mono text-[6px] text-ink/40">{k.hz}</span>
          </div>
        ))}
        {keys.filter(k => k.black).map((k) => {
          const wIdx = whites.findIndex(w => {
            const wNote = w.note[0]; const bNote = k.note[0];
            return wNote === bNote;
          });
          return (
            <div key={k.note} className="absolute top-0 bg-ink z-10 flex flex-col items-center justify-end pb-0.5"
              style={{ left: `${(wIdx + 1) * W - W * 0.32}%`, width: `${W * 0.64}%`, height: "58%" }}>
              <span className="font-mono text-[5px] text-acid">{k.hz}</span>
            </div>
          );
        })}
      </div>
      <div className="font-mono text-[8px] text-bone/30 text-center mt-1 uppercase">A4 = 440 Hz · double = octave up</div>
    </div>
  );
}


// ─── EQ Curve ─────────────────────────────────────────────────────────────────
function EqCurve() {
  const zones = [
    { x: 20, label: "Sub", color: "#7B2FFF" },
    { x: 50, label: "Bass", color: "#FF2D2D" },
    { x: 90, label: "Mid", color: "#C6FF00" },
    { x: 140, label: "Hi-Mid", color: "#FFB800" },
    { x: 178, label: "Air", color: "#7FFFFF" },
  ];
  return (
    <div className="brutal-border bg-ink p-2">
      <svg viewBox="0 0 200 70" className="w-full h-20" fill="none">
        <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M0 42 Q15 42 25 30 Q35 15 50 20 Q65 25 80 35 Q95 42 110 40 Q130 38 145 28 Q162 18 178 22 Q192 26 200 30"
          stroke="#FFB800" strokeWidth="2.5" strokeLinecap="round" />
        {zones.map(z => (
          <g key={z.label}>
            <line x1={z.x} y1="38" x2={z.x} y2="52" stroke={z.color} strokeWidth="1" opacity="0.5" />
            <text x={z.x} y="62" textAnchor="middle" fill={z.color} fontSize="7" fontFamily="monospace" opacity="0.8">{z.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Amplitude Dial ───────────────────────────────────────────────────────────
function AmplitudeDial() {
  const levels = [
    { db: "-∞", label: "Silence", pct: 0, color: "#333" },
    { db: "-24", label: "Quiet", pct: 0.35, color: "#7B2FFF" },
    { db: "-12", label: "Normal", pct: 0.6, color: "#C6FF00" },
    { db: "-6", label: "Loud", pct: 0.78, color: "#FFB800" },
    { db: "0", label: "Clip!", pct: 1, color: "#FF2D2D" },
  ];
  return (
    <div className="brutal-border bg-ink p-3 flex items-center gap-4">
      <div className="flex flex-col gap-1 flex-1">
        {levels.map(l => (
          <div key={l.db} className="flex items-center gap-2">
            <span className="font-mono text-[8px] w-6 text-right tabular-nums" style={{ color: l.color }}>{l.db}</span>
            <div className="flex-1 h-3 bg-bone/10 brutal-border overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${l.pct * 100}%`, background: l.color }} />
            </div>
            <span className="font-mono text-[8px] w-10 text-bone/50">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BPM Grid ─────────────────────────────────────────────────────────────────
function BpmGrid({ bpm = 120, label }: { bpm?: number; label?: string }) {
  const beats = [1, 2, 3, 4];
  const subs = [1, 2, 3, 4];
  const secPerBeat = (60 / bpm).toFixed(2);
  return (
    <div className="brutal-border bg-ink p-3">
      <div className="font-mono text-[9px] text-bone/40 uppercase mb-2">{label ?? `1 bar @ ${bpm} BPM`}</div>
      <div className="flex gap-1">
        {beats.map(b => (
          <div key={b} className="flex-1 space-y-1">
            <div className="brutal-border bg-acid text-ink h-8 flex items-center justify-center font-display text-lg font-bold">{b}</div>
            <div className="grid grid-cols-4 gap-px">
              {subs.map(s => (
                <div key={s} className={`h-3 brutal-border ${s === 1 ? "bg-acid/50" : "bg-bone/10"}`} />
              ))}
            </div>
            <div className="font-mono text-[7px] text-bone/30 text-center">{secPerBeat}s</div>
          </div>
        ))}
      </div>
      <div className="font-mono text-[8px] text-bone/30 mt-2 text-center uppercase">Beat · · · Sub-division · · ·</div>
    </div>
  );
}


// ─── Signal Chain ─────────────────────────────────────────────────────────────
function SignalChain({ nodes }: { nodes?: string[] }) {
  const chain = nodes ?? ["Source", "FX", "Channel", "Master", "Speakers"];
  return (
    <div className="brutal-border bg-ink p-3">
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {chain.map((n, i) => (
          <div key={n} className="flex items-center gap-1">
            <div className="brutal-border bg-acid text-ink px-3 py-2 font-mono text-[9px] uppercase font-bold text-center min-w-[52px]">{n}</div>
            {i < chain.length - 1 && (
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                <path d="M2 6 L14 6 M10 2 L14 6 L10 10" stroke="#C6FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stereo Field ─────────────────────────────────────────────────────────────
function StereoField() {
  return (
    <div className="brutal-border bg-ink p-3">
      <svg viewBox="0 0 200 80" className="w-full h-20" fill="none">
        <text x="10" y="45" fill="#C6FF00" fontSize="10" fontFamily="monospace" fontWeight="bold">L</text>
        <text x="186" y="45" fill="#C6FF00" fontSize="10" fontFamily="monospace" fontWeight="bold">R</text>
        <line x1="100" y1="10" x2="100" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
        <ellipse cx="100" cy="40" rx="70" ry="25" stroke="rgba(198,255,0,0.3)" strokeWidth="1" />
        <ellipse cx="100" cy="40" rx="40" ry="15" stroke="rgba(198,255,0,0.5)" strokeWidth="1" />
        <circle cx="75" cy="35" r="4" fill="#FF2D2D" opacity="0.9" />
        <circle cx="130" cy="44" r="4" fill="#7B2FFF" opacity="0.9" />
        <circle cx="100" cy="40" r="3" fill="#C6FF00" />
        <text x="65" y="28" fill="#FF2D2D" fontSize="7" fontFamily="monospace">Kick</text>
        <text x="118" y="54" fill="#7B2FFF" fontSize="7" fontFamily="monospace">Synth</text>
        <text x="88" y="33" fill="#C6FF00" fontSize="7" fontFamily="monospace">Bass</text>
      </svg>
      <div className="font-mono text-[8px] text-bone/30 text-center uppercase">Pan positions in the stereo field</div>
    </div>
  );
}

// ─── Note Lengths ─────────────────────────────────────────────────────────────
function NoteLengths() {
  const notes = [
    { name: "Whole", beats: 4, symbol: "𝅝", color: "#C6FF00" },
    { name: "Half", beats: 2, symbol: "𝅗𝅥", color: "#FFB800" },
    { name: "Quarter", beats: 1, symbol: "♩", color: "#FF2D2D" },
    { name: "Eighth", beats: 0.5, symbol: "♪", color: "#7B2FFF" },
    { name: "16th", beats: 0.25, symbol: "𝅘𝅥𝅯", color: "#7FFFFF" },
  ];
  const MAX = 4;
  return (
    <div className="brutal-border bg-ink p-3 space-y-1.5">
      {notes.map(n => (
        <div key={n.name} className="flex items-center gap-2">
          <span className="font-mono text-[8px] w-14 shrink-0 uppercase" style={{ color: n.color }}>{n.name}</span>
          <div className="flex-1 h-4 bg-bone/5 brutal-border overflow-hidden">
            <div className="h-full" style={{ width: `${(n.beats / MAX) * 100}%`, background: n.color, opacity: 0.85 }} />
          </div>
          <span className="font-mono text-[9px] w-8 tabular-nums text-bone/50">{n.beats}b</span>
        </div>
      ))}
    </div>
  );
}


// ─── Scale Steps ─────────────────────────────────────────────────────────────
function ScaleSteps({ minor = false, root = "C", label }: { minor?: boolean; root?: string; label?: string }) {
  const major = ["W", "W", "H", "W", "W", "W", "H"];
  const min =   ["W", "H", "W", "W", "H", "W", "W"];
  const steps = minor ? min : major;

  // Build the scale notes from the given root
  const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const stepSizes = steps.map(s => s === "W" ? 2 : 1);
  const rootIdx = chromatic.indexOf(root.replace("b", "#")); // rough enharmonic
  const noteIndices: number[] = [rootIdx >= 0 ? rootIdx : 0];
  stepSizes.forEach(s => noteIndices.push((noteIndices[noteIndices.length - 1] + s) % 12));
  const notes = noteIndices.map(i => chromatic[i]);

  const modeName = label ?? (minor ? `${root} Natural Minor` : `${root} Major`);

  return (
    <div className="brutal-border bg-ink p-3">
      <div className="font-mono text-[8px] text-bone/40 uppercase mb-2">{modeName} · W = whole step · H = half step</div>
      <div className="flex items-end gap-px">
        {notes.map((note, i) => (
          <div key={i} className="flex-1 text-center">
            <div className="brutal-border bg-acid text-ink h-8 flex items-center justify-center font-mono text-[9px] font-bold">{note}</div>
            {i < steps.length && (
              <div className={`mt-1 h-3 brutal-border flex items-center justify-center font-mono text-[7px] font-bold
                ${steps[i] === "W" ? "bg-volt text-bone" : "bg-hot text-bone"}`}>
                {steps[i]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chord Stack ─────────────────────────────────────────────────────────────
function ChordStack() {
  const chords = [
    { name: "Major", intervals: ["Root", "Maj 3rd", "5th"], color: "#C6FF00", textColor: "#111" },
    { name: "Minor", intervals: ["Root", "Min 3rd", "5th"], color: "#7B2FFF", textColor: "#fff" },
    { name: "Dom7", intervals: ["Root", "Maj 3rd", "5th", "Min 7th"], color: "#FFB800", textColor: "#111" },
  ];
  return (
    <div className="brutal-border bg-ink p-3 flex gap-2">
      {chords.map(c => (
        <div key={c.name} className="flex-1">
          <div className="font-mono text-[8px] uppercase text-center mb-1" style={{ color: c.color }}>{c.name}</div>
          <div className="flex flex-col-reverse gap-px">
            {c.intervals.map((iv, i) => (
              <div key={i} className="brutal-border h-7 flex items-center justify-center font-mono text-[7px] uppercase"
                style={{ background: c.color, color: c.textColor, opacity: 0.6 + i * 0.15 }}>
                {iv}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Rhythm Dots ─────────────────────────────────────────────────────────────
function RhythmDots() {
  const pattern = [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1];
  return (
    <div className="brutal-border bg-ink p-3">
      <div className="font-mono text-[8px] text-bone/40 uppercase mb-2">Basic 4/4 rhythm pattern</div>
      <div className="grid grid-cols-16 gap-1" style={{ gridTemplateColumns: `repeat(16, 1fr)` }}>
        {pattern.map((hit, i) => (
          <div key={i} className={`h-8 brutal-border flex items-center justify-center font-mono text-[8px]
            ${hit ? "bg-acid text-ink font-bold" : "bg-bone/5 text-bone/20"}`}>
            {hit ? "●" : "·"}
          </div>
        ))}
      </div>
      <div className="flex justify-between font-mono text-[7px] text-bone/30 mt-1">
        <span>1</span><span>2</span><span>3</span><span>4</span>
      </div>
    </div>
  );
}


// ─── DJ visuals ───────────────────────────────────────────────────────────────
function VinylPlatter() {
  const [angle, setAngle] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    let prev: number;
    const tick = (now: number) => {
      if (!prev) prev = now;
      setAngle(a => (a + (now - prev) * 0.12) % 360);
      prev = now;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return (
    <div className="brutal-border bg-ink p-4 flex flex-col items-center gap-3">
      <svg viewBox="0 0 120 120" className="w-28 h-28">
        <g transform={`rotate(${angle} 60 60)`}>
          <circle cx="60" cy="60" r="55" fill="#1a1a1a" />
          {[50, 42, 34, 26, 18].map(r => (
            <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#333" strokeWidth="1" />
          ))}
          <circle cx="60" cy="60" r="8" fill="#C6FF00" />
          <circle cx="60" cy="60" r="3" fill="#111" />
          <line x1="60" y1="60" x2="60" y2="10" stroke="#C6FF00" strokeWidth="1.5" opacity="0.4" />
        </g>
        <line x1="95" y1="20" x2="72" y2="48" stroke="#FFB800" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="96" cy="19" r="3" fill="#FFB800" />
      </svg>
      <div className="font-mono text-[8px] text-bone/40 uppercase text-center">Vinyl spinning at 33.3 RPM · needle reads grooves</div>
    </div>
  );
}

function MixerChannel() {
  const channels = [
    { label: "Deck A", fader: 85, eq: { high: 70, mid: 60, low: 80 }, color: "#C6FF00" },
    { label: "Deck B", fader: 40, eq: { high: 50, mid: 55, low: 30 }, color: "#7B2FFF" },
  ];
  return (
    <div className="brutal-border bg-ink p-3 flex gap-3 justify-center">
      {channels.map(ch => (
        <div key={ch.label} className="w-20 space-y-1">
          <div className="font-mono text-[8px] uppercase text-center" style={{ color: ch.color }}>{ch.label}</div>
          {["HIGH", "MID", "LOW"].map(band => {
            const val = ch.eq[band.toLowerCase() as keyof typeof ch.eq];
            return (
              <div key={band} className="flex items-center gap-1">
                <span className="font-mono text-[6px] text-bone/40 w-6">{band}</span>
                <div className="flex-1 h-2 bg-bone/10 brutal-border overflow-hidden">
                  <div className="h-full" style={{ width: `${val}%`, background: ch.color, opacity: 0.7 }} />
                </div>
              </div>
            );
          })}
          <div className="h-20 bg-bone/5 brutal-border flex items-end p-1 mt-1">
            <div className="w-full brutal-border" style={{ height: `${ch.fader}%`, background: ch.color, opacity: 0.8 }} />
          </div>
          <div className="font-mono text-[7px] text-center text-bone/40">FADER</div>
        </div>
      ))}
    </div>
  );
}

function CamelotWheel() {
  const keys = [
    { pos: 12, label: "1A", note: "Ab/G#m", color: "#FF6B6B" },
    { pos: 1, label: "2A", note: "Eb/D#m", color: "#FF9F43" },
    { pos: 2, label: "3A", note: "Bb/A#m", color: "#FFC312" },
    { pos: 3, label: "4A", note: "F/Em", color: "#C4E538" },
    { pos: 4, label: "5A", note: "C/Bm", color: "#12CBC4" },
    { pos: 5, label: "6A", note: "G/F#m", color: "#1289A7" },
    { pos: 6, label: "7A", note: "D/C#m", color: "#0652DD" },
    { pos: 7, label: "8A", note: "A/G#m", color: "#9980FA" },
    { pos: 8, label: "9A", note: "E/D#m", color: "#B53471" },
    { pos: 9, label: "10A", note: "B/A#m", color: "#C4E538" },
    { pos: 10, label: "11A", note: "F#/Em", color: "#12CBC4" },
    { pos: 11, label: "12A", note: "Db/Bm", color: "#ED4C67" },
  ];
  const cx = 90, cy = 90, r = 60;
  return (
    <div className="brutal-border bg-ink p-2 flex flex-col items-center">
      <svg viewBox="0 0 180 180" className="w-44 h-44">
        {keys.map(k => {
          const ang = ((k.pos - 1) / 12) * Math.PI * 2 - Math.PI / 2;
          const x = cx + r * Math.cos(ang);
          const y = cy + r * Math.sin(ang);
          return (
            <g key={k.label}>
              <circle cx={x} cy={y} r="14" fill={k.color} opacity="0.85" />
              <text x={x} y={y - 3} textAnchor="middle" fill="#111" fontSize="7" fontFamily="monospace" fontWeight="bold">{k.label}</text>
              <text x={x} y={y + 6} textAnchor="middle" fill="#111" fontSize="5" fontFamily="monospace">{k.note.split("/")[0]}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="20" fill="#C6FF00" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#111" fontSize="9" fontFamily="monospace" fontWeight="bold">KEY</text>
      </svg>
      <div className="font-mono text-[7px] text-bone/30 uppercase text-center">Camelot Wheel — adjacent keys mix harmonically</div>
    </div>
  );
}


// ─── Waveform Zoom (beatgrid overlay) ────────────────────────────────────────
function WaveformZoom() {
  const bars = Array.from({ length: 60 }, (_, i) => 10 + Math.abs(Math.sin(i * 0.8 + 1) * 40 + Math.sin(i * 2.1) * 20));
  return (
    <div className="brutal-border bg-ink p-2">
      <div className="relative h-16 flex items-center gap-px px-1">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 bg-acid/70" style={{ height: `${h}%` }} />
        ))}
        {[0, 15, 30, 45].map(i => (
          <div key={i} className="absolute top-0 bottom-0 w-px bg-volt/80"
            style={{ left: `${(i / 60) * 100}%` }} />
        ))}
        <div className="absolute top-0 bottom-0 left-[25%] w-[8%] bg-acid/10 border border-acid/40" />
      </div>
      <div className="flex justify-between font-mono text-[7px] text-bone/30 mt-1 px-1">
        <span>1</span><span>2</span><span>3</span><span>4</span>
      </div>
      <div className="font-mono text-[7px] text-bone/30 text-center uppercase mt-0.5">Waveform · yellow lines = beat grid · box = loop region</div>
    </div>
  );
}

// ─── Headroom Meter ───────────────────────────────────────────────────────────
function HeadroomMeter() {
  const segments = [
    { label: "0 dB", color: "#FF2D2D", note: "CLIP" },
    { label: "-3", color: "#FF6B6B", note: "danger" },
    { label: "-6", color: "#FFB800", note: "loud" },
    { label: "-12", color: "#C6FF00", note: "good" },
    { label: "-18", color: "#C6FF00", note: "safe" },
    { label: "-24", color: "#7FFFFF", note: "quiet" },
    { label: "-∞", color: "#333", note: "silence" },
  ];
  const filled = 3; // filled from bottom up
  return (
    <div className="brutal-border bg-ink p-3 flex items-start gap-4 justify-center">
      <div className="flex flex-col-reverse gap-px w-12">
        {segments.map((s, i) => (
          <div key={s.label} className="h-6 brutal-border flex items-center justify-center"
            style={{ background: i >= segments.length - filled ? s.color : "rgba(255,255,255,0.04)" }}>
          </div>
        ))}
      </div>
      <div className="flex flex-col-reverse gap-px">
        {segments.map(s => (
          <div key={s.label} className="h-6 flex items-center gap-2">
            <span className="font-mono text-[8px] tabular-nums w-8 text-right" style={{ color: s.color }}>{s.label}</span>
            <span className="font-mono text-[7px] text-bone/40 uppercase">{s.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FalImage ─────────────────────────────────────────────────────────────────
function FalImage({ url, alt }: { url?: string; alt?: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  if (!url) return null;
  return (
    <div className="brutal-border overflow-hidden bg-ink/10 relative min-h-[200px]">
      {status === "loading" && (
        <div className="absolute inset-0 bg-ink/10 animate-pulse" aria-hidden />
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs opacity-40">
          [image unavailable]
        </div>
      )}
      <img
        src={url}
        alt={alt ?? "Lesson visual"}
        loading="lazy"
        className={`w-full max-w-[600px] mx-auto block object-contain transition-opacity duration-300 ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        }`}
        style={{ maxHeight: "360px" }}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}

// ─── master InlineVisual router ──────────────────────────────────────────────
export function InlineVisual({
  type,
  bpm,
  minor,
  root,
  scaleLabel,
  signalNodes,
  imageUrl,
  imageAlt,
}: {
  type: NonNullable<VisualType>;
  bpm?: number;
  minor?: boolean;
  root?: string;
  scaleLabel?: string;
  signalNodes?: string[];
  /** URL for fal-image visual type */
  imageUrl?: string;
  /** Alt text for fal-image visual type */
  imageAlt?: string;
}) {
  if (!type || type === "none") return null;
  switch (type) {
    case "waveform":          return <AnimatedWaveform />;
    case "waveform-compare":  return <WaveformCompare />;
    case "frequency-bar":     return <FrequencyBars />;
    case "piano":             return <PianoKeys />;
    case "piano-octave":      return <PianoOctave />;
    case "eq-curve":          return <EqCurve />;
    case "amplitude-dial":    return <AmplitudeDial />;
    case "bpm-grid":          return <BpmGrid bpm={bpm} />;
    case "signal-chain":      return <SignalChain nodes={signalNodes} />;
    case "stereo-field":      return <StereoField />;
    case "note-lengths":      return <NoteLengths />;
    case "scale-steps":       return <ScaleSteps minor={minor} root={root} label={scaleLabel} />;
    case "chord-stack":       return <ChordStack />;
    case "rhythm-dots":       return <RhythmDots />;
    case "vinyl-platter":     return <VinylPlatter />;
    case "mixer-channel":     return <MixerChannel />;
    case "camelot-wheel":     return <CamelotWheel />;
    case "waveform-zoom":     return <WaveformZoom />;
    case "headroom-meter":    return <HeadroomMeter />;
    case "fal-image":         return <FalImage url={imageUrl} alt={imageAlt} />;
    default:                  return null;
  }
}

// ─── Diagram screen renderer ─────────────────────────────────────────────────
export function DiagramVisual({ screen }: { screen: DiagramScreen }) {
  const W = 300, H = 160;
  const nodeMap = Object.fromEntries(screen.nodes.map(n => [n.id, n]));
  return (
    <div className="brutal-border bg-ink p-2 space-y-1">
      <div className="font-display text-lg text-bone px-1">{screen.title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
        {screen.arrows.map((a, i) => {
          const from = nodeMap[a.from], to = nodeMap[a.to];
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
          return (
            <g key={i}>
              <defs>
                <marker id={`arr-${i}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#C6FF00" />
                </marker>
              </defs>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#C6FF00" strokeWidth="1.5" opacity="0.6"
                markerEnd={`url(#arr-${i})`} />
              {a.label && (
                <text x={mx} y={my - 4} fill="#C6FF00" fontSize="7" fontFamily="monospace" textAnchor="middle" opacity="0.7">{a.label}</text>
              )}
            </g>
          );
        })}
        {screen.nodes.map(n => (
          <g key={n.id}>
            <rect x={n.x - 28} y={n.y - 12} width="56" height="24" fill={n.color ?? "#C6FF00"} rx="1" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#111" fontSize="8" fontFamily="monospace" fontWeight="bold">{n.label}</text>
          </g>
        ))}
      </svg>
      {screen.caption && (
        <div className="font-mono text-[8px] text-bone/40 uppercase px-1">{screen.caption}</div>
      )}
    </div>
  );
}
