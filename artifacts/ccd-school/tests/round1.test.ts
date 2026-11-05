import { describe, expect, it } from "vitest";
import { trophiesFor } from "../src/lib/rewards";
import { drumNames } from "../src/lib/lessonTake";
import { emptyTrackV2, newLayerV2, toV1View } from "../src/lib/track2";
import { curPathOf, songItems } from "../src/content/curriculum";

describe("loop round 1", () => {
  it("three worlds needs a basics lesson, not a producer one", () => {
    expect(curPathOf("synth-what-is-sound")?.world).toBe("producer");
    const won = (d: Record<string, boolean>) => trophiesFor({}, d).find(t => t.id === "all-worlds")?.won;
    expect(won({ "your-kick": true, "synth-what-is-sound": true, "what-is-djing": true })).toBe(false);
    const basics = songItems("fundamentals")[0].slug;
    expect(won({ [basics]: true, "your-kick": true, "what-is-djing": true })).toBe(true);
  });
  it("first blend waits for a real blend", () => {
    const won = (d: Record<string, boolean>) => trophiesFor({}, d).find(t => t.id === "first-mix")?.won;
    expect(won({ "what-is-djing": true })).toBe(false);
    expect(won({ "your-first-mix": true })).toBe(true);
  });
  it("names drums by what was played", () => {
    expect(drumNames([38, 38])).toBe("snare");
    expect(drumNames([36, 39])).toBe("kick and clap");
    expect(drumNames([99])).toBeNull();
  });
  it("the song strip draws a snare on the backbeat lane", () => {
    const t = emptyTrackV2();
    const l = newLayerV2("drums", "x");
    l.events = [{ start: 0, note: 36, len: 0.25, vel: 1 }, { start: 1, note: 38, len: 0.25, vel: 1 }] as typeof l.events;
    t.layers = [l];
    const view = toV1View(t);
    const back = view.layers.find(v => v.kind === "clap");
    expect(back?.steps.filter(Boolean).length).toBe(1);
  });
});
