"use client";
/**
 * Home (9 Nov). One job per zone, top to bottom:
 * 1. your song, once you have made one (before that: "your first song starts here");
 * 2. continue: the one pink key, the lesson and what it adds to your song;
 * 3. the knobs: world, path, lesson (turning them picks what continue opens);
 * 4. the map: the path you are on, open, with its deeper lessons; every other path folded to a row;
 * 5. review and your rank.
 * Your song never plays on its own here; its play key starts it.
 */
import "@/components/m1/lesson.css";
import "@/components/m1/home.css";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { YouCard } from "./YouCard";
import { useProgress } from "@/lib/progress";
import { useTrack } from "@/lib/track";
import { readTrackV2 } from "@/lib/track2";
import { playTrack, stopTrack } from "@/lib/track-engine";
import { journey, nextStep, partOf, worldSteps, worldDone, missionAny, missionImage, minutesFor, WORLD_LABEL, type WorldId } from "@/lib/worldOrder";
import { CAP, Icon, Key, Knob, Screen, Silk, WORLD_LED } from "./controls";
import { CAT_SRC, Lanes } from "./shell";
import { SongKey, useSongName, SONG_EVENT } from "./SongKey";
import { TopBar } from "./TopBar";
import { PracticeWidget, StudioWidget, DecksWidget, WordWidget, ReviewWidget } from "./Widgets";

const WORLD_KEY = "ccd.world";
const WORLDS: WorldId[] = ["fundamentals", "producer", "dj"];
const GHOST = ["kick", "hats", "clap", "bass", "lead", "chords"];

export function Today() {
  const { progress, missionsNeedingReview } = useProgress();
  const { track } = useTrack();
  const [world, setWorld] = useState<WorldId>("fundamentals");
  const [sel, setSel] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const trackRef = useRef(track);
  trackRef.current = track;
  const { seed } = useSongName();


  useEffect(() => {
    let w: WorldId | null = null;
    try { w = localStorage.getItem(WORLD_KEY) as WorldId | null; } catch {}
    if (!w && progress.selectedWorld) w = progress.selectedWorld;
    if (w) setWorld(w);
  }, [progress.selectedWorld]);
  useEffect(() => () => stopTrack(), []);
  // Loading another song stops the one playing: nothing starts on its own.
  useEffect(() => { const h = () => { stopTrack(); setPlaying(false); setStep(-1); }; window.addEventListener(SONG_EVENT, h); return () => window.removeEventListener(SONG_EVENT, h); }, []);

  const done = progress.completedMissions;
  const steps = worldSteps(world);
  const next = nextStep(world, done);
  const cur = steps.find(st => st.slug === sel) ?? next;
  const mission = cur ? missionAny(cur.slug) : undefined;
  const counts = worldDone(world, done);
  const paths = useMemo(() => journey(world, done), [world, done]);
  const zones = useMemo(() => Array.from(new Set(steps.map(st => st.path))).map(path => ({ path, title: steps.find(st => st.path === path)!.pathTitle })), [steps]);
  const zi = Math.max(0, zones.findIndex(z => z.path === cur?.path));
  const inZone = steps.filter(st => st.path === zones[zi]?.path);
  const li = Math.max(0, inZone.findIndex(st => st.slug === cur?.slug));
  const layers = new Set(track.layers.map(l => l.id.split(":")[0])).size;
  // Home opens on your song only once you have made one: the starter loop we add is not yours yet (Param, 9 Nov).
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

  const pickWorld = (w: WorldId) => { setWorld(w); setSel(null); try { localStorage.setItem(WORLD_KEY, w); } catch {} };
  const pickZone = (i: number) => {
    const z = zones[i];
    if (!z || i === zi) return;
    const inz = steps.filter(st => st.path === z.path);
    setSel((inz.find(st => !done[st.slug]) ?? inz[0]).slug);
  };
  const pickLesson = (i: number) => { const st = steps[i]; if (st && st.slug !== cur?.slug) setSel(st.slug); };
  const idxOf = (v: number, n: number) => Math.max(0, Math.min(n - 1, Math.round(v * (n - 1))));
  const val = (i: number, n: number) => (n > 1 ? i / (n - 1) : 0);
  const wi = WORLDS.indexOf(world);
  const short = (t: string, n = 14) => (t.length > n ? `${t.slice(0, n - 1).trim()}…` : t);

  const hear = async () => {
    if (playing) { stopTrack(); setPlaying(false); setStep(-1); return; }
    setPlaying(true);
    await playTrack(() => trackRef.current, s => setStep(s));
  };

  const isDone = !!(cur && done[cur.slug]);
  const led = WORLD_LED[world];
  const anyDone = Object.keys(done).length > 0;
  return (
    <div className="m1-page hm fr" style={{ ["--c" as string]: led } as CSSProperties}>
      <TopBar screen="home" />

      <div className="fr-l">
        {/* 1. your song */}
        <section aria-label="Your song" data-tour="song" className="o1">
          <div className="hm-row">
            <Silk label="your song" style={{ flex: 1, margin: "4px 2px" }} />
            {hasSong && <SongKey />}
          </div>
          {hasSong ? (
            <div className="hm-song">
              <Screen className="hm-songscr">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CAT_SRC} alt="" className={playing ? "m1-dancing hm-cat" : "hm-cat"} />
                <div className="m1-ss">{layers} {layers === 1 ? "part" : "parts"} · {track.bpm} bpm · {shape.key} · {playing ? `step ${step + 1}` : shape.length}</div>
                <div className="hm-lanes"><Lanes track={track} playhead={playing ? step : -1} /></div>
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
              <div className="m1-t22" style={{ maxWidth: 220 }}>your first song starts here</div>
              <div className="m1-ss" style={{ marginTop: 6, maxWidth: 250 }}>every lesson adds one part. your first lesson adds the {cur ? partOf(cur.slug) : "kick"}.</div>
              {seed && <Link href="/studio" className="hm-seed"><span className="sk-tag">added for you</span>a starter loop is in the studio to play with</Link>}
              <ol className="hm-ghost" aria-hidden>{GHOST.map((g, i) => <li key={g} style={{ animationDelay: `${i * 90}ms` }}><span>{g}</span><i /></li>)}</ol>
            </Screen>
          )}
        </section>

        {/* 3. the knobs */}
        <section aria-label="Turn to choose" className="o3">
          <Silk label="turn to choose" right={`lesson ${li + 1} of ${inZone.length}`} />
          <div className="td-knobs">
            <div><span className="m1-ss">world</span>
              <Knob onStep={() => pickWorld(WORLDS[(wi + 1) % WORLDS.length])} label={WORLD_LABEL[world]} color={CAP.navy} size={64} height={150} led={led} detents={3} value={val(wi, 3)} defaultValue={val(wi, 3)} onChange={v => { const w = WORLDS[idxOf(v, 3)]; if (w !== world) pickWorld(w); }} />
            </div>
            <div><span className="m1-ss">path</span>
              <Knob onStep={() => pickZone((zi + 1) % Math.max(1, zones.length))} label={short(zones[zi]?.title.toLowerCase() ?? "-")} color={CAP.navy} size={58} height={150} led={led} detents={zones.length} value={val(zi, zones.length)} defaultValue={val(zi, zones.length)} onChange={v => pickZone(idxOf(v, zones.length))} />
            </div>
            <div><span className="m1-ss">lesson</span>
              <Knob onStep={() => pickLesson(steps.indexOf(inZone[(li + 1) % Math.max(1, inZone.length)]))} label={short(mission?.title.toLowerCase() ?? "-", 16)} color={CAP.grey} size={52} height={150} led="var(--led-cobalt, #8CA3FF)" detents={inZone.length} value={val(li, inZone.length)} defaultValue={val(li, inZone.length)} onChange={v => pickLesson(steps.indexOf(inZone[idxOf(v, inZone.length)]))} />
            </div>
          </div>
        </section>
        {anyDone && <div className="o7 fr-side"><YouCard xp={progress.xp} streak={progress.streakDays} done={done} /></div>}
      </div>

      <div className="fr-c">
        {/* 2. continue: the one pink key on the screen */}
        {cur && mission && (
          <Link href={`/learn/${cur.slug}`} className="m1-m is-wide hm-go o2" key={`c-${cur.slug}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={missionImage(cur.slug, world, "sm")} alt="" width={72} height={72} decoding="async" className="td-pop" style={{ filter: `url(#duo-${world})` }} />
            <div className="hm-go-t">
              <div className="m1-eng">{isDone ? "go again" : cur.slug === next?.slug ? (hasSong ? "continue" : "start") : "start this"} · {WORLD_LABEL[world]} {String(cur.index + 1).padStart(2, "0")}</div>
              <div className="m1-t22 hm-go-n">{mission.title.toLowerCase()}</div>
              <div className="m1-t11">adds {partOf(cur.slug)} · {minutesFor(cur.slug)} min</div>
            </div>
            <span className="m1-cap is-go" style={{ width: 62, flex: "none" }}><Icon name="play" /></span>
          </Link>
        )}

        {/* 4. the map */}
        <section aria-label={`${WORLD_LABEL[world]} map`} className="o4">
          <Silk label={`${WORLD_LABEL[world]} · your road`} right={`${counts.done} of ${counts.total} parts`} />
          <ol className="hm-map">
            {paths.map(p => {
              const open = zones[zi]?.path === p.slug;
              const tot = p.songTotal || p.lessons.length;
              const dn = p.songTotal ? p.songDone : p.lessons.filter(l => l.done).length;
              return (
                <li key={p.slug} className={`hm-path ${open ? "is-open" : ""} ${dn === tot ? "is-done" : ""}`}>
                  <button type="button" className="hm-pathrow" aria-expanded={open} onClick={() => pickZone(zones.findIndex(z => z.path === p.slug))}>
                    <b>path {p.number}</b><span>{p.title.toLowerCase()}</span>
                    <i className="hm-meter" aria-hidden>{Array.from({ length: tot }, (_, k) => <em key={k} className={k < dn ? "is-on" : ""} />)}</i>
                    <small>{dn}/{tot}</small>
                  </button>
                  {open && (
                    <ol className="hm-lessons">
                      {p.lessons.map(l => {
                        const deeper = l.extras.length;
                        const on = l.slug === cur?.slug;
                        return (
                          <li key={l.slug} className={`hm-lesson ${l.done ? "is-done" : ""} ${on ? "is-sel" : ""}`}>
                            <button type="button" className="hm-lrow" onClick={() => setSel(l.slug)} aria-current={on || undefined}>
                              <i className="hm-led" aria-hidden />
                              <span className="hm-part">{l.kind === "song" ? partOf(l.slug) : "bonus"}<small>{l.title.replace(/^bonus: /, "").toLowerCase()}</small></span>
                            </button>
                            {deeper > 0 && <Link href={`/learn#${l.slug}`} className="hm-deeper" aria-label={`${deeper} deeper lessons on ${l.title}`}><b>+{deeper}</b>deeper</Link>}
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </li>
              );
            })}
          </ol>
          <Link href="/learn" className="hm-all">the whole syllabus<Icon name="play" small /></Link>
        </section>
      </div>

      {/* Laptop: working windows onto the rest of ccd school. Phone keeps review only. */}
      <div className="fr-r">
        <div className="o5"><ReviewWidget due={missionsNeedingReview.length} any={anyDone} /></div>
        <div className="fr-side o6"><PracticeWidget /></div>
        <div className="fr-side o6"><StudioWidget parts={hasSong ? layers : 0} /></div>
        <div className="fr-side o6"><DecksWidget /></div>
        <div className="fr-side o6"><WordWidget /></div>
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
