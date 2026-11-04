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
import { applyTake, readTake, saveTake, takeType, type Take } from "@/lib/lessonTake";
import { offerFor, readTrack } from "@/lib/track";
import { readTrackV2, toV1View, writeTrackV2, type TrackV2 } from "@/lib/track2";
import { readSongs, newSong } from "@/lib/songs";
import { usePrefs } from "@/lib/prefs";
import { earnStripe, newTrophies, readStripes, type Trophy } from "@/lib/rewards";
import { rankFor } from "@/lib/ranks";
import { worldOf, WORLD_LABEL } from "@/lib/worldOrder";
import { fileLesson, lessonToMission } from "@/content/lessons/adapt";
import { clipVariants } from "@/content/lessons/clipTracks";
import { GoPill, Icon, Key, Screen, Silk, WORLD_LED } from "./controls";
import { Bottom, Meta, useEnter } from "./LessonParts";
import { CAT_SRC, Lanes } from "./shell";
import { TryIt } from "./TryIt";
import { presetTake } from "./AddToTrack";
import { EarStep, HearStep, SayStep, ShapeStep, readShape, songHasMusic, startsFresh } from "./LessonSteps";
import { engineOwner, useEngineTrack } from "./useEngineTrack";
import { Gloss } from "./Gloss";
import "./lesson.css";

type Quiz = Extract<LessonScreen, { kind: "quiz" }>;
type Page = LessonScreen | { kind: "add" } | { kind: "check" } | { kind: "done" };

export const SONG_EVENT = "ccd:song";
const QUESTION_KINDS = new Set(["quiz", "ear"]);

const pageName = (p: Page | undefined): string => {
  if (!p) return "";
  switch (p.kind) {
    case "hear": return "listen";
    case "say": return p.title.toLowerCase();
    case "play": return "play it in";
    case "shape": return "shape it";
    case "ear": return "ear round";
    case "add": return "add it to your song";
    case "check": return "earn your stripe";
    case "done": return "done";
    default: return p.kind;
  }
};

// ── your song, always on top ─────────────────────────────────────────────────
export function SongStrip({ focus }: { focus?: string }) {
  const [t, setT] = useState<TrackV2 | null>(null);
  const [name, setName] = useState("my song");
  const [beat, setBeat] = useState(-1);
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
  const empty = !t || !t.layers.some(l => l.events.length);
  const loop = t?.loop ?? 4;
  const playhead = playing ? Math.floor(((((beat % loop) + loop) % loop) / loop) * 16) : -1;
  return (
    <section className="fl-song" aria-label="Your song">
      <button type="button" className={`fl-songplay ${playing ? "is-on" : ""}`} onClick={toggle} disabled={empty} aria-label={playing ? "Stop your song" : "Play your song"}>
        <Icon name={playing ? "stop" : "play"} />
      </button>
      <div className="fl-songbody">
        <div className="fl-songname"><b>{name.toLowerCase()}</b><span>{empty ? "empty so far" : `${t?.bpm ?? 120} bpm`}</span></div>
        {empty
          ? <div className="fl-songempty">{focus ? `nothing in it yet. this lesson adds the ${focus}` : "nothing in it yet"}</div>
          : v1 && <Lanes track={v1} playhead={playhead} />}
      </div>
    </section>
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
          return <circle key={i} cx={x + 8} cy={H / 2} r={lit ? 14 : 10} fill="var(--led-go)" opacity={lit ? 1 : 0.7} />;
        })}
      </svg>
      <div className="fl-barkeys"><button type="button" className="ls-chip" onClick={() => { if (beat >= 0) engine.stop(); else void ready().then(() => engine.play()); }}>{beat >= 0 ? "stop" : "play your bar"}</button></div>
    </Screen>
  );
}

// ── add to your song: the moment the part goes in ───────────────────────────
function AddStep({ mission, take, hasQuestions, onNext, onSkipQuestions }: { mission: Mission; take: Take | null; hasQuestions: boolean; onNext: () => void; onSkipQuestions: () => void }) {
  const slug = mission.slug;
  const [base, setBase] = useState<TrackV2 | null>(null);
  useEffect(() => setBase(readTrackV2()), []);
  const line = useMemo(() => (take?.events.length ? take : presetTake(mission)), [take, mission]);
  const params = useMemo(() => readShape(slug), [slug]);
  const world = worldOf(slug) ?? undefined;
  const already = !!base?.added.includes(slug);
  const [added, setAdded] = useState(false);
  const isIn = added || already;
  const preview = useMemo(() => (base ? (isIn ? base : applyTake({ ...base, added: [] }, slug, line, world, params)) : null), [base, isIn, slug, line, world, params]);
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
    const next = now.added.includes(slug) ? now : applyTake(now, slug, line, world, params);
    writeTrackV2(next);
    setBase(next);
    setAdded(true);
    playFanfare();
    window.dispatchEvent(new Event(SONG_EVENT));
    track("lesson_part_added", { missionSlug: slug, own: !!take?.events.length });
  };
  const v1 = preview ? toV1View(preview) : null;
  const loop = preview?.loop ?? 4;
  const playhead = playing ? Math.floor(((((beat % loop) + loop) % loop) / loop) * 16) : -1;
  const part = mission.fromFile?.adds.part || "part";
  useEnter(isIn ? onNext : add);
  return (
    <div className="ls-col">
      <div className="fl-inst">
      <Screen>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" className={`ls-sticker ${playing ? "m1-dancing" : ""}`} />
        <Meta left={isIn ? "in your song" : take?.events.length ? "the kick you played" : "the lesson's pattern"} />
        <div className={`ls-title ${isIn ? "fl-pop" : ""}`}>{isIn ? `your ${part} is in your song` : `add your ${part} to your song`}</div>
        <div className={`fl-lanes ${isIn ? "is-in" : ""}`}>{v1 && <Lanes track={v1} playhead={playhead} />}</div>
      </Screen>
      </div>
      <div className="fl-text">
      <p className="ls-read">
        {isIn
          ? `this is your song now. every lesson from here adds something on top of this ${part}. ${hasQuestions ? "next: earn your stripe, a quick test of what you just learnt. or skip it and keep building." : ""}`
          : `this is what your song sounds like with your ${part} in it. add it and it stays.`}
      </p>
      {isIn && hasQuestions && <button type="button" className="ls-skip" onClick={onSkipQuestions}>skip the challenge</button>}
      </div>
      <Bottom
        left={{ label: playing ? "stop" : "hear", icon: playing ? "stop" : "hear", onClick: () => { if (playing) engine.stop(); else void ready().then(() => engine.play()); } }}
        go={isIn ? { label: hasQuestions ? "earn your stripe" : "finish", onClick: onNext } : { label: <><Icon name="plus" />add to my song</>, onClick: add, aria: "Add to my song" }} />
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
type Reward = { stripe: "gold" | "silver" | null; trophies: Trophy[]; xp: number; xpBefore: number };

function Rewards({ r }: { r: Reward }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!r.xp) return;
    let k = 0; const id = window.setInterval(() => { k += Math.max(1, Math.round(r.xp / 20)); setN(Math.min(r.xp, k)); if (k >= r.xp) window.clearInterval(id); }, 40);
    return () => window.clearInterval(id);
  }, [r.xp]);
  const rank = rankFor(r.xpBefore + n);
  return (
    <div className="fl-reward">
      <div className="fl-rw-row">
        <div className="fl-xp"><b>+{n}</b><span>xp</span></div>
        {r.stripe ? <div className={`fl-stripe is-${r.stripe}`}><i /><i /><i /><span>{r.stripe} stripe</span></div> : <div className="fl-stripe is-none"><span>no stripe yet · take the challenge</span></div>}
      </div>
      <div className="fl-rank"><span>{rank.current.name.toLowerCase()}</span><div><i style={{ width: `${Math.round(rank.progress * 100)}%` }} /></div><span>{rank.next ? rank.next.name.toLowerCase() : "top rank"}</span></div>
      {r.trophies.map((t, i) => (
        <div key={t.id} className="fl-trophy" style={{ animationDelay: `${600 + i * 250}ms` }}><b><Icon name={t.icon} /></b><span><small>trophy unlocked</small>{t.name}<em>{t.line}</em></span></div>
      ))}
    </div>
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
      </div>
      <div className="fl-text">
      {reward && <Rewards r={reward} />}
      <Silk label="you can now" />
      <ul className="ls-learn is-ticks">{f.items.map((l, i) => <li key={i}><b><Icon name="check" small /></b>{l}</li>)}</ul>
      {f.next && <div className="ls-panel"><span className="ls-led" style={{ ["--c" as string]: "var(--led-go)" } as CSSProperties} /><span><Gloss>{f.next}</Gloss></span></div>}
      <div className="fl-again">
        {onRetune && <button type="button" className="ls-chip" onClick={onRetune}>tune it again</button>}
        {onMore && <button type="button" className="ls-chip" onClick={onMore}>more questions</button>}
      </div>
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
    { kind: "add" as const },
    ...(main.length ? [{ kind: "check" as const }] : []),
    { kind: "done" as const },
  ], [screens, main.length]);
  const at = (k: string) => pages.findIndex(p => p.kind === k);
  const SESSION = `ccd.lesson.${mission.slug}`;
  const [idx, setIdx] = useState(0);
  const [take, setTake] = useState<Take | null>(null);
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

  useEffect(() => {
    // One song runs through every world: basics, producer and dj all add to the same song.
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION) ?? "null") as { idx: number; at?: number } | null;
      if (saved && saved.idx > 0 && saved.idx < pages.length && Date.now() - (saved.at ?? 0) < 3 * 3600_000) setIdx(saved.idx);
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
    setReward({ stripe: score.asked ? (score.first === score.asked ? "gold" : "silver") : null, trophies: newTrophies(st.before, st.after, doneBefore, { ...doneBefore, [mission.slug]: true }), xp: alreadyDone ? 0 : mission.xp, xpBefore: progress.xp });
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
    case "ear": body = <EarStep screen={cur} meta="ear round" level="standard" onNext={next} />; break;
    case "play":
      body = <TryIt type={ttype} coach={{ body: cur.body, hint: cur.hint, goal: cur.goal, tail: ways }} initial={take?.type === ttype ? take.events : undefined} title="play it in"
        onUse={t => { setTake(t); saveTake(mission.slug, t); next(); }}
        onSkip={() => { setTake(null); saveTake(mission.slug, null); next(); }} />;
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
  return (
    <div className="ls fl" data-world={world} data-step={idx} data-page-kind={cur?.kind}>
      <Top back={back} crumb={`${WORLD_LABEL[world]} · lesson ${n}`} title={mission.title.toLowerCase()} pages={pages} at={idx} accent={accent} onPrev={idx > 0 && cur?.kind !== "done" ? () => go(idx - 1) : undefined} />
      <SongStrip focus={mission.fromFile?.adds.part} />
      <div className="ls-stage fl-stage" key={idx}>{body}</div>
    </div>
  );
}
