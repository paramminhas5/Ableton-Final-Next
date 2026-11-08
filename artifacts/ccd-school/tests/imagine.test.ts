import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse, stringify } from "yaml";
import { parseLesson } from "../src/content/lessons/compile";
import { resolveLesson } from "../src/content/lessons/resolve";
import { patternProblems } from "../src/lib/copyEar";
import { decoys, imagineChoices, imagineProblems, makeImagineQuestion } from "../src/lib/imagine";
import { mulberry32 } from "../src/lib/gym/engine";

const TUNE = "1 - 3 - 5 - 3 - 2 - 3 - 1 - . .";
const BEAT = { kick: "x..x..x...x.....", clap: "....x.......x..." };
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

describe("imagine it first: the phrases", () => {
  it("makes decoys that are real phrases and differ from the shown one and each other", () => {
    for (let seed = 1; seed < 40; seed++) {
      for (const [layer, p] of [["lead", TUNE], ["bass", ". . 1 - . . 5, - . . 1 - . . 1' -"], ["chords", "1+3+5 - - - 6,+1+3 - - - 4,+6,+1 - - - 5,+7,+2 - - -"], ["drums", BEAT]] as const) {
        const ds = decoys(layer, p, "standard", mulberry32(seed));
        expect(ds).toHaveLength(2);
        for (const d of ds) { expect(patternProblems(layer, d)).toEqual([]); expect(same(d, p)).toBe(false); }
        expect(same(ds[0], ds[1])).toBe(false);
      }
    }
  });

  it("offers two at gentle and three above, with the shown phrase once, where answer says", () => {
    for (const [lv, n] of [["gentle", 2], ["standard", 3], ["hard", 3]] as const) {
      const { choices, answer } = imagineChoices("lead", TUNE, lv, mulberry32(7));
      expect(choices).toHaveLength(n);
      expect(choices[answer]).toBe(TUNE);
      expect(choices.filter((c) => c === TUNE)).toHaveLength(1);
    }
  });

  it("keeps hard decoys near: one note one scale step away, or one note moved in time", () => {
    const toks = TUNE.split(" ");
    for (let seed = 1; seed < 30; seed++) {
      for (const d of decoys("lead", TUNE, "hard", mulberry32(seed))) {
        const dt = (d as string).split(" ");
        const diff = dt.filter((t, i) => t !== toks[i]).length;
        expect(diff).toBeLessThanOrEqual(2);
      }
    }
  });

  it("uses the phrases the lesson names before making its own", () => {
    const other = "5 - 3 - 1 - 3 - 5 - 3 - 1 - . .";
    const { choices } = imagineChoices("lead", TUNE, "standard", mulberry32(3), [other]);
    expect(choices).toContain(other);
    expect(imagineProblems("lead", TUNE, [TUNE])).toEqual(["others 1 is the same as the pattern"]);
    expect(imagineProblems("lead", TUNE, ["1 - 2"])[0]).toMatch(/others 1: the line is 3 steps/);
  });

  it("makes gym rounds at every level that hold the shown phrase", () => {
    for (let level = 1; level <= 8; level++) {
      const q = makeImagineQuestion(level, mulberry32(level * 11));
      expect(q.choices.length).toBe(level <= 2 ? 2 : 3);
      expect(same(q.choices[q.answer], q.pattern)).toBe(true);
    }
  });
});

describe("imagine it first: the lesson step", () => {
  const kickText = readFileSync(join(__dirname, "fixtures/lessons/ok/producer/01-your-kick.yaml"), "utf8");
  const withStep = (step: Record<string, unknown>) => {
    const doc = parse(kickText);
    doc.steps.splice(1, 0, step);
    return () => parseLesson(stringify(doc), "producer/01-your-kick.yaml");
  };
  it("compiles, and resolves the same choices every time for a level", () => {
    const l = withStep({ kind: "imagine", layer: "drums", pattern: BEAT, say: "Read it, tap it, then pick it." })();
    const a = resolveLesson(l, { voice: "mentor", level: "standard" }).find((s) => s.kind === "imagine");
    const b = resolveLesson(l, { voice: "mentor", level: "standard" }).find((s) => s.kind === "imagine");
    expect(a).toEqual(b);
    expect(a && a.kind === "imagine" && a.choices.length).toBe(3);
  });
  it("names a bad pattern or layer", () => {
    expect(withStep({ kind: "imagine", layer: "fx", pattern: TUNE, say: "x" })).toThrow(/step 2: layer must be drums, bass, chords or lead/);
    expect(withStep({ kind: "imagine", layer: "lead", pattern: "1 - 3", say: "x" })).toThrow(/step 2: pattern: the line is 3 steps/);
  });
});
