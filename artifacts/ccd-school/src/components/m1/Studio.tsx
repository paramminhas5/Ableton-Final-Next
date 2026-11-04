"use client";
/**
 * Studio (canvas "Model 1 · final"). Two modes: play and mix. Mix lives in Mix.tsx.
 *
 * Play mode (studio · drums, pads and studio · bass, keys):
 * Pick a layer, pick how to play it (steps, keys, pads, or the layer's own surface),
 * play, then shape it with one knob bank (sound, eq, fx, mix) plus mute and solo.
 * Rec counts in one bar, play loops what you played, rec again adds on top.
 * Everything runs on the CCD engine (WebAssembly in the browser, native in the app).
 */
import "./studio.css";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import {
  display,
  DRUM_PAD_NAMES,
  DRUM_PAD_NOTES,
  DRUM_PAD_PARAMS,
  DRUM_RACK_PARAMS,
  FX_NAMES,
  FX_NOTE_BASE,
  SAMPLER_NOTE_BASE,
  FLAG,
  INSTRUMENT_BASE,
  LAYER_PARAMS,
  OUT,
  type EngineEvent,
  type ParamSpec,
} from "@/engine";
import { pressNote, releaseNote, overdub, toggleStep, type Held } from "@/lib/recorder";
import { velocity } from "@/lib/touch";
import { keyRow, noteName, padGrid, pitchClass, SNAP_BEATS, stepOf, type ScaleName, type Snap } from "@/lib/theory";
import { decodeFile, dropSample, putSample, SLOTS } from "@/lib/samples";
import { applyPreset, PRESETS } from "@/lib/presets";
import { deleteSong, duplicateSong, newSong, readSongs, renameSong, switchSong, type SongIndex } from "@/lib/songs";
import {
  barsOf,
  DRUM_LANES,
  gridOf,
  INSTRUMENT_TABLES,
  LAYER_ORDER,
  MAX_LAYERS,
  newLayerV2,
  paramOf,
  TYPE,
  useTrackV2,
  type Bank,
  type LayerV2,
  type Surface,
  hasTrackV2,
  effectivePad,
  type TrackV2,
} from "@/lib/track2";
import { downloadTrackV2Midi } from "@/lib/track2-midi";
import { starterTrack } from "@/lib/starter";
import { CAP, Icon, Key, Knob, Screen, Silk } from "./controls";
import { Mix } from "./Mix";
import { ChordSurface, CircleSurface, GlideSurface, RollsSurface, RiserSurface, XYSurface, bassRoot, scaleOf, ROLLS, type SurfaceCtx } from "./Surfaces";
import { useEngineTrack } from "./useEngineTrack";

const BANKS: Bank[] = ["sound", "eq", "fx", "mix"];
const KNOB_CAPS = [null, CAP.grey, CAP.navy, CAP.grey] as const;
const SNAPS: Snap[] = ["1/8", "1/16", "1/32", "off"];
const DRUM_KEY_LABELS = ["kick", "snare", "clap", "rim", "hat", "open", "shaker", "ride"];
const MUTE_C = "#F3C14F";
const SOLO_C = "#7D96FF";
const DUCK_IDX = LAYER_PARAMS.find(p => p.id === "mix.duck")!.index;

type Touched = { label: string; text: string } | null;
type Mode = "play" | "mix";
const NOTE_NAMES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];


/** The knobs for this bank: four specs and their wire indices. `shift` is the second page of the sound bank. */
function bankKnobs(l: LayerV2, bank: Bank, shift = false): { spec: ParamSpec; index: number }[] {
  if (bank !== "sound") return LAYER_PARAMS.filter(p => p.bank === bank).slice(0, 4).map(spec => ({ spec, index: spec.index }));
  const engine = TYPE[l.type].engine;
  if (engine === "drums") {
    if (shift) return DRUM_RACK_PARAMS.map(spec => ({ spec, index: spec.index }));
    return DRUM_PAD_PARAMS.map((spec, k) => ({ spec, index: INSTRUMENT_BASE + effectivePad(l) * DRUM_PAD_PARAMS.length + k }));
  }
  const table = (INSTRUMENT_TABLES[engine] ?? []) as unknown as ParamSpec[];
  return table.filter(p => p.bank === (shift ? "shift" : "sound")).map(spec => ({ spec, index: spec.index }));
}

export function Studio() {
  const { track, update, undo, canUndo } = useTrackV2();
  const { engine, start } = useEngineTrack(track);
  const [selId, setSelId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("play");
  const [bank, setBank] = useState<Bank>("sound");
  const [touched, setTouched] = useState<Touched>(null);
  const [adding, setAdding] = useState(false);
  const [songsOpen, setSongsOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [sureReset, setSureReset] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongIndex | null>(null);
  const [shift, setShift] = useState(false);
  const [rate, setRate] = useState(1);
  const [page, setPage] = useState(0);
  const [snap, setSnap] = useState<Snap>("1/16");
  const [pos, setPos] = useState<{ beat: number; flags: number }>({ beat: 0, flags: 0 });
  const [hits, setHits] = useState<Record<string, number>>({});
  const [held, setHeldUi] = useState<Set<number>>(new Set());
  const lastNote = useRef(33);
  const recHeld = useRef<Held>(new Map());
  const takeOpen = useRef(false);
  const lastParamEdit = useRef(0);
  const trackRef = useRef(track);
  trackRef.current = track;

  useEffect(() => {
    if (!selId && track.layers.length) setSelId((track.layers.find(l => l.type === "drums") ?? track.layers[0]).id);
  }, [track.layers, selId]);

  useEffect(() => setSongs(readSongs()), []);

  // First visit ever: a loop is already in the track, and it plays on the first touch.
  const autoplay = useRef(false);
  useEffect(() => {
    try {
      if (hasTrackV2() || localStorage.getItem("ccd.studio.seeded")) return;
      localStorage.setItem("ccd.studio.seeded", "1");
    } catch {
      return;
    }
    update(() => starterTrack(), false);
    // Named for what it is, so "my track" never claims a loop you didn't make.
    try { const i = readSongs(); setSongs(renameSong(i.active, "starter loop")); window.dispatchEvent(new Event("ccd:song")); } catch { /* ignore */ }
    autoplay.current = true;
    setTouched({ label: "your loop", text: "tap a pad" });
  }, [update]);
  // The step grid belongs to the song; the snap tag follows it (unless snap is off).
  const grid = gridOf(track);
  useEffect(() => {
    setSnap(s => (s === "off" || SNAP_BEATS[s] === grid ? s : (SNAPS.find(x => SNAP_BEATS[x] === grid) ?? s)));
  }, [grid]);
  const bars = barsOf(track);

  const sel = track.layers.find(l => l.id === selId) ?? null;
  const selIndex = sel ? track.layers.indexOf(sel) : -1;
  const type = sel ? TYPE[sel.type] : null;
  const drumLike = sel ? TYPE[sel.type].engine === "drums" : false;
  const playing = !!(pos.flags & FLAG.playing);
  const countIn = !!(pos.flags & FLAG.countIn);
  const recording = !!(pos.flags & FLAG.recording);

  const patchSel = useCallback(
    (fn: (l: LayerV2) => LayerV2, undoable = true) => {
      if (!selId) return;
      update(t => ({ ...t, layers: t.layers.map(l => (l.id === selId ? fn(l) : l)) }), undoable);
    },
    [selId, update],
  );

  // ── engine events: recording, the playhead, lights ───────────────────────
  const flash = useCallback((key: string) => {
    setHits(h => ({ ...h, [key]: Date.now() }));
    setTimeout(() => setHits(h => {
      const n = { ...h };
      if (Date.now() - (n[key] ?? 0) >= 200) delete n[key];
      return n;
    }), 220);
  }, []);

  useEffect(() => {
    return engine.on((evs: EngineEvent[]) => {
      const t = trackRef.current;
      for (const e of evs) {
        if (e.kind === OUT.pos) {
          setPos(p => (p.beat === e.beat && p.flags === e.flags ? p : { beat: e.beat, flags: e.flags }));
          continue;
        }
        const layer = t.layers[e.layer];
        if (!layer) continue;
        if (e.kind === OUT.seqOn) {
          flash(`${layer.id}:${e.note}`);
          continue;
        }
        if (e.kind === OUT.playedOn && e.flags & FLAG.repeat) flash(`${layer.id}:${e.note}`);
        const rec = !!(e.flags & FLAG.recording);
        if (e.kind === OUT.playedOn && rec && e.flags & FLAG.repeat) {
          // A roll hit has no note off: it is a short hit on the beat it landed.
          if (pressNote(recHeld.current, layer.id, e.note, e.vel, e.beat, !!(e.flags & FLAG.countIn))) {
            const ev = releaseNote(recHeld.current, layer.id, e.note, e.beat + 0.1, { loop: t.loop, snap, strength: 1, swing: t.swing });
            if (ev) {
              const first = !takeOpen.current;
              takeOpen.current = true;
              update(tr => ({ ...tr, layers: tr.layers.map(l => (l.id === layer.id ? { ...l, events: overdub(l.events, ev, { loop: tr.loop, snap, strength: 1, swing: tr.swing }) } : l)) }), first);
            }
          }
        } else if (e.kind === OUT.playedOn && rec) {
          pressNote(recHeld.current, layer.id, e.note, e.vel, e.beat, !!(e.flags & FLAG.countIn));
        } else if (e.kind === OUT.playedOff) {
          const ev = releaseNote(recHeld.current, layer.id, e.note, e.beat, { loop: t.loop, snap, strength: 1, swing: t.swing });
          if (!ev) continue;
          // One take is one undo step.
          const first = !takeOpen.current;
          takeOpen.current = true;
          update(tr => ({ ...tr, layers: tr.layers.map(l => (l.id === layer.id ? { ...l, events: overdub(l.events, ev, { loop: tr.loop, snap, strength: 1, swing: tr.swing }) } : l)) }), first);
        }
      }
    });
  }, [engine, flash, snap, update]);

  useEffect(() => {
    if (!recording && !countIn) takeOpen.current = false;
  }, [recording, countIn]);

  // ── playing ───────────────────────────────────────────────────────────────
  const down = (note: number, e: PointerEvent<HTMLElement>) => {
    if (selIndex < 0 || !sel) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    start();
    const vel = velocity(e);
    engine.noteOn(selIndex, note, vel, e.timeStamp);
    if (!drumLike) lastNote.current = note;
    setHeldUi(h => new Set(h).add(note));
    flash(`${sel.id}:${note}`);
    if (drumLike) {
      const pad = DRUM_PAD_NOTES.indexOf(note as (typeof DRUM_PAD_NOTES)[number]);
      if (pad >= 0 && pad !== effectivePad(sel)) patchSel(l => ({ ...l, pad }), false);
    }
  };
  const up = (note: number, e: PointerEvent<HTMLElement>) => {
    if (selIndex < 0) return;
    engine.noteOff(selIndex, note, e.timeStamp);
    setHeldUi(h => {
      const n = new Set(h);
      n.delete(note);
      return n;
    });
  };
  const noteHandlers = (note: number) => ({
    onPointerDown: (e: PointerEvent<HTMLElement>) => down(note, e),
    onPointerUp: (e: PointerEvent<HTMLElement>) => up(note, e),
    onPointerCancel: (e: PointerEvent<HTMLElement>) => up(note, e),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  const transportPlay = () => {
    start();
    if (recording || countIn) engine.play(); // stop recording, keep looping
    else if (playing) engine.stop();
    else engine.play();
  };
  const transportRec = () => {
    start();
    if (recording || countIn) engine.recordOff();
    else {
      takeOpen.current = false;
      engine.record(4);
    }
  };

  // ── shaping ───────────────────────────────────────────────────────────────
  const knobs = sel ? bankKnobs(sel, bank, shift) : [];
  const setParam = (index: number, spec: ParamSpec, v: number) => {
    start(); // a knob turned before any tap must still be heard
    const now = Date.now();
    const undoable = now - lastParamEdit.current > 800; // one drag is one undo step
    lastParamEdit.current = now;
    patchSel(l => {
      const next = { ...l, params: { ...l.params, [index]: v } };
      // Turning duck up with nowhere to duck from: duck under the drums' kick.
      if (index === DUCK_IDX && v > 0 && !l.duck.src) {
        const drums = trackRef.current.layers.find(x => x.type === "drums" && x.id !== l.id);
        if (drums) next.duck = { src: drums.id, note: 36 };
      }
      return next;
    }, undoable);
    setTouched({ label: spec.label, text: display(spec, v) });
  };

  const addLayer = (t: LayerV2["type"]) => {
    if (track.layers.length >= MAX_LAYERS) return;
    const l = newLayerV2(t, "studio");
    update(tr => ({ ...tr, layers: [...tr.layers, l] }));
    setSelId(l.id);
    setAdding(false);
  };
  const removeSel = () => {
    if (!sel) return;
    update(tr => ({ ...tr, layers: tr.layers.filter(l => l.id !== sel.id).map(l => (l.duck.src === sel.id ? { ...l, duck: { src: null, note: null } } : l)) }));
    setSelId(null);
    setAdding(false);
  };

  // ── screen text ───────────────────────────────────────────────────────────
  const totalSteps = Math.round(track.loop / grid);
  const playStep = playing ? stepOf(pos.beat, totalSteps, track.loop) : -1;
  const laneLike = drumLike || sel?.type === "fx" || sel?.type === "sample";
  const stepPages = Math.max(1, Math.ceil(totalSteps / (laneLike ? 8 : 16)));
  const pageNow = Math.min(page, stepPages - 1);
  const status = countIn
    ? `count in ${Math.max(1, Math.ceil(-pos.beat))}`
    : recording
      ? `rec · ${(Math.floor(pos.beat) + 1)}.${Math.floor((pos.beat % 1) * 4) + 1}`
      : playing
        ? `${Math.floor(pos.beat) + 1}.${Math.floor((pos.beat % 1) * 4) + 1}`
        : `${track.bpm} bpm`;
  const ownHint: Record<string, string> = {
    glide: "slide your finger, the note bends",
    circle: "hits spread evenly round the bar",
    "chord pads": `one pad, one chord, always in ${NOTE_NAMES[track.root % 12]} ${track.scale}`,
    xy: "slide across for the note, up to open the filter",
    rolls: "hold a pad, slide the strip to change the roll",
    riser: "push up over the bars before the drop",
    load: "tap a slot to load a sound from your phone or computer",
  };
  const hint = useMemo(() => {
    if (!sel) return "";
    const s = sel.surface;
    if (s === "own") return ownHint[type?.own ?? ""] ?? "";
    if (drumLike) {
      if (s === "pads") return `16 sounds · ${DRUM_PAD_NAMES[effectivePad(sel)]} selected`;
      if (s === "keys") return "one sound per key";
      if (s === "steps") return `a lane per sound · steps ${pageNow * 8 + 1} to ${pageNow * 8 + 8}`;
    } else if (sel.type === "sample") {
      if (s === "pads") return "16 slots · load sounds under load";
      if (s === "keys") return "slot 1 played as a keyboard · pick the keys sound";
      if (s === "steps") return "a lane per slot · load sounds under load";
    } else {
      if (s === "pads") return `only notes in a minor · lit pads are a`;
      if (s === "keys") return "hold one key, play another to glide";
      if (s === "steps") return `${sel.events.length} steps on · tap to switch a step`;
    }
    return "";
  }, [sel, drumLike, pageNow, type, track.root, track.scale]);
  const duckSrc = sel?.duck.src ? track.layers.find(l => l.id === sel.duck.src) : null;
  const ducking = !!sel && !!duckSrc && paramOf(sel, DUCK_IDX) > 0;
  // With nothing touched, the screen shows the knob that matters most in this bank.
  const shown = useMemo(() => {
    if (touched) return touched;
    if (!sel) return null;
    const ks = bankKnobs(sel, bank, shift);
    const pick = bank === "sound" ? ks[drumLike ? 1 : 0] : bank === "mix" ? ks[ducking ? 3 : 0] : ks[0];
    return pick ? { label: pick.spec.label, text: display(pick.spec, paramOf(sel, pick.index)) } : null;
  }, [touched, sel, bank, shift, drumLike, ducking]);
  const live = countIn || recording || playing;

  const unlock = () => {
    start();
    if (autoplay.current) {
      autoplay.current = false;
      engine.play();
    }
  };

  /** What the fourth surfaces play through: the same engine and the same recorder as the keys and pads. */
  const ctx: SurfaceCtx | null = sel && type
    ? {
        layer: sel,
        index: selIndex,
        engine,
        track,
        color: type.color,
        play: (note, vel, at) => {
          start();
          engine.noteOn(selIndex, note, vel, at);
          lastNote.current = note;
          setHeldUi(h => new Set(h).add(note));
          flash(`${sel.id}:${note}`);
        },
        stop: (note, at) => {
          engine.noteOff(selIndex, note, at);
          setHeldUi(h => {
            const n = new Set(h);
            n.delete(note);
            return n;
          });
        },
        setLayer: patchSel,
        say: (label, text) => setTouched({ label, text }),
        hits,
      }
    : null;
  const chooseSurface = (sf: Surface) => {
    patchSel(l => ({ ...l, surface: sf }), false);
    setTouched(null);
    setShift(false);
  };
  const setBars = (n: number) => {
    update(t => ({ ...t, loop: n * 4 }));
    setPage(0);
  };
  const cycleSnap = () => {
    const next = SNAPS[(SNAPS.indexOf(snap) + 1) % SNAPS.length];
    setSnap(next);
    if (next !== "off") update(t => ({ ...t, grid: SNAP_BEATS[next] }), false);
    setPage(0);
  };
  const refreshSongs = (i: SongIndex) => {
    setSongs(i);
    setSelId(null);
    setPage(0);
    setTouched(null);
  };
  const songName = songs?.songs.find(x => x.id === songs.active)?.name ?? "my track";

  return (
    <div className="st-root" onPointerDownCapture={unlock}>
      <div className="st-body">
        <div className="st-head" style={{ gap: 8 }}>
          <Link href="/dashboard" aria-label="Back" style={{ color: "var(--ink)", display: "flex", minHeight: 0, minWidth: 0 }}>
            <Icon name="back" />
          </Link>
          <div className="st-mode" style={{ width: 122 }} role="radiogroup" aria-label="Studio mode">
            {(["play", "mix"] as Mode[]).map(m => (
              <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => { setMode(m); setAdding(false); setTouched(null); }}>{m}</button>
            ))}
          </div>
          <span style={{ flex: 1 }} />
          <button type="button" className="st-tag" style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", lineHeight: "16px" }}
            aria-label={`Songs, now ${songName}`} aria-pressed={songsOpen} onClick={() => { setMode("play"); setResetOpen(false); setSongsOpen(o => !o); setAdding(false); }}>{songName}</button>
          <button type="button" className="st-tag" onClick={() => update(t => ({ ...t, bpm: t.bpm >= 140 ? 90 : t.bpm + 5 }))} aria-label={`Tempo ${track.bpm} bpm, tap to change`}>{track.bpm} bpm</button>
          {mode === "mix" ? (
            <span className="st-tag" style={{ cursor: "default" }}>{NOTE_NAMES[track.root % 12]} {track.scale}</span>
          ) : (
            <button type="button" className="st-tag" onClick={cycleSnap} aria-label={`Steps and snap ${snap}, tap to change`}>{snap}</button>
          )}
        </div>

        {/* Only the layers that exist, then one plus. No empty slots, so the row stays big. */}
        <div className="st-slots" style={{ gridTemplateColumns: `${track.layers.length ? `repeat(${track.layers.length}, minmax(0,1fr))` : ""}${track.layers.length < MAX_LAYERS ? " 50px" : ""}` }}>
          {track.layers.map(l => {
            const on = l.id === selId;
            const c = TYPE[l.type].color;
            return (
              <button key={l.id} type="button" className={`m1-m is-wide st-slot ${on ? "is-on" : ""} ${l.mute ? "is-muted" : ""}`} aria-pressed={on}
                onClick={() => { setSelId(l.id); setTouched(null); setAdding(false); setSongsOpen(false); setShift(false); }}>
                <span className={`m1-dash ${on ? "is-on" : ""}`} style={{ ["--c" as string]: c } as CSSProperties} />
                {TYPE[l.type].label}
                {l.solo ? <i className="st-solo" /> : null}
              </button>
            );
          })}
          {track.layers.length < MAX_LAYERS ? (
            <button type="button" className={`m1-m is-wide st-slot st-plus ${adding ? "is-on" : ""}`} aria-label="Add a layer" aria-pressed={adding}
              onClick={() => { setMode("play"); setSongsOpen(false); setAdding(a => (mode === "mix" ? true : !a)); }}>
              <Icon name="plus" />
            </button>
          ) : null}
        </div>

        {mode === "mix" ? (
          <div className="st-mixwrap"><Mix track={track} engine={engine} selId={selId} onSelect={setSelId} update={update} playing={playing} /></div>
        ) : (
        <>
        <Screen className="st-scr" height={96}>
          {sel && type ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                    <span className="st-big" style={{ fontSize: 28, color: type.color }}>{type.label}</span>
                    {ducking && duckSrc ? (
                      <><span className="st-ss">ducks under</span><span className="st-chip" style={{ color: TYPE[duckSrc.type].color }}>{TYPE[duckSrc.type].label}{sel.duck.note === 36 ? " · kick" : ""}</span></>
                    ) : null}
                  </div>
                  {bank === "mix" && ducking && duckSrc && !live ? null : (
                    <div className="st-ss" style={{ marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {countIn ? `count in · ${Math.max(1, Math.ceil(-pos.beat))}` : recording ? `recording · ${status.replace("rec · ", "beat ")} · snap ${snap}` : playing ? `playing · beat ${status}` : hint}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", flex: "none" }}>
                  <div className="st-ss">{shown?.label ?? ""}</div>
                  <div className="st-big" style={{ fontSize: 28, marginTop: 2 }}>{shown?.text ?? ""}</div>
                </div>
              </div>
              {bank === "mix" && ducking && duckSrc && !live ? <DuckGraph track={track} layer={sel} src={duckSrc} /> : null}
            </>
          ) : (
            <>
              <div className="st-ss">studio</div>
              <div className="st-big" style={{ fontSize: 24, marginTop: 8 }}>no layers yet</div>
              <div className="st-ss" style={{ marginTop: 6 }}>finish a lesson to add one, or press +</div>
            </>
          )}
        </Screen>

        {resetOpen ? (
          <div className="st-main">
            <Silk label="start over" right="undo brings it back" />
            <div className="st-tray" style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "flex-start" }}>
              {([
                ["layer", sel ? `clear ${TYPE[sel.type].label ?? sel.type} notes` : "clear this layer", !!sel, (t: TrackV2) => ({ ...t, layers: t.layers.map(l => (l.id === sel?.id ? { ...l, events: [] } : l)) })],
                ["notes", "clear every layer's notes, keep the sounds", track.layers.length > 0, (t: TrackV2) => ({ ...t, layers: t.layers.map(l => ({ ...l, events: [] })) })],
                ["sounds", "reset every knob to its start, keep the notes", track.layers.length > 0, (t: TrackV2) => ({ ...t, layers: t.layers.map(l => ({ ...l, params: {}, mute: false, solo: false })) })],
                ["all", "empty song, start from nothing", track.layers.length > 0, (t: TrackV2) => ({ ...t, layers: [], added: [] })],
              ] as [string, string, boolean, (t: TrackV2) => TrackV2][]).map(([id, label, ok, fn]) => (
                <button key={id} type="button" className="st-sp st-song" style={{ width: "auto", flex: "none" }} disabled={!ok}
                  onClick={() => { if (sureReset === id) { update(fn); setSureReset(null); setResetOpen(false); } else setSureReset(id); }}>
                  {sureReset === id ? "tap again to confirm" : label}
                </button>
              ))}
            </div>
          </div>
        ) : songsOpen ? (
          <div className="st-main"><SongsPanel songs={songs} onChange={refreshSongs} /></div>
        ) : adding ? (
          <div className="st-main"><AddPanel track={track} sel={sel} onAdd={addLayer} onRemove={removeSel} /></div>
        ) : sel ? (
          <>
            <div className="st-main">
            <Silk label={`1 · play ${TYPE[sel.type].label} on`} right="pick how" />
            <div className="st-pick" style={{ gridTemplateColumns: `repeat(${TYPE[sel.type].surfaces.length + 1},1fr)` }}>
              {(TYPE[sel.type].surfaces).map(s => (
                <button key={s} type="button" className={`m1-m is-wide st-vk ${sel.surface === s ? "is-on" : ""}`} aria-pressed={sel.surface === s}
                  onClick={() => chooseSurface(s)}>
                  <span className={`m1-dot ${sel.surface === s ? "is-on" : ""}`} style={{ ["--c" as string]: "#F4F3F0" } as CSSProperties} />{s}
                </button>
              ))}
              <button type="button" className={`m1-m is-wide st-vk ${sel.surface === "own" ? "is-on" : ""}`} aria-pressed={sel.surface === "own"}
                onClick={() => {
                  chooseSurface("own");
                  if (sel.type === "hats") setTouched({ label: "rolling", text: ROLLS[rate].label });
                  if (sel.type === "chords") setTouched({ label: "key", text: `${NOTE_NAMES[track.root % 12]} ${track.scale}` });
                  if (sel.type === "fx") setTouched({ label: "build", text: "0/8" });
                }}>
                <span className={`m1-dot ${sel.surface === "own" ? "is-on" : ""}`} style={{ ["--c" as string]: TYPE[sel.type].color } as CSSProperties} />{TYPE[sel.type].own.replace("chord pads", "chords")}
              </button>
            </div>
            <div style={{ height: 8, flex: "none" }} />
            {sel.surface === "own" && ctx && sel.type === "bass" && <GlideSurface ctx={ctx} />}
            {sel.surface === "own" && ctx && sel.type === "drums" && <CircleSurface ctx={ctx} />}
            {sel.surface === "own" && ctx && sel.type === "chords" && <ChordSurface ctx={ctx} />}
            {sel.surface === "own" && ctx && sel.type === "lead" && <XYSurface ctx={ctx} />}
            {sel.surface === "own" && ctx && sel.type === "hats" && <RollsSurface ctx={ctx} rate={rate} setRate={setRate} />}
            {sel.surface === "own" && ctx && sel.type === "fx" && <RiserSurface ctx={ctx} />}
            {sel.surface === "own" && sel.type === "sample" && <SampleLoader layer={sel} onPatch={patchSel} onPreview={slot => { start(); engine.noteOn(selIndex, SAMPLER_NOTE_BASE + slot, 0.9); window.setTimeout(() => engine.noteOff(selIndex, SAMPLER_NOTE_BASE + slot), 600); }} />}
            {sel.surface === "pads" && sel.type === "sample" && <SamplePads layer={sel} hits={hits} noteHandlers={noteHandlers} />}
            {sel.surface === "pads" && drumLike && (
              <DrumPads layer={sel} hits={hits} noteHandlers={noteHandlers} />
            )}
            {sel.surface === "pads" && sel.type === "fx" && <FxPads layer={sel} hits={hits} noteHandlers={noteHandlers} />}
            {sel.surface === "pads" && !drumLike && sel.type !== "fx" && sel.type !== "sample" && (
              <ScalePads layer={sel} root={sel.type === "bass" ? bassRoot(track) : 45 + ((track.root % 12) - 9)} scale={scaleOf(track)} held={held} hits={hits} noteHandlers={noteHandlers} />
            )}
            {sel.surface === "keys" && sel.type !== "fx" && (
              <Keys drum={drumLike} held={held} hits={hits} layerId={sel.id} noteHandlers={noteHandlers} />
            )}
            {sel.surface === "steps" && laneLike && (
              <DrumSteps layer={sel} page={pageNow} pages={stepPages} setPage={setPage} playStep={playStep} grid={grid} bars={bars} setBars={setBars}
                onToggle={(note, step) => patchSel(l => ({ ...l, events: toggleStep(l.events, note, step, grid, Math.min(0.2, grid)) }))} />
            )}
            {sel.surface === "steps" && !laneLike && (
              <MelodicSteps layer={sel} page={pageNow} pages={stepPages} setPage={setPage} playStep={playStep} grid={grid} bars={bars} setBars={setBars}
                onToggle={step => patchSel(l => ({ ...l, events: toggleStep(l.events, l.events.some(e => Math.abs(e.start - step * grid) < grid / 2) ? null : lastNote.current, step, grid, grid) }))} />
            )}

            </div>
            <div className="st-side">
            <Silk label={`2 · shape ${TYPE[sel.type].label}`} right="after you play" />
            <div className="st-shape">
              <div className="st-bank" role="radiogroup" aria-label="Knob bank">
                {BANKS.map(b => (
                  <button key={b} type="button" role="radio" aria-checked={bank === b}
                    onClick={() => {
                      // Tap sound again for its second page.
                      setShift(b === "sound" && bank === "sound" ? !shift : false);
                      setBank(b);
                      setTouched(null);
                    }}>{b === "sound" && shift ? "sound 2" : b}</button>
                ))}
              </div>
              <button type="button" className={`st-sp st-ms ${sel.mute ? "is-lit" : ""}`} style={{ ["--c" as string]: MUTE_C } as CSSProperties}
                aria-pressed={sel.mute} aria-label="Mute" onClick={() => patchSel(l => ({ ...l, mute: !l.mute }))}>mute</button>
              <button type="button" className={`st-sp st-ms ${sel.solo ? "is-lit" : ""}`} style={{ ["--c" as string]: SOLO_C } as CSSProperties}
                aria-pressed={sel.solo} aria-label="Solo" onClick={() => patchSel(l => ({ ...l, solo: !l.solo }))}>solo</button>
            </div>
            {bank === "sound" && !shift ? (
              <div className="st-preset">
                <button type="button" aria-label="Previous sound" onClick={() => patchSel(l => applyPreset(l, (l.preset ?? 0) - 1))}>‹</button>
                <span>{PRESETS[sel.type][sel.preset ?? 0]?.name ?? "sound"}</span>
                <button type="button" aria-label="Next sound" onClick={() => patchSel(l => applyPreset(l, (l.preset ?? 0) + 1))}>›</button>
              </div>
            ) : null}
            <div className="m1-g st-knobs">
              {knobs.map(({ spec, index }, i) => (
                <Knob key={`${bank}${index}`} label={spec.label} size={32} color={KNOB_CAPS[i] ?? type!.color}
                  value={paramOf(sel, index)} defaultValue={spec.default}
                  onChange={v => setParam(index, spec, v)} />
              ))}
            </div>
            </div>
          </>
        ) : null}
        </>
        )}
      </div>

      <div className="m1-g st-transport">
        <button type="button" className="m1-m is-wide" aria-label={playing && !recording && !countIn ? "Stop" : "Play"} onClick={transportPlay}>
          <span className="m1-cap is-go is-pill" style={{ width: "88%", height: "56%", gap: 8, fontSize: 15, fontWeight: 500, marginTop: -12 }}>
            <Icon name={playing && !recording && !countIn ? "stop" : "play"} />{playing && !recording && !countIn ? "stop" : "play"}
          </span>
        </button>
        <Key label="rec" led={recording || countIn ? "var(--led-red)" : null} ariaPressed={recording || countIn} onClick={transportRec}
          ariaLabel={recording || countIn ? "Stop recording" : "Record with a one bar count-in"}>
          <Icon name="rec" />
        </Key>
        <Key label="undo" onClick={undo} disabled={!canUndo} ariaLabel="Undo">
          <svg className="m1-ico" viewBox="0 0 24 24" aria-hidden><path d="M9 7 4.5 11.5 9 16" /><path d="M5 11.5h9a5 5 0 0 1 0 10h-2" /></svg>
        </Key>
        <Key label="reset" onClick={() => { setMode("play"); setSongsOpen(false); setAdding(false); setSureReset(null); setResetOpen(o => !o); }} ariaPressed={resetOpen} ariaLabel="Reset: clear notes, sounds or the whole song">
          <Icon name="reset" />
        </Key>
        <Key label="to live" onClick={() => downloadTrackV2Midi(track)} disabled={!track.layers.length} ariaLabel="Export to Ableton Live as MIDI">
          <Icon name="out" />
        </Key>
      </div>
    </div>
  );
}

/** The kick's hits and how far this layer dips under each one (canvas: bass · duck). */
function DuckGraph({ track, layer, src }: { track: TrackV2; layer: LayerV2; src: LayerV2 }) {
  const amt = paramOf(layer, DUCK_IDX);
  const hits = src.events.filter(e => layer.duck.note === null || e.note === layer.duck.note).map(e => e.start / track.loop);
  const W = 322;
  const rel = (0.06 + amt * 0.22) / 3; // seconds, matches the engine's duck release
  const relBeats = (rel * track.bpm) / 60 / track.loop;
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 2) {
    const t = x / W;
    let since = Infinity;
    for (const h of hits) {
      const d = (t - h + 1) % 1;
      since = Math.min(since, d);
    }
    const dip = since === Infinity ? 0 : amt * 0.92 * Math.exp(-since / Math.max(relBeats, 1e-4));
    pts.push(`${x} ${(4 + dip * 34).toFixed(1)}`);
  }
  const c = TYPE[layer.type].color;
  return (
    <div style={{ marginTop: 6 }}>
      <svg width="100%" height="40" viewBox={`0 0 ${W} 40`} preserveAspectRatio="none" aria-hidden style={{ display: "block" }}>
        <path d={`M0 4H${W}`} stroke="#2A2A2E" strokeDasharray="3 4" />
        <path d={`M${pts.join(" L")}`} fill="none" stroke={c} strokeWidth="2" />
        {hits.map((h, i) => <rect key={i} x={h * W} y={34} width={12} height={5} rx={1.5} fill={TYPE[src.type].color} />)}
      </svg>
    </div>
  );
}

// ── surfaces ────────────────────────────────────────────────────────────────

type NoteHandlers = (note: number) => Record<string, (e: never) => void>;

/** 16-pad drum rack, kick bottom left. Resting pads glow faintly; a hit ripples out. */
function DrumPads({ layer, hits, noteHandlers }: { layer: LayerV2; hits: Record<string, number>; noteHandlers: NoteHandlers }) {
  const c = TYPE[layer.type].color;
  // Screen order: top row first. Pad index p sits at row 3 - floor(p/4).
  const order = [12, 13, 14, 15, 8, 9, 10, 11, 4, 5, 6, 7, 0, 1, 2, 3];
  const hitPads = DRUM_PAD_NOTES.map((n, p) => (hits[`${layer.id}:${n}`] ? p : -1)).filter(p => p >= 0);
  const rc = (p: number) => [3 - Math.floor(p / 4), p % 4];
  const ripple = (p: number) => {
    let best = 9;
    const [r, col] = rc(p);
    for (const h of hitPads) {
      const [hr, hc] = rc(h);
      best = Math.min(best, Math.max(Math.abs(hr - r), Math.abs(hc - col)));
    }
    return best;
  };
  return (
    <div className="st-tray" style={{ gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "repeat(4,1fr)" }}>
      {order.map(p => {
        const note = DRUM_PAD_NOTES[p];
        const d = ripple(p);
        const cls = d === 0 || (p === effectivePad(layer) && !hitPads.length) ? "is-lit" : d === 1 ? "is-rip1" : d === 2 ? "is-rip2" : "is-rest";
        return (
          <button key={p} type="button" className={`st-sp ${cls}`} style={{ ["--c" as string]: c } as CSSProperties} aria-label={DRUM_PAD_NAMES[p]} {...noteHandlers(note)}>
            <span className="st-lb">{DRUM_PAD_NAMES[p]}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Scale grid: only notes in key, rows a fourth apart, roots glow. */
function ScalePads({ layer, root, scale, held, hits, noteHandlers }: { layer: LayerV2; root: number; scale: ScaleName; held: Set<number>; hits: Record<string, number>; noteHandlers: NoteHandlers }) {
  const c = TYPE[layer.type].color;
  const notes = padGrid(root, scale);
  return (
    <div className="st-tray" style={{ gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "repeat(4,1fr)" }}>
      {notes.map((n, i) => {
        const on = held.has(n) || !!hits[`${layer.id}:${n}`];
        const isRoot = pitchClass(n) === pitchClass(root);
        const name = noteName(n);
        return (
          <button key={i} type="button" className={`st-sp ${on ? "is-lit" : isRoot ? "is-dim" : ""}`} style={{ ["--c" as string]: c } as CSSProperties}
            aria-label={`Note ${name}${isRoot ? ", root" : ""}`} {...noteHandlers(n)}>
            <span className="st-lb" style={{ fontSize: 15 }}>{name.replace(/-?\d+$/, "")}<span style={{ fontSize: 10, opacity: 0.6 }}>{name.match(/-?\d+$/)?.[0]}</span></span>
          </button>
        );
      })}
    </div>
  );
}

/** Eight white keys with black keys set between them. Drums: one sound per key. */
function Keys({ drum, held, hits, layerId, noteHandlers }: { drum: boolean; held: Set<number>; hits: Record<string, number>; layerId: string; noteHandlers: NoteHandlers }) {
  const row = keyRow(36);
  const whites = drum ? DRUM_PAD_NOTES.slice(0, 8) : row.white;
  const lit = (n: number) => held.has(n) || !!hits[`${layerId}:${n}`];
  return (
    <div className={`st-keys ${drum ? "is-drum" : ""}`}>
      <div className="st-keys-row">
        {whites.map((n, i) => (
          <button key={i} type="button" className={`m1-m is-wide st-key ${lit(n) ? "is-hit" : ""}`} aria-label={drum ? DRUM_KEY_LABELS[i] : `Note ${noteName(n)}`} {...noteHandlers(n)}>
            <span className="m1-cap" />
            <span className="m1-ml">{drum ? DRUM_KEY_LABELS[i] : noteName(n).replace(/\d+$/, "")}</span>
          </button>
        ))}
      </div>
      {!drum &&
        row.black.map(b => (
          <button key={b.note} type="button" aria-label={`Note ${noteName(b.note)}`} className={`m1-cap is-blk st-sharp ${lit(b.note) ? "is-hit" : ""}`}
            style={{ left: `calc((100% - 35px) / 8 * ${b.after + 1} + ${5 * (b.after + 1)}px - 2.5px - 15px)` }} {...noteHandlers(b.note)} />
        ))}
    </div>
  );
}

const FX_LANES = [36, 38, 39, 41];

/** Back, forward and the bars. A page is what fits on screen; a bar is four beats. */
function PageBar({ page, pages, setPage, bars, setBars, perPage, grid }: { page: number; pages: number; setPage: (p: number) => void; bars: number; setBars: (n: number) => void; perPage: number; grid: number }) {
  const perBar = 4 / grid;
  const from = page * perPage + 1;
  const to = (page + 1) * perPage;
  const bar = Math.floor((page * perPage) / perBar) + 1;
  return (
    <div className="st-pages" style={{ alignItems: "center", gap: 6 }}>
      <button type="button" className="st-tag" aria-label="Previous steps" disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button>
      <span className="st-ss" style={{ minWidth: 88, textAlign: "center" }}>{bars > 1 ? `bar ${bar} · ` : ""}{from}-{to}</span>
      <button type="button" className="st-tag" aria-label="Next steps" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>›</button>
      <span style={{ flex: 1 }} />
      <span className="st-ss">bars</span>
      {[1, 2, 3, 4].map(n => (
        <button key={n} type="button" className={`st-tag ${bars === n ? "is-on" : ""}`} aria-pressed={bars === n} aria-label={`${n} bar${n > 1 ? "s" : ""}`} onClick={() => setBars(n)}>{n}</button>
      ))}
    </div>
  );
}

type StepsProps = { layer: LayerV2; page: number; pages: number; setPage: (p: number) => void; playStep: number; grid: number; bars: number; setBars: (n: number) => void };

/** A lane per sound, 8 steps a page. The playing step glows. */
function DrumSteps({ layer, page, pages, setPage, playStep, grid, bars, setBars, onToggle }: StepsProps & { onToggle: (note: number, step: number) => void }) {
  const c = TYPE[layer.type].color;
  const fx = layer.type === "fx";
  const smp = layer.type === "sample";
  const lanes = fx ? FX_LANES : smp ? [0, 1, 2, 3].map(k => SAMPLER_NOTE_BASE + k) : (layer.type === "hats" ? DRUM_LANES.hats : DRUM_LANES.drums).slice(0, 4);
  const names = smp
    ? lanes.map((n, k) => layer.samples?.[n - SAMPLER_NOTE_BASE]?.slice(0, 6) ?? `slot ${k + 1}`)
    : fx
    ? lanes.map(n => FX_NAMES[n - FX_NOTE_BASE].replace(" hit", "").replace("sweep ", "sw "))
    : lanes.map(n => DRUM_PAD_NAMES[DRUM_PAD_NOTES.indexOf(n as (typeof DRUM_PAD_NOTES)[number])].replace("closed hat", "hat"));
  return (
    <>
      <div className="st-tray" style={{ gridTemplateColumns: "44px repeat(8,1fr)", gridTemplateRows: `repeat(${lanes.length},1fr)` }}>
        {lanes.map((note, li) => (
          <LaneRow key={note} name={names[li]} note={note} layer={layer} page={page} playStep={playStep} color={c} grid={grid} onToggle={onToggle} />
        ))}
      </div>
      <PageBar page={page} pages={pages} setPage={setPage} bars={bars} setBars={setBars} perPage={8} grid={grid} />
    </>
  );
}

function LaneRow({ name, note, layer, page, playStep, color, grid, onToggle }: { name: string; note: number; layer: LayerV2; page: number; playStep: number; color: string; grid: number; onToggle: (note: number, step: number) => void }) {
  return (
    <>
      <div className="st-lane">{name}</div>
      {Array.from({ length: 8 }, (_, k) => {
        const step = page * 8 + k;
        const on = layer.events.some(e => e.note === note && Math.abs(e.start - step * grid) < grid / 2);
        const here = step === playStep;
        return (
          <button key={k} type="button" className={`st-sp ${on ? (here ? "is-lit" : "is-on") : here ? "is-dim" : ""}`} style={{ ["--c" as string]: color } as CSSProperties}
            aria-label={`${name} step ${step + 1} ${on ? "on" : "off"}`} aria-pressed={on} onClick={() => onToggle(note, step)} />
        );
      })}
    </>
  );
}

function MelodicSteps({ layer, page, pages, setPage, playStep, grid, bars, setBars, onToggle }: StepsProps & { onToggle: (step: number) => void }) {
  const c = TYPE[layer.type].color;
  return (
    <>
      <div className="st-tray" style={{ gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "repeat(4,1fr)" }}>
        {Array.from({ length: 16 }, (_, k) => {
          const s = page * 16 + k;
          const ev = layer.events.find(e => Math.abs(e.start - s * grid) < grid / 2);
          const here = s === playStep;
          return (
            <button key={k} type="button" className={`st-sp ${ev ? (here ? "is-lit" : "is-on") : here ? "is-dim" : ""}`} style={{ ["--c" as string]: c } as CSSProperties}
              aria-label={`Step ${s + 1} ${ev ? `on, ${noteName(ev.note)}` : "off"}`} aria-pressed={!!ev} onClick={() => onToggle(s)}>
              <span className="st-lv">{s + 1}</span>
              {ev ? <span className="st-lb">{noteName(ev.note)}</span> : null}
            </button>
          );
        })}
      </div>
      <PageBar page={page} pages={pages} setPage={setPage} bars={bars} setBars={setBars} perPage={16} grid={grid} />
    </>
  );
}

/** 16 slots as pads. A slot with a sound lights on a hit; an empty one is dim. */
function SamplePads({ layer, hits, noteHandlers }: { layer: LayerV2; hits: Record<string, number>; noteHandlers: NoteHandlers }) {
  const c = TYPE[layer.type].color;
  const order = [12, 13, 14, 15, 8, 9, 10, 11, 4, 5, 6, 7, 0, 1, 2, 3];
  return (
    <div className="st-tray" style={{ gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "repeat(4,1fr)" }}>
      {order.map(k => {
        const note = SAMPLER_NOTE_BASE + k;
        const name = layer.samples?.[k];
        const lit = !!hits[`${layer.id}:${note}`];
        return (
          <button key={k} type="button" className={`st-sp ${lit ? "is-lit" : name ? "is-rest" : "is-dim"}`} style={{ ["--c" as string]: c } as CSSProperties}
            aria-label={name ? `slot ${k + 1}, ${name}` : `slot ${k + 1}, empty`} {...noteHandlers(note)}>
            <span className="st-lb">{name ? name.slice(0, 8) : k + 1}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Load a sound into each slot. The audio stays in this browser; nothing is uploaded. */
function SampleLoader({ layer, onPatch, onPreview }: { layer: LayerV2; onPatch: (fn: (l: LayerV2) => LayerV2, undoable?: boolean) => void; onPreview: (slot: number) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const target = useRef(0);
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const order = [12, 13, 14, 15, 8, 9, 10, 11, 4, 5, 6, 7, 0, 1, 2, 3];
  const c = TYPE[layer.type].color;
  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const slot = target.current;
    setBusy(slot);
    setErr("");
    try {
      const rec = await decodeFile(f);
      await putSample(layer.id, slot, rec);
      onPatch(l => ({ ...l, samples: { ...(l.samples ?? {}), [slot]: f.name.replace(/\.[^.]+$/, "") } }));
      window.setTimeout(() => onPreview(slot), 250);
    } catch {
      setErr("could not read that file. try a wav or mp3");
    }
    setBusy(null);
    if (input.current) input.current.value = "";
  };
  return (
    <>
      <input ref={input} type="file" accept="audio/*" hidden onChange={e => void onFile(e.target.files?.[0])} />
      <div className="st-tray" style={{ gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "repeat(4,1fr)" }}>
        {order.map(k => {
          const name = layer.samples?.[k];
          return (
            <button key={k} type="button" className={`st-sp ${name ? "is-rest" : "is-dim"}`} style={{ ["--c" as string]: c } as CSSProperties}
              aria-label={name ? `slot ${k + 1}, ${name}. tap to replace` : `slot ${k + 1}, empty. tap to load a sound`}
              onClick={() => { target.current = k; input.current?.click(); }}>
              <span className="st-lb">{busy === k ? "…" : name ? name.slice(0, 8) : "+"}</span>
            </button>
          );
        })}
      </div>
      <div className="st-ss" style={{ textAlign: "center", marginTop: 6, minHeight: 16 }}>{err || "tap a slot to load a sound"}</div>
      {Object.keys(layer.samples ?? {}).length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
          <button type="button" className="st-tag" onClick={() => {
            const ids = Object.keys(layer.samples ?? {}).map(Number);
            ids.forEach(s => void dropSample(layer.id, s));
            onPatch(l => ({ ...l, samples: {} }));
          }}>clear all</button>
        </div>
      )}
    </>
  );
}

/** The eight fx sounds as pads, bottom-left first. */
function FxPads({ layer, hits, noteHandlers }: { layer: LayerV2; hits: Record<string, number>; noteHandlers: NoteHandlers }) {
  const c = TYPE[layer.type].color;
  const order = [4, 5, 6, 7, 0, 1, 2, 3];
  return (
    <div className="st-tray" style={{ gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "repeat(2,1fr)" }}>
      {order.map(k => {
        const note = FX_NOTE_BASE + k;
        const lit = !!hits[`${layer.id}:${note}`];
        return (
          <button key={k} type="button" className={`st-sp ${lit ? "is-lit" : "is-rest"}`} style={{ ["--c" as string]: c } as CSSProperties} aria-label={FX_NAMES[k]} {...noteHandlers(note)}>
            <span className="st-lb">{FX_NAMES[k]}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Your songs: switch, start a new one, copy, rename, delete (tap twice). */
function SongsPanel({ songs, onChange }: { songs: SongIndex | null; onChange: (i: SongIndex) => void }) {
  const [sure, setSure] = useState<string | null>(null);
  const [name, setName] = useState("");
  if (!songs) return null;
  const active = songs.songs.find(s => s.id === songs.active);
  return (
    <>
      <Silk label="songs" right={`${songs.songs.length} saved`} />
      <div className="st-tray" style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", justifyContent: "flex-start" }}>
        {songs.songs.map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", flex: "none" }}>
            <button type="button" className={`st-sp st-song ${s.id === songs.active ? "is-on" : ""}`} style={{ flex: 1, width: "auto" }} aria-pressed={s.id === songs.active} onClick={() => onChange(switchSong(s.id))}>
              {s.name}{s.id === songs.active ? <span className="st-ss">open</span> : null}
            </button>
            {songs.songs.length > 1 ? (
              <button type="button" className="st-song-x" aria-label={sure === s.id ? `Really delete ${s.name}` : `Delete ${s.name}`} style={sure === s.id ? { color: "#FF6B6B", width: 60, fontSize: 11 } : undefined}
                onClick={() => (sure === s.id ? (setSure(null), onChange(deleteSong(s.id))) : setSure(s.id))}>{sure === s.id ? "sure?" : "×"}</button>
            ) : null}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8, flex: "none" }}>
        <input
          aria-label="Rename this song"
          placeholder={active?.name ?? "name"}
          value={name}
          maxLength={24}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && active) { onChange(renameSong(active.id, name)); setName(""); } }}
          style={{ flex: 1, minWidth: 0, height: 34, borderRadius: 9, border: "1px solid var(--tag)", background: "var(--well)", color: "var(--ink)", padding: "0 10px", font: "inherit", fontSize: 13 }}
        />
        <button type="button" className="st-tag" style={{ height: 34, padding: "0 10px" }} disabled={!name.trim()} onClick={() => { if (active) { onChange(renameSong(active.id, name)); setName(""); } }}>rename</button>
        <button type="button" className="st-tag" style={{ height: 34, padding: "0 10px" }} onClick={() => onChange(duplicateSong())}>copy</button>
        <button type="button" className="st-tag" style={{ height: 34, padding: "0 10px" }} onClick={() => onChange(newSong())}>+ new</button>
      </div>
    </>
  );
}

function AddPanel({ track, sel, onAdd, onRemove }: { track: TrackV2; sel: LayerV2 | null; onAdd: (t: LayerV2["type"]) => void; onRemove: () => void }) {
  const full = track.layers.length >= MAX_LAYERS;
  return (
    <>
      <Silk label="add a layer" right={full ? "track is full" : `${MAX_LAYERS - track.layers.length} free`} />
      <div className="st-tray" style={{ gridTemplateColumns: "repeat(3,1fr)", gridTemplateRows: "repeat(3,1fr)" }}>
        {LAYER_ORDER.map(t => (
          <button key={t} type="button" className="st-sp is-rest" style={{ ["--c" as string]: TYPE[t].color } as CSSProperties} disabled={full} onClick={() => onAdd(t)}>
            <span className="st-lb" style={{ fontSize: 15 }}>{TYPE[t].label}</span>
          </button>
        ))}
        {sel ? (
          <button type="button" className="st-sp" style={{ gridColumn: "span 3" }} onClick={onRemove}>
            <span className="st-lb" style={{ fontSize: 15 }}>remove {TYPE[sel.type].label}</span>
          </button>
        ) : null}
      </div>
    </>
  );
}
