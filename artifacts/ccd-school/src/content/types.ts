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

export type SimType =
  | "drum-pad"
  | "piano-roll"
  | "mixer"
  | "device-chain"
  | "warp-lab"
  | "knob-trainer"
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
  | "midi-transform"
  | "scale-aware"
  | "stem-splitter"
  | "groove-extractor"
  | "push3"
  | "bpm-tap"
  | "granular"
  | "synth-playground"
  | "buffer-sim"
  | "tempo-compare"
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
  | "none";

export type QuizQ = {
  q: string;
  options: string[];
  answer: number; // index
  explain?: string; // shown after submitting — reinforces the correct answer
  hint?: string; // shown on demand before submitting — doesn't reveal the answer
};

export type ExplainerBlock =
  | { kind: "lead"; text: string }
  | { kind: "para"; text: string }
  | { kind: "callout"; tone: "tip" | "warn" | "key"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "diagram"; id: string; caption?: string }
  | { kind: "link"; to: "mission" | "device" | "glossary"; slug: string; label: string };

export type Mission = {
  slug: string;
  world: WorldSlug;
  number: number; // global mission number
  title: string;
  tagline: string;
  xp: number;
  tier?: "core" | "deep"; // beginner mode shows only "core"
  badge?: { slug: string; name: string };
  explainer: ExplainerBlock[];
  sim: { type: SimType; preset?: Record<string, unknown> };
  quiz: QuizQ[];
};

// Long-form lesson content overlay. Optional per-slug. Lets us deepen
// missions without rewriting the entire missions.ts file.
export type LessonDeep = {
  hook?: string; // 1-line "why this matters"
  definition?: string[]; // 2-3 plain-English paragraphs
  mechanism?: string; // how it actually works
  flow?: string; // SignalFlowSVG string e.g. "A → B → C"
  walkthrough?: { do: string; listen: string }[];
  listenFor?: string[];
  mistakes?: string[];
  proMoves?: string[];
  related?: { kind: "mission" | "device" | "glossary"; slug: string; label: string }[];
  workbenchPreset?: {
    source: "drum-loop" | "bass-loop" | "chord-pad" | "vox-chop" | "full-mix";
    chain: string[];
  };
  // Two-track content (NEW)
  beginner?: {
    what: string[]; // 2-3 plain-English paragraphs
    why: string[]; // musical outcomes
    analogy?: string; // one fun analogy
  };
  advanced?: {
    what: string[]; // 2-3 manual-grade paragraphs
    edgeCases?: string[];
    engineerNotes?: string[];
  };
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
