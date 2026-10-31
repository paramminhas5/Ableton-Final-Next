/**
 * Browser-only audio for the Ear Gym. Clips are rendered offline (so we can
 * measure and match loudness before anyone hears them), then played as two
 * looping sources that are switched with a gain ramp, so A/B never gaps.
 */
import { getCtx, getMaster } from "@/lib/audio";
import { mulberry32 } from "./engine";
import type { AttackSetting } from "./engine";
import { applyGain, matchGain, peak } from "./loudness";

export interface RenderOpts {
  bpm: number;
  /** 0..0.5, how far off-beat eighths are pushed late */
  swing?: number;
  bars?: number;
  eq?: { hz: number; db: number; q: number };
  comp?: { thresholdDb: number; ratio: number; attack: AttackSetting };
  /** real recorded sounds; when set, bpm must be REAL_BPM */
  kit?: RealKit;
  /** which two-bar slice (0..3) of the piano loop to play */
  segment?: number;
}

/** Real recorded one-shots and a piano loop, used for the EQ and compression drills. */
export interface RealKit {
  kick: AudioBuffer;
  clap: AudioBuffer;
  snare: AudioBuffer;
  hat: AudioBuffer;
  piano: AudioBuffer;
}
/** The piano loop is 8 bars at 140 BPM, so drills that use it run at 140. */
export const REAL_BPM = 140;

let kitPromise: Promise<RealKit | null> | null = null;
/** Loads the real sounds once. Returns null when they cannot be fetched or decoded, and the drill falls back to synth sounds. */
export function loadRealKit(): Promise<RealKit | null> {
  if (typeof window === "undefined" || typeof OfflineAudioContext === "undefined") return Promise.resolve(null);
  kitPromise ??= (async () => {
    try {
      const dec = new OfflineAudioContext(1, 1, 44100);
      const get = async (file: string) => {
        const r = await fetch(`/audio/real/${file}`);
        if (!r.ok) throw new Error(file);
        return dec.decodeAudioData(await r.arrayBuffer());
      };
      const [kick, clap, snare, hat, piano] = await Promise.all([
        get("kick.wav"), get("clap.wav"), get("snare.wav"), get("hat.wav"), get("piano-140.mp3"),
      ]);
      return { kick, clap, snare, hat, piano };
    } catch {
      kitPromise = null;
      return null;
    }
  })();
  return kitPromise;
}

function shot(c: OfflineCtx, out: AudioNode, buf: AudioBuffer, t: number, gain: number) {
  const s = c.createBufferSource();
  s.buffer = buf;
  const g = c.createGain();
  g.gain.value = gain;
  s.connect(g).connect(out);
  s.start(t);
}

const SR = 44100;
const ATTACK_S: Record<AttackSetting, number> = { fast: 0.001, medium: 0.02, slow: 0.07 };

type OfflineCtx = OfflineAudioContext;

function noiseBuffer(c: OfflineCtx, seconds: number): AudioBuffer {
  const rng = mulberry32(1234);
  const buf = c.createBuffer(1, Math.ceil(SR * seconds), SR);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = rng() * 2 - 1;
  return buf;
}

function kick(c: OfflineCtx, out: AudioNode, t: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.3);
}

function snare(c: OfflineCtx, out: AudioNode, t: number, noise: AudioBuffer) {
  const n = c.createBufferSource();
  n.buffer = noise;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(0.55, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  n.connect(bp).connect(g).connect(out);
  n.start(t, 0.1);
  n.stop(t + 0.18);
  const o = c.createOscillator();
  const og = c.createGain();
  o.frequency.value = 190;
  og.gain.setValueAtTime(0.3, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  o.connect(og).connect(out);
  o.start(t);
  o.stop(t + 0.12);
}

function hat(c: OfflineCtx, out: AudioNode, t: number, noise: AudioBuffer, vel: number) {
  const n = c.createBufferSource();
  n.buffer = noise;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 7000;
  const g = c.createGain();
  g.gain.setValueAtTime(0.22 * vel, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  n.connect(hp).connect(g).connect(out);
  n.start(t, 0.3);
  n.stop(t + 0.06);
}

function bassNote(c: OfflineCtx, out: AudioNode, t: number, hz: number, len: number) {
  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.value = hz;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 420;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.4, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + len);
  o.connect(lp).connect(g).connect(out);
  o.start(t);
  o.stop(t + len + 0.02);
}

function pad(c: OfflineCtx, out: AudioNode, t: number, len: number) {
  // Am7 stab held for the bar: gives the mid and high band something to hide in.
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 3200;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.02, t + len);
  lp.connect(g).connect(out);
  for (const hz of [220, 261.63, 329.63, 392]) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = hz;
    o.connect(lp);
    o.start(t);
    o.stop(t + len + 0.02);
  }
}

export async function renderLoop(opts: RenderOpts): Promise<AudioBuffer> {
  const bars = opts.bars ?? 2;
  const beat = 60 / opts.bpm;
  const seconds = bars * 4 * beat;
  const c = new OfflineAudioContext(1, Math.ceil(SR * seconds), SR);
  const noise = noiseBuffer(c, 0.6);

  // chain: instruments -> [eq] -> [comp] -> out
  const bus = c.createGain();
  let tail: AudioNode = bus;
  if (opts.eq) {
    const f = c.createBiquadFilter();
    f.type = "peaking";
    f.frequency.value = opts.eq.hz;
    f.gain.value = opts.eq.db;
    f.Q.value = opts.eq.q;
    tail.connect(f);
    tail = f;
  }
  if (opts.comp) {
    const k = c.createDynamicsCompressor();
    k.threshold.value = opts.comp.thresholdDb;
    k.ratio.value = opts.comp.ratio;
    k.attack.value = ATTACK_S[opts.comp.attack];
    k.release.value = 0.12;
    k.knee.value = 3;
    tail.connect(k);
    tail = k;
  }
  tail.connect(c.destination);

  const eighth = beat / 2;
  const shift = (opts.swing ?? 0) * (2 / 3) * eighth;

  if (opts.kit) {
    const k = opts.kit;
    const seg = (opts.segment ?? 0) % 4;
    const loopBar = 4 * beat;
    const p = c.createBufferSource();
    p.buffer = k.piano;
    const pg = c.createGain();
    pg.gain.value = 0.6;
    p.connect(pg).connect(bus);
    p.start(0, seg * 2 * loopBar, seconds);
    for (let bar = 0; bar < bars; bar++) {
      const t0 = bar * loopBar;
      shot(c, bus, k.kick, t0, 0.9);
      shot(c, bus, k.kick, t0 + 2 * beat, 0.9);
      shot(c, bus, k.kick, t0 + 2.5 * beat, 0.8);
      shot(c, bus, k.clap, t0 + beat, 0.5);
      shot(c, bus, k.clap, t0 + 3 * beat, 0.5);
      shot(c, bus, k.snare, t0 + beat, 0.25);
      shot(c, bus, k.snare, t0 + 3 * beat, 0.25);
      for (let s8 = 0; s8 < 8; s8++) shot(c, bus, k.hat, t0 + s8 * eighth, s8 % 2 === 1 ? 0.35 : 0.2);
    }
    return c.startRendering();
  }
  const bassHz = [55, 55, 65.41, 49];
  for (let bar = 0; bar < bars; bar++) {
    const t0 = bar * 4 * beat;
    pad(c, bus, t0, 4 * beat);
    for (let s = 0; s < 8; s++) {
      // s = eighth-note index within the bar; odd eighths are the off-beats
      const t = t0 + s * eighth + (s % 2 === 1 ? shift : 0);
      hat(c, bus, t, noise, s % 2 === 1 ? 1 : 0.7);
      if (s % 2 === 1 || s === 0 || s === 4) {
        bassNote(c, bus, t, bassHz[(bar + (s >> 1)) % bassHz.length], eighth * 0.9);
      }
    }
    kick(c, bus, t0);
    kick(c, bus, t0 + 2 * beat);
    kick(c, bus, t0 + 2.5 * beat + shift);
    snare(c, bus, t0 + beat, noise);
    snare(c, bus, t0 + 3 * beat, noise);
  }
  return c.startRendering();
}

/** Render a reference and a test clip, with the test clip's loudness matched to the reference. */
export async function renderMatchedPair(ref: RenderOpts, test: RenderOpts) {
  const [a, b] = await Promise.all([renderLoop(ref), renderLoop(test)]);
  const g = matchGain(a.getChannelData(0), b.getChannelData(0));
  const data = b.getChannelData(0);
  applyGain(data, g);
  // real recordings can sum past full scale: pull both clips down together so neither clips
  const top = Math.max(peak(a.getChannelData(0)), peak(data));
  if (top > 0.95) {
    const k = 0.95 / top;
    applyGain(a.getChannelData(0), k);
    applyGain(data, k);
  }
  return { a, b, matchGain: g };
}

export class ABPlayer {
  private srcs: AudioBufferSourceNode[] = [];
  private gains: GainNode[] = [];
  private startedAt = 0;
  private current: "A" | "B" = "A";
  playing = false;

  constructor(
    private a: AudioBuffer,
    private b: AudioBuffer,
  ) {}

  start(initial: "A" | "B" = "A") {
    const c = getCtx();
    if (!c || this.playing) return;
    const when = c.currentTime + 0.05;
    this.startedAt = when;
    this.current = initial;
    [this.a, this.b].forEach((buf, i) => {
      const s = c.createBufferSource();
      s.buffer = buf;
      s.loop = true;
      const g = c.createGain();
      g.gain.value = (i === 0) === (initial === "A") ? 1 : 0;
      s.connect(g).connect(getMaster());
      s.start(when);
      this.srcs.push(s);
      this.gains.push(g);
    });
    this.playing = true;
  }

  /** Gapless switch: both clips keep running, only the gains move. */
  select(which: "A" | "B") {
    const c = getCtx();
    if (!c || !this.playing) return;
    this.current = which;
    const t = c.currentTime;
    this.gains.forEach((g, i) => {
      const on = (i === 0) === (which === "A");
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(on ? 1 : 0, t + 0.012);
    });
  }

  get selected() {
    return this.current;
  }

  /** Whole bars of the reference tempo played so far. */
  barsPlayed(bpm: number): number {
    const c = getCtx();
    if (!c || !this.playing) return 0;
    return Math.max(0, Math.floor((c.currentTime - this.startedAt) / ((4 * 60) / bpm)));
  }

  stop() {
    this.srcs.forEach((s) => {
      try {
        s.stop();
      } catch {}
      try {
        s.disconnect();
      } catch {}
    });
    this.gains.forEach((g) => {
      try {
        g.disconnect();
      } catch {}
    });
    this.srcs = [];
    this.gains = [];
    this.playing = false;
  }
}
