"use client";
/**
 * The player for lessons written as files (design/process.md). One layout from start to finish:
 * a header that says where you are, your song pinned under it with its own play button, then the
 * step. The order is always: the steps of the lesson, add to your song, optional questions, done.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FLAG, OUT } from "@/engine";
import type { LessonScreen, Mission } from "@/content/types";
import { useProgress } from "@/lib/progress";
import { playCorrect, playWrong, playFanfare } from "@/lib/audio";
import { getMissionContext } from "@/lib/missionContext";
import { track } from "@/lib/analytics";
import { applyTake, drumNames, readTake, saveTake, takeType, withParams, type Take } from "@/lib/lessonTake";
import { offerFor, readTrack } from "@/lib/track";
import { readTrackV2, toV1View, writeTrackV2, type TrackV2 } from "@/lib/track2";
import { changesSong, cueFor, cuesOf, soundsSame, withCue } from "@/lib/cues";
import { songDiff } from "@/lib/songdiff";
import { nameSongIfNew, readSongs, newSong, renameSong } from "@/lib/songs";
import { usePrefs } from "@/lib/prefs";
import { earnStripe, newTrophies, readStripes, type Trophy } from "@/lib/rewards";
import { worldRankFor, WORLD_NAME } from "@/lib/worldRanks";
import type { CurWorld } from "@/content/curriculum";
import { curItem, curPathOf, extrasOf, songItems } from "@/content/curriculum";
import { isRebuilt, partOf, worldOf, WORLD_LABEL } from "@/lib/worldOrder";
import { fileLesson, lessonToMission } from "@/content/lessons/adapt";
import { clipVariants } from "@/content/lessons/clipTracks";
import { GoPill, Icon, Key, Screen, Silk, WORLD_LED } from "./controls";
import { Bottom, Meta, useEnter } from "./LessonParts";
import { CAT_SRC, Lanes } from "./shell";
import { TryIt } from "./TryIt";
import { MIX_SKIP, MixStep } from "./MixStep";
import { ArrangeStep } from "./ArrangeStep";
import { presetTake } from "./AddToTrack";
import { EarStep, HearStep, SayStep, ShapeStep, TempoStep, otherShapes, readShape, songHasMusic, startsFresh } from "./LessonSteps";
import { MatchSoundStep } from "./MatchSound";
import { CopyStep } from "./CopyEar";
import { engineOwner, useEngineTrack } from "./useEngineTrack";
import { Gloss } from "./Gloss";
import "./lesson.css";

/** What each song-wide or tool step is called in the progress line. */
const STEP_LABEL: Record<string, string> = {
  swing: "swing it", scale: "pick your scale", glue: "glue it", kit: "pick your kit", arp: "set the arp", key: "move the key",
  grid: "edit the notes", mic: "record a sound", comp: "comp the takes", macro: "map the macro",
  chords: "write the chord track", player: "let a player write it", chance: "vary the steps", length: "set its length", commit: "commit the loop",
};

type Quiz = Extract<LessonScreen, { kind: "quiz" }>;
type Page = LessonScreen | { kind: "add"; keep?: boolean; mark?: boolean } | { kind: "check" } | { kind: "done" };

export const SONG_EVENT = "ccd:song";
const QUESTION_KINDS = new Set(["quiz", "ear"]);

const pageName = (p: Page | undefined): string => {
  if (!p) return "";
  switch (p.kind) {
    case "hear": return "listen";
    case "say": return p.title.toLowerCase();
    case "play": return "play it in";
    case "shape": return "shape it";
    case "matchsound": return "match this sound";
    case "copy": return "copy it by ear";
    case "arrange": return p.goal === "export" ? "finish it" : p.goal === "fills" ? "fills" : p.goal === "drop" ? "the drop" : "arrange it";
    case "mix": return p.goal === "match" ? "match the tempo" : p.goal === "blend" ? "the blend" : "the mixer";
    case "tempo": return STEP_LABEL[p.set] ?? (p.set === "sample" ? (p.choices?.[0] === "slice" ? "slice it" : p.choices?.[0] === "warp" ? "warp it" : "shape a sample") : "set your tempo");
    case "ear": return "ear round";
    case "add": return p.mark ? "mark your song" : p.keep ? "keep it in your song" : "add it to your song";
    case "check": return "earn your stripe";
    case "done": return "done";
    default: return p.kind;
  }
};

// ── your song, always on top ─────────────────────────────────────────────────
/** `pending`: this lesson's part is recorded but not added yet, so the strip says so instead of "empty". */
export function SongStrip({ focus, pending: wait, ghost, slug, changes }: { focus?: string; pending?: boolean; ghost?: Take | null; slug?: string; changes?: boolean }) {
  const [t, setT] = useState<TrackV2 | null>(null);
  const [name, setName] = useState("my song");
  const [editing, setEditing] = useState(false);
  const [beat, setBeat] = useState(-1);
  const rename = (n: string) => {
    setEditing(false);
    const i = readSongs();
    if (n.trim()) { renameSong(i.active, n); window.dispatchEvent(new Event(SONG_EVENT)); }
  };
  const want = useRef(false);
  useEffect(() => {
    const read = () => {
      setT(readTrackV2());
      const i = readSongs();
      setName(i.songs.find(s => s.id === i.active)?.name ?? "my song");
    };
    read();
    window.addEventListener(SONG_EVENT, read);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener(SONG_EVENT, read); window.removeEventListener("storage", read); };
  }, []);
  const { engine, ready, id } = useEngineTrack(t ?? readTrackV2());
  useEffect(() => engine.on(evs => {
    for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing && engineOwner() === id ? e.beat : -1);
  }), [engine, id]);
  // Pressing play reads the song fresh, then starts once that render has reached the engine.
  useEffect(() => {
    if (!want.current || !t) return;
    want.current = false;
    void ready().then(() => { engine.metronome(false); engine.play(); });
  }, [t, ready, engine]);
  const playing = beat >= 0;
  const toggle = () => {
    if (playing) { engine.stop(); return; }
    want.current = true;
    setT(readTrackV2());
  };
  const v1 = t ? toV1View(t) : null;
  // The lanes draw at the strip's real width, so on a wide screen the song fills the strip instead of
  // sitting small in the middle; the part this lesson works on is lit.
  const bodyRef = useRef<HTMLDivElement>(null);
  const [laneW, setLaneW] = useState(338);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setLaneW(Math.max(338, Math.min(1100, Math.round(e.contentRect.width)))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const empty = !t || !t.layers.some(l => l.events.length);
  // Recorded but not added: goes away the moment the add step writes it, without waiting for the next step.
  const pending = !!wait && !(slug && t?.added.includes(slug));
  const loop = t?.loop ?? 4;
  const playhead = playing ? Math.floor(((((beat % loop) + loop) % loop) / loop) * 16) : -1;
  return (
    <section className="fl-song" aria-label="Your song">
      <button type="button" className={`fl-songplay ${playing ? "is-on" : ""}`} onClick={toggle} disabled={empty} aria-label={playing ? "Stop your song" : "Play your song"}>
        <Icon name={playing ? "stop" : "play"} />
      </button>
      <div className="fl-songbody" ref={bodyRef}>
        <div className="fl-songname">{editing
          ? <input className="fl-songinput" defaultValue={name} maxLength={24} autoFocus aria-label="Song name"
              onBlur={e => rename(e.currentTarget.value)} onKeyDown={e => { if (e.key === "Enter") rename(e.currentTarget.value); if (e.key === "Escape") setEditing(false); }} />
          : <button type="button" className="fl-songrename" onClick={() => setEditing(true)} aria-label={`Rename ${name}`}><b>{name.toLowerCase()}</b><Icon name="edit" small /></button>}<span>{pending ? `your ${focus ?? "part"} ${/(hats|chords|drums|claps|snares)$/.test(focus ?? "") ? "are" : "is"} recorded, not added yet` : empty ? "empty so far" : `${t?.bpm ?? 120} bpm`}</span></div>
        {empty
          ? <div className="fl-songempty">{pending ? `your ${focus ?? "part"} goes in when you add it at the end of this lesson` : changes ? "nothing in it yet. this lesson works on a starter loop, and it becomes your song" : focus ? `nothing in it yet. this lesson adds the ${focus}` : "nothing in it yet"}</div>
          : v1 && <Lanes track={v1} playhead={playhead} width={laneW} sel={v1.layers.find(l => focus && (l.kind === focus || focus.includes(l.kind)))?.id ?? null} />}
        {!empty && t?.sections?.length ? (
          // Your arrangement under the loop: one block per section, as long as it lasts, fainter where parts drop out.
          <div className="fl-secs" role="img" aria-label={`Arranged: ${t.sections.map(x => x.name).join(", ")}`}>
            {t.sections.map((x, i) => <i key={i} style={{ flexGrow: x.bars, opacity: 1 - Math.min(0.6, x.off.length * 0.2) }}>{x.name}</i>)}
          </div>
        ) : null}
        {!empty && cuesOf(t).length ? (
          <div className="fl-cues" role="img" aria-label={`Cues: ${cuesOf(t).map(c => `${c.name}, bar ${c.bar}`).join("; ")}`}>
            {cuesOf(t).map(c => <i key={c.slug}><b>bar {c.bar}</b>{c.name}</i>)}
          </div>
        ) : null}
        {pending && ghost?.events.length ? <Ghost take={ghost} loop={loop} name={focus ?? "new part"} /> : null}
      </div>
    </section>
  );
}

/** The part you just recorded, drawn as a dashed lane under your song until you add it. */
function Ghost({ take, loop, name }: { take: Take; loop: number; name: string }) {
  const W = 160;
  return (
    <div className="fl-ghost" role="img" aria-label={`your ${name}, not added yet`}>
      <svg viewBox={`0 0 ${W} 10`} preserveAspectRatio="none" aria-hidden>
        {take.events.map((e, i) => {
          const x = ((((e.start % loop) + loop) % loop) / loop) * W;
          return <rect key={i} x={x} y={1.5} width={Math.max(1.6, Math.min(W - x, (e.len / loop) * W))} height={7} rx={1.5} />;
        })}
      </svg>
      <span>{name}</span>
    </div>
  );
}

// ── header: back, where you are, what's next ─────────────────────────────────
function Top({ back, crumb, title, pages, at, accent, onPrev }: { back: string; crumb: string; title: string; pages: Page[]; at: number; accent: string; onPrev?: () => void }) {
  return (
    <header className="fl-top">
      <div className="fl-row">
        <Link href={back} className="fl-back" aria-label="Back to your lessons"><Icon name="back" /></Link>
        <div className="fl-crumb"><span>{crumb}</span><b>{title}</b></div>
        {onPrev && <button type="button" className="fl-stepback" onClick={onPrev} aria-label="Previous step"><Icon name="back" small />step back</button>}
        <div className="fl-count" aria-label={`Step ${at + 1} of ${pages.length}`}>{at + 1}<i>/</i>{pages.length}</div>
      </div>
      <div className="ls-seg" style={{ ["--c" as string]: accent } as CSSProperties} aria-hidden>
        {pages.map((_, i) => <i key={i} className={i < at ? "is-done" : i === at ? "is-now" : ""} />)}
      </div>
      <div className="fl-now"><span>{pageName(pages[at])}</span>{pages[at + 1] ? <span>next: {pageName(pages[at + 1])}</span> : null}</div>
    </header>
  );
}

// ── count along: the clip plays and the beat number lights up big ──────────────
function CountAlong({ clip }: { clip: string }) {
  const track = useMemo(() => clipVariants(clip)[0]?.track ?? readTrackV2(), [clip]);
  const { engine, ready } = useEngineTrack(track);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { let gone = false; void ready().then(() => { if (gone) return; engine.metronome(false); engine.play(); }).catch(() => { /* needs a tap */ }); return () => { gone = true; }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const n = beat >= 0 ? (Math.floor(beat) % 4) : -1;
  const bar = beat >= 0 ? Math.floor(beat / 4) % 2 : 0;
  return (
    <Screen>
      <Meta left={beat >= 0 ? `bar ${bar + 1}` : "press play"} right={`${track.bpm} bpm`} />
      <div className="fl-count4" aria-live="off">
        {[1, 2, 3, 4].map((x, i) => <span key={x} className={i === n ? "is-on" : ""}>{x}</span>)}
      </div>
      <div className="fl-barkeys"><button type="button" className="ls-chip" onClick={() => { if (beat >= 0) engine.stop(); else void ready().then(() => engine.play()); }}>{beat >= 0 ? "stop" : "play the kick"}</button></div>
    </Screen>
  );
}

// ── your bar: what you played, shown and looping while you read ───────────────
function TakeBar({ mission, take }: { mission: Mission; take: Take }) {
  const slug = mission.slug;
  const track = useMemo(() => applyTake({ ...readTrackV2(), added: [] }, slug, take, worldOf(slug) ?? undefined, readShape(slug)), [slug, take]);
  const { engine, ready } = useEngineTrack(track);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { let gone = false; void ready().then(() => { if (gone) return; engine.metronome(false); engine.play(); }).catch(() => { /* needs a tap */ }); return () => { gone = true; }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const loop = track.loop || 4;
  const at = beat >= 0 ? (((beat % loop) + loop) % loop) : -1;
  const W = 330, H = 70, bw = W / loop;
  return (
    <Screen>
      <Meta left="your bar" right={beat >= 0 ? `beat ${Math.floor(at) + 1}` : "press play"} />
      <svg viewBox={`0 0 ${W} ${H + 14}`} width="100%" className="fl-bar" role="img" aria-label={`Your bar: ${take.events.length} hits over ${loop} beats`}>
        {Array.from({ length: loop }, (_, i) => (
          <g key={i}>
            <rect x={i * bw + 2} y={0} width={bw - 4} height={H} rx={8} fill={at >= i && at < i + 1 ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.04)"} />
            <text x={i * bw + bw / 2} y={H + 12} textAnchor="middle" fontSize={10} fill="var(--disp-sub)">{i + 1}</text>
          </g>
        ))}
        {take.events.map((e, i) => {
          const x = (((e.start % loop) + loop) % loop) * bw + 6;
          const lit = at >= 0 && at - (e.start % loop) >= 0 && at - (e.start % loop) < 0.25;
          return <circle key={i} cx={x + 8} cy={H / 2} r={lit ? 14 : 10} fill="var(--led-mint)" opacity={lit ? 1 : 0.7} />;
        })}
      </svg>
      <div className="fl-barkeys"><button type="button" className="ls-chip" onClick={() => { if (beat >= 0) engine.stop(); else void ready().then(() => engine.play()); }}>{beat >= 0 ? "stop" : "play your bar"}</button></div>
    </Screen>
  );
}

// ── add to your song: the moment the part goes in ───────────────────────────
const SET_NOUN: Record<string, string> = { tempo: "tempo", swing: "swing", scale: "scale", glue: "glue", kit: "kit", arp: "arp", key: "key", grid: "notes", mic: "recording", comp: "comp", sample: "sample", macro: "macro", chords: "chord track", player: "notes", chance: "variation", length: "part length", commit: "sections" };
/** What a lesson with nothing to play in changes about your song, in a word ("arrangement", "arp"), or null when it shapes a part. */
export function changeNoun(screens: LessonScreen[]): string | null {
  const tool = [...screens].reverse().find(s => s.kind === "arrange" || s.kind === "tempo" || s.kind === "mix");
  if (!tool) return null;
  if (tool.kind === "arrange") return "arrangement";
  if (tool.kind === "mix") return "mix";
  return SET_NOUN[tool.set] ?? null;
}

function AddStep({ mission, take, hasQuestions, onNext, onSkipQuestions }: { mission: Mission; take: Take | null; hasQuestions: boolean; onNext: () => void; onSkipQuestions: () => void }) {
  const slug = mission.slug;
  const [base, setBase] = useState<TrackV2 | null>(null);
  useEffect(() => setBase(readTrackV2()), []);
  const line = useMemo(() => (take?.events.length ? take : presetTake(mission)), [take, mission]);
  const params = useMemo(() => readShape(slug), [slug]);
  // A lesson with nothing to play in (swing, tempo) changes the song in its own step; adding just keeps it.
  // A shape lesson on a part your song doesn't have yet adds the lesson's line with the sound you made,
  // rather than "keeping" knobs on nothing.
  const missingPart = useMemo(() => !changeNoun(mission.screens ?? []) && !readTrackV2().layers.some(l => l.type === line.type && l.events.length), [mission.screens, line.type]);
  // A play-in you skipped on a part your song already has keeps your part as it is: the lesson's preset
  // pattern would overwrite a steady kick with a "new pattern" you never played.
  // On drums, "your part" means the sound this lesson is about: a kick doesn't stand in for a skipped clap.
  const skippedOnOwn = useMemo(() => {
    if (take?.events.length) return false;
    const want = new Set(line.events.map(e => e.note));
    const drumish = line.type === "drums" || line.type === "hats";
    return readTrackV2().layers.some(l => l.type === line.type && l.events.length && (!drumish || l.events.some(e => want.has(e.note))));
  }, [take, line]);
  const keepOnly = useMemo(() => (!(mission.screens ?? []).some(s => s.kind === "play" || s.kind === "copy") || skippedOnOwn) && songHasMusic() && !missingPart, [mission.screens, missingPart, skippedOnOwn]);
  // A dj lesson marks your song where its mixer move lands (src/lib/cues.ts).
  const mixGoal = useMemo(() => (changeNoun(mission.screens ?? []) === "mix" ? [...(mission.screens ?? [])].reverse().find(s => s.kind === "mix") : undefined), [mission.screens]);
  // A skipped mixer step leaves nothing to mark: the song is kept as it is, and the copy says so.
  const mixSkipped = useMemo(() => { try { return typeof window !== "undefined" && sessionStorage.getItem(MIX_SKIP) === location.pathname; } catch { return false; } }, []);
  const cue = mixGoal?.kind === "mix" && base && !mixSkipped ? cueFor(base, slug, mixGoal.goal) : null;
  const world = worldOf(slug) ?? undefined;
  const already = !!base?.added.includes(slug);
  const [added, setAdded] = useState(false);
  const isIn = added || already;
  // Keep-only lessons still carry the knobs you turned in their shape step onto your part.
  const tuned = (t: TrackV2): TrackV2 => withParams(t, line.type, params);
  // Knobs this lesson turned on your other parts come along too.
  const others = (t: TrackV2): TrackV2 => otherShapes(slug).reduce((a, [type, p]) => withParams(a, type, p), t);
  const preview = useMemo(() => (base ? (isIn ? base : others(keepOnly ? tuned(base) : applyTake({ ...base, added: [] }, slug, line, world, params))) : null), [base, isIn, keepOnly, slug, line, world, params]); // eslint-disable-line react-hooks/exhaustive-deps
  const { engine, ready } = useEngineTrack(preview ?? readTrackV2());
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  const playing = beat >= 0;
  // It plays straight away: this is your song with the new part in it.
  useEffect(() => {
    if (!preview) return;
    let gone = false;
    void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ });
    return () => { gone = true; };
  }, [!!preview]); // eslint-disable-line react-hooks/exhaustive-deps
  const add = () => {
    const now = readTrackV2();
    // Kept for the done screen's "with it / without it".
    try { if (!now.added.includes(slug) && !sessionStorage.getItem(beforeKey(slug))) sessionStorage.setItem(beforeKey(slug), JSON.stringify(now)); } catch { /* ignore */ }
    // A dj lesson on an empty song: deck a played the kick-and-clap starter, so that loop becomes your song.
    const djStarter = !!mixGoal && !now.layers.some(l => l.events.length) && !now.added.includes(slug);
    const made = now.added.includes(slug) ? now : djStarter ? { ...now, ...clipVariants("kick-and-clap")[0].track, added: [...now.added, slug], updatedAt: Date.now() } : others(keepOnly ? { ...tuned(now), added: [...now.added, slug], updatedAt: Date.now() } : applyTake(now, slug, line, world, params));
    const next = mixGoal?.kind === "mix" && !mixSkipped && !now.added.includes(slug) ? withCue(made, cueFor(made, slug, mixGoal.goal)) : made;
    writeTrackV2(next);
    nameSongIfNew();
    setBase(next);
    setAdded(true);
    playFanfare();
    window.dispatchEvent(new Event(SONG_EVENT));
    track("lesson_part_added", { missionSlug: slug, own: !!take?.events.length });
  };
  const v1 = preview ? toV1View(preview) : null;
  const loop = preview?.loop ?? 4;
  const playhead = playing ? Math.floor(((((beat % loop) + loop) % loop) / loop) * 16) : -1;
  // Name drums by what you actually played: a snare take is "your snare", not the lesson's clap.
  const played = take?.events.length && line.type === "drums" ? drumNames(take.events.map(e => e.note)) : null;
  const part = played || mission.fromFile?.adds.part || "part";
  // A lesson that changed your song in its own step (an arrangement, an arp) keeps that, not a part.
  const noun = keepOnly ? changeNoun(mission.screens ?? []) ?? `${part} sound` : null;
  const what = noun ?? part;
  // "your chords are in", "your bass is in".
  const is = (/s$/.test(what) && !/(ss|bass)$/.test(what)) || / and /.test(what) ? "are" : "is";
  useEnter(isIn ? onNext : add);
  return (
    <div className="ls-col">
      <div className="fl-inst">
      <Screen>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" className={`ls-sticker ${playing ? "m1-dancing" : ""}`} />
        <Meta left={isIn ? "in your song" : noun ? "your song, as you left it" : take?.events.length ? `the ${part} you played` : "the lesson's pattern"} />
        <div className={`ls-title ${isIn ? "fl-pop" : ""}`}>{cue ? (isIn ? `your song is marked: ${cue.name}` : `mark your song: ${cue.name}`) : isIn ? `your ${what} ${is} in your song` : noun ? `keep your ${what}` : `add your ${part} to your song`}</div>
        <div className={`fl-lanes ${isIn ? "is-in" : ""}`}>{v1 && <Lanes track={v1} playhead={playhead} />}</div>
      </Screen>
      </div>
      <div className="fl-text">
      <p className="ls-read">
        {cue
          ? isIn
            ? `deck a now knows where your ${cue.name} lands: bar ${cue.bar}. it's on the song strip, and every dj lesson from here marks your song the same way.${hasQuestions ? " next: earn your stripe, or skip it and keep mixing." : ""}`
            : keepOnly
              ? `your song sounds the same. this puts a "${cue.name}" cue on bar ${cue.bar}, the way djs mark a track before a set, so you know where the move lands.`
              : `your song was empty, so deck a played a starter loop, a kick and a clap. that loop becomes your song, with a "${cue.name}" cue on bar ${cue.bar}.`
          : mixSkipped
          ? `you skipped the mixer, so there's no move to mark on your song this time. do the lesson again to mark it.`
          : isIn
          ? `this is your song now. ${noun ? "every lesson from here builds on it." : `every lesson from here adds something on top of ${/s$/.test(part) && !/(ss|bass)$/.test(part) ? "these" : "this"} ${part}.`} ${hasQuestions ? "next: earn your stripe, a quick test of what you just learnt. or skip it and keep building." : ""}`
          : noun ? `this is your song with your ${what}. keep it and it stays.` : missingPart && !take?.events.length ? `your song has no ${part} yet, so this adds the lesson's ${part} line with the sound you made. add it and it stays.` : `this is what your song sounds like with your ${part} in it. add it and it stays.`}
      </p>
      {isIn && hasQuestions && <button type="button" className="ls-skip" onClick={onSkipQuestions}>skip the challenge</button>}
      </div>
      <Bottom
        left={{ label: playing ? "stop" : "hear", icon: playing ? "stop" : "hear", onClick: () => { if (playing) engine.stop(); else void ready().then(() => engine.play()); } }}
        go={isIn ? { label: hasQuestions ? "earn your stripe" : "finish", onClick: onNext } : { label: <><Icon name="plus" />{cue ? "mark my song" : noun ? "keep in my song" : "add to my song"}</>, onClick: add, aria: cue ? "Mark my song" : noun ? "Keep in my song" : "Add to my song" }} />
    </div>
  );
}

// ── questions: easy to hard, try again on a miss, more if you want them ────────
function CheckStep({ main, bank, onDone, onScore }: { main: Quiz[]; bank: Quiz[]; onDone: () => void; onScore: (firstTry: boolean) => void }) {
  const [list, setList] = useState(main);
  const [i, setI] = useState(0);
  const [out, setOut] = useState<number[]>([]);
  const [right, setRight] = useState(false);
  const [missed, setMissed] = useState<number | null>(null);
  const q = list[i];
  const last = i >= list.length - 1;
  const more = bank.filter(b => !list.includes(b));
  const pick = (k: number) => {
    if (right || out.includes(k)) return;
    if (k === q.answer) {
      setRight(true);
      setMissed(null);
      playCorrect();
      onScore(out.length === 0);
    } else {
      setOut(o => [...o, k]);
      setMissed(k);
      playWrong();
    }
  };
  const next = () => { setI(n => n + 1); setOut([]); setRight(false); setMissed(null); };
  const askMore = () => { setList(l => [...l, more[0]]); next(); };
  useEnter(right ? (last ? onDone : next) : null);
  if (!q) return null;
  return (
    <div className="ls-col">
      <div className="fl-inst">
      <Screen>
        <div className="fl-stripes" aria-hidden>{list.map((_, k) => <i key={k} className={k < i || (k === i && right) ? "is-on" : ""} />)}</div>
        <Meta left={`stripe challenge · ${i + 1} of ${list.length}`} right={right ? "right" : out.length ? "try again" : "tap one"} />
        <div className="ls-title is-small"><Gloss>{q.q}</Gloss></div>
      </Screen>
      <div className="fl-opts" role="radiogroup" aria-label="Answers">
        {q.options.map((o, k) => {
          const cls = right && k === q.answer ? "is-right" : out.includes(k) ? "is-out" : "";
          return <button key={k} type="button" role="radio" aria-checked={right && k === q.answer} disabled={right || out.includes(k)} className={`fl-opt ${cls}`} onClick={() => pick(k)}>{o}</button>;
        })}
      </div>
      </div>
      <div className="fl-text">
      {missed !== null && !right && <div className="fl-why is-wrong" role="status"><b>not quite.</b> <Gloss>{q.whyWrong?.[missed] ?? q.hint ?? "have another go."}</Gloss></div>}
      {right && <div className="fl-why is-right" role="status"><b>{out.length ? "got it." : "right."}</b> <Gloss>{q.explain}</Gloss></div>}
      <button type="button" className="ls-skip" onClick={onDone}>skip the challenge</button>
      </div>
      <Bottom
        left={right && last && more.length ? { label: "ask more", icon: "plus", onClick: askMore, aria: "Ask me another question" } : undefined}
        go={!right ? { label: "pick an answer", disabled: true } : { label: last ? "finish" : "next question", onClick: last ? onDone : next }} />
    </div>
  );
}

// ── done ─────────────────────────────────────────────────────────────────────
type Reward = { stripe: "gold" | "silver" | null; trophies: Trophy[]; xp: number; xpBefore: number; world: CurWorld | null; doneBefore: Record<string, unknown>; doneAfter: Record<string, unknown> };

function Rewards({ r }: { r: Reward }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!r.xp) return;
    let k = 0; const id = window.setInterval(() => { k += Math.max(1, Math.round(r.xp / 20)); setN(Math.min(r.xp, k)); if (k >= r.xp) window.clearInterval(id); }, 40);
    return () => window.clearInterval(id);
  }, [r.xp]);
  // Your rank in this lesson's world: a dj lesson moves your dj rank, nothing else.
  const before = r.world ? worldRankFor(r.world, r.doneBefore) : null;
  const rank = r.world ? worldRankFor(r.world, r.doneAfter) : null;
  const up = !!(before && rank && rank.idx > before.idx);
  return (
    <div className="fl-reward">
      <div className="fl-rw-row">
        <div className="fl-xp"><b>+{n}</b><span>xp</span></div>
        {r.stripe ? <div className={`fl-stripe is-${r.stripe}`}><i /><i /><i /><span>{r.stripe} stripe</span></div> : <div className="fl-stripe is-none"><span>no stripe yet · take the challenge</span></div>}
      </div>
      {rank && r.world && <div className={`fl-rank ${up ? "is-up" : ""}`}><span>{up ? `${WORLD_NAME[r.world]} rank up: ${rank.current.name}` : `${WORLD_NAME[r.world]}: ${rank.current.name}`}</span><div><i style={{ width: `${Math.round(rank.progress * 100)}%` }} /></div><span>{rank.next ? rank.next.name : `top ${WORLD_NAME[r.world]} rank`}</span></div>}
      {r.trophies.map((t, i) => (
        <div key={t.id} className="fl-trophy" style={{ animationDelay: `${600 + i * 250}ms` }}><b><Icon name={t.icon} /></b><span><small>trophy unlocked</small>{t.name}<em>{t.line}</em></span></div>
      ))}
    </div>
  );
}

const beforeKey = (slug: string) => `ccd.before.${slug}`;

/** Your song with what this lesson added, and without it. Pressing either plays it. */
function WithWithout({ slug }: { slug: string }) {
  const [pair, setPair] = useState<{ with: TrackV2; without: TrackV2 } | null>(null);
  const [same, setSame] = useState<string | null>(null);
  const [diff, setDiff] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(beforeKey(slug));
      const now = readTrackV2();
      const before = raw ? (JSON.parse(raw) as TrackV2) : null;
      if (!before) return;
      // What changed, in words: every lesson acts on your song, and this says how.
      setDiff(songDiff(before, now));
      // Only worth comparing by ear when there was a song before this lesson: "before" can't be silence.
      if (before.layers.some(l => l.events.length) && now.layers.some(l => l.events.length)) {
        // Two identical songs are no comparison: say what changed instead (a cue, or nothing you can hear).
        if (soundsSame(before, now)) {
          const cue = cuesOf(now).find(c => c.slug === slug);
          setSame(cue ? `your song sounds the same: this lesson marked it with a "${cue.name}" cue on bar ${cue.bar}.` : "your song sounds the same as before this lesson. tune it again to make the change yours.");
        } else setPair({ with: now, without: before });
      }
    } catch { /* no snapshot */ }
  }, [slug]);
  const [which, setWhich] = useState<"with" | "without" | null>(null);
  const { engine, ready } = useEngineTrack((pair && which ? pair[which] : null) ?? readTrackV2());
  useEffect(() => () => { try { engine.stop(); } catch { /* not started */ } }, [engine]);
  const changed = diff.length && !same ? (
    <div className="ls-panel fl-nextline fl-changed"><span className="ls-led" style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties} /><span><b>what changed</b> {diff.join(" · ")}</span></div>
  ) : null;
  if (same) return <div className="ls-panel fl-nextline"><span className="ls-led" style={{ ["--c" as string]: "var(--led-cobalt, #5c7cff)" } as CSSProperties} /><span>{same}</span></div>;
  if (!pair) return changed;
  const play = (w: "with" | "without") => {
    if (which === w) { engine.stop(); setWhich(null); return; }
    setWhich(w);
    void ready().then(() => window.setTimeout(() => { engine.metronome(false); engine.play(); }, 60));
  };
  return (
    <>
      {changed}
      <Silk label="hear the difference" right={which ? (which === "with" ? "with it" : "without it") : "tap one"} />
      <div className="ls-pads fl-ab" role="radiogroup" aria-label="Your song with and without this lesson">
        {(["with", "without"] as const).map(w => (
          <button key={w} type="button" role="radio" aria-checked={which === w} className={`ls-pad ${which === w ? "is-lit" : ""}`} style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties} onClick={() => play(w)}>
            <small><Icon name={which === w ? "stop" : "play"} small /></small><span>{w === "with" ? "your song now" : "before this lesson"}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/** The deeper lessons and bonus rounds that hang off this lesson, or, in one of them, the way back. */
function GoDeeper({ slug }: { slug: string }) {
  const item = curItem(slug);
  const extras = extrasOf(item?.kind === "song" ? slug : item?.parent ?? "").filter(e => e.slug !== slug);
  if (!extras.length) return null;
  return (
    <>
      <Silk label={item?.kind === "song" ? "go deeper, if you like" : "more on this"} right={`${extras.length}`} />
      <ul className="fl-deeper">
        {extras.map(e => (
          <li key={e.slug}>
            <Link href={`/learn/${e.slug}`}><b className={`jv-kind is-${e.kind}`}>{e.kind}</b><span>{e.title.replace(/^bonus: /, "")}<small>{e.does}{isRebuilt(e.slug) ? "" : " · old version"}</small></span><Icon name="play" small /></Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function DoneStep({ reward, mission, nextHref, nextTitle, back, firstTry, asked, onRetune, onMore }: { reward: Reward | null; mission: Mission; nextHref: string; nextTitle?: string; back: string; firstTry: number; asked: number; onRetune?: () => void; onMore?: () => void }) {
  const f = mission.fromFile!;
  useEffect(() => { playFanfare(); }, []);
  return (
    <div className="ls-col">
      <div className="fl-inst">
      <Screen>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" className="ls-sticker m1-dancing" />
        <Meta left="lesson done" right={asked ? `${firstTry} of ${asked} first try` : undefined} />
        <div className="ls-title is-big fl-pop">{mission.title.toLowerCase()}</div>
      </Screen>
      <WithWithout slug={mission.slug} />
      {f.next && <div className="ls-panel fl-nextline"><span className="ls-led" style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties} /><span><Gloss>{f.next}</Gloss></span></div>}
      </div>
      <div className="fl-text">
      {/* The reward first, then what you can do now, then the optional deeper lessons. */}
      {reward && <Rewards r={reward} />}
      <Silk label="you can now" />
      <ul className="ls-learn is-ticks">{f.items.map((l, i) => <li key={i}><b><Icon name="check" small /></b>{l}</li>)}</ul>
      <div className="fl-again">
        {onRetune && <button type="button" className="ls-chip" onClick={onRetune}>tune it again</button>}
        {onMore && <button type="button" className="ls-chip" onClick={onMore}>more questions</button>}
      </div>
      <GoDeeper slug={mission.slug} />
      </div>
      <Bottom left={{ label: "lessons", icon: "back", href: back }} go={{ label: nextTitle ? `next: ${nextTitle.toLowerCase()}` : "back to lessons", href: nextHref }} />
    </div>
  );
}

// ── say it another way: the same idea in other words, or simpler ─────────────
type Way = "mentor" | "straight" | "eli5";
const textOf = (s: LessonScreen | undefined): string => (s && "body" in s && typeof s.body === "string" ? s.body : "");
function Ways({ way, setWay, has }: { way: Way; setWay: (w: Way) => void; has: { straight: boolean; eli5: boolean } }) {
  if (!has.straight && !has.eli5 && way === "mentor") return null;
  return (
    <div className="fl-ways" role="group" aria-label="Explain it differently">
      {way !== "mentor" && <button type="button" className="ls-chip" onClick={() => setWay("mentor")}>explain it fully</button>}
      {has.straight && way !== "straight" && <button type="button" className="ls-chip" onClick={() => setWay("straight")}>{way === "mentor" ? "say it another way" : "keep it short"}</button>}
      {has.eli5 && way !== "eli5" && <button type="button" className="ls-chip" onClick={() => setWay("eli5")}>simpler please</button>}
    </div>
  );
}

// ── the player ───────────────────────────────────────────────────────────────
export function FileLesson({ mission, nextSlug, nextTitle, onComplete }: { mission: Mission; nextSlug?: string; nextTitle?: string; onComplete: () => void }) {
  const screens = useMemo(() => mission.screens ?? [], [mission.screens]);
  const { progress, completeMission } = useProgress();
  const alreadyDone = !!progress.completedMissions[mission.slug];
  const world = worldOf(mission.slug) ?? "producer";
  const accent = WORLD_LED[world];
  const ctx = getMissionContext(mission.slug);
  const back = ctx.worldRoute || "/";
  const nextHref = nextSlug ? `/learn/${nextSlug}` : back;
  const quizzes = screens.filter((s): s is Quiz => s.kind === "quiz");
  const main = quizzes.filter(q => !q.more);
  const bank = quizzes.filter(q => q.more);
  const pages: Page[] = useMemo(() => [
    ...screens.filter(s => s.kind !== "hook" && s.kind !== "summary" && !QUESTION_KINDS.has(s.kind)),
    ...screens.filter(s => s.kind === "ear"),
    // A bonus round adds nothing to your song, so it has no add step.
    // Nothing goes into your song in a bonus round or a lesson with nothing to play, shape or set (the dj
    // mixer lessons), so those have no add step.
    ...(curItem(mission.slug)?.kind === "bonus" || !changesSong(screens) ? [] : [{ kind: "add" as const, keep: !screens.some(s => s.kind === "play" || s.kind === "copy") && !!changeNoun(screens), mark: changeNoun(screens) === "mix" }]),
    ...(main.length ? [{ kind: "check" as const }] : []),
    { kind: "done" as const },
  ], [screens, main.length]);
  const at = (k: string) => pages.findIndex(p => p.kind === k);
  const SESSION = `ccd.lesson.${mission.slug}`;
  const [idx, setIdx] = useState(0);
  const [take, setTake] = useState<Take | null>(null);
  // What this lesson's copy step gave you, if it has one.
  const copied = useRef<Take | null>(null);
  const [score, setScore] = useState({ first: 0, asked: 0 });
  const [extra, setExtra] = useState(false);
  const finished = useRef(false);
  const [reward, setReward] = useState<Reward | null>(null);
  // The other ways of saying each step, lined up with this lesson's screens.
  const alts = useMemo(() => {
    const f = fileLesson(mission.slug);
    if (!f) return null;
    return { straight: lessonToMission(f, { voice: "straight", level: "standard" }).screens ?? [], eli5: lessonToMission(f, { voice: "eli5", level: "standard" }).screens ?? [] };
  }, [mission.slug]);
  // You start in the way you picked when you joined; the buttons switch it for one step.
  const [prefs] = usePrefs();
  const [way, setWay] = useState<Way>(prefs.voice);
  const ttype = takeType(offerFor({ ...readTrack(), added: [] }, mission).kind);
  // What you played in this lesson, in your song: the tempo step plays it back at the speed you turn to.
  const mineTrack = useMemo(() => (take?.events.length ? applyTake({ ...readTrackV2(), added: [] }, mission.slug, take, world, readShape(mission.slug)) : null), [take, mission.slug, world]);

  useEffect(() => {
    // One song runs through every world: basics, producer and dj all add to the same song.
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION) ?? "null") as { idx: number; at?: number } | null;
      const resumed = !!(saved && saved.idx > 0 && saved.idx < pages.length && Date.now() - (saved.at ?? 0) < 3 * 3600_000);
      if (resumed && saved) setIdx(saved.idx);
      // The done screen's "before this lesson" is the song as it was when the lesson opened: some steps
      // (an arrangement, a tempo) write to the song before the add step.
      const now = readTrackV2();
      if (!now.added.includes(mission.slug) && (!resumed || !sessionStorage.getItem(beforeKey(mission.slug)))) sessionStorage.setItem(beforeKey(mission.slug), JSON.stringify(now));
    } catch { /* fresh */ }
    setTake(readTake(mission.slug));
    track("lesson_started", { missionSlug: mission.slug, world: mission.world, xp: mission.xp, alreadyCompleted: alreadyDone });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { try { sessionStorage.setItem(SESSION, JSON.stringify({ idx, at: Date.now() })); } catch { /* ignore */ } }, [idx, SESSION]);

  const go = useCallback((n: number) => { setIdx(Math.max(0, Math.min(pages.length - 1, n))); window.scrollTo({ top: 0 }); }, [pages.length]);
  const next = useCallback(() => go(idx + 1), [go, idx]);
  const base = pages[idx];
  useEffect(() => setWay(prefs.voice), [idx, prefs.voice]);
  const si = base ? screens.indexOf(base as LessonScreen) : -1;
  const altOf = (w: "straight" | "eli5") => (alts && si >= 0 ? alts[w][si] : undefined);
  const has = { straight: !!textOf(altOf("straight")) && textOf(altOf("straight")) !== textOf(base as LessonScreen), eli5: !!textOf(altOf("eli5")) && textOf(altOf("eli5")) !== textOf(base as LessonScreen) };
  const cur = (way !== "mentor" && altOf(way)?.kind === base?.kind ? altOf(way) : base) as Page | undefined;
  const ways = <Ways way={way} setWay={w => { setWay(w); track("lesson_way", { missionSlug: mission.slug, step: idx, way: w }); }} has={has} />;

  useEffect(() => {
    if (cur?.kind !== "done" || finished.current) return;
    finished.current = true;
    const s = score.asked ? score.first / score.asked : 1;
    const doneBefore = { ...progress.completedMissions };
    const st = score.asked ? earnStripe(mission.slug, score.first === score.asked) : { before: readStripes(), after: readStripes() };
    setReward({ stripe: score.asked ? (score.first === score.asked ? "gold" : "silver") : null, trophies: newTrophies(st.before, st.after, doneBefore, { ...doneBefore, [mission.slug]: true }), xp: alreadyDone ? 0 : mission.xp, xpBefore: progress.xp, world: (curPathOf(mission.slug)?.world ?? null), doneBefore, doneAfter: { ...doneBefore, [mission.slug]: true } });
    completeMission(mission.slug, alreadyDone ? 0 : mission.xp, s, mission.badge?.slug);
    window.dispatchEvent(new CustomEvent("progress:server_event", { detail: { type: "mission_complete", missionSlug: mission.slug, xp: mission.xp, score: s } }));
    track("lesson_completed", { missionSlug: mission.slug, world: mission.world, score: s, quizTotal: score.asked, correctCount: score.first });
    try { sessionStorage.removeItem(SESSION); } catch { /* ignore */ }
    onComplete();
  }, [cur?.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  let body = null;
  if (cur) switch (cur.kind) {
    case "say": {
      // Once you've played something, the explanations after it show your own bar, looping.
      const after = at("play") >= 0 && idx > at("play") && take?.events.length;
      const visual = cur.clip ? <CountAlong clip={cur.clip} /> : after && take ? <TakeBar mission={mission} take={take} /> : undefined;
      body = <SayStep screen={cur} meta={pageName(cur)} onNext={next} tail={ways} visual={visual} />;
      break;
    }
    case "hear": body = <HearStep screen={cur} meta="listen" onNext={next} tail={ways} />; break;
    case "shape": body = <ShapeStep mission={mission} screen={cur} meta="shape it" accent={accent} onNext={next} tail={ways} />; break;
    case "matchsound": body = <MatchSoundStep mission={mission} screen={cur} onNext={next} tail={ways} />; break;
    // What you copy becomes this lesson's part (the add step puts it in your song); a play step after it starts from it.
    case "copy": body = <CopyStep mission={mission} screen={cur} onNext={next} tail={ways} onKeep={t => { copied.current = t; setTake(t); saveTake(mission.slug, t); }} />; break;
    case "arrange": body = <ArrangeStep screen={cur} accent={accent} onNext={next} tail={ways} />; break;
    case "mix": body = <MixStep screen={cur} accent={accent} onNext={next} tail={ways} />; break;
    case "tempo": body = <TempoStep screen={cur} accent={accent} onNext={next} tail={ways} mine={mineTrack} />; break;
    case "ear": body = <EarStep screen={cur} meta="ear round" level="standard" onNext={next} />; break;
    case "play":
      body = <TryIt type={ttype} coach={{ body: cur.body, hint: cur.hint, goal: cur.goal, tail: ways, snap: cur.snap }} initial={take?.type === ttype ? take.events : undefined} title="play it in"
        onUse={t => { setTake(t); saveTake(mission.slug, t); next(); }}
        // Skipping the play-in after a copy step keeps what you copied as the lesson's part.
        onSkip={() => { const keep = copied.current; setTake(keep); saveTake(mission.slug, keep); next(); }} />;
      break;
    case "add": body = <AddStep mission={mission} take={take} hasQuestions={main.length > 0} onNext={next} onSkipQuestions={() => go(at("done"))} />; break;
    case "check":
      body = <CheckStep key={extra ? "more" : "main"} main={extra ? bank : main} bank={extra ? [] : bank} onDone={() => { setExtra(false); go(at("done")); }}
        onScore={first => setScore(s => ({ first: s.first + (first ? 1 : 0), asked: s.asked + 1 }))} />;
      break;
    case "done":
      body = <DoneStep reward={reward} mission={mission} nextHref={nextHref} nextTitle={nextTitle} back={back} firstTry={score.first} asked={score.asked}
        onRetune={at("shape") >= 0 ? () => go(at("shape")) : undefined}
        onMore={bank.length ? () => { setExtra(true); go(at("check") >= 0 ? at("check") : idx); } : undefined} />;
      break;
  }

  const n = mission.number ?? 1;
  const ci = curItem(mission.slug);
  const cp = curPathOf(mission.slug);
  const crumb = ci?.kind === "deeper" && ci.parent ? `${WORLD_LABEL[world]} · go deeper on ${partOf(ci.parent)}` : ci?.kind === "bonus" ? `${WORLD_LABEL[world]} · bonus round` : cp ? `${WORLD_LABEL[world]} · ${cp.title} · lesson\u00a0${songItems(cp.world).findIndex(i => i.slug === mission.slug) + 1}` : `${WORLD_LABEL[world]} · lesson\u00a0${n}`;
  return (
    <div className="ls fl" data-world={world} data-step={idx} data-page-kind={cur?.kind}>
      <Top back={back} crumb={crumb} title={mission.title.toLowerCase()} pages={pages} at={idx} accent={accent} onPrev={idx > 0 && cur?.kind !== "done" ? () => go(idx - 1) : undefined} />
      <SongStrip focus={pages.some(p => p.kind === "add") ? mission.fromFile?.adds.part : undefined} pending={!!take?.events.length && pages[idx]?.kind !== "done"} ghost={take} slug={mission.slug} changes={pages.some(p => p.kind === "add" && p.keep)} />
      <div className="ls-stage fl-stage" key={idx}>{body}</div>
    </div>
  );
}
