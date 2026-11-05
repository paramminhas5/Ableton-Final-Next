"use client";
/**
 * The write-and-play tools as lesson steps, each on the learner's own song: the chord track (Logic's Chord
 * Track), a session player (Logic's Drummer and Bass Player), chance and trig conditions (Live 12,
 * Elektron), a part's own length and swing (Elektron's per-track length, Live's groove), and commit (the
 * EP-133's). Each plays your song as you change it; keep writes it into the song. The go key says what is
 * still missing, and every step can be skipped.
 */
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { readTrackV2, writeTrackV2, newLayerV2, type LayerType, type NoteEvent, type TrackV2 } from "@/lib/track2";
import { chordEvents, chordName, withChordTrack, type Chord } from "@/lib/chords";
import { applyPlayer, type PlayerSettings } from "@/lib/players";
import { CONDS, setChance, setCond, stepTag, type Cond } from "@/lib/chance";
import { partLen } from "@/lib/partLength";
import { commitLoop } from "@/lib/arrange";
import { fillDrums, newSeed } from "@/lib/dice";
import { CAP, Dice, Knob, Screen } from "./controls";
import { Meta } from "./LessonParts";
import { ChordTrackEditor } from "./ChordTrack";
import { PlayerSurface } from "./PlayerSurface";
import { Frame, useLoop, withPart, type StepProps } from "./ToolSteps";
import { getEngine } from "@/engine";

const saved = (t: TrackV2) => { writeTrackV2({ ...t, updatedAt: Date.now() }); window.dispatchEvent(new Event("ccd:song")); };
const Skip = ({ onNext }: { onNext: () => void }) => <button type="button" className="ls-skip" onClick={onNext}>skip this step</button>;
const loopBar = (beat: number, loop: number) => (beat < 0 ? -1 : Math.floor((((beat % loop) + loop) % loop) / 4));
const realId = (id: string, tag: string) => (id === "__tool" ? `${tag}-${Date.now().toString(36)}` : id);

/** A part of `type` in the song: yours, or a simple one to work on (hats on the eighths, a four on the floor). */
function withDrumPart(t: TrackV2, type: "drums" | "hats"): { track: TrackV2; added: boolean } {
  if (t.layers.some(l => l.type === type && l.events.length)) return { track: t, added: false };
  const L = t.loop || 4;
  const l = newLayerV2(type, "__tool");
  const every = type === "hats" ? 0.5 : 1;
  l.events = Array.from({ length: Math.round(L / every) }, (_, i) => ({ note: type === "hats" ? 42 : 36, vel: 0.85, start: i * every, len: 0.1 }));
  const others = t.layers.filter(x => !(x.type === type && !x.events.length));
  return { track: { ...t, layers: [...others, l].slice(0, 8) }, added: true };
}

/** A part a step added for you ("__tool") gets a real id, in its sections' notes too. */
function renameTool(t: TrackV2): TrackV2 {
  const tool = t.layers.find(l => l.id === "__tool");
  if (!tool) return t;
  const id = realId("__tool", tool.type);
  return {
    ...t,
    layers: t.layers.map(l => (l.id === "__tool" ? { ...l, id } : l)),
    sections: t.sections?.map(s => ({ ...s, off: s.off.map(x => (x === "__tool" ? id : x)), ...(s.notes ? { notes: Object.fromEntries(Object.entries(s.notes).map(([k, v]) => [k === "__tool" ? id : k, v])) } : {}) })),
  };
}

// ── chord track ──────────────────────────────────────────────────────────────

export function ChordsStep({ screen, accent, onNext, tail }: StepProps) {
  const [base] = useState(() => withPart(readTrackV2(), "chords"));
  const [chords, setChords] = useState<(Chord | null)[]>(() => base.track.chords ?? []);
  const [touched, setTouched] = useState(false);
  // Your chords part plays the chord track as you build it (FL's chord stamp).
  const shown = useMemo(() => {
    const t = withChordTrack(base.track, chords);
    const evs = chordEvents(chords, t.loop);
    return evs.length ? { ...t, layers: t.layers.map(l => (l.type === "chords" ? { ...l, events: evs } : l)) } : t;
  }, [base, chords]);
  const { beat, playing, toggle } = useLoop(shown);
  const distinct = new Set(chords.filter((c): c is Chord => !!c).map(chordName)).size;
  const notYet = !touched ? "pick a chord for a bar" : distinct < 2 ? "pick a different chord for another bar" : null;
  const keep = () => {
    if (notYet) return;
    const t = readTrackV2();
    const from = t.layers.some(l => l.type === "chords" && l.events.length) ? t : base.track;
    const next = withChordTrack(from, chords);
    const evs = chordEvents(chords, next.loop);
    saved({ ...next, layers: next.layers.map(l => (l.type === "chords" ? { ...l, events: evs, id: realId(l.id, "chords") } : l)) });
    onNext();
  };
  return (
    <Frame screen={screen} playing={playing} toggle={toggle} tail={<>{tail}{notYet ? <Skip onNext={onNext} /> : null}</>} onGo={keep} go="keep the chord track" notYet={notYet}
      note={base.added ? "your song has no chords part yet, so one plays the chord track. keep adds it." : null}
      inst={<>
        <Screen>
          <Meta left="chord track" right={playing ? `bar ${loopBar(beat, shown.loop) + 1}` : "press play"} />
          <ChordTrackEditor track={shown} chords={chords} now={playing ? loopBar(beat, shown.loop) : -1} accent={accent} onChange={c => { setChords(c); setTouched(true); }} />
        </Screen>
      </>} />
  );
}

// ── session player ───────────────────────────────────────────────────────────

export function PlayerStep({ screen, accent, onNext, tail }: StepProps) {
  const type: LayerType = screen.layer === "bass" ? "bass" : "drums";
  const kind = type === "bass" ? "bass" as const : "drummer" as const;
  const [base] = useState(() => {
    const t = readTrackV2();
    if (t.layers.some(l => l.type === type)) return { track: t, added: false };
    return { track: { ...t, layers: [...t.layers, newLayerV2(type, "__tool")].slice(0, 8) }, added: true };
  });
  const part = base.track.layers.find(l => l.type === type)!;
  const [p, setP] = useState<PlayerSettings | null>(null);
  const shown = useMemo(() => (p ? applyPlayer(base.track, kind, part.id, p) : base.track), [base, p, kind, part.id]);
  const { playing, toggle } = useLoop(shown);
  const notYet = p ? null : "drag the dot on the pad";
  const keep = () => {
    if (!p) return;
    const t = readTrackV2();
    const from = t.layers.some(l => l.id === part.id) ? t : base.track;
    const next = applyPlayer(from, kind, part.id, p);
    saved({ ...next, layers: next.layers.map(l => (l.id === part.id ? { ...l, id: realId(l.id, type) } : l)) });
    onNext();
  };
  return (
    <Frame screen={screen} playing={playing} toggle={toggle} tail={<>{tail}{notYet ? <Skip onNext={onNext} /> : null}</>} onGo={keep} go={`keep the ${kind === "drummer" ? "drummer's beat" : "bass line"}`} notYet={notYet}
      note={base.added ? `your song has no ${type} part yet. keep adds one with these notes.` : null}
      inst={<div className="ws-player">
        <PlayerSurface kind={kind} settings={part.player} color={accent} onApply={q => setP(q)}
          note={kind === "bass" ? (base.track.chords?.some(Boolean) ? "follows your chord track. the notes are yours to edit after" : "no chord track: it plays your key's root. the notes are yours to edit after") : "the notes are yours to edit after"} />
      </div>} />
  );
}

// ── chance and trig conditions ───────────────────────────────────────────────

export function ChanceStep({ screen, accent, onNext, tail }: StepProps) {
  const type = screen.layer === "drums" ? "drums" as const : "hats" as const;
  const [base] = useState(() => withDrumPart(readTrackV2(), type));
  const part = base.track.layers.find(l => l.type === type)!;
  const [evs, setEvs] = useState<NoteEvent[]>(part.events);
  const arrival = useRef(JSON.stringify(part.events));
  const shown = useMemo(() => ({ ...base.track, layers: base.track.layers.map(l => (l.id === part.id ? { ...l, events: evs } : l)) }), [base, evs, part.id]);
  const { beat, playing, toggle } = useLoop(shown);
  const grid = 0.25;
  const steps = 16;
  const [sel, setSel] = useState<number | null>(null);
  const at = (s: number) => evs.filter(e => Math.abs(e.start - s * grid) < grid / 2);
  const match = (s: number) => (e: NoteEvent) => Math.abs(e.start - s * grid) < grid / 2;
  const first = sel !== null ? at(sel)[0] : undefined;
  const now = playing ? Math.floor((((beat % 4) + 4) % 4) / grid) : -1;
  const changed = JSON.stringify(evs) !== arrival.current;
  const varied = evs.some(e => (e.chance ?? 1) < 1 || e.cond);
  const notYet = !varied || !changed ? (sel === null ? "pick a step that plays" : "turn chance down or pick a condition") : null;
  const [fill, setFill] = useState(false);
  const holdFill = (on: boolean) => { getEngine().fill(on); setFill(on); };
  const keep = () => {
    if (notYet) return;
    const t = readTrackV2();
    const has = t.layers.some(l => l.id === part.id);
    const from = has ? t : base.track;
    saved({ ...from, layers: from.layers.map(l => (l.id === part.id ? { ...l, events: evs, id: realId(l.id, type) } : l)) });
    onNext();
  };
  return (
    <Frame screen={screen} playing={playing} toggle={toggle} tail={<>{tail}{notYet ? <Skip onNext={onNext} /> : null}</>} onGo={keep} go="keep the variation" notYet={notYet}
      note={base.added ? `your song has no ${type} yet, so here are a few to vary. keep adds them.` : null}
      inst={<>
        <Screen>
          <Meta left={`your ${type} · bar 1`} right={sel !== null ? `step ${sel + 1}${first ? ` · plays ${stepTag(first) || "every time"}` : " · off"}` : "pick a step"} />
          <div className="ws-steps" role="radiogroup" aria-label={`Steps of your ${type}`} style={{ ["--c" as string]: accent } as CSSProperties}>
            {Array.from({ length: steps }, (_, s) => {
              const e = at(s)[0];
              return (
                <button key={s} type="button" role="radio" aria-checked={sel === s} disabled={!e}
                  aria-label={`step ${s + 1}${e ? `, plays ${stepTag(e) || "every time"}` : ", off"}`}
                  className={`ws-step ${e ? "is-on" : ""} ${sel === s ? "is-sel" : ""} ${now === s ? "is-now" : ""}`} onClick={() => setSel(s)}>
                  {e && stepTag(e) ? <small>{stepTag(e)}</small> : null}
                </button>
              );
            })}
          </div>
        </Screen>
        <div className="ws-chance">
          <Knob label="chance" size={40} color={CAP.navy} value={first?.chance ?? 1} defaultValue={1} readout={`${Math.round((first?.chance ?? 1) * 100)}%`}
            onChange={v => { if (sel !== null && first) setEvs(es => setChance(es, match(sel), v)); }} />
          <div className="ws-conds" role="radiogroup" aria-label="Trig condition">
            {CONDS.map(c => {
              const on = (first?.cond ?? "") === c;
              return <button key={c || "off"} type="button" role="radio" aria-checked={on} disabled={!first} className={`ls-chip ${on ? "is-on" : ""}`} onClick={() => sel !== null && setEvs(es => setCond(es, match(sel), (c || null) as Cond | null))}>{c || "off"}</button>;
            })}
          </div>
          {evs.some(e => e.cond === "fill" || e.cond === "not fill") ? (
            <button type="button" className={`ls-chip ws-fill ${fill ? "is-on" : ""}`} aria-pressed={fill} aria-label="Fill: hold to play the fill steps"
              onPointerDown={() => holdFill(true)} onPointerUp={() => holdFill(false)} onPointerLeave={() => fill && holdFill(false)} onPointerCancel={() => holdFill(false)}>hold for fill</button>
          ) : null}
        </div>
      </>} />
  );
}

// ── a part's own length and swing ────────────────────────────────────────────

const SWINGS: (number | undefined)[] = [undefined, 0, 0.25, 0.5, 0.7];
export function LengthStep({ screen, accent, onNext, tail }: StepProps) {
  const type = screen.layer === "drums" ? "drums" as const : "hats" as const;
  const [base] = useState(() => withDrumPart(readTrackV2(), type));
  const part = base.track.layers.find(l => l.type === type)!;
  const loop = base.track.loop || 4;
  const grid = 0.25;
  const loopSteps = Math.round(loop / grid);
  const startLen = partLen(part, loop);
  const [steps, setSteps] = useState(startLen !== null ? Math.round(startLen / grid) : loopSteps);
  const [swing, setSwing] = useState<number | undefined>(part.swing);
  const shown = useMemo(() => ({ ...base.track, layers: base.track.layers.map(l => {
    if (l.id !== part.id) return l;
    const { len: _l, swing: _s, ...rest } = l; // eslint-disable-line @typescript-eslint/no-unused-vars
    return { ...rest, ...(steps < loopSteps ? { len: steps * grid } : {}), ...(swing !== undefined ? { swing } : {}) };
  }) }), [base, part.id, steps, swing, loopSteps]);
  const { beat, playing, toggle } = useLoop(shown);
  const changed = steps !== (startLen !== null ? Math.round(startLen / grid) : loopSteps);
  const notYet = changed && steps < loopSteps ? null : "make the part shorter than the loop";
  const now = playing ? Math.floor(((((beat % loop) + loop) % loop) % (steps * grid)) / grid) : -1;
  const keep = () => {
    if (notYet) return;
    const t = readTrackV2();
    const from = t.layers.some(l => l.id === part.id) ? t : base.track;
    saved({ ...from, layers: from.layers.map(l => {
      if (l.id !== part.id) return l;
      const { len: _l, swing: _s, ...rest } = l; // eslint-disable-line @typescript-eslint/no-unused-vars
      return { ...rest, ...(steps < loopSteps ? { len: steps * grid } : {}), ...(swing !== undefined ? { swing } : {}), id: realId(l.id, type) };
    }) });
    onNext();
  };
  const shownSteps = Math.min(16, loopSteps);
  return (
    <Frame screen={screen} playing={playing} toggle={toggle} tail={<>{tail}{notYet ? <Skip onNext={onNext} /> : null}</>} onGo={keep} go={`keep ${steps} step${steps > 1 ? "s" : ""}`} notYet={notYet}
      note={base.added ? `your song has no ${type} yet, so here are some to try it on. keep adds them.` : null}
      inst={<>
        <Screen>
          <Meta left={`your ${type} · its own length`} right={steps < loopSteps ? `${steps} steps against ${loopSteps}` : "the song's length"} />
          <div className="ws-steps" aria-label={`The first ${shownSteps} steps of your ${type}`} style={{ ["--c" as string]: accent } as CSSProperties}>
            {Array.from({ length: shownSteps }, (_, s) => {
              const on = part.events.some(e => Math.abs(e.start - s * grid) < grid / 2);
              return <span key={s} className={`ws-step ${on && s < steps ? "is-on" : ""} ${s >= steps ? "is-past" : ""} ${now === s ? "is-now" : ""}`} aria-hidden />;
            })}
          </div>
        </Screen>
        <div className="ws-chance">
          <div className="ws-len" role="group" aria-label="Length in steps">
            <button type="button" className="ls-chip" aria-label="One step shorter" disabled={steps <= 1} onClick={() => setSteps(n => Math.max(1, n - 1))}>−</button>
            <b aria-live="polite">{steps}</b>
            <button type="button" className="ls-chip" aria-label="One step longer" disabled={steps >= loopSteps} onClick={() => setSteps(n => Math.min(loopSteps, n + 1))}>+</button>
            <small>steps</small>
          </div>
          <div className="ws-conds" role="radiogroup" aria-label={`Swing for your ${type}`}>
            {SWINGS.map(v => <button key={String(v)} type="button" role="radio" aria-checked={swing === v} className={`ls-chip ${swing === v ? "is-on" : ""}`} onClick={() => setSwing(v)}>{v === undefined ? "song's swing" : `${Math.round(v * 100)}%`}</button>)}
          </div>
        </div>
      </>} />
  );
}

// ── commit ───────────────────────────────────────────────────────────────────

export function CommitStep({ screen, accent, onNext, tail }: StepProps) {
  const [base] = useState(() => withDrumPart(readTrackV2(), "drums").track);
  const [t, setT] = useState<TrackV2>(base);
  const [committed, setCommitted] = useState(false);
  const [amt, setAmt] = useState(0);
  const [seed, setSeed] = useState(3);
  const drums = t.layers.find(l => l.type === "drums")!;
  const before = useRef<NoteEvent[] | null>(null);
  const { playing, toggle } = useLoop(t);
  const differs = committed && !!t.sections && t.at !== undefined && JSON.stringify(drums.events) !== JSON.stringify(t.sections[t.at - 1]?.notes?.[drums.id] ?? before.current);
  const notYet = !committed ? "press commit" : !differs ? "turn density up to make this section different" : null;
  const commit = () => {
    const next = commitLoop(t);
    before.current = drums.events;
    setT(next);
    setCommitted(true);
    setAmt(0);
  };
  const vary = (a: number, s: number) => {
    if (!committed || !before.current) return;
    setAmt(a);
    setSeed(s);
    setT(x => ({ ...x, layers: x.layers.map(l => (l.id === drums.id ? { ...l, events: fillDrums(before.current!, [36, 38, 42, 39], x.loop || 4, 0.25, a, s) } : l)) }));
  };
  const keep = () => {
    if (notYet) return;
    saved(renameTool(t));
    onNext();
  };
  const secs = t.sections ?? [];
  return (
    <Frame screen={screen} playing={playing} toggle={toggle} tail={<>{tail}{notYet ? <Skip onNext={onNext} /> : null}</>} onGo={keep} go="keep the sections" notYet={notYet}
      inst={<>
        <Screen>
          <Meta left="commit" right={committed && t.at !== undefined ? `now in section ${secs[t.at]?.name}` : "your loop"} />
          <div className="ws-secs" style={{ ["--c" as string]: accent } as CSSProperties} aria-label="Your sections">
            {secs.length ? secs.map((s, i) => <span key={i} className={`ws-sec ${i === t.at ? "is-on" : ""}`}>{s.name}<small>{s.bars} bars</small></span>) : <span className="ws-sec is-on">your loop<small>{Math.round((t.loop || 4) / 4)} bar{(t.loop || 4) > 4 ? "s" : ""}</small></span>}
          </div>
        </Screen>
        <div className="ws-chance">
          <button type="button" className="ls-chip ws-commit" onClick={commit}>commit</button>
          {committed ? <Dice amount={amt} onAmount={v => vary(v, seed)} onRoll={() => vary(amt || 0.4, newSeed())} label="density" width={110} /> : null}
        </div>
      </>} />
  );
}
