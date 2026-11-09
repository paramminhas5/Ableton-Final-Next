"use client";
/**
 * First visit (Param, 9 Nov evening): a tour of what ccd school is, product by product, not a task.
 * Each screen is one product: its name, what it is, why it's the best at it, and the real thing working under it
 * (touch it and it plays; there's nothing to finish). Then two questions on one screen, then home, where the
 * home walkthrough points out each part. Your first kick is made in lesson 1, where it belongs.
 * Sound only after a touch.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FLAG, OUT, LAYER_PARAMS, LEAD_PARAMS, DRUM_PAD_NOTES } from "@/engine";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { emptyTrackV2, newLayerV2, toV1View, type NoteEvent, type TrackV2 } from "@/lib/track2";
import { getCtx } from "@/lib/audio";
import { lookupTerm } from "@/content/glossary";
import { journey, worldSteps, type WorldId } from "@/lib/worldOrder";
import { GoPill, Icon, Key, Knob, CAP, LED, Pad, Screen } from "./controls";
import { CAT_SRC, Lanes } from "./shell";
import { useEngineTrack } from "./useEngineTrack";
import { WaveShape } from "./LessonVisuals";
import { DeckRig, type Chan } from "./DeckRig";
import "./lesson.css";
import "./welcome.css";

export const TOUR_KEY = "ccd.tour.first";
const Placement = dynamic(() => import("./Placement").then(m => m.Placement), { ssr: false });
const STEPS = ["hello", "learn", "practice", "studio", "dj", "library", "you"] as const;
type At = (typeof STEPS)[number];
const NAME: Record<At, string> = { hello: "ccd school", learn: "learn", practice: "practice", studio: "studio", dj: "dj decks", library: "library", you: "you" };

type Want = "make" | "dj" | "both";
type Know = "new" | "some" | "lots";
const WANT: { id: Want; name: string }[] = [{ id: "make", name: "make tracks" }, { id: "dj", name: "dj" }, { id: "both", name: "both" }];
const KNOW: { id: Know; name: string; line: string }[] = [
  { id: "new", name: "completely new", line: "we start with the basics" },
  { id: "some", name: "a little", line: "straight to the good part" },
  { id: "lots", name: "test me", line: "a few minutes, we find your level" },
];
const worldFor = (want: Want | null, know: Know | null): WorldId => (know === "new" ? "fundamentals" : want === "dj" ? "dj" : "producer");

// ── little tracks the tour plays ─────────────────────────────────────────────
const CH: Chan = { trim: 0.5, hi: 0.5, mid: 0.5, low: 0.5, filter: 0.5, fader: 0.8, phones: false, level: 0 };
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

/** One product: its name, what it is, why it's the best at it, the real thing, and the next key. */
function Product({ n, at, title, line, best, children, next }: { n: number; at: At; title: string; line: string; best: string; children: ReactNode; next: ReactNode }) {
  return (
    <div className="wl-part wt-prod" data-at={at}>
      <div className="wl-tag"><b>{n}</b>{NAME[at]}</div>
      <h1 className="wl-big">{title}</h1>
      <p className="wl-lead">{line}</p>
      <p className="wt-best"><Icon name="check" small />{best}</p>
      <div className="wl-try">{children}</div>
      {next}
    </div>
  );
}

export function Welcome({ onLeave }: { onLeave?: () => void }) {
  const [step, setStep] = useState(0);
  const [want, setWant] = useState<Want | null>(null);
  const [know, setKnow] = useState<Know | null>(null);
  const [placement, setPlacement] = useState(false);
  const { setOnboarding } = useProgress();
  const { setLearnMode } = useLearnMode();
  const router = useRouter();
  const at: At = STEPS[step];
  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));
  const sizes = useMemo(() => (["fundamentals", "producer", "dj"] as WorldId[]).map(w => ({ w, song: worldSteps(w).length, deeper: journey(w, {}).reduce((n, p) => n + p.extraTotal, 0) })), []);

  // the tour's sound: only after a tap
  const [parts, setParts] = useState(2);
  const [cut, setCut] = useState(0.3);
  const [x, setX] = useState(0);
  const track = useMemo(() => (at === "dj" ? decks(x) : song(at === "studio" ? 4 : parts, at === "studio" ? cut : 0.5)), [at, parts, cut, x]);
  const { engine, ready } = useEngineTrack(track);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { engine.stop(); }, [step, engine]);
  const playing = beat >= 0;
  const play = () => void ready().then(() => { engine.metronome(false); engine.play(); });
  const toggle = () => (playing ? engine.stop() : play());
  const [ear, setEar] = useState<{ hi: 0 | 1; picked: number | null }>({ hi: 1, picked: null });
  useEffect(() => setEar({ hi: Math.random() < 0.5 ? 0 : 1, picked: null }), []);
  const pair = () => { const a = 57, b = 64; tone(ear.hi === 0 ? b : a, 0); tone(ear.hi === 0 ? a : b, 0.7); };
  const [q, setQ] = useState("sidechain");
  const entry = lookupTerm(q.trim()) ?? null;
  useEffect(() => {
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
    // Placed past the basics: the whole instrument from the start (simple or everything, 9 Nov).
    try { localStorage.setItem("ccd.everything", "1"); } catch { /* ignore */ }
    router.push(`/learn/${slug}`);
  }} />;

  const loop = track.loop || 8;
  const head = playing ? Math.floor(((((beat % loop) + loop) % loop) / loop) * 16) : -1;
  const nextKey = (label: string) => <div className="wl-go"><GoPill onClick={next} style={{ height: 64, width: "100%" }}>{label}</GoPill></div>;
  return (
    <main className="m1-page wl wn wt" data-step={at}>
      <div className="wl-top">
        {step > 0 ? <button type="button" className="fl-stepback" onClick={back} aria-label="Back"><Icon name="back" small />back</button> : <span />}
        <div className="ls-seg" aria-hidden style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties}>{STEPS.map((_, i) => <i key={i} className={i < step ? "is-done" : i === step ? "is-now" : ""} />)}</div>
        {step > 0 && at !== "you" ? <button type="button" className="fl-stepback" onClick={() => setStep(STEPS.length - 1)}>skip</button> : <span />}
      </div>

      <div className="wl-stage" key={at}>
        {at === "hello" && (
          <div className="wn-map">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CAT_SRC} alt="" className="m1-dancing wn-cat" />
            <div className="wl-tag">ccd school · by cats can dance</div>
            <h1 className="wl-hero">learn music<br />by making it.</h1>
            <p className="wl-lead">from your first kick drum to a track of your own, played out at a ccd night. five things, one song:</p>
            <ol className="wt-five">
              {([["learn", "lessons that build your song"], ["practice", "get better, three minutes a day"], ["studio", "make tracks, send them to Ableton Live"], ["dj decks", "play your song out"], ["library", "every word and sound, explained"]] as const).map(([n, l], i) => (
                <li key={n} style={{ animationDelay: `${200 + i * 90}ms` }}><b>{i + 1}</b><span>{n}<small>{l}</small></span></li>
              ))}
            </ol>
            <div className="wl-go"><GoPill onClick={next} style={{ height: 72, width: "100%" }}>show me around <Icon name="play" small /></GoPill></div>
            <a className="ls-skip" href="/dashboard">i&apos;ve been here before</a>
          </div>
        )}

        {at === "learn" && (
          <Product n={1} at="learn" title="lessons that build your song" line="short lessons, one idea a step. every lesson ends with a new part in a song that's yours."
            best="each step is explained three ways, your song is always on top, and every fact is checked against the real manuals."
            next={nextKey("next: practice")}>
            <Screen>
              <div className="wl-meta"><span>your song</span><span>{parts} of 4 parts</span></div>
              <div className="wl-lanes"><Lanes track={toV1View(track)} playhead={head} /></div>
            </Screen>
            <div className="wl-row">
              <button type="button" className="ls-chip" onClick={toggle}>{playing ? "stop" : "play the song"}</button>
              {parts < 4 && <button type="button" className="ls-chip" onClick={() => { setParts(p => p + 1); play(); }}>a lesson adds {["", "", "hats", "a synth line"][parts]}</button>}
            </div>
            <div className="wt-worlds">
              {sizes.map(s => <span key={s.w} className={`wn-band is-${s.w}`}><b>{s.w === "fundamentals" ? "basics" : s.w}</b><small>{s.song} lessons · {s.deeper} deeper</small></span>)}
            </div>
          </Product>
        )}

        {at === "practice" && (
          <Product n={2} at="practice" title="get better, three minutes a day" line="ear games, reviews of what you learnt, and match-this-sound, picked for your level."
            best="every round is played on our engine from your own lessons, so what you practise is what you made."
            next={nextKey("next: studio")}>
            <Screen>
              <div className="wl-meta"><span>ear gym · higher or lower</span><span>{ear.picked === null ? "listen, then pick" : ""}</span></div>
              <button type="button" className="ls-chip" style={{ marginTop: 12 }} onClick={pair}>play the two notes</button>
              <div className="wl-row" style={{ marginTop: 12 }}>
                {["first", "second"].map((l, i) => (
                  <button key={l} type="button" className={`wl-ans ${ear.picked === null ? "" : i === ear.hi ? "is-right" : ear.picked === i ? "is-wrong" : ""}`} onClick={() => setEar(e => ({ ...e, picked: i }))}>{l} was higher</button>
                ))}
              </div>
            </Screen>
          </Product>
        )}

        {at === "studio" && (
          <Product n={3} at="studio" title="make tracks, send them to Live" line="build your song out on real instruments: pads, keys, knobs. then export it to Ableton Live in one tap."
            best="a real sound engine in your browser, every control named the way Live names it."
            next={nextKey("next: dj decks")}>
            <Screen>
              <div className="wl-meta"><span>studio · synth</span><span>brightness {Math.round(cut * 100)}%</span></div>
              <WaveShape morph={0} bright={cut} cycles={3} playing={playing} />
            </Screen>
            <div className="wt-studio">
              <div style={{ width: 120 }}><Knob label="brightness" value={cut} onChange={v => { setCut(v); if (!playing) play(); }} color={CAP.navy} size={62} height={140} led="var(--led-mint)" /></div>
              <Key label={playing ? "stop" : "play"} onClick={toggle} ariaLabel={playing ? "Stop" : "Play"}><Icon name={playing ? "stop" : "play"} /></Key>
              <Key label="to live" onClick={() => {}} ariaLabel="To Ableton Live (in the studio)"><Icon name="out" /></Key>
            </div>
          </Product>
        )}

        {at === "dj" && (
          <Product n={4} at="dj" title="play your song out" line="two decks and a mixer, laid out like a real dj controller. your song on one deck, another track on the other."
            best="you learn on the same layout as the controllers in the booth, so the skills carry over."
            next={nextKey("next: library")}>
            <div className="wt-dj">
              <DeckRig
                decks={[
                  { id: "a", title: "deck a", sub: "a beat", color: LED.mint, playing, bpm: 124, pitch: 0, synced: false },
                  { id: "b", title: "deck b", sub: "a melody", color: LED.cobalt, playing, bpm: 124, pitch: 0, synced: false },
                ]}
                chans={[{ ...CH, level: playing ? 1 - x : 0 }, { ...CH, level: playing ? x : 0 }]}
                xf={x} show={new Set()} screen={null}
                onPlay={toggle} onCue={() => engine.stop()} onChan={() => {}}
                onXf={v => { setX(v); if (!playing) play(); }} />
            </div>
            <p className="m1-t11" style={{ textAlign: "center", margin: 0 }}>press play, then slide the crossfader from a to b</p>
          </Product>
        )}

        {at === "library" && (
          <Product n={5} at="library" title="better than any manual" line="every word from Live, rekordbox and synths, explained simply, with the lesson that teaches it."
            best="every word you meet in a lesson is kept for you, so the library becomes your own notes."
            next={nextKey("that's ccd school")}>
            <Screen>
              <label className="wt-search"><Icon name="search" /><span className="sr-only">Search the library</span>
                <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="try: sidechain, swing, eq" />
              </label>
              {entry ? <div className="wt-entry"><b>{entry.term.toLowerCase()}</b><p>{entry.def}</p></div> : <p className="m1-ss" style={{ marginTop: 10 }}>{q.trim() ? "try another word: reverb, swing, eq" : ""}</p>}
            </Screen>
          </Product>
        )}

        {at === "you" && (
          <div className="wl-part">
            <div className="wl-tag"><b>6</b>you</div>
            <h1 className="wl-big">two questions</h1>
            <p className="wl-lead">so your first lesson is the right one. everything stays open.</p>
            <p className="wt-q">what do you want to do?</p>
            <div className="wt-want" role="radiogroup" aria-label="What do you want to do">
              {WANT.map(o => <Pad key={o.id} lit={want === o.id ? "var(--led-mint)" : null} ariaPressed={want === o.id} onClick={() => setWant(o.id)} height={54}><span className="m1-t22" style={{ fontSize: 16, ...(want === o.id ? { color: "#06241B" } : {}) }}>{o.name}</span></Pad>)}
            </div>
            <p className="wt-q">done this before?</p>
            <div className="wl-choices" role="radiogroup" aria-label="Done this before">
              {KNOW.map(o => (
                <Pad key={o.id} lit={know === o.id ? "var(--led-mint)" : null} ariaPressed={know === o.id} onClick={() => { setKnow(o.id); if (o.id === "lots") setPlacement(true); }} height={60} ariaLabel={`${o.name}: ${o.line}`}>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, padding: "0 16px", width: "100%", textAlign: "left" }}>
                    <span className="m1-t22" style={{ fontSize: 17, ...(know === o.id ? { color: "#06241B" } : {}) }}>{o.name}</span>
                    <span className="m1-t11" style={know === o.id ? { color: "#0D2A22" } : undefined}>{o.line}</span>
                  </span>
                </Pad>
              ))}
            </div>
            <div className="wl-go"><GoPill onClick={go} disabled={!want || !know} style={{ height: 72, width: "100%" }}>{!want ? "pick what you want to do" : !know ? "pick how much you've done" : <>take me in <Icon name="play" small /></>}</GoPill></div>
          </div>
        )}
      </div>
    </main>
  );
}
