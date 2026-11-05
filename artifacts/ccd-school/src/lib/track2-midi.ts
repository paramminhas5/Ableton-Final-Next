/**
 * Your track (v2) as a Standard MIDI File, one MIDI track per layer, so it lands in
 * Ableton Live as separate tracks. Drums on channel 10 with General MIDI notes, which
 * line up with Live's Drum Rack pads. Note events are exported exactly as recorded.
 */
import { TYPE, type TrackV2 } from "./track2";
import { withArps } from "./arp";

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
