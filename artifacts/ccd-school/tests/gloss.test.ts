import { describe, expect, it } from "vitest";
import { glossParts } from "../src/lib/gloss";

describe("glossary links", () => {
  it("links the first use of a word once", () => {
    const parts = glossParts("Snap pulls each beat onto the grid. Another beat, another bar.");
    const terms = parts.filter(p => p.term).map(p => p.term);
    expect(terms).toContain("Snap");
    expect(terms.filter(t => t === "Beat")).toHaveLength(1);
  });
  it("links quantising and the click", () => {
    const terms = glossParts("The word is quantising. Turn the click off.").filter(p => p.term).map(p => p.term);
    expect(terms.some(t => /Quantising/.test(t!))).toBe(true);
    expect(terms.some(t => /Click/.test(t!))).toBe(true);
  });
  it("keeps the text whole", () => {
    const text = "At 120 bpm one bar lasts two seconds, so a kick drum lands every beat.";
    expect(glossParts(text).map(p => p.text).join("")).toBe(text);
  });
});
