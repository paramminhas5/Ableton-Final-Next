"use client";
/**
 * A dj deck's waveform coloured by frequency (low red, mid green, high blue, as djay and Serato draw
 * rekordbox's 3-band view), with bar numbers, a phrase label every eight bars and the playhead.
 * Turning a deck's low eq down takes the red out of its wave. The bands come from src/lib/djWaves.ts.
 * Above it, the zoomed view rekordbox and djay put over the overview: two bars around the playhead,
 * scrolling under a fixed playhead, with the beat grid, bar numbers, hot cues and the loop. On a phone
 * the zoomed view leads and the overview shrinks to a strip.
 */
import "./mix.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { inLoop, zoomBeats, zoomPaths, zoomShift, type Bands } from "@/lib/djWaves";

export const WAVE_C = { low: "#FF4155", mid: "#44E08A", high: "#4F8CFF" } as const;

const H = 46;
const toH = (a: number) => Math.max(0, Math.min(1, (20 * Math.log10(Math.max(a, 1e-6)) + 40) / 40));

/** The zoomed view's width in beats: two bars, as a cdj's close-up shows around the playhead. */
const WIN = 8;

function useBox(): [React.RefObject<HTMLDivElement>, number, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<[number, number]>([0, 0]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setBox(b => (b[0] === el.clientWidth && b[1] === el.clientHeight ? b : [el.clientWidth, el.clientHeight]));
    read();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref as React.RefObject<HTMLDivElement>, box[0], box[1]];
}

export type Cue = { beat: number; name: string };

/** The scrolling close-up: the track slides left under a playhead fixed in the middle. */
export function DeckZoom({ bands, beat, beats, lowDb = 0, cues = [], loop = null }: { bands: Bands | null; beat: number; beats: number; lowDb?: number; cues?: Cue[]; loop?: { start: number; len: number } | null }) {
  const [ref, w, h] = useBox();
  const ppb = w / WIN;
  const paths = useMemo(() => (bands && w > 0 && h > 0 ? zoomPaths(bands, beats, ppb, h / 2, lowDb) : null), [bands, beats, ppb, h, lowDb, w]);
  const head = inLoop(beat >= 0 ? ((beat % beats) + beats) % beats : 0, loop);
  const shift = zoomShift(head, WIN, ppb);
  const span = beats * ppb;
  const near = (x: number) => x > -60 && x < w + 60;
  return (
    <div ref={ref} className="dz" aria-hidden>
      {w > 0 && h > 0 ? (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {paths ? (
            <g transform={`translate(${shift.toFixed(1)} 0)`}>
              {[-1, 0, 1].map(k => (
                <g key={k} transform={`translate(${(k * span).toFixed(1)} 0)`}>
                  <path d={paths.low} fill={WAVE_C.low} />
                  <path d={paths.mid} fill={WAVE_C.mid} />
                  <path d={paths.high} fill={WAVE_C.high} />
                </g>
              ))}
            </g>
          ) : null}
          {loop ? [-1, 0, 1].map(k => {
            const x = shift + (loop.start + k * beats) * ppb;
            return near(x) || near(x + loop.len * ppb) ? <g key={`l${k}`} className="dz-loop"><rect x={x} y={0} width={loop.len * ppb} height={h} /><path d={`M${x} 0V${h}M${x + loop.len * ppb} 0V${h}`} /></g> : null;
          }) : null}
          {zoomBeats(head, WIN, beats).map(({ beat: b, at }) => {
            const x = shift + at * ppb;
            if (b % 4 === 0) return (
              <g key={at} className={b % 32 === 0 ? "dz-phr" : "dz-bar"}>
                <path d={`M${x.toFixed(1)} 0V${h}`} />
                <text x={x + 3} y={9}>{b / 4 + 1}</text>
              </g>
            );
            return <path key={at} className="dz-beat" d={`M${x.toFixed(1)} 0V5M${x.toFixed(1)} ${h - 5}V${h}`} />;
          })}
          {cues.flatMap(c => [-1, 0, 1].map(k => {
            const x = shift + (c.beat + k * beats) * ppb;
            return near(x) ? <g key={`${c.name}${k}`} className="dz-cue"><path d={`M${x - 5} 0H${x + 5}L${x} 7Z`} /><path d={`M${x} 0V${h}`} className="dz-cue-l" /><text x={x + 6} y={h - 4}>{c.name}</text></g> : null;
          }))}
          <rect x={0} y={0} width={w / 2} height={h} className="dz-played" />
          <path d={`M${w / 2} 0V${h}`} className="dz-head" />
        </svg>
      ) : null}
    </div>
  );
}

export function DeckWave({ bands, beat, beats = 64, lowDb = 0, phrases, label, badge, loading, cues, loop, zoom = true }: {
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
  /** Hot cues, in the deck's own beats, marked on the zoomed view. */
  cues?: Cue[];
  /** A loop that is on, in the deck's own beats. */
  loop?: { start: number; len: number } | null;
  /** The zoomed, scrolling view above the overview. */
  zoom?: boolean;
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
    <div className={`dw ${zoom ? "has-zoom" : ""}`} role="img" aria-label={`${label}: waveform coloured by frequency, red lows, green mids, blue highs${lowDb < -6 ? ", lows cut" : ""}${badge ? `, key ${badge.text}${badge.fits === null ? "" : badge.fits ? " fits" : " clashes"}` : ""}${beat >= 0 ? `, at bar ${Math.floor((((beat % beats) + beats) % beats) / 4) + 1}` : ""}${loop ? `, looping ${loop.len} beats` : ""}`}>
      {zoom ? <DeckZoom bands={bands} beat={beat} beats={beats} lowDb={lowDb} cues={cues} loop={loop} /> : null}
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
