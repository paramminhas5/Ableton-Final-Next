"use client";
/**
 * ConceptAudio — plays a short synthesised audio example when the user
 * taps the ▶ button on a concept screen.
 *
 * Each concept visual type has a corresponding audio demonstration:
 *   waveform          → single sine tone (pure wave)
 *   waveform-compare  → sine → square → sawtooth in sequence
 *   frequency-bar     → sweep from sub to air
 *   piano / piano-octave → play a C-major scale
 *   eq-curve          → full-spectrum noise with no EQ, then LP filtered
 *   amplitude-dial    → tone at different gain levels
 *   bpm-grid          → 4-beat drum loop at 120 BPM
 *   signal-chain      → dry kick → with reverb → with delay
 *   stereo-field      → ping-pong test tone
 *   note-lengths      → whole → half → quarter → 8th → 16th
 *   scale-steps       → C-major scale ascending
 *   chord-stack       → major / minor / dom7 chord stab
 *   rhythm-dots       → the pattern tapped out as clicks
 *   vinyl-platter     → 4-bar drum loop
 *   mixer-channel     → loop with volume fade
 *   camelot-wheel     → two harmonically adjacent chords
 *   waveform-zoom     → drum loop with beat emphasis
 *   headroom-meter    → tone ramping from quiet to loud
 *
 * Falls back to a generic "play a tone" if the visual type is unknown.
 */
import { useState } from "react";
import { ensureAudio, getCtx, getMaster, playKick, playSnare, playHat, playTone, midiToFreq, startLoop } from "@/lib/audio";
import type { LessonScreen } from "@/content/types";

type VisualType = NonNullable<Extract<LessonScreen, { kind: "concept" }>["visual"]>;

// ─── Audio demo functions per visual type ─────────────────────────────────────

function playSine() {
  playTone(440, 0, 1.2, "sine", 0.25);
}

function playWaveformCompare() {
  playTone(220, 0,   0.6, "sine",     0.2);
  playTone(220, 0.7, 0.6, "square",   0.15);
  playTone(220, 1.4, 0.6, "sawtooth", 0.18);
}

function playFreqSweep() {
  const c = getCtx(); if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(60, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(8000, c.currentTime + 1.8);
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.linearRampToValueAtTime(0.2, c.currentTime + 0.1);
  g.gain.linearRampToValueAtTime(0.2, c.currentTime + 1.6);
  g.gain.linearRampToValueAtTime(0.0001, c.currentTime + 2.0);
  osc.connect(g).connect(getMaster());
  osc.start(); osc.stop(c.currentTime + 2.1);
}

function playCMajorScale() {
  const notes = [60, 62, 64, 65, 67, 69, 71, 72]; // C4 major scale
  notes.forEach((n, i) => playTone(midiToFreq(n), i * 0.22, 0.3, "triangle", 0.22));
}

function playEqDemo() {
  // Noise → then lowpassed noise to demonstrate EQ shaping
  const c = getCtx(); if (!c) return;
  const dur = 2.4;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.15;
  const src = c.createBufferSource(); src.buffer = buf;
  const lp = c.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.setValueAtTime(8000, c.currentTime);
  lp.frequency.setValueAtTime(8000, c.currentTime + 1.2);
  lp.frequency.exponentialRampToValueAtTime(300, c.currentTime + 1.8);
  src.connect(lp).connect(getMaster());
  src.start(); src.stop(c.currentTime + dur);
}

function playAmplitudeDemo() {
  const gains = [0.03, 0.09, 0.18, 0.28];
  gains.forEach((v, i) => {
    const c = getCtx(); if (!c) return;
    const t = c.currentTime + i * 0.45;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine"; o.frequency.value = 440;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(getMaster());
    o.start(t); o.stop(t + 0.4);
  });
}

function playBpmGrid() {
  const h = startLoop("drum-loop", 120, getMaster());
  setTimeout(() => h.stop(), 2000);
}

function playSignalChainDemo() {
  // Dry kick, then same kick with simulated reverb tail
  playKick(0);
  playKick(0.6);
  // Reverb version (simple — kick + delayed echo)
  const c = getCtx(); if (!c) return;
  setTimeout(() => {
    playKick(0);
    // Reverb tail: echo at 80ms, 160ms, 240ms
    [0.08, 0.16, 0.24].forEach((t, i) => {
      const gain = 0.4 - i * 0.12;
      const g = c.createGain(); g.gain.value = gain;
      g.connect(getMaster());
      setTimeout(() => { try { playKick(0); } catch {} }, t * 1000);
    });
  }, 800);
}

function playStereoField() {
  const c = getCtx(); if (!c) return;
  const positions = [-1, 0, 1, 0];
  positions.forEach((pan, i) => {
    const t = c.currentTime + i * 0.4;
    const o = c.createOscillator();
    const g = c.createGain();
    const p = c.createStereoPanner(); p.pan.value = pan;
    o.type = "triangle"; o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.connect(g).connect(p).connect(getMaster());
    o.start(t); o.stop(t + 0.35);
  });
}

function playNoteLengths() {
  // Whole, half, quarter, 8th, 16th — at 120 BPM so whole=2s
  const bps = 2; // 120 BPM = 2 beats per second
  const notes = [
    { beats: 4, freq: 523 },  // C5 whole
    { beats: 2, freq: 587 },  // D5 half
    { beats: 1, freq: 659 },  // E5 quarter
    { beats: 0.5, freq: 698 }, // F5 8th
    { beats: 0.25, freq: 784 }, // G5 16th
  ];
  let offset = 0;
  notes.forEach(n => {
    playTone(n.freq, offset / bps, n.beats / bps * 0.85, "triangle", 0.2);
    offset += n.beats;
  });
}

function playScaleSteps() {
  playCMajorScale();
}

function playChordStack() {
  // Major → minor → dom7
  const root = 60; // C4
  const chords = [
    [0, 4, 7],        // major
    [0, 3, 7],        // minor (after 1.2s)
    [0, 4, 7, 10],    // dom7 (after 2.4s)
  ];
  chords.forEach((offsets, ci) => {
    offsets.forEach(o => {
      playTone(midiToFreq(root + o), ci * 1.2, 0.9, "triangle", 0.15);
    });
  });
}

function playRhythmDots() {
  const pattern = [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1];
  const c = getCtx(); if (!c) return;
  const step = 0.125; // 16ths at 120 BPM
  pattern.forEach((hit, i) => {
    if (!hit) return;
    const t = c.currentTime + 0.05 + i * step;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle"; o.frequency.value = 800;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g).connect(getMaster());
    o.start(t); o.stop(t + 0.08);
  });
}

function playVinylDemo() {
  const h = startLoop("drum-loop", 133, getMaster());
  setTimeout(() => h.stop(), 1800);
}

function playMixerDemo() {
  // Loop with fade out (simulating fader pull)
  const c = getCtx(); if (!c) return;
  const g = c.createGain(); g.gain.value = 0.9;
  g.connect(getMaster());
  g.gain.linearRampToValueAtTime(0.0, c.currentTime + 2.0);
  const h = startLoop("drum-loop", 120, g);
  setTimeout(() => { h.stop(); try { g.disconnect(); } catch {} }, 2100);
}

function playCamelotDemo() {
  // Cmaj → Gmaj (adjacent on Camelot wheel: 8B → 9B)
  const offsets1 = [0, 4, 7];        // C major
  const offsets2 = [7, 11, 14];      // G major (7 semis up)
  offsets1.forEach(o => playTone(midiToFreq(60 + o), 0,   0.8, "triangle", 0.15));
  offsets2.forEach(o => playTone(midiToFreq(60 + o), 1.1, 0.8, "triangle", 0.15));
}

function playWaveformZoom() {
  // Drum loop with accented beat 1 to illustrate beat grid
  const c = getCtx(); if (!c) return;
  const beat = 60 / 120;
  playKick(0); playSnare(beat); playKick(beat * 2); playSnare(beat * 3);
  // Accent on beat 1
  playTone(880, 0, 0.05, "triangle", 0.4);
}

function playHeadroomDemo() {
  // Tone ramping from whisper-quiet to near-clip
  const c = getCtx(); if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine"; o.frequency.value = 440;
  g.gain.setValueAtTime(0.01, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.85, c.currentTime + 2.0);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 2.2);
  o.connect(g).connect(getMaster());
  o.start(); o.stop(c.currentTime + 2.3);
}

// ─── NEW: contextual audio demos ─────────────────────────────────────────────

function playMinorScale() {
  const notes = [69, 71, 72, 74, 76, 77, 79, 81]; // A3 natural minor
  notes.forEach((n, i) => playTone(midiToFreq(n), i * 0.22, 0.3, "triangle", 0.2));
}
function playPentatonicScale() {
  const notes = [60, 62, 64, 67, 69, 72]; // C major pentatonic
  notes.forEach((n, i) => playTone(midiToFreq(n), i * 0.22, 0.32, "triangle", 0.22));
}
function playMajorMinorCompare() {
  const major = [60, 64, 67]; const minor = [60, 63, 67];
  major.forEach(n => playTone(midiToFreq(n), 0, 0.8, "triangle", 0.16));
  minor.forEach(n => playTone(midiToFreq(n), 1.2, 0.8, "triangle", 0.16));
}
function playDominantResolution() {
  const g7 = [55, 59, 62, 65]; const cMaj = [60, 64, 67];
  g7.forEach(n => playTone(midiToFreq(n), 0, 0.9, "triangle", 0.14));
  cMaj.forEach(n => playTone(midiToFreq(n), 1.1, 1.2, "triangle", 0.16));
}
function playIVVI() {
  [[60,64,67],[65,69,72],[67,71,74],[60,64,67]].forEach((chord, ci) => {
    chord.forEach(n => playTone(midiToFreq(n), ci * 0.9, 0.75, "triangle", 0.14));
  });
}
function playEqBright() {
  const c = getCtx(); if (!c) return;
  const osc = c.createOscillator(); const g = c.createGain(); const lp = c.createBiquadFilter();
  lp.type = "lowpass"; osc.type = "sawtooth"; osc.frequency.value = 220;
  lp.frequency.setValueAtTime(8000, c.currentTime);
  lp.frequency.exponentialRampToValueAtTime(400, c.currentTime + 1.5);
  g.gain.setValueAtTime(0.18, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 2.2);
  osc.connect(lp); lp.connect(g); g.connect(getMaster());
  osc.start(); osc.stop(c.currentTime + 2.3);
}
function playFilterSweep() {
  const c = getCtx(); if (!c) return;
  const osc = c.createOscillator(); const g = c.createGain(); const lp = c.createBiquadFilter();
  lp.type = "lowpass"; osc.type = "sawtooth"; osc.frequency.value = 110;
  lp.frequency.setValueAtTime(200, c.currentTime);
  lp.frequency.exponentialRampToValueAtTime(6000, c.currentTime + 2.0);
  g.gain.setValueAtTime(0.22, c.currentTime);
  g.gain.linearRampToValueAtTime(0.0001, c.currentTime + 2.5);
  osc.connect(lp); lp.connect(g); g.connect(getMaster());
  osc.start(); osc.stop(c.currentTime + 2.5);
}
function playADSRDemo() {
  const c = getCtx(); if (!c) return;
  const osc1 = c.createOscillator(); osc1.type = "triangle"; osc1.frequency.value = midiToFreq(60);
  const g1 = c.createGain();
  g1.gain.setValueAtTime(0.0001, c.currentTime);
  g1.gain.linearRampToValueAtTime(0.22, c.currentTime + 0.5);
  g1.gain.linearRampToValueAtTime(0.0001, c.currentTime + 2.0);
  osc1.connect(g1); g1.connect(getMaster()); osc1.start(); osc1.stop(c.currentTime + 2.1);
  const osc2 = c.createOscillator(); osc2.type = "sawtooth"; osc2.frequency.value = midiToFreq(60);
  const g2 = c.createGain();
  g2.gain.setValueAtTime(0.0001, c.currentTime + 2.5);
  g2.gain.exponentialRampToValueAtTime(0.35, c.currentTime + 2.52);
  g2.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 3.0);
  osc2.connect(g2); g2.connect(getMaster()); osc2.start(c.currentTime + 2.5); osc2.stop(c.currentTime + 3.1);
}
function playLFOVibrato() {
  const c = getCtx(); if (!c) return;
  const osc = c.createOscillator(); osc.type = "triangle"; osc.frequency.value = midiToFreq(64);
  const lfo = c.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 5.5;
  const lfoGain = c.createGain(); lfoGain.gain.value = 8;
  const g = c.createGain(); g.gain.value = 0.22;
  lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
  osc.connect(g); g.connect(getMaster());
  lfo.start(c.currentTime + 0.3); osc.start(); osc.stop(c.currentTime + 2.5); lfo.stop(c.currentTime + 2.5);
}
function playDelayDemo() {
  playTone(midiToFreq(64), 0, 0.4, "triangle", 0.25);
  [0.5, 1.0, 1.5, 2.0].forEach((t, i) => {
    playTone(midiToFreq(64), t, 0.35, "triangle", 0.25 * Math.pow(0.5, i + 1));
  });
}
function playStereoWide() {
  const c = getCtx(); if (!c) return;
  [{ pan: -0.8, midi: 64, t: 0 }, { pan: 0, midi: 67, t: 0.4 }, { pan: 0.8, midi: 71, t: 0.8 }, { pan: 0, midi: 72, t: 1.2 }]
    .forEach(({ pan, midi, t }) => {
      const time = c.currentTime + t;
      const o = c.createOscillator(); const g = c.createGain(); const p = c.createStereoPanner(); p.pan.value = pan;
      o.type = "triangle"; o.frequency.value = midiToFreq(midi);
      g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(0.22, time + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
      o.connect(g); g.connect(p); p.connect(getMaster()); o.start(time); o.stop(time + 0.35);
    });
}
function playFullDrumLoop() {
  const beat = 60 / 128;
  playKick(0); playKick(beat * 2); playSnare(beat); playSnare(beat * 3);
  [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5].forEach(b => playHat(b * beat));
}
function playHarmonicMix() {
  [[60,64,67],[67,71,74]].forEach((chord, ci) => {
    chord.forEach(n => playTone(midiToFreq(n), ci * 0.8, 1.5, "triangle", 0.14));
  });
}
function playSwingGroove() {
  const c = getCtx(); if (!c) return;
  const beat = 60 / 120;
  for (let i = 0; i < 8; i++) {
    const t = c.currentTime + 0.1 + i * (beat / 2);
    const o = c.createOscillator(); const g = c.createGain();
    o.type = "triangle"; o.frequency.value = i % 2 === 0 ? 880 : 660;
    g.gain.setValueAtTime(i % 2 === 0 ? 0.3 : 0.18, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g); g.connect(getMaster()); o.start(t); o.stop(t + 0.09);
  }
  const swingOff = beat * 0.33;
  for (let i = 0; i < 8; i++) {
    const baseT = c.currentTime + 2.2 + Math.floor(i / 2) * beat;
    const t = i % 2 === 0 ? baseT : baseT + swingOff + beat * 0.17;
    const o = c.createOscillator(); const g = c.createGain();
    o.type = "triangle"; o.frequency.value = i % 2 === 0 ? 880 : 660;
    g.gain.setValueAtTime(i % 2 === 0 ? 0.3 : 0.18, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g); g.connect(getMaster()); o.start(t); o.stop(t + 0.09);
  }
}

const DEMOS: Partial<Record<VisualType, () => void>> = {
  waveform:          playSine,
  "waveform-compare": playWaveformCompare,
  "frequency-bar":   playFreqSweep,
  piano:             playCMajorScale,
  "piano-octave":    playCMajorScale,
  "eq-curve":        playEqBright,
  "amplitude-dial":  playAmplitudeDemo,
  "bpm-grid":        playBpmGrid,
  "signal-chain":    playSignalChainDemo,
  "stereo-field":    playStereoWide,
  "note-lengths":    playNoteLengths,
  "scale-steps":     playScaleSteps,
  "chord-stack":     playChordStack,
  "rhythm-dots":     playRhythmDots,
  "vinyl-platter":   playVinylDemo,
  "mixer-channel":   playMixerDemo,
  "camelot-wheel":   playHarmonicMix,
  "waveform-zoom":   playWaveformZoom,
  "headroom-meter":  playHeadroomDemo,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  visual: VisualType | undefined;
  /** Optional label shown next to the play button */
  label?: string;
}

export function ConceptAudioButton({ visual, label }: Props) {
  const [playing, setPlaying] = useState(false);

  if (!visual || visual === "none") {
    // Generic "hear an example" fallback
    return (
      <button
        onClick={async () => {
          const ok = await ensureAudio();
          if (!ok) return;
          setPlaying(true);
          playTone(440, 0, 0.8, "triangle", 0.2);
          setTimeout(() => setPlaying(false), 900);
        }}
        className="brutal-border bg-ink text-bone px-3 py-2 font-mono text-[10px] uppercase brutal-press flex items-center gap-2 hover:bg-volt transition-colors"
        aria-label="Play audio example"
      >
        <span aria-hidden>{playing ? "◼" : "▶"}</span>
        {label ?? "HEAR EXAMPLE"}
      </button>
    );
  }

  const demo = DEMOS[visual];
  if (!demo) return null;

  const labelText = label ?? DEMO_LABELS[visual] ?? "HEAR EXAMPLE";

  const handlePlay = async () => {
    const ok = await ensureAudio();
    if (!ok) return;
    setPlaying(true);
    try { demo(); } catch {}
    // Estimate duration and reset state
    const estimatedDur = DEMO_DURATIONS[visual] ?? 1500;
    setTimeout(() => setPlaying(false), estimatedDur);
  };

  return (
    <button
      onClick={handlePlay}
      disabled={playing}
      className={`brutal-border px-3 py-2 font-mono text-[10px] uppercase brutal-press flex items-center gap-2 transition-colors
        ${playing
          ? "bg-volt text-bone cursor-not-allowed"
          : "bg-ink text-bone hover:bg-volt"}`}
      aria-label={`Play audio example: ${labelText}`}
    >
      <span aria-hidden className="text-base leading-none">{playing ? "◼" : "▶"}</span>
      <span>{playing ? "PLAYING…" : labelText}</span>
    </button>
  );
}

const DEMO_LABELS: Partial<Record<VisualType, string>> = {
  waveform:          "HEAR A SINE WAVE",
  "waveform-compare": "HEAR SINE → SQUARE → SAW",
  "frequency-bar":   "HEAR FREQUENCY SWEEP",
  piano:             "HEAR C-MAJOR SCALE",
  "piano-octave":    "HEAR OCTAVE RELATIONSHIPS",
  "eq-curve":        "HEAR EQ SWEEP",
  "amplitude-dial":  "HEAR VOLUME LEVELS",
  "bpm-grid":        "HEAR THE BEAT GRID",
  "signal-chain":    "HEAR SIGNAL CHAIN",
  "stereo-field":    "HEAR STEREO PANNING",
  "note-lengths":    "HEAR NOTE LENGTHS",
  "scale-steps":     "HEAR MAJOR SCALE",
  "chord-stack":     "HEAR CHORD TYPES",
  "rhythm-dots":     "HEAR THIS RHYTHM",
  "vinyl-platter":   "HEAR A DRUM LOOP",
  "mixer-channel":   "HEAR FADER PULL",
  "camelot-wheel":   "HEAR HARMONIC MIX",
  "waveform-zoom":   "HEAR BEAT GRID",
  "headroom-meter":  "HEAR LEVEL RAMP",
};

const DEMO_DURATIONS: Partial<Record<VisualType, number>> = {
  waveform:          1400,
  "waveform-compare": 2600,
  "frequency-bar":   2200,
  piano:             2200,
  "piano-octave":    2200,
  "eq-curve":        2600,
  "amplitude-dial":  2200,
  "bpm-grid":        2200,
  "signal-chain":    2500,
  "stereo-field":    2200,
  "note-lengths":    3200,
  "scale-steps":     2200,
  "chord-stack":     4000,
  "rhythm-dots":     2400,
  "vinyl-platter":   2000,
  "mixer-channel":   2300,
  "camelot-wheel":   2500,
  "waveform-zoom":   2200,
  "headroom-meter":  2500,
};
