import { describe, it, expect } from "vitest";
import { LANES, PRESETS, STEPS, countHits, emptyPattern, stepTime, swingOffset } from "../src/lib/beat/pattern";
import { patternToMidi } from "../src/lib/beat/midi";

/** minimal SMF reader, written independently of the writer */
function readMidi(b: Uint8Array) {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const tag = (o: number) => String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);
  expect(tag(0)).toBe("MThd");
  const ppq = dv.getUint16(12);
  expect(tag(14)).toBe("MTrk");
  const len = dv.getUint32(18);
  let o = 22, tick = 0, status = 0, bpm = 0;
  const notes: { tick: number; note: number; vel: number }[] = [];
  let ended = false;
  while (o < 22 + len) {
    let d = 0, c;
    do { c = b[o++]; d = (d << 7) | (c & 0x7f); } while (c & 0x80);
    tick += d;
    if (b[o] === 0xff) {
      const type = b[o + 1], l = b[o + 2];
      if (type === 0x51) bpm = Math.round(60_000_000 / ((b[o + 3] << 16) | (b[o + 4] << 8) | b[o + 5]));
      if (type === 0x2f) ended = true;
      o += 3 + l;
    } else {
      status = b[o] & 0x80 ? b[o++] : status;
      const n = b[o++], v = b[o++];
      if ((status & 0xf0) === 0x90 && v > 0) notes.push({ tick, note: n, vel: v });
    }
  }
  expect(o).toBe(22 + len);
  return { ppq, bpm, notes, ended };
}

describe("beat patterns", () => {
  it("presets are complete 16-step patterns with notes and valid ranges", () => {
    for (const p of PRESETS) {
      for (const l of LANES) expect(p.pattern[l.id], `${p.id}:${l.id}`).toHaveLength(STEPS);
      expect(countHits(p.pattern), p.id).toBeGreaterThan(4);
      expect(p.bpm).toBeGreaterThanOrEqual(60);
      expect(p.swing).toBeGreaterThanOrEqual(0);
      expect(p.swing).toBeLessThanOrEqual(1);
      expect(p.note).not.toMatch(/—/);
    }
  });
  it("swing only delays off-steps", () => {
    expect(swingOffset(0, 1)).toBe(0);
    expect(swingOffset(2, 1)).toBe(0);
    expect(swingOffset(1, 0)).toBe(0);
    expect(swingOffset(1, 1)).toBeCloseTo(1 / 3);
    expect(stepTime(1, 120, 1)).toBeGreaterThan(stepTime(1, 120, 0));
    expect(stepTime(4, 120, 0)).toBeCloseTo(0.5); // beat 2 at 120 BPM
  });
});

describe("MIDI export", () => {
  it("writes a valid file that reads back to the same pattern", () => {
    const house = PRESETS[0];
    const m = readMidi(patternToMidi(house.pattern, house.bpm, 0, 2));
    expect(m.ppq).toBe(480);
    expect(m.bpm).toBe(124);
    expect(m.ended).toBe(true);
    const kicks = m.notes.filter((n) => n.note === 36).map((n) => n.tick);
    expect(kicks).toEqual([0, 480, 960, 1440, 1920, 2400, 2880, 3360]); // 4 per bar, 2 bars
    expect(m.notes.filter((n) => n.note === 39)).toHaveLength(4);
    expect(m.notes.filter((n) => n.note === 46)).toHaveLength(8);
  });
  it("applies swing to off-beat steps only", () => {
    const p = emptyPattern();
    p.hat[0] = true; p.hat[1] = true;
    const straight = readMidi(patternToMidi(p, 100, 0, 1)).notes.map((n) => n.tick);
    const swung = readMidi(patternToMidi(p, 100, 1, 1)).notes.map((n) => n.tick);
    expect(straight).toEqual([0, 120]);
    expect(swung).toEqual([0, 160]);
  });
  it("empty pattern is still a valid file", () => {
    const m = readMidi(patternToMidi(emptyPattern(), 120, 0, 1));
    expect(m.notes).toHaveLength(0);
    expect(m.ended).toBe(true);
  });
});
