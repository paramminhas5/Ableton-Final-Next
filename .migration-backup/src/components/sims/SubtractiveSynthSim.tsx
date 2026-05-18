// SubtractiveSynthSim — dual osc + filter ADSR + amp ADSR. Mobile-friendly.
// Inspired by Learning Synths (Ableton) + classic Moog signal flow.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, ensureAudio } from "@/lib/audio";

type Wave = "sawtooth" | "square" | "triangle" | "sine";

type Preset = { name: string; wave: Wave; sub: number; detune: number; cutoff: number; reso: number; fEnv: number; fAtk: number; fDec: number; aAtk: number; aDec: number; aSus: number; aRel: number };

const PRESETS: Preset[] = [
  { name: "ACID BASS",   wave: "sawtooth", sub: 0.0, detune: 0,  cutoff: 220,  reso: 14, fEnv: 4200, fAtk: 0.005, fDec: 0.18, aAtk: 0.005, aDec: 0.2, aSus: 0.4, aRel: 0.15 },
  { name: "PLUCK",       wave: "triangle", sub: 0.0, detune: 7,  cutoff: 800,  reso: 6,  fEnv: 3000, fAtk: 0.002, fDec: 0.12, aAtk: 0.002, aDec: 0.3, aSus: 0.0, aRel: 0.2 },
  { name: "WARM PAD",    wave: "sawtooth", sub: 0.3, detune: 12, cutoff: 1200, reso: 2,  fEnv: 800,  fAtk: 0.6,   fDec: 0.4,  aAtk: 0.5,   aDec: 0.5, aSus: 0.8, aRel: 1.2 },
  { name: "SUB BASS",    wave: "sine",     sub: 0.6, detune: 0,  cutoff: 400,  reso: 0,  fEnv: 0,    fAtk: 0.01,  fDec: 0.1,  aAtk: 0.01,  aDec: 0.2, aSus: 0.9, aRel: 0.3 },
  { name: "LEAD",        wave: "square",   sub: 0.0, detune: 4,  cutoff: 2200, reso: 8,  fEnv: 2000, fAtk: 0.02,  fDec: 0.3,  aAtk: 0.01,  aDec: 0.2, aSus: 0.7, aRel: 0.4 },
];

export function SubtractiveSynthSim() {
  const [p, setP] = useState<Preset>(PRESETS[0]);
  const update = (patch: Partial<Preset>) => setP((cur) => ({ ...cur, ...patch }));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw filter response curve
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const g = c.getContext("2d"); if (!g) return;
    const W = c.width, H = c.height;
    g.fillStyle = "#0a0a0a"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "#1a1a1a"; g.lineWidth = 1;
    [100, 1000, 10000].forEach((f) => {
      const x = (Math.log10(f / 20) / Math.log10(20000 / 20)) * W;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
      g.fillStyle = "#666"; g.font = "9px monospace";
      g.fillText(f >= 1000 ? `${f / 1000}k` : `${f}`, x + 2, H - 2);
    });
    // Lowpass response: flat then -12 dB/oct after cutoff, with resonance bump
    g.strokeStyle = "#C6FF00"; g.lineWidth = 2; g.beginPath();
    for (let x = 0; x < W; x++) {
      const f = 20 * Math.pow(20000 / 20, x / W);
      const ratio = f / p.cutoff;
      let mag = 1 / Math.sqrt(1 + Math.pow(ratio, 4));
      // Resonance bump near cutoff
      const bump = (p.reso / 20) * Math.exp(-Math.pow(Math.log2(ratio) * 2, 2)) * 0.8;
      mag = Math.min(1.4, mag + bump);
      const y = H - 6 - (mag / 1.4) * (H - 12);
      x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
    // Cutoff marker
    const cx = (Math.log10(p.cutoff / 20) / Math.log10(20000 / 20)) * W;
    g.strokeStyle = "#FF2E88"; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, H); g.stroke();
  }, [p.cutoff, p.reso]);

  const note = async (semi: number) => {
    const ok = await ensureAudio(); if (!ok) return;
    const ctx = getCtx()!;
    const t = ctx.currentTime;
    const freq = 130.81 * Math.pow(2, semi / 12);
    const dest = getMaster();

    const filt = ctx.createBiquadFilter();
    filt.type = "lowpass"; filt.Q.value = p.reso;
    filt.frequency.setValueAtTime(p.cutoff, t);
    filt.frequency.linearRampToValueAtTime(p.cutoff + p.fEnv, t + p.fAtk);
    filt.frequency.exponentialRampToValueAtTime(Math.max(60, p.cutoff), t + p.fAtk + p.fDec);

    const amp = ctx.createGain(); amp.gain.value = 0;
    const sustain = p.aSus;
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(0.4, t + p.aAtk);
    amp.gain.linearRampToValueAtTime(0.4 * sustain, t + p.aAtk + p.aDec);
    amp.gain.setValueAtTime(0.4 * sustain, t + p.aAtk + p.aDec + 0.4);
    amp.gain.linearRampToValueAtTime(0, t + p.aAtk + p.aDec + 0.4 + p.aRel);
    const endT = t + p.aAtk + p.aDec + 0.4 + p.aRel + 0.05;
    filt.connect(amp).connect(dest);

    // Osc 1
    const o1 = ctx.createOscillator(); o1.type = p.wave; o1.frequency.value = freq;
    o1.detune.value = -p.detune / 2;
    o1.connect(filt); o1.start(t); o1.stop(endT);
    // Osc 2 (detuned)
    if (p.detune > 0) {
      const o2 = ctx.createOscillator(); o2.type = p.wave; o2.frequency.value = freq;
      o2.detune.value = p.detune / 2;
      o2.connect(filt); o2.start(t); o2.stop(endT);
    }
    // Sub osc one octave down
    if (p.sub > 0) {
      const sub = ctx.createOscillator(); sub.type = "sine"; sub.frequency.value = freq / 2;
      const sg = ctx.createGain(); sg.gain.value = p.sub;
      sub.connect(sg).connect(filt); sub.start(t); sub.stop(endT);
    }
  };

  const Knob = ({ label, value, set, min, max, step, unit }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string }) => (
    <label className="font-mono text-[10px] uppercase flex flex-col gap-1">
      <span className="flex justify-between"><span>{label}</span><span className="opacity-60">{value}{unit ?? ""}</span></span>
      <input type="range" min={min} max={max} step={step ?? 1} value={value} onChange={(e) => set(+e.target.value)} className="w-full" />
    </label>
  );

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 space-y-3">
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((preset) => (
            <button key={preset.name} onClick={() => setP(preset)}
              className={`brutal-border px-2 py-1 font-mono text-[10px] uppercase brutal-press ${p.name === preset.name ? "bg-acid text-ink" : "bg-bone text-ink"}`}>
              {preset.name}
            </button>
          ))}
        </div>
        <canvas ref={canvasRef} width={560} height={100} className="w-full brutal-border bg-bone" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="font-mono text-[10px] uppercase flex flex-col gap-1">
            WAVE
            <select value={p.wave} onChange={(e) => update({ wave: e.target.value as Wave })} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
              <option value="sawtooth">Saw</option><option value="square">Square</option><option value="triangle">Tri</option><option value="sine">Sine</option>
            </select>
          </label>
          <Knob label="DETUNE" value={p.detune} set={(v) => update({ detune: v })} min={0} max={30} unit="¢" />
          <Knob label="SUB" value={Math.round(p.sub * 100)} set={(v) => update({ sub: v / 100 })} min={0} max={100} unit="%" />
          <Knob label="CUTOFF" value={p.cutoff} set={(v) => update({ cutoff: v })} min={80} max={8000} step={20} unit="Hz" />
          <Knob label="RES" value={p.reso} set={(v) => update({ reso: v })} min={0} max={20} />
          <Knob label="F·ENV" value={p.fEnv} set={(v) => update({ fEnv: v })} min={0} max={6000} step={50} />
          <Knob label="F·DEC" value={Math.round(p.fDec * 1000)} set={(v) => update({ fDec: v / 1000 })} min={20} max={1500} unit="ms" />
          <Knob label="A·ATK" value={Math.round(p.aAtk * 1000)} set={(v) => update({ aAtk: v / 1000 })} min={1} max={1500} unit="ms" />
          <Knob label="A·DEC" value={Math.round(p.aDec * 1000)} set={(v) => update({ aDec: v / 1000 })} min={20} max={1500} unit="ms" />
          <Knob label="A·SUS" value={Math.round(p.aSus * 100)} set={(v) => update({ aSus: v / 100 })} min={0} max={100} unit="%" />
          <Knob label="A·REL" value={Math.round(p.aRel * 1000)} set={(v) => update({ aRel: v / 1000 })} min={20} max={2500} unit="ms" />
        </div>
      </div>

      <div className="brutal-border bg-bone p-3 flex gap-0.5 overflow-x-auto">
        {Array.from({ length: 25 }).map((_, i) => {
          const isBlack = [1,3,6,8,10].includes(i % 12);
          return (
            <button key={i}
              onPointerDown={(e) => { e.preventDefault(); note(i); }}
              className={`brutal-border ${isBlack ? "h-16 w-7 bg-ink text-bone" : "h-24 w-10 bg-bone text-ink"} brutal-press touch-none select-none`} />
          );
        })}
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ Pick a preset, hold a key — feel the envelope shape. Crank RES + F·ENV for the acid squelch.</p>
    </div>
  );
}
