"use client";
/**
 * First visit, four screens (Param, 9 Nov: the old tour was random tasks with no why and no full picture).
 * 1. what you'll make: the whole road, your song filling up part by part, then a set, then a ccd night.
 * 2. your first sound: tap a kick in time with the click. It goes into your song and stays.
 * 3. what you want to do. 4. done this before (or find your level). Then straight into lesson 1.
 * How things are explained is not asked: every step has "say it another way" and "simpler please".
 * Sound only after a touch.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FLAG, OUT, DRUM_PAD_NOTES } from "@/engine";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { emptyTrackV2, newLayerV2, readTrackV2, writeTrackV2, type TrackV2 } from "@/lib/track2";
import { nameSongIfNew } from "@/lib/songs";
import { journey, worldSteps, type WorldId } from "@/lib/worldOrder";
import { GoPill, Icon, Pad, Screen } from "./controls";
import { CAT_SRC } from "./shell";
import { useEngineTrack } from "./useEngineTrack";
import "./lesson.css";
import "./welcome.css";

export const TOUR_KEY = "ccd.tour.first";
const Placement = dynamic(() => import("./Placement").then(m => m.Placement), { ssr: false });
const STEPS = ["map", "kick", "want", "know"] as const;
type At = (typeof STEPS)[number];

type Want = "make" | "dj" | "both";
type Know = "new" | "some" | "lots";
const WANT: { id: Want; name: string; line: string }[] = [
  { id: "make", name: "make my own tracks", line: "a song from a kick drum up, one part per lesson" },
  { id: "dj", name: "mix tracks as a dj", line: "blend one track into the next, then play your own" },
  { id: "both", name: "both", line: "make a song, then play it out. the whole road" },
];
const KNOW: { id: Know; name: string; line: string }[] = [
  { id: "new", name: "completely new", line: "we start with the basics: a beat, notes, your ears" },
  { id: "some", name: "a little", line: "played with an app or a controller. straight to the good part" },
  { id: "lots", name: "test me", line: "a few minutes, by ear and by hand, and we start you at your level" },
];
const FIRST: Record<WorldId, { slug: string; title: string }> = {
  fundamentals: { slug: "tempo-bpm", title: "pulse and tempo" },
  producer: { slug: "your-kick", title: "your kick" },
  dj: { slug: "what-is-djing", title: "what is djing?" },
};
const worldFor = (want: Want | null, know: Know | null): WorldId => (know === "new" ? "fundamentals" : want === "dj" ? "dj" : "producer");

/** The parts your song gets, in the order the lessons add them, and the world each one is made in. */
const ROAD: { part: string; world: WorldId }[] = [
  { part: "kick", world: "fundamentals" }, { part: "clap", world: "fundamentals" }, { part: "hats", world: "fundamentals" },
  { part: "melody", world: "fundamentals" }, { part: "chords", world: "fundamentals" }, { part: "bass", world: "fundamentals" },
  { part: "your sound", world: "producer" }, { part: "the mix", world: "producer" }, { part: "the drop", world: "producer" },
  { part: "a set", world: "dj" }, { part: "a ccd night", world: "dj" },
];
const BAND: Record<WorldId, { name: string; line: string }> = {
  fundamentals: { name: "basics", line: "a beat, notes, chords, your ears" },
  producer: { name: "producer", line: "your sound, the mix, the drop" },
  dj: { name: "dj", line: "play it out with other tracks" },
};

const K = DRUM_PAD_NOTES[0];

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

  // How big each stretch of the road is, read from the real curriculum.
  const sizes = useMemo(() => (["fundamentals", "producer", "dj"] as WorldId[]).map(w => ({
    w, song: worldSteps(w).length, deeper: journey(w, {}).reduce((n, p) => n + p.extraTotal, 0),
  })), []);

  // ── your first sound: a click, and the kicks you tap land in your song ──
  const [taps, setTaps] = useState<number[]>([]);
  const track = useMemo<TrackV2>(() => {
    const t = { ...emptyTrackV2(), bpm: 110, loop: 4 };
    const d = newLayerV2("drums", "welcome");
    d.events = taps.map(start => ({ note: K, vel: 0.95, start, len: 0.2 }));
    return { ...t, layers: [d] };
  }, [taps]);
  const { engine, ready } = useEngineTrack(track);
  const [beat, setBeat] = useState(-1);
  const beatRef = useRef(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) { const b = e.flags & FLAG.playing ? e.beat : -1; beatRef.current = b; setBeat(b); } }), [engine]);
  useEffect(() => { if (at !== "kick") engine.stop(); }, [at, engine]);
  const playing = beat >= 0;
  const [lit, setLit] = useState(false);
  const tap = () => {
    void ready().then(() => {
      engine.noteOn(0, K, 0.95);
      window.setTimeout(() => engine.noteOff(0, K), 120);
      if (!playing) { engine.metronome(true); engine.play(); return; }
      // Where the tap really was in the bar, to a 32nd: no snap before the lesson that teaches it.
      const b = beatRef.current;
      const at = Math.round((((b % 4) + 4) % 4) * 8) / 8;
      setTaps(ts => (ts.some(x => Math.abs(x - at) < 0.1) || ts.length >= 8 ? ts : [...ts, at].sort((a, c) => a - c)));
    });
    setLit(true);
    window.setTimeout(() => setLit(false), 140);
  };
  const onBeat = taps.filter(x => Math.abs(x - Math.round(x)) < 0.13).length;

  const keepKick = () => {
    if (!taps.length) return;
    const cur = readTrackV2();
    if (cur.layers.some(l => l.events.length)) return;
    const d = newLayerV2("drums", "welcome");
    d.events = taps.map(start => ({ note: K, vel: 0.95, start, len: 0.2 }));
    writeTrackV2({ ...cur, bpm: 110, layers: [d], updatedAt: Date.now() });
    nameSongIfNew();
  };

  const go = (k: Know) => {
    const w = worldFor(want, k);
    onLeave?.();
    keepKick();
    setOnboarding(w, "normal");
    setLearnMode("flow");
    try { localStorage.setItem("ccd.world", w); } catch { /* ignore */ }
    router.push(`/learn/${FIRST[w].slug}?from=welcome`);
  };

  if (placement) return <Placement world={worldFor(want, "lots")} startNow onClose={() => setPlacement(false)} onDone={slug => {
    onLeave?.();
    keepKick();
    setOnboarding(worldFor(want, "lots"), "hard");
    setLearnMode("flow");
    router.push(`/learn/${slug}`);
  }} />;

  const pos = playing ? (((beat % 4) + 4) % 4) : -1;
  return (
    <main className="m1-page wl wn" data-step={at}>
      <div className="wl-top">
        {step > 0 ? <button type="button" className="fl-stepback" onClick={back} aria-label="Back"><Icon name="back" small />back</button> : <span />}
        <div className="ls-seg" aria-hidden style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties}>{STEPS.map((_, i) => <i key={i} className={i < step ? "is-done" : i === step ? "is-now" : ""} />)}</div>
        <span className="wn-count">{step + 1} of 4</span>
      </div>

      <div className="wl-stage" key={at}>
        {at === "map" && (
          <div className="wn-map">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CAT_SRC} alt="" className="m1-dancing wn-cat" />
            <div className="wl-tag">ccd school · by cats can dance</div>
            <h1 className="wl-hero">make your own song.<br />then play it out.</h1>
            <p className="wl-lead">every lesson adds one part to a song that is yours. this is the whole road:</p>
            <Screen className="wn-road">
              <div className="wl-meta"><span>your song</span><span>{ROAD.length} stops</span></div>
              <ol className="wn-parts" aria-label="What your song gets, in order">
                {ROAD.map((r, i) => (
                  <li key={r.part} className={`is-${r.world}`} style={{ animationDelay: `${300 + i * 110}ms` }}>
                    <i aria-hidden /><span>{r.part}</span>
                  </li>
                ))}
              </ol>
              <div className="wn-bands">
                {sizes.map(s => (
                  <div key={s.w} className={`wn-band is-${s.w}`}>
                    <b>{BAND[s.w].name}</b><span>{BAND[s.w].line}</span><small>{s.song} lessons · {s.deeper} deeper</small>
                  </div>
                ))}
              </div>
            </Screen>
            <p className="wn-note">start anywhere, skip anything. go deeper on any part when you want more.</p>
            <div className="wl-go"><GoPill onClick={next} style={{ height: 72, width: "100%" }}>start my song <Icon name="play" small /></GoPill></div>
            <a className="ls-skip" href="/dashboard">i&apos;ve been here before</a>
          </div>
        )}

        {at === "kick" && (
          <div className="wl-part">
            <div className="wl-tag"><b>1</b>your first sound</div>
            <h1 className="wl-big">tap the kick with the click</h1>
            <p className="wl-lead">this kick is the first part of your song. everything else you add lines up with it. tap once to start the click, then tap along.</p>
            <div className="wl-try">
              <Screen>
                <div className="wl-meta"><span>your song · kick</span><span>{taps.length ? `${taps.length} in · ${onBeat} on the beat` : playing ? "tap on the beat" : "tap the pad"}</span></div>
                <div className="wn-beats" aria-hidden>{[0, 1, 2, 3].map(i => <i key={i} className={`${Math.floor(pos) === i ? "is-now" : ""} ${taps.some(x => Math.floor(x + 0.13) % 4 === i) ? "is-in" : ""}`}>{i + 1}</i>)}</div>
                <div className="wn-bar" aria-label={`${taps.length} kicks in your bar`}>
                  {taps.map(x => <b key={x} style={{ left: `${(x / 4) * 100}%` }} />)}
                  {pos >= 0 && <span className="wn-head" style={{ left: `${(pos / 4) * 100}%` }} />}
                </div>
                <button type="button" className={`wl-pad ${lit ? "is-on" : ""}`} onPointerDown={tap} aria-label="Kick">kick</button>
              </Screen>
            </div>
            <div className="wl-go"><GoPill onClick={() => { engine.stop(); keepKick(); next(); }} disabled={taps.length < 2} style={{ height: 64, width: "100%" }}>{taps.length < 2 ? "tap a few kicks in" : "keep it in my song"}</GoPill></div>
          </div>
        )}

        {at === "want" && (
          <div className="wl-part">
            <div className="wl-tag"><b>2</b>you</div>
            <h1 className="wl-big">what do you want to do?</h1>
            <p className="wl-lead">your kick is in. this picks where your road starts. everything stays open.</p>
            <div className="wl-choices" role="radiogroup">
              {WANT.map(o => <Choice key={o.id} name={o.name} line={o.line} on={want === o.id} onPick={() => { setWant(o.id); next(); }} />)}
            </div>
          </div>
        )}

        {at === "know" && (
          <div className="wl-part">
            <div className="wl-tag"><b>3</b>you</div>
            <h1 className="wl-big">done this before?</h1>
            <p className="wl-lead">so lesson one is the right one.</p>
            <div className="wl-choices" role="radiogroup">
              {KNOW.map(o => <Choice key={o.id} name={o.name} line={o.line} on={know === o.id} onPick={() => { setKnow(o.id); if (o.id === "lots") setPlacement(true); else go(o.id); }} />)}
            </div>
            <p className="wn-note">then lesson one, {FIRST[worldFor(want, know ?? "some")].title}. the kick you just tapped is already in your song.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function Choice({ name, line, on, onPick }: { name: string; line: string; on: boolean; onPick: () => void }) {
  return (
    <Pad lit={on ? "var(--led-mint)" : null} ariaPressed={on} onClick={onPick} height={72} ariaLabel={`${name}: ${line}`}>
      <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "0 16px", width: "100%", textAlign: "left" }}>
        <span className="m1-t22" style={{ fontSize: 18, ...(on ? { color: "#06241B" } : {}) }}>{name}</span>
        <span className="m1-t11" style={on ? { color: "#0D2A22" } : undefined}>{line}</span>
      </span>
    </Pad>
  );
}
