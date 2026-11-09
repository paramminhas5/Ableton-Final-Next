"use client";
/**
 * A part card (9 Nov): what it is, your song with it and without it, what it is for, its controls live on
 * your song, where you hear it, where it is in Live, and the lessons that teach it. If your song doesn't have
 * the part yet, a sensible one goes in for the card (and it says so). Nothing plays until you press.
 */
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { DRUM_PAD_PARAMS, FLAG, INSTRUMENT_BASE, OUT } from "@/engine";
import { partCard } from "@/content/parts";
import { readTrackV2, newLayerV2, effectivePad, paramOf, TYPE, toV1View, type TrackV2 } from "@/lib/track2";
import { missionAny, minutesFor } from "@/lib/worldOrder";
import { CAP, Icon, Knob, Screen, Silk } from "./controls";
import { Lanes } from "./shell";
import { useEngineTrack } from "./useEngineTrack";
import "./lesson.css";
import "./part.css";

export function PartCardView({ id }: { id: string }) {
  const card = partCard(id)!;
  const [base, setBase] = useState<TrackV2 | null>(null);
  const [mine, setMine] = useState(true);
  useEffect(() => {
    const t = readTrackV2();
    const has = t.layers.some(l => l.type === card.layer && l.events.length);
    setMine(has);
    if (has) { setBase(t); return; }
    // No part yet: a plain one goes in for this card only, over whatever the song has.
    const l = newLayerV2(card.layer as never, "card");
    l.events = [0.5, 1.5, 2.5, 3.5].map(start => ({ note: 42, vel: 0.7, start, len: 0.1 }));
    setBase({ ...t, layers: [...t.layers, l] });
  }, [card.layer]);
  const [without, setWithout] = useState(false);
  const [vals, setVals] = useState<Record<number, number>>({});
  const layer = base?.layers.find(l => l.type === card.layer);
  const idx = (key: string) => {
    const k = DRUM_PAD_PARAMS.findIndex(p => p.key === key);
    return layer && k >= 0 ? INSTRUMENT_BASE + effectivePad(layer) * DRUM_PAD_PARAMS.length + k : -1;
  };
  const track = useMemo<TrackV2 | null>(() => base && {
    ...base,
    layers: base.layers.map(l => (l.type === card.layer ? { ...l, mute: without, params: { ...l.params, ...vals } } : l)),
  }, [base, without, vals, card.layer]);
  const { engine, ready } = useEngineTrack(track ?? readTrackV2());
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => () => engine.stop(), [engine]);
  const playing = beat >= 0;
  const play = (w: boolean) => {
    if (playing && w === without) { engine.stop(); return; }
    setWithout(w);
    void ready().then(() => { engine.metronome(false); engine.play(); });
  };
  const v1 = track ? toV1View(track) : null;
  const loop = track?.loop ?? 4;
  const head = playing ? Math.floor(((((beat % loop) + loop) % loop) / loop) * 16) : -1;
  const color = TYPE[card.layer as keyof typeof TYPE]?.color ?? "var(--led-mint)";

  return (
    <div className="m1-page pc" style={{ ["--c" as string]: color } as CSSProperties}>
      <header className="wd-head">
        <Link href="/dashboard" className="m1-m" aria-label="Back" style={{ width: 44, height: 44 }}><Icon name="back" /></Link>
        <div style={{ flex: 1 }}>
          <div className="m1-t11">part card</div>
          <div className="m1-t22">{card.name}</div>
        </div>
      </header>

      <Screen className="pc-scr">
        <div className="wl-meta"><span>{mine ? "your song" : "your song, with hats added for this card"}</span><span>{playing ? (without ? "without" : "with") : ""}</span></div>
        <p className="pc-line">{card.line}</p>
        {v1 && <div className="pc-lanes"><Lanes track={v1} playhead={head} sel={v1.layers.find(l => l.kind === card.layer)?.id ?? null} /></div>}
      </Screen>

      <Silk label="what it does" right="your song" />
      <div className="ls-pads" role="radiogroup" aria-label={`Your song with and without ${card.name}`}>
        {[false, true].map(w => (
          <button key={String(w)} type="button" role="radio" aria-checked={playing && without === w} className={`ls-pad ${playing && without === w ? "is-lit" : ""}`} style={{ ["--c" as string]: color } as CSSProperties} onClick={() => play(w)}>
            <small><Icon name={playing && without === w ? "stop" : "play"} small /></small><span>{w ? `without ${card.name}` : `with ${card.name}`}</span>
          </button>
        ))}
      </div>

      <Silk label="what it's for" />
      <p className="pc-text">{card.forWhat}</p>

      <Silk label="play with it" right="live on your song" />
      <div className="pc-knobs">
        {card.knobs.map(k => {
          const i = idx(k.key);
          const spec = DRUM_PAD_PARAMS.find(p => p.key === k.key);
          const v = vals[i] ?? (layer && i >= 0 ? paramOf(layer, i) : spec?.default ?? 0.5);
          return (
            <div key={k.key} className="pc-knob">
              <Knob label={k.key} size={56} height={140} color={CAP.navy} led={color} value={v} defaultValue={spec?.default} onChange={nv => { setVals(s => ({ ...s, [i]: nv })); if (!playing) play(false); }} />
              <span>{k.does}</span>
            </div>
          );
        })}
      </div>

      <Silk label="where you hear it" />
      <ul className="pc-heard">
        {card.heard.map(h => <li key={h.where}><b>{h.where}</b><span>{h.listen}</span></li>)}
      </ul>
      <p className="pc-note">named records go here too, two or three per part, each one checked before it goes in.</p>

      <Silk label="in live" />
      <p className="pc-text">{card.live}</p>

      <Silk label="lessons on it" right={`${card.lessons.length}`} />
      <ul className="pc-lessons">
        {card.lessons.map(s => { const m = missionAny(s); return m ? <li key={s}><Link href={`/learn/${s}`}><span>{m.title.toLowerCase()}<small>{minutesFor(s)} min</small></span><Icon name="play" small /></Link></li> : null; })}
      </ul>
    </div>
  );
}
