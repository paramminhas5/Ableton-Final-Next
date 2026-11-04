"use client";
/**
 * Try it: play the lesson's line on the real engine, over your own track.
 * rec counts in one bar, then records; play stops recording and loops the take; rec
 * again adds on top; undo takes back the last take; "use this line" keeps it for the
 * end of the lesson, where it joins your track when you press add.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { FLAG, OUT, type EngineEvent } from "@/engine";
import { pressNote, releaseNote, overdub, type Held } from "@/lib/recorder";
import { practiceTrack, playPads, type Take } from "@/lib/lessonTake";
import { readTrackV2, TYPE, type LayerType, type NoteEvent, type TrackV2 } from "@/lib/track2";
import { NOTE_NAMES, type Snap } from "@/lib/theory";
import { velocity } from "@/lib/touch";
import { GoPill, Icon, Key, Screen, Silk } from "./controls";
import { useEngineTrack } from "./useEngineTrack";
import { Gloss } from "./Gloss";

const SNAPS: Snap[] = ["1/16", "1/32", "off"];
/** How far from a beat a guided hit can land and still count, in beats (75 ms at 120 bpm). */
const TOL = 0.15;

const GOAL_NOTE: Record<string, number> = { kick: 36, snare: 38, clap: 39, hat: 42, "open hat": 46 };
export type Coach = { body: string; hint?: string; goal: { notes: number; note?: string }; tail?: ReactNode };

export function TryIt({ type, title, initial, coach, onUse, onSkip }: {
  type: LayerType;
  title: string;
  /** From a lesson file: what to do, what counts as done, and a nudge. */
  coach?: Coach;
  initial?: NoteEvent[];
  onUse: (take: Take) => void;
  onSkip: () => void;
}) {
  const base = useMemo(() => practiceTrack(readTrackV2(), type), [type]);
  const [session, setSession] = useState<TrackV2>(() => {
    if (!initial?.length) return base.track;
    return { ...base.track, layers: base.track.layers.map((l, i) => (i === base.index ? { ...l, events: initial } : l)) };
  });
  const idx = base.index;
  const { engine, start, ready, started } = useEngineTrack(session);
  const [click, setClick] = useState(true);
  const [pos, setPos] = useState({ beat: 0, flags: 0 });
  // A guided play-in records exactly what you played: no snap until a lesson teaches it.
  const [snap, setSnap] = useState<Snap>(coach ? "off" : "1/16");
  const [nudge, setNudge] = useState(false);
  const [held, setHeld] = useState<Set<number>>(new Set());
  const [lit, setLit] = useState<Record<number, number>>({});
  const history = useRef<NoteEvent[][]>([]);
  const takeOpen = useRef(false);
  const recHeld = useRef<Held>(new Map());
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const pads = useMemo(() => playPads(type, session.root, session.scale === "major" ? "major" : "minor"), [type, session.root, session.scale]);
  const events = session.layers[idx]?.events ?? [];
  const drumLike = type === "drums" || type === "hats";
  const playing = !!(pos.flags & FLAG.playing);
  const countIn = !!(pos.flags & FLAG.countIn);
  const recording = !!(pos.flags & FLAG.recording);
  const backing = session.layers.some((l, i) => i !== idx && l.events.length > 0);

  const setEvents = useCallback((fn: (e: NoteEvent[]) => NoteEvent[]) => {
    setSession(t => ({ ...t, layers: t.layers.map((l, i) => (i === idx ? { ...l, events: fn(l.events) } : l)) }));
  }, [idx]);

  // Engine events: the playhead, sequenced hits for the lights, and recording.
  useEffect(() => {
    return engine.on((evs: EngineEvent[]) => {
      const t = sessionRef.current;
      for (const e of evs) {
        if (e.kind === OUT.pos) {
          setPos(p => (p.beat === e.beat && p.flags === e.flags ? p : { beat: e.beat, flags: e.flags }));
          continue;
        }
        if (e.layer !== idx) continue;
        if (e.kind === OUT.seqOn) {
          setLit(l => ({ ...l, [e.note]: Date.now() }));
          continue;
        }
        const rec = !!(e.flags & FLAG.recording);
        const opts = { loop: t.loop, snap, strength: 1, swing: t.swing };
        if (e.kind === OUT.playedOn && rec) {
          pressNote(recHeld.current, "take", e.note, e.vel, e.beat, !!(e.flags & FLAG.countIn));
        } else if (e.kind === OUT.playedOff) {
          const ev = releaseNote(recHeld.current, "take", e.note, e.beat, opts);
          if (!ev) continue;
          // Every hit can be undone on its own.
          history.current.push(t.layers[idx]?.events ?? []);
          setEvents(cur => overdub(cur, ev, opts));
        }
      }
    });
  }, [engine, idx, snap, setEvents]);

  useEffect(() => {
    if (!recording && !countIn) takeOpen.current = false;
  }, [recording, countIn]);

  // Lights fade on their own.
  useEffect(() => {
    if (!Object.keys(lit).length) return;
    const id = window.setTimeout(() => setLit(l => Object.fromEntries(Object.entries(l).filter(([, t]) => Date.now() - t < 160))), 180);
    return () => window.clearTimeout(id);
  }, [lit]);

  // With nothing to play along to, the click keeps time.
  useEffect(() => {
    engine.metronome(click && (coach ? true : !backing && (recording || countIn)));
  }, [engine, backing, recording, countIn, click, coach]);

  // A guided play-in opens with the click already going, so you hear the beat before you touch anything.
  useEffect(() => {
    if (!coach) return;
    let gone = false;
    void ready().then(() => { if (!gone) { engine.metronome(true); engine.play(); } }).catch(() => { /* needs a tap first */ });
    return () => { gone = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { engine.stop(); engine.metronome(false); }, [engine]);

  const down = (pad: number, e: PointerEvent<HTMLElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    start();
    const vel = velocity(e);
    for (const n of pads[pad].notes) engine.noteOn(idx, n, vel, e.timeStamp);
    setHeld(h => new Set(h).add(pad));
  };
  const up = (pad: number, e: PointerEvent<HTMLElement>) => {
    if (!held.has(pad)) return;
    for (const n of pads[pad].notes) engine.noteOff(idx, n, e.timeStamp);
    setHeld(h => {
      const n = new Set(h);
      n.delete(pad);
      return n;
    });
  };

  useEffect(() => { if (started.current) engine.metronome(click); }, [click, engine, started]);
  const rec = async () => {
    await ready();
    engine.metronome(click);
    if (recording || countIn) engine.recordOff();
    else {
      takeOpen.current = false;
      if (playing) engine.stop();
      engine.record(4);
    }
  };
  const play = async () => {
    await ready();
    engine.metronome(click);
    if (recording || countIn) engine.play();
    else if (playing) engine.stop();
    else engine.play();
  };
  const undo = () => {
    const prev = history.current.pop();
    if (prev) setEvents(() => prev);
  };
  // Tap undo takes back the last hit. Hold it to clear the lot.
  const held2 = useRef<{ t: number; fired: boolean }>({ t: 0, fired: false });
  const holdStart = () => {
    held2.current.fired = false;
    window.clearTimeout(held2.current.t);
    held2.current.t = window.setTimeout(() => { held2.current.fired = true; clear(); }, 600);
  };
  const holdEnd = () => window.clearTimeout(held2.current.t);
  const undoTap = () => { if (held2.current.fired) { held2.current.fired = false; return; } undo(); };
  const clear = () => {
    if (!events.length) return;
    history.current.push(events);
    setEvents(() => []);
  };
  const use = () => {
    if (coach && !goalMet) { setNudge(true); window.setTimeout(() => setNudge(false), 1600); return; }
    engine.stop();
    // Hits that were close enough to the beat are kept exactly on it.
    onUse({ type, events: coach && onBeatOnly ? events.map(e => (isOff(e) ? e : { ...e, start: ((Math.round(e.start) % loop) + loop) % loop })) : events });
  };

  // ── the screen: a piano roll of the take ────────────────────────────────
  const loop = session.loop;
  const allNotes = pads.flatMap(p => p.notes);
  const lo = Math.min(...allNotes), hi = Math.max(...allNotes);
  const rows = drumLike ? pads.length : hi - lo + 1;
  const rowOf = (n: number) => (drumLike ? pads.findIndex(p => p.notes[0] === n) : hi - n);
  const Wd = 330, Hd = 128;
  const rh = Hd / Math.max(1, rows);
  const beatW = Wd / loop;
  const head = playing ? (((pos.beat % loop) + loop) % loop) * beatW : -1;
  const color = TYPE[type].color;
  const notesCount = drumLike ? events.length : new Set(events.map(e => `${e.start}:${e.note}`)).size;
  const status = countIn
    ? `count in · ${Math.max(1, Math.ceil(-pos.beat))}`
    : recording
      ? `recording · beat ${Math.floor(((pos.beat % loop) + loop) % loop) + 1} of ${loop}`
      : playing
        ? "playing back · looping"
        : events.length
          ? "your line"
          : "ready";
  const goalNote = coach?.goal.note ? GOAL_NOTE[coach.goal.note] : undefined;
  // Only hits that land on a beat count. A hit between beats has to be fixed, not waved through.
  const goalEvents = coach ? events.filter(e => goalNote === undefined || e.note === goalNote) : [];
  // Drum lessons ask for hits on the beat. A tune can go anywhere on the grid, so there we count notes.
  const onBeatOnly = goalNote !== undefined;
  const offOf = (e: NoteEvent) => e.start - Math.round(e.start);
  const isOff = (e: NoteEvent) => onBeatOnly && (goalNote === undefined || e.note === goalNote) && Math.abs(offOf(e)) > TOL;
  const offs = goalEvents.filter(isOff);
  const offBeat = onBeatOnly ? offs.length : 0;
  const goalHits = onBeatOnly
    ? new Set(goalEvents.filter(e => !isOff(e)).map(e => Math.round(e.start) % loop)).size
    : new Set(goalEvents.map(e => `${e.start}:${e.note}`)).size;
  const goalMet = !coach || (goalHits >= coach.goal.notes && offBeat === 0);
  const keyName = `${NOTE_NAMES[((session.root % 12) + 12) % 12]} ${session.scale}`;

  const nowLine = !coach ? "" : countIn ? `count-in ${Math.max(1, Math.ceil(-pos.beat))}. listen, don't tap yet`
    : recording ? `recording. tap the kick on beat ${Math.floor(((pos.beat % loop) + loop) % loop) + 1}`
    : !events.length ? (onBeatOnly ? "press rec. four clicks count you in, then tap the kick on the next four" : "press rec. four clicks count you in, then play any keys you like")
    : offBeat ? `${offBeat === 1 ? "one kick" : `${offBeat} kicks`} came in ${offOf(offs[0]) < 0 ? "early" : "late"}, the red ${offBeat === 1 ? "one" : "ones"}. tap undo and play ${offBeat === 1 ? "it" : "them"} again with the click`
    : !goalMet ? `${goalHits} of ${coach.goal.notes}${onBeatOnly ? " on the beat" : " notes"}. press rec and add the rest`
    : !playing ? "nice. now press play to hear your loop"
    : "that is your loop. press keep it when you like it";
  const glow = { outline: "2px solid var(--led-go)", outlineOffset: -2, borderRadius: 14 } as CSSProperties;
  return (
    <div className="ls-col">
      <div className="fl-inst">
      <Screen>
        <div className="ls-meta">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span className="ls-led" style={{ ["--c" as string]: recording || countIn ? "var(--led-red)" : playing ? "var(--led-mint)" : "var(--ledoff)" } as CSSProperties} />
            {status}
          </span>
          <span>{drumLike ? `${session.bpm} bpm` : keyName}</span>
        </div>
        <div className="ls-title">{title}</div>
        <svg viewBox={`0 0 ${Wd} ${Hd}`} width="100%" style={{ display: "block", marginTop: 12 }} role="img" aria-label={`${notesCount} notes recorded`}>
          {coach && Array.from({ length: loop }, (_, i) => <text key={`b${i}`} x={i * beatW + 4} y={10} fontSize={9} fill="rgba(255,255,255,.55)">{i + 1}</text>)}
          {Array.from({ length: loop * 4 + 1 }, (_, i) => (
            <path key={i} d={`M${(i * Wd) / (loop * 4)} 0V${Hd}`} stroke={i % 4 === 0 ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.05)"} />
          ))}
          {Array.from({ length: rows + 1 }, (_, i) => <path key={`r${i}`} d={`M0 ${i * rh}H${Wd}`} stroke="rgba(255,255,255,.04)" />)}
          {events.map((e, i) => {
            const r = rowOf(e.note);
            if (r < 0) return null;
            const x = (e.start / loop) * Wd;
            const w = drumLike ? Math.max(6, beatW * 0.45) : Math.max(6, (e.len / loop) * Wd - 2);
            const c = isOff(e) ? "#FF4A5A" : color;
            return <rect key={i} x={x + 1} y={r * rh + 1.5} width={Math.min(w, Wd - x - 1)} height={Math.max(4, rh - 3)} rx={2} fill={c} style={{ filter: `drop-shadow(0 0 3px ${c})` }} />;
          })}
          {head >= 0 && <path d={`M${head} 0V${Hd}`} stroke={recording ? "#FF4A5A" : "#F3F2EF"} strokeWidth={1.5} />}
        </svg>
        <div className="ls-meta" style={{ marginTop: 10 }}>
          <span style={{ color }}>{notesCount ? `${notesCount} ${notesCount === 1 ? "note" : "notes"}` : "nothing yet"}</span>
          <span>{recording ? "press play to stop and hear it" : playing ? "press rec to add more on top" : backing ? "plays over your track" : "the click keeps time"}</span>
        </div>
      </Screen>
      <Silk label="transport" right={coach ? "undo takes back a hit · hold to clear" : "rec records · play loops it"} />
      <div className="m1-g">
        <Key label="rec" style={coach && !events.length && !recording && !countIn ? glow : undefined} led={recording || countIn ? "var(--led-red)" : null} ariaPressed={recording || countIn} onClick={rec} ariaLabel={recording || countIn ? "Stop recording" : "Record with a one bar count-in"}>
          <Icon name="rec" />
        </Key>
        <Key label={playing && !recording && !countIn ? "stop" : "play"} style={coach && goalMet && !playing ? glow : undefined} led={playing && !recording ? "var(--led-mint)" : null} onClick={play} ariaLabel={playing && !recording ? "Stop" : "Play the loop"}>
          <Icon name={playing && !recording && !countIn ? "stop" : "play"} />
        </Key>
        <Key label="undo" onClick={undoTap} onPointerDown={holdStart} onPointerUp={holdEnd} onPointerLeave={holdEnd} disabled={!history.current.length && !events.length} ariaLabel="Undo the last hit. Hold to clear everything"><Icon name="back" /></Key>
        {coach
          ? <Key label="click" onClick={() => setClick(c => !c)} ariaPressed={click} led={click ? "var(--led-go)" : null} ariaLabel={click ? "Metronome on, tap to turn off" : "Metronome off, tap to turn on"}><span style={{ fontSize: 13, fontWeight: 600 }}>{click ? "on" : "off"}</span></Key>
          : <Key label="snap" onClick={() => setSnap(s => SNAPS[(SNAPS.indexOf(s) + 1) % SNAPS.length])} ariaLabel={`Snap ${snap}, tap to change`}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{snap}</span>
        </Key>}
      </div>

      <Silk label={drumLike ? "pads" : type === "chords" ? "chord pads" : "keys"} right={drumLike ? "tap in time" : `only notes in ${keyName}`} />
      <div className={`ls-tray ${drumLike || type === "chords" ? "is-pads" : "is-keys"}`} style={drumLike && pads.length !== 8 ? { gridTemplateColumns: `repeat(${pads.length}, minmax(0, 1fr))` } : undefined}>
        {pads.map((p, i) => {
          const on = held.has(i) || p.notes.some(n => lit[n]);
          const target = !!coach && !goalMet && goalNote !== undefined && p.notes[0] === goalNote;
          const isRoot = !drumLike && (i === 0 || i === 7);
          return (
            <button key={i} type="button" className={`ls-key ${on ? "is-on" : ""} ${isRoot ? "is-root" : ""}`} style={{ ["--c" as string]: color, ...(target ? { outline: `2px solid ${color}`, outlineOffset: -2 } : null) } as CSSProperties}
              aria-label={`${p.label}${drumLike ? "" : ` (${p.notes.length > 1 ? "chord" : "note"})`}`}
              onPointerDown={e => down(i, e)} onPointerUp={e => up(i, e)} onPointerCancel={e => up(i, e)} onPointerLeave={e => { if (e.buttons) up(i, e); }}
              onContextMenu={e => e.preventDefault()}>
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      </div>
      {coach && <div className="fl-text">
        <>
          <Silk label="your turn" right={goalMet ? "goal reached" : `${Math.min(goalHits, coach.goal.notes)} of ${coach.goal.notes} ${coach.goal.note ?? "notes"}`} />
          <div className={`ls-now ${nudge ? "is-nudge" : ""}`} role="status"><span className="ls-led" style={{ ["--c" as string]: "var(--led-go)" } as CSSProperties} />{nowLine}</div>
          {coach.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
          {coach.hint && !goalMet ? <div className="ls-hint"><Gloss>{coach.hint}</Gloss></div> : null}
          {coach.tail}
        </>
      </div>}
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label="skip" onClick={() => { engine.stop(); onSkip(); }} ariaLabel="Skip this step"><Icon name="back" className="ls-flip" /></Key>
          <GoPill onClick={use} disabled={coach ? false : !events.length} style={{ gridColumn: "span 3", ...(coach && !goalMet ? { opacity: 0.55 } : null) }} ariaLabel="Use this line">{coach ? "keep it" : "use this line"}</GoPill>
        </div>
      </div>
    </div>
  );
}
