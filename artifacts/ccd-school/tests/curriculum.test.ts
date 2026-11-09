import { describe, it, expect } from "vitest";
import { CURRICULUM, extrasOf } from "../src/content/curriculum";
import { journey, kindOf, nextAfter, worldDone, worldOf, worldSteps } from "../src/lib/worldOrder";
import { MISSIONS } from "../src/content/missions";

describe("curriculum (design/curriculum.md)", () => {
  it("places every lesson in the app exactly once", () => {
    const placed = CURRICULUM.flatMap(p => p.items.map(i => i.slug));
    expect(new Set(placed).size).toBe(placed.length);
    for (const m of MISSIONS) expect(placed, m.slug).toContain(m.slug);
  });
  it("every world opens with a song lesson you can play", () => {
    for (const w of ["fundamentals", "producer", "dj"] as const) expect(worldSteps(w)[0], w).toBeTruthy();
    expect(worldSteps("fundamentals")[0].slug).toBe("tempo-bpm");
    expect(worldSteps("producer")[0].slug).toBe("your-kick");
  });
  it("hangs deeper lessons off the song lesson where the idea matters", () => {
    expect(kindOf("sidechain")).toBe("deeper");
    expect(extrasOf("kick-and-bass").map(e => e.slug)).toContain("sidechain");
    expect(worldOf("sidechain")).toBe("producer");
  });
  it("next follows the song: song to song, deeper back to the song after its parent", () => {
    expect(nextAfter("what-is-sound")).toBe("frequency-pitch");
    expect(nextAfter("sound-in-space")).toBe("frequency-pitch");
    expect(nextAfter("your-kick")).toBe("synth-what-is-sound");
  });
  it("counts song lessons only, including the ones still to make", () => {
    const c = worldDone("producer", { "your-kick": true, "drum-rack": true });
    expect(c.done).toBe(1);
    expect(c.total).toBe(21); // the piano roll became a song lesson, 10 Nov
  });
  it("the journey keeps every deeper and bonus lesson under a lesson", () => {
    for (const w of ["fundamentals", "producer", "dj"] as const) {
      const j = journey(w, {});
      const shown = j.flatMap(p => p.lessons.flatMap(l => [l.slug, ...l.extras.map(e => e.slug)]));
      const all = CURRICULUM.filter(p => p.world === w).flatMap(p => p.items.map(i => i.slug));
      expect(new Set(shown)).toEqual(new Set(all));
    }
  });
});

describe("producer's first loop after basics (10 Nov)", () => {
  it("counts a producer lesson as done once its basics twin is, without touching progress", async () => {
    const { coveredBy, nextStep, journey } = await import("../src/lib/worldOrder");
    const basics = { "tempo-bpm": true, "what-is-sound": true, "note-values": true, "bars-time-signatures": true };
    expect(coveredBy("your-kick", basics)).toBe("tempo-bpm");
    expect(coveredBy("your-kick", { ...basics, "your-kick": true })).toBeNull();
    // continue skips the four parts basics gave you and lands on the piano roll
    expect(nextStep("producer", basics)?.slug).toBe("midi-piano-roll");
    const p1 = journey("producer", basics)[0];
    expect(p1.lessons.filter(l => l.covered).map(l => l.slug).sort()).toEqual(["clap-and-snare", "hats", "synth-what-is-sound", "your-kick"]);
    // someone who skipped basics still starts on the kick
    expect(nextStep("producer", {})?.slug).toBe("your-kick");
  });
});

describe("lesson 1 split (10 Nov)", () => {
  it("anyone who finished the old lesson 1 already has a tempo; a new learner does not", async () => {
    const { coveredBy } = await import("../src/lib/worldOrder");
    expect(coveredBy("set-your-tempo", { "tempo-bpm": { score: 90, at: Date.UTC(2026, 10, 5) } })).toBe("tempo-bpm");
    expect(coveredBy("set-your-tempo", { "tempo-bpm": { score: 90, at: Date.UTC(2026, 10, 11) } })).toBeNull();
  });
});
