/**
 * Capture instead of record (Ableton Move and Note's "capture"): the studio keeps what you played
 * while not recording, and the capture key turns the last loop's worth of it into a take. With the
 * loop running, notes keep the beats the engine reported (already corrected for touch latency);
 * with it stopped, the first note lands on beat one and the rest follow at the song's tempo.
 * Pure, tested in tests/capture.test.ts.
 */
import { snapBeat, wrapBeat, type Snap } from "./theory";
import type { NoteEvent } from "./track2";

export type Played = {
  layerId: string;
  note: number;
  vel: number;
  /** performance.now() at note on and off (off null while held). */
  tOn: number;
  tOff: number | null;
  /** Loop beats the engine reported, when the loop was running. */
  bOn: number | null;
  bOff: number | null;
};

const MIN_LEN = 1 / 16;

/** Keep the buffer short: notes from the last `keepMs`, at most `max` of them. */
export function trimPlayed(buf: Played[], now: number, keepMs: number, max = 256): Played[] {
  const out = buf.filter(p => now - (p.tOff ?? now) < keepMs);
  return out.length > max ? out.slice(out.length - max) : out;
}

/**
 * The take from what was played on one layer: the last `loop` beats of it, snapped like a recording.
 * Notes still held end now.
 */
export function captureTake(buf: Played[], layerId: string, o: { loop: number; bpm: number; snap: Snap; swing: number; now: number }): NoteEvent[] {
  const mine = buf.filter(p => p.layerId === layerId);
  if (!mine.length) return [];
  const msPerBeat = 60000 / Math.max(30, o.bpm);
  const lastOn = Math.max(...mine.map(p => p.tOn));
  // The last loop's worth, counted back from the last note played.
  const recent = mine.filter(p => lastOn - p.tOn < o.loop * msPerBeat - 1);
  const looped = recent.every(p => p.bOn !== null);
  const t0 = Math.min(...recent.map(p => p.tOn));
  const out: NoteEvent[] = [];
  for (const p of recent) {
    const tOff = p.tOff ?? o.now;
    let start: number, len: number;
    if (looped) {
      start = p.bOn!;
      const end = p.bOff ?? p.bOn! + (tOff - p.tOn) / msPerBeat;
      len = end - start;
      if (len < 0) len += o.loop;
    } else {
      start = (p.tOn - t0) / msPerBeat;
      len = (tOff - p.tOn) / msPerBeat;
    }
    len = Math.min(Math.max(len, MIN_LEN), o.loop);
    const s = wrapBeat(snapBeat(start, o.snap, 1, o.swing), o.loop);
    // The same note twice on one step keeps the later one.
    const dup = out.findIndex(e => e.note === p.note && Math.abs(e.start - s) < 1e-6);
    const ev = { note: p.note, vel: p.vel, start: s, len };
    if (dup >= 0) out[dup] = ev; else out.push(ev);
  }
  return out.sort((a, b) => a.start - b.start || a.note - b.note);
}
