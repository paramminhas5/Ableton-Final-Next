import { describe, expect, it } from "vitest";
import { changesSong, cueFor, cuesOf, songBars, soundsSame, withCue } from "../src/lib/cues";
import { emptyTrackV2, newLayerV2 } from "../src/lib/track2";
import { fileMissions } from "../src/content/lessons/adapt";

const song = () => {
  const t = emptyTrackV2();
  const k = newLayerV2("drums", "your-kick");
  k.events = [0, 1, 2, 3].map(start => ({ start, len: 0.25, note: 36, vel: 1 }));
  return { ...t, loop: 8, layers: [k] };
};

describe("loop round 2: dj lessons mark your song", () => {
  it("a blend marks a mix-out cue on the last bar, the tempo lesson a cue on bar 1", () => {
    const t = song();
    expect(songBars(t)).toBe(2);
    expect(cueFor(t, "your-first-mix", "blend")).toEqual({ slug: "your-first-mix", name: "mix out", bar: 2 });
    expect(cueFor(t, "tempo-bpm-dj", "match").bar).toBe(1);
    const arranged = { ...t, sections: [{ name: "intro", bars: 4, off: [] }, { name: "drop", bars: 8, off: [] }] };
    expect(cueFor(arranged, "x", "blend").bar).toBe(12);
  });
  it("one cue per lesson, sorted by bar, and the sound is unchanged", () => {
    const t = song();
    const a = withCue(t, cueFor(t, "your-first-mix", "blend"));
    const b = withCue(withCue(a, cueFor(a, "phrasing", "phrase")), cueFor(a, "your-first-mix", "blend"));
    expect(cuesOf(b).map(c => c.slug)).toEqual(["phrasing", "your-first-mix"]);
    expect(soundsSame(t, b)).toBe(true);
    const louder = { ...b, bpm: 128 };
    expect(soundsSame(t, louder)).toBe(false);
  });
  it("every lesson with a mixer step now ends by marking the song", () => {
    const mix = fileMissions().filter(m => (m.screens ?? []).some(s => s.kind === "mix"));
    expect(mix.length).toBeGreaterThan(30);
    for (const m of mix) expect(changesSong(m.screens ?? [])).toBe(true);
    expect(mix.some(m => m.slug === "your-first-mix")).toBe(true);
  });
});
