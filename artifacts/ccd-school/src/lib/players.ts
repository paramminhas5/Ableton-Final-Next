/**
 * Session players (Logic Pro's Drummer and Bass Player; Live 12.3's Patterns and acid bassline generator
 * are the same idea): a few honest controls, and they write ordinary notes into your song that you can
 * edit, never a black box. Complexity is how busy, intensity how hard and full, fill how often the bar
 * ends in a fill, swing pushes the off sixteenths late. The bass player follows the chord track (or the
 * key's root without one). Both follow the arrangement: softer in an intro or a break, harder in a drop.
 * Every choice comes from the seed, so the same settings always write the same notes. Pure, tested in
 * tests/players.test.ts.
 */
import { cellRand } from "./dice";
import { chordAt, chordTones, type Chord } from "./chords";
import { asScale, pitchClass, SCALES, type ScaleName } from "./theory";
import type { LayerV2, NoteEvent, TrackV2 } from "./track2";

export type PlayerSettings = { complexity: number; intensity: number; fill: number; swing: number; seed: number };
export const PLAYER_DEFAULT: PlayerSettings = { complexity: 0.35, intensity: 0.55, fill: 0.3, swing: 0, seed: 1 };

const KICK = 36, SNARE = 38, CLAP = 39, HAT = 42, OPEN = 46, RIM = 37, TOM = 45, TOM_HI = 48;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const r2 = (v: number) => Math.round(v * 100) / 100;

/** How a section's name changes the player's intensity: an intro or break plays softer, a drop harder. */
export function sectionIntensity(name: string | undefined, base: number): number {
  const n = (name ?? "").toLowerCase();
  if (n.startsWith("intro") || n.startsWith("outro")) return clamp(base * 0.6);
  if (n.startsWith("break")) return clamp(base * 0.35);
  if (n.startsWith("build")) return clamp(base * 0.85);
  if (n.startsWith("drop")) return clamp(base + 0.25);
  return clamp(base);
}

/** Swing baked into the notes the same way the song's swing knob plays it (off sixteenths pushed late). */
function swingAt(start: number, swing: number): number {
  const q = start * 4;
  const near = Math.round(q);
  return swing > 0 && Math.abs(q - near) < 0.08 && ((near % 2) + 2) % 2 === 1 ? start + Math.min(0.75, swing) / 6 : start;
}

/**
 * The drummer: kick, snare or clap, hats, over `loop` beats. `hats` false leaves the hats out (your song has
 * its own hats part: use `drummerHats` for it). `fillAt` puts a fill in the last beat of these bars.
 */
export function drummer(o: PlayerSettings & { loop: number; hats?: boolean; fillBars?: number[] }): NoteEvent[] {
  const { complexity: cx, intensity: it, seed } = o;
  const out: NoteEvent[] = [];
  const bars = Math.max(1, Math.round(o.loop / 4));
  const v = (base: number, k: number, s: number) => r2(clamp(base * (0.55 + 0.45 * it) + (cellRand(seed + 17, k, s) - 0.5) * 0.08, 0.15, 1));
  const fills = new Set(o.fillBars ?? Array.from({ length: bars }, (_, b) => b).filter(b => cellRand(seed + 5, 9, b) < o.fill * (b === bars - 1 ? 1.5 : 0.75)));
  for (let bar = 0; bar < bars; bar++) {
    const fillHere = fills.has(bar) && o.fill > 0;
    for (let s = 0; s < 16; s++) {
      const beat = bar * 4 + s / 4;
      const inFill = fillHere && s >= 12;
      const onBeat = s % 4 === 0, on8 = s % 2 === 0;
      // Kick: four on the floor; more complexity adds syncopated kicks off the beat.
      if (!inFill && (onBeat || (!on8 && cellRand(seed, 1, bar * 16 + s) < cx * 0.22) || (on8 && !onBeat && cellRand(seed, 2, bar * 16 + s) < cx * 0.3 * (s === 14 ? 1.6 : 1)))) {
        out.push({ note: KICK, vel: v(onBeat ? 0.95 : 0.75, 1, s), start: beat, len: 0.2 });
      }
      // Backbeat on two and four: a clap at low intensity, snare and clap together when it is loud.
      if (!inFill && (s === 4 || s === 12)) {
        out.push({ note: it > 0.45 ? SNARE : CLAP, vel: v(0.9, 2, s), start: beat, len: 0.2 });
        if (it > 0.75) out.push({ note: CLAP, vel: v(0.7, 3, s), start: beat, len: 0.2 });
      }
      // Ghost snares from complexity.
      if (!inFill && !on8 && s !== 3 && cellRand(seed, 4, bar * 16 + s) < cx * cx * 0.35) out.push({ note: SNARE, vel: v(0.35, 4, s), start: beat, len: 0.12 });
      // Hats: eighths, sixteenths as complexity grows, an open hat on the off beat when it is loud.
      if (o.hats !== false && !inFill) {
        const want = on8 ? !onBeat || it > 0.3 : cellRand(seed, 5, bar * 16 + s) < (cx - 0.2) * 1.3;
        if (want) {
          const open = !onBeat && on8 && s % 4 === 2 && it > 0.65 && cellRand(seed, 6, bar * 4 + (s >> 2)) < (it - 0.5) * 1.4;
          out.push({ note: open ? OPEN : HAT, vel: v(onBeat ? 0.8 : on8 ? 0.65 : 0.45, 5, s), start: beat, len: open ? 0.4 : 0.1 });
        }
      }
      // The fill: the last beat of the bar as snare and toms, busier with complexity.
      if (inFill) {
        const dense = s % 2 === 0 || cellRand(seed, 7, bar * 16 + s) < 0.4 + cx * 0.6;
        if (dense) {
          const pick = cellRand(seed, 8, bar * 16 + s);
          const note = cx > 0.5 && pick > 0.55 ? (s < 14 ? TOM_HI : TOM) : cx > 0.3 && pick < 0.12 ? RIM : SNARE;
          out.push({ note, vel: r2(clamp(0.5 + (s - 12) * 0.12 * (0.6 + it * 0.6), 0.2, 1)), start: beat, len: 0.12 });
        }
      }
    }
  }
  return out.map(e => ({ ...e, start: r2x(swingAt(e.start, o.swing)) })).sort((a, b) => a.start - b.start || a.note - b.note);
}
const r2x = (v: number) => Math.round(v * 10000) / 10000;

/** Hats on their own part, the way the drummer would play them. */
export function drummerHats(o: PlayerSettings & { loop: number }): NoteEvent[] {
  const all = drummer({ ...o, hats: true, fill: 0 });
  return all.filter(e => e.note === HAT || e.note === OPEN);
}

/**
 * The bass player: the chord track's root on every bar (the key's root without one), with fifths, octaves
 * and passing notes from the scale as complexity grows, and slides and accents as intensity grows (the
 * acid bassline idea: a slide is a note held into the next, which glides on our mono bass).
 */
export function bassPlayer(o: PlayerSettings & { loop: number; root: number; scale: ScaleName; chords?: (Chord | null)[]; low?: number }): NoteEvent[] {
  const { complexity: cx, intensity: it, seed } = o;
  const low = o.low ?? 33; // a1
  const bars = Math.max(1, Math.round(o.loop / 4));
  const base = (pc: number) => low + ((pc - pitchClass(low) + 12) % 12);
  const sc = SCALES[o.scale] as readonly number[];
  const out: NoteEvent[] = [];
  // How many hits a bar gets: half notes when simple, eighths and sixteenths when complex.
  for (let bar = 0; bar < bars; bar++) {
    const ch = chordAt(o.chords, bar * 4, o.loop);
    const rootPc = ch ? ch.root : pitchClass(o.root);
    const tones = ch ? chordTones(ch) : [rootPc, pitchClass(o.root + sc[Math.min(4, sc.length - 1)])];
    const r = base(rootPc);
    for (let s = 0; s < 16; s++) {
      const onBeat = s % 4 === 0, on8 = s % 2 === 0;
      const k = bar * 16 + s;
      const want = s === 0 ? true
        : onBeat ? cellRand(seed, 20, k) < 0.25 + cx * 0.75
        : on8 ? cellRand(seed, 21, k) < (s % 4 === 2 ? 0.15 + cx * 0.85 : cx * 0.6)
        : cellRand(seed, 22, k) < (cx - 0.35) * 0.8;
      if (!want) continue;
      // Which note: mostly the root, then the chord's other notes, then the scale, an octave up on accents.
      const pick = cellRand(seed, 23, k);
      let note = r;
      if (s > 0 && pick < cx * 0.45) note = base(tones[1 + Math.floor(cellRand(seed, 24, k) * (tones.length - 1))] ?? rootPc);
      else if (s > 0 && pick < cx * 0.6) {
        // A passing note: any note of the scale in the octave above the root.
        const pool = Array.from({ length: 12 }, (_, d) => r + d).filter(n => sc.includes(pitchClass(n - o.root)));
        note = pool[Math.floor(cellRand(seed, 25, k) * pool.length)] ?? r;
      }
      if (note < low) note += 12;
      const accent = cellRand(seed, 26, k) < it * 0.5;
      if (accent && cellRand(seed, 27, k) < it * 0.6 && s > 0) note += 12;
      out.push({ note, vel: r2(clamp((onBeat ? 0.85 : 0.7) * (0.6 + 0.4 * it) + (accent ? 0.15 : 0), 0.2, 1)), start: bar * 4 + s / 4, len: 0.2 });
    }
  }
  // Lengths: up to the next note; with intensity, some notes slide into the next one (held past its start).
  out.sort((a, b) => a.start - b.start);
  out.forEach((e, i) => {
    const next = out[i + 1]?.start ?? o.loop;
    const gap = next - e.start;
    const slide = i < out.length - 1 && cellRand(seed, 28, i) < it * it * 0.45 && out[i + 1].note !== e.note;
    e.len = r2x(slide ? gap + 0.06 : Math.max(0.12, Math.min(gap * (0.5 + 0.4 * (1 - cx)), 1.9)));
  });
  return out.map(e => ({ ...e, start: r2x(swingAt(e.start, o.swing)) }));
}

/** A section's settings: the player's own with the intensity the section's name asks for. */
export function forSection(p: PlayerSettings, name: string | undefined): PlayerSettings {
  return { ...p, intensity: sectionIntensity(name, p.intensity) };
}

/**
 * Let a player write a part of your song: `kind` "drummer" on a drums part (and the hats part, when the
 * song has one, so the hats are not doubled), "bass" on a bass part. With an arrangement, every section
 * gets its own notes at the intensity its name asks for, and the studio edits the drop (or the first
 * section). One call is one edit: undo brings your own notes back. Pure.
 */
export function applyPlayer(t: TrackV2, kind: "drummer" | "bass", layerId: string, p: PlayerSettings): TrackV2 {
  const target = t.layers.find(l => l.id === layerId);
  if (!target) return t;
  const hatsPart = kind === "drummer" ? t.layers.find(l => l.type === "hats" && l.id !== layerId) : undefined;
  const scale = asScale(t.scale);
  const write = (q: PlayerSettings, loop: number): Record<string, NoteEvent[]> => {
    if (kind === "bass") return { [layerId]: bassPlayer({ ...q, loop, root: t.root, scale, chords: t.chords }) };
    const out: Record<string, NoteEvent[]> = { [layerId]: drummer({ ...q, loop, hats: !hatsPart }) };
    if (hatsPart) out[hatsPart.id] = drummerHats({ ...q, loop });
    return out;
  };
  const loop = t.loop || 4;
  const secs = t.sections;
  const keepSettings = (l: LayerV2) => (l.id === layerId ? { ...l, player: { ...p } } : l);
  if (!secs?.length) {
    const w = write(p, loop);
    return { ...t, layers: t.layers.map(l => keepSettings(w[l.id] ? { ...l, events: w[l.id] } : l)) };
  }
  const per = secs.map(s => write(forSection(p, s.name), loop));
  const at = t.at ?? Math.max(0, secs.findIndex(s => s.name.toLowerCase().startsWith("drop")));
  // Sections keep everyone else's parts as they were: the first time, that is the loop they all shared.
  const shared = Object.fromEntries(t.layers.map(l => [l.id, l.events]));
  const sections = secs.map((s, i) => ({ ...s, notes: { ...(t.at === undefined ? shared : {}), ...(s.notes ?? {}), ...per[i] } }));
  const layers = t.layers.map(l => keepSettings(per[at][l.id] ? { ...l, events: per[at][l.id] } : l));
  return { ...t, sections, layers, at };
}
