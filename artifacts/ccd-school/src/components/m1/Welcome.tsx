"use client";
/**
 * First visit: a hands-on tour of what ccd school is. Each part of the product is shown working and
 * you try it: learn (play a kick), make (build a song), practice (an ear question), studio (shape a
 * sound), mix (fade between two tracks). Sound only plays when you touch something.
 * Then three quick questions, then the dashboard, with its parts pointed out, and lesson one.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FLAG, OUT, LAYER_PARAMS, LEAD_PARAMS, DRUM_PAD_NOTES } from "@/engine";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { usePrefs, type Voice } from "@/lib/prefs";
import { PlacementTest } from "@/components/PlacementTest";
import { missionBySlug } from "@/content/missions";
import { emptyTrackV2, newLayerV2, toV1View, type NoteEvent, type TrackV2 } from "@/lib/track2";
import { getCtx } from "@/lib/audio";
import { type WorldId } from "@/lib/worldOrder";
import { Fader, GoPill, Icon, Knob, CAP, Pad, Screen } from "./controls";
import { CAT_SRC, Lanes } from "./shell";
import { useEngineTrack } from "./useEngineTrack";
import { WaveShape } from "./LessonVisuals";
import "./lesson.css";

type Know = "new" | "some" | "lots";
const MAKE: { id: WorldId; name: string; line: string; first: string }[] = [
  { id: "fundamentals", name: "start from the basics", line: "a beat, notes, chords and your ears. the best place to begin", first: "tempo-bpm" },
  { id: "producer", name: "make my own tracks", line: "build a song from a kick drum up, one part per lesson", first: "your-kick" },
  { id: "dj", name: "mix tracks as a dj", line: "beatmatch, blend, read a room. later, your own tracks", first: "what-is-djing" },
];
const KNOW: { id: Know; name: string; line: string }[] = [
  { id: "new", name: "completely new", line: "never made or mixed music" },
  { id: "some", name: "a little", line: "played around with an app or a controller" },
  { id: "lots", name: "i know my way around", line: "find my level with a few quick questions" },
];
const WAYS: { id: Voice; name: string; line: string }[] = [
  { id: "mentor", name: "walk me through it", line: "the full picture, step by step" },
  { id: "straight", name: "give me the short version", line: "just the point, i'll ask for more if i need it" },
  { id: "eli5", name: "keep it simple", line: "plain words and everyday examples" },
];
const TOUR = ["hello", "learn", "make", "practice", "studio", "mix", "start", "know", "explain"] as const;
type At = (typeof TOUR)[number];
export const TOUR_KEY = "ccd.tour.first";

// ── little tracks the tour plays ─────────────────────────────────────────────
const K = DRUM_PAD_NOTES[0], CLAP = DRUM_PAD_NOTES[2], OPEN = DRUM_PAD_NOTES[5];
const hit = (note: number, starts: number[], vel = 0.9, len = 0.2): NoteEvent[] => starts.map(start => ({ note, vel, start, len }));
const LEVEL = LAYER_PARAMS.find(p => p.key === "level")!.index;
const lead = (key: string) => LEAD_PARAMS.find(p => p.key === key)!.index;
function song(parts: number, cutoff = 0.5): TrackV2 {
  const t = { ...emptyTrackV2(), bpm: 122, loop: 8 };
  const d = newLayerV2("drums"); d.events = [...hit(K, [0, 1, 2, 3, 4, 5, 6, 7]), ...(parts > 1 ? hit(CLAP, [1, 3, 5, 7], 0.75) : [])];
  const h = newLayerV2("hats"); h.events = hit(OPEN, [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5], 0.6);
  const l = newLayerV2("lead"); l.events = [[57, 0], [60, 1.5], [64, 3], [62, 4], [60, 5.5], [57, 7]].map(([note, start]) => ({ note, start, vel: 0.8, len: 1 }));
  l.params = { [lead("cutoff")]: cutoff, [lead("detune")]: 0.15 };
  return { ...t, layers: [d, ...(parts > 2 ? [h] : []), ...(parts > 3 ? [l] : [])] };
}
function decks(x: number): TrackV2 {
  const t = { ...emptyTrackV2(), bpm: 124, loop: 8 };
  const a = newLayerV2("drums"); a.events = [...hit(K, [0, 1, 2, 3, 4, 5, 6, 7]), ...hit(CLAP, [1, 3, 5, 7], 0.8)]; a.params = { [LEVEL]: 0.85 * Math.min(1, 2 * (1 - x)) };
  const b = newLayerV2("hats"); b.events = hit(OPEN, [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5], 0.7);
  const c = newLayerV2("lead"); c.events = [[64, 0], [67, 2], [69, 4], [67, 6]].map(([note, start]) => ({ note, start, vel: 0.75, len: 1.5 }));
  b.params = { [LEVEL]: 0.85 * Math.min(1, 2 * x) }; c.params = { [LEVEL]: 0.85 * Math.min(1, 2 * x), [lead("cutoff")]: 0.45 };
  return { ...t, layers: [a, b, c] };
}
function tone(midi: number, at: number) {
  const ctx = getCtx(); if (!ctx) return;
  void ctx.resume();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "triangle"; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
  const t = ctx.currentTime + at;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.65);
}

function Choice<T extends string>({ items, value, onPick }: { items: { id: T; name: string; line: string }[]; value: T | null; onPick: (id: T) => void }) {
  return (
    <div className="wl-choices" role="radiogroup">
      {items.map((p, i) => (
        <Pad key={p.id} lit={value === p.id ? "var(--led-mint)" : null} ariaPressed={value === p.id} onClick={() => onPick(p.id)} height={68} ariaLabel={`${p.name}: ${p.line}`} style={{ animationDelay: `${80 * i}ms` } as CSSProperties}>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "0 14px", width: "100%", textAlign: "left" }}>
            <span className="m1-t22" style={{ fontSize: 18, ...(value === p.id ? { color: "#06241B" } : {}) }}>{p.name}</span>
            <span className="m1-t11" style={value === p.id ? { color: "#0D2A22" } : undefined}>{p.line}</span>
          </span>
        </Pad>
      ))}
    </div>
  );
}

function Part({ n, name, title, line, children }: { n: number; name: string; title: string; line: string; children: ReactNode }) {
  return (
    <div className="wl-part">
      <div className="wl-tag"><b>{n}</b>{name}</div>
      <h1 className="wl-big">{title}</h1>
      <p className="wl-lead">{line}</p>
      <div className="wl-try">{children}</div>
    </div>
  );
}

export function Welcome({ onLeave }: { onLeave?: () => void }) {
  const [step, setStep] = useState(0);
  const [world, setWorld] = useState<WorldId | null>(null);
  const [know, setKnow] = useState<Know | null>(null);
  const [prefs, setPrefs] = usePrefs();
  const [placement, setPlacement] = useState(false);
  const { setOnboarding } = useProgress();
  const { setLearnMode } = useLearnMode();
  const router = useRouter();
  const at: At = TOUR[step];
  const make = MAKE.find(m => m.id === world) ?? MAKE[0];

  // the tour's sound: only after a tap
  const [parts, setParts] = useState(1);
  const [cut, setCut] = useState(0.3);
  const [x, setX] = useState(0);
  const track = useMemo(() => (at === "mix" ? decks(x) : song(at === "studio" ? 4 : parts, at === "studio" ? cut : 0.5)), [at, parts, cut, x]);
  const { engine, ready } = useEngineTrack(track);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { engine.stop(); }, [step, engine]);
  const play = () => void ready().then(() => { engine.metronome(false); engine.play(); });
  const playing = beat >= 0;

  // practice: which is higher
  // Which note is higher is random each time, so the answer can't be learned by position.
  const [ear, setEar] = useState<{ hi: 0 | 1; picked: number | null }>({ hi: 1, picked: null });
  useEffect(() => setEar({ hi: Math.random() < 0.5 ? 0 : 1, picked: null }), []);
  const pair = () => { const a = 57, b = 64; tone(ear.hi === 0 ? b : a, 0); tone(ear.hi === 0 ? a : b, 0.7); };

  const pads = useRef(0);
  const [lit, setLit] = useState(false);
  const tap = () => { void ready().then(() => { engine.noteOn(0, K, 0.95); window.setTimeout(() => engine.noteOff(0, K), 120); }); pads.current++; setLit(true); window.setTimeout(() => setLit(false), 140); };

  const go = () => {
    onLeave?.();
    setOnboarding(make.id, know === "lots" ? "hard" : "normal");
    setLearnMode("flow");
    try { sessionStorage.setItem(TOUR_KEY, make.first); localStorage.setItem("ccd.world", make.id); } catch { /* ignore */ }
    router.push("/dashboard?tour=1");
  };
  const next = () => setStep(s => Math.min(TOUR.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));
  if (placement) return <PlacementTest world={make.id} onSkip={() => setPlacement(false)} onComplete={slug => { onLeave?.(); router.push(`/learn/${slug}`); }} />;

  const v1 = toV1View(track);
  const loop = track.loop || 8;
  const head = playing ? Math.floor(((((beat % loop) + loop) % loop) / loop) * 16) : -1;
  return (
    <main className="m1-page wl" data-step={at}>
      <div className="wl-top">
        {step > 0 ? <button type="button" className="fl-stepback" onClick={back} aria-label="Back"><Icon name="back" small />back</button> : <span />}
        <div className="ls-seg" aria-hidden style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties}>{TOUR.map((_, i) => <i key={i} className={i < step ? "is-done" : i === step ? "is-now" : ""} />)}</div>
        {step > 0 && step < 6 ? <button type="button" className="fl-stepback" onClick={() => setStep(6)}>skip tour</button> : <span />}
      </div>

      <div className="wl-stage" key={at}>
        {at === "hello" && (
          <div className="wl-hello">
            <div className="wl-eq" aria-hidden>{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ animationDelay: `${(i * 97) % 900}ms` }} />)}</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CAT_SRC} alt="" className="m1-dancing wl-cat" />
            <div className="wl-tag">ccd school · by cats can dance</div>
            <h1 className="wl-hero">make music.<br />learn by making it.</h1>
            <p className="wl-lead">from your first kick drum to mixing your own tracks at a ccd night. every lesson ends with something new in your song. let us show you how it works, it takes a minute and you can play along.</p>
            <div className="wl-go"><GoPill onClick={next} style={{ height: 72, width: "100%" }}>show me <Icon name="play" small /></GoPill></div>
            <a className="ls-skip" href="/dashboard">i&apos;ve been here before</a>
          </div>
        )}

        {at === "learn" && (
          <Part n={1} name="learn" title="you learn by doing" line="every lesson is short and hands on. you hear the idea, then you play it. try it: tap the pad, that's a kick drum, the heartbeat of a dance track.">
            <Screen>
              <div className="wl-meta"><span>a lesson step</span><span>{pads.current ? `${pads.current} ${pads.current === 1 ? "tap" : "taps"}` : "tap the pad"}</span></div>
              <button type="button" className={`wl-pad ${lit ? "is-on" : ""}`} onPointerDown={tap} aria-label="Play a kick">kick</button>
            </Screen>
            <div className="wl-go"><GoPill onClick={next} style={{ height: 64, width: "100%" }}>next: make</GoPill></div>
          </Part>
        )}

        {at === "make" && (
          <Part n={2} name="make" title="it all goes into your song" line="each lesson adds a part to one song that is yours. tap add and hear it grow, the way it will over your first lessons.">
            <Screen>
              <div className="wl-meta"><span>your song</span><span>{parts} of 4 parts</span></div>
              <div className="wl-lanes"><Lanes track={v1} playhead={head} /></div>
            </Screen>
            <div className="wl-row">
              <button type="button" className="ls-chip" onClick={() => { if (playing) engine.stop(); else play(); }}>{playing ? "stop" : "play my song"}</button>
              {parts < 4 && <button type="button" className="ls-chip" onClick={() => { setParts(p => p + 1); play(); }}>add {["", "a clap", "hats", "a synth line"][parts]}</button>}
            </div>
            <div className="wl-go"><GoPill onClick={next} style={{ height: 64, width: "100%" }}>next: practice</GoPill></div>
          </Part>
        )}

        {at === "practice" && (
          <Part n={3} name="practice" title="train your ears" line="quick ear games and reviews keep what you learned. which of the two notes is higher?">
            <Screen>
              <div className="wl-meta"><span>ear gym</span><span>{ear.picked === null ? "listen, then pick" : ""}</span></div>
              <button type="button" className="ls-chip" style={{ marginTop: 12 }} onClick={pair}>play the two notes</button>
              <div className="wl-row" style={{ marginTop: 12 }}>
                {["first", "second"].map((l, i) => (
                  <button key={l} type="button" className={`wl-ans ${ear.picked === null ? "" : i === ear.hi ? "is-right" : ear.picked === i ? "is-wrong" : ""}`} onClick={() => setEar(e => ({ ...e, picked: i }))}>{l}</button>
                ))}
              </div>
              {ear.picked !== null && (
                <div className={`wl-verdict ${ear.picked === ear.hi ? "is-right" : ""}`} role="status">
                  {ear.picked === ear.hi ? `right: the ${ear.hi === 0 ? "first" : "second"} note was higher.` : `not this time: the ${ear.hi === 0 ? "first" : "second"} note was higher.`}
                  <button type="button" className="ls-chip" onClick={() => { setEar({ hi: Math.random() < 0.5 ? 0 : 1, picked: null }); }}>another one</button>
                </div>
              )}
            </Screen>
            <div className="wl-go"><GoPill onClick={next} style={{ height: 64, width: "100%" }}>next: studio</GoPill></div>
          </Part>
        )}

        {at === "studio" && (
          <Part n={4} name="studio" title="shape every sound" line="in the studio you build your song out on real instruments. turn the knob while it plays: you are opening a filter, from dark to bright.">
            <Screen>
              <div className="wl-meta"><span>studio · synth</span><span>{Math.round(cut * 100)}%</span></div>
              <WaveShape morph={0} bright={cut} cycles={3} playing={playing} />
            </Screen>
            <div className="wl-row">
              <div style={{ width: 150 }}><Knob label="brightness" value={cut} onChange={v => { setCut(v); if (!playing) play(); }} color={CAP.navy} size={70} height={160} led="var(--led-mint)" /></div>
              <button type="button" className="ls-chip" onClick={() => { if (playing) engine.stop(); else play(); }}>{playing ? "stop" : "play"}</button>
            </div>
            <div className="wl-go"><GoPill onClick={next} style={{ height: 64, width: "100%" }}>next: mix</GoPill></div>
          </Part>
        )}

        {at === "mix" && (
          <Part n={5} name="mix" title="then play it out" line="the dj world teaches you to mix: one track into the next, without the music stopping. slide from deck a to deck b. one day these are your own tracks.">
            <Screen>
              <div className="wl-meta"><span>deck a · beat</span><span>deck b · melody</span></div>
              <div className="wl-xf">
                <Fader horizontal label="crossfader" value={x} onChange={v => { setX(v); if (!playing) play(); }} width={280} defaultValue={0} />
              </div>
            </Screen>
            <div className="wl-row"><button type="button" className="ls-chip" onClick={() => { if (playing) engine.stop(); else play(); }}>{playing ? "stop" : "play both decks"}</button></div>
            <div className="wl-go"><GoPill onClick={next} style={{ height: 64, width: "100%" }}>that&apos;s ccd school</GoPill></div>
          </Part>
        )}

        {at === "start" && (
          <Part n={6} name="you" title="where do you want to start?" line="you can do all three, in any order. most people start with the basics, then producing, then djing their own tracks.">
            <Choice items={MAKE} value={world} onPick={id => { setWorld(id); next(); }} />
          </Part>
        )}
        {at === "know" && (
          <Part n={7} name="you" title="how much have you done before?" line="so we start you in the right place.">
            <Choice items={KNOW} value={know} onPick={id => { setKnow(id); next(); }} />
          </Part>
        )}
        {at === "explain" && (
          <Part n={8} name="you" title="how do you like to learn?" line="every step also has buttons to hear it another way, any time.">
            <Choice items={WAYS} value={prefs.voice} onPick={id => setPrefs({ voice: id })} />
            <div className="wl-go"><GoPill onClick={go} style={{ height: 72, width: "100%" }}>take me in <Icon name="play" small /></GoPill></div>
            {know === "lots" && <button type="button" className="ls-skip" onClick={() => setPlacement(true)}>or find my level first</button>}
            <div className="m1-t11" style={{ textAlign: "center", marginTop: 8 }}>first lesson: {(missionBySlug(make.first)?.title ?? "").toLowerCase()}</div>
          </Part>
        )}
      </div>
    </main>
  );
}
