// AudioBus — composable processing chain for device sims.
// Each device is a 100% WET processor. Dry/wet A/B is owned by DeviceEngine.
// This guarantees that toggling A (dry) vs B (wet) is a true before/after.

import { getCtx, getMaster } from "./audio";

export type DeviceKind =
  | "eq3" | "eq8" | "comp" | "sat" | "reverb" | "delay" | "filter" | "chorus" | "phaser" | "glue"
  | "gate" | "overdrive" | "erosion" | "redux" | "flanger" | "vibrato" | "echo" | "grain"
  | "filterdelay" | "drumbuss" | "autopan" | "freqshift";

export interface DeviceNode {
  kind: DeviceKind;
  input: AudioNode;
  output: AudioNode;
  bypass(b: boolean): void;
  set(param: string, value: number | string): void;
  meta(): Record<string, unknown>;
  dispose(): void;
}

const ctxOrThrow = () => {
  const c = getCtx();
  if (!c) throw new Error("AudioContext not available");
  return c;
};

// ---- EQ3 ---------------------------------------------------------------
export const makeEQ3 = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const low = c.createBiquadFilter(); low.type = "lowshelf"; low.frequency.value = 120; low.gain.value = 0;
  const mid = c.createBiquadFilter(); mid.type = "peaking"; mid.frequency.value = 1000; mid.Q.value = 1; mid.gain.value = 0;
  const hi  = c.createBiquadFilter(); hi.type  = "highshelf"; hi.frequency.value = 6000; hi.gain.value = 0;
  input.connect(low).connect(mid).connect(hi).connect(out);
  return {
    kind: "eq3", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "low") low.gain.value = n;
      else if (p === "mid") mid.gain.value = n;
      else if (p === "hi" || p === "high") hi.gain.value = n;
      else if (p === "midFreq") mid.frequency.value = n;
      else if (p === "midQ") mid.Q.value = n;
    },
    meta: () => ({ low: low.gain.value, mid: mid.gain.value, hi: hi.gain.value, midFreq: mid.frequency.value }),
    dispose() {},
  };
};

// ---- Compressor --------------------------------------------------------
export const makeComp = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -24; comp.ratio.value = 6; comp.attack.value = 0.005;
  comp.release.value = 0.18; comp.knee.value = 6;
  const makeup = c.createGain(); makeup.gain.value = 1.6;
  input.connect(comp).connect(makeup).connect(out);
  return {
    kind: "comp", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "threshold") comp.threshold.value = n;
      else if (p === "ratio") comp.ratio.value = n;
      else if (p === "attack") comp.attack.value = n;
      else if (p === "release") comp.release.value = n;
      else if (p === "knee") comp.knee.value = n;
      else if (p === "makeup") makeup.gain.value = n;
    },
    meta: () => ({ reduction: comp.reduction }),
    dispose() {},
  };
};

// ---- Saturator ---------------------------------------------------------
// Saturator curves modeled (in spirit) on Ableton Live's Saturator types.
// drive is normalized 0..1 here; the device exposes dB and converts.
const makeShaperCurve = (
  drive: number,
  type: "analog" | "soft" | "medium" | "hard" | "sinoid" | "digital" = "analog",
) => {
  const samples = 8192;
  const curve = new Float32Array(samples);
  const k = Math.max(0.001, drive);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    let y = x;
    if (type === "analog") {
      // Analog Clip — tanh, smooth odd-harmonic warmth
      y = Math.tanh(x * (1 + k * 18));
    } else if (type === "soft") {
      // Soft Sine — sin(x*pi/2) shape, very gentle compression
      const xv = Math.max(-1, Math.min(1, x * (1 + k * 6)));
      y = Math.sin((xv * Math.PI) / 2);
    } else if (type === "medium") {
      // Medium Curve — x / (1 + |x|) style soft saturation
      const xv = x * (1 + k * 12);
      y = xv / (1 + Math.abs(xv));
    } else if (type === "hard") {
      // Hard Clip — brick wall
      const g = 1 + k * 28;
      y = Math.max(-1, Math.min(1, x * g));
    } else if (type === "sinoid") {
      // Sinoid Fold — wave-folding, generates exotic harmonics
      const xv = x * (1 + k * 10);
      y = Math.sin(xv * Math.PI);
    } else if (type === "digital") {
      // Digital — bitcrush quantisation
      const steps = Math.max(2, 64 - Math.floor(k * 60));
      y = Math.round(x * steps) / steps;
    }
    curve[i] = y;
  }
  return curve;
};

export const makeSat = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const pre = c.createGain(); pre.gain.value = 1;
  const shape = c.createWaveShaper();
  shape.oversample = "4x";
  // DC blocker — kills any offset asymmetric curves introduce
  const dcBlock = c.createBiquadFilter(); dcBlock.type = "highpass"; dcBlock.frequency.value = 5; dcBlock.Q.value = 0.7;
  const post = c.createGain(); post.gain.value = 0.7;
  let driveDb = 0;
  let type: "analog" | "soft" | "medium" | "hard" | "sinoid" | "digital" = "analog";
  const driveNorm = () => Math.max(0, Math.min(1, driveDb / 36));
  shape.curve = makeShaperCurve(driveNorm(), type);
  input.connect(pre).connect(shape).connect(dcBlock).connect(post).connect(out);
  return {
    kind: "sat", input, output: out,
    bypass() {},
    set(p, v) {
      if (p === "drive") {
        driveDb = +v;
        // Convert dB to linear pre-gain (0 dB = 1, +24 dB ≈ 16x)
        pre.gain.value = Math.pow(10, driveDb / 20);
        shape.curve = makeShaperCurve(driveNorm(), type);
      } else if (p === "type") {
        type = v as any;
        shape.curve = makeShaperCurve(driveNorm(), type);
      } else if (p === "output") {
        post.gain.value = +v;
      }
    },
    meta: () => ({ driveDb, type }),
    dispose() {},
  };
};

// ---- Reverb ------------------------------------------------------------
// Stereo IR with early reflections + diffuse exponential tail.
const makeIR = (c: AudioContext, seconds = 2, decay = 2) => {
  const rate = c.sampleRate;
  const len = Math.max(1, Math.floor(rate * Math.max(0.05, seconds)));
  const buf = c.createBuffer(2, len, rate);
  // Early reflection taps (ms, gain) — give the room a sense of size before the diffuse tail.
  const earlies: { t: number; gL: number; gR: number }[] = [
    { t: 0.007, gL: 0.6, gR: 0.0 },
    { t: 0.013, gL: 0.0, gR: 0.5 },
    { t: 0.023, gL: 0.45, gR: 0.3 },
    { t: 0.037, gL: 0.3, gR: 0.4 },
    { t: 0.053, gL: 0.25, gR: 0.25 },
  ];
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    // Diffuse tail — independent noise per channel for stereo width.
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    // Stamp early reflections on top.
    for (const r of earlies) {
      const idx = Math.floor(r.t * rate * Math.min(1, seconds / 1.5));
      if (idx < len) d[idx] += ch === 0 ? r.gL : r.gR;
    }
  }
  return buf;
};

export const makeReverb = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const conv = c.createConvolver();
  let size = 2.5; let decay = 2.2;
  conv.buffer = makeIR(c, size, decay);
  const pre = c.createDelay(); pre.delayTime.value = 0.02;
  const wet = c.createGain(); wet.gain.value = 1.4;
  input.connect(pre).connect(conv).connect(wet).connect(out);
  return {
    kind: "reverb", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      const t = c.currentTime;
      if (p === "size") { size = Math.max(0.1, n); conv.buffer = makeIR(c, size, decay); }
      else if (p === "decay") { decay = Math.max(0.5, n); conv.buffer = makeIR(c, size, decay); }
      else if (p === "predelay") pre.delayTime.setTargetAtTime(Math.max(0, n / 1000), t, 0.01);
      else if (p === "wet") wet.gain.setTargetAtTime(Math.max(0, n) * 2.2, t, 0.02);
    },
    meta: () => ({ size, decay }),
    dispose() {},
  };
};

// ---- Delay -------------------------------------------------------------
export const makeDelay = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  // Engine owns dry. Device emits ONLY echoes so A/B is clean.
  const wet = c.createGain(); wet.gain.value = 1;
  const delay = c.createDelay(2); delay.delayTime.value = 0.375;
  const fb = c.createGain(); fb.gain.value = 0.5;
  const fbFilter = c.createBiquadFilter(); fbFilter.type = "lowpass"; fbFilter.frequency.value = 4000;
  input.connect(delay);
  delay.connect(fbFilter).connect(fb).connect(delay);
  delay.connect(wet).connect(out);
  return {
    kind: "delay", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      const t = c.currentTime;
      if (p === "time") delay.delayTime.setTargetAtTime(Math.max(0.001, n), t, 0.02);
      else if (p === "feedback") fb.gain.setTargetAtTime(Math.max(0, Math.min(0.95, n)), t, 0.02);
      else if (p === "tone") fbFilter.frequency.setTargetAtTime(n, t, 0.02);
      else if (p === "wet") wet.gain.setTargetAtTime(Math.max(0, n) * 1.5, t, 0.02);
    },
    meta: () => ({ time: delay.delayTime.value, feedback: fb.gain.value }),
    dispose() {},
  };
};

// ---- Auto Filter -------------------------------------------------------
export const makeAutoFilter = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const filt = c.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 1200; filt.Q.value = 4;
  const lfo = c.createOscillator(); lfo.frequency.value = 1; lfo.type = "sine";
  const lfoAmt = c.createGain(); lfoAmt.gain.value = 0;
  lfo.connect(lfoAmt).connect(filt.frequency); lfo.start();
  // Envelope follower: full-wave rectify via WaveShaper(|x|) → smoothing lowpass → scaled gain → cutoff.
  const envTap = c.createGain(); envTap.gain.value = 1;
  const rect = c.createWaveShaper();
  const rcurve = new Float32Array(2048);
  for (let i = 0; i < 2048; i++) { const x = (i / 2047) * 2 - 1; rcurve[i] = Math.abs(x); }
  rect.curve = rcurve;
  const envSmooth = c.createBiquadFilter(); envSmooth.type = "lowpass"; envSmooth.frequency.value = 20; envSmooth.Q.value = 0.7;
  const envAmt = c.createGain(); envAmt.gain.value = 0;
  input.connect(envTap).connect(rect).connect(envSmooth).connect(envAmt).connect(filt.frequency);
  input.connect(filt).connect(out);
  return {
    kind: "filter", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "cutoff") filt.frequency.value = n;
      else if (p === "Q") filt.Q.value = n;
      else if (p === "lfoRate") lfo.frequency.value = n;
      else if (p === "lfoDepth") lfoAmt.gain.value = n;
      else if (p === "envAmt") envAmt.gain.value = n;
      else if (p === "type") filt.type = v as BiquadFilterType;
    },
    meta: () => ({ cutoff: filt.frequency.value, Q: filt.Q.value }),
    dispose() { try { lfo.stop(); } catch {} },
  };
};

// ---- Chorus ------------------------------------------------------------
export const makeChorus = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  // Engine owns dry; emit modulated path + a small static dry blend so chorus doubling is heard.
  const innerDry = c.createGain(); innerDry.gain.value = 0.5;
  const wet = c.createGain(); wet.gain.value = 1;
  const delay = c.createDelay(); delay.delayTime.value = 0.025;
  const lfo = c.createOscillator(); lfo.frequency.value = 1.2; lfo.type = "sine";
  const depth = c.createGain(); depth.gain.value = 0.008;
  lfo.connect(depth).connect(delay.delayTime); lfo.start();
  input.connect(innerDry).connect(out);
  input.connect(delay).connect(wet).connect(out);
  return {
    kind: "chorus", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "rate") lfo.frequency.value = n;
      else if (p === "depth") depth.gain.value = n / 1000;
      else if (p === "wet") wet.gain.value = n;
    },
    meta: () => ({ rate: lfo.frequency.value }),
    dispose() { try { lfo.stop(); } catch {} },
  };
};

// ---- Phaser ------------------------------------------------------------
export const makePhaser = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  // Engine owns dry; we still need an internal dry sum for the notch cancellation to be audible.
  const dry = c.createGain(); dry.gain.value = 0.7;
  const wet = c.createGain(); wet.gain.value = 0.9;
  const stages = [400, 800, 1600, 3200].map((f) => {
    const ap = c.createBiquadFilter(); ap.type = "allpass"; ap.frequency.value = f; ap.Q.value = 2; return ap;
  });
  stages.reduce<AudioNode>((prev, cur) => { prev.connect(cur); return cur; }, input).connect(wet).connect(out);
  input.connect(dry).connect(out);
  const lfo = c.createOscillator(); lfo.frequency.value = 0.5; lfo.type = "sine";
  const depth = c.createGain(); depth.gain.value = 800;
  lfo.connect(depth);
  stages.forEach((s) => depth.connect(s.frequency));
  lfo.start();
  const fb = c.createGain(); fb.gain.value = 0.5;
  stages[stages.length - 1].connect(fb).connect(stages[0]);
  return {
    kind: "phaser", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "rate") lfo.frequency.value = n;
      else if (p === "depth") depth.gain.value = n;
      else if (p === "feedback") fb.gain.value = Math.max(0, Math.min(0.9, n));
      else if (p === "wet") wet.gain.value = n;
    },
    meta: () => ({ rate: lfo.frequency.value }),
    dispose() { try { lfo.stop(); } catch {} },
  };
};

// ---- Glue Compressor ---------------------------------------------------
export const makeGlueComp = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = 0.02;
  comp.release.value = 0.2; comp.knee.value = 10;
  const makeup = c.createGain(); makeup.gain.value = 1.5;
  input.connect(comp).connect(makeup).connect(out);
  return {
    kind: "glue", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "threshold") comp.threshold.value = n;
      else if (p === "ratio") comp.ratio.value = n;
      else if (p === "attack") comp.attack.value = n;
      else if (p === "release") comp.release.value = n;
      else if (p === "makeup") makeup.gain.value = n;
    },
    meta: () => ({ reduction: comp.reduction }),
    dispose() {},
  };
};

// ---- Limiter -----------------------------------------------------------
export const makeLimiter = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const pre = c.createGain(); pre.gain.value = 1;
  // Lookahead — small delay so the compressor can react before peaks arrive.
  const lookahead = c.createDelay(0.02); lookahead.delayTime.value = 0.005;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -3; comp.ratio.value = 20; comp.attack.value = 0.001;
  comp.release.value = 0.05; comp.knee.value = 0;
  input.connect(pre).connect(lookahead).connect(comp).connect(out);
  return {
    kind: "glue", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "gain") pre.gain.value = n;
      else if (p === "ceiling") comp.threshold.value = n;
      else if (p === "release") comp.release.value = n;
    },
    meta: () => ({ reduction: comp.reduction }),
    dispose() {},
  };
};

// ---- Bus ---------------------------------------------------------------

// ============================================================
// NEW DEVICE FACTORIES (Phase 1 build-out)
// All emit 100% wet — DeviceEngine owns dry path for clean A/B.
// ============================================================

// ---- EQ Eight ----------------------------------------------------------
export const makeEQ8 = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const freqs = [60, 150, 350, 800, 1800, 4000, 8000, 12000];
  const bands = freqs.map((f, i) => {
    const b = c.createBiquadFilter();
    b.type = i === 0 ? "lowshelf" : i === 7 ? "highshelf" : "peaking";
    b.frequency.value = f; b.Q.value = 1; b.gain.value = 0;
    return b;
  });
  bands.reduce<AudioNode>((p, n) => { p.connect(n); return n; }, input).connect(out);
  return {
    kind: "eq8", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      const m = /^b(\d)(g|f|q)$/.exec(p);
      if (!m) return;
      const i = +m[1]; const k = m[2];
      if (!bands[i]) return;
      if (k === "g") bands[i].gain.value = n;
      else if (k === "f") bands[i].frequency.value = n;
      else if (k === "q") bands[i].Q.value = n;
    },
    meta: () => ({}),
    dispose() {},
  };
};

// ---- Gate --------------------------------------------------------------
export const makeGate = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  // Use a steep expander via inverted compressor approximation: detect with analyser, drive a GainNode.
  const det = c.createAnalyser(); det.fftSize = 256;
  const vca = c.createGain(); vca.gain.value = 1;
  input.connect(det);
  input.connect(vca).connect(out);
  let threshold = -40; // dB
  let attack = 0.005; let release = 0.1;
  const buf = new Uint8Array(det.fftSize);
  let raf = 0;
  const tick = () => {
    det.getByteTimeDomainData(buf);
    let max = 0; for (let i = 0; i < buf.length; i++) { const v = Math.abs(buf[i] - 128); if (v > max) max = v; }
    const lin = max / 128;
    const db = 20 * Math.log10(Math.max(0.0001, lin));
    const target = db > threshold ? 1 : 0;
    const t = c.currentTime;
    vca.gain.cancelScheduledValues(t);
    vca.gain.setTargetAtTime(target, t, target ? attack : release);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return {
    kind: "gate", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "threshold") threshold = n;
      else if (p === "attack") attack = Math.max(0.001, n);
      else if (p === "release") release = Math.max(0.005, n);
    },
    meta: () => ({ open: vca.gain.value }),
    dispose() { cancelAnimationFrame(raf); },
  };
};

// ---- Overdrive ---------------------------------------------------------
export const makeOverdrive = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const pre = c.createGain(); pre.gain.value = 1;
  const shaper = c.createWaveShaper(); shaper.oversample = "4x";
  const tone = c.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = 4000; tone.Q.value = 0.7;
  const post = c.createGain(); post.gain.value = 0.6;
  let driveAmt = 0.3;
  const buildCurve = (k: number) => {
    const n = 4096; const curve = new Float32Array(n); const g = 1 + k * 30;
    for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = Math.tanh(x * g); }
    return curve;
  };
  shaper.curve = buildCurve(driveAmt);
  input.connect(pre).connect(shaper).connect(tone).connect(post).connect(out);
  return {
    kind: "overdrive", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "drive") { driveAmt = Math.max(0, Math.min(1, n)); shaper.curve = buildCurve(driveAmt); }
      else if (p === "tone") tone.frequency.value = n;
      else if (p === "output") post.gain.value = n;
    },
    meta: () => ({ drive: driveAmt }),
    dispose() {},
  };
};

// ---- Erosion -----------------------------------------------------------
// Noise/sine modulated short delay → adds digital grit.
export const makeErosion = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const wet = c.createGain(); wet.gain.value = 0.4;
  const dryInternal = c.createGain(); dryInternal.gain.value = 1;
  const delay = c.createDelay(0.005); delay.delayTime.value = 0.0008;
  const lfo = c.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 80;
  const lfoAmt = c.createGain(); lfoAmt.gain.value = 0.0006;
  lfo.connect(lfoAmt).connect(delay.delayTime); lfo.start();
  input.connect(dryInternal).connect(out);
  input.connect(delay).connect(wet).connect(out);
  return {
    kind: "erosion", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "freq") lfo.frequency.value = n;
      else if (p === "width") lfoAmt.gain.value = n / 1000;
      else if (p === "amount") wet.gain.value = n;
    },
    meta: () => ({}),
    dispose() { try { lfo.stop(); } catch {} },
  };
};

// ---- Redux (bitcrush + downsample via WaveShaper + sample-and-hold delay) ----
export const makeRedux = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const shaper = c.createWaveShaper();
  let bits = 8;
  const buildCurve = (b: number) => {
    const steps = Math.pow(2, Math.max(1, Math.min(16, b)));
    const n = 4096; const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = Math.round(x * steps) / steps; }
    return curve;
  };
  shaper.curve = buildCurve(bits);
  // Downsample approximation: lowpass to mimic reduced sample rate
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 8000;
  input.connect(shaper).connect(lp).connect(out);
  return {
    kind: "redux", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "bits") { bits = n; shaper.curve = buildCurve(bits); }
      else if (p === "downsample") {
        // Map 1..20 → 22000..1000 Hz lowpass cutoff
        const cutoff = Math.max(500, 22000 / Math.max(1, n));
        lp.frequency.value = cutoff;
      }
    },
    meta: () => ({ bits }),
    dispose() {},
  };
};

// ---- Flanger -----------------------------------------------------------
export const makeFlanger = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const dryInner = c.createGain(); dryInner.gain.value = 0.7;
  const wet = c.createGain(); wet.gain.value = 0.7;
  const delay = c.createDelay(0.02); delay.delayTime.value = 0.005;
  const fb = c.createGain(); fb.gain.value = 0.5;
  const lfo = c.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 0.4;
  const lfoAmt = c.createGain(); lfoAmt.gain.value = 0.003;
  lfo.connect(lfoAmt).connect(delay.delayTime); lfo.start();
  input.connect(dryInner).connect(out);
  input.connect(delay).connect(wet).connect(out);
  delay.connect(fb).connect(delay);
  return {
    kind: "flanger", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "rate") lfo.frequency.value = n;
      else if (p === "depth") lfoAmt.gain.value = n / 1000;
      else if (p === "feedback") fb.gain.value = Math.max(0, Math.min(0.9, n));
      else if (p === "wet") wet.gain.value = n;
    },
    meta: () => ({}),
    dispose() { try { lfo.stop(); } catch {} },
  };
};

// ---- Vibrato -----------------------------------------------------------
export const makeVibrato = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const delay = c.createDelay(0.05); delay.delayTime.value = 0.01;
  const lfo = c.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 5;
  const lfoAmt = c.createGain(); lfoAmt.gain.value = 0.004;
  lfo.connect(lfoAmt).connect(delay.delayTime); lfo.start();
  input.connect(delay).connect(out);
  return {
    kind: "vibrato", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "rate") lfo.frequency.value = n;
      else if (p === "depth") lfoAmt.gain.value = n / 1000;
    },
    meta: () => ({}),
    dispose() { try { lfo.stop(); } catch {} },
  };
};

// ---- Echo (modern delay with filter + ducking) -------------------------
export const makeEcho = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const wet = c.createGain(); wet.gain.value = 0.6;
  const dL = c.createDelay(2); dL.delayTime.value = 0.375;
  const dR = c.createDelay(2); dR.delayTime.value = 0.5;
  const merger = c.createChannelMerger(2);
  const splitter = c.createChannelSplitter(2);
  const fbL = c.createGain(); fbL.gain.value = 0.45;
  const fbR = c.createGain(); fbR.gain.value = 0.45;
  const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 200;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6000;
  input.connect(splitter);
  splitter.connect(dL, 0); splitter.connect(dR, 1);
  dL.connect(fbL).connect(dL);
  dR.connect(fbR).connect(dR);
  dL.connect(merger, 0, 0); dR.connect(merger, 0, 1);
  merger.connect(hp).connect(lp).connect(wet).connect(out);
  return {
    kind: "echo", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "timeL") dL.delayTime.value = n;
      else if (p === "timeR") dR.delayTime.value = n;
      else if (p === "feedback") { fbL.gain.value = n; fbR.gain.value = n; }
      else if (p === "hp") hp.frequency.value = n;
      else if (p === "lp") lp.frequency.value = n;
      else if (p === "wet") wet.gain.value = n;
    },
    meta: () => ({}),
    dispose() {},
  };
};

// ---- Grain Delay -------------------------------------------------------
// Granular-ish: delay + pitch via playbackRate workaround using detuned osc bank is too heavy.
// Approximation: short delay + heavy modulation + feedback.
export const makeGrainDelay = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const wet = c.createGain(); wet.gain.value = 0.6;
  const delay = c.createDelay(2); delay.delayTime.value = 0.3;
  const fb = c.createGain(); fb.gain.value = 0.5;
  const lfo = c.createOscillator(); lfo.type = "triangle"; lfo.frequency.value = 8;
  const lfoAmt = c.createGain(); lfoAmt.gain.value = 0.05;
  lfo.connect(lfoAmt).connect(delay.delayTime); lfo.start();
  input.connect(delay).connect(wet).connect(out);
  delay.connect(fb).connect(delay);
  return {
    kind: "grain", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "time") delay.delayTime.value = n;
      else if (p === "feedback") fb.gain.value = Math.max(0, Math.min(0.95, n));
      else if (p === "spray") lfoAmt.gain.value = n / 100;
      else if (p === "rate") lfo.frequency.value = n;
      else if (p === "wet") wet.gain.value = n;
    },
    meta: () => ({}),
    dispose() { try { lfo.stop(); } catch {} },
  };
};

// ---- Filter Delay ------------------------------------------------------
// Three independent band-passed delays.
export const makeFilterDelay = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const wet = c.createGain(); wet.gain.value = 0.7;
  const bands = [
    { f: 300, t: 0.25 },
    { f: 1200, t: 0.375 },
    { f: 4000, t: 0.5 },
  ].map(({ f, t }) => {
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = 2;
    const d = c.createDelay(2); d.delayTime.value = t;
    const fb = c.createGain(); fb.gain.value = 0.4;
    input.connect(bp).connect(d);
    d.connect(fb).connect(d);
    d.connect(wet);
    return { bp, d, fb };
  });
  wet.connect(out);
  return {
    kind: "filterdelay", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      const m = /^([lmh])(t|fb|f)$/.exec(p);
      if (!m) { if (p === "wet") wet.gain.value = n; return; }
      const i = m[1] === "l" ? 0 : m[1] === "m" ? 1 : 2;
      const k = m[2];
      if (k === "t") bands[i].d.delayTime.value = n;
      else if (k === "fb") bands[i].fb.gain.value = Math.max(0, Math.min(0.95, n));
      else if (k === "f") bands[i].bp.frequency.value = n;
    },
    meta: () => ({}),
    dispose() {},
  };
};

// ---- Drum Buss ---------------------------------------------------------
// HP → drive → comp → low boost.
export const makeDrumBuss = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 30;
  const drive = c.createWaveShaper(); drive.oversample = "2x";
  let driveAmt = 0.2;
  const buildCurve = (k: number) => {
    const n = 2048; const curve = new Float32Array(n); const g = 1 + k * 12;
    for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = Math.tanh(x * g); }
    return curve;
  };
  drive.curve = buildCurve(driveAmt);
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.01; comp.release.value = 0.15;
  const boom = c.createBiquadFilter(); boom.type = "lowshelf"; boom.frequency.value = 100; boom.gain.value = 3;
  input.connect(hp).connect(drive).connect(comp).connect(boom).connect(out);
  return {
    kind: "drumbuss", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "drive") { driveAmt = n; drive.curve = buildCurve(driveAmt); }
      else if (p === "comp") comp.threshold.value = n;
      else if (p === "boom") boom.gain.value = n;
      else if (p === "hp") hp.frequency.value = n;
    },
    meta: () => ({ reduction: comp.reduction }),
    dispose() {},
  };
};

// ---- Auto Pan ----------------------------------------------------------
export const makeAutoPan = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const pannerL = c.createGain(); pannerL.gain.value = 0.5;
  const pannerR = c.createGain(); pannerR.gain.value = 0.5;
  const merger = c.createChannelMerger(2);
  const lfo = c.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 1;
  const lfoAmt = c.createGain(); lfoAmt.gain.value = 0.5;
  const lfoInv = c.createGain(); lfoInv.gain.value = -1;
  const offsetL = c.createConstantSource(); offsetL.offset.value = 0.5; offsetL.start();
  const offsetR = c.createConstantSource(); offsetR.offset.value = 0.5; offsetR.start();
  lfo.connect(lfoAmt);
  lfoAmt.connect(pannerL.gain);
  lfoAmt.connect(lfoInv).connect(pannerR.gain);
  offsetL.connect(pannerL.gain);
  offsetR.connect(pannerR.gain);
  lfo.start();
  input.connect(pannerL).connect(merger, 0, 0);
  input.connect(pannerR).connect(merger, 0, 1);
  merger.connect(out);
  return {
    kind: "autopan", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "rate") lfo.frequency.value = n;
      else if (p === "amount") lfoAmt.gain.value = Math.max(0, Math.min(0.5, n));
    },
    meta: () => ({}),
    dispose() { try { lfo.stop(); offsetL.stop(); offsetR.stop(); } catch {} },
  };
};

// ---- Frequency Shifter (ring-mod approximation) ------------------------
export const makeFreqShift = (): DeviceNode => {
  const c = ctxOrThrow();
  const input = c.createGain();
  const out = c.createGain();
  const wet = c.createGain(); wet.gain.value = 1;
  const ringGain = c.createGain(); ringGain.gain.value = 0;
  const lfo = c.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 100;
  lfo.connect(ringGain.gain); lfo.start();
  input.connect(ringGain).connect(wet).connect(out);
  return {
    kind: "freqshift", input, output: out,
    bypass() {},
    set(p, v) {
      const n = +v;
      if (p === "shift") lfo.frequency.value = Math.max(0.1, Math.abs(n));
      else if (p === "wet") wet.gain.value = n;
    },
    meta: () => ({}),
    dispose() { try { lfo.stop(); } catch {} },
  };
};

export class Bus {
  ctx: AudioContext;
  input: GainNode;
  output: GainNode;
  analyser: AnalyserNode;
  devices: DeviceNode[] = [];
  constructor() {
    this.ctx = ctxOrThrow();
    this.input = this.ctx.createGain();
    this.output = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.input.connect(this.output);
    this.output.connect(this.analyser).connect(getMaster());
  }
  rewire() {
    try { this.input.disconnect(); } catch {}
    this.devices.forEach((d) => { try { d.input.disconnect(); d.output.disconnect(); } catch {} });
    let cursor: AudioNode = this.input;
    this.devices.forEach((d) => { cursor.connect(d.input); cursor = d.output; });
    cursor.connect(this.output);
  }
  add(d: DeviceNode) { this.devices.push(d); this.rewire(); }
  remove(i: number) { const [d] = this.devices.splice(i, 1); d?.dispose(); this.rewire(); }
  reorder(from: number, to: number) {
    const [d] = this.devices.splice(from, 1);
    this.devices.splice(to, 0, d);
    this.rewire();
  }
  bypassAll(b: boolean) { this.devices.forEach((d) => d.bypass(b)); }
  dispose() {
    try { this.input.disconnect(); this.output.disconnect(); } catch {}
    this.devices.forEach((d) => d.dispose());
  }
}

export const DEVICE_FACTORY: Record<DeviceKind, () => DeviceNode> = {
  eq3: makeEQ3, comp: makeComp, sat: makeSat, reverb: makeReverb,
  delay: makeDelay, filter: makeAutoFilter, chorus: makeChorus,
  phaser: makePhaser, glue: makeGlueComp,
  eq8: makeEQ8, gate: makeGate, overdrive: makeOverdrive, erosion: makeErosion,
  redux: makeRedux, flanger: makeFlanger, vibrato: makeVibrato, echo: makeEcho,
  grain: makeGrainDelay, filterdelay: makeFilterDelay, drumbuss: makeDrumBuss,
  autopan: makeAutoPan, freqshift: makeFreqShift,
};

export const DEVICE_LABELS: Record<DeviceKind, string> = {
  eq3: "EQ THREE", comp: "COMPRESSOR", sat: "SATURATOR", reverb: "REVERB",
  delay: "DELAY", filter: "AUTO FILTER", chorus: "CHORUS",
  phaser: "PHASER", glue: "GLUE COMP",
  eq8: "EQ EIGHT", gate: "GATE", overdrive: "OVERDRIVE", erosion: "EROSION",
  redux: "REDUX", flanger: "FLANGER", vibrato: "VIBRATO", echo: "ECHO",
  grain: "GRAIN DELAY", filterdelay: "FILTER DELAY", drumbuss: "DRUM BUSS",
  autopan: "AUTO PAN", freqshift: "FREQ SHIFTER",
};
