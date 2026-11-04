"use client";
/**
 * The note grid (a piano roll) on one of your parts. Rows are all twelve notes, black keys too, two
 * octaves around your part; columns are sixteenth steps. Tap an empty square to add a note, tap a note
 * to pick it, then make it longer or shorter, louder or softer, move it, or delete it. Plays as you edit.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { readTrackV2, writeTrackV2, type LayerType, type NoteEvent } from "@/lib/track2";
import { NOTE_NAMES } from "@/lib/theory";
import { Screen } from "./controls";
import { Meta } from "./LessonParts";
import { Frame, useLoop, withPart, type StepProps } from "./ToolSteps";

const BLACK = new Set([1, 3, 6, 8, 10]);
const STEP = 0.25;

export function GridStep({ screen, accent, onNext, tail }: StepProps) {
  const type = (screen.layer ?? "lead") as LayerType;
  const [base] = useState(() => withPart(readTrackV2(), type));
  const part = base.track.layers.find(l => l.type === type)!;
  const [evs, setEvs] = useState<NoteEvent[]>(() => part.events.map(e => ({ ...e })));
  const [sel, setSel] = useState<number | null>(null);
  const loop = base.track.loop || 4;
  const cols = Math.round(loop / STEP);
  // Two octaves, centred on the part's notes; highest row on top.
  const mid = evs.length ? Math.round(evs.reduce((a, e) => a + e.note, 0) / evs.length) : 60;
  const lo = Math.max(24, Math.min(96, mid - 12));
  const rows = Array.from({ length: 25 }, (_, i) => lo + 24 - i);
  const shown = useMemo(() => ({ ...base.track, layers: base.track.layers.map(l => (l.type === type ? { ...l, events: evs } : l)) }), [base, type, evs]);
  const { beat, playing, toggle } = useLoop(shown);
  // Open with your notes in view, not the empty top of the roll.
  const roll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const top = evs.length ? Math.max(...evs.map(e => e.note)) : mid;
    const row = rows.indexOf(Math.min(rows[0], top + 3));
    if (roll.current && row > 0) roll.current.scrollTop = row * 13;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // One tab stop for the whole roll: arrow keys move between squares, Enter or Space taps, Delete removes the picked note.
  const [fc, setFc] = useState<[number, number]>(() => { const e = evs[0]; return e ? [Math.max(0, rows.indexOf(e.note)), Math.round(e.start / STEP)] : [12, 0]; });
  const onRollKey = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    const d: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (ev.key === "Delete" || ev.key === "Backspace") { if (sel !== null) { ev.preventDefault(); edit(() => null); setSel(null); } return; }
    const m = d[ev.key];
    if (!m) return;
    ev.preventDefault();
    const r = Math.max(0, Math.min(rows.length - 1, fc[0] + m[0])), c = Math.max(0, Math.min(cols - 1, fc[1] + m[1]));
    setFc([r, c]);
    (roll.current?.querySelector(`[data-rc="${r}-${c}"]`) as HTMLElement | null)?.focus();
  };
  const playCol = playing ? Math.floor((((beat % loop) + loop) % loop) / STEP) : -1;
  const at = (note: number, col: number) => evs.findIndex(e => e.note === note && e.start <= col * STEP + 1e-6 && e.start + e.len > col * STEP + 1e-6);
  const tap = (note: number, col: number) => {
    const i = at(note, col);
    if (i >= 0) { setSel(i === sel ? null : i); return; }
    const vel = sel !== null && evs[sel] ? evs[sel].vel : 0.8;
    setEvs(es => [...es, { start: col * STEP, len: STEP * 2, note, vel }]);
    setSel(evs.length);
  };
  const edit = (f: (e: NoteEvent) => NoteEvent | null) => {
    if (sel === null) return;
    setEvs(es => { const out = es.map((e, i) => (i === sel ? f(e) : e)).filter(Boolean) as NoteEvent[]; return out; });
  };
  const s = sel !== null ? evs[sel] : null;
  const keep = () => {
    const t = readTrackV2();
    const has = t.layers.some(l => l.type === type && l.events.length);
    const next = has ? t : base.track;
    writeTrackV2({ ...next, layers: next.layers.map(l => (l.type === type ? { ...l, events: [...evs].sort((a, b) => a.start - b.start || a.note - b.note), id: l.id === "__tool" ? `grid-${Date.now().toString(36)}` : l.id } : l)), updatedAt: Date.now() });
    window.dispatchEvent(new Event("ccd:song"));
    onNext();
  };
  const tools: [string, string, () => void][] = s ? [
    ["shorter", "Make the note shorter", () => edit(e => ({ ...e, len: Math.max(STEP, e.len - STEP) }))],
    ["longer", "Make the note longer", () => edit(e => ({ ...e, len: Math.min(loop - e.start, e.len + STEP) }))],
    ["softer", "Play the note softer", () => edit(e => ({ ...e, vel: Math.max(0.1, Math.round((e.vel - 0.15) * 100) / 100) }))],
    ["louder", "Play the note louder", () => edit(e => ({ ...e, vel: Math.min(1, Math.round((e.vel + 0.15) * 100) / 100) }))],
    ["earlier", "Move the note earlier", () => edit(e => ({ ...e, start: Math.max(0, e.start - STEP) }))],
    ["later", "Move the note later", () => edit(e => ({ ...e, start: Math.min(loop - STEP, e.start + STEP) }))],
    ["up", "Move the note up a semitone", () => edit(e => ({ ...e, note: Math.min(127, e.note + 1) }))],
    ["down", "Move the note down a semitone", () => edit(e => ({ ...e, note: Math.max(0, e.note - 1) }))],
    ["delete", "Delete the note", () => { edit(() => null); setSel(null); }],
  ] : [];
  return (
    <Frame screen={screen} playing={playing} toggle={toggle} tail={tail} onGo={keep} go="keep these notes"
      note={base.added ? `your song has no ${type} yet, so here are a few notes to edit. keep adds them.` : null}
      inst={<>
        <Screen>
          <Meta left={`note grid · your ${type}`} right={s ? `${NOTE_NAMES[s.note % 12]}${Math.floor(s.note / 12) - 1} · ${Math.max(1, Math.round(s.len / STEP))} step${Math.round(s.len / STEP) > 1 ? "s" : ""} long · velocity ${Math.round(s.vel * 127)}` : playing ? "tap a square to add a note" : "press play"} />
          <div ref={roll} className="gr-roll" role="grid" onKeyDown={onRollKey} aria-label={`Note grid for your ${type}`} style={{ ["--c" as string]: accent, ["--cols" as string]: cols } as CSSProperties}>
            {rows.map((n, ri) => (
              <div key={n} role="row" className={`gr-row ${BLACK.has(n % 12) ? "is-black" : ""}`}>
                {/* A keyboard down the side: black keys dark, every C named. */}
                <span className={`gr-key ${BLACK.has(n % 12) ? "is-black" : ""}`}>{n % 12 === 0 ? `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}` : ""}</span>
                {/* Each note drawn as one bar over its squares; the squares underneath take the taps. */}
                {evs.map((e, i) => e.note === n ? <i key={`n${i}`} className={`gr-bar ${i === sel ? "is-sel" : ""}`} aria-hidden style={{ left: `calc(var(--kw) + (100% - var(--kw)) * ${e.start / loop})`, width: `calc((100% - var(--kw)) * ${e.len / loop} - 1px)`, opacity: 0.4 + e.vel * 0.6 } as CSSProperties} /> : null)}
                {Array.from({ length: cols }, (_, c) => {
                  const i = at(n, c);
                  const e = i >= 0 ? evs[i] : null;
                  const head = e && Math.abs(e.start - c * STEP) < 1e-6;
                  return <button key={c} type="button" role="gridcell" aria-label={`${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}, step ${c + 1}${e ? ", note" : ""}`}
                    className={`gr-cell ${c % 4 === 0 ? "is-beat" : ""} ${e ? "is-note" : ""} ${head ? "is-head" : ""} ${i >= 0 && i === sel ? "is-sel" : ""} ${c === playCol ? "is-now" : ""}`}
                    data-rc={`${ri}-${c}`} tabIndex={fc[0] === ri && fc[1] === c ? 0 : -1} onFocus={() => setFc([ri, c])}
                    onClick={() => tap(n, c)} />;
                })}
              </div>
            ))}
          </div>
        </Screen>
        <div className="gr-tools" aria-label="Edit the picked note">
          {s ? tools.map(([l, a, f]) => <button key={l} type="button" className="ls-chip" aria-label={a} onClick={f}>{l}</button>) : <span className="gr-tip">tap a note to edit it, or an empty square to add one</span>}
        </div>
      </>} />
  );
}
