// DeviceChainSim — radically simplified, learning-focused.
// Goal: students must clearly hear the difference each effect makes.
//
// Design:
// - Self-contained: own AudioContext source loop, own master output.
// - 4 effects, each with an on/off switch and an "amount" knob.
// - All effects always wired in series; on/off just sets wet=0 or wet=1.
// - Big A/B button bypasses the entire chain.
// - Tiny status row: Audio / Source / Active count / Output level.
import { useEffect, useMemo, useRef, useState } from "react";
import { getCtx, getMaster, startLoop, type SampleName, type LoopHandle } from "@/lib/audio";

type FxId = "eq" | "comp" | "drive" | "space";

type FxDef = {
  id: FxId;
  label: string;
  color: string;
  blurb: string;
  amountLabel: string;
  build: (ctx: AudioContext) => { input: AudioNode; output: AudioNode; setAmount: (v: number) => void; dispose: () => void };
};

const FX: FxDef[] = [
  {
    id: "eq",
    label: "TONE (LOWPASS)",
    color: "bg-acid",
    blurb: "Tilts the brightness of the sound down. Lower = darker, muffled.",
    amountLabel: "CUTOFF",
    build: (c) => {
      const inN = c.createGain();
      const f = c.createBiquadFilter();
      f.type = "lowpass"; f.frequency.value = 18000; f.Q.value = 0.7;
      const outN = c.createGain();
      inN.connect(f).connect(outN);
      return {
        input: inN, output: outN,
        setAmount: (v) => { f.frequency.value = 100 + Math.pow(v, 2) * 17900; },
        dispose: () => { try { inN.disconnect(); f.disconnect(); outN.disconnect(); } catch {} },
      };
    },
  },
  {
    id: "comp",
    label: "COMPRESSOR",
    color: "bg-volt text-bone",
    blurb: "Squashes loud peaks so the whole sound feels louder and tighter.",
    amountLabel: "AMOUNT",
    build: (c) => {
      const inN = c.createGain();
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -10; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.15;
      const makeup = c.createGain(); makeup.gain.value = 1;
      const outN = c.createGain();
      inN.connect(comp).connect(makeup).connect(outN);
      return {
        input: inN, output: outN,
        setAmount: (v) => {
          comp.threshold.value = -10 - v * 40;
          comp.ratio.value = 2 + v * 18;
          makeup.gain.value = 1 + v * 1.5;
        },
        dispose: () => { try { inN.disconnect(); comp.disconnect(); makeup.disconnect(); outN.disconnect(); } catch {} },
      };
    },
  },
  {
    id: "drive",
    label: "SATURATION",
    color: "bg-sun",
    blurb: "Adds warmth and grit. Pushes the sound through a non-linear curve.",
    amountLabel: "DRIVE",
    build: (c) => {
      const inN = c.createGain();
      const pre = c.createGain(); pre.gain.value = 1;
      const ws = c.createWaveShaper(); ws.oversample = "4x";
      const post = c.createGain(); post.gain.value = 1;
      const outN = c.createGain();
      const setCurve = (k: number) => {
        const n = 1024; const curve = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const x = (i / (n - 1)) * 2 - 1;
          curve[i] = Math.tanh(x * (1 + k * 20));
        }
        ws.curve = curve;
      };
      setCurve(0.0);
      inN.connect(pre).connect(ws).connect(post).connect(outN);
      return {
        input: inN, output: outN,
        setAmount: (v) => { pre.gain.value = 1 + v * 4; setCurve(v); post.gain.value = 1 / (1 + v * 1.4); },
        dispose: () => { try { inN.disconnect(); pre.disconnect(); ws.disconnect(); post.disconnect(); outN.disconnect(); } catch {} },
      };
    },
  },
  {
    id: "space",
    label: "REVERB",
    color: "bg-hot text-bone",
    blurb: "Adds a room around the sound. More = farther away, more washy.",
    amountLabel: "WET",
    build: (c) => {
      const inN = c.createGain();
      const dry = c.createGain(); dry.gain.value = 1;
      const send = c.createGain(); send.gain.value = 0;
      const conv = c.createConvolver();
      const len = c.sampleRate * 2.2;
      const ir = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
      }
      conv.buffer = ir;
      const outN = c.createGain();
      inN.connect(dry).connect(outN);
      inN.connect(send).connect(conv).connect(outN);
      return {
        input: inN, output: outN,
        setAmount: (v) => { send.gain.value = v * 1.2; dry.gain.value = 1 - v * 0.3; },
        dispose: () => { try { inN.disconnect(); dry.disconnect(); send.disconnect(); conv.disconnect(); outN.disconnect(); } catch {} },
      };
    },
  },
];

const SOURCES: { id: SampleName; label: string }[] = [
  { id: "drum-loop", label: "DRUMS" },
  { id: "chord-pad", label: "CHORDS" },
  { id: "bass-loop", label: "BASS" },
  { id: "full-mix", label: "FULL MIX" },
];

type FxState = { on: boolean; amount: number };

export function DeviceChainSim() {
  const [playing, setPlaying] = useState(false);
  const [sample, setSample] = useState<SampleName>("drum-loop");
  const [bypassAll, setBypassAll] = useState(false);
  const [state, setState] = useState<Record<FxId, FxState>>({
    eq:    { on: false, amount: 0.5 },
    comp:  { on: false, amount: 0.5 },
    drive: { on: false, amount: 0.4 },
    space: { on: false, amount: 0.4 },
  });
  const [level, setLevel] = useState(0);

  const nodesRef = useRef<{ src: GainNode; bypass: GainNode; tap: AnalyserNode; out: GainNode; chain: ReturnType<FxDef["build"]>[]; loop: LoopHandle | null } | null>(null);

  // Build a stable graph once. Source → fx1 → fx2 → fx3 → fx4 → tap → master.
  // Per-effect "on" toggles wet gain inside the effect by setting amount=0 or stored value.
  useEffect(() => {
    const c = getCtx(); if (!c) return;
    const src = c.createGain(); src.gain.value = 0.9;
    const bypass = c.createGain(); bypass.gain.value = 0;
    const tap = c.createAnalyser(); tap.fftSize = 1024;
    const out = c.createGain(); out.gain.value = 1;
    const chain = FX.map((def) => def.build(c));
    // wire chain
    let prev: AudioNode = src;
    chain.forEach((n) => { prev.connect(n.input); prev = n.output; });
    prev.connect(tap).connect(out).connect(getMaster());
    // bypass branch
    src.connect(bypass).connect(out);
    nodesRef.current = { src, bypass, tap, out, chain, loop: null };
    return () => {
      try { nodesRef.current?.loop?.stop(); } catch {}
      try { src.disconnect(); bypass.disconnect(); tap.disconnect(); out.disconnect(); } catch {}
      chain.forEach((n) => n.dispose());
      nodesRef.current = null;
    };
  }, []);

  // Apply state changes (on/off, amount, bypass).
  useEffect(() => {
    const n = nodesRef.current; if (!n) return;
    FX.forEach((def, i) => {
      const s = state[def.id];
      // "on" gates the effect by setting its internal amount to 0 when off
      n.chain[i].setAmount(s.on ? s.amount : 0);
    });
    n.bypass.gain.value = bypassAll ? 1 : 0;
    n.out.gain.value = bypassAll ? 0 : 1;
    // re-route: when bypass, mute fx chain via out gain; bypass branch carries source.
  }, [state, bypassAll]);

  // Level meter
  useEffect(() => {
    let raf = 0;
    const buf = new Uint8Array(256);
    const tick = () => {
      const n = nodesRef.current;
      if (n) {
        n.tap.getByteTimeDomainData(buf);
        let m = 0; for (let i = 0; i < buf.length; i++) { const v = Math.abs(buf[i] - 128); if (v > m) m = v; }
        setLevel(m / 128);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const play = async () => {
    const c = getCtx(); if (!c) return;
    if (c.state !== "running") { try { await c.resume(); } catch {} }
    const n = nodesRef.current; if (!n) return;
    n.loop?.stop();
    n.loop = startLoop(sample, 100, n.src);
    setPlaying(true);
  };
  const stop = () => {
    nodesRef.current?.loop?.stop();
    if (nodesRef.current) nodesRef.current.loop = null;
    setPlaying(false);
  };
  const onSample = (s: SampleName) => {
    setSample(s);
    if (playing) { stop(); setTimeout(() => { setSample(s); play(); }, 30); }
  };
  const setFx = (id: FxId, patch: Partial<FxState>) => setState((cur) => ({ ...cur, [id]: { ...cur[id], ...patch } }));

  const activeCount = useMemo(() => Object.values(state).filter((s) => s.on).length, [state]);

  return (
    <div className="space-y-3">
      {/* Transport */}
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-2 items-center">
        <button
          onClick={() => (playing ? stop() : play())}
          className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}
        >{playing ? "■ STOP" : "▶ PLAY"}</button>
        <div className="flex gap-1 flex-wrap">
          {SOURCES.map((s) => (
            <button key={s.id} onClick={() => onSample(s.id)}
              className={`brutal-border px-2 py-1 font-mono text-[11px] uppercase ${sample === s.id ? "bg-acid text-ink" : "bg-bone text-ink"}`}>
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setBypassAll((b) => !b)}
          title="A = raw source. B = with effects."
          className={`brutal-border px-3 py-2 font-mono uppercase brutal-press ${bypassAll ? "bg-bone text-ink" : "bg-volt text-bone"}`}
        >{bypassAll ? "A · DRY" : "B · WET"}</button>
        <span className="ml-auto font-mono text-[10px] uppercase opacity-80">
          {playing ? "▸ playing" : "▸ stopped"} · {activeCount} fx on · level {Math.round(level * 100)}
        </span>
      </div>

      {/* Effect cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FX.map((def, i) => {
          const s = state[def.id];
          return (
            <div key={def.id} className={`brutal-border p-3 ${s.on && !bypassAll ? def.color : "bg-card"}`}>
              <div className="flex items-center gap-2">
                <span className="brutal-border bg-bone text-ink px-2 py-0.5 font-mono text-[10px]">#{i + 1}</span>
                <div className="font-display text-xl flex-1">{def.label}</div>
                <button
                  onClick={() => setFx(def.id, { on: !s.on })}
                  className={`brutal-border px-3 py-1 font-mono text-xs uppercase brutal-press ${s.on ? "bg-ink text-bone" : "bg-bone text-ink"}`}
                >{s.on ? "ON" : "OFF"}</button>
              </div>
              <p className="font-mono text-xs mt-2 leading-snug">{def.blurb}</p>
              <label className="block mt-2 font-mono text-[10px] uppercase">
                {def.amountLabel}: {Math.round(s.amount * 100)}
                <input
                  type="range" min={0} max={1} step={0.01}
                  value={s.amount}
                  onChange={(e) => setFx(def.id, { amount: +e.target.value })}
                  className="w-full"
                />
              </label>
            </div>
          );
        })}
      </div>

      {/* Level bar */}
      <div className="brutal-border bg-bone p-2">
        <div className="font-mono text-[10px] uppercase mb-1">OUTPUT LEVEL</div>
        <div className="h-3 brutal-border bg-ink overflow-hidden">
          <div className="h-full bg-acid" style={{ width: `${Math.min(100, level * 140)}%` }} />
        </div>
      </div>

      <p className="font-mono text-[11px] uppercase opacity-70">
        ▸ Order is fixed: TONE → COMP → DRIVE → REVERB. Toggle each on, twist its amount, A/B to hear the chain.
      </p>
    </div>
  );
}
