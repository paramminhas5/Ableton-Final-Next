"use client";
/**
 * Keeps the engine in step with the track: instrument per layer, every knob, the
 * pattern, duck routing, mute and solo, tempo and loop length. Sends only what changed.
 */
import { useEffect, useRef } from "react";
import { getEngine, INSTRUMENT_BASE, LAYER_PARAMS, MASTER_PARAMS, type Engine } from "@/engine";
import { pushSamples } from "@/lib/samples";
import { instrumentParamCount, masterOf, MAX_LAYERS, paramOf, TYPE, type TrackV2 } from "@/lib/track2";

const LEVEL = LAYER_PARAMS.find(p => p.id === "mix.level")!.index;
const DUCK = LAYER_PARAMS.find(p => p.id === "mix.duck")!.index;

type Sent = { inst: string; events: string; duck: string; params: Map<number, number> };

type Last = { bpm: number; loop: number; swing?: number; master?: number[]; samples?: Set<string> };

export function syncEngine(engine: Engine, t: TrackV2, sent: Sent[], last: Last) {
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
    const ev = JSON.stringify(l.events);
    if (s.events !== ev) {
      engine.pattern(i, l.events);
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

/** Start the engine on the first touch (browsers need a gesture) and keep it synced. */
export function useEngineTrack(track: TrackV2) {
  const engine = getEngine();
  const started = useRef(false);
  const sent = useRef<Sent[]>([]);
  const last = useRef<Last>({ bpm: 0, loop: 0 });
  const latest = useRef(track);
  latest.current = track;

  const start = () => {
    if (started.current) return;
    started.current = true;
    void engine.start().then(() => syncEngine(engine, latest.current, sent.current, last.current));
    syncEngine(engine, latest.current, sent.current, last.current);
  };

  useEffect(() => {
    if (started.current) syncEngine(engine, track, sent.current, last.current);
  }, [engine, track]);

  useEffect(() => () => engine.stop(), [engine]);

  return { engine, start, started };
}
