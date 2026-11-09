"use client";
/**
 * Try it: play the lesson's line on the real engine, over your own track.
 * rec counts in one bar, then records; play stops recording and loops the take; rec
 * again adds on top; undo takes back the last take; "use this line" keeps it for the
 * end of the lesson, where it joins your track when you press add.
 */
import { MAX_DEVICE_MS, beatsToMs, slotStart, msToBeats, readLatencyMs, saveLatencyMs, steadyDelay } from "@/lib/latency";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { FLAG, OUT, type EngineEvent } from "@/engine";
import { pressNote, releaseNote, overdub, type Held } from "@/lib/recorder";
import { practiceTrack, playPads, type Take } from "@/lib/lessonTake";
import { newLayerV2, readTrackV2, TYPE, type LayerType, type NoteEvent, type TrackV2 } from "@/lib/track2";
import { asScale, NOTE_NAMES, type Snap } from "@/lib/theory";
import { velocityAt } from "@/lib/touch";
import { briefChecks, type BriefCheck } from "@/lib/briefCheck";
import { GoPill, Icon, Key, PadRing, Screen, Silk } from "./controls";
import { useEngineTrack } from "./useEngineTrack";
import { Gloss } from "./Gloss";

const SNAPS: Snap[] = ["1/8", "1/16", "1/32", "off"];
/** How far from a beat a guided hit can land and still count, in beats (75 ms at 120 bpm). */
const TOL = 0.15;

/** What each brief check listens for, in a few words, before anything is played. */
const CHECK_WORD: Record<BriefCheck, string> = { key: "in key", pentatonic: "on the five pentatonic keys", kick: "out of the kick's way", backbeat: "on two and four", bar: "filling the bar", home: "ending home", moves: "moving between notes", chord: "on the chord's notes", roots: "on the chords' roots", short: "short notes", repeat: "a motif that comes back" };

const GOAL_NOTE: Record<string, number> = { kick: 36, snare: 38, clap: 39, hat: 42, "open hat": 46 };
export type Coach = { body: string; hint?: string; goal: { notes: number; note?: string; on?: "beat" | "and" | "backbeat" | "between" | "different"; check?: BriefCheck[] }; tail?: ReactNode; snap?: boolean };

export function TryIt({ type, title, initial, coach, onUse, onSkip }: {
  type: LayerType;
  title: string;
  /** From a lesson file: what to do, what counts as done, and a nudge. */
  coach?: Coach;
  initial?: NoteEvent[];
  onUse: (take: Take) => void;
  onSkip: () => void;
}) {
  // A part that needs a beat under it gets one, if your song has nothing in it yet.
  const pulse = useMemo(() => !!coach && !/kick/.test(coach.goal?.note ?? "") && !readTrackV2().layers.some(l => l.events.length), [coach]);
  const base = useMemo(() => {
    const p = practiceTrack(readTrackV2(), type);
    if (!pulse) return p;
    const kick = { ...newLayerV2("drums", "__backing"), events: Array.from({ length: p.track.loop }, (_, b) => ({ note: 36, vel: 0.85, start: b, len: 0.25 })) };
    return { track: { ...p.track, layers: [kick, ...p.track.layers] }, index: p.index + 1 };
  }, [type, pulse]);
  const [session, setSession] = useState<TrackV2>(() => {
    if (!initial?.length) return base.track;
    return { ...base.track, layers: base.track.layers.map((l, i) => (i === base.index ? { ...l, events: initial } : l)) };
  });
  const idx = base.index;
  const { engine, start, ready, started } = useEngineTrack(session);
  const [click, setClick] = useState(true);
  const [pos, setPos] = useState({ beat: 0, flags: 0 });
  // A guided play-in records exactly what you played: no snap until a lesson teaches it.
  const [snap, setSnap] = useState<Snap>(coach ? (coach.snap ? "1/8" : "off") : "1/16");
  const [nudge, setNudge] = useState(false);
  const [held, setHeld] = useState<Set<number>>(new Set());
  const [lit, setLit] = useState<Record<number, number>>({});
  // A ring flashes out of a pad on every hit, yours or the loop's: keyed per hit so it replays.
  const [rings, setRings] = useState<Record<number, { t: number; v: number }>>({});
  const ring = useCallback((pad: number, v: number) => { if (pad >= 0) setRings(r => ({ ...r, [pad]: { t: performance.now() + Math.random(), v } })); }, []);
  const history = useRef<NoteEvent[][]>([]);
  const latencyMs = useRef(0);
  useEffect(() => { latencyMs.current = readLatencyMs(); }, []);
  // How many takes ended with hits off the beat, and what the forgiving fixes said.
  const [misses, setMisses] = useState(0);
  const [fixNote, setFixNote] = useState<string | null>(null);
  const takeOpen = useRef(false);
  const recHeld = useRef<Held>(new Map());
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const pads = useMemo(() => playPads(type, session.root, asScale(session.scale)), [type, session.root, session.scale]);
  const padsRef = useRef(pads);
  padsRef.current = pads;
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
          ring(padsRef.current.findIndex(p => p.notes[0] === e.note), e.vel);
          continue;
        }
        const rec = !!(e.flags & FLAG.recording);
        const opts = { loop: t.loop, snap, strength: 1, swing: t.swing };
        if (e.kind === OUT.playedOn && rec) {
          pressNote(recHeld.current, "take", e.note, e.vel, e.beat, !!(e.flags & FLAG.countIn));
        } else if (e.kind === OUT.playedOff) {
          const raw = releaseNote(recHeld.current, "take", e.note, e.beat, opts);
          if (!raw) continue;
          // The device's known delay comes off every hit (src/lib/latency.ts).
          const lat = coach ? msToBeats(latencyMs.current, t.bpm || 120) : 0;
          const ev = lat ? { ...raw, start: (((raw.start - lat) % t.loop) + t.loop) % t.loop } : raw;
          // Every hit can be undone on its own.
          history.current.push(t.layers[idx]?.events ?? []);
          setEvents(cur => overdub(cur, ev, opts));
        }
      }
    });
  }, [engine, idx, snap, setEvents, ring]);

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
    engine.metronome(click && (coach ? (recording || countIn || playing) : !backing && (recording || countIn)));
  }, [engine, backing, recording, countIn, click, coach, playing]);

  // Nothing plays until you press rec or play: the step asks you to tap, so the tap starts it.

  useEffect(() => () => { engine.stop(); engine.metronome(false); }, [engine]);

  const down = (pad: number, e: PointerEvent<HTMLElement>) => {
    e.preventDefault();
    try { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); } catch { /* no active pointer (synthetic events) */ }
    start();
    const vel = velocityAt(e);
    for (const n of pads[pad].notes) engine.noteOn(idx, n, vel, e.timeStamp);
    setHeld(h => new Set(h).add(pad));
    ring(pad, vel);
  };
  // Enter or Space plays a pad too, so a keyboard can do every play-in.
  const keyDown = (pad: number, e: KeyboardEvent<HTMLElement>) => {
    if ((e.key !== "Enter" && e.key !== " ") || e.repeat) return;
    e.preventDefault();
    start();
    for (const n of pads[pad].notes) engine.noteOn(idx, n, 0.85, e.timeStamp);
    setHeld(h => new Set(h).add(pad));
    ring(pad, 0.85);
  };
  const keyUp = (pad: number, e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    for (const n of pads[pad].notes) engine.noteOff(idx, n, e.timeStamp);
    setHeld(h => { const n = new Set(h); n.delete(pad); return n; });
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
    if (coach && !goalMet) {
      // Say what's missing and bring the rec key into view, glowing, rather than doing nothing.
      setNudge(true); window.setTimeout(() => setNudge(false), 1600);
      document.querySelector('[aria-label="Record with a one bar count-in"]')?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    engine.stop();
    // Hits that were close enough to their slot (the beat, or the "and" for open hats) are kept exactly on it;
    // a tune is kept on the nearest 16th, the grid its timing marks are drawn against.
    const wrap = (b: number) => ((b % loop) + loop) % loop;
    const kept = !coach ? events
      : onBeatOnly ? events.map(e => (goalNote !== undefined && e.note !== goalNote) || isOff(e) ? e : { ...e, start: slotStart(e.start, offbeat, loop) })
      : events.map(e => ({ ...e, start: wrap(Math.round(e.start * 4) / 4) }));
    onUse({ type, events: kept });
  };

  // ── the screen: a piano roll of the take ────────────────────────────────
  const loop = session.loop;
  const allNotes = pads.flatMap(p => p.notes);
  const lo = Math.min(...allNotes), hi = Math.max(...allNotes);
  const rows = drumLike ? pads.length : hi - lo + 1;
  const rowOf = (n: number) => (drumLike ? pads.findIndex(p => p.notes[0] === n) : hi - n);
  const Wd = 330, Hd = coach ? 154 : 128;
  const rollH = coach ? 128 : Hd;
  const rh = (coach ? 128 : Hd) / Math.max(1, rows);
  const beatW = Wd / loop;
  const head = playing ? (((pos.beat % loop) + loop) % loop) * beatW : -1;
  const color = TYPE[type].color;
  const notesCount = drumLike ? events.length : type === "chords" ? new Set(events.map(e => e.start.toFixed(3))).size : new Set(events.map(e => `${e.start}:${e.note}`)).size;
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
  // Where the hits must land: a clap or snare on two and four, an open hat on the "and", any other drum on the beat.
  const on = coach?.goal.on ?? (coach?.goal.note === "clap" || coach?.goal.note === "snare" ? "backbeat" : "beat");
  const offbeat = on === "and";
  const offOf = (e: NoteEvent) => (offbeat ? e.start - (Math.floor(e.start) + 0.5) : e.start - Math.round(e.start));
  const slotOf = (e: NoteEvent) => (((Math.round(offbeat ? e.start - 0.5 : e.start) % loop) + loop) % loop);
  // A clap or snare (backbeat) only counts on two and four.
  const backbeat = onBeatOnly && on === "backbeat";
  const isOff = (e: NoteEvent) => onBeatOnly && (goalNote === undefined || e.note === goalNote) && (Math.abs(offOf(e)) > TOL || (backbeat && slotOf(e) % 2 === 0));
  const offs = goalEvents.filter(isOff);
  const offBeat = onBeatOnly ? offs.length : 0;
  // A tune's goal in music terms: "between" counts only notes in the gaps between the kicks (off the beat),
  // "different" counts different chords (one chord may come back, as i in i iv v i), so the same pad four
  // times is one chord plus a return, not a progression.
  const between = !onBeatOnly && on === "between";
  const different = !onBeatOnly && on === "different";
  const onKick = (e: NoteEvent) => Math.abs(e.start - Math.round(e.start)) < 0.125;
  const kickHits = between ? new Set(goalEvents.filter(onKick).map(e => e.start.toFixed(3))).size : 0;
  const shapes = () => {
    const by = new Map<string, number[]>();
    for (const e of goalEvents) { const k = e.start.toFixed(3); by.set(k, [...(by.get(k) ?? []), e.note]); }
    return new Set([...by.values()].map(n => n.sort((a, b) => a - b).join(","))).size;
  };
  const presses = new Set(goalEvents.map(e => e.start.toFixed(3))).size;
  const goalHits = onBeatOnly
    ? new Set(goalEvents.filter(e => !isOff(e)).map(slotOf)).size
    : between ? new Set(goalEvents.filter(e => !onKick(e)).map(e => e.start.toFixed(3))).size
    : different ? Math.min(presses, shapes() + 1)
    // A chord is one press, not three notes: count when things start, not how many notes sound.
    : presses;
  const goalMet = !coach || (goalHits >= coach.goal.notes && offBeat === 0);
  // Write your own, checked: what can be heard in the notes, in words, once a take is down (never a gate).
  const heard = useMemo(() => (coach?.goal.check?.length && events.length ? briefChecks(coach.goal.check, events, { ...session, layers: session.layers.filter((_, i) => i !== idx) }, session.loop) : []), [coach, events, session, idx]);
  // When a take ends: a steady lateness is the device, so take it out; otherwise count it as a miss.
  const wasTake = useRef(false);
  useEffect(() => {
    const now = recording || countIn;
    if (wasTake.current && !now && coach && onBeatOnly && goalEvents.length) {
      // Only what's left of the device allowance can be learned, so a learned delay never grows into a 16th.
      const room = msToBeats(Math.max(0, MAX_DEVICE_MS - latencyMs.current), session.bpm || 120);
      const shift = backbeat ? 0 : steadyDelay(goalEvents.map(offOf), TOL, room);
      if (shift) {
        const bpm = session.bpm || 120;
        const ms = beatsToMs(shift, bpm);
        latencyMs.current += ms;
        saveLatencyMs(latencyMs.current);
        history.current.push(events);
        setEvents(cur => cur.map(e => ({ ...e, start: (((e.start - shift) % loop) + loop) % loop })));
        setFixNote(`every hit came in about ${Math.round(ms)} ms late, the same each time. that's your device, not you, so we took it out, now and for next time.`);
      } else if (offBeat) setMisses(m => m + 1);
    }
    wasTake.current = now;
  }, [recording, countIn]); // eslint-disable-line react-hooks/exhaustive-deps
  // After two takes with hits off the beat, offer to put them on it.
  const snapForMe = () => {
    history.current.push(events);
    const seen = new Set<number>();
    setEvents(cur => cur.flatMap(e => {
      if (goalNote !== undefined && e.note !== goalNote) return [e];
      let b = ((Math.round(e.start) % loop) + loop) % loop;
      if (backbeat && b % 2 === 0) b = (b + 1) % loop;
      if (seen.has(b)) return [];
      seen.add(b);
      return [{ ...e, start: b }];
    }));
    setFixNote("snapped onto the beat for you. next time try it with the click, but this counts.");
  };
  const keyName = `${NOTE_NAMES[((session.root % 12) + 12) % 12]} ${session.scale}`;
  // A verdict on every hit (Melodics, Yousician): green on time, amber close, red off, with how many ms.
  const msPerBeat = 60000 / session.bpm;
  const verdictOf = (e: NoteEvent): { ms: number; c: "on" | "close" | "off" } | null => {
    if (!coach || (goalNote !== undefined && e.note !== goalNote)) return null;
    const off = onBeatOnly ? offOf(e) : e.start - Math.round(e.start * 4) / 4;
    const ms = Math.round(off * msPerBeat);
    const bad = onBeatOnly ? isOff(e) : Math.abs(ms) > 90;
    return { ms, c: bad ? "off" : Math.abs(ms) <= 30 ? "on" : "close" };
  };
  const VERDICT_C = { on: "#3BE07A", close: "#F3C14F", off: "#FF4A5A" } as const;
  const lastHit = coach ? [...events].reverse().find(e => verdictOf(e)) : undefined;
  const lastV = lastHit ? verdictOf(lastHit) : null;
  const lateWord = (ms: number) => (Math.abs(ms) <= 4 ? "right on it" : `${Math.abs(ms)} ms ${ms < 0 ? "early" : "late"}`);
  // Three clean takes in a row (goal met, no red), then the loop offers to go faster.
  const [clean, setClean] = useState(0);
  const wasRec = useRef(false);
  useEffect(() => {
    if (wasRec.current && !recording && !countIn && coach) {
      const vs = events.map(verdictOf).filter(Boolean) as { c: string }[];
      setClean(n => (goalMet && vs.length && !vs.some(v => v.c === "off") ? n + 1 : 0));
    }
    wasRec.current = recording || countIn;
  }, [recording, countIn]); // eslint-disable-line react-hooks/exhaustive-deps
  const faster = () => {
    history.current.push(events);
    setSession(t => ({ ...t, bpm: t.bpm + 5, layers: t.layers.map((l, i) => (i === idx ? { ...l, events: [] } : l)) }));
    setClean(0);
  };

  // What you play on, and one of it, in this surface's words.
  const surface = drumLike ? "pads" : type === "chords" ? "chord pads" : "keys";
  const unit = drumLike ? "hit" : type === "chords" ? "chord" : "note";
  const hitName = coach?.goal.note ?? "kick";
  const shown = Math.min(goalHits, coach?.goal.notes ?? goalHits);
  const [more, setMore] = useState(false);
  const firstPara = coach ? coach.body.split(/\n+/)[0] : "";
  const sentences = firstPara.split(/(?<=[.?!])\s+/);
  const turnLead = sentences[0] ?? "";
  const turnRest = sentences.slice(1).join(" ");
  const hasMore = !!turnRest || (coach ? coach.body.split(/\n+/).length > 1 : false);
  const nowLine = !coach ? "" : countIn ? `count-in ${Math.max(1, Math.ceil(-pos.beat))}. listen, don't tap yet`
    : recording && goalMet ? `${shown} of ${coach.goal.notes}, that's the lot. press keep it, or keep playing`
    : recording && offBeat ? `recording. the red ${offBeat === 1 ? "one was" : "ones were"} off the beat. finish the bar, then undo ${offBeat === 1 ? "it" : "them"}`
    : recording ? (backbeat ? `recording. tap the ${hitName} on two and four` : offbeat ? `recording. tap the ${hitName} on every "and"` : onBeatOnly ? `recording. tap the ${hitName} on beat ${Math.floor(((pos.beat % loop) + loop) % loop) + 1}` : `recording. ${shown} of ${coach.goal.notes} ${unit}s so far`)
    : !events.length ? (backbeat ? `press rec. four clicks count you in, then tap the ${hitName} on two and four` : offbeat ? `press rec. four clicks count you in, then tap the ${hitName} between the kicks, on every "and"` : onBeatOnly ? `press rec. four clicks count you in, then tap the ${hitName} on the next four` : `press rec. four clicks count you in, then play any ${surface} you like`)
    : offBeat && backbeat && Math.abs(offOf(offs[0])) <= TOL ? `${offBeat === 1 ? `one ${hitName}` : `${offBeat} ${hitName}s`} landed on one or three. the ${hitName} goes on two and four. tap undo and try again`
    : offBeat && offbeat ? `${offBeat === 1 ? `one ${hitName}` : `${offBeat} ${hitName}s`} missed the "and", the red ${offBeat === 1 ? "one" : "ones"}. the ${hitName} goes halfway between the kicks. tap undo and try again`
    : offBeat ? `${offBeat === 1 ? `one ${hitName}` : `${offBeat} ${hitName}s`} came in ${offOf(offs[0]) < 0 ? "early" : "late"}, the red ${offBeat === 1 ? "one" : "ones"}. tap undo and play ${offBeat === 1 ? "it" : "them"} again with the click`
    : !goalMet && between && kickHits ? `${kickHits === 1 ? "one note lands" : `${kickHits} notes land`} on the kick. the bass goes in the gaps between the kicks: ${shown} of ${coach.goal.notes} there so far`
    : !goalMet && different && presses > goalHits ? `that's the same chord again. a progression moves: ${shapes()} different so far, try another pad`
    : !goalMet ? `${shown} of ${coach.goal.notes}${offbeat ? ' on the "and"' : backbeat ? " on two and four" : onBeatOnly ? " on the beat" : ` ${unit}s`}. press rec and add the rest`
    : !playing ? "nice. now press play to hear your loop"
    : "that is your loop. press keep it when you like it";
  const glow = { outline: "2px solid var(--led-mint)", outlineOffset: -2, borderRadius: 14 } as CSSProperties;
  // The go key names what is still missing until the take is ready.
  const need = coach ? Math.max(0, coach.goal.notes - goalHits) : 0;
  const noun = goalNote !== undefined ? hitName : unit;
  const goLabel = !coach ? "use this line" : goalMet ? "keep it" : offBeat ? "fix the red ones"
    : between ? `${need} more between the kicks` : different ? `${need} more different chord${need === 1 ? "" : "s"}` : `${need} more ${noun}${need === 1 ? "" : "s"}`;
  return (
    <div className={`ls-col ${coach ? "is-play" : ""}`}>
      {/* Phone: one live instruction above the instrument, so rec and the pads are on the first screen. */}
      {coach && <div className={`ls-now fl-nowtop ${nudge ? "is-nudge" : ""}`} aria-hidden><span className="ls-led" style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties} />{nowLine}</div>}
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
        <svg viewBox={`0 0 ${Wd} ${Hd}`} width="100%" style={{ display: "block", marginTop: 12 }} role="img" aria-label={`${notesCount} ${unit}s recorded`}>
          {coach && Array.from({ length: loop }, (_, i) => <text key={`b${i}`} x={i * beatW + 4} y={11} fontSize={10.5} fill="rgba(255,255,255,.55)">{i + 1}</text>)}
          {Array.from({ length: loop * 4 }, (_, i) => (
            <path key={i} d={`M${(i * Wd) / (loop * 4)} 0V${Hd}`} stroke={i % 4 === 0 ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.05)"} />
          ))}
          {Array.from({ length: rows + 1 }, (_, i) => <path key={`r${i}`} d={`M0 ${i * rh}H${Wd}`} stroke="rgba(255,255,255,.04)" />)}
          {coach && (() => { let lastX = -99; return events.map((e, i) => {
            const v = verdictOf(e);
            if (!v) return null;
            const st = e.start > loop - TOL ? e.start - loop : e.start;
            const x = Math.max(4, Math.min(Wd - 4, (st / loop) * Wd + 4));
            const c = VERDICT_C[v.c];
            return (
              <g key={`v${i}`} className="ti-verdict">
                <circle cx={x} cy={rollH + 6} r={3.5} fill={c} style={{ filter: `drop-shadow(0 0 3px ${c})` }} />
                {(v.c !== "on" || e === lastHit) && x - lastX > 34 && (lastX = x) ? <text x={x} y={rollH + 21} textAnchor="middle" fontSize={13} fontWeight={700} fill={c}>{v.ms > 0 ? "+" : ""}{v.ms}</text> : null}
              </g>
            );
          }); })()}
          {events.map((e, i) => {
            const r = rowOf(e.note);
            if (r < 0) return null;
            // A hit a hair before beat 1 belongs to beat 1, not the end of the bar.
            const st = e.start > loop - TOL ? e.start - loop : e.start;
            const x = Math.max(0, (st / loop) * Wd);
            const w = drumLike ? Math.max(6, beatW * 0.45) : Math.max(6, (e.len / loop) * Wd - 2);
            const c = isOff(e) ? "#FF4A5A" : color;
            return <rect key={i} x={x + 1} y={r * rh + 1.5} width={Math.min(w, Wd - x - 1)} height={Math.max(4, rh - 3)} rx={2} fill={c} style={{ filter: `drop-shadow(0 0 3px ${c})` }} />;
          })}
          {head >= 0 && <path d={`M${head} 0V${Hd}`} stroke={recording ? "#FF4A5A" : "#F3F2EF"} strokeWidth={1.5} />}
        </svg>
        <div className="ls-meta" style={{ marginTop: 10 }}>
          <span style={{ color }}>{notesCount ? `${notesCount} ${coach?.goal.note ? (notesCount === 1 ? coach.goal.note : `${coach.goal.note}s`) : `${unit}${notesCount === 1 ? "" : "s"}`}` : "nothing yet"}{lastV ? <span style={{ color: VERDICT_C[lastV.c] }}> · last {lateWord(lastV.ms)}</span> : null}</span>
          <span>{recording ? "press play to stop and hear it" : playing ? "press rec to add more on top" : backing ? "plays over your track" : "the click keeps time"}</span>
        </div>
      </Screen>
      {fixNote ? <div className="ls-hint fl-fix" role="status">{fixNote}</div> : null}
      {coach && onBeatOnly && offBeat > 0 && misses >= 2 && !recording && !countIn ? <button type="button" className="ls-chip fl-snapme" onClick={snapForMe}>snap it for me</button> : null}
      <Silk label="transport" right={coach ? "undo takes back a hit · hold to clear" : "rec records · play loops it"} />
      <div className="m1-g">
        <Key label="rec" style={coach && ((!events.length && !recording && !countIn) || (nudge && !goalMet)) ? glow : undefined} led={recording || countIn ? "var(--led-red)" : null} ariaPressed={recording || countIn} onClick={rec} ariaLabel={recording || countIn ? "Stop recording" : "Record with a one bar count-in"}>
          <Icon name="rec" />
        </Key>
        <Key label={playing && !recording && !countIn ? "stop" : "play"} style={coach && goalMet && !playing ? glow : undefined} led={playing && !recording ? "var(--led-mint)" : null} onClick={play} ariaLabel={playing && !recording ? "Stop" : "Play the loop"}>
          <Icon name={playing && !recording && !countIn ? "stop" : "play"} />
        </Key>
        <Key label="undo" onClick={undoTap} onPointerDown={holdStart} onPointerUp={holdEnd} onPointerLeave={holdEnd} disabled={!history.current.length && !events.length} ariaLabel="Undo the last hit. Hold to clear everything"><Icon name="back" /></Key>
        {coach && !coach.snap
          ? <Key label="click" onClick={() => setClick(c => !c)} ariaPressed={click} led={click ? "var(--led-mint)" : null} ariaLabel={click ? "Metronome on, tap to turn off" : "Metronome off, tap to turn on"}><span style={{ fontSize: 13, fontWeight: 600 }}>{click ? "on" : "off"}</span></Key>
          : <Key label="snap" style={coach?.snap ? glow : undefined} onClick={() => setSnap(s => SNAPS[(SNAPS.indexOf(s) + 1) % SNAPS.length])} ariaLabel={`Snap ${snap}, tap to change`}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{snap}</span>
        </Key>}
      </div>

      <Silk label={drumLike ? "pads" : type === "chords" ? "chord pads" : "keys"} right={drumLike ? "tap in time" : `only notes in ${keyName}`} />
      <div className={`ls-tray ${drumLike || type === "chords" ? "is-pads" : "is-keys"}`} style={drumLike && pads.length !== 8 ? { gridTemplateColumns: `repeat(${pads.length}, minmax(0, 1fr))` } : undefined}>
        {pads.map((p, i) => {
          const hasTarget = !!coach && !goalMet && goalNote !== undefined && pads.some(q => q.notes[0] === goalNote);
          const on = held.has(i) || p.notes.some(n => lit[n]);
          const target = !!coach && !goalMet && goalNote !== undefined && p.notes[0] === goalNote;
          const isRoot = !drumLike && (i === 0 || i === 7);
          return (
            <button key={i} type="button" className={`ls-key ${on ? "is-on" : ""} ${isRoot ? "is-root" : ""} ${hasTarget && !target && !on ? "is-unlit" : ""}`} style={{ ["--c" as string]: color, ...(target ? { outline: `2px solid ${color}`, outlineOffset: -2 } : null) } as CSSProperties}
              aria-label={`${p.label}${drumLike ? "" : ` (${p.notes.length > 1 ? "chord" : "note"})`}`}
              onPointerDown={e => down(i, e)} onPointerUp={e => up(i, e)} onPointerCancel={e => up(i, e)} onPointerLeave={e => { if (e.buttons) up(i, e); }}
              onKeyDown={e => keyDown(i, e)} onKeyUp={e => keyUp(i, e)}
              onContextMenu={e => e.preventDefault()}>
              {drumLike || type === "chords" ? <i className="pad-vel" /> : null}
              <span>{p.label}</span>
              {rings[i] ? <PadRing key={rings[i].t} v={rings[i].v} /> : null}
            </button>
          );
        })}
      </div>

      </div>
      {coach && <div className="fl-text">
        <>
          <div className="fl-turn">
            <div className="fl-turnhead"><span>your turn</span><span>{goalMet ? "done" : `${Math.min(goalHits, coach.goal.notes)} of ${coach.goal.notes}`}</span></div>
            {clean > 0 && clean < 3 ? <p className="ti-clean" role="status">{clean} clean take{clean > 1 ? "s" : ""} in a row{clean < 3 ? `. ${3 - clean} more and you can go faster` : ""}</p> : null}
            {clean >= 3 ? <p className="ti-clean" role="status">three clean takes. <button type="button" className="ls-chip" onClick={faster}>faster · {session.bpm + 5} bpm</button></p> : null}
            {/* the instruction is already on the screen above (nowLine); here only the goal, the rest on request (design pass 2) */}
            <p className="fl-turnwhy"><Gloss>{turnLead}</Gloss></p>
            {hasMore ? <button type="button" className="ls-chip ti-more" aria-expanded={more} onClick={() => setMore(m => !m)}>{more ? "less" : "the details"}</button> : null}
          </div>
          <div className={`ls-now ${nudge ? "is-nudge" : ""}`} role="status"><span className="ls-led" style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties} />{nowLine}</div>
          {more ? <>
            {turnRest ? <p className="ls-read"><Gloss>{turnRest}</Gloss></p> : null}
            {coach.body.split(/\n+/).slice(1).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
          </> : null}
          {heard.length && !recording && !countIn ? (
            <div className="ti-heard" role="status" aria-label="What it heard in your notes">
              <div className="fl-turnhead"><span>what it heard</span><span>{heard.filter(h => h.ok).length} of {heard.length}</span></div>
              <ul>{heard.map(h => <li key={h.id} className={h.ok ? "is-ok" : "is-note"}><b aria-hidden>{h.ok ? "✓" : "→"}</b><span>{h.say}</span></li>)}</ul>
            </div>
          ) : coach.goal.check?.length && !events.length ? <div className="ls-hint">when you&apos;ve played it, this says what it heard: {coach.goal.check.map(c => CHECK_WORD[c]).join(", ")}. it&apos;s your part, so it never stops you.</div> : null}
          {coach.hint && !goalMet ? <div className="ls-hint"><Gloss>{coach.hint}</Gloss></div> : null}
          {pulse ? <div className="ls-hint">your song has no beat yet, so a kick plays along to help. it won&apos;t go into your song.</div> : null}
          {coach.tail}
        </>
      </div>}
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label="skip" onClick={() => { engine.stop(); onSkip(); }} ariaLabel="Skip this step"><Icon name="back" className="ls-flip" /></Key>
          <GoPill onClick={use} disabled={coach ? false : !events.length} style={{ gridColumn: "span 3", ...(coach && !goalMet ? { opacity: 0.55 } : null) }} ariaLabel={coach && !goalMet ? `Not ready: ${goLabel}` : "Use this line"}>{goLabel}</GoPill>
        </div>
      </div>
    </div>
  );
}
