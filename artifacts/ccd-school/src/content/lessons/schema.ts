import type { LayerType } from "../../lib/track2";
import type { EarPart, EarSound } from "../../lib/askEar";
import type { BriefCheck } from "../../lib/briefCheck";

export type Voice = "mentor" | "straight" | "eli5";
export type Level = "gentle" | "standard" | "hard";

export const VOICES: readonly Voice[] = ["mentor", "straight", "eli5"];
export const LEVELS: readonly Level[] = ["gentle", "standard", "hard"];
export const LAYERS: readonly LayerType[] = ["drums", "hats", "bass", "chords", "lead", "fx", "sample"];
export const SURFACES = ["pads", "steps", "keys"] as const;
export type LessonSurface = (typeof SURFACES)[number];
export const DRILLS = ["pitch", "eq", "interval", "timbre", "kick"] as const;
export type Drill = (typeof DRILLS)[number];
export const STEP_KINDS = ["hear", "say", "play", "shape", "match", "copy", "imagine", "tempo", "mix", "arrange", "ask", "ear", "keep"] as const;
export type StepKind = (typeof STEP_KINDS)[number];

/* ------------------------------ raw file shape ------------------------------ */

/**
 * `why` on a step you do (play, shape, match, copy, imagine, tempo, mix, arrange): one or two plain sentences
 * on what this step is for and what you come away with. It shows above the instrument, before you touch
 * anything (Param, 10 Nov: "asking me to play the steps without telling me why"). Left out, the lesson's
 * song.why stands in.
 */
export type StepWhy = { why?: VoiceText };

/** A string applies to every voice. An object must carry `mentor`; the others fall back to it. */
export type VoiceText = string | { mentor: string; straight?: string; eli5?: string };

/** `on`: where the hits must land. "beat" on the beat, "and" halfway between beats, "backbeat" on two and four. For a tune: "between" counts only notes off the beat (in the gaps between kicks), "different" counts different chords, not presses. Missing: backbeat for a clap or snare, the beat for any other named drum. */
/** `check`: write your own, checked (src/lib/briefCheck.ts). What can be heard in the notes is said in plain words after each take; it never blocks. */
export type PlayGoal = { notes: number; note?: string; on?: "beat" | "and" | "backbeat" | "between" | "different"; check?: BriefCheck[] };
export type Rounds = number | { gentle: number; standard: number; hard: number };

export type RawPlay = { kind: "play"; layer: LayerType; surface: LessonSurface; goal: PlayGoal; say: VoiceText; hint?: VoiceText; levels?: Level[]; snap?: boolean } & StepWhy;
export type RawShape = { kind: "shape"; layer: LayerType; knobs: string[]; say: VoiceText; hint?: VoiceText; levels?: Level[] } & StepWhy;
export type RawTry = RawPlay | RawShape;
/**
 * Match this sound (touch and hear, item 13; Syntorial's method on our own instruments): the engine plays
 * a target made from hidden settings of `knobs` on the learner's own part, and they turn the lit knobs
 * until theirs sounds the same. `target` holds each knob's hidden value, normalised 0..1.
 */
export type RawMatch = { kind: "match"; layer: LayerType; knobs: string[]; target: Record<string, number>; say: VoiceText; hint?: VoiceText; levels?: Level[] } & StepWhy;
/**
 * Copy by ear (Building Blocks' recreation challenges): a hidden pattern plays and the learner writes it on a
 * grid. `pattern` is a drum map (`{kick: "x...x..."}`) or a tune line in the song's scale (`"1 - . . 3 - . ."`);
 * see src/lib/copyEar.ts. `layer` is drums, bass, chords or lead. What they copy goes into their song.
 */
export type RawCopy = { kind: "copy"; layer: "drums" | "bass" | "chords" | "lead"; pattern: string | Record<string, string>; say: VoiceText; hint?: VoiceText; levels?: Level[] } & StepWhy;
/**
 * Imagine it first (Building Blocks' Mind's Ear, src/lib/imagine.ts): the notes of `pattern` show on the grid
 * with no sound; the learner hums it, then picks which of two or three phrases played on their song is the one
 * they saw, then hears it. `others`: phrases it could be mistaken for; made from the pattern when left out.
 */
export type RawImagine = { kind: "imagine"; layer: "drums" | "bass" | "chords" | "lead"; pattern: string | Record<string, string>; others?: (string | Record<string, string>)[]; say: VoiceText; hint?: VoiceText; levels?: Level[] } & StepWhy;
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
  /**
   * Answered by ear (src/lib/askEar.ts): `part` plays on its own (with the `with` parts under it), `play` is a
   * sound for the question (one, or two as a and b), `sounds` one per option, picked by listening.
   */
  part?: EarPart;
  with?: EarPart[];
  play?: EarSound | EarSound[];
  sounds?: EarSound[];
};
export type RawEar = { kind: "ear"; drill: Drill; rounds: Rounds; say?: VoiceText; hint?: VoiceText; levels?: Level[] };
export type RawKeep = { kind: "keep"; next: VoiceText; levels?: Level[] };
/** Set the song's tempo on one knob, the loop playing at whatever it is turned to. `marks` are the speeds named on the dial. */
/** `set: swing` turns the same step into the song's swing knob (marks are 0 to 0.75). */
export type RawTempo = { kind: "tempo"; say: VoiceText; marks?: number[]; set?: "tempo" | "swing" | "scale" | "glue" | "kit" | "arp" | "key" | "grid" | "mic" | "comp" | "sample" | "macro" | "chords" | "player" | "chance" | "length" | "commit"; choices?: string[]; layer?: string; hint?: VoiceText; levels?: Level[] } & StepWhy;
/** Two decks and a mixer. Deck a plays your song, deck b a bank track. `goal` is what has to happen before go. */
export type MixGoal = "crossfade" | "match" | "blend" | "swap" | "key" | "cut" | "phrase" | "echo" | "free" | "sync" | "cue" | "loop" | "stems" | "shift" | "curve" | "file" | "record" | "punch";
export type RawMix = { kind: "mix"; say: VoiceText; goal: MixGoal; bank?: string; hint?: VoiceText; levels?: Level[] } & StepWhy;
/** Your song as sections: switch parts on and off per section, add fills, or export it. */
export type ArrangeGoal = "sections" | "drop" | "fills" | "risers" | "export";
export type RawArrange = { kind: "arrange"; say: VoiceText; goal: ArrangeGoal; hint?: VoiceText; levels?: Level[] } & StepWhy;
export type RawStep = RawHear | RawSay | RawPlay | RawShape | RawMatch | RawCopy | RawImagine | RawTempo | RawMix | RawArrange | RawAsk | RawEar | RawKeep;

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
  | { kind: "match"; layer: LayerType; knobs: string[]; target: Record<string, number>; level?: Level; say: string; hint?: string }
  | { kind: "copy"; layer: "drums" | "bass" | "chords" | "lead"; pattern: string | Record<string, string>; level: Level; say: string; hint?: string }
  | { kind: "imagine"; layer: "drums" | "bass" | "chords" | "lead"; choices: (string | Record<string, string>)[]; answer: number; level: Level; say: string; hint?: string }
  | { kind: "ask"; q: string; options: string[]; answer: number; why: string; whyWrong?: Record<number, string>; hint?: string; more?: boolean; ear?: AskEar }
  | { kind: "ear"; drill: Drill; rounds: number; say?: string; hint?: string }
  | { kind: "tempo"; say: string; marks: number[]; set: "tempo" | "swing" | "scale" | "glue" | "kit" | "arp" | "key" | "grid" | "mic" | "comp" | "sample" | "macro" | "chords" | "player" | "chance" | "length" | "commit"; choices?: string[]; layer?: string; hint?: string }
  | { kind: "mix"; say: string; goal: MixGoal; bank?: string; hint?: string }
  | { kind: "arrange"; say: string; goal: ArrangeGoal; hint?: string }
  | { kind: "keep"; next: string };

/** What a question answered by ear plays: `play` for the question, `sounds` one per option (in the shown order). */
export type AskEar = { part?: EarPart; with?: EarPart[]; play?: EarSound[]; sounds?: EarSound[] };

/** The lesson as stored in lessons.gen.json: raw text kept intact so the voice can change at runtime. */
export type Lesson = RawLesson & { file: string };
