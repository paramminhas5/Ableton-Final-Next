/**
 * The song a placement builds (src/lib/placement.ts): the song lessons it skips still put their parts into the
 * learner's song, as each lesson's add step would with nothing played. Reads full lesson content, so the
 * placement screen loads it only when the learner accepts a start point.
 */
import { clipVariants } from "../content/lessons/clipTracks";
import { curItem } from "../content/curriculum";
import type { LessonScreen, Mission } from "../content/types";
import { HAT_NOTES, parsePattern, type CopyLayer } from "./copyEar";
import { changesSong, cueFor, withCue } from "./cues";
import { applyTake, takeType, type Take } from "./lessonTake";
import { offerFor, previewLayer, readTrack } from "./track";
import { migrateV1, readTrackV2, writeTrackV2, type TrackV2 } from "./track2";
import { missionFull } from "./lessonInfo";
import type { WorldId } from "./worldOrder";

/** A lesson's own pattern as a take, as its add step uses when the play-in is skipped (AddToTrack's presetTake). */
function presetTake(mission: Mission): Take {
  const v1 = readTrack();
  const offer = offerFor({ ...v1, added: [] }, mission);
  const layer = previewLayer({ ...v1, added: [] }, offer);
  const one = migrateV1({ v: 1, bpm: v1.bpm, layers: [{ ...layer, sidechain: false }], added: [], updatedAt: 0 });
  return { type: takeType(offer.kind), events: one.layers[0]?.events ?? [] };
}

/** What a lesson with nothing to play in changes about the song, in a word, or null (FileLesson's changeNoun). */
function changeNoun(screens: LessonScreen[]): string | null {
  const tool = [...screens].reverse().find(s => s.kind === "arrange" || s.kind === "tempo" || s.kind === "mix");
  if (!tool) return null;
  if (tool.kind === "arrange") return "arrangement";
  if (tool.kind === "mix") return "mix";
  return "setting";
}

const hasMusic = (t: TrackV2) => t.layers.some(l => l.events.length > 0);

/**
 * One skipped song lesson's part, put into the song the way its add step would with nothing played: the copy
 * step's pattern when it has one, else the lesson's own pattern; a lesson with nothing to play keeps the song
 * and marks it as added; a dj mixer lesson leaves its cue. Returns the song unchanged for a lesson that adds
 * nothing (a bonus round, a lesson with no song step) or one already in the song.
 */
export function addSkipped(t: TrackV2, slug: string, world: WorldId): TrackV2 {
  const m = missionFull(slug);
  const screens = m?.screens ?? [];
  if (!m || t.added.includes(slug) || curItem(slug)?.kind === "bonus" || !changesSong(screens)) return t;
  const copy = screens.find((s): s is Extract<LessonScreen, { kind: "copy" }> => s.kind === "copy");
  let line: Take;
  if (copy) {
    const layer = copy.layer as CopyLayer;
    const p = parsePattern(layer, copy.pattern, t.root ?? 45, t.scale);
    line = { type: layer, events: p.events.filter(e => layer !== "drums" || !HAT_NOTES.has(e.note)) };
  } else line = presetTake(m);
  const noun = changeNoun(screens);
  const mix = noun === "mix" ? [...screens].reverse().find((s): s is Extract<LessonScreen, { kind: "mix" }> => s.kind === "mix") : undefined;
  const missingPart = !noun && !t.layers.some(l => l.type === line.type && l.events.length);
  const drumish = line.type === "drums" || line.type === "hats";
  const want = new Set(line.events.map(e => e.note));
  const onOwn = t.layers.some(l => l.type === line.type && l.events.length && (!drumish || l.events.some(e => want.has(e.note))));
  // What a copy step gives is a take of its own, so it goes in even over a part the song already has.
  const keepOnly = !copy && (!screens.some(s => s.kind === "play") || onOwn) && hasMusic(t) && !missingPart;
  let made: TrackV2;
  if (mix && !hasMusic(t)) made = { ...t, ...clipVariants("kick-and-clap")[0].track, added: [...t.added, slug], updatedAt: Date.now() };
  else if (keepOnly || !line.events.length) made = { ...t, added: [...t.added, slug], updatedAt: Date.now() };
  else made = applyTake(t, slug, line, world, {});
  return mix ? withCue(made, cueFor(made, slug, mix.goal)) : made;
}

/** Put every skipped lesson's part into the open song, in order, saving after each (a lesson's pattern reads the song as it is). */
export function buildPlacedSong(slugs: string[], world: WorldId): TrackV2 {
  let t = readTrackV2();
  for (const slug of slugs) {
    const next = addSkipped(t, slug, world);
    if (next !== t) { writeTrackV2(next); t = next; }
  }
  return t;
}

