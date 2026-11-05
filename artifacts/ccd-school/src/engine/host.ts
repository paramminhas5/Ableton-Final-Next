/**
 * A host runs the engine somewhere: WebAssembly in an AudioWorklet (web), or natively
 * inside the Tauri app (iOS Core Audio, Android AAudio). Both speak the same commands.
 */

export type EngineEvent = {
  kind: number;
  layer: number;
  note: number;
  flags: number;
  vel: number;
  /** For played notes: ms from the touch to the engine acting on it. -1 if unknown. */
  aux: number;
  beat: number;
};

export type HostInfo = {
  kind: "web" | "ios" | "android" | "native";
  sampleRate: number;
  /** Frames per audio callback. */
  bufferFrames: number;
  /** Seconds from the engine's output to the speaker, as the platform reports it. */
  outputLatency: number;
  /** Engine CPU, % of real time. */
  load: number;
  link?: { enabled: boolean; peers: number; tempo: number };
};

export interface EngineHost {
  readonly name: HostInfo["kind"];
  start(): Promise<void>;
  /** Raw command (see CMD in params.gen.ts). Batched until the next microtask. */
  send(kind: number, layer: number, a: number, x: number, y: number, z: number): void;
  /** Note on/off as fast as possible. `at` is the touch's event.timeStamp (performance clock). */
  note(on: boolean, layer: number, note: number, vel: number, at?: number): void;
  subscribe(fn: (events: EngineEvent[]) => void): () => void;
  info(): HostInfo;
  /** Ableton Link. Only native hosts can join (browsers cannot open the ports Link needs). */
  link?(enabled: boolean): Promise<void>;
  setTempo?(bpm: number): void;
  /** Put a mono sample into a sampler layer's slot (web only for now; the phone shell follows). */
  loadSample?(layer: number, slot: number, data: Float32Array, rate: number): void;
  /** The engine's scope ring (cmd SCOPE): `fn` gets its latest samples about 30 times a second. Web only for now. */
  scope?(fn: (x: Float32Array) => void): () => void;
  /** The watched part's live modulation values (cmd modWatch), `fps` times a second. Web only for now. */
  mods?(fps: number, fn: (v: Float32Array) => void): () => void;
  /** Web only: the audio context the engine plays into, so other sounds (a file on a deck) mix with it. */
  audio?(): { ctx: AudioContext; out: AudioNode } | null;
  stop(): Promise<void>;
}

export function unpackEvents(a: Float64Array | number[]): EngineEvent[] {
  const out: EngineEvent[] = [];
  for (let i = 0; i + 6 < a.length; i += 7) {
    out.push({ kind: a[i], layer: a[i + 1], note: a[i + 2], flags: a[i + 3], vel: a[i + 4], aux: a[i + 5], beat: a[i + 6] });
  }
  return out;
}
