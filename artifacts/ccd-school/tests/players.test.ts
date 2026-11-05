import { describe, expect, it } from "vitest";
import { applyPlayer, bassPlayer, drummer, PLAYER_DEFAULT, sectionIntensity } from "../src/lib/players";
import { arranged, goSection } from "../src/lib/arrange";
import { emptyTrackV2, newLayerV2, type TrackV2 } from "../src/lib/track2";
import { inChord } from "../src/lib/chords";

const P = { ...PLAYER_DEFAULT, seed: 7 };
const avgVel = (evs: { vel: number }[]) => evs.reduce((a, e) => a + e.vel, 0) / Math.max(1, evs.length);

describe("drummer (Logic's Drummer: complexity, intensity, fill, swing)", () => {
  it("is deterministic: the same settings and seed write the same notes", () => {
    expect(drummer({ ...P, loop: 8 })).toEqual(drummer({ ...P, loop: 8 }));
    expect(JSON.stringify(drummer({ ...P, loop: 8, seed: 8 }))).not.toBe(JSON.stringify(drummer({ ...P, loop: 8 })));
  });
  it("keeps four on the floor and a backbeat on two and four", () => {
    const evs = drummer({ ...P, loop: 4, fill: 0 });
    for (const b of [0, 1, 2, 3]) expect(evs.some(e => e.note === 36 && e.start === b)).toBe(true);
    for (const b of [1, 3]) expect(evs.some(e => (e.note === 38 || e.note === 39) && e.start === b)).toBe(true);
  });
  it("complexity makes it busier, intensity makes it harder", () => {
    const simple = drummer({ ...P, loop: 16, complexity: 0.05, fill: 0 });
    const busy = drummer({ ...P, loop: 16, complexity: 0.95, fill: 0 });
    expect(busy.length).toBeGreaterThan(simple.length * 1.3);
    const soft = drummer({ ...P, loop: 16, intensity: 0.1, fill: 0 });
    const loud = drummer({ ...P, loop: 16, intensity: 0.95, fill: 0 });
    expect(avgVel(loud)).toBeGreaterThan(avgVel(soft) + 0.1);
  });
  it("fill puts a fill in the last beat of a bar, and none at 0", () => {
    // Over a few seeds, so one unlucky seed does not decide it.
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8];
    const none = seeds.flatMap(seed => drummer({ ...P, seed, loop: 16, fill: 0 }));
    const lots = seeds.flatMap(seed => drummer({ ...P, seed, loop: 16, fill: 1 }));
    const fillHits = (evs: { note: number; start: number }[]) => evs.filter(e => e.start % 4 > 3.1 && [37, 38, 45, 48].includes(e.note)).length;
    expect(fillHits(lots)).toBeGreaterThan(fillHits(none) + 30);
  });
  it("swing pushes the off sixteenths late, like the swing knob", () => {
    const straight = drummer({ ...P, loop: 4, complexity: 0.9, swing: 0, fill: 0 });
    const swung = drummer({ ...P, loop: 4, complexity: 0.9, swing: 0.5, fill: 0 });
    expect(straight.some(e => Math.abs(e.start - 0.25) < 1e-6)).toBe(swung.some(e => Math.abs(e.start - (0.25 + 0.5 / 6)) < 1e-4));
    expect(swung.every(e => e.start % 0.5 === 0 || Math.abs(((e.start * 4) % 2) - 1 - 0.5 * (4 / 6)) < 1e-3)).toBe(true);
  });
});

describe("bass player (follows the chord track)", () => {
  const am = { root: 9, q: "min" as const }, f = { root: 5, q: "maj" as const }, c = { root: 0, q: "maj" as const }, g = { root: 7, q: "maj" as const };
  it("plays each bar's chord root on the one, deterministically", () => {
    const evs = bassPlayer({ ...P, loop: 16, root: 45, scale: "minor", chords: [am, f, c, g] });
    expect(evs).toEqual(bassPlayer({ ...P, loop: 16, root: 45, scale: "minor", chords: [am, f, c, g] }));
    for (const [bar, ch] of [[0, am], [1, f], [2, c], [3, g]] as const) {
      const one = evs.find(e => e.start === bar * 4);
      expect(one && one.note % 12).toBe(ch.root);
    }
  });
  it("simple stays on chord notes; every note is in the key", () => {
    const evs = bassPlayer({ ...P, complexity: 0.1, loop: 16, root: 45, scale: "minor", chords: [am, f, c, g] });
    for (const e of evs) expect(inChord([am, f, c, g][Math.floor(e.start / 4)], e.note)).toBe(true);
    const busy = bassPlayer({ ...P, complexity: 0.9, loop: 16, root: 45, scale: "minor", chords: [am, f, c, g] });
    expect(busy.length).toBeGreaterThan(evs.length);
    for (const e of busy) expect([0, 2, 3, 5, 7, 8, 10]).toContain((((e.note - 45) % 12) + 12) % 12);
  });
  it("without a chord track it plays the key's root", () => {
    const evs = bassPlayer({ ...P, loop: 4, root: 48, scale: "major" });
    expect(evs[0].note % 12).toBe(0);
  });
  it("intensity adds slides: notes held into the next one", () => {
    const slides = (it: number) => { const evs = bassPlayer({ ...P, complexity: 0.8, intensity: it, loop: 16, root: 45, scale: "minor" }); return evs.filter((e, i) => evs[i + 1] && e.start + e.len > evs[i + 1].start).length; };
    expect(slides(0)).toBe(0);
    expect(slides(1)).toBeGreaterThan(0);
  });
});

describe("players in your song", () => {
  const song = (): TrackV2 => {
    const t = emptyTrackV2();
    const d = { ...newLayerV2("drums"), id: "d" };
    const b = { ...newLayerV2("bass"), id: "b", events: [{ note: 45, vel: 0.9, start: 0, len: 1 }] };
    return { ...t, layers: [d, b] };
  };
  it("writes editable notes and keeps the settings; your other parts are untouched", () => {
    const t = applyPlayer(song(), "drummer", "d", P);
    expect(t.layers[0].events.length).toBeGreaterThan(8);
    expect(t.layers[0].player).toEqual(P);
    expect(t.layers[1].events).toEqual(song().layers[1].events);
  });
  it("a drop is harder than an intro, and the studio edits the drop", () => {
    const base = { ...song(), sections: [{ name: "intro", bars: 4, off: [] }, { name: "drop", bars: 4, off: [] }] };
    const t = applyPlayer(base, "drummer", "d", { ...P, intensity: 0.5 });
    expect(t.at).toBe(1);
    const intro = t.sections![0].notes!.d, drop = t.sections![1].notes!.d;
    expect(avgVel(drop)).toBeGreaterThan(avgVel(intro));
    expect(t.layers[0].events).toEqual(drop);
    // Your bass is kept in every section.
    expect(t.sections![0].notes!.b).toEqual(base.layers[1].events);
    // The arrangement plays the intro's drums in the first four bars and the drop's after.
    const a = arranged(t);
    const drums = a.layers.find(l => l.id === "d")!.events;
    expect(avgVel(drums.filter(e => e.start >= 16))).toBeGreaterThan(avgVel(drums.filter(e => e.start < 16)));
    expect(sectionIntensity("break", 0.8)).toBeLessThan(sectionIntensity("drop", 0.8));
  });
  it("moving between sections keeps each section's own loop", () => {
    const base = { ...song(), sections: [{ name: "a", bars: 4, off: [] }, { name: "b", bars: 4, off: [] }] };
    let t = goSection(base, 0);
    t = { ...t, layers: t.layers.map(l => (l.id === "b" ? { ...l, events: [{ note: 40, vel: 1, start: 0, len: 1 }] } : l)) };
    t = goSection(t, 1);
    expect(t.layers[1].events[0].note).toBe(45); // b still has the loop they shared
    t = goSection(t, 0);
    expect(t.layers[1].events[0].note).toBe(40);
    const a = arranged(t);
    const bass = a.layers.find(l => l.id === "b")!.events;
    expect(bass.find(e => e.start === 0)!.note).toBe(40);
    expect(bass.find(e => e.start === 16)!.note).toBe(45);
  });
  it("old songs with sections and no section notes arrange exactly as before", () => {
    const base = { ...song(), sections: [{ name: "intro", bars: 2, off: ["b"] }, { name: "drop", bars: 2, off: [] }] };
    const a = arranged(base);
    expect(a.layers.find(l => l.id === "b")!.events.map(e => e.start)).toEqual([8, 12]);
  });
});
