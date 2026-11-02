"use client";
/**
 * Studio. One screen, laid out like a Launch Control:
 * the screen shows the selected layer, its values and its 16-step pattern (tap to edit);
 * knobs shape the selected layer; channel strips set levels and select layers;
 * pads toggle sidechain, mute, solo; transport plays, adds a layer, exports to Live.
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTrack, KIND, newLayer, MAX_LAYERS, type Layer, type LayerKind, type Track } from "@/lib/track";
import { playTrack, stopTrack, audition } from "@/lib/track-engine";
import { downloadTrackMidi } from "@/lib/track-midi";
import { CAP, Fader, GoPill, Icon, Key, Knob, Pad, Screen, Silk } from "./controls";
import { CAT_SRC } from "./shell";

const KNOB_CAPS = [CAP.go, CAP.grey, CAP.navy];
const ALL_KINDS: LayerKind[] = ["kick", "hats", "clap", "perc", "bass", "lead", "chords", "pad"];

export function Studio() {
  const { track, update } = useTrack();
  const [selId, setSelId] = useState<string | null>(null);
  const [solo, setSolo] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ label: string; v: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [bank, setBank] = useState(0);
  const [adding, setAdding] = useState(false);
  const live = useRef<{ track: Track; solo: string | null }>({ track, solo });
  live.current = { track, solo };

  useEffect(() => { if (!selId && track.layers[0]) setSelId(track.layers[Math.min(2, track.layers.length - 1)].id); }, [track.layers, selId]);
  useEffect(() => () => stopTrack(), []);

  const sel = track.layers.find(l => l.id === selId) ?? null;
  const kind = sel ? KIND[sel.kind] : null;

  const patch = useCallback((id: string, fn: (l: Layer) => Layer) => {
    update(t => ({ ...t, layers: t.layers.map(l => (l.id === id ? fn(l) : l)) }));
  }, [update]);

  const play = async () => {
    if (playing) { stopTrack(); setPlaying(false); setStep(-1); return; }
    if (!track.layers.length) return;
    setPlaying(true);
    await playTrack(() => {
      const { track: t, solo: s } = live.current;
      return s ? { ...t, layers: t.layers.map(l => ({ ...l, mute: l.mute || l.id !== s })) } : t;
    }, setStep);
  };

  const strips = track.layers.slice(bank * 4, bank * 4 + 4);
  const banks = Math.max(1, Math.ceil(track.layers.length / 4));
  const missing = ALL_KINDS.filter(k => !track.layers.some(l => l.kind === k));

  return (
    <div className="m1-page">
      <header style={{ display: "flex", alignItems: "center", gap: 10, height: 40 }}>
        <Link href="/dashboard" aria-label="Back" style={{ color: "var(--ink)", display: "flex", minHeight: 0, minWidth: 0 }}><Icon name="back" /></Link>
        <span className="m1-t22" style={{ flex: 1 }}>studio</span>
        <span className="m1-tag">my track · {track.layers.length}/{MAX_LAYERS}</span>
      </header>

      <Screen height={210} style={{ marginTop: 6 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {!sel && <img src={CAT_SRC} alt="" style={{ position: "absolute", right: 16, top: 16, width: 84 }} />}
        {sel && kind ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-.035em", lineHeight: 1, color: kind.color }}>{kind.label}</div>
                <div className="m1-ss" style={{ marginTop: 4 }}>layer {track.layers.indexOf(sel) + 1}{sel.from && sel.from !== "studio" ? " · from a lesson" : " · made here"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="m1-ss">{touched?.label ?? kind.knobs[0]}</div>
                <div style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-.035em", lineHeight: 1, marginTop: 2 }}>{Math.round((touched?.v ?? sel.params[0]) * 100)}%</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              {kind.knobs.map((n, i) => (
                <div key={n} style={{ flex: 1 }}>
                  <div className="m1-ss" style={{ display: "flex", justifyContent: "space-between" }}><span>{n}</span><span style={{ color: "var(--disp-ink)" }}>{Math.round(sel.params[i] * 100)}</span></div>
                  <div style={{ height: 4, borderRadius: 2, background: "#1E1E21", marginTop: 5 }}>
                    <div style={{ width: `${sel.params[i] * 100}%`, height: "100%", borderRadius: 2, background: touched?.label === n ? kind.color : "#8E8E93" }} />
                  </div>
                </div>
              ))}
            </div>
            <div role="group" aria-label={`${kind.label} pattern`} style={{ display: "grid", gridTemplateColumns: "repeat(16,1fr)", gap: 3, marginTop: 16 }}>
              {sel.steps.map((on, i) => (
                <button key={i} type="button" aria-label={`Step ${i + 1} ${on ? "on" : "off"}`} aria-pressed={on}
                  onClick={() => { patch(sel.id, l => ({ ...l, steps: l.steps.map((x, k) => (k === i ? !x : x)) })); if (!on) audition(sel, i); }}
                  style={{ height: 22, borderRadius: 3, border: 0, padding: 0, minHeight: 0, minWidth: 0, background: on ? kind.color : i % 4 === 0 ? "#222225" : "#17171A", outline: step === i ? "1.5px solid #F3F2EF" : undefined, outlineOffset: 1, cursor: "pointer" }} />
              ))}
            </div>
            <div className="m1-ss" style={{ marginTop: 7, display: "flex", justifyContent: "space-between" }}>
              <span>pattern · tap to edit</span>
              <span>{solo ? "solo on" : sel.mute ? "muted" : sel.sidechain ? "sidechain on" : `${track.bpm} bpm`}</span>
            </div>
          </>
        ) : (
          <>
            <div className="m1-ss">studio</div>
            <div className="m1-t22" style={{ marginTop: 8, maxWidth: 200 }}>no layers yet</div>
            <div className="m1-ss" style={{ marginTop: 8, maxWidth: 210 }}>finish a lesson to add one, or press layer to start from scratch</div>
          </>
        )}
      </Screen>

      <Silk label={kind ? kind.label : "layer"} right="turn to shape" />
      <div className="m1-g">
        {[0, 1, 2].map(i => (
          <Knob key={i} label={kind ? kind.knobs[i] : "—"} color={KNOB_CAPS[i]} size={40}
            value={sel ? sel.params[i] : 0}
            defaultValue={sel ? KIND[sel.kind].defaults[i] : 0.5}
            onChange={sel ? v => patch(sel.id, l => ({ ...l, params: l.params.map((p, k) => (k === i ? v : p)) as Layer["params"] })) : undefined}
            onTouch={(label, v) => setTouched({ label, v })} />
        ))}
        <Key label={banks > 1 ? `bank ${bank + 1}` : "hear it"} onClick={() => (banks > 1 ? setBank((bank + 1) % banks) : sel && audition(sel))} ariaLabel={banks > 1 ? "Next bank of layers" : "Hear this layer"}>
          {banks > 1 ? <span className="m1-leg" style={{ fontSize: 20 }}>{bank + 1}</span> : <Icon name="hear" />}
        </Key>
      </div>

      <Silk label="layers" right="level · select" />
      <div className="m1-g">
        {strips.map((l, i) => {
          const on = l.id === selId;
          const k = KIND[l.kind];
          return (
            <div key={l.id} className="m1-m is-wide" style={{ height: 236, flexDirection: "column", justifyContent: "flex-start", paddingTop: 22, gap: 10, opacity: l.mute ? 0.6 : 1 }}>
              <Fader label={`${k.label} level`} led={k.color} value={l.params[3]} height={136} width={42}
                onChange={v => patch(l.id, x => ({ ...x, params: [x.params[0], x.params[1], x.params[2], v] }))}
                onTouch={() => setTouched({ label: "level", v: l.params[3] })} />
              <span className="m1-eng" style={{ fontSize: 11, fontWeight: on ? 600 : 500, color: on ? "var(--ink)" : undefined }}>{k.label}</span>
              <button type="button" onClick={() => { setSelId(l.id); setTouched(null); }} aria-label={`Select ${k.label}`} aria-pressed={on}
                className={`m1-cap ${on ? "is-blk" : ""}`} style={{ width: 44, border: 0, padding: 0, cursor: "pointer", minHeight: 0, minWidth: 0, font: "inherit" }}>
                <span className="m1-leg" style={{ fontSize: 17 }}>{bank * 4 + i + 1}</span>
              </button>
            </div>
          );
        })}
        {Array.from({ length: 4 - strips.length }, (_, i) => (
          <button key={`e${i}`} type="button" className="m1-m is-wide is-dim" style={{ height: 236, opacity: 0.5 }} onClick={() => setAdding(true)} aria-label="Add a layer">
            <span className="m1-eng" style={{ fontSize: 11 }}>empty</span>
          </button>
        ))}
      </div>

      <div className="m1-g" style={{ marginTop: 8 }}>
        <Pad lit={sel?.sidechain ? "var(--led-go)" : null} ariaPressed={!!sel?.sidechain} onClick={() => sel && patch(sel.id, l => ({ ...l, sidechain: !l.sidechain }))}>sidechain</Pad>
        <Pad lit={sel?.mute ? "var(--led-white)" : null} ariaPressed={!!sel?.mute} onClick={() => sel && patch(sel.id, l => ({ ...l, mute: !l.mute }))}>mute</Pad>
        <Pad lit={solo && solo === sel?.id ? "var(--led-white)" : null} ariaPressed={!!solo && solo === sel?.id} onClick={() => sel && setSolo(solo === sel.id ? null : sel.id)}>solo</Pad>
        <Pad lit={adding ? "var(--led-lilac)" : null} ariaPressed={adding} onClick={() => setAdding(a => !a)}>layer +</Pad>
      </div>

      {adding && (
        <div className="m1-m is-wide" style={{ marginTop: 10, padding: 14, flexDirection: "column", alignItems: "stretch", gap: 10 }}>
          <div className="m1-eng" style={{ fontSize: 11 }}>add a layer {track.layers.length >= MAX_LAYERS ? "· track is full" : ""}</div>
          <div className="m1-g" style={{ gap: 6 }}>
            {missing.map(k => (
              <Pad key={k} height={42} onClick={() => {
                if (track.layers.length >= MAX_LAYERS) return;
                const l = newLayer(k, "studio");
                update(t => ({ ...t, layers: [...t.layers, l] }));
                setSelId(l.id); setAdding(false);
                setBank(Math.floor(track.layers.length / 4));
              }}>{k}</Pad>
            ))}
          </div>
          {sel && (
            <Pad height={40} onClick={() => { update(t => ({ ...t, layers: t.layers.filter(l => l.id !== sel.id) })); setSelId(null); setAdding(false); }}>
              remove {KIND[sel.kind].label}
            </Pad>
          )}
        </div>
      )}

      <div className="m1-g" style={{ marginTop: 12, gridTemplateColumns: "2fr 1fr 1fr" }}>
        <GoPill onClick={play} ariaLabel={playing ? "Stop" : "Play"} disabled={!track.layers.length} style={{ height: 76 }}>
          <Icon name={playing ? "stop" : "play"} />{playing ? "stop" : "play"}
        </GoPill>
        <Key label="tempo" onClick={() => update(t => ({ ...t, bpm: t.bpm >= 140 ? 90 : t.bpm + 5 }))} ariaLabel={`Tempo ${track.bpm}, tap to change`}>
          <span className="m1-leg" style={{ fontSize: 17 }}>{track.bpm}</span>
        </Key>
        <Key label="to live" onClick={() => downloadTrackMidi(track)} disabled={!track.layers.length} ariaLabel="Export to Ableton Live as MIDI"><Icon name="out" /></Key>
      </div>
    </div>
  );
}
