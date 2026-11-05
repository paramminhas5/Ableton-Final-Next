/**
 * One colour per thing a knob moves, shared by the knob's ring and the line it moves on the screen
 * (the OP-1 rule: colour binds control to picture). Never pink: pink is the go key.
 */
export const PIC = {
  env: "#F3C14F", // the envelope: attack, decay, sustain, release
  filter: "#57D3F5", // the filter curve: cutoff, resonance, the filter envelope
  lfo: "#B89CFF", // the lfo wave
  tone: "#FF9A57", // drive, crush, echo, tone, reverb, noise
  osc: "#E9E9E6", // the oscillator: wave, detune, fm, sub, tune, glide, voicing
  eq: "#A6E36A", // low, mid, high, low cut
  mix: "#C9CBD1", // level, pan, send, duck
} as const;

export type PicKey = keyof typeof PIC;

const BY_KEY: Record<string, PicKey> = {
  attack: "env", decay: "env", release: "env", sustain: "env", length: "env", hold: "env",
  cutoff: "filter", res: "filter", env: "filter", fdecay: "filter", frel: "filter", filter: "filter", character: "filter",
  lfo: "lfo", lforate: "lfo", lfoto: "lfo",
  drive: "tone", crush: "tone", echo: "tone", tone: "tone", reverb: "tone", noise: "tone", build: "tone",
  wave: "osc", detune: "osc", fm: "osc", ratio: "osc", sub: "osc", tune: "osc", glide: "osc", voicing: "osc", spread: "osc", drift: "osc", open: "env", start: "osc", gate: "osc", keys: "osc", reverse: "osc",
  low: "eq", mid: "eq", high: "eq", cut: "filter",
  level: "mix", pan: "mix", send: "mix", duck: "mix", glue: "mix", out: "mix",
};

/** The picture a param belongs to, by its key ("cutoff" is the filter). */
export const picOf = (key: string): PicKey => BY_KEY[key] ?? "osc";
export const picColor = (key: string): string => PIC[picOf(key)];

/**
 * Is a knob doing nothing at this value? Then it stays dark until turned up (Pigments' rule).
 * Amounts at zero (drive, echo, send, lfo, fm) and centred bipolar knobs (eq, tone, pan, tune) are idle.
 * Knobs that always shape the sound (cutoff, attack, level) are never idle.
 */
export function isIdle(spec: { key: string; min: number; detents: readonly number[]; unit: string; curve: string }, n: number): boolean {
  if (spec.curve === "fader") return n <= 0.001;
  if (spec.key === "lfoto" || spec.key === "ratio") return false;
  if (spec.detents.length && spec.detents.includes(0.5) && spec.min < 0) return Math.abs(n - 0.5) < 0.01;
  if (spec.key === "cut") return n <= 0.001;
  if (spec.min === 0 && (spec.unit === "pct" || spec.unit === "none") && ["drive", "crush", "echo", "send", "duck", "lfo", "fm", "env", "build", "noise", "reverb", "detune", "sub", "drift", "glide", "spread", "open", "start", "gate", "keys", "reverse", "res"].includes(spec.key)) return n <= 0.001;
  if (spec.key === "glide") return n <= 0.001;
  return false;
}

/** Where a knob's ring starts: the centre for knobs that go both ways (pan, eq, tone, tune), else the bottom. */
export const ringFrom = (spec: { min: number; detents: readonly number[] }) => (spec.min < 0 && spec.detents.includes(0.5) ? 0.5 : 0);

/** Everything a Knob needs to bind its colour to its picture and stay dark until used. */
export const bind = (spec: { key: string; min: number; detents: readonly number[]; unit: string; curve: string }, n: number) => ({
  ring: picColor(spec.key),
  idle: isIdle(spec, n),
  ringFrom: ringFrom(spec),
});
