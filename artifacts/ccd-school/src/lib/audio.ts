// Web Audio engine — synthesised sources, no asset files.
// Mobile-safe: ctx is created on first user gesture, unlocked flips only after
// successful resume() + iOS silent-buffer prime.
let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let unlocked = false;
const unlockListeners = new Set<() => void>();

export const onAudioUnlocked = (cb: () => void) => {
  if (unlocked) {
    cb();
    return () => {};
  }
  unlockListeners.add(cb);
  return () => unlockListeners.delete(cb);
};
export const isAudioUnlocked = () => unlocked;

function notifyUnlocked() {
  if (unlocked) return;
  unlocked = true;
  unlockListeners.forEach((cb) => {
    try { cb(); } catch {}
  });
}

// iOS Safari requires playing a real silent buffer to truly enable audio
// after resume(). Without this, subsequent oscillator nodes are silent.
function primeIOS(c: AudioContext) {
  try {
    const buf = c.createBuffer(1, 1, c.sampleRate);
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.start(0);
  } catch {}
}

export const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.8;
      masterGain.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === "running" && !unlocked) {
    primeIOS(ctx);
    notifyUnlocked();
  }
  return ctx;
};

// Async unlock — call from inside a user gesture handler (button onClick).
// Returns true once the context is actually running. Use this in every
// simulator's Play button BEFORE scheduling any nodes.
export const ensureAudio = async (): Promise<boolean> => {
  const c = getCtx();
  if (!c) return false;
  if (c.state !== "running") {
    try { await c.resume(); } catch {}
  }
  if (c.state === "running") {
    primeIOS(c);
    notifyUnlocked();
    return true;
  }
  return false;
};

// Auto-attach one-time global gesture listener so the first tap/click anywhere
// triggers an explicit resume. Critical for iOS Safari.
if (typeof window !== "undefined") {
  const unlock = async () => {
    await ensureAudio();
    if (unlocked) {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("touchend", unlock);
    }
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock, { passive: true });
  window.addEventListener("touchend", unlock, { passive: true });
}

export const getMaster = (): AudioNode => {
  getCtx();
  return masterGain!;
};

export const setMasterVolume = (v: number) => {
  getCtx();
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
};

const env = (g: GainNode, t: number, attack: number, decay: number, peak = 1) => {
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
};

export const playKick = (delay = 0, dest?: AudioNode) => {
  const c = getCtx();
  if (!c) return;
  const out = dest ?? getMaster();
  const t = c.currentTime + delay + 0.002;

  // Sub layer — 808-style pitch envelope
  const sub = c.createOscillator();
  const subG = c.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(160, t);
  sub.frequency.exponentialRampToValueAtTime(45, t + 0.08);
  sub.frequency.exponentialRampToValueAtTime(38, t + 0.35);
  subG.gain.setValueAtTime(0.0001, t);
  subG.gain.exponentialRampToValueAtTime(1.1, t + 0.003);
  subG.gain.exponentialRampToValueAtTime(0.6, t + 0.04);
  subG.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  sub.connect(subG).connect(out);
  sub.start(t);
  sub.stop(t + 0.5);

  // Click transient — adds punch
  const click = c.createOscillator();
  const clickG = c.createGain();
  click.type = "triangle";
  click.frequency.setValueAtTime(1200, t);
  click.frequency.exponentialRampToValueAtTime(80, t + 0.012);
  clickG.gain.setValueAtTime(0.0001, t);
  clickG.gain.exponentialRampToValueAtTime(0.9, t + 0.001);
  clickG.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
  click.connect(clickG).connect(out);
  click.start(t);
  click.stop(t + 0.025);

  // Body noise
  const noise = c.createOscillator();
  const noiseG = c.createGain();
  noise.type = "sawtooth";
  noise.frequency.setValueAtTime(80, t);
  noise.frequency.exponentialRampToValueAtTime(40, t + 0.1);
  noiseG.gain.setValueAtTime(0.0001, t);
  noiseG.gain.exponentialRampToValueAtTime(0.18, t + 0.003);
  noiseG.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 200;
  noise.connect(lp).connect(noiseG).connect(out);
  noise.start(t);
  noise.stop(t + 0.15);
};

export const playSnare = (delay = 0, dest?: AudioNode) => {
  const c = getCtx();
  if (!c) return;
  const out = dest ?? getMaster();
  const t = c.currentTime + delay + 0.002;

  // Tonal body (tuned drum shell)
  const body = c.createOscillator();
  const bodyG = c.createGain();
  body.type = "triangle";
  body.frequency.setValueAtTime(220, t);
  body.frequency.exponentialRampToValueAtTime(150, t + 0.05);
  bodyG.gain.setValueAtTime(0.0001, t);
  bodyG.gain.exponentialRampToValueAtTime(0.6, t + 0.002);
  bodyG.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  body.connect(bodyG).connect(out);
  body.start(t);
  body.stop(t + 0.12);

  // Snare wires noise burst
  const buf = c.createBuffer(1, c.sampleRate * 0.22, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const noiseG = c.createGain();
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1800;
  hp.Q.value = 0.5;
  const bp = c.createBiquadFilter();
  bp.type = "peaking";
  bp.frequency.value = 3500;
  bp.gain.value = 6;
  bp.Q.value = 1;
  noiseG.gain.setValueAtTime(0.0001, t);
  noiseG.gain.exponentialRampToValueAtTime(0.9, t + 0.002);
  noiseG.gain.exponentialRampToValueAtTime(0.3, t + 0.04);
  noiseG.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  noise.connect(hp).connect(bp).connect(noiseG).connect(out);
  noise.start(t);
  noise.stop(t + 0.22);

  // Attack click
  const click = c.createOscillator();
  const clickG = c.createGain();
  click.type = "square";
  click.frequency.value = 800;
  clickG.gain.setValueAtTime(0.0001, t);
  clickG.gain.exponentialRampToValueAtTime(0.35, t + 0.001);
  clickG.gain.exponentialRampToValueAtTime(0.0001, t + 0.008);
  click.connect(clickG).connect(out);
  click.start(t);
  click.stop(t + 0.01);
};

export const playHat = (delay = 0, open = false, dest?: AudioNode) => {
  const c = getCtx();
  if (!c) return;
  const out = dest ?? getMaster();
  const t = c.currentTime + delay + 0.002;
  const dur = open ? 0.38 : 0.05;

  // Metallic noise — 6 detuned square oscillators (real hat emulation)
  const freqs = [205, 310, 480, 703, 1006, 1477].map((f) => f * (open ? 1 : 1.15));
  freqs.forEach((freq) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "square";
    o.frequency.value = freq;
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(hp).connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.02);
  });
};

export const playClap = (delay = 0, dest?: AudioNode) => {
  const c = getCtx();
  if (!c) return;
  const out = dest ?? getMaster();
  const t0 = c.currentTime + delay + 0.002;

  // 3 layered noise bursts — real clap is multiple hand slaps
  [0, 0.012, 0.024].forEach((offset, layer) => {
    const t = t0 + offset;
    const buf = c.createBuffer(1, c.sampleRate * 0.12, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = c.createBufferSource();
    noise.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1200 + layer * 300;
    bp.Q.value = 0.5;
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 900;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(layer === 2 ? 0.55 : 0.3, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (layer === 2 ? 0.1 : 0.04));
    noise.connect(bp).connect(hp).connect(g).connect(out);
    noise.start(t);
    noise.stop(t + 0.14);
  });
};

export const playTone = (
  freq: number,
  when = 0,
  dur = 0.5,
  type: OscillatorType = "sawtooth",
  peak = 0.2,
  dest?: AudioNode,
) => {
  const c = getCtx();
  if (!c) return;
  if (!isFinite(freq) || freq <= 0) return;
  const t = Math.max(c.currentTime + 0.05, c.currentTime + when);
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  o.type = type;
  o.frequency.value = freq;
  f.type = "lowpass";
  f.frequency.value = 2000;
  f.Q.value = 4;
  env(g, t, 0.01, dur, peak);
  o.connect(f)
    .connect(g)
    .connect(dest ?? getMaster());
  o.start(t);
  o.stop(t + dur + 0.1);
};

export const midiToFreq = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// --- Looping sources for simulators -----------------------------------------
// Each returns a "stop" function. They schedule events on the running ctx clock.

export type LoopHandle = { stop: () => void; bpm: number };

const noteNames: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};
export const noteToMidi = (n: string) => {
  const m = n.match(/^([A-G][#b]?)(-?\d)$/);
  if (!m) return 60;
  return (parseInt(m[2]) + 1) * 12 + noteNames[m[1]];
};

// Schedules drum+bass+chord loop at given bpm. dest is where audio goes.
export type SampleName = "drum-loop" | "bass-loop" | "chord-pad" | "vox-chop" | "full-mix";

export const startLoop = (name: SampleName, bpm = 100, dest?: AudioNode): LoopHandle => {
  const c = getCtx();
  if (!c) return { stop: () => {}, bpm };
  const out = dest ?? getMaster();
  const beat = 60 / bpm; // sec per beat
  const bar = beat * 4;
  let stopped = false;
  // Start scheduling slightly in the future so first events are audible.
  let nextBar = c.currentTime + 0.25;
  let firstScheduleLogged = false;
  const chordNotes = [60, 64, 67, 72]; // Cmaj
  const bassPattern = [36, 36, 43, 41]; // C C G F
  const voxPattern = [72, 74, 76, 79];

  const scheduleBar = (t: number) => {
    if (name === "drum-loop" || name === "full-mix") {
      // 4-on-the-floor + offbeat hats + snare on 2&4
      for (let b = 0; b < 4; b++) {
        playKick(t + b * beat - c.currentTime, out);
        playHat(t + b * beat + beat / 2 - c.currentTime, false, out);
      }
      playSnare(t + beat - c.currentTime, out);
      playSnare(t + 3 * beat - c.currentTime, out);
    }
    if (name === "bass-loop" || name === "full-mix") {
      bassPattern.forEach((n, i) => {
        playTone(midiToFreq(n), t + i * beat - c.currentTime, beat * 0.9, "sawtooth", 0.18, out);
      });
    }
    if (name === "chord-pad" || name === "full-mix") {
      chordNotes.forEach((n) => {
        playTone(midiToFreq(n), t - c.currentTime, bar * 0.95, "triangle", 0.06, out);
      });
    }
    if (name === "vox-chop") {
      voxPattern.forEach((n, i) => {
        playTone(midiToFreq(n), t + i * beat - c.currentTime, beat * 0.6, "sine", 0.18, out);
      });
    }
  };

  const tick = () => {
    if (stopped) return;
    // Re-sync if ctx was suspended and now running, or we fell behind
    if (nextBar < c.currentTime) nextBar = c.currentTime + 0.05;
    while (nextBar < c.currentTime + 0.3) {
      if (!firstScheduleLogged) {
        // eslint-disable-next-line no-console
        console.log("[audio] first scheduleBar", {
          name,
          bpm,
          t: nextBar,
          ctx: c.currentTime,
          ctxState: c.state,
        });
        firstScheduleLogged = true;
      }
      scheduleBar(nextBar);
      nextBar += bar;
    }
    setTimeout(tick, 60);
  };
  tick();

  return {
    stop: () => {
      stopped = true;
    },
    bpm,
  };
};

// --- UI feedback sounds -----------------------------------------------------
// Correct answer: clean bell ding
export const playCorrect = () => {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + 0.02;
  [880, 1320].forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t + i * 0.06);
    g.gain.exponentialRampToValueAtTime(0.18, t + i * 0.06 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.22);
    o.connect(g).connect(getMaster());
    o.start(t + i * 0.06);
    o.stop(t + i * 0.06 + 0.3);
  });
};

// Wrong answer: low buzz
export const playWrong = () => {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + 0.02;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sawtooth";
  o.frequency.value = 160;
  o.detune.setValueAtTime(0, t);
  o.detune.linearRampToValueAtTime(-80, t + 0.15);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 400;
  o.connect(lp).connect(g).connect(getMaster());
  o.start(t);
  o.stop(t + 0.3);
};

// Completion fanfare
export const playFanfare = () => {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + 0.05;
  const melody = [523, 659, 784, 1047];
  melody.forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    const st = t + i * 0.12;
    g.gain.setValueAtTime(0.0001, st);
    g.gain.exponentialRampToValueAtTime(0.2, st + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, st + 0.18);
    o.connect(g).connect(getMaster());
    o.start(st);
    o.stop(st + 0.25);
  });
};
