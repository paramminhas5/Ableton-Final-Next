"use client";
/**
 * Home (10 Nov): ccd school in four numbered parts, so one look says what is part of what and where to begin.
 *   01 learn        short lessons, in order. continue is the one pink key. basics, producer, dj below it.
 *   02 your song    what the lessons build. every lesson you finish adds a part here. opens in the studio.
 *   03 practice     five minutes a day: ear drills and review, so what you learnt sticks.
 *   04 instruments  play freely: drums, synths, the dj decks, every device in the library.
 * A new learner sees "start here" on 01 and nothing else asking for attention. On a laptop the four sit
 * left to right in reading order. Your song never plays on its own here; its play key starts it.
 */
import "@/components/m1/lesson.css";
import "@/components/m1/home.css";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { YouCard } from "./YouCard";
import { useProgress } from "@/lib/progress";
import { useTrack, KIND } from "@/lib/track";
import { readTrackV2 } from "@/lib/track2";
import { playTrack, stopTrack } from "@/lib/track-engine";
import { journey, nextStep, partOf, worldDone, missionAny, minutesFor, WORLD_LABEL, type WorldId } from "@/lib/worldOrder";
import { loadGym } from "@/lib/gym/store";
import { weekStatus } from "@/lib/gym/week";
import { Icon, Key, Screen, WORLD_LED } from "./controls";
import { CAT_SRC, Lanes } from "./shell";
import { SevenSeg } from "./SevenSeg";
import { SongKey, useSongName, SONG_EVENT } from "./SongKey";
import { TopBar } from "./TopBar";

const WORLD_KEY = "ccd.world";
const WORLDS: WorldId[] = ["fundamentals", "producer", "dj"];
const WORLD_GIVES: Record<WorldId, string> = { fundamentals: "a beat", producer: "a finished track", dj: "a mix" };
const GHOST = ["kick", "hats", "clap", "bass", "lead", "chords"];

/** One numbered part of ccd school: a seven-segment number, its name, one line on what it is, and its state. */
function Part({ n, name, line, state, color, start, children, className, id }: { n: number; name: string; line: string; state?: string; color: string; start?: boolean; children: ReactNode; className?: string; id: string }) {
  return (
    <section aria-labelledby={`hp-${id}`} data-tour={id} className={`hp ${start ? "is-start" : ""} ${className ?? ""}`} style={{ ["--c" as string]: color } as CSSProperties}>
      <header className="hp-head">
        <span className="hp-n" aria-hidden><SevenSeg text={String(n).padStart(2, "0")} color={color} digits={2} height={30} /></span>
        <span className="hp-name">
          <b id={`hp-${id}`}><span className="sr-only">{n}. </span>{name}</b>
          <small>{line}</small>
        </span>
        {start ? <em className="hp-start">start here</em> : state ? <em className="hp-state">{state}</em> : null}
      </header>
      <div className="hp-body">{children}</div>
    </section>
  );
}

export function Today() {
  const { progress, missionsNeedingReview } = useProgress();
  const { track } = useTrack();
  const [world, setWorld] = useState<WorldId>("fundamentals");
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const trackRef = useRef(track);
  trackRef.current = track;
  const { seed } = useSongName();
  const [week, setWeek] = useState<{ filled: number; target: number }>({ filled: 0, target: 3 });

  useEffect(() => {
    let w: WorldId | null = null;
    try { w = localStorage.getItem(WORLD_KEY) as WorldId | null; } catch {}
    if (!w && progress.selectedWorld) w = progress.selectedWorld;
    if (w && WORLDS.includes(w)) setWorld(w);
  }, [progress.selectedWorld]);
  useEffect(() => { try { const g = loadGym(); const s = weekStatus(g.week, new Date()); setWeek({ filled: s.filled, target: s.target }); } catch { /* no practice yet */ } }, []);
  useEffect(() => () => stopTrack(), []);
  // Loading another song stops the one playing: nothing starts on its own.
  useEffect(() => { const h = () => { stopTrack(); setPlaying(false); setStep(-1); }; window.addEventListener(SONG_EVENT, h); return () => window.removeEventListener(SONG_EVENT, h); }, []);

  const done = progress.completedMissions;
  const anyDone = Object.keys(done).length > 0;
  const cur = nextStep(world, done);
  const mission = cur ? missionAny(cur.slug) : undefined;
  const counts = useMemo(() => Object.fromEntries(WORLDS.map(w => [w, worldDone(w, done)])) as Record<WorldId, ReturnType<typeof worldDone>>, [done]);
  const paths = useMemo(() => journey(world, done), [world, done]);
  const allSong = WORLDS.reduce((a, w) => ({ done: a.done + counts[w].done, total: a.total + counts[w].total }), { done: 0, total: 0 });
  const layers = new Set(track.layers.map(l => l.id.split(":")[0])).size;
  // Home shows your song only once you have made one: the starter loop we add is not yours yet (Param, 9 Nov).
  const hasSong = layers > 0 && !seed;
  const [shape, setShape] = useState({ key: "a minor", length: "1 bar loop" });
  useEffect(() => {
    const t = readTrackV2();
    const NOTE = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
    const secs = t.sections ?? [];
    const bars = secs.reduce((a, x) => a + x.bars, 0);
    const loopBars = Math.max(1, Math.round((t.loop || 4) / 4));
    setShape({ key: `${NOTE[((t.root % 12) + 12) % 12]} ${t.scale}`, length: secs.length ? `${bars} bars · ${secs.length} sections` : `${loopBars} bar loop` });
  }, [track]);

  const pickWorld = (w: WorldId) => { setWorld(w); try { localStorage.setItem(WORLD_KEY, w); } catch {} };
  const hear = async () => {
    if (playing) { stopTrack(); setPlaying(false); setStep(-1); return; }
    setPlaying(true);
    await playTrack(() => trackRef.current, s => setStep(s));
  };

  const isDone = !!(cur && done[cur.slug]);
  const addWord = cur ? partOf(cur.slug).toLowerCase() : "";
  const addKind = ((Object.keys(KIND) as (keyof typeof KIND)[]).find(k => addWord.includes(k)) ?? (addWord.includes("snare") ? "clap" : addWord.includes("synth") || addWord.includes("melody") ? "lead" : addWord.includes("chord") ? "chords" : "perc"));
  const led = WORLD_LED[world];
  const curPath = paths.find(p => p.lessons.some(l => l.slug === cur?.slug));
  const due = missionsNeedingReview.length;

  return (
    <div className="m1-page hm fr" style={{ ["--c" as string]: led } as CSSProperties}>
      <TopBar screen="home" />

      <div className="fr-l">
        <Part n={1} id="learn" name="learn" line="short lessons, one idea each, in order" color={led} start={!anyDone} state={`${allSong.done} of ${allSong.total}`} className="o2">
          {cur && mission && (
            <Link href={`/learn/${cur.slug}`} className="m1-m is-wide hm-go" key={`c-${cur.slug}`}>
              <span className="hm-gopic" aria-hidden style={{ ["--pc" as string]: KIND[addKind].color } as CSSProperties}>
                <span className="hm-gopart"><i />{partOf(cur.slug)}</span>
                <span className="hm-golanes"><Lanes track={track} next={{ kind: addKind, isNew: !track.layers.some(l => l.kind === addKind) }} /></span>
              </span>
              <div className="hm-go-t">
                <div className="m1-eng">{isDone ? "go again" : anyDone ? "next lesson" : "your first lesson"} · {curPath ? `path ${curPath.number}` : WORLD_LABEL[world]}</div>
                <div className="m1-t22 hm-go-n">{mission.title.toLowerCase()}</div>
                <div className="m1-t11">adds {partOf(cur.slug)} to your song · {minutesFor(cur.slug)} min</div>
              </div>
              <span className="m1-cap is-go" style={{ width: 62, flex: "none" }}><Icon name="play" /></span>
            </Link>
          )}
          {/* the three worlds as a road: tap one to make it what continue opens */}
          <ol className="hp-road" aria-label="The three worlds, in order">
            {WORLDS.map((w, i) => {
              const c = counts[w];
              const on = w === world;
              return (
                <li key={w}>
                  <button type="button" className={`hp-world ${on ? "is-on" : ""}`} aria-pressed={on} onClick={() => pickWorld(w)} style={{ ["--w" as string]: WORLD_LED[w] } as CSSProperties}>
                    <span className="hp-wn">1.{i + 1}</span>
                    <span className="hp-wt">{WORLD_LABEL[w]}<small>you make {WORLD_GIVES[w]}</small></span>
                    <i className="hp-wbar" aria-hidden><em style={{ width: `${c.total ? (c.done / c.total) * 100 : 0}%` }} /></i>
                    <span className="hp-wc">{c.done}/{c.total}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <Link href="/learn" className="hp-link">every lesson, as a map<Icon name="play" small /></Link>
        </Part>
      </div>

      <div className="fr-c">
        <Part n={2} id="song" name="your song" line="each lesson you finish adds a part. it lives in the studio" color="var(--led-mint)" state={hasSong ? `${layers} ${layers === 1 ? "part" : "parts"}` : "empty"} className="o3">
          {hasSong ? (
            <div className="hm-song">
              <Screen className="hm-songscr">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CAT_SRC} alt="" className={playing ? "m1-dancing hm-cat" : "hm-cat"} />
                <div className="hp-songname"><SongKey /></div>
                <div className="m1-ss">{track.bpm} bpm · {shape.key} · {playing ? `step ${step + 1}` : shape.length}</div>
                <div className="hm-lanes"><Lanes track={track} playhead={playing ? step : -1} next={cur && !isDone ? { kind: addKind, isNew: !track.layers.some(l => l.kind === addKind) } : undefined} /></div>
              </Screen>
              <div className="hm-songkeys">
                <Key label={playing ? "stop" : "play"} ariaLabel={playing ? "Stop your song" : "Play your song"} onClick={hear} led={playing ? "var(--led-mint)" : null}><Icon name={playing ? "stop" : "play"} /></Key>
                <Key label="studio" href="/studio" ariaLabel="Open your song in the studio"><Icon name="studio" /></Key>
              </div>
            </div>
          ) : (
            <Screen className="hm-songscr is-empty">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CAT_SRC} alt="" className="hm-cat m1-dancing" />
              <div className="m1-ss" style={{ maxWidth: 230 }}>nothing in it yet. {anyDone ? "your next lesson adds" : "lesson 1 adds"} the {cur ? partOf(cur.slug) : "kick"}, and each lesson after adds one more part.</div>
              <ol className="hm-ghost" aria-hidden>{GHOST.map((g, i) => <li key={g} style={{ animationDelay: `${i * 90}ms` }}><span>{g}</span><i /></li>)}</ol>
              {seed && <Link href="/studio" className="hm-seed"><span className="sk-tag">added for you</span>a starter loop is in the studio to play with</Link>}
            </Screen>
          )}
        </Part>
      </div>

      <div className="fr-r">
        <Part n={3} id="practice" name="practice" line="five minutes, so what you learnt sticks" color="var(--led-cobalt, #8CA3FF)" state={`${week.filled} of ${week.target} this week`} className="o4">
          <div className="hp-tiles is-two">
            <Link href="/gym" className="hp-tile">
              <span className="hp-ti"><Icon name="hear" /></span>
              <span className="hp-tt">ear drills<small>{anyDone ? "today's five minutes" : "opens after lesson 1"}</small></span>
            </Link>
            <Link href="/review" className={`hp-tile ${due ? "is-due" : ""}`}>
              <span className="hp-ti"><Icon name="loop" /></span>
              <span className="hp-tt">review<small>{due ? `${due} ready to refresh` : anyDone ? "nothing due" : "lessons come back here"}</small></span>
            </Link>
          </div>
        </Part>

        <Part n={4} id="play" name="instruments" line="play freely, no lesson needed. in the library" color="var(--led-lilac, #C59BFF)" className="o5">
          <div className="hp-tiles">
            <Link href="/studio" className="hp-tile"><span className="hp-ti"><Icon name="pads" /></span><span className="hp-tt">drums and synths<small>the studio</small></span></Link>
            <Link href="/dj" className="hp-tile"><span className="hp-ti"><Icon name="dj" /></span><span className="hp-tt">dj decks<small>two decks, a mixer</small></span></Link>
            <Link href="/atlas" className="hp-tile"><span className="hp-ti"><Icon name="knob" /></span><span className="hp-tt">devices<small>every effect, playable</small></span></Link>
            <Link href="/placement" className="hp-tile"><span className="hp-ti"><Icon name="bolt" /></span><span className="hp-tt">find your level<small>skip what you know</small></span></Link>
          </div>
        </Part>
        {anyDone && <div className="o6 fr-side"><YouCard xp={progress.xp} streak={progress.streakDays} done={done} compact /></div>}
      </div>
      <DuoFilters />
    </div>
  );
}

/** Duotone tints for lesson pictures: ink plus the world colour. */
export function DuoFilters() {
  const tints: Record<string, [number, number, number]> = { producer: [1, 0.36, 0.64], dj: [0.55, 0.64, 1], fundamentals: [0.36, 0.92, 0.76] };
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      {Object.entries(tints).map(([k, [r, g, b]]) => (
        <filter key={k} id={`duo-${k}`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues={`.05 ${r}`} />
            <feFuncG type="table" tableValues={`.05 ${g}`} />
            <feFuncB type="table" tableValues={`.06 ${b}`} />
          </feComponentTransfer>
        </filter>
      ))}
    </svg>
  );
}
