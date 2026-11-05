/**
 * Arrangement: your loop laid out as sections (intro, build, drop, break...). Each section lists the parts
 * that are switched off in it and can end with a fill. Stored on the song as `sections`; layer events stay
 * one loop long, and `arranged()` expands them into the long timeline the engine plays. Pure.
 */
import { newLayerV2, type LayerV2, type NoteEvent, type TrackV2 } from "./track2";
import { FX_RISER_NOTE as RISER } from "../engine/params.gen";
import { withArps } from "./arp";

/** `notes`: this section's own loop for some parts, by layer id (written by commit or a session player).
 * A part without its own notes here plays the layer's events, as every section did before. */
export type Section = { name: string; bars: number; off: string[]; fill?: boolean; riser?: boolean; notes?: Record<string, NoteEvent[]> };

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

/** Where an unarranged song starts for a lesson's goal: the classic layout minus the thing the lesson teaches,
 * so the learner makes the drop (hats count as drums), adds the fills, switches the parts off. */
export function startLayout(t: TrackV2, goal: "sections" | "drop" | "fills" | "risers" | "export"): Section[] {
  const c = CLASSIC(t);
  const drumIds = new Set(t.layers.filter(l => l.type === "drums" || l.type === "hats").map(l => l.id));
  if (goal === "drop") return c.map(s => ({ ...s, off: s.off.filter(id => !drumIds.has(id)) }));
  if (goal === "fills") return c.map(s => ({ ...s, fill: false }));
  if (goal === "sections") return c.map(s => ({ ...s, off: [], fill: false }));
  return c;
}

/** Whether an arrangement meets a lesson's goal. `drums` are the ids of the drum and hat parts. */
export function arrangeMet(secs: Section[], drums: string[], goal: "sections" | "drop" | "fills" | "risers" | "export"): boolean {
  if (goal === "export") return true;
  if (goal === "fills") return secs.some(s => s.fill);
  if (goal === "risers") return secs.some(s => s.riser);
  if (goal === "drop") return secs.some((s, i) => i > 0 && drums.some(d => secs[i - 1].off.includes(d)) && !drums.some(d => s.off.includes(d)));
  // Sections: a journey, not just any change. The drop is where everything plays, so every drop stays full
  // and some other section takes a part away. Switching parts off only in the drop is the wrong way round.
  const isDrop = (s: Section) => s.name === "drop";
  return secs.length >= 3 && secs.filter(isDrop).every(s => s.off.length === 0) && secs.some(s => !isDrop(s) && s.off.length > 0);
}

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
  const editing = (t as TrackV2 & { at?: number }).at;
  // Chance and trig conditions count plays of the part's loop, not of the whole song: each copy says which
  // play it is (`it`), and `reps` how many plays one pass of the song holds.
  const playsOf = new Map<string, number>();
  secs.forEach((s, si) => {
    const beats = s.bars * 4;
    const fillFrom = s.fill ? at + beats - 1 : Infinity;
    for (const l of t.layers) {
      if (s.off.includes(l.id)) continue;
      const evs = out.get(l.id)!;
      // The section you are editing plays the part as it is now; others play their own copy if they have one.
      const src = si === editing ? l.events : (s.notes?.[l.id] ?? l.events);
      const before = playsOf.get(l.id) ?? 0;
      let k = 0;
      for (; k * L < beats; k++) {
        for (const e of src) {
          const start = at + k * L + e.start;
          if (start >= at + beats) continue;
          // The last beat of a section with a fill drops the kick to make room for the roll.
          if (start >= fillFrom && l.type === "drums" && e.note === KICK) continue;
          evs.push(e.cond || (e.chance ?? 1) < 1 ? { ...e, start, it: before + k } : { ...e, start });
        }
      }
      playsOf.set(l.id, before + k);
    }
    if (s.fill && firstDrums) {
      const evs = out.get(firstDrums.id)!;
      [0, 0.25, 0.5, 0.75].forEach((o, i) => evs.push({ note: SNARE, vel: 0.5 + i * 0.15, start: at + beats - 1 + o, len: 0.12 }));
    }
    at += beats;
  });
  const layers: LayerV2[] = t.layers.map(l => {
    const reps = playsOf.get(l.id) ?? 1;
    return { ...l, events: out.get(l.id)!.map(e => (e.it !== undefined ? { ...e, reps } : e)) };
  });
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

/**
 * Move the studio to section `k`: the parts you were editing are kept as that section's own notes, and the
 * parts load section k's notes (a part section k has none for keeps what it has, and section k gets a copy
 * the next time you move away). One song, many sections, each with its own loop. Pure.
 */
export function goSection(t: TrackV2, k: number): TrackV2 {
  const secs = t.sections;
  if (!secs?.length || k < 0 || k >= secs.length) return t;
  const cur = t.at;
  const now = Object.fromEntries(t.layers.map(l => [l.id, l.events]));
  // The first move: every section keeps the loop they all shared, unless it already has its own.
  const sections = secs.map((s, i) => (cur === undefined ? { ...s, notes: { ...now, ...(s.notes ?? {}) } } : i === cur ? { ...s, notes: { ...(s.notes ?? {}), ...now } } : s));
  const target = sections[k];
  const layers = t.layers.map(l => (target.notes?.[l.id] ? { ...l, events: target.notes[l.id] } : l));
  return { ...t, sections, layers, at: k };
}

/** The section the studio edits, when the song has sections and has been moved into one. */
export function sectionNow(t: TrackV2): { index: number; section: Section } | null {
  const secs = t.sections;
  if (!secs?.length || t.at === undefined || t.at < 0 || t.at >= secs.length) return null;
  return { index: t.at, section: secs[t.at] };
}
