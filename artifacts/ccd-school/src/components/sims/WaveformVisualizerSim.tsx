"use client";
// WaveformVisualizerSim — shows the 4 fundamental waveforms on a canvas.
// Replaces SynthPlaygroundSim on all waveform theory missions.
// ONE interaction: pick a waveform → see it drawn + hear it.
import { useRef, useState, useEffect } from "react";
import { getCtx, midiToFreq } from "@/lib/audio";

type WaveType = "sine" | "square" | "sawtooth" | "triangle";

const WAVES: { type: WaveType; label: string; color: string; harmonics: string; sound: string }[] = [
  { type: "sine",     label: "SINE",     color: "#C6FF00", harmonics: "Pure — no harmonics",        sound: "Clean sub-bass, simple tone" },
  { type: "square",   label: "SQUARE",   color: "#7B2FFF", harmonics: "Odd harmonics only",          sound: "Hollow, woody — organs, chiptune" },
  { type: "sawtooth", label: "SAW",      color: "#FF3B30", harmonics: "ALL harmonics (odd + even)",  sound: "Bright, buzzy — synth bass, brass" },
  { type: "triangle", label: "TRIANGLE", color: "#FFB800", harmonics: "Odd harmonics (weak)",        sound: "Softer than square — flutes, muted leads" },
];

function drawWave(canvas: HTMLCanvasElement, type: WaveType, color: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();

  const cycles = 2.5;
  for (let x = 0; x <= W; x++) {
    const t = (x / W) * cycles * Math.PI * 2;
    let y = 0;
    if (type === "sine") {
      y = Math.sin(t);
    } else if (type === "square") {
      y = Math.sign(Math.sin(t));
    } else if (type === "sawtooth") {
      y = ((t % (Math.PI * 2)) / (Math.PI * 2)) * 2 - 1;
    } else {
      // triangle
      const p = t % (Math.PI * 2);
      y = p < Math.PI ? (p / Math.PI) * 2 - 1 : 1 - ((p - Math.PI) / Math.PI) * 2;
    }
    const px = x;
    const py = H / 2 - y * (H / 2 - 12);
    x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

export function WaveformVisualizerSim() {
  const [active, setActive] = useState<WaveType>("sine");
  const [playing, setPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const waveData = WAVES.find(w => w.type === active)!;

  useEffect(() => {
    if (canvasRef.current) drawWave(canvasRef.current, active, waveData.color);
  }, [active, waveData.color]);

  const playWave = async (type: WaveType) => {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state !== "running") { try { await ctx.resume(); } catch {} }

    // Stop previous
    if (oscRef.current) { try { oscRef.current.stop(); } catch {} oscRef.current = null; }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = midiToFreq(57); // A3 = 220Hz — clear reference pitch
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.3);
    oscRef.current = osc;
    gainRef.current = gain;
    setPlaying(true);
    setTimeout(() => setPlaying(false), 1300);
  };

  const handlePick = (type: WaveType) => {
    setActive(type);
    playWave(type);
  };

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-ink text-bone p-4">
        <div className="font-mono text-[10px] uppercase opacity-60">Waveform Explorer</div>
        <div className="font-display text-2xl mt-1">TAP A WAVE — SEE IT & HEAR IT</div>
      </div>

      {/* Wave picker */}
      <div className="grid grid-cols-4 gap-1">
        {WAVES.map(w => (
          <button
            key={w.type}
            onClick={() => handlePick(w.type)}
            className={`brutal-border py-3 font-display text-lg brutal-press transition-all ${
              active === w.type ? "bg-acid text-ink" : "bg-bone hover:bg-sun"
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="brutal-border bg-ink overflow-hidden" style={{ height: 140 }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={140}
          className="w-full h-full"
          style={{ display: "block" }}
        />
      </div>

      {/* Info */}
      <div className="brutal-border p-4 space-y-2" style={{ borderColor: waveData.color }}>
        <div className="font-display text-2xl" style={{ color: waveData.color }}>
          {waveData.label} WAVE
        </div>
        <div className="font-mono text-xs uppercase opacity-70">{waveData.harmonics}</div>
        <div className="font-mono text-sm">{waveData.sound}</div>
        {playing && (
          <div className="font-mono text-[10px] uppercase text-acid animate-pulse">▶ Playing…</div>
        )}
      </div>

      <div className="brutal-border bg-sun/20 p-3 font-mono text-xs leading-relaxed">
        <strong>Key insight:</strong> Every real instrument sound is a combination of these shapes.
        Synthesis starts here — pick a wave, then filter and shape it.
      </div>
    </div>
  );
}
