"use client";
/**
 * Pictures that move with the sound, for lesson screens: air being pushed by a speaker,
 * the shape of a wave, and the path from numbers to your ear.
 */
import { useEffect, useRef, useState } from "react";

function useClock(on: boolean) {
  const [t, setT] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!on) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t0 = performance.now();
    const tick = (now: number) => { setT((now - t0) / 1000); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [on]);
  return t;
}

/** A speaker cone pushing and pulling air. Dots bunch up (high pressure) and spread out (low) as the wave travels. */
export function AirWave({ playing, speed = 1, strength = 1 }: { playing: boolean; speed?: number; strength?: number }) {
  const t = useClock(playing);
  const W = 330, H = 110, cols = 26, rows = 6;
  const amp = playing ? 7 * strength : 0;
  const w = 2 * Math.PI * 0.9 * speed;
  const cone = 40 + Math.sin(w * t) * (playing ? 4 : 0);
  return (
    <div className="fl-air" role="img" aria-label="A speaker pushes and pulls the air. The bunched up dots are high pressure, the spread out dots are low pressure, and they travel to your ear.">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden>
        <rect x={6} y={30} width={20} height={50} rx={3} fill="rgba(255,255,255,.12)" />
        <path d={`M26 30 L${cone} 14 L${cone} 96 L26 80 Z`} fill="rgba(255,255,255,.22)" stroke="rgba(255,255,255,.4)" />
        {Array.from({ length: cols * rows }, (_, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const x0 = 56 + c * 9.4;
          const x = x0 + Math.sin(w * t - c * 0.55) * amp;
          const y = 22 + r * 13.5 + (c % 2 ? 6 : 0) * 0.5;
          return <circle key={i} cx={x} cy={y} r={2} fill="var(--led-go)" opacity={0.75} />;
        })}
        <path d="M312 40c10 0 14 8 14 16s-6 12-8 18-3 10-8 10" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth={2} />
      </svg>
      <div className="fl-airlabels" aria-hidden><span>speaker</span><span>air, pushed and pulled</span><span>ear</span></div>
    </div>
  );
}

export type WaveKind = "soft" | "saw" | "square";

/** The shape of a wave. `morph` 0..1 goes saw to square (the lead synth's wave knob); `bright` 0..1 rounds the corners off when low. */
export function WaveShape({ kind, morph, bright = 1, cycles = 3, amp = 1, playing = false }: { kind?: WaveKind; morph?: number; bright?: number; cycles?: number; amp?: number; playing?: boolean }) {
  const t = useClock(playing);
  const W = 330, H = 90, mid = H / 2, N = 360;
  const m = morph ?? (kind === "square" ? 1 : 0);
  const soft = kind === "soft";
  const raw: number[] = [];
  for (let i = 0; i <= N; i++) {
    const ph = ((i / N) * cycles + t * 0.25) % 1;
    const saw = 1 - 2 * ph;
    const sq = ph < 0.5 ? 1 : -1;
    raw.push(soft ? Math.sin(2 * Math.PI * ph) : saw * (1 - m) + sq * m * 0.9);
  }
  // A simple smoothing pass stands in for the filter: less brightness, rounder wave.
  const a = soft ? 1 : 0.06 + 0.94 * Math.pow(bright, 1.6);
  let y = raw[0];
  const pts = raw.map((v, i) => { y += a * (v - y); return `${((i / N) * W).toFixed(1)},${(mid - y * amp * (mid - 8)).toFixed(1)}`; });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="fl-wave" role="img" aria-label={`${soft ? "A smooth, round wave" : m > 0.5 ? "A square wave, flat tops and sudden jumps" : "A saw wave, a slope then a sudden drop"}${cycles > 4 ? ", wobbling fast" : ""}`}>
      <path d={`M0 ${mid}H${W}`} stroke="rgba(255,255,255,.08)" />
      <polyline points={pts.join(" ")} fill="none" stroke="var(--led-go)" strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  );
}

/** numbers, speaker, air, ear: a dot runs along the path while it plays. */
export function SynthChain({ playing }: { playing: boolean }) {
  const steps = ["numbers", "speaker", "air", "your ear"];
  return (
    <div className={`fl-chain ${playing ? "is-on" : ""}`} aria-label="A synth makes numbers, the speaker turns them into moving air, and the air reaches your ear">
      {steps.map((s, i) => <span key={s} style={{ animationDelay: `${i * 220}ms` }}>{s}</span>)}
    </div>
  );
}
