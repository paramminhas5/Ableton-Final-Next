"use client";
/**
 * Export the song as a wav, rendered offline by the same engine you hear (engine 2, item 6).
 * A second copy of the WebAssembly engine runs on this thread, plays the song once from the top with
 * a short tail, then the engine brings it to the export loudness: -14 LUFS integrated by default (what
 * the big streaming services play at, so it sounds there as it did here) or -9 LUFS for club play,
 * with the true peak held under -1 dBTP by the master's limiter.
 */
import { CMD, EXPORT_LOUD_LUFS, EXPORT_LUFS } from "@/engine/params.gen";
import { Engine } from "@/engine";
import type { EngineHost, HostInfo } from "@/engine/host";
import { syncEngine } from "@/components/m1/useEngineTrack";
import { getSample } from "@/lib/samples";
import { arranged } from "@/lib/arrange";
import type { TrackV2 } from "@/lib/track2";

const SR = 48_000;
const BLOCK = 512;
const TAIL_S = 2.5;

export type Wasm = {
  memory: WebAssembly.Memory;
  ccd_engine_new(sr: number): number;
  ccd_engine_free(e: number): void;
  ccd_send(e: number, kind: number, layer: number, a: number, x: number, y: number, z: number): number;
  ccd_process(e: number, frames: number): void;
  ccd_out_left(e: number): number;
  ccd_out_right(e: number): number;
  ccd_alloc(bytes: number): number;
  ccd_dealloc(p: number, bytes: number): void;
  ccd_sample_load(e: number, layer: number, slot: number, data: number, frames: number, rate: number): void;
  ccd_normalise(l: number, r: number, frames: number, sr: number, target: number, report: number): number;
  ccd_lufs(l: number, r: number, frames: number, sr: number): number;
};

/** Commands go straight into the offline engine, in order. */
export class OfflineHost implements EngineHost {
  readonly name = "web" as const;
  constructor(private x: Wasm, private e: number) {}
  start() { return Promise.resolve(); }
  send(kind: number, layer: number, a: number, x: number, y: number, z: number) {
    // A full queue: let the stopped engine take what is waiting (one silent sample), then send again.
    if (!this.x.ccd_send(this.e, kind, layer, a, x, y, z)) {
      this.x.ccd_process(this.e, 1);
      this.x.ccd_send(this.e, kind, layer, a, x, y, z);
    }
  }
  note(on: boolean, layer: number, note: number, vel: number) { this.send(on ? CMD.noteOn : CMD.noteOff, layer, note, vel, -1, 0); }
  subscribe() { return () => {}; }
  info(): HostInfo { return { kind: "web", sampleRate: SR, bufferFrames: BLOCK, outputLatency: 0, load: 0 }; }
  loadSample(layer: number, slot: number, data: Float32Array, rate: number) {
    const p = this.x.ccd_alloc(data.length * 4);
    new Float32Array(this.x.memory.buffer, p, data.length).set(data);
    this.x.ccd_sample_load(this.e, layer, slot, p, data.length, rate);
    this.x.ccd_dealloc(p, data.length * 4);
  }
  stop() { return Promise.resolve(); }
}

export type Bounce = { wav: Blob; lufs: number; truePeakDb: number; gainDb: number; limited: boolean; seconds: number };

/** Render the song and bring it to the export loudness. `loud` is the club target. */
export async function bounce(track: TrackV2, loud = false, wasm?: ArrayBuffer | Uint8Array<ArrayBuffer>): Promise<Bounce> {
  const bytes: BufferSource = wasm ?? (await fetch("/engine/ccd_engine.wasm").then(r => r.arrayBuffer()));
  const { instance } = await WebAssembly.instantiate(bytes, {});
  const x = instance.exports as unknown as Wasm;
  const e = x.ccd_engine_new(SR);
  try {
    const host = new OfflineHost(x, e);
    const engine = new Engine(host);
    // Samples first, awaited, so the render never starts without them.
    const samples = new Set<string>();
    await Promise.all(track.layers.flatMap((l, index) => Object.keys(l.samples ?? {}).map(async s => {
      samples.add(`${index}:${l.id}:${s}`);
      const r = await getSample(l.id, Number(s));
      if (r) host.loadSample(index, Number(s), r.data, r.rate);
    })));
    syncEngine(engine, track, [], { bpm: 0, loop: 0, samples });
    const t = arranged(track);
    const seconds = (t.loop * 60) / t.bpm + TAIL_S;
    const frames = Math.ceil(seconds * SR);
    // The tail rings out after the last bar: the loop is not played twice.
    host.send(CMD.loop, 0, 0, 0, t.loop + (TAIL_S * t.bpm) / 60 + 4, 0);
    engine.play();
    const bytesPer = frames * 4;
    const pl = x.ccd_alloc(bytesPer);
    const pr = x.ccd_alloc(bytesPer);
    const rep = x.ccd_alloc(16);
    for (let done = 0; done < frames; done += BLOCK) {
      const n = Math.min(BLOCK, frames - done);
      x.ccd_process(e, n);
      const mem = x.memory.buffer;
      new Float32Array(mem, pl + done * 4, n).set(new Float32Array(mem, x.ccd_out_left(e), n));
      new Float32Array(mem, pr + done * 4, n).set(new Float32Array(mem, x.ccd_out_right(e), n));
      // Let the page breathe on long songs.
      if ((done / BLOCK) % 400 === 399) await new Promise(r => setTimeout(r, 0));
    }
    x.ccd_normalise(pl, pr, frames, SR, loud ? EXPORT_LOUD_LUFS : EXPORT_LUFS, rep);
    const mem = x.memory.buffer;
    const [gainDb, lufs, truePeakDb, limited] = Array.from(new Float32Array(mem, rep, 4));
    const wav = encodeWav(new Float32Array(mem, pl, frames), new Float32Array(mem, pr, frames));
    x.ccd_dealloc(pl, bytesPer);
    x.ccd_dealloc(pr, bytesPer);
    x.ccd_dealloc(rep, 16);
    return { wav, lufs, truePeakDb, gainDb, limited: limited > 0, seconds };
  } finally {
    x.ccd_engine_free(e);
  }
}

/** 48 kHz, 16 bit stereo, with triangular dither so quiet tails fade instead of crackling. */
export function encodeWav(l: Float32Array, r: Float32Array): Blob {
  const n = l.length;
  const buf = new ArrayBuffer(44 + n * 4);
  const v = new DataView(buf);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); str(8, "WAVE"); str(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, SR, true);
  v.setUint32(28, SR * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, n * 4, true);
  const q = (s: number) => Math.max(-32768, Math.min(32767, Math.round(s * 32767 + (Math.random() - Math.random()))));
  for (let i = 0; i < n; i++) {
    v.setInt16(44 + i * 4, q(l[i]), true);
    v.setInt16(46 + i * 4, q(r[i]), true);
  }
  return new Blob([buf], { type: "audio/wav" });
}

/** Render, then save it as "<name>.wav". */
export async function downloadWav(track: TrackV2, loud = false, name = "ccd-song"): Promise<Bounce> {
  const b = await bounce(track, loud);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(b.wav);
  a.download = `${name}${loud ? "-loud" : ""}.wav`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  return b;
}
