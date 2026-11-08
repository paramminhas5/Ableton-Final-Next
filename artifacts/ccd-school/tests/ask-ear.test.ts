import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse, stringify } from "yaml";
import { parseLesson } from "../src/content/lessons/compile";
import { resolveLesson } from "../src/content/lessons/resolve";
import { earKnobs, earLabel, earSoundProblems, earTrack } from "../src/lib/askEar";
import { BASS_PARAMS, INSTRUMENT_BASE, DRUM_PAD_PARAMS, MASTER_PARAMS } from "../src/engine/params.gen";
import { emptyTrackV2, newLayerV2, type TrackV2 } from "../src/lib/track2";

const FIX = join(__dirname, "fixtures/lessons");
const kickText = readFileSync(join(FIX, "ok/producer/01-your-kick.yaml"), "utf8");
const FILE = "producer/01-your-kick.yaml";
const askAt = (doc: { steps: { kind: string }[] }) => doc.steps.findIndex((s) => s.kind === "ask");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withAsk(fn: (ask: any) => void) {
  const doc = parse(kickText);
  const i = askAt(doc);
  fn(doc.steps[i]);
  return { run: () => parseLesson(stringify(doc), FILE), step: i + 1 };
}

const song = (): TrackV2 => {
  const t = emptyTrackV2();
  const drums = { ...newLayerV2("drums", "d"), events: [0, 1, 2, 3].map((b) => ({ note: 36, vel: 0.9, start: b, len: 0.25 })).concat([1, 3].map((b) => ({ note: 39, vel: 0.9, start: b, len: 0.25 }))) };
  const bass = { ...newLayerV2("bass", "b"), events: [0.5, 1.5, 2.5, 3.5].map((b) => ({ note: 45, vel: 0.8, start: b, len: 0.25 })) };
  return { ...t, layers: [drums, bass] };
};
const CUTOFF = BASS_PARAMS.find((p) => p.key === "cutoff")!.index;

describe("asks answered by ear: the lesson file", () => {
  it("compiles sounds per option and a sound for the question", () => {
    expect(withAsk((a) => { a.part = "kick"; a.sounds = a.options.map((_: string, i: number) => ({ tune: 0.2 + i * 0.2 })); }).run).not.toThrow();
    expect(withAsk((a) => { a.part = "bass"; a.with = ["kick"]; a.play = [{}, { cutoff: 0.2 }]; }).run).not.toThrow();
    expect(withAsk((a) => { a.play = { bpm: 140 }; }).run).not.toThrow();
  });

  it("names the step and the problem in plain words", () => {
    const n = withAsk(() => {}).step;
    expect(withAsk((a) => { a.part = "bass"; a.sounds = [{ cutoff: 0.2 }]; }).run).toThrow(new RegExp(`step ${n}: sounds must list one sound per option`));
    expect(withAsk((a) => { a.part = "bass"; a.play = { wobble: 0.2 }; }).run).toThrow(/play: "wobble" is not a knob of the bass/);
    expect(withAsk((a) => { a.play = { cutoff: 0.2 }; }).run).toThrow(/"cutoff" is a knob, so the sound needs a part/);
    expect(withAsk((a) => { a.part = "bass"; a.play = { cutoff: 1.5 }; }).run).toThrow(/cutoff must be a number from 0 to 1/);
    expect(withAsk((a) => { a.part = "guitar"; a.play = {}; }).run).toThrow(/part "guitar" is not one of/);
    expect(withAsk((a) => { a.part = "bass"; }).run).toThrow(/part and with only mean something with play or sounds/);
    expect(withAsk((a) => { a.part = "kick"; a.sounds = a.options.map(() => ({ tune: 0.5 })); }).run).toThrow(/two options sound the same/);
    expect(withAsk((a) => { a.play = [{}, {}, {}]; }).run).toThrow(/play is one sound, or two/);
    expect(withAsk((a) => { a.part = "bass"; a.play = { notes: "1 - . ." }; }).run).toThrow(/notes: the line is 4 steps/);
    expect(withAsk((a) => { a.play = { master: { glow: 1 } }; }).run).toThrow(/master\.glow is not a master knob/);
  });

  it("keeps each sound with its option when the options are shuffled", () => {
    const doc = parse(kickText);
    const i = askAt(doc);
    const ask = doc.steps[i];
    ask.part = "kick";
    ask.sounds = ask.options.map((_: string, k: number) => ({ tune: k / 10, label: `s${k}` }));
    const l = parseLesson(stringify(doc), FILE);
    const r = resolveLesson(l, { voice: "mentor", level: "standard" }).find((s) => s.kind === "ask") as Extract<ReturnType<typeof resolveLesson>[number], { kind: "ask" }>;
    r.options.forEach((o, k) => expect(r.ear!.sounds![k].label).toBe(`s${ask.options.indexOf(o)}`));
    expect(r.ear!.part).toBe("kick");
  });
});

describe("asks answered by ear: the sounds", () => {
  it("plays the part on its own with the knob changed, and leaves the song alone", () => {
    const s = song();
    const t = earTrack(s, { cutoff: 0.2 }, { part: "bass" });
    expect(t.layers.map((l) => l.type)).toEqual(["bass"]);
    expect(t.layers[0].params[CUTOFF]).toBe(0.2);
    expect(s.layers[1].params[CUTOFF]).toBeUndefined();
  });

  it("plays a drum of the rack on its own, and its own pad's knobs", () => {
    const t = earTrack(song(), { tune: 0.1 }, { part: "clap" });
    expect(t.layers).toHaveLength(1);
    expect(t.layers[0].events.every((e) => e.note === 39)).toBe(true);
    const clapTune = INSTRUMENT_BASE + 2 * DRUM_PAD_PARAMS.length + 0;
    expect(t.layers[0].params[clapTune]).toBe(0.1);
    expect(earKnobs("kick")[0].index).toBe(INSTRUMENT_BASE);
  });

  it("puts the with parts under it, and mutes what it is told to", () => {
    const t = earTrack(song(), {}, { part: "bass", with: ["kick"] });
    expect(t.layers.map((l) => l.type).sort()).toEqual(["bass", "drums"]);
    expect(t.layers.find((l) => l.type === "drums")!.events.every((e) => e.note === 36)).toBe(true);
    const m = earTrack(song(), { mute: ["clap"] });
    expect(m.layers.find((l) => l.type === "drums")!.events.some((e) => e.note === 39)).toBe(false);
    expect(m.layers.some((l) => l.type === "bass")).toBe(true);
  });

  it("swaps in a pattern in the song's key, a tempo, a swing and the master glue", () => {
    const t = earTrack(song(), { notes: "1 - . . 5 - . . 1 - . . 5 - . .", bpm: 140, swing: 0.5, master: { glue: 0.9 } }, { part: "bass" });
    expect(t.bpm).toBe(140);
    expect(t.swing).toBe(0.5);
    expect(t.master![MASTER_PARAMS.find((m) => m.key === "glue")!.index]).toBe(0.9);
    expect(t.layers[0].events.map((e) => e.start)).toEqual([0, 1, 2, 3]);
    expect(t.layers[0].events[0].note % 12).toBe(45 % 12); // a, the song's root, in the bass octave
  });

  it("gives a part the song lacks a default line, and an empty song a beat", () => {
    const t = earTrack(song(), {}, { part: "lead" });
    expect(t.layers[0].type).toBe("lead");
    expect(t.layers[0].events.length).toBeGreaterThan(3);
    const e = earTrack(emptyTrackV2(), {});
    expect(e.layers[0].type).toBe("drums");
    expect(e.layers[0].events.length).toBe(6);
  });

  it("checks sounds and labels them", () => {
    expect(earSoundProblems({ cutoff: 0.3 }, "bass")).toEqual([]);
    expect(earSoundProblems({ part: "kick", notes: "x...x...x...x..." })).toEqual([]);
    expect(earSoundProblems({ part: "kick", notes: "1 - . ." })[0]).toMatch(/one row of 16 or 32 steps/);
    expect(earLabel({}, 0, 1, true)).toBe("hear it");
    expect(earLabel({}, 1, 2, true)).toBe("b");
    expect(earLabel({ label: "before" }, 0, 2, true)).toBe("before");
  });
});
