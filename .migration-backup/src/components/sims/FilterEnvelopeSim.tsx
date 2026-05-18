// FilterEnvelopeSim — ADSR-controlled lowpass cutoff with live curve + presets.
// Touch + mouse friendly. Inspired by Learning Synths.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, ensureAudio } from "@/lib/audio";

type Preset = { name: string; atk: number; dec: number; sus: number; rel: number; base: number; amount: number; reso: number };
const PRESETS: Preset[] = [
  { name: "PLUCK",   atk: 0.002, dec: 0.18, sus: 0.0, rel: 0.15, base: 200,  amount: 4000, reso: 8 },
  { name: "SWEEP",   atk: 0.8,   dec: 0.4,  sus: 0.6, rel: 0.6,  base: 200,  amount: 5000, reso: 4 },
  { name: "ACID",    atk: 0.001, dec: 0.2,  sus: 0.2, rel: 0.1,  base: 150,  amount: 5500, reso: 16 },
  { name: "PAD",     atk: 1.2,   dec: 0.8,  sus: 0.9, rel: 1.5,  base: 600,  amount: 1200, reso: 2 },
];

export function FilterEnvelopeSim() {
  const [p, setP] = useState<Preset>(PRESETS[0]);
  const set = (patch: Partial<Preset>) => setP((c) => ({ ...c, ...patch }));
  const envCanvas = useRef<HTMLCanvasElement>(null);

  // Draw envelope shape
  useEffect(() => {
    const c = envCanvas.current; if (!c) return;
    const g = c.getContext("2d"); if (!g) return;
    const W = c.width, H = c.height;
    g.fillStyle = "#0a0a0a"; g.fillRect(0, 0, W, H);
    const total = p.atk + p.dec + 0.6 + p.rel;
    const scale = W / total;
    const yFor = (v: number) => H - 6 - v * (H - 18);
    g.strokeStyle = "#FF2E88"; g.lineWidth = 2; g.beginPath();
    g.moveTo(0, yFor(0));
    g.lineTo(p.atk * scale, yFor(1));
    g.lineTo((p.atk + p.dec) * scale, yFor(p.sus));
    g.lineTo((p.atk + p.dec + 0.6) * scale, yFor(p.sus));
    g.lineTo((p.atk + p.dec + 0.6 + p.rel) * scale, yFor(0));
    g.stroke();
    g.fillStyle = "#C6FF00"; g.font = "10px monospace";
    g.fillText("A", p.atk * scale * 0.4, 12);
    g.fillText("D", (p.atk + p.dec * 0.4) * scale, 12);
    g.fillText("S", (p.atk + p.dec + 0.2) * scale, 12);
    g.fillText("R", (p.atk + p.dec + 0.6 + p.rel * 0.4) * scale, 12);
  }, [p]);

  const note = async (semi: number) => {
    const ok = await ensureAudio(); if (!ok) return;
    const ctx = getCtx()!;
    const t = ctx.currentTime;
    const freq = 130.81 * Math.pow(2, semi / 12);
    const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = freq;
    const filt = ctx.createBiquadFilter(); filt.type = "lowpass"; filt.Q.value = p.reso;
    filt.frequency.setValueAtTime(p.base, t);
    filt.frequency.linearRampToValueAtTime(p.base + p.amount, t + p.atk);
    filt.frequency.linearRampToValueAtTime(p.base + p.amount * p.sus, t + p.atk + p.dec);
    filt.frequency.setValueAtTime(p.base + p.amount * p.sus, t + p.atk + p.dec + 0.6);
    filt.frequency.linearRampToValueAtTime(p.base, t + p.atk + p.dec + 0.6 + p.rel);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(0.32, t + 0.005);
    amp.gain.setValueAtTime(0.32, t + p.atk + p.dec + 0.6);
    amp.gain.linearRampToValueAtTime(0, t + p.atk + p.dec + 0.6 + p.rel);
    osc.connect(filt).connect(amp).connect(getMaster());
    osc.start(t); osc.stop(t + p.atk + p.dec + 0.6 + p.rel + 0.05);
  };

  const Knob = ({ label, value, set: s, min, max, step, unit }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string }) => (
    <label className="font-mono text-[10px] uppercase flex flex-col gap-1">
      <span className="flex justify-between"><span>{label}</span><span className="opacity-60">{value}{unit ?? ""}</span></span>
      <input type="range" min={min} max={max} step={step ?? 1} value={value} onChange={(e) => s(+e.target.value)} className="w-full" />
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
        <canvas ref={envCanvas} width={560} height={90} className="w-full brutal-border bg-bone" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Knob label="ATK" value={Math.round(p.atk * 1000)} set={(v) => set({ atk: v / 1000 })} min={1} max={1500} unit="ms" />
          <Knob label="DEC" value={Math.round(p.dec * 1000)} set={(v) => set({ dec: v / 1000 })} min={10} max={2000} unit="ms" />
          <Knob label="SUS" value={Math.round(p.sus * 100)} set={(v) => set({ sus: v / 100 })} min={0} max={100} unit="%" />
          <Knob label="REL" value={Math.round(p.rel * 1000)} set={(v) => set({ rel: v / 1000 })} min={10} max={3000} unit="ms" />
          <Knob label="BASE" value={p.base} set={(v) => set({ base: v })} min={60} max={2000} step={20} unit="Hz" />
          <Knob label="ENV →" value={p.amount} set={(v) => set({ amount: v })} min={0} max={8000} step={100} unit="Hz" />
          <Knob label="RES" value={p.reso} set={(v) => set({ reso: v })} min={0} max={20} />
        </div>
      </div>
      <div className="brutal-border bg-bone p-3 flex gap-0.5 overflow-x-auto">
        {Array.from({ length: 13 }).map((_, i) => {
          const isBlack = [1,3,6,8,10].includes(i);
          return (
            <button key={i}
              onPointerDown={(e) => { e.preventDefault(); note(i); }}
              className={`brutal-border ${isBlack ? "h-16 w-7 bg-ink text-bone" : "h-24 w-10 bg-bone text-ink"} brutal-press touch-none select-none`} />
          );
        })}
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ The envelope opens the filter on attack, settles at sustain, closes on release. Big ENV + short DEC = the classic synth pluck.</p>
    </div>
  );
}
