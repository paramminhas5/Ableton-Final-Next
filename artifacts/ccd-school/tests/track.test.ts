import { describe, it, expect } from "vitest";
import { emptyTrack, offerFor, applyOffer, previewLayer, newLayer, MAX_LAYERS } from "../src/lib/track";
import { trackToMidi } from "../src/lib/track-midi";
import { worldSteps, nextStep, missionAny } from "../src/lib/worldOrder";

describe("your track", () => {
  it("offers a new layer and adds it only when applied", () => {
    const t = emptyTrack();
    const offer = offerFor(t, { slug: "x", title: "Kick drums", number: 1 });
    expect(offer.isNew).toBe(true);
    expect(offer.kind).toBe("kick");
    expect(t.layers.length).toBe(0);
    const t2 = applyOffer(t, offer, "x");
    expect(t2.layers.length).toBe(1);
    expect(t2.added).toContain("x");
  });

  it("does not add the same lesson twice", () => {
    const t = applyOffer(emptyTrack(), offerFor(emptyTrack(), { slug: "x", title: "Kick" }), "x");
    const again = applyOffer(t, offerFor(t, { slug: "x", title: "Kick" }), "x");
    expect(again.layers.length).toBe(1);
  });

  it("upgrades an existing layer instead of duplicating it", () => {
    const t = applyOffer(emptyTrack(), offerFor(emptyTrack(), { slug: "a", title: "Bass and Poli" }), "a");
    const offer = offerFor(t, { slug: "b", title: "Glide on the bass" });
    expect(offer.isNew).toBe(false);
    const t2 = applyOffer(t, offer, "b");
    expect(t2.layers.length).toBe(1);
    expect(t2.layers[0].variant).toBe(1);
  });

  it("keeps the knob settings the learner chose", () => {
    const t = emptyTrack();
    const offer = offerFor(t, { slug: "a", title: "Bass" });
    const t2 = applyOffer(t, offer, "a", undefined, [0.1, 0.2, 0.3, 0.4]);
    expect(t2.layers[0].params).toEqual([0.1, 0.2, 0.3, 0.4]);
    expect(previewLayer(t, offer).kind).toBe("bass");
  });

  it("never grows past the layer limit", () => {
    let t = emptyTrack();
    for (let i = 0; i < 20; i++) t = applyOffer(t, offerFor(t, { slug: `m${i}`, title: `Lesson ${i}`, number: i }), `m${i}`);
    expect(t.layers.length).toBeLessThanOrEqual(MAX_LAYERS);
  });

  it("exports a type 1 MIDI file with one track per layer", () => {
    const t = { ...emptyTrack(), layers: [newLayer("kick"), newLayer("bass")] };
    const bytes = trackToMidi(t);
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe("MThd");
    expect(bytes[9]).toBe(1);   // format 1
    expect(bytes[11]).toBe(3);  // tempo track + 2 layers
  });
});

describe("worlds as sequencers", () => {
  it("lists every world's lessons in order with real missions", () => {
    for (const w of ["fundamentals", "dj", "producer"] as const) {
      const steps = worldSteps(w);
      expect(steps.length).toBeGreaterThan(16);
      for (const s of steps) expect(missionAny(s.slug)).toBeTruthy();
    }
  });
  it("finds the next lesson after the done ones", () => {
    const steps = worldSteps("fundamentals");
    const done = { [steps[0].slug]: {}, [steps[1].slug]: {} };
    expect(nextStep("fundamentals", done)?.slug).toBe(steps[2].slug);
  });
});
