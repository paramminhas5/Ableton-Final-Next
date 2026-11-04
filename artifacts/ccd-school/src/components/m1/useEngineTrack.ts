"use client";
/**
 * Keeps the engine in step with the track: instrument per layer, every knob, the
 * pattern, duck routing, mute and solo, tempo and loop length. Sends only what changed.
 */
import { useEffect, useRef } from "react";
import { getEngine, INSTRUMENT_BASE, LAYER_PARAMS, MASTER_PARAMS, type Engine } from "@/engine";
import { pushSamples } from "@/lib/samples";
import { arranged } from "@/lib/arrange";
import { REAL_KIT_ID, realKitLayer } from "@/lib/realKit";
import { instrumentParamCount, masterOf, MAX_LAYERS, paramOf, TYPE, type TrackV2 } from "@/lib/track2";

const LEVEL = LAYER_PARAMS.find(p => p.id === "mix.level")!.index;
const DUCK = LAYER_PARAMS.find(p => p.id === "mix.duck")!.index;

type Sent = { inst: string; events: string; duck: string; params: Map<number, number> };

type Last = { bpm: number; loop: number; swing?: number; master?: number[]; samples?: Set<string> };

export function syncEngine(engine: Engine, song: TrackV2, sent: Sent[], last: Last) {
  // An arranged song plays as one long timeline of its sections.
  // The recorded kit plays whatever your drums and hats play now, including parts added after you chose it.
  const kit = song.layers.some(l => l.id === REAL_KIT_ID) ? realKitLayer(song).events : null;
  const t = arranged(kit ? { ...song, layers: song.layers.map(l => (l.id === REAL_KIT_ID ? { ...l, events: kit } : l)) } : song);
  const m = (last.master ??= []);
  for (let i = 0; i < MASTER_PARAMS.length; i++) {
    const v = masterOf(t, i);
    if (m[i] !== v) {
      engine.master(i, v);
      m[i] = v;
    }
  }
  if (last.bpm !== t.bpm) {
    engine.tempo(t.bpm);
    last.bpm = t.bpm;
  }
  if (last.swing !== t.swing) {
    engine.swing(t.swing ?? 0);
    last.swing = t.swing;
  }
  if (last.loop !== t.loop) {
    engine.loop(t.loop);
    last.loop = t.loop;
  }
  void pushSamples(engine, t.layers, (last.samples ??= new Set()));
  const anySolo = t.layers.some(l => l.solo);
  for (let i = 0; i < MAX_LAYERS; i++) {
    const l = t.layers[i];
    const s = (sent[i] ??= { inst: "", events: "", duck: "", params: new Map() });
    const inst = l ? TYPE[l.type].engine : "none";
    if (s.inst !== inst) {
      last.samples?.clear();
      engine.instrument(i, inst);
      s.inst = inst;
      s.params.clear();
      s.events = "";
    }
    if (!l) continue;
    // Every param the layer might have, so a reset to default reaches the engine too.
    const count = INSTRUMENT_BASE + instrumentParamCount(TYPE[l.type].engine);
    const silent = anySolo ? !l.solo : l.mute;
    for (let p = 0; p < count; p++) {
      if (p >= LAYER_PARAMS.length && p < INSTRUMENT_BASE) continue;
      const v = p === LEVEL && silent ? 0 : paramOf(l, p);
      if (s.params.get(p) !== v) {
        engine.param(i, p, v);
        s.params.set(p, v);
      }
    }
    const sw = t.swing ?? 0;
    const ev = JSON.stringify(l.events) + "|" + sw;
    if (s.events !== ev) {
      engine.pattern(i, swung(l.events, sw));
      s.events = ev;
    }
    const srcIndex = l.duck.src ? t.layers.findIndex(x => x.id === l.duck.src) : -1;
    const duck = `${srcIndex}:${l.duck.note ?? -1}:${paramOf(l, DUCK) > 0}`;
    if (s.duck !== duck) {
      engine.duck(i, srcIndex, l.duck.note ?? -1);
      s.duck = duck;
    }
  }
}

// The engine is shared. When another screen has synced it since we last did, what we think we sent
// is stale, so we forget it and send everything again.
/**
 * Swing: every note on an off sixteenth (the "e" and "a" of one e and a) is pushed late. At 0.5 it
 * lands a third of the way to the next sixteenth, a triplet feel; at 0.75 it is heavy shuffle.
 * Done here, on the notes we send, so it reaches the engine and changes the moment the knob moves.
 */
export function swung<T extends { start: number }>(events: T[], amount: number): T[] {
  if (!amount) return events;
  const push = Math.min(0.75, Math.max(0, amount)) * (1 / 6);
  return events.map(e => {
    const q = e.start * 4;
    const near = Math.round(q);
    return Math.abs(q - near) < 0.08 && ((near % 2) + 2) % 2 === 1 ? { ...e, start: e.start + push } : e;
  });
}

let owner = 0;
let nextId = 1;
/** Which screen last synced the shared engine. */
export const engineOwner = () => owner;

/** Start the engine on the first touch (browsers need a gesture) and keep it synced. */
export function useEngineTrack(track: TrackV2) {
  const engine = getEngine();
  const id = useRef(0);
  if (!id.current) id.current = nextId++;
  const started = useRef(false);
  const sent = useRef<Sent[]>([]);
  const last = useRef<Last>({ bpm: 0, loop: 0 });
  const latest = useRef(track);
  latest.current = track;
  const sync = (t: TrackV2) => {
    if (owner !== id.current) { sent.current = []; last.current = { bpm: 0, loop: 0 }; owner = id.current; }
    syncEngine(engine, t, sent.current, last.current);
  };

  const booting = useRef<Promise<void> | null>(null);
  const start = () => {
    if (started.current) return;
    started.current = true;
    booting.current = engine.start().then(() => sync(latest.current));
    sync(latest.current);
  };
  /** Start (if needed), wait until the engine is up and holds the latest track, then resolve. */
  const ready = async () => {
    start();
    if (!booting.current) booting.current = engine.start();
    await booting.current;
    sync(latest.current);
  };

  useEffect(() => {
    if (started.current && owner === id.current) sync(track);
  }, [engine, track]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => engine.stop(), [engine]);

  return { engine, start, ready, started, id: id.current };
}
