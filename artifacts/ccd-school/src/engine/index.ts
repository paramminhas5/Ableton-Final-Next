import { readClick, CLICK_LEVEL } from "@/lib/click";
/**
 * The CCD engine, from the UI's side. One API whether the sound comes from
 * WebAssembly in the browser or from native code in the iOS/Android app.
 */
import { BASS_PARAMS, CMD, DRUM_PAD_PARAMS, INSTRUMENT, INSTRUMENT_BASE, LAYER_PARAMS, MAX_EV_LOCKS, SCOPE_OFF, type InstrumentName } from "./params.gen";
import type { EngineEvent, EngineHost } from "./host";
import { NativeHost, isTauri } from "./native-host";
import { WasmHost } from "./wasm-host";

export * from "./params.gen";
export * from "./format";
export * from "./mix";
export type { EngineEvent, EngineHost, HostInfo } from "./host";

/** `chance` 0..1 and `cond` (a trig condition: "1:2", "fill"...) decide in the engine whether a note plays
 * each time round; `it` and `reps` say which play of the part's loop it is in an arranged song. */
export type NoteEvent = { note: number; vel: number; start: number; len: number; chance?: number; cond?: string; it?: number; reps?: number; locks?: [index: number, value: number][] };

/** Trig conditions in the engine's wire order (engine/src/seq.rs, cond). */
const COND_CODE: Record<string, number> = { "1:2": 1, "2:2": 2, "1:4": 3, "2:4": 4, "3:4": 5, "4:4": 6, fill: 7, "not fill": 8 };

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
    for (const e of events) {
      this.s(CMD.evAdd, layer, e.note, e.vel, e.start, e.len);
      const cond = e.cond ? (COND_CODE[e.cond] ?? 0) : 0;
      const chance = e.chance ?? 1;
      if (cond || chance < 1) this.s(CMD.evCond, layer, cond, chance, e.it ?? 0, e.reps ?? 1);
      // P-locks: applied by the engine on the note's own sample (a negative value is the knob's own).
      if (e.locks) for (const [i, v] of e.locks.slice(0, MAX_EV_LOCKS)) this.s(CMD.evLock, layer, i, v);
    }
    this.s(CMD.evCommit, layer);
  }
  /** The song's seed for chance: the same seed plays the same chances. */
  chanceSeed(seed: number) {
    this.s(CMD.chanceSeed, 0, seed >>> 0);
  }
  /** Punch-in effect on the whole mix (PUNCH.repeat, filter, tapeStop, throw) at `amount` 0..1, while held;
   * PUNCH.off lets go and the mix fades back to exactly dry. Send again to move the amount. */
  punch(mode: number, amount = 0.5, at?: number) {
    // `at`: the touch's event.timeStamp, so a recorded press lands on the beat you heard (-1: now).
    this.s(CMD.punch, 0, mode, amount, at === undefined ? -1 : Date.now() - (performance.now() - at));
  }
  /** Punch-in automation recorded into the song: points (effect, amount, loop beat as heard), played by the
   * engine on their exact sample while the song plays. An empty list clears it. */
  punchAuto(points: { mode: number; amount: number; beat: number }[]) {
    this.s(CMD.punchClear);
    for (const p of points) this.s(CMD.punchAdd, 0, p.mode, p.amount, p.beat);
    this.s(CMD.punchCommit);
  }
  /** A part that runs free at its own length (Elektron's per-track length with no master reset). 0 follows the loop. */
  partLen(layer: number, beats: number, free: boolean) {
    this.s(CMD.partLen, layer, free && beats > 0 ? 1 : 0, 0, beats);
  }
  /**
   * Live modulation values of one part (rings that move while the sound plays): `fn` gets MOD_VALUES floats
   * (the lfo -1..1, the envelope 0..1, then each slot's knob as it plays, -1 for none) `fps` times a second.
   * Nothing is sent while nobody watches. Returns a function that stops it.
   */
  modWatch(layer: number, fps: number, fn: (v: Float32Array) => void): () => void {
    this.s(CMD.modWatch, layer, 1);
    const off = this.host.mods?.(fps, fn) ?? (() => {});
    return () => { off(); this.s(CMD.modWatch, layer, 0); };
  }
  /** The fill key: steps with the fill condition play while it is held (Elektron's fill). */
  fill(on: boolean) {
    this.s(CMD.fill, 0, on ? 1 : 0);
  }
  noteOn(layer: number, note: number, vel: number, at?: number) {
    this.host.note(true, layer, note, vel, at);
  }
  noteOff(layer: number, note: number, at?: number) {
    this.host.note(false, layer, note, 0, at);
  }
  /** Modulation slot `slot` of a layer: source `src` (MOD_SRC) onto wire param `to` by `amount` (-1..1 of its travel; 0 clears). */
  mod(layer: number, slot: number, src: number, to: number, amount: number) {
    this.s(CMD.mod, layer, slot, amount, to, src);
  }
  /** A/B level match: trim a layer by `db` after its strip (0 takes it off). Not a knob, never saved. */
  trim(layer: number, db: number) {
    this.s(CMD.trim, layer, 0, db);
  }
  /**
   * The scope: the engine keeps the last samples of part `src` (or SCOPE_MASTER) and `fn` gets them about
   * 30 times a second. Returns a function that stops it. Hosts without a scope never call `fn`.
   */
  scope(src: number, fn: (x: Float32Array) => void): () => void {
    this.s(CMD.scope, 0, src);
    const off = this.host.scope?.(fn) ?? (() => {});
    return () => { off(); this.s(CMD.scope, 0, SCOPE_OFF); };
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
  /** Click while playing (on), plus the learner's click setting: its level, and whether the count-in clicks. */
  metronome(on: boolean) {
    const m = readClick();
    this.s(CMD.metronome, 0, (on && m !== "off" ? 1 : 0) | (m === "off" ? 2 : 0), CLICK_LEVEL[m]);
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
