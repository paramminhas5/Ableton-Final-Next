import { describe, expect, it } from "vitest";
import { arpEvents, arpSteps, arpOrder, transposed, withArps } from "../src/lib/arp";
import { newLayerV2, type TrackV2 } from "../src/lib/track2";

const chord = (start: number, len: number, notes: number[]) => notes.map(note => ({ start, len, note, vel: 0.8 }));

describe("arpeggiator", () => {
  it("cycles the held chord in order", () => {
    expect(arpOrder([64, 57, 60], "up", 1)).toEqual([57, 60, 64]);
    expect(arpOrder([57, 60, 64], "down", 1)).toEqual([64, 60, 57]);
    expect(arpOrder([57, 60, 64], "updown", 1)).toEqual([57, 60, 64, 60]);
    expect(arpOrder([57, 60], "up", 2)).toEqual([57, 60, 69, 72]);
  });
  it("plays one note per step while the chord is held, then stops", () => {
    const evs = arpEvents(chord(0, 2, [57, 60, 64]), { mode: "up", rate: 4, oct: 1 }, 4);
    expect(evs.length).toBe(8);
    expect(evs.map(e => e.note).slice(0, 4)).toEqual([57, 60, 64, 57]);
    expect(evs.every(e => e.start < 2)).toBe(true);
  });
  it("starts over on a new chord", () => {
    const evs = arpEvents([...chord(0, 1, [57, 60, 64]), ...chord(1, 1, [55, 59, 62])], { mode: "up", rate: 2, oct: 1 }, 2);
    expect(evs.map(e => e.note)).toEqual([57, 60, 55, 59]);
  });
  it("is expanded once, and off gives your chords back", () => {
    const l = newLayerV2("chords", "x"); l.events = chord(0, 4, [57, 60, 64]);
    const t = { v: 2, bpm: 120, root: 45, scale: "minor", swing: 0, loop: 4, layers: [{ ...l, arp: { mode: "up", rate: 4, oct: 1 } }], added: [] } as unknown as TrackV2;
    const once = withArps(t);
    expect(withArps(once)).toBe(once);
    expect(once.layers[0].events.length).toBe(16);
    expect(t.layers[0].events.length).toBe(3);
  });
});

describe("the arp screen's steps (arpSteps)", () => {
  it("shows what the arp plays, step by step, held chord or not", () => {
    const cells = arpSteps(chord(0, 2, [57, 60, 64]), { mode: "up", rate: 4, oct: 1 }, 4, 0, 4);
    expect(cells.length).toBe(16);
    expect(cells.slice(0, 5).map(c => c.note)).toEqual([57, 60, 64, 57, 60]);
    expect(cells.slice(8).every(c => !c.held && c.note === null)).toBe(true);
    expect(cells.every(c => !c.varied)).toBe(true);
  });
  it("with vary, every cell is a note the engine plays, rests are empty, moved notes are marked", () => {
    const evs = chord(0, 4, [57, 60, 64]);
    const arp = { mode: "up" as const, rate: 4 as const, oct: 1 as const, rand: 0.8, seed: 7 };
    const played = arpEvents(evs, arp, 4);
    const cells = arpSteps(evs, arp, 4, 0, 4);
    expect(cells.filter(c => c.note !== null).map(c => [c.start, c.note])).toEqual(played.map(e => [e.start, e.note]));
    expect(cells.some(c => c.held && c.note === null)).toBe(true); // a rest
    expect(cells.some(c => c.varied)).toBe(true);
    const plain = arpEvents(evs, { ...arp, rand: 0 }, 4);
    for (const c of cells.filter(x => x.varied)) expect(plain.find(e => e.start === c.start)!.note).not.toBe(c.note);
  });
  it("a window of one bar of a longer loop", () => {
    const cells = arpSteps(chord(0, 8, [57, 60, 64]), { mode: "down", rate: 2, oct: 1 }, 8, 4, 8);
    expect(cells.map(c => c.start)).toEqual([4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5]);
    expect(cells[0].note).toBe(arpEvents(chord(0, 8, [57, 60, 64]), { mode: "down", rate: 2, oct: 1 }, 8)[8].note);
  });
});

describe("key shift", () => {
  it("moves melodic parts and the key, not the drums", () => {
    const b = newLayerV2("bass", "b"); b.events = [{ start: 0, len: 1, note: 33, vel: 1 }];
    const d = newLayerV2("drums", "d"); d.events = [{ start: 0, len: 0.2, note: 36, vel: 1 }];
    const t = { root: 45, layers: [b, d] } as unknown as TrackV2;
    const up = transposed(t, 2);
    expect(up.root).toBe(47);
    expect(up.layers[0].events[0].note).toBe(35);
    expect(up.layers[1].events[0].note).toBe(36);
  });
});
