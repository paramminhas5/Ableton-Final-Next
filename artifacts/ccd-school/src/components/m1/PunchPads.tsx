"use client";
import "./punch.css";
/**
 * Punch-in effects: four keys under your thumbs. Hold one and the whole mix goes through it; how high you
 * press sets the amount, and sliding moves it; let go and the mix is dry again. One at a time, like the
 * EP-133. Used in the studio's mix mode and the dj mixer.
 */
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { PUNCH, type Engine } from "@/engine";
import { PUNCH_KEYS, punchReadout, type PunchKey } from "@/lib/punch";

export function PunchPads({ engine, onStart, onSay, onUse, compact }: { engine: Engine; onStart?: () => void; onSay?: (label: string, text: string) => void; onUse?: (key: PunchKey, ms: number) => void; compact?: boolean }) {
  const [held, setHeld] = useState<{ key: PunchKey; amount: number } | null>(null);
  const pid = useRef<number | null>(null);
  const since = useRef<{ key: PunchKey; t: number } | null>(null);
  // Leaving the screen with a key held lets go, so the mix is never left wet.
  useEffect(() => () => engine.punch(PUNCH.off, 0), [engine]);
  const amountAt = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
  };
  const press = (k: (typeof PUNCH_KEYS)[number], amount: number) => {
    onStart?.();
    engine.punch(k.mode, amount);
    if (since.current?.key !== k.key) since.current = { key: k.key, t: performance.now() };
    setHeld({ key: k.key, amount });
    onSay?.(k.label, punchReadout(k.key, amount));
  };
  const letGo = () => {
    engine.punch(PUNCH.off, 0);
    if (since.current) onUse?.(since.current.key, performance.now() - since.current.t);
    since.current = null;
    setHeld(null);
    pid.current = null;
  };
  return (
    <div className={`pp ${compact ? "is-compact" : ""}`} role="group" aria-label="Punch-in effects: hold one, higher is more">
      {PUNCH_KEYS.map(k => {
        const on = held?.key === k.key;
        return (
          <button key={k.key} type="button" className={`pp-key ${on ? "is-on" : ""}`} aria-pressed={on}
            aria-label={`${k.label}: hold, ${k.hint}`} style={on ? ({ ["--a" as string]: held!.amount } as CSSProperties) : undefined}
            onPointerDown={e => { e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic */ } pid.current = e.pointerId; press(k, amountAt(e)); }}
            onPointerMove={e => { if (pid.current === e.pointerId) press(k, amountAt(e)); }}
            onPointerUp={letGo} onPointerCancel={letGo} onContextMenu={e => e.preventDefault()}
            onKeyDown={e => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); press(k, 0.5); } }}
            onKeyUp={e => { if (e.key === " " || e.key === "Enter") letGo(); }}
            onBlur={() => { if (on) letGo(); }}>
            <i className="pp-fill" aria-hidden />
            <span className="pp-l">{k.label}</span>
            <span className="pp-v">{on ? punchReadout(k.key, held!.amount) : "hold"}</span>
          </button>
        );
      })}
    </div>
  );
}
