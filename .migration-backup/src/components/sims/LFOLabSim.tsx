// LFOLabSim — slow oscillator modulating pitch, cutoff, or amplitude.
// Original implementation.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster } from "@/lib/audio";

type LFOShape = "sine" | "triangle" | "square" | "sawtooth";
type Target = "pitch" | "cutoff" | "amp";

export function LFOLabSim() {
  const [shape, setShape] = useState<LFOShape>("sine");
  const [rate, setRate] = useState(4); // Hz
  const [depth, setDepth] = useState(40); // generic 0..100
  const [target, setTarget] = useState<Target>("cutoff");
  const [playing, setPlaying] = useState(false);
  const nodesRef = useRef<{ stop: () => void } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // draw LFO shape
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const g = c.getContext("2d"); if (!g) return;
    const W = c.width, H = c.height;
    g.fillStyle = "#0a0a0a"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "#00ffaa"; g.lineWidth = 2; g.beginPath();
    const cycles = Math.max(2, Math.min(10, rate));
    for (let x = 0; x < W; x++) {
      const p = (x / W) * cycles;
      let v = 0;
      switch (shape) {
        case "sine": v = Math.sin(2 * Math.PI * p); break;
        case "triangle": v = 1 - 4 * Math.abs(Math.round(p) - p); break;
        case "square": v = p % 1 < 0.5 ? 1 : -1; break;
        case "sawtooth": v = 2 * (p - Math.floor(p + 0.5)); break;
      }
      const y = H / 2 - v * (H / 2 - 6) * (depth / 100);
      if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }, [shape, rate, depth]);

  const start = () => {
    const ctx = getCtx(); if (!ctx) return;
    if (ctx.state !== "running") ctx.resume().catch(() => {});
    const master = getMaster();

    const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = 220;
    const filt = ctx.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 1200; filt.Q.value = 4;
    const amp = ctx.createGain(); amp.gain.value = 0.3;
    osc.connect(filt).connect(amp).connect(master);

    const lfo = ctx.createOscillator(); lfo.type = shape; lfo.frequency.value = rate;
    const lfoGain = ctx.createGain();
    if (target === "pitch") { lfoGain.gain.value = depth * 1.5; lfoGain.connect(osc.detune); }
    else if (target === "cutoff") { lfoGain.gain.value = depth * 30; lfoGain.connect(filt.frequency); }
    else { lfoGain.gain.value = depth / 300; lfoGain.connect(amp.gain); }
    lfo.connect(lfoGain);
    osc.start(); lfo.start();

    nodesRef.current = { stop: () => {
      try { osc.stop(); lfo.stop(); } catch {}
      [osc, lfo, lfoGain, filt, amp].forEach(n => { try { (n as any).disconnect(); } catch {} });
    }};
    setPlaying(true);
  };

  const stop = () => { nodesRef.current?.stop(); nodesRef.current = null; setPlaying(false); };
  useEffect(() => () => nodesRef.current?.stop(), []);
  useEffect(() => { if (playing) { stop(); start(); } /* eslint-disable-next-line */ }, [shape, rate, depth, target]);

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 space-y-3">
        <canvas ref={canvasRef} width={560} height={100} className="w-full brutal-border bg-bone" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="font-mono text-[10px] uppercase flex flex-col gap-1">SHAPE
            <select value={shape} onChange={(e) => setShape(e.target.value as LFOShape)} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
              <option value="sine">sine</option><option value="triangle">tri</option>
              <option value="square">square</option><option value="sawtooth">saw</option>
            </select>
          </label>
          <label className="font-mono text-[10px] uppercase flex flex-col gap-1">RATE {rate} Hz
            <input type="range" min={0.1} max={20} step={0.1} value={rate} onChange={(e) => setRate(+e.target.value)} />
          </label>
          <label className="font-mono text-[10px] uppercase flex flex-col gap-1">DEPTH {depth}
            <input type="range" min={0} max={100} value={depth} onChange={(e) => setDepth(+e.target.value)} />
          </label>
          <label className="font-mono text-[10px] uppercase flex flex-col gap-1">TARGET
            <select value={target} onChange={(e) => setTarget(e.target.value as Target)} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
              <option value="pitch">pitch (vibrato)</option>
              <option value="cutoff">cutoff (wobble)</option>
              <option value="amp">amp (tremolo)</option>
            </select>
          </label>
        </div>
        <button onClick={playing ? stop : start} className="brutal-border bg-acid text-ink px-4 py-2 font-mono text-xs uppercase brutal-press">
          {playing ? "■ Stop" : "▶ Drone"}
        </button>
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ An LFO is a slow oscillator that controls something else. Pick the target to hear vibrato, filter wobble, or tremolo.</p>
    </div>
  );
}
