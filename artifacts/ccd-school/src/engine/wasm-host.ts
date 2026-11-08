/**
 * Web host: the Rust engine as WebAssembly inside an AudioWorklet.
 * Asks for the smallest buffer the browser allows, and maps touch times onto the
 * audio clock so recorded notes land where they were played.
 */
import { CMD } from "./params.gen";
import { unpackEvents, type EngineEvent, type EngineHost, type HostInfo } from "./host";

const WASM_URL = "/engine/ccd_engine.wasm";
const WORKLET_URL = "/engine/ccd-worklet.js";

export class WasmHost implements EngineHost {
  readonly name = "web" as const;
  ctx: AudioContext | null = null;
  private node: AudioWorkletNode | null = null;
  private queue: number[] = [];
  private flushing = false;
  private subs = new Set<(e: EngineEvent[]) => void>();
  private load = 0;
  private starting: Promise<void> | null = null;

  start(): Promise<void> {
    if (!this.starting) this.starting = this.boot();
    return this.starting;
  }

  /**
   * A page that asks for the engine before anyone has touched it (a lesson step that plays on arrival) waits for
   * the first touch or key, or three seconds, before downloading and compiling it: the browser keeps the audio
   * asleep until a touch anyway, and on a slow phone the download would compete with the page itself.
   */
  private firstTouch(): Promise<void> {
    const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (!ua || ua.hasBeenActive) return Promise.resolve();
    return new Promise(res => {
      const go = () => { clearTimeout(t); removeEventListener("pointerdown", go, true); removeEventListener("keydown", go, true); res(); };
      const t = setTimeout(go, 3000);
      addEventListener("pointerdown", go, true);
      addEventListener("keydown", go, true);
    });
  }

  private async boot() {
    await this.firstTouch();
    // latencyHint 0 asks for the smallest buffer the device supports.
    const ctx = new AudioContext({ latencyHint: 0 });
    this.ctx = ctx;
    // Resume inside the user's gesture; iOS will not start audio later.
    void ctx.resume();
    const [bytes] = await Promise.all([fetch(WASM_URL).then(r => r.arrayBuffer()), ctx.audioWorklet.addModule(WORKLET_URL)]);
    const node = new AudioWorkletNode(ctx, "ccd-engine", { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2] });
    node.connect(ctx.destination);
    const ready = new Promise<void>((res, rej) => {
      node.port.onmessage = (m: MessageEvent) => {
        const d = m.data;
        if (d.t === "ready") res();
        else if (d.t === "error") rej(new Error(d.message));
        else if (d.t === "ev") {
          const evs = unpackEvents(d.e as Float64Array);
          for (const fn of this.subs) fn(evs);
        } else if (d.t === "load") this.load = d.ms / 10; // ms per second -> %
        else if (d.t === "scope") for (const fn of this.scopes) fn(d.x as Float32Array);
        else if (d.t === "mods") for (const w of this.modSubs) w.fn(d.x as Float32Array);
      };
    });
    // Compiled inside the worklet: Chrome cannot hand a compiled module across.
    node.port.postMessage({ t: "init", bytes }, [bytes]);
    this.node = node;
    await ready;
    if (this.scopes.size) node.port.postMessage({ t: "scope", on: true });
    if (this.modSubs.size) this.tellMods();
    if (ctx.state !== "running") await ctx.resume();
    if (this.queue.length) this.flush();
  }

  /** Resume after a gesture (iOS and Chrome keep audio suspended until one). */
  async unlock() {
    await this.start();
    if (this.ctx && this.ctx.state !== "running") await this.ctx.resume();
  }

  send(kind: number, layer: number, a: number, x: number, y: number, z: number) {
    this.queue.push(kind, layer, a, x, y, z);
    if (!this.flushing) {
      this.flushing = true;
      queueMicrotask(() => this.flush());
    }
  }

  private flush() {
    this.flushing = false;
    if (!this.node || !this.queue.length) return;
    const c = new Float64Array(this.queue);
    this.queue = [];
    this.node.port.postMessage({ t: "cmds", c }, [c.buffer]);
  }

  loadSample(layer: number, slot: number, data: Float32Array, rate: number) {
    this.flush();
    const copy = new Float32Array(data);
    const send = () => this.node?.port.postMessage({ t: "sample", layer, slot, rate, data: copy }, [copy.buffer]);
    if (this.node) send();
    else void this.start().then(send);
  }

  note(on: boolean, layer: number, note: number, vel: number, at?: number) {
    // Wall-clock time of the touch. The worklet compares it with its own Date.now().
    const t = at === undefined ? -1 : Date.now() - (performance.now() - at);
    this.queue.push(on ? CMD.noteOn : CMD.noteOff, layer, note, vel, t, 0);
    this.flush(); // notes go now, not on the next microtask
  }

  private scopes = new Set<(x: Float32Array) => void>();
  /** The engine's scope ring, about 30 times a second while anyone listens. */
  scope(fn: (x: Float32Array) => void) {
    this.scopes.add(fn);
    // Never starts the engine itself (that waits for a touch); boot tells the worklet if anyone is listening.
    const tell = () => this.node?.port.postMessage({ t: "scope", on: this.scopes.size > 0 });
    tell();
    return () => { this.scopes.delete(fn); tell(); };
  }

  private modSubs = new Set<{ fps: number; fn: (v: Float32Array) => void }>();
  private tellMods() {
    const fps = Math.max(0, ...[...this.modSubs].map(w => w.fps));
    this.node?.port.postMessage({ t: "mods", on: this.modSubs.size > 0, fps });
  }
  /** Live modulation values, `fps` times a second while anyone watches (the fastest watcher sets the rate). */
  mods(fps: number, fn: (v: Float32Array) => void) {
    const w = { fps, fn };
    this.modSubs.add(w);
    this.tellMods();
    return () => { this.modSubs.delete(w); this.tellMods(); };
  }

  subscribe(fn: (e: EngineEvent[]) => void) {
    this.subs.add(fn);
    return () => this.subs.delete(fn);
  }

  /** The engine and anything else on the page meet at `out`, which goes to the speakers (and to a recorder). */
  private bus: GainNode | null = null;
  audio(): { ctx: AudioContext; out: AudioNode } | null {
    if (!this.ctx || !this.node) return null;
    if (!this.bus) { this.bus = this.ctx.createGain(); this.node.disconnect(); this.node.connect(this.bus); this.bus.connect(this.ctx.destination); }
    return { ctx: this.ctx, out: this.bus };
  }

  info(): HostInfo {
    const ctx = this.ctx;
    return {
      kind: "web",
      sampleRate: ctx?.sampleRate ?? 48000,
      bufferFrames: ctx ? Math.round((ctx.baseLatency || 128 / ctx.sampleRate) * ctx.sampleRate) : 128,
      outputLatency: ctx?.outputLatency ?? 0,
      load: this.load,
    };
  }

  async stop() {
    this.node?.disconnect();
    this.bus = null;
    await this.ctx?.close();
    this.ctx = null;
    this.node = null;
    this.starting = null;
  }
}
