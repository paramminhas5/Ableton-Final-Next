import { beforeEach, describe, expect, it, vi } from "vitest";
import { asScale, inScale, keyName, minorish, padGrid, scaleNote, SCALE_NAMES, SCALES, snapToScale } from "../src/lib/theory";
import { chordPads } from "../src/lib/chords";

describe("keys and scales (Live 12's list)", () => {
  it("has Live 12's scales, lowercase, minor and major first, each a set of notes from the root", () => {
    expect(SCALE_NAMES.slice(0, 2)).toEqual(["major", "minor"]);
    expect(SCALE_NAMES).toHaveLength(35);
    for (const name of SCALE_NAMES) {
      expect(name).toBe(name.toLowerCase());
      const iv = SCALES[name] as readonly number[];
      expect(iv[0]).toBe(0);
      for (let i = 1; i < iv.length; i++) expect(iv[i]).toBeGreaterThan(iv[i - 1]);
      expect(iv[iv.length - 1]).toBeLessThan(12);
    }
    expect(SCALE_NAMES).toContain("dorian");
    expect(SCALE_NAMES).toContain("half-whole dim.");
    expect(SCALE_NAMES).toContain("messiaen 7");
  });

  it("old songs keep their scale; unknown names fall back to minor", () => {
    expect(asScale("major")).toBe("major");
    expect(asScale("minor")).toBe("minor");
    expect(asScale("phrygian")).toBe("phrygian");
    expect(asScale("nonsense")).toBe("minor");
    expect(asScale(undefined)).toBe("minor");
    expect(keyName(45, "minor")).toBe("a minor");
    expect(keyName(48, "dorian #4")).toBe("c dorian #4");
  });

  it("the pad grid stays a fourth per row in every scale, and every pad is in key", () => {
    // Unchanged for the scales songs had before (minor and major, pentatonic).
    expect(padGrid(33, "minor")[8] - padGrid(33, "minor")[12]).toBe(5);
    expect(padGrid(33, "minor pentatonic")[8] - padGrid(33, "minor pentatonic")[12]).toBe(5);
    for (const sc of SCALE_NAMES) {
      const g = padGrid(45, sc);
      expect(g).toHaveLength(16);
      expect(g.every(n => inScale(n, 45, sc))).toBe(true);
      const rowUp = g[8] - g[12];
      expect(rowUp).toBeGreaterThanOrEqual(4);
      expect(rowUp).toBeLessThanOrEqual(7); // hirajoshi and kumoi have no fourth: the next note up
    }
  });

  it("snaps and walks any scale", () => {
    expect(scaleNote(45, "phrygian", 1)).toBe(46); // b flat over a
    expect(snapToScale(47, 45, "phrygian")).toBe(46);
    expect(scaleNote(45, "whole tone", 6)).toBe(57);
  });

  it("minor-ish scales read as minor for camelot keys", () => {
    expect(minorish("minor")).toBe(true);
    expect(minorish("dorian")).toBe(true);
    expect(minorish("phrygian")).toBe(true);
    expect(minorish("major")).toBe(false);
    expect(minorish("mixolydian")).toBe(false);
  });

  it("chord pads: minor and major as before, eight chords in key in every other scale", () => {
    expect(chordPads(45, "minor").map(c => c.roman)).toEqual(["i", "iv", "v", "VI", "III", "VII", "i7", "iv9"]);
    expect(chordPads(45, "major").map(c => c.roman)).toEqual(["I", "IV", "V", "vi", "ii", "iii", "I7", "IV9"]);
    for (const sc of SCALE_NAMES) {
      const pads = chordPads(45, sc);
      expect(pads).toHaveLength(8);
      for (const p of pads) for (const d of p.deg) expect(inScale(scaleNote(45, sc, d), 45, sc)).toBe(true);
    }
    expect(chordPads(45, "dorian")[0].roman).toBe("i");
    expect(chordPads(45, "dorian")[1].roman).toBe("IV"); // dorian's major fourth chord
  });
});

describe("a stored song", () => {
  beforeEach(() => {
    vi.resetModules();
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) });
    vi.stubGlobal("window", { dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} });
    vi.stubGlobal("CustomEvent", class { constructor(public type: string, public init?: unknown) {} });
  });

  it("an old major song loads unchanged, a damaged scale becomes minor", async () => {
    const t2 = await import("../src/lib/track2");
    const old = { ...t2.emptyTrackV2(), scale: "major" as const, root: 48 };
    localStorage.setItem("ccd.track.v2", JSON.stringify(old));
    expect(t2.readTrackV2()).toEqual(old);
    localStorage.setItem("ccd.track.v2", JSON.stringify({ ...old, scale: "lydian" }));
    expect(t2.readTrackV2().scale).toBe("lydian");
    localStorage.setItem("ccd.track.v2", JSON.stringify({ ...old, scale: "blues-ish" }));
    expect(t2.readTrackV2().scale).toBe("minor");
  });
});
