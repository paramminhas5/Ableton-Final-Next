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

  private async boot() {
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
      };
    });
    // Compiled inside the worklet: Chrome cannot hand a compiled module across.
    node.port.postMessage({ t: "init", bytes }, [bytes]);
    this.node = node;
    await ready;
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

  note(on: boolean, layer: number, note: number, vel: number, at?: number) {
    // Wall-clock time of the touch. The worklet compares it with its own Date.now().
    const t = at === undefined ? -1 : Date.now() - (performance.now() - at);
    this.queue.push(on ? CMD.noteOn : CMD.noteOff, layer, note, vel, t, 0);
    this.flush(); // notes go now, not on the next microtask
  }

  subscribe(fn: (e: EngineEvent[]) => void) {
    this.subs.add(fn);
    return () => this.subs.delete(fn);
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
    await this.ctx?.close();
    this.ctx = null;
    this.node = null;
    this.starting = null;
  }
}
