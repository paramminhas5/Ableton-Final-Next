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
  DRUM_PAD2_BASE,
  DRUM_PAD2_PARAMS,
  DRUM_PAD2_STRIDE,
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
import { velocityAt } from "@/lib/touch";
import { inScale, keyName, keyRow, noteName, padGrid, pitchClass, SCALE_NAMES, SCALES, snapToScale, SNAP_BEATS, stepOf, type ScaleName, type Snap } from "@/lib/theory";
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
  type NoteEvent,
} from "@/lib/track2";
import { downloadSongMidi, heardPasses, variesByPass } from "@/lib/track2-midi";
import { downloadWav } from "@/lib/bounce";
import { starterTrack } from "@/lib/starter";
import { CAP, Dice, Icon, Key, Knob, PadRing, Screen, Silk } from "./controls";
import { fillDrums, fillMelody, newSeed } from "@/lib/dice";
import { Mix } from "./Mix";
import { ChordSurface, CircleSurface, GlideSurface, RollsSurface, RiserSurface, XYSurface, bassRoot, scaleOf, ROLLS, type SurfaceCtx } from "./Surfaces";
import { swung, useEngineTrack } from "./useEngineTrack";
import { setLock } from "@/lib/plock";
import { arranged } from "@/lib/arrange";
import { captureTake, trimPlayed, type Played } from "@/lib/capture";
import { EnvView, FilterView, useNoteClock, type NoteClock } from "./Pictures";
import { ampEnv, CHARACTER_KEYS, characterOf, envHandles, filterEnv } from "@/lib/shapes";
import { bind, PIC } from "@/lib/paramColor";
import { assign, canTake, hasLayerLfo, removeRing, ringsOf, setAmount, sourcesFor, sourceUsed, srcLabel, SRC_COLOR, type ModSrc, type Ring as ModRing } from "@/lib/modulation";
import { ModChips, ModOverlay, SourcePanel, useModLive } from "./Modulation";
import { ABKey, useAB } from "./AB";
import { ScopeView } from "./Scope";
import { fromValue, toValue } from "@/engine";
import { chordAt, chordEvents, chordName, chordNotes as chordMidi, inChord, romanOf, withChordTrack, type Chord } from "@/lib/chords";
import { ChordTrackEditor } from "./ChordTrack";
import { CONDS, hasFillSteps, setChance, setCond, stepTag, type Cond } from "@/lib/chance";
import { PlayerSurface } from "./PlayerSurface";
import { applyPlayer } from "@/lib/players";
import { elsewhereLine, knobLabel, stepName } from "@/lib/controlNames";
import { ElsewhereLine } from "./Elsewhere";
import { commitLoop, goSection, sectionNow } from "@/lib/arrange";
import { partLen, swingOf } from "@/lib/partLength";

/** The screen's big readout: a stepped knob shows its short name ("svf"), the knob's own readout the rest. */
const bigText = (spec: ParamSpec, v: number) => stepName(spec.key, v, false) ?? display(spec, v);

const BANKS: Bank[] = ["sound", "eq", "fx", "mix"];
// Caps stay neutral: the ring around each knob carries the colour of the line it moves.
const KNOB_CAPS = [CAP.navy, CAP.grey, CAP.navy, CAP.grey] as const;
const SNAPS: Snap[] = ["1/8", "1/16", "1/32", "off"];
const DRUM_KEY_LABELS = ["kick", "snare", "clap", "rim", "hat", "open", "shaker", "ride"];
const MUTE_C = "#F3C14F";
const SOLO_C = "#7D96FF";
const DUCK_IDX = LAYER_PARAMS.find(p => p.id === "mix.duck")!.index;

/** What the screen shows: the control just touched, its value, and its key (for the same control elsewhere). */
/** "a minor" to "a min", "f# dorian" to "f# dor": the key chip on a phone. */
const shortKey = (k: string) => { const [r, ...rest] = k.split(" "); const sc = rest.join(" "); return sc ? `${r} ${sc.slice(0, 3)}` : r; };
type Touched = { label: string; text: string; key?: string } | null;
type LockAt = { note: number | null; step: number } | null;
type Mode = "play" | "mix";
const NOTE_NAMES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];


/** The knobs for this bank: four specs and their wire indices. `shift` is the second page of the sound bank. */
function bankKnobs(l: LayerV2, bank: Bank, shift = false): { spec: ParamSpec; index: number }[] {
  // The fx bank's second page is the part's filter: cutoff, resonance and circuit (prd, ms2, svf).
  if (bank === "fx") return LAYER_PARAMS.filter(p => p.bank === "fx").slice(shift ? 4 : 0, shift ? 7 : 4).map(spec => ({ spec, index: spec.index }));
  if (bank !== "sound") return LAYER_PARAMS.filter(p => p.bank === bank).slice(0, 4).map(spec => ({ spec, index: spec.index }));
  const engine = TYPE[l.type].engine;
  if (engine === "drums") {
    if (shift) {
      // The pad's second page: its shape where it has one (the kick's body, the perc pads' bell and
      // metal), then its tone and noise layers.
      const pad = effectivePad(l);
      const shapeKey = pad === 0 ? "shape" : pad === 12 ? "shapeblip" : pad === 13 ? "shapewood" : null;
      const page = DRUM_PAD2_PARAMS.flatMap((spec, k) => {
        if (spec.key === "shape" && !shapeKey) return [];
        const s = (spec.key === "shape" ? { ...spec, key: shapeKey, label: knobLabel({ key: shapeKey!, label: spec.label }) } : spec) as ParamSpec;
        return [{ spec: s, index: INSTRUMENT_BASE + DRUM_PAD2_BASE + pad * DRUM_PAD2_STRIDE + k }];
      });
      // The rack's lfo settings sit with the lfo chip, not on a page.
      return [...DRUM_RACK_PARAMS.filter(spec => spec.bank !== "mod").map(spec => ({ spec: spec as ParamSpec, index: spec.index as number })), ...page];
    }
    return DRUM_PAD_PARAMS.map((spec, k) => ({ spec, index: INSTRUMENT_BASE + effectivePad(l) * DRUM_PAD_PARAMS.length + k }));
  }
  const table = (INSTRUMENT_TABLES[engine] ?? []) as unknown as ParamSpec[];
  // The shape knob takes the name it has on the instrument the chosen osc copies (wave position, feedback).
  const byKey = (key: string) => { const p = table.find(x => x.key === key); return p ? paramOf(l, p.index) : undefined; };
  return table.filter(p => p.bank === (shift ? "shift" : "sound")).map(spec => ({ spec: { ...spec, label: knobLabel(spec, byKey) }, index: spec.index }));
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
  const [keyOpen, setKeyOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  // Saving a wav asks how loud, on its own panel; it never borrows the knob page's shift.
  const [wavOpen, setWavOpen] = useState(false);
  const [midiOpen, setMidiOpen] = useState(false);
  const [sureReset, setSureReset] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongIndex | null>(null);
  const [shift, setShift] = useState(false);
  const [rate, setRate] = useState(1);
  const [page, setPage] = useState(0);
  const [snap, setSnap] = useState<Snap>("1/16");
  const [pos, setPos] = useState<{ beat: number; flags: number }>({ beat: 0, flags: 0 });
  const [hits, setHits] = useState<Record<string, number>>({});
  const [rings, setRings] = useState<Rings>({});
  // Hold a step, turn a knob: the held step (and its lane, on drums) takes the knob's value as a lock.
  const [lockAt, setLockAt] = useState<LockAt>(null);
  // Capture: what you played while not recording, kept for a few bars; the capture key makes it a take.
  const played = useRef<Played[]>([]);
  const [playedN, setPlayedN] = useState(0);
  const [pending, setPending] = useState<{ layerId: string; events: NoteEvent[] } | null>(null);
  // Fill and randomise: the notes before the dice, so the amount grows and shrinks the same fill.
  const dice = useRef<{ layerId: string; base: NoteEvent[]; result: string } | null>(null);
  const [diceAmt, setDiceAmt] = useState(0);
  const [diceSeed, setDiceSeed] = useState(1);
  const lastDice = useRef(0);
  const [held, setHeldUi] = useState<Set<number>>(new Set());
  const lastNote = useRef(33);
  const recHeld = useRef<Held>(new Map());
  const takeOpen = useRef(false);
  const lastParamEdit = useRef(0);
  // Modulation: the source being edited (every knob shows its amount), and the knob a dragged source is over.
  const [modEdit, setModEdit] = useState<ModSrc | null>(null);
  const [dropOver, setDropOver] = useState<number | null>(null);
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
  const flash = useCallback((key: string, v = 0.85) => {
    const t = Date.now();
    setHits(h => ({ ...h, [key]: t }));
    setRings(r => ({ ...r, [key]: { t: t + Math.random(), v } }));
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
          // Times round the loop since play, so a free-running part's step light follows its own time.
          const sb = songBeat.current;
          if (!(e.flags & FLAG.playing) || e.flags & FLAG.countIn) { sb.wraps = 0; sb.last = 0; }
          else { if (e.beat < sb.last - t.loop / 2) sb.wraps++; sb.last = e.beat; }
          continue;
        }
        const layer = t.layers[e.layer];
        if (!layer) continue;
        if ((e.kind === OUT.playedOn || e.kind === OUT.playedOff) && !(e.flags & (FLAG.recording | FLAG.countIn))) {
          const now = performance.now();
          const looping = !!(e.flags & FLAG.playing);
          if (e.kind === OUT.playedOn) {
            const roll = !!(e.flags & FLAG.repeat);
            played.current = trimPlayed([...played.current, { layerId: layer.id, note: e.note, vel: e.vel, tOn: now, tOff: roll ? now + 90 : null, bOn: looping ? e.beat : null, bOff: null }], now, (60000 / t.bpm) * 4 * 8);
          } else {
            const open = [...played.current].reverse().find(p => p.layerId === layer.id && p.note === e.note && p.tOff === null);
            if (open) { open.tOff = now; open.bOff = looping && open.bOn !== null ? e.beat : null; }
          }
          setPlayedN(played.current.length);
        }
        if (e.kind === OUT.seqOn) {
          flash(`${layer.id}:${e.note}`, e.vel);
          continue;
        }
        if (e.kind === OUT.playedOn && e.flags & FLAG.repeat) flash(`${layer.id}:${e.note}`, e.vel);
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
  }, [engine, flash, snap, update]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── parameter locks: they ride on the notes to the engine (useEngineTrack, cmd evLock), which sets each on its
  // note's own sample. Turning a knob on a held step lets you hear it at once; letting go puts the knob back.
  const auditioned = useRef<Set<number>>(new Set());
  const songBeat = useRef({ wraps: 0, last: 0 });

  useEffect(() => {
    if (!recording && !countIn) takeOpen.current = false;
  }, [recording, countIn]);

  // ── playing ───────────────────────────────────────────────────────────────
  const down = (note: number, e: PointerEvent<HTMLElement>) => {
    if (selIndex < 0 || !sel) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    start();
    const vel = velocityAt(e);
    engine.noteOn(selIndex, note, vel, e.timeStamp);
    if (!drumLike) lastNote.current = note;
    setHeldUi(h => new Set(h).add(note));
    flash(`${sel.id}:${note}`, vel);
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
  // Rings that move while the sound plays: the engine reports this part's modulation while a ring is on screen.
  const knobsRef = useRef<HTMLDivElement>(null);
  const liveRings: Map<number, ModRing[]> = sel ? ringsOf(TYPE[sel.type].engine, sel.params, sel.mods) : new Map();
  const ringShown = knobs.some(k => (liveRings.get(k.index)?.length ?? 0) > 0);
  useModLive(engine, selIndex, ringShown && mode === "play" && !lockAt, knobsRef, liveRings, i => (sel ? paramOf(sel, i) : 0));
  const selPadNote = sel && drumLike ? DRUM_PAD_NOTES[effectivePad(sel)] : -1;
  const clock = useNoteClock(engine, selIndex, { bpm: track.bpm, loop: track.loop, events: sel?.events ?? [] }, drumLike ? (n => n === selPadNote) : undefined);
  const lockMatch = (at: NonNullable<LockAt>) => (e: { note: number; start: number }) => Math.abs(e.start - at.step * grid) < grid / 2 && (at.note === null || e.note === at.note);
  const lockedValue = (index: number) => {
    if (!lockAt || !sel) return undefined;
    const ev = sel.events.find(lockMatch(lockAt));
    return ev?.p?.[index];
  };
  const setParam = (index: number, spec: ParamSpec, v: number) => {
    start(); // a knob turned before any tap must still be heard
    const now = Date.now();
    const undoable = now - lastParamEdit.current > 800; // one drag is one undo step
    lastParamEdit.current = now;
    if (lockAt && sel) {
      patchSel(l => ({ ...l, events: setLock(l.events, lockMatch(lockAt), index, v) }), undoable);
      engine.param(selIndex, index, v);
      auditioned.current.add(index);
      setTouched({ label: `step ${lockAt.step + 1} · p-lock · ${spec.label}`, text: bigText(spec, v), key: "plock" });
      return;
    }
    patchSel(l => {
      const next = { ...l, params: { ...l.params, [index]: v } };
      // Turning duck up with nowhere to duck from: duck under the drums' kick.
      if (index === DUCK_IDX && v > 0 && !l.duck.src) {
        const drums = trackRef.current.layers.find(x => x.type === "drums" && x.id !== l.id);
        if (drums) next.duck = { src: drums.id, note: 36 };
      }
      return next;
    }, undoable);
    setTouched({ label: spec.label, text: bigText(spec, v), key: spec.key });
  };

  /** Apply a modulation change (knob values and routes) as one undo step per gesture. */
  const patchMod = (r: { params: Record<number, number>; mods: { src: ModSrc; to: number; amt: number }[] }, label: string, text: string) => {
    start();
    const now = Date.now();
    const undoable = now - lastParamEdit.current > 800;
    lastParamEdit.current = now;
    patchSel(l => ({ ...l, params: { ...l.params, ...r.params }, mods: r.mods.length ? r.mods : undefined }), undoable);
    setTouched({ label, text });
  };
  useEffect(() => { setModEdit(null); }, [selId]);
  // A/B on every instrument (Live 12.3), level matched.
  const ab = useAB(engine, track, sel, selIndex, snap => patchSel(l => ({ ...l, params: snap.params, mods: snap.mods }), false), (label, text) => setTouched({ label, text }));

  const diceable = !!sel && (sel.type === "drums" || sel.type === "hats" || sel.type === "bass" || sel.type === "lead");
  const rollDice = (amt: number, seed: number) => {
    if (!sel || !diceable) return;
    let d = dice.current;
    if (!d || d.layerId !== sel.id || d.result !== JSON.stringify(sel.events)) d = dice.current = { layerId: sel.id, base: sel.events, result: "" };
    const lanes = (sel.type === "hats" ? DRUM_LANES.hats : DRUM_LANES.drums).slice(0, 4);
    const root = sel.type === "bass" ? bassRoot(track) : (track.root ?? 45) + 12;
    const ev = sel.type === "drums" || sel.type === "hats"
      ? fillDrums(d.base, lanes, track.loop, grid, amt, seed)
      : fillMelody(d.base, { loop: track.loop, step: grid, root: track.root ?? 45, scale: scaleOf(track), amount: amt, seed, lo: root, hi: root + 19 });
    d.result = JSON.stringify(ev);
    const now = Date.now();
    const undoable = now - lastDice.current > 800;
    lastDice.current = now;
    patchSel(l => ({ ...l, events: ev }), undoable);
    setDiceAmt(amt);
    setDiceSeed(seed);
    setTouched({ label: "density", text: `${Math.round(amt * 100)}%`, key: "density" });
  };
  useEffect(() => { setDiceAmt(0); dice.current = null; }, [selId]);
  const diceRow = diceable && !lockAt ? <Dice amount={diceAmt} onAmount={v => rollDice(v, diceSeed)} onRoll={() => rollDice(diceAmt || 0.35, newSeed())} label="density" /> : null;

  // Chance (Live 12) and trig conditions (Elektron), set like a lock: hold a step, turn chance, pick a condition.
  const lastChance = useRef(0);
  const heldEv = lockAt && sel ? sel.events.find(lockMatch(lockAt)) : undefined;
  const setStepChance = (v: number) => {
    if (!lockAt) return;
    const now = Date.now();
    const undoable = now - lastChance.current > 800;
    lastChance.current = now;
    patchSel(l => ({ ...l, events: setChance(l.events, lockMatch(lockAt), v) }), undoable);
    setTouched({ label: `step ${lockAt.step + 1} · chance`, text: `${Math.round(v * 100)}%` });
  };
  const setStepCond = (c: Cond | null) => {
    if (!lockAt) return;
    patchSel(l => ({ ...l, events: setCond(l.events, lockMatch(lockAt), c) }));
    setTouched({ label: `step ${lockAt.step + 1} · trig condition`, text: c ?? "off" });
  };
  const chanceRow = lockAt && sel && heldEv ? (
    <div className="st-chancerow">
      <Knob label="chance" size={22} color={CAP.grey} value={heldEv.chance ?? 1} defaultValue={1} readout={`${Math.round((heldEv.chance ?? 1) * 100)}%`} onChange={setStepChance} style={{ width: 56, height: 56, aspectRatio: "auto", flex: "none" }} />
      <div className="st-conds" role="radiogroup" aria-label="Trig condition">
        {CONDS.map(c => {
          const on = (heldEv.cond ?? "") === c;
          return <button key={c || "off"} type="button" role="radio" aria-checked={on} className={`st-tag ${on ? "is-on" : ""}`} onClick={() => setStepCond(c || null)}>{c || "off"}</button>;
        })}
      </div>
    </div>
  ) : null;
  // The fill key: steps with the fill condition play while it is held.
  const [fillHeld, setFillHeld] = useState(false);
  const holdFill = (on: boolean) => { if (on) start(); engine.fill(on); setFillHeld(on); if (on) setTouched({ label: "fill", text: "held" }); };
  const fillKey = hasFillSteps(track.layers) && !lockAt ? (
    <button type="button" className={`st-fillkey ${fillHeld ? "is-on" : ""}`} aria-pressed={fillHeld} aria-label="Fill: hold to play the fill steps"
      onPointerDown={e => { e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic */ } holdFill(true); }}
      onPointerUp={() => holdFill(false)} onPointerCancel={() => holdFill(false)} onContextMenu={e => e.preventDefault()}
      onKeyDown={e => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); holdFill(true); } }}
      onKeyUp={e => { if (e.key === " " || e.key === "Enter") holdFill(false); }}>fill</button>
  ) : null;
  // Per-part loop length and swing (Elektron's per-track length, Live's groove per clip).
  const loopSteps = Math.round(track.loop / grid);
  const plen = sel ? partLen(sel, track.loop) : null;
  const partSteps = plen !== null ? Math.max(1, Math.round(plen / grid)) : loopSteps;
  // A free-running part (Elektron's master length at inf) never restarts with the loop; the default restarts.
  const freeSel = !!sel && plen !== null && sel.free === true;
  const toggleFree = () => {
    if (!sel) return;
    patchSel(l => { const { free: _f, ...rest } = l; return l.free ? rest : { ...rest, free: true }; }); // eslint-disable-line @typescript-eslint/no-unused-vars
    setTouched({ label: `${TYPE[sel.type].label} length`, text: sel.free ? "restarts with the loop" : "runs free, drifting across the song" });
  };
  const setPartSteps = (n: number) => {
    const steps = Math.max(1, Math.min(loopSteps, n));
    patchSel(l => { const { len: _len, ...rest } = l; return steps >= loopSteps ? rest : { ...rest, len: steps * grid }; }); // eslint-disable-line @typescript-eslint/no-unused-vars
    setTouched({ label: `${sel ? TYPE[sel.type].label : ""} length`, text: steps >= loopSteps ? "the song's" : `${steps} step${steps > 1 ? "s" : ""}` });
  };
  const SWINGS = [undefined, 0, 0.25, 0.5, 0.7] as const;
  const cycleSwing = () => {
    if (!sel) return;
    const i = SWINGS.findIndex(v => v === sel.swing);
    const next = SWINGS[(i + 1) % SWINGS.length];
    patchSel(l => { const { swing: _sw, ...rest } = l; return next === undefined ? rest : { ...rest, swing: next }; }); // eslint-disable-line @typescript-eslint/no-unused-vars
    setTouched({ label: `${TYPE[sel.type].label} swing`, text: next === undefined ? `song's, ${Math.round((track.swing ?? 0) * 100)}%` : `${Math.round(next * 100)}%` });
  };
  const partRow = sel && !lockAt ? (
    <div className="st-partrow" role="group" aria-label={`Own length and swing for ${TYPE[sel.type].label}`}>
      <span className="st-ss">length</span>
      <button type="button" className="st-tag" aria-label="One step shorter" disabled={partSteps <= 1} onClick={() => setPartSteps(partSteps - 1)}>−</button>
      <span className="st-ss st-partv" aria-live="polite">{plen !== null ? partSteps : `${loopSteps}`}</span>
      <button type="button" className="st-tag" aria-label="One step longer" disabled={plen === null} onClick={() => setPartSteps(partSteps + 1)}>+</button>
      <button type="button" className={`st-tag ${freeSel ? "is-on" : ""}`} aria-pressed={freeSel} disabled={plen === null}
        aria-label={freeSel ? "Runs free: never restarts with the loop. Tap to restart with the loop" : "Restarts with the loop. Tap to run free (Elektron's master length inf)"}
        onClick={toggleFree}>{freeSel ? "free" : "restart"}</button>
      <button type="button" className={`st-tag ${sel.swing !== undefined ? "is-on" : ""}`} aria-label="This part's swing, tap to change" onClick={cycleSwing}>swing {sel.swing === undefined ? "song" : `${Math.round(sel.swing * 100)}%`}</button>
    </div>
  ) : null;
  // One row at a time above the steps: density and fill, or (with "part" on) the part's length and swing.
  const [partOpen, setPartOpen] = useState(false);
  const stepsExtra = partOpen && partRow ? partRow : diceRow || fillKey ? <>{diceRow}{fillKey}</> : null;
  const partTag = sel && !lockAt ? (
    <button type="button" className={`st-tag ${partOpen ? "is-on" : ""}`} aria-pressed={partOpen} aria-label={`Own length and swing for ${TYPE[sel.type].label}`} onClick={() => setPartOpen(o => !o)}>
      part{plen !== null || sel.swing !== undefined ? ` · ${plen !== null ? partSteps : loopSteps}${freeSel ? " free" : ""}${sel.swing !== undefined ? ` · ${Math.round(sel.swing * 100)}%` : ""}` : ""}
    </button>
  ) : null;

  const canCapture = !!sel && !recording && !countIn && playedN > 0 && played.current.some(p => p.layerId === sel.id);
  const capture = () => {
    if (!sel) return;
    const events = captureTake(played.current, sel.id, { loop: track.loop, bpm: track.bpm, snap, swing: track.swing, now: performance.now() });
    if (!events.length) return;
    played.current = played.current.filter(p => p.layerId !== sel.id);
    setPlayedN(played.current.length);
    setPending({ layerId: sel.id, events });
  };
  const keepCapture = () => {
    if (!pending) return;
    const o = { loop: track.loop, snap, strength: 1, swing: track.swing };
    update(t => ({ ...t, layers: t.layers.map(l => (l.id === pending.layerId ? { ...l, events: pending.events.reduce((acc, ev) => overdub(acc, ev, o), l.events) } : l)) }));
    setPending(null);
    setTouched({ label: "captured", text: "kept", key: "capture" });
  };

  /** Hold a step: it lights, and knob turns lock to it. An empty step gets its note first. */
  const holdStep = (note: number | null, step: number, len: number) => {
    if (!sel) return;
    const at = { note, step };
    if (!sel.events.some(lockMatch(at))) {
      const n = note ?? lastNote.current;
      patchSel(l => ({ ...l, events: toggleStep(l.events, n, step, grid, len) }));
    }
    setLockAt(at);
    const k = bankKnobs(sel, bank, shift)[0];
    setTouched({ label: `step ${step + 1} held`, text: k ? "turn a knob" : "", key: "plock" });
  };
  const clearLocks = () => {
    if (!lockAt) return;
    const m = lockMatch(lockAt);
    patchSel(l => ({ ...l, events: l.events.map(e => { if (!m(e) || !e.p) return e; const { p: _p, ...rest } = e; return rest; }) })); // eslint-disable-line @typescript-eslint/no-unused-vars
    setTouched({ label: `step ${lockAt.step + 1}`, text: "p-locks cleared", key: "plock" });
  };
  useEffect(() => { setLockAt(null); }, [selId, sel?.surface]);
  // Done locking: every knob the held step auditioned goes back to its own value (the locks play from the notes).
  useEffect(() => {
    if (lockAt || !auditioned.current.size) return;
    const l = trackRef.current.layers[selIndex];
    if (l) for (const i of auditioned.current) engine.param(selIndex, i, paramOf(l, i));
    auditioned.current.clear();
  }, [lockAt]); // eslint-disable-line react-hooks/exhaustive-deps
  // letting go of a held step clears its p-lock readout, so the screen never says a step is still held
  useEffect(() => { if (!lockAt) setTouched(t => (t?.key === "plock" ? null : t)); }, [lockAt]);

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

  const secNow = sectionNow(track);
  const playerKind = sel?.type === "drums" ? "drummer" as const : sel?.type === "bass" ? "bass" as const : null;
  // The chord track's chord under the playhead (bar 1 when stopped): its notes light on the surfaces.
  const chordNow = chordAt(track.chords, playing ? pos.beat : 0, track.loop);
  const melodicSel = !!sel && (sel.type === "bass" || sel.type === "chords" || sel.type === "lead");

  // ── screen text ───────────────────────────────────────────────────────────
  const totalSteps = Math.round(track.loop / grid);
  const playStep = playing ? stepOf(pos.beat, totalSteps, track.loop) : -1;
  const loopBeat = ((pos.beat % track.loop) + track.loop) % track.loop;
  const partPlayStep = plen === null || !playing ? playStep : Math.floor(((freeSel ? (songBeat.current.wraps * track.loop + loopBeat) % plen : loopBeat % plen)) / grid);
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
    "chord pads": `one pad, one chord, always in ${keyName(track.root, scaleOf(track))}`,
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
      if (s === "pads") return `only notes in ${keyName(track.root, scaleOf(track))} · lit pads are ${NOTE_NAMES[pitchClass(track.root)]}`;
      if (s === "keys") return `dim keys are outside ${keyName(track.root, scaleOf(track))}`;
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
    return pick ? { label: pick.spec.label, text: bigText(pick.spec, paramOf(sel, pick.index)) } : null;
  }, [touched, sel, bank, shift, drumLike, ducking]);
  // After a knob is turned, the line under the part's name says what that control is called elsewhere.
  const elsewhereText = touched?.key ? elsewhereLine(touched.key, 2) : null;
  const elsewhere = elsewhereText ? `elsewhere · ${elsewhereText}` : null;
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
        chord: chordNow,
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
        <div className="st-head">
          <Link href="/dashboard" aria-label="Back" style={{ color: "var(--ink)", display: "flex", minHeight: 0, minWidth: 0 }}>
            <Icon name="back" />
          </Link>
          <div className="st-mode st-mode2" role="radiogroup" aria-label="Studio mode">
            {(["play", "mix"] as Mode[]).map(m => (
              <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => { setMode(m); setAdding(false); setTouched(null); }}>{m}</button>
            ))}
          </div>
          <span style={{ flex: 1 }} />
          <button type="button" className="st-tag st-songtag"
            aria-label={`Songs, now ${songName}`} aria-pressed={songsOpen} onClick={() => { setMode("play"); setResetOpen(false); setKeyOpen(false); setWavOpen(false); setMidiOpen(false); setSongsOpen(o => !o); setAdding(false); }}>{songName}</button>
          <button type="button" className="st-tag" onClick={() => update(t => ({ ...t, bpm: t.bpm >= 140 ? 90 : t.bpm + 5 }))} aria-label={`Tempo ${track.bpm} bpm, tap to change`}>{track.bpm} bpm</button>
          <button type="button" className="st-tag st-keytag" aria-pressed={keyOpen} aria-label={`Key ${keyName(track.root, scaleOf(track))}, tap to change`}
            onClick={() => { setMode("play"); setSongsOpen(false); setResetOpen(false); setAdding(false); setWavOpen(false); setMidiOpen(false); setKeyOpen(o => !o); }}>
            {/* a phone shows the short key (a min) so the chip is never cut to "a mi..." */}
            <span className="st-keyfull">{keyName(track.root, scaleOf(track))}</span><span className="st-keyshort" aria-hidden>{shortKey(keyName(track.root, scaleOf(track)))}</span></button>
          {mode === "mix" ? null : (
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
                onClick={() => { setSelId(l.id); setTouched(null); setAdding(false); setSongsOpen(false); setKeyOpen(false); setWavOpen(false); setMidiOpen(false); setShift(false); }}>
                <span className={`m1-dash ${on ? "is-on" : ""}`} style={{ ["--c" as string]: c } as CSSProperties} />
                {TYPE[l.type].label}
                {l.solo ? <i className="st-solo" /> : null}
              </button>
            );
          })}
          {track.layers.length < MAX_LAYERS ? (
            <button type="button" className={`m1-m is-wide st-slot st-plus ${adding ? "is-on" : ""}`} aria-label="Add a layer" aria-pressed={adding}
              onClick={() => { setMode("play"); setSongsOpen(false); setKeyOpen(false); setWavOpen(false); setMidiOpen(false); setAdding(a => (mode === "mix" ? true : !a)); }}>
              <Icon name="plus" />
            </button>
          ) : null}
        </div>

        {mode === "mix" ? (
          <div className="st-mixwrap"><Mix track={track} engine={engine} selId={selId} onSelect={setSelId} update={update} playing={playing} /></div>
        ) : (
        <>
        <Screen className="st-scr" height={96}>
          {sel && type && pending && pending.layerId === sel.id ? (
            <CapturePreview track={track} layer={sel} events={pending.events} onKeep={keepCapture} onDrop={() => setPending(null)} />
          ) : sel && type ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                    <span className="st-big" style={{ fontSize: 28, color: type.color }}>{type.label}</span>
                    {melodicSel && chordNow ? <span className="st-chip st-chordnow" title="the chord track's chord now">{chordName(chordNow)} · {romanOf(chordNow, track.root, scaleOf(track))}</span> : null}
                    {ducking && duckSrc ? (
                      <><span className="st-ss">ducks under</span><span className="st-chip" style={{ color: TYPE[duckSrc.type].color }}>{TYPE[duckSrc.type].label}{sel.duck.note === 36 ? " · kick" : ""}</span></>
                    ) : null}
                  </div>
                  {bank === "mix" && ducking && duckSrc && !live ? null : (
                    <div className="st-ss" style={{ marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {canCapture ? (
                        <button type="button" className="st-capkey" onClick={capture} aria-label={`Capture what you just played on ${type.label}`}>
                          <i aria-hidden />capture what you played
                        </button>
                      ) : countIn ? `count in · ${Math.max(1, Math.ceil(-pos.beat))}` : recording ? `recording · ${status.replace("rec · ", "beat ")} · snap ${snap}` : elsewhere && touched?.key ? <ElsewhereLine ctl={touched.key} /> : playing ? `playing · beat ${status}` : hint}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", flex: "none" }}>
                  <div className="st-ss">{shown?.label ?? ""}</div>
                  <div className="st-big" style={{ fontSize: 28, marginTop: 2 }}>{shown?.text ?? ""}</div>
                </div>
              </div>
              {bank === "mix" && ducking && duckSrc && !live ? <DuckGraph track={track} layer={sel} src={duckSrc} /> : null}
              {!(bank === "mix" && ducking && duckSrc && !live) ? <ScopeView engine={engine} layer={selIndex} color={type.color} className="st-scope" /> : null}
            </>
          ) : (
            <>
              <div className="st-ss">studio</div>
              <div className="st-big" style={{ fontSize: 24, marginTop: 8 }}>no layers yet</div>
              <div className="st-ss" style={{ marginTop: 6 }}>finish a lesson to add one, or press +</div>
            </>
          )}
        </Screen>


        {midiOpen ? (
          <div className="st-main">
            <Silk label="to live" right="chance and conditions in a midi file" />
            <div className="st-tray" style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "flex-start" }}>
              {([["heard", `as you hear it: ${track.sections?.length ? "the arrangement" : `${Math.round((heardPasses(track.loop) * track.loop) / 4)} bars`}${track.sections?.length && heardPasses(arranged(track).loop) > 1 ? ` ${heardPasses(arranged(track).loop)} times` : ""}, chance rolled as it plays`], ["every", "every note, chance left out (a midi file can't hold it)"]] as ["heard" | "every", string][]).map(([m, label]) => (
                <button key={m} type="button" className="st-sp st-song" style={{ width: "auto", flex: "none" }}
                  onClick={() => { downloadSongMidi(track, m); setMidiOpen(false); setTouched({ label: "to live", text: m === "heard" ? "as heard" : "every note" }); }}>{label}</button>
              ))}
            </div>
          </div>
        ) : wavOpen ? (
          <div className="st-main">
            <Silk label="save a wav" right="the whole song, arranged" />
            <div className="st-tray" style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "flex-start" }}>
              {([[false, "for streaming and sharing (-14 lufs)"], [true, "loud, for club play (-9 lufs)"]] as [boolean, string][]).map(([loud, label]) => (
                <button key={label} type="button" className="st-sp st-song" style={{ width: "auto", flex: "none" }}
                  onClick={() => { void downloadWav(track, loud); setWavOpen(false); setMidiOpen(false); }}>{label}</button>
              ))}
            </div>
          </div>
        ) : resetOpen ? (
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
        ) : keyOpen ? (
          <div className="st-main"><KeyPanel track={track} update={update} now={playing ? Math.floor((((pos.beat % track.loop) + track.loop) % track.loop) / 4) : -1}
            onPreview={ns => { const li = track.layers.findIndex(l => l.type === "chords" || l.type === "lead" || l.type === "bass"); const i = melodicSel ? selIndex : li; if (i < 0) return; start(); ns.forEach(n => engine.noteOn(i, n, 0.8)); window.setTimeout(() => ns.forEach(n => engine.noteOff(i, n)), 420); }} /></div>
        ) : songsOpen ? (
          <div className="st-main"><SongsPanel songs={songs} onChange={refreshSongs} /></div>
        ) : adding ? (
          <div className="st-main"><AddPanel track={track} sel={sel} onAdd={addLayer} onRemove={removeSel} /></div>
        ) : sel ? (
          <>
            <div className="st-main">
            {/* Where you are in the arrangement, and commit (the EP-133's): in place of the "play on" label, to keep the phone's height for the pads. */}
            <div className="st-secrow" role="group" aria-label="Sections">
                {secNow ? (
                  <>
                    <button type="button" className="st-tag" aria-label="Previous section" disabled={secNow.index === 0} onClick={() => { update(t => goSection(t, secNow.index - 1)); setTouched({ label: "section", text: track.sections![secNow.index - 1].name }); }}>‹</button>
                    <span className="st-ss st-secname">{secNow.section.name} · {secNow.index + 1} of {track.sections!.length}</span>
                    <button type="button" className="st-tag" aria-label="Next section" disabled={secNow.index >= track.sections!.length - 1} onClick={() => { update(t => goSection(t, secNow.index + 1)); setTouched({ label: "section", text: track.sections![secNow.index + 1].name }); }}>›</button>
                  </>
                ) : track.sections?.length ? (
                  <><span className="st-ss st-secname">one loop, {track.sections.length} sections</span>
                    <button type="button" className="st-tag" onClick={() => update(t => goSection(t, 0))}>edit {track.sections[0].name}</button></>
                ) : <span className="st-ss st-secname">your loop</span>}
                <span style={{ flex: 1 }} />
                <button type="button" className="st-tag st-commit" aria-label="Commit: copy this loop into the next section and go there"
                  onClick={() => { const next = commitLoop(track); update(() => next); setTouched({ label: "committed", text: `now in ${next.sections![next.at!].name}` }); }}>commit</button>
              </div>
            <div className={`st-pick ${TYPE[sel.type].surfaces.length + 1 + (playerKind ? 1 : 0) > 4 ? "is-5" : ""}`} style={{ gridTemplateColumns: `repeat(${TYPE[sel.type].surfaces.length + 1 + (playerKind ? 1 : 0)},minmax(0,1fr))` }}>
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
              {playerKind ? (
                <button type="button" className={`m1-m is-wide st-vk ${sel.surface === "player" ? "is-on" : ""}`} aria-pressed={sel.surface === "player"} onClick={() => chooseSurface("player")}>
                  <span className={`m1-dot ${sel.surface === "player" ? "is-on" : ""}`} style={{ ["--c" as string]: TYPE[sel.type].color } as CSSProperties} />{playerKind === "drummer" ? "drummer" : "bass player"}
                </button>
              ) : null}
            </div>
            <div style={{ height: 8, flex: "none" }} />
            {sel.surface === "player" && playerKind && (
              <PlayerSurface key={sel.id} kind={playerKind} settings={sel.player} color={TYPE[sel.type].color}
                onApply={(p, first) => { start(); update(t => applyPlayer(t, playerKind, sel.id, p), first); setTouched({ label: `${playerKind === "drummer" ? "drummer" : "bass player"} · complexity, intensity`, text: `${Math.round(p.complexity * 100)} · ${Math.round(p.intensity * 100)}` }); }}
                note={<>{`writes notes into your ${TYPE[sel.type].label}${playerKind === "drummer" && track.layers.some(l => l.type === "hats") ? " and hats" : ""}. undo brings yours back`}
                  {track.sections?.length ? ". softer in an intro or break, harder in a drop" : ""}
                  {playerKind === "bass" ? (track.chords?.some(Boolean) ? ". follows the chord track" : `. no chord track: plays ${keyName(track.root, scaleOf(track))}'s root`) : ""}</>} />
            )}
            {sel.surface === "own" && ctx && sel.type === "bass" && <GlideSurface ctx={ctx} />}
            {sel.surface === "own" && ctx && sel.type === "drums" && <CircleSurface ctx={ctx} />}
            {sel.surface === "own" && ctx && sel.type === "chords" && <ChordSurface ctx={ctx} />}
            {sel.surface === "own" && ctx && sel.type === "lead" && <XYSurface ctx={ctx} />}
            {sel.surface === "own" && ctx && sel.type === "hats" && <RollsSurface ctx={ctx} rate={rate} setRate={setRate} />}
            {sel.surface === "own" && ctx && sel.type === "fx" && <RiserSurface ctx={ctx} />}
            {sel.surface === "own" && sel.type === "sample" && <SampleLoader layer={sel} onPatch={patchSel} onPreview={slot => { start(); engine.noteOn(selIndex, SAMPLER_NOTE_BASE + slot, 0.9); window.setTimeout(() => engine.noteOff(selIndex, SAMPLER_NOTE_BASE + slot), 600); }} />}
            {sel.surface === "pads" && sel.type === "sample" && <SamplePads layer={sel} hits={hits} rings={rings} noteHandlers={noteHandlers} />}
            {sel.surface === "pads" && drumLike && (
              <DrumPads layer={sel} hits={hits} rings={rings} noteHandlers={noteHandlers} />
            )}
            {sel.surface === "pads" && sel.type === "fx" && <FxPads layer={sel} hits={hits} rings={rings} noteHandlers={noteHandlers} />}
            {sel.surface === "pads" && !drumLike && sel.type !== "fx" && sel.type !== "sample" && (
              <ScalePads layer={sel} root={sel.type === "bass" ? bassRoot(track) : 45 + ((track.root % 12) - 9)} scale={scaleOf(track)} held={held} hits={hits} rings={rings} noteHandlers={noteHandlers} chord={chordNow} />
            )}
            {sel.surface === "keys" && sel.type !== "fx" && (
              <Keys drum={drumLike} held={held} hits={hits} layerId={sel.id} noteHandlers={noteHandlers} root={track.root} scale={scaleOf(track)} chord={chordNow} />
            )}
            {sel.surface === "steps" && laneLike && (
              <DrumSteps layer={sel} page={pageNow} pages={stepPages} setPage={setPage} playStep={partPlayStep} grid={grid} bars={bars} setBars={setBars} lockAt={lockAt} dice={stepsExtra} lockRow={chanceRow} partSteps={plen !== null ? partSteps : undefined} tag={partTag}
                onHold={(note, step) => holdStep(note, step, Math.min(0.2, grid))} onRelease={() => setLockAt(null)} onClearLocks={clearLocks}
                onToggle={(note, step) => patchSel(l => ({ ...l, events: toggleStep(l.events, note, step, grid, Math.min(0.2, grid)) }))} />
            )}
            {sel.surface === "steps" && !laneLike && (
              <MelodicSteps layer={sel} page={pageNow} pages={stepPages} setPage={setPage} playStep={partPlayStep} grid={grid} bars={bars} setBars={setBars} lockAt={lockAt} dice={stepsExtra} lockRow={chanceRow} partSteps={plen !== null ? partSteps : undefined} tag={partTag}
                onHold={(_, step) => holdStep(null, step, grid)} onRelease={() => setLockAt(null)} onClearLocks={clearLocks}
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
                      setShift((b === "sound" || b === "fx") && bank === b ? !shift : false);
                      setBank(b);
                      setTouched(null);
                    }}>{b === "sound" && shift ? "sound 2" : b === "fx" && bank === "fx" && shift ? "filter" : b}</button>
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
            <div className="m1-modrow">
            {sel && sourcesFor(TYPE[sel.type].engine).length && !lockAt ? (
              <ModChips sources={sourcesFor(TYPE[sel.type].engine)} used={src => sourceUsed(TYPE[sel.type].engine, sel.params, sel.mods, src)} edit={modEdit}
                label={src => srcLabel(TYPE[sel.type].engine, src)}
                onEdit={src => { setModEdit(src); setTouched(src ? { label: srcLabel(TYPE[sel.type].engine, src), text: "set amounts" } : null); }}
                onOver={setDropOver}
                onDrop={(src, to) => {
                  const k = knobs.find(x => x.index === to);
                  if (!k || !canTake(k.spec.key)) return;
                  patchMod(assign(TYPE[sel.type].engine, sel.params, sel.mods, src, to), `${srcLabel(TYPE[sel.type].engine, src)} to ${k.spec.label}`, "modulating");
                }} />
            ) : <span style={{ flex: 1 }} />}
            {!lockAt ? <ABKey {...ab} /> : null}
            </div>
            {modEdit && sel && hasLayerLfo(TYPE[sel.type].engine) && !lockAt ? (
              <SourcePanel engine={TYPE[sel.type].engine} src={modEdit} value={i => paramOf(sel, i)} onParam={(i, spec, v) => setParam(i, spec, v)} />
            ) : null}
            {bank === "sound" ? <StudioPics layer={lockAt ? { ...sel, params: { ...sel.params, ...(sel.events.find(lockMatch(lockAt))?.p ?? {}) } } : sel} keys={knobs.map(k => k.spec.key)} clock={clock} onParam={setParam} /> : null}
            <div className="m1-g st-knobs" ref={knobsRef}>
              {knobs.map(({ spec, index }, i) => {
                const eng = TYPE[sel.type].engine;
                const rs = liveRings.get(index) ?? [];
                const mine = modEdit ? rs.find(r => r.src === modEdit) : undefined;
                const takes = sourcesFor(eng).length > 0 && canTake(spec.key) && !lockAt;
                return (
                  <Knob key={`${bank}${index}`} label={spec.label} size={32} color={KNOB_CAPS[i] ?? type!.color} title={elsewhereLine(spec.key) ?? undefined}
                    {...bind(spec, lockedValue(index) ?? paramOf(sel, index))} detents={spec.key === "character" || spec.key === "lpkind" || spec.key === "lfoto" ? 3 : undefined}
                    value={lockedValue(index) ?? paramOf(sel, index)} defaultValue={spec.default} tipValue={bigText(spec, lockedValue(index) ?? paramOf(sel, index))}
                    mods={rs.map(r => ({ color: SRC_COLOR[r.src], amt: r.amt, bipolar: r.bipolar }))} liveIndex={index}
                    modTo={takes ? index : undefined} drop={dropOver === index && takes}
                    overlay={modEdit && takes ? (
                      <ModOverlay src={modEdit} ring={mine} knob={spec.label}
                        onAssign={() => patchMod(assign(eng, sel.params, sel.mods, modEdit, index), `${srcLabel(eng, modEdit)} to ${spec.label}`, "modulating")}
                        onAmount={a => mine && patchMod(setAmount(eng, sel.mods, mine, a), `${srcLabel(eng, modEdit)} on ${spec.label}`, `${Math.round(a * 100)}%`)}
                        onRemove={() => mine && patchMod(removeRing(eng, sel.mods, mine), `${srcLabel(eng, modEdit)} on ${spec.label}`, "off")} />
                    ) : undefined}
                    onChange={v => setParam(index, spec, v)} />
                );
              })}
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
        <Key label="reset" onClick={() => { setMode("play"); setSongsOpen(false); setKeyOpen(false); setWavOpen(false); setMidiOpen(false); setAdding(false); setSureReset(null); setResetOpen(o => !o); }} ariaPressed={resetOpen} ariaLabel="Reset: clear notes, sounds or the whole song">
          <Icon name="reset" />
        </Key>
        <Key label="to live" disabled={!track.layers.length} ariaPressed={midiOpen}
          onClick={() => { if (!variesByPass(track)) { downloadSongMidi(track); return; } setMode("play"); setSongsOpen(false); setAdding(false); setResetOpen(false); setKeyOpen(false); setWavOpen(false); setMidiOpen(o => !o); }}
          ariaLabel={variesByPass(track) ? "Export to Ableton Live as MIDI: pick as heard or every note" : "Export to Ableton Live as MIDI"}>
          <Icon name="out" />
        </Key>
        <Key label="wav" onClick={() => { setMode("play"); setSongsOpen(false); setAdding(false); setResetOpen(false); setKeyOpen(false); setMidiOpen(false); setWavOpen(o => !o); }} ariaPressed={wavOpen} disabled={!track.layers.length}
          ariaLabel="Save the song as a wav: pick streaming (-14 LUFS) or club (-9 LUFS) loudness">
          <Icon name="out" />
        </Key>
      </div>
    </div>
  );
}

/** A captured take as ghost notes over the loop, until you keep it or drop it. */
function CapturePreview({ track, layer, events, onKeep, onDrop }: { track: TrackV2; layer: LayerV2; events: NoteEvent[]; onKeep: () => void; onDrop: () => void }) {
  const c = TYPE[layer.type].color;
  const notes = [...new Set(events.map(e => e.note))].sort((a, b) => b - a);
  const W = 300, H = 26, rh = H / Math.max(1, Math.min(8, notes.length));
  const row = (n: number) => Math.min(7, notes.indexOf(n));
  return (
    <div className="st-capview">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="st-ss" style={{ color: "#EDEDF0" }}>captured · {events.length} note{events.length === 1 ? "" : "s"}</span>
        <span style={{ flex: 1 }} />
        <button type="button" className="st-chip st-capbtn" onClick={onDrop}>drop</button>
        <button type="button" className="st-chip st-capbtn is-keep" onClick={onKeep}>keep it</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} role="img" aria-label={`${events.length} captured notes, not kept yet`} style={{ display: "block", marginTop: 6 }}>
        {Array.from({ length: track.loop + 1 }, (_, b) => <path key={b} d={`M${(b / track.loop) * W} 0V${H}`} stroke="rgba(255,255,255,.12)" />)}
        {events.map((e, i) => (
          <rect key={i} x={(e.start / track.loop) * W + 0.5} y={row(e.note) * rh + 1} width={Math.max(3, (e.len / track.loop) * W - 1)} height={Math.max(3, rh - 2)} rx={1.5}
            fill={c} fillOpacity={0.18 + 0.3 * e.vel} stroke={c} strokeDasharray="3 2" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </div>
  );
}

/** The pictures for the knobs on this page: the envelope (attack, decay, release) and the filter (cutoff, res, env). */
function StudioPics({ layer, keys, clock, onParam }: { layer: LayerV2; keys: string[]; clock: NoteClock; onParam?: (index: number, spec: ParamSpec, v: number) => void }) {
  const engine = TYPE[layer.type].engine;
  const params = layer.params;
  const pad = effectivePad(layer);
  const env = ampEnv(engine, params, pad);
  const showEnv = !!env && (engine === "drums" ? keys.includes("decay") : keys.some(k => k === "attack" || k === "release" || k === "decay"));
  const table = (INSTRUMENT_TABLES[engine] ?? []) as unknown as ParamSpec[];
  const spec = (key: string) => table.find(p => p.key === key);
  const cut = spec("cutoff"), res = spec("res"), amt = spec("env");
  const chr = table.find(p => CHARACTER_KEYS.includes(p.key));
  const showFilter = !!cut && !!res && keys.some(k => k === "cutoff" || k === "res" || k === "env" || CHARACTER_KEYS.includes(k));
  if (!showEnv && !showFilter) return null;
  const n = (s: ParamSpec | undefined) => (s ? paramOf(layer, s.index) : 0);
  // Drag on the pictures: the knee is cutoff and resonance, the envelope's corners its times. The knobs follow.
  const specAt = (index: number, key: string) => table.find(p => p.index === index) ?? (engine === "drums" ? ({ ...DRUM_PAD_PARAMS[1], index } as unknown as ParamSpec) : undefined) ?? table.find(p => p.key === key);
  const hs = envHandles(engine, params, pad);
  const envSet = (h?: { index: number; key: string; toN: (s: number) => number }) => (h && onParam ? (s: number) => { const sp = specAt(h.index, h.key); if (sp) onParam(h.index, sp, h.toN(s)); } : undefined);
  return (
    <div className="st-pics">
      {showFilter && cut && res ? (
        <FilterView cutoff={toValue(cut, n(cut))} res={toValue(res, n(res))} amount={n(amt)} fenv={filterEnv(engine, params)} clock={clock} color={PIC.filter} character={chr ? characterOf(n(chr)) : "prd"} lowCut={toValue(LAYER_PARAMS[3], paramOf(layer, 3))}
          onCutoff={onParam ? hz => onParam(cut.index, cut, fromValue(cut, hz)) : undefined} onRes={onParam ? r => onParam(res.index, res, fromValue(res, r)) : undefined} />
      ) : null}
      {showEnv && env ? <EnvView env={env} clock={clock} color={PIC.env} label={engine === "drums" ? DRUM_PAD_NAMES[pad] : "envelope"} drag={{ a: envSet(hs.a), d: envSet(hs.d), r: envSet(hs.r) }} /> : null}
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
type Rings = Record<string, { t: number; v: number }>;
/** The hit ring for one pad, remounted on every hit so its flash replays. */
const ringOf = (rings: Rings, key: string) => (rings[key] ? <PadRing key={rings[key].t} v={rings[key].v} /> : null);

/** 16-pad drum rack, kick bottom left. Resting pads glow faintly; a hit ripples out. */
function DrumPads({ layer, hits, rings, noteHandlers }: { layer: LayerV2; hits: Record<string, number>; rings: Rings; noteHandlers: NoteHandlers }) {
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
            <i className="pad-vel" />
            <span className="st-lb">{DRUM_PAD_NAMES[p]}</span>
            {ringOf(rings, `${layer.id}:${note}`)}
          </button>
        );
      })}
    </div>
  );
}

/** Scale grid: only notes in key, rows a fourth apart, roots glow. */
function ScalePads({ layer, root, scale, held, hits, rings, noteHandlers, chord }: { layer: LayerV2; root: number; scale: ScaleName; held: Set<number>; hits: Record<string, number>; rings: Rings; noteHandlers: NoteHandlers; chord: Chord | null }) {
  const c = TYPE[layer.type].color;
  const notes = padGrid(root, scale);
  return (
    <div className="st-tray" style={{ gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "repeat(4,1fr)" }}>
      {notes.map((n, i) => {
        const on = held.has(n) || !!hits[`${layer.id}:${n}`];
        const isRoot = pitchClass(n) === pitchClass(root);
        const name = noteName(n);
        return (
          <button key={i} type="button" className={`st-sp ${on ? "is-lit" : isRoot ? "is-dim" : ""} ${inChord(chord, n) ? "is-sug" : ""}`} style={{ ["--c" as string]: c } as CSSProperties}
            aria-label={`Note ${name}${isRoot ? ", root" : ""}${inChord(chord, n) ? ", in the chord now" : ""}`} {...noteHandlers(n)}>
            <i className="pad-vel" />
            <span className="st-lb" style={{ fontSize: 15 }}>{name.replace(/-?\d+$/, "")}<span style={{ fontSize: 10, opacity: 0.6 }}>{name.match(/-?\d+$/)?.[0]}</span></span>
            {ringOf(rings, `${layer.id}:${n}`)}
          </button>
        );
      })}
    </div>
  );
}

/** Eight white keys with black keys set between them. Drums: one sound per key. */
function Keys({ drum, held, hits, layerId, noteHandlers, root, scale, chord }: { drum: boolean; held: Set<number>; hits: Record<string, number>; layerId: string; noteHandlers: NoteHandlers; root: number; scale: ScaleName; chord: Chord | null }) {
  const row = keyRow(36);
  const whites = drum ? DRUM_PAD_NOTES.slice(0, 8) : row.white;
  const lit = (n: number) => held.has(n) || !!hits[`${layerId}:${n}`];
  // Live's highlight scale: keys outside the key are dim, the root is marked. They still play.
  const tone = (n: number) => (drum ? "" : `${inScale(n, root, scale) ? "" : " is-out"}${pitchClass(n) === pitchClass(root) ? " is-root" : ""}${inChord(chord, n) ? " is-sug" : ""}`);
  return (
    <div className={`st-keys ${drum ? "is-drum" : ""}`}>
      <div className="st-keys-row">
        {whites.map((n, i) => (
          <button key={i} type="button" className={`m1-m is-wide st-key ${lit(n) ? "is-hit" : ""}${tone(n)}`} aria-label={drum ? DRUM_KEY_LABELS[i] : `Note ${noteName(n)}${inScale(n, root, scale) ? "" : ", outside the key"}`} {...noteHandlers(n)}>
            <span className="m1-cap" />
            <span className="m1-ml">{drum ? DRUM_KEY_LABELS[i] : noteName(n).replace(/\d+$/, "")}</span>
          </button>
        ))}
      </div>
      {!drum &&
        row.black.map(b => (
          <button key={b.note} type="button" aria-label={`Note ${noteName(b.note)}${inScale(b.note, root, scale) ? "" : ", outside the key"}`} className={`m1-cap is-blk st-sharp ${lit(b.note) ? "is-hit" : ""}${tone(b.note)}`}
            style={{ left: `calc((100% - 35px) / 8 * ${b.after + 1} + ${5 * (b.after + 1)}px - 2.5px - 15px)` }} {...noteHandlers(b.note)} />
        ))}
    </div>
  );
}

const FX_LANES = [36, 38, 39, 41];

/** Back, forward and the bars. A page is what fits on screen; a bar is four beats. */
function PageBar({ page, pages, setPage, bars, setBars, perPage, grid, dice, tag }: { page: number; pages: number; setPage: (p: number) => void; bars: number; setBars: (n: number) => void; perPage: number; grid: number; dice?: React.ReactNode; tag?: React.ReactNode }) {
  const perBar = 4 / grid;
  const from = page * perPage + 1;
  const to = (page + 1) * perPage;
  const bar = Math.floor((page * perPage) / perBar) + 1;
  return (
    <>
    {dice ? <div className="st-dicerow">{dice}</div> : null}
    <div className="st-pages" style={{ alignItems: "center", gap: 6 }}>
      <button type="button" className="st-tag" aria-label="Previous steps" disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button>
      <span className="st-ss" style={{ minWidth: 88, textAlign: "center" }}>{bars > 1 ? `bar ${bar} · ` : ""}{from}-{to}</span>
      <button type="button" className="st-tag" aria-label="Next steps" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>›</button>
      <span style={{ flex: 1 }} />
      {tag}
      <span className="st-ss">bars</span>
      {[1, 2, 3, 4].map(n => (
        <button key={n} type="button" className={`st-tag ${bars === n ? "is-on" : ""}`} aria-pressed={bars === n} aria-label={`${n} bar${n > 1 ? "s" : ""}`} onClick={() => setBars(n)}>{n}</button>
      ))}
    </div>
    </>
  );
}

type StepsProps = { layer: LayerV2; page: number; pages: number; setPage: (p: number) => void; playStep: number; grid: number; bars: number; setBars: (n: number) => void;
  lockAt: LockAt; onHold: (note: number | null, step: number) => void; onRelease: () => void; onClearLocks: () => void; dice?: React.ReactNode; lockRow?: React.ReactNode; partSteps?: number; tag?: React.ReactNode };

/** A step you can tap (on or off) or hold (lock knobs to it). Shift+Enter holds from the keyboard. */
function useStepPress(onTap: () => void, onHold: () => void, held: boolean, onRelease: () => void) {
  const t = useRef(0);
  const fired = useRef(false);
  return {
    onPointerDown: () => { fired.current = false; window.clearTimeout(t.current); t.current = window.setTimeout(() => { fired.current = true; onHold(); }, 380); },
    onPointerUp: () => window.clearTimeout(t.current),
    onPointerLeave: () => window.clearTimeout(t.current),
    onPointerCancel: () => window.clearTimeout(t.current),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    onClick: () => { if (fired.current) { fired.current = false; return; } if (held) { onRelease(); return; } onTap(); },
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); if (held) onRelease(); else onHold(); } if (e.key === "Escape" && held) onRelease(); },
  };
}

/** While a step is held: what to do, and a way to clear its locks or let go. Replaces the page bar. */
function LockBar({ at, layer, grid, onClear, onDone }: { at: NonNullable<LockAt>; layer: LayerV2; grid: number; onClear: () => void; onDone: () => void }) {
  const ev = layer.events.find(e => Math.abs(e.start - at.step * grid) < grid / 2 && (at.note === null || e.note === at.note));
  const n = ev?.p ? Object.keys(ev.p).length : 0;
  return (
    <div className="st-pages st-lockbar" role="status">
      <span className="st-lockdot" aria-hidden />
      <span className="st-ss" style={{ color: "var(--ink)" }}>step {at.step + 1} held</span>
      <span className="st-ss">{n ? `${n} p-lock${n > 1 ? "s" : ""}` : "turn a knob: a parameter lock (p-lock) for this step"}</span>
      <span style={{ flex: 1 }} />
      {n ? <button type="button" className="st-tag" onClick={onClear}>clear</button> : null}
      <button type="button" className="st-tag is-on" onClick={onDone}>done</button>
    </div>
  );
}

/** A lane per sound, 8 steps a page. The playing step glows. */
function DrumSteps({ layer, page, pages, setPage, playStep, grid, bars, setBars, onToggle, lockAt, onHold, onRelease, onClearLocks, dice, lockRow, partSteps, tag }: StepsProps & { onToggle: (note: number, step: number) => void }) {
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
          <LaneRow key={note} name={names[li]} note={note} layer={layer} page={page} playStep={playStep} color={c} grid={grid} onToggle={onToggle} lockAt={lockAt} onHold={onHold} onRelease={onRelease} partSteps={partSteps} />
        ))}
      </div>
      {lockAt ? <><LockBar at={lockAt} layer={layer} grid={grid} onClear={onClearLocks} onDone={onRelease} />{lockRow}</> : <PageBar page={page} pages={pages} setPage={setPage} bars={bars} setBars={setBars} perPage={8} grid={grid} dice={dice} tag={tag} />}
    </>
  );
}

/** One step: tap to switch it, hold to lock knobs to it. A step with locks shows a second colour. */
function StepBtn({ cls, color, label, pressed, locked, held, onTap, onHold, onRelease, children }: { cls: string; color: string; label: string; pressed: boolean; locked: boolean; held: boolean; onTap: () => void; onHold: () => void; onRelease: () => void; children?: React.ReactNode }) {
  const press = useStepPress(onTap, onHold, held, onRelease);
  return (
    <button type="button" className={`st-sp ${cls} ${locked ? "is-lock" : ""} ${held ? "is-held" : ""}`} style={{ ["--c" as string]: color } as CSSProperties}
      aria-label={`${label}${locked ? ", has parameter locks" : ""}${held ? ", held" : ""}`} aria-pressed={pressed} aria-keyshortcuts="Shift+Enter" {...press}>
      {children}
    </button>
  );
}

function LaneRow({ name, note, layer, page, playStep, color, grid, onToggle, lockAt, onHold, onRelease, partSteps }: { name: string; note: number; layer: LayerV2; page: number; playStep: number; color: string; grid: number; onToggle: (note: number, step: number) => void; lockAt: LockAt; onHold: (note: number | null, step: number) => void; onRelease: () => void; partSteps?: number }) {
  return (
    <>
      <div className="st-lane">{name}</div>
      {Array.from({ length: 8 }, (_, k) => {
        const step = page * 8 + k;
        // Past the part's own length: not played, so dim and not tappable.
        if (partSteps !== undefined && step >= partSteps) return <span key={k} className="st-sp st-past" aria-hidden />;
        const ev = layer.events.find(e => e.note === note && Math.abs(e.start - step * grid) < grid / 2);
        const on = !!ev;
        const here = step === playStep;
        return (
          <StepBtn key={k} cls={on ? (here ? "is-lit" : "is-on") : here ? "is-dim" : ""} color={color} label={`${name} step ${step + 1} ${on ? "on" : "off"}${stepTag(ev) ? `, plays ${stepTag(ev)}` : ""}`} pressed={on}
            locked={!!ev?.p} held={!!lockAt && lockAt.step === step && lockAt.note === note}
            onTap={() => onToggle(note, step)} onHold={() => onHold(note, step)} onRelease={onRelease}>
            {stepTag(ev) ? <span className="st-ctag">{stepTag(ev)}</span> : null}
          </StepBtn>
        );
      })}
    </>
  );
}

function MelodicSteps({ layer, page, pages, setPage, playStep, grid, bars, setBars, onToggle, lockAt, onHold, onRelease, onClearLocks, dice, lockRow, partSteps, tag }: StepsProps & { onToggle: (step: number) => void }) {
  const c = TYPE[layer.type].color;
  return (
    <>
      <div className="st-tray" style={{ gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "repeat(4,1fr)" }}>
        {Array.from({ length: 16 }, (_, k) => {
          const s = page * 16 + k;
          if (partSteps !== undefined && s >= partSteps) return <span key={k} className="st-sp st-past" aria-hidden />;
          const ev = layer.events.find(e => Math.abs(e.start - s * grid) < grid / 2);
          const here = s === playStep;
          return (
            <StepBtn key={k} cls={ev ? (here ? "is-lit" : "is-on") : here ? "is-dim" : ""} color={c} label={`Step ${s + 1} ${ev ? `on, ${noteName(ev.note)}` : "off"}${stepTag(ev) ? `, plays ${stepTag(ev)}` : ""}`} pressed={!!ev}
              locked={!!ev?.p} held={!!lockAt && lockAt.step === s} onTap={() => onToggle(s)} onHold={() => onHold(null, s)} onRelease={onRelease}>
              <span className="st-lv">{s + 1}</span>
              {ev ? <span className="st-lb">{noteName(ev.note)}</span> : null}
              {stepTag(ev) ? <span className="st-ctag">{stepTag(ev)}</span> : null}
            </StepBtn>
          );
        })}
      </div>
      {lockAt ? <><LockBar at={lockAt} layer={layer} grid={grid} onClear={onClearLocks} onDone={onRelease} />{lockRow}</> : <PageBar page={page} pages={pages} setPage={setPage} bars={bars} setBars={setBars} perPage={16} grid={grid} dice={dice} tag={tag} />}
    </>
  );
}

/** 16 slots as pads. A slot with a sound lights on a hit; an empty one is dim. */
function SamplePads({ layer, hits, rings, noteHandlers }: { layer: LayerV2; hits: Record<string, number>; rings: Rings; noteHandlers: NoteHandlers }) {
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
            {ringOf(rings, `${layer.id}:${note}`)}
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
function FxPads({ layer, hits, rings, noteHandlers }: { layer: LayerV2; hits: Record<string, number>; rings: Rings; noteHandlers: NoteHandlers }) {
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
            {ringOf(rings, `${layer.id}:${note}`)}
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

/**
 * The song's key: a root and one of Live 12's scales. Every keyboard, pad, lane and the note grid follow
 * it. Like Live, changing it does not move your notes; "fit to scale" (Live's name) moves the ones outside.
 */
function KeyPanel({ track, update, onPreview, now }: { track: TrackV2; update: (fn: (t: TrackV2) => TrackV2, undoable?: boolean) => void; onPreview: (notes: number[]) => void; now: number }) {
  const [tab, setTab] = useState<"key" | "chords">("key");
  const scale = scaleOf(track);
  const melodic = (l: LayerV2) => l.type === "bass" || l.type === "chords" || l.type === "lead";
  const outside = track.layers.filter(melodic).reduce((n, l) => n + l.events.filter(e => !inScale(e.note, track.root, scale)).length, 0);
  const setKey = (root: number, sc: ScaleName) => {
    update(t => ({ ...t, root, scale: sc }));
    const s = SCALES[sc] as readonly number[];
    s.forEach((iv, i) => window.setTimeout(() => onPreview([57 + ((root - 45 + 120) % 12) + iv]), i * 90));
  };
  const fit = () => update(t => ({ ...t, layers: t.layers.map(l => (melodic(l) ? { ...l, events: l.events.map(e => ({ ...e, note: snapToScale(e.note, t.root, scaleOf(t)) })) } : l)) }));
  const chords = track.chords ?? [];
  const hasChords = chords.some(Boolean);
  const chordsPart = track.layers.find(l => l.type === "chords");
  // FL's chord stamp: the chord track written into the chords part as notes you can edit. One undo step.
  const writeChords = () => update(t => {
    const evs = chordEvents(t.chords ?? [], t.loop);
    const has = t.layers.find(l => l.type === "chords");
    if (has) return { ...t, layers: t.layers.map(l => (l.id === has.id ? { ...l, events: evs } : l)) };
    if (t.layers.length >= MAX_LAYERS) return t;
    return { ...t, layers: [...t.layers, { ...newLayerV2("chords", "chord track"), events: evs }] };
  });
  return (
    <>
      <div className="st-keytabs" role="tablist" aria-label="Key or chord track">
        {(["key", "chords"] as const).map(k => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={`st-tag ${tab === k ? "is-on" : ""}`} onClick={() => setTab(k)}>{k === "key" ? `key · ${keyName(track.root, scale)}` : `chord track${hasChords ? ` · ${chords.filter(Boolean).length}` : ""}`}</button>
        ))}
      </div>
      {tab === "key" ? (
        <div className="st-keypanel">
          <div className="st-roots" role="radiogroup" aria-label="Root note">
            {NOTE_NAMES.map((n, pc) => {
              const on = pitchClass(track.root) === pc;
              return <button key={n} type="button" role="radio" aria-checked={on} className={`st-tag ${on ? "is-on" : ""}`} onClick={() => setKey(33 + ((pc - 9 + 12) % 12) + 12, scale)}>{n}</button>;
            })}
          </div>
          <div className="st-scales" role="radiogroup" aria-label="Scale">
            {SCALE_NAMES.map(sc => {
              const on = sc === scale;
              return <button key={sc} type="button" role="radio" aria-checked={on} className={`st-tag ${on ? "is-on" : ""}`} onClick={() => setKey(track.root, sc)}>{sc}<small>{(SCALES[sc] as readonly number[]).length}</small></button>;
            })}
          </div>
          <div className="st-ss st-keyfoot">
            {outside ? <><span>{outside} note{outside > 1 ? "s" : ""} outside the key</span><button type="button" className="st-tag" onClick={fit}>fit to scale</button></> : <span>every note is in key</span>}
          </div>
        </div>
      ) : (
        <div className="st-keypanel" style={{ overflowY: "auto" }}>
          <ChordTrackEditor track={track} chords={chords} now={now} onChange={c => update(t => withChordTrack(t, c))} onPreview={c => onPreview(chordMidi(c, 52))} />
          <div className="st-ss st-keyfoot">
            {hasChords ? (
              <><span>{chordsPart ? "your chords part can play it" : "no chords part yet"}</span>
                <button type="button" className="st-tag" disabled={!chordsPart && track.layers.length >= MAX_LAYERS} onClick={writeChords}>{chordsPart ? "write into chords" : "add chords that play it"}</button></>
            ) : <span>pick a chord for each bar. bass, lead and chord pads light its notes</span>}
          </div>
        </div>
      )}
    </>
  );
}
