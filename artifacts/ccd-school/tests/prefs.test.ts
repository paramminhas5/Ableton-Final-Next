import { describe, it, expect } from "vitest";
import { parsePrefs, serializePrefs, mergePrefs, DEFAULT_PREFS, levelFromDifficulty, difficultyFromLevel, OLD_UI_URL } from "../src/lib/prefs";

describe("prefs", () => {
  it("defaults", () => {
    expect(parsePrefs(null)).toEqual({ voice: "mentor", level: "standard", sound: true });
    expect(DEFAULT_PREFS.sound).toBe(true);
  });
  it("survives broken or wrong values", () => {
    expect(parsePrefs("{nope")).toEqual(DEFAULT_PREFS);
    expect(parsePrefs('{"voice":"loud","level":3}')).toEqual(DEFAULT_PREFS);
    expect(parsePrefs("null")).toEqual(DEFAULT_PREFS);
  });
  it("round trips voice and level, sound comes from its own key", () => {
    const p = { voice: "eli5" as const, level: "hard" as const, sound: false };
    expect(parsePrefs(serializePrefs(p), false)).toEqual(p);
    expect(serializePrefs(p)).not.toContain("sound");
  });
  it("merges a patch and rejects bad values", () => {
    expect(mergePrefs(DEFAULT_PREFS, { voice: "straight" }).voice).toBe("straight");
    expect(mergePrefs(DEFAULT_PREFS, { level: "x" as never }).level).toBe("standard");
  });
  it("maps progress difficulty", () => {
    expect(levelFromDifficulty("normal")).toBe("standard");
    expect(levelFromDifficulty("hard")).toBe("hard");
    expect(difficultyFromLevel("gentle")).toBe("normal");
    expect(difficultyFromLevel("hard")).toBe("hard");
  });
  it("has an old build link", () => { expect(OLD_UI_URL).toMatch(/^https:\/\//); });
});
