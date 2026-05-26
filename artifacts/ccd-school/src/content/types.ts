export type WorldSlug =
  | "foundations"
  | "dj"
  | "producer"
  | "first-contact"
  | "two-views"
  | "midi-audio"
  | "devices"
  | "mixing"
  | "performance"
  | "midi-instruments"
  | "live12-power";

// ─── SIM TYPES ────────────────────────────────────────────────────────────────
// Sims marked ADVANCED are only shown in tier:"deep" missions (Pro, chapter 5+)
export type SimType =
  | "drum-pad"
  | "piano-roll"
  | "mixer"
  | "device-chain"
  | "warp-lab"
  | "session-grid"
  | "arrangement"
  | "routing-puzzle"
  | "midi-map"
  | "ear-training"
  | "interface-tour"
  | "browser-tour"
  | "midi-vs-audio"
  | "device-lab"
  | "sidechain"
  | "send-return"
  | "comp-lake"
  | "groove-extractor"
  | "bpm-tap"
  | "beat-builder"
  | "note-explorer"
  | "chord-stacker"
  | "bassline-lab"
  | "melody-shaper"
  | "song-structure"
  | "subtractive-synth"
  | "beatmatch-trainer"
  | "hot-cue-drill"
  | "loop-roll"
  | "harmonic-mix-wheel"
  | "osc-mixer"
  | "filter-envelope"
  | "lfo-lab"
  // NEW sims replacing old ones
  | "waveform-visualizer"   // replaces synth-playground on theory missions
  | "decibel-meter"         // replaces knob-trainer on amplitude missions
  | "chord-progression"     // NEW: I-IV-V-I tension/resolution
  | "signal-flow-builder"   // NEW: drag-and-drop signal chain
  // ADVANCED only (chapter 5+, tier:"deep")
  | "granular"
  | "stem-splitter"
  | "midi-transform"
  | "scale-aware"
  | "push3"
  | "none";

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
export type QuizQ = {
  q: string;
  options: string[];
  answer: number;
  explain?: string;
  hint?: string;
};

// ─── LESSON SCREENS (Duolingo-style) ──────────────────────────────────────────
// Each lesson is 5-8 screens. Every screen has an interactive element.
export type ScreenKind =
  | "hook"        // Screen 1: bold hook sentence + emoji, tap-to-continue
  | "concept"     // Screen 2-3: 2 sentences + one key fact, tap-to-continue
  | "interact"    // Screen 4: full simulator / interactive element
  | "quiz"        // Screen 5-7: one question, immediate feedback
  | "summary";    // Screen 8: recap 3 bullet points, lesson complete

export type LessonScreen =
  | {
      kind: "hook";
      emoji: string;
      headline: string;      // ≤ 8 words
      subtext: string;       // 1 sentence, ≤ 15 words
    }
  | {
      kind: "concept";
      title: string;         // ≤ 5 words
      body: string;          // ≤ 2 sentences (30 words max)
      keyFact?: string;      // 1 bold callout line ≤ 10 words
      visual?: "waveform" | "frequency-bar" | "piano" | "eq-curve" | "none";
    }
  | {
      kind: "interact";
      sim: SimType;
      prompt: string;        // instruction ≤ 10 words
      preset?: Record<string, unknown>;
    }
  | {
      kind: "quiz";
      q: string;
      options: string[];
      answer: number;
      explain: string;       // shown after answer, ≤ 2 sentences
      hint?: string;
    }
  | {
      kind: "summary";
      learned: string[];     // 3 bullet points, ≤ 8 words each
      badge?: { slug: string; name: string };
    };

// ─── EXPLAINER BLOCKS (legacy, kept for "Classic" tab) ────────────────────────
export type ExplainerBlock =
  | { kind: "lead"; text: string }
  | { kind: "para"; text: string }
  | { kind: "callout"; tone: "tip" | "warn" | "key"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "diagram"; id: string; caption?: string }
  | { kind: "link"; to: "mission" | "device" | "glossary"; slug: string; label: string };

// ─── MISSION ──────────────────────────────────────────────────────────────────
export type Mission = {
  slug: string;
  world: WorldSlug;
  number: number;
  title: string;
  tagline: string;
  xp: number;
  tier?: "core" | "deep";
  badge?: { slug: string; name: string };
  // Duolingo screens (new format — shown by default)
  screens?: LessonScreen[];
  // Legacy format (shown in "Classic" tab)
  explainer: ExplainerBlock[];
  sim: { type: SimType; preset?: Record<string, unknown> };
  quiz: QuizQ[];
};

// ─── DEEP LESSON OVERLAY (legacy, kept for Classic tab) ───────────────────────
export type LessonDeep = {
  hook?: string;
  definition?: string[];
  mechanism?: string;
  flow?: string;
  walkthrough?: { do: string; listen: string }[];
  listenFor?: string[];
  mistakes?: string[];
  proMoves?: string[];
  related?: { kind: "mission" | "device" | "glossary"; slug: string; label: string }[];
  workbenchPreset?: {
    source: "drum-loop" | "bass-loop" | "chord-pad" | "vox-chop" | "full-mix";
    chain: string[];
  };
  beginner?: { what: string[]; why: string[]; analogy?: string };
  advanced?: { what: string[]; edgeCases?: string[]; engineerNotes?: string[] };
  quizEasy?: QuizQ[];
  quizHard?: QuizQ[];
  sources?: { label: string; section: string }[];
};

export type World = {
  slug: WorldSlug;
  number: number;
  title: string;
  tagline: string;
  color: "acid" | "hot" | "volt" | "sun" | "bone" | "ink";
  description: string;
};
