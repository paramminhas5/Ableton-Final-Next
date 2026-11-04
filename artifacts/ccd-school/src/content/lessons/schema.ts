import type { LayerType } from "../../lib/track2";

export type Voice = "mentor" | "straight" | "eli5";
export type Level = "gentle" | "standard" | "hard";

export const VOICES: readonly Voice[] = ["mentor", "straight", "eli5"];
export const LEVELS: readonly Level[] = ["gentle", "standard", "hard"];
export const LAYERS: readonly LayerType[] = ["drums", "hats", "bass", "chords", "lead", "fx", "sample"];
export const SURFACES = ["pads", "steps", "keys"] as const;
export type LessonSurface = (typeof SURFACES)[number];
export const DRILLS = ["pitch", "eq", "interval", "timbre", "kick"] as const;
export type Drill = (typeof DRILLS)[number];
export const STEP_KINDS = ["hear", "say", "play", "shape", "tempo", "mix", "arrange", "ask", "ear", "keep"] as const;
export type StepKind = (typeof STEP_KINDS)[number];

/* ------------------------------ raw file shape ------------------------------ */

/** A string applies to every voice. An object must carry `mentor`; the others fall back to it. */
export type VoiceText = string | { mentor: string; straight?: string; eli5?: string };

export type PlayGoal = { notes: number; note?: string };
export type Rounds = number | { gentle: number; standard: number; hard: number };

export type RawPlay = { kind: "play"; layer: LayerType; surface: LessonSurface; goal: PlayGoal; say: VoiceText; hint?: VoiceText; levels?: Level[]; snap?: boolean };
export type RawShape = { kind: "shape"; layer: LayerType; knobs: string[]; say: VoiceText; hint?: VoiceText; levels?: Level[] };
export type RawTry = RawPlay | RawShape;
export type RawDeeper = { title: string; say: VoiceText; try?: RawTry };

export type RawHear = { kind: "hear"; clip: string; say: VoiceText; deeper?: RawDeeper[]; levels?: Level[] };
export type RawSay = { kind: "say"; title: string; say: VoiceText; clip?: string; deeper?: RawDeeper[]; hint?: VoiceText; levels?: Level[] };
export type RawAsk = {
  kind: "ask";
  q: VoiceText;
  options: string[];
  answer: number;
  why: VoiceText;
  whyWrong?: Record<number, VoiceText>;
  hint?: VoiceText;
  /** Held back for "ask me more" instead of the main run. */
  more?: boolean;
  levels?: Level[];
};
export type RawEar = { kind: "ear"; drill: Drill; rounds: Rounds; say?: VoiceText; hint?: VoiceText; levels?: Level[] };
export type RawKeep = { kind: "keep"; next: VoiceText; levels?: Level[] };
/** Set the song's tempo on one knob, the loop playing at whatever it is turned to. `marks` are the speeds named on the dial. */
/** `set: swing` turns the same step into the song's swing knob (marks are 0 to 0.75). */
export type RawTempo = { kind: "tempo"; say: VoiceText; marks?: number[]; set?: "tempo" | "swing" | "scale" | "glue" | "kit" | "arp" | "key" | "grid" | "mic" | "comp" | "sample" | "macro"; choices?: string[]; layer?: string; hint?: VoiceText; levels?: Level[] };
/** Two decks and a mixer. Deck a plays your song, deck b a bank track. `goal` is what has to happen before go. */
export type MixGoal = "crossfade" | "match" | "blend" | "swap" | "key" | "cut" | "phrase" | "echo" | "free" | "sync" | "cue" | "loop" | "stems" | "shift" | "curve" | "file" | "record";
export type RawMix = { kind: "mix"; say: VoiceText; goal: MixGoal; bank?: string; hint?: VoiceText; levels?: Level[] };
/** Your song as sections: switch parts on and off per section, add fills, or export it. */
export type ArrangeGoal = "sections" | "drop" | "fills" | "risers" | "export";
export type RawArrange = { kind: "arrange"; say: VoiceText; goal: ArrangeGoal; hint?: VoiceText; levels?: Level[] };
export type RawStep = RawHear | RawSay | RawPlay | RawShape | RawTempo | RawMix | RawArrange | RawAsk | RawEar | RawKeep;

export type SongChange = { adds: string; changes?: undefined; why: VoiceText } | { changes: string; adds?: undefined; why: VoiceText };

export type RawLesson = {
  slug: string;
  world: string;
  number: number;
  title: string;
  minutes: number;
  song: SongChange;
  learn: VoiceText;
  /** What you can do after the lesson, one short line each. Shown on the last screen. */
  youCan?: string[];
  steps: RawStep[];
};

/* ------------------------------ resolved shape ------------------------------ */

export type ResolvedTry = { kind: "play"; layer: LayerType; surface: LessonSurface; goal: PlayGoal; say: string; hint?: string; snap?: boolean } | { kind: "shape"; layer: LayerType; knobs: string[]; say: string; hint?: string };
export type ResolvedDeeper = { title: string; say: string; try?: ResolvedTry };

export type ResolvedStep =
  | { kind: "hear"; clip: string; say: string; deeper: ResolvedDeeper[] }
  | { kind: "say"; title: string; say: string; clip?: string; deeper: ResolvedDeeper[]; hint?: string }
  | ({ kind: "play" } & Omit<Extract<ResolvedTry, { kind: "play" }>, "kind">)
  | ({ kind: "shape" } & Omit<Extract<ResolvedTry, { kind: "shape" }>, "kind">)
  | { kind: "ask"; q: string; options: string[]; answer: number; why: string; whyWrong?: Record<number, string>; hint?: string; more?: boolean }
  | { kind: "ear"; drill: Drill; rounds: number; say?: string; hint?: string }
  | { kind: "tempo"; say: string; marks: number[]; set: "tempo" | "swing" | "scale" | "glue" | "kit" | "arp" | "key" | "grid" | "mic" | "comp" | "sample" | "macro"; choices?: string[]; layer?: string; hint?: string }
  | { kind: "mix"; say: string; goal: MixGoal; bank?: string; hint?: string }
  | { kind: "arrange"; say: string; goal: ArrangeGoal; hint?: string }
  | { kind: "keep"; next: string };

/** The lesson as stored in lessons.gen.json: raw text kept intact so the voice can change at runtime. */
export type Lesson = RawLesson & { file: string };
