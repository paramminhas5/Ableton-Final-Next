/**
 * Your track as a Standard MIDI File (type 1): one MIDI track per layer, named, so it lands
 * in Ableton Live as separate tracks. Drums use General MIDI numbers (Drum Rack pads from C1).
 */
import type { Track } from "./track";

const PPQ = 480;
const SIX = PPQ / 4;
const vlq = (n: number) => { const o = [n & 0x7f]; while ((n >>= 7)) o.unshift((n & 0x7f) | 0x80); return o; };
const u32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const u16 = (n: number) => [(n >> 8) & 255, n & 255];
const DRUM: Record<string, number> = { kick: 36, clap: 39, hats: 42, perc: 37 };
const CHORD = [0, 3, 7, 10];

function chunk(type: string, data: number[]) {
  return [...type.split("").map(c => c.charCodeAt(0)), ...u32(data.length), ...data];
}

export function trackToMidi(t: Track, bars = 4): Uint8Array {
  const tracks: number[][] = [];
  const mpq = Math.round(60_000_000 / t.bpm);
  tracks.push([0, 0xff, 0x51, 0x03, (mpq >> 16) & 255, (mpq >> 8) & 255, mpq & 255, 0, 0xff, 0x58, 0x04, 4, 2, 24, 8, 0, 0xff, 0x2f, 0x00]);
  t.layers.forEach((l, li) => {
    const ch = l.kind in DRUM ? 9 : Math.min(8, li);
    const evs: { tick: number; on: boolean; note: number; vel: number }[] = [];
    for (let b = 0; b < bars; b++) {
      for (let s = 0; s < 16; s++) {
        if (!l.steps[s]) continue;
        const start = (b * 16 + s) * SIX;
        const notes = l.kind in DRUM ? [DRUM[l.kind]] : l.kind === "chords" || l.kind === "pad" ? CHORD.map(iv => (l.notes[0] ?? 57) + iv + (l.kind === "chords" ? 12 : 0)) : [l.notes[s] ?? 45];
        const len = l.kind === "pad" ? SIX * 15 : l.kind === "chords" ? SIX * 7 : l.kind in DRUM ? SIX - 10 : Math.round(SIX * 1.6);
        for (const n of notes) {
          evs.push({ tick: start, on: true, note: n, vel: Math.round(60 + l.params[3] * 60) });
          evs.push({ tick: start + len, on: false, note: n, vel: 0 });
        }
      }
    }
    evs.sort((a, b) => a.tick - b.tick || (a.on ? 1 : 0) - (b.on ? 1 : 0));
    const name = l.kind.split("").map(c => c.charCodeAt(0));
    const data: number[] = [0, 0xff, 0x03, name.length, ...name];
    let last = 0;
    for (const e of evs) {
      data.push(...vlq(e.tick - last), (e.on ? 0x90 : 0x80) | ch, e.note & 127, e.vel & 127);
      last = e.tick;
    }
    data.push(0, 0xff, 0x2f, 0x00);
    tracks.push(data);
  });
  const bytes = [...chunk("MThd", [...u16(1), ...u16(tracks.length), ...u16(PPQ)]), ...tracks.flatMap(d => chunk("MTrk", d))];
  return new Uint8Array(bytes);
}

export function downloadTrackMidi(t: Track) {
  const blob = new Blob([trackToMidi(t).buffer as ArrayBuffer], { type: "audio/midi" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "my-track-ccd-school.mid";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
