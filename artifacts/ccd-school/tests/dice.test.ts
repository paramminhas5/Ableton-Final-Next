import { describe, expect, it } from "vitest";
import { cellRand, fillDrums, fillMelody } from "../src/lib/dice";
import { arpEvents } from "../src/lib/arp";
import type { NoteEvent } from "../src/lib/track2";

const kick = (b: number): NoteEvent => ({ note: 36, vel: 0.9, start: b, len: 0.2 });

describe("fill and randomise", () => {
  it("cells are fixed by the seed, and spread over 0..1", () => {
    expect(cellRand(5, 1, 2)).toBe(cellRand(5, 1, 2));
    const xs = Array.from({ length: 400 }, (_, i) => cellRand(9, 0, i));
    expect(Math.min(...xs)).toBeLessThan(0.05);
    expect(Math.max(...xs)).toBeGreaterThan(0.95);
  });
  it("amount 0 changes nothing, and your own hits are always kept", () => {
    const base = [kick(0), kick(1)];
    expect(fillDrums(base, [36, 38, 42], 4, 0.25, 0, 3)).toBe(base);
    const full = fillDrums(base, [36, 38, 42], 4, 0.25, 1, 3);
    for (const b of base) expect(full).toContainEqual(b);
  });
  it("more amount grows the same fill: everything at 0.3 is still there at 0.8", () => {
    const a = fillDrums([kick(0)], [36, 38, 42], 4, 0.25, 0.3, 11);
    const b = fillDrums([kick(0)], [36, 38, 42], 4, 0.25, 0.8, 11);
    expect(b.length).toBeGreaterThan(a.length);
    for (const e of a) expect(b.some(x => x.note === e.note && x.start === e.start)).toBe(true);
  });
  it("a new seed is a new fill, never two hits of one sound on a step", () => {
    const a = fillDrums([], [36, 38, 42], 4, 0.25, 0.7, 1);
    const b = fillDrums([], [36, 38, 42], 4, 0.25, 0.7, 2);
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
    const keys = a.map(e => `${e.note}@${e.start}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it("melody fills stay in the scale and keep your notes", () => {
    const base = [{ note: 57, vel: 0.8, start: 0, len: 0.25 }];
    const out = fillMelody(base, { loop: 4, step: 0.25, root: 45, scale: "minor", amount: 1, seed: 4 });
    expect(out.length).toBeGreaterThan(3);
    const minor = [0, 2, 3, 5, 7, 8, 10];
    for (const e of out) expect(minor).toContain((((e.note - 45) % 12) + 12) % 12);
    expect(out).toContainEqual(base[0]);
  });
  it("the arp's variation rests, jumps and accents, and plays as before at zero", () => {
    const chord = [57, 60, 64].map(n => ({ note: n, vel: 0.8, start: 0, len: 4 }));
    const plain = arpEvents(chord, { mode: "up", rate: 4, oct: 1 }, 4);
    expect(arpEvents(chord, { mode: "up", rate: 4, oct: 1, rand: 0, seed: 3 }, 4)).toEqual(plain);
    const wild = arpEvents(chord, { mode: "up", rate: 4, oct: 1, rand: 1, seed: 3 }, 4);
    expect(wild.length).toBeLessThan(plain.length);
    expect(JSON.stringify(wild)).not.toBe(JSON.stringify(plain));
  });
});
