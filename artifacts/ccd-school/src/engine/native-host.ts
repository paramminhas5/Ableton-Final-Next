/**
 * Native host: the same Rust engine running inside the Tauri app, on the platform's
 * lowest-latency audio path (iOS RemoteIO, Android AAudio low-latency exclusive).
 * Talks to it through Tauri commands; events come back on a channel.
 */
import { CMD } from "./params.gen";
import { unpackEvents, type EngineEvent, type EngineHost, type HostInfo } from "./host";

type Invoke = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

type NativeInfo = {
  platform: "ios" | "android" | "native";
  sample_rate: number;
  buffer_frames: number;
  output_latency: number;
  load: number;
  link_enabled: boolean;
  link_peers: number;
  tempo: number;
};

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export class NativeHost implements EngineHost {
  name: HostInfo["kind"] = "native";
  private invoke: Invoke | null = null;
  private queue: number[] = [];
  private flushing = false;
  private subs = new Set<(e: EngineEvent[]) => void>();
  private last: NativeInfo | null = null;
  private starting: Promise<void> | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  start() {
    if (!this.starting) this.starting = this.boot();
    return this.starting;
  }

  private async boot() {
    const core = await import("@tauri-apps/api/core");
    this.invoke = core.invoke as Invoke;
    const ch = new core.Channel<number[]>();
    ch.onmessage = (packed) => {
      const evs = unpackEvents(packed);
      for (const fn of this.subs) fn(evs);
    };
    this.last = await this.invoke<NativeInfo>("engine_start", { events: ch });
    this.name = this.last.platform;
    this.timer = setInterval(() => void this.refresh(), 1000);
    if (this.queue.length) this.flush();
  }

  private async refresh() {
    if (!this.invoke) return;
    try {
      this.last = await this.invoke<NativeInfo>("engine_info");
    } catch {
      /* keep the last value */
    }
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
    if (!this.invoke || !this.queue.length) return;
    const cmds = this.queue;
    this.queue = [];
    void this.invoke("engine_send", { cmds });
  }

  note(on: boolean, layer: number, note: number, vel: number, at?: number) {
    // Native side turns the touch's age (ms) into an engine frame.
    const age = at === undefined ? -1 : Math.max(0, performance.now() - at);
    this.queue.push(on ? CMD.noteOn : CMD.noteOff, layer, note, vel, age, 0);
    this.flush();
  }

  subscribe(fn: (e: EngineEvent[]) => void) {
    this.subs.add(fn);
    return () => this.subs.delete(fn);
  }

  info(): HostInfo {
    const i = this.last;
    return {
      kind: this.name,
      sampleRate: i?.sample_rate ?? 48000,
      bufferFrames: i?.buffer_frames ?? 0,
      outputLatency: i?.output_latency ?? 0,
      load: i?.load ?? 0,
      link: i ? { enabled: i.link_enabled, peers: i.link_peers, tempo: i.tempo } : undefined,
    };
  }

  async link(enabled: boolean) {
    await this.invoke?.("link_enable", { enabled });
    await this.refresh();
  }

  setTempo(bpm: number) {
    void this.invoke?.("set_tempo", { bpm });
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    await this.invoke?.("engine_stop");
  }
}
