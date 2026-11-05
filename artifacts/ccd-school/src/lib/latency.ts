/**
 * Play-in timing that forgives the device, not the player. Phones and bluetooth headphones play the click
 * late, so a learner who taps perfectly with what they hear lands every hit late by the same amount.
 * When every hit in a take is late by about the same amount, that's the device: we learn it, take it out of
 * this take and every take after, and say so. Stored per browser in "ccd.latencyMs".
 */
const KEY = "ccd.latencyMs";

export function readLatencyMs(): number {
  try { const v = Number(localStorage.getItem(KEY)); return Number.isFinite(v) ? Math.max(0, Math.min(400, v)) : 0; } catch { return 0; }
}
export function saveLatencyMs(ms: number) {
  try { localStorage.setItem(KEY, String(Math.round(Math.max(0, Math.min(400, ms))))); } catch { /* storage blocked */ }
}

/**
 * A steady delay hidden in a take: offsets from the nearest beat (in beats). Returns the shift to take out
 * (in beats, positive = hits were late), or 0 when the hits don't agree (that's the player, not the device).
 * Needs three hits or more, all late, within a small spread, and later than `tol` on average.
 */
export function steadyDelay(offsets: number[], tol: number): number {
  if (offsets.length < 3) return 0;
  const s = [...offsets].sort((a, b) => a - b);
  const med = s[Math.floor(s.length / 2)];
  const spread = s[s.length - 1] - s[0];
  if (s[0] <= 0.02 || spread > 0.14 || med < tol * 0.6 || med > 0.45) return 0;
  return med;
}

export const beatsToMs = (beats: number, bpm: number) => (beats * 60_000) / bpm;
export const msToBeats = (ms: number, bpm: number) => (ms * bpm) / 60_000;
