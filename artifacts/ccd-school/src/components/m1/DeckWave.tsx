"use client";
/**
 * A dj deck's waveform coloured by frequency (low red, mid green, high blue, as djay and Serato draw
 * rekordbox's 3-band view), with bar numbers, a phrase label every eight bars and the playhead.
 * Turning a deck's low eq down takes the red out of its wave. The bands come from src/lib/djWaves.ts.
 */
import "./mix.css";
import { useMemo } from "react";
import type { Bands } from "@/lib/djWaves";

export const WAVE_C = { low: "#FF4155", mid: "#44E08A", high: "#4F8CFF" } as const;

const H = 46;
const toH = (a: number) => Math.max(0, Math.min(1, (20 * Math.log10(Math.max(a, 1e-6)) + 40) / 40));

export function DeckWave({ bands, beat, beats = 64, lowDb = 0, phrases, label, badge, loading }: {
  bands: Bands | null;
  /** The deck's place in its own track, in beats (-1 when stopped). */
  beat: number;
  beats?: number;
  /** The deck's low eq, in db: -15 takes most of the red out. */
  lowDb?: number;
  /** Section names at the start of each eight-bar phrase. */
  phrases: { beat: number; name: string }[];
  label: string;
  badge?: { text: string; fits: boolean | null };
  loading?: boolean;
}) {
  const W = 640;
  // Per bin, the three bands as bars, tallest at the back: every colour shows wherever its band reaches past the others.
  const paths = useMemo(() => {
    if (!bands) return null;
    const n = Math.round(beats * bands.perBeat);
    const g = Math.pow(10, lowDb / 20);
    const w = W / n;
    const out: React.ReactElement[] = [];
    for (let i = 0; i < n; i++) {
      const hs: [number, string][] = [
        [toH(bands.low[i % bands.low.length] * g), WAVE_C.low],
        [toH(bands.mid[i % bands.mid.length]), WAVE_C.mid],
        [toH(bands.high[i % bands.high.length]) * 0.85, WAVE_C.high],
      ];
      hs.sort((x, y) => y[0] - x[0]);
      for (const [h, c] of hs) {
        if (h <= 0.01) continue;
        const hh = h * (H / 2 - 1);
        out.push(<rect key={`${i}${c}`} x={(i * w).toFixed(2)} y={(H / 2 - hh).toFixed(2)} width={(w + 0.3).toFixed(2)} height={(hh * 2).toFixed(2)} fill={c} />);
      }
    }
    return out;
  }, [bands, beats, lowDb]);
  const head = beat >= 0 ? (((beat % beats) + beats) % beats) / beats : -1;
  const bars = beats / 4;
  return (
    <div className="dw" role="img" aria-label={`${label}: waveform coloured by frequency, red lows, green mids, blue highs${lowDb < -6 ? ", lows cut" : ""}${badge ? `, key ${badge.text}${badge.fits === null ? "" : badge.fits ? " fits" : " clashes"}` : ""}`}>
      <div className="dw-top" aria-hidden>
        {phrases.map(p => <span key={p.beat} className="dw-phrase" style={{ left: `${(p.beat / beats) * 100}%` }}>{p.name}</span>)}
        {badge ? <b className={`dw-key ${badge.fits === null ? "" : badge.fits ? "is-fit" : "is-clash"}`}>{badge.text}</b> : null}
      </div>
      <div className="dw-wave">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} aria-hidden>
          {Array.from({ length: bars }, (_, b) => <path key={b} d={`M${(b / bars) * W} 0V${H}`} className={b % 8 === 0 ? "dw-phr" : b % 4 === 0 ? "dw-bar4" : "dw-bar"} />)}
          {paths ? <g className="dw-bands">{paths}</g> : null}
          {head >= 0 ? <rect x={0} y={0} width={head * W} height={H} className="dw-played" /> : null}
          {head >= 0 ? <path d={`M${head * W} 0V${H}`} className="dw-head" /> : null}
        </svg>
        {!paths ? <span className="dw-wait">{loading ? "measuring" : ""}</span> : null}
      </div>
      <div className="dw-bars" aria-hidden>
        {Array.from({ length: bars }, (_, b) => (b % 4 === 0 ? <span key={b} style={{ left: `${(b / bars) * 100}%` }}>{b + 1}</span> : null))}
      </div>
    </div>
  );
}
