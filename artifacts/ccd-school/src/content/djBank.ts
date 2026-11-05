/**
 * The dj bank. Stand-ins rendered on our engine at the bpm and key of the tracks Param picked for CCD
 * (measured 5 Nov 2026, design/dj-bank-and-unlocks.md). The real tracks stay out of the app until CCD can
 * stream them; a learner can load their own files on a deck.
 */
import { newLayerV2, type NoteEvent, type TrackV2 } from "../lib/track2";
import { REAL_TRACKS, type RealTrack } from "./djTracks";

export type BankTrack = { id: string; name: string; bpm: number; key: string; camelot: string; root: number; minor: boolean; style: "offbeat" | "rolling" | "bouncy" };

const pc = (n: string) => ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(n);
const mk = (id: string, name: string, bpm: number, key: string, camelot: string, style: BankTrack["style"]): BankTrack => {
  const [note, mode] = key.split(" ");
  return { id, name, bpm, key: key.toLowerCase(), camelot, root: 36 + pc(note), minor: mode === "minor", style };
};

export const DJ_BANK: BankTrack[] = [
  mk("warm-up", "warm up", 126, "D# major", "5B", "bouncy"),
  mk("operator", "smooth", 128, "G minor", "6A", "offbeat"),
  mk("morals", "long roller", 130, "A major", "11B", "rolling"),
  mk("simon", "tool", 131, "F minor", "4A", "offbeat"),
  mk("skywalker", "skywalker", 131, "G# minor", "1A", "rolling"),
  mk("space-bass", "space bass", 131, "F minor", "4A", "bouncy"),
  mk("sandman", "fast one", 135, "G major", "9B", "rolling"),
];
/** Every track a deck can load: Param's measured picks first, then the original stand-ins. */
export const ALL_BANK: BankTrack[] = [...REAL_TRACKS, ...DJ_BANK];
export const bankTrack = (id: string) => ALL_BANK.find(b => b.id === id) ?? DJ_BANK[0];
export const realOf = (id: string): RealTrack | undefined => REAL_TRACKS.find(r => r.id === id);

/**
 * "If we have similar songs, use them first" (Param, 5 Nov): the real pick closest to a lesson's stand-in,
 * when one is within 2 bpm and its key mixes with it, else the stand-in itself.
 */
export function preferReal(id: string, songCamelot?: string): BankTrack {
  const b = bankTrack(id);
  if (realOf(id)) return b;
  // With your song's key given (blends, eq, phrasing), the pick has to mix with your song; without it (the key
  // lessons, where a clash is the point), it matches the stand-in's key instead.
  const key = songCamelot ?? b.camelot;
  const near = REAL_TRACKS.filter(r => Math.abs(r.bpm - b.bpm) <= 3 && camelotFits(r.camelot, key))
    .sort((x, y) => Math.abs(x.bpm - b.bpm) - Math.abs(y.bpm - b.bpm));
  if (near[0]) return near[0];
  // No real pick close enough: a stand-in that mixes with your song beats one that clashes.
  if (songCamelot && !camelotFits(b.camelot, songCamelot)) {
    const fit = DJ_BANK.filter(t => camelotFits(t.camelot, songCamelot) && Math.abs(t.bpm - b.bpm) <= 4)[0];
    if (fit) return fit;
  }
  return b;
}

/** The smallest key shift (semitones) that makes a stand-in mix with your song; 0 when it already does. */
export function fitShift(t: BankTrack, songCamelot: string): number {
  for (const n of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6]) if (camelotFits(camelotOf(t.root + n, t.minor), songCamelot)) return n;
  return 0;
}

/** The bank for deck b, the tracks that suit your song first: real picks before stand-ins, nearest tempo and a key that mixes. */
export function similarFirst(bpm: number, camelot: string): BankTrack[] {
  // Real picks always come before the stand-ins; within each, the ones that mix with your song, then the nearest tempo.
  const score = (t: BankTrack) => (realOf(t.id) ? 0 : 1000) + (camelotFits(t.camelot, camelot) ? 0 : 100) + Math.abs(t.bpm - bpm);
  return [...ALL_BANK].sort((a, b) => score(a) - score(b));
}

const CAM_MINOR: Record<number, number> = { 8: 1, 3: 2, 10: 3, 5: 4, 0: 5, 7: 6, 2: 7, 9: 8, 4: 9, 11: 10, 6: 11, 1: 12 };
const CAM_MAJOR: Record<number, number> = { 11: 1, 6: 2, 1: 3, 8: 4, 3: 5, 10: 6, 5: 7, 0: 8, 7: 9, 2: 10, 9: 11, 4: 12 };
/** The Camelot code for a root note and scale, e.g. a minor is 8A. */
export function camelotOf(root: number, minor: boolean): string {
  const pc = ((root % 12) + 12) % 12;
  return `${(minor ? CAM_MINOR : CAM_MAJOR)[pc]}${minor ? "A" : "B"}`;
}
/** Keys that mix cleanly: the same code, one step either way on the wheel, or the same number across. */
export function camelotFits(a: string, b: string): boolean {
  const na = parseInt(a, 10), nb = parseInt(b, 10), la = a.slice(-1), lb = b.slice(-1);
  if (na === nb) return true;
  const d = Math.min((na - nb + 12) % 12, (nb - na + 12) % 12);
  return la === lb && d === 1;
}

const KICK = 36, CLAP = 39, CLOSED = 42, OPEN = 46;

/** A bank track is 16 bars: drums and bass, then everything, a break with no drums, and the drop. */
export const TRACK_BEATS = 64;
export const CUES = [
  { name: "intro", at: 0 },
  { name: "hats in", at: 16 },
  { name: "break", at: 48 },
  { name: "drop", at: 56 },
];
const sectionOf = (d: number) => (d < 16 ? "intro" : d < 48 ? "main" : d < 56 ? "break" : "drop");

/** One pass of a bank track in its own beats (0 to 64), before it is laid on the transport. */
export function bankPattern(t: BankTrack, shift = 0) {
  const drums: NoteEvent[] = [], hats: NoteEvent[] = [], bass: NoteEvent[] = [];
  const third = t.minor ? 3 : 4;
  const root = t.root + shift;
  for (let d = 0; d < TRACK_BEATS; d++) {
    const bar = Math.floor(d / 4), beat = d % 4, sec = sectionOf(d);
    if (sec !== "break") {
      drums.push({ note: KICK, vel: 0.95, start: d, len: 0.25 });
      if (beat % 2 === 1) drums.push({ note: CLAP, vel: 0.75, start: d, len: 0.25 });
    }
    if (sec !== "intro") {
      if (t.style === "rolling") for (const s of [0, 0.25, 0.5, 0.75]) hats.push({ note: CLOSED, vel: s === 0.5 ? 0.6 : 0.35, start: d + s, len: 0.06 });
      else hats.push({ note: OPEN, vel: 0.55, start: d + 0.5, len: 0.2 });
    }
    const r = root + [0, 0, bar % 2 ? 7 : third + 7, 5][beat];
    if (t.style === "rolling") for (const s of [0.25, 0.5, 0.75]) bass.push({ note: r, vel: 0.8, start: d + s, len: 0.18 });
    else if (t.style === "bouncy") bass.push({ note: r, vel: 0.85, start: d + 0.5, len: 0.3 }, { note: r + 12, vel: 0.6, start: d + 0.75, len: 0.12 });
    else bass.push({ note: r, vel: 0.85, start: d + 0.5, len: 0.35 });
  }
  return { drums, hats, bass };
}

/** Where deck b is in its track: `off` is the track beat at transport beat 0; `loop` repeats a stretch. */
export type DeckPlay = { off?: number; loop?: { start: number; len: number } | null; shift?: number };

/**
 * Lay events from track time onto the transport. One track beat takes `f` transport beats (transportBpm /
 * deckBpm, so a faster deck has f below 1). The deck starts `off` track beats in;
 * with a loop, it goes round that stretch instead of on through the track. Pure.
 */
export function layDeck(events: NoteEvent[], f: number, beats: number, play: DeckPlay): NoteEvent[] {
  const off = play.off ?? 0;
  const out: NoteEvent[] = [];
  const u1 = off + beats / f; // track time at the end of the transport window, unrolled
  const put = (u: number, e: NoteEvent) => { const x = (u - off) * f; if (x >= -1e-6 && x < beats - 0.001) out.push({ ...e, start: Math.max(0, x), len: e.len * f }); };
  if (play.loop && play.loop.len > 0) {
    const { start, len } = play.loop;
    const inLoop = events.filter(e => e.start >= start - 1e-6 && e.start < start + len - 1e-6);
    // Before the loop starts the track plays on; from the loop's start it goes round.
    for (const e of events) if (e.start < start && e.start >= off - 1e-6) put(e.start, e);
    const from = Math.max(start, off);
    for (let k = Math.floor((from - start) / len) - 1; start + k * len < u1; k++) for (const e of inLoop) { const u = e.start + k * len; if (u >= off - 1e-6) put(u, e); }
  } else {
    for (let k = Math.floor(off / TRACK_BEATS) - 1; k * TRACK_BEATS < u1; k++) for (const e of events) put(e.start + k * TRACK_BEATS, e);
  }
  return out.sort((a, b) => a.start - b.start);
}

/**
 * A bank track's layers laid onto a transport running at `transportBpm`, for `beats` transport beats.
 * The track plays at `deckBpm`, so its notes drift against the transport until the two match.
 */
export function bankLayers(t: BankTrack, deckBpm: number, transportBpm: number, beats: number, prefix: string, play: DeckPlay = {}) {
  const f = transportBpm / deckBpm;
  const pat = bankPattern(t, play.shift ?? 0);
  const lay = (evs: NoteEvent[]) => layDeck(evs, f, beats, play);
  const L = (type: "drums" | "hats" | "bass", events: NoteEvent[]) => ({ ...newLayerV2(type, `${prefix}:${type}`), id: `${prefix}-${type}`, events });
  const h = L("hats", lay(pat.hats)); h.pad = t.style === "rolling" ? 4 : 5;
  return [L("drums", lay(pat.drums)), h, L("bass", lay(pat.bass))];
}

/** Your song repeated to fill `beats`, its layers renamed so they don't collide with deck b's. */
export function songLayers(song: TrackV2, beats: number, prefix: string, max: number) {
  const loop = song.loop || 4;
  return song.layers.filter(l => l.events.length).slice(0, max).map(l => ({
    ...l,
    id: `${prefix}-${l.id}`,
    duck: { src: l.duck.src ? `${prefix}-${l.duck.src}` : null, note: l.duck.note },
    events: Array.from({ length: Math.ceil(beats / loop) }, (_, k) => l.events.map(e => ({ ...e, start: e.start + k * loop }))).flat().filter(e => e.start < beats),
  }));
}
