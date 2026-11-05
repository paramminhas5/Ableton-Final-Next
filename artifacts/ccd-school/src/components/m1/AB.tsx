"use client";
/**
 * A/B (touch and hear, item 3): Live 12.3's device A/B states on every instrument. The first press keeps
 * the sound as it is in a and copies it to b; you change b, then switch between them. Both play at the
 * same loudness (each setting is rendered offline through the same engine and the louder one is
 * trimmed), so the louder one can't win. The cross stops comparing and keeps the one you are on.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Engine } from "@/engine";
import { levelMatch } from "@/lib/offline";
import type { LayerV2, TrackV2 } from "@/lib/track2";

export type Side = "a" | "b";
type Snap = { params: Record<number, number>; mods?: LayerV2["mods"] };

/** The key: "a/b" while off; a and b (and a cross) while comparing. */
export function ABKey({ on, onStart, onSwitch, onStop, labels = ["a", "b"] }: { on: Side | null; onStart: () => void; onSwitch: (s: Side) => void; onStop?: () => void; labels?: [string, string] }) {
  if (!on) {
    return (
      <button type="button" className="m1-ab" onClick={onStart} aria-label="a/b: keep this sound as a, change b, and switch between them at the same loudness">a/b</button>
    );
  }
  return (
    <div className="m1-ab is-on" role="radiogroup" aria-label="a/b, level matched">
      {(["a", "b"] as Side[]).map((s, i) => (
        <button key={s} type="button" role="radio" aria-checked={on === s} className={on === s ? "is-lit" : ""} onClick={() => onSwitch(s)}
          aria-label={`${labels[i]}`}>{s}</button>
      ))}
      {onStop ? <button type="button" className="m1-ab-x" onClick={onStop} aria-label={`Stop comparing, keep ${on}`}>×</button> : null}
    </div>
  );
}

/**
 * A/B for one part of the studio's song. `apply` puts a setting on the part (not an undo step), `say`
 * reports to the screen. Returns the key's props.
 */
export function useAB(engine: Engine, track: TrackV2, layer: LayerV2 | null, index: number, apply: (s: Snap) => void, say: (label: string, text: string) => void) {
  const [st, setSt] = useState<{ id: string; a: Snap; b: Snap; on: Side } | null>(null);
  const job = useRef(0);
  const snap = (l: LayerV2): Snap => ({ params: { ...l.params }, mods: l.mods ? l.mods.map(m => ({ ...m })) : undefined });
  const trimFor = useCallback(async (a: Snap, b: Snap, on: Side, t: TrackV2, l: LayerV2, i: number) => {
    const n = ++job.current;
    try {
      const m = await levelMatch(t, { ...l, ...a }, { ...l, ...b });
      if (n !== job.current) return;
      engine.trim(i, on === "a" ? m.a : m.b);
      const louder = m.diff > 0 ? "b" : "a";
      say(Math.abs(m.diff) < 0.1 ? "a/b · same loudness" : `a/b · ${louder} was ${Math.abs(m.diff).toFixed(1)} db louder, matched`, on);
    } catch {
      say("a/b", on);
    }
  }, [engine, say]);
  // A new part, or leaving: stop comparing and take the trim off.
  useEffect(() => {
    if (st && (!layer || st.id !== layer.id)) {
      const i = track.layers.findIndex(l => l.id === st.id);
      if (i >= 0) engine.trim(i, 0);
      setSt(null);
    }
  }, [layer?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (index >= 0) engine.trim(index, 0); }, [engine, index]);
  // Turning knobs while comparing changes how loud this side is: match again once the hand stops.
  useEffect(() => {
    if (!st || !layer || st.id !== layer.id) return;
    const t = window.setTimeout(() => {
      const cur = snap(layer);
      void trimFor(st.on === "a" ? cur : st.a, st.on === "b" ? cur : st.b, st.on, track, layer, index);
    }, 300);
    return () => window.clearTimeout(t);
  }, [layer?.params, layer?.mods]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!layer) return { on: null as Side | null, onStart: () => {}, onSwitch: () => {}, onStop: () => {} };
  return {
    on: st?.id === layer.id ? st.on : null,
    onStart: () => {
      const s = snap(layer);
      setSt({ id: layer.id, a: s, b: s, on: "b" });
      say("a/b", "a kept · change b");
    },
    onSwitch: (to: Side) => {
      if (!st || st.on === to) return;
      // What you have now is the side you were on; then the other side goes on the part.
      const cur = snap(layer);
      const next = { ...st, [st.on]: cur, on: to } as typeof st;
      setSt(next);
      apply(next[to]);
      void trimFor(next.a, next.b, to, track, layer, index);
    },
    onStop: () => {
      job.current++;
      engine.trim(index, 0);
      say("a/b", `kept ${st?.on ?? "b"}`);
      setSt(null);
    },
  };
}
