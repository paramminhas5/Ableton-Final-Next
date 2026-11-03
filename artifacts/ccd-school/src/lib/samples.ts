"use client";
/**
 * Samples for sampler layers. The audio is decoded to mono and kept in this browser
 * (IndexedDB), keyed by layer id and slot; the engine gets a copy when it starts.
 * Nothing is uploaded. Files longer than 30 seconds are cut by the engine.
 */
import type { Engine } from "@/engine";

const DB = "ccd.samples.v1";
const STORE = "s";
export const SLOTS = 16;

type Rec = { data: Float32Array; rate: number };

function open(): Promise<IDBDatabase | null> {
  return new Promise(res => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(null);
    } catch {
      res(null);
    }
  });
}

const key = (layer: string, slot: number) => `${layer}:${slot}`;
const mem = new Map<string, Rec>();

export async function putSample(layer: string, slot: number, rec: Rec) {
  mem.set(key(layer, slot), rec);
  const db = await open();
  if (!db) return;
  await new Promise<void>(res => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(rec, key(layer, slot));
    tx.oncomplete = () => res();
    tx.onerror = () => res();
  });
}

export async function getSample(layer: string, slot: number): Promise<Rec | null> {
  const k = key(layer, slot);
  if (mem.has(k)) return mem.get(k)!;
  const db = await open();
  if (!db) return null;
  return new Promise(res => {
    const rq = db.transaction(STORE).objectStore(STORE).get(k);
    rq.onsuccess = () => {
      if (rq.result) mem.set(k, rq.result as Rec);
      res((rq.result as Rec) ?? null);
    };
    rq.onerror = () => res(null);
  });
}

export async function dropSample(layer: string, slot: number) {
  mem.delete(key(layer, slot));
  const db = await open();
  if (!db) return;
  db.transaction(STORE, "readwrite").objectStore(STORE).delete(key(layer, slot));
}

/** Mix a decoded buffer down to mono. */
export function toMono(chans: Float32Array[]): Float32Array {
  if (chans.length === 1) return new Float32Array(chans[0]);
  const n = chans[0].length;
  const out = new Float32Array(n);
  for (const c of chans) for (let i = 0; i < n; i++) out[i] += c[i] / chans.length;
  return out;
}

/** Decode any audio file the browser can play. */
export async function decodeFile(file: Blob): Promise<Rec> {
  const bytes = await file.arrayBuffer();
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  try {
    const buf = await ctx.decodeAudioData(bytes);
    const chans = Array.from({ length: buf.numberOfChannels }, (_, i) => buf.getChannelData(i));
    return { data: toMono(chans), rate: buf.sampleRate };
  } finally {
    void ctx.close();
  }
}

/** Send every stored sample of these layers to the engine (after it starts). */
export async function pushSamples(engine: Engine, layers: { id: string; samples?: Record<number, string> }[], sent: Set<string>) {
  layers.forEach((l, index) => {
    for (const s of Object.keys(l.samples ?? {})) {
      const slot = Number(s);
      const k = `${index}:${l.id}:${slot}`;
      if (sent.has(k)) continue;
      sent.add(k);
      void getSample(l.id, slot).then(r => {
        if (r) engine.loadSample(index, slot, r.data, r.rate);
        else sent.delete(k);
      });
    }
  });
}
