"use client";
/**
 * First visit (10 Nov): the walkthrough the front page's "start your song" opens. Each part of ccd school gets
 * two screens, each a short recording of the real app (scripts/shots/tour-clips.mjs records them, tour-encode.py
 * cuts them) with a heading, one line and its steps lit as they happen. When a clip ends the next one starts,
 * so it plays through like a film; space or a tap on the clip pauses it. Then two questions.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { GoPill, Icon, Pad, Silk } from "./controls";
import "./lesson.css";
import "./welcome.css";

export const TOUR_KEY = "ccd.tour.first";
const Placement = dynamic(() => import("./Placement").then(m => m.Placement), { ssr: false });
type Prod = "learn" | "practice" | "studio" | "dj" | "library";
const PRODS: Prod[] = ["learn", "practice", "studio", "dj", "library"];
const STEPS = [...PRODS.flatMap(p => [`${p}:a`, `${p}:b`]), "you"] as const;
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

type Caps = Record<string, { dur: number; steps: { t: number; text: string }[] }>;

/** One recording of the real app. Plays once, muted until you turn the sound on, and reports its time so the steps
 *  beside it light up as they happen; when it ends the walkthrough moves on. Tap it to pause. With reduced motion it
 *  waits for you to press play. */
function Clip({ k, sound, paused, onSound, onPause, onTime, onEnd }: { k: string; sound: boolean; paused: boolean; onSound: () => void; onPause: () => void; onTime: (t: number, dur: number) => void; onEnd: () => void }) {
  const [still, setStill] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  useEffect(() => {
    let raf = 0;
    const tick = () => { const v = ref.current; if (v) onTime(v.currentTime, v.duration || 0); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [k, onTime]);
  useEffect(() => { const v = ref.current; if (!v || still) return; if (paused) v.pause(); else void v.play().catch(() => {}); }, [paused, still, k]);
  return (
    <div className={`wt-phone ${paused ? "is-paused" : ""}`}>
      <video ref={ref} key={k} className="wt-video" src={`${src(k)}.mp4`} poster={`${src(k)}.jpg`} muted={!sound} playsInline autoPlay={!still} controls={still} preload="auto"
        onEnded={() => { if (!still) onEnd(); }} onClick={still ? undefined : onPause} aria-label={`${CLIP[k].h}: a recording of ccd school`} />
      {paused ? <span className="wt-paused" aria-hidden><Icon name="play" /></span> : null}
      <div className="wt-keys">
        {still ? null : <button type="button" className="wt-sound" aria-pressed={paused} onClick={onPause}>{paused ? "play" : "pause"}</button>}
        <button type="button" className={`wt-sound ${sound ? "is-on" : ""}`} aria-pressed={sound} onClick={onSound}><i aria-hidden />{sound ? "sound on" : "sound off"}</button>
      </div>
    </div>
  );
}

/** The walkthrough beside a clip: every step it shows, the one happening now lit. */
function Steps({ steps, now }: { steps: { t: number; text: string }[]; now: number }) {
  if (!steps.length) return null;
  return (
    <ol className="wt-steps" aria-label="What happens in this clip">
      {steps.map((st, i) => <li key={i} className={i === now ? "is-now" : i < now ? "is-done" : ""}><i aria-hidden />{st.text}</li>)}
    </ol>
  );
}

export function Welcome({ onLeave }: { onLeave?: () => void }) {
  const [step, setStep] = useState(0);
  const [want, setWant] = useState<Want | null>(null);
  const [know, setKnow] = useState<Know | null>(null);
  const [placement, setPlacement] = useState(false);
  const [sound, setSound] = useState(false);
  const [paused, setPaused] = useState(false);
  const [caps, setCaps] = useState<Caps>({});
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  useEffect(() => { void fetch("/tour/captions.json").then(r => (r.ok ? r.json() : {})).then(setCaps).catch(() => {}); }, []);
  const onTime = useCallback((t: number, d: number) => { setTime(x => (Math.abs(x - t) > 0.05 ? t : x)); setDur(x => (d && Math.abs(x - d) > 0.05 ? d : x)); }, []);
  const { setOnboarding } = useProgress();
  const { setLearnMode } = useLearnMode();
  const router = useRouter();
  const at = STEPS[step];
  const prod = at.includes(":") ? (at.split(":")[0] as Prod) : null;
  const goto = useCallback((n: number) => { setStep(Math.max(0, Math.min(STEPS.length - 1, n))); setTime(0); setDur(0); setPaused(false); }, []);
  const stepRef = useRef(0);
  stepRef.current = step;
  const next = useCallback(() => goto(stepRef.current + 1), [goto]);
  const back = useCallback(() => goto(stepRef.current - 1), [goto]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.("input,textarea,button,a")) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
      if (e.key === " ") { e.preventDefault(); setPaused(p => !p); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [next, back]);

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

  const group = prod ? PRODS.indexOf(prod) : PRODS.length;
  const fill = prod ? ((at.endsWith(":b") ? 1 : 0) + (dur ? Math.min(1, time / dur) : 0)) / 2 : 0;
  const nextKey = STEPS[step + 1];
  const stepsNow = caps[at.replace(":", "-")]?.steps ?? [];
  const stepNow = stepsNow.reduce((n, st, i) => (time + 0.05 >= st.t ? i : n), 0);

  return (
    <main className="m1-page wl wt2 wt3 wt4" data-step={at}>
      <div className="wl-top">
        {step > 0 ? <button type="button" className="fl-stepback" onClick={back} aria-label="Back"><Icon name="back" small />back</button> : <Link className="fl-stepback" href="/" aria-label="Back to the front page"><Icon name="back" small />back</Link>}
        <div className="wt-dots" role="img" aria-label={`part ${group + 1} of ${PRODS.length + 1}`}>
          {[...PRODS, "you"].map((p, i) => (
            <button key={p} type="button" className={group > i ? "is-done" : group === i ? "is-now" : ""} onClick={() => goto(i < PRODS.length ? i * 2 : STEPS.length - 1)} aria-label={p === "you" ? "two questions" : NAME[p as Prod]}>
              <i style={group === i && prod ? { width: `${fill * 100}%` } : undefined} />
            </button>
          ))}
        </div>
        {at !== "you" ? <button type="button" className="fl-stepback" onClick={() => goto(STEPS.length - 1)}>skip</button> : <span />}
      </div>

      <div className="wl-stage wt-screen" key={at}>
        {prod && (
          <>
            <div className="wt-text">
              <Silk label={NAME[prod]} right={at.endsWith(":a") ? "1 of 2" : "2 of 2"} />
              <h1 className="wt-big">{CLIP[at].h}</h1>
              <p className="wt-sub">{CLIP[at].line}</p>
              <Steps steps={stepsNow} now={stepNow} />
            </div>
            <div className="wt-show"><Clip k={at} sound={sound} paused={paused} onSound={() => setSound(v => !v)} onPause={() => setPaused(v => !v)} onTime={onTime} onEnd={next} /><p className="wt-now" key={`${at}-${stepNow}`} aria-live="polite">{stepsNow[stepNow]?.text ?? ""}</p></div>
            <div className="wt-foot">
              <div className="wl-go"><GoPill onClick={next} style={{ height: 60, width: "100%" }}>{at === "library:b" ? "that's ccd school" : "next"}</GoPill></div>
              <p className="wt-hint">{paused ? <>paused. tap the clip<span className="wt-kb"> or press space</span> to carry on.</> : <>the next one starts by itself. tap the clip<span className="wt-kb"> or press space</span> to pause.</>}</p>
            </div>
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
