/**
 * The engine leftovers, app side (design/engine-plan.md, "After engine 2: leftovers (engine)"): p-locks sent
 * with their notes, chance in the midi export as heard, free-running part lengths, punch-ins recorded into the
 * song. The engine side of each is measured in engine/tests/leftovers.rs.
 */
import { describe, expect, it } from "vitest";
import { withEngineLocks } from "../src/lib/plock";
import { addPunch, cleanPunches, punchLen, punchPoints, punchRecorder, type Punch } from "../src/lib/punch";
import { freeTiled, isFree, withPartLengths } from "../src/lib/partLength";
import { arranged } from "../src/lib/arrange";
import { heardPasses, songToMidi, trackV2ToMidi, variesByPass } from "../src/lib/track2-midi";
import { emptyTrackV2, newLayerV2, type NoteEvent, type TrackV2 } from "../src/lib/track2";
import { PUNCH, DRUM_PAD_NOTES, LAYER_PARAMS } from "../src/engine/params.gen";

const PAN = LAYER_PARAMS.find(p => p.key === "pan")!.index;
const ev = (start: number, extra: Partial<NoteEvent> = {}, note = 36): NoteEvent => ({ note, vel: 1, start, len: 0.1, ...extra });

describe("p-locks ride on their notes to the engine", () => {
  it("a lock and the note after it: the lock, then back to the knob (-1)", () => {
    const out = withEngineLocks([ev(0), ev(1, { p: { [PAN]: 0.1 } }), ev(2), ev(3)]);
    expect(out.map(e => e.locks)).toEqual([undefined, [[PAN, 0.1]], [[PAN, -1]], undefined]);
  });
  it("same-beat notes share the lock; no locks, the same array", () => {
    const evs = [ev(0), ev(1, { p: { [PAN]: 0.8 } }, 38), ev(1, {}, 42), ev(2)];
    const out = withEngineLocks(evs);
    expect(out[1].locks).toEqual([[PAN, 0.8]]);
    expect(out[2].locks).toEqual([[PAN, 0.8]]);
    expect(out[3].locks).toEqual([[PAN, -1]]);
    const plain = [ev(0), ev(1)];
    expect(withEngineLocks(plain)).toBe(plain);
  });
  it("a drum pad's lock is restored only by that pad's next hit", () => {
    const tuneKick = 16; // pad 0, tune
    const out = withEngineLocks([ev(0, { p: { [tuneKick]: 0.9 } }), ev(0.5, {}, 38), ev(1)], true);
    expect(out[0].locks).toEqual([[tuneKick, 0.9]]);
    expect(out[1].locks).toBeUndefined();
    expect(out[2].locks).toEqual([[tuneKick, -1]]);
  });
  it("after a note that may not play (chance), the same value is sent again, so a skipped note never leaves it", () => {
    const out = withEngineLocks([ev(0, { p: { [PAN]: 0.2 } }), ev(1, { p: { [PAN]: 0.2 }, chance: 0.5 }), ev(2, { p: { [PAN]: 0.2 } }), ev(3)]);
    expect(out[1].locks).toBeUndefined(); // the note before always plays
    expect(out[2].locks).toEqual([[PAN, 0.2]]); // the note before might not have
    expect(out[3].locks).toEqual([[PAN, -1]]);
  });
});

describe("chance in the midi export: as heard", () => {
  // The same pattern as engine/tests/leftovers.rs, chance_plays_the_table_the_export_writes.
  const HEARD_TABLE = "0 1 2 3 4 | 0 1 4 5 | 0 1 2 3 4 6 | 0 3 4 7 | 0 2 3 4 7 | 0 3 4 5 | 0 1 2 3 4 6 | 0 4 5";
  const drums = (): TrackV2 => {
    const l = { ...newLayerV2("drums"), id: "d" };
    l.events = Array.from({ length: 8 }, (_, s) => {
      const extra: Partial<NoteEvent> = s % 2 === 1 ? { chance: 0.5 } : s === 2 ? { cond: "1:2" } : s === 6 ? { cond: "3:4", chance: 0.7 } : {};
      return { note: DRUM_PAD_NOTES[s % 4], vel: 1, start: s * 0.5, len: 0.25, ...extra };
    });
    return { ...emptyTrackV2(), bpm: 300, seed: 7, layers: [l] };
  };
  /** Read note-ons back out of a format 1 file: [tick, note] per track. */
  const noteOns = (f: Uint8Array) => {
    const out: [number, number][][] = [];
    let i = 14;
    while (i < f.length) {
      const len = (f[i + 4] << 24) | (f[i + 5] << 16) | (f[i + 6] << 8) | f[i + 7];
      const end = i + 8 + len;
      let p = i + 8, tick = 0, run = 0;
      const ons: [number, number][] = [];
      while (p < end) {
        let d = 0;
        for (;;) { const b = f[p++]; d = (d << 7) | (b & 127); if (!(b & 128)) break; }
        tick += d;
        let st = f[p];
        if (st === 0xff) { const l = f[p + 2]; p += 3 + l; continue; }
        if (st & 0x80) p++; else st = run;
        run = st;
        if ((st & 0xf0) === 0x90 && f[p + 1] > 0) ons.push([tick, f[p]]);
        p += 2;
      }
      out.push(ons);
      i = end;
    }
    return out;
  };
  it("writes the notes the engine played, pass by pass, with the engine's own roll", () => {
    const t = drums();
    expect(variesByPass(t)).toBe(true);
    expect(heardPasses(4)).toBe(8);
    const ons = noteOns(songToMidi(t, "heard"))[1];
    const passes: number[][] = Array.from({ length: 8 }, () => []);
    for (const [tick] of ons) { const beat = tick / 480; passes[Math.floor(beat / 4)].push(Math.round((beat % 4) / 0.5)); }
    expect(passes.map(p => p.join(" ")).join(" | ")).toBe(HEARD_TABLE);
  });
  it("every note: the file as it always was, chance left out; a song with no chance writes the same bytes as before", () => {
    const t = drums();
    expect(songToMidi(t, "every")).toEqual(trackV2ToMidi(arranged(t), 4));
    const plain: TrackV2 = { ...emptyTrackV2(), layers: [{ ...newLayerV2("drums"), id: "d", events: [ev(0), ev(1), ev(2.5)] }] };
    expect(variesByPass(plain)).toBe(false);
    expect(songToMidi(plain)).toEqual(trackV2ToMidi(arranged(plain), 4));
  });
});

describe("free-running part lengths", () => {
  const song = (free: boolean, sections = false): TrackV2 => {
    const hats = { ...newLayerV2("hats"), id: "h", len: 0.75, ...(free ? { free: true } : {}), events: [ev(0, {}, 42)] };
    const kick = { ...newLayerV2("drums"), id: "d", events: [ev(0)] };
    return { ...emptyTrackV2(), loop: 4, layers: [hats, kick], ...(sections ? { sections: [{ name: "a", bars: 1, off: [] }, { name: "b", bars: 1, off: ["d"] }, { name: "c", bars: 1, off: [] }] } : {}) };
  };
  it("restarting is the default and plays as before", () => {
    expect(isFree(song(false).layers[0], 4)).toBe(false);
    expect(withPartLengths(song(false)).layers[0].events.map(e => e.start)).toEqual([0, 0.75, 1.5, 2.25, 3, 3.75]);
  });
  it("in an arrangement a free part runs across the whole song: bar 2 does not start on a hat", () => {
    const restart = arranged(song(false, true)).layers[0].events.map(e => e.start);
    const free = arranged(song(true, true)).layers[0].events.map(e => e.start);
    expect(restart.includes(4)).toBe(true);
    expect(free.includes(4)).toBe(false);
    expect(free.slice(0, 6)).toEqual([0, 0.75, 1.5, 2.25, 3, 3.75]);
    expect(free[6]).toBe(4.5);
    expect(free).toHaveLength(16); // 12 beats / 0.75
  });
  it("freeTiled counts the part's own plays for chance", () => {
    const out = freeTiled([ev(0.25, { chance: 0.5 }, 42)], 0.75, 3, 6);
    expect(out.map(e => [e.start, e.it])).toEqual([[3.25, 4], [4, 5], [4.75, 6], [5.5, 7]]);
  });
  it("the export as heard keeps a free part drifting across all eight bars", () => {
    const t = song(true);
    expect(variesByPass(t)).toBe(true);
    const f = songToMidi(t);
    // the hat track's ticks: every 0.75 beats from 0 to 32 beats
    const ticks: number[] = [];
    let i = 14, k = 0;
    while (i < f.length) {
      const len = (f[i + 4] << 24) | (f[i + 5] << 16) | (f[i + 6] << 8) | f[i + 7];
      if (k === 1) { let p = i + 8, tick = 0; while (p < i + 8 + len) { let d = 0; for (;;) { const b = f[p++]; d = (d << 7) | (b & 127); if (!(b & 128)) break; } tick += d; if (f[p] === 0xff) { p += 3 + f[p + 2]; continue; } if ((f[p] & 0xf0) === 0x90) ticks.push(tick); p += 3; } }
      i += 8 + len; k++;
    }
    expect(ticks).toHaveLength(Math.ceil(32 / 0.75));
    expect(ticks.every((t, n) => t === Math.round(n * 0.75 * 480))).toBe(true);
  });
});

describe("punch-ins recorded into the song", () => {
  it("a press, a move and a let-go become one punch, then the engine's points", () => {
    const rec = punchRecorder(() => 4);
    expect(rec.feed(PUNCH.filter, 0.3, 1)).toBeNull();
    expect(rec.feed(PUNCH.filter, 0.31, 1.1)).toBeNull(); // too small a move to keep
    expect(rec.feed(PUNCH.filter, 0.5, 1.5)).toBeNull();
    const p = rec.feed(PUNCH.off, 0, 2)!;
    expect(p).toEqual({ at: 1, end: 2, fx: "filter", amt: 0.3, moves: [[1.5, 0.5]] });
    expect(punchPoints([p], 4)).toEqual([
      { mode: PUNCH.filter, amount: 0.3, beat: 1 },
      { mode: PUNCH.filter, amount: 0.5, beat: 1.5 },
      { mode: PUNCH.off, amount: 0, beat: 2 },
    ]);
  });
  it("a punch held over the loop's end wraps; a new take replaces the one it overlaps", () => {
    const wrap: Punch = { at: 3.5, end: 0.5, fx: "tapeStop", amt: 0.5 };
    expect(punchLen(wrap, 4)).toBe(1);
    expect(punchPoints([wrap], 4).map(x => x.beat)).toEqual([0.5, 3.5]);
    const list = addPunch([{ at: 1, end: 2, fx: "repeat", amt: 0.5 }, { at: 3, end: 3.5, fx: "throw", amt: 1 }], { at: 1.5, end: 2.5, fx: "filter", amt: 0.2 }, 4);
    expect(list.map(x => x.fx)).toEqual(["filter", "throw"]);
  });
  it("stored punches are cleaned; old songs have none", () => {
    expect(cleanPunches(undefined)).toBeUndefined();
    expect(cleanPunches([{ at: 1, end: 2, fx: "filter", amt: 3 }, { at: "x" }, { at: 1, end: 2, fx: "nope", amt: 0.1 }])).toEqual([{ at: 1, end: 2, fx: "filter", amt: 1 }]);
    expect(punchPoints(undefined, 4)).toEqual([]);
  });
});
