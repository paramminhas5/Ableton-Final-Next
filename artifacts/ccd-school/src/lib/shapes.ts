/**
 * The engine's own envelope and filter maths, mirrored from the Rust so the pictures are honest:
 * engine/src/dsp/env.rs (Adsr, Decay), engine/src/inst/{synth,bass,drums}.rs (the times each
 * instrument sets) and engine/src/dsp/filter.rs (the ladder). Pure, so it is tested.
 */
import { BASS_PARAMS, CHORD_PARAMS, DRUM_PAD_PARAMS, DRUM_RACK_BASE, INSTRUMENT_BASE, LEAD_PARAMS } from "../engine/params.gen";
import { fromValue, toValue } from "../engine/format";

/** An envelope in seconds. `kind` "decay" is the drums' one-shot: it falls 60 db over `d`, no sustain, no release. */
export type Env = { a: number; d: number; s: number; r: number; kind: "adsr" | "decay" };

/** Drum pad lengths at decay 0.5 (seconds to -60 db), by pad, from `base_len` in drums.rs. */
export const DRUM_BASE_LEN = [0.45, 0.22, 0.3, 0.05, 0.07, 0.6, 0.09, 2.0, 0.5, 0.5, 0.5, 2.6, 0.12, 0.07, 0.9, 0.6];

const v = (spec: { min: number; max: number; curve: "lin" | "exp" | "fader" }, n: number | undefined, def: number) => toValue(spec, n ?? def);
const P = <T extends readonly { key: string }[]>(t: T, key: string) => t.find(p => p.key === key) as unknown as { index: number; min: number; max: number; curve: "lin" | "exp" | "fader"; default: number };

/** The amp envelope an instrument plays with, from its params (normalised, by wire index). */
export function ampEnv(engine: string, params: Record<number, number>, pad = 0): Env | null {
  const get = (t: readonly { key: string }[], key: string) => { const s = P(t, key); return v(s, params[s.index], s.default); };
  if (engine === "lead") return { a: get(LEAD_PARAMS, "attack") / 1000, d: 0.3, s: 0.9, r: get(LEAD_PARAMS, "release") / 1000, kind: "adsr" };
  if (engine === "chords") return { a: get(CHORD_PARAMS, "attack") / 1000, d: 0.4, s: 0.85, r: get(CHORD_PARAMS, "release") / 1000, kind: "adsr" };
  if (engine === "bass") {
    const d = get(BASS_PARAMS, "decay") / 1000;
    return { a: 0.0015, d: d * 1.6, s: 0.55, r: 0.045, kind: "adsr" };
  }
  if (engine === "drums") {
    const k = DRUM_PAD_PARAMS.length;
    const decay = params[INSTRUMENT_BASE + pad * k + 1] ?? DRUM_PAD_PARAMS[1].default;
    const open = pad === 4 ? 1 + (params[INSTRUMENT_BASE + DRUM_RACK_BASE] ?? 0) * 9 : 1;
    return { a: 0.0015, d: (DRUM_BASE_LEN[pad] ?? 0.3) * Math.pow(4, (decay - 0.5) * 2) * open, s: 0, r: 0, kind: "decay" };
  }
  return null;
}

/** The filter envelope (what the env knob moves the cutoff by), and how many octaves at full env. */
export function filterEnv(engine: string, params: Record<number, number>): { env: Env; octaves: number } | null {
  const get = (t: readonly { key: string }[], key: string) => { const s = P(t, key); return v(s, params[s.index], s.default); };
  if (engine === "lead") return { env: { a: 0.001, d: get(LEAD_PARAMS, "fdecay") / 1000, s: 0.4, r: get(LEAD_PARAMS, "frel") / 1000, kind: "adsr" }, octaves: 5 };
  if (engine === "chords") {
    const a = get(CHORD_PARAMS, "attack") / 1000;
    return { env: { a: 0.002 + a * 0.5, d: get(CHORD_PARAMS, "fdecay") / 1000, s: 0.35, r: get(CHORD_PARAMS, "frel") / 1000, kind: "adsr" }, octaves: 5 };
  }
  if (engine === "bass") {
    const d = get(BASS_PARAMS, "decay") / 1000;
    return { env: { a: 0.001, d, s: 0, r: d * 0.6, kind: "adsr" }, octaves: 6 };
  }
  return null;
}

const ATTACK_OVERSHOOT = 1.2;
const LN6 = 1.791759;

/** Level during attack, `t` seconds after note on, starting from `from`. Reaches 1 at `a` (from 0). */
function attackLevel(a: number, t: number, from = 0) {
  const tau = Math.max(0.0005, a) / LN6;
  return Math.min(1, ATTACK_OVERSHOOT + (from - ATTACK_OVERSHOOT) * Math.exp(-t / tau));
}

/**
 * The level of an envelope `t` seconds after note on, with the gate released `off` seconds after
 * note on (null while held). Same curves as env.rs: attack charges toward 1.2, decay and release
 * are three time constants to 95%.
 */
export function levelAt(e: Env, t: number, off: number | null = null): number {
  if (t < 0) return 0;
  if (e.kind === "decay") return Math.exp((-6.907755 * t) / Math.max(0.001, e.d));
  const held = (x: number) => {
    const a = Math.max(0.0005, e.a);
    if (x < a) return attackLevel(a, x);
    const tauD = Math.max(0.001, e.d) / 3;
    return e.s + (1 - e.s) * Math.exp(-(x - a) / tauD);
  };
  if (off === null || t < off) return held(t);
  const l0 = held(off);
  const tauR = Math.max(0.001, e.r) / 3;
  return l0 * Math.exp(-(t - off) / tauR);
}

/** Which part of the envelope `t` is in. */
export function stageAt(e: Env, t: number, off: number | null): "attack" | "decay" | "sustain" | "release" | "idle" {
  if (t < 0) return "idle";
  if (e.kind === "decay") return t < e.d ? "decay" : "idle";
  if (off !== null && t >= off) return t - off < e.r ? "release" : "idle";
  if (t < e.a) return "attack";
  if (t < e.a + e.d) return "decay";
  return "sustain";
}

/**
 * Where each stage sits across the picture, 0..1. Short stages still get room (a 1 ms attack is
 * visible); each stage's width grows with the square root of its time, so long ones still read long.
 */
export function envLayout(e: Env): { a: [number, number]; d: [number, number]; s: [number, number]; r: [number, number] } {
  if (e.kind === "decay") return { a: [0, 0.03], d: [0.03, 1], s: [1, 1], r: [1, 1] };
  const w = (x: number) => 0.05 + Math.sqrt(Math.max(0, x));
  const sus = 0.35;
  const parts = [w(e.a), w(e.d), sus, w(e.r)];
  const sum = parts.reduce((a, b) => a + b, 0);
  let x = 0;
  const out = parts.map(p => { const span: [number, number] = [x, x + p / sum]; x += p / sum; return span; });
  return { a: out[0], d: out[1], s: out[2], r: out[3] };
}

/** Points (x 0..1, y 0..1 level) that draw the envelope's shape in `envLayout`'s space. */
export function envPath(e: Env, n = 48): [number, number][] {
  const L = envLayout(e);
  const pts: [number, number][] = [];
  const seg = (span: [number, number], f: (u: number) => number) => {
    for (let i = 0; i <= n; i++) { const u = i / n; pts.push([span[0] + u * (span[1] - span[0]), f(u)]); }
  };
  if (e.kind === "decay") {
    pts.push([0, 0]);
    seg(L.d, u => levelAt(e, u * e.d));
    return pts;
  }
  pts.push([0, 0]);
  seg(L.a, u => attackLevel(e.a, u * e.a));
  seg(L.d, u => levelAt(e, e.a + u * e.d));
  const sEnd = levelAt(e, e.a + e.d);
  pts.push([L.s[0], sEnd], [L.s[1], sEnd]);
  seg(L.r, u => sEnd * Math.exp((-3 * u * e.r) / Math.max(0.001, e.r)));
  return pts;
}

/**
 * The dot: where on the picture a note is, `t` seconds after it started, released at `off`.
 * x follows real time through each stage; y is the level the engine is at.
 */
export function envDot(e: Env, t: number, off: number | null): { x: number; y: number; stage: ReturnType<typeof stageAt> } {
  const L = envLayout(e);
  const stage = stageAt(e, t, off);
  const y = levelAt(e, t, off);
  const lerp = (span: [number, number], u: number) => span[0] + Math.max(0, Math.min(1, u)) * (span[1] - span[0]);
  if (e.kind === "decay") return { x: lerp(L.d, t / e.d), y, stage };
  let x = 0;
  if (stage === "attack") x = lerp(L.a, t / Math.max(1e-4, e.a));
  else if (stage === "decay") x = lerp(L.d, (t - e.a) / Math.max(1e-4, e.d));
  else if (stage === "sustain") x = lerp(L.s, ((t - e.a - e.d) % 1.2) / 1.2);
  else if (stage === "release") x = lerp(L.r, (t - (off ?? 0)) / Math.max(1e-4, e.r));
  else x = 1;
  return { x, y, stage };
}

/** How long after the gate closes the picture still has something to show, in seconds. */
export const envTail = (e: Env) => (e.kind === "decay" ? e.d : e.r);

// ── the filter ───────────────────────────────────────────────────────────────

/** Filter characters a learner sees: the engine's `character` knob in thirds (params.rs step3). */
export type FilterCharacter = "warm" | "scream" | "smooth";

/** Keys engine item 7 may give its filter character param; the first one present is read. */
export const CHARACTER_KEYS = ["character", "ftype", "filter_type", "ftyp", "model"];
/** A stepped character knob, 0..1, to its name (warm, scream, smooth in thirds). */
export const characterOf = (n: number | undefined): FilterCharacter => (n === undefined ? "warm" : n < 0.34 ? "warm" : n < 0.67 ? "scream" : "smooth");

/**
 * Magnitude of the engine's ladder at `f` Hz, cutoff `fc`, resonance `res` 0..1, in db. The linear
 * part of filter.rs's Ladder (analog prototype, before saturation): four one-pole stages in a loop
 * with feedback k = 4.1 * r * max(sqrt r, r) and the bass given back by 1 + 0.55 k.
 * The other two characters (scream, smooth) are the linear parts of filter.rs's Ms20 and SEM Svf.
 */
export function filterDb(f: number, fc: number, res: number, character: FilterCharacter = "warm"): number {
  const w = f / Math.max(1, fc);
  const r = Math.max(0, Math.min(1, res));
  if (character === "warm") {
    const k = 4.1 * r * Math.max(Math.sqrt(r), r);
    const comp = 1 + 0.55 * k;
    // (1 + jw)^4 + k
    const re1 = 1, im1 = w;
    // (1 + jw)^2 = 1 - w^2 + 2jw
    const re2 = re1 * re1 - im1 * im1, im2 = 2 * re1 * im1;
    const re4 = re2 * re2 - im2 * im2 + k, im4 = 2 * re2 * im2;
    return 20 * Math.log10(comp / Math.max(1e-9, Math.hypot(re4, im4)));
  }
  // Both 2-pole characters are 1 / (1 - w^2 + j d w), from filter.rs (engine item 7):
  // scream is the Korg35 loop, d = 2 - 2.05 r (it self-oscillates at the top, drawn just short of it);
  // smooth is the SEM state-variable filter, d = 1 / (0.55 + 9 r^2). Output gains as the engine's.
  const d = character === "scream" ? Math.max(0.035, 2 - 2.05 * r) : 1 / (0.55 + 9 * r * r);
  const gain = character === "scream" ? 0.794 : 0.668;
  return 20 * Math.log10(gain / Math.max(1e-9, Math.hypot(1 - w * w, d * w)));
}

/** Cutoff in Hz after the filter envelope opens it, `level` 0..1 of the env, `amount` 0..1 (the env knob). */
export function envCutoff(fc: number, amount: number, level: number, octaves: number, vel = 0.85) {
  return fc * Math.pow(2, amount * octaves * level * (0.45 + 0.55 * vel));
}

/** Log-frequency axis, 20 Hz to 20 kHz, as 0..1. */
export const freqX = (f: number) => Math.log(Math.max(20, f) / 20) / Math.log(1000);
export const xFreq = (x: number) => 20 * Math.pow(1000, x);

/** The channel's low cut (eq.cut): a one-pole high pass, as OnePoleHp in filter.rs. 20 Hz is off. */
export function lowCutDb(f: number, fc: number): number {
  if (fc <= 20.5) return 0;
  const w = f / fc;
  return 20 * Math.log10(w / Math.hypot(1, w));
}

// ── drag on the picture ──────────────────────────────────────────────────────

/** A handle on a picture: the knob it moves (wire index) and how a time in seconds becomes that knob's value. */
export type EnvHandle = { index: number; key: string; toN: (seconds: number) => number };

/**
 * Which envelope corners can be dragged on an instrument, and the knob each one turns: the attack peak
 * (attack), the decay corner (decay, on the bass), the release end (release). A drum pad's whole hit is
 * its decay. Mirrors `ampEnv`, so a handle dragged to a time lands the knob on that time.
 */
export function envHandles(engine: string, params: Record<number, number>, pad = 0): { a?: EnvHandle; d?: EnvHandle; r?: EnvHandle } {
  const ms = (spec: { index: number; min: number; max: number; curve: "lin" | "exp" | "fader"; key?: string }, k = 1): EnvHandle => ({ index: spec.index, key: spec.key ?? "", toN: s => fromValue(spec, (s * 1000) / k) });
  if (engine === "lead" || engine === "chords") {
    const t = engine === "lead" ? LEAD_PARAMS : CHORD_PARAMS;
    return { a: ms({ ...P(t, "attack"), key: "attack" }), r: ms({ ...P(t, "release"), key: "release" }) };
  }
  if (engine === "bass") return { d: ms({ ...P(BASS_PARAMS, "decay"), key: "decay" }, 1.6) };
  if (engine === "drums") {
    const open = pad === 4 ? 1 + (params[INSTRUMENT_BASE + DRUM_RACK_BASE] ?? 0) * 9 : 1;
    const base = (DRUM_BASE_LEN[pad] ?? 0.3) * open;
    const index = INSTRUMENT_BASE + pad * DRUM_PAD_PARAMS.length + 1;
    return { d: { index, key: "decay", toN: s => Math.max(0, Math.min(1, 0.5 + Math.log(Math.max(1e-4, s) / base) / Math.log(4) / 2)) } };
  }
  return {};
}

/** Drag on the filter picture: a horizontal move of `dx` (share of the width) and the cutoff it lands on (the axis spans 1000x). */
export const dragCutoff = (hz0: number, dx: number) => hz0 * Math.pow(1000, dx);
/** Drag on an envelope corner: half the picture's width is four times longer or shorter. */
export const dragTime = (s0: number, dx: number) => Math.max(0.0005, s0 * Math.pow(4, dx * 2));
