/**
 * The dj bank. Stand-ins rendered on our engine at the bpm and key of the tracks Param picked for CCD
 * (measured 5 Nov 2026, design/dj-bank-and-unlocks.md). The real tracks stay out of the app until CCD can
 * stream them; a learner can load their own files on a deck.
 */
import { newLayerV2, type NoteEvent, type TrackV2 } from "../lib/track2";

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
export const bankTrack = (id: string) => DJ_BANK.find(b => b.id === id) ?? DJ_BANK[0];

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

/**
 * A bank track's layers laid onto a transport running at `transportBpm`, for `beats` transport beats.
 * The track plays at `deckBpm`, so its notes drift against the transport until the two match.
 */
export function bankLayers(t: BankTrack, deckBpm: number, transportBpm: number, beats: number, prefix: string) {
  const f = transportBpm / deckBpm;
  const hit = (note: number, d: number, vel: number, len: number): NoteEvent | null => (d * f < beats - 0.001 ? { note, vel, start: d * f, len: len * f } : null);
  const drums: NoteEvent[] = [], hats: NoteEvent[] = [], bass: NoteEvent[] = [];
  const third = t.minor ? 3 : 4;
  for (let d = 0; d * f < beats; d++) {
    const bar = Math.floor(d / 4), beat = d % 4;
    [hit(KICK, d, 0.95, 0.25), beat % 2 === 1 ? hit(CLAP, d, 0.75, 0.25) : null].forEach(e => e && drums.push(e));
    if (t.style === "rolling") for (const s of [0, 0.25, 0.5, 0.75]) { const e = hit(CLOSED, d + s, s === 0.5 ? 0.6 : 0.35, 0.06); if (e) hats.push(e); }
    else { const e = hit(OPEN, d + 0.5, 0.55, 0.2); if (e) hats.push(e); }
    const roots = [0, 0, bar % 2 ? 7 : third + 7, 5];
    const r = t.root + roots[beat];
    if (t.style === "rolling") for (const s of [0.25, 0.5, 0.75]) { const e = hit(r, d + s, 0.8, 0.18); if (e) bass.push(e); }
    else if (t.style === "bouncy") [hit(r, d + 0.5, 0.85, 0.3), hit(r + 12, d + 0.75, 0.6, 0.12)].forEach(e => e && bass.push(e));
    else { const e = hit(r, d + 0.5, 0.85, 0.35); if (e) bass.push(e); }
  }
  const L = (type: "drums" | "hats" | "bass", events: NoteEvent[]) => ({ ...newLayerV2(type, `${prefix}:${type}`), id: `${prefix}-${type}`, events });
  const h = L("hats", hats); h.pad = t.style === "rolling" ? 4 : 5;
  return [L("drums", drums), h, L("bass", bass)];
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
