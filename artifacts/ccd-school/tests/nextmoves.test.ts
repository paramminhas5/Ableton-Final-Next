import { describe, it, expect } from "vitest";
import { movesFor, stageFor } from "../src/lib/nextMoves";

describe("next moves", () => {
  it("places learners by progress", () => {
    expect(stageFor({ completed: 0, placementDone: false })).toBe("new");
    expect(stageFor({ completed: 2, placementDone: true })).toBe("new");
    expect(stageFor({ completed: 5, placementDone: false })).toBe("growing");
    expect(stageFor({ completed: 5, placementDone: true })).toBe("experienced");
    expect(stageFor({ completed: 20, placementDone: false })).toBe("experienced");
  });
  it("every stage gives three real, distinct, em-dash free steps", () => {
    for (const st of ["new", "growing", "experienced"] as const) {
      const m = movesFor(st);
      expect(m).toHaveLength(3);
      expect(new Set(m.map((x) => x.href)).size).toBe(3);
      expect(JSON.stringify(m)).not.toMatch(/—/);
    }
  });
  it("new learners start with setup and beat; experienced start with their own Set", () => {
    expect(movesFor("new").map((m) => m.href).slice(0, 2)).toEqual(["/setup", "/beat"]);
    expect(movesFor("experienced")[0].href).toBe("/link");
  });
});
