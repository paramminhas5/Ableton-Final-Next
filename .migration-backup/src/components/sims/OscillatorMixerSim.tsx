// OscillatorMixerSim — blend two oscillator shapes, see the sum waveform.
// Original implementation. Inspired by the "mixing oscillators" pattern at
// learningsynths.ableton.com — no source code reused.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster } from "@/lib/audio";

type Wave = "sine" | "saw" | "square" | "triangle" | "noise";

const WAVES: Wave[] = ["sine", "saw", "square", "triangle", "noise"];

function sampleWave(w: Wave, phase: number): number {
  switch (w) {
    case "sine": return Math.sin(2 * Math.PI * phase);
    case "saw": return 2 * (phase - Math.floor(phase + 0.5));
    case "square": return phase % 1 < 0.5 ? 1 : -1;
    case "triangle": return 1 - 4 * Math.abs(Math.round(phase) - phase);
    case "noise": return Math.random() * 2 - 1;
  }
}

export function OscillatorMixerSim() {
  const [a, setA] = useState<Wave>("saw");
  const [b, setB] = useState<Wave>("square");
  const [mix, setMix] = useState(0.5); // 0=A, 1=B
  const [detune, setDetune] = useState(7); // cents
  const [playing, setPlaying] = useState(false);
  const nodesRef = useRef<{ stop: () => void } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // draw the sum waveform
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const W = c.width, H = c.height;
    ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H);
    // grid
    ctx.strokeStyle = "#1f1f1f"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    // waveform
    ctx.strokeStyle = "#d4ff00"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const phase = (x / W) * 3;
      const sA = sampleWave(a, phase);
      const sB = sampleWave(b, phase * (1 + detune / 1200));
      const sum = (1 - mix) * sA + mix * sB;
      const y = H / 2 - sum * (H / 2 - 6) * 0.9;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [a, b, mix, detune]);

  const start = () => {
    const ctx = getCtx(); if (!ctx) return;
    if (ctx.state !== "running") ctx.resume().catch(() => {});
    const master = getMaster();

    const makeOsc = (w: Wave, gainVal: number, detuneVal: number) => {
      if (w === "noise") {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
        const g = ctx.createGain(); g.gain.value = gainVal;
        src.connect(g); g.connect(master); src.start();
        return { stop: () => { try { src.stop(); } catch {} g.disconnect(); } };
      }
      const o = ctx.createOscillator();
      o.type = w === "saw" ? "sawtooth" : w;
      o.frequency.value = 220;
      o.detune.value = detuneVal;
      const g = ctx.createGain(); g.gain.value = gainVal * 0.35;
      o.connect(g); g.connect(master); o.start();
      return { stop: () => { try { o.stop(); } catch {} g.disconnect(); } };
    };

    const oA = makeOsc(a, 1 - mix, 0);
    const oB = makeOsc(b, mix, detune);
    nodesRef.current = { stop: () => { oA.stop(); oB.stop(); } };
    setPlaying(true);
  };

  const stop = () => { nodesRef.current?.stop(); nodesRef.current = null; setPlaying(false); };

  useEffect(() => () => nodesRef.current?.stop(), []);
  // restart on param change while playing
  useEffect(() => { if (playing) { stop(); start(); } /* eslint-disable-next-line */ }, [a, b, mix, detune]);

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 space-y-3">
        <canvas ref={canvasRef} width={560} height={120} className="w-full brutal-border bg-bone" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="font-mono text-[10px] uppercase flex flex-col gap-1">OSC A
            <select value={a} onChange={(e) => setA(e.target.value as Wave)} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
              {WAVES.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </label>
          <label className="font-mono text-[10px] uppercase flex flex-col gap-1">OSC B
            <select value={b} onChange={(e) => setB(e.target.value as Wave)} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
              {WAVES.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </label>
          <label className="font-mono text-[10px] uppercase flex flex-col gap-1">MIX {Math.round(mix * 100)}%
            <input type="range" min={0} max={100} value={mix * 100} onChange={(e) => setMix(+e.target.value / 100)} />
          </label>
          <label className="font-mono text-[10px] uppercase flex flex-col gap-1">DETUNE {detune}¢
            <input type="range" min={-50} max={50} value={detune} onChange={(e) => setDetune(+e.target.value)} />
          </label>
        </div>
        <button onClick={playing ? stop : start} className="brutal-border bg-acid text-ink px-4 py-2 font-mono text-xs uppercase brutal-press">
          {playing ? "■ Stop" : "▶ Play"}
        </button>
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ Two oscillators blend to one waveform. Detune fattens by making them slightly out of tune.</p>
    </div>
  );
}
