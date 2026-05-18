// Ear Training Sim — SoundGym/ToneGym-inspired musical drills.
// Drills: Interval · Chord Quality · Scale Recognition · Note In Scale · EQ Cut · Reverb
import { useCallback, useEffect, useRef, useState } from "react";
import { getCtx, midiToFreq } from "@/lib/audio";

// ─── Music theory helpers ────────────────────────────────────────────────────
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function playNote(
  ctx: AudioContext,
  midi: number,
  startTime: number,
  dur: number,
  vol = 0.25,
): void {
  const freq = midiToFreq(midi);
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  // Piano-like tone: triangle + octave harmonic
  osc.type = "triangle";
  osc.frequency.value = freq;
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = freq * 2;
  const g2 = ctx.createGain();
  g2.gain.value = 0.18;
  osc2.connect(g2).connect(env);

  env.gain.setValueAtTime(0.0001, startTime);
  env.gain.exponentialRampToValueAtTime(vol, startTime + 0.012);
  env.gain.exponentialRampToValueAtTime(vol * 0.7, startTime + 0.08);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
  osc.connect(env).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + dur + 0.05);
  osc2.start(startTime);
  osc2.stop(startTime + dur + 0.05);
}

// ─── Drill configs ───────────────────────────────────────────────────────────
type DrillType = "interval" | "chord" | "scale" | "note-in-scale" | "eq-cut" | "reverb";

const INTERVALS = [
  { name: "Minor 2nd", semis: 1, desc: "Half step — dissonant clash (Jaws theme)" },
  { name: "Major 2nd", semis: 2, desc: "Whole step — stepwise melody movement" },
  { name: "Minor 3rd", semis: 3, desc: "Minor chord root — sad, introspective" },
  { name: "Major 3rd", semis: 4, desc: "Major chord root — bright, happy" },
  { name: "Perfect 4th", semis: 5, desc: "Strong, open (Here Comes the Bride)" },
  { name: "Tritone", semis: 6, desc: "Most dissonant — The Simpsons theme" },
  { name: "Perfect 5th", semis: 7, desc: "Power chord — stable, strong" },
  { name: "Minor 6th", semis: 8, desc: "Romantic, yearning" },
  { name: "Major 6th", semis: 9, desc: "Sweet — My Bonnie Lies Over the Ocean" },
  { name: "Minor 7th", semis: 10, desc: "Bluesy, unresolved — wants to move" },
  { name: "Major 7th", semis: 11, desc: "Jazzy tension — nearly at the octave" },
  { name: "Octave", semis: 12, desc: "Same note, double the frequency — pure" },
];

const CHORD_TYPES = [
  { name: "Major", intervals: [0, 4, 7], desc: "Bright, happy — I chord in major key" },
  { name: "Minor", intervals: [0, 3, 7], desc: "Dark, sad — natural in minor keys" },
  {
    name: "Dominant 7th",
    intervals: [0, 4, 7, 10],
    desc: "Bluesy tension — wants to resolve down a 5th",
  },
  { name: "Minor 7th", intervals: [0, 3, 7, 10], desc: "Smooth, jazzy — common in R&B, soul" },
  { name: "Major 7th", intervals: [0, 4, 7, 11], desc: "Dreamy, sophisticated — bossa nova, jazz" },
  {
    name: "Diminished",
    intervals: [0, 3, 6],
    desc: "Tense, unstable — passing chord, horror stings",
  },
  { name: "Augmented", intervals: [0, 4, 8], desc: "Surreal, floating — no clear tonal centre" },
  { name: "Sus4", intervals: [0, 5, 7], desc: "Suspended — unstable, wants to resolve to major" },
];

const SCALE_TYPES = [
  { name: "Major", steps: [2, 2, 1, 2, 2, 2, 1], desc: "Bright, happy — most common in pop/rock" },
  {
    name: "Natural Minor",
    steps: [2, 1, 2, 2, 1, 2, 2],
    desc: "Dark — foundation of minor keys, rock, metal",
  },
  {
    name: "Dorian",
    steps: [2, 1, 2, 2, 2, 1, 2],
    desc: "Minor but brighter — jazz, funk, Daft Punk",
  },
  {
    name: "Phrygian",
    steps: [1, 2, 2, 2, 1, 2, 2],
    desc: "Exotic, dark — flamenco, metal, Arabic music",
  },
  {
    name: "Lydian",
    steps: [2, 2, 2, 1, 2, 2, 1],
    desc: "Dreamy, magical — film scores (The Simpsons)",
  },
  {
    name: "Mixolydian",
    steps: [2, 2, 1, 2, 2, 1, 2],
    desc: "Major but flat 7th — rock, blues, folk",
  },
  {
    name: "Pentatonic Minor",
    steps: [3, 2, 2, 3, 2],
    desc: "5-note — blues, rock solos, world music",
  },
];

// Pick N random unique items
function sample<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length));
}

// Build scale midi notes from root + steps
function buildScale(root: number, steps: number[]): number[] {
  const notes = [root];
  let cur = root;
  for (const s of steps) {
    cur += s;
    notes.push(cur);
  }
  return notes;
}

// ─── Audio playback ──────────────────────────────────────────────────────────
async function resumeCtx(ctx: AudioContext) {
  if (ctx.state !== "running") await ctx.resume();
}

function playInterval(ctx: AudioContext, root: number, semis: number, harmonic = false) {
  const t = ctx.currentTime + 0.05;
  playNote(ctx, root, t, 1.2);
  if (harmonic) {
    playNote(ctx, root + semis, t, 1.2);
  } else {
    playNote(ctx, root + semis, t + 0.55, 1.2);
  }
}

function playChord(ctx: AudioContext, root: number, intervals: number[], arpeggiate = false) {
  const t = ctx.currentTime + 0.05;
  intervals.forEach((iv, i) => {
    playNote(ctx, root + iv, arpeggiate ? t + i * 0.12 : t, 1.4, 0.2);
  });
}

function playScaleMelody(ctx: AudioContext, midiNotes: number[]) {
  const t = ctx.currentTime + 0.05;
  midiNotes.forEach((n, i) => playNote(ctx, n, t + i * 0.22, 0.35, 0.22));
}

function playEqCut(ctx: AudioContext, freq: number) {
  const t = ctx.currentTime + 0.05;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = 220;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
  const f = ctx.createBiquadFilter();
  f.type = "peaking";
  f.frequency.value = freq;
  f.Q.value = 4;
  f.gain.value = -18;
  osc.connect(f).connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 1.6);
}

function playReverb(ctx: AudioContext, decaySecs: number) {
  const t = ctx.currentTime + 0.05;
  const len = Math.max(0.1, decaySecs) * ctx.sampleRate;
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  }
  const conv = ctx.createConvolver();
  conv.buffer = ir;
  const wet = ctx.createGain();
  wet.gain.value = 0.7;
  const dry = ctx.createGain();
  dry.gain.value = 0.4;
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = 440;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(0.3, t + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  osc.connect(env);
  env.connect(dry).connect(ctx.destination);
  env.connect(conv).connect(wet).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.4);
}

// ─── Main component ──────────────────────────────────────────────────────────
interface DrillConfig {
  type: DrillType;
  label: string;
  emoji: string;
  description: string;
}
const DRILLS: DrillConfig[] = [
  {
    type: "interval",
    label: "Interval Recognition",
    emoji: "🎵",
    description: "Two notes — name the interval. Foundation of all harmonic hearing.",
  },
  {
    type: "chord",
    label: "Chord Quality",
    emoji: "🎸",
    description: "One chord — major, minor, 7th or more. The harmonic DNA of every song.",
  },
  {
    type: "scale",
    label: "Scale Recognition",
    emoji: "🎼",
    description: "8 notes — identify the mode. Know what scale a sample is in.",
  },
  {
    type: "note-in-scale",
    label: "Note In Scale?",
    emoji: "🎯",
    description: "Hear a scale, then a note. Is it diatonic (fits) or chromatic (clashes)?",
  },
  {
    type: "eq-cut",
    label: "EQ Frequency",
    emoji: "📉",
    description: "Identify which frequency band has a deep notch cut. Classic mixing ear test.",
  },
  {
    type: "reverb",
    label: "Reverb Decay",
    emoji: "🏛️",
    description: "Short room or long hall? Spot the reverb tail length.",
  },
];

// ─── Drill state ─────────────────────────────────────────────────────────────
interface Round {
  choices: string[];
  target: string;
  targetData: any;
  played: boolean;
}

function buildRound(type: DrillType): Round {
  const root = 48 + Math.floor(Math.random() * 12); // C3–B3
  switch (type) {
    case "interval": {
      const pool = sample(INTERVALS, 4);
      const tgt = pool[Math.floor(Math.random() * pool.length)];
      return {
        choices: pool.map((i) => i.name),
        target: tgt.name,
        targetData: { root, ...tgt },
        played: false,
      };
    }
    case "chord": {
      const pool = sample(CHORD_TYPES, 4);
      const tgt = pool[Math.floor(Math.random() * pool.length)];
      return {
        choices: pool.map((c) => c.name),
        target: tgt.name,
        targetData: { root, ...tgt },
        played: false,
      };
    }
    case "scale": {
      const pool = sample(SCALE_TYPES, 4);
      const tgt = pool[Math.floor(Math.random() * pool.length)];
      return {
        choices: pool.map((s) => s.name),
        target: tgt.name,
        targetData: { root, ...tgt },
        played: false,
      };
    }
    case "note-in-scale": {
      const scale = SCALE_TYPES[0]; // major
      const scaleNotes = buildScale(root, scale.steps);
      const chromaticNote = root + [1, 3, 6, 8, 10][Math.floor(Math.random() * 5)];
      const isDiatonic = Math.random() > 0.4;
      const testNote = isDiatonic
        ? scaleNotes[Math.floor(Math.random() * (scaleNotes.length - 1)) + 1]
        : chromaticNote;
      return {
        choices: ["In the scale (diatonic)", "Outside the scale (chromatic)"],
        target: isDiatonic ? "In the scale (diatonic)" : "Outside the scale (chromatic)",
        targetData: { root, scaleNotes, testNote, isDiatonic },
        played: false,
      };
    }
    case "eq-cut": {
      const FREQS = [80, 200, 400, 800, 1200, 2500, 4000, 8000, 12000];
      const pool = sample(FREQS, 4);
      const tgt = pool[Math.floor(Math.random() * pool.length)];
      const fmtF = (v: number) => (v >= 1000 ? `${v / 1000}kHz` : `${v}Hz`);
      return {
        choices: pool.map(fmtF),
        target: fmtF(tgt),
        targetData: { freq: tgt },
        played: false,
      };
    }
    case "reverb": {
      const DECAYS = [0.2, 0.5, 1.0, 1.8, 3.0, 5.0];
      const pool = sample(DECAYS, 4);
      const tgt = pool[Math.floor(Math.random() * pool.length)];
      return {
        choices: pool.map((v) => `${v}s`),
        target: `${tgt}s`,
        targetData: { decay: tgt },
        played: false,
      };
    }
  }
}

async function playRoundAudio(ctx: AudioContext, type: DrillType, data: any) {
  await resumeCtx(ctx);
  switch (type) {
    case "interval":
      playInterval(ctx, data.root, data.semis);
      break;
    case "chord":
      playChord(ctx, data.root, data.intervals, true);
      break;
    case "scale":
      playScaleMelody(ctx, buildScale(data.root, data.steps));
      break;
    case "note-in-scale": {
      playScaleMelody(ctx, data.scaleNotes);
      // Play test note 1.8s after scale
      const ctx2 = ctx;
      const delay = data.scaleNotes.length * 0.22 + 0.4;
      setTimeout(
        () => playNote(ctx2, data.testNote, ctx2.currentTime + 0.05, 0.8, 0.3),
        delay * 1000,
      );
      break;
    }
    case "eq-cut":
      playEqCut(ctx, data.freq);
      break;
    case "reverb":
      playReverb(ctx, data.decay);
      break;
  }
}

function getExplain(type: DrillType, target: string): string {
  switch (type) {
    case "interval":
      return INTERVALS.find((i) => i.name === target)?.desc ?? "";
    case "chord":
      return CHORD_TYPES.find((c) => c.name === target)?.desc ?? "";
    case "scale":
      return SCALE_TYPES.find((s) => s.name === target)?.desc ?? "";
    case "note-in-scale":
      return target.includes("diatonic")
        ? "It sits inside the scale — consonant, fits naturally."
        : "Outside the scale — creates chromatic tension or colour.";
    case "eq-cut": {
      const v = parseFloat(target);
      return v <= 200
        ? "Low-end — warmth, bass fundamentals, muddiness."
        : v <= 800
          ? "Low-mids — boxy buildup, often cut for clarity."
          : v <= 2500
            ? "Mids — presence, where most instruments live."
            : "High-end — air, brightness, sibilance.";
    }
    case "reverb": {
      const v = parseFloat(target);
      return v <= 0.5
        ? "Short room — tight, close-miked feel."
        : v <= 2
          ? "Medium hall — natural ambience."
          : "Long decay — cathedral, pads, FX tails.";
    }
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export function EarTrainingSim({ preset }: { preset?: Record<string, unknown> }) {
  const defaultType = (preset?.mode as DrillType) ?? "interval";
  const [activeDrill, setActiveDrill] = useState<DrillType | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const startDrill = useCallback((type: DrillType) => {
    setActiveDrill(type);
    setRound(buildRound(type));
    setPicked(null);
    setRevealed(false);
    setIsPlaying(false);
  }, []);

  // Auto-start if preset given
  useEffect(() => {
    if (defaultType && !activeDrill) startDrill(defaultType);
  }, []);

  const play = async () => {
    if (!round || isPlaying) return;
    const ctx = getCtx();
    if (!ctx) return;
    setIsPlaying(true);
    await playRoundAudio(ctx, activeDrill!, round.targetData);
    setRound((r) => (r ? { ...r, played: true } : r));
    setTimeout(() => setIsPlaying(false), 2500);
  };

  const pick = (choice: string) => {
    if (!round?.played || revealed) return; // must play first
    setPicked(choice);
    const correct = choice === round.target;
    setRevealed(true);
    setScore((s) => ({ right: s.right + (correct ? 1 : 0), total: s.total + 1 }));
    setStreak((s) => (correct ? s + 1 : 0));
  };

  const next = () => {
    if (!activeDrill) return;
    setRound(buildRound(activeDrill));
    setPicked(null);
    setRevealed(false);
    setIsPlaying(false);
  };

  const accuracy = score.total > 0 ? Math.round((score.right / score.total) * 100) : 0;

  // ── Drill selector ──────────────────────────────────────────────────────
  if (!activeDrill) {
    return (
      <div className="space-y-3">
        <div className="brutal-border bg-ink text-bone p-4">
          <div className="font-display text-3xl">EAR TRAINING</div>
          <div className="font-mono text-xs opacity-60 mt-1">
            SoundGym-style musical drills. Train the ear producers actually need.
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {DRILLS.map((d) => (
            <button
              key={d.type}
              onClick={() => startDrill(d.type)}
              className="brutal-border bg-card p-4 text-left space-y-1 brutal-press hover:bg-sun"
            >
              <div className="text-2xl">{d.emoji}</div>
              <div className="font-display text-lg">{d.label}</div>
              <div className="font-mono text-[10px] opacity-70 leading-relaxed">
                {d.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const drill = DRILLS.find((d) => d.type === activeDrill)!;
  const correct = revealed ? picked === round?.target : null;

  // ── Active drill ────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="brutal-border bg-ink text-bone p-3 flex items-center gap-3">
        <button
          onClick={() => setActiveDrill(null)}
          className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase brutal-press"
        >
          ← Back
        </button>
        <div className="flex-1">
          <div className="font-mono text-[10px] uppercase opacity-60">
            {drill.emoji} {drill.label}
          </div>
        </div>
        <div className="font-mono text-[10px] uppercase">
          {streak >= 3 && <span className="text-acid mr-2">{streak}🔥</span>}
          {score.right}/{score.total} · {accuracy}%
        </div>
      </div>

      {/* Cue */}
      {activeDrill === "note-in-scale" && (
        <div className="brutal-border bg-sun/30 p-3 font-mono text-xs leading-relaxed">
          First you'll hear a major scale. Then a single note plays. Is that note{" "}
          <strong>in</strong> the scale (diatonic) or <strong>outside</strong> it (chromatic)?
        </div>
      )}

      {/* Play button — must play before picking */}
      <button
        onClick={play}
        disabled={isPlaying}
        className={`brutal-border px-5 py-4 font-display text-2xl brutal-press w-full ${isPlaying ? "bg-hot text-bone" : "bg-acid text-ink"}`}
      >
        {isPlaying ? "▶ PLAYING..." : round?.played ? "▶ PLAY AGAIN" : "▶ PLAY"}
      </button>

      {/* Options — only interactive AFTER playing */}
      <div className="grid sm:grid-cols-2 gap-2">
        {round?.choices.map((ch) => {
          const isPicked = picked === ch;
          const isTarget = revealed && ch === round.target;
          const isWrong = revealed && isPicked && ch !== round.target;
          let cls = "bg-bone brutal-press cursor-pointer hover:bg-sun/40";
          if (!round.played && !revealed) cls = "bg-bone opacity-40 cursor-not-allowed";
          if (isTarget) cls = "bg-acid text-ink font-bold";
          if (isWrong) cls = "bg-hot text-bone";
          return (
            <button
              key={ch}
              onClick={() => pick(ch)}
              disabled={!round.played || revealed}
              className={`brutal-border px-4 py-3 font-mono text-sm text-left transition-colors ${cls}`}
            >
              {ch}
              {isTarget && <span className="ml-2">✓</span>}
              {isWrong && <span className="ml-2">✗</span>}
            </button>
          );
        })}
      </div>

      {!round?.played && !revealed && (
        <div className="font-mono text-[10px] uppercase opacity-40 text-center">
          Play the audio first, then pick an answer
        </div>
      )}

      {/* Result */}
      {revealed && round && (
        <div
          className={`brutal-border px-4 py-4 space-y-1 ${correct ? "bg-volt text-bone" : "bg-ink text-bone"}`}
        >
          <div className="font-display text-2xl">{correct ? "✓ CORRECT" : "✗ WRONG"}</div>
          {!correct && (
            <div className="font-mono text-xs opacity-80">
              Answer: <strong>{round.target}</strong>
            </div>
          )}
          <div className="font-mono text-sm leading-relaxed border-t border-current/20 pt-2 mt-1">
            {getExplain(activeDrill, round.target)}
          </div>
        </div>
      )}

      {revealed && (
        <button
          onClick={next}
          className="brutal-border bg-ink text-bone px-5 py-3 font-display text-xl brutal-press"
        >
          NEXT →
        </button>
      )}
    </div>
  );
}
