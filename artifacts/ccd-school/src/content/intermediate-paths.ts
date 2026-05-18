// ─── INTERMEDIATE ABLETON PATH ────────────────────────────────────────────────
// The structured Ableton path for intermediate mode.
// "Core" = missions visible in intermediate mode (no Ableton required to follow along
//   conceptually, but having it open supercharges learning).
// "Extended" = intermediate with Ableton open.
// "Advanced" = deep production-level content.
//
// This maps to mission slugs already defined in missions.ts.
// ─────────────────────────────────────────────────────────────────────────────

export type IntermediateAbletonSection = {
  title: string;
  tagline: string;
  color: string;
  description: string;
  missionSlugs: string[];
  requiresAbleton: boolean;
};

// ── FUNDAMENTALS (everyone) ───────────────────────────────────────────────────
// These 8 missions are the "explained like you're 5" Ableton fundamentals
// that ALL intermediate learners should complete before branching.
// They work conceptually even without Ableton downloaded.
export const INTERMEDIATE_FUNDAMENTALS: IntermediateAbletonSection = {
  title: "The Fundamentals",
  tagline: "What everyone should know, even if you don't have Ableton yet.",
  color: "bg-acid",
  description:
    "Live's core concepts explained clearly. Session view, tracks, clips, MIDI vs audio, the browser, and the mixer. You can follow along conceptually — but if you have Ableton open, even better.",
  requiresAbleton: false,
  missionSlugs: [
    "what-is-live",
    "interface-tour",
    "browser",
    "session-view",
    "clips",
    "tracks",
    "midi-vs-audio-live", // fallback to "tracks" if slug differs
    "the-mixer",
  ],
};

// ── ABLETON PATH SECTIONS ────────────────────────────────────────────────────
export const INTERMEDIATE_ABLETON_SECTIONS: IntermediateAbletonSection[] = [
  {
    title: "Make Your First Beat",
    tagline: "From zero to a looping idea in Session.",
    color: "bg-acid",
    description:
      "Session view, clips, tracks, MIDI and the drum rack. No Ableton? Follow conceptually. Have Ableton? Build a beat as you go.",
    requiresAbleton: false,
    missionSlugs: [
      "what-is-live",
      "interface-tour",
      "browser",
      "session-view",
      "clips",
      "tracks",
      "midi-piano-roll",
      "drum-rack",
      "instruments-overview",
      "the-mixer",
    ],
  },
  {
    title: "Sound & Recording",
    tagline: "Get audio in. Get audio right.",
    color: "bg-volt",
    description:
      "MIDI vs audio, warping, recording into Ableton. Best followed with Ableton open and an audio source.",
    requiresAbleton: true,
    missionSlugs: [
      "midi-vs-audio",
      "audio-clips",
      "warping",
      "recording",
      "comping-flow",
      "take-lanes",
    ],
  },
  {
    title: "Mixing Basics",
    tagline: "Balance your tracks so everything fits.",
    color: "bg-sun",
    description:
      "Volume, EQ, compression, sends and reverb. The skills that make an idea sound finished.",
    requiresAbleton: true,
    missionSlugs: [
      "the-mixer",
      "groups-routing",
      "eq-eight",
      "compressor",
      "sends-returns",
      "reverb-delay",
      "limiter-truepeak",
    ],
  },
  {
    title: "Arrangement",
    tagline: "Take your loop and build a full track.",
    color: "bg-hot",
    description:
      "Arrangement view, automation, finishing a track. The path most producers never actually finish — until now.",
    requiresAbleton: true,
    missionSlugs: [
      "arrangement-view",
      "linked-track-editing",
      "automation",
      "modulation-lanes",
      "exporting",
    ],
  },
];

// ── ADVANCED ABLETON SECTIONS ─────────────────────────────────────────────────
export const ADVANCED_ABLETON_SECTIONS: IntermediateAbletonSection[] = [
  {
    title: "Synthesis & Sound Design",
    tagline: "Make your own sounds from scratch.",
    color: "bg-volt",
    description:
      "Wavetable, Operator, Meld, Drift. You'll want Ableton open and ideally a MIDI keyboard.",
    requiresAbleton: true,
    missionSlugs: [
      "instruments-overview",
      "wavetable",
      "operator",
      "meld",
      "drift",
      "sampler-simpler",
      "sampler-deep",
      "drum-rack",
      "drum-sampler",
      "racks-macros",
      "roar",
    ],
  },
  {
    title: "Performance & Stage",
    tagline: "From bedroom to stage.",
    color: "bg-hot",
    description:
      "Push, MIDI mapping, Ableton Link, tempo sync. Best with a controller in hand.",
    requiresAbleton: true,
    missionSlugs: [
      "push-controllers",
      "push3-workflow",
      "midi-mapping",
      "ableton-link",
      "ableton-link-sync",
      "tempo-following",
      "scenes-follow",
    ],
  },
  {
    title: "Live 12 Power Tools",
    tagline: "What makes Live 12 a step-change.",
    color: "bg-acid",
    description:
      "Stem separation, MIDI transforms, scale awareness, sound similarity, Push 3 standalone.",
    requiresAbleton: true,
    missionSlugs: [
      "stem-separation",
      "midi-transforms",
      "scale-awareness",
      "sound-similarity",
      "groove-pool",
      "push3-standalone",
    ],
  },
];

// Flat list of core intermediate Ableton missions (no duplicates)
export const INTERMEDIATE_ABLETON_SLUGS = [
  ...new Set([
    ...INTERMEDIATE_FUNDAMENTALS.missionSlugs,
    ...INTERMEDIATE_ABLETON_SECTIONS.flatMap((s) => s.missionSlugs),
  ]),
];
