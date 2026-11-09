"use client";
/**
 * The dj controller (9 Nov), laid out like a two-channel Pioneer DDJ: deck a, the mixer, deck b, the crossfader
 * under the mixer. Each deck has its jog wheel, the tempo fader on the jog's right, sync, four performance pads,
 * and cue and play at the bottom left. The mixer has, per channel from the top: trim, hi, mid, low, filter, the
 * headphone cue key, and the channel fader, with a level meter between the two channels.
 *
 * Simple: only what you have learnt is on the controller (the dj path adds trim and eq, the phones cue, pads, the
 * filter, sync). `show` lists the sections that are there. The layout keeps its shape as sections arrive.
 * Purely the controls: the page passes the state and the sound (DJ.tsx, the lesson mixer).
 */
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { CAP, Fader, Icon, Knob } from "./controls";
import { CAT_SRC } from "./shell";
import "./deck.css";

export type DeckId = "a" | "b";
export type DeckSide = { id: DeckId; title: string; sub: string; color: string; playing: boolean; bpm: number; pitch: number; synced: boolean };
export type Chan = { trim: number; hi: number; mid: number; low: number; filter: number; fader: number; phones: boolean; level: number };
export type Section = "tempo" | "sync" | "trim" | "eq" | "low" | "filter" | "phones" | "pads";
export const ALL_SECTIONS: Section[] = ["tempo", "sync", "trim", "eq", "low", "filter", "phones", "pads"];

/** The lesson that puts each part of the controller in front of you (dj path order). */
export const SECTION_LESSON: Record<Section, string> = {
  tempo: "tempo-bpm-dj", low: "your-first-mix", eq: "eq-mixing-dj", trim: "eq-mixing-dj", phones: "headphone-monitoring",
  pads: "cue-points-dj", filter: "effects-performance-dj", sync: "sync-function",
};
export function sectionsFor(done: Record<string, unknown>, everything: boolean): Set<Section> {
  if (everything) return new Set(ALL_SECTIONS);
  return new Set(ALL_SECTIONS.filter(s => !!done[SECTION_LESSON[s]]));
}

type Props = {
  decks: [DeckSide, DeckSide];
  chans: [Chan, Chan];
  xf: number;
  show: Set<Section>;
  screen: ReactNode;
  pads?: [boolean[], boolean[]];
  padMode?: string;
  onPlay: (d: DeckId) => void;
  onCue: (d: DeckId) => void;
  onSync?: (d: DeckId) => void;
  onPitch?: (d: DeckId, v: number) => void;
  onChan: (d: DeckId, k: keyof Chan, v: number | boolean) => void;
  onXf: (v: number) => void;
  onPad?: (d: DeckId, i: number) => void;
  onTouch?: (label: string, v: number) => void;
};

function Jog({ color, playing, label, size }: { color: string; playing: boolean; label: string; size: number }) {
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
  return (
    <div className={`dk-jog ${playing ? "is-on" : ""}`} role="img" aria-label={`Jog wheel, deck ${label}`} onPointerDown={down} onPointerMove={move} onPointerUp={() => (last.current = null)}
      style={{ ...(size ? { width: size, height: size } : {}), ["--c" as string]: color } as CSSProperties}>
      <i className="dk-jogring" aria-hidden />
      <div className="dk-plat" style={{ transform: `rotate(${rot}deg)` }}>
        <span className="dk-label">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CAT_SRC} alt="" />
        </span>
        <i className="dk-mark" aria-hidden />
      </div>
    </div>
  );
}

/** One round transport key with an engraved name under it (cue, play, sync). */
function RoundKey({ on, color, play, onClick, children, aria }: { on?: boolean; color?: string; play?: boolean; onClick: () => void; children: ReactNode; aria: string }) {
  return (
    <button type="button" className={`dk-rk ${on ? "is-on" : ""} ${play ? "is-play" : ""}`} style={{ ["--c" as string]: color } as CSSProperties} onClick={onClick} aria-label={aria} aria-pressed={on}>
      <span className="dk-rkcap">{children}</span>
    </button>
  );
}

export function DeckRig(p: Props) {
  const { decks, chans, show } = p;
  // A phone's mixer column is narrow: smaller knobs and faders there.
  const [small, setSmall] = useState(false);
  useEffect(() => { const m = window.matchMedia("(max-width: 599px)"); const r = () => setSmall(m.matches); r(); m.addEventListener("change", r); return () => m.removeEventListener("change", r); }, []);
  const deck = (d: DeckSide, i: 0 | 1) => (
    <section className={`dk-deck is-${d.id}`} aria-label={`Deck ${d.id}`} style={{ ["--c" as string]: d.color } as CSSProperties}>
      <div className="dk-deckhead"><b>{d.id}</b><span>{d.title}<small>{d.sub}</small></span></div>
      <div className="dk-top">
        <div className="dk-jogwrap"><Jog color={d.color} playing={d.playing} label={d.id} size={0} /></div>
        {show.has("tempo") ? (
          <div className="dk-tempo">
            <span className="dk-silk">tempo</span>
            <div className="dk-tempofader">
              <Fader label={`tempo deck ${d.id}`} value={0.5 - d.pitch / 2} onChange={v => p.onPitch?.(d.id, (0.5 - v) * 2)} onTouch={p.onTouch} height={150} width={36} defaultValue={0.5} valueText={`${(d.bpm * (1 + d.pitch * 0.08)).toFixed(1)} bpm`} />
            </div>
            <span className="dk-bpm">{(d.bpm * (1 + d.pitch * 0.08)).toFixed(1)}</span>
          </div>
        ) : null}
        {show.has("tempo") ? (
          <div className="dk-tempo-h">
            <Fader horizontal label={`tempo deck ${d.id}`} value={0.5 + d.pitch / 2} onChange={v => p.onPitch?.(d.id, (v - 0.5) * 2)} onTouch={p.onTouch} width={96} defaultValue={0.5} valueText={`${(d.bpm * (1 + d.pitch * 0.08)).toFixed(1)} bpm`} />
            <span className="dk-bpm">tempo {(d.bpm * (1 + d.pitch * 0.08)).toFixed(1)}</span>
          </div>
        ) : null}
      </div>
      <div className="dk-bottom">
        {show.has("pads") ? (
          <div className="dk-pads" role="group" aria-label={`Hot cues, deck ${d.id}`}>
            <span className="dk-silk dk-padmode">{p.padMode ?? "hot cue"}</span>
            {(p.pads?.[i] ?? [false, false, false, false]).map((on, k) => (
              <button key={k} type="button" className={`dk-pad ${on ? "is-on" : ""}`} aria-pressed={on} aria-label={`Hot cue ${k + 1}, deck ${d.id}`} onClick={() => p.onPad?.(d.id, k)}>{k + 1}</button>
            ))}
          </div>
        ) : null}
        <div className="dk-transport">
          <RoundKey aria={`Cue deck ${d.id}`} color={d.color} onClick={() => p.onCue(d.id)}><span>cue</span></RoundKey>
          <RoundKey aria={`${d.playing ? "Pause" : "Play"} deck ${d.id}`} on={d.playing} play color={d.color} onClick={() => p.onPlay(d.id)}><svg viewBox="0 0 24 24" width={20} height={20} aria-hidden><path d="M5 5.5v13l8-6.5z" fill="currentColor" /><rect x="15" y="6" width="2.4" height="12" rx="1" fill="currentColor" /><rect x="19" y="6" width="2.4" height="12" rx="1" fill="currentColor" /></svg></RoundKey>
          {show.has("sync") ? <RoundKey aria={`Sync deck ${d.id}`} on={d.synced} color={d.color} onClick={() => p.onSync?.(d.id)}><span>sync</span></RoundKey> : null}
        </div>
      </div>
    </section>
  );
  // The mixer as rows, the way it is printed on the hardware: deck a's knob, the knob's name, deck b's knob.
  const ks = small ? 24 : 22;
  type Row = { k: keyof Chan; name: string; color?: string };
  const rows: Row[] = [
    show.has("trim") && { k: "trim" as const, name: "trim" },
    show.has("eq") && { k: "hi" as const, name: "hi" },
    show.has("eq") && { k: "mid" as const, name: "mid" },
    (show.has("low") || show.has("eq")) && { k: "low" as const, name: "low" },
    show.has("filter") && { k: "filter" as const, name: "filter", color: CAP.navy },
  ].filter(Boolean) as Row[];
  const knob = (d: DeckSide, c: Chan, r: Row) => <Knob bare size={ks} label={`${r.name} ${d.id}`} color={r.color ?? CAP.grey} value={c[r.k] as number} defaultValue={0.5} onChange={v => p.onChan(d.id, r.k, v)} onTouch={p.onTouch} />;
  const phones = (d: DeckSide, c: Chan) => (
    <button type="button" className={`dk-phones ${c.phones ? "is-on" : ""}`} aria-pressed={c.phones} aria-label={`Headphone cue, deck ${d.id}`} onClick={() => p.onChan(d.id, "phones", !c.phones)}>
      <svg viewBox="0 0 24 24" aria-hidden><path d="M5 15v-3a7 7 0 0 1 14 0v3" /><rect x="3.5" y="14" width="4" height="6" rx="1.5" /><rect x="16.5" y="14" width="4" height="6" rx="1.5" /></svg>
    </button>
  );
  const meter = (lv: number) => <i className="dk-meter" aria-hidden>{Array.from({ length: 9 }, (_, k) => <em key={k} className={lv * 9 > 8 - k ? (k < 2 ? "is-red" : k < 4 ? "is-amber" : "is-on") : ""} />)}</i>;
  return (
    <div className="dk">
      <div className="dk-screen">{p.screen}</div>
      <div className="dk-body">
        {deck(decks[0], 0)}
        <section className="dk-mixer" aria-label="Mixer">
          <div className="dk-grid" style={{ ["--ca" as string]: decks[0].color, ["--cb" as string]: decks[1].color } as CSSProperties}>
            {rows.map(r => (
              <div key={r.k} className="dk-row">{knob(decks[0], chans[0], r)}<span className="dk-name">{r.name}</span>{knob(decks[1], chans[1], r)}</div>
            ))}
            {show.has("phones") ? <div className="dk-row">{phones(decks[0], chans[0])}<span className="dk-name">cue</span>{phones(decks[1], chans[1])}</div> : null}
            <div className="dk-row dk-faders">
              <Fader label="channel a" led={decks[0].color} value={chans[0].fader} onChange={v => p.onChan("a", "fader", v)} onTouch={p.onTouch} height={small ? 110 : 124} width={small ? 30 : 36} />
              <div className="dk-meters">{meter(chans[0].level)}{meter(chans[1].level)}</div>
              <Fader label="channel b" led={decks[1].color} value={chans[1].fader} onChange={v => p.onChan("b", "fader", v)} onTouch={p.onTouch} height={small ? 110 : 124} width={small ? 30 : 36} />
            </div>
          </div>
          <div className="dk-xf">
            <Fader horizontal label="crossfader" value={p.xf} onChange={p.onXf} onTouch={p.onTouch} width={small ? 112 : 200} defaultValue={0.5} />
            <div className="dk-xfl" aria-hidden><span>a</span><span>crossfader</span><span>b</span></div>
          </div>
        </section>
        {deck(decks[1], 1)}
      </div>
    </div>
  );
}
