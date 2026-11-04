"use client";
/**
 * The step screens that come from lesson files: say (with a go deeper track), hear (a clip on
 * our own engine), shape (the lesson's two knobs, hear before and after) and ear (generated rounds).
 * Same Model 1 parts as the rest of the player.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FLAG, OUT, display } from "@/engine";
import { clipVariants } from "@/content/lessons/clipTracks";
import { CLIPS } from "@/content/lessons/clips";
import type { LessonScreen, Mission } from "@/content/types";
import { applyTake, readTake, shapeKnobs, takeType } from "@/lib/lessonTake";
import { offerFor, readTrack } from "@/lib/track";
import { getCtx, playCorrect, playWrong } from "@/lib/audio";
import { readTrackV2, type TrackV2 } from "@/lib/track2";
import { worldOf } from "@/lib/worldOrder";
import { presetTake } from "./AddToTrack";
import { readSongs } from "@/lib/songs";
import { CAP, GoPill, Icon, Key, Knob, Screen, Silk } from "./controls";
import { Bottom, Meta, useEnter } from "./LessonParts";
import { useEngineTrack } from "./useEngineTrack";
import { Gloss } from "./Gloss";

type Of<K extends LessonScreen["kind"]> = Extract<LessonScreen, { kind: K }>;

// ── say: an explanation; the extra bits fold out below if you want them ───────
export function SayStep({ screen, meta, onNext, tail }: { screen: Of<"say">; meta: string; onNext: () => void; tail?: ReactNode }) {
  useEnter(onNext);
  return (
    <div className="ls-col">
      <div className="fl-inst">
      <Screen>
        <Meta left={meta} />
        <div className="ls-title">{screen.title.toLowerCase()}</div>
      </Screen>
      </div>
      <div className="fl-text">
      {screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
      {screen.deeper?.length ? (
        <div className="fl-more">
          {screen.deeper.map(d => (
            <details key={d.title} className="fl-fold">
              <summary>{d.title.toLowerCase()}</summary>
              {d.body.split(/\n+/).map((para, i) => <p key={i}><Gloss>{para}</Gloss></p>)}
            </details>
          ))}
        </div>
      ) : null}
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
        <polyline points={pts.join(" ")} fill="none" stroke="var(--led-go)" strokeWidth={1.8} className="fl-kickline" vectorEffect="non-scaling-stroke" />
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
  useEffect(() => { void ready().then(() => { engine.metronome(false); engine.play(); heard.current = true; }).catch(() => { /* needs a tap */ }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
        {isKick
          ? <KickShape decay={kickDecay} hit={playing ? beatN : -1} />
          : <div className="ls-hearbar" aria-hidden>{Array.from({ length: 16 }, (_, i) => <i key={i} className={playing ? "is-on" : ""} style={{ animationDelay: `${i * 60}ms` }} />)}</div>}
      </Screen>
      {variants.length > 1 && (
        <>
          <Silk label="tap one to hear it" right={variants[v]?.label} />
          <div className="ls-pads" role="radiogroup" aria-label="Versions">
            {variants.map((x, i) => (
              <button key={x.label} type="button" role="radio" aria-checked={v === i} className={`ls-pad ${v === i ? "is-lit" : ""}`} style={{ ["--c" as string]: "var(--led-go)" } as CSSProperties} onClick={() => pick(i)}>
                <small>{String.fromCharCode(97 + i)}</small><span>{x.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      </div>
      <div className="fl-text">{screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}{tail}</div>
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
export const shapeKey = (slug: string) => `ccd.shape.${slug}`;
export function readShape(slug: string): Record<number, number> {
  try { return JSON.parse(sessionStorage.getItem(shapeKey(slug)) ?? "{}") as Record<number, number>; } catch { return {}; }
}

export function ShapeStep({ mission, screen, meta, accent, onNext, tail }: { mission: Mission; screen: Of<"shape">; meta: string; accent: string; onNext: () => void; tail?: ReactNode }) {
  const [base, setBase] = useState<TrackV2 | null>(null);
  useEffect(() => setBase(readTrackV2()), []);
  const [params, setParams] = useState<Record<number, number>>(() => readShape(mission.slug));
  const [touched, setTouched] = useState<string | null>(null);
  const [beat, setBeat] = useState(-1);
  const take = useMemo(() => readTake(mission.slug), [mission.slug]);
  const line = useMemo(() => (take?.events.length ? take : presetTake(mission)), [take, mission]);
  const knobs = useMemo(() => {
    const all = shapeKnobs(line.type);
    const wanted = screen.knobs.map(k => all.find(s => s.spec.key === k)).filter(Boolean) as typeof all;
    return wanted.length ? wanted : all;
  }, [line.type, screen.knobs]);
  const world = worldOf(mission.slug) ?? undefined;
  const shown = useMemo(() => (base ? applyTake({ ...base, added: [] }, mission.slug, line, world, params) : null), [base, mission.slug, line, world, params]);
  const { engine, ready } = useEngineTrack(shown ?? readTrackV2());
  const playing = beat >= 0;
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => () => { try { engine.stop(); } catch { /* not started */ } }, [engine]);
  useEffect(() => { try { sessionStorage.setItem(shapeKey(mission.slug), JSON.stringify(params)); } catch { /* ignore */ } }, [params, mission.slug]);
  const hear = async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); };
  // The loop is going when you arrive, so every turn is heard straight away.
  useEffect(() => {
    if (!shown) return;
    void ready().then(() => { engine.metronome(false); engine.play(); }).catch(() => { /* needs a tap */ });
  }, [!!shown]); // eslint-disable-line react-hooks/exhaustive-deps
  const val = (key: string) => { const k = knobs.find(x => x.spec.key === key); return k ? params[k.index] ?? k.spec.default : 0.5; };
  const isKick = line.type === "drums";
  useEnter(onNext);
  return (
    <div className="ls-col">
      <div className="fl-inst">
      <Screen>
        <Meta left={meta} right={touched ?? (playing ? "playing, turn a knob" : "press play")} />
        {isKick ? <KickShape decay={val("decay")} tune={val("tune")} /> : <div className="ls-title">shape it</div>}
      </Screen>
      <div className="m1-g" style={{ gridTemplateColumns: `repeat(${Math.max(1, knobs.length)}, 1fr)` }}>
        {knobs.map((k, i) => (
          <Knob key={k.index} label={k.spec.label} color={i === 0 ? CAP.go : CAP.navy} size={74} height={150} led={accent}
            value={params[k.index] ?? k.spec.default} defaultValue={k.spec.default}
            onChange={v => setParams(p => ({ ...p, [k.index]: v }))}
            onTouch={(label, v) => setTouched(`${label} ${display(k.spec, v)}`)} />
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
          <Key label={playing ? "stop" : "play"} onClick={hear} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play your loop"}><Icon name={playing ? "stop" : "play"} /></Key>
          <GoPill onClick={onNext} style={{ gridColumn: "span 3" }} ariaLabel="Next">keep this sound</GoPill>
        </div>
      </div>
    </div>
  );
}

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
            <button key={label} type="button" role="radio" aria-checked={picked === i} disabled={picked !== null} className={`ls-pad ${cls}`} style={{ ["--c" as string]: "var(--led-go)" } as CSSProperties} onClick={() => pick(i)}>
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
