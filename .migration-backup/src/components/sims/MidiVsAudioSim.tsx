// MIDI vs Audio side-by-side player — same melody, two clip types.
// User can transpose, change instrument (MIDI), or stretch (audio) to feel the difference.
import { useEffect, useRef, useState } from "react";
import { getCtx, midiToFreq, playTone } from "@/lib/audio";

const MELODY_MIDI = [60, 64, 67, 72, 71, 67, 64, 60]; // notes
const NOTE_DUR = 0.35;

type Inst = "sine" | "sawtooth" | "square" | "triangle";

export function MidiVsAudioSim() {
  const [transpose, setTranspose] = useState(0);
  const [inst, setInst] = useState<Inst>("sawtooth");
  const [stretch, setStretch] = useState(1);
  const playingRef = useRef<{ stop: () => void } | null>(null);
  const [playing, setPlaying] = useState<"midi" | "audio" | null>(null);

  const stop = () => { playingRef.current?.stop(); playingRef.current = null; setPlaying(null); };

  // MIDI clip = synthesise notes with current instrument and transpose, instantly responsive
  const playMidi = () => {
    stop();
    const c = getCtx(); if (!c) return;
    let cancelled = false;
    let t = 0;
    MELODY_MIDI.forEach((n) => {
      playTone(midiToFreq(n + transpose), t, NOTE_DUR * 0.9, inst, 0.18);
      t += NOTE_DUR;
    });
    setPlaying("midi");
    const stopFn = () => { cancelled = true; };
    playingRef.current = { stop: stopFn };
    setTimeout(() => { if (!cancelled) setPlaying(null); }, t * 1000);
  };

  // Audio clip = pre-rendered buffer of the same melody, played at varying playbackRate
  // Higher rate = faster + higher pitch (re-pitch); we also expose semitone shift via detune for warp-style demonstration
  const audioBufRef = useRef<AudioBuffer | null>(null);
  useEffect(() => {
    const c = getCtx(); if (!c) return;
    const dur = NOTE_DUR * MELODY_MIDI.length;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    MELODY_MIDI.forEach((n, i) => {
      const f = midiToFreq(n);
      const start = Math.floor(i * NOTE_DUR * c.sampleRate);
      const len = Math.floor(NOTE_DUR * 0.9 * c.sampleRate);
      for (let j = 0; j < len; j++) {
        const t = j / c.sampleRate;
        const env = Math.exp(-3 * t);
        // Saw-ish: sum of harmonics
        let s = 0;
        for (let h = 1; h <= 6; h++) s += Math.sin(2 * Math.PI * f * h * t) / h;
        data[start + j] = s * 0.15 * env;
      }
    });
    audioBufRef.current = buf;
  }, []);

  const playAudio = () => {
    stop();
    const c = getCtx(); if (!c) return;
    const src = c.createBufferSource();
    src.buffer = audioBufRef.current!;
    // playbackRate stretches AND pitches (re-pitch demo). 1/stretch = slower with lower pitch artifacts
    src.playbackRate.value = 1 / stretch;
    // Show transpose as detune (cents) — illustrates that audio transpose is a process, not just metadata
    src.detune.value = transpose * 100;
    const gain = c.createGain(); gain.gain.value = 0.6;
    src.connect(gain).connect(c.destination);
    src.start();
    setPlaying("audio");
    playingRef.current = { stop: () => { try { src.stop(); } catch {} setPlaying(null); } };
    src.onended = () => setPlaying(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* MIDI clip */}
        <div className="brutal-border bg-volt text-bone p-4 brutal-shadow-sm">
          <div className="font-mono text-xs uppercase">MIDI CLIP</div>
          <div className="font-display text-2xl">NOTES + INSTRUCTIONS</div>
          <div className="font-mono text-xs mt-2 opacity-90">Stores: pitch, velocity, length per note. The instrument creates the sound at playback. Editable forever.</div>
          <PianoRoll notes={MELODY_MIDI.map((n) => n + transpose)} />
          <button onClick={playMidi} className={`brutal-border w-full mt-3 px-3 py-2 font-display text-lg brutal-press ${playing === "midi" ? "bg-acid text-ink" : "bg-bone text-ink"}`}>
            {playing === "midi" ? "■ STOP" : "▶ PLAY MIDI"}
          </button>
        </div>
        {/* Audio clip */}
        <div className="brutal-border bg-hot text-bone p-4 brutal-shadow-sm">
          <div className="font-mono text-xs uppercase">AUDIO CLIP</div>
          <div className="font-display text-2xl">RECORDED WAVEFORM</div>
          <div className="font-mono text-xs mt-2 opacity-90">Stores: a sample. Pitch is baked in. Transpose & stretch are post-process — you can hear artifacts.</div>
          <Waveform stretch={stretch} />
          <button onClick={playAudio} className={`brutal-border w-full mt-3 px-3 py-2 font-display text-lg brutal-press ${playing === "audio" ? "bg-acid text-ink" : "bg-bone text-ink"}`}>
            {playing === "audio" ? "■ STOP" : "▶ PLAY AUDIO"}
          </button>
        </div>
      </div>

      <div className="brutal-border bg-card p-4 grid md:grid-cols-3 gap-4">
        <label className="font-mono text-xs uppercase">TRANSPOSE: {transpose > 0 ? "+" : ""}{transpose} st
          <input type="range" min={-12} max={12} value={transpose} onChange={(e) => setTranspose(+e.target.value)} className="w-full" />
        </label>
        <label className="font-mono text-xs uppercase">MIDI INSTRUMENT
          <div className="flex flex-wrap gap-1 mt-1">
            {(["sine", "sawtooth", "square", "triangle"] as Inst[]).map((i) => (
              <button key={i} onClick={() => setInst(i)} className={`brutal-border px-2 py-1 font-mono text-[10px] uppercase ${inst === i ? "bg-acid" : "bg-bone"}`}>{i}</button>
            ))}
          </div>
        </label>
        <label className="font-mono text-xs uppercase">AUDIO STRETCH (re-pitch): ×{stretch.toFixed(2)}
          <input type="range" min={0.5} max={2} step={0.05} value={stretch} onChange={(e) => setStretch(+e.target.value)} className="w-full" />
        </label>
      </div>

      <div className="brutal-border bg-bone p-4 font-mono text-xs uppercase">
        <strong>TRY THIS:</strong> change the MIDI instrument — same notes, totally different timbre. Then transpose the audio clip — hear the artefacts? That's why MIDI is editable forever and audio isn't.
      </div>
    </div>
  );
}

function PianoRoll({ notes }: { notes: number[] }) {
  const min = Math.min(...notes) - 2;
  const max = Math.max(...notes) + 2;
  const rows = max - min + 1;
  return (
    <svg viewBox={`0 0 ${notes.length * 20} ${rows * 8}`} className="w-full h-32 mt-2 brutal-border bg-bone">
      {Array.from({ length: rows }).map((_, r) => (
        <line key={r} x1={0} y1={r * 8} x2={notes.length * 20} y2={r * 8} stroke="#000" strokeWidth={0.3} />
      ))}
      {notes.map((n, i) => (
        <rect key={i} x={i * 20 + 1} y={(max - n) * 8 + 1} width={18} height={6} fill="#C6FF00" stroke="#000" strokeWidth={1} />
      ))}
    </svg>
  );
}

function Waveform({ stretch }: { stretch: number }) {
  // Visual stretch — a static sketch but compressed/expanded with the slider
  const samples = 60;
  return (
    <svg viewBox={`0 0 ${samples} 40`} className="w-full h-32 mt-2 brutal-border bg-bone">
      {Array.from({ length: samples }).map((_, i) => {
        const t = i / samples;
        const v = Math.sin(t * Math.PI * 12 * stretch) * Math.exp(-2 * (t % 0.125) * 8);
        const h = Math.abs(v) * 18;
        return <rect key={i} x={i + 0.2} y={20 - h} width={0.8} height={h * 2} fill="#000" />;
      })}
    </svg>
  );
}
