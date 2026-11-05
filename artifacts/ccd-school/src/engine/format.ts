/**
 * Parameter maths and display, mirroring engine/src/params.rs exactly
 * (tests/engine-params.test.ts checks these against values Rust computed).
 */
import { FADER_MAX_DB, FADER_MIN_DB, FADER_UNITY, GLUE_RATIOS, type ParamSpec } from "./params.gen";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function faderDb(n: number): number {
  n = clamp01(n);
  if (n <= 0) return -Infinity;
  if (n >= FADER_UNITY) return ((n - FADER_UNITY) / (1 - FADER_UNITY)) * FADER_MAX_DB;
  return FADER_MIN_DB * Math.pow((FADER_UNITY - n) / FADER_UNITY, 1.6);
}

export function faderNorm(db: number): number {
  if (!Number.isFinite(db) || db <= FADER_MIN_DB) return 0;
  if (db >= 0) return FADER_UNITY + (db / FADER_MAX_DB) * (1 - FADER_UNITY);
  return FADER_UNITY - FADER_UNITY * Math.pow(db / FADER_MIN_DB, 1 / 1.6);
}

/** Normalised 0..1 to the value the engine uses. */
export function toValue(spec: Pick<ParamSpec, "min" | "max" | "curve">, n: number): number {
  n = clamp01(n);
  switch (spec.curve) {
    case "lin":
      return spec.min + n * (spec.max - spec.min);
    case "exp":
      return spec.min * Math.pow(spec.max / spec.min, n);
    case "fader":
      return faderDb(n);
  }
}

export function fromValue(spec: Pick<ParamSpec, "min" | "max" | "curve">, v: number): number {
  switch (spec.curve) {
    case "lin":
      return clamp01((v - spec.min) / (spec.max - spec.min));
    case "exp":
      return clamp01(Math.log(v / spec.min) / Math.log(spec.max / spec.min));
    case "fader":
      return faderNorm(v);
  }
}

/** The fm ratio knob's steps (modulator over carrier), as in engine/src/params.rs. */
export const FM_RATIOS = [0.5, 1, 2, 3, 4, 5, 6, 7, 8];

/** Which of three words a three-step knob is on (the engine's `step3`). */
const STEP3 = (n: number, words: [string, string, string]) => words[n < 0.34 ? 0 : n < 0.67 ? 1 : 2];

const round = (v: number, d = 0) => {
  const p = 10 ** d;
  return Math.round(v * p) / p;
};

/** What the screen shows when you touch a control: "-3 db", "pan l 20", "1.2 khz". */
export function display(spec: Pick<ParamSpec, "min" | "max" | "curve" | "unit"> & { key?: string }, n: number): string {
  // Stepped knobs show what they choose, not a number.
  if (spec.key === "lfoto") return n < 0.34 ? "to the filter" : n < 0.67 ? "to the pitch" : "to the volume";
  if (spec.key === "ratio") return `ratio ${FM_RATIOS[Math.round(Math.min(1, Math.max(0, n)) * (FM_RATIOS.length - 1))]}`;
  if (spec.key === "glueratio") return `${GLUE_RATIOS[Math.round(Math.min(1, Math.max(0, n)) * (GLUE_RATIOS.length - 1))]}:1`;
  if (spec.key === "sidechain" && n < 0.01) return "hears it all";
  if (spec.key === "shape") return STEP3(n, ["round", "tight", "hard"]);
  if (spec.key === "character") return STEP3(n, ["warm", "scream", "smooth"]);
  if (spec.key === "space") return n < 0.5 ? "hall" : "plate";
  if (spec.key === "echotype") return STEP3(n, ["clean", "tape", "analogue"]);
  if (spec.key === "voice") return ["synth", "pluck", "mallet", "keys"][Math.round(Math.min(1, Math.max(0, n)) * 3)];
  if (spec.key === "shapeblip") return STEP3(n, ["blip", "bell", "metal"]);
  if (spec.key === "shapewood") return STEP3(n, ["wood", "bell", "metal"]);
  if (spec.key === "color") {
    const c = Math.round((n * 2 - 1) * 100);
    return c === 0 ? "centre" : c < 0 ? `dark ${-c}` : `bright ${c}`;
  }
  const v = toValue(spec, n);
  switch (spec.unit) {
    case "db": {
      if (!Number.isFinite(v)) return "off";
      const r = round(v, Math.abs(v) < 10 ? 1 : 0);
      return `${r > 0 ? "+" : ""}${r === 0 ? "0" : r} db`;
    }
    case "hz":
      return v >= 1000 ? `${round(v / 1000, v >= 10000 ? 1 : 2)} khz` : `${round(v)} hz`;
    case "ms":
      return v >= 1000 ? `${round(v / 1000, 2)} s` : `${round(v)} ms`;
    case "st": {
      const r = round(v, 1);
      return `${r > 0 ? "+" : ""}${r} st`;
    }
    case "pan": {
      const p = round(v * 50);
      return p === 0 ? "centre" : p < 0 ? `pan l ${-p}` : `pan r ${p}`;
    }
    case "pct":
      return `${round(n * 100)}%`;
    case "none": {
      const c = round(v * 100);
      return c === 0 ? "0" : `${c > 0 ? "+" : ""}${c}`;
    }
  }
}

/** Snap to a detent when close, the way a centre-detented knob catches. */
export function snapDetent(spec: Pick<ParamSpec, "detents">, n: number, within = 0.025): number {
  for (const d of spec.detents) if (Math.abs(n - d) < within) return d;
  return n;
}
