"use client";
/**
 * Imagine it first (Building Blocks' Mind's Ear; logic in src/lib/imagine.ts). The notes of a short phrase sit
 * on the copy grid with no sound, a silent playhead sweeping them at the song's tempo so the rhythm can be
 * read too. The learner hums it, or hears it in their head, then plays two or three phrases on their own song
 * and picks the one they saw. Only then does the grid play. The same pieces serve the lesson step
 * (ImagineStep) and the ear gym (GymImagine).
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FLAG, OUT } from "@/engine";
import type { LessonScreen } from "@/content/types";
import { earTrack } from "@/lib/askEar";
import { parsePattern, rowsFor, type CopyLayer, type Pattern } from "@/lib/copyEar";
import { keyName } from "@/lib/theory";
import { readTrackV2, type NoteEvent, type TrackV2 } from "@/lib/track2";
import { playCorrect, playWrong } from "@/lib/audio";
import { CopyGrid, type GridView, type Level } from "./CopyEar";
import { GoPill, Icon, Key, Screen, Silk } from "./controls";
import { Body, Meta, useEnter } from "./LessonParts";
import { Gloss } from "./Gloss";
import { useEngineTrack } from "./useEngineTrack";

type Of = Extract<LessonScreen, { kind: "imagine" }>;
export type Phase = "imagine" | "listen" | "heard";

/** What any imagine screen needs: the phrases on the engine, the shown one's notes on the grid, picks and phases. */
export function useImagine({ song, layer, choices, answer, level }: { song: TrackV2 | null; layer: CopyLayer; choices: Pattern[]; answer: number; level: Level }) {
  const root = song?.root ?? 45, scale = song?.scale ?? "minor";
  const parsed = useMemo(() => choices.map(c => parsePattern(layer, c, root, scale)), [choices, layer, root, scale]);
  const shown = parsed[answer] ?? parsed[0];
  // Rows around the shown phrase, as the copy grid has them: few enough to read, so it fits a phone with the picks under it.
  const rows = useMemo(() => (shown?.events.length ? rowsFor(layer, shown.events, root, scale, level) : []), [shown, layer, root, scale, level]);
  const tracks = useMemo(() => (song ? choices.map(c => earTrack(song, { part: layer, notes: c })) : []), [song, choices, layer]);
  const [phase, setPhase] = useState<Phase>("imagine");
  const [now, setNow] = useState<number | null>(null);
  const [out, setOut] = useState<number[]>([]);
  const heardTrack = tracks[now ?? answer] ?? song ?? readTrackV2();
  const { engine, ready } = useEngineTrack(heardTrack);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => () => { try { engine.stop(); } catch { /* not started */ } }, [engine]);
  const playing = beat >= 0;
  // A silent playhead while imagining: where each note lands in time, at the song's tempo, with nothing heard.
  const [ghost, setGhost] = useState(-1);
  useEffect(() => {
    if (phase !== "imagine") { setGhost(-1); return; }
    const bpm = song?.bpm || 120;
    const t0 = performance.now();
    let raf = 0;
    const tick = () => { setGhost(((performance.now() - t0) / 60000) * bpm); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, song?.bpm]);
  const want = useRef(false);
  useEffect(() => {
    if (!want.current || now === null) return;
    want.current = false;
    void ready().then(() => { engine.metronome(false); engine.play(); }).catch(() => { /* needs a tap */ });
  }, [now, ready, engine]);
  const press = (i: number) => {
    if (phase === "imagine") setPhase("listen");
    if (now === i && playing) { engine.stop(); return; }
    if (now === i) { void ready().then(() => { engine.metronome(false); engine.play(); }); return; }
    want.current = !playing;
    setNow(i);
  };
  const right = phase === "heard";
  /** Pick a phrase: the right one plays and lights the grid; a wrong one is struck out. Returns whether it was right. */
  const pick = (i: number, quiet = false): boolean => {
    if (right || out.includes(i)) return false;
    if (i === answer) {
      setPhase("heard");
      if (!quiet) playCorrect();
      if (now !== answer || !playing) { want.current = true; setNow(answer); if (now === answer) void ready().then(() => engine.play()); }
      return true;
    }
    setOut(o => [...o, i]);
    if (!quiet) playWrong();
    return false;
  };
  const stop = () => { try { engine.stop(); } catch { /* not started */ } };
  // The grid: the shown phrase's notes, the playhead silent while imagining and real once it plays.
  const loop = shown?.loop ?? 4;
  const view: GridView = {
    loop, rows, mine: shown?.events ?? [], target: shown?.events ?? [], hints: [] as NoteEvent[], marks: new Map(), tap: () => {},
    // While listening the grid stays still whatever plays: a playhead that only moved for the right phrase would give it away.
    playing: phase === "imagine" ? ghost >= 0 : phase === "heard" && playing && now === answer, beat: phase === "imagine" ? ghost : beat,
  };
  return { phase, setPhase, press, pick, now: playing ? now : null, out, right, view, stop, playing, notes: shown?.events.length ?? 0 };
}
export type Imagine = ReturnType<typeof useImagine>;

/** One phrase: its play key and its pick key, the pick struck out when wrong and lit when right. */
export function ImagineOptions({ m, count, answer }: { m: Imagine; count: number; answer: number }) {
  const letter = (k: number) => String.fromCharCode(97 + k);
  return (
    <div className="fl-opts is-ear" role="radiogroup" aria-label="Which one did you see?" style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties}>
      {Array.from({ length: count }, (_, k) => {
        const on = m.now === k;
        const cls = m.right && k === answer ? "is-right" : m.out.includes(k) ? "is-out" : "";
        return (
          <div key={k} className="ae-opt">
            <button type="button" className={`ae-key ${on ? "is-on" : ""}`} aria-pressed={on} aria-label={on ? `Stop phrase ${letter(k)}` : `Play phrase ${letter(k)}`} onClick={() => m.press(k)}>
              <Icon name={on ? "stop" : "play"} small /><span>{letter(k)}</span>
            </button>
            <button type="button" role="radio" aria-checked={m.right && k === answer} disabled={m.right || m.out.includes(k) || m.phase === "imagine"} className={`fl-opt ${cls}`} onClick={() => m.pick(k)} aria-label={`It's ${letter(k)}`}>
              <span className="ae-blind">{m.right && k === answer ? <>this is the one you saw: <b>{letter(k)}</b></> : m.out.includes(k) ? <>not <b>{letter(k)}</b></> : <>it&apos;s <b>{letter(k)}</b></>}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** The four counts of the bar, lit by the playhead: silent while imagining. */
export function Counts({ m }: { m: Imagine }) {
  const at = m.view.playing && m.view.beat >= 0 ? Math.floor(m.view.beat) % 4 : -1;
  return (
    <div className="im-counts" aria-hidden>
      {[1, 2, 3, 4].map((n, i) => <span key={n} className={i === at ? "is-on" : ""}>{n}</span>)}
    </div>
  );
}

export function ImagineStep({ screen, onNext, tail }: { screen: Of; onNext: () => void; tail?: ReactNode }) {
  const [song, setSong] = useState<TrackV2 | null>(null);
  useEffect(() => setSong(readTrackV2()), []);
  const layer = screen.layer as CopyLayer;
  const m = useImagine({ song, layer, choices: screen.choices, answer: screen.answer, level: screen.level ?? "standard" });
  const n = screen.choices.length;
  const what = layer === "drums" ? "beat" : layer === "chords" ? "chords" : layer === "bass" ? "bass line" : "melody";
  const next = () => { m.stop(); onNext(); };
  // On a phone the picks sit under the grid: bring them up when it's time to listen.
  useEffect(() => { if (m.phase === "listen") document.querySelector(".ae-opt")?.scrollIntoView({ block: "center", behavior: "smooth" }); }, [m.phase]);
  useEnter(m.right ? next : m.phase === "imagine" ? () => m.setPhase("listen") : null);
  const go = m.right
    ? { label: "next", onClick: next, aria: "Next" }
    : m.phase === "imagine"
      ? { label: "i can hear it", onClick: () => m.setPhase("listen"), aria: "I can hear it in my head" }
      : { label: "pick the one you saw", onClick: undefined, aria: "Pick the one you saw" };
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left={`imagine it first${song && layer !== "drums" ? ` · ${keyName(song.root ?? 45, song.scale)}` : ""}`} right={m.phase === "imagine" ? "no sound yet" : m.right ? "this is how it sounds" : `which of ${n} is it?`} />
          <div className="im-line">{m.phase === "imagine" ? `hum this ${what} in your head` : m.right ? "you heard it before it played" : m.out.length ? "not that one. listen again" : "now listen, and pick the one you saw"}</div>
          <Counts m={m} />
          <CopyGrid c={m.view} layer={layer} locked />
        </Screen>
        {m.phase === "imagine"
          ? <div className="ls-hint im-tip">{layer === "drums" ? "read it left to right: each column is a sixteenth, four to a beat. say the hits out loud as the playhead passes them." : "read it left to right: higher rows are higher notes. hum it as the playhead passes, or sing it in your head. then press go."}</div>
          : <><Silk label="which one did you see?" right={m.right ? "right" : `${n} to try`} /><ImagineOptions m={m} count={n} answer={screen.answer} /></>}
      </div>
      <div className="fl-text">
        <Body text={screen.body} />
        {screen.hint && m.out.length ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {m.right ? <p className="ls-read ms-done">{m.out.length ? "got it. the grid plays it now: follow the notes as you hear them." : "first time. that's your inner ear working: you heard the notes before they played."}</p> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label="skip" onClick={next} ariaLabel="Skip this step"><Icon name="back" className="ls-flip" /></Key>
          <GoPill onClick={go.onClick} disabled={!go.onClick} style={{ gridColumn: "span 3" }} ariaLabel={go.aria}>{go.label}</GoPill>
        </div>
      </div>
    </div>
  );
}
