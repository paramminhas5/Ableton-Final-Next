/**
 * Your track (v2) as a Standard MIDI File, one MIDI track per layer, so it lands in
 * Ableton Live as separate tracks. Drums on channel 10 with General MIDI notes, which
 * line up with Live's Drum Rack pads. Note events are exported exactly as recorded.
 */
import { TYPE, type NoteEvent, type TrackV2 } from "./track2";
import { withArps } from "./arp";
import { arranged } from "./arrange";
import { plays } from "./chance";
import { freeTiled, isFree, partLen, swingOf } from "./partLength";
import { swung } from "../components/m1/useEngineTrack";

const PPQ = 480;
const vlq = (n: number) => {
  const o = [n & 0x7f];
  while ((n >>= 7)) o.unshift((n & 0x7f) | 0x80);
  return o;
};
const u32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const u16 = (n: number) => [(n >> 8) & 255, n & 255];
const chunk = (type: string, data: number[]) => [...type.split("").map(c => c.charCodeAt(0)), ...u32(data.length), ...data];

export function trackV2ToMidi(t: TrackV2, repeats = 4): Uint8Array {
  t = withArps(t);
  const mpq = Math.round(60_000_000 / t.bpm);
  const tracks: number[][] = [[0, 0xff, 0x51, 0x03, (mpq >> 16) & 255, (mpq >> 8) & 255, mpq & 255, 0, 0xff, 0x58, 0x04, 4, 2, 24, 8, 0, 0xff, 0x2f, 0x00]];
  t.layers.forEach((l, li) => {
    const drums = TYPE[l.type].engine === "drums";
    const ch = drums ? 9 : Math.min(8, li);
    const evs: { tick: number; on: boolean; note: number; vel: number }[] = [];
    for (let r = 0; r < repeats; r++) {
      for (const e of l.events) {
        const start = Math.round((r * t.loop + e.start) * PPQ);
        const len = Math.max(1, Math.round(e.len * PPQ));
        const vel = Math.max(1, Math.min(127, Math.round(e.vel * 127)));
        evs.push({ tick: start, on: true, note: e.note, vel }, { tick: start + len, on: false, note: e.note, vel: 0 });
      }
    }
    evs.sort((a, b) => a.tick - b.tick || (a.on ? 1 : 0) - (b.on ? 1 : 0));
    const name = TYPE[l.type].label.split("").map(c => c.charCodeAt(0));
    const data: number[] = [0, 0xff, 0x03, name.length, ...name];
    let last = 0;
    for (const e of evs) {
      data.push(...vlq(e.tick - last), (e.on ? 0x90 : 0x80) | ch, e.note & 127, e.vel & 127);
      last = e.tick;
    }
    data.push(0, 0xff, 0x2f, 0x00);
    tracks.push(data);
  });
  return new Uint8Array([...chunk("MThd", [...u16(1), ...u16(tracks.length), ...u16(PPQ)]), ...tracks.flatMap(d => chunk("MTrk", d))]);
}

export function downloadTrackV2Midi(t: TrackV2) {
  const blob = new Blob([trackV2ToMidi(t).buffer as ArrayBuffer], { type: "audio/midi" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "my-track-ccd-school.mid";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/**
 * How chance and trig conditions reach Live. A Standard MIDI File holds notes and velocities, nothing for chance
 * (Live keeps chance per note in its own Live Set, not in a .mid; Ableton's manual says nothing of a .mid carrying
 * it), so a file can either hold the notes as you heard them or every note:
 * - "heard" (the default): the song played through, as the engine plays it, with the same seeded roll
 *   (src/lib/chance.ts mirrors engine/src/seq.rs): what you heard is what Live gets. A 1:4 step lands on every
 *   fourth bar, a 50% hat on the passes it played. In Live, the same as recording the clip's output.
 * - "every": every note at its own velocity, chance and conditions dropped (the file as it was before 5 Nov).
 * A song with no chance, no conditions and no free-running part writes exactly the file it always did.
 */
export type MidiMode = "heard" | "every";

/** Does the song have anything that plays differently from pass to pass? */
export function variesByPass(t: TrackV2): boolean {
  const ev = (e: { chance?: number; cond?: string }) => !!e.cond || (e.chance ?? 1) < 1;
  return t.layers.some(l => l.events.some(ev) || isFree(l, t.loop || 4)) || !!t.sections?.some(s => Object.values(s.notes ?? {}).some(n => n.some(ev)));
}

/** Passes the heard export plays: at least 8 bars and at least 4 times round (so a 1:4 step shows). */
export const heardPasses = (loop: number) => Math.max(4, Math.ceil(32 / Math.max(0.25, loop)));

/** The song as Live gets it, `mode` as above. Takes the song as saved (it arranges it itself). */
export function songToMidi(song: TrackV2, mode: MidiMode = "heard"): Uint8Array {
  const a = arranged(song);
  if (mode === "every" || !variesByPass(song)) return trackV2ToMidi(a, 4);
  const L = a.loop || 4;
  const passes = heardPasses(L);
  const total = passes * L;
  const seed = song.seed ?? 1;
  const unarranged = !song.sections?.length;
  const layers = a.layers.map(l => {
    const sw = swingOf(l, a);
    const out: NoteEvent[] = [];
    const strip = (e: NoteEvent): NoteEvent => ({ note: e.note, vel: e.vel, start: e.start, len: e.len });
    // The engine decides with the notes as sent: swung, so the roll's key is the swung start.
    const heard = (e: NoteEvent, n: number) => plays(swung([e], sw)[0], n, false, seed);
    if (unarranged && isFree(l, song.loop || 4)) {
      // Free running: its own time from the first beat, its plays counted by itself.
      const n = partLen(l, song.loop || 4)!;
      for (const e of freeTiled(l.events, n, 0, total)) if (heard({ ...e, start: e.start - (e.it ?? 0) * n }, e.it ?? 0)) out.push(strip(e));
    } else {
      for (let r = 0; r < passes; r++) {
        for (const e of l.events) if (heard(e, r * (e.reps ?? 1) + (e.it ?? 0))) out.push(strip({ ...e, start: r * L + e.start }));
      }
    }
    return { ...l, events: out };
  });
  return trackV2ToMidi({ ...a, loop: total, layers }, 1);
}

export function downloadSongMidi(t: TrackV2, mode: MidiMode = "heard") {
  const blob = new Blob([songToMidi(t, mode).buffer as ArrayBuffer], { type: "audio/midi" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "my-track-ccd-school.mid";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
