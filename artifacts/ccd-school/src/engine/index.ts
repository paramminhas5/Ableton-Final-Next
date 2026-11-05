/**
 * The CCD engine, from the UI's side. One API whether the sound comes from
 * WebAssembly in the browser or from native code in the iOS/Android app.
 */
import { BASS_PARAMS, CMD, DRUM_PAD_PARAMS, INSTRUMENT, INSTRUMENT_BASE, LAYER_PARAMS, type InstrumentName } from "./params.gen";
import type { EngineEvent, EngineHost } from "./host";
import { NativeHost, isTauri } from "./native-host";
import { WasmHost } from "./wasm-host";

export * from "./params.gen";
export * from "./format";
export * from "./mix";
export type { EngineEvent, EngineHost, HostInfo } from "./host";

export type NoteEvent = { note: number; vel: number; start: number; len: number };

/** Wire index of a param, by id. Drum pad params need the pad. */
export function paramIndex(id: string, pad = 0): number {
  const l = LAYER_PARAMS.find(p => p.id === id);
  if (l) return l.index;
  const b = BASS_PARAMS.find(p => p.id === id);
  if (b) return b.index;
  const d = DRUM_PAD_PARAMS.find(p => p.id === id);
  if (d) return INSTRUMENT_BASE + pad * DRUM_PAD_PARAMS.length + d.index;
  throw new Error(`unknown param ${id}`);
}

export class Engine {
  constructor(readonly host: EngineHost) {}

  start() {
    return this.host.start();
  }
  private s(kind: number, layer = 0, a = 0, x = 0, y = 0, z = 0) {
    this.host.send(kind, layer, a, x, y, z);
  }

  instrument(layer: number, inst: InstrumentName) {
    this.s(CMD.instrument, layer, INSTRUMENT[inst]);
  }
  /** `n` is normalised 0..1. */
  param(layer: number, index: number, n: number) {
    this.s(CMD.param, layer, index, n);
  }
  /** Replace a layer's events. Swapped in atomically on the audio thread. */
  pattern(layer: number, events: NoteEvent[]) {
    this.s(CMD.evClear, layer);
    for (const e of events) this.s(CMD.evAdd, layer, e.note, e.vel, e.start, e.len);
    this.s(CMD.evCommit, layer);
  }
  noteOn(layer: number, note: number, vel: number, at?: number) {
    this.host.note(true, layer, note, vel, at);
  }
  noteOff(layer: number, note: number, at?: number) {
    this.host.note(false, layer, note, 0, at);
  }
  /** Hold a pad to roll: hits land on the grid, `beats` apart (0.25 = 1/16, 0.125 = 1/32). */
  repeat(layer: number, note: number, vel: number, beats: number) {
    this.s(CMD.repeat, layer, note, vel, beats);
  }
  /** Load a mono sample into slot 0..15 of a sampler layer. Returns false on hosts that cannot. */
  loadSample(layer: number, slot: number, data: Float32Array, rate: number) {
    if (!this.host.loadSample) return false;
    this.host.loadSample(layer, slot, data, rate);
    return true;
  }
  repeatOff(layer: number, note: number) {
    this.s(CMD.repeat, layer, note, 0, 0);
  }
  /** Web only: the context and the bus everything plays through (null before start or off the web). */
  audio() {
    return this.host.audio?.() ?? null;
  }
  /** Record what you hear (engine plus anything on the bus) until the returned stop is called. */
  recordOutput(): { stop: () => Promise<Blob> } | null {
    const a = this.audio();
    if (!a || typeof MediaRecorder === "undefined") return null;
    const dest = a.ctx.createMediaStreamDestination();
    a.out.connect(dest);
    const rec = new MediaRecorder(dest.stream);
    const parts: Blob[] = [];
    rec.ondataavailable = e => { if (e.data.size) parts.push(e.data); };
    rec.start();
    return {
      stop: () => new Promise<Blob>(res => { rec.onstop = () => { a.out.disconnect(dest); res(new Blob(parts, { type: rec.mimeType })); }; rec.stop(); }),
    };
  }
  play() {
    this.s(CMD.play);
  }
  stop() {
    this.s(CMD.stop);
  }
  /** Start recording. With the transport stopped, counts in for `countIn` beats first. */
  record(countIn = 4) {
    this.s(CMD.record, 0, countIn);
  }
  recordOff() {
    this.s(CMD.recordOff);
  }
  tempo(bpm: number) {
    this.s(CMD.tempo, 0, 0, 0, bpm);
    this.host.setTempo?.(bpm);
  }
  /** 0 to 0.75: how late the off-beat 16ths land */
  swing(amount: number) {
    this.s(CMD.swing, 0, 0, 0, amount);
  }
  loop(beats: number) {
    this.s(CMD.loop, 0, 0, 0, beats);
  }
  /** `layer` ducks under hits on `src` (note -1 = any note). src -1 turns it off. */
  duck(layer: number, src: number, note = -1) {
    this.s(CMD.duck, layer, src < 0 ? 0xffffffff : src, note);
  }
  metronome(on: boolean) {
    this.s(CMD.metronome, 0, on ? 1 : 0);
  }
  allOff(layer: number) {
    this.s(CMD.allOff, layer);
  }
  /** Master param by MASTER_PARAMS index, `n` normalised 0..1. */
  master(index: number, n: number) {
    this.s(CMD.master, 0, index, n);
  }
  /** Remember every layer's mix and the master as "before", for compare. */
  snapshot() {
    this.s(CMD.snapshot);
  }
  /** Hold to compare: true plays the snapshot, false the mix as it is now. */
  compare(on: boolean) {
    this.s(CMD.compare, 0, on ? 1 : 0);
  }
  /** Meters, loudness and clash detection, reported about 30 times a second. */
  analyse(on: boolean) {
    this.s(CMD.analyse, 0, on ? 1 : 0);
  }
  on(fn: (e: EngineEvent[]) => void) {
    return this.host.subscribe(fn);
  }
}

let shared: Engine | null = null;

/** The app's engine. Native inside the iOS/Android app, WebAssembly in a browser. */
export function getEngine(): Engine {
  if (!shared) shared = new Engine(isTauri() ? new NativeHost() : new WasmHost());
  return shared;
}
