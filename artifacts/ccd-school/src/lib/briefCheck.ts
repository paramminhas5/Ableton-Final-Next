/**
 * Write your own, checked (Building Blocks' "write your own" checkpoints; design/audible-genius.md). A play
 * step's goal can list checks: things that can be heard in the notes the learner writes (in key, out of the
 * kick's way, on the beat, filling the bar, ending home, using the chord's notes). Each comes back in plain
 * words saying what it heard. They never block: the goal's note count is still the only gate, and taste is
 * the learner's. Pure, so it is tested.
 */
import { SCALES, NOTE_NAMES, asScale } from "./theory";
import type { NoteEvent, TrackV2 } from "./track2";

export const BRIEF_CHECKS = ["key", "pentatonic", "kick", "backbeat", "bar", "home", "moves", "chord", "roots", "short", "repeat"] as const;
export type BriefCheck = (typeof BRIEF_CHECKS)[number];
export type Heard = { id: BriefCheck; ok: boolean; say: string };

const SIXTEENTH = 0.25;
const near = (a: number, b: number) => Math.abs(a - b) < SIXTEENTH / 2;
const pc = (n: number) => ((n % 12) + 12) % 12;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Notes that start at the same moment are one chord press: count presses for a chord part, notes otherwise. */
function onsets(events: NoteEvent[]): NoteEvent[][] {
  const by = new Map<string, NoteEvent[]>();
  for (const e of [...events].sort((a, b) => a.start - b.start)) {
    const k = (Math.round(e.start / SIXTEENTH) * SIXTEENTH).toFixed(3);
    by.set(k, [...(by.get(k) ?? []), e]);
  }
  return [...by.values()];
}

/**
 * What the learner's notes do, for each check asked for. `song` gives the key and the other parts (the kick to
 * stay out of the way of, the chords under a bass or melody); `loop` is the take's length in beats.
 */
export function briefChecks(checks: readonly BriefCheck[], events: NoteEvent[], song: Pick<TrackV2, "root" | "scale" | "layers">, loop: number): Heard[] {
  if (!events.length) return [];
  const root = song.root ?? 45;
  const scale = asScale(song.scale);
  const steps = SCALES[scale] as readonly number[];
  const keyLabel = `${NOTE_NAMES[pc(root)]} ${scale}`;
  const inKey = (n: number) => steps.includes(pc(n - root));
  const presses = onsets(events);
  const N = presses.length;
  const kicks = song.layers.filter(l => l.type === "drums").flatMap(l => l.events.filter(e => e.note === 36).map(e => e.start % (loop || 4)));
  const chords = song.layers.filter(l => l.type === "chords").flatMap(l => l.events);
  const sounding = (t: number) => chords.filter(c => c.start <= t + 1e-6 && t < c.start + c.len - 1e-6);
  const name = (n: number) => NOTE_NAMES[pc(n)];
  const out: Heard[] = [];
  for (const id of checks) {
    switch (id) {
      case "key": {
        const off = events.filter(e => !inKey(e.note)).length;
        out.push({ id, ok: off === 0, say: off === 0 ? `every note is in ${keyLabel}` : `${plural(off, "note")} ${off === 1 ? "falls" : "fall"} outside ${keyLabel}, so ${off === 1 ? "it rubs" : "they rub"} against the rest. that can be a choice, or a slip` });
        break;
      }
      case "pentatonic": {
        // The five notes left when the two that clash most are taken out: minor keeps 1 3 4 5 7, major 1 2 3 5 6.
        const five = steps.length === 7 ? (steps[2] === 3 ? [0, 2, 3, 4, 6] : [0, 1, 2, 4, 5]).map(i => steps[i]) : steps;
        const off = events.filter(e => !five.includes(pc(e.note - root))).length;
        out.push({ id, ok: off === 0, say: off === 0 ? "every note is one of the five pentatonic keys" : `${plural(off, "note")} ${off === 1 ? "is" : "are"} off the five pentatonic keys. those are the ones that can clash` });
        break;
      }
      case "kick": {
        if (!kicks.length) { out.push({ id, ok: true, say: "your song has no kick yet, so nothing to stay out of the way of" }); break; }
        const on = presses.filter(p => kicks.some(k => near(p[0].start % (loop || 4), k))).length;
        out.push({ id, ok: on === 0, say: on === 0 ? "no note lands on a kick, so the two take turns" : `${on} of ${N} ${N === 1 ? "lands" : "land"} right on a kick. move ${on === 1 ? "it" : "them"} into the gaps and both will hit harder` });
        break;
      }
      case "backbeat": {
        const hits = presses.map(p => p[0].start % 4);
        const two = hits.filter(h => near(h, 1) || near(h, 3)).length;
        out.push({ id, ok: two === N && N > 0, say: two === N ? `all ${N} on two and four, the backbeat` : `${two} of ${N} on two and four. the others are extra hits, which can be a fill or a slip` });
        break;
      }
      case "bar": {
        const half = (loop || 4) / 2;
        const first = presses.some(p => p[0].start % (loop || 4) < half - 1e-6);
        const second = presses.some(p => p[0].start % (loop || 4) >= half - 1e-6);
        out.push({ id, ok: first && second, say: first && second ? "it fills the bar, with notes in both halves" : first ? "it all sits in the first half. the second half is empty, which leaves a gap every time round" : "it all sits in the second half, so the bar starts empty" });
        break;
      }
      case "home": {
        const last = presses[presses.length - 1];
        const low = Math.min(...last.map(e => e.note));
        const home = pc(low) === pc(root);
        out.push({ id, ok: home, say: home ? `it ends on ${name(low)}, home, so it sounds finished` : `it ends on ${name(low)}, away from home, so it sounds like a question. end on key one to finish it` });
        break;
      }
      case "moves": {
        const kinds = new Set(presses.map(p => p.map(e => e.note).sort((a, b) => a - b).join(","))).size;
        out.push({ id, ok: kinds >= 2, say: kinds >= 2 ? `it moves between ${kinds} different ${presses.some(p => p.length > 1) ? "chords" : "notes"}` : "every press is the same. try moving one or two, it's where the tune comes from" });
        break;
      }
      case "chord": {
        if (!chords.length) { out.push({ id, ok: true, say: "your song has no chords yet to check against" }); break; }
        const fits = events.filter(e => { const s = sounding(e.start % (loop || 4)); return !s.length || s.some(c => pc(c.note) === pc(e.note)); }).length;
        out.push({ id, ok: fits * 3 >= events.length * 2, say: `${fits} of ${events.length} ${events.length === 1 ? "note is" : "notes are"} in the chord playing under ${events.length === 1 ? "it" : "them"}${fits * 3 >= events.length * 2 ? "" : ". the others pass between, which is fine on short notes"}` });
        break;
      }
      case "roots": {
        if (!chords.length) { out.push({ id, ok: true, say: "your song has no chords yet to follow" }); break; }
        const on = presses.filter(p => { const s = sounding(p[0].start % (loop || 4)); return s.length && pc(Math.min(...s.map(c => c.note))) === pc(p[0].note); }).length;
        out.push({ id, ok: on * 2 >= N, say: `${on} of ${N} bass ${N === 1 ? "note is" : "notes are"} the root of the chord above ${N === 1 ? "it" : "them"}${on * 2 >= N ? "" : ". roots tell the ear which chord it is"}` });
        break;
      }
      case "short": {
        const avg = events.reduce((a, e) => a + e.len, 0) / events.length;
        out.push({ id, ok: avg <= 0.5 + 1e-6, say: avg <= 0.5 + 1e-6 ? "the notes are short, so they bounce" : "the notes are long, so they blur into each other and the kick. shorter ones bounce" });
        break;
      }
      case "repeat": {
        const half = (loop || 4) / 2;
        const a = presses.filter(p => p[0].start < half - 1e-6).map(p => (p[0].start % half).toFixed(2));
        const b = new Set(presses.filter(p => p[0].start >= half - 1e-6).map(p => (p[0].start % half).toFixed(2)));
        const same = a.filter(x => b.has(x)).length;
        const ok = a.length >= 2 && same >= Math.ceil(a.length * 0.6);
        out.push({ id, ok, say: ok ? "the second half comes back with the same rhythm, so it sticks" : a.length < 2 ? "there's no motif in the first half yet to come back to" : "the second half has a new rhythm. a motif that comes back is easier to remember" });
        break;
      }
    }
  }
  return out;
}
