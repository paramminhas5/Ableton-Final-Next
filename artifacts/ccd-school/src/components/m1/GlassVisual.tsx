"use client";
/**
 * Lesson pictures drawn for the glass screen: thin lines that glow in the world's colour
 * on black, engraved grey labels. One drawing per concept visual, plus the diagram screen.
 */
/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import type { LessonScreen } from "@/content/types";

type Visual = NonNullable<Extract<LessonScreen, { kind: "concept" }>["visual"]>;
type DiagramScreen = Extract<LessonScreen, { kind: "diagram" }>;

const W = 330;
const SUB = "#8A8A90";
const DIM = "rgba(255,255,255,.07)";
const INK = "#EDEDEA";
const MINT = "#4FE3B6";
const LILAC = "#B89CFF";
const SUN = "#F3C14F";
const COBALT = "#7D96FF";

function Svg({ h = 150, label, children }: { h?: number; label: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${h}`} width="100%" role="img" aria-label={label} style={{ display: "block", overflow: "visible" }}>
      {children}
    </svg>
  );
}

const T = ({ x, y, children, a = "start", c = SUB, s = 10, w = 500 }: { x: number; y: number; children: ReactNode; a?: "start" | "middle" | "end"; c?: string; s?: number; w?: number }) => (
  <text x={x} y={y} textAnchor={a} fontFamily="Outfit, system-ui" fontSize={s} fontWeight={w} fill={c}>{children}</text>
);

function Grid({ h = 150, cols = 8, rows = 4 }: { h?: number; cols?: number; rows?: number }) {
  return (
    <g>
      {Array.from({ length: cols + 1 }, (_, i) => <path key={`c${i}`} d={`M${(i * W) / cols} 0V${h}`} stroke={DIM} />)}
      {Array.from({ length: rows + 1 }, (_, i) => <path key={`r${i}`} d={`M0 ${(i * h) / rows}H${W}`} stroke={DIM} />)}
    </g>
  );
}

function wave(fn: (p: number) => number, x0: number, x1: number, mid: number, amp: number, cycles: number, n = 160) {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = mid - amp * fn(((i / n) * cycles) % 1);
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}
const sine = (p: number) => Math.sin(p * Math.PI * 2);
const square = (p: number) => (p < 0.5 ? 1 : -1);
const saw = (p: number) => 1 - 2 * p;
const glow = (c: string) => ({ filter: `drop-shadow(0 0 4px ${c})` });

// ── the drawings ────────────────────────────────────────────────────────────
function Waveform({ c }: { c: string }) {
  return (
    <Svg label="A sine wave">
      <Grid />
      <path d={`M0 75H${W}`} stroke="rgba(255,255,255,.14)" />
      <path d={wave(sine, 0, 92, 75, 14, 1.5)} stroke={COBALT} strokeWidth={1.2} fill="none" opacity={0.8} />
      <path d={wave(sine, 0, W, 75, 52, 2.6)} stroke={c} strokeWidth={2.4} fill="none" style={glow(c)} />
      <path d="M0 136h127" stroke={SUB} strokeDasharray="2 3" />
      <T x={0} y={148}>one cycle</T>
    </Svg>
  );
}

function WaveformCompare({ c }: { c: string }) {
  const shapes: [string, (p: number) => number, string][] = [["sine", sine, c], ["square", square, LILAC], ["saw", saw, MINT]];
  const cw = 100, gap = 15;
  return (
    <Svg label="Sine, square and saw waves side by side">
      {shapes.map(([n, f, col], i) => {
        const x = i * (cw + gap);
        return (
          <g key={n}>
            <rect x={x} y={8} width={cw} height={110} rx={8} fill="rgba(255,255,255,.03)" stroke={DIM} />
            <path d={wave(f, x + 8, x + cw - 8, 63, 34, 2, 120)} stroke={col} strokeWidth={2} fill="none" style={glow(col)} />
            <T x={x + cw / 2} y={140} a="middle" c={INK} s={11}>{n}</T>
          </g>
        );
      })}
    </Svg>
  );
}

function FrequencyBars({ c }: { c: string }) {
  const n = 28;
  const bands = [["sub", 0], ["low", 4], ["mid", 10], ["high", 18], ["air", 24]] as const;
  return (
    <Svg label="A spectrum from low to high frequencies">
      {Array.from({ length: n }, (_, i) => {
        const v = 0.35 + 0.55 * Math.exp(-((i - 5) ** 2) / 30) + 0.25 * Math.exp(-((i - 16) ** 2) / 40) - i * 0.006;
        const h = Math.max(6, v * 108);
        const x = 4 + i * (W - 8) / n;
        return <rect key={i} x={x} y={118 - h} width={(W - 8) / n - 3} height={h} rx={2} fill={c} opacity={0.35 + 0.65 * (h / 120)} />;
      })}
      <path d={`M0 122H${W}`} stroke="rgba(255,255,255,.14)" />
      {bands.map(([l, i]) => <T key={l} x={4 + i * (W - 8) / n} y={140}>{l}</T>)}
      <T x={W} y={140} a="end">20 khz</T>
    </Svg>
  );
}

const NOTE = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
const BLACK = [1, 3, 6, 8, 10];

function Keys({ c, octaves = 2, hz }: { c: string; octaves?: number; hz?: boolean }) {
  const whites = octaves * 7 + 1;
  const kw = W / whites;
  const lit = new Set([0, 2, 4, 5, 7, 9, 11]);
  return (
    <Svg label={hz ? "One octave of a keyboard with frequencies" : "A keyboard with note names"} h={hz ? 150 : 130}>
      {Array.from({ length: whites }, (_, i) => {
        const pc = [0, 2, 4, 5, 7, 9, 11][i % 7];
        const on = !hz && i < 8 && lit.has(pc);
        return (
          <g key={i}>
            <rect x={i * kw + 1} y={6} width={kw - 2} height={104} rx={4} fill={on ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.04)"} stroke={on ? c : DIM} />
            <T x={i * kw + kw / 2} y={102} a="middle" c={on || hz ? INK : SUB} s={10}>{NOTE[pc]}</T>
          </g>
        );
      })}
      {Array.from({ length: whites - 1 }, (_, i) => {
        const pc = [0, 2, 4, 5, 7, 9, 11][i % 7];
        if (!BLACK.includes(pc + 1)) return null;
        return <rect key={`b${i}`} x={(i + 1) * kw - kw * 0.3} y={6} width={kw * 0.6} height={62} rx={3} fill="#0A0A0C" stroke="rgba(255,255,255,.14)" />;
      })}
      {hz && <><T x={kw / 2} y={128} a="middle" c={c}>262 hz</T><T x={W - kw / 2} y={128} a="middle" c={c}>523 hz</T><T x={W / 2} y={146} a="middle">one octave up doubles the frequency</T></>}
    </Svg>
  );
}

function EqCurve({ c }: { c: string }) {
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const x = (i / 160) * W;
    const f = i / 160;
    const cut = f < 0.12 ? (1 - f / 0.12) ** 2 * 60 : 0;
    const shelf = f > 0.72 ? -Math.min(1, (f - 0.72) / 0.12) * 18 : 0;
    const bell = 14 * Math.exp(-((f - 0.45) ** 2) / 0.004);
    pts.push(`${i ? "L" : "M"}${x.toFixed(1)} ${(70 + cut + shelf - bell).toFixed(1)}`);
  }
  return (
    <Svg label="An EQ curve with a low cut, a mid boost and a high shelf">
      <Grid cols={10} />
      <path d={`M0 70H${W}`} stroke="rgba(255,255,255,.16)" strokeDasharray="3 3" />
      <path d={pts.join("")} stroke={c} strokeWidth={2.2} fill="none" style={glow(c)} />
      <T x={4} y={146}>low cut</T><T x={W * 0.45} y={146} a="middle">mid boost</T><T x={W} y={146} a="end">high shelf</T>
    </Svg>
  );
}

function AmplitudeDial({ c }: { c: string }) {
  const cx = W / 2, cy = 120, r = 96;
  const ticks = [-60, -40, -24, -12, -6, 0];
  const ang = (db: number) => Math.PI + ((db + 60) / 60) * Math.PI;
  const a = ang(-12);
  return (
    <Svg label="A level meter in decibels, reading minus 12">
      <path d={`M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}`} stroke="rgba(255,255,255,.14)" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`} stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" style={glow(c)} />
      {ticks.map(t => {
        const q = ang(t);
        return <T key={t} x={cx + (r + 16) * Math.cos(q)} y={cy + (r + 16) * Math.sin(q) + 4} a="middle">{t}</T>;
      })}
      <path d={`M${cx} ${cy}L${cx + (r - 18) * Math.cos(a)} ${cy + (r - 18) * Math.sin(a)}`} stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill={INK} />
      <T x={cx} y={cy + 24} a="middle" c={INK} s={12}>-12 db</T>
    </Svg>
  );
}

function BpmGrid({ c, bpm = 120 }: { c: string; bpm?: number }) {
  const sw = W / 16;
  return (
    <Svg label={`A one bar beat grid at ${bpm} beats per minute`}>
      {Array.from({ length: 16 }, (_, i) => {
        const beat = i % 4 === 0;
        return <rect key={i} x={i * sw + 2} y={beat ? 28 : 52} width={sw - 4} height={beat ? 70 : 46} rx={3} fill={beat ? c : "rgba(255,255,255,.12)"} opacity={beat ? 1 : 0.8} style={beat ? glow(c) : undefined} />;
      })}
      {[0, 1, 2, 3].map(b => <T key={b} x={b * sw * 4 + 2} y={118} c={INK}>{b + 1}</T>)}
      <T x={0} y={146}>{bpm} bpm · {(60 / bpm).toFixed(2)} s a beat</T>
      <T x={W} y={146} a="end">16 steps a bar</T>
    </Svg>
  );
}

export function Chain({ nodes, c, h = 150 }: { nodes: string[]; c: string; h?: number }) {
  const cols = [c, LILAC, MINT, COBALT, SUN];
  const rows = nodes.length > 4 ? [nodes.slice(0, Math.ceil(nodes.length / 2)), nodes.slice(Math.ceil(nodes.length / 2))] : [nodes];
  const rh = 34;
  const y0 = h / 2 - (rows.length * rh + (rows.length - 1) * 30) / 2;
  let k = 0;
  return (
    <Svg h={h} label={`Signal flow: ${nodes.join(", then ")}`}>
      {rows.map((row, ri) => {
        const gap = 18;
        const bw = (W - gap * (row.length - 1)) / row.length;
        const y = y0 + ri * (rh + 30);
        return (
          <g key={ri}>
            {row.map((n, i) => {
              const col = cols[k++ % cols.length];
              const x = i * (bw + gap);
              const label = n.toLowerCase();
              const fs = label.length > 16 ? 9 : label.length > 11 ? 10 : 11;
              return (
                <g key={i}>
                  <rect x={x + 1} y={y} width={bw - 2} height={rh} rx={7} fill="rgba(255,255,255,.04)" stroke={col} strokeWidth={1.4} style={glow(col)} />
                  <T x={x + bw / 2} y={y + rh / 2 + 4} a="middle" c={INK} s={fs}>{label.length > 22 ? label.slice(0, 21) + "…" : label}</T>
                  {i < row.length - 1 && <path d={`M${x + bw} ${y + rh / 2}h${gap}`} stroke={SUB} strokeWidth={1.4} />}
                </g>
              );
            })}
            {ri === 0 && rows.length > 1 && <path d={`M${W - 10} ${y + rh}v12H10v18`} stroke={SUB} strokeWidth={1.4} fill="none" />}
          </g>
        );
      })}
    </Svg>
  );
}

function Stereo({ c }: { c: string }) {
  const cx = W / 2;
  const dots: [number, string, string][] = [[-0.85, "hats", SUN], [-0.3, "chords", LILAC], [0, "kick + bass", c], [0.45, "lead", COBALT], [0.85, "perc", MINT]];
  return (
    <Svg label="The stereo field from left to right">
      <path d={`M24 120Q${cx} -10 ${W - 24} 120`} stroke="rgba(255,255,255,.14)" fill="none" />
      {dots.map(([p, n, col]) => {
        const x = cx + p * (cx - 34);
        const y = 120 - 92 * (1 - p * p) - 6;
        return <g key={n}><circle cx={x} cy={y} r={7} fill={col} style={glow(col)} /><T x={x} y={y + 22} a="middle" c={INK}>{n}</T></g>;
      })}
      <rect x={4} y={110} width={24} height={30} rx={5} fill="none" stroke={SUB} /><T x={16} y={148} a="middle">l</T>
      <rect x={W - 28} y={110} width={24} height={30} rx={5} fill="none" stroke={SUB} /><T x={W - 16} y={148} a="middle">r</T>
    </Svg>
  );
}

function NoteLengths({ c }: { c: string }) {
  const rows = [["whole", 1], ["half", 2], ["quarter", 4], ["8th", 8], ["16th", 16]] as const;
  const x0 = 60;
  return (
    <Svg label="Note lengths from whole to sixteenth">
      {rows.map(([n, d], r) => (
        <g key={n}>
          <T x={0} y={r * 28 + 18} c={INK}>{n}</T>
          {Array.from({ length: d }, (_, i) => {
            const bw = (W - x0) / d;
            return <rect key={i} x={x0 + i * bw + 1} y={r * 28 + 6} width={bw - 2} height={16} rx={3} fill={c} opacity={1 - r * 0.14} />;
          })}
        </g>
      ))}
    </Svg>
  );
}

const CHROMA = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function ScaleSteps({ c, minor, root = "C", label }: { c: string; minor?: boolean; root?: string; label?: string }) {
  const steps = minor ? ["w", "h", "w", "w", "h", "w", "w"] : ["w", "w", "h", "w", "w", "w", "h"];
  const r0 = Math.max(0, CHROMA.indexOf(root.replace("b", "#").toUpperCase()));
  const idx = [r0];
  steps.forEach(s => idx.push((idx[idx.length - 1] + (s === "w" ? 2 : 1)) % 12));
  const bw = W / 8;
  return (
    <Svg label={`${label ?? `${root} ${minor ? "minor" : "major"}`} scale steps`}>
      <T x={0} y={12} c={INK} s={11}>{(label ?? `${root} ${minor ? "natural minor" : "major"}`).toLowerCase()}</T>
      {idx.map((n, i) => (
        <g key={i}>
          <rect x={i * bw + 2} y={24} width={bw - 4} height={46} rx={6} fill={i === 0 || i === 7 ? c : "rgba(255,255,255,.08)"} stroke={i === 0 || i === 7 ? "none" : DIM} style={i === 0 || i === 7 ? glow(c) : undefined} />
          <T x={i * bw + bw / 2} y={52} a="middle" c={i === 0 || i === 7 ? "#141416" : INK} s={12} w={600}>{CHROMA[n].toLowerCase()}</T>
        </g>
      ))}
      {steps.map((s, i) => (
        <g key={i}>
          <path d={`M${i * bw + bw / 2} 80q${bw / 2} 16 ${bw} 0`} stroke={s === "w" ? MINT : SUN} fill="none" strokeWidth={1.4} />
          <T x={i * bw + bw} y={112} a="middle" c={s === "w" ? MINT : SUN} s={11}>{s}</T>
        </g>
      ))}
      <T x={0} y={144}>w whole step · h half step</T>
    </Svg>
  );
}

function ChordStack({ c }: { c: string }) {
  const tones: [string, string, string][] = [["g", "5th", MINT], ["e", "3rd", LILAC], ["c", "root", c]];
  return (
    <Svg label="A C major chord stacked: root, third and fifth">
      {tones.map(([n, i, col], k) => (
        <g key={n}>
          <rect x={70} y={10 + k * 38} width={190} height={30} rx={7} fill="rgba(255,255,255,.04)" stroke={col} strokeWidth={1.4} style={glow(col)} />
          <T x={86} y={30 + k * 38} c={INK} s={13} w={600}>{n}</T>
          <T x={244} y={30 + k * 38} a="end" c={col}>{i}</T>
        </g>
      ))}
      <T x={W / 2} y={140} a="middle">c major · 4 + 3 half steps</T>
    </Svg>
  );
}

function RhythmDots({ c }: { c: string }) {
  const rows: [string, number[], string][] = [["hat", [0, 2, 4, 6, 8, 10, 12, 14], SUN], ["snare", [4, 12], LILAC], ["kick", [0, 8, 10], c]];
  const x0 = 46, sw = (W - x0) / 16;
  return (
    <Svg label="A one bar rhythm for kick, snare and hats">
      {rows.map(([n, hits, col], r) => (
        <g key={n}>
          <T x={0} y={r * 40 + 30} c={INK}>{n}</T>
          {Array.from({ length: 16 }, (_, i) => (
            <circle key={i} cx={x0 + i * sw + sw / 2} cy={r * 40 + 26} r={hits.includes(i) ? 7 : 2.5} fill={hits.includes(i) ? col : "rgba(255,255,255,.18)"} style={hits.includes(i) ? glow(col) : undefined} />
          ))}
        </g>
      ))}
      {[0, 4, 8, 12].map(i => <T key={i} x={x0 + i * sw + sw / 2} y={146} a="middle">{i / 4 + 1}</T>)}
    </Svg>
  );
}

function Vinyl({ c }: { c: string }) {
  const cx = W / 2, cy = 72;
  return (
    <Svg label="A turntable platter seen from above">
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={cx} cy={cy} r={68 - i * 5} fill="none" stroke="rgba(255,255,255,.07)" />)}
      <circle cx={cx} cy={cy} r={22} fill={c} opacity={0.9} style={glow(c)} />
      <circle cx={cx} cy={cy} r={3} fill="#0A0A0C" />
      <path d={`M${cx} ${cy - 68}v18`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${cx + 120} 14L${cx + 40} 92`} stroke={SUB} strokeWidth={4} strokeLinecap="round" />
      <T x={cx + 96} y={140} a="middle">the white mark shows the beat</T>
    </Svg>
  );
}

function MixerStrip({ c }: { c: string }) {
  const rows = ["gain", "high", "mid", "low"];
  return (
    <Svg label="A mixer channel: gain, three EQ knobs and a fader">
      {rows.map((r, i) => (
        <g key={r}>
          <circle cx={60} cy={18 + i * 32} r={11} fill="rgba(255,255,255,.06)" stroke={i ? SUB : c} />
          <path d={`M60 ${18 + i * 32}l${i === 1 ? 6 : -6} -7`} stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
          <T x={82} y={22 + i * 32} c={INK}>{r}</T>
        </g>
      ))}
      <rect x={200} y={10} width={6} height={126} rx={3} fill="rgba(255,255,255,.10)" />
      {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M186 ${12 + i * 24}h8M212 ${12 + i * 24}h8`} stroke={SUB} />)}
      <rect x={186} y={44} width={34} height={16} rx={4} fill={INK} />
      <path d="M190 52h26" stroke="#141416" strokeWidth={2} />
      <T x={230} y={42} c={c}>0 db</T>
      <rect x={268} y={10} width={10} height={126} rx={3} fill="rgba(255,255,255,.05)" />
      <rect x={268} y={58} width={10} height={78} rx={3} fill={MINT} opacity={0.8} />
    </Svg>
  );
}

function Camelot({ c }: { c: string }) {
  const cx = W / 2, cy = 75;
  const on = new Set([7, 8, 9]);
  return (
    <Svg label="The Camelot wheel: neighbouring keys mix well">
      {Array.from({ length: 12 }, (_, i) => {
        const a0 = ((i * 30 - 105) * Math.PI) / 180, a1 = (((i + 1) * 30 - 105) * Math.PI) / 180;
        const seg = (r0: number, r1: number) => `M${cx + r0 * Math.cos(a0)} ${cy + r0 * Math.sin(a0)}A${r0} ${r0} 0 0 1 ${cx + r0 * Math.cos(a1)} ${cy + r0 * Math.sin(a1)}L${cx + r1 * Math.cos(a1)} ${cy + r1 * Math.sin(a1)}A${r1} ${r1} 0 0 0 ${cx + r1 * Math.cos(a0)} ${cy + r1 * Math.sin(a0)}Z`;
        const am = (a0 + a1) / 2;
        const hit = on.has(i + 1);
        return (
          <g key={i}>
            <path d={seg(70, 48)} fill={hit ? c : "rgba(255,255,255,.05)"} stroke="#000" opacity={hit ? 0.95 : 1} />
            <path d={seg(46, 26)} fill={i + 1 === 8 ? MINT : "rgba(255,255,255,.04)"} stroke="#000" />
            <T x={cx + 59 * Math.cos(am)} y={cy + 59 * Math.sin(am) + 3} a="middle" c={hit ? "#141416" : INK} s={8}>{`${i + 1}b`}</T>
            <T x={cx + 36 * Math.cos(am)} y={cy + 36 * Math.sin(am) + 3} a="middle" c={i + 1 === 8 ? "#141416" : SUB} s={8}>{`${i + 1}a`}</T>
          </g>
        );
      })}
      <T x={W} y={146} a="end">one step round or in mixes clean</T>
    </Svg>
  );
}

function WaveZoom({ c }: { c: string }) {
  const n = 96;
  return (
    <Svg label="A track's waveform with the beat grid over it">
      {Array.from({ length: n }, (_, i) => {
        const beat = i % 12 === 0;
        const h = (beat ? 0.92 : 0.25 + 0.35 * Math.abs(Math.sin(i * 1.7)) * (1 - (i % 12) / 14)) * 54;
        return <rect key={i} x={i * (W / n)} y={66 - h} width={W / n - 1} height={h * 2} fill={c} opacity={beat ? 1 : 0.55} />;
      })}
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${(i * 12 * W) / n} 4V128`} stroke={i % 4 === 0 ? INK : "rgba(255,255,255,.35)"} strokeWidth={i % 4 === 0 ? 1.5 : 1} />)}
      <T x={0} y={146}>bar 1</T><T x={(48 * W) / n} y={146}>bar 2</T>
    </Svg>
  );
}

function Headroom({ c }: { c: string }) {
  const marks = [0, -3, -6, -12, -18, -24];
  const y = (db: number) => 12 + (-db / 24) * 120;
  return (
    <Svg label="A level meter with headroom below 0 dBFS">
      <rect x={60} y={12} width={26} height={120} rx={4} fill="rgba(255,255,255,.05)" />
      <rect x={60} y={y(-6)} width={26} height={132 - y(-6)} rx={4} fill={MINT} opacity={0.85} />
      <rect x={60} y={y(-6)} width={26} height={4} fill={c} style={glow(c)} />
      {marks.map(m => <g key={m}><path d={`M90 ${y(m)}h10`} stroke={SUB} /><T x={106} y={y(m) + 4} c={m === 0 ? "#FF5A6A" : SUB}>{m === 0 ? "0 dbfs" : `${m}`}</T></g>)}
      <path d={`M160 ${y(0)}h170`} stroke="#FF5A6A" strokeDasharray="3 3" />
      <path d={`M160 ${y(-6)}h170`} stroke={c} />
      <T x={330} y={y(-3) + 4} a="end" c={INK}>headroom</T>
      <T x={330} y={y(-6) + 16} a="end">peaks land here</T>
    </Svg>
  );
}

function Picture({ url, alt }: { url?: string; alt?: string }) {
  if (!url) return null;
  return <img src={url} alt={alt ?? ""} style={{ display: "block", width: "100%", height: 168, objectFit: "cover", borderRadius: 8, opacity: 0.92 }} />;
}

/** The concept's picture, drawn for the glass. Returns null for "none". */
export function GlassVisual({ type, color, bpm, minor, root, scaleLabel, signalNodes, imageUrl, alt }: {
  type?: Visual; color: string; bpm?: number; minor?: boolean; root?: string; scaleLabel?: string; signalNodes?: string[]; imageUrl?: string; alt?: string;
}) {
  const c = color;
  switch (type) {
    case "waveform": return <Waveform c={c} />;
    case "waveform-compare": return <WaveformCompare c={c} />;
    case "frequency-bar": return <FrequencyBars c={c} />;
    case "piano": return <Keys c={c} />;
    case "piano-octave": return <Keys c={c} octaves={1} hz />;
    case "eq-curve": return <EqCurve c={c} />;
    case "amplitude-dial": return <AmplitudeDial c={c} />;
    case "bpm-grid": return <BpmGrid c={c} bpm={bpm} />;
    case "signal-chain": return <Chain c={c} nodes={signalNodes ?? ["source", "effects", "channel", "master", "speakers"]} />;
    case "stereo-field": return <Stereo c={c} />;
    case "note-lengths": return <NoteLengths c={c} />;
    case "scale-steps": return <ScaleSteps c={c} minor={minor} root={root} label={scaleLabel} />;
    case "chord-stack": return <ChordStack c={c} />;
    case "rhythm-dots": return <RhythmDots c={c} />;
    case "vinyl-platter": return <Vinyl c={c} />;
    case "mixer-channel": return <MixerStrip c={c} />;
    case "camelot-wheel": return <Camelot c={c} />;
    case "waveform-zoom": return <WaveZoom c={c} />;
    case "headroom-meter": return <Headroom c={c} />;
    case "fal-image": return <Picture url={imageUrl} alt={alt} />;
    default: return null;
  }
}

/** The label in the screen's top right corner for each picture. */
export const VISUAL_TAG: Partial<Record<Visual, string>> = {
  waveform: "waveform", "waveform-compare": "wave shapes", "frequency-bar": "spectrum", piano: "keys", "piano-octave": "octave",
  "eq-curve": "eq", "amplitude-dial": "level", "bpm-grid": "tempo", "signal-chain": "signal flow", "stereo-field": "stereo",
  "note-lengths": "note lengths", "scale-steps": "scale", "chord-stack": "chord", "rhythm-dots": "rhythm", "vinyl-platter": "platter",
  "mixer-channel": "channel", "camelot-wheel": "key wheel", "waveform-zoom": "beat grid", "headroom-meter": "headroom",
};

/** The diagram screen: boxes and arrows, placed as the lesson defines them (on a 300 x 160 board). */
export function GlassDiagram({ screen, color }: { screen: DiagramScreen; color: string }) {
  const sx = W / 300, sy = 1;
  const byId = Object.fromEntries(screen.nodes.map(n => [n.id, n]));
  const bw = 74, bh = 28;
  const cols = [color, LILAC, MINT, COBALT, SUN];
  return (
    <Svg h={168} label={`${screen.title}: ${screen.nodes.map(n => n.label).join(", ")}`}>
      <defs>
        <marker id="m1-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill={SUB} /></marker>
      </defs>
      {screen.arrows.map((a, i) => {
        const f = byId[a.from], t = byId[a.to];
        if (!f || !t) return null;
        const x1 = f.x * sx, y1 = f.y * sy, x2 = t.x * sx, y2 = t.y * sy;
        const dx = x2 - x1, dy = y2 - y1;
        // Clip the line where it leaves each box: the smaller of the two edge crossings.
        const k = Math.min(dx ? (bw / 2 + 3) / Math.abs(dx) : Infinity, dy ? (bh / 2 + 3) / Math.abs(dy) : Infinity, 0.5);
        const ox = dx * k, oy = dy * k;
        return (
          <g key={i}>
            <path d={`M${x1 + ox} ${y1 + oy}L${x2 - ox} ${y2 - oy}`} stroke={SUB} strokeWidth={1.3} markerEnd="url(#m1-arrow)" />
            {a.label && <T x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 5} a="middle" s={9}>{a.label.toLowerCase()}</T>}
          </g>
        );
      })}
      {screen.nodes.map((n, i) => {
        const col = cols[i % cols.length];
        const label = n.label.toLowerCase();
        return (
          <g key={n.id}>
            <rect x={n.x * sx - bw / 2} y={n.y * sy - bh / 2} width={bw} height={bh} rx={7} fill="#0B0B0D" stroke={col} strokeWidth={1.4} style={glow(col)} />
            <T x={n.x * sx} y={n.y * sy + 4} a="middle" c={INK} s={label.length > 12 ? 8.5 : 10}>{label.length > 16 ? label.slice(0, 15) + "…" : label}</T>
          </g>
        );
      })}
    </Svg>
  );
}
