"use client";
/**
 * The keys of a question answered by ear (src/lib/askEar.ts). Every sound is the learner's own song with one
 * thing changed, rendered on the engine through useEngineTrack: press a key and that version plays, press
 * another and the loop switches to it in place (so a and b can be compared on the same bar), press the lit
 * one again to stop. The question's sounds sit above the answers; an option's sound sits beside it.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FLAG, OUT } from "@/engine";
import type { AskEar } from "@/content/lessons/schema";
import { earLabel, earTrack } from "@/lib/askEar";
import { readTrackV2, type TrackV2 } from "@/lib/track2";
import { Icon } from "./controls";
import { useEngineTrack } from "./useEngineTrack";

/** Which sound plays ("q0", "o2") and the keys to switch it. `song`: the learner's song when the question opened. */
export function useEarSounds(ear: AskEar | undefined, song: TrackV2 | null) {
  const tracks = useMemo(() => {
    const out = new Map<string, TrackV2>();
    if (!ear || !song) return out;
    const step = { part: ear.part, with: ear.with };
    (ear.play ?? []).forEach((s, i) => out.set(`q${i}`, earTrack(song, s, step)));
    (ear.sounds ?? []).forEach((s, i) => out.set(`o${i}`, earTrack(song, s, step)));
    return out;
  }, [ear, song]);
  const [now, setNow] = useState<string | null>(null);
  const heard = (now && tracks.get(now)) || tracks.values().next().value || song || readTrackV2();
  const { engine, ready } = useEngineTrack(heard);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => () => { try { engine.stop(); } catch { /* not started */ } }, [engine]);
  const playing = beat >= 0;
  // Pressing a key sets the sound, and it starts once that render has reached the engine.
  const want = useRef(false);
  useEffect(() => {
    if (!want.current || !now) return;
    want.current = false;
    void ready().then(() => { engine.metronome(false); engine.play(); }).catch(() => { /* needs a tap */ });
  }, [now, ready, engine]);
  const press = (id: string) => {
    if (now === id && playing) { engine.stop(); return; }
    if (now === id) { void ready().then(() => { engine.metronome(false); engine.play(); }); return; }
    want.current = !playing;
    setNow(id);
  };
  const stop = () => { try { engine.stop(); } catch { /* not started */ } };
  return { tracks, now: playing ? now : null, press, stop, playing };
}
export type EarSounds = ReturnType<typeof useEarSounds>;

/** One key that plays a sound: the play icon and its letter or label, lit while it plays. */
export function EarKey({ s, id, label, aria, className }: { s: EarSounds; id: string; label: string; aria: string; className?: string }) {
  const on = s.now === id;
  return (
    <button type="button" className={`ae-key ${on ? "is-on" : ""} ${className ?? ""}`} aria-pressed={on} aria-label={on ? `Stop ${aria}` : `Play ${aria}`} onClick={() => s.press(id)}>
      <Icon name={on ? "stop" : "play"} small />
      <span>{label}</span>
    </button>
  );
}

/** The question's own sounds, above the answers: one ("hear it"), or two (a and b). */
export function EarPlayRow({ s, ear }: { s: EarSounds; ear: AskEar }) {
  const ps = ear.play ?? [];
  if (!ps.length) return null;
  return (
    <div className={`ae-row ${ps.length === 1 ? "is-one" : ""}`} role="group" aria-label="Sounds for this question" style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties}>
      {ps.map((p, i) => <EarKey key={i} s={s} id={`q${i}`} label={earLabel(p, i, ps.length, true)} aria={ps.length === 1 ? "the sound" : `sound ${earLabel(p, i, ps.length, true)}`} />)}
    </div>
  );
}
