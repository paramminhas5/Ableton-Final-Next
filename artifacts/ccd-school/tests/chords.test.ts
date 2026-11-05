import { describe, expect, it } from "vitest";
import { chordAt, chordEvents, chordName, chordNotes, chordsInKey, chordTones, cleanChords, inChord, progression, progressionName, romanOf, withChordTrack, type Chord } from "../src/lib/chords";

const am: Chord = { root: 9, q: "min" };
const f: Chord = { root: 5, q: "maj" };
const c: Chord = { root: 0, q: "maj" };
const g: Chord = { root: 7, q: "maj" };

describe("chord track", () => {
  it("names chords the way chord tracks write them, lowercase", () => {
    expect([am, f, c, g].map(chordName)).toEqual(["am", "f", "c", "g"]);
    expect(chordName({ root: 11, q: "dim" })).toBe("bdim");
    expect(chordName({ root: 7, q: "maj", sev: true })).toBe("gmaj7");
    expect(chordName({ root: 2, q: "min", sev: true })).toBe("dm7");
  });

  it("the chords in a key, with roman numerals: a minor is i ii° III iv v VI VII", () => {
    const key = chordsInKey(45, "minor");
    expect(key.map(chordName)).toEqual(["am", "bdim", "c", "dm", "em", "f", "g"]);
    expect(key.map(k => k.roman)).toEqual(["i", "ii°", "III", "iv", "v", "VI", "VII"]);
    expect(chordsInKey(48, "major").map(k => k.roman)).toEqual(["I", "ii", "iii", "IV", "V", "vi", "vii°"]);
    // A scale that is not major or minor still gets a chord per note, all in key.
    const dor = chordsInKey(50, "dorian");
    expect(dor.map(chordName)).toEqual(["dm", "em", "f", "g", "am", "bdim", "c"]);
  });

  it("roman numerals in the song's key; a chord from outside the key keeps its name", () => {
    expect(romanOf(f, 45, "minor")).toBe("VI");
    expect(romanOf(am, 48, "major")).toBe("vi");
    expect(romanOf({ root: 1, q: "maj" }, 45, "minor")).toBe("c#");
  });

  it("chord tones and voicings", () => {
    expect(chordTones(am)).toEqual([9, 0, 4]);
    expect(chordNotes(am, 48)).toEqual([57, 60, 64]);
    expect(chordNotes(c, 48)).toEqual([48, 52, 55]);
    expect(inChord(am, 64)).toBe(true);
    expect(inChord(am, 65)).toBe(false);
    expect(inChord(null, 64)).toBe(false);
  });

  it("the chord under the playhead: one per bar, round the loop", () => {
    const track = [am, f, c, g];
    expect(chordAt(track, 0, 16)).toEqual(am);
    expect(chordAt(track, 4.5, 16)).toEqual(f);
    expect(chordAt(track, 15.9, 16)).toEqual(g);
    expect(chordAt(track, 16.1, 16)).toEqual(am);
    expect(chordAt(undefined, 3, 16)).toBeNull();
    expect(chordAt([am, null], 5, 8)).toBeNull();
  });

  it("progressions in the key: i VI III VII in a minor is am f c g", () => {
    expect(progression(45, "minor", [0, 5, 2, 6], 4).map(chordName)).toEqual(["am", "f", "c", "g"]);
    expect(progressionName(45, "minor", [0, 5, 2, 6])).toBe("i VI III VII");
    expect(progressionName(48, "major", [0, 4, 5, 3])).toBe("I V vi IV");
  });

  it("a four-bar progression on a one-bar loop grows the loop and repeats your parts", () => {
    const song: { loop: number; layers: { events: { note: number; vel: number; start: number; len: number }[] }[]; chords?: (Chord | null)[] } = { loop: 4, layers: [{ events: [{ note: 36, vel: 1, start: 0, len: 0.2 }, { note: 36, vel: 1, start: 2, len: 0.2 }] }] };
    const out = withChordTrack(song, [am, f, c, g]);
    expect(out.loop).toBe(16);
    expect(out.layers[0].events.map(e => e.start)).toEqual([0, 2, 4, 6, 8, 10, 12, 14]);
    expect(out.chords).toEqual([am, f, c, g]);
    // On a loop that is already long enough, only the chords change.
    const same = withChordTrack({ ...song, loop: 16 }, [am]);
    expect(same.loop).toBe(16);
    expect(same.layers[0].events).toHaveLength(2);
  });

  it("writes the chord track as notes, one held chord per bar", () => {
    const evs = chordEvents([am, null, c], 12);
    expect(evs.filter(e => e.start === 0).map(e => e.note)).toEqual([57, 60, 64]);
    expect(evs.some(e => e.start === 4)).toBe(false);
    expect(evs.filter(e => e.start === 8).map(e => e.note)).toEqual([60, 64, 67]);
  });

  it("cleans a stored chord track", () => {
    expect(cleanChords([{ root: 21, q: "min" }, { root: 3, q: "weird" }, null, "x", { root: 2, q: "maj", sev: true }])).toEqual([{ root: 9, q: "min" }, null, null, null, { root: 2, q: "maj", sev: true }]);
    expect(cleanChords("nope")).toBeUndefined();
  });
});
