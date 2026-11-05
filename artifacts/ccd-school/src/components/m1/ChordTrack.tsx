"use client";
/**
 * The chord track editor (Logic Pro's Chord Track, FL Studio's chord progression tool): one chord per bar
 * of your loop, named ("am") with its roman numeral in your key ("i"). Tap a bar, then a chord in key; or
 * tap a progression to fill every bar. Used in the studio's key panel and in the chord track lesson step.
 */
import "./chordtrack.css";
import { useState, type CSSProperties } from "react";
import { chordName, chordsInKey, PROGRESSIONS, progression, progressionName, romanOf, type Chord } from "@/lib/chords";
import { asScale } from "@/lib/theory";
import type { TrackV2 } from "@/lib/track2";

export function ChordTrackEditor({ track, chords, onChange, now, onPreview, accent = "var(--led-mint)" }: {
  track: Pick<TrackV2, "root" | "scale" | "loop">;
  chords: (Chord | null)[];
  onChange: (c: (Chord | null)[]) => void;
  /** The bar playing now (lit), or -1. */
  now?: number;
  /** Sound a chord when it is picked. */
  onPreview?: (c: Chord) => void;
  accent?: string;
}) {
  const scale = asScale(track.scale);
  const bars = Math.max(1, Math.min(4, Math.round((track.loop || 4) / 4)));
  const [bar, setBar] = useState(0);
  const at = Math.min(bar, bars - 1);
  const key = chordsInKey(track.root, scale);
  const cur = Array.from({ length: bars }, (_, i) => chords[i] ?? null);
  const pick = (c: Chord | null) => {
    const next = [...cur];
    next[at] = c;
    onChange(next);
    if (c) onPreview?.(c);
    if (c && at < bars - 1) setBar(at + 1);
  };
  const same = (a: Chord | null, b: Chord | null) => !!a && !!b && a.root === b.root && a.q === b.q && !!a.sev === !!b.sev;
  return (
    <div className="ct" style={{ ["--c" as string]: accent } as CSSProperties}>
      <div className="ct-bars" role="radiogroup" aria-label="Chord track: one chord per bar">
        {cur.map((c, i) => (
          <button key={i} type="button" role="radio" aria-checked={i === at} className={`ct-bar ${i === at ? "is-sel" : ""} ${i === now ? "is-now" : ""}`}
            aria-label={`bar ${i + 1}: ${c ? `${chordName(c)}, ${romanOf(c, track.root, scale)}` : "no chord"}`} onClick={() => setBar(i)}>
            <small>bar {i + 1}</small>
            <b>{c ? chordName(c) : "·"}</b>
            <span>{c ? romanOf(c, track.root, scale) : ""}</span>
          </button>
        ))}
      </div>
      <div className="ct-pick" role="radiogroup" aria-label={`Chords in key for bar ${at + 1}`}>
        {key.map(k => {
          const on = same(cur[at], k);
          return (
            <button key={k.degree} type="button" role="radio" aria-checked={on} className={`ct-chip ${on ? "is-on" : ""}`} onClick={() => pick({ root: k.root, q: k.q })}>
              <b>{chordName(k)}</b><span>{k.roman}</span>
            </button>
          );
        })}
        <button type="button" className="ct-chip" aria-label={`No chord in bar ${at + 1}`} onClick={() => pick(null)}><b>none</b></button>
      </div>
      <div className="ct-progs" aria-label="Progressions: fill every bar">
        {/* A progression is four bars: a shorter loop grows to four bars and your parts repeat to fill it. */}
        {PROGRESSIONS.map(p => {
          const prog = progression(track.root, scale, p, 4);
          const on = bars === 4 && prog.every((c, i) => same(c, cur[i]));
          return (
            <button key={p.join()} type="button" className={`ct-prog ${on ? "is-on" : ""}`} aria-pressed={on} onClick={() => { onChange(prog); if (onPreview && prog[0]) onPreview(prog[0]); }}>
              {progressionName(track.root, scale, p)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
