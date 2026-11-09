"use client";
/**
 * First visit (Param, 9 Nov night, second pass): a product overview made of the real app.
 * Nothing to do and nothing to tap through: each product gets two screens, each a short recording of
 * that part of ccd school working (scripts/shots/tour-clips.mjs records them, tour-encode.py cuts them),
 * with a heading and one line. hello, learn, practice, studio, dj decks, library, then two questions.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { DRUM_PAD_NOTES } from "@/engine";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { emptyTrackV2, newLayerV2, toV1View, type NoteEvent, type TrackV2 } from "@/lib/track2";
import { GoPill, Icon, Pad, Screen, Silk } from "./controls";
import { CAT_SRC, Lanes } from "./shell";
import "./lesson.css";
import "./welcome.css";

export const TOUR_KEY = "ccd.tour.first";
const Placement = dynamic(() => import("./Placement").then(m => m.Placement), { ssr: false });
type Prod = "learn" | "practice" | "studio" | "dj" | "library";
const PRODS: Prod[] = ["learn", "practice", "studio", "dj", "library"];
const STEPS = ["hello", ...PRODS.flatMap(p => [`${p}:a`, `${p}:b`]), "you"] as const;
const NAME: Record<Prod, string> = { learn: "learn", practice: "practice", studio: "studio", dj: "dj decks", library: "library" };
const CLIP: Record<string, { h: string; line: string }> = {
  "learn:a": { h: "learn by making a song", line: "short lessons. each one adds a part to a song that's yours." },
  "learn:b": { h: "then shape what you made", line: "every knob you meet is explained on the screen as you turn it." },
  "practice:a": { h: "practice five minutes a day", line: "ear training, picked from what your lessons have taught you." },
  "practice:b": { h: "copy by ear", line: "hear a part, write it on the grid, see what you got right." },
  "studio:a": { h: "build it out in the studio", line: "drum pads, keys and knobs, all playing your song." },
  "studio:b": { h: "arrange it, then take it to Live", line: "copy your loop into sections, then send the song to Ableton Live." },
  "dj:a": { h: "play it out on the decks", line: "two decks and a mixer, laid out like a real dj controller." },
  "dj:b": { h: "mix with eq and tempo", line: "line up the tempo, swap the bass, slide from one track to the next." },
  "library:a": { h: "every device in Live", line: "search by name, or by what you want to hear: warmer, wider, more space." },
  "library:b": { h: "play with any of them", line: "each one opens on a loop. turn a knob and hear what it does." },
};
const src = (k: string) => `/tour/${k.replace(":", "-")}`;

type Want = "make" | "dj" | "both";
type Know = "new" | "some" | "lots";
const WANT: { id: Want; name: string }[] = [{ id: "make", name: "make tracks" }, { id: "dj", name: "dj" }, { id: "both", name: "both" }];
const KNOW: { id: Know; name: string; line: string }[] = [
  { id: "new", name: "completely new", line: "start with the basics" },
  { id: "some", name: "a little", line: "straight to the good part" },
  { id: "lots", name: "test me", line: "find my level" },
];
const worldFor = (want: Want | null, know: Know | null) => (know === "new" ? "fundamentals" : want === "dj" ? "dj" : "producer") as "fundamentals" | "producer" | "dj";

const K = DRUM_PAD_NOTES[0], CLAP = DRUM_PAD_NOTES[2], OPEN = DRUM_PAD_NOTES[5];
const hit = (note: number, starts: number[], vel = 0.9, len = 0.2): NoteEvent[] => starts.map(start => ({ note, vel, start, len }));

/** hello's picture: your song filling up, part by part (the real lanes from the home screen). */
function song(parts: number): TrackV2 {
  const t = { ...emptyTrackV2(), bpm: 122, loop: 8 };
  const d = newLayerV2("drums"); d.events = [...hit(K, [0, 1, 2, 3, 4, 5, 6, 7]), ...(parts > 1 ? hit(CLAP, [1, 3, 5, 7], 0.75) : [])];
  const h = newLayerV2("hats"); h.events = hit(OPEN, [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5], 0.6);
  const l = newLayerV2("lead"); l.events = [[57, 0], [60, 1.5], [64, 3], [62, 4], [60, 5.5], [57, 7]].map(([note, start]) => ({ note, start, vel: 0.8, len: 1 }));
  return { ...t, layers: [d, ...(parts > 2 ? [h] : []), ...(parts > 3 ? [l] : [])] };
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


/** One recording of the real app: plays inline and loops, muted until you turn the sound on.
 *  With reduced motion it waits for a tap. */
function Clip({ k, sound, onSound }: { k: string; sound: boolean; onSound: () => void }) {
  const [still, setStill] = useState(false);
  useEffect(() => setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return (
    <div className="wt-phone">
      <video key={k} className="wt-video" src={`${src(k)}.mp4`} poster={`${src(k)}.jpg`} muted={!sound} playsInline loop autoPlay={!still} controls={still} preload="auto" aria-label={`${CLIP[k].h}: a recording of ccd school`} />
      <button type="button" className={`wt-sound ${sound ? "is-on" : ""}`} aria-pressed={sound} onClick={onSound}>
        <i aria-hidden />{sound ? "sound on" : "sound off"}
      </button>
    </div>
  );
}

export function Welcome({ onLeave }: { onLeave?: () => void }) {
  const [step, setStep] = useState(0);
  const [want, setWant] = useState<Want | null>(null);
  const [know, setKnow] = useState<Know | null>(null);
  const [placement, setPlacement] = useState(false);
  const [sound, setSound] = useState(false);
  const { setOnboarding } = useProgress();
  const { setLearnMode } = useLearnMode();
  const router = useRouter();
  const at = STEPS[step];
  const prod = at.includes(":") ? (at.split(":")[0] as Prod) : null;
  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));
  const tick = useTick(380, at === "hello");
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") back(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
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

  const head = (tick * 2) % 16;
  const helloParts = 1 + Math.min(3, Math.floor((tick % 24) / 5));
  const group = prod ? PRODS.indexOf(prod) + 1 : at === "you" ? 6 : 0;
  const nextKey = STEPS[step + 1];

  return (
    <main className="m1-page wl wt2 wt3" data-step={at}>
      <div className="wl-top">
        {step > 0 ? <button type="button" className="fl-stepback" onClick={back} aria-label="Back"><Icon name="back" small />back</button> : <span />}
        <div className="wt-dots" aria-label={`part ${group + 1} of 7`}>{["hello", ...PRODS, "you"].map((p, i) => <i key={p} className={group > i ? "is-done" : group === i ? "is-now" : ""} />)}</div>
        {step > 0 && at !== "you" ? <button type="button" className="fl-stepback" onClick={() => setStep(STEPS.length - 1)}>skip</button> : <span />}
      </div>

      <div className="wl-stage wt-screen" key={at}>
        {at === "hello" && (
          <>
            <div className="wt-text">
              <h1 className="wt-hero">make your own song.<br />then play it out.</h1>
              <p className="wt-sub">ccd school teaches music production and djing on real instruments, in your browser.</p>
            </div>
            <div className="wt-show">
              <Screen className="wt-stage is-hello">
                <div className="wt-hellolanes"><Lanes track={toV1View(song(helloParts))} playhead={head} /></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CAT_SRC} alt="" className="m1-dancing wt-hellocat" />
              </Screen>
            </div>
            <div className="wt-foot">
              <div className="wl-go"><GoPill onClick={next} style={{ height: 72, width: "100%" }}>see how it works <Icon name="play" small /></GoPill></div>
              <a className="ls-skip" href="/dashboard">i&apos;ve been here before</a>
            </div>
          </>
        )}
        {prod && (
          <>
            <div className="wt-text">
              <Silk label={NAME[prod]} right={at.endsWith(":a") ? "1 of 2" : "2 of 2"} />
              <h1 className="wt-big">{CLIP[at].h}</h1>
              <p className="wt-sub">{CLIP[at].line}</p>
            </div>
            <div className="wt-show"><Clip k={at} sound={sound} onSound={() => setSound(v => !v)} /></div>
            <div className="wt-foot"><div className="wl-go"><GoPill onClick={next} style={{ height: 64, width: "100%" }}>{at === "library:b" ? "that's ccd school" : "next"}</GoPill></div></div>
            {nextKey && nextKey.includes(":") ? <link rel="prefetch" href={`${src(nextKey)}.mp4`} /> : null}
          </>
        )}
        {at === "you" && (
          <div className="wt-text is-you">
            <h1 className="wt-big">two questions, then you&apos;re in</h1>
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
