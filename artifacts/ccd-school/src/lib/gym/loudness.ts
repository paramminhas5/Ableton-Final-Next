/**
 * Loudness matching for A/B clips (PRD EG-2: level is never the giveaway).
 * RMS matching on the rendered buffers. Simple and deterministic; the PRD's
 * EBU R128 / Essentia pass is a later upgrade.
 */

export function rms(data: Float32Array): number {
  if (!data.length) return 0;
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
  return Math.sqrt(sum / data.length);
}

export function peak(data: Float32Array): number {
  let p = 0;
  for (let i = 0; i < data.length; i++) {
    const a = Math.abs(data[i]);
    if (a > p) p = a;
  }
  return p;
}

/** Gain to apply to `b` so its RMS equals `a`'s, without pushing b's peak past `ceiling`. */
export function matchGain(a: Float32Array, b: Float32Array, ceiling = 0.95): number {
  const rb = rms(b);
  if (rb === 0) return 1;
  const g = rms(a) / rb;
  const pb = peak(b) * g;
  return pb > ceiling ? ceiling / peak(b) : g;
}

export function applyGain(data: Float32Array, g: number) {
  for (let i = 0; i < data.length; i++) data[i] *= g;
}
