"use client";
/**
 * Offline renders through the same engine you hear: a second copy of the WebAssembly engine on this
 * thread (as the wav export does, src/lib/bounce.ts). Used to level-match a/b (touch and hear, item 3)
 * and to hear and score "match this sound" (item 13). One part, soloed, a bar or two.
 */
import { Engine } from "@/engine";
import { syncEngine } from "@/components/m1/useEngineTrack";
import { OfflineHost, type Wasm } from "./bounce";
import type { LayerV2, TrackV2 } from "./track2";

export const OFFLINE_SR = 48_000;
const BLOCK = 512;

let mod: Promise<WebAssembly.Module> | null = null;
/** Compiled once per page; each render gets its own instance. */
function wasmModule(bytes?: ArrayBuffer | Uint8Array<ArrayBuffer>): Promise<WebAssembly.Module> {
  if (bytes) return WebAssembly.compile(bytes);
  if (!mod) mod = fetch("/engine/ccd_engine.wasm").then(r => r.arrayBuffer()).then(b => WebAssembly.compile(b));
  return mod;
}

export type Rendered = { l: Float32Array; r: Float32Array; lufs: number; sr: number };

/**
 * Render one part of a song on its own: `layer` as given (its params and routes), the song's tempo, from
 * the top for `beats` beats plus `tail` seconds. The master chain is the song's.
 */
export async function renderPart(song: TrackV2, layer: LayerV2, beats = 4, tail = 0.4, wasm?: ArrayBuffer | Uint8Array<ArrayBuffer>): Promise<Rendered> {
  const m = await wasmModule(wasm);
  const inst = await WebAssembly.instantiate(m, {});
  const x = inst.exports as unknown as Wasm;
  const e = x.ccd_engine_new(OFFLINE_SR);
  try {
    const host = new OfflineHost(x, e);
    const engine = new Engine(host);
    const solo: TrackV2 = { ...song, layers: [{ ...layer, mute: false, solo: false, duck: { src: null, note: null } }], sections: undefined, loop: Math.max(song.loop, beats) };
    syncEngine(engine, solo, [], { bpm: 0, loop: 0, samples: new Set() });
    const frames = Math.ceil(((beats * 60) / solo.bpm + tail) * OFFLINE_SR);
    engine.loop(beats + (tail * solo.bpm) / 60 + 4);
    engine.play();
    const l = new Float32Array(frames), r = new Float32Array(frames);
    for (let done = 0; done < frames; done += BLOCK) {
      const n = Math.min(BLOCK, frames - done);
      x.ccd_process(e, n);
      const mem = x.memory.buffer;
      l.set(new Float32Array(mem, x.ccd_out_left(e), n), done);
      r.set(new Float32Array(mem, x.ccd_out_right(e), n), done);
    }
    const bytes = frames * 4;
    const pl = x.ccd_alloc(bytes), pr = x.ccd_alloc(bytes);
    new Float32Array(x.memory.buffer, pl, frames).set(l);
    new Float32Array(x.memory.buffer, pr, frames).set(r);
    const lufs = x.ccd_lufs(pl, pr, frames, OFFLINE_SR);
    x.ccd_dealloc(pl, bytes);
    x.ccd_dealloc(pr, bytes);
    return { l, r, lufs, sr: OFFLINE_SR };
  } finally {
    x.ccd_engine_free(e);
  }
}

/**
 * Level-match two settings of one part (Live 12.3's a/b, made fair): render both and return the trim
 * in dB for each, so both play at the quieter one's loudness and the louder one can't win.
 */
export async function levelMatch(song: TrackV2, a: LayerV2, b: LayerV2, wasm?: ArrayBuffer | Uint8Array<ArrayBuffer>): Promise<{ a: number; b: number; diff: number }> {
  const [ra, rb] = await Promise.all([renderPart(song, a, 4, 0.4, wasm), renderPart(song, b, 4, 0.4, wasm)]);
  if (!(ra.lufs > -70) || !(rb.lufs > -70)) return { a: 0, b: 0, diff: 0 };
  const diff = rb.lufs - ra.lufs;
  return diff > 0 ? { a: 0, b: -diff, diff } : { a: diff, b: 0, diff };
}
