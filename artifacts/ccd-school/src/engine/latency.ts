/**
 * Measuring touch-to-sound latency with the phone's own microphone.
 *
 * Tap the screen with a fingernail right next to the mic. The mic hears two things:
 * the knock of your nail on the glass (the moment you touched), then the sound the
 * engine made. The gap between the two onsets is the real touch-to-sound latency,
 * everything included: touch scanning, the webview, the bridge, the engine, the
 * buffers and the speaker.
 */

export type Onset = { index: number; ms: number; level: number };

/**
 * Onsets in `x`: where the 1 ms peak envelope is well above the noise floor and has
 * jumped (at least `jump` times the loudest of the previous 5 ms). A sound that keeps
 * ringing does not count again; a new hit on top of a fading one does.
 */
export function findOnsets(x: Float32Array, sampleRate: number, opts: { ratio?: number; min?: number; refractoryMs?: number; jump?: number } = {}): Onset[] {
  const ratio = opts.ratio ?? 8;
  const jump = opts.jump ?? 3;
  const min = opts.min ?? 0.01;
  const refractory = Math.round(((opts.refractoryMs ?? 3) / 1000) * sampleRate);
  const win = Math.max(1, Math.round(sampleRate / 1000));
  const env: number[] = [];
  for (let i = 0; i < x.length; i += win) {
    let p = 0;
    for (let j = i; j < Math.min(x.length, i + win); j++) p = Math.max(p, Math.abs(x[j]));
    env.push(p);
  }
  const sorted = [...env].sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.3)] ?? 0;
  const thresh = Math.max(min, floor * ratio);
  const out: Onset[] = [];
  let last = -Infinity;
  for (let k = 0; k < env.length; k++) {
    if (env[k] < thresh || k * win - last < refractory) continue;
    let before = 0;
    for (let j = Math.max(0, k - 5); j < k; j++) before = Math.max(before, env[j]);
    if (env[k] < before * jump) continue;
    // Refine to the first sample over a fraction of this window's peak.
    const start = k * win;
    let idx = start;
    const target = env[k] * 0.3;
    for (let j = Math.max(0, start - win); j < Math.min(x.length, start + win); j++) {
      if (Math.abs(x[j]) >= target) {
        idx = j;
        break;
      }
    }
    out.push({ index: idx, ms: (idx / sampleRate) * 1000, level: env[k] });
    last = idx;
  }
  return out;
}

/**
 * Given mic audio around one tap, return the gap between the knock and the sound.
 * `tapIndex` is roughly where the touch happened in `x` (from the event time).
 */
export function knockToSound(x: Float32Array, sampleRate: number, tapIndex: number): number | null {
  const lo = Math.max(0, tapIndex - Math.round(0.08 * sampleRate));
  const hi = Math.min(x.length, tapIndex + Math.round(0.25 * sampleRate));
  const onsets = findOnsets(x.subarray(lo, hi), sampleRate);
  if (onsets.length < 2) return null;
  const gap = onsets[1].ms - onsets[0].ms;
  return gap > 1 && gap < 200 ? gap : null;
}

export function median(v: number[]): number | null {
  if (!v.length) return null;
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Keeps the last second of microphone audio so a tap can be analysed after it. */
export class MicTap {
  private ctx: AudioContext | null = null;
  private node: AudioWorkletNode | null = null;
  private stream: MediaStream | null = null;
  private waiting: ((x: Float32Array) => void) | null = null;
  sampleRate = 48000;

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    const ctx = new AudioContext({ latencyHint: 0 });
    this.ctx = ctx;
    this.sampleRate = ctx.sampleRate;
    await ctx.audioWorklet.addModule("/engine/ccd-recorder.js");
    const src = ctx.createMediaStreamSource(this.stream);
    const node = new AudioWorkletNode(ctx, "ccd-recorder", { numberOfOutputs: 0 });
    node.port.onmessage = (m: MessageEvent) => {
      this.waiting?.(m.data as Float32Array);
      this.waiting = null;
    };
    src.connect(node);
    this.node = node;
  }

  /** The last second of audio, newest sample last. */
  snapshot(): Promise<Float32Array> {
    return new Promise(res => {
      this.waiting = res;
      this.node?.port.postMessage("snap");
    });
  }

  stop() {
    this.stream?.getTracks().forEach(t => t.stop());
    void this.ctx?.close();
    this.ctx = null;
  }
}
