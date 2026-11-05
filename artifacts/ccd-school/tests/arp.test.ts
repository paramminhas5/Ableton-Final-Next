import { describe, expect, it } from "vitest";
import { arpEvents, arpOrder, transposed, withArps } from "../src/lib/arp";
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
