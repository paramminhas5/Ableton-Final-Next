"use client";
/**
 * A picture of what each device does to the sound (design pass 2): the eq's curve, the compressor's knee,
 * the reverb's tail, the delay's repeats. Every device in the library gets its own, drawn in its kind's colour.
 */
import type { ReactNode } from "react";

const W = 48, H = 40;
const wave = (f: (t: number) => number, n = 48, x0 = 3, x1 = 45, mid = 20, amp = 12) =>
  Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return `${i ? "L" : "M"}${(x0 + t * (x1 - x0)).toFixed(1)} ${(mid - f(t) * amp).toFixed(1)}`; }).join("");

export function DevicePic({ slug, color, size = 44 }: { slug: string; color: string; size?: number }) {
  const s = { stroke: color, strokeWidth: 2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const dim = { ...s, strokeWidth: 1.4, opacity: 0.45 };
  const P: Record<string, ReactNode> = {
    eq: <path d="M3 14C10 14 11 14 14 20S20 27 24 27 30 20 34 17 40 10 45 10" {...s} />,
    "eq-eight": <><path d="M3 22C7 22 8 30 11 30S15 22 18 22 21 12 24 12 27 22 30 22 34 26 37 26 42 16 45 14" {...s} />{[11, 24, 37].map(x => <circle key={x} cx={x} cy={x === 24 ? 12 : x === 11 ? 30 : 26} r={2.2} fill={color} />)}</>,
    compressor: <><path d="M4 36 24 16 44 10" {...s} /><path d="M24 4v32" {...dim} strokeDasharray="2 3" /></>,
    "glue-compressor": <><path d="M4 36C14 26 20 18 26 15S38 11 44 10" {...s} /><path d="M4 36 44 4" {...dim} strokeDasharray="2 3" /></>,
    limiter: <><path d="M4 34 22 12H44" {...s} /><path d="M3 12H45" {...dim} strokeDasharray="3 3" /></>,
    gate: <path d={wave(t => (t > 0.12 && t < 0.42) || (t > 0.6 && t < 0.88) ? Math.sin(t * 60) : 0, 96)} {...s} />,
    "drum-buss": <>{[6, 18, 30, 42].map(x => <path key={x} d={`M${x} 34V8M${x + 2} 34V18M${x + 4} 34V25`} {...s} strokeWidth={1.8} />)}</>,
    saturator: <path d={wave(t => Math.tanh(Math.sin(t * Math.PI * 4) * 2.2) / Math.tanh(2.2))} {...s} />,
    overdrive: <path d={wave(t => Math.max(-0.75, Math.min(0.75, Math.sin(t * Math.PI * 4) * 2)) / 0.75)} {...s} />,
    erosion: <path d={wave(t => Math.sin(t * Math.PI * 4) * 0.8 + Math.sin(t * 173) * 0.22, 96)} {...s} strokeWidth={1.6} />,
    redux: <path d={wave(t => Math.round(Math.sin(Math.floor(t * 16) / 16 * Math.PI * 4) * 3) / 3, 96)} {...s} strokeLinejoin="miter" />,
    reverb: <>{Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${4 + i * 3} ${36 - 28 * Math.exp(-i / 5)}V36`} {...s} strokeWidth={1.8} opacity={1 - i * 0.05} />)}</>,
    delay: <>{[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${6 + i * 9} 36V${36 - 28 * Math.pow(0.62, i)}`} {...s} strokeWidth={3} />)}</>,
    echo: <>{[0, 1, 2, 3].map(i => <path key={i} d={`M${6 + i * 11} 20V${20 - 15 * Math.pow(0.6, i)}M${11 + i * 11} 20V${20 + 15 * Math.pow(0.6, i)}`} {...s} strokeWidth={2.6} />)}<path d="M3 20H45" {...dim} /></>,
    "grain-delay": <>{[[8, 14], [13, 26], [17, 10], [22, 20], [26, 30], [31, 15], [35, 24], [40, 12], [42, 28], [11, 33]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 1.8 : 2.6} fill={color} opacity={0.5 + (i % 4) * 0.15} />)}</>,
    "filter-delay": <>{[10, 20, 30].map((y, i) => <g key={y}>{[0, 1, 2].map(k => <path key={k} d={`M${8 + i * 4 + k * 12} ${y + 4}V${y - 4 + k * 2.5}`} {...s} strokeWidth={2.4} opacity={1 - k * 0.25} />)}</g>)}</>,
    "auto-filter": <><path d="M3 16H26C31 16 31 8 34 8S37 34 45 36" {...s} /><path d="M24 30h10m-3-3 3 3-3 3" {...dim} /></>,
    chorus: <>{[0, 0.18, 0.36].map((ph, i) => <path key={i} d={wave(t => Math.sin((t * 4 + ph) * Math.PI), 48, 3, 45, 20, 10)} {...s} strokeWidth={1.6} opacity={1 - i * 0.28} />)}</>,
    phaser: <path d="M3 12H10C13 12 13 30 16 30S19 12 22 12H27C30 12 30 26 33 26S36 12 39 12H45" {...s} />,
    flanger: <path d={Array.from({ length: 12 }, (_, i) => `M${4 + i * 3.6} 12C${5.8 + i * 3.6} 12 ${5.8 + i * 3.6} ${22 + i * 1.1} ${5.8 + i * 3.6} ${22 + i * 1.1}`).join("")} {...s} strokeWidth={1.6} />,
    vibrato: <path d={wave(t => Math.sin(2 * Math.PI * (t * 5 + 0.35 * Math.sin(t * Math.PI * 2))))} {...s} />,
    "auto-pan": <>{Array.from({ length: 10 }, (_, i) => { const a = 0.5 + 0.5 * Math.sin(i * 0.9); return <g key={i}><path d={`M${5 + i * 4} 19V${19 - a * 14}`} {...s} strokeWidth={2} /><path d={`M${5 + i * 4} 21V${21 + (1 - a) * 14}`} {...s} strokeWidth={2} opacity={0.6} /></g>; })}</>,
    "freq-shifter": <><path d={wave(t => Math.sin(t * Math.PI * 4), 48, 3, 30, 24, 9)} {...s} /><path d={wave(t => Math.sin(t * Math.PI * 4), 48, 16, 45, 14, 9)} {...dim} /><path d="M33 34h10m-3-3 3 3-3 3" {...s} strokeWidth={1.6} /></>,
  };
  return (
    <span className="dpic" style={{ width: "100%", height: "100%" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={size} height={size * (H / W)} aria-hidden style={{ filter: `drop-shadow(0 0 3px ${color})`, overflow: "visible" }}>{P[slug] ?? P.eq}</svg>
    </span>
  );
}
