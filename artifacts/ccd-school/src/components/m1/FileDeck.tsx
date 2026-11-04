"use client";
/**
 * Your own audio file on a dj deck. It plays through the engine's output bus so it mixes with the other
 * deck, follows the mixer's fader, low eq and crossfader, and starts and stops with the transport. The file
 * never leaves this browser. Its bpm is guessed from the onsets, so the tempo fader can stretch it.
 */
import { useRef, useState } from "react";
import type { Engine } from "@/engine";
import { decodeFile } from "@/lib/samples";

/** A rough bpm from the energy peaks of the first 20 seconds, between 80 and 170. Pure. */
export function guessBpm(data: Float32Array, rate: number): number {
  const hop = Math.round(rate * 0.01);
  const n = Math.min(Math.floor(data.length / hop), 2000);
  const env = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let j = i * hop; j < (i + 1) * hop; j++) s += data[j] * data[j]; env[i] = Math.sqrt(s / hop); }
  const flux = new Float32Array(n);
  for (let i = 1; i < n; i++) flux[i] = Math.max(0, env[i] - env[i - 1]);
  let best = 120, bestScore = -1;
  for (let bpm = 80; bpm <= 170; bpm += 0.5) {
    const lag = (60 / bpm) / 0.01;
    let score = 0;
    for (let i = 0; i + Math.round(lag * 2) < n; i++) score += flux[i] * (flux[i + Math.round(lag)] + 0.5 * flux[i + Math.round(lag * 2)]);
    if (score > bestScore) { bestScore = score; best = bpm; }
  }
  return Math.round(best * 10) / 10;
}

export type FileDeckState = {
  name: string | null;
  bpm: number;
  load: (f: File) => Promise<void>;
  clear: () => void;
  /** Drive it from the mixer every render: on or off, gain (fader times crossfader), low eq 0..1, rate. */
  set: (engine: Engine, on: boolean, gain: number, low: number, rate: number) => void;
};

export function useFileDeck(id: string): FileDeckState {
  const buf = useRef<AudioBuffer | null>(null);
  const src = useRef<AudioBufferSourceNode | null>(null);
  const chain = useRef<{ gain: GainNode; low: BiquadFilterNode } | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [bpm, setBpm] = useState(120);
  const stop = () => { try { src.current?.stop(); } catch { /* not started */ } src.current = null; };
  return {
    name, bpm,
    load: async (f: File) => {
      const r = await decodeFile(f);
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const tmp = new Ctx();
      const b = tmp.createBuffer(1, Math.min(r.data.length, r.rate * 300), r.rate);
      b.copyToChannel(new Float32Array(r.data.subarray(0, b.length)), 0);
      void tmp.close();
      buf.current = b;
      stop();
      setBpm(guessBpm(r.data, r.rate));
      setName(f.name.replace(/\.[^.]+$/, "").toLowerCase().slice(0, 24));
    },
    clear: () => { stop(); buf.current = null; setName(null); },
    set: (engine, on, gain, low, rate) => {
      const a = engine.audio();
      if (!a || !buf.current) return;
      if (!chain.current) {
        const g = a.ctx.createGain(); const lo = a.ctx.createBiquadFilter(); lo.type = "lowshelf"; lo.frequency.value = 200;
        lo.connect(g); g.connect(a.out); chain.current = { gain: g, low: lo };
      }
      const c = chain.current;
      c.gain.gain.setTargetAtTime(Math.min(1, gain * 1.2), a.ctx.currentTime, 0.02);
      c.low.gain.setTargetAtTime((low - 0.5) * 30, a.ctx.currentTime, 0.02);
      if (on && !src.current) {
        const s = a.ctx.createBufferSource(); s.buffer = buf.current; s.loop = true; s.playbackRate.value = rate; s.connect(c.low); s.start(); src.current = s;
      } else if (!on && src.current) stop();
      if (src.current) src.current.playbackRate.setTargetAtTime(rate, a.ctx.currentTime, 0.05);
      void id;
    },
  };
}

export function FileDeck({ deck, label, onLoad }: { deck: FileDeckState; label: string; onLoad: (name: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <button type="button" className={`ls-chip ${deck.name ? "is-on" : ""}`} aria-label={deck.name ? `${label}: ${deck.name}, tap to remove` : `${label}: load a file`}
        onClick={() => { if (deck.name) { deck.clear(); onLoad(null); } else input.current?.click(); }}>
        {deck.name ? `${label}: ${deck.name}` : label}{deck.name ? <small>{deck.bpm} bpm · tap to remove</small> : <small>{err ?? "mp3, wav, m4a"}</small>}
      </button>
      <input ref={input} type="file" accept="audio/*" hidden onChange={async e => {
        const f = e.target.files?.[0]; if (!f) return;
        try { await deck.load(f); onLoad(f.name.replace(/\.[^.]+$/, "").toLowerCase().slice(0, 24)); setErr(null); } catch { setErr("couldn't open that file"); }
        e.target.value = "";
      }} />
    </>
  );
}
