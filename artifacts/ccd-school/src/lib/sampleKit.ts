/**
 * Sounds for the sampler lessons: the recorded hits (public/audio/real), a one-bar drum loop made from them
 * "recorded at 120 bpm" (for warping), cutting a sound into slices, and recording from the microphone.
 * Everything stays in this browser.
 */
import { decodeFile } from "./samples";

export type Rec = { data: Float32Array; rate: number };
export const LOOP_BPM = 120;

const cache = new Map<string, Promise<Rec | null>>();
/** One of the recorded hits: kick, clap, hat or snare. */
export function builtin(name: "kick" | "clap" | "hat" | "snare"): Promise<Rec | null> {
  if (!cache.has(name)) cache.set(name, fetch(`/audio/real/${name}.wav`).then(r => (r.ok ? r.blob().then(decodeFile) : null)).catch(() => null));
  return cache.get(name)!;
}

/** Mix hits into one bar at `bpm`: kick on every beat, clap on 2 and 4, hats on the offbeats. Pure. */
export function mixLoop(hits: { kick: Rec; clap: Rec; hat: Rec }, bpm = LOOP_BPM): Rec {
  const rate = hits.kick.rate;
  const beat = (60 / bpm) * rate;
  const out = new Float32Array(Math.round(beat * 4));
  const put = (r: Rec, at: number, gain: number) => {
    const step = r.rate / rate;
    for (let i = 0; at + i < out.length; i++) { const j = Math.floor(i * step); if (j >= r.data.length) break; out[at + i] += r.data[j] * gain; }
  };
  for (let b = 0; b < 4; b++) {
    put(hits.kick, Math.round(b * beat), 0.8);
    put(hits.hat, Math.round((b + 0.5) * beat), 0.45);
    if (b % 2 === 1) put(hits.clap, Math.round(b * beat), 0.6);
  }
  let peak = 0;
  for (const v of out) peak = Math.max(peak, Math.abs(v));
  if (peak > 0.95) for (let i = 0; i < out.length; i++) out[i] *= 0.95 / peak;
  return { data: out, rate };
}

export async function drumLoop(): Promise<Rec | null> {
  const [kick, clap, hat] = await Promise.all([builtin("kick"), builtin("clap"), builtin("hat")]);
  return kick && clap && hat ? mixLoop({ kick, clap, hat }) : null;
}

/** Cut a sound into `n` equal slices, each with a 2 ms fade so the cuts don't click. Pure. */
export function slices(r: Rec, n: number): Rec[] {
  const len = Math.floor(r.data.length / n);
  const fade = Math.max(1, Math.round(r.rate * 0.002));
  return Array.from({ length: n }, (_, k) => {
    const d = r.data.slice(k * len, (k + 1) * len);
    for (let i = 0; i < fade && i < d.length; i++) { d[i] *= i / fade; d[d.length - 1 - i] *= i / fade; }
    return { data: d, rate: r.rate };
  });
}

/** Trim silence from the start (below about -40 dB). Pure. */
export function trimStart(r: Rec): Rec {
  let i = 0;
  while (i < r.data.length && Math.abs(r.data[i]) < 0.01) i++;
  return { data: r.data.slice(Math.max(0, i - Math.round(r.rate * 0.003))), rate: r.rate };
}

/** Record from the microphone for `ms` milliseconds. Rejects if there is no mic or no permission. */
export async function recordMic(ms = 2000): Promise<Rec> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  try {
    const rec = new MediaRecorder(stream);
    const parts: Blob[] = [];
    rec.ondataavailable = e => { if (e.data.size) parts.push(e.data); };
    const done = new Promise<void>(res => { rec.onstop = () => res(); });
    rec.start();
    await new Promise(r => setTimeout(r, ms));
    rec.stop();
    await done;
    return trimStart(await decodeFile(new Blob(parts, { type: rec.mimeType })));
  } finally {
    stream.getTracks().forEach(t => t.stop());
  }
}
