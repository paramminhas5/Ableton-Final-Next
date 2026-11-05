/**
 * Modulation (touch and hear, item 2): drag the lfo or the filter envelope onto any knob of an instrument.
 * The knob gets a ring in the source's colour showing how far the source moves it; the knob itself still
 * turns (Live 12: modulation no longer takes over the parameter). Unused sources stay dark until assigned
 * (Pigments).
 *
 * Two kinds of route, one picture:
 * - the instrument's own: the lfo to the filter ("lfo" and "lfo to") and the filter envelope to the
 *   cutoff ("env"). These run inside the voice, per note, and lessons teach them; their ring on the
 *   cutoff is drawn in shares of the cutoff knob's travel, so it shows exactly how far they reach.
 * - routes to anything else: `LayerV2.mods`, sent to the engine's modulation slots (engine.rs, cmd MOD),
 *   amount in shares of the knob's travel.
 * Pure, so it is tested.
 */
import { BASS_PARAMS, CHORD_PARAMS, LEAD_PARAMS, MAX_MODS, MOD_SRC, type ParamSpec } from "../engine/params.gen";
import { PIC } from "./paramColor";

export type ModSrc = "lfo" | "env";
/** One route: a source, the wire param it moves, and how far (-1..1 of the knob's travel). */
export type Mod = { src: ModSrc; to: number; amt: number };

/** What a learner reads: Live's names (Wavetable and Drift call them LFO and Env; this one is the filter's). */
export const SRC_LABEL: Record<ModSrc, string> = { lfo: "lfo", env: "filter env" };
/** The source's colour: the lfo's own, the envelope's own. */
export const SRC_COLOR: Record<ModSrc, string> = { lfo: PIC.lfo, env: PIC.env };

type Spec = { key: string; index: number; min: number; max: number; curve: string };
const tableOf = (engine: string): readonly Spec[] | null => (engine === "lead" ? LEAD_PARAMS : engine === "chords" ? CHORD_PARAMS : engine === "bass" ? BASS_PARAMS : null);
const spec = (engine: string, key: string) => tableOf(engine)?.find(p => p.key === key);
const val = (params: Record<number, number>, s?: { index: number; default?: number }) => (s ? params[s.index] ?? (s as { default?: number }).default ?? 0 : 0);

/** The sources an instrument has: the synths have an lfo and a filter envelope, the bass its filter envelope. */
export function sourcesFor(engine: string): ModSrc[] {
  if (engine === "lead" || engine === "chords") return ["lfo", "env"];
  if (engine === "bass") return ["env"];
  return [];
}

/** Octaves the cutoff knob spans, so the voice's own routes draw in shares of its travel. */
const cutOctaves = (engine: string) => { const c = spec(engine, "cutoff"); return c ? Math.log2(c.max / c.min) : 1; };
/** How far the voice's own routes reach at full: the lfo 3 octaves either way, the envelope 5 (6 on the bass). Mirrors synth.rs and bass.rs. */
const LFO_OCT = 3;
const envOct = (engine: string) => (engine === "bass" ? 6 : 5);

/** A ring to draw on a knob: whose, how far, and whether it swings both ways. `own` is the voice's own route. */
export type Ring = { src: ModSrc; amt: number; bipolar: boolean; own: boolean; slot: number };

/** Every ring on an instrument's knobs, by wire index. */
export function ringsOf(engine: string, params: Record<number, number>, mods: Mod[] | undefined): Map<number, Ring[]> {
  const out = new Map<number, Ring[]>();
  const add = (i: number, r: Ring) => out.set(i, [...(out.get(i) ?? []), r]);
  const cut = spec(engine, "cutoff");
  if (cut && (engine === "lead" || engine === "chords")) {
    const lfo = val(params, spec(engine, "lfo"));
    const to = val(params, spec(engine, "lfoto"));
    if (lfo > 0.001 && to < 0.34) add(cut.index, { src: "lfo", amt: (lfo * LFO_OCT) / cutOctaves(engine), bipolar: true, own: true, slot: -1 });
  }
  if (cut && sourcesFor(engine).includes("env")) {
    const env = val(params, spec(engine, "env"));
    if (env > 0.001) add(cut.index, { src: "env", amt: (env * envOct(engine)) / cutOctaves(engine), bipolar: false, own: true, slot: -1 });
  }
  (mods ?? []).forEach((m, slot) => { if (m.amt !== 0) add(m.to, { src: m.src, amt: m.amt, bipolar: m.src === "lfo", own: false, slot }); });
  return out;
}

/** Is a source doing anything on this instrument? Dark until it is (Pigments). */
export function sourceUsed(engine: string, params: Record<number, number>, mods: Mod[] | undefined, src: ModSrc): boolean {
  for (const rs of ringsOf(engine, params, mods).values()) if (rs.some(r => r.src === src)) return true;
  return false;
}

/** Knobs a source can't go to: where the lfo goes is a switch, not an amount. */
export const canTake = (key: string) => key !== "lfoto";

/**
 * Drop a source on a knob. On the cutoff, the voice's own route takes it (the lfo switches to the filter,
 * the envelope's amount comes up); anywhere else it takes a free modulation slot. Returns the knob values
 * to change and the routes after.
 */
export function assign(engine: string, params: Record<number, number>, mods: Mod[] | undefined, src: ModSrc, to: number, amt = 0.25): { params: Record<number, number>; mods: Mod[] } {
  const list = (mods ?? []).filter(m => m.amt !== 0);
  const cut = spec(engine, "cutoff");
  if (cut && to === cut.index) {
    if (src === "lfo" && (engine === "lead" || engine === "chords")) {
      const lfo = spec(engine, "lfo")!, lfoto = spec(engine, "lfoto")!;
      return { params: { [lfoto.index]: 0, ...(val(params, lfo) > 0.001 ? {} : { [lfo.index]: 0.3 }) }, mods: list };
    }
    if (src === "env") {
      const env = spec(engine, "env")!;
      return { params: val(params, env) > 0.001 ? {} : { [env.index]: 0.5 }, mods: list };
    }
  }
  const at = list.findIndex(m => m.src === src && m.to === to);
  if (at >= 0) return { params: {}, mods: list };
  if (list.length >= MAX_MODS) return { params: {}, mods: list };
  return { params: {}, mods: [...list, { src, to, amt }] };
}

/** Set a ring's amount. The voice's own routes turn their knob (lfo, env); the others their slot's amount. 0 removes a slot. */
export function setAmount(engine: string, mods: Mod[] | undefined, ring: Ring, amt: number): { params: Record<number, number>; mods: Mod[] } {
  const list = (mods ?? []).slice();
  if (ring.own) {
    const k = spec(engine, ring.src === "lfo" ? "lfo" : "env")!;
    const per = ring.src === "lfo" ? LFO_OCT : envOct(engine);
    return { params: { [k.index]: Math.max(0, Math.min(1, (Math.abs(amt) * cutOctaves(engine)) / per)) }, mods: list };
  }
  const a = Math.max(-1, Math.min(1, amt));
  if (Math.abs(a) < 0.005) return { params: {}, mods: list.filter((_, i) => i !== ring.slot) };
  list[ring.slot] = { ...list[ring.slot], amt: a };
  return { params: {}, mods: list };
}

/** Take a ring off: the voice's own go to zero, a slot is removed. */
export function removeRing(engine: string, mods: Mod[] | undefined, ring: Ring) {
  return ring.own ? setAmount(engine, mods, ring, 0) : { params: {}, mods: (mods ?? []).filter((_, i) => i !== ring.slot) };
}

/** Routes for the engine's slots: every slot, cleared ones as amount 0, so a removed route reaches it too. */
export function engineSlots(mods: Mod[] | undefined): { src: number; to: number; amt: number }[] {
  return Array.from({ length: MAX_MODS }, (_, i) => {
    const m = mods?.[i];
    return m && m.amt !== 0 ? { src: MOD_SRC[m.src], to: m.to, amt: m.amt } : { src: 0, to: 0, amt: 0 };
  });
}

export type { ParamSpec };
