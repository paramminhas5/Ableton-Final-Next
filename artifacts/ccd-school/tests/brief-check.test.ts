import { describe, expect, it } from "vitest";
import { briefChecks } from "../src/lib/briefCheck";
import { parsePattern } from "../src/lib/copyEar";
import { emptyTrackV2, newLayerV2, type NoteEvent, type TrackV2 } from "../src/lib/track2";
import { parseLesson } from "../src/content/lessons/compile";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse, stringify } from "yaml";

/** A minor song (root a, 45) with a kick on every beat and i then VI chords. */
const song = (): TrackV2 => ({
  ...emptyTrackV2(),
  layers: [
    { ...newLayerV2("drums", "d"), events: [0, 1, 2, 3].map((b) => ({ note: 36, vel: 0.9, start: b, len: 0.25 })) },
    { ...newLayerV2("chords", "c"), events: parsePattern("chords", "1+3+5 - - - - - - - 6,+1+3 - - - - - - -", 45, "minor").events },
  ],
});
const tune = (layer: "bass" | "lead", p: string): NoteEvent[] => parsePattern(layer, p, 45, "minor").events;
const said = (checks: Parameters<typeof briefChecks>[0], evs: NoteEvent[]) => briefChecks(checks, evs, song(), 4);

describe("write your own, checked", () => {
  it("hears a bass line that stays out of the kick's way, short, and on the chords' roots", () => {
    const h = said(["kick", "short", "roots", "key"], tune("bass", ". . 1 . . . 1 . . . 6, . . . 6, ."));
    expect(h.every((x) => x.ok)).toBe(true);
    expect(h.find((x) => x.id === "kick")!.say).toBe("no note lands on a kick, so the two take turns");
    expect(h.find((x) => x.id === "roots")!.say).toBe("4 of 4 bass notes are the root of the chord above them");
  });

  it("says plainly when notes land on the kick, run long, or leave the key, and never as a gate", () => {
    const evs = tune("bass", "1 - - - 1 - - - b2 - - - 1 - - -");
    const h = said(["kick", "short", "key"], evs);
    expect(h.map((x) => x.ok)).toEqual([false, false, false]);
    expect(h[0].say).toMatch(/^4 of 4 land right on a kick/);
    expect(h[2].say).toMatch(/^1 note falls outside a minor/);
  });

  it("hears a melody end home, repeat its motif and fill the bar", () => {
    const h = said(["home", "repeat", "bar", "moves"], tune("lead", "3 - 2 - 5 - . . 3 - 2 - 1 - . ."));
    expect(h.map((x) => [x.id, x.ok])).toEqual([["home", true], ["repeat", true], ["bar", true], ["moves", true]]);
    const away = said(["home", "bar"], tune("lead", "3 - 2 - 5 - . . . . . . . . . ."));
    expect(away[0].say).toMatch(/ends on e, away from home/);
    expect(away[1].say).toMatch(/all sits in the first half/);
  });

  it("checks the pentatonic keys of the song's scale and the backbeat", () => {
    expect(said(["pentatonic"], tune("lead", "1 - 3 - 4 - 5 - 7 - . . . . . ."))[0].ok).toBe(true);
    expect(said(["pentatonic"], tune("lead", "1 - 2 - 6 - . . . . . . . . . ."))[0].say).toMatch(/^2 notes are off the five/);
    const snare = [1, 3].map((b) => ({ note: 38, vel: 0.9, start: b, len: 0.25 }));
    expect(said(["backbeat"], snare)[0].say).toBe("all 2 on two and four, the backbeat");
  });

  it("says nothing before a take, and says so when the song has nothing to check against", () => {
    expect(said(["key"], [])).toEqual([]);
    const bare = briefChecks(["kick", "chord"], tune("lead", "1 - . . . . . . . . . . . . . ."), { ...emptyTrackV2(), layers: [] }, 4);
    expect(bare.every((x) => x.ok)).toBe(true);
  });

  it("the compiler takes known checks and names unknown ones", () => {
    const text = readFileSync(join(__dirname, "fixtures/lessons/ok/producer/01-your-kick.yaml"), "utf8");
    const doc = parse(text);
    const i = doc.steps.findIndex((s: { kind: string }) => s.kind === "play");
    doc.steps[i].goal.check = ["kick", "vibes"];
    expect(() => parseLesson(stringify(doc), "producer/01-your-kick.yaml")).toThrow(new RegExp(`step ${i + 1}: goal.check lists what to listen for`));
    doc.steps[i].goal.check = ["backbeat"];
    expect(() => parseLesson(stringify(doc), "producer/01-your-kick.yaml")).not.toThrow();
  });
});
