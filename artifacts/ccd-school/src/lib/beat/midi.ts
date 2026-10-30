import { LANES, STEPS, swingOffset, type Pattern } from "./pattern";

const PPQ = 480;
const SIXTEENTH = PPQ / 4; // 120 ticks

function varLen(n: number): number[] {
  const out = [n & 0x7f];
  while ((n >>= 7)) out.unshift((n & 0x7f) | 0x80);
  return out;
}
const u32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const u16 = (n: number) => [(n >> 8) & 255, n & 255];

/**
 * Standard MIDI File, type 0, one track, one channel. Notes use General MIDI drum numbers,
 * which land on the first pads of a Live Drum Rack (C1 upwards). Repeats the bar `bars` times.
 */
export function patternToMidi(p: Pattern, bpm: number, swing: number, bars = 2): Uint8Array {
  type Ev = { tick: number; order: number; bytes: number[] };
  const evs: Ev[] = [];
  const mpq = Math.round(60_000_000 / bpm);
  evs.push({ tick: 0, order: 0, bytes: [0xff, 0x51, 0x03, (mpq >> 16) & 255, (mpq >> 8) & 255, mpq & 255] });
  evs.push({ tick: 0, order: 0, bytes: [0xff, 0x58, 0x04, 4, 2, 24, 8] });
  const noteLen = Math.round(SIXTEENTH * 0.9);
  for (let bar = 0; bar < bars; bar++) {
    for (let s = 0; s < STEPS; s++) {
      const start = Math.round(bar * STEPS * SIXTEENTH + (s + swingOffset(s, swing)) * SIXTEENTH);
      for (const lane of LANES) {
        if (!p[lane.id][s]) continue;
        const vel = s % 4 === 0 ? 112 : 96;
        evs.push({ tick: start, order: 2, bytes: [0x99, lane.midi, vel] });
        evs.push({ tick: start + noteLen, order: 1, bytes: [0x89, lane.midi, 0] });
      }
    }
  }
  const end = bars * STEPS * SIXTEENTH;
  evs.push({ tick: end, order: 3, bytes: [0xff, 0x2f, 0x00] });
  evs.sort((a, b) => a.tick - b.tick || a.order - b.order);
  const track: number[] = [];
  let last = 0;
  for (const e of evs) {
    track.push(...varLen(e.tick - last), ...e.bytes);
    last = e.tick;
  }
  return Uint8Array.from([
    ...[0x4d, 0x54, 0x68, 0x64], ...u32(6), ...u16(0), ...u16(1), ...u16(PPQ),
    ...[0x4d, 0x54, 0x72, 0x6b], ...u32(track.length), ...track,
  ]);
}
