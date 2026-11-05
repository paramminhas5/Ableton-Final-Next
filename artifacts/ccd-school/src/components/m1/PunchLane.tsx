"use client";
/**
 * Punch-ins recorded into the song. Hold the studio's rec key and press a punch-in key: the press, how far you
 * slide it and when you let go become automation in the song (`punches`), played back by the engine on the
 * exact sample (engine.rs, cmd punchAdd). The lane shows them on the song's loop; tap one to change its amount
 * or delete it, or clear them all. Pure parts in src/lib/punch.ts (tests/punch.test.ts).
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FLAG, OUT, type Engine } from "@/engine";
import { addPunch, labelOf, punchKeyOf, punchLen, punchReadout, punchRecorder, type Punch, type PunchKey } from "@/lib/punch";
import type { TrackV2 } from "@/lib/track2";

type Update = (fn: (t: TrackV2) => TrackV2, undoable?: boolean) => void;

/** The loop the engine plays: the whole arrangement when the song has one. */
export const songLoop = (t: Pick<TrackV2, "loop" | "sections">) => (t.sections?.length ? t.sections.reduce((a, s) => a + s.bars * 4, 0) : t.loop || 4);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const withoutPunches = (t: TrackV2): TrackV2 => { const { punches: _p, ...rest } = t; return rest; };

const FX_C: Record<PunchKey, string> = { repeat: "var(--led-mint)", filter: "#57D3F5", tapeStop: "#F3C14F", throw: "#B89CFF" };

export function PunchLane({ engine, track, update }: { engine: Engine; track: TrackV2; update: Update }) {
  const loop = songLoop(track);
  const loopRef = useRef(loop);
  loopRef.current = loop;
  const rec = useRef(punchRecorder(() => loopRef.current));
  const [sel, setSel] = useState<number | null>(null);
  const [live, setLive] = useState<{ fx: PunchKey; at: number } | null>(null);
  const last = useRef({ beat: 0, recording: false });
  useEffect(() => engine.on(evs => {
    for (const e of evs) {
      if (e.kind === OUT.pos) {
        const recording = !!(e.flags & FLAG.recording) && !!(e.flags & FLAG.playing);
        // Recording stopped with a key still held: it ends where the playhead was.
        if (last.current.recording && !recording && rec.current.holding) {
          const p = rec.current.close(last.current.beat);
          setLive(null);
          if (p) update(t => ({ ...t, punches: addPunch(t.punches, p, songLoop(t)) }));
        }
        last.current = { beat: e.beat, recording };
        continue;
      }
      if (e.kind !== OUT.punched) continue;
      const done = rec.current.feed(e.note, e.vel, e.beat);
      const fx = punchKeyOf(e.note);
      setLive(rec.current.holding && fx ? l => (l && l.fx === fx ? l : { fx, at: e.beat }) : null);
      if (done) update(t => ({ ...t, punches: addPunch(t.punches, done, songLoop(t)) }));
    }
  }), [engine, update]);

  const punches = track.punches ?? [];
  const picked = sel !== null ? punches[sel] : undefined;
  useEffect(() => { if (sel !== null && sel >= punches.length) setSel(null); }, [sel, punches.length]);
  const edit = (fn: (p: Punch) => Punch | null) => {
    if (sel === null) return;
    update(t => {
      const list = [...(t.punches ?? [])];
      const p = list[sel];
      if (!p) return t;
      const q = fn(p);
      if (q) list[sel] = q; else list.splice(sel, 1);
      const { punches: _p, ...rest } = t; // eslint-disable-line @typescript-eslint/no-unused-vars
      return list.length ? { ...t, punches: list } : rest;
    });
    if (!fn(picked!)) setSel(null);
  };
  const pct = (b: number) => `${(Math.min(loop, Math.max(0, b)) / loop) * 100}%`;
  const blocks: { p: Punch; i: number; from: number; to: number }[] = [];
  punches.forEach((p, i) => {
    const len = punchLen(p, loop), at = ((p.at % loop) + loop) % loop;
    if (at + len <= loop) blocks.push({ p, i, from: at, to: at + len });
    else { blocks.push({ p, i, from: at, to: loop }); blocks.push({ p, i, from: 0, to: at + len - loop }); }
  });
  return (
    <div className="pl" role="group" aria-label="Punch-ins in the song">
      <div className="pl-lane">
        {Array.from({ length: Math.round(loop / 4) + 1 }, (_, b) => <i key={b} className="pl-bar" style={{ left: pct(b * 4) }} aria-hidden />)}
        {blocks.map((b, k) => (
          <button key={k} type="button" className={`pl-blk ${sel === b.i ? "is-sel" : ""}`} style={{ left: pct(b.from), width: `max(6px, ${((b.to - b.from) / loop) * 100}%)`, ["--c" as string]: FX_C[b.p.fx] } as CSSProperties}
            aria-pressed={sel === b.i} aria-label={`${labelOf(b.p.fx)} at beat ${(b.p.at + 1).toFixed(2)}, ${punchReadout(b.p.fx, b.p.amt)}`}
            onClick={() => setSel(s => (s === b.i ? null : b.i))} />
        ))}
        {live ? <i className="pl-live" style={{ left: pct(((live.at % loop) + loop) % loop), ["--c" as string]: FX_C[live.fx] } as CSSProperties} aria-hidden /> : null}
        {!punches.length && !live ? <span className="pl-empty">hold rec, then a key: it plays back with the song</span> : null}
      </div>
      {picked ? (
        <div className="pl-edit">
          <span className="pl-what" style={{ ["--c" as string]: FX_C[picked.fx] } as CSSProperties}>{labelOf(picked.fx)} · beat {(((picked.at % loop) + loop) % loop + 1).toFixed(2)}</span>
          <button type="button" className="st-tag" aria-label="Less" onClick={() => edit(p => ({ ...p, amt: Math.max(0, Math.round((p.amt - 0.05) * 100) / 100), moves: undefined }))}>−</button>
          <span className="pl-amt" aria-live="polite">{punchReadout(picked.fx, picked.amt)}</span>
          <button type="button" className="st-tag" aria-label="More" onClick={() => edit(p => ({ ...p, amt: Math.min(1, Math.round((p.amt + 0.05) * 100) / 100), moves: undefined }))}>+</button>
          <button type="button" className="st-tag" onClick={() => edit(() => null)}>delete</button>
        </div>
      ) : punches.length ? (
        <div className="pl-edit">
          <span className="pl-what">{punches.length} punch-in{punches.length > 1 ? "s" : ""} in the song · tap one to change it</span>
          <button type="button" className="st-tag" onClick={() => { setSel(null); update(withoutPunches); }}>clear</button>
        </div>
      ) : null}
    </div>
  );
}
