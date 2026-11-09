/** Which lesson opens each practice drill (moved out of GymPageClient so home's widget tells the same truth). */
import type { GymDrill } from "./engine";

/** A drill opens once a lesson has taught it: the gym practises what you've learnt, it doesn't test you on what you haven't. */
export const TAUGHT_BY: Record<GymDrill, { slugs: string[]; first: string; title: string }> = {
  eq: { slugs: ["eq-place", "eq-eight", "eq-mixing-dj"], first: "eq-place", title: "eq: a place for everything" },
  compression: { slugs: ["glue", "compressor", "glue-compressor"], first: "glue", title: "glue: compression and loudness" },
  groove: { slugs: [], first: "groove-feel", title: "groove and swing" },
  // Opens after any lesson with a match step (first-bass is the first).
  // Opens after any lesson with a copy step (your-kick is the first).
  copy: { slugs: ["your-kick", "what-is-rhythm", "clap-and-snare", "first-bass", "kick-and-bass", "chords-on-top", "lead-width", "major-scale", "intervals", "melody-writing", "what-are-chords", "chord-progressions", "bass-follows", "notes-and-octaves", "ear-higher-lower"], first: "your-kick", title: "your kick" },
  // Opens after any lesson with an imagine step (writing a melody is the first in basics).
  imagine: { slugs: ["melody-writing", "intervals", "chord-progressions", "bass-follows", "first-bass", "syncopation"], first: "melody-writing", title: "writing a melody" },
  match: { slugs: ["first-bass", "shape-your-synth", "kick-designer", "saturator-distortion", "warp-modes-deep", "collision-tension-electric"], first: "first-bass", title: "your first bass line" },
};

/** A drill is open once a lesson has taught it (groove has no lesson gate). */
export const drillOpen = (d: GymDrill, done: Record<string, unknown>) => !TAUGHT_BY[d].slugs.length || TAUGHT_BY[d].slugs.some(sl => !!done[sl]);
