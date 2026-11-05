"use client";
/**
 * DJ. One screen laid out like a two-deck controller: deck · mixer · deck, crossfader below.
 * Deck A plays your track, deck B plays a house loop at the same tempo.
 * The screen shows both waveforms, tempo, sync, and a beat count for the blend.
 */
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useTrack } from "@/lib/track";
import { playTrack, stopTrack } from "@/lib/track-engine";
import { ensureAudio, getCtx, getMaster, startLoop, type LoopHandle } from "@/lib/audio";
import { CAP, Fader, Icon, Key, Knob, LED, Pad, Screen } from "./controls";
import { CAT_SRC } from "./shell";

type Deck = { input: GainNode; low: BiquadFilterNode; filt: BiquadFilterNode; vol: GainNode };

function makeDeck(c: AudioContext): Deck {
  const input = c.createGain();
  const low = c.createBiquadFilter(); low.type = "lowshelf"; low.frequency.value = 180;
  const filt = c.createBiquadFilter(); filt.type = "allpass";
  const vol = c.createGain();
  input.connect(low).connect(filt).connect(vol).connect(getMaster());
  return { input, low, filt, vol };
}

function wave(seed: number, n = 96) {
  let x = seed * 9301 + 49297;
  return Array.from({ length: n }, (_, i) => {
    x = (x * 9301 + 49297) % 233280;
    const r = x / 233280;
    return Math.min(1, (0.35 + 0.5 * r) * ((i >> 4) % 4 === 3 ? 0.5 : 1) + (i % 8 === 0 ? 0.2 : 0));
  });
}
const WA = wave(3), WB = wave(9);

function Wave({ data, color, pos }: { data: number[]; color: string; pos: number }) {
  const w = 330, h = 34, n = data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden style={{ display: "block" }}>
      {data.map((a, i) => {
        const x = (i * w) / n, bh = a * (h / 2 - 2);
        return <rect key={i} x={x} y={h / 2 - bh} width={w / n - 1} height={bh * 2} fill={color} opacity={i / n > pos ? 1 : 0.45} />;
      })}
      <path d={`M${pos * w} 0V${h}`} stroke="#F3F2EF" strokeWidth={1.5} />
    </svg>
  );
}

function Jog({ color, playing, label }: { color: string; playing: boolean; label: string }) {
  const [rot, setRot] = useState(0);
  const last = useRef<number | null>(null);
  const centre = useRef({ x: 0, y: 0 });
  const down = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    centre.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    last.current = Math.atan2(e.clientY - centre.current.y, e.clientX - centre.current.x);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (last.current === null) return;
    const a = Math.atan2(e.clientY - centre.current.y, e.clientX - centre.current.x);
    setRot(r => r + ((a - last.current!) * 180) / Math.PI);
    last.current = a;
  };
  const size = 116;
  return (
    <div className="m1-jog" role="img" aria-label={`Jog wheel, deck ${label}`} onPointerDown={down} onPointerMove={move} onPointerUp={() => (last.current = null)}
      style={{ width: size, height: size }}>
      <div style={{ position: "absolute", inset: 5, borderRadius: "50%", boxShadow: `0 0 0 2px ${color}, 0 0 ${playing ? 12 : 4}px ${color}`, opacity: playing ? 1 : 0.6 }} />
      <div className="m1-plat" style={{ width: size - 28, height: size - 28, transform: `rotate(${rot}deg)` }}>
        <div style={{ width: size * 0.36, height: size * 0.36, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CAT_SRC} alt="" style={{ width: "70%" }} />
        </div>
        <span style={{ position: "absolute", top: 5, left: "50%", width: 2, height: 14, marginLeft: -1, background: "#F3F2EF", borderRadius: 1 }} />
      </div>
    </div>
  );
}

export function DJ() {
  const { track } = useTrack();
  const decks = useRef<{ a: Deck; b: Deck } | null>(null);
  const loopB = useRef<LoopHandle | null>(null);
  const trackRef = useRef(track); trackRef.current = track;
  const [playA, setPlayA] = useState(false);
  const [playB, setPlayB] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [mix, setMix] = useState({ lowA: 0.5, lowB: 0.5, filtA: 0.5, filtB: 0.5, volA: 0.8, volB: 0.8, xf: 0.5 });
  const [cues, setCues] = useState([true, false, false, false, false, false, false, false]);
  const [hint, setHint] = useState<string | null>(null);

  const ensure = async () => {
    await ensureAudio();
    const c = getCtx();
    if (c && !decks.current) decks.current = { a: makeDeck(c), b: makeDeck(c) };
    return decks.current;
  };

  // apply mixer to audio
  useEffect(() => {
    const d = decks.current; const c = getCtx();
    if (!d || !c) return;
    const xfA = Math.cos((mix.xf * Math.PI) / 2), xfB = Math.sin((mix.xf * Math.PI) / 2);
    d.a.vol.gain.setTargetAtTime(mix.volA * xfA, c.currentTime, 0.02);
    d.b.vol.gain.setTargetAtTime(mix.volB * xfB, c.currentTime, 0.02);
    d.a.low.gain.value = (mix.lowA - 0.5) * 48 > 0 ? (mix.lowA - 0.5) * 12 : (mix.lowA - 0.5) * 48;
    d.b.low.gain.value = (mix.lowB - 0.5) * 48 > 0 ? (mix.lowB - 0.5) * 12 : (mix.lowB - 0.5) * 48;
    for (const [f, v] of [[d.a.filt, mix.filtA], [d.b.filt, mix.filtB]] as const) {
      if (Math.abs(v - 0.5) < 0.04) { f.type = "allpass"; }
      else if (v < 0.5) { f.type = "lowpass"; f.frequency.value = 200 * Math.pow(100, v / 0.5); f.Q.value = 1; }
      else { f.type = "highpass"; f.frequency.value = 20 * Math.pow(250, (v - 0.5) / 0.5); f.Q.value = 1; }
    }
  }, [mix, playA, playB]);

  useEffect(() => () => { stopTrack(); loopB.current?.stop(); }, []);

  const togA = async () => {
    if (playA) { stopTrack(); setPlayA(false); setBeat(-1); return; }
    const d = await ensure(); if (!d || !track.layers.length) return;
    setPlayA(true);
    await playTrack(() => trackRef.current, s => setBeat(s), { dest: d.a.input });
  };
  const togB = async () => {
    if (playB) { loopB.current?.stop(); loopB.current = null; setPlayB(false); return; }
    const d = await ensure(); if (!d) return;
    loopB.current = startLoop("full-mix", track.bpm, d.b.input);
    setPlayB(true);
  };
  const set = (k: keyof typeof mix) => (v: number) => setMix(m => ({ ...m, [k]: v }));
  const touch = (label: string, v: number) => setHint(`${label} ${Math.round(v * 100)}%`);

  const beatsLeft = beat < 0 ? null : 16 - beat;
  const deck = (lbl: "a" | "b", color: string, playing: boolean, toggle: () => void, offset: number) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Jog color={color} playing={playing} label={lbl} />
      <span className="m1-eng" style={{ fontSize: 11, marginTop: 4 }}>deck {lbl}</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, width: 116, marginTop: 6 }}>
        {[0, 1, 2, 3].map(k => (
          <Pad key={k} height={26} lit={cues[offset + k] ? color : null} ariaPressed={cues[offset + k]} ariaLabel={`Hot cue ${k + 1}, deck ${lbl}`}
            onClick={() => setCues(c => c.map((x, i) => (i === offset + k ? !x : x)))} style={{ borderRadius: 6, fontSize: 10 }}>{k + 1}</Pad>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, width: 116, marginTop: 8 }}>
        <Key ariaLabel={`Cue deck ${lbl}`} onClick={() => { if (playing) toggle(); }}><span style={{ fontSize: 12, fontWeight: 600 }}>cue</span></Key>
        <Key ariaLabel={`${playing ? "Pause" : "Play"} deck ${lbl}`} cap={playing ? "blk" : lbl === "a" || playA ? "go" : undefined} led={playing ? color : null} onClick={toggle} ariaPressed={playing}>
          <Icon name={playing ? "stop" : "play"} />
        </Key>
      </div>
    </div>
  );

  return (
    <div className="m1-page">
      <header style={{ display: "flex", alignItems: "center", gap: 10, height: 40 }}>
        <span className="m1-t22" style={{ flex: 1 }}>dj</span>
        <span className="m1-tag">my mix</span>
      </header>

      <Screen style={{ marginTop: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="m1-ss" style={{ color: LED.mint }}>a · my track</span>
          <span className="m1-ss"><span style={{ color: "var(--disp-ink)" }}>{track.bpm.toFixed(1)}</span> bpm · {playA ? "playing" : "cued"}</span>
        </div>
        <div style={{ marginTop: 6 }}><Wave data={WA} color={LED.mint} pos={beat < 0 ? 0.02 : beat / 16} /></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "8px 0" }}>
          {Array.from({ length: 8 }, (_, i) => {
            const on = beat >= 0 && Math.floor(beat / 2) >= i;
            return <span key={i} style={{ width: 8, height: 8, borderRadius: 4, background: on ? "#F3F2EF" : "#2A2A2D", boxShadow: on && Math.floor(beat / 2) === i ? "0 0 5px #F3F2EF" : undefined }} />;
          })}
          <span className="m1-ss" style={{ color: "var(--disp-ink)", marginLeft: 6 }}>
            {hint ?? (beatsLeft === null ? "play a, then bring b in" : `bring b in · ${Math.ceil(beatsLeft / 4)} beat${Math.ceil(beatsLeft / 4) === 1 ? "" : "s"}`)}
          </span>
        </div>
        <div><Wave data={WB} color={LED.cobalt} pos={playB ? 0.3 : 0.02} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span className="m1-ss" style={{ color: LED.cobalt }}>b · house loop</span>
          <span className="m1-ss"><span style={{ color: "var(--disp-ink)" }}>{track.bpm.toFixed(1)}</span> bpm · synced</span>
        </div>
      </Screen>

      <div style={{ display: "grid", gridTemplateColumns: "116px 1fr 116px", gap: 8, marginTop: 14, alignItems: "stretch" }}>
        {deck("a", LED.mint, playA, togA, 0)}
        <div className="m1-m is-wide" style={{ flexDirection: "column", justifyContent: "flex-start", padding: "10px 4px", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-around", width: "100%" }}><span className="m1-eng" style={{ fontSize: 10 }}>a</span><span className="m1-eng" style={{ fontSize: 10 }}>b</span></div>
          <div style={{ display: "flex", justifyContent: "space-around", width: "100%" }}>
            <Knob bare size={30} label="low a" color={CAP.grey} value={mix.lowA} defaultValue={0.5} onChange={set("lowA")} onTouch={touch} />
            <Knob bare size={30} label="low b" color={CAP.grey} value={mix.lowB} defaultValue={0.5} onChange={set("lowB")} onTouch={touch} />
          </div>
          <span className="m1-eng" style={{ fontSize: 10 }}>low</span>
          <div style={{ display: "flex", justifyContent: "space-around", width: "100%" }}>
            <Knob bare size={30} label="filter a" color={CAP.grey} value={mix.filtA} defaultValue={0.5} onChange={set("filtA")} onTouch={touch} />
            <Knob bare size={30} label="filter b" color={CAP.grey} value={mix.filtB} defaultValue={0.5} onChange={set("filtB")} onTouch={touch} />
          </div>
          <span className="m1-eng" style={{ fontSize: 10 }}>filter</span>
          <div style={{ display: "flex", justifyContent: "space-around", width: "100%", marginTop: 16 }}>
            <Fader label="volume a" led={LED.mint} value={mix.volA} onChange={set("volA")} onTouch={touch} height={92} width={34} />
            <Fader label="volume b" led={LED.cobalt} value={mix.volB} onChange={set("volB")} onTouch={touch} height={92} width={34} />
          </div>
          <span className="m1-eng" style={{ fontSize: 10 }}>volume</span>
        </div>
        {deck("b", LED.cobalt, playB, togB, 4)}
      </div>

      <div className="m1-m is-wide" style={{ marginTop: 12, height: 78, flexDirection: "column", gap: 6 }}>
        <Fader horizontal label="crossfader" value={mix.xf} onChange={set("xf")} onTouch={touch} width={210} defaultValue={0.5} />
        <div style={{ display: "flex", justifyContent: "space-between", width: 230 }}>
          <span className="m1-eng" style={{ fontSize: 11 }}>a</span><span className="m1-eng" style={{ fontSize: 11 }}>crossfader</span><span className="m1-eng" style={{ fontSize: 11 }}>b</span>
        </div>
      </div>
    </div>
  );
}
