"use client";
/**
 * Takes and comping on one of your parts. Record up to three takes of the same part (each one is kept,
 * like take lanes in Live), then build the part from the best bits: the loop is split into four pieces and
 * for each piece you pick which take plays. Keep writes the comped part into your song.
 */
import { useMemo, useState, type CSSProperties } from "react";
import { readTrackV2, writeTrackV2, type LayerType, type NoteEvent, type TrackV2 } from "@/lib/track2";
import type { Take } from "@/lib/lessonTake";
import { Screen } from "./controls";
import { Meta } from "./LessonParts";
import { TryIt } from "./TryIt";
import { Chips, Frame, useLoop, withPart, type StepProps } from "./ToolSteps";

const PIECES = 4;

/** The comped part: for each piece of the loop, the notes of the take picked for it. Pure. */
export function comped(takes: NoteEvent[][], pick: number[], loop: number): NoteEvent[] {
  const size = loop / PIECES;
  const out: NoteEvent[] = [];
  pick.forEach((t, p) => {
    for (const e of takes[t] ?? []) if (e.start >= p * size - 1e-6 && e.start < (p + 1) * size - 1e-6) out.push({ ...e, len: Math.min(e.len, loop - e.start) });
  });
  return out.sort((a, b) => a.start - b.start || a.note - b.note);
}

/** Three example takes made from a part, for when you skip recording: same notes, each a little different. */
function exampleTakes(events: NoteEvent[], loop: number): NoteEvent[][] {
  const late = events.map(e => ({ ...e, start: Math.min(loop - 0.05, e.start + 0.08) }));
  const sparse = events.filter((_, i) => i % 3 !== 1);
  const loud = events.map((e, i) => ({ ...e, vel: i % 2 ? 0.5 : 1 }));
  return [late, sparse, loud];
}

export function CompStep({ screen, accent, onNext, tail }: StepProps) {
  const type = (screen.layer ?? "lead") as LayerType;
  const [base] = useState(() => withPart(readTrackV2(), type));
  const loop = base.track.loop || 4;
  const [takes, setTakes] = useState<NoteEvent[][]>([]);
  const [recording, setRecording] = useState(true);
  const [made, setMade] = useState(false);
  const [pick, setPick] = useState<number[]>(Array(PIECES).fill(0));
  const part = useMemo(() => comped(takes, pick, loop), [takes, pick, loop]);
  const shown = useMemo((): TrackV2 => ({ ...base.track, layers: base.track.layers.map(l => (l.type === type ? { ...l, events: part } : l)) }), [base, type, part]);
  if (recording) {
    return <TryIt key={takes.length} type={type} title={`take ${takes.length + 1}`}
      coach={{ body: `${screen.body}\n\ntake ${takes.length + 1} of 3. play your ${type} the whole way through; every take is kept.`, hint: screen.hint, goal: { notes: 3 } }}
      onUse={(t: Take) => { const all = [...takes, t.events]; setTakes(all); if (all.length >= 3) setRecording(false); }}
      onSkip={() => {
        if (takes.length) { setRecording(false); return; }
        const src = base.track.layers.find(l => l.type === type)?.events ?? [];
        setTakes(exampleTakes(src, loop)); setMade(true); setRecording(false);
      }} />;
  }
  return <Comp {...{ screen, accent, onNext, tail, type, loop, takes, pick, setPick, shown, made, base: base.track, more: takes.length < 3 && !made ? () => setRecording(true) : undefined }} />;
}

function Comp({ screen, accent, onNext, tail, type, loop, takes, pick, setPick, shown, made, base, more }: StepProps & { type: LayerType; loop: number; takes: NoteEvent[][]; pick: number[]; setPick: (p: number[]) => void; shown: TrackV2; made: boolean; base: TrackV2; more?: () => void }) {
  const { beat, playing, toggle } = useLoop(shown);
  const now = playing ? Math.floor((((beat % loop) + loop) % loop) / (loop / PIECES)) : -1;
  const keep = () => {
    const t = readTrackV2();
    const next = t.layers.some(l => l.type === type && l.events.length) ? t : base;
    const events = shown.layers.find(l => l.type === type)?.events ?? [];
    writeTrackV2({ ...next, layers: next.layers.map(l => (l.type === type ? { ...l, events, id: l.id === "__tool" ? `comp-${Date.now().toString(36)}` : l.id } : l)), updatedAt: Date.now() });
    window.dispatchEvent(new Event("ccd:song"));
    onNext();
  };
  const size = loop / PIECES;
  return (
    <Frame screen={screen} playing={playing} toggle={toggle} tail={tail} onGo={keep} go="keep the comp"
      note={made ? "you skipped recording, so here are three takes made from your part: one a little late, one with gaps, one with uneven hits." : null}
      inst={<>
        <Screen>
          <Meta left={`take lanes · your ${type}`} right={playing ? "tap a piece to use that take" : "press play"} />
          <div className="cp-lanes" role="grid" aria-label="Takes by piece" style={{ ["--c" as string]: accent } as CSSProperties}>
            {takes.map((tk, t) => (
              <div key={t} role="row" className="cp-row">
                <span className="cp-name">take {t + 1}</span>
                {Array.from({ length: PIECES }, (_, p) => {
                  const notes = tk.filter(e => e.start >= p * size - 1e-6 && e.start < (p + 1) * size - 1e-6);
                  return (
                    <button key={p} type="button" role="gridcell" aria-pressed={pick[p] === t} aria-label={`Piece ${p + 1}: use take ${t + 1}`}
                      className={`cp-cell ${pick[p] === t ? "is-on" : ""} ${now === p ? "is-now" : ""}`} onClick={() => setPick(pick.map((x, i) => (i === p ? t : x)))}>
                      {notes.map((e, i) => <i key={i} style={{ left: `${((e.start - p * size) / size) * 100}%`, opacity: 0.4 + e.vel * 0.6 }} />)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </Screen>
        <Chips label="Quick picks" accent={accent} items={takes.map((_, t) => t)} value={pick.every(p => p === pick[0]) ? pick[0] : -1} onPick={t => setPick(Array(PIECES).fill(t))} name={t => `all take ${t + 1}`} />
        {more && <div className="fl-again" style={{ justifyContent: "flex-start", marginTop: 8 }}><button type="button" className="ls-chip" onClick={more}>record another take</button></div>}
      </>} />
  );
}
