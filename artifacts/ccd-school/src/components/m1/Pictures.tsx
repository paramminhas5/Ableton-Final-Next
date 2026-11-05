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
import { envDot, envLayout, envPath, envTail, envCutoff, filterDb, lowCutDb, freqX, levelAt, xFreq, type Env, type FilterCharacter } from "@/lib/shapes";

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

const fmtS = (s: number) => (s >= 1 ? `${(Math.round(s * 100) / 100).toString()} s` : `${Math.max(1, Math.round(s * 1000))} ms`);

/** The amp envelope, with a dot that runs along it on every note at the engine's own times. */
export function EnvView({ env, color, clock, height, lit = true, label = "envelope" }: { env: Env; color: string; clock?: NoteClock; height?: number; lit?: boolean; label?: string }) {
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
  return (
    <div ref={box} className={`pic ${lit ? "" : "is-dim"}`} style={{ ["--c" as string]: color, ...(height ? { height } : null) } as React.CSSProperties}>
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
    </svg>
    </div>
  );
}

/**
 * The filter: the response curve at the knob's cutoff and resonance (the engine's ladder), with the
 * filter envelope opening it on each note when the env knob is up. `character` draws engine item 7's
 * slopes once that param exists.
 */
export function FilterView({ cutoff, res, color, clock, fenv, amount = 0, character = "warm", height, lit = true, lowCut = 20 }: {
  cutoff: number; res: number; lowCut?: number; color: string; clock?: NoteClock; fenv?: { env: Env; octaves: number } | null; amount?: number; character?: FilterCharacter; height?: number; lit?: boolean;
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
  return (
    <div ref={box} className={`pic ${lit ? "" : "is-dim"}`} style={{ ["--c" as string]: color, ...(height ? { height } : null) } as React.CSSProperties}>
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
      <circle cx={kx} cy={ky} r={4} className="pic-dot" />
    </svg>
    </div>
  );
}
