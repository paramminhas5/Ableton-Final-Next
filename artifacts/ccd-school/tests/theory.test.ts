import { describe, it, expect } from "vitest";
import { inScale, keyRow, liveName, noteName, padGrid, scaleNote, snapBeat, snapToScale, stepOf, wrapBeat } from "../src/lib/theory";

describe("theory", () => {
  it("names notes both ways", () => {
    expect(noteName(60)).toBe("c4");
    expect(liveName(60)).toBe("c3");
    expect(noteName(45)).toBe("a2");
    expect(noteName(37)).toBe("c#2");
  });

  it("a minor has no sharps", () => {
    const a = 45;
    for (const n of [45, 47, 48, 50, 52, 53, 55]) expect(inScale(n, a, "minor")).toBe(true);
    for (const n of [46, 49, 51, 54, 56]) expect(inScale(n, a, "minor")).toBe(false);
  });

  it("walks the scale up and down across octaves", () => {
    expect(scaleNote(45, "minor", 0)).toBe(45);
    expect(scaleNote(45, "minor", 7)).toBe(57);
    expect(scaleNote(45, "minor", -1)).toBe(43);
    expect(scaleNote(45, "minor", 2)).toBe(48);
  });

  it("snaps a note into the scale", () => {
    expect(snapToScale(46, 45, "minor")).toBe(45);
    expect(snapToScale(49, 45, "minor")).toBe(48);
  });

  it("pad grid: roots where Push puts them, rows a fourth apart", () => {
    const g = padGrid(33, "minor");
    expect(g).toHaveLength(16);
    // bottom-left is the root
    expect(g[12]).toBe(33);
    // the row above starts 3 scale steps higher (a fourth)
    expect(g[8]).toBe(scaleNote(33, "minor", 3));
    expect(g[8] - g[12]).toBe(5);
    // every pad is in key
    expect(g.every(n => inScale(n, 33, "minor"))).toBe(true);
  });

  it("key row: 8 white keys from c with the black keys between", () => {
    const k = keyRow(36);
    expect(k.white).toEqual([36, 38, 40, 41, 43, 45, 47, 48]);
    expect(k.black.map(b => b.note)).toEqual([37, 39, 42, 44, 46]);
  });
});

describe("timing", () => {
  it("snap pulls to the grid by strength", () => {
    expect(snapBeat(1.1, "1/16")).toBeCloseTo(1.0);
    expect(snapBeat(1.2, "1/16")).toBeCloseTo(1.25);
    expect(snapBeat(1.1, "1/16", 0.5)).toBeCloseTo(1.05);
    expect(snapBeat(1.1, "off")).toBe(1.1);
    expect(snapBeat(0.07, "1/32")).toBeCloseTo(0.125);
  });

  it("swing pushes the off sixteenths late", () => {
    expect(snapBeat(0.25, "1/16", 1, 0.5)).toBeCloseTo(0.25 + 0.0625);
    expect(snapBeat(0.5, "1/16", 1, 0.5)).toBeCloseTo(0.5);
  });

  it("wraps into the loop and finds the step", () => {
    expect(wrapBeat(4.25, 4)).toBeCloseTo(0.25);
    expect(wrapBeat(-0.25, 4)).toBeCloseTo(3.75);
    expect(stepOf(0.26)).toBe(1);
    expect(stepOf(3.99)).toBe(15);
  });
});
