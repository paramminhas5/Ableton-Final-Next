/**
 * Plays your track. Synthesised voices, one bar of 16 steps, looped.
 * Starts only from a press of play; stops on stop or when the page goes away.
 * Reads the latest track on every step, so knob turns are heard straight away.
 */
import { ensureAudio, getCtx, getMaster, midiToFreq } from "./audio";
import type { Layer, Track } from "./track";

type Ctx = AudioContext;
let noiseBuf: AudioBuffer | null = null;
const noise = (c: Ctx) => {
  if (noiseBuf && noiseBuf.sampleRate === c.sampleRate) return noiseBuf;
  const b = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return (noiseBuf = b);
};

let fx: { verbIn: GainNode; echoIn: GainNode } | null = null;
let destNode: AudioNode | null = null;
function buses(c: Ctx) {
  if (fx) return fx;
  const out = getMaster();
  // small plate: two feedback delays, darkened
  const verbIn = c.createGain();
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3500;
  const ret = c.createGain(); ret.gain.value = 0.35;
  [0.029, 0.041, 0.053].forEach((t, i) => {
    const d = c.createDelay(); d.delayTime.value = t;
    const fb = c.createGain(); fb.gain.value = 0.72 - i * 0.04;
    verbIn.connect(d); d.connect(fb); fb.connect(d); d.connect(lp);
  });
  lp.connect(ret); ret.connect(out);
  const echoIn = c.createGain();
  const ed = c.createDelay(1); ed.delayTime.value = 0.375;
  const efb = c.createGain(); efb.gain.value = 0.38;
  const elp = c.createBiquadFilter(); elp.type = "lowpass"; elp.frequency.value = 2500;
  echoIn.connect(ed); ed.connect(elp); elp.connect(efb); efb.connect(ed); elp.connect(out);
  return (fx = { verbIn, echoIn });
}

const lin = (a: number, b: number, x: number) => a + (b - a) * x;
const expo = (a: number, b: number, x: number) => a * Math.pow(b / a, x);

function voice(c: Ctx, l: Layer, step: number, t: number, stepDur: number, duck = 1) {
  const [p0, p1, p2, p3raw] = l.params;
  const p3 = p3raw * duck;
  const out = destNode ?? getMaster();
  const { verbIn, echoIn } = buses(c);
  const g = c.createGain();
  g.gain.value = 0;
  g.connect(out);
  const send = (bus: AudioNode, amt: number) => { if (amt > 0.01) { const s = c.createGain(); s.gain.value = amt; g.connect(s); s.connect(bus); } };
  const level = p3 * 0.9;

  switch (l.kind) {
    case "kick": {
      const o = c.createOscillator();
      const f = expo(40, 80, p0);
      o.frequency.setValueAtTime(f * 3.2, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
      const dec = lin(0.15, 0.7, p1);
      g.gain.setValueAtTime(level, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      if (p2 > 0.02) {
        const ws = c.createWaveShaper();
        const k = p2 * 40, n = 256, curve = new Float32Array(n);
        for (let i = 0; i < n; i++) { const x = (i / n) * 2 - 1; curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); }
        ws.curve = curve; o.connect(ws); ws.connect(g);
      } else o.connect(g);
      o.start(t); o.stop(t + dec + 0.05);
      break;
    }
    case "hats": case "clap": case "perc": {
      const src = c.createBufferSource(); src.buffer = noise(c);
      const f = c.createBiquadFilter();
      let dec = 0.05;
      if (l.kind === "hats") { f.type = "highpass"; f.frequency.value = expo(5000, 11000, p0); dec = lin(0.02, 0.25, p1); }
      if (l.kind === "clap") { f.type = "bandpass"; f.frequency.value = expo(800, 2400, p0); f.Q.value = 1.2; dec = lin(0.08, 0.35, p1); send(verbIn, p2 * 0.8); }
      if (l.kind === "perc") { f.type = "bandpass"; f.frequency.value = expo(1500, 6000, p0); f.Q.value = 4; dec = lin(0.02, 0.15, p1); }
      src.connect(f);
      if (l.kind === "perc" && c.createStereoPanner) { const pn = c.createStereoPanner(); pn.pan.value = p2 * 2 - 1; f.connect(pn); pn.connect(g); } else f.connect(g);
      const lv = l.kind === "hats" ? level * 0.5 : level * 0.8;
      g.gain.setValueAtTime(lv, t);
      if (l.kind === "clap") { g.gain.setValueAtTime(lv * 0.3, t + 0.01); g.gain.setValueAtTime(lv, t + 0.02); }
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      src.start(t); src.stop(t + dec + 0.05);
      break;
    }
    case "bass": case "lead": {
      const o = c.createOscillator(); o.type = "sawtooth";
      const note = l.notes[step] ?? 45;
      const prev = l.notes[(step + 15) % 16] ?? note;
      const glide = l.kind === "bass" ? p2 * 0.12 : 0;
      o.frequency.setValueAtTime(midiToFreq(glide ? prev : note), t);
      if (glide) o.frequency.exponentialRampToValueAtTime(midiToFreq(note), t + glide);
      const f = c.createBiquadFilter(); f.type = "lowpass";
      const cut = expo(120, 6000, p0);
      f.Q.value = lin(0.5, 14, p1);
      f.frequency.setValueAtTime(cut * 2.2, t);
      f.frequency.exponentialRampToValueAtTime(cut, t + 0.12);
      o.connect(f); f.connect(g);
      const len = stepDur * (l.kind === "bass" ? 1.6 : 1.9);
      const lv = level * (l.kind === "bass" ? 0.45 : 0.22);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(lv, t + 0.008);
      g.gain.setValueAtTime(lv, t + len * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      if (l.kind === "lead") send(echoIn, p2 * 0.6);
      o.start(t); o.stop(t + len + 0.05);
      break;
    }
    case "chords": case "pad": {
      const root = l.notes[0] ?? 57;
      const prog = [[0, 3, 7, 10], [-4, 0, 3, 7], [-2, 2, 5, 9], [-5, -1, 2, 7]];
      const chord = prog[Math.floor(step / 4) % prog.length === 0 ? 0 : step < 8 ? 0 : 1];
      const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = expo(400, 8000, p0);
      f.connect(g);
      const len = l.kind === "pad" ? stepDur * 15 : stepDur * 7;
      const atk = lin(0.005, l.kind === "pad" ? 1.2 : 0.4, p1);
      const lv = level * (l.kind === "pad" ? 0.09 : 0.12);
      chord.forEach(iv => {
        const o = c.createOscillator(); o.type = l.kind === "pad" ? "sawtooth" : "triangle";
        o.frequency.value = midiToFreq(root + iv + (l.kind === "pad" ? 0 : 12));
        if (l.kind === "pad") o.detune.value = (Math.random() - 0.5) * 14;
        o.connect(f); o.start(t); o.stop(t + len + 0.1);
      });
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(lv, t + atk);
      g.gain.setValueAtTime(lv, t + Math.max(atk, len * 0.75));
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      send(verbIn, p2);
      break;
    }
  }
}

export type Player = { stop: () => void };
let current: { timer: number; stop: () => void } | null = null;

/**
 * Start looping. `get` is called on every step so edits are heard live.
 * `onStep` reports the step being played (for the playhead), which is driven by your press of play.
 */
export async function playTrack(get: () => Track, onStep?: (s: number) => void, opts?: { solo?: string; once?: boolean; dest?: AudioNode }): Promise<Player> {
  stopTrack();
  await ensureAudio();
  destNode = opts?.dest ?? null;
  const c = getCtx();
  if (!c) return { stop() {} };
  let step = 0;
  let next = c.currentTime + 0.06;
  let stopped = false;
  const tick = () => {
    if (stopped) return;
    const tr = get();
    const stepDur = 60 / tr.bpm / 4;
    while (next < c.currentTime + 0.12) {
      const kickHit = tr.layers.some(k => k.kind === "kick" && !k.mute && k.steps[step]);
      for (const l of tr.layers) {
        if (l.mute || (opts?.solo && l.id !== opts.solo)) continue;
        if (!l.steps[step]) continue;
        const swing = l.kind === "hats" && step % 2 === 1 ? l.params[2] * stepDur * 0.5 : 0;
        const duck = l.sidechain && l.kind !== "kick" && kickHit ? 0.35 : 1;
        voice(c, l, step, next + swing, stepDur, duck);
      }
      const s = step, at = next;
      if (onStep) window.setTimeout(() => !stopped && onStep(s), Math.max(0, (at - c.currentTime) * 1000));
      next += stepDur;
      step = (step + 1) % 16;
      if (opts?.once && step === 0) { window.setTimeout(() => stop(), (next - c.currentTime) * 1000 + 300); stopped = true; return; }
    }
  };
  const timer = window.setInterval(tick, 25);
  tick();
  const stop = () => { stopped = true; window.clearInterval(timer); onStep?.(-1); if (current?.timer === timer) current = null; };
  current = { timer, stop };
  return { stop };
}

export function stopTrack() { current?.stop(); current = null; }

/** One hit of a layer, for when a step key or knob is touched. */
export async function audition(l: Layer, step = 0) {
  await ensureAudio();
  const c = getCtx();
  if (!c) return;
  voice(c, { ...l, steps: l.steps.map(() => true) }, step, c.currentTime + 0.01, 60 / 120 / 4);
}
