"use client";
/**
 * First visit to ccdschool.com: a short walk into the first lesson, one question per screen.
 * The first tap starts a kick, so sound is already on when the lesson opens (browsers need that tap).
 * hello → what do you want to make → how much do you know → how should we explain → your first lesson.
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { FLAG, OUT } from "@/engine";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { usePrefs, type Voice } from "@/lib/prefs";
import { PlacementTest } from "@/components/PlacementTest";
import { clipVariants } from "@/content/lessons/clipTracks";
import { missionBySlug } from "@/content/missions";
import { type WorldId } from "@/lib/worldOrder";
import { GoPill, Icon, Pad, Screen, Silk } from "./controls";
import { CAT_SRC } from "./shell";
import { useEngineTrack } from "./useEngineTrack";
import "./lesson.css";

type Know = "new" | "some" | "lots";
const MAKE: { id: WorldId; name: string; line: string; first: string; led: string }[] = [
  { id: "producer", name: "make my own tracks", line: "build a song from a kick drum up, one part per lesson", first: "your-kick", led: "#FF5FA4" },
  { id: "dj", name: "dj", line: "mix records, beatmatch, read a room", first: "what-is-djing", led: "#7D96FF" },
  { id: "fundamentals", name: "not sure yet", line: "start with how music works: sound, rhythm, melody", first: "what-is-sound", led: "#5EEAC1" },
];
const KNOW: { id: Know; name: string; line: string }[] = [
  { id: "new", name: "completely new", line: "never made or mixed music" },
  { id: "some", name: "a little", line: "played around with an app or a controller" },
  { id: "lots", name: "i know my way around", line: "find my level with a few quick questions" },
];
const WAYS: { id: Voice; name: string; line: string }[] = [
  { id: "mentor", name: "explain it properly", line: "the full picture, the first time" },
  { id: "straight", name: "keep it short", line: "just the point, i'll ask if i need more" },
  { id: "eli5", name: "keep it really simple", line: "plain words, everyday examples" },
];
const STEPS = ["hello", "make", "know", "explain", "ready"] as const;

function Choice<T extends string>({ items, value, onPick, led }: { items: { id: T; name: string; line: string }[]; value: T | null; onPick: (id: T) => void; led: string }) {
  return (
    <div style={{ display: "grid", gap: 8 }} role="radiogroup">
      {items.map(p => (
        <Pad key={p.id} lit={value === p.id ? led : null} ariaPressed={value === p.id} onClick={() => onPick(p.id)} height={68} ariaLabel={`${p.name}: ${p.line}`}>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "0 14px", width: "100%", textAlign: "left" }}>
            <span className="m1-t22" style={{ fontSize: 18, ...(value === p.id ? { color: "#06241B" } : {}) }}>{p.name}</span>
            <span className="m1-t11" style={value === p.id ? { color: "#0D2A22" } : undefined}>{p.line}</span>
          </span>
        </Pad>
      ))}
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
  const make = MAKE.find(m => m.id === world) ?? MAKE[0];
  const first = missionBySlug(make.first);

  // A kick, so the very first tap is also the one that turns sound on.
  const kick = useMemo(() => clipVariants("kick-alone")[0].track, []);
  const { engine, ready } = useEngineTrack(kick);
  const [playing, setPlaying] = useState(false);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setPlaying(!!(e.flags & FLAG.playing)); }), [engine]);
  const sound = (on: boolean) => { if (!on) { engine.stop(); return; } void ready().then(() => { engine.metronome(false); engine.play(); }).catch(() => { /* no audio here */ }); };

  const go = (slug: string) => {
    engine.stop();
    onLeave?.();
    setOnboarding(make.id, know === "lots" ? "hard" : "normal");
    setLearnMode("flow");
    router.push(`/learn/${slug}`);
  };
  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  if (placement) return <PlacementTest world={make.id} onSkip={() => setPlacement(false)} onComplete={slug => go(slug)} />;

  const at = STEPS[step];
  return (
    <main className="m1-page wl" data-step={at}>
      <div className="wl-top">
        {step > 0 ? <button type="button" className="fl-stepback" onClick={back} aria-label="Back"><Icon name="back" small />back</button> : <span />}
        <div className="ls-seg" aria-hidden style={{ ["--c" as string]: "var(--led-go)" } as CSSProperties}>{STEPS.map((_, i) => <i key={i} className={i < step ? "is-done" : i === step ? "is-now" : ""} />)}</div>
        {step > 0 ? <button type="button" className="fl-stepback" onClick={() => sound(!playing)} aria-label={playing ? "Stop the kick" : "Play the kick"}>{playing ? "sound on" : "sound off"}</button> : <span />}
      </div>

      <Screen style={{ marginTop: 6 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" className={playing ? "m1-dancing" : ""} style={{ position: "absolute", right: 14, top: 12, width: 76 }} />
        {at === "hello" && <><div className="m1-ss">hello. this is ccd school.</div><h1 className="m1-t36" style={{ marginTop: 8, maxWidth: 230 }}>make music while you learn it</h1><div className="m1-ss" style={{ marginTop: 10 }}>free · on your phone or laptop · nothing to download</div></>}
        {at === "make" && <><div className="m1-ss">that thump is a kick drum. it&apos;s where songs start.</div><h1 className="m1-t36 wl-q">what do you want to make?</h1></>}
        {at === "know" && <><div className="m1-ss">so we start in the right place</div><h1 className="m1-t36 wl-q">how much have you done before?</h1></>}
        {at === "explain" && <><div className="m1-ss">you can change this on any step, any time</div><h1 className="m1-t36 wl-q">how should we explain things?</h1></>}
        {at === "ready" && <><div className="m1-ss">your first lesson · about {first?.fromFile?.minutes ?? 8} minutes</div><h1 className="m1-t36 wl-q">{(first?.title ?? "lesson one").toLowerCase()}</h1><div className="m1-ss" style={{ marginTop: 10, maxWidth: 260 }}>{first?.fromFile?.learn ?? first?.tagline ?? ""}</div></>}
      </Screen>

      {at === "hello" && (
        <>
          <Silk label="how it works" />
          <ol className="wl-how">
            <li><b>1</b><span><strong>learn one idea at a time</strong>explained properly, with sound on every step</span></li>
            <li><b>2</b><span><strong>play it yourself</strong>on real instruments, right in the lesson</span></li>
            <li><b>3</b><span><strong>it goes into your song</strong>every lesson adds a part. by the end it&apos;s a track</span></li>
          </ol>
          <div className="wl-go"><GoPill onClick={() => { sound(true); next(); }} style={{ height: 72, width: "100%" }} ariaLabel="Let's go, with sound">let&apos;s go, sound on <Icon name="play" small /></GoPill></div>
          <a className="ls-skip" href="/worlds">i&apos;ve been here before · see all lessons</a>
        </>
      )}
      {at === "make" && <Choice items={MAKE} value={world} onPick={id => { setWorld(id); next(); }} led="var(--led-go)" />}
      {at === "know" && <Choice items={KNOW} value={know} onPick={id => { setKnow(id); next(); }} led="var(--led-go)" />}
      {at === "explain" && <Choice items={WAYS} value={prefs.voice} onPick={id => { setPrefs({ voice: id }); next(); }} led="var(--led-go)" />}
      {at === "ready" && (
        <>
          <Silk label="what happens next" />
          <ol className="wl-how">
            <li><b>1</b><span><strong>you hear it</strong>the sound starts as soon as the lesson opens</span></li>
            <li><b>2</b><span><strong>you play it and shape it</strong>then it goes into your song</span></li>
            <li><b>3</b><span><strong>a few questions, if you want them</strong>skip any time</span></li>
          </ol>
          <div className="wl-go"><GoPill onClick={() => go(make.first)} style={{ height: 72, width: "100%" }} ariaLabel="Start the first lesson">start lesson one <Icon name="play" small /></GoPill></div>
          {know === "lots" && <button type="button" className="ls-skip" onClick={() => setPlacement(true)}>or find my level first</button>}
        </>
      )}
    </main>
  );
}
