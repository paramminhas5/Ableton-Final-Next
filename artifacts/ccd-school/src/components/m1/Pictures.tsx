"use client";
/**
 * The instrument pictures, driven by the engine's own numbers (src/lib/shapes.ts mirrors the Rust):
 * the envelope with a dot running along it on every note, and the filter curve whose knee moves with
 * cutoff, peaks with resonance, and opens on each note by the filter envelope. Each line is drawn in
 * the colour of the knobs that move it (src/lib/paramColor.ts).
 */
import "./pictures.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { OUT, type Engine } from "@/engine";
import { dragCutoff, dragTime, envDot, envLayout, envPath, envTail, envCutoff, filterDb, lowCutDb, freqX, levelAt, xFreq, type Env, type FilterCharacter } from "@/lib/shapes";

/** When the last note on a layer started and stopped, in performance.now() ms. */
export type NoteClock = { on: number; off: number | null; vel: number; note: number; seq: number; listen: (fn: () => void) => () => void };

function makeClock(): NoteClock & { poke: () => void } {
  const fns = new Set<() => void>();
  const c = {
    on: -1, off: null as number | null, vel: 0.85, note: -1, seq: 0,
    listen: (fn: () => void) => { fns.add(fn); return () => { fns.delete(fn); }; },
    poke: () => { c.seq++; fns.forEach(f => f()); },
  };
  return c;
}

/**
 * Times every note on one engine layer: played notes from their own on and off, sequenced notes from
 * their start and the length the song gives them at this tempo. `accept` filters notes (one drum pad).
 */
export function useNoteClock(engine: Engine, layer: number, song: { bpm: number; loop: number; events: { note: number; start: number; len: number }[] }, accept?: (note: number) => boolean): NoteClock {
  const clock = useMemo(makeClock, []);
  const songRef = useRef(song);
  songRef.current = song;
  const acceptRef = useRef(accept);
  acceptRef.current = accept;
  useEffect(() => engine.on(evs => {
    for (const e of evs) {
      if (e.layer !== layer || (e.kind !== OUT.playedOn && e.kind !== OUT.playedOff && e.kind !== OUT.seqOn)) continue;
      if (acceptRef.current && !acceptRef.current(e.note)) continue;
      const now = performance.now();
      if (e.kind === OUT.playedOn) { clock.on = now; clock.off = null; clock.vel = e.vel || 0.85; clock.note = e.note; clock.poke(); }
      else if (e.kind === OUT.playedOff) { if (e.note === clock.note && clock.off === null) { clock.off = now; clock.poke(); } }
      else {
        const s = songRef.current;
        const wrap = (d: number) => { const w = ((d % s.loop) + s.loop) % s.loop; return Math.min(w, s.loop - w); };
        let best: { len: number } | null = null, bd = 1e9;
        for (const ev of s.events) if (ev.note === e.note) { const d = wrap(ev.start - e.beat); if (d < bd) { bd = d; best = ev; } }
        const beats = best && bd < 0.2 ? best.len : 0.25;
        clock.on = now; clock.off = now + (beats * 60000) / Math.max(30, s.bpm); clock.vel = e.vel || 0.85; clock.note = e.note; clock.poke();
      }
    }
  }), [engine, layer, clock]);
  return clock;
}

/** The drawn width follows the box, so circles stay round and text stays crisp at any size. */
function useBox(fallbackH: number): [React.RefObject<HTMLDivElement>, number, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<[number, number]>([300, fallbackH]);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const read = () => { const x = Math.round(el.clientWidth), y = Math.round(el.clientHeight); if (x > 20 && y > 10) setBox(b => (b[0] === x && b[1] === y ? b : [x, y])); };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref as React.RefObject<HTMLDivElement>, box[0], box[1]];
}

/** Re-render on every animation frame while a note (and its tail) is sounding. */
function useLive(clock: NoteClock | undefined, tailS: number): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!clock) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const run = () => {
      const t = performance.now();
      setNow(t);
      const end = clock.off === null ? Infinity : clock.off + tailS * 1000 + 120;
      if (t < end && !reduce) raf = requestAnimationFrame(run);
      else setNow(t + 1);
    };
    const stop = clock.listen(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(run); });
    return () => { stop(); cancelAnimationFrame(raf); };
  }, [clock, tailS]);
  return now;
}

/**
 * Drag on a picture (Vital's rule: grab the shape itself). Pointer capture keeps the drag on the picture,
 * touch-action none stops the page scrolling under the finger, and the knobs stay the way in for the
 * keyboard and screen readers (the picture itself is an image to them). `begin` returns what the drag
 * needs to remember, or null to ignore this press; `move` gets the travel as shares of the box.
 */
function usePicDrag<T>(begin: ((x: number, y: number) => T | null) | null, move: (at: T, dx: number, dy: number) => void) {
  const st = useRef<{ x: number; y: number; w: number; h: number; at: T } | null>(null);
  const [active, setActive] = useState(false);
  if (!begin) return { active: false, handlers: {} };
  const handlers = {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button > 0) return;
      const r = e.currentTarget.getBoundingClientRect();
      const at = begin((e.clientX - r.left) / Math.max(1, r.width), (e.clientY - r.top) / Math.max(1, r.height));
      if (at === null) return;
      e.preventDefault();
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* an old browser, or the pointer has gone */ }
      st.current = { x: e.clientX, y: e.clientY, w: Math.max(1, r.width), h: Math.max(1, r.height), at };
      setActive(true);
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      const d = st.current;
      if (!d) return;
      e.preventDefault();
      move(d.at, (e.clientX - d.x) / d.w, (d.y - e.clientY) / d.h);
    },
    onPointerUp: () => { st.current = null; setActive(false); },
    onPointerCancel: () => { st.current = null; setActive(false); },
  };
  return { active, handlers };
}

const fmtS = (s: number) => (s >= 1 ? `${(Math.round(s * 100) / 100).toString()} s` : `${Math.max(1, Math.round(s * 1000))} ms`);

/** The amp envelope, with a dot that runs along it on every note at the engine's own times. */
/** Envelope corners you can drag, each with what to do with the new time (seconds). */
export type EnvDrag = { a?: (s: number) => void; d?: (s: number) => void; r?: (s: number) => void };

export function EnvView({ env, color, clock, height, lit = true, label = "envelope", drag }: { env: Env; color: string; clock?: NoteClock; height?: number; lit?: boolean; label?: string; drag?: EnvDrag }) {
  const tail = envTail(env);
  const now = useLive(clock, tail);
  const [box, W, H] = useBox(height ?? 64);
  const top = 13, bot = H - 6;
  const y = (l: number) => bot - l * (bot - top);
  const pts = useMemo(() => envPath(env), [env]);
  const d = pts.map(([x, l], i) => `${i ? "L" : "M"}${(x * W).toFixed(1)} ${y(l).toFixed(1)}`).join("");
  const L = envLayout(env);
  const t = clock && clock.on >= 0 ? (now - clock.on) / 1000 : -1;
  const off = clock && clock.off !== null ? (clock.off - clock.on) / 1000 : null;
  const live = t >= 0 && (off === null || t < off + tail + 0.05);
  const dot = live ? envDot(env, t, off) : null;
  const marks = env.kind === "decay"
    ? [{ x: L.d[0], w: L.d[1] - L.d[0], k: `decay ${fmtS(env.d)}` }]
    : [{ x: L.a[0], w: L.a[1] - L.a[0], k: "a" }, { x: L.d[0], w: L.d[1] - L.d[0], k: "d" }, { x: L.s[0], w: L.s[1] - L.s[0], k: "s" }, { x: L.r[0], w: L.r[1] - L.r[0], k: "r" }];
  const desc = env.kind === "decay" ? `${label}: a hit that dies away over ${fmtS(env.d)}` : `${label}: attack ${fmtS(env.a)}, decay ${fmtS(env.d)}, sustain ${Math.round(env.s * 100)}%, release ${fmtS(env.r)}`;
  const gid = `envg-${color.slice(1)}`;
  // The corners: the attack's peak, the decay's corner into sustain, the release's end. A drum hit's
  // handle sits where it has fallen 20 db, so there is room to drag both ways.
  const sEnd = env.kind === "decay" ? 0 : levelAt(env, env.a + env.d);
  const handles = ([
    drag?.a && env.kind === "adsr" ? { k: "a" as const, x: L.a[1], y: 1, t: env.a, set: drag.a } : null,
    drag?.d ? (env.kind === "decay" ? { k: "d" as const, x: L.d[0] + (L.d[1] - L.d[0]) / 3, y: 0.1, t: env.d, set: drag.d } : { k: "d" as const, x: L.d[1], y: sEnd, t: env.d, set: drag.d }) : null,
    drag?.r && env.kind === "adsr" ? { k: "r" as const, x: L.r[0] + (L.r[1] - L.r[0]) * 0.8, y: sEnd * Math.exp(-2.4), t: env.r, set: drag.r } : null,
  ].filter(Boolean)) as { k: "a" | "d" | "r"; x: number; y: number; t: number; set: (s: number) => void }[];
  const [grab, setGrab] = useState<"a" | "d" | "r" | null>(null);
  const pd = usePicDrag(handles.length ? (x: number) => {
    let best = handles[0];
    for (const h of handles) if (Math.abs(h.x - x) < Math.abs(best.x - x)) best = h;
    setGrab(best.k);
    return { set: best.set, t0: best.t };
  } : null, (at, dx) => at.set(dragTime(at.t0, dx)));
  const grabbed = pd.active ? grab : null;
  return (
    <div ref={box} className={`pic ${lit ? "" : "is-dim"} ${handles.length ? "is-drag" : ""} ${pd.active ? "is-dragging" : ""}`} style={{ ["--c" as string]: color, ...(height ? { height } : null) } as React.CSSProperties} {...pd.handlers}>
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={desc}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".32" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient>
      </defs>
      {marks.map(m => <path key={m.k} d={`M${(m.x * W).toFixed(1)} ${top - 2}V${bot}`} className="pic-grid" />)}
      <path d={`M0 ${bot}H${W}`} className="pic-grid" />
      <path d={`${d}L${W} ${bot}L0 ${bot}Z`} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" className="pic-line" />
      {dot && <path d={`M${(dot.x * W).toFixed(1)} ${top - 2}V${bot}`} stroke={color} strokeOpacity={0.45} />}
      {dot && <circle cx={dot.x * W} cy={y(dot.y)} r={4.5} className="pic-dot" />}
      {marks.map(m => (m.w * W > 12 ? <text key={`t${m.k}`} x={(m.x + m.w / 2) * W} y={9} textAnchor="middle" className="pic-txt">{m.k}</text> : null))}
      {handles.map(h => <circle key={`h${h.k}`} cx={h.x * W} cy={y(h.y)} r={grabbed === h.k ? 7 : 5} className={`pic-handle ${grabbed === h.k ? "is-on" : ""}`} />)}
    </svg>
    </div>
  );
}

/**
 * The filter: the response curve at the knob's cutoff and resonance (the engine's ladder), with the
 * filter envelope opening it on each note when the env knob is up. `character` draws engine item 7's
 * slopes once that param exists.
 */
export function FilterView({ cutoff, res, color, clock, fenv, amount = 0, character = "warm", height, lit = true, lowCut = 20, onCutoff, onRes }: {
  cutoff: number; res: number; lowCut?: number; color: string; clock?: NoteClock; fenv?: { env: Env; octaves: number } | null; amount?: number; character?: FilterCharacter; height?: number; lit?: boolean;
  /** Drag the knee: left and right is the cutoff (Hz), up and down the resonance (0..1). */
  onCutoff?: (hz: number) => void; onRes?: (res: number) => void;
}) {
  const moving = !!fenv && amount > 0.001;
  const now = useLive(moving ? clock : undefined, fenv ? envTail(fenv.env) : 0);
  const [box, W, H] = useBox(height ?? 64);
  const top = 6, bot = H - 4;
  const DB_TOP = 20, DB_BOT = -40;
  const y = (db: number) => top + ((DB_TOP - Math.max(DB_BOT, Math.min(DB_TOP, db))) / (DB_TOP - DB_BOT)) * (bot - top);
  const t = clock && clock.on >= 0 ? (now - clock.on) / 1000 : -1;
  const off = clock && clock.off !== null ? (clock.off - clock.on) / 1000 : null;
  const level = moving && fenv && t >= 0 ? levelAt(fenv.env, t, off) : 0;
  const fc = moving && fenv ? Math.min(20000, envCutoff(cutoff, amount, level, fenv.octaves, clock?.vel ?? 0.85)) : cutoff;
  const curve = (f0: number) => Array.from({ length: 97 }, (_, i) => { const x = i / 96; return `${i ? "L" : "M"}${(x * W).toFixed(1)} ${y(filterDb(xFreq(x), f0, res, character) + lowCutDb(xFreq(x), lowCut)).toFixed(1)}`; }).join("");
  const still = curve(cutoff);
  const live = fc !== cutoff ? curve(fc) : still;
  const kx = freqX(fc) * W;
  const ky = y(filterDb(fc, fc, res, character));
  const gid = `flg-${color.slice(1)}`;
  const hz = (f: number) => (f >= 1000 ? `${Math.round(f / 100) / 10} khz` : `${Math.round(f)} hz`);
  // The knee follows the finger from wherever it is grabbed; up rings it more.
  const pd = usePicDrag(onCutoff || onRes ? () => ({ hz0: cutoff, r0: res }) : null, (at, dx, dy) => {
    if (onCutoff) onCutoff(dragCutoff(at.hz0, dx));
    if (onRes) onRes(Math.max(0, Math.min(1, at.r0 + dy * 0.9)));
  });
  const sx = freqX(cutoff) * W, sy = y(filterDb(cutoff, cutoff, res, character));
  return (
    <div ref={box} className={`pic ${lit ? "" : "is-dim"} ${onCutoff || onRes ? "is-drag" : ""} ${pd.active ? "is-dragging" : ""}`} style={{ ["--c" as string]: color, ...(height ? { height } : null) } as React.CSSProperties} {...pd.handlers}>
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img"
      aria-label={`filter: lets through what is under ${hz(cutoff)}${res > 0.5 ? ", with a ringing peak" : res > 0.2 ? ", with a small peak" : ""}${character !== "warm" ? `, ${character}` : ""}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".3" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient>
      </defs>
      {[100, 1000, 10000].map(f => <path key={f} d={`M${(freqX(f) * W).toFixed(1)} ${top}V${bot}`} className="pic-grid" />)}
      <path d={`M0 ${y(0).toFixed(1)}H${W}`} className="pic-grid" strokeDasharray="2 3" />
      {[100, 1000, 10000].map(f => <text key={`t${f}`} x={freqX(f) * W - 3} y={bot - 3} textAnchor="end" className="pic-txt">{f >= 1000 ? `${f / 1000}k` : f}</text>)}
      {live !== still && <path d={still} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={1.2} strokeDasharray="3 3" />}
      <path d={`${live}L${W} ${bot}L0 ${bot}Z`} fill={`url(#${gid})`} />
      <path d={live} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" className="pic-line" />
      {onCutoff || onRes ? <circle cx={sx} cy={sy} r={pd.active ? 8 : 6} className={`pic-handle ${pd.active ? "is-on" : ""}`} /> : null}
      <circle cx={kx} cy={ky} r={4} className="pic-dot" />
    </svg>
    </div>
  );
}
