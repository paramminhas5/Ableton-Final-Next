"use client";
/**
 * Match this sound (touch and hear, item 13). Syntorial's method on our own instruments: the engine plays a
 * target made from hidden settings of the lesson's knobs on your own part; you switch between the target
 * and yours, turn the lit knobs, and check. The closeness comes from the sound (spectrum and envelope of
 * both, rendered offline through the same engine) and the settings (src/lib/matchScore.ts). After two
 * tries a hint names the knob furthest off and which way to go. A close match is kept in your song.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BASS_PARAMS, CHORD_PARAMS, DRUM_PAD_PARAMS, DRUM_RACK_PARAMS, FLAG, INSTRUMENT_BASE, LAYER_PARAMS, LEAD_PARAMS, OUT, display, type ParamSpec } from "@/engine";
import type { LessonScreen, Mission } from "@/content/types";
import { applyTake, readTake, shapeKnobs, withParams } from "@/lib/lessonTake";
import { readTrackV2, type LayerType, type LayerV2, type TrackV2 } from "@/lib/track2";
import { worldOf } from "@/lib/worldOrder";
import { bind } from "@/lib/paramColor";
import { features, KNOB_TOL, MATCH_PASS, mono, passes, score, which, type Features, type Score } from "@/lib/matchScore";
import { renderPart } from "@/lib/offline";
import { presetTake } from "./AddToTrack";
import { CAP, GoPill, Icon, Key, Knob, Screen, Silk } from "./controls";
import { Body, Meta, useEnter } from "./LessonParts";
import { Gloss } from "./Gloss";
import { useEngineTrack } from "./useEngineTrack";
import { readShape, shapeKey } from "./LessonSteps";

type Of = Extract<LessonScreen, { kind: "matchsound" }>;
type K = { index: number; spec: ParamSpec };

/** The knob a lesson names on a part, by key: the part's own, the kick pad's, the rack's, or the channel's. */
function knobFor(type: LayerType, key: string): K | undefined {
  const inst = type === "lead" ? LEAD_PARAMS : type === "bass" ? BASS_PARAMS : type === "chords" ? CHORD_PARAMS : [];
  const pad = type === "drums" ? 0 : type === "hats" ? 4 : -1;
  const all: K[] = [
    ...shapeKnobs(type),
    ...inst.map(sp => ({ index: sp.index, spec: sp as ParamSpec })),
    ...(pad >= 0 ? DRUM_PAD_PARAMS.map((sp, k) => ({ index: INSTRUMENT_BASE + pad * DRUM_PAD_PARAMS.length + k, spec: sp as ParamSpec })) : []),
    ...(pad >= 0 ? DRUM_RACK_PARAMS.map(sp => ({ index: sp.index, spec: sp as ParamSpec })) : []),
    ...LAYER_PARAMS.map(sp => ({ index: sp.index, spec: sp as ParamSpec })),
  ];
  return all.find(k => k.spec.key === key);
}

export function MatchSoundStep({ mission, screen, onNext, tail }: { mission: Mission; screen: Of; onNext: () => void; tail?: ReactNode }) {
  const [base, setBase] = useState<TrackV2 | null>(null);
  useEffect(() => setBase(readTrackV2()), []);
  const take = useMemo(() => readTake(mission.slug), [mission.slug]);
  const own0 = useMemo(() => (take?.events.length ? take : presetTake(mission)), [take, mission]);
  const type = screen.layer as LayerType;
  const otherType = (["drums", "hats", "bass", "chords", "lead"] as LayerType[]).find(t => t === type && t !== own0.type);
  const line = useMemo(() => (otherType ? { ...own0, type, events: [] } : own0), [own0, otherType, type]);
  const knobs = useMemo(() => screen.knobs.map(k => knobFor(type, k)).filter((k): k is K => !!k), [screen.knobs, type]);
  const target = useMemo(() => Object.fromEntries(knobs.map(k => [k.index, screen.target[k.spec.key] ?? k.spec.default])) as Record<number, number>, [knobs, screen.target]);
  // Yours starts where your part is (what you shaped earlier in the lesson, or the knobs as they are).
  const shaped = useMemo(() => readShape(mission.slug, otherType), [mission.slug, otherType]);
  const [mine, setMine] = useState<Record<number, number>>({});
  const world = worldOf(mission.slug) ?? undefined;
  const own = !!base && (!!otherType || !take?.events.length) && base.layers.some(l => l.type === type && l.events.length > 0);
  // Your song with this lesson's part, then just that part: a kick lesson plays only the kick.
  const song = useMemo(() => (base ? (own ? withParams(base, type, shaped) : applyTake({ ...base, added: [] }, mission.slug, line, world, shaped)) : null), [base, own, type, shaped, mission.slug, line, world]);
  const part = useMemo<LayerV2 | null>(() => {
    const l = song?.layers.find(x => x.type === type);
    if (!l) return null;
    const note = type === "drums" ? 36 : type === "hats" ? 42 : -1;
    const events = note >= 0 ? l.events.filter(e => e.note === note) : l.events;
    return { ...l, events: events.length ? events : l.events, mute: false, solo: false };
  }, [song, type]);
  const value = (k: K) => mine[k.index] ?? part?.params[k.index] ?? k.spec.default;
  const [side, setSide] = useState<"target" | "yours">("target");
  const heard = useMemo(() => {
    if (!song || !part) return null;
    const p = side === "target" ? { ...part.params, ...target } : { ...part.params, ...mine };
    return { ...song, sections: undefined, layers: [{ ...part, params: p }] } as TrackV2;
  }, [song, part, side, target, mine]);
  const { engine, ready } = useEngineTrack(heard ?? readTrackV2());
  const [beat, setBeat] = useState(-1);
  const playing = beat >= 0;
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => () => { try { engine.stop(); } catch { /* not started */ } }, [engine]);
  // The target plays when you arrive: hear it first.
  useEffect(() => {
    if (!heard) return;
    let gone = false;
    void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ });
    return () => { gone = true; };
  }, [!!heard]); // eslint-disable-line react-hooks/exhaustive-deps
  const hear = async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); };

  // ── checking ──
  const targetF = useRef<Features | null>(null);
  const [tries, setTries] = useState(0);
  const [result, setResult] = useState<Score | null>(null);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState<string | null>(null);
  const passed = passes(result);
  // Close overall but one lit knob still off: say so straight away, not after two tries.
  const nearlyBut = !!result && !passed && result.close >= MATCH_PASS;
  const check = async () => {
    if (!song || !part || busy) return;
    setBusy(true);
    try {
      if (!targetF.current) { const r = await renderPart(song, { ...part, params: { ...part.params, ...target } }); targetF.current = features(mono(r.l, r.r), r.sr); }
      const r = await renderPart(song, { ...part, params: { ...part.params, ...mine } });
      const s = score(targetF.current, features(mono(r.l, r.r), r.sr), knobs.map(k => ({ mine: value(k), target: target[k.index] })));
      setResult(s);
      setTries(t => t + 1);
    } finally {
      setBusy(false);
    }
  };
  // After two tries: the knob furthest off, and which way.
  const worst = useMemo(() => {
    let w: { k: K; d: number } | null = null;
    for (const k of knobs) { const d = target[k.index] - value(k); if (!w || Math.abs(d) > Math.abs(w.d)) w = { k, d }; }
    return w && Math.abs(w.d) > 0.02 ? w : null;
  }, [knobs, target, mine, part]); // eslint-disable-line react-hooks/exhaustive-deps
  const hint = (tries >= 2 || nearlyBut) && !passed && worst && Math.abs(worst.d) > (nearlyBut ? KNOB_TOL : 0) ? `try ${worst.k.spec.label}: the target's is ${which(worst.k.spec.key, worst.d > 0)}` : null;
  const keep = () => {
    // Your matched knobs go into your song with the rest of this lesson's sound.
    try { sessionStorage.setItem(shapeKey(mission.slug, otherType), JSON.stringify({ ...shaped, ...mine })); } catch { /* ignore */ }
    onNext();
  };
  useEnter(passed ? keep : null);

  const go = passed
    ? { label: "keep it in your song", onClick: keep, aria: "Keep it in your song" }
    : { label: busy ? "listening" : result ? `${result.close}% · check again` : "check how close", onClick: () => void check(), aria: result ? `Not yet, ${result.close}% close. Check again` : "Check how close yours is" };
  return (
    <div className="ls-col">
      <div className="fl-inst">
      <Screen>
        <Meta left="match this sound" right={touched ?? (side === "target" ? "playing the target" : "playing yours")} />
        <div className="ms-meter" role="img" aria-label={result ? `${result.close}% close: sound ${result.sound}%, settings ${result.settings}%` : "not checked yet"}>
          <div className="ms-big">{result ? `${result.close}%` : "?"}<span>{result ? "close" : "check when it sounds the same"}</span></div>
          <div className="ms-bar"><i style={{ width: `${result?.close ?? 0}%` }} className={passed ? "is-pass" : ""} /><b style={{ left: `${MATCH_PASS}%` }} /></div>
          {result ? <div className="ms-parts"><span>sound {result.sound}%</span><span>settings {result.settings}%</span>{tries ? <span>{tries} {tries === 1 ? "try" : "tries"}</span> : null}</div> : null}
          {hint ? <div className="ms-tip">{hint}</div> : null}
        </div>
      </Screen>
      <Silk label="switch between them" right={side === "target" ? "the target" : "yours"} />
      <div className="ls-pads" role="radiogroup" aria-label="Which sound plays">
        {(["target", "yours"] as const).map((s, i) => (
          <button key={s} type="button" role="radio" aria-checked={side === s} className={`ls-pad ${side === s ? "is-lit" : ""}`} style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties}
            onClick={() => { setSide(s); void ready().then(() => { if (!playing) engine.play(); }); }}>
            <small>{String.fromCharCode(97 + i)}</small><span>{s === "target" ? "the target" : "yours"}</span>
          </button>
        ))}
      </div>
      <div className="m1-g" style={{ gridTemplateColumns: `repeat(${Math.max(1, knobs.length)}, 1fr)`, marginTop: 8 }}>
        {knobs.map(k => (
          <Knob key={k.index} label={k.spec.label} color={CAP.navy} size={74} height={150}
            {...bind(k.spec, value(k))}
            value={value(k)} defaultValue={k.spec.default} readout={display(k.spec, value(k))}
            spot={!!hint && worst?.k.index === k.index}
            onChange={v => { setMine(m => ({ ...m, [k.index]: v })); if (side !== "yours") setSide("yours"); }}
            onTouch={(label, v) => setTouched(`${label} ${display(k.spec, v)}`)} />
        ))}
      </div>
      </div>
      <div className="fl-text">
        <Body text={screen.body} />
        {hint ? <div className="ls-hint ms-hint" role="status"><Gloss>{hint}</Gloss>{screen.hint ? <> {screen.hint}</> : null}</div> : screen.hint && tries >= 1 && !passed ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {passed ? <p className="ls-read ms-done">close enough to fool an ear. keep it, and this sound goes into your song.</p> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "play"} onClick={hear} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play"}><Icon name={playing ? "stop" : "play"} /></Key>
          <Key label="skip" onClick={() => { engine.stop(); onNext(); }} ariaLabel="Skip this step"><Icon name="back" className="ls-flip" /></Key>
          <GoPill onClick={go.onClick} style={{ gridColumn: "span 2" }} ariaLabel={go.aria}>{go.label}</GoPill>
        </div>
      </div>
    </div>
  );
}
