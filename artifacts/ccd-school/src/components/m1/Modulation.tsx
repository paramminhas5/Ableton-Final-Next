"use client";
/**
 * Drag to modulate (touch and hear, item 2). The instrument's sources sit as chips above its knobs: drag
 * one onto any knob and it is routed there (Vital), drawn as a ring in the source's colour (Pigments).
 * Tap a chip instead to edit that source: every knob then shows the source's amount, dragged up or down
 * (Bitwig's modulation mode), or a plus to route it. The knobs themselves still turn.
 * Logic in src/lib/modulation.ts; the engine side in engine.rs (cmd MOD).
 */
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from "react";
import { liveFps, liveValues, SRC_COLOR, SRC_LABEL, type ModSrc, type Ring } from "@/lib/modulation";
import { DRUM_RACK_PARAMS, FX_PARAMS, SAMPLER_PARAMS, display, type Engine, type ParamSpec } from "@/engine";
import { Knob } from "./controls";

/** The source chips. Drag onto a knob (anything with data-mod-to) to route it; tap to edit its amounts. */
export function ModChips({ sources, used, edit, onEdit, onDrop, onOver, label = s => SRC_LABEL[s] }: {
  sources: ModSrc[];
  /** The name a source shows on this instrument (the sampler's envelope is its aux env). */
  label?: (s: ModSrc) => string;
  used: (s: ModSrc) => boolean;
  edit: ModSrc | null;
  onEdit: (s: ModSrc | null) => void;
  onDrop: (s: ModSrc, to: number) => void;
  onOver: (to: number | null) => void;
}) {
  const drag = useRef<{ src: ModSrc; x: number; y: number; moved: boolean; over: number | null } | null>(null);
  const [ghost, setGhost] = useState<{ src: ModSrc; x: number; y: number } | null>(null);
  const targetAt = (x: number, y: number) => {
    const el = typeof document !== "undefined" ? document.elementFromPoint(x, y)?.closest("[data-mod-to]") : null;
    const v = el?.getAttribute("data-mod-to");
    return v === null || v === undefined ? null : Number(v);
  };
  const handlers = (src: ModSrc) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.button > 0) return;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* the pointer has gone */ }
      drag.current = { src, x: e.clientX, y: e.clientY, moved: false, over: null };
    },
    onPointerMove: (e: PointerEvent<HTMLButtonElement>) => {
      const d = drag.current;
      if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;
      e.preventDefault();
      d.moved = true;
      const over = targetAt(e.clientX, e.clientY);
      if (over !== d.over) { d.over = over; onOver(over); }
      setGhost({ src, x: e.clientX, y: e.clientY });
    },
    onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
      const d = drag.current;
      drag.current = null;
      setGhost(null);
      onOver(null);
      if (!d) return;
      if (d.moved) {
        const to = targetAt(e.clientX, e.clientY);
        if (to !== null) onDrop(src, to);
      } else onEdit(edit === src ? null : src);
    },
    onPointerCancel: () => { drag.current = null; setGhost(null); onOver(null); },
    // Enter and space come through as a click with no pointer: edit mode, where every knob has a plus.
    onClick: (e: React.MouseEvent) => { if (e.detail === 0) onEdit(edit === src ? null : src); },
  });
  return (
    <div className="m1-modchips" role="group" aria-label="Modulation sources">
      {sources.map(s => (
        <button key={s} type="button" className={`m1-modchip ${used(s) ? "is-used" : ""} ${edit === s ? "is-edit" : ""}`} style={{ ["--c" as string]: SRC_COLOR[s] } as CSSProperties}
          aria-pressed={edit === s} aria-label={`${label(s)}: drag onto a knob to modulate it, or press to set its amounts`} {...handlers(s)}>
          <svg viewBox="0 0 16 10" aria-hidden>{s === "lfo" ? <path d="M1 5C3 0 5 0 7 5S11 10 13 5 15 2 15 2" /> : <path d="M1 9L3 1 7 5H11L15 9" />}</svg>
          {label(s)}
        </button>
      ))}
      {ghost ? <span className="m1-modghost" style={{ left: ghost.x, top: ghost.y, ["--c" as string]: SRC_COLOR[ghost.src] } as CSSProperties} aria-hidden>{label(ghost.src)}</span> : null}
    </div>
  );
}

/**
 * Over a knob while a source is being edited: its amount here (drag up and down, arrow keys, double tap
 * takes it off), or a plus that routes the source here.
 */
export function ModOverlay({ src, ring, knob, onAssign, onAmount, onRemove }: {
  src: ModSrc;
  ring: Ring | undefined;
  knob: string;
  onAssign: () => void;
  onAmount: (amt: number) => void;
  onRemove: () => void;
}) {
  const st = useRef<{ y: number; a: number } | null>(null);
  const tap = useRef(0);
  const c = SRC_COLOR[src];
  if (!ring) {
    return (
      <button type="button" className="m1-modpick" style={{ ["--c" as string]: c } as CSSProperties} onClick={onAssign} aria-label={`Modulate ${knob} with the ${SRC_LABEL[src]}`}>
        <span aria-hidden>+</span>
      </button>
    );
  }
  const signed = !ring.own;
  const pct = Math.round(ring.amt * 100);
  const set = (a: number) => onAmount(Math.max(signed ? -1 : 0, Math.min(1, a)));
  return (
    <div className="m1-modamt" role="slider" tabIndex={0} style={{ ["--c" as string]: c } as CSSProperties}
      aria-label={`${SRC_LABEL[src]} amount on ${knob}`} aria-valuemin={signed ? -100 : 0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={`${pct > 0 && signed ? "+" : ""}${pct}%`}
      onPointerDown={e => {
        const now = Date.now();
        if (now - tap.current < 300) { onRemove(); tap.current = 0; return; }
        tap.current = now;
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* the pointer has gone */ }
        st.current = { y: e.clientY, a: ring.amt };
      }}
      onPointerMove={e => { if (st.current) { e.preventDefault(); set(st.current.a + (st.current.y - e.clientY) / 160); } }}
      onPointerUp={() => { st.current = null; }}
      onPointerCancel={() => { st.current = null; }}
      onKeyDown={e => {
        const step = e.shiftKey ? 0.1 : 0.02;
        if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); set(ring.amt + step); }
        if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); set(ring.amt - step); }
        if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); onRemove(); }
      }}>
      <span className="m1-modamt-v">{pct > 0 && signed ? "+" : ""}{pct}%</span>
      <span className="m1-modamt-l">{knob}</span>
    </div>
  );
}

// ── the layer lfo and the sampler's aux envelope (drums, fx, sampler) ──────────────────────────────────────

const LFO_TABLE: Record<string, readonly ParamSpec[]> = { drums: DRUM_RACK_PARAMS, fx: FX_PARAMS, sampler: SAMPLER_PARAMS };
const modSpec = (engine: string, key: string) => LFO_TABLE[engine]?.find(p => p.key === key) as ParamSpec | undefined;
/** Live's LFO waveforms, in its menu's order, each drawn as a small picture. */
const WAVES: { name: string; d: string }[] = [
  { name: "sine", d: "M1 6C3 0 5 0 7 6S11 12 13 6" },
  { name: "up", d: "M1 11L7 1V11L13 1" },
  { name: "down", d: "M1 1L7 11V1L13 11" },
  { name: "triangle", d: "M1 6L4 1 10 11 13 6" },
  { name: "square", d: "M1 11V1H7V11H13V1" },
  { name: "random", d: "M1 8H4V2H7V10H10V4H13" },
];

/**
 * The source's own settings, shown while its chip is being edited: the layer lfo's rate (in Hz, or synced to
 * the song with the time mode toggle), and its waveform (Live 12's LFO device); the sampler's aux envelope's
 * attack and decay (Live's Sampler). The engine reads them as ordinary knobs (engine/src/params.rs).
 */
export function SourcePanel({ engine, src, value, onParam }: {
  engine: string;
  src: ModSrc;
  value: (index: number) => number;
  onParam: (index: number, spec: ParamSpec, v: number) => void;
}) {
  const c = SRC_COLOR[src];
  const knob = (spec: ParamSpec | undefined, label?: string) => spec ? (
    <Knob key={spec.key} label={label ?? spec.label} size={30} ring={c} value={value(spec.index)} defaultValue={spec.default} readout={display(spec, value(spec.index))}
      detents={spec.key === "modsynced" ? 8 : undefined} onChange={v => onParam(spec.index, spec, v)} />
  ) : null;
  if (src === "env") {
    if (engine !== "sampler") return null;
    return (
      <div className="m1-srcpanel" style={{ ["--c" as string]: c } as CSSProperties} role="group" aria-label="aux env settings">
        {knob(modSpec(engine, "auxattack"))}
        {knob(modSpec(engine, "auxdecay"))}
      </div>
    );
  }
  const sync = modSpec(engine, "modsync"), wave = modSpec(engine, "modwave");
  if (!sync || !wave) return null;
  const synced = value(sync.index) >= 0.5;
  const w = Math.round(Math.min(1, Math.max(0, value(wave.index))) * 5);
  return (
    <div className="m1-srcpanel" style={{ ["--c" as string]: c } as CSSProperties} role="group" aria-label="lfo settings">
      {knob(modSpec(engine, synced ? "modsynced" : "modrate"))}
      <div className="m1-srcopts">
        <div className="m1-seg" role="radiogroup" aria-label="time mode">
          {["hz", "sync"].map((m, i) => (
            <button key={m} type="button" role="radio" aria-checked={synced === (i === 1)} className={synced === (i === 1) ? "is-on" : ""}
              onClick={() => onParam(sync.index, sync, i)}>{m}</button>
          ))}
        </div>
        <div className="m1-seg is-waves" role="radiogroup" aria-label="waveform">
          {WAVES.map((x, i) => (
            <button key={x.name} type="button" role="radio" aria-checked={w === i} aria-label={x.name} title={x.name} className={w === i ? "is-on" : ""}
              onClick={() => onParam(wave.index, wave, i / 5)}>
              <svg viewBox="0 0 14 12" aria-hidden><path d={x.d} /></svg>
            </button>
          ))}
        </div>
        <span className="m1-srcwave">{WAVES[w]?.name}</span>
      </div>
    </div>
  );
}

// ── rings that move while the sound plays ──────────────────────────────────────────────────────────────

/**
 * While `on`, the engine reports the part's live modulation (cmd modWatch, 30 times a second, 15 on a phone
 * with few cores) and each modulated knob under `root` gets a dot where the source has it this moment
 * (Vital and Bitwig draw the same). Painted on the DOM on the next animation frame, so React never re-renders
 * for it; nothing is asked of the engine while no ring is on screen.
 */
export function useModLive(engine: Engine, layer: number, on: boolean, root: RefObject<HTMLElement | null>, rings: Map<number, Ring[]>, value: (index: number) => number) {
  const latest = useRef({ rings, value });
  latest.current = { rings, value };
  useEffect(() => {
    if (!on || layer < 0) return;
    let raf = 0;
    let pending: Float32Array | null = null;
    const paint = () => {
      raf = 0;
      const el = root.current;
      if (!el || !pending) return;
      const live = liveValues(latest.current.rings, latest.current.value, pending);
      el.querySelectorAll<HTMLElement>("[data-knob]").forEach(k => {
        const g = k.querySelector<SVGGElement>(".m1-mod-live");
        if (!g) return;
        const x = live.get(Number(k.dataset.knob));
        if (x === undefined) { g.classList.remove("is-on"); return; }
        g.style.setProperty("--live", x.toFixed(4));
        g.classList.add("is-on");
      });
    };
    const stop = engine.modWatch(layer, liveFps(), v => {
      pending = v;
      if (!raf) raf = requestAnimationFrame(paint);
    });
    return () => {
      stop();
      if (raf) cancelAnimationFrame(raf);
      root.current?.querySelectorAll(".m1-mod-live.is-on").forEach(g => g.classList.remove("is-on"));
    };
  }, [engine, layer, on, root]);
}
