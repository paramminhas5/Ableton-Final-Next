/**
 * Play-in timing that forgives the device, not the player. Phones and bluetooth headphones play the click
 * late, so a learner who taps perfectly with what they hear lands every hit late by the same amount.
 * When every hit in a take is late by about the same amount, that's the device: we learn it, take it out of
 * this take and every take after, and say so. Stored per browser in "ccd.latencyMs".
 */
const KEY = "ccd.latencyMs";
/**
 * The most we ever take out as "your device". Above this a steady offset is as likely a late player as a late
 * device: a 16th late at 120 bpm is 125 ms and is a wrong answer, not latency. Slower devices get "snap it for me".
 */
export const MAX_DEVICE_MS = 80;

export function readLatencyMs(): number {
  try { const v = Number(localStorage.getItem(KEY)); return Number.isFinite(v) ? Math.max(0, Math.min(MAX_DEVICE_MS, v)) : 0; } catch { return 0; }
}
export function saveLatencyMs(ms: number) {
  try { localStorage.setItem(KEY, String(Math.round(Math.max(0, Math.min(MAX_DEVICE_MS, ms))))); } catch { /* storage blocked */ }
}

/**
 * A steady delay hidden in a take: offsets from the nearest beat (in beats). Returns the shift to take out
 * (in beats, positive = hits were late), or 0 when the hits don't agree (that's the player, not the device).
 * Needs three hits or more, all late, within a small spread, and later than `tol` on average.
 */
export function steadyDelay(offsets: number[], tol: number, maxBeats = 0.45): number {
  if (offsets.length < 3) return 0;
  const s = [...offsets].sort((a, b) => a - b);
  const med = s[Math.floor(s.length / 2)];
  const spread = s[s.length - 1] - s[0];
  if (s[0] <= 0.02 || spread > 0.14 || med < tol * 0.6 || med > Math.min(0.45, maxBeats)) return 0;
  return med;
}

export const beatsToMs = (beats: number, bpm: number) => (beats * 60_000) / bpm;
export const msToBeats = (ms: number, bpm: number) => (ms * bpm) / 60_000;

/** Where a kept hit lands: its slot (the beat, or the "and" for an off-beat goal), wrapped into the loop. */
export function slotStart(start: number, offbeat: boolean, loop: number): number {
  const b = offbeat ? Math.round(start - 0.5) + 0.5 : Math.round(start);
  return ((b % loop) + loop) % loop;
}
