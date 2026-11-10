"use client";
/**
 * A rhythm you can see and hear (10 Nov): one bar on a grid, the count written above it, and the cell that's
 * sounding lit as it plays. Rows are sounds (kick, clap, hats); accents are drawn bigger; groups (3, 3, 2) are
 * bracketed; marks point at a cell with a word ("downbeat", "offbeat"). With ticks on, every cell clicks softly,
 * so you hear the counting too. Lessons use it for everything you can count: beats, bars, halves and quarters,
 * the offbeat, the backbeat, anticipation, 3-3-2.
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { DRUM_PAD_NOTES } from "@/engine/params.gen";
import { emptyTrackV2, newLayerV2, type NoteEvent, type TrackV2 } from "@/lib/track2";
import { useEngineTrack } from "./useEngineTrack";
import { OUT, FLAG } from "@/engine";
import type { Show } from "@/content/lessons/schema";
import { Screen } from "./controls";
import { Meta } from "./LessonParts";

const PAD: Record<Show["rows"][number]["sound"], number> = { kick: 0, snare: 1, clap: 2, rim: 3, closed: 4, open: 5, shaker: 6 };
const COUNT: Record<number, string[]> = {
  4: ["1", "2", "3", "4"],
  8: ["1", "&", "2", "&", "3", "&", "4", "&"],
  16: ["1", "e", "&", "a", "2", "e", "&", "a", "3", "e", "&", "a", "4", "e", "&", "a"],
};

export function showTrack(show: Show): TrackV2 {
  const beat = 4 / show.steps;
  const l = newLayerV2("drums");
  const ev: NoteEvent[] = [];
  for (const r of show.rows) {
    const note = DRUM_PAD_NOTES[PAD[r.sound]];
    for (let i = 0; i < show.steps; i++) if (r.pattern[i] === "x") ev.push({ note, vel: r.accent?.[i] === "x" ? 1 : r.accent ? 0.55 : 0.85, start: i * beat, len: Math.min(0.2, beat * 0.8) });
  }
  if (show.ticks) for (let i = 0; i < show.steps; i++) ev.push({ note: DRUM_PAD_NOTES[PAD.rim], vel: i % (show.steps / 4) === 0 ? 0.32 : 0.16, start: i * beat, len: 0.05 });
  if (show.groups) { let at = 0; for (const g of show.groups) { ev.push({ note: DRUM_PAD_NOTES[PAD.rim], vel: 0.7, start: at * beat, len: 0.05 }); at += g; } }
  l.events = ev;
  return { ...emptyTrackV2(), bpm: show.bpm ?? 100, loop: 4, layers: [l] };
}

export function RhythmPicture({ show }: { show: Show }) {
  const track = useMemo(() => showTrack(show), [show]);
  const { engine, ready } = useEngineTrack(track);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { let gone = false; void ready().then(() => { if (gone) return; engine.metronome(false); engine.play(); }).catch(() => { /* needs a tap */ }); return () => { gone = true; try { engine.stop(); } catch { /* not started */ } }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const n = show.steps;
  const cell = beat >= 0 ? Math.floor((((beat % 4) + 4) % 4) / (4 / n)) : -1;
  const count = COUNT[n];
  const groupStart = new Set<number>(); const groupOf: number[] = [];
  if (show.groups) { let at = 0; show.groups.forEach((g, gi) => { groupStart.add(at); for (let k = 0; k < g; k++) groupOf[at + k] = gi; at += g; }); }
  const cols = { gridTemplateColumns: `64px repeat(${n}, 1fr)` } as CSSProperties;
  return (
    <Screen>
      <Meta left={beat >= 0 ? "playing" : "press play"} right={`${n === 4 ? "beats" : n === 8 ? "eighths" : "sixteenths"} · ${track.bpm} bpm`} />
      <div className={`rp rp-${n}`} role="img" aria-label={`${show.caption ?? "A rhythm"}: ${show.rows.map(r => `${r.name} ${r.pattern}`).join("; ")}`}>
        {show.groups ? (
          <div className="rp-row rp-groups" style={cols}><span />
            {show.groups.map((g, gi) => <span key={gi} className="rp-group" style={{ gridColumn: `span ${g}` }}><i />{g}</span>)}
          </div>
        ) : null}
        <div className="rp-row rp-count" style={cols}><span className="rp-name">count</span>
          {count.map((c, i) => <span key={i} className={`${i === cell ? "is-now" : ""} ${i % (n / 4) === 0 ? "is-beat" : ""}`}>{c}</span>)}
        </div>
        {show.rows.map(r => (
          <div key={r.name} className="rp-row" style={cols}><span className="rp-name">{r.name}</span>
            {Array.from(r.pattern).map((ch, i) => (
              <span key={i} className={`rp-cell ${i % (n / 4) === 0 ? "is-beat" : ""} ${i === cell ? "is-now" : ""} ${groupStart.has(i) ? "is-gstart" : ""} ${show.groups && groupOf[i] % 2 === 1 ? "is-galt" : ""}`}>
                {ch === "x" ? <b className={`${r.accent?.[i] === "x" ? "is-acc" : ""} ${i === cell ? "is-hit" : ""}`} /> : null}
              </span>
            ))}
          </div>
        ))}
        {show.marks?.length ? (
          <div className="rp-row rp-marks" style={cols}><span />
            {Array.from({ length: n }, (_, i) => { const m = show.marks!.find(x => x.at === i); return <span key={i}>{m ? <><i />{m.word}</> : null}</span>; })}
          </div>
        ) : null}
      </div>
      {show.caption ? <p className="rp-cap">{show.caption}</p> : null}
      <div className="fl-barkeys"><button type="button" className="ls-chip" onClick={() => { if (beat >= 0) engine.stop(); else void ready().then(() => engine.play()); }}>{beat >= 0 ? "stop" : "play it"}</button></div>
    </Screen>
  );
}
