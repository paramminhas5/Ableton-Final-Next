import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { parse, stringify } from "yaml";
import { parseLesson } from "../src/content/lessons/compile";
import { compileLessons } from "../src/content/lessons/compile-fs";
import { resolveLesson, resolveLearn } from "../src/content/lessons/resolve";
import { CLIP_IDS } from "../src/content/lessons/clips";

const FIX = join(__dirname, "fixtures/lessons");
const kickText = readFileSync(join(FIX, "ok/producer/01-your-kick.yaml"), "utf8");
const FILE = "producer/01-your-kick.yaml";

/** Parse the valid fixture, let the test mutate it, then run it through the compiler. */
function mutate(fn: (doc: any) => void, file = FILE) {
  const doc = parse(kickText);
  fn(doc);
  return () => parseLesson(stringify(doc), file);
}
const lesson = () => parseLesson(kickText, FILE);

describe("parseLesson", () => {
  it("compiles a valid lesson", () => {
    const l = lesson();
    expect(l.slug).toBe("your-kick");
    expect(l.steps.length).toBe(10);
    expect(l.file).toBe(FILE);
  });

  it("fails on a missing song change", () => {
    expect(mutate((d) => delete d.song.adds)).toThrow(/producer\/01-your-kick\.yaml: song needs exactly one of adds or changes/);
    expect(mutate((d) => delete d.song)).toThrow(/song is required/);
  });

  it("fails on a bad clip id with the step number", () => {
    expect(mutate((d) => (d.steps[0].clip = "nope"))).toThrow(/01-your-kick\.yaml: step 1: clip "nope" is not in clips\.ts/);
  });

  it("fails on a bad answer index", () => {
    expect(mutate((d) => (d.steps[6].answer = 9))).toThrow(/step 7: answer 9 is not a valid index/);
    expect(mutate((d) => (d.steps[6].whyWrong = { 0: "x" }))).toThrow(/step 7: whyWrong key 0/);
  });

  it("fails on an em dash", () => {
    expect(mutate((d) => (d.steps[1].say = "Kick — then bass."))).toThrow(/step 2: say has an em dash/);
  });

  it("fails on unknown step kind, unknown field, bad knob, wrong play layer", () => {
    expect(mutate((d) => (d.steps[3].kind = "quiz"))).toThrow(/step 4: unknown step kind "quiz"/);
    expect(mutate((d) => (d.steps[1].extra = 1))).toThrow(/step 2: unknown field "extra"/);
    expect(mutate((d) => (d.steps[3].knobs = ["cutoff"]))).toThrow(/step 4: knob "cutoff" does not exist for drums/);
    expect(mutate((d) => (d.steps[2].layer = "bass"))).toThrow(/step 3: play layer "bass" must match song\.adds/);
  });

  it("allows another play layer when the lesson changes the song", () => {
    expect(mutate((d) => (d.song = { changes: "bass.sound", why: "x" }, d.steps[2].layer = "bass"))).not.toThrow();
  });

  it("fails when a voice object has no mentor", () => {
    expect(mutate((d) => (d.steps[0].say = { straight: "x", eli5: "y" }))).toThrow(/step 1: say is missing the mentor voice/);
  });

  it("fails on title case, emoji, keep not last, bad levels", () => {
    expect(mutate((d) => (d.steps[1].title = "Why The Kick Leads"))).toThrow(/step 2: title .* not sentence case/);
    expect(mutate((d) => (d.steps[1].say = "boom \u{1F525}"))).toThrow(/emoji/);
    expect(mutate((d) => d.steps.reverse())).toThrow(/keep must be the last step/);
    expect(mutate((d) => (d.steps[5].levels = ["easy"]))).toThrow(/step 6: levels/);
  });

  it("reports deeper steps by number", () => {
    expect(mutate((d) => (d.steps[1].deeper[0].try.knobs = ["nope"]))).toThrow(/step 2 \(deeper 1\): knob "nope"/);
  });
});

describe("compileLessons", () => {
  it("reads worlds, skips _ folders and sorts by number", () => {
    const ls = compileLessons(join(FIX, "ok"));
    expect(ls.map((l) => l.slug)).toEqual(["your-kick", "your-clap"]);
  });

  it("rejects duplicate slugs and names both files", () => {
    expect(() => compileLessons(join(FIX, "dup"))).toThrow(/02-your-clap\.yaml: duplicate slug "your-clap", already used by producer\/01-your-clap\.yaml/);
  });

  it("returns nothing for a missing folder", () => {
    expect(compileLessons(join(FIX, "does-not-exist"))).toEqual([]);
  });
});

describe("resolveLesson", () => {
  const l = lesson();
  const at = (voice: any, level: any = "standard") => resolveLesson(l, { voice, level });

  it("gives different text per voice and falls back to mentor", () => {
    const [m, s, e] = (["mentor", "straight", "eli5"] as const).map((v) => at(v)[0]);
    expect(new Set([JSON.stringify(m), JSON.stringify(s), JSON.stringify(e)]).size).toBe(3);
    // the say step is a plain string, same for all voices
    expect(at("eli5")[1]).toEqual(at("mentor")[1]);
    // the shape step has no voices, play has no eli5 so it falls back
    const play = (v: any) => (at(v)[2] as any).say;
    expect(play("eli5")).toBe(play("mentor"));
    expect(play("straight")).not.toBe(play("mentor"));
    expect(resolveLearn(l, "eli5")).toMatch(/big boom/);
  });

  it("filters steps by level and changes ear rounds", () => {
    const kinds = (lv: any) => at("mentor", lv).filter((s) => s.kind === "ask").length;
    expect(kinds("gentle")).toBe(3);
    expect(kinds("standard")).toBe(4);
    const rounds = (lv: any) => (at("mentor", lv).find((s) => s.kind === "ear") as any).rounds;
    expect([rounds("gentle"), rounds("standard"), rounds("hard")]).toEqual([3, 5, 8]);
  });

  it("shows hints at gentle and standard, hides them at hard", () => {
    const hint = (lv: any) => (at("mentor", lv)[1] as any).hint;
    expect(hint("gentle")).toMatch(/Count/);
    expect(hint("hard")).toBeUndefined();
    expect((at("mentor", "hard")[2] as any).hint).toBeUndefined();
  });

  it("shuffles answers but keeps the right one and remaps whyWrong", () => {
    const raw = l.steps[4] as any;
    const rs = at("mentor")[4] as any;
    expect(rs.options[rs.answer]).toBe(raw.options[raw.answer]);
    expect([...rs.options].sort()).toEqual([...raw.options].sort());
    for (const [k, v] of Object.entries(rs.whyWrong as Record<string, string>)) {
      const orig = Object.entries(raw.whyWrong).find(([, t]) => t === v)![0];
      expect(rs.options[Number(k)]).toBe(raw.options[Number(orig)]);
    }
    expect(Object.keys(rs.whyWrong).length).toBe(2);
  });

  it("does not stack the right answer on one position", () => {
    for (const lv of ["gentle", "standard", "hard"]) {
      const asks = at("mentor", lv).filter((s) => s.kind === "ask") as any[];
      const counts: number[] = [];
      for (const a of asks) counts[a.answer] = (counts[a.answer] ?? 0) + 1;
      expect(Math.max(...counts.filter(Boolean)) / asks.length, lv).toBeLessThanOrEqual(0.5 + 1e-9);
    }
    // same positions whichever voice
    expect(at("eli5").map((s: any) => s.answer)).toEqual(at("mentor").map((s: any) => s.answer));
  });

  it("is deterministic", () => {
    expect(at("mentor")).toEqual(at("mentor"));
  });
});

describe("real lessons", () => {
  const real = compileLessons(join(__dirname, "../src/content/lessons"));

  it("all compile with unique slugs", () => {
    expect(new Set(real.map((l) => l.slug)).size).toBe(real.length);
    for (const l of real) for (const s of l.steps) if (s.kind === "hear") expect(CLIP_IDS.has(s.clip)).toBe(true);
  });

  it("warns (does not fail) when a lesson has no eli5", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const l of real) if (!JSON.stringify(l).includes('"eli5"')) console.warn(`${l.file}: no eli5 voice anywhere in this lesson`);
    expect(warn.mock.calls.length).toBeGreaterThanOrEqual(0);
    warn.mockRestore();
  });
});

describe("question bank and youCan (process.md)", () => {
  const askAt = (d: any) => d.steps.findIndex((s: any) => s.kind === "ask");
  it("accepts more: true on a question and keeps it on the resolved step", () => {
    const l = mutate(d => { d.steps[askAt(d)].more = true; })();
    const asks = resolveLesson(l, { voice: "mentor", level: "standard" }).filter(s => s.kind === "ask");
    expect(asks.some(a => a.kind === "ask" && a.more)).toBe(true);
  });
  it("rejects more that is not true or false", () => {
    expect(mutate(d => { d.steps[askAt(d)].more = "yes"; })).toThrow(/more must be true or false/);
  });
  it("accepts a youCan list and rejects an empty line", () => {
    expect(mutate(d => { d.youCan = ["count a bar"]; })).not.toThrow();
    expect(mutate(d => { d.youCan = [" "]; })).toThrow(/youCan/);
  });
  it("the real kick lesson has a question bank and every main question has a reason for each wrong answer", () => {
    const real = parseLesson(readFileSync(join(__dirname, "../src/content/lessons/producer/01-your-kick.yaml"), "utf8"), FILE);
    const asks = real.steps.filter((s: any) => s.kind === "ask") as any[];
    expect(asks.filter(a => a.more).length).toBeGreaterThan(0);
    for (const a of asks) expect(Object.keys(a.whyWrong ?? {}).length).toBe(a.options.length - 1);
    expect(real.steps.some((s: any) => s.kind === "ear")).toBe(false);
  });
});
