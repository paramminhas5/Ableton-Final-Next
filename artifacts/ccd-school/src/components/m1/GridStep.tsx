"use client";
/**
 * The note grid (a piano roll) on one of your parts. Rows are all twelve notes, black keys too, two
 * octaves around your part; columns are sixteenth steps. Phone-safe editing, after Ableton Note:
 * tap an empty square to add a note, tap a note to pick it, hold a note to add it to the picked ones,
 * drag the handle on a picked note's right edge sideways for length and up or down for velocity, and
 * use the strip for nudge, transpose, quantise and the rest. Plays as you edit.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { readTrackV2, writeTrackV2, type LayerType, type NoteEvent } from "@/lib/track2";
import { NOTE_NAMES } from "@/lib/theory";
import { Dice, Screen } from "./controls";
import { fillMelody, newSeed } from "@/lib/dice";
import { Meta } from "./LessonParts";
import { Frame, useLoop, withPart, type StepProps } from "./ToolSteps";

const BLACK = new Set([1, 3, 6, 8, 10]);
const STEP = 0.25;

export function GridStep({ screen, accent, onNext, tail }: StepProps) {
  const type = (screen.layer ?? "lead") as LayerType;
  const [base] = useState(() => withPart(readTrackV2(), type));
  const part = base.track.layers.find(l => l.type === type)!;
  const [evs, setEvs] = useState<NoteEvent[]>(() => part.events.map(e => ({ ...e })));
  // The picked notes. `sel` is the one the handle and readout follow (the last picked).
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [sel, setSelRaw] = useState<number | null>(null);
  const setSel = (i: number | null) => { setSelRaw(i); setPicked(i === null ? new Set() : new Set([i])); };
  const [drag, setDrag] = useState<{ kind: "len" | "vel"; text: string } | null>(null);
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
    const rh = (roll.current?.querySelector(".gr-row") as HTMLElement | null)?.offsetHeight ?? 13;
    if (roll.current && row > 0) roll.current.scrollTop = row * (rh + 1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // One tab stop for the whole roll: arrow keys move between squares, Enter or Space taps, Delete removes the picked note.
  const [fc, setFc] = useState<[number, number]>(() => { const e = evs[0]; return e ? [Math.max(0, rows.indexOf(e.note)), Math.round(e.start / STEP)] : [12, 0]; });
  const onRollKey = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    const d: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (ev.key === "Delete" || ev.key === "Backspace") { if (picked.size) { ev.preventDefault(); edit(() => null); setSel(null); } return; }
    const m = d[ev.key];
    if (!m) return;
    ev.preventDefault();
    const r = Math.max(0, Math.min(rows.length - 1, fc[0] + m[0])), c = Math.max(0, Math.min(cols - 1, fc[1] + m[1]));
    setFc([r, c]);
    (roll.current?.querySelector(`[data-rc="${r}-${c}"]`) as HTMLElement | null)?.focus();
  };
  const playCol = playing ? Math.floor((((beat % loop) + loop) % loop) / STEP) : -1;
  const at = (note: number, col: number) => evs.findIndex(e => e.note === note && e.start <= col * STEP + 1e-6 && e.start + e.len > col * STEP + 1e-6);
  // Undo for every edit in the roll.
  const past = useRef<NoteEvent[][]>([]);
  const commit = (next: NoteEvent[]) => { past.current.push(evs); if (past.current.length > 60) past.current.shift(); setEvs(next); };
  const undo = () => { const prev = past.current.pop(); if (prev) { setEvs(prev); setSel(null); } };
  // Fill and randomise: the notes before the dice, so the amount grows and shrinks the same fill.
  const dice = useRef<{ base: NoteEvent[]; result: string } | null>(null);
  const [diceAmt, setDiceAmt] = useState(0);
  const [diceSeed, setDiceSeed] = useState(1);
  const lastDice = useRef(0);
  const rollDice = (amt: number, seed: number) => {
    if (!dice.current || dice.current.result !== JSON.stringify(evs)) dice.current = { base: evs, result: "" };
    const root = base.track.root ?? 45;
    const next = fillMelody(dice.current.base, { loop, step: STEP, root, scale: base.track.scale === "major" ? "major" : "minor", amount: amt, seed, lo: rows[rows.length - 1] + 5, hi: rows[0] - 5 });
    dice.current.result = JSON.stringify(next);
    const now = Date.now();
    if (now - lastDice.current > 800) commit(next); else setEvs(next);
    lastDice.current = now;
    setDiceAmt(amt);
    setDiceSeed(seed);
    setSel(null);
  };
  const holdT = useRef(0);
  const held = useRef(false);
  const tap = (note: number, col: number) => {
    if (held.current) { held.current = false; return; }
    const i = at(note, col);
    if (i >= 0) { setSel(i === sel && picked.size === 1 ? null : i); return; }
    const vel = sel !== null && evs[sel] ? evs[sel].vel : 0.8;
    commit([...evs, { start: col * STEP, len: STEP * 2, note, vel }]);
    setSel(evs.length);
  };
  // Hold a note to add it to (or take it out of) the picked ones.
  const holdStart = (note: number, col: number) => {
    window.clearTimeout(holdT.current);
    held.current = false;
    const i = at(note, col);
    if (i < 0) return;
    holdT.current = window.setTimeout(() => {
      held.current = true;
      setPicked(p => { const n = new Set(p); if (n.has(i)) n.delete(i); else n.add(i); return n; });
      setSelRaw(i);
    }, 420);
  };
  const holdEnd = () => window.clearTimeout(holdT.current);
  const edit = (f: (e: NoteEvent) => NoteEvent | null) => {
    if (!picked.size) return;
    const out = evs.map((e, i) => (picked.has(i) ? f(e) : e));
    // Keep the picked ones picked through the edit (deletes drop out).
    const keep: number[] = [];
    let k = 0;
    const next: NoteEvent[] = [];
    out.forEach((e, i) => { if (e) { if (picked.has(i)) keep.push(k); next.push(e); k++; } });
    commit(next);
    setPicked(new Set(keep));
    setSelRaw(keep.length ? keep[keep.length - 1] : null);
  };
  const s = sel !== null ? evs[sel] : null;
  // The handle on a picked note's right edge: sideways for length, up and down for velocity.
  const handleDown = (e: React.PointerEvent<HTMLElement>, i: number) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const rowEl = (e.currentTarget as HTMLElement).closest(".gr-row") as HTMLElement | null;
    const colW = rowEl ? (rowEl.clientWidth - (rowEl.querySelector(".gr-key") as HTMLElement).offsetWidth) / cols : 12;
    const start = { x: e.clientX, y: e.clientY, len: evs[i].len, vel: evs[i].vel };
    let axis: "len" | "vel" | null = null;
    let pushed = false;
    const move = (m: PointerEvent) => {
      const dx = m.clientX - start.x, dy = m.clientY - start.y;
      if (!axis) { if (Math.hypot(dx, dy) < 6) return; axis = Math.abs(dx) >= Math.abs(dy) ? "len" : "vel"; }
      if (!pushed) { past.current.push(evs); pushed = true; }
      if (axis === "len") {
        const len = Math.max(STEP, Math.min(loop - evs[i].start, Math.round((start.len + (dx / colW) * STEP) / STEP) * STEP));
        setEvs(es => es.map((x, j) => (j === i ? { ...x, len } : x)));
        setDrag({ kind: "len", text: `${Math.round(len / STEP)} step${Math.round(len / STEP) > 1 ? "s" : ""}` });
      } else {
        const vel = Math.max(0.05, Math.min(1, Math.round((start.vel - dy / 160) * 100) / 100));
        setEvs(es => es.map((x, j) => (j === i ? { ...x, vel } : x)));
        setDrag({ kind: "vel", text: `velocity ${Math.round(vel * 127)}` });
      }
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); setDrag(null); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };
  const keep = () => {
    const t = readTrackV2();
    const has = t.layers.some(l => l.type === type && l.events.length);
    const next = has ? t : base.track;
    writeTrackV2({ ...next, layers: next.layers.map(l => (l.type === type ? { ...l, events: [...evs].sort((a, b) => a.start - b.start || a.note - b.note), id: l.id === "__tool" ? `grid-${Date.now().toString(36)}` : l.id } : l)), updatedAt: Date.now() });
    window.dispatchEvent(new Event("ccd:song"));
    onNext();
  };
  const many = picked.size > 1;
  const it = many ? "the picked notes" : "the note";
  // The strip: what a phone can do without dragging. Each is one undo step.
  const tools: [string, string, () => void][] = s ? [
    ["‹ nudge", `Nudge ${it} a step earlier`, () => edit(e => ({ ...e, start: Math.max(0, e.start - STEP) }))],
    ["nudge ›", `Nudge ${it} a step later`, () => edit(e => ({ ...e, start: Math.min(loop - STEP, e.start + STEP) }))],
    ["−1", `Transpose ${it} down a semitone`, () => edit(e => ({ ...e, note: Math.max(0, e.note - 1) }))],
    ["+1", `Transpose ${it} up a semitone`, () => edit(e => ({ ...e, note: Math.min(127, e.note + 1) }))],
    ["−oct", `Transpose ${it} down an octave`, () => edit(e => ({ ...e, note: Math.max(0, e.note - 12) }))],
    ["+oct", `Transpose ${it} up an octave`, () => edit(e => ({ ...e, note: Math.min(127, e.note + 12) }))],
    ["quantise", `Quantise ${it} to the sixteenth grid`, () => edit(e => ({ ...e, start: Math.min(loop - STEP, Math.round(e.start / STEP) * STEP), len: Math.max(STEP, Math.round(e.len / STEP) * STEP) }))],
    ["shorter", `Make ${it} shorter`, () => edit(e => ({ ...e, len: Math.max(STEP, e.len - STEP) }))],
    ["longer", `Make ${it} longer`, () => edit(e => ({ ...e, len: Math.min(loop - e.start, e.len + STEP) }))],
    ["softer", `Play ${it} softer`, () => edit(e => ({ ...e, vel: Math.max(0.1, Math.round((e.vel - 0.15) * 100) / 100) }))],
    ["louder", `Play ${it} louder`, () => edit(e => ({ ...e, vel: Math.min(1, Math.round((e.vel + 0.15) * 100) / 100) }))],
    ["delete", `Delete ${it}`, () => { edit(() => null); setSel(null); }],
  ] : [];
  return (
    <Frame screen={screen} playing={playing} toggle={toggle} tail={tail} onGo={keep} go="keep these notes"
      note={base.added ? `your song has no ${type} yet, so here are a few notes to edit. keep adds them.` : null}
      inst={<>
        <Screen>
          <Meta left={`note grid · your ${type}`} right={drag ? drag.text : many ? `${picked.size} notes picked` : s ? `${NOTE_NAMES[s.note % 12]}${Math.floor(s.note / 12) - 1} · ${Math.max(1, Math.round(s.len / STEP))} step${Math.round(s.len / STEP) > 1 ? "s" : ""} long · velocity ${Math.round(s.vel * 127)}` : playing ? "tap a square to add a note" : "press play"} />
          <div ref={roll} className="gr-roll" role="grid" onKeyDown={onRollKey} aria-label={`Note grid for your ${type}`} style={{ ["--c" as string]: accent, ["--cols" as string]: cols } as CSSProperties}>
            {rows.map((n, ri) => (
              <div key={n} role="row" className={`gr-row ${BLACK.has(n % 12) ? "is-black" : ""}`}>
                {/* A keyboard down the side: black keys dark, every C named. */}
                <span className={`gr-key ${BLACK.has(n % 12) ? "is-black" : ""}`}>{n % 12 === 0 ? `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}` : ""}</span>
                {/* Each note drawn as one bar over its squares; the squares underneath take the taps. */}
                {evs.map((e, i) => e.note === n ? (
                  <i key={`n${i}`} className={`gr-bar ${picked.has(i) ? "is-sel" : ""}`} aria-hidden style={{ left: `calc(var(--kw) + (100% - var(--kw)) * ${e.start / loop})`, width: `calc((100% - var(--kw)) * ${e.len / loop} - 1px)`, ["--v" as string]: e.vel } as CSSProperties}>
                    <b className="gr-vel" style={{ width: `${Math.round(e.vel * 100)}%` }} />
                    {i === sel ? <span className="gr-handle" onPointerDown={ev => handleDown(ev, i)} title="drag sideways for length, up or down for velocity" /> : null}
                  </i>
                ) : null)}
                {Array.from({ length: cols }, (_, c) => {
                  const i = at(n, c);
                  const e = i >= 0 ? evs[i] : null;
                  const head = e && Math.abs(e.start - c * STEP) < 1e-6;
                  return <button key={c} type="button" role="gridcell" aria-label={`${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}, step ${c + 1}${e ? ", note" : ""}`}
                    className={`gr-cell ${c % 4 === 0 ? "is-beat" : ""} ${e ? "is-note" : ""} ${head ? "is-head" : ""} ${i >= 0 && i === sel ? "is-sel" : ""} ${c === playCol ? "is-now" : ""}`}
                    data-rc={`${ri}-${c}`} tabIndex={fc[0] === ri && fc[1] === c ? 0 : -1} onFocus={() => setFc([ri, c])}
                    onPointerDown={() => holdStart(n, c)} onPointerUp={holdEnd} onPointerLeave={holdEnd} onPointerCancel={holdEnd} onContextMenu={ev => ev.preventDefault()}
                    onClick={() => tap(n, c)} />;
                })}
              </div>
            ))}
          </div>
        </Screen>
        <div className="gr-tools" role="toolbar" aria-label={many ? "Edit the picked notes" : "Edit the picked note"}>
          {s ? tools.map(([l, a, f]) => <button key={l} type="button" className="ls-chip" aria-label={a} title={a} onClick={f}>{l}</button>) : <span className="gr-tip">tap a square to add a note. tap a note to pick it, hold more to pick several. drag a picked note&apos;s edge: sideways for length, up or down for velocity</span>}
          {past.current.length ? <button type="button" className="ls-chip" onClick={undo} aria-label="Undo the last edit">undo</button> : null}
          {evs.length > 1 ? <button type="button" className="ls-chip" onClick={() => { setPicked(new Set(evs.map((_, i) => i))); setSelRaw(evs.length - 1); }} aria-label="Pick every note">all</button> : null}
        </div>
        <div className="gr-dice"><Dice amount={diceAmt} onAmount={v => rollDice(v, diceSeed)} onRoll={() => rollDice(diceAmt || 0.35, newSeed())} label="fill" width={110} /></div>
      </>} />
  );
}
