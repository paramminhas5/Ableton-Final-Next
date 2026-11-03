/**
 * What a first-time visitor lands on: a beat and a bass line already in the loop, the
 * drum pads under their fingers. The loop starts on their first touch (browsers keep
 * audio asleep until one), so the first thing they do is tap along.
 */
import { emptyTrackV2, newLayerV2, type NoteEvent, type TrackV2 } from "./track2";

const hit = (note: number, starts: number[], vel = 0.9, len = 0.2): NoteEvent[] => starts.map(start => ({ note, vel, start, len }));

export function starterTrack(): TrackV2 {
  const t = emptyTrackV2();
  const drums = { ...newLayerV2("drums", "starter"), events: [...hit(36, [0, 1, 2, 3], 1), ...hit(38, [1, 3]), ...hit(42, [0.5, 1.5, 2.5, 3.5], 0.6, 0.1)], surface: "pads" as const };
  drums.events.sort((a, b) => a.start - b.start || a.note - b.note);
  const bass = { ...newLayerV2("bass", "starter"), events: [[0.25, 33], [0.75, 33], [1.25, 45], [1.75, 43], [2.25, 36], [2.75, 33], [3.25, 40], [3.5, 38]].map(([start, note]) => ({ note, vel: 0.9, start, len: 0.25 })), surface: "keys" as const };
  t.layers = [drums, bass];
  return t;
}
