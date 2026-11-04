"use client";
/**
 * The step screens that come from lesson files: say (with a go deeper track), hear (a clip on
 * our own engine), shape (the lesson's two knobs, hear before and after) and ear (generated rounds).
 * Same Model 1 parts as the rest of the player.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
import { CAP, GoPill, Icon, Key, Knob, Screen, Silk } from "./controls";
import { Bottom, Meta, useEnter } from "./LessonParts";
import { useEngineTrack } from "./useEngineTrack";

type Of<K extends LessonScreen["kind"]> = Extract<LessonScreen, { kind: K }>;

// ── say: an explanation, with a deeper track you open when you want it ─────────
export function SayStep({ screen, meta, onNext }: { screen: Of<"say">; meta: string; onNext: () => void }) {
  const [deep, setDeep] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const has = !!screen.deeper?.length;
  useEnter(deep ? null : onNext);
  return (
    <div className="ls-col">
      <Screen>
        <Meta left={meta} right={has ? `${screen.deeper!.length} deeper` : undefined} />
        <div className="ls-title">{screen.title.toLowerCase()}</div>
      </Screen>
      <Silk label={deep ? "going deeper" : "read"} right={deep ? "tap one to open it" : undefined} />
      {!deep ? (
        <p className="ls-read">{screen.body}</p>
      ) : (
        <div className="ls-deeper">
          {screen.deeper!.map((d, i) => (
            <button key={d.title} type="button" className={`ls-panel ls-dp ${open === i ? "is-open" : ""}`} aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              <span className="ls-led" style={{ ["--c" as string]: "var(--led-go)" } as CSSProperties} />
              <span>
                <b>{d.title.toLowerCase()}</b>
                {open === i ? <span className="ls-dp-body">{d.body}</span> : null}
              </span>
            </button>
          ))}
        </div>
      )}
      <Bottom
        left={has ? { label: deep ? "back" : "go deeper", icon: deep ? "back" : "search", onClick: () => setDeep(d => !d), aria: deep ? "Back to the lesson" : "Go deeper into this" } : undefined}
        go={{ label: "next", onClick: onNext, aria: "Next" }}
      />
    </div>
  );
}

// ── hear: a clip rendered live on our engine ──────────────────────────────────
export function HearStep({ screen, meta, onNext }: { screen: Of<"hear">; meta: string; onNext: () => void }) {
  const variants = useMemo(() => clipVariants(screen.clip), [screen.clip]);
  const def = CLIPS.find(c => c.id === screen.clip);
  const [v, setV] = useState(0);
  const [playing, setPlaying] = useState(false);
  const track = variants[v]?.track ?? variants[0]?.track;
  const { engine, start } = useEngineTrack(track ?? readTrackV2());
  const heard = useRef(false);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setPlaying(!!(e.flags & FLAG.playing)); }), [engine]);
  useEffect(() => () => { try { engine.stop(); } catch { /* engine not started */ } }, [engine]);
  const toggle = () => { start(); if (playing) engine.stop(); else { engine.play(); heard.current = true; } };
  const pick = (i: number) => { if (i === v) return; setV(i); start(); window.setTimeout(() => engine.play(), 40); heard.current = true; };
  useEnter(onNext);
  return (
    <div className="ls-col">
      <Screen>
        <Meta left={meta} right={def ? `${def.bpm} bpm` : undefined} />
        <div className="ls-title">{(def?.title ?? "listen").toLowerCase()}</div>
        <div className="ls-hearbar" aria-hidden>{Array.from({ length: 16 }, (_, i) => <i key={i} className={playing ? "is-on" : ""} style={{ animationDelay: `${i * 60}ms` }} />)}</div>
      </Screen>
      {variants.length > 1 && (
        <>
          <Silk label="same sound, two ways" right="tap to switch" />
          <div className="ls-pads" role="radiogroup" aria-label="Versions">
            {variants.map((x, i) => (
              <button key={x.label} type="button" role="radio" aria-checked={v === i} className={`ls-pad ${v === i ? "is-lit" : ""}`} style={{ ["--c" as string]: "var(--led-go)" } as CSSProperties} onClick={() => pick(i)}>
                <small>{String.fromCharCode(97 + i)}</small><span>{x.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      <Silk label="listen" />
      <p className="ls-read">{screen.body}</p>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "hear it"} onClick={toggle} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play the clip"}><Icon name={playing ? "stop" : "hear"} /></Key>
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

export function ShapeStep({ mission, screen, meta, accent, onNext }: { mission: Mission; screen: Of<"shape">; meta: string; accent: string; onNext: () => void }) {
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
  const { engine, start } = useEngineTrack(shown ?? readTrackV2());
  const playing = beat >= 0;
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => () => { try { engine.stop(); } catch { /* not started */ } }, [engine]);
  useEffect(() => { try { sessionStorage.setItem(shapeKey(mission.slug), JSON.stringify(params)); } catch { /* ignore */ } }, [params, mission.slug]);
  const hear = () => { start(); if (playing) engine.stop(); else engine.play(); };
  useEnter(onNext);
  return (
    <div className="ls-col">
      <Screen>
        <Meta left={meta} right={touched ?? "turn one while it plays"} />
        <div className="ls-title">shape it</div>
        <p className="ls-sub">{screen.body}</p>
      </Screen>
      <Silk label="knobs" right="double tap to reset" />
      <div className="m1-g" style={{ gridTemplateColumns: `repeat(${Math.max(1, knobs.length)}, 1fr)` }}>
        {knobs.map((k, i) => (
          <Knob key={k.index} label={k.spec.label} color={i === 0 ? CAP.go : CAP.navy} size={74} height={170} led={accent}
            value={params[k.index] ?? k.spec.default} defaultValue={k.spec.default}
            onChange={v => setParams(p => ({ ...p, [k.index]: v }))}
            onTouch={(label, v) => setTouched(`${label} ${display(k.spec, v)}`)} />
        ))}
      </div>
      {screen.hint ? <div className="ls-hint">{screen.hint}</div> : null}
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "hear"} onClick={hear} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Hear your loop"}><Icon name={playing ? "stop" : "hear"} /></Key>
          <GoPill onClick={onNext} style={{ gridColumn: "span 3" }} ariaLabel="Next">keep it</GoPill>
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
  const [round, setRound] = useState<Round>(() => makeEarRound(0, level));
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const total = Math.max(1, screen.rounds);
  const done = n >= total;
  const play = () => {
    const ctx = getCtx();
    if (!ctx) return;
    void ctx.resume();
    const t = ctx.currentTime + 0.05;
    const hi = round.low + round.gap;
    tone(ctx, t, round.firstHigher ? hi : round.low, round.wave);
    tone(ctx, t + 0.9, round.firstHigher ? round.low : hi, round.wave);
  };
  useEffect(() => { if (!done) { const id = window.setTimeout(play, 350); return () => window.clearTimeout(id); } }, [n]); // eslint-disable-line react-hooks/exhaustive-deps
  const answer = round.firstHigher ? 0 : 1;
  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === answer) { setRight(r => r + 1); playCorrect(); } else playWrong();
  };
  const advance = () => {
    if (n + 1 >= total) { setN(total); return; }
    setRound(r => makeEarRound(n + 1, level, Math.random, r));
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
        <div className="ls-title">which was higher?</div>
        <p className="ls-sub">{screen.body ?? "two notes. a new sound every round. answer when you know, replay as often as you like."}</p>
      </Screen>
      <Silk label="answer" right={picked === null ? "tap one" : picked === answer ? "right" : "the outlined one was right"} />
      <div className="ls-pads" role="radiogroup" aria-label="Which note was higher">
        {["the first", "the second"].map((label, i) => {
          const cls = picked === null ? "" : i === answer ? (picked === i ? "is-lit is-right" : "is-ring") : picked === i ? "is-lit is-wrong" : "is-dim";
          return (
            <button key={label} type="button" role="radio" aria-checked={picked === i} disabled={picked !== null} className={`ls-pad ${cls}`} style={{ ["--c" as string]: "var(--led-go)" } as CSSProperties} onClick={() => pick(i)}>
              <small>{String.fromCharCode(97 + i)}</small><span>{label}</span>
            </button>
          );
        })}
      </div>
      <Bottom
        left={{ label: "again", icon: "hear", onClick: play, aria: "Play the two notes again" }}
        go={picked === null ? { label: "pick one", disabled: true } : { label: n + 1 >= total ? "finish" : "next", onClick: advance }} />
    </div>
  );
}
