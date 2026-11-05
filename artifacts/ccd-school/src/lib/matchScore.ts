/**
 * "Match this sound" (touch and hear, item 13; Syntorial's method on our own instruments): how close the
 * learner's sound is to a hidden target, from both the sound and the settings. Both are rendered offline
 * through the same engine (src/lib/offline.ts); this file compares the renders. Pure, so it is tested.
 *
 * - Spectrum: the average power in 32 bands from 30 Hz to 16 kHz (2048-point frames, half overlapped,
 *   Hann), in dB; the mean difference over the bands that matter (within 50 dB of the target's loudest).
 * - Envelope: the level in 10 ms frames, in dB (floored at -60 dBFS); the mean difference where either
 *   is above the floor. This hears decay and attack, which the average spectrum can't.
 * - Settings: how far each lit knob is from the target's, in shares of its travel.
 * Close = 70% sound, 30% settings: two settings can sound alike, and the ear is what is being trained.
 */

export type Features = { bands: Float32Array; env: Float32Array };

const BANDS = 32;
const F_LO = 30, F_HI = 16_000;

function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
}

/** What the score compares, from a mono render at `sr`. */
export function features(x: Float32Array, sr: number): Features {
  const N = 2048, hop = 1024;
  const pow = new Float64Array(N / 2);
  const win = Float64Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
  let frames = 0;
  for (let at = 0; at + N <= x.length; at += hop) {
    const re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = x[at + i] * win[i];
    fft(re, im);
    for (let k = 0; k < N / 2; k++) pow[k] += re[k] * re[k] + im[k] * im[k];
    frames++;
  }
  const bands = new Float32Array(BANDS);
  for (let b = 0; b < BANDS; b++) {
    const f0 = F_LO * Math.pow(F_HI / F_LO, b / BANDS), f1 = F_LO * Math.pow(F_HI / F_LO, (b + 1) / BANDS);
    const k0 = Math.max(1, Math.floor((f0 * N) / sr)), k1 = Math.max(k0, Math.min(N / 2 - 1, Math.ceil((f1 * N) / sr) - 1));
    let p = 0;
    for (let k = k0; k <= k1; k++) p += pow[k];
    bands[b] = 10 * Math.log10(Math.max(1e-12, p / Math.max(1, frames) / (N * N)));
  }
  const fl = Math.round(sr / 100);
  const env = new Float32Array(Math.floor(x.length / fl));
  for (let f = 0; f < env.length; f++) {
    let s = 0;
    for (let i = f * fl; i < (f + 1) * fl; i++) s += x[i] * x[i];
    env[f] = Math.max(-60, 10 * Math.log10(Math.max(1e-12, s / fl)));
  }
  return { bands, env };
}

/** Mean dB difference of the spectra over the bands that matter, and of the envelopes where either sounds. */
export function distances(target: Features, mine: Features): { spectrum: number; envelope: number } {
  const top = Math.max(...target.bands);
  let sd = 0, sn = 0;
  for (let b = 0; b < target.bands.length; b++) {
    if (Math.max(target.bands[b], mine.bands[b]) < top - 50) continue;
    sd += Math.min(40, Math.abs(target.bands[b] - mine.bands[b]));
    sn++;
  }
  let ed = 0, en = 0;
  const n = Math.min(target.env.length, mine.env.length);
  for (let f = 0; f < n; f++) {
    if (target.env[f] <= -59.9 && mine.env[f] <= -59.9) continue;
    ed += Math.min(40, Math.abs(target.env[f] - mine.env[f]));
    en++;
  }
  return { spectrum: sn ? sd / sn : 0, envelope: en ? ed / en : 0 };
}

export type Score = { close: number; sound: number; settings: number; spectrum: number; envelope: number; worstKnob: number };

/** Pass mark: this close or closer keeps it. */
export const MATCH_PASS = 85;

/**
 * The closeness, 0..100. `knobs` are the lit knobs' values, normalised, mine and the target's.
 * Sound: a mean 9 dB off across the spectrum, or 9 dB off in level over time, takes it to nothing.
 */
export function score(target: Features, mine: Features, knobs: { mine: number; target: number }[]): Score {
  const d = distances(target, mine);
  const sound = Math.max(0, 1 - (0.5 * d.spectrum) / 9 - (0.5 * d.envelope) / 9);
  const off = knobs.length ? knobs.reduce((a, k) => a + Math.abs(k.mine - k.target), 0) / knobs.length : 0;
  const settings = Math.max(0, 1 - off * 2.5);
  const close = Math.round(100 * (0.7 * sound + 0.3 * settings));
  const worstKnob = knobs.reduce((a, k) => Math.max(a, Math.abs(k.mine - k.target)), 0);
  return { close, sound: Math.round(sound * 100), settings: Math.round(settings * 100), spectrum: d.spectrum, envelope: d.envelope, worstKnob };
}

/** How far any one lit knob may sit from the target's (share of its travel) and still pass. */
export const KNOB_TOL = 0.08;
/** A match passes when it is close overall and every lit knob is near the target: one knob right is not a match. */
export const passes = (s: Score | null) => !!s && s.close >= MATCH_PASS && s.worstKnob <= KNOB_TOL;

/** Mono from a stereo render. */
export const mono = (l: Float32Array, r: Float32Array) => Float32Array.from(l, (v, i) => 0.5 * (v + r[i]));

/** Words for which way a knob should go, by its key: "longer", "higher", "brighter". */
export function which(key: string, up: boolean): string {
  const w: Record<string, [string, string]> = {
    decay: ["longer", "shorter"], release: ["longer", "shorter"], attack: ["slower", "faster"], ring: ["longer", "shorter"],
    tune: ["higher", "lower"], cutoff: ["brighter", "darker"], env: ["more", "less"], res: ["more ring", "less ring"],
    drive: ["more", "less"], level: ["louder", "quieter"], glide: ["longer", "shorter"], detune: ["wider", "narrower"],
  };
  const p = w[key];
  return p ? (up ? p[0] : p[1]) : up ? "up" : "down";
}
