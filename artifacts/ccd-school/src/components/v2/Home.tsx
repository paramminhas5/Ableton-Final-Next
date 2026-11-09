"use client";
/**
 * v2 home (10 Nov): four numbered panels that share the whole screen, nothing floating, nothing to scroll on a phone.
 *   01 Learn        the next lesson, what it adds, Continue (the one pink key). Biggest, because it's where you begin.
 *   02 Your song    the parts you've made, lit; the next one in pink; play from here; open in the studio.
 *   03 Practice     this week's lights and today's five minutes.
 *   04 Instruments  Studio, DJ decks, Library.
 * On a laptop: a 3-4-3 grid, your song in the middle with the most room, and the next lessons under Learn.
 * The walkthrough (four stops) runs once after the first visit, and again from "?".
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useProgress } from "@/lib/progress";
import { useTrack, type LayerKind } from "@/lib/track";
import { playTrack, stopTrack } from "@/lib/track-engine";
import { journey, nextStep, partOf, worldDone, missionAny, minutesFor, WORLD_LABEL, type WorldId } from "@/lib/worldOrder";
import { loadGym } from "@/lib/gym/store";
import { weekStatus } from "@/lib/gym/week";
import { Icon } from "@/components/m1/controls";
import { Walkthrough } from "@/components/m1/Walkthrough";
import { SONG_EVENT, useSongName } from "@/components/m1/SongKey";
import "./v2.css";

const WORLDS: WorldId[] = ["fundamentals", "producer", "dj"];
const PARTS: { kind: LayerKind; name: string }[] = [
  { kind: "kick", name: "Kick" }, { kind: "clap", name: "Clap" }, { kind: "hats", name: "Hats" },
  { kind: "bass", name: "Bass" }, { kind: "chords", name: "Chords" }, { kind: "lead", name: "Lead" },
];
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function Home() {
  const { progress } = useProgress();
  const { track } = useTrack();
  const { seed, name } = useSongName();
  const [world, setWorld] = useState<WorldId>("fundamentals");
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [week, setWeek] = useState<{ filled: number; target: number; days: boolean[] }>({ filled: 0, target: 3, days: [] });
  const trackRef = useRef(track); trackRef.current = track;

  useEffect(() => {
    let w: WorldId | null = null;
    try { w = localStorage.getItem("ccd.world") as WorldId | null; } catch { /* no storage */ }
    if (!w && progress.selectedWorld) w = progress.selectedWorld;
    if (w && WORLDS.includes(w)) setWorld(w);
  }, [progress.selectedWorld]);
  useEffect(() => {
    try {
      const g = loadGym(); const s = weekStatus(g.week, new Date());
      const monday = new Date(); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      const days = Array.from({ length: 7 }, (_, k) => { const d0 = monday.getTime() + k * 864e5; return g.week.sessions.some(t => { const x = new Date(t).getTime(); return x >= d0 && x < d0 + 864e5; }); });
      setWeek({ filled: s.filled, target: s.target, days });
    } catch { /* no practice yet */ }
  }, []);
  useEffect(() => () => stopTrack(), []);
  useEffect(() => { const h = () => { stopTrack(); setPlaying(false); setBeat(-1); }; window.addEventListener(SONG_EVENT, h); return () => window.removeEventListener(SONG_EVENT, h); }, []);

  const done = progress.completedMissions;
  const cur = nextStep(world, done);
  const mission = cur ? missionAny(cur.slug) : undefined;
  const count = worldDone(world, done);
  const nextPart = cur ? partOf(cur.slug).toLowerCase() : "kick";
  const kinds = new Set(seed ? [] : track.layers.map(l => l.kind));
  const empty = kinds.size === 0;
  const first = Object.keys(done).length === 0;
  const upNext = useMemo(() => journey(world, done).flatMap(p => p.lessons).filter(l => l.exists && !l.done).slice(0, 5), [world, done]);
  const today = (new Date().getDay() + 6) % 7;

  const hear = async () => {
    if (playing) { stopTrack(); setPlaying(false); setBeat(-1); return; }
    setPlaying(true);
    await playTrack(() => trackRef.current, s => setBeat(s));
  };

  return (
    <main className="v2 v2-home">
      <header className="v2-home-top">
        <h1 className="v2-d">School</h1>
        <span className="v2-streak" aria-label={`${progress.streakDays} day streak`}><Icon name="flame" small />{progress.streakDays}</span>
        <Link href="/wiki" className="v2-ib" aria-label="Search"><Icon name="search" small /></Link>
        <Walkthrough screen="home" />
        <Link href="/profile" className="v2-ib" aria-label="You">You</Link>
      </header>

      <div className="v2-home-grid">
        <section className="v2-deck v2-screw v2-p v2-learn" data-tour="learn" aria-labelledby="v2-learn">
          <div className="v2-p-h"><span className="no">01</span><span className="t" id="v2-learn">Learn</span><span className="s">{count.done} of {count.total} · {WORLD_LABEL[world]}</span></div>
          <Link href={cur ? `/learn/${cur.slug}` : "/learn"} className="v2-glass">
            <span className="meta"><span>{first ? "Lesson 1" : `Next lesson`}</span><span>{cur ? minutesFor(cur.slug) : 6} min</span></span>
            <span className="v2-hatpic" aria-hidden>{[24, 44, 24, 44, 24, 44, 24, 44].map((h, k) => <i key={k} style={{ height: h }} />)}</span>
            <span><span className="v2-d les" style={{ display: "block" }}>{mission ? cap(mission.title) : "Your first lesson"}</span><span className="adds" style={{ display: "block" }}>Adds {nextPart} to your song</span></span>
          </Link>
          <Link href={cur ? `/learn/${cur.slug}` : "/learn"} className="v2-go" style={{ flex: "none" }}>{first ? "Start" : "Continue"}</Link>
          <div className="v2-upnext">
            <div className="v2-label" style={{ margin: "6px 0 4px" }}>Up next</div>
            {upNext.slice(1).map(l => (
              <Link key={l.slug} href={`/learn/${l.slug}`} className="v2-row"><span className={`v2-part next`} style={{ width: 44, height: 38 }}><i /></span><span style={{ flex: 1 }}><span className="tt">{cap(l.title)}</span><span className="ss">Adds {partOf(l.slug).toLowerCase()}</span></span><Icon name="play" small /></Link>
            ))}
            <Link href="/learn" className="v2-row"><span style={{ flex: 1 }} className="tt">Every lesson, as a map</span><Icon name="play" small /></Link>
          </div>
        </section>

        <section className="v2-deck v2-screw v2-p v2-song" data-tour="song" aria-labelledby="v2-song">
          <div className="v2-p-h"><span className="no">02</span><span className="t" id="v2-song">Your song</span><span className="s">{empty ? "empty yet" : `${name || "Untitled"} · ${track.bpm} bpm`}</span>
            <button type="button" className="v2-ib" style={{ width: 40, height: 40 }} onClick={hear} disabled={empty} aria-label={playing ? "Stop your song" : "Play your song"}>{playing ? <i style={{ width: 12, height: 12, borderRadius: 2, background: "#F2F0EB" }} /> : <Icon name="play" small />}</button>
          </div>
          <div className="v2-glass v2-songglass">
            <span className="meta"><span>{empty ? `Lesson 1 adds the ${nextPart}` : `${kinds.size} part${kinds.size === 1 ? "" : "s"}`}</span><span>{playing ? `beat ${(beat % 16) + 1}` : ""}</span></span>
            {PARTS.map(p => {
              const layer = track.layers.find(l => l.kind === p.kind);
              const steps = layer && !seed ? layer.steps : undefined;
              return kinds.has(p.kind) ? (
                <div key={p.kind} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 44, fontSize: 11, color: "rgba(232,243,239,.6)" }}>{p.name}</span>
                  <div className="v2-lane">
                    {(steps ?? Array.from({ length: 16 }, (_, k) => k % 4 === 0)).map((on, k) => on ? <span key={k} style={{ left: `calc(${k} * 100% / 16)`, top: 4, bottom: 4 }} /> : null)}
                    {playing && <i className="v2-ph" style={{ animationDuration: `${(60 / track.bpm) * 4}s` }} />}
                  </div>
                </div>
              ) : (
                <div key={p.kind} className={`v2-ghost ${p.kind === nextPart ? "is-next" : ""}`} style={{ display: "flex", alignItems: "center", gap: 10, opacity: p.kind === nextPart ? .8 : .35 }}>
                  <span style={{ width: 44, fontSize: 11, color: p.kind === nextPart ? "#F27AAE" : "rgba(232,243,239,.6)" }}>{p.name}</span>
                  <div className="v2-lane" />
                </div>
              );
            })}
          </div>
          <div className="v2-parts">
            {PARTS.map(p => (
              <Link key={p.kind} href={kinds.has(p.kind) ? `/studio?part=${p.kind}` : cur ? `/learn/${cur.slug}` : "/learn"} className={`v2-part ${kinds.has(p.kind) ? "has" : p.kind === nextPart ? "next" : ""} ${playing && beat % 4 === 0 && kinds.has(p.kind) ? "beat" : ""}`}><i />{p.name}</Link>
            ))}
          </div>
          <div className="v2-keys2" style={{ display: "flex", gap: 10 }}>
            <Link href="/studio" className="v2-key" style={{ flex: 1 }}><Icon name="studio" small /> Open in Studio</Link>
            <Link href="/studio?send=live" className="v2-key" style={{ flex: 1 }}><Icon name="out" small /> Send to Live</Link>
          </div>
        </section>

        <section className="v2-deck v2-screw v2-p v2-practice" data-tour="practice" aria-labelledby="v2-practice">
          <div className="v2-p-h"><span className="no">03</span><span className="t" id="v2-practice">Practice</span><span className="s">{week.filled} of {week.target} this week</span></div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="v2-week" aria-label="This week">{"MTWTFSS".split("").map((d, k) => <span key={k}><i className={`${week.days[k] ? "on" : ""} ${k === today && !week.days[k] ? "today" : ""}`} />{d}</span>)}</div>
            <Link href="/gym" className="v2-key" style={{ padding: "0 16px", fontSize: 13 }}>5 min</Link>
          </div>
          <div className="v2-drills">
            <Link href="/gym" className="v2-key"><Icon name="up" small />Higher or lower</Link>
            <Link href="/gym" className="v2-key"><Icon name="pads" small />Copy by ear</Link>
            <Link href="/review" className="v2-key"><Icon name="brain" small />Review</Link>
          </div>
        </section>

        <section className="v2-deck v2-screw v2-p v2-inst" data-tour="play" aria-labelledby="v2-inst">
          <div className="v2-p-h"><span className="no">04</span><span className="t" id="v2-inst">Instruments</span><span className="s">play freely</span></div>
          <div className="row3">
            <Link href="/studio" className="v2-key"><Icon name="pads" small />Studio</Link>
            <Link href="/dj" className="v2-key"><Icon name="dj" small />DJ decks</Link>
            <Link href="/atlas" className="v2-key"><Icon name="knob" small />Library</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
