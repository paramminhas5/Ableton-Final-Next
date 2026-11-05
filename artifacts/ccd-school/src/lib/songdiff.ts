/**
 * What a lesson changed in your song, as short lowercase lines: "+ lead", "bass cutoff 1.2 khz to 800 hz",
 * "120 to 132 bpm", "cue: mix out on bar 8". The done screen shows it so "every lesson acts on your song" is
 * something you can read, not just hear.
 */
import { display } from "../engine/format";
import {
  DRUM_PAD_NAMES,
  DRUM_PAD_PARAMS,
  DRUM_RACK_BASE,
  DRUM_RACK_PARAMS,
  INSTRUMENT_BASE,
  LAYER_PARAMS,
  MASTER_PARAMS,
  type ParamSpec,
} from "../engine/params.gen";
import { INSTRUMENT_TABLES, TYPE, masterOf, paramOf, type LayerV2, type TrackV2 } from "./track2";

const NOTE = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
const keyName = (t: Pick<TrackV2, "root" | "scale">) => `${NOTE[((t.root % 12) + 12) % 12]} ${t.scale}`;

/** The knob behind a wire index on this layer, with the name the learner sees ("kick decay", "cutoff"). */
function specOf(l: LayerV2, index: number): { spec: ParamSpec; name: string } | null {
  if (index < INSTRUMENT_BASE) {
    const spec = LAYER_PARAMS.find(p => p.index === index) as ParamSpec | undefined;
    return spec ? { spec, name: spec.label } : null;
  }
  const engine = TYPE[l.type].engine;
  if (engine === "drums") {
    const i = index - INSTRUMENT_BASE;
    if (i >= DRUM_RACK_BASE) {
      const spec = DRUM_RACK_PARAMS[i - DRUM_RACK_BASE] as ParamSpec | undefined;
      return spec ? { spec, name: spec.label } : null;
    }
    const spec = DRUM_PAD_PARAMS[i % DRUM_PAD_PARAMS.length] as ParamSpec | undefined;
    const pad = DRUM_PAD_NAMES[Math.floor(i / DRUM_PAD_PARAMS.length)];
    return spec && pad ? { spec, name: `${pad} ${spec.label}` } : null;
  }
  const spec = INSTRUMENT_TABLES[engine]?.find(p => p.index === index) as ParamSpec | undefined;
  return spec ? { spec, name: spec.label } : null;
}

const close = (a: number, b: number) => Math.abs(a - b) < 0.005;
const notesKey = (l: LayerV2) => JSON.stringify(l.events.map(e => [e.note, e.start, e.len, Math.round(e.vel * 20)]).sort());

/** Lines naming what changed between two versions of the song, most telling first, at most `max`. */
export function songDiff(before: TrackV2, now: TrackV2, max = 5): string[] {
  const out: string[] = [];
  const was = new Map(before.layers.map(l => [l.id, l]));
  const is = new Map(now.layers.map(l => [l.id, l]));
  for (const l of now.layers) if (!was.has(l.id) && l.events.length) out.push(`+ ${TYPE[l.type].label}`);
  for (const l of before.layers) if (!is.has(l.id) && l.events.length) out.push(`- ${TYPE[l.type].label}`);
  if (before.bpm !== now.bpm) out.push(`${before.bpm} to ${now.bpm} bpm`);
  if (before.root !== now.root || before.scale !== now.scale) out.push(`key ${keyName(before)} to ${keyName(now)}`);
  if (!close(before.swing, now.swing)) out.push(`swing ${Math.round(before.swing * 100)}% to ${Math.round(now.swing * 100)}%`);
  const knobs: string[] = [];
  for (const l of now.layers) {
    const b = was.get(l.id);
    if (!b) continue;
    const label = TYPE[l.type].label;
    if (notesKey(b) !== notesKey(l)) {
      const d = l.events.length - b.events.length;
      out.push(d === 0 ? `${label}: new notes` : `${label}: ${b.events.length} to ${l.events.length} notes`);
    }
    if (b.mute !== l.mute) out.push(`${label} ${l.mute ? "muted" : "unmuted"}`);
    const idx = new Set([...Object.keys(b.params), ...Object.keys(l.params)].map(Number));
    for (const i of [...idx].sort((x, y) => x - y)) {
      const x = paramOf(b, i), y = paramOf(l, i);
      if (close(x, y)) continue;
      const s = specOf(l, i);
      if (!s) continue;
      const from = display({ ...s.spec, key: s.spec.key }, x), to = display({ ...s.spec, key: s.spec.key }, y);
      if (from === to) continue;
      knobs.push(`${label === s.name.split(" ")[0] ? "" : `${label} `}${s.name} ${from} to ${to}`);
    }
  }
  for (const p of MASTER_PARAMS as readonly ParamSpec[]) {
    const x = masterOf(before, p.index), y = masterOf(now, p.index);
    if (!close(x, y)) knobs.push(`master ${p.label} ${display(p, x)} to ${display(p, y)}`);
  }
  out.push(...knobs);
  const secs = (t: TrackV2) => JSON.stringify(t.sections ?? null);
  if (secs(before) !== secs(now)) {
    const s = now.sections ?? [];
    out.push(s.length ? `arrangement: ${s.length} sections, ${s.reduce((a, x) => a + x.bars, 0)} bars` : "arrangement cleared");
  }
  const old = new Set((before.cues ?? []).map(c => `${c.slug}|${c.name}|${c.bar}`));
  for (const c of now.cues ?? []) if (!old.has(`${c.slug}|${c.name}|${c.bar}`)) out.push(`cue: ${c.name} on bar ${c.bar}`);
  if (out.length > max) return [...out.slice(0, max - 1), `+ ${out.length - max + 1} more`];
  return out;
}
