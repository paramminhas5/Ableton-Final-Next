import { describe, expect, it } from "vitest";
import { songDiff } from "../src/lib/songdiff";
import { startLayout, CLASSIC } from "../src/lib/arrange";
import { cueFor, withCue } from "../src/lib/cues";
import { emptyTrackV2, newLayerV2, type TrackV2 } from "../src/lib/track2";
import { fileMissions } from "../src/content/lessons/adapt";

const song = (): TrackV2 => {
  const t = emptyTrackV2();
  const k = newLayerV2("drums", "your-kick");
  k.events = [0, 1, 2, 3].map(start => ({ start, len: 0.25, note: 36, vel: 1 }));
  const h = newLayerV2("hats", "hats");
  h.events = [0.5, 1.5, 2.5, 3.5].map(start => ({ start, len: 0.25, note: 46, vel: 0.8 }));
  const l = newLayerV2("lead", "lead");
  l.events = [{ start: 0, len: 1, note: 69, vel: 0.9 }];
  return { ...t, layers: [k, h, l] };
};

describe("loop round 3: the done screen says what changed", () => {
  it("names a new part, a tempo change, a knob and a cue", () => {
    const a = song();
    const bass = newLayerV2("bass", "first-bass");
    bass.events = [{ start: 0, len: 0.5, note: 45, vel: 1 }];
    const lead = { ...a.layers[2], params: { ...a.layers[2].params, 16: 0.2 } };
    let b: TrackV2 = { ...a, bpm: 128, layers: [a.layers[0], a.layers[1], lead, bass] };
    b = withCue(b, cueFor(b, "your-first-mix", "blend"));
    const d = songDiff(a, b, 10);
    expect(d).toContain("+ bass");
    expect(d).toContain("120 to 128 bpm");
    expect(d.some(x => x.startsWith("lead ") && x.includes(" to "))).toBe(true);
    expect(d).toContain("cue: mix out on bar 8");
  });
  it("is empty when nothing changed, and caps the list", () => {
    const a = song();
    expect(songDiff(a, a)).toEqual([]);
    const b = { ...a, bpm: 90, swing: 0.3, root: 48, scale: "major" as const, sections: CLASSIC(a) };
    const d = songDiff(a, { ...b, layers: [] }, 3);
    expect(d).toHaveLength(3);
    expect(d[2]).toMatch(/^\+ \d+ more$/);
  });
  it("names the drum pad a knob belongs to", () => {
    const a = song();
    const kick = { ...a.layers[0], params: { [16 + 1]: 0.9 } };
    const d = songDiff(a, { ...a, layers: [kick, a.layers[1], a.layers[2]] });
    expect(d[0]).toMatch(/^drums kick decay /);
  });
});

describe("loop round 3: arrange lessons don't open already solved", () => {
  it("the drop starts with the drums and hats in every section", () => {
    const t = song();
    const drums = t.layers.filter(l => l.type !== "lead").map(l => l.id);
    const s = startLayout(t, "drop");
    expect(s.every(x => !x.off.some(id => drums.includes(id)))).toBe(true);
    // the classic layout's break would already have answered it
    expect(CLASSIC(t).some(x => x.off.includes(t.layers[0].id))).toBe(true);
  });
  it("fills start with none, sections with everything on", () => {
    const t = song();
    expect(startLayout(t, "fills").some(s => s.fill)).toBe(false);
    expect(startLayout(t, "sections").every(s => !s.off.length)).toBe(true);
  });
});

describe("loop round 3: play-ins check the musical idea", () => {
  it("hats ask for open hats on the and; the snare lesson's snare is a backbeat", () => {
    const ms = fileMissions();
    const play = (slug: string) => ms.find(m => m.slug === slug)?.screens?.find(s => s.kind === "play") as { goal: { notes: number; note?: string; on?: string } } | undefined;
    expect(play("hats")?.goal).toEqual({ notes: 4, note: "open hat", on: "and" });
    expect(play("clap-and-snare")?.goal.note).toBe("snare");
  });
});

describe("loop round 3: no arrange lesson opens already met", () => {
  it("every arrange step's goal is unmet on a fresh song, and met once the learner does the move", async () => {
    const { arrangeMet } = await import("../src/lib/arrange");
    const t = song();
    const drums = t.layers.filter(l => l.type === "drums" || l.type === "hats").map(l => l.id);
    const steps = fileMissions().flatMap(m => (m.screens ?? []).filter(s => s.kind === "arrange").map(s => ({ slug: m.slug, goal: (s as { goal: "sections" | "drop" | "fills" | "risers" | "export" }).goal })));
    expect(steps.length).toBeGreaterThan(3);
    for (const { slug, goal } of steps) {
      if (goal === "export") continue;
      const start = startLayout(t, goal);
      expect(arrangeMet(start, drums, goal), `${slug} (${goal}) opens met`).toBe(false);
    }
    const drop = startLayout(t, "drop").map((s, i) => (i === 3 ? { ...s, off: [...s.off, ...drums] } : s));
    expect(arrangeMet(drop, drums, "drop")).toBe(true);
  });
});
