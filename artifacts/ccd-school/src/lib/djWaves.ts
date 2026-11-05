/**
 * Frequency-coloured waveforms for the dj decks (rekordbox's 3-band view; djay and Serato colour the
 * same way): low red, mid green, high blue, four bins a beat. Every source is measured on real audio,
 * once, and kept:
 * - bank tracks: rendered through the native engine offline (scripts/dj-waves.ts), per stem;
 * - your song: rendered in the browser through the same WebAssembly engine, off the audio thread's
 *   clock, and cached by the song's content;
 * - your files: measured from the decoded audio.
 * The same two crossovers everywhere (220 Hz and 2.6 kHz, two one-poles each).
 */
import WAVES from "@/content/djWaves.gen.json";
import type { TrackV2 } from "./track2";

export type Bands = { perBeat: number; beats: number; low: Float32Array; mid: Float32Array; high: Float32Array };

const fromByte = (b: number) => (b <= 0 ? 0 : Math.pow(10, ((b / 255) * 54 - 54) / 20));
const unpack = (s: string) => { const bin = atob(s); const out = new Float32Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = fromByte(bin.charCodeAt(i)); return out; };
const cache = new Map<string, Float32Array[]>();

/** A bank track's bands with the stems that are in (power-summed), as the engine renders it. */
export function bankBands(id: string, stems: Partial<Record<"drums" | "hats" | "bass", boolean>> = {}): Bands | null {
  const t = (WAVES.tracks as Record<string, Record<string, string[]>>)[id];
  if (!t) return null;
  const n = WAVES.beats * WAVES.perBeat;
  const sum = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
  for (const [stem, bands] of Object.entries(t)) {
    if (stems[stem as "drums"] === false) continue;
    const key = `${id}:${stem}`;
    if (!cache.has(key)) cache.set(key, bands.map(unpack));
    const b = cache.get(key)!;
    for (let k = 0; k < 3; k++) for (let i = 0; i < n; i++) sum[k][i] += b[k][i] * b[k][i];
  }
  for (const a of sum) for (let i = 0; i < n; i++) a[i] = Math.sqrt(a[i]);
  return { perBeat: WAVES.perBeat, beats: WAVES.beats, low: sum[0], mid: sum[1], high: sum[2] };
}

/** Measure mono audio into bands: `beats` beats at `bpm`, from the start. */
export function analyse(x: Float32Array, sr: number, bpm: number, beats: number, perBeat = 4, skip = 0): Bands {
  const lp = (fc: number) => 1 - Math.exp((-2 * Math.PI * fc) / sr);
  const al = lp(220), ah = lp(2600);
  let l1 = 0, l2 = 0, h1 = 0, h2 = 0;
  const bins = Math.max(1, Math.round(beats * perBeat));
  const per = (sr * 60) / bpm / perBeat;
  const acc = [new Float64Array(bins), new Float64Array(bins), new Float64Array(bins)];
  const cnt = new Uint32Array(bins);
  for (let i = 0; i < x.length; i++) {
    const v = x[i];
    l1 += al * (v - l1); l2 += al * (l1 - l2);
    h1 += ah * (v - h1); h2 += ah * (h1 - h2);
    if (i < skip) continue;
    const b = Math.floor((i - skip) / per);
    if (b >= bins) break;
    const low = l2, high = v - h2, mid = h2 - l2;
    acc[0][b] += low * low; acc[1][b] += mid * mid; acc[2][b] += high * high; cnt[b]++;
  }
  const out = acc.map(a => Float32Array.from(a, (s, i) => Math.sqrt(s / Math.max(1, cnt[i]))));
  return { perBeat, beats: bins / perBeat, low: out[0], mid: out[1], high: out[2] };
}

// ── your song, rendered through the WebAssembly engine on the main thread ─────────────

type Wasm = { memory: WebAssembly.Memory; ccd_engine_new: (sr: number) => number; ccd_send: (e: number, k: number, l: number, a: number, x: number, y: number, z: number) => void; ccd_process: (e: number, n: number) => void; ccd_out_left: (e: number) => number; ccd_out_right: (e: number) => number };
let wasm: Promise<WebAssembly.Module> | null = null;
const songCache = new Map<string, Bands>();

/**
 * The song's bands: two passes of its loop rendered (the second measured, so tails from the end wrap
 * in as they do when it plays), in slices so the page stays responsive. Cached by the song's sound.
 */
export async function songBands(song: TrackV2, cmds: (send: (kind: number, layer: number, a: number, x: number, y: number, z: number) => void) => void): Promise<Bands> {
  const key = JSON.stringify([song.bpm, song.loop, song.swing, song.layers.map(l => [l.type, l.events, l.params, l.mute])]);
  const hit = songCache.get(key);
  if (hit) return hit;
  wasm ??= fetch("/engine/ccd_engine.wasm").then(r => r.arrayBuffer()).then(b => WebAssembly.compile(b));
  const inst = (await WebAssembly.instantiate(await wasm, {})) as unknown as { exports: Wasm };
  const x = inst.exports;
  const sr = 24000;
  const e = x.ccd_engine_new(sr);
  cmds((k, l, a, xx, y, z) => x.ccd_send(e, k, l, a, xx, y, z));
  const loop = song.loop || 4;
  const spb = (sr * 60) / song.bpm;
  const total = Math.round(spb * loop * 2);
  const buf = new Float32Array(total);
  let done = 0;
  while (done < total) {
    const until = Math.min(total, done + sr); // one second of audio per slice
    while (done < until) {
      const n = Math.min(256, total - done);
      x.ccd_process(e, n);
      const L = new Float32Array(x.memory.buffer, x.ccd_out_left(e), n), R = new Float32Array(x.memory.buffer, x.ccd_out_right(e), n);
      for (let i = 0; i < n; i++) buf[done + i] = 0.5 * (L[i] + R[i]);
      done += n;
    }
    await new Promise(r => setTimeout(r, 0));
  }
  const b = analyse(buf, sr, song.bpm, loop, 4, Math.round(spb * loop));
  songCache.set(key, b);
  return b;
}

/** Bins of a band at a deck's track beat, tiled when the source is shorter than the window. */
export const at = (a: Float32Array, perBeat: number, beat: number) => a[((Math.floor(beat * perBeat) % a.length) + a.length) % a.length];
