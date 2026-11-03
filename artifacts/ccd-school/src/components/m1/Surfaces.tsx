"use client";
/**
 * The fourth surface of each layer type (canvas boards ZGlide, ZCircle, ZChords, ZLead,
 * ZHats, ZRiser). Steps, keys and pads live in Studio; these are the ones that play the
 * instrument the way it wants to be played.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { DRUM_PAD_NAMES, DRUM_PAD_NOTES, FX_IMPACT_NOTE, INSTRUMENT_BASE, LEAD_PARAMS, FX_PARAMS, type Engine } from "@/engine";
import { noteName, pitchClass, scaleNote, SCALES, NOTE_NAMES, type ScaleName } from "@/lib/theory";
import { paramOf, STEP_BEATS, type LayerV2, type NoteEvent, type TrackV2 } from "@/lib/track2";
import { euclid } from "@/lib/euclid";
import { CAP, Icon, Knob, Silk } from "./controls";

export type SurfaceCtx = {
  layer: LayerV2;
  index: number;
  engine: Engine;
  track: TrackV2;
  color: string;
  /** Sound a note (and light it). */
  play: (note: number, vel: number, at?: number) => void;
  stop: (note: number, at?: number) => void;
  setLayer: (fn: (l: LayerV2) => LayerV2, undoable?: boolean) => void;
  /** Put a label and a value on the screen. */
  say: (label: string, text: string) => void;
  hits: Record<string, number>;
};

const dotColor = (c: string) => ({ ["--c" as string]: c }) as CSSProperties;

/** The track's key, as a scale name the theory helpers know. */
export const scaleOf = (t: TrackV2): ScaleName => (t.scale === "major" ? "major" : "minor");

/** Bass lives low: the key's root in the octave from a1 up. */
export const bassRoot = (t: TrackV2) => 33 + ((pitchClass(t.root) - 9 + 12) % 12);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Where a pointer is inside an element, 0..1 on both axes. */
function frac(e: PointerEvent<HTMLElement>, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { x: clamp01((e.clientX - r.left) / r.width), y: clamp01((e.clientY - r.top) / r.height) };
}

const vel = () => 0.85;

/** Keep the pointer while it slides off the element. Not every pointer can be captured. */
function capture(e: PointerEvent<HTMLElement>) {
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    /* synthetic or already gone: the gesture still works inside the element */
  }
}

// ── bass: glide ──────────────────────────────────────────────────────────────

/** Eight lanes of the scale. Slide across them: each new note arrives while the last is still held, so the bass glides. */
export function GlideSurface({ ctx }: { ctx: SurfaceCtx }) {
  const { track, color } = ctx;
  const [oct, setOct] = useState(0);
  const [hold, setHold] = useState(false);
  const [dot, setDot] = useState<{ x: number; y: number } | null>(null);
  const cur = useRef<number | null>(null);
  const pointer = useRef<number | null>(null);
  const root = bassRoot(track) + oct * 12;
  const notes = useMemo(() => Array.from({ length: 8 }, (_, i) => scaleNote(root, scaleOf(track), i)), [root, track]);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const p = frac(e, e.currentTarget);
    setDot(p);
    const note = notes[Math.min(7, Math.floor(p.x * 8))];
    if (note === cur.current) return;
    const from = cur.current;
    ctx.play(note, vel(), e.timeStamp); // the new note first, so the engine glides
    if (from !== null) ctx.stop(from, e.timeStamp);
    cur.current = note;
    ctx.say("gliding", from !== null ? `${noteName(from).replace(/\d+$/, "")} → ${noteName(note).replace(/\d+$/, "")}` : noteName(note).replace(/\d+$/, ""));
  };
  const release = (e: PointerEvent<HTMLDivElement>) => {
    if (pointer.current !== e.pointerId) return;
    pointer.current = null;
    setDot(null);
    if (!hold && cur.current !== null) {
      ctx.stop(cur.current, e.timeStamp);
      cur.current = null;
    }
  };
  useEffect(() => {
    if (!hold && cur.current !== null && pointer.current === null) {
      ctx.stop(cur.current);
      cur.current = null;
    }
  }, [hold]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => {
    if (cur.current !== null) ctx.stop(cur.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div
        className="st-tray st-lanes"
        style={{ gridTemplateColumns: "repeat(8,1fr)", touchAction: "none", position: "relative", ...dotColor(color) }}
        role="group"
        aria-label="Glide strip: slide across the notes"
        onPointerDown={e => {
          e.preventDefault();
          capture(e);
          pointer.current = e.pointerId;
          move(e);
        }}
        onPointerMove={e => pointer.current === e.pointerId && move(e)}
        onPointerUp={release}
        onPointerCancel={release}
      >
        {notes.map((n, i) => (
          <div key={i} className="st-lane-col">
            <span className={i === 0 || i === 7 ? "is-root" : ""}>{noteName(n).replace(/\d+$/, "")}</span>
          </div>
        ))}
        {dot ? <span className="st-orb" style={{ left: `${dot.x * 100}%`, top: `${dot.y * 100}%`, ...dotColor(color) }} /> : null}
      </div>
      <div className="m1-g st-row3">
        <button type="button" className="m1-m is-wide st-act" aria-label="Octave down" onClick={() => setOct(o => Math.max(-1, o - 1))}>
          <span className="m1-cap st-capb">−</span>
          <span className="m1-ml">octave</span>
        </button>
        <button type="button" className="m1-m is-wide st-act" aria-pressed={hold} aria-label="Hold the note" onClick={() => setHold(h => !h)}>
          <span className={`m1-dot ${hold ? "is-on" : ""}`} style={dotColor(color)} />
          <span className="m1-cap st-capb">hold</span>
          <span className="m1-ml">hold note</span>
        </button>
        <button type="button" className="m1-m is-wide st-act" aria-label="Octave up" onClick={() => setOct(o => Math.min(1, o + 1))}>
          <span className="m1-cap st-capb">+</span>
          <span className="m1-ml">octave</span>
        </button>
      </div>
    </>
  );
}

// ── drums: circle ────────────────────────────────────────────────────────────

const CIRCLE_LANES: [string, number][] = [["kick", 36], ["snare", 38], ["clap", 39], ["hat", 42]];

/** A ring of 16 steps. Pick how many hits and how far to rotate; they spread evenly (Euclidean). */
export function CircleSurface({ ctx }: { ctx: SurfaceCtx }) {
  const { layer, color } = ctx;
  const [lane, setLane] = useState(0);
  const [name, note] = CIRCLE_LANES[lane];
  const ev = layer.euclid?.[note];
  const bars = Math.max(1, Math.round(ctx.track.loop / 4));
  // With nothing set yet, read how many hits the lane already has in the first bar.
  const existing = layer.events.filter(e => e.note === note && e.start < 4).length;
  const hits = ev?.hits ?? Math.min(16, existing);
  const rot = ev?.rot ?? 0;
  const pattern = euclid(hits, 16, rot);

  const apply = (h: number, r: number) => {
    ctx.setLayer(l => {
      const kept = l.events.filter(e => e.note !== note);
      const add: NoteEvent[] = [];
      const p = euclid(h, 16, r);
      for (let b = 0; b < bars; b++) {
        p.forEach((on, i) => on && add.push({ note, vel: 0.9, start: b * 4 + i * STEP_BEATS, len: 0.2 }));
      }
      return { ...l, euclid: { ...l.euclid, [note]: { hits: h, rot: r } }, events: [...kept, ...add].sort((a, b) => a.start - b.start || a.note - b.note) };
    }, false);
    ctx.say(`${name} hits`, `${h}/16`);
  };

  const R = 74;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minHeight: 0 }}>
      <div className="st-lanetabs" role="radiogroup" aria-label="Sound">
        {CIRCLE_LANES.map(([n], i) => (
          <button key={n} type="button" role="radio" aria-checked={lane === i} className={`m1-m is-wide st-vk ${lane === i ? "is-on" : ""}`} onClick={() => setLane(i)} style={lane === i ? { background: `linear-gradient(180deg,color-mix(in srgb,${color} 70%,#fff),${color})`, color: "#141416" } : undefined}>
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 78px", gap: 8, flex: 1, minHeight: 0 }}>
        <div className="st-tray st-ring" style={{ display: "flex", alignItems: "center", justifyContent: "center", ...dotColor(color) }}>
          <svg viewBox="-100 -100 200 200" width="100%" height="100%" role="img" aria-label={`${name}: ${hits} hits of 16, rotated ${rot}`}>
            {pattern.map((on, i) => {
              const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
              const x = Math.cos(a) * R;
              const y = Math.sin(a) * R;
              return on ? (
                <circle key={i} cx={x} cy={y} r={11} fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
              ) : (
                <circle key={i} cx={x} cy={y} r={8} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} />
              );
            })}
            <circle cx={0} cy={0} r={R - 20} fill="none" stroke="currentColor" strokeOpacity={0.1} />
            <text x={0} y={6} textAnchor="middle" fontSize={34} fontWeight={300} fill="currentColor">{hits}</text>
            <text x={0} y={24} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>{name} hits</text>
          </svg>
        </div>
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 8, minHeight: 0 }}>
          <Knob label="hits" size={30} color={color} value={hits / 16} defaultValue={0.25} onChange={v => apply(Math.round(v * 16), rot)} height={undefined} style={{ aspectRatio: "auto", height: "100%" }} />
          <Knob label="rotate" size={30} color={CAP.grey} value={rot / 15} defaultValue={0} onChange={v => apply(hits, Math.round(v * 15))} style={{ aspectRatio: "auto", height: "100%" }} />
        </div>
      </div>
    </div>
  );
}

// ── chords: pads in key, and a strum strip ───────────────────────────────────

type ChordDef = { deg: number[]; roman: string };
const CHORDS: Record<ScaleName, ChordDef[]> = {
  minor: [
    { deg: [0, 2, 4], roman: "i" }, { deg: [3, 5, 7], roman: "iv" }, { deg: [4, 6, 8], roman: "v" }, { deg: [5, 7, 9], roman: "VI" },
    { deg: [2, 4, 6], roman: "III" }, { deg: [6, 8, 10], roman: "VII" }, { deg: [0, 2, 4, 6], roman: "i7" }, { deg: [3, 5, 7, 9], roman: "iv9" },
  ],
  major: [
    { deg: [0, 2, 4], roman: "I" }, { deg: [3, 5, 7], roman: "IV" }, { deg: [4, 6, 8], roman: "V" }, { deg: [5, 7, 9], roman: "vi" },
    { deg: [1, 3, 5], roman: "ii" }, { deg: [2, 4, 6], roman: "iii" }, { deg: [0, 2, 4, 6], roman: "I7" }, { deg: [3, 5, 7, 9], roman: "IV9" },
  ],
  dorian: [],
  "minor pentatonic": [],
};

export function chordNotes(track: TrackV2, c: ChordDef): number[] {
  const base = 48 + pitchClass(track.root) - (pitchClass(track.root) > 6 ? 12 : 0);
  return c.deg.map(d => scaleNote(base, scaleOf(track), d));
}

function chordName(notes: number[]): string {
  const [r, ...rest] = notes;
  const third = rest.length ? (rest[0] - r + 12) % 12 : 4;
  const sev = notes.length > 3;
  return `${NOTE_NAMES[pitchClass(r)]}${third === 3 ? "m" : ""}${sev ? (notes.length > 4 ? "9" : "7") : ""}`;
}

/** The chord pads. Each plays its chord; the strip below plucks the chosen chord one note at a time. */
export function ChordSurface({ ctx }: { ctx: SurfaceCtx }) {
  const { track, color } = ctx;
  const list = CHORDS[scaleOf(track)];
  const [sel, setSel] = useState(3);
  const down = useRef<Map<number, number[]>>(new Map());
  const chord = list[sel];
  const notes = chordNotes(track, chord);
  const strum = useRef<{ id: number; last: number } | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const press = (i: number, e: PointerEvent<HTMLElement>) => {
    e.preventDefault();
    capture(e);
    const ns = chordNotes(track, list[i]);
    down.current.set(e.pointerId, ns);
    setSel(i);
    ns.forEach(n => ctx.play(n, vel(), e.timeStamp));
    ctx.say("playing", `${NOTE_NAMES[pitchClass(ns[0])]} ${list[i].roman}`);
  };
  const lift = (e: PointerEvent<HTMLElement>) => {
    const ns = down.current.get(e.pointerId);
    if (!ns) return;
    down.current.delete(e.pointerId);
    ns.forEach(n => ctx.stop(n, e.timeStamp));
  };

  // The strip's 16 strings span the chord's notes over two octaves.
  const STR = 16;
  const strings = useMemo(() => Array.from({ length: STR }, (_, i) => notes[i % notes.length] + 12 * Math.floor(i / notes.length)), [notes]);
  const pluck = (e: PointerEvent<HTMLDivElement>) => {
    const s = strum.current;
    if (!s) return;
    const p = frac(e, e.currentTarget);
    const k = Math.min(STR - 1, Math.floor(p.x * STR));
    if (k === s.last) return;
    // Everything between the last string and this one sounds, so a fast swipe is not missed.
    const step = k > s.last ? 1 : -1;
    for (let j = s.last + step; step > 0 ? j <= k : j >= k; j += step) {
      const n = strings[j];
      ctx.play(n, 0.75, e.timeStamp);
      timers.current.push(window.setTimeout(() => ctx.stop(n), 420));
    }
    s.last = k;
  };

  return (
    <>
      <div className="st-tray" style={{ gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "repeat(2,1fr)", ...dotColor(color) }}>
        {list.map((c, i) => {
          const ns = chordNotes(track, c);
          const lit = sel === i;
          return (
            <button key={c.roman} type="button" className={`st-sp ${lit ? "is-lit" : ""}`} style={dotColor(color)} aria-label={`${chordName(ns)}, ${c.roman}`}
              onPointerDown={e => press(i, e)} onPointerUp={lift} onPointerCancel={lift} onContextMenu={e => e.preventDefault()}>
              <span className="st-lv" style={{ left: 10, right: "auto", top: 9, opacity: 0.8 }}>{chordName(ns)}</span>
              <span className="st-lb" style={{ fontSize: 22, fontWeight: 400, bottom: 8 }}>{c.roman}</span>
            </button>
          );
        })}
      </div>
      <Silk label="strum" right="swipe across" />
      <div
        className="st-strum"
        role="group"
        aria-label="Strum strip: swipe across"
        style={{ touchAction: "none", ...dotColor(color) }}
        onPointerDown={e => {
          e.preventDefault();
          capture(e);
          const k = Math.min(STR - 1, Math.floor(frac(e, e.currentTarget).x * STR));
          strum.current = { id: e.pointerId, last: k };
          ctx.play(strings[k], 0.75, e.timeStamp);
          timers.current.push(window.setTimeout(() => ctx.stop(strings[k]), 420));
        }}
        onPointerMove={pluck}
        onPointerUp={() => (strum.current = null)}
        onPointerCancel={() => (strum.current = null)}
      >
        {strings.map((n, i) => (
          <i key={i} className={ctx.hits[`${ctx.layer.id}:${n}`] ? "is-hit" : ""} />
        ))}
      </div>
    </>
  );
}

// ── lead: xy ─────────────────────────────────────────────────────────────────

const CUTOFF = INSTRUMENT_BASE + 0;

/** Left to right is the note (in key), up is the filter opening. Lift your finger to stop. */
export function XYSurface({ ctx }: { ctx: SurfaceCtx }) {
  const { track, color, layer } = ctx;
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  const cur = useRef<number | null>(null);
  const pid = useRef<number | null>(null);
  const root = 57 + (pitchClass(track.root) - 9);
  const notes = useMemo(() => Array.from({ length: 8 }, (_, i) => scaleNote(root, scaleOf(track), i)), [root, track]);
  const cutoff = LEAD_PARAMS[0];
  const rest = paramOf(layer, cutoff.index);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const p = frac(e, e.currentTarget);
    setPt(p);
    const open = 1 - p.y;
    // Straight to the engine: a gesture, not an edit. The knob keeps its own value.
    ctx.engine.param(ctx.index, cutoff.index, open);
    const note = notes[Math.min(7, Math.floor(p.x * 8))];
    if (note !== cur.current) {
      const from = cur.current;
      ctx.play(note, vel(), e.timeStamp);
      if (from !== null) ctx.stop(from, e.timeStamp);
      cur.current = note;
    }
    ctx.say("note · filter", `${noteName(note).replace(/\d+$/, "")}·${Math.round(open * 100)}`);
  };
  const end = (e: PointerEvent<HTMLDivElement>) => {
    if (pid.current !== e.pointerId) return;
    pid.current = null;
    setPt(null);
    if (cur.current !== null) ctx.stop(cur.current, e.timeStamp);
    cur.current = null;
    ctx.engine.param(ctx.index, cutoff.index, rest);
  };
  useEffect(() => () => {
    if (cur.current !== null) ctx.stop(cur.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  void CUTOFF;

  return (
    <div
      className="st-tray st-xy"
      role="group"
      aria-label="Lead pad: slide for the note, up to open the filter"
      style={{ touchAction: "none", position: "relative", ...dotColor(color) }}
      onPointerDown={e => {
        e.preventDefault();
        capture(e);
        pid.current = e.pointerId;
        move(e);
      }}
      onPointerMove={e => pid.current === e.pointerId && move(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <span className="st-xy-l" style={{ top: 12 }}>filter open</span>
      <span className="st-xy-l" style={{ bottom: 22 }}>filter closed</span>
      <span className="st-xy-notes">{notes.map((n, i) => <b key={i}>{noteName(n).replace(/\d+$/, "")}</b>)}</span>
      {pt ? (
        <>
          <span className="st-xy-h" style={{ top: `${pt.y * 100}%` }} />
          <span className="st-xy-v" style={{ left: `${pt.x * 100}%` }} />
          <span className="st-orb" style={{ left: `${pt.x * 100}%`, top: `${pt.y * 100}%`, ...dotColor(color) }} />
        </>
      ) : null}
    </div>
  );
}

// ── hats: rolls ──────────────────────────────────────────────────────────────

const HAT_PADS = [42, 46, 70, 51];
export const ROLLS: { label: string; beats: number }[] = [
  { label: "1/32", beats: 0.125 },
  { label: "1/16", beats: 0.25 },
  { label: "1/8", beats: 0.5 },
  { label: "1/4", beats: 1 },
];

/** Hold a pad to roll it; slide the strip to change how fast. The engine keeps the time, on the grid. */
export function RollsSurface({ ctx, rate, setRate }: { ctx: SurfaceCtx; rate: number; setRate: (i: number) => void }) {
  const { color } = ctx;
  const held = useRef<Map<number, number>>(new Map());
  const rateRef = useRef(rate);
  rateRef.current = rate;
  const names = HAT_PADS.map(n => DRUM_PAD_NAMES[DRUM_PAD_NOTES.indexOf(n as (typeof DRUM_PAD_NOTES)[number])]);

  const press = (note: number, e: PointerEvent<HTMLElement>) => {
    e.preventDefault();
    capture(e);
    held.current.set(e.pointerId, note);
    ctx.engine.repeat(ctx.index, note, vel(), ROLLS[rateRef.current].beats);
    ctx.say("rolling", ROLLS[rateRef.current].label);
  };
  const lift = (e: PointerEvent<HTMLElement>) => {
    const note = held.current.get(e.pointerId);
    if (note === undefined) return;
    held.current.delete(e.pointerId);
    ctx.engine.repeatOff(ctx.index, note);
  };
  const pick = (i: number) => {
    setRate(i);
    rateRef.current = i;
    ctx.say("rolling", ROLLS[i].label);
    held.current.forEach(note => ctx.engine.repeat(ctx.index, note, vel(), ROLLS[i].beats));
  };
  useEffect(() => () => {
    held.current.forEach(note => ctx.engine.repeatOff(ctx.index, note));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 62px", gap: 8, flex: 1, minHeight: 0 }}>
      <div className="st-tray" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
        {HAT_PADS.map((n, i) => {
          const lit = !!ctx.hits[`${ctx.layer.id}:${n}`];
          return (
            <button key={n} type="button" className={`st-sp ${lit ? "is-lit" : "is-rest"}`} style={dotColor(color)} aria-label={`${names[i]}: hold to roll`}
              onPointerDown={e => press(n, e)} onPointerUp={lift} onPointerCancel={lift} onContextMenu={e => e.preventDefault()}>
              <span className="st-lb" style={{ fontSize: 15, left: 12, bottom: 12 }}>{names[i]}</span>
            </button>
          );
        })}
      </div>
      <div className="st-tray st-rates" role="radiogroup" aria-label="Roll speed" style={{ gridTemplateRows: "repeat(4,1fr)", gridTemplateColumns: "1fr", ...dotColor(color) }}>
        {ROLLS.map((r, i) => (
          <button key={r.label} type="button" role="radio" aria-checked={rate === i} className={rate === i ? "is-on" : ""} onClick={() => pick(i)}>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── fx: riser ────────────────────────────────────────────────────────────────

const BUILD = INSTRUMENT_BASE + 4;

/** Push the fader up over the bars before the drop. Let go for the drop: silence, then a hit on the one. */
export function RiserSurface({ ctx }: { ctx: SurfaceCtx }) {
  const { color } = ctx;
  const [build, setBuild] = useState(0);
  const pid = useRef<number | null>(null);
  const trackEl = useRef<HTMLDivElement>(null);
  void FX_PARAMS;

  const set = (v: number) => {
    const b = clamp01(v);
    setBuild(b);
    ctx.engine.param(ctx.index, BUILD, b);
    ctx.say("build", `${Math.round(b * 8)}/8`);
  };
  const drop = () => {
    set(0);
    ctx.play(FX_IMPACT_NOTE, 1);
    window.setTimeout(() => ctx.stop(FX_IMPACT_NOTE), 100);
  };
  useEffect(() => () => ctx.engine.param(ctx.index, BUILD, 0), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="st-tray st-bars" aria-hidden style={{ alignItems: "flex-end", display: "flex", gap: 6, padding: "8px 10px", ...dotColor(color) }}>
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} className={build * 8 > i + 0.01 ? "is-on" : ""} style={{ height: `${22 + i * 9}%` }} />
        ))}
      </div>
      <div
        ref={trackEl}
        className="st-fader"
        role="slider"
        tabIndex={0}
        aria-label="Build"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(build * 100)}
        style={{ touchAction: "none" }}
        onKeyDown={e => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") set(build + 0.05);
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") set(build - 0.05);
        }}
        onPointerDown={e => {
          e.preventDefault();
          capture(e);
          pid.current = e.pointerId;
          set(frac(e, e.currentTarget).x);
        }}
        onPointerMove={e => pid.current === e.pointerId && set(frac(e, e.currentTarget).x)}
        onPointerUp={() => (pid.current = null)}
        onPointerCancel={() => (pid.current = null)}
      >
        <span className="st-fader-rail" />
        <span className="st-fader-cap" style={{ left: `calc(${build} * (100% - 32px) + 2px)` }} />
        <span className="st-fader-l" style={{ left: 8 }}>calm</span>
        <span className="st-fader-l" style={{ left: "50%", transform: "translateX(-50%)" }}>build</span>
        <span className="st-fader-l" style={{ right: 8 }}>peak</span>
      </div>
      <button type="button" className="m1-m is-wide st-drop" onClick={drop}>
        <Icon name="stop" />let go for the drop
      </button>
    </>
  );
}
