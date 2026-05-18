// Helpers for ear-training drills + score persistence.
import { supabase } from "@/integrations/supabase/client";
import { getCtx, getMaster, midiToFreq, playTone, startLoop, type LoopHandle } from "./audio";

export type DrillKey =
  | "interval"
  | "chord"
  | "eq-cut"
  | "compression"
  | "reverb"
  | "panning"
  | "tempo"
  | "tempo-compare"
  | "dynamic-range"
  | "stereo-width";

export const DRILL_LABELS: Record<DrillKey, { name: string; tagline: string; emoji: string }> = {
  interval: { name: "Interval ID", tagline: "Hear two notes — name the gap.", emoji: "🎼" },
  chord: { name: "Chord Quality", tagline: "Major, minor, dim, dom7…", emoji: "🎹" },
  "eq-cut": { name: "EQ Cut", tagline: "Which band did we notch?", emoji: "📉" },
  compression: { name: "Compression", tagline: "Spot the squashed clip.", emoji: "🤜" },
  reverb: { name: "Reverb Time", tagline: "Short, medium, or long tail?", emoji: "🌫️" },
  panning: { name: "Panning", tagline: "Hard left, slight right, dead center?", emoji: "↔️" },
  tempo: { name: "Tempo", tagline: "BPM by ear — within 5.", emoji: "⏱️" },
  "tempo-compare": {
    name: "A/B Faster?",
    tagline: "Two loops — which one is faster?",
    emoji: "🏁",
  },
  "dynamic-range": {
    name: "Dynamic Range",
    tagline: "Which version is more compressed?",
    emoji: "📊",
  },
  "stereo-width": {
    name: "Stereo Width",
    tagline: "Mono, narrow, wide — hear the difference.",
    emoji: "↔️",
  },
};

// --- WHY metadata ---
export const DRILL_WHY: Record<DrillKey, string[]> = {
  interval: [
    "Intervals are the bones of every melody, bassline and chord.",
    "Producers who hear intervals can transcribe ideas instantly — no piano roll guessing.",
    "Run this for 60 seconds before a writing session and your top-lines lock in tighter.",
  ],
  chord: [
    "The 'mood' of a track is 90% chord quality. Maj vs min vs dom changes everything.",
    "Knowing chord type by ear lets you sample-flip and re-key without tools.",
    "Foundational for arrangement, harmony, vocal production.",
  ],
  "eq-cut": [
    "Mixing = surgery. You can only cut what you can hear.",
    "Trains the same skill engineers use to identify resonances and fight mud.",
    "Improves both your mix bus AND your sound design.",
  ],
  compression: [
    "Heavy comp ≠ louder. It changes feel — punch, glue, sustain.",
    "Spotting overcompression saves you from squashed mixes.",
    "Gateway skill to mastering and bus processing.",
  ],
  reverb: [
    "Tail length defines space — bedroom, club, cathedral.",
    "Hearing decay vs predelay is the difference between depth and wash.",
    "Critical for mix translation across systems.",
  ],
  panning: [
    "Width is half of a great mix. Most amateurs collapse everything to mono.",
    "Trains stereo placement awareness — where lives kick, snare, hat, vox.",
    "Builds the ears to hear phase issues before they kill your master.",
  ],
  "tempo-compare": [
    "Tempo perception is the most foundational rhythmic skill — faster vs slower, before you know the exact BPM.",
    "DJs, live performers and editors all make instant tempo judgements. This trains that reflex.",
    "Foundational for beatmatching, editing transitions, and syncing to picture.",
  ],
  "dynamic-range": [
    "Spotting compression by ear prevents over-processing — the #1 amateur mistake.",
    "This is the core skill tested in Golden Ears and SoundGym, the industry training tools.",
    "Trained mastering engineers use this exact A/B method before touching a limiter.",
  ],
  "stereo-width": [
    "Width is half of a great mix. Mono-compatible mixing requires you to hear width critically.",
    "Phase issues collapse to mono. If you can't hear width, you can't catch phase problems.",
    "Engineers check stereo width by constantly A/B-ing between stereo and mono.",
  ],
  tempo: [
    "Producers feel tempo. It's how you sync transitions, FX, edits without looking.",
    "Useful for tap-tempo on hardware and DJ blends.",
    "Quick warm-up before any session.",
  ],
};

// --- PANNING ---
export const PAN_POSITIONS = [
  { id: "L100", name: "Hard Left", val: -1 },
  { id: "L50", name: "Half Left", val: -0.5 },
  { id: "C", name: "Center", val: 0 },
  { id: "R50", name: "Half Right", val: 0.5 },
  { id: "R100", name: "Hard Right", val: 1 },
];
export function playPanned(pan: number, dur = 1.6): { stop: () => void } {
  const c = getCtx();
  if (!c) return { stop: () => {} };
  const out = c.createGain();
  out.gain.value = 0.6;
  out.connect(getMaster());
  const panner = c.createStereoPanner();
  panner.pan.value = pan;
  panner.connect(out);
  const handle = startLoop("drum-loop", 110, panner);
  const t = setTimeout(() => {
    handle.stop();
    try {
      out.disconnect();
    } catch {}
  }, dur * 1000);
  return {
    stop: () => {
      clearTimeout(t);
      handle.stop();
      try {
        out.disconnect();
      } catch {}
    },
  };
}

// --- TEMPO ---
export const TEMPO_OPTIONS = [85, 95, 105, 115, 125, 135, 145];
export function playAtTempo(bpm: number, dur = 4): { stop: () => void } {
  const c = getCtx();
  if (!c) return { stop: () => {} };
  const out = c.createGain();
  out.gain.value = 0.6;
  out.connect(getMaster());
  const handle = startLoop("drum-loop", bpm, out);
  const t = setTimeout(() => {
    handle.stop();
    try {
      out.disconnect();
    } catch {}
  }, dur * 1000);
  return {
    stop: () => {
      clearTimeout(t);
      handle.stop();
      try {
        out.disconnect();
      } catch {}
    },
  };
}

// --- INTERVAL ---
export const INTERVALS = [
  { semis: 1, name: "Minor 2nd" },
  { semis: 2, name: "Major 2nd" },
  { semis: 3, name: "Minor 3rd" },
  { semis: 4, name: "Major 3rd" },
  { semis: 5, name: "Perfect 4th" },
  { semis: 7, name: "Perfect 5th" },
  { semis: 8, name: "Minor 6th" },
  { semis: 9, name: "Major 6th" },
  { semis: 10, name: "Minor 7th" },
  { semis: 12, name: "Octave" },
];
export function playInterval(semis: number, rootMidi?: number) {
  const root = rootMidi ?? 60 + Math.floor(Math.random() * 7);
  playTone(midiToFreq(root), 0, 0.6, "triangle", 0.25);
  playTone(midiToFreq(root + semis), 0.5, 0.6, "triangle", 0.25);
}

// --- CHORDS ---
export const CHORDS = [
  { id: "maj", name: "Major", offsets: [0, 4, 7] },
  { id: "min", name: "Minor", offsets: [0, 3, 7] },
  { id: "dim", name: "Diminished", offsets: [0, 3, 6] },
  { id: "aug", name: "Augmented", offsets: [0, 4, 8] },
  { id: "maj7", name: "Major 7", offsets: [0, 4, 7, 11] },
  { id: "min7", name: "Minor 7", offsets: [0, 3, 7, 10] },
  { id: "dom7", name: "Dominant 7", offsets: [0, 4, 7, 10] },
];
export function playChord(offsets: number[], rootMidi?: number) {
  const root = rootMidi ?? 60 + Math.floor(Math.random() * 7);
  offsets.forEach((o) => playTone(midiToFreq(root + o), 0, 1.4, "triangle", 0.18));
}

// Pick a stable root once per question so Replay plays the same notes.
export const pickRootMidi = () => 60 + Math.floor(Math.random() * 7);

// --- EQ CUT ---
// Play a brief noise/pad burst with a deep notch at the chosen freq, ask which band it was.
export const EQ_BANDS = [
  { hz: 80, name: "60–120 Hz (sub)" },
  { hz: 250, name: "200–350 Hz (mud)" },
  { hz: 600, name: "500–800 Hz (boxy)" },
  { hz: 2000, name: "1.5–2.5 kHz (presence)" },
  { hz: 5000, name: "4–6 kHz (sizzle)" },
  { hz: 10000, name: "8–12 kHz (air)" },
];
export function playEqExcerpt(freq: number, durSec = 2.5): { stop: () => void } {
  const c = getCtx();
  if (!c) return { stop: () => {} };
  // Pink-ish noise
  const buf = c.createBuffer(1, c.sampleRate * durSec, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 6;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const notch = c.createBiquadFilter();
  notch.type = "notch";
  notch.frequency.value = freq;
  notch.Q.value = 4;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 14000;
  const g = c.createGain();
  g.gain.value = 0.18;
  src.connect(notch).connect(lp).connect(g).connect(getMaster());
  src.start();
  return {
    stop: () => {
      try {
        src.stop();
      } catch {}
    },
  };
}

// --- COMPRESSION ---
// Play three short bass-loop variants; user picks the heavily-compressed one.
export function playCompressedLoop(
  amount: "none" | "light" | "heavy",
  durSec = 2.6,
): { stop: () => void } {
  const c = getCtx();
  if (!c) return { stop: () => {} };
  const out = c.createGain();
  out.gain.value = 0.7;
  out.connect(getMaster());
  const comp = c.createDynamicsCompressor();
  if (amount === "none") {
    comp.threshold.value = 0;
    comp.ratio.value = 1;
  } else if (amount === "light") {
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    comp.knee.value = 6;
    comp.attack.value = 0.01;
    comp.release.value = 0.15;
  } else {
    comp.threshold.value = -36;
    comp.ratio.value = 12;
    comp.knee.value = 0;
    comp.attack.value = 0.001;
    comp.release.value = 0.05;
  }
  const make = c.createGain();
  make.gain.value = amount === "heavy" ? 4 : amount === "light" ? 1.5 : 1;
  comp.connect(make).connect(out);
  const handle = startLoop("bass-loop", 110, comp);
  const t = setTimeout(() => {
    handle.stop();
    try {
      out.disconnect();
    } catch {}
  }, durSec * 1000);
  return {
    stop: () => {
      clearTimeout(t);
      handle.stop();
      try {
        out.disconnect();
      } catch {}
    },
  };
}

// --- REVERB ---
// Play a short tone through a synthetic reverb tail (convolver with random IR).
export function playReverbHit(decaySec: number, durMs = 2200): { stop: () => void } {
  const c = getCtx();
  if (!c) return { stop: () => {} };
  const len = Math.max(0.5, Math.min(4, decaySec));
  const irBuf = c.createBuffer(2, c.sampleRate * len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = irBuf.getChannelData(ch);
    for (let i = 0; i < d.length; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.5);
  }
  const conv = c.createConvolver();
  conv.buffer = irBuf;
  const wet = c.createGain();
  wet.gain.value = 0.7;
  const dry = c.createGain();
  dry.gain.value = 0.5;
  const out = c.createGain();
  out.gain.value = 0.6;
  out.connect(getMaster());
  conv.connect(wet).connect(out);
  dry.connect(out);
  // play a vox-like chord
  [60, 64, 67].forEach((n) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = midiToFreq(n);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.18, c.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.5);
    o.connect(g);
    g.connect(dry);
    g.connect(conv);
    o.start();
    o.stop(c.currentTime + 0.55);
  });
  const t = setTimeout(() => {
    try {
      out.disconnect();
    } catch {}
  }, durMs);
  return {
    stop: () => {
      clearTimeout(t);
      try {
        out.disconnect();
      } catch {}
    },
  };
}

export const REVERB_LENGTHS = [
  { sec: 0.6, name: "Short (~0.5 s — small room)" },
  { sec: 1.5, name: "Medium (~1.5 s — hall)" },
  { sec: 3.0, name: "Long (~3 s — cathedral)" },
];

// --- score persistence ---
const KEY = "ableton.school.drills.v1";
type LocalScores = Record<string, { best: number; played: number }>;
function readLocal(): LocalScores {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
function writeLocal(s: LocalScores) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export async function saveDrillScore(drill: DrillKey, score: number, total: number) {
  // local always
  const s = readLocal();
  const cur = s[drill] || { best: 0, played: 0 };
  s[drill] = { best: Math.max(cur.best, score), played: cur.played + 1 };
  writeLocal(s);
  // cloud if signed in
  try {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    if (uid) await supabase.from("drill_scores").insert({ user_id: uid, drill, score, total });
  } catch {}
}

export function getLocalDrillStats(): LocalScores {
  return readLocal();
}
