"use client";
/**
 * First visit (Param, 9 Nov night): show, don't tell. Each product gets two screens:
 *  watch: the real part playing itself, a finger showing what you'd do, a few words;
 *  try: the same part in your hands, with sound.
 * hello (your song building itself), learn, practice, studio, dj decks, library (devices you can play),
 * then two questions on one screen, then home and its walkthrough. Sound only after a touch.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FLAG, OUT, LAYER_PARAMS, LEAD_PARAMS, DRUM_PAD_NOTES } from "@/engine";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { emptyTrackV2, newLayerV2, toV1View, type NoteEvent, type TrackV2 } from "@/lib/track2";
import { getCtx } from "@/lib/audio";
import { GoPill, Icon, Knob, CAP, LED, Pad, Screen } from "./controls";
import { CAT_SRC, Lanes } from "./shell";
import { useEngineTrack } from "./useEngineTrack";
import { WaveShape } from "./LessonVisuals";
import { DeckRig, type Chan } from "./DeckRig";
import "./lesson.css";
import "./welcome.css";
import "./deck.css";

export const TOUR_KEY = "ccd.tour.first";
const Placement = dynamic(() => import("./Placement").then(m => m.Placement), { ssr: false });
type Prod = "learn" | "practice" | "studio" | "dj" | "library";
const PRODS: Prod[] = ["learn", "practice", "studio", "dj", "library"];
const STEPS = ["hello", ...PRODS.flatMap(p => [`${p}:watch`, `${p}:try`]), "you"] as const;
const COPY: Record<Prod, { name: string; watch: string; sub: string; try: string }> = {
  learn: { name: "learn", watch: "every lesson adds a part", sub: "to a song that's yours", try: "add a part, then play" },
  practice: { name: "practice", watch: "train your ears", sub: "three minutes a day", try: "which note was higher?" },
  studio: { name: "studio", watch: "play real instruments", sub: "then send it to Ableton Live", try: "tap the pads, turn the knob" },
  dj: { name: "dj decks", watch: "play your song out", sub: "laid out like a real controller", try: "press play, slide to b" },
  library: { name: "library", watch: "every device, playable", sub: "better than any manual", try: "pick one and turn it" },
};

type Want = "make" | "dj" | "both";
type Know = "new" | "some" | "lots";
const WANT: { id: Want; name: string }[] = [{ id: "make", name: "make tracks" }, { id: "dj", name: "dj" }, { id: "both", name: "both" }];
const KNOW: { id: Know; name: string; line: string }[] = [
  { id: "new", name: "completely new", line: "start with the basics" },
  { id: "some", name: "a little", line: "straight to the good part" },
  { id: "lots", name: "test me", line: "find my level" },
];
const worldFor = (want: Want | null, know: Know | null) => (know === "new" ? "fundamentals" : want === "dj" ? "dj" : "producer") as "fundamentals" | "producer" | "dj";

// ── the sounds the tour plays ────────────────────────────────────────────────
const K = DRUM_PAD_NOTES[0], CLAP = DRUM_PAD_NOTES[2], OPEN = DRUM_PAD_NOTES[5];
const hit = (note: number, starts: number[], vel = 0.9, len = 0.2): NoteEvent[] => starts.map(start => ({ note, vel, start, len }));
const LEVEL = LAYER_PARAMS.find(p => p.key === "level")!.index;
const DRIVE = LAYER_PARAMS.find(p => p.key === "drive")!.index;
const ECHO = LAYER_PARAMS.find(p => p.key === "echo")!.index;
const lead = (key: string) => LEAD_PARAMS.find(p => p.key === key)!.index;
function song(parts: number, fx?: { cutoff?: number; drive?: number; echo?: number }): TrackV2 {
  const t = { ...emptyTrackV2(), bpm: 122, loop: 8 };
  const d = newLayerV2("drums"); d.events = [...hit(K, [0, 1, 2, 3, 4, 5, 6, 7]), ...(parts > 1 ? hit(CLAP, [1, 3, 5, 7], 0.75) : [])];
  const h = newLayerV2("hats"); h.events = hit(OPEN, [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5], 0.6);
  const l = newLayerV2("lead"); l.events = [[57, 0], [60, 1.5], [64, 3], [62, 4], [60, 5.5], [57, 7]].map(([note, start]) => ({ note, start, vel: 0.8, len: 1 }));
  const p: Record<number, number> = { [lead("cutoff")]: fx?.cutoff ?? 0.5, [lead("detune")]: 0.15 };
  if (fx?.drive !== undefined) p[DRIVE] = fx.drive;
  if (fx?.echo !== undefined) p[ECHO] = fx.echo;
  l.params = p;
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

/** A clock for the demos that play themselves: ticks every `ms` while the screen is open. */
function useTick(ms: number, on = true) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => setN(x => x + 1), ms);
    return () => window.clearInterval(id);
  }, [ms, on]);
  return n;
}

/** The finger that shows what to do: a soft dot that presses where it is put (percent of the demo box). */
function Finger({ x, y, press }: { x: number; y: number; press: boolean }) {
  return <i className={`wt-finger ${press ? "is-press" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} aria-hidden />;
}

const PAD_NAMES = ["perc", "perc", "fx", "rev", "tom", "tom", "tom", "crash", "hat", "open", "shkr", "ride", "kick", "snare", "clap", "rim"];
const PATTERN: number[][] = [[12, 8], [8], [13, 9], [8], [12, 8], [8, 12], [13, 9], [8, 14]];

export function Welcome({ onLeave }: { onLeave?: () => void }) {
  const [step, setStep] = useState(0);
  const [want, setWant] = useState<Want | null>(null);
  const [know, setKnow] = useState<Know | null>(null);
  const [placement, setPlacement] = useState(false);
  const { setOnboarding } = useProgress();
  const { setLearnMode } = useLearnMode();
  const router = useRouter();
  const at = STEPS[step];
  const [prod, phase] = at.includes(":") ? (at.split(":") as [Prod, "watch" | "try"]) : [null, null];
  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));
  const tick = useTick(phase === "watch" || at === "hello" ? 380 : 100000);

  // the try screens' sound: only after a tap
  const [parts, setParts] = useState(1);
  const [cut, setCut] = useState(0.3);
  const [x, setX] = useState(0);
  const [dev, setDev] = useState<"filter" | "drive" | "echo">("filter");
  const [amt, setAmt] = useState(0.3);
  const track = useMemo(() => {
    if (prod === "dj") return decks(x);
    if (prod === "studio") return song(2, { cutoff: cut });
    if (prod === "library") return song(4, dev === "filter" ? { cutoff: 0.08 + amt * 0.9 } : dev === "drive" ? { drive: amt } : { echo: amt });
    return song(parts);
  }, [prod, parts, cut, x, dev, amt]);
  const { engine, ready } = useEngineTrack(track);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { engine.stop(); }, [step, engine]);
  const playing = beat >= 0;
  const play = () => void ready().then(() => { engine.metronome(false); engine.play(); });
  const toggle = () => (playing ? engine.stop() : play());
  const pad = (i: number) => void ready().then(() => { const n = i === 12 ? K : i === 13 || i === 14 ? CLAP : OPEN; engine.noteOn(0, n, 0.9); window.setTimeout(() => engine.noteOff(0, n), 120); });
  const [lit, setLit] = useState<number | null>(null);
  const [ear, setEar] = useState<{ hi: 0 | 1; picked: number | null }>({ hi: 1, picked: null });
  useEffect(() => setEar({ hi: Math.random() < 0.5 ? 0 : 1, picked: null }), []);
  const pair = () => { const a = 57, b = 64; tone(ear.hi === 0 ? b : a, 0); tone(ear.hi === 0 ? a : b, 0.7); };
  const preload = useRef(false);
  useEffect(() => {
    if (preload.current) return; preload.current = true;
    const t = window.setTimeout(() => {
      for (const href of ["/engine/ccd_engine.wasm", "/engine/ccd-worklet.js"]) {
        if (document.querySelector(`link[href="${href}"]`)) continue;
        const l = document.createElement("link"); l.rel = "prefetch"; l.href = href; document.head.appendChild(l);
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, []);

  const go = () => {
    const w = worldFor(want, know);
    onLeave?.();
    setOnboarding(w, "normal");
    setLearnMode("flow");
    try { localStorage.setItem("ccd.world", w); } catch { /* ignore */ }
    router.push("/dashboard");
  };
  if (placement) return <Placement world={worldFor(want, "lots")} startNow onClose={() => setPlacement(false)} onDone={slug => {
    onLeave?.();
    setOnboarding(worldFor(want, "lots"), "hard");
    setLearnMode("flow");
    try { localStorage.setItem("ccd.everything", "1"); } catch { /* ignore */ }
    router.push(`/learn/${slug}`);
  }} />;

  // what the demos show this tick
  const t8 = tick % 8;
  const head = phase === "watch" || at === "hello" ? (tick * 2) % 16 : playing ? Math.floor(((((beat % 8) + 8) % 8) / 8) * 16) : -1;
  const helloParts = 1 + Math.min(3, Math.floor((tick % 24) / 5));
  const watchParts = 1 + Math.min(3, Math.floor((tick % 16) / 4));
  const demo: ReactNode = (() => {
    if (at === "hello") return (
      <Screen className="wt-stage is-hello">
        <div className="wt-hellolanes"><Lanes track={toV1View(song(helloParts))} playhead={head} /></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" className="m1-dancing wt-hellocat" />
      </Screen>
    );
    if (prod === "learn") {
      const n = phase === "watch" ? watchParts : parts;
      return (
        <div className="wt-demo">
          <Screen className="wt-stage">
            <div className="wt-meta"><span>your song</span><span className="wt-count">{n} of 4</span></div>
            <div className="wt-lanes"><Lanes track={toV1View(song(n))} playhead={head} /></div>
          </Screen>
          <div className="wt-row">
            {phase === "try" ? <>
              <button type="button" className="wt-key" onClick={toggle}><Icon name={playing ? "stop" : "play"} small />{playing ? "stop" : "play"}</button>
              <button type="button" className="wt-key is-add" disabled={parts >= 4} onClick={() => { setParts(p => Math.min(4, p + 1)); play(); }}><Icon name="plus" small />{["", "clap", "hats", "synth", "done"][parts]}</button>
            </> : <>
              <span className="wt-key is-ghost"><Icon name="play" small />play</span>
              <span className={`wt-key is-add is-ghost ${tick % 4 === 3 ? "is-hit" : ""}`}><Icon name="plus" small />{["", "clap", "hats", "synth", "clap"][watchParts]}</span>
              <Finger x={74} y={50} press={tick % 4 === 3} />
            </>}
          </div>
        </div>
      );
    }
    if (prod === "practice") {
      const picked = phase === "watch" ? (tick % 8 >= 5 ? 1 : null) : ear.picked;
      const hi = phase === "watch" ? 1 : ear.hi;
      return (
        <div className="wt-demo">
          <Screen className="wt-stage">
            <div className="wt-notes" aria-hidden>
              <i className={phase === "watch" && t8 === 1 ? "is-on" : ""} style={{ height: "38%" }} />
              <i className={phase === "watch" && t8 === 3 ? "is-on" : ""} style={{ height: "74%" }} />
            </div>
            <div className="wt-streak" aria-hidden>{Array.from({ length: 5 }, (_, i) => <b key={i} className={i < (phase === "watch" ? 2 + (picked !== null ? 1 : 0) : ear.picked === ear.hi ? 1 : 0) ? "is-on" : ""} />)}</div>
          </Screen>
          <div className="wt-row is-2">
            {[0, 1].map(i => phase === "try"
              ? <button key={i} type="button" className={`wt-ans ${picked === null ? "" : i === hi ? "is-right" : picked === i ? "is-wrong" : ""}`} onClick={() => setEar(e => (e.picked === null ? { ...e, picked: i } : e))}>{i ? "second" : "first"}</button>
              : <span key={i} className={`wt-ans is-ghost ${picked !== null && i === hi ? "is-right" : ""}`}>{i ? "second" : "first"}</span>)}
            {phase === "watch" ? <Finger x={75} y={50} press={t8 === 5} /> : null}
          </div>
          {phase === "try" ? <button type="button" className="wt-key" onClick={() => { setEar({ hi: Math.random() < 0.5 ? 0 : 1, picked: null }); pair(); }}><Icon name="hear" small />play the notes</button> : null}
        </div>
      );
    }
    if (prod === "studio") {
      const on = phase === "watch" ? PATTERN[tick % 8] : lit !== null ? [lit] : [];
      const auto = phase === "watch" ? 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(tick / 3)) : cut;
      return (
        <div className="wt-demo">
          <div className="wt-studio">
            <div className="wt-pads" role="group" aria-label="Drum pads">
              {PAD_NAMES.map((nm, i) => phase === "try"
                ? <button key={i} type="button" className={`wt-pad ${on.includes(i) ? "is-on" : ""} ${i >= 8 ? "is-main" : ""}`} onPointerDown={() => { pad(i); setLit(i); window.setTimeout(() => setLit(l => (l === i ? null : l)), 140); }} aria-label={nm}>{nm}</button>
                : <span key={i} className={`wt-pad ${on.includes(i) ? "is-on" : ""} ${i >= 8 ? "is-main" : ""}`}>{nm}</span>)}
              {phase === "watch" ? <Finger x={on[0] !== undefined ? 12.5 + (on[0] % 4) * 25 : 12} y={on[0] !== undefined ? 12.5 + Math.floor(on[0] / 4) * 25 : 87} press /> : null}
            </div>
            <div className="wt-knobcol">
              <Screen className="wt-wave"><WaveShape morph={0} bright={auto} cycles={2} playing={phase === "watch" || playing} /></Screen>
              <Knob label="bright" value={auto} onChange={v => { if (phase === "try") { setCut(v); if (!playing) play(); } }} color={CAP.navy} size={50} height={118} led="var(--led-mint)" />
            </div>
          </div>
          {phase === "try" ? <div className="wt-row"><button type="button" className="wt-key" onClick={toggle}><Icon name={playing ? "stop" : "play"} small />{playing ? "stop" : "play the loop"}</button><span className="wt-live"><Icon name="out" small />to live</span></div> : <div className="wt-row"><span className="wt-live is-big"><Icon name="out" small />to live</span></div>}
        </div>
      );
    }
    if (prod === "dj") {
      const xa = phase === "watch" ? 0.5 + 0.5 * Math.sin(tick / 4) : x;
      const ch: Chan = { trim: 0.5, hi: 0.5, mid: 0.5, low: 0.5, filter: 0.5, fader: 0.8, phones: false, level: 0 };
      return (
        <div className={`wt-demo wt-dj ${phase === "watch" ? "wt-spin" : ""}`}>
          <DeckRig
            decks={[
              { id: "a", title: "deck a", sub: "", color: LED.mint, playing: phase === "watch" || playing, bpm: 124, pitch: 0, synced: false },
              { id: "b", title: "deck b", sub: "", color: LED.cobalt, playing: phase === "watch" || playing, bpm: 124, pitch: 0, synced: false },
            ]}
            chans={[{ ...ch, level: phase === "watch" || playing ? 1 - xa : 0 }, { ...ch, level: phase === "watch" || playing ? xa : 0 }]}
            xf={xa} show={new Set()} screen={null}
            onPlay={() => { if (phase === "try") toggle(); }} onCue={() => engine.stop()} onChan={() => {}}
            onXf={v => { if (phase === "try") { setX(v); if (!playing) play(); } }} />
        </div>
      );
    }
    if (prod === "library") {
      const d = phase === "watch" ? (["filter", "drive", "echo"] as const)[Math.floor(tick / 8) % 3] : dev;
      const a = phase === "watch" ? 0.5 + 0.45 * Math.sin(tick / 2.5) : amt;
      return (
        <div className="wt-demo">
          <div className="wt-devs" role="radiogroup" aria-label="Devices">
            {(["filter", "drive", "echo"] as const).map(k => phase === "try"
              ? <button key={k} type="button" role="radio" aria-checked={dev === k} className={`wt-dev ${dev === k ? "is-on" : ""}`} onClick={() => { setDev(k); if (!playing) play(); }}><DevPic k={k} a={dev === k ? amt : 0.5} /><b>{k}</b></button>
              : <span key={k} className={`wt-dev is-ghost ${d === k ? "is-on" : ""}`}><DevPic k={k} a={d === k ? a : 0.5} /><b>{k}</b></span>)}
          </div>
          <div className="wt-devknob">
            <Knob label={d === "filter" ? "cutoff" : d === "drive" ? "drive" : "amount"} value={a} onChange={v => { if (phase === "try") { setAmt(v); if (!playing) play(); } }} color={CAP.navy} size={64} height={150} led="var(--led-mint)" />
            {phase === "try" ? <button type="button" className="wt-key" onClick={toggle}><Icon name={playing ? "stop" : "play"} small />{playing ? "stop" : "play"}</button> : null}
          </div>
        </div>
      );
    }
    return null;
  })();

  return (
    <main className="m1-page wl wt2" data-step={at}>
      <div className="wl-top">
        {step > 0 ? <button type="button" className="fl-stepback" onClick={back} aria-label="Back"><Icon name="back" small />back</button> : <span />}
        <div className="wt-dots" aria-hidden>{["hello", ...PRODS, "you"].map((p, i) => <i key={p} className={(prod ? PRODS.indexOf(prod) + 1 : at === "you" ? 6 : 0) > i ? "is-done" : (prod ? PRODS.indexOf(prod) + 1 : at === "you" ? 6 : 0) === i ? "is-now" : ""} />)}</div>
        {step > 0 && at !== "you" ? <button type="button" className="fl-stepback" onClick={() => setStep(STEPS.length - 1)}>skip</button> : <span />}
      </div>

      <div className="wl-stage wt-screen" key={at}>
        {at === "hello" && (
          <>
            <div className="wt-text">
              <div className="wl-tag">ccd school</div>
              <h1 className="wt-hero">make your own song.<br />then play it out.</h1>
            </div>
            <div className="wt-show">{demo}</div>
            <div className="wt-foot">
              <div className="wl-go"><GoPill onClick={next} style={{ height: 72, width: "100%" }}>show me <Icon name="play" small /></GoPill></div>
              <a className="ls-skip" href="/dashboard">i&apos;ve been here before</a>
            </div>
          </>
        )}
        {prod && phase && (
          <>
            <div className="wt-text">
              <div className="wl-tag">{COPY[prod].name}</div>
              <h1 className="wt-big">{phase === "watch" ? COPY[prod].watch : "your turn"}</h1>
              <p className="wt-sub">{phase === "watch" ? COPY[prod].sub : COPY[prod].try}</p>
            </div>
            <div className="wt-show">{demo}</div>
            <div className="wt-foot"><div className="wl-go"><GoPill onClick={next} style={{ height: 64, width: "100%" }}>{phase === "watch" ? "try it" : prod === "library" ? "that's ccd school" : "next"}</GoPill></div></div>
          </>
        )}
        {at === "you" && (
          <div className="wt-text is-you">
            <div className="wl-tag">you</div>
            <h1 className="wt-big">two questions</h1>
            <p className="wt-q">what do you want to do?</p>
            <div className="wt-want" role="radiogroup" aria-label="What do you want to do">
              {WANT.map(o => <Pad key={o.id} lit={want === o.id ? "var(--led-mint)" : null} ariaPressed={want === o.id} onClick={() => setWant(o.id)} height={54}><span className="m1-t22" style={{ fontSize: 16, ...(want === o.id ? { color: "#06241B" } : {}) }}>{o.name}</span></Pad>)}
            </div>
            <p className="wt-q">done this before?</p>
            <div className="wt-want" role="radiogroup" aria-label="Done this before">
              {KNOW.map(o => (
                <Pad key={o.id} lit={know === o.id ? "var(--led-mint)" : null} ariaPressed={know === o.id} onClick={() => { setKnow(o.id); if (o.id === "lots") setPlacement(true); }} height={70} ariaLabel={`${o.name}: ${o.line}`}>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textAlign: "center", padding: "0 6px" }}>
                    <span className="m1-t22" style={{ fontSize: 15, ...(know === o.id ? { color: "#06241B" } : {}) }}>{o.name}</span>
                    <span className="m1-t11" style={know === o.id ? { color: "#0D2A22" } : undefined}>{o.line}</span>
                  </span>
                </Pad>
              ))}
            </div>
            <div className="wl-go"><GoPill onClick={go} disabled={!want || !know} style={{ height: 72, width: "100%" }}>{!want || !know ? "pick one of each" : <>take me in <Icon name="play" small /></>}</GoPill></div>
          </div>
        )}
      </div>
    </main>
  );
}

/** A small picture of what a device does to the sound, moving with its amount. */
function DevPic({ k, a }: { k: "filter" | "drive" | "echo"; a: number }) {
  const W = 72, H = 40;
  let d = "";
  if (k === "filter") { const fc = 10 + a * 52; d = `M2 14 H${fc} C${fc + 6} 14 ${fc + 8} ${H - 2} ${fc + 14} ${H - 2} H${W - 2}`; }
  if (k === "drive") { const g = 1 + a * 5; d = Array.from({ length: 37 }, (_, i) => { const t = i / 36; const y = Math.tanh(Math.sin(t * Math.PI * 4) * g) / Math.tanh(g); return `${i ? "L" : "M"}${(2 + t * (W - 4)).toFixed(1)} ${(H / 2 - y * (H / 2 - 4)).toFixed(1)}`; }).join(""); }
  if (k === "echo") { d = [0, 1, 2, 3].map(i => { const x = 6 + i * 16; const h = (H - 8) * Math.pow(0.25 + a * 0.6, i); return `M${x} ${H - 4}V${H - 4 - h}`; }).join(""); }
  return <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden className="wt-devpic"><path d={d} /></svg>;
}
