// DeviceEngine — owns the entire audio graph for one device page.
// Single source of truth. No React callback timing. No split paths.
//
//  source loop ──┬─► dryGain ──┐
//                │             ├─► mix ─► analyserOut ─► master
//                └─► device ──► wetGain ┘
//
// Bypass = swap dry/wet gains. Always connected to master.

import { getCtx, getMaster, playKick, playSnare, playHat, playTone, midiToFreq, type SampleName } from "./audio";
import type { DeviceNode } from "./audio-bus";

const ACTIVE_ENGINES = new Set<DeviceEngine>();

export class DeviceEngine {
  ctx: AudioContext;
  input: GainNode;       // source feeds here
  dry: GainNode;
  wet: GainNode;
  mix: GainNode;
  analyserIn: AnalyserNode;
  analyserOut: AnalyserNode;
  device: DeviceNode | null = null;
  bypassed = false;

  private sample: SampleName = "drum-loop";
  private bpm = 100;
  private playing = false;
  private stopped = true;
  private nextBar = 0;
  private timer: number | null = null;

  constructor() {
    const c = getCtx();
    if (!c) throw new Error("AudioContext unavailable");
    this.ctx = c;
    this.input = c.createGain(); this.input.gain.value = 0.9;
    this.dry = c.createGain(); this.dry.gain.value = 0;
    this.wet = c.createGain(); this.wet.gain.value = 1;
    this.mix = c.createGain(); this.mix.gain.value = 1;
    this.analyserIn = c.createAnalyser(); this.analyserIn.fftSize = 1024;
    this.analyserOut = c.createAnalyser(); this.analyserOut.fftSize = 1024;
    // Pre-device tap (always sees source signal)
    this.input.connect(this.analyserIn);
    // Dry path
    this.input.connect(this.dry).connect(this.mix);
    // Mix to output
    this.mix.connect(this.analyserOut).connect(getMaster());
    // NOTE: previously this constructor disposed all other ACTIVE_ENGINES,
    // which silently killed the Workbench's chain whenever any sim mounted
    // its own engine. Each engine now owns its own subgraph; multiple
    // engines coexist safely because they are independent fan-ins to master.
    ACTIVE_ENGINES.add(this);
  }

  attachDevice(d: DeviceNode, initialValues?: Record<string, number | string>) {
    if (this.device) {
      try { this.device.input.disconnect(); this.device.output.disconnect(); } catch {}
      this.device.dispose();
    }
    this.device = d;
    this.input.connect(d.input);
    d.output.connect(this.wet).connect(this.mix);
    if (initialValues) {
      Object.entries(initialValues).forEach(([k, v]) => d.set(k, v));
    }
  }

  // Chain mode — alternative to attachDevice. Atomically rewires N devices
  // between input → ... → wet, with a brief gain duck on `mix` to mask any
  // transient click. Single source of truth used by Workbench + DeviceChainSim.
  private chainNodes: DeviceNode[] = [];
  setChain(devices: DeviceNode[]) {
    // Idempotent: if the chain ref-equals the previous one, do nothing.
    // Prevents the on-mount [] → [] rewire that ducked the mix on every render.
    if (devices.length === this.chainNodes.length &&
        devices.every((d, i) => d === this.chainNodes[i])) {
      return;
    }
    const c = this.ctx;
    // Duck the mix during rewire (not the source path) — output stays alive,
    // just briefly silent. This avoids the source-orphan race condition.
    const t = c.currentTime;
    try {
      this.mix.gain.cancelScheduledValues(t);
      this.mix.gain.setValueAtTime(this.mix.gain.value, t);
      this.mix.gain.linearRampToValueAtTime(0.0001, t + 0.005);
      this.mix.gain.linearRampToValueAtTime(1, t + 0.04);
    } catch {}
    // Detach previous chain edges
    try { this.input.disconnect(); } catch {}
    this.chainNodes.forEach((n) => { try { n.input.disconnect(); n.output.disconnect(); } catch {} });
    // Re-connect always-on taps + dry path
    try { this.input.connect(this.analyserIn); } catch {}
    try { this.input.connect(this.dry); } catch {}
    // Wire chain
    if (devices.length === 0) {
      try { this.input.connect(this.wet); } catch {}
    } else {
      let prev: AudioNode = this.input;
      for (const d of devices) {
        try { prev.connect(d.input); } catch {}
        prev = d.output;
      }
      try { prev.connect(this.wet); } catch {}
    }
    this.chainNodes = devices;
  }

  getChain() { return this.chainNodes.slice(); }

  setBypass(b: boolean) {
    this.bypassed = b;
    const t = this.ctx.currentTime;
    this.dry.gain.cancelScheduledValues(t);
    this.wet.gain.cancelScheduledValues(t);
    this.dry.gain.linearRampToValueAtTime(b ? 1 : 0, t + 0.02);
    this.wet.gain.linearRampToValueAtTime(b ? 0 : 1, t + 0.02);
  }

  setParam(id: string, v: number | string) {
    this.device?.set(id, v);
  }

  setSample(s: SampleName) { this.sample = s; }
  setBpm(b: number) { this.bpm = b; }

  async play() {
    if (this.playing) return;
    if (this.ctx.state !== "running") {
      try { await this.ctx.resume(); } catch {}
    }
    this.playing = true;
    this.stopped = false;
    this.nextBar = this.ctx.currentTime + 0.15;
    this.tick();
  }

  stop() {
    this.playing = false;
    this.stopped = true;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
  }

  private tick = () => {
    if (this.stopped) return;
    const c = this.ctx;
    const beat = 60 / this.bpm;
    const bar = beat * 4;
    if (this.nextBar < c.currentTime) this.nextBar = c.currentTime + 0.05;
    while (this.nextBar < c.currentTime + 0.4) {
      this.scheduleBar(this.nextBar);
      this.nextBar += bar;
    }
    this.timer = window.setTimeout(this.tick, 50);
  };

  private scheduleBar(t: number) {
    const c = this.ctx;
    const beat = 60 / this.bpm;
    const out = this.input;
    const name = this.sample;
    if (name === "drum-loop" || name === "full-mix") {
      for (let b = 0; b < 4; b++) {
        playKick(t + b * beat - c.currentTime, out);
        playHat(t + b * beat + beat / 2 - c.currentTime, false, out);
      }
      playSnare(t + beat - c.currentTime, out);
      playSnare(t + 3 * beat - c.currentTime, out);
    }
    if (name === "bass-loop" || name === "full-mix") {
      [36, 36, 43, 41].forEach((n, i) => {
        playTone(midiToFreq(n), t + i * beat - c.currentTime, beat * 0.9, "sawtooth", 0.22, out);
      });
    }
    if (name === "chord-pad" || name === "full-mix") {
      [60, 64, 67, 72].forEach((n) => {
        playTone(midiToFreq(n), t - c.currentTime, beat * 4 * 0.95, "triangle", 0.08, out);
      });
    }
    if (name === "vox-chop") {
      [72, 74, 76, 79].forEach((n, i) => {
        playTone(midiToFreq(n), t + i * beat - c.currentTime, beat * 0.6, "sine", 0.2, out);
      });
    }
  }

  dispose() {
    this.stop();
    try {
      this.input.disconnect();
      this.dry.disconnect();
      this.wet.disconnect();
      this.mix.disconnect();
      this.analyserIn.disconnect();
      this.analyserOut.disconnect();
    } catch {}
    this.device?.dispose();
    ACTIVE_ENGINES.delete(this);
  }

  isPlaying() { return this.playing; }
  getCtxState() { return this.ctx.state; }
}
