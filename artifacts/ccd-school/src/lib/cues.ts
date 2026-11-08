/**
 * DJ cues on your song. A dj lesson practises a move on the decks (a blend, a cut, a key match) and leaves a
 * mark on your song where that move lands: a named cue at a bar, the way djs mark a track before a set.
 * It doesn't change how the song sounds; the song strip and the done screen say so.
 */
import type { MixGoal } from "@/content/lessons/schema";
import type { TrackV2 } from "./track2";

export type Cue = { slug: string; name: string; bar: number };

/** What each mixer move marks on your song, and where: "first" is bar 1, "last" the start of the song's last
 * 16 bars (where a dj starts a mix out), or bar 1 on a song shorter than that. */
const CUE: Record<MixGoal, { name: string; at: "first" | "last" }> = {
  crossfade: { name: "crossfade out", at: "last" },
  match: { name: "tempo checked", at: "first" },
  blend: { name: "mix out", at: "last" },
  swap: { name: "bass swap", at: "last" },
  key: { name: "key match", at: "first" },
  cut: { name: "cut on the one", at: "first" },
  phrase: { name: "mix in on the one", at: "first" },
  echo: { name: "echo out", at: "last" },
  free: { name: "your move", at: "last" },
  sync: { name: "synced", at: "first" },
  cue: { name: "cue", at: "first" },
  loop: { name: "loop here", at: "last" },
  stems: { name: "drums only", at: "last" },
  shift: { name: "key shift", at: "first" },
  curve: { name: "sharp cut", at: "last" },
  file: { name: "next track", at: "last" },
  record: { name: "recorded mix", at: "first" },
  punch: { name: "punch-in effects", at: "last" },
};

/** Bars in the song: the arrangement when there is one, otherwise the loop. */
export function songBars(t: Pick<TrackV2, "loop" | "sections">): number {
  const s = t.sections?.reduce((a, x) => a + x.bars, 0) ?? 0;
  return Math.max(1, s || Math.ceil((t.loop || 4) / 4));
}

/** The cue a lesson's mixer goal leaves on this song. */
export function cueFor(t: Pick<TrackV2, "loop" | "sections">, slug: string, goal: MixGoal): Cue {
  const c = CUE[goal] ?? CUE.free;
  // A looping song has no last bar of its own: djs mix out at the end of an eight-bar phrase, so that's where it goes.
  // An arranged song gets it where its last 16 bars start, where a dj starts the mix out.
  return { slug, name: c.name, bar: c.at === "first" ? 1 : t.sections?.length ? Math.max(1, songBars(t) - 15) : 8 };
}

/** The song with this lesson's cue on it. One cue per lesson: doing it again replaces it. */
export function withCue(t: TrackV2, cue: Cue): TrackV2 {
  const cues = (t.cues ?? []).filter(c => c.slug !== cue.slug);
  return { ...t, cues: [...cues, cue].sort((a, b) => a.bar - b.bar) };
}

export const cuesOf = (t: TrackV2 | null | undefined): Cue[] => t?.cues ?? [];

/** Whether two songs would sound the same: everything the engine plays, ignoring names, cues and timestamps. */
export function soundsSame(a: TrackV2, b: TrackV2): boolean {
  const key = (t: TrackV2) => JSON.stringify({ bpm: t.bpm, root: t.root, scale: t.scale, swing: t.swing, loop: t.loop, layers: t.layers.map(l => ({ ...l, from: undefined, id: undefined })), master: t.master ?? null, sections: t.sections ?? null });
  return key(a) === key(b);
}

/** Steps that change your song, so a lesson with one of them ends with an add (or keep, or mark) step. */
const SONG_STEPS = new Set(["play", "copy", "shape", "tempo", "arrange", "mix"]);
export const changesSong = (screens: { kind: string }[]): boolean => screens.some(s => SONG_STEPS.has(s.kind));

/** The song started from a bar: every event moved back by that many bars, wrapping round the song. */
export function fromBar(t: TrackV2, bar: number): TrackV2 {
  const L = t.loop || 4;
  const off = (((bar - 1) * 4) % L + L) % L;
  if (!off) return t;
  return { ...t, layers: t.layers.map(l => ({ ...l, events: l.events.map(e => ({ ...e, start: (((e.start - off) % L) + L) % L })).sort((a, b) => a.start - b.start) })) };
}
