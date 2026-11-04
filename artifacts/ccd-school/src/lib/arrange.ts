/**
 * Arrangement: your loop laid out as sections (intro, build, drop, break...). Each section lists the parts
 * that are switched off in it and can end with a fill. Stored on the song as `sections`; layer events stay
 * one loop long, and `arranged()` expands them into the long timeline the engine plays. Pure.
 */
import { newLayerV2, type LayerV2, type NoteEvent, type TrackV2 } from "./track2";
import { FX_RISER_NOTE as RISER } from "../engine/params.gen";
import { withArps } from "./arp";

export type Section = { name: string; bars: number; off: string[]; fill?: boolean; riser?: boolean };

export const CLASSIC = (t: TrackV2): Section[] => {
  const id = (type: string) => t.layers.filter(l => l.type === type).map(l => l.id);
  const melodic = [...id("lead"), ...id("chords")];
  return [
    { name: "intro", bars: 4, off: [...melodic, ...id("bass")] },
    { name: "build", bars: 4, off: id("lead"), fill: true },
    { name: "drop", bars: 4, off: [] },
    { name: "break", bars: 4, off: [...id("drums"), ...id("bass")], fill: true },
    { name: "drop", bars: 4, off: [] },
  ];
};

const KICK = 36, SNARE = 38;

/** The song as the engine plays it: one long loop, every section in turn. Unchanged with no sections. */
export function arranged(t: TrackV2): TrackV2 {
  // Arpeggiators play first, so every section repeats the arpeggio.
  t = withArps(t);
  const secs = (t as TrackV2 & { sections?: Section[] }).sections;
  if (!secs?.length) return t;
  const L = t.loop || 4;
  let at = 0;
  const out = new Map<string, NoteEvent[]>(t.layers.map(l => [l.id, []]));
  const firstDrums = t.layers.find(l => l.type === "drums");
  for (const s of secs) {
    const beats = s.bars * 4;
    const fillFrom = s.fill ? at + beats - 1 : Infinity;
    for (const l of t.layers) {
      if (s.off.includes(l.id)) continue;
      const evs = out.get(l.id)!;
      for (let k = 0; k * L < beats; k++) {
        for (const e of l.events) {
          const start = at + k * L + e.start;
          if (start >= at + beats) continue;
          // The last beat of a section with a fill drops the kick to make room for the roll.
          if (start >= fillFrom && l.type === "drums" && e.note === KICK) continue;
          evs.push({ ...e, start });
        }
      }
    }
    if (s.fill && firstDrums) {
      const evs = out.get(firstDrums.id)!;
      [0, 0.25, 0.5, 0.75].forEach((o, i) => evs.push({ note: SNARE, vel: 0.5 + i * 0.15, start: at + beats - 1 + o, len: 0.12 }));
    }
    at += beats;
  }
  const layers: LayerV2[] = t.layers.map(l => ({ ...l, events: out.get(l.id)! }));
  // Risers: a noise sweep over the last two bars of a section, on an fx layer of its own.
  if (secs.some(s => s.riser) && layers.length < 8 && !layers.some(l => l.type === "fx")) {
    let a = 0;
    const evs: NoteEvent[] = [];
    for (const s of secs) { if (s.riser) evs.push({ note: RISER, vel: 0.8, start: a + s.bars * 4 - 8, len: 8 }); a += s.bars * 4; }
    layers.push({ ...newLayerV2("fx", "__riser"), id: "__riser", events: evs.filter(e => e.start >= 0) });
  }
  return { ...t, loop: at, layers };
}

/** Where a beat on the long timeline falls: which section, and how far in. */
export function sectionAt(secs: Section[], beat: number): number {
  let at = 0;
  for (let i = 0; i < secs.length; i++) { at += secs[i].bars * 4; if (beat < at) return i; }
  return secs.length - 1;
}
