"use client";
// ChordProgressionSim — play I-IV-V-I and hear tension/resolution.
// Each chord button shows root, quality, roman numeral, plays audio.
import { useState, useRef } from "react";
import { getCtx, midiToFreq } from "@/lib/audio";

type ChordDef = {
  numeral: string;
  name: string;
  notes: number[];   // MIDI notes
  feel: string;
  color: string;
};

const PROGRESSIONS: { label: string; key: string; chords: ChordDef[] }[] = [
  {
    label: "I–IV–V–I (Major)",
    key: "C Major",
    chords: [
      { numeral: "I",   name: "C Major",  notes: [60,64,67,72], feel: "Home — stable & settled",     color: "bg-acid text-ink" },
      { numeral: "IV",  name: "F Major",  notes: [65,69,72,77], feel: "Lift — moving away from home", color: "bg-volt text-bone" },
      { numeral: "V",   name: "G Major",  notes: [67,71,74,79], feel: "Tension — wants to resolve",   color: "bg-hot text-bone" },
      { numeral: "I",   name: "C Major",  notes: [60,64,67,72], feel: "Resolution — back to home!",   color: "bg-acid text-ink" },
    ],
  },
  {
    label: "i–iv–V–i (Minor)",
    key: "A Minor",
    chords: [
      { numeral: "i",   name: "Am",       notes: [57,60,64,69], feel: "Home — dark & melancholic",    color: "bg-ink text-bone" },
      { numeral: "iv",  name: "Dm",       notes: [62,65,69,74], feel: "Deepening sadness",            color: "bg-volt text-bone" },
      { numeral: "V",   name: "E Major",  notes: [64,68,71,76], feel: "Tension — leading tone pull",  color: "bg-hot text-bone" },
      { numeral: "i",   name: "Am",       notes: [57,60,64,69], feel: "Resolution — dark home",       color: "bg-ink text-bone" },
    ],
  },
  {
    label: "I–V–vi–IV (Pop)",
    key: "C Major",
    chords: [
      { numeral: "I",   name: "C Major",  notes: [60,64,67,72], feel: "Bright start",                 color: "bg-acid text-ink" },
      { numeral: "V",   name: "G Major",  notes: [67,71,74,79], feel: "Rising tension",               color: "bg-hot text-bone" },
      { numeral: "vi",  name: "A Minor",  notes: [57,60,64,69], feel: "Emotional turn",               color: "bg-ink text-bone" },
      { numeral: "IV",  name: "F Major",  notes: [65,69,72,77], feel: "Lift before return",           color: "bg-volt text-bone" },
    ],
  },
];

function playChord(notes: number[], duration = 1.2) {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime + 0.02;
  notes.forEach((midi, i) => {
    const freq = midiToFreq(midi);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.12 / notes.length, t + 0.02 + i * 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  });
}

async function playProgression(chords: ChordDef[], setActive: (i: number | null) => void) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state !== "running") { try { await ctx.resume(); } catch {} }
  for (let i = 0; i < chords.length; i++) {
    setActive(i);
    playChord(chords[i].notes, 1.5);
    await new Promise(r => setTimeout(r, 1600));
  }
  setActive(null);
}

export function ChordProgressionSim() {
  const [progIdx, setProgIdx] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const prog = PROGRESSIONS[progIdx];

  const handleAuto = async () => {
    if (autoPlaying) return;
    const ctx = getCtx();
    if (ctx?.state !== "running") { try { await ctx?.resume(); } catch {} }
    setAutoPlaying(true);
    await playProgression(prog.chords, setActive);
    setAutoPlaying(false);
  };

  const handleChord = async (chord: ChordDef, i: number) => {
    const ctx = getCtx();
    if (ctx?.state !== "running") { try { await ctx?.resume(); } catch {} }
    setActive(i);
    playChord(chord.notes, 1.5);
    setTimeout(() => setActive(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-ink text-bone p-4">
        <div className="font-mono text-[10px] uppercase opacity-60">Chord Progression Explorer</div>
        <div className="font-display text-2xl mt-1">HEAR TENSION & RESOLUTION</div>
      </div>

      {/* Progression picker */}
      <div className="flex gap-1 overflow-x-auto">
        {PROGRESSIONS.map((pr, i) => (
          <button key={i} onClick={() => { setProgIdx(i); setActive(null); }}
            className={`brutal-border px-3 py-2 font-mono text-[10px] uppercase brutal-press shrink-0 ${
              progIdx === i ? "bg-acid text-ink" : "bg-bone hover:bg-sun"
            }`}
          >
            {pr.label}
          </button>
        ))}
      </div>

      <div className="font-mono text-[10px] uppercase opacity-50">Key: {prog.key}</div>

      {/* Chord buttons */}
      <div className="grid grid-cols-4 gap-2">
        {prog.chords.map((ch, i) => (
          <button
            key={i}
            onClick={() => handleChord(ch, i)}
            className={`brutal-border p-3 text-left brutal-press transition-all ${ch.color} ${
              active === i ? "scale-95 outline outline-4 outline-white" : ""
            }`}
          >
            <div className="font-display text-3xl">{ch.numeral}</div>
            <div className="font-mono text-[10px] uppercase mt-1">{ch.name}</div>
            {active === i && (
              <div className="font-mono text-[8px] mt-1 opacity-80">{ch.feel}</div>
            )}
          </button>
        ))}
      </div>

      {/* Feel display */}
      {active !== null && (
        <div className="brutal-border bg-volt text-bone p-3 font-display text-lg animate-fade-in">
          {prog.chords[active].feel}
        </div>
      )}

      {/* Auto-play */}
      <button
        onClick={handleAuto}
        disabled={autoPlaying}
        className="brutal-border bg-acid text-ink px-5 py-3 font-display text-xl brutal-press w-full disabled:opacity-50"
      >
        {autoPlaying ? "▶ Playing progression…" : "▶ PLAY FULL PROGRESSION"}
      </button>

      <div className="brutal-border bg-sun/20 p-3 font-mono text-xs leading-relaxed">
        <strong>Listen:</strong> The V chord creates tension — your ear <em>wants</em> to hear the I chord next. 
        This tension→resolution is the engine behind almost every song ever written.
      </div>
    </div>
  );
}
