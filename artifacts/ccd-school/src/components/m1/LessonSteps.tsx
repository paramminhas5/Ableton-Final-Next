"use client";
/**
 * The step screens that come from lesson files: say (with a go deeper track), hear (a clip on
 * our own engine), shape (the lesson's two knobs, hear before and after) and ear (generated rounds).
 * Same Model 1 parts as the rest of the player.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FLAG, OUT, display, toValue } from "@/engine";
import { clipVariants } from "@/content/lessons/clipTracks";
import { CLIPS } from "@/content/lessons/clips";
import type { LessonScreen, Mission } from "@/content/types";
import { applyTake, readTake, shapeKnobs, takeType, withParams } from "@/lib/lessonTake";
import { offerFor, readTrack } from "@/lib/track";
import { getCtx, playCorrect, playWrong } from "@/lib/audio";
import { readTrackV2, writeTrackV2, type LayerType, type TrackV2 } from "@/lib/track2";
import { NOTE_NAMES, remapToScale, SCALES, type ScaleName } from "@/lib/theory";
import { loadRealKit, REAL_KIT_ID, withRealKit, withSynthKit } from "@/lib/realKit";
import { worldOf } from "@/lib/worldOrder";
import { presetTake } from "./AddToTrack";
import { readSongs } from "@/lib/songs";
import { CAP, GoPill, Icon, Key, Knob, Screen, Silk } from "./controls";
import { Body, Bottom, Meta, useEnter } from "./LessonParts";
import { useEngineTrack } from "./useEngineTrack";
import { Gloss } from "./Gloss";
import { TOOL_STEPS } from "./tools";
import { AirWave, LfoView, SynthChain, WaveShape } from "./LessonVisuals";
import { EnvView, FilterView, useNoteClock } from "./Pictures";
import { ampEnv, CHARACTER_KEYS, characterOf, filterEnv } from "@/lib/shapes";
import { bind, PIC } from "@/lib/paramColor";
import { TYPE } from "@/lib/track2";
import { BASS_PARAMS, CHORD_PARAMS, DRUM_PAD_PARAMS, INSTRUMENT_BASE, LAYER_PARAMS, LEAD_PARAMS, type ParamSpec } from "@/engine";

type Of<K extends LessonScreen["kind"]> = Extract<LessonScreen, { kind: K }>;

export function Folds({ items }: { items?: { title: string; body: string }[] }) {
  if (!items?.length) return null;
  return (
    <div className="fl-more">
      {items.map(d => (
        <details key={d.title} className="fl-fold">
          <summary>{d.title.toLowerCase()}</summary>
          {d.body.split(/\n+/).map((para, i) => <p key={i}><Gloss>{para}</Gloss></p>)}
        </details>
      ))}
    </div>
  );
}

// ── say: an explanation; the extra bits fold out below if you want them ───────
export function SayStep({ screen, meta, onNext, tail, visual }: { screen: Of<"say">; meta: string; onNext: () => void; tail?: ReactNode; visual?: ReactNode }) {
  useEnter(onNext);
  // Nothing to play with or look at: one panel, title above the text.
  return (
    <div className={`ls-col ${visual ? "" : "is-one"}`}>
      <div className="fl-inst">
      <Screen>
        <Meta left={meta} />
        <div className="ls-title">{screen.title.toLowerCase()}</div>
      </Screen>
      {visual}
      </div>
      <div className="fl-text">
      {screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
      <Folds items={screen.deeper} />
      {tail}
      </div>
      <Bottom go={{ label: "next", onClick: onNext, aria: "Next" }} />
    </div>
  );
}

// ── the shape of a kick: a click, then a low body that drops in pitch and dies away ──
export function KickShape({ decay = 0.5, tune = 0.5, hit = 0, label = true }: { decay?: number; tune?: number; hit?: number; label?: boolean }) {
  const W = 330, H = 96, mid = H / 2;
  const span = 1.2; // seconds across the box
  const len = 0.45 * Math.pow(4, (decay - 0.5) * 2);
  const f0 = 50 * Math.pow(2, ((tune - 0.5) * 24) / 12);
  const pts: string[] = [];
  const env: string[] = [];
  let ph = 0;
  const N = 600;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * span;
    const a = t < len ? Math.pow(1 - t / len, 2.2) : 0;
    // Drawn slower than real so the cycles stay visible: the shape is right, the count is not.
    const f = (f0 * (1 + 3 * Math.exp(-t / 0.03))) / 9;
    ph += (2 * Math.PI * f * span) / N;
    const x = (i / N) * W;
    pts.push(`${x.toFixed(1)},${(mid - Math.sin(ph) * a * (mid - 6)).toFixed(1)}`);
    env.push(`${x.toFixed(1)},${(mid - a * (mid - 6)).toFixed(1)}`);
  }
  const bodyEnd = Math.min(88, (len / span) * 100);
  return (
    <div className="fl-kickbox" role="img" aria-label={`A kick: a click, then a body ${len < 0.3 ? "that stops quickly" : len > 0.7 ? "that rings for a long time" : "of medium length"}`}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="fl-kick" key={hit} aria-hidden>
        <path d={`M0 ${mid}H${W}`} stroke="rgba(255,255,255,.08)" vectorEffect="non-scaling-stroke" />
        <polyline points={env.join(" ")} fill="none" stroke="rgba(255,255,255,.2)" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        <polyline points={pts.join(" ")} fill="none" stroke="var(--led-mint)" strokeWidth={1.8} className="fl-kickline" vectorEffect="non-scaling-stroke" />
      </svg>
      {label && (
        <div className="fl-kicklabels" aria-hidden>
          <span style={{ left: 0 }}>click</span>
          <span style={{ left: `${Math.max(12, bodyEnd / 2 - 4)}%` }}>body</span>
          <span style={{ left: `${Math.min(80, bodyEnd + 2)}%` }}>{`gone at ${Math.round(len * 1000)} ms`}</span>
        </div>
      )}
    </div>
  );
}

// ── hear: a clip rendered live on our engine ──────────────────────────────────
export function HearStep({ screen, meta, onNext, tail }: { screen: Of<"hear">; meta: string; onNext: () => void; tail?: ReactNode }) {
  const variants = useMemo(() => clipVariants(screen.clip), [screen.clip]);
  const def = CLIPS.find(c => c.id === screen.clip);
  const [v, setV] = useState(0);
  const [playing, setPlaying] = useState(false);
  const track = variants[v]?.track ?? variants[0]?.track;
  const { engine, ready } = useEngineTrack(track ?? readTrackV2());
  const heard = useRef(false);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setPlaying(!!(e.flags & FLAG.playing)); }), [engine]);
  useEffect(() => () => { try { engine.stop(); } catch { /* engine not started */ } }, [engine]);
  const toggle = async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); heard.current = true; };
  // It is already playing when you arrive. If the browser wants a tap first, the play key is there.
  // One clip plays on arrival. When the step asks you to tap a choice, nothing plays until you tap.
  useEffect(() => { if (variants.length > 1) return; let gone = false; void ready().then(() => { if (gone) return; engine.metronome(false); engine.play(); heard.current = true; }).catch(() => { /* needs a tap */ }); return () => { gone = true; }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [beatN, setBeatN] = useState(0);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos && e.flags & FLAG.playing) setBeatN(b => (Math.floor(e.beat) !== b ? Math.floor(e.beat) : b)); }), [engine]);
  const isKick = /kick/.test(screen.clip);
  const kickDecay = isKick && variants.length > 1 ? (v === 0 ? 0.12 : 0.9) : 0.5;
  const pick = (i: number) => { if (i === v) return; setV(i); void ready().then(() => window.setTimeout(() => { engine.play(); }, 150)); heard.current = true; };
  useEnter(onNext);
  return (
    <div className="ls-col">
      <div className="fl-inst">
      <Screen>
        <Meta left={meta} right={def ? `${def.bpm} bpm` : undefined} />
        <div className="ls-title">{(def?.title ?? "listen").toLowerCase()}</div>
        {isKick ? <KickShape decay={kickDecay} hit={playing ? beatN : -1} />
          : screen.clip === "synth-note" ? <AirWave playing={playing} />
          : screen.clip === "synth-pitch" ? <><WaveShape kind="soft" cycles={v === 0 ? 2 : 8} playing={playing} /><AirWave playing={playing} speed={v === 0 ? 0.6 : 2.2} /></>
          : screen.clip === "octave" ? <><WaveShape kind="soft" cycles={v === 0 ? 3 : 6} playing={playing} /><div className="fl-airlabels" aria-hidden><span>{v === 0 ? "3 wiggles in this window" : "6 wiggles in the same window"}</span><span>{v === 0 ? "220 a second" : "440 a second"}</span></div></>
          : screen.clip === "synth-loud" ? <><WaveShape kind="soft" cycles={3} amp={v === 0 ? 0.3 : 1} playing={playing} /><AirWave playing={playing} strength={v === 0 ? 0.35 : 1} /></>
          : screen.clip === "synth-shapes" ? <><WaveShape kind={(["soft", "saw", "square"] as const)[v] ?? "soft"} playing={playing} /><SynthChain playing={playing} /></>
          : <div className="ls-hearbar" aria-hidden>{Array.from({ length: 16 }, (_, i) => <i key={i} className={playing ? "is-on" : ""} style={{ animationDelay: `${i * 60}ms` }} />)}</div>}
      </Screen>
      {variants.length > 1 && (
        <>
          <Silk label="tap one to hear it" right={variants[v]?.label} />
          <div className="ls-pads" role="radiogroup" aria-label="Versions">
            {variants.map((x, i) => (
              <button key={x.label} type="button" role="radio" aria-checked={v === i} className={`ls-pad ${v === i ? "is-lit" : ""}`} style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties} onClick={() => pick(i)}>
                <small>{String.fromCharCode(97 + i)}</small><span>{x.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      </div>
      <div className="fl-text">{screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}<Folds items={screen.deeper} />{tail}</div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "play"} onClick={toggle} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play the clip"}><Icon name={playing ? "stop" : "hear"} /></Key>
          <GoPill onClick={onNext} style={{ gridColumn: "span 3" }} ariaLabel="Next">next</GoPill>
        </div>
      </div>
    </div>
  );
}

// ── shape: the lesson's knobs, with the loop playing ──────────────────────────
export const shapeKey = (slug: string, other?: string) => `ccd.shape.${slug}${other ? `.${other}` : ""}`;
export function readShape(slug: string, other?: string): Record<number, number> {
  try { return JSON.parse(sessionStorage.getItem(shapeKey(slug, other)) ?? "{}") as Record<number, number>; } catch { return {}; }
}
/** Knobs a lesson turned on parts other than the one it adds, by part: kept with the lesson's own. */
export function otherShapes(slug: string): [LayerType, Record<number, number>][] {
  const out: [LayerType, Record<number, number>][] = [];
  for (const t of ["drums", "hats", "bass", "chords", "lead"] as LayerType[]) { const p = readShape(slug, t); if (Object.keys(p).length) out.push([t, p]); }
  return out;
}

export function ShapeStep({ mission, screen, meta, accent, onNext, tail }: { mission: Mission; screen: Of<"shape">; meta: string; accent: string; onNext: () => void; tail?: ReactNode }) {
  const [base, setBase] = useState<TrackV2 | null>(null);
  useEffect(() => setBase(readTrackV2()), []);
  const [touched, setTouched] = useState<string | null>(null);
  const [beat, setBeat] = useState(-1);
  const take = useMemo(() => readTake(mission.slug), [mission.slug]);
  const own0 = useMemo(() => (take?.events.length ? take : presetTake(mission)), [take, mission]);
  // A shape step can name another part of your song than the one this lesson adds: then it shapes that part.
  const otherType = (["drums", "hats", "bass", "chords", "lead"] as LayerType[]).find(t => t === screen.layer && t !== own0.type);
  const line = useMemo(() => (otherType ? { ...own0, type: otherType, events: [] } : own0), [own0, otherType]);
  const [params, setParams] = useState<Record<number, number>>(() => readShape(mission.slug, otherType));
  const knobs = useMemo(() => {
    // The lesson's usual pair, plus any other knob of the instrument a lesson file names.
    const inst = line.type === "lead" ? LEAD_PARAMS : line.type === "bass" ? BASS_PARAMS : line.type === "chords" ? CHORD_PARAMS : [];
    // Drums: all four of the kick pad's knobs (tune, decay, drive, level) can be named.
    const kickPad = line.type === "drums" ? DRUM_PAD_PARAMS.map((sp, k) => ({ index: INSTRUMENT_BASE + k, spec: sp as ParamSpec })) : [];
    const all = [...shapeKnobs(line.type), ...inst.map(sp => ({ index: sp.index, spec: sp as ParamSpec })), ...kickPad.slice(2)];
    // Layer-wide knobs (eq, drive, echo, level, pan, send, duck) are there when a lesson names them.
    const wide = LAYER_PARAMS.map(sp => ({ index: sp.index, spec: sp as ParamSpec }));
    const wanted = screen.knobs.map(k => all.find(s => s.spec.key === k) ?? wide.find(s => s.spec.key === k)).filter(Boolean) as typeof all;
    return wanted.length ? wanted : all;
  }, [line.type, screen.knobs]);
  const world = worldOf(mission.slug) ?? undefined;
  // Nothing played in this lesson and your song already has this part: shape your own part.
  const own = !!base && (!!otherType || !take?.events.length) && base.layers.some(l => l.type === line.type && l.events.length > 0);
  const shown = useMemo(() => (base
    ? own ? withParams(base, line.type, params) : applyTake({ ...base, added: [] }, mission.slug, line, world, params)
    : null), [base, own, take, mission.slug, line, world, params]); // eslint-disable-line react-hooks/exhaustive-deps
  const { engine, ready } = useEngineTrack(shown ?? readTrackV2());
  const playing = beat >= 0;
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => () => { try { engine.stop(); } catch { /* not started */ } }, [engine]);
  useEffect(() => { try { sessionStorage.setItem(shapeKey(mission.slug, otherType), JSON.stringify(params)); } catch { /* ignore */ } }, [params, mission.slug, otherType]);
  const hear = async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); };
  // The loop is going when you arrive, so every turn is heard straight away.
  useEffect(() => {
    if (!shown) return;
    let gone = false;
    void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ });
    return () => { gone = true; };
  }, [!!shown]); // eslint-disable-line react-hooks/exhaustive-deps
  const val = (key: string) => { const k = knobs.find(x => x.spec.key === key); return k ? params[k.index] ?? k.spec.default : 0.5; };
  const isKick = line.type === "drums";
  // The lfo gets its own picture, and where it goes is a three-way switch rather than a knob.
  const lfoK = screen.knobs.includes("lfo") ? knobs.find(k => k.spec.key === "lforate") ?? (line.type === "lead" ? { index: LEAD_PARAMS.find(x => x.key === "lforate")!.index, spec: LEAD_PARAMS.find(x => x.key === "lforate")! as ParamSpec } : undefined) : undefined;
  const lfoToK = knobs.find(k => k.spec.key === "lfoto");
  const lfoToSpec = LEAD_PARAMS.find(x => x.key === "lfoto");
  const lfoToN = lfoToK ? params[lfoToK.index] ?? lfoToK.spec.default : lfoToSpec ? params[lfoToSpec.index] ?? lfoToSpec.default : 0;
  const lfoTo = lfoToN < 0.34 ? 0 : lfoToN < 0.67 ? 1 : 2;
  const dialKnobs = knobs.filter(k => k.spec.key !== "lfoto");
  // The engine's own pictures: the envelope when the lesson turns attack, decay or release; the filter for cutoff and res.
  const layerAt = shown ? shown.layers.findIndex(l => l.type === line.type) : -1;
  const shownLayer = layerAt >= 0 && shown ? shown.layers[layerAt] : null;
  const hatPad = line.type === "hats";
  const clock = useNoteClock(engine, layerAt, { bpm: shown?.bpm ?? 120, loop: shown?.loop ?? 4, events: shownLayer?.events ?? [] }, hatPad ? (n => n === 42) : undefined);
  const inst = TYPE[line.type].engine;
  const lp = shownLayer?.params ?? params;
  const envPic = !isKick && screen.knobs.some(k => k === "attack" || k === "release" || k === "decay") ? ampEnv(inst, lp, hatPad ? 4 : 0) : null;
  const fspec = (key: string) => (inst === "lead" ? LEAD_PARAMS : inst === "bass" ? BASS_PARAMS : inst === "chords" ? CHORD_PARAMS : []).find(p => p.key === key) as ParamSpec | undefined;
  const fc = fspec("cutoff"), fr = fspec("res"), fe = fspec("env");
  const fch = (inst === "lead" ? LEAD_PARAMS : inst === "bass" ? BASS_PARAMS : inst === "chords" ? CHORD_PARAMS : []).find(p => CHARACTER_KEYS.includes(p.key)) as ParamSpec | undefined;
  // A wave lesson keeps its wave picture; the filter shows when the lesson is about the filter.
  const filterPic = !isKick && !!fc && !!fr && (screen.knobs.some(k => k === "res" || k === "cut" || k === "fdecay" || k === "frel" || (k === "env" && !screen.knobs.includes("fm"))) || (screen.knobs.includes("cutoff") && !screen.knobs.includes("wave")));
  const nOf = (sp?: ParamSpec) => (sp ? lp[sp.index] ?? sp.default : 0);
  useEnter(onNext);
  return (
    <div className="ls-col">
      <div className="fl-inst">
      <Screen>
        <Meta left={meta} right={touched ?? (playing ? "playing, turn a knob" : "press play")} />
        {isKick ? <KickShape decay={val("decay")} tune={val("tune")} />
          : (envPic || filterPic) && !lfoK ? (
            <div className="ls-pics">
              {filterPic && fc && fr ? <FilterView cutoff={toValue(fc, nOf(fc))} res={toValue(fr, nOf(fr))} amount={nOf(fe)} fenv={filterEnv(inst, lp)} clock={clock} color={PIC.filter} character={fch ? characterOf(nOf(fch)) : "warm"} lowCut={toValue(LAYER_PARAMS[3], lp[3] ?? 0)} /> : null}
              {envPic ? <EnvView env={envPic} clock={clock} color={PIC.env} /> : null}
            </div>
          )
          : lfoK ? <LfoView rate={toValue(lfoK.spec, params[lfoK.index] ?? lfoK.spec.default)} depth={val("lfo")} to={LFO_TO[lfoTo]} playing={playing} />
          : line.type === "lead" ? <WaveShape morph={val("wave")} bright={screen.knobs.includes("cutoff") ? val("cutoff") : 0.18} amp={screen.knobs.includes("level") ? Math.min(1, val("level") / 0.75) : 1} cycles={3} playing={playing} />
          : <div className="ls-title">shape it</div>}
      </Screen>
      {lfoToK && (
        <div className="fl-marks tl-row lfo-to" role="radiogroup" aria-label="Where the lfo goes" style={{ ["--c" as string]: accent } as CSSProperties}>
          {LFO_TO.map((name, i) => <button key={name} type="button" role="radio" aria-checked={lfoTo === i} className={`ls-chip ${lfoTo === i ? "is-on" : ""}`}
            onClick={() => { setParams(p => ({ ...p, [lfoToK.index]: [0.15, 0.5, 0.85][i] })); setTouched(`lfo to the ${name}`); }}>to the {name}</button>)}
        </div>
      )}
      <div className="m1-g" style={{ gridTemplateColumns: `repeat(${Math.max(1, dialKnobs.length)}, 1fr)` }}>
        {dialKnobs.map(k => (
          <Knob key={k.index} label={k.spec.label} color={CAP.navy} size={74} height={150}
            {...bind(k.spec, params[k.index] ?? k.spec.default)}
            value={params[k.index] ?? k.spec.default} defaultValue={k.spec.default} readout={display(k.spec, params[k.index] ?? k.spec.default)}
            onChange={v => setParams(p => ({ ...p, [k.index]: v }))}
            onTouch={(label, v) => setTouched(`${label} ${display(k.spec, v)}`)} />
        ))}
      </div>
      </div>
      <div className="fl-text">
      <Body text={screen.body} starter={!!base && !base.layers.some(l => l.events.length > 0)} />
      {screen.hint ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
      {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "play"} onClick={hear} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play your loop"}><Icon name={playing ? "stop" : "play"} /></Key>
          <GoPill onClick={onNext} style={{ gridColumn: "span 3" }} ariaLabel="Next">keep this sound</GoPill>
        </div>
      </div>
    </div>
  );
}

const LFO_TO = ["filter", "pitch", "volume"] as const;

// ── ear: generated pitch rounds, a different sound and note each time ─────────
const WAVES: OscillatorType[] = ["sine", "triangle", "sawtooth", "square"];
type Round = { low: number; gap: number; wave: OscillatorType; firstHigher: boolean };

/** Pure so it can be tested: round `n` of a drill at a level. */
export function makeEarRound(n: number, level: "gentle" | "standard" | "hard", rnd: () => number = Math.random, prev?: Round): Round {
  const gaps = { gentle: [7, 12], standard: [3, 5], hard: [1, 2] }[level];
  const gap = gaps[Math.floor(rnd() * gaps.length)];
  let wave = WAVES[Math.floor(rnd() * WAVES.length)];
  if (prev && wave === prev.wave) wave = WAVES[(WAVES.indexOf(wave) + 1) % WAVES.length];
  return { low: 48 + Math.floor(rnd() * 20), gap, wave, firstHigher: rnd() < 0.5 };
}

/** Kick drill: two synthesized kicks that differ in length or in pitch. Pure so it can be tested. */
export type KickRound = { ask: "longer" | "lower"; firstIsAnswer: boolean; base: number; ratio: number; semis: number };
export function makeKickRound(level: "gentle" | "standard" | "hard", rnd: () => number = Math.random): KickRound {
  return {
    ask: rnd() < 0.5 ? "longer" : "lower",
    firstIsAnswer: rnd() < 0.5,
    base: 48 + Math.floor(rnd() * 12),
    ratio: { gentle: 3, standard: 2, hard: 1.5 }[level],
    semis: { gentle: 7, standard: 4, hard: 2 }[level],
  };
}
function kickHit(ctx: AudioContext, at: number, f0: number, decay: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(f0 * 3.5, at);
  o.frequency.exponentialRampToValueAtTime(f0, at + 0.05);
  g.gain.setValueAtTime(0.9, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  o.connect(g).connect(ctx.destination);
  o.start(at);
  o.stop(at + decay + 0.05);
}

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
function tone(ctx: AudioContext, at: number, midi: number, wave: OscillatorType) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = wave;
  o.frequency.value = hz(midi);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(0.18, at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.7);
  o.connect(g).connect(ctx.destination);
  o.start(at);
  o.stop(at + 0.75);
}

export function EarStep({ screen, meta, level, onNext }: { screen: Of<"ear">; meta: string; level: "gentle" | "standard" | "hard"; onNext: () => void }) {
  const [n, setN] = useState(0);
  const isKick = screen.drill === "kick";
  const [round, setRound] = useState<Round>(() => makeEarRound(0, level));
  const [kr, setKr] = useState<KickRound>(() => makeKickRound(level));
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const total = Math.max(1, screen.rounds);
  const done = n >= total;
  const play = () => {
    const ctx = getCtx();
    if (!ctx) return;
    void ctx.resume();
    const t = ctx.currentTime + 0.05;
    if (isKick) {
      const f = (m: number) => hz(m);
      const win = kr.firstIsAnswer;
      const mk = (answer: boolean) => kr.ask === "longer"
        ? { f0: f(kr.base), d: answer ? 0.7 : 0.7 / kr.ratio }
        : { f0: f(answer ? kr.base - kr.semis : kr.base), d: 0.4 };
      const a = mk(win), b = mk(!win);
      kickHit(ctx, t, a.f0, a.d);
      kickHit(ctx, t + 1.1, b.f0, b.d);
      return;
    }
    const hi = round.low + round.gap;
    tone(ctx, t, round.firstHigher ? hi : round.low, round.wave);
    tone(ctx, t + 0.9, round.firstHigher ? round.low : hi, round.wave);
  };
  useEffect(() => { if (!done) { const id = window.setTimeout(play, 350); return () => window.clearTimeout(id); } }, [n]); // eslint-disable-line react-hooks/exhaustive-deps
  const answer = isKick ? (kr.firstIsAnswer ? 0 : 1) : round.firstHigher ? 0 : 1;
  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === answer) { setRight(r => r + 1); playCorrect(); } else playWrong();
  };
  const advance = () => {
    if (n + 1 >= total) { setN(total); return; }
    setRound(r => makeEarRound(n + 1, level, Math.random, r));
    setKr(makeKickRound(level));
    setPicked(null);
    setN(n + 1);
  };
  useEnter(done ? onNext : picked !== null ? advance : null);
  if (done) {
    return (
      <div className="ls-col">
        <Screen>
          <Meta left={meta} right="ear round done" />
          <div className="ls-title">{right} of {total}</div>
          <p className="ls-sub">{right === total ? "every one. your ears are warm." : "good. this gets easier with a little practice, and it comes back in your review."}</p>
        </Screen>
        <Bottom go={{ label: "next", onClick: onNext }} />
      </div>
    );
  }
  return (
    <div className="ls-col">
      <Screen>
        <Meta left={meta} right={`${n + 1} of ${total}`} />
        <div className="ls-title">{isKick ? `which kick was ${kr.ask}?` : "which was higher?"}</div>
        <p className="ls-sub">{screen.body ?? "two notes. a new sound every round. answer when you know, replay as often as you like."}</p>
      </Screen>
      <Silk label="answer" right={picked === null ? "tap one" : picked === answer ? "right" : "the outlined one was right"} />
      <div className="ls-pads" role="radiogroup" aria-label={isKick ? `Which kick was ${kr.ask}` : "Which note was higher"}>
        {["the first", "the second"].map((label, i) => {
          const cls = picked === null ? "" : i === answer ? (picked === i ? "is-lit is-right" : "is-ring") : picked === i ? "is-lit is-wrong" : "is-dim";
          return (
            <button key={label} type="button" role="radio" aria-checked={picked === i} disabled={picked !== null} className={`ls-pad ${cls}`} style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties} onClick={() => pick(i)}>
              <small>{String.fromCharCode(97 + i)}</small><span>{label}</span>
            </button>
          );
        })}
      </div>
      {isKick && <button type="button" className="ls-chip" onClick={onNext} style={{ justifySelf: "center" }}>can't hear this? skip</button>}
      <Bottom
        left={{ label: "again", icon: "hear", onClick: play, aria: "Play the two sounds again" }}
        go={picked === null ? { label: "pick one", disabled: true } : { label: n + 1 >= total ? "finish" : "next", onClick: advance }} />
    </div>
  );
}

// ── a fresh song for the first lesson, and a way to hear the ones you have ────
export const startsFresh = (m: Mission) => m.fromFile?.adds.kind === "kick";
export const songHasMusic = () => readTrackV2().layers.some(l => l.events.length > 0);

export function FreshStart() {
  const [mine, setMine] = useState<{ has: boolean; name: string; count: number } | null>(null);
  useEffect(() => { const i = readSongs(); setMine({ has: songHasMusic(), name: i.songs.find(x => x.id === i.active)?.name ?? "my track", count: i.songs.length }); }, []);
  const { engine, ready } = useEngineTrack(readTrackV2());
  const [playing, setPlaying] = useState(false);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setPlaying(!!(e.flags & FLAG.playing)); }), [engine]);
  if (!mine) return null;
  const toggle = async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); };
  return (
    <div className="ls-panel ls-fresh">
      <p>{mine.has ? `this lesson starts a new song with a click. "${mine.name}" stays saved.` : "this lesson starts your first song. a click keeps time while you play."}</p>
      {mine.has && <button type="button" className="ls-chip" onClick={toggle} aria-pressed={playing}>{playing ? "stop" : "hear my song"}</button>}
    </div>
  );
}

// ── tempo: one knob sets your song's speed, the loop playing at whatever it's turned to ──
/** What each named speed on the dial is known for. */
const TEMPO_LABEL: Record<number, string> = {
  90: "hip hop", 100: "slow and heavy", 110: "disco", 120: "house", 124: "deep house", 128: "tech house",
  130: "techno", 140: "garage, dubstep", 150: "fast", 170: "drum and bass",
};
const BPM_MIN = 80, BPM_MAX = 160;
const toV = (bpm: number) => (bpm - BPM_MIN) / (BPM_MAX - BPM_MIN);
const toBpm = (v: number) => Math.round(BPM_MIN + v * (BPM_MAX - BPM_MIN));

export function TempoStep(props: { screen: Of<"tempo">; accent: string; onNext: () => void; tail?: ReactNode; mine?: TrackV2 | null }) {
  const Tool = TOOL_STEPS[props.screen.set];
  if (Tool) return <Tool {...props} />;
  return props.screen.set === "swing" ? <SwingStep {...props} /> : props.screen.set === "scale" ? <ScaleStep {...props} /> : props.screen.set === "glue" ? <GlueStep {...props} /> : props.screen.set === "kit" ? <KitStep {...props} /> : <BpmStep {...props} />;
}

/** Synth drums or the recorded kit, on your own pattern. */
function KitStep({ screen, accent, onNext, tail }: { screen: Of<"tempo">; accent: string; onNext: () => void; tail?: ReactNode }) {
  const loop = useMemo(() => (songHasMusic() ? readTrackV2() : clipVariants("four-on-the-floor")[0].track), []);
  const [real, setReal] = useState(loop.layers.some(l => l.id === REAL_KIT_ID));
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { void loadRealKit().then(setLoaded); }, []);
  const shown = useMemo(() => (real && loaded ? withRealKit(loop) : withSynthKit(loop)), [loop, real, loaded]);
  const { engine, ready } = useEngineTrack(shown);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { let gone = false; void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ }); return () => { gone = true; try { engine.stop(); } catch { /* not started */ } }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const playing = beat >= 0;
  const keep = () => { const t = readTrackV2(); if (t.layers.some(l => l.events.length)) { writeTrackV2({ ...(real ? withRealKit(t) : withSynthKit(t)), updatedAt: Date.now() }); window.dispatchEvent(new Event("ccd:song")); } onNext(); };
  useEnter(keep);
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left="your kit" right={!loaded ? "loading the recordings" : playing ? "playing, switch kits" : "press play"} />
          <div className="fl-bpm"><b style={{ fontSize: 44 }}>{real ? "recorded" : "synth"}</b><span>{real ? "a real kick, clap, hat and snare" : "drums made from numbers by the engine"}</span></div>
        </Screen>
        <div className="fl-marks" role="radiogroup" aria-label="Kit" style={{ ["--c" as string]: accent, marginTop: 12 } as CSSProperties}>
          <button type="button" role="radio" aria-checked={!real} className={`ls-chip ${!real ? "is-on" : ""}`} onClick={() => setReal(false)}>synth<small>made by the engine</small></button>
          <button type="button" role="radio" aria-checked={real} disabled={!loaded} className={`ls-chip ${real ? "is-on" : ""}`} onClick={() => setReal(true)}>recorded<small>real drums on your pattern</small></button>
        </div>
      </div>
      <div className="fl-text">
        {screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
        {screen.hint ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "play"} onClick={async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); }} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play the loop"}><Icon name={playing ? "stop" : "play"} /></Key>
          <GoPill onClick={keep} style={{ gridColumn: "span 3" }} ariaLabel="Use this kit">use the {real ? "recorded" : "synth"} kit</GoPill>
        </div>
      </div>
    </div>
  );
}

/** The master bus: glue (the bus compressor) and out (the level into the limiter). Writes the song's master. */
function GlueStep({ screen, accent, onNext, tail }: { screen: Of<"tempo">; accent: string; onNext: () => void; tail?: ReactNode }) {
  const loop = useMemo(() => (songHasMusic() ? readTrackV2() : clipVariants("four-on-the-floor")[0].track), []);
  const [glue, setGlue] = useState(loop.master?.[1] ?? 0.25);
  const [out, setOut] = useState(loop.master?.[0] ?? 0.75);
  const shown = useMemo(() => ({ ...loop, master: { ...(loop.master ?? {}), 0: out, 1: glue } }), [loop, glue, out]);
  const { engine, ready } = useEngineTrack(shown);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { let gone = false; void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ }); return () => { gone = true; try { engine.stop(); } catch { /* not started */ } }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const playing = beat >= 0;
  const keep = () => { const t = readTrackV2(); writeTrackV2({ ...t, master: { ...(t.master ?? {}), 0: out, 1: glue }, updatedAt: Date.now() }); window.dispatchEvent(new Event("ccd:song")); onNext(); };
  useEnter(keep);
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left="master bus" right={playing ? "playing, turn the knobs" : "press play"} />
          <div className="fl-bpm"><b>{Math.round(glue * 100)}</b><span>% glue · out {Math.round(out * 100)}%</span></div>
          <div className="fl-airlabels"><span>glue squeezes the whole mix together</span><span>the limiter stops it clipping</span></div>
        </Screen>
        <div className="m1-g" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 12 }}>
          <Knob label="glue" readout={`${Math.round(glue * 100)}%`} color={CAP.navy} size={84} height={160} led={accent} value={glue} defaultValue={0.25} onChange={setGlue} />
          <Knob label="out" readout={`${Math.round(out * 100)}%`} color={CAP.navy} size={84} height={160} led={accent} value={out} defaultValue={0.75} onChange={setOut} />
        </div>
      </div>
      <div className="fl-text">
        {screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
        {screen.hint ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "play"} onClick={async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); }} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play the loop"}><Icon name={playing ? "stop" : "play"} /></Key>
          <GoPill onClick={keep} style={{ gridColumn: "span 3" }} ariaLabel="Use this glue">use this</GoPill>
        </div>
      </div>
    </div>
  );
}

const SCALE_LINE: Record<string, string> = { minor: "darker, moodier", major: "bright, happy", dorian: "minor with a lift", "minor pentatonic": "five notes, no wrong ones" };

/** Your song's melody, bass and chords moved into another scale, note by note. */
function inScale(t: TrackV2, to: ScaleName): TrackV2 {
  const from = (t.scale ?? "minor") as ScaleName;
  if (from === to) return t;
  return { ...t, scale: to as TrackV2["scale"], layers: t.layers.map(l => (l.type === "lead" || l.type === "bass" || l.type === "chords" ? { ...l, events: l.events.map(e => ({ ...e, note: remapToScale(e.note, t.root, from, to) })) } : l)) };
}

function ScaleStep({ screen, accent, onNext, tail, mine }: { screen: Of<"tempo">; accent: string; onNext: () => void; tail?: ReactNode; mine?: TrackV2 | null }) {
  const choices = (screen.choices?.length ? screen.choices : ["minor", "major"]) as ScaleName[];
  const [sc, setSc] = useState<ScaleName>("minor");
  const loop = useMemo(() => mine ?? (songHasMusic() ? readTrackV2() : clipVariants("synth-note")[0].track), [mine]);
  useEffect(() => setSc(((loop.scale as ScaleName) ?? "minor")), [loop]);
  const shown = useMemo(() => inScale(loop, sc), [loop, sc]);
  const { engine, ready } = useEngineTrack(shown);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { let gone = false; void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ }); return () => { gone = true; try { engine.stop(); } catch { /* not started */ } }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const playing = beat >= 0;
  const keep = () => { writeTrackV2({ ...inScale(readTrackV2(), sc), updatedAt: Date.now() }); window.dispatchEvent(new Event("ccd:song")); onNext(); };
  useEnter(keep);
  const steps = SCALES[sc] as readonly number[];
  const root = loop.root ?? 45;
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left="your scale" right={playing ? "playing, pick a scale" : "press play"} />
          <div className="fl-bpm"><b style={{ fontSize: 44 }}>{NOTE_NAMES[((root % 12) + 12) % 12]} {sc}</b></div>
          <div className="fl-airlabels"><span>{SCALE_LINE[sc] ?? ""}</span><span>{steps.length} notes</span></div>
          <div className="fl-scalekeys" aria-label={`The notes of ${NOTE_NAMES[((root % 12) + 12) % 12]} ${sc}`}>
            {Array.from({ length: 12 }, (_, i) => <i key={i} className={`${[1, 3, 6, 8, 10].includes((i + root) % 12) ? "is-black" : ""} ${steps.includes(i) ? "is-in" : ""}`} style={{ ["--c" as string]: accent } as CSSProperties}><small>{NOTE_NAMES[(i + root) % 12]}</small></i>)}
          </div>
        </Screen>
        <div className="fl-marks" role="radiogroup" aria-label="Scales" style={{ ["--c" as string]: accent, marginTop: 12 } as CSSProperties}>
          {choices.map(c => (
            <button key={c} type="button" role="radio" aria-checked={c === sc} className={`ls-chip ${c === sc ? "is-on" : ""}`} onClick={() => setSc(c)}>{c}<small>{SCALE_LINE[c] ?? ""}</small></button>
          ))}
        </div>
      </div>
      <div className="fl-text">
        {screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
        {screen.hint ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "play"} onClick={async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); }} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play the loop"}><Icon name={playing ? "stop" : "play"} /></Key>
          <GoPill onClick={keep} style={{ gridColumn: "span 3" }} ariaLabel={`Use ${sc}`}>use {sc}</GoPill>
        </div>
      </div>
    </div>
  );
}

const SWING_LABEL: Record<string, string> = { "0": "straight", "0.25": "a little", "0.5": "triplet feel", "0.7": "heavy shuffle" };

function SwingStep({ screen, accent, onNext, tail, mine }: { screen: Of<"tempo">; accent: string; onNext: () => void; tail?: ReactNode; mine?: TrackV2 | null }) {
  const [sw, setSw] = useState(0);
  useEffect(() => setSw(readTrackV2().swing ?? 0), []);
  const loop = useMemo(() => mine ?? (songHasMusic() ? readTrackV2() : clipVariants("hats-offbeat")[0].track), [mine]);
  const shown = useMemo(() => ({ ...loop, swing: sw }), [loop, sw]);
  const { engine, ready } = useEngineTrack(shown);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { let gone = false; void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ }); return () => { gone = true; try { engine.stop(); } catch { /* not started */ } }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const playing = beat >= 0;
  const keep = () => { const t = readTrackV2(); writeTrackV2({ ...t, swing: sw, updatedAt: Date.now() }); window.dispatchEvent(new Event("ccd:song")); onNext(); };
  useEnter(keep);
  const pct = Math.round(50 + sw * (100 / 6) * 2);
  const push = sw / 6;
  // Where the sixteenths land in one beat: straight ones evenly, the off ones pushed late.
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left="swing" right={playing ? "playing, turn the knob" : "press play"} />
          <div className="fl-bpm"><b>{Math.round(sw * 100)}</b><span>% swing · {SWING_LABEL[String(screen.marks.reduce((a, m) => (Math.abs(m - sw) < Math.abs(a - sw) ? m : a), screen.marks[0]))] ?? ""}</span></div>
          <svg viewBox="0 0 330 56" width="100%" className="fl-swing" role="img" aria-label="Where the sixteenths land in one beat">
            {[0, 1, 2, 3].map(i => <line key={`g${i}`} x1={20 + i * 72} x2={20 + i * 72} y1={8} y2={48} stroke="rgba(255,255,255,.12)" strokeDasharray="3 3" />)}
            {[0, 1, 2, 3].map(i => { const x = 20 + (i + (i % 2 ? push * 4 : 0)) * 72; return <circle key={i} cx={x} cy={28} r={i % 2 ? 8 : 11} fill={accent} opacity={i % 2 ? 0.75 : 1} />; })}
          </svg>
          <div className="fl-airlabels"><span>one beat, four sixteenths</span><span>the 2nd and 4th land {pct}% of the way</span></div>
        </Screen>
        <div className="fl-tempo">
          <Knob label="swing" readout={`${Math.round(sw * 100)}%`} color={CAP.navy} size={92} height={170} led={accent} value={sw / 0.75} defaultValue={0} onChange={v => setSw(Math.round(v * 0.75 * 100) / 100)} />
          <div className="fl-marks" role="radiogroup" aria-label="Amounts to try" style={{ ["--c" as string]: accent } as CSSProperties}>
            {screen.marks.map(m => (
              <button key={m} type="button" role="radio" aria-checked={Math.abs(m - sw) < 0.01} className={`ls-chip ${Math.abs(m - sw) < 0.01 ? "is-on" : ""}`} onClick={() => setSw(m)}>{Math.round(m * 100)}%<small>{SWING_LABEL[String(m)] ?? ""}</small></button>
            ))}
          </div>
        </div>
      </div>
      <div className="fl-text">
        {screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
        {screen.hint ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "play"} onClick={async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); }} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play the loop"}><Icon name={playing ? "stop" : "play"} /></Key>
          <GoPill onClick={keep} style={{ gridColumn: "span 3" }} ariaLabel={`Use ${Math.round(sw * 100)} percent swing`}>use this swing</GoPill>
        </div>
      </div>
    </div>
  );
}

function BpmStep({ screen, accent, onNext, tail, mine }: { screen: Of<"tempo">; accent: string; onNext: () => void; tail?: ReactNode; mine?: TrackV2 | null }) {
  const [bpm, setBpm] = useState(120);
  useEffect(() => setBpm(readTrackV2().bpm || 120), []);
  // What you just played (in your song), or your song, or a kick with hats so the speed is easy to feel.
  const loop = useMemo(() => mine ?? (songHasMusic() ? readTrackV2() : clipVariants("hats-offbeat")[0].track), [mine]);
  const shown = useMemo(() => ({ ...loop, bpm }), [loop, bpm]);
  const { engine, ready } = useEngineTrack(shown);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { let gone = false; void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ }); return () => { gone = true; try { engine.stop(); } catch { /* not started */ } }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const playing = beat >= 0;
  const keep = () => {
    const t = readTrackV2();
    writeTrackV2({ ...t, bpm, updatedAt: Date.now() });
    window.dispatchEvent(new Event("ccd:song"));
    onNext();
  };
  useEnter(keep);
  const marks = screen.marks;
  const near = marks.reduce((a, m) => (Math.abs(m - bpm) < Math.abs(a - bpm) ? m : a), marks[0]);
  const label = Math.abs(near - bpm) <= 3 ? TEMPO_LABEL[near] : undefined;
  const ms = Math.round(60000 / bpm);
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left="set your tempo" right={playing ? "playing, turn the knob" : "press play"} />
          <div className="fl-bpm"><b>{bpm}</b><span>bpm{label ? ` · ${label}` : ""}</span></div>
          <div className="fl-beats" aria-hidden>{[0, 1, 2, 3].map(i => <i key={i} className={playing && Math.floor(((beat % 4) + 4) % 4) === i ? "is-on" : ""} style={{ ["--c" as string]: accent } as CSSProperties} />)}</div>
          <div className="fl-airlabels"><span>one beat every {ms} ms</span><span>{(bpm / 60).toFixed(1)} beats a second</span></div>
        </Screen>
        <div className="fl-tempo">
          <Knob label="tempo" readout={`${bpm} bpm`} color={CAP.navy} size={92} height={170} led={accent} value={toV(bpm)} defaultValue={toV(120)} onChange={v => setBpm(toBpm(v))} />
          <div className="fl-marks" role="radiogroup" aria-label="Tempos to try" style={{ ["--c" as string]: accent } as CSSProperties}>
            {marks.map(m => (
              <button key={m} type="button" role="radio" aria-checked={m === bpm} className={`ls-chip ${m === bpm ? "is-on" : ""}`} onClick={() => setBpm(m)}>{m}{TEMPO_LABEL[m] ? <small>{TEMPO_LABEL[m]}</small> : null}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="fl-text">
        {screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
        {screen.hint ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "play"} onClick={async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); }} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play the loop"}><Icon name={playing ? "stop" : "play"} /></Key>
          <GoPill onClick={keep} style={{ gridColumn: "span 3" }} ariaLabel={`Use ${bpm} bpm`}>use {bpm} bpm</GoPill>
        </div>
      </div>
    </div>
  );
}
