"use client";
/**
 * Drag to modulate (touch and hear, item 2). The instrument's sources sit as chips above its knobs: drag
 * one onto any knob and it is routed there (Vital), drawn as a ring in the source's colour (Pigments).
 * Tap a chip instead to edit that source: every knob then shows the source's amount, dragged up or down
 * (Bitwig's modulation mode), or a plus to route it. The knobs themselves still turn.
 * Logic in src/lib/modulation.ts; the engine side in engine.rs (cmd MOD).
 */
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { SRC_COLOR, SRC_LABEL, type ModSrc, type Ring } from "@/lib/modulation";

/** The source chips. Drag onto a knob (anything with data-mod-to) to route it; tap to edit its amounts. */
export function ModChips({ sources, used, edit, onEdit, onDrop, onOver }: {
  sources: ModSrc[];
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
          aria-pressed={edit === s} aria-label={`${SRC_LABEL[s]}: drag onto a knob to modulate it, or press to set its amounts`} {...handlers(s)}>
          <svg viewBox="0 0 16 10" aria-hidden>{s === "lfo" ? <path d="M1 5C3 0 5 0 7 5S11 10 13 5 15 2 15 2" /> : <path d="M1 9L3 1 7 5H11L15 9" />}</svg>
          {SRC_LABEL[s]}
        </button>
      ))}
      {ghost ? <span className="m1-modghost" style={{ left: ghost.x, top: ghost.y, ["--c" as string]: SRC_COLOR[ghost.src] } as CSSProperties} aria-hidden>{SRC_LABEL[ghost.src]}</span> : null}
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
      <span className="m1-modamt-l">{SRC_LABEL[src]}</span>
    </div>
  );
}
