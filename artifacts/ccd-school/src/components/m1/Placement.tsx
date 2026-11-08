"use client";
/**
 * Find your level (src/lib/placement.ts). For learners who already make music: about three minutes, by ear and
 * by hand, no questions. Four stations, each skippable:
 * 1 time: tap with the kick for two bars; how steady the taps are (device delay taken out).
 * 2 copy: a one-bar drum pattern by ear on the copy grid (src/components/m1/CopyEar.tsx).
 * 3 ears: two notes, which is higher; two bass notes, which is brighter. Four rounds.
 * 4 match: a bass sound on two notched knobs (src/components/m1/MatchSound.tsx), three checks.
 * The result says where the learner starts and what that does to their song, then places them.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FLAG, OUT, BASS_PARAMS } from "@/engine";
import { useProgress } from "@/lib/progress";
import { copyStars } from "@/lib/copyEar";
import { matchKnob, matchSong, type MatchQuestion } from "@/lib/gym/match";
import { matchStars, notch, passes, which } from "@/lib/matchScore";
import { buildPlacedSong, LEVEL_SAYS, medianOffset, placeIn, readPlacement, savePlacement, type PlaceResult, type PlaceScores } from "@/lib/placement";
import { learn } from "@/lib/learnEvents";
import { emptyTrackV2, newLayerV2, readTrackV2, type NoteEvent, type TrackV2 } from "@/lib/track2";
import { nameSongIfNew, newSong } from "@/lib/songs";
import { missionAny, partOf, worldSteps, WORLD_LABEL, type WorldId } from "@/lib/worldOrder";
import { GoPill, Icon, Key, Screen, Silk, WORLD_LED } from "./controls";
import { Meta, useEnter } from "./LessonParts";
import { CopyGrid, CopyMeter, CopySides, copyTip, useCopy } from "./CopyEar";
import { MatchKnobs, MatchMeter, MatchSides, useMatch, type K } from "./MatchSound";
import { useEngineTrack } from "./useEngineTrack";
import "./lesson.css";
import "./placement.css";

type Stage = "intro" | "time" | "copy" | "ears" | "match" | "result";
const STATIONS: { id: Stage; name: string; line: string }[] = [
  { id: "time", name: "time", line: "tap with the kick for two bars" },
  { id: "copy", name: "copy", line: "write a drum pattern you hear" },
  { id: "ears", name: "ears", line: "higher or lower, brighter or darker" },
  { id: "match", name: "match", line: "make a bass sound like another" },
];
const WORLDS: { id: WorldId; name: string; line: string }[] = [
  { id: "producer", name: "producer", line: "i make tracks, or want to" },
  { id: "fundamentals", name: "basics", line: "i play, or know some theory" },
  { id: "dj", name: "dj", line: "i mix, or want to" },
];

// ── header: the same shape as a lesson's ─────────────────────────────────────
function Top({ world, at, onClose }: { world: WorldId; at: number; onClose?: () => void }) {
  const st = STATIONS[at - 1];
  return (
    <header className="fl-top">
      <div className="fl-row">
        {onClose ? <button type="button" className="fl-back" onClick={onClose} aria-label="Close find your level"><Icon name="close" /></button>
          : <Link href="/learn" className="fl-back" aria-label="Back to all lessons"><Icon name="back" /></Link>}
        <div className="fl-crumb"><span>find your level · {WORLD_LABEL[world]}</span><b>{st ? st.name : at === 0 ? "already make music?" : "your level"}</b></div>
        {st ? <div className="fl-count" aria-label={`Part ${at} of 4`}>{at}<i>/</i>4</div> : null}
      </div>
      <div className="ls-seg" style={{ ["--c" as string]: WORLD_LED[world] } as CSSProperties} aria-hidden>
        {STATIONS.map((_, i) => <i key={i} className={i < at - 1 || at > 4 ? "is-done" : i === at - 1 ? "is-now" : ""} />)}
      </div>
      <div className="fl-now"><span>{st ? st.line : at === 0 ? "about three minutes, by ear and by hand" : "where you start"}</span>{st && STATIONS[at] ? <span>next: {STATIONS[at].name}</span> : null}</div>
    </header>
  );
}

function Bottom3({ left, mid, go }: { left?: ReactNode; mid?: ReactNode; go: ReactNode }) {
  return <div className="ls-bottom"><div className="m1-g">{left}{mid}{go}</div></div>;
}

// ── 1 time ───────────────────────────────────────────────────────────────────
const BPM = 112;
const TAPS = 8;
function timeTrack(): TrackV2 {
  const t = { ...emptyTrackV2(), bpm: BPM, loop: 4 };
  const d = newLayerV2("drums", "__place"); d.events = [0, 1, 2, 3].map(start => ({ note: 36, vel: 0.95, start, len: 0.2 }));
  const h = newLayerV2("hats", "__place"); h.events = [0.5, 1.5, 2.5, 3.5].map(start => ({ note: 42, vel: 0.55, start, len: 0.1 }));
  return { ...t, layers: [d, h] };
}
/** The engine's beat at a moment on the performance clock, from the last few position reports with the tempo known (least squares on the offset, so one late report doesn't move it). */
function beatAt(hist: { t: number; b: number }[], at: number): number | null {
  if (hist.length < 3) return null;
  const k = BPM / 60000;
  const c = hist.reduce((a, h) => a + (h.b - k * h.t), 0) / hist.length;
  return c + k * at;
}

function TimeStation({ onDone }: { onDone: (ms: number | null, offsets: number[]) => void }) {
  const track = useMemo(timeTrack, []);
  const { engine, ready } = useEngineTrack(track);
  const hist = useRef<{ t: number; b: number }[]>([]);
  const total = useRef(0);
  const [beat, setBeat] = useState(-1);
  const [taps, setTaps] = useState<number[]>([]);
  const [lit, setLit] = useState(false);
  useEffect(() => engine.on(evs => {
    for (const e of evs) if (e.kind === OUT.pos) {
      if (e.flags & FLAG.playing) {
        const now = performance.now();
        // The loop's position wraps every bar; unwrap it so beats keep counting up.
        const last = hist.current[hist.current.length - 1];
        let b = e.beat;
        if (last) { while (b + total.current < last.b - 2) total.current += 4; b += total.current; }
        hist.current.push({ t: now, b });
        if (hist.current.length > 48) hist.current.shift();
        setBeat(b);
      } else setBeat(-1);
    }
  }), [engine]);
  useEffect(() => () => { try { engine.stop(); } catch { /* not started */ } }, [engine]);
  const playing = beat >= 0;
  const listening = playing && beat < 4;
  const start = () => { hist.current = []; total.current = 0; setTaps([]); void ready().then(() => { engine.metronome(false); engine.play(); }); };
  const tap = (at: number) => {
    setLit(true); window.setTimeout(() => setLit(false), 120);
    void ready().then(() => { engine.noteOn(0, 39, 0.7, at); window.setTimeout(() => engine.noteOff(0, 39), 90); });
    if (!playing || taps.length >= TAPS) return;
    const b = beatAt(hist.current, at);
    if (b === null || b < 3.5) return;
    setTaps(x => [...x, (b - Math.round(b)) * (60000 / BPM)]);
  };
  // The device's own delay is the same on every tap, so it comes out: what counts is how far each tap sits from your usual place.
  const mid = taps.length ? [...taps].sort((a, b) => a - b)[Math.floor(taps.length / 2)] : 0;
  const rel = taps.map(t => t - mid);
  const spread = medianOffset(rel);
  const done = taps.length >= TAPS;
  useEffect(() => { if (done) engine.stop(); }, [done, engine]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.code === "Space" && !e.repeat && (e.target as Element)?.tagName !== "BUTTON") { e.preventDefault(); tap(e.timeStamp); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  const W = 300;
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left={done ? "your taps" : listening ? "listen for a bar" : playing ? `tap ${taps.length + 1} of ${TAPS}` : "press start"} right={`${BPM} bpm`} />
          <div className="fl-count4" aria-hidden>{[1, 2, 3, 4].map((x, i) => <span key={x} className={playing && Math.floor(beat) % 4 === i ? "is-on" : ""}>{x}</span>)}</div>
          <svg viewBox={`0 0 ${W} 54`} width="100%" className="pl-taps" role="img" aria-label={done ? `Your taps sit within ${spread} ms of each other` : `${taps.length} taps so far`}>
            <line x1={W / 2} x2={W / 2} y1={4} y2={50} stroke="var(--disp-sub)" strokeDasharray="2 3" />
            <text x={6} y={52} fontSize={9} fill="var(--disp-sub)">early</text><text x={W - 6} y={52} fontSize={9} fill="var(--disp-sub)" textAnchor="end">late</text>
            {rel.map((o, i) => <circle key={i} cx={W / 2 + Math.max(-1, Math.min(1, o / 80)) * (W / 2 - 14)} cy={10 + (i % 4) * 9} r={5} fill={Math.abs(o) <= 30 ? "var(--led-mint)" : "#F3C14F"} />)}
          </svg>
        </Screen>
        <button type="button" className={`pl-tap ${lit ? "is-on" : ""}`} onPointerDown={e => tap(e.timeStamp)} aria-label="Tap with the kick" disabled={done}>tap</button>
      </div>
      <div className="fl-text">
        <p className="ls-read">The kick plays four to the bar. Listen for one bar, then tap the pad (or the space bar) on every kick, eight taps.</p>
        {done ? <p className="ls-read ms-done" role="status">{spread !== null && spread <= 28 ? `tight: your taps sit within ${spread} ms of each other.` : spread !== null && spread <= 45 ? `steady: within ${spread} ms of each other.` : `your taps wander about ${spread} ms. that's fine, the drums lessons work on it.`}</p>
          : <div className="ls-hint">headphones help. any delay your device adds is the same every tap, so it doesn't count against you.</div>}
      </div>
      <Bottom3
        left={<Key label="skip" onClick={() => { engine.stop(); onDone(null, []); }} ariaLabel="Skip this step"><Icon name="back" className="ls-flip" /></Key>}
        mid={<Key label={playing ? "stop" : "again"} onClick={() => (playing ? engine.stop() : start())} ariaLabel={playing ? "Stop" : "Start again"}><Icon name={playing ? "stop" : "play"} /></Key>}
        go={<GoPill onClick={done ? () => onDone(spread, rel) : playing ? undefined : start} disabled={playing && !done} style={{ gridColumn: "span 2" }} ariaLabel={done ? "Next: copy by ear" : "Start the beat"}>{done ? "next: copy" : playing ? `${taps.length} of ${TAPS}` : "start the beat"}</GoPill>} />
    </div>
  );
}

// ── 2 copy ───────────────────────────────────────────────────────────────────
const PATTERN = { kick: "x.....x...x.....", clap: "....x.......x...", hat: "..x...x...x...x." };
function CopyStation({ onDone }: { onDone: (stars: 0 | 1 | 2 | 3) => void }) {
  const song = useMemo<TrackV2>(() => ({ ...emptyTrackV2(), bpm: BPM, loop: 4, layers: [] }), []);
  const c = useCopy({ song, layer: "drums", pattern: PATTERN, level: "standard" });
  const tip = copyTip(c, "drums");
  const finish = () => { c.engine.stop(); onDone(c.done ? copyStars(c.checks, c.hints.length) : 0); };
  useEnter(c.done ? finish : null);
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left="copy by ear" right={c.side === "target" ? "playing the target" : "playing yours"} />
          <CopyMeter c={c} idle={`${c.target.length} hits to find · checks are free`} />
          <CopyGrid c={c} layer="drums" />
        </Screen>
        <Silk label="switch between them" right={c.side === "target" ? "the target" : "yours"} />
        <CopySides c={c} />
      </div>
      <div className="fl-text">
        <p className="ls-read">A kick, a clap and a hat. Write what you hear on the grid, switch to yours to compare, then check. Fewer checks earn more stars.</p>
        {tip ? <div className="ls-hint" role="status">{tip}</div> : null}
        {c.done ? <p className="ls-read ms-done" role="status">every hit, by ear.</p> : null}
        {c.checks >= 3 && !c.done ? <button type="button" className="ls-skip" onClick={finish}>move on without it</button> : null}
      </div>
      <Bottom3
        left={<Key label={c.playing ? "stop" : "play"} onClick={c.hear} ariaPressed={c.playing} ariaLabel={c.playing ? "Stop" : "Play"}><Icon name={c.playing ? "stop" : "play"} /></Key>}
        mid={c.checks && !c.done
          ? <Key label="hint" onClick={() => c.hint()} ariaLabel="Show where one missing hit goes"><span aria-hidden style={{ fontSize: 18 }}>?</span></Key>
          : <Key label="skip" onClick={() => { c.engine.stop(); onDone(0); }} ariaLabel="Skip this step"><Icon name="back" className="ls-flip" /></Key>}
        go={<GoPill onClick={c.done ? finish : () => { c.check(); }} style={{ gridColumn: "span 2" }} ariaLabel={c.done ? "Next: your ears" : "Check your notes"}>{c.done ? "next: ears" : c.grade ? `${c.grade.right}/${c.grade.total} · check again` : "check"}</GoPill>} />
    </div>
  );
}

// ── 3 ears ───────────────────────────────────────────────────────────────────
type Ear = { kind: "pitch" | "bright"; second: boolean };
const CUT = BASS_PARAMS.find(p => p.key === "cutoff")!.index;
function earTrack(r: Ear, seed: number): TrackV2 {
  const t = { ...emptyTrackV2(), bpm: 120, loop: 4 };
  if (r.kind === "pitch") {
    const base = 64 + (seed % 5);
    const l = newLayerV2("lead", "__place");
    const hi = base + 1, lo = base;
    l.events = [{ note: r.second ? lo : hi, vel: 0.85, start: 0, len: 1.2 }, { note: r.second ? hi : lo, vel: 0.85, start: 2, len: 1.2 }] as NoteEvent[];
    return { ...t, layers: [l] };
  }
  const phrase = (start: number): NoteEvent[] => [0, 0.5, 1].map(o => ({ note: 36 + (seed % 3) * 2, vel: 0.9, start: start + o, len: 0.4 }));
  const a = newLayerV2("bass", "__place"); a.events = phrase(0);
  const b = newLayerV2("bass", "__place2"); b.events = phrase(2);
  // Two notches of nine apart: plain to a trained ear, not to a new one.
  const dark = 0.34, bright = 0.56;
  a.params = { [CUT]: r.second ? dark : bright };
  b.params = { [CUT]: r.second ? bright : dark };
  return { ...t, layers: [a, b] };
}
function EarsStation({ onDone }: { onDone: (right: number, total: number) => void }) {
  const rounds = useMemo<Ear[]>(() => (["pitch", "bright", "pitch", "bright"] as const).map(kind => ({ kind, second: Math.random() < 0.5 })), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const r = rounds[i];
  const track = useMemo(() => earTrack(r, i * 7 + 3), [r, i]);
  const { engine, ready } = useEngineTrack(track);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const play = () => {
    window.clearTimeout(timer.current);
    void ready().then(() => { engine.stop(); engine.metronome(false); engine.play(); setPlaying(true); timer.current = window.setTimeout(() => { engine.stop(); setPlaying(false); }, 2050); });
  };
  useEffect(() => () => { window.clearTimeout(timer.current); try { engine.stop(); } catch { /* not started */ } }, [engine]);
  const answer = r.kind === "pitch" ? (r.second ? 1 : 0) : (r.second ? 1 : 0);
  const pick = (k: number) => { if (picked !== null) return; setPicked(k); if (k === answer) setRight(n => n + 1); };
  const next = () => { if (i >= rounds.length - 1) { engine.stop(); onDone(right, rounds.length); return; } setI(n => n + 1); setPicked(null); };
  const q = r.kind === "pitch" ? "which note is higher?" : "which bass is brighter?";
  useEnter(picked !== null ? next : null);
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left={`ear ${i + 1} of ${rounds.length}`} right={picked === null ? (playing ? "playing" : "press play") : picked === answer ? "right" : "not this time"} color={picked === null ? undefined : picked === answer ? "var(--led-mint)" : "var(--led-red)"} />
          <div className="ls-title" aria-live="polite">{picked === null ? q : picked === answer ? `yes, the ${answer ? "second" : "first"}.` : `it was the ${answer ? "second" : "first"}.`}</div>
          <p className="ls-sub">{r.kind === "pitch" ? "one semitone apart." : "the same notes, the filter a little more open on one."}</p>
        </Screen>
        <div className="ls-pads" role="radiogroup" aria-label={q} style={{ marginTop: 12 }}>
          {["first", "second"].map((l, k) => (
            <button key={l} type="button" role="radio" aria-checked={picked === k} disabled={picked !== null}
              className={`ls-pad ${picked === null ? "" : k === answer ? "is-lit is-right" : picked === k ? "is-lit is-wrong" : "is-dim"}`}
              style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties} onClick={() => pick(k)}>
              <small>{String.fromCharCode(97 + k)}</small><span>the {l}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="fl-text">
        <p className="ls-read">Four quick ones: two on pitch, two on tone. Play as often as you like, then pick.</p>
      </div>
      <Bottom3
        left={<Key label="skip" onClick={() => { engine.stop(); onDone(right, rounds.length); }} ariaLabel="Skip this step"><Icon name="back" className="ls-flip" /></Key>}
        mid={<Key label="play" onClick={play} ariaPressed={playing} ariaLabel="Play the two"><Icon name="play" /></Key>}
        go={<GoPill onClick={picked !== null ? next : play} style={{ gridColumn: "span 2" }} ariaLabel={picked !== null ? (i >= rounds.length - 1 ? "Next: match" : "Next ear") : "Play the two"}>{picked !== null ? (i >= rounds.length - 1 ? "next: match" : "next ear") : "play the two"}</GoPill>} />
    </div>
  );
}

// ── 4 match ──────────────────────────────────────────────────────────────────
const MATCH_TRIES = 3;
function MatchStation({ onDone }: { onDone: (stars: 0 | 1 | 2 | 3) => void }) {
  const q = useMemo<MatchQuestion>(() => {
    const start: Record<string, number> = {}, target: Record<string, number> = {};
    for (const [key, by] of [["cutoff", 0.375], ["decay", 0.25]] as const) {
      const s = notch(matchKnob("bass", key)!.spec.default, 8);
      start[key] = s;
      target[key] = notch(Math.max(0.125, Math.min(0.875, s > 0.5 ? s - by : s + by)), 8);
    }
    return { drill: "match", part: "bass", knobs: ["cutoff", "decay"], target, start, transpose: 0, bpm: 116 };
  }, []);
  const { song, part } = useMemo(() => matchSong(q), [q]);
  const knobs = useMemo(() => q.knobs.map(k => matchKnob("bass", k)).filter((k): k is K => !!k), [q]);
  const target = useMemo(() => Object.fromEntries(knobs.map(k => [k.index, q.target[k.spec.key]])) as Record<number, number>, [knobs, q]);
  const start = useMemo(() => Object.fromEntries(knobs.map(k => [k.index, q.start[k.spec.key]])) as Record<number, number>, [knobs, q]);
  const m = useMatch({ song, part, knobs, target, start, notches: 8 });
  const passed = passes(m.result);
  const out = !passed && m.tries >= MATCH_TRIES;
  const stars: 0 | 1 | 2 | 3 = passed ? (m.tries <= 1 ? 3 : m.tries === 2 ? 2 : 1) : 0;
  const finish = () => { m.engine.stop(); onDone(stars); };
  useEnter(passed || out ? finish : null);
  const w = m.worst;
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left={`match this sound · ${Math.min(m.tries + (passed || out ? 0 : 1), MATCH_TRIES)} of ${MATCH_TRIES} checks`} right={m.side === "target" ? "playing the target" : "playing yours"} />
          <MatchMeter m={m} hint={out && w ? `the target's ${w.k.spec.label} was ${which(w.k.spec.key, w.d > 0)}` : null} passed={passed} />
        </Screen>
        <Silk label="switch between them" right={m.side === "target" ? "the target" : "yours"} />
        <MatchSides m={m} />
        <MatchKnobs m={m} knobs={knobs} locked={passed || out} reveal={out ? target : undefined} />
      </div>
      <div className="fl-text">
        <p className="ls-read">A bass line with its cutoff and decay set out of sight. Turn yours until it sounds the same. The knobs click between nine positions; after a check each goes green or red.</p>
        {passed ? <p className="ls-read ms-done" role="status">matched in {m.tries} {m.tries === 1 ? "check" : "checks"}.</p> : out ? <p className="ls-read" role="status">close enough to tell us where you are. the target&apos;s settings are under the knobs.</p> : null}
      </div>
      <Bottom3
        left={<Key label={m.playing ? "stop" : "play"} onClick={m.hear} ariaPressed={m.playing} ariaLabel={m.playing ? "Stop" : "Play"}><Icon name={m.playing ? "stop" : "play"} /></Key>}
        mid={<Key label="skip" onClick={() => { m.engine.stop(); onDone(0); }} ariaLabel="Skip this step"><Icon name="back" className="ls-flip" /></Key>}
        go={<GoPill onClick={passed || out ? finish : () => void m.check()} disabled={m.busy} style={{ gridColumn: "span 2" }} ariaLabel={passed || out ? "See your level" : "Check how close yours is"}>{passed || out ? "see my level" : m.busy ? "listening" : m.result ? `${m.result.close}% · check again` : "check"}</GoPill>} />
    </div>
  );
}

// ── the result ───────────────────────────────────────────────────────────────
export function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return <span className="wc-stars" role="img" aria-label={`${n} of ${of} stars`}>{Array.from({ length: of }, (_, i) => <b key={i} className={i < n ? "is-on" : ""}>★</b>)}</span>;
}
function Result({ r, onPlace, onTop, again }: { r: PlaceResult; onPlace: () => void; onTop: () => void; again: () => void }) {
  const s = r.scores;
  const steps = worldSteps(r.world);
  const title = (missionAny(r.slug)?.title ?? r.slug).toLowerCase();
  const parts = [...new Set(r.skipped.map(partOf))];
  const rows: [string, ReactNode, boolean][] = [
    ["time", s.timingMs === null ? "skipped" : `within ${s.timingMs} ms`, s.timingMs !== null && s.timingMs <= 45],
    ["copy", s.copyStars ? <Stars n={s.copyStars} /> : "not yet", s.copyStars >= 2],
    ["ears", `${s.ears} of ${s.earsTotal}`, s.ears >= s.earsTotal - 1],
    ["match", s.matchStars ? <Stars n={s.matchStars} /> : "not yet", s.matchStars >= 1],
  ];
  useEnter(onPlace);
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left="your level" right={`${WORLD_LABEL[r.world]} · lesson ${r.index + 1} of ${steps.length}`} />
          <div className="ls-title is-big fl-pop">{title}</div>
          <p className="ls-sub">{LEVEL_SAYS[r.world][r.level]}.</p>
        </Screen>
        <Silk label="what we heard" />
        <ul className="pl-rows">
          {rows.map(([k, v, ok]) => <li key={k}><span className="ls-led" style={{ ["--c" as string]: ok ? "var(--led-mint)" : "#8A8A8E" } as CSSProperties} /><b>{k}</b><span>{v}</span></li>)}
        </ul>
      </div>
      <div className="fl-text">
        {r.skipped.length ? (
          <p className="ls-read">The {r.skipped.length} song lessons before it are marked passed, and their parts go into your song as those lessons would make them: {parts.join(", ")}. You can open any of them any time, and do them for real.</p>
        ) : <p className="ls-read">Start at the top. The first lessons go quickly when you know them, and each adds a part to your song.</p>}
        <p className="ls-read">This is a start point, not a grade. Take it again from all lessons whenever you like.</p>
        {r.skipped.length ? <button type="button" className="ls-skip" onClick={onTop}>start from the top instead</button> : null}
      </div>
      <Bottom3
        left={<Key label="again" onClick={again} ariaLabel="Take it again"><Icon name="back" /></Key>}
        go={<GoPill onClick={onPlace} style={{ gridColumn: "span 3" }} ariaLabel={`Start ${title}`}>start {title}</GoPill>} />
    </div>
  );
}

// ── the whole thing ──────────────────────────────────────────────────────────
export function Placement({ world: w0, onDone, onClose, startNow }: { world?: WorldId; onDone?: (slug: string) => void; onClose?: () => void; startNow?: boolean }) {
  const router = useRouter();
  const { placeOut } = useProgress();
  const [world, setWorld] = useState<WorldId>(w0 ?? "producer");
  const [stage, setStage] = useState<Stage>(startNow ? "time" : "intro");
  const [last, setLast] = useState<PlaceResult | null>(null);
  useEffect(() => setLast(readPlacement()), []);
  const scores = useRef<PlaceScores>({ timingMs: null, copyStars: 0, ears: 0, earsTotal: 4, matchStars: 0 });
  const t0 = useRef(Date.now());
  const [result, setResult] = useState<PlaceResult | null>(null);
  const at = stage === "intro" ? 0 : stage === "result" ? 5 : STATIONS.findIndex(s => s.id === stage) + 1;
  const begin = () => { scores.current = { timingMs: null, copyStars: 0, ears: 0, earsTotal: 4, matchStars: 0 }; t0.current = Date.now(); setStage("time"); };
  const toResult = () => setResult(placeIn(world, scores.current));
  useEffect(() => { if (result) setStage("result"); }, [result]);
  const finish = (r: PlaceResult, chose: "placed" | "top") => {
    learn("placement_result", { world: r.world, level: r.level, slug: chose === "placed" ? r.slug : steps0(r.world), skipped: chose === "placed" ? r.skipped.length : 0, chose, timingMs: r.scores.timingMs, copyStars: r.scores.copyStars, ears: r.scores.ears, matchStars: r.scores.matchStars, seconds: Math.round((Date.now() - t0.current) / 1000), retake: !!last });
    if (chose === "placed" && r.skipped.length) {
      // A song with music that no lesson made (the studio's starter loop) stays as it is: the placed parts go in a new song.
      const t = readTrackV2();
      if (t.layers.some(l => l.events.length) && !t.added.length) newSong();
      buildPlacedSong(r.skipped, r.world);
      nameSongIfNew();
      window.dispatchEvent(new Event("ccd:song"));
    }
    const before = last?.world === r.world ? last.skipped : [];
    placeOut(chose === "placed" ? r.skipped : [], before);
    savePlacement(chose === "placed" ? r : { ...r, level: 0, index: 0, skipped: [], slug: steps0(r.world) });
    const slug = chose === "placed" ? r.slug : steps0(r.world);
    if (onDone) onDone(slug); else router.push(`/learn/${slug}`);
  };
  return (
    <div className="ls fl pl" data-world={world} data-stage={stage}>
      <Top world={world} at={at} onClose={onClose} />
      <div className="ls-stage fl-stage" key={stage}>
        {stage === "intro" && (
          <div className="ls-col">
            <div className="fl-inst">
              <Screen>
                <Meta left="find your level" right="about 3 minutes" />
                <div className="ls-title">already make music?</div>
                <p className="ls-sub">four short tests by ear and by hand, no questions. we start you where the lessons get new for you, and your song still gets every part the earlier lessons add.</p>
              </Screen>
              <Silk label="which world" />
              <div className="ls-pads is-one" role="radiogroup" aria-label="Which world to place you in">
                {WORLDS.map(w => (
                  <button key={w.id} type="button" role="radio" aria-checked={world === w.id} className={`ls-pad ${world === w.id ? "is-lit" : ""}`} style={{ ["--c" as string]: WORLD_LED[w.id] } as CSSProperties} onClick={() => setWorld(w.id)}>
                    <small>{w.name}</small><span>{w.line}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="fl-text">
              <ul className="pl-rows">{STATIONS.map((s, i) => <li key={s.id}><span className="ls-led" style={{ ["--c" as string]: WORLD_LED[world] } as CSSProperties} /><b>{i + 1} {s.name}</b><span>{s.line}</span></li>)}</ul>
              <p className="ls-read">Every part can be skipped. Headphones help.</p>
              {last ? <p className="ls-read pl-last">Last time: {WORLD_LABEL[last.world]}, from {(missionAny(last.slug)?.title ?? last.slug).toLowerCase()}. Taking it again moves your start point either way; lessons you did yourself stay done.</p> : null}
            </div>
            <Bottom3 go={<GoPill onClick={begin} style={{ gridColumn: "1 / -1" }} ariaLabel="Start finding your level">{last ? "take it again" : "start"}</GoPill>} />
          </div>
        )}
        {stage === "time" && <TimeStation onDone={(ms) => { scores.current.timingMs = ms; setStage("copy"); }} />}
        {stage === "copy" && <CopyStation onDone={st => { scores.current.copyStars = st; setStage("ears"); }} />}
        {stage === "ears" && <EarsStation onDone={(r, n) => { scores.current.ears = r; scores.current.earsTotal = n; setStage("match"); }} />}
        {stage === "match" && <MatchStation onDone={st => { scores.current.matchStars = st; toResult(); }} />}
        {stage === "result" && result && <Result r={result} onPlace={() => finish(result, "placed")} onTop={() => finish(result, "top")} again={() => { setResult(null); begin(); }} />}
      </div>
    </div>
  );
}
const steps0 = (w: WorldId) => worldSteps(w)[0]?.slug ?? "your-kick";
