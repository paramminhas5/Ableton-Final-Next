"use client";
/**
 * The lesson player, Model 1. One screen per step: the glass shows the idea, the panel
 * below is what you touch, one pink key moves you on. Steps: hook, concept, diagram,
 * a sim, listen, quiz, type it, order, match, try it (play your line on the engine),
 * then what you learned and add to your track. Flow mode has five hearts; free mode none.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ErrorInfo, type ReactNode } from "react";
import type { LessonScreen, Mission } from "@/content/types";
import { Simulator } from "@/components/sims/Simulator";
import { playConcept, hasConceptSound } from "@/components/ConceptAudio";
import { LessonLinksPanel } from "@/components/LessonLinksPanel";
import { LiveTaskPanel } from "@/components/LiveTaskPanel";
import { LessonSourceBar } from "@/components/LessonSourceBar";
import { triggerPerfectScore } from "@/components/EasterEggs";
import { useProgress, MAX_HEARTS } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { useAuth } from "@/lib/auth";
import { playCorrect, playWrong, playFanfare } from "@/lib/audio";
import { getMissionContext } from "@/lib/missionContext";
import { track } from "@/lib/analytics";
import { offerFor, useTrack } from "@/lib/track";
import { lessonSteps, readTake, saveTake, takeType, type Take } from "@/lib/lessonTake";
import { minutesFor, missionImage, missionLearns, missionUses, worldDone, worldOf, WORLD_LABEL, type WorldId } from "@/lib/worldOrder";
import { RANKS, rankFor } from "@/lib/ranks";
import { GoPill, Icon, Key, Screen, Silk, Switch, WORLD_LED } from "./controls";
import { Bottom, Meta, useEnter } from "./LessonParts";
import { CAT_SRC, Lanes } from "./shell";
import { GlassDiagram, GlassVisual, VISUAL_TAG, Chain } from "./GlassVisual";
import { TryIt } from "./TryIt";
import { FileLesson } from "./FileLesson";
import { AddToTrack } from "./AddToTrack";
import { EarStep, FreshStart, HearStep, SayStep, ShapeStep, songHasMusic, startsFresh } from "./LessonSteps";
import { newSong } from "@/lib/songs";
import { usePrefs } from "@/lib/prefs";
import { SevenSeg } from "./SevenSeg";
import "./lesson.css";

type Summary = Extract<LessonScreen, { kind: "summary" }>;
const ASK = new Set(["quiz", "audio-id", "type-answer", "sequence", "match"]);
const HEARTS_SEEN = "ccd.hearts.explained";

function shuffle<T>(arr: readonly T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const seedOf = (s: string) => Array.from(s).reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 100000, 7);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9.\-+# ]/g, "").replace(/\s+/g, " ").trim();

// ── chrome ──────────────────────────────────────────────────────────────────
function Top({ back, total, now, accent, hearts, tune }: { back: string; total: number; now: number; accent: string; hearts: number | null; tune?: boolean }) {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = usePrefs();
  return (
    <div className="ls-top">
      <Link href={back} className="ls-x" aria-label="Close lesson"><Icon name="close" /></Link>
      <div className="ls-seg" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={now} aria-label={`Step ${now + 1} of ${total}`} style={{ ["--c" as string]: accent } as CSSProperties}>
        {Array.from({ length: total }, (_, i) => <i key={i} className={i < now ? "is-done" : i === now ? "is-now" : ""} />)}
      </div>
      {hearts !== null ? (
        <span className="ls-hearts" role="img" aria-label={`${hearts} of ${MAX_HEARTS} hearts`}>
          {Array.from({ length: MAX_HEARTS }, (_, i) => <i key={i} className={i < hearts ? "is-on" : ""} />)}
        </span>
      ) : tune ? null : <span className="m1-tag">free</span>}

      {open && (
        <div className="ls-sheet" onClick={() => setOpen(false)}>
          <div role="dialog" aria-label="Voice and level" onClick={e => e.stopPropagation()}>
            <Silk label="voice" right="who is teaching" />
            <Switch label="Voice" value={prefs.voice} onChange={id => setPrefs({ voice: id as typeof prefs.voice })} options={[{ id: "mentor", label: "mentor" }, { id: "straight", label: "straight" }, { id: "eli5", label: "eli5" }]} />
            <Silk label="level" right="how far we go" />
            <Switch label="Level" value={prefs.level} onChange={id => setPrefs({ level: id as typeof prefs.level })} options={[{ id: "gentle", label: "gentle" }, { id: "standard", label: "standard" }, { id: "hard", label: "hard" }]} />
            <p className="ls-sub" style={{ margin: 0 }}>mentor and eli5 explain the deeper bits as you go. straight keeps it short. your place is kept.</p>
            <GoPill onClick={() => setOpen(false)} ariaLabel="Done">done</GoPill>
          </div>
        </div>
      )}
    </div>
  );
}

// ── hook ────────────────────────────────────────────────────────────────────
const TOOL_ICON = (tool: string) => /pad|answer|cue|grid|clip/.test(tool) ? "pads" : /key|roll|piano/.test(tool) ? "keys" : /fader|mixer|level|meter/.test(tool) ? "studio" : "knob";

function HookStep({ mission, screen, world, index, accent, back, onNext }: { mission: Mission; screen: Extract<LessonScreen, { kind: "hook" }>; world: WorldId; index: number; accent: string; back: string; onNext: () => void }) {
  const { track } = useTrack();
  const offer = useMemo(() => offerFor({ ...track, added: [] }, mission), [track, mission]);
  const learns = missionLearns(mission.slug);
  const uses = missionUses(mission.slug);
  useEnter(onNext);
  const ff = mission.fromFile;
  if (ff) {
    return (
      <div className="ls-col">
        <Screen>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CAT_SRC} alt="" className="ls-sticker m1-dancing" />
          <Meta left={`${WORLD_LABEL[world]} ${String(index).padStart(2, "0")} · ${ff.minutes} min · +${mission.xp} xp`} />
          <div className="ls-title is-big">{mission.title.toLowerCase()}</div>
          <p className="ls-big">{ff.learn}</p>
          <div className="ls-pulse" aria-hidden><i /><i /><i /><i /></div>
        </Screen>
        <Silk label="you'll learn" right={`${ff.items.length} things`} />
        <ol className="ls-items">{ff.items.map((l, i) => <li key={i}><b>{String(i + 1).padStart(2, "0")}</b>{l.toLowerCase()}</li>)}</ol>
        {startsFresh(mission) && <><Silk label="your song" /><FreshStart /></>}
        <Silk label="adds to your song" right={ff.why ? undefined : undefined} />
        <Screen>
          <Meta left={<span style={{ color: accent }}>+ {offer.kind} · the line you play</span>} right="fills in as you play" />
          <div style={{ marginTop: 10 }}><Lanes track={startsFresh(mission) ? { ...track, layers: [] } : track} next={{ kind: offer.kind, isNew: true }} /></div>
        </Screen>
        <Bottom left={{ label: "later", icon: "back", href: back, aria: "Not now, back to the world" }} go={{ label: <><Icon name="play" small />let&apos;s go</>, onClick: onNext, aria: "Start the lesson" }} />
      </div>
    );
  }
  return (
    <div className="ls-col">
      <Screen>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={missionImage(mission.slug, world)} alt="" className="ls-hookimg" />
        <div style={{ position: "relative" }}>
          <Meta left={`${WORLD_LABEL[world]} ${String(index).padStart(2, "0")} · ${minutesFor(mission.slug)} min · +${mission.xp} xp`} />
          <div className="ls-title is-big">{mission.title.toLowerCase()}</div>
          <p className="ls-sub">{(screen.subtext || screen.headline).toLowerCase()}</p>
        </div>
      </Screen>
      {learns.length > 0 && (
        <>
          <Silk label="you'll learn" />
          <ol className="ls-learn">{learns.map((l, i) => <li key={i}><b>{String(i + 1).padStart(2, "0")}</b>{l.toLowerCase()}</li>)}</ol>
        </>
      )}
      <Silk label="adds to your track" />
      <Screen>
        <Meta left={<span style={{ color: accent }}>+ {offer.kind} · the line you play</span>} right="fills in as you play" />
        <div style={{ marginTop: 10 }}><Lanes track={track} next={{ kind: offer.kind, isNew: offer.isNew }} /></div>
      </Screen>
      {uses.length > 0 && (
        <>
          <Silk label="you'll use" />
          <div className="ls-uses" style={{ ["--n" as string]: uses.length } as CSSProperties}>
            {uses.map(u => (
              <div key={u.tool} className="ls-use">
                <span className="ls-use-ico"><Icon name={TOOL_ICON(u.tool)} /></span>
                <b>{u.tool}</b>
                <small>{u.why}</small>
              </div>
            ))}
          </div>
        </>
      )}
      <Bottom left={{ label: "later", icon: "back", href: back, aria: "Not now, back to the world" }} go={{ label: <><Icon name="play" small />let&apos;s go</>, onClick: onNext, aria: "Start the lesson" }} />
    </div>
  );
}

// ── concept and diagram ────────────────────────────────────────────────────
function HearKey({ visual }: { visual?: string }) {
  const [on, setOn] = useState(false);
  if (!hasConceptSound(visual) || visual === "fal-image") return <span />;
  const hear = async () => {
    setOn(true);
    const ms = await playConcept(visual);
    window.setTimeout(() => setOn(false), Math.max(300, ms));
  };
  return <Key label="hear it" onClick={hear} ariaPressed={on} ariaLabel="Hear an example"><Icon name="hear" /></Key>;
}

function ConceptStep({ screen, meta, accent, onNext }: { screen: Extract<LessonScreen, { kind: "concept" }>; meta: string; accent: string; onNext: () => void }) {
  const v = screen.visual && screen.visual !== "none" ? screen.visual : undefined;
  useEnter(onNext);
  return (
    <div className="ls-col">
      <Screen>
        <Meta left={meta} right={v ? VISUAL_TAG[v] : undefined} />
        <div className="ls-title">{screen.title.toLowerCase()}</div>
        {v ? (
          <div className="ls-vis">
            <GlassVisual type={v} color={accent} bpm={screen.visualProps?.bpm} minor={screen.visualProps?.minor} root={screen.visualProps?.root} scaleLabel={screen.visualProps?.scaleLabel} signalNodes={screen.visualProps?.signalNodes} imageUrl={screen.imageUrl} alt={screen.title} />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={CAT_SRC} alt="" className="ls-sticker is-low" />
        )}
      </Screen>
      <Silk label="read" />
      <p className="ls-read">{screen.body}</p>
      {screen.keyFact && <div className="ls-panel"><span className="ls-led" style={{ ["--c" as string]: accent } as CSSProperties} /><span>{screen.keyFact}</span></div>}
      <div className="ls-bottom">
        <div className="m1-g">
          <HearKey visual={screen.visual} />
          <GoPill onClick={onNext} style={{ gridColumn: "span 3" }} ariaLabel="Next">next</GoPill>
        </div>
      </div>
    </div>
  );
}

function DiagramStep({ screen, meta, accent, onNext }: { screen: Extract<LessonScreen, { kind: "diagram" }>; meta: string; accent: string; onNext: () => void }) {
  useEnter(onNext);
  return (
    <div className="ls-col">
      <Screen>
        <Meta left={meta} right="diagram" />
        <div className="ls-title">{screen.title.toLowerCase()}</div>
        <div className="ls-vis"><GlassDiagram screen={screen} color={accent} /></div>
      </Screen>
      {screen.caption && <><Silk label="read" /><p className="ls-read">{screen.caption}</p></>}
      <Bottom go={{ label: "next", onClick: onNext }} />
    </div>
  );
}

// ── a sim, in the frame ─────────────────────────────────────────────────────
function SimStep({ screen, meta, onNext }: { screen: Extract<LessonScreen, { kind: "interact" }>; meta: string; onNext: () => void }) {
  const [touched, setTouched] = useState(false);
  return (
    <div className="ls-col">
      <Screen>
        <Meta left={meta} right={touched ? "nice. keep going or move on" : "move something to go on"} />
        <div className="ls-title">{screen.prompt.toLowerCase()}</div>
      </Screen>
      <Silk label="try it" right="it plays for real" />
      <div className="ls-sim" onPointerDown={() => setTouched(true)} onKeyDown={() => setTouched(true)}>
        <Simulator type={screen.sim} preset={screen.preset} />
      </div>
      <Bottom go={{ label: touched ? "next" : "try it first", onClick: onNext, disabled: !touched }} />
    </div>
  );
}

// ── answers ─────────────────────────────────────────────────────────────────
type Phase = "pick" | "right" | "wrong";

function Verdict({ phase, flow, xp, meta, of }: { phase: Phase; flow: boolean; xp: number; meta: string; of?: string }) {
  if (phase === "pick") return <Meta left={meta} right={xp > 0 ? `+${xp} xp` : undefined} />;
  return phase === "right"
    ? <Meta left={`right${xp > 0 ? ` · +${xp} xp` : ""}`} right={of} color="var(--led-mint)" />
    : <Meta left={`not quite${flow ? " · lost a heart" : ""}`} right={of} color="var(--led-red)" />;
}

function Cat({ phase }: { phase: Phase }) {
  if (phase === "pick") return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={CAT_SRC} alt="" className={`ls-sticker is-small ${phase === "right" ? "m1-dancing" : "is-tilt"}`} />;
}

function Pads({ options, picked, answer, phase, onPick, label }: { options: string[]; picked: number | null; answer: number; phase: Phase; onPick: (i: number) => void; label: string }) {
  const one = options.some(o => o.length > 28) || options.length > 4;
  return (
    <div className={`ls-pads ${one ? "is-one" : ""}`} role="radiogroup" aria-label={label}>
      {options.map((o, i) => {
        const cls = phase === "pick" ? (picked === i ? "is-lit" : "") : i === answer ? (phase === "right" ? "is-lit is-right" : "is-ring") : picked === i ? "is-lit is-wrong" : "is-dim";
        return (
          <button key={i} type="button" role="radio" aria-checked={picked === i} disabled={phase !== "pick"} className={`ls-pad ${cls}`} style={{ ["--c" as string]: "var(--led-go)" } as CSSProperties} onClick={() => onPick(i)}>
            <small>{String.fromCharCode(97 + i)}</small>
            <span>{o}</span>
          </button>
        );
      })}
    </div>
  );
}

type AskProps = { meta: string; accent: string; flow: boolean; xp: number; onCorrect: () => void; onWrong: () => void; onNext: () => void };

function useAnswer(correct: () => boolean, { onCorrect, onWrong }: Pick<AskProps, "onCorrect" | "onWrong">) {
  const [phase, setPhase] = useState<Phase>("pick");
  const check = () => {
    if (phase !== "pick") return;
    if (correct()) { setPhase("right"); playCorrect(); onCorrect(); }
    else { setPhase("wrong"); playWrong(); onWrong(); }
  };
  return { phase, check };
}

function QuizStep({ screen, ...p }: AskProps & { screen: Extract<LessonScreen, { kind: "quiz" }> }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const { phase, check } = useAnswer(() => picked === screen.answer, p);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target instanceof HTMLInputElement) return;
      const n = Number(e.key);
      if (phase === "pick" && n >= 1 && n <= screen.options.length) setPicked(n - 1);
      if (e.key === "Enter") { e.preventDefault(); if (phase === "pick") { if (picked !== null) check(); } else p.onNext(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
  const text = phase === "pick" ? screen.q : phase === "right" ? screen.explain : `${screen.options[screen.answer]} was right. ${screen.explain}`;
  return (
    <div className="ls-col">
      <Screen>
        <Cat phase={phase} />
        <Verdict phase={phase} flow={p.flow} xp={p.xp} meta={p.meta} />
        <div className={`ls-title ${text.length > 120 ? "is-small" : ""}`} aria-live="polite">{text}</div>
        {hint && phase === "pick" && screen.hint && <div className="ls-hint">{screen.hint}</div>}
      </Screen>
      <Silk label="answer" right={phase === "pick" ? "tap one, it lights up" : phase === "right" ? "the lit pad is the answer" : "the outlined pad was right"} />
      <Pads options={screen.options} picked={picked} answer={screen.answer} phase={phase} onPick={setPicked} label="Answers" />
      <Bottom
        left={screen.hint ? { label: "hint", icon: "search", onClick: () => setHint(h => !h), disabled: phase !== "pick", aria: "Show a hint" } : undefined}
        go={phase === "pick" ? { label: "check", onClick: check, disabled: picked === null } : { label: phase === "right" ? "next" : "got it", onClick: p.onNext }} />
    </div>
  );
}

function Wave({ playing, accent }: { playing: boolean; accent: string }) {
  const n = 64;
  return (
    <div className={`ls-wave ${playing ? "is-playing" : ""}`} aria-hidden>
      {Array.from({ length: n }, (_, i) => {
        const h = 18 + 70 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.23));
        return <i key={i} style={{ height: `${h}%`, background: accent, animationDelay: `${(i / n) * 1.2}s` }} />;
      })}
    </div>
  );
}

function ListenStep({ screen, ...p }: AskProps & { screen: Extract<LessonScreen, { kind: "audio-id" }> }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [heard, setHeard] = useState(false);
  const loopRef = useRef(false);
  loopRef.current = loop;
  const { phase, check } = useAnswer(() => picked === screen.answer, p);
  const play = useCallback(async () => {
    setPlaying(true);
    setHeard(true);
    const ms = await playConcept(screen.audioType);
    window.setTimeout(() => {
      setPlaying(false);
      if (loopRef.current) void play();
    }, Math.max(400, ms) + 250);
  }, [screen.audioType]);
  useEffect(() => () => { loopRef.current = false; }, []);
  const text = phase === "pick" ? screen.prompt : phase === "right" ? screen.explain : `${screen.options[screen.answer]} was right. ${screen.explain}`;
  return (
    <div className="ls-col">
      <Screen>
        <Cat phase={phase} />
        <Verdict phase={phase} flow={p.flow} xp={p.xp} meta={p.meta} />
        <div className="ls-title" aria-live="polite">{text}</div>
        <Wave playing={playing} accent={p.accent} />
        <Meta left={playing ? "playing" : heard ? "play it again any time" : "press play to listen"} right="as many times as you like" />
      </Screen>
      <Silk label="transport" />
      <div className="m1-g">
        <Key label="play" led={playing ? "var(--led-mint)" : null} onClick={play} ariaLabel="Play the sound"><Icon name="play" /></Key>
        <Key label="loop" led={loop ? "var(--led-go)" : null} ariaPressed={loop} onClick={() => setLoop(l => !l)} ariaLabel="Loop the sound"><Icon name="loop" /></Key>
        <span /><span />
      </div>
      <Silk label="pick one" right={heard ? "tap one, it lights up" : "listen first"} />
      <Pads options={screen.options} picked={picked} answer={screen.answer} phase={phase} onPick={i => heard && setPicked(i)} label="Answers" />
      <Bottom go={phase === "pick" ? { label: "check", onClick: check, disabled: picked === null } : { label: phase === "right" ? "next" : "got it", onClick: p.onNext }} />
    </div>
  );
}

function TypeStep({ screen, ...p }: AskProps & { screen: Extract<LessonScreen, { kind: "type-answer" }> }) {
  const numeric = /^-?\d+(\.\d+)?$/.test(screen.acceptableAnswers[0].trim());
  const [val, setVal] = useState("");
  const [hint, setHint] = useState(false);
  const [taps, setTaps] = useState<number[]>([]);
  const ok = () => {
    const v = screen.caseSensitive ? val.trim() : norm(val);
    return screen.acceptableAnswers.some(a => (screen.caseSensitive ? a.trim() : norm(a)) === v);
  };
  const { phase, check } = useAnswer(ok, p);
  const tempo = /tempo|bpm/i.test(screen.q);
  const tap = () => {
    const now = performance.now();
    const t = [...taps.filter(x => now - x < 3000), now].slice(-6);
    setTaps(t);
    if (t.length >= 3) setVal(String(Math.round(60000 / ((t[t.length - 1] - t[0]) / (t.length - 1)))));
  };
  useEffect(() => {
    if (!numeric) return;
    const h = (e: KeyboardEvent) => {
      if (phase !== "pick") { if (e.key === "Enter") p.onNext(); return; }
      if (/^[\d.\-]$/.test(e.key)) setVal(v => (v + e.key).slice(0, 6));
      if (e.key === "Backspace") setVal(v => v.slice(0, -1));
      if (e.key === "Enter" && val) check();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
  const canon = screen.acceptableAnswers[0];
  return (
    <div className="ls-col">
      <Screen>
        <Cat phase={phase} />
        <Verdict phase={phase} flow={p.flow} xp={p.xp} meta={p.meta} />
        <div className="ls-title" aria-live="polite">{phase === "pick" ? screen.q : phase === "right" ? screen.explain : `${canon}. ${screen.explain}`}</div>
        {numeric ? (
          <div className="ls-lcd"><SevenSeg text={phase === "wrong" ? canon : val || "--"} color={phase === "right" ? "var(--led-mint)" : phase === "wrong" ? "var(--led-red)" : p.accent} digits={Math.max(3, canon.length)} /></div>
        ) : (
          <input className="ls-input" value={phase === "wrong" ? canon : val} onChange={e => setVal(e.target.value)} disabled={phase !== "pick"} placeholder="type it here"
            aria-label="Your answer" autoCapitalize="none" autoCorrect="off" spellCheck={false}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (phase === "pick") { if (val.trim()) check(); } else p.onNext(); } }} />
        )}
        {hint && phase === "pick" && screen.hint && <div className="ls-hint">{screen.hint}</div>}
      </Screen>
      {numeric && (
        <>
          <Silk label="number pads" right={tempo ? "or tap along" : undefined} />
          <div className="ls-num">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map(d => (
              <button key={d} type="button" className="ls-pad is-num" disabled={phase !== "pick"} onClick={() => setVal(v => (v + d).slice(0, 6))}>{d}</button>
            ))}
          </div>
          <div className="ls-row3">
            <button type="button" className="ls-pad is-row" disabled={phase !== "pick"} onClick={() => setVal(v => v.slice(0, -1))}>delete</button>
            {canon.includes("-") || canon.includes(".")
              ? <button type="button" className="ls-pad is-row" disabled={phase !== "pick"} onClick={() => setVal(v => (canon.includes("-") && !v ? "-" : v.includes(".") ? v : v + "."))}>{canon.includes("-") ? "minus" : "point"}</button>
              : <button type="button" className="ls-pad is-row" disabled={phase !== "pick"} onClick={() => setVal("")}>clear</button>}
            {tempo
              ? <button type="button" className="ls-pad is-row" disabled={phase !== "pick"} onClick={tap}>tap tempo</button>
              : <span />}
          </div>
        </>
      )}
      <Bottom
        left={screen.hint ? { label: "hint", icon: "search", onClick: () => setHint(h => !h), disabled: phase !== "pick" } : undefined}
        go={phase === "pick" ? { label: "check", onClick: check, disabled: !val.trim() } : { label: phase === "right" ? "next" : "got it", onClick: p.onNext }} />
    </div>
  );
}

const PAIR_COLORS = ["var(--led-mint)", "var(--led-cobalt)", "var(--led-lilac)", "#F3C14F", "var(--led-go)"];

function OrderStep({ screen, seed, ...p }: AskProps & { screen: Extract<LessonScreen, { kind: "sequence" }>; seed: number }) {
  const items = useMemo(() => {
    let s = shuffle(screen.items.map((t, i) => ({ t, i })), seed);
    if (s.every((x, k) => x.i === k)) s = [...s.slice(1), s[0]];
    return s;
  }, [screen.items, seed]);
  const [order, setOrder] = useState<number[]>([]);
  const { phase, check } = useAnswer(() => order.every((v, k) => v === k) && order.length === screen.items.length, p);
  const full = order.length === screen.items.length;
  const shown = phase === "wrong" ? screen.items.map((_, i) => i) : order;
  return (
    <div className="ls-col">
      <Screen>
        <Cat phase={phase} />
        <Verdict phase={phase} flow={p.flow} xp={p.xp} meta={p.meta} />
        <div className="ls-title" aria-live="polite">{phase === "pick" ? screen.prompt : screen.explain}</div>
        {screen.items.length <= 4 && screen.items.every(x => x.length <= 12) ? (
          <div className="ls-vis">
            <Chain h={70} c={phase === "wrong" ? "var(--led-mint)" : p.accent} nodes={screen.items.map((_, k) => (shown[k] !== undefined ? screen.items[shown[k]] : "?"))} />
          </div>
        ) : (
          <ol className="ls-slots">
            {screen.items.map((_, k) => {
              const it = shown[k];
              return (
                <li key={k} className={it === undefined ? "is-empty" : ""} style={{ ["--c" as string]: phase === "wrong" ? "var(--led-mint)" : PAIR_COLORS[k % PAIR_COLORS.length] } as CSSProperties}>
                  <b>{k + 1}</b>{it === undefined ? "?" : screen.items[it]}
                </li>
              );
            })}
          </ol>
        )}
        <Meta left={phase === "wrong" ? "this is the order" : `${order.length} of ${screen.items.length} placed`} />
      </Screen>
      <Silk label="tap in order" right={order.length < screen.items.length ? `pick number ${order.length + 1}` : "all placed"} />
      <div className={`ls-pads ${screen.items.some(x => x.length > 22) ? "is-one" : ""}`}>
        {items.map(({ t, i }) => {
          const at = order.indexOf(i);
          const placed = at >= 0;
          return (
            <button key={i} type="button" disabled={phase !== "pick" || placed} className={`ls-pad ${placed ? "is-lit" : ""}`}
              style={{ ["--c" as string]: placed ? PAIR_COLORS[at % PAIR_COLORS.length] : p.accent } as CSSProperties}
              onClick={() => setOrder(o => [...o, i])} aria-label={placed ? `${t}, placed ${at + 1}` : t}>
              <small>{placed ? at + 1 : ""}</small>
              <span>{t}</span>
            </button>
          );
        })}
      </div>
      <Bottom
        left={{ label: "undo", icon: "back", onClick: () => setOrder(o => o.slice(0, -1)), disabled: phase !== "pick" || !order.length }}
        go={phase === "pick" ? { label: "check", onClick: check, disabled: !full } : { label: phase === "right" ? "next" : "got it", onClick: p.onNext }} />
    </div>
  );
}

function MatchStep({ screen, seed, ...p }: AskProps & { screen: Extract<LessonScreen, { kind: "match" }>; seed: number }) {
  const n = screen.pairs.length;
  const rights = useMemo(() => {
    let s = shuffle(screen.pairs.map((x, i) => ({ t: x.right, i })), seed + 3);
    if (n > 1 && s.every((x, k) => x.i === k)) s = [...s.slice(1), s[0]];
    return s;
  }, [screen.pairs, seed, n]);
  // pairs[left] = right index chosen
  const [pairs, setPairs] = useState<(number | null)[]>(() => Array(n).fill(null));
  const [left, setLeft] = useState<number | null>(null);
  const [right, setRight] = useState<number | null>(null);
  const { phase, check } = useAnswer(() => pairs.every((r, l) => r === l), p);
  useEffect(() => {
    if (left === null || right === null) return;
    setPairs(ps => ps.map((r, l) => (l === left ? right : r === right ? null : r)));
    setLeft(null);
    setRight(null);
  }, [left, right]);
  const tapLeft = (l: number) => {
    if (phase !== "pick") return;
    if (pairs[l] !== null && left === null && right === null) { setPairs(ps => ps.map((r, k) => (k === l ? null : r))); return; }
    setLeft(l);
  };
  const tapRight = (r: number) => {
    if (phase !== "pick") return;
    const owner = pairs.indexOf(r);
    if (owner >= 0 && left === null) { setPairs(ps => ps.map(x => (x === r ? null : x))); return; }
    setRight(r);
  };
  const shownPairs = phase === "wrong" ? screen.pairs.map((_, i) => i) : pairs;
  const done = pairs.filter(x => x !== null).length;
  const colorOfLeft = (l: number) => (shownPairs[l] !== null ? PAIR_COLORS[l % PAIR_COLORS.length] : null);
  const colorOfRight = (r: number) => { const l = shownPairs.indexOf(r); return l >= 0 ? PAIR_COLORS[l % PAIR_COLORS.length] : null; };
  return (
    <div className="ls-col">
      <Screen>
        <Cat phase={phase} />
        <Verdict phase={phase} flow={p.flow} xp={p.xp} meta={p.meta} />
        <div className="ls-title" aria-live="polite">{phase === "pick" ? screen.prompt : phase === "right" ? "all paired." : "here is how they pair."}</div>
        <div className="ls-pairbar">{screen.pairs.map((_, i) => <i key={i} style={{ background: i < done ? PAIR_COLORS[i % PAIR_COLORS.length] : undefined }} />)}</div>
        <Meta left={`${done} of ${n} pairs · matched pairs share a colour`} />
      </Screen>
      <Silk label="tap one, then its partner" right="tap a pair to undo it" />
      <div className="ls-match">
        {screen.pairs.map((pr, l) => {
          const r = rights[l];
          const lc = colorOfLeft(l), rc = colorOfRight(r.i);
          const wrongL = phase === "wrong" && pairs[l] !== l;
          return (
            <div key={l} className="ls-mrow">
              <button type="button" className={`ls-pad is-m ${lc ? "is-lit" : ""} ${left === l ? "is-glow" : ""} ${wrongL ? "is-x" : ""}`} style={{ ["--c" as string]: lc ?? p.accent } as CSSProperties}
                disabled={phase !== "pick"} onClick={() => tapLeft(l)} aria-pressed={left === l}>
                <span>{pr.left}</span>
              </button>
              <button type="button" className={`ls-pad is-m is-wide ${rc ? "is-lit" : ""} ${right === r.i ? "is-glow" : ""}`} style={{ ["--c" as string]: rc ?? p.accent } as CSSProperties}
                disabled={phase !== "pick"} onClick={() => tapRight(r.i)} aria-pressed={right === r.i}>
                <span>{r.t}</span>
              </button>
            </div>
          );
        })}
      </div>
      <Bottom
        left={{ label: "reset", icon: "close", onClick: () => setPairs(Array(n).fill(null)), disabled: phase !== "pick" || !done }}
        go={phase === "pick" ? { label: "check", onClick: check, disabled: done < n } : { label: phase === "right" ? "next" : "got it", onClick: p.onNext }} />
    </div>
  );
}


// ── moments: rank up and world done, shown once at the end of the lesson that earns them ──
function Gauge({ at, total }: { at: number; total: number }) {
  const W = 300, cx = 150, cy = 150, r = 110;
  const a0 = -Math.PI * 0.85, a1 = -Math.PI * 0.15;
  const ang = (i: number) => a0 + ((a1 - a0) * i) / (total - 1);
  const na = ang(at);
  return (
    <svg viewBox={`0 0 ${W} 170`} width="100%" aria-hidden style={{ display: "block", marginTop: 6 }}>
      {Array.from({ length: total }, (_, i) => {
        const q = ang(i), on = i === at;
        return <path key={i} d={`M${cx + (r - (on ? 16 : 10)) * Math.cos(q)} ${cy + (r - (on ? 16 : 10)) * Math.sin(q)}L${cx + r * Math.cos(q)} ${cy + r * Math.sin(q)}`} stroke={on ? "#FF4F9A" : i < at ? "#8A8A90" : "#3A3A3F"} strokeWidth={on ? 3 : 2} strokeLinecap="round" style={on ? { filter: "drop-shadow(0 0 4px #FF4F9A)" } : undefined} />;
      })}
      <path d={`M${cx} ${cy}L${cx + (r - 22) * Math.cos(na)} ${cy + (r - 22) * Math.sin(na)}`} stroke="#F3F2EF" strokeWidth={2.2} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} fill="#F3F2EF" />
    </svg>
  );
}

function Moment({ kind, title, line, uses, onDone, extra }: { kind: "rank" | "world"; title: string; line: string; uses: { tool: string; why: string; href?: string }[]; onDone: () => void; extra?: ReactNode }) {
  const [shared, setShared] = useState(false);
  const share = async () => {
    const text = kind === "rank" ? `${title} on cats can dance school` : `finished the ${title} world on cats can dance school`;
    try {
      if (navigator.share) await navigator.share({ title: "cats can dance school", text, url: location.origin });
      else { await navigator.clipboard.writeText(`${text} ${location.origin}`); setShared(true); }
    } catch { /* cancelled */ }
  };
  return (
    <div className="ls-col">
      <Screen>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" className="ls-sticker m1-dancing" />
        <span className="m1-ss">{kind === "rank" ? "rank up" : "world done"}</span>
        {extra}
        <div className="ls-title is-big" style={{ textAlign: kind === "rank" ? "center" : "left", marginTop: kind === "rank" ? 0 : 10 }}>{title}</div>
        <div className="m1-ss" style={{ textAlign: kind === "rank" ? "center" : "left", color: "var(--disp-ink)", marginTop: 8 }}>{line}</div>
        {shared && <div className="m1-ss" style={{ textAlign: "center", marginTop: 8, color: "var(--led-mint)" }}>copied</div>}
      </Screen>
      {uses.length > 0 && (
        <>
          <Silk label={kind === "rank" ? "unlocked" : "take it further"} right={kind === "rank" ? "controls you used today" : undefined} />
          <div className="ls-uses" style={{ ["--n" as string]: Math.min(2, uses.length) } as CSSProperties}>
            {uses.slice(0, 2).map(u => {
              const inner = <><span className="ls-use-ico"><Icon name={u.href ? (u.href === "/dj" ? "dj" : "out") : TOOL_ICON(u.tool)} /></span><b>{u.tool}</b><small>{u.why}</small></>;
              return u.href
                ? <Link key={u.tool} href={u.href} className="ls-use" style={{ color: "inherit", textDecoration: "none" }}>{inner}</Link>
                : <div key={u.tool} className="ls-use">{inner}</div>;
            })}
          </div>
        </>
      )}
      <Bottom left={{ label: shared ? "copied" : "share", icon: "out", onClick: share }} go={{ label: <><Icon name="play" small />keep going</>, onClick: onDone }} />
    </div>
  );
}

// ── the end ─────────────────────────────────────────────────────────────────
function DoneStep({ mission, screen, xp, take, accent, nextHref, backHref, isLoggedIn, source, score, onLeave, moment, setMoment }: { mission: Mission; screen: Summary; xp: number; take: Take | null; accent: string; nextHref: string; backHref: string; isLoggedIn: boolean; source: string | null; score: number; onLeave: () => void; moment: null | "rank" | "world"; setMoment: (m: null | "rank" | "world") => void }) {
  useEffect(() => { playFanfare(); }, []);
  const router = useRouter();
  const { progress } = useProgress();
  const { track: v1 } = useTrack();
  const world = worldOf(mission.slug);
  useEnter(() => { if (moment) setMoment(null); else { onLeave(); router.push(nextHref); } });
  if (moment === "rank") {
    const r = rankFor(progress.xp);
    return <Moment kind="rank" title={r.current.name.toLowerCase()} line={`rank ${r.idx + 1} of ${RANKS.length} · ${progress.xp} xp`} uses={missionUses(mission.slug).filter(u => u.tool !== "answer pads")} onDone={() => setMoment(null)}
      extra={<Gauge at={r.idx} total={RANKS.length} />} />;
  }
  if (moment === "world" && world) {
    const wd = worldDone(world, progress.completedMissions);
    return <Moment kind="world" title={WORLD_LABEL[world]} line={`${wd.total} lessons · ${v1.layers.length} layers`} onDone={() => setMoment(null)}
      uses={[{ tool: "send to live", why: "a midi file, one track per layer", href: "/studio" }, { tool: "mix it in dj", why: "your track on deck a", href: "/dj" }]}
      extra={<div style={{ marginTop: 14 }}><Lanes track={v1} /></div>} />;
  }
  return (
    <div className="ls-col">
      <AddToTrack mission={mission} xp={xp} take={take} accent={accent} keys={k => (
        <>
          {!k.added && (
            <button type="button" className="ls-skip" onClick={() => { onLeave(); router.push(nextHref); }}>
              skip, {nextHref === backHref ? "back to the world" : "next lesson"}
            </button>
          )}
          <div className="ls-bottom">
            <div className="m1-g">
              {k.added
                ? <Key label="studio" href="/studio" ariaLabel="Open your track in studio"><Icon name="studio" /></Key>
                : <Key label={k.playing ? "stop" : "hear"} onClick={k.hear} ariaPressed={k.playing} ariaLabel={k.playing ? "Stop" : "Hear it in your track"}><Icon name={k.playing ? "stop" : "hear"} /></Key>}
              {k.added
                ? <GoPill onClick={() => { onLeave(); router.push(nextHref); }} style={{ gridColumn: "span 3" }}>{nextHref === backHref ? "back to the world" : "next lesson"}<Icon name="play" small /></GoPill>
                : <GoPill onClick={k.add} style={{ gridColumn: "span 3" }} ariaLabel="Add to my track"><Icon name="plus" />add to my song</GoPill>}
            </div>
          </div>
        </>
      )} />
      <Silk label="you learned" right={score < 1 ? `${Math.round(score * 100)}% right` : "all right"} />
      <ul className="ls-learn is-ticks">{screen.learned.map((l, i) => <li key={i}><b><Icon name="check" small /></b>{l}</li>)}</ul>
      {screen.badge && <div className="ls-panel"><span className="ls-led" style={{ ["--c" as string]: "var(--led-lilac)" } as CSSProperties} /><span>badge · {screen.badge.name.toLowerCase()}</span></div>}
      {score < 0.5 && <div className="ls-panel"><span className="ls-led" style={{ ["--c" as string]: "#F3C14F" } as CSSProperties} /><span>this one comes back in your review soon. a second pass always helps.</span></div>}
      {!isLoggedIn && <Link href="/login" className="ls-panel is-link"><span className="ls-led" style={{ ["--c" as string]: accent } as CSSProperties} /><span>save your progress on every device. sign in, it&apos;s free.</span></Link>}
      <div className="ls-legacy">
        <LiveTaskPanel slug={mission.slug} />
        <LessonLinksPanel slug={mission.slug} />
        <LessonSourceBar source={source} />
      </div>
    </div>
  );
}

function HeartsOut({ back, onFree, onPractice }: { back: string; onFree: () => void; onPractice: () => void }) {
  const { progress, heartRefillSeconds, spendGems, refillHeart } = useProgress();
  const [secs, setSecs] = useState(heartRefillSeconds);
  useEffect(() => setSecs(heartRefillSeconds), [heartRefillSeconds]);
  useEffect(() => {
    const id = window.setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  const clock = h > 0 ? `${h}:${String(m).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
  return (
    <div className="ls-col">
      <Screen>
        <Meta left="flow mode" right={h > 0 ? "hours : minutes" : undefined} />
        <div className="ls-title">out of hearts</div>
        <div className="ls-heartrow">{Array.from({ length: MAX_HEARTS }, (_, i) => <i key={i} />)}</div>
        <div className="ls-clock">
          <div className="ls-lcd"><SevenSeg text={secs > 0 ? clock : "0:00"} color="var(--led-red)" digits={0} /></div>
          <span className="m1-ss">{secs > 0 ? "until a heart comes back" : "a heart is back"}</span>
        </div>
      </Screen>
      <Silk label="keep going" />
      <div className="ls-pads">
        <button type="button" className="ls-pad is-big is-glowpad" style={{ ["--c" as string]: "var(--led-go)" } as CSSProperties} onClick={onPractice}>
          <small>2 min · earn one back</small><span>practice</span>
        </button>
        <button type="button" className="ls-pad is-big" onClick={onFree}>
          <small>no hearts, no gates</small><span>free mode</span>
        </button>
      </div>
      <div className="ls-panel"><span className="ls-led" style={{ ["--c" as string]: "var(--led-go)" } as CSSProperties} /><span>your track and your progress are safe. nothing resets.</span></div>
      {progress.gems >= 20 && (
        <button type="button" className="ls-panel is-link" onClick={() => { if (spendGems(20)) refillHeart(); }}>
          <span className="ls-led" style={{ ["--c" as string]: "var(--led-lilac)" } as CSSProperties} /><span>spend 20 gems for a heart now · you have {progress.gems}</span>
        </button>
      )}
      <Bottom left={{ label: "leave", icon: "close", href: back }} go={{ label: "practice for a heart", onClick: onPractice }} />
    </div>
  );
}

function HeartsIntro({ onDone }: { onDone: () => void }) {
  return (
    <div className="ls-sheet" role="dialog" aria-modal="true" aria-label="How hearts work">
      <div className="ls-sheet-body">
        <Screen>
          <Meta left="flow mode" right="five hearts" />
          <div className="ls-heartrow is-on">{Array.from({ length: MAX_HEARTS }, (_, i) => <i key={i} />)}</div>
          <div className="ls-title" style={{ marginTop: 14 }}>a wrong answer costs a heart. one comes back every four hours.</div>
          <p className="ls-sub">run out and you can practise to earn one back, or switch to free mode, which has none. your track never resets.</p>
        </Screen>
        <Bottom go={{ label: "got it", onClick: onDone }} />
      </div>
    </div>
  );
}

// ── the player ──────────────────────────────────────────────────────────────
type Props = { mission: Mission; nextSlug?: string; nextTitle?: string; isReview?: boolean; missionIndex?: number; missionTotal?: number; onComplete: () => void };

class Boundary extends Component<{ children: ReactNode; slug: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("[lesson]", this.props.slug, error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="ls">
        <Screen><Meta left="something broke" /><div className="ls-title">this lesson hit a snag. it has been logged.</div><p className="ls-sub">{this.state.error.message}</p></Screen>
        <Bottom left={{ label: "lessons", icon: "back", href: "/learn" }} go={{ label: "try again", onClick: () => this.setState({ error: null }) }} />
      </div>
    );
  }
}

export function M1Lesson(props: Props) {
  // Lessons written as files have their own player (design/process.md). Reviews still use the old one.
  if (props.mission.fromFile && !props.isReview) return <Boundary slug={props.mission.slug}><FileLesson mission={props.mission} nextSlug={props.nextSlug} nextTitle={props.nextTitle} onComplete={props.onComplete} /></Boundary>;
  return <Boundary slug={props.mission.slug}><Player {...props} /></Boundary>;
}

function Player({ mission, nextSlug, isReview, missionIndex = 1, onComplete }: Props) {
  const steps = useMemo(() => lessonSteps(mission.screens ?? []), [mission.screens]);
  const { progress, completeMission, reviewMission, loseHeart, refillHeart } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const { user } = useAuth();
  const [prefs] = usePrefs();
  // Hearts belong to flow mode. A review never costs one.
  const flow = learnMode === "flow" && !isReview;
  const alreadyDone = !!progress.completedMissions[mission.slug];
  const world: WorldId = worldOf(mission.slug) ?? (mission.world === "dj" ? "dj" : mission.world === "foundations" ? "fundamentals" : "producer");
  const accent = WORLD_LED[world];
  const ctx = getMissionContext(mission.slug);
  const back = isReview ? "/review" : ctx.worldRoute || "/worlds";
  const nextHref = isReview ? "/review" : nextSlug ? `/learn/${nextSlug}` : back;
  const SESSION = `ccd.lesson.${mission.slug}`;
  const asks = steps.filter(s => ASK.has(s.kind));
  const xpPer = alreadyDone ? 0 : Math.round(mission.xp / Math.max(1, asks.length));
  const seed = seedOf(mission.slug);

  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [take, setTake] = useState<Take | null>(null);
  const [out, setOut] = useState(false);
  const [intro, setIntro] = useState(false);
  const finished = useRef(false);
  const [moment, setMoment] = useState<null | "rank" | "world">(null);
  // Practice for a heart: three right answers from this lesson's questions, nothing to lose.
  const [practice, setPractice] = useState<{ at: number; right: number } | null>(null);
  const { track: v1 } = useTrack();
  const offerKind = useMemo(() => offerFor({ ...v1, added: [] }, mission).kind, [v1, mission]);

  // Restore where you were after a refresh, and the take you kept.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION) ?? "null") as { idx: number; correct: number; at?: number; done?: boolean } | null;
      // A place saved in the last three hours; a finished lesson stays finished.
      if (saved && saved.idx > 0 && saved.idx < steps.length && Date.now() - (saved.at ?? 0) < 3 * 3600_000) {
        setIdx(saved.idx);
        setCorrect(saved.correct ?? 0);
        if (saved.done) finished.current = true;
      }
    } catch { /* fresh start */ }
    setTake(readTake(mission.slug));
    track("lesson_started", { missionSlug: mission.slug, world: mission.world, xp: mission.xp, isReview: !!isReview, alreadyCompleted: alreadyDone, learnMode });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try { sessionStorage.setItem(SESSION, JSON.stringify({ idx, correct, at: Date.now(), done: finished.current })); } catch { /* ignore */ }
  }, [idx, correct, SESSION]);

  useEffect(() => {
    if (!flow) return;
    try { if (!localStorage.getItem(HEARTS_SEEN)) setIntro(true); } catch { /* ignore */ }
  }, [flow]);

  // Arriving with no hearts left in flow mode.
  useEffect(() => {
    const cur0 = steps[idx]?.kind;
    if (flow && !alreadyDone && progress.hearts <= 0 && cur0 !== "summary" && cur0 !== "tryit") setOut(true);
    if (progress.hearts > 0 || !flow) setOut(false);
  }, [flow, alreadyDone, progress.hearts, idx, steps]);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const score = correct / Math.max(1, asks.length);
    if (score === 1) triggerPerfectScore();
    // Did this lesson cross a rank, or finish a world? The last screen shows it once.
    if (!isReview && !alreadyDone) {
      const w = worldOf(mission.slug);
      const wd = w ? worldDone(w, { ...progress.completedMissions, [mission.slug]: true }) : null;
      const m = wd && wd.done === wd.total ? "world" : rankFor(progress.xp + mission.xp).idx > rankFor(progress.xp).idx ? "rank" : null;
      if (m) setMoment(m);
    }
    if (isReview) reviewMission(mission.slug, score);
    else {
      completeMission(mission.slug, mission.xp, score, mission.badge?.slug);
      window.dispatchEvent(new CustomEvent("progress:server_event", { detail: { type: "mission_complete", missionSlug: mission.slug, xp: mission.xp, score, badge: mission.badge?.slug } }));
    }
    track("lesson_completed", { missionSlug: mission.slug, world: mission.world, xpEarned: alreadyDone ? 0 : mission.xp, score, quizTotal: asks.length, correctCount: correct, isReview: !!isReview, learnMode });
    try { sessionStorage.setItem(SESSION, JSON.stringify({ idx, correct, at: Date.now(), done: true })); } catch { /* ignore */ }
    onComplete();
  }, [correct, asks.length, isReview, reviewMission, completeMission, mission, alreadyDone, learnMode, onComplete, SESSION, idx, progress.xp, progress.completedMissions]);

  const cur = steps[idx];
  useEffect(() => {
    if (cur?.kind === "summary") finish();
  }, [cur?.kind, finish]);

  const next = useCallback(() => {
    if (flow && !alreadyDone && progress.hearts <= 0 && steps[idx + 1]?.kind !== "summary" && steps[idx + 1]?.kind !== "tryit") { setOut(true); return; }
    track("lesson_screen_viewed", { missionSlug: mission.slug, world: mission.world, screenIndex: idx, screenKind: cur?.kind ?? "unknown", totalScreens: steps.length });
    if (idx < steps.length - 1) {
      setIdx(i => i + 1);
      window.scrollTo({ top: 0 });
    } else finish();
  }, [flow, alreadyDone, progress.hearts, steps, idx, mission, cur, finish]);

  const onCorrect = () => setCorrect(c => c + 1);
  const onWrong = () => {
    if (!flow) return;
    loseHeart();
    window.dispatchEvent(new CustomEvent("progress:server_event", { detail: { type: "heart_lost" } }));
  };

  // Labels like "concept · 2 of 7" count the steps of that kind.
  const kindLabel: Record<string, string> = { concept: "concept", diagram: "diagram", interact: "try it", quiz: "question", "audio-id": "listen", "type-answer": "type it", sequence: "order", match: "match", say: "learn", hear: "listen", play: "play", shape: "shape", ear: "ear round" };
  const meta = (() => {
    if (!cur) return "";
    if (ASK.has(cur.kind)) {
      const n = asks.indexOf(cur) + 1;
      return `${kindLabel[cur.kind]} · ${n} of ${asks.length}`;
    }
    const same = steps.filter(s => s.kind === cur.kind);
    return `${kindLabel[cur.kind] ?? cur.kind} · ${same.indexOf(cur) + 1} of ${same.length}`;
  })();
  const ask: AskProps = { meta, accent, flow: flow && !alreadyDone, xp: xpPer, onCorrect, onWrong, onNext: next };
  const ttype = takeType(offerKind);

  const PRACTICE_GOAL = 3;
  let body: ReactNode = null;
  if (practice && asks.length) {
    const q = asks[practice.at % asks.length];
    const pm = `practice · ${practice.right} of ${PRACTICE_GOAL} right`;
    const pp: AskProps = {
      meta: pm, accent, flow: false, xp: 0,
      onCorrect: () => setPractice(x => (x ? { ...x, right: x.right + 1 } : x)),
      onWrong: () => {},
      onNext: () => {
        if (practice.right >= PRACTICE_GOAL) {
          refillHeart();
          setPractice(null);
          setOut(false);
        } else setPractice(x => (x ? { ...x, at: x.at + 1 } : x));
      },
    };
    const k = `p${practice.at}`;
    body = q.kind === "quiz" ? <QuizStep key={k} screen={q} {...pp} />
      : q.kind === "audio-id" ? <ListenStep key={k} screen={q} {...pp} />
      : q.kind === "type-answer" ? <TypeStep key={k} screen={q} {...pp} />
      : q.kind === "sequence" ? <OrderStep key={k} screen={q} seed={seed + practice.at} {...pp} />
      : q.kind === "match" ? <MatchStep key={k} screen={q} seed={seed + practice.at} {...pp} /> : null;
  } else if (out && flow) body = <HeartsOut back={back} onFree={() => { setLearnMode("classic"); setOut(false); }} onPractice={() => setPractice({ at: Math.max(0, asks.findIndex(a => steps.indexOf(a) >= idx)), right: 0 })} />;
  else if (!cur) body = null;
  else switch (cur.kind) {
    case "hook": body = <HookStep mission={mission} screen={cur} world={world} index={missionIndex} accent={accent} back={back} onNext={() => { if (startsFresh(mission) && songHasMusic()) newSong("my first song"); next(); }} />; break;
    case "concept": body = <ConceptStep screen={cur} meta={meta} accent={accent} onNext={next} />; break;
    case "diagram": body = <DiagramStep screen={cur} meta={meta} accent={accent} onNext={next} />; break;
    case "interact": body = <SimStep screen={cur} meta={meta} onNext={next} />; break;
    case "quiz": body = <QuizStep screen={cur} {...ask} />; break;
    case "audio-id": body = <ListenStep screen={cur} {...ask} />; break;
    case "type-answer": body = <TypeStep screen={cur} {...ask} />; break;
    case "sequence": body = <OrderStep screen={cur} seed={seed + idx} {...ask} />; break;
    case "match": body = <MatchStep screen={cur} seed={seed + idx} {...ask} />; break;
    case "say": body = <SayStep screen={cur} meta={meta} onNext={next} />; break;
    case "hear": body = <HearStep screen={cur} meta={meta} onNext={next} />; break;
    case "shape": body = <ShapeStep mission={mission} screen={cur} meta={meta} accent={accent} onNext={next} />; break;
    case "ear": body = <EarStep screen={cur} meta={meta} level="standard" onNext={next} />; break;
    case "play":
    case "tryit":
      body = <TryIt type={ttype} coach={cur.kind === "play" ? { body: cur.body, hint: cur.hint, goal: cur.goal } : undefined} initial={take?.type === ttype ? take.events : undefined}
        title={cur.kind === "play" ? "play it in" : `play your ${ttype === "drums" ? "beat" : ttype === "hats" ? "hats" : ttype === "chords" ? "chords" : ttype === "bass" ? "bass line" : "lead line"}`}
        onUse={t => { setTake(t); saveTake(mission.slug, t); next(); }}
        onSkip={() => { setTake(null); saveTake(mission.slug, null); next(); }} />;
      break;
    case "summary":
      body = <DoneStep mission={mission} screen={cur} xp={alreadyDone ? 0 : mission.xp} take={take} accent={accent} nextHref={nextHref} backHref={back} isLoggedIn={!!user} source={ctx.path?.source ?? null} score={correct / Math.max(1, asks.length)}
        moment={moment} setMoment={setMoment}
        onLeave={() => { try { sessionStorage.removeItem(SESSION); } catch { /* ignore */ } saveTake(mission.slug, null); }} />;
      break;
  }

  return (
    <div className="ls" data-world={world} data-steps={steps.map(s => s.kind).join(",")} data-step={idx}>
      <Top back={back} total={steps.length} now={idx} accent={accent} hearts={flow ? progress.hearts : null} tune={!!mission.fromFile} />
      <div className="ls-stage" key={practice ? `p${practice.at}` : out ? "out" : idx}>{body}</div>
      {intro && cur?.kind === "hook" && <HeartsIntro onDone={() => { setIntro(false); try { localStorage.setItem(HEARTS_SEEN, "1"); } catch { /* ignore */ } }} />}
    </div>
  );
}

