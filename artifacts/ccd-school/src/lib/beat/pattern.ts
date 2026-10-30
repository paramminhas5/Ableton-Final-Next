/** First Beat: a 16-step drum pattern, its presets, timing, and swing. Pure, no audio. */
export const STEPS = 16;

export type Lane = "kick" | "snare" | "hat" | "ohat" | "clap";
export const LANES: { id: Lane; label: string; midi: number }[] = [
  { id: "kick", label: "Kick", midi: 36 },
  { id: "snare", label: "Snare", midi: 38 },
  { id: "clap", label: "Clap", midi: 39 },
  { id: "hat", label: "Closed hat", midi: 42 },
  { id: "ohat", label: "Open hat", midi: 46 },
];

export type Pattern = Record<Lane, boolean[]>;

const row = (...on: number[]) => Array.from({ length: STEPS }, (_, i) => on.includes(i));
export const emptyPattern = (): Pattern => ({ kick: row(), snare: row(), clap: row(), hat: row(), ohat: row() });

export interface Preset {
  id: string;
  name: string;
  bpm: number;
  swing: number; // 0..1
  note: string;
  pattern: Pattern;
}

export const PRESETS: Preset[] = [
  {
    id: "house", name: "House", bpm: 124, swing: 0,
    note: "Kick on every beat, clap on 2 and 4, open hat on the offbeat. The pulse that moves a dance floor.",
    pattern: { kick: row(0, 4, 8, 12), snare: row(), clap: row(4, 12), hat: row(0, 2, 4, 6, 8, 10, 12, 14), ohat: row(2, 6, 10, 14) },
  },
  {
    id: "boombap", name: "Boom bap", bpm: 90, swing: 0.55,
    note: "Kick and snare leave space between them and the swing makes it lazy. Raise the swing and listen to the hats.",
    pattern: { kick: row(0, 7, 10), snare: row(4, 12), clap: row(), hat: row(0, 2, 4, 6, 8, 10, 12, 14), ohat: row() },
  },
  {
    id: "breakbeat", name: "Breakbeat", bpm: 135, swing: 0.1,
    note: "The snare lands on 2 and 4 but the kicks are syncopated, so the beat tumbles forward.",
    pattern: { kick: row(0, 3, 10), snare: row(4, 12), clap: row(), hat: row(0, 2, 4, 6, 8, 10, 12, 14), ohat: row(14) },
  },
  {
    id: "dnb", name: "Drum and bass", bpm: 172, swing: 0,
    note: "Fast tempo, but the snare still feels half-time because it only hits on beats 2 and 4 of a slower count.",
    pattern: { kick: row(0, 10), snare: row(4, 12), clap: row(), hat: row(0, 2, 4, 6, 8, 10, 12, 14), ohat: row() },
  },
];

/** how far a step is pushed late, as a fraction of one step (16th). 0 = straight, 1 = full triplet feel. */
export function swingOffset(step: number, swing: number): number {
  return step % 2 === 1 ? Math.min(1, Math.max(0, swing)) * (1 / 3) : 0;
}

/** seconds from the bar start to a step */
export function stepTime(step: number, bpm: number, swing: number): number {
  const sixteenth = 60 / bpm / 4;
  return (step + swingOffset(step, swing)) * sixteenth;
}

export const countHits = (p: Pattern) => LANES.reduce((a, l) => a + p[l.id].filter(Boolean).length, 0);
