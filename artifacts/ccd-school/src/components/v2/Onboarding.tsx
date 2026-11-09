"use client";
/**
 * v2 first visit (10 Nov). Built the way the current app explains itself: one short screen per part of School,
 * each with a heading, one line, the part working on screen, and its steps lighting up in order as they happen.
 * Each screen plays through by itself and moves on; Next goes early, a dot jumps to any part. No sound here:
 * sound only starts when you tap something in a lesson. Then two questions, then home with its walkthrough.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { Icon } from "@/components/m1/controls";
import "./v2.css";

const Placement = dynamic(() => import("@/components/m1/Placement").then(m => m.Placement), { ssr: false });
const STEP_MS = 2300;

type Want = "make" | "dj" | "both";
type Know = "new" | "some" | "lots";
const worldFor = (want: Want | null, know: Know | null) => (know === "new" ? "fundamentals" : want === "dj" ? "dj" : "producer") as "fundamentals" | "producer" | "dj";

type Part = { id: string; group: number; label: string; h: string; line: string; steps: string[]; demo: (now: number) => ReactNode };

const Lane = ({ notes, off = [], play }: { notes: number[]; off?: number[]; play?: boolean }) => (
  <div className="v2-lane">
    {off.map(n => <span key={`o${n}`} className="off" style={{ left: `calc(${n} * 100% / 16)` }} />)}
    {notes.map(n => <span key={n} style={{ left: `calc(${n} * 100% / 16)` }} />)}
    {play && <i className="v2-ph" />}
  </div>
);
const Knob = ({ name, p }: { name: string; p: number }) => (
  <div className="v2-knob" style={{ ["--p" as string]: p } as CSSProperties}><span className="ring"><span className="cap"><i /></span></span>{name}</div>
);
const Glass = ({ children, l, r, h = 92 }: { children: ReactNode; l?: string; r?: string; h?: number }) => (
  <div className="v2-glass" style={{ padding: "12px 16px", minHeight: h, display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
    {(l || r) && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "rgba(232,243,239,.6)" }}><span>{l}</span><span>{r}</span></div>}
    {children}
  </div>
);

/** A pad that lights on a beat while it is "this step". */
function useTick(ms: number, on: boolean) {
  const [t, setT] = useState(0);
  useEffect(() => { if (!on) return; const id = window.setInterval(() => setT(x => x + 1), ms); return () => window.clearInterval(id); }, [ms, on]);
  return t;
}

function LearnDemo({ now }: { now: number }) {
  const t = useTick(484, now === 1);
  const hats = now === 0 ? [] : now === 1 ? [2, 6, 10, 14].slice(0, (t % 4) + 1) : [2, 6, 10, 14];
  return (
    <div className="v2-demo">
      <Glass l={now === 0 ? "Hats · ready" : now === 1 ? "Hats · recording" : "Your song"} r={now === 2 ? "4 of 4" : now === 1 ? `${hats.length} of 4` : "124 bpm"}>
        <Lane notes={[0, 4, 8, 12]} play={now > 0} />
        <Lane notes={hats} />
      </Glass>
      <div className="v2-deck v2-screw"><div className="v2-pads">
        {["Kick", "C hat", "O hat", "Clap"].map((n, i) => <span key={n} className={`v2-pad ${i === 2 && now === 1 && t % 2 === 1 ? "hit" : ""} ${i === 2 && now === 1 ? "v2-press" : ""}`}>{n}</span>)}
      </div></div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span className={`v2-ib ${now === 0 ? "v2-press" : ""}`} style={{ width: 52, height: 52, borderRadius: 26 }} aria-hidden><i style={{ width: 16, height: 16, borderRadius: 8, background: "#FF4B3E", boxShadow: now === 1 ? "0 0 12px #FF4B3E" : "none" }} /></span>
        <span className="v2-mu" style={{ fontSize: 13 }}>{now === 0 ? "rec counts you in: 4, 3, 2, 1" : now === 1 ? "kick, hat, kick, hat" : "your hats are in your song"}</span>
      </div>
    </div>
  );
}

function PracticeDemo({ now }: { now: number }) {
  const target = [0, 3, 8, 10];
  const mine = now === 0 ? [] : now === 1 ? [0, 3, 8] : [0, 3, 8, 11];
  return (
    <div className="v2-demo">
      <Glass l="Copy by ear" r={now === 0 ? "listen" : now === 1 ? "your turn" : "3 of 4 right"}><Lane notes={now === 0 ? target : now === 2 ? target : []} play={now === 0} /></Glass>
      <div className="v2-deck v2-screw"><div className="v2-steps">
        {[0, 1, 2, 3].map(g => <div className="g" key={g}>{[0, 1, 2, 3].map(k => g * 4 + k).map(k => <b key={k} className={mine.includes(k) ? "on" : ""} style={now === 2 && k === 11 ? { boxShadow: "0 0 0 2px #FF4B3E" } : undefined} />)}</div>)}
      </div></div>
    </div>
  );
}

function StudioDemo({ now }: { now: number }) {
  const t = useTick(320, now >= 1);
  return (
    <div className="v2-demo">
      <div className="v2-deck v2-screw" style={{ paddingBottom: 4 }}>
        <div className="v2-pm">{["Pads", "Steps", "Keys"].map((m, i) => <span key={m} className={(now === 0 ? i === 0 : i === (now === 1 ? t % 3 : 0)) ? "on" : ""}>{m}</span>)}</div>
        <div className="v2-pads">{["Kick", "Snare", "Clap", "Rim", "C hat", "O hat", "Shaker", "Ride"].map((n, i) => <span key={n} className={`v2-pad ${now >= 1 && (t % 8) === i ? "hit" : ""}`} style={{ height: 52 }}>{n}</span>)}</div>
        <div className="v2-knobs"><Knob name="Decay" p={now === 2 ? 0.25 + (t % 6) * 0.1 : 0.4} /><Knob name="Tune" p={0.45} /><Knob name="Level" p={0.7} /></div>
      </div>
    </div>
  );
}

const ON = new Set(["Kick:1", "Kick:2", "Kick:3", "Kick:4", "Clap:1", "Clap:2", "Clap:3", "Clap:4", "Hats:0", "Hats:1", "Hats:2", "Hats:3", "Hats:4", "Bass:2", "Bass:3", "Bass:4", "Lead:3", "Lead:4"]);
function ArrangeDemo({ now }: { now: number }) {
  const cols = now === 0 ? 1 : 5;
  const off = now >= 1 ? "Clap:1" : "";
  return (
    <div className="v2-demo">
      <Glass l="Arrange" r={now === 0 ? "one loop" : "A A B C C"} h={200}>
        <div className="v2-grid" style={{ gridTemplateColumns: `44px repeat(5, 1fr)` }}>
          <span />{["A", "A", "B", "C", "C"].map((c, j) => <span key={j} className="hd" style={{ opacity: j < cols ? 1 : .2 }}>{c}</span>)}
          {["Kick", "Clap", "Hats", "Bass", "Lead"].map(p => [<span key={p} className="lab">{p}</span>, ...[0, 1, 2, 3, 4].map(j => <span key={`${p}${j}`} className={`c ${j < cols && ON.has(`${p}:${j}`) && `${p}:${j}` !== off ? "on" : ""}`} />)])}
        </div>
      </Glass>
      <span className={`v2-key ${now === 2 ? "v2-press" : ""}`} style={{ height: 52 }}><Icon name="out" small /> Send to Live</span>
    </div>
  );
}

function DJDemo({ now }: { now: number }) {
  return (
    <div className="v2-demo">
      <Glass l="A · your song" r="B · Slow Burn"><Lane notes={[0, 2, 4, 6, 8, 10, 12, 14]} play /><Lane notes={now >= 1 ? [1, 3, 5, 7, 9, 11, 13, 15] : []} play={now >= 1} /></Glass>
      <div className="v2-deck v2-screw">
        <div className="v2-jogs"><span className="v2-jog" /><span className={`v2-jog ${now >= 1 ? "" : "stop"}`} /></div>
        <div className={`v2-xf ${now === 2 ? "v2-press" : ""}`}><b style={{ left: now === 2 ? "88%" : "12%" }} /></div>
      </div>
    </div>
  );
}

function LibraryDemo({ now }: { now: number }) {
  return (
    <div className="v2-demo">
      <div className="v2-search"><Icon name="search" small /> {now === 0 ? <span>more spa<i style={{ display: "inline-block", width: 2, height: 16, background: "#FFF1DC", verticalAlign: "middle" }} /></span> : "more space"}</div>
      <div className="v2-tiles">{[["Reverb", "A room"], ["Delay", "Echoes"], ["Chorus", "Wider"]].map(([n, s]) => <div key={n} className={`v2-tile ${n === "Reverb" && now === 1 ? "v2-press" : ""}`}><b>{n}</b><span>{s}</span></div>)}</div>
      <div className="v2-deck v2-screw"><div className="v2-knobs"><Knob name="Decay" p={now === 2 ? 0.75 : 0.35} /><Knob name="Size" p={0.4} /><Knob name="Dry/Wet" p={0.3} /></div></div>
    </div>
  );
}

const PARTS: Part[] = [
  { id: "learn", group: 0, label: "Learn", h: "Learn by making a song", line: "Short lessons. Each one adds a part to a song that's yours, and tells you what to press at every step.", steps: ["Press rec. Four clicks count you in", "Tap Open hat on every \"and\"", "4 of 4: your hats are in your song"], demo: now => <LearnDemo now={now} /> },
  { id: "practice", group: 1, label: "Practice", h: "Five minutes a day", line: "Ear training picked from what your lessons taught you, so it sticks.", steps: ["Hear a short part", "Tap the steps you heard", "See every note marked right or off"], demo: now => <PracticeDemo now={now} /> },
  { id: "studio", group: 2, label: "Studio · 1 of 2", h: "Build it on real instruments", line: "Pads, steps and keys, all playing your song. Knobs shape the sound.", steps: ["Pick a part of your song", "Play it on pads, steps or keys", "Turn a knob and hear it change"], demo: now => <StudioDemo now={now} /> },
  { id: "arrange", group: 2, label: "Studio · 2 of 2", h: "Arrange it, then take it to Live", line: "Your loop becomes sections. Then the whole song opens in Ableton Live.", steps: ["Copy your loop into sections", "Switch a part on or off in each", "Send the song to Ableton Live"], demo: now => <ArrangeDemo now={now} /> },
  { id: "dj", group: 3, label: "DJ decks", h: "Play it out on the decks", line: "Two decks and a mixer, laid out like a real controller.", steps: ["Your song plays on deck A", "Start a track on deck B", "Slide the crossfader from A to B"], demo: now => <DJDemo now={now} /> },
  { id: "library", group: 4, label: "Library", h: "Every device in Live, playable", line: "Search by name, or by what you want to hear.", steps: ["Search for a sound: more space", "Open a device. It plays on a loop", "Turn a knob. The screen says what it does"], demo: now => <LibraryDemo now={now} /> },
];
const GROUPS = 6; // learn, practice, studio, dj, library, you

export function Onboarding() {
  const [i, setI] = useState(0);
  const [now, setNow] = useState(0);
  const [paused, setPaused] = useState(false);
  const [want, setWant] = useState<Want | null>(null);
  const [know, setKnow] = useState<Know | null>(null);
  const [placement, setPlacement] = useState(false);
  const { setOnboarding } = useProgress();
  const { setLearnMode } = useLearnMode();
  const router = useRouter();
  const you = i >= PARTS.length;
  const part = PARTS[i];
  const goto = useCallback((n: number) => { setI(Math.max(0, Math.min(PARTS.length, n))); setNow(0); }, []);
  const iRef = useRef(i); iRef.current = i;

  // each step lights for a moment, then the next; after the last, the next part starts
  useEffect(() => {
    if (you || paused) return;
    const id = window.setTimeout(() => {
      if (now < part.steps.length - 1) setNow(now + 1);
      else goto(iRef.current + 1);
    }, now === part.steps.length - 1 ? STEP_MS + 900 : STEP_MS);
    return () => window.clearTimeout(id);
  }, [now, i, you, paused, part, goto]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.("input,textarea")) return;
      if (e.key === "ArrowRight") goto(iRef.current + 1);
      if (e.key === "ArrowLeft") goto(iRef.current - 1);
      if (e.key === " " && !you) { e.preventDefault(); setPaused(p => !p); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [goto, you]);

  const group = you ? GROUPS - 1 : part.group;
  const frac = you ? 1 : (now + 1) / part.steps.length;
  const go = () => {
    const w = worldFor(want, know);
    setOnboarding(w, "normal");
    setLearnMode("flow");
    try { localStorage.setItem("ccd.world", w); localStorage.removeItem("ccd.walk.home"); } catch { /* no storage */ }
    router.push("/dashboard?tour=1");
  };
  const dots = useMemo(() => Array.from({ length: GROUPS }, (_, g) => g), []);

  if (placement) return <Placement world={worldFor(want, "lots")} startNow onClose={() => setPlacement(false)} onDone={slug => {
    setOnboarding(worldFor(want, "lots"), "hard");
    setLearnMode("flow");
    try { localStorage.setItem("ccd.everything", "1"); } catch { /* ignore */ }
    router.push(`/learn/${slug}`);
  }} />;

  return (
    <main className="v2 v2-ob" data-part={you ? "you" : part.id}>
      <div className="v2-ob-top">
        {i > 0 ? <button type="button" className="v2-ib" onClick={() => goto(i - 1)} aria-label="Back"><Icon name="back" small /></button>
          : <Link href="/" className="v2-ib" aria-label="Back to the front page"><Icon name="back" small /></Link>}
        <nav className="v2-ob-dots" aria-label="Parts of School">
          {dots.map(g => (
            <button key={g} type="button" className={g < group ? "done" : g === group ? "now" : ""} onClick={() => goto(g === GROUPS - 1 ? PARTS.length : PARTS.findIndex(p => p.group === g))} aria-label={g === GROUPS - 1 ? "Two questions" : PARTS.find(p => p.group === g)?.label}>
              <i>{g === group && <b style={{ ["--f" as string]: g === GROUPS - 1 ? 1 : (part?.id === "arrange" ? 0.5 : 0) + frac * (part?.group === 2 ? 0.5 : 1) } as CSSProperties} />}</i>
            </button>
          ))}
        </nav>
        {!you ? <button type="button" className="v2-ob-skip" onClick={() => goto(PARTS.length)}>Skip</button> : <span style={{ width: 34 }} />}
      </div>

      {!you ? (
        <>
          <section className="v2-ob-main" key={part.id} aria-live="polite">
            <div className="v2-ob-text">
              <div className="v2-label">{part.label}</div>
              <h1 className="v2-d v2-ob-h">{part.h}</h1>
              <p className="v2-mu v2-ob-line">{part.line}</p>
              <ol className="v2-ob-steps" style={{ marginTop: 18 }} aria-label="What happens">
                {part.steps.map((s, k) => (
                  <li key={k} className={k < now ? "done" : k === now ? "now" : ""} onClick={() => setNow(k)}><i>{k < now ? <Icon name="check" small /> : k + 1}</i>{s}</li>
                ))}
              </ol>
            </div>
            <div className="v2-ob-demo" onClick={() => setPaused(p => !p)} role="img" aria-label={`${part.h}: ${part.steps.join(", ")}`}>{part.demo(now)}</div>
          </section>
          <div className="v2-ob-foot">
            <button type="button" className="v2-ib" style={{ width: 56, height: 56, borderRadius: 28 }} onClick={() => setPaused(p => !p)} aria-label={paused ? "Carry on" : "Pause"}>
              {paused ? <Icon name="play" small /> : <span style={{ display: "flex", gap: 4 }}><i style={{ width: 4, height: 14, background: "#F2F0EB", borderRadius: 1 }} /><i style={{ width: 4, height: 14, background: "#F2F0EB", borderRadius: 1 }} /></span>}
            </button>
            <button type="button" className="v2-go" onClick={() => goto(i + 1)}>{i === PARTS.length - 1 ? "Two questions" : "Next"}</button>
          </div>
          <p className="v2-ob-hint">{paused ? "Paused. Tap the picture to carry on." : "It moves on by itself. Tap the picture to pause."}</p>
        </>
      ) : (
        <>
          <section className="v2-ob-main is-you">
            <h1 className="v2-d v2-ob-h">Two quick questions</h1>
            <div className="v2-q">
              <b>What do you want to make?</b>
              <div className="opts" role="radiogroup" aria-label="What do you want to make">
                {([["make", "Tracks", "songs of your own"], ["dj", "DJ sets", "mix tracks live"], ["both", "Both", "make, then play out"]] as [Want, string, string][]).map(([id, n, s]) => (
                  <button key={id} type="button" aria-pressed={want === id} onClick={() => setWant(id)}>{n}<small>{s}</small></button>
                ))}
              </div>
            </div>
            <div className="v2-q">
              <b>Done this before?</b>
              <div className="opts" role="radiogroup" aria-label="Done this before">
                {([["new", "New to it", "start at lesson 1"], ["some", "A little", "skip the basics"], ["lots", "Test me", "3 minutes, by ear"]] as [Know, string, string][]).map(([id, n, s]) => (
                  <button key={id} type="button" aria-pressed={know === id} onClick={() => { setKnow(id); if (id === "lots") setPlacement(true); }}>{n}<small>{s}</small></button>
                ))}
              </div>
            </div>
            <p className="v2-mu" style={{ fontSize: 14, margin: 0 }}>You can change these later in You.</p>
          </section>
          <div className="v2-ob-foot"><button type="button" className="v2-go" disabled={!want || !know} onClick={go}>{!want || !know ? "Pick one of each" : "Show me around"}</button></div>
        </>
      )}
    </main>
  );
}
