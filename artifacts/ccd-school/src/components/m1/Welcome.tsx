"use client";
/**
 * First visit to ccdschool.com: what ccd school is, how its parts fit together, then three quick
 * questions and the first lesson. Silent: sound only plays in lessons or when you play something.
 * hello → how it fits → where to start → how much you know → how you like to learn → your first lesson.
 */
import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { usePrefs, type Voice } from "@/lib/prefs";
import { PlacementTest } from "@/components/PlacementTest";
import { missionBySlug } from "@/content/missions";
import { type WorldId } from "@/lib/worldOrder";
import { GoPill, Icon, Pad, Screen, Silk } from "./controls";
import { CAT_SRC } from "./shell";
import "./lesson.css";

type Know = "new" | "some" | "lots";
const MAKE: { id: WorldId; name: string; line: string; first: string; led: string }[] = [
  { id: "fundamentals", name: "start from the basics", line: "how sound and music work. the best place to begin", first: "what-is-sound", led: "#5EEAC1" },
  { id: "producer", name: "make my own tracks", line: "build a song from a kick drum up, one part per lesson", first: "your-kick", led: "#FF5FA4" },
  { id: "dj", name: "mix tracks as a dj", line: "beatmatch, blend, read a room. later, your own tracks", first: "what-is-djing", led: "#7D96FF" },
];
const PARTS: [string, string][] = [
  ["learn", "short lessons that explain one idea at a time, with sound"],
  ["make", "every lesson adds a part to your own song, from the first kick"],
  ["practice", "ear training and quick reviews so it sticks"],
  ["studio", "build your song out, layer by layer, on real instruments"],
  ["mix", "dj your own tracks, then other people's, like at a ccd night"],
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
const STEPS = ["hello", "how", "make", "know", "explain", "ready"] as const;

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

  const go = (slug: string) => {
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
        <span />
      </div>

      <Screen style={{ marginTop: 6 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" className="m1-dancing" style={{ position: "absolute", right: 14, top: 12, width: 76 }} />
        {at === "hello" && <><div className="m1-ss">hello. this is ccd school.</div><h1 className="m1-t36" style={{ marginTop: 8, maxWidth: 230 }}>make music while you learn it</h1><div className="m1-ss" style={{ marginTop: 10 }}>free · on your phone or laptop · nothing to download</div></>}
        {at === "how" && <><div className="m1-ss">five parts, one song</div><h1 className="m1-t36 wl-q">how it fits together</h1></>}
        {at === "make" && <><div className="m1-ss">you can do all three. pick where to start</div><h1 className="m1-t36 wl-q">where do you want to start?</h1></>}
        {at === "know" && <><div className="m1-ss">so we start in the right place</div><h1 className="m1-t36 wl-q">how much have you done before?</h1></>}
        {at === "explain" && <><div className="m1-ss">you can switch on any step, any time</div><h1 className="m1-t36 wl-q">how do you like to learn?</h1></>}
        {at === "ready" && <><div className="m1-ss">your first lesson · about {first?.fromFile?.minutes ?? 8} minutes</div><h1 className="m1-t36 wl-q">{(first?.title ?? "lesson one").toLowerCase()}</h1><div className="m1-ss" style={{ marginTop: 10, maxWidth: 260 }}>{first?.fromFile?.learn ?? first?.tagline ?? ""}</div></>}
      </Screen>

      {at === "hello" && (
        <>
          <Silk label="how it works" />
          <p className="wl-lead">ccd school is the music school of cats can dance. you learn by making: every lesson ends with something new in your own song, and by the end you&apos;re mixing tracks you made yourself.</p>
          <div className="wl-go"><GoPill onClick={next} style={{ height: 72, width: "100%" }} ariaLabel="Let's go">let&apos;s go <Icon name="play" small /></GoPill></div>
          <a className="ls-skip" href="/worlds">i&apos;ve been here before · see all lessons</a>
        </>
      )}
      {at === "how" && (
        <>
          <ol className="wl-parts">
            {PARTS.map(([t, d], i) => <li key={t}><b>{i + 1}</b><span><strong>{t}</strong>{d}</span>{i < PARTS.length - 1 && <i aria-hidden />}</li>)}
          </ol>
          <p className="wl-lead">it&apos;s one loop: learn an idea, make it into your song, practise it, build the song out in the studio, then mix it. basics first, then producing, then djing your own productions.</p>
          <div className="wl-go"><GoPill onClick={next} style={{ height: 72, width: "100%" }}>got it</GoPill></div>
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
