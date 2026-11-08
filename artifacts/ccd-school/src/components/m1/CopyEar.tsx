"use client";
/**
 * Copy by ear (Building Blocks' recreation challenges; logic in src/lib/copyEar.ts). A hidden pattern plays
 * on the engine; the learner switches between it and theirs while it loops, taps notes onto a grid that
 * shows only the rows worth trying (Syntorial's notched knobs, for notes), and checks. Each note comes back
 * green or red with an arrow for which way it was off, plus how many are still missing. A hint shows where
 * one missing note goes. Unlimited checks; stars for few checks and no hints. The same pieces serve the
 * lesson step (CopyStep) and the ear gym (GymCopy in app/gym).
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FLAG, OUT } from "@/engine";
import type { LessonScreen, Mission } from "@/content/types";
import { DRUM_NAME, HAT_NOTES, STEP, copyStars, gradeCopy, parsePattern, rowsFor, sortEvents, type CopyLayer, type Grade, type Pattern } from "@/lib/copyEar";
import { NOTE_NAMES, keyName } from "@/lib/theory";
import { newLayerV2, readTrackV2, writeTrackV2, type LayerV2, type NoteEvent, type TrackV2 } from "@/lib/track2";
import type { Take } from "@/lib/lessonTake";
import { GoPill, Icon, Key, Screen, Silk } from "./controls";
import { Body, Meta, useEnter } from "./LessonParts";
import { Gloss } from "./Gloss";
import { useEngineTrack } from "./useEngineTrack";

type Of = Extract<LessonScreen, { kind: "copy" }>;
export type Level = "gentle" | "standard" | "hard";
const col = (b: number) => Math.round(b / STEP);
const keyOf = (c: number, note: number) => `${c}:${note}`;
const rowName = (layer: CopyLayer, n: number) => (layer === "drums" ? DRUM_NAME[n] ?? String(n) : `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}`);

/** Yours, as it plays: a tune's notes hold until the next one (up to two steps, a chord's four), so the length never gives the answer away or gets in the way. */
function voiced(layer: CopyLayer, evs: NoteEvent[], loop: number): NoteEvent[] {
  if (layer === "drums") return evs.map(e => ({ ...e, len: STEP }));
  const starts = [...new Set(evs.map(e => e.start))].sort((a, b) => a - b);
  const most = layer === "chords" ? STEP * 4 : STEP * 2;
  return evs.map(e => {
    const nxt = starts.find(s => s > e.start + 1e-6) ?? loop;
    return { ...e, len: Math.max(STEP, Math.min(most, nxt - e.start)) };
  });
}

/** The pattern as the parts that play it: drum hits on the rack, hats on the hats part. Keeps the song's own sounds when it has those parts. */
function partsFor(layer: CopyLayer, evs: NoteEvent[], song: TrackV2): LayerV2[] {
  const own = (t: LayerV2["type"]) => song.layers.find(l => l.type === t);
  const make = (t: LayerV2["type"], events: NoteEvent[]): LayerV2 => {
    const o = own(t);
    return { ...(o ?? newLayerV2(t, "__copy")), events, mute: false, solo: false };
  };
  if (layer !== "drums") return [make(layer, evs)];
  const out: LayerV2[] = [make("drums", evs.filter(e => !HAT_NOTES.has(e.note)))];
  const hats = evs.filter(e => HAT_NOTES.has(e.note));
  if (hats.length) out.push(make("hats", hats));
  return out;
}

/**
 * What a copy screen needs: the target and yours on the engine (switch while it loops), your notes, the
 * check and the hint. `song` gives the tempo, key and sounds; the pattern is read in its key.
 */
export function useCopy({ song, layer, pattern, level = "standard" }: { song: TrackV2 | null; layer: CopyLayer; pattern: Pattern; level?: Level }) {
  const parsed = useMemo(() => (song ? parsePattern(layer, pattern, song.root ?? 45, song.scale) : { events: [] as NoteEvent[], loop: 4 }), [song, layer, pattern]);
  return useCopyOn({ song, layer, target: parsed.events, loop: parsed.loop, level });
}

export function useCopyOn({ song, layer, target, loop, level }: { song: TrackV2 | null; layer: CopyLayer; target: NoteEvent[]; loop: number; level: Level }) {
  const rows = useMemo(() => (target.length && song ? rowsFor(layer, target, song.root ?? 45, song.scale, level) : []), [target, song, layer, level]);
  const [mine, setMine] = useState<NoteEvent[]>([]);
  const [side, setSide] = useState<"target" | "yours">("target");
  const heard = useMemo<TrackV2 | null>(() => {
    if (!song) return null;
    const evs = side === "target" ? target : voiced(layer, mine, loop);
    return { ...song, loop, sections: undefined, layers: partsFor(layer, evs, song) } as TrackV2;
  }, [song, side, target, mine, layer, loop]);
  const { engine, ready } = useEngineTrack(heard ?? readTrackV2());
  const [beat, setBeat] = useState(-1);
  const playing = beat >= 0;
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => () => { try { engine.stop(); } catch { /* not started */ } }, [engine]);
  // Hear the target first.
  useEffect(() => {
    if (!heard) return;
    let gone = false;
    void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ });
    return () => { gone = true; };
  }, [!!heard]); // eslint-disable-line react-hooks/exhaustive-deps
  const hear = async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); };
  const choose = (s: "target" | "yours") => { setSide(s); void ready().then(() => { if (!playing) engine.play(); }); };

  // Marks from the last check, by note and step; a note you move or add has none until the next check.
  const [marks, setMarks] = useState<Map<string, Grade["mine"][number]>>(new Map());
  const [grade, setGrade] = useState<Grade | null>(null);
  const [checks, setChecks] = useState(0);
  const [hints, setHints] = useState<NoteEvent[]>([]);
  const tap = (note: number, c: number) => {
    const start = c * STEP;
    const at = mine.findIndex(e => col(e.start) === c && e.note === note);
    let next: NoteEvent[];
    if (at >= 0) next = mine.filter((_, i) => i !== at);
    // A bass line or a melody has one note at a time: a tap on another row of the same step moves it there.
    else if (layer === "bass" || layer === "lead") next = [...mine.filter(e => col(e.start) !== c), { start, len: STEP, note, vel: 0.85 }];
    else next = [...mine, { start, len: STEP, note, vel: layer === "drums" ? 0.9 : 0.8 }];
    setMine(sortEvents(next));
    if (side !== "yours") setSide("yours");
  };
  const clear = () => { setMine([]); setMarks(new Map()); };
  const check = (): Grade => {
    const g = gradeCopy(target, mine);
    setGrade(g);
    setChecks(n => n + 1);
    setMarks(new Map(mine.map((e, i) => [keyOf(col(e.start), e.note), g.mine[i]])));
    return g;
  };
  // A hint shows where one missing note goes: the earliest one not yet written or hinted.
  const hint = () => {
    const have = new Set(mine.map(e => keyOf(col(e.start), e.note)));
    const shown = new Set(hints.map(e => keyOf(col(e.start), e.note)));
    const next = target.find(e => !have.has(keyOf(col(e.start), e.note)) && !shown.has(keyOf(col(e.start), e.note)));
    if (next) setHints(h => [...h, next]);
    return next ?? null;
  };
  const done = !!grade?.done && mine.length === target.length && marks.size === mine.length && [...marks.values()].every(m => m.mark === "right");
  const stars = done ? copyStars(checks, hints.length) : null;
  return { target, loop, rows, mine, setMine, side, choose, hear, playing, beat, engine, tap, clear, check, grade, checks, marks, hint, hints, done, stars };
}
export type Copy = ReturnType<typeof useCopyOn>;

/** The grid: only the rows worth trying, a column per sixteenth, your notes marked after a check. */
/** What the grid draws from: a copy screen's state, or any notes shown on it (the imagine step shows a phrase this way). */
export type GridView = Pick<Copy, "loop" | "playing" | "beat" | "mine" | "target" | "hints" | "marks" | "rows" | "tap">;
export function CopyGrid({ c, layer, accent, locked, reveal }: { c: GridView; layer: CopyLayer; accent?: string; locked?: boolean; reveal?: boolean }) {
  const cols = Math.round(c.loop / STEP);
  const now = c.playing ? Math.floor((((c.beat % c.loop) + c.loop) % c.loop) / STEP) : -1;
  const has = new Set(c.mine.map(e => keyOf(col(e.start), e.note)));
  const want = new Set(c.target.map(e => keyOf(col(e.start), e.note)));
  const hinted = new Set(c.hints.map(e => keyOf(col(e.start), e.note)));
  const arrow = { up: "↑", down: "↓", early: "›", late: "‹" } as const;
  const say = { up: "higher", down: "lower", early: "later", late: "earlier" } as const;
  return (
    <div className="gr-roll cp-roll" role="grid" aria-label={`Copy the ${layer === "drums" ? "pattern" : layer} by ear`} style={{ ["--c" as string]: accent ?? "var(--led-mint)", ["--cols" as string]: cols, maxHeight: "none" } as CSSProperties}>
      <div className="gr-inner" role="presentation">
        {c.rows.map(n => (
          <div key={n} role="row" className={`gr-row cp-row ${layer !== "drums" && [1, 3, 6, 8, 10].includes(n % 12) ? "is-black" : ""}`}>
            <span className={`gr-key cp-key ${layer === "drums" ? "is-drum" : ""}`}>{rowName(layer, n)}</span>
            {Array.from({ length: cols }, (_, k) => {
              const id = keyOf(k, n);
              const mine = has.has(id);
              const m = mine ? c.marks.get(id) : undefined;
              const ghost = !mine && (hinted.has(id) || (reveal && want.has(id)));
              const label = `${rowName(layer, n)}, step ${k + 1}${mine ? (m ? (m.mark === "right" ? ", right" : `, wrong${m.dir ? `: try ${say[m.dir]}` : ""}`) : ", your note") : ghost ? ", a hint: a note goes here" : ""}`;
              return (
                <button key={k} type="button" role="gridcell" aria-label={label} disabled={locked}
                  className={`gr-cell cp-cell ${k % 4 === 0 ? "is-beat" : ""} ${k === now ? "is-now" : ""} ${mine ? "is-note" : ""} ${m ? `is-${m.mark}` : ""} ${ghost ? "is-ghost" : ""}`}
                  onClick={() => c.tap(n, k)}>
                  {m?.mark === "wrong" && m.dir ? <span aria-hidden>{arrow[m.dir]}</span> : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** How the last check went: right out of total, what is missing, the stars. */
export function CopyMeter({ c, idle }: { c: Copy; idle?: string }) {
  const g = c.grade;
  const wrong = g ? g.mine.filter(m => m.mark === "wrong").length : 0;
  return (
    <div className="ms-meter cp-meter" aria-live="polite">
      <div className="ms-big">{g ? `${g.right}/${g.total}` : "?"}<span>{g ? (c.done ? "every note" : `right${wrong ? ` · ${wrong} wrong` : ""}${g.missed.length ? ` · ${g.missed.length} missing` : ""}`) : idle ?? `${c.target.length} notes to find`}</span>
        {c.stars ? <span className="cp-stars" role="img" aria-label={`${c.stars} of 3 stars`}>{[1, 2, 3].map(i => <b key={i} className={i <= c.stars! ? "is-on" : ""}>★</b>)}</span> : null}
      </div>
      <div className="ms-bar"><i style={{ width: `${g ? Math.round((100 * g.right) / Math.max(1, g.total)) : 0}%` }} className={c.done ? "is-pass" : ""} /></div>
      {c.checks ? <div className="ms-parts"><span>{c.checks} {c.checks === 1 ? "check" : "checks"}</span>{c.hints.length ? <span>{c.hints.length} {c.hints.length === 1 ? "hint" : "hints"}</span> : null}</div> : null}
    </div>
  );
}

/** Switch between the target and yours. */
export function CopySides({ c }: { c: Copy }) {
  return (
    <div className="ls-pads" role="radiogroup" aria-label="Which one plays">
      {(["target", "yours"] as const).map((s, i) => (
        <button key={s} type="button" role="radio" aria-checked={c.side === s} className={`ls-pad ${c.side === s ? "is-lit" : ""}`} style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties}
          onClick={() => c.choose(s)}>
          <small>{String.fromCharCode(97 + i)}</small><span>{s === "target" ? "the target" : "yours"}</span>
        </button>
      ))}
    </div>
  );
}

/** Words for the last check: the first wrong note's direction, else what is missing. */
export function copyTip(c: Copy, layer: CopyLayer): string | null {
  const g = c.grade;
  if (!g || c.done) return null;
  const dirs = [...c.marks.values()].filter(m => m.mark === "wrong" && m.dir).map(m => m.dir!);
  if (dirs.includes("up") || dirs.includes("down")) return "the arrows point to where the right note is: up a row, or down.";
  if (dirs.includes("early") || dirs.includes("late")) return "a note is a step or two off: the arrow points the way to move it.";
  if (g.mine.some(m => m.mark === "wrong")) return layer === "drums" ? "a red hit isn't in the target. take it out and listen for where that drum really lands." : "a red note isn't in the target. listen to that part of the bar again.";
  if (g.missed.length) return `${g.missed.length === 1 ? "one note is" : `${g.missed.length} notes are`} still missing. listen for ${layer === "drums" ? "the hits between yours" : "what plays in the gaps"}.`;
  return null;
}

export function CopyStep({ screen, onNext, tail, onKeep }: { mission: Mission; screen: Of; onNext: () => void; tail?: ReactNode; onKeep?: (take: Take) => void }) {
  const [song, setSong] = useState<TrackV2 | null>(null);
  useEffect(() => setSong(readTrackV2()), []);
  const layer = screen.layer as CopyLayer;
  const c = useCopy({ song, layer, pattern: screen.pattern, level: screen.level ?? "standard" });
  const tip = copyTip(c, layer);
  const kept = useRef(false);
  const keep = () => {
    if (kept.current) return;
    kept.current = true;
    // In a lesson, what you copied becomes the lesson's part: its add step puts it in your song, and a play
    // step after this one starts from it. Drum hits on the hats part stay out of a drum rack take.
    if (onKeep) {
      onKeep({ type: layer, events: c.target.filter(e => layer !== "drums" || !HAT_NOTES.has(e.note)).map(e => ({ ...e })) });
      c.engine.stop();
      onNext();
      return;
    }
    // Your copy goes into your song: the drums it names replace those drums, a tune replaces that part's notes.
    const t = readTrackV2();
    const put = (type: LayerV2["type"], events: NoteEvent[], only?: Set<number>) => {
      const has = t.layers.find(l => l.type === type);
      if (!events.length && !has) return;
      if (has) has.events = sortEvents([...(only ? has.events.filter(e => !only.has(e.note)) : []), ...events]);
      else if (t.layers.length < 8) t.layers.push({ ...newLayerV2(type, `copy-${Date.now().toString(36)}`), events });
    };
    const evs = c.target.map(e => ({ ...e }));
    if (layer === "drums") {
      const notes = new Set(evs.map(e => e.note));
      put("drums", evs.filter(e => !HAT_NOTES.has(e.note)), new Set([...notes].filter(n => !HAT_NOTES.has(n))));
      if (evs.some(e => HAT_NOTES.has(e.note))) put("hats", evs.filter(e => HAT_NOTES.has(e.note)), new Set([...notes].filter(n => HAT_NOTES.has(n))));
    } else put(layer, evs);
    if (c.loop > (t.loop || 4)) t.loop = c.loop;
    writeTrackV2({ ...t, updatedAt: Date.now() });
    window.dispatchEvent(new Event("ccd:song"));
    c.engine.stop();
    onNext();
  };
  useEnter(c.done ? keep : null);
  const go = c.done
    ? { label: onKeep ? "keep these notes" : "keep it in your song", onClick: keep, aria: onKeep ? "Keep these notes" : "Keep it in your song" }
    : { label: c.grade ? `${c.grade.right}/${c.grade.total} · check again` : "check", onClick: () => { c.check(); }, aria: c.grade ? `${c.grade.right} of ${c.grade.total} right. Check again` : "Check your notes" };
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left={`copy by ear${song ? ` · ${keyName(song.root ?? 45, song.scale)}` : ""}`} right={c.side === "target" ? "playing the target" : "playing yours"} />
          <CopyMeter c={c} />
          <CopyGrid c={c} layer={layer} />
        </Screen>
        <Silk label="switch between them" right={c.side === "target" ? "the target" : "yours"} />
        <CopySides c={c} />
      </div>
      <div className="fl-text">
        <Body text={screen.body} />
        {tip ? <div className="ls-hint" role="status"><Gloss>{tip}</Gloss></div> : !c.grade ? <div className="ls-hint">{layer === "drums" ? "tap a square to put a hit there. " : "tap a square to put a note there. "}switch to yours to hear what you wrote, then check. as many checks as you need.</div> : null}
        {screen.hint && c.checks >= 2 && !c.done ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {c.done ? <p className="ls-read ms-done">every note, by ear.{onKeep ? " keep them and they become this lesson's part." : " keep it, and it goes into your song."}</p> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={c.playing ? "stop" : "play"} onClick={c.hear} ariaPressed={c.playing} ariaLabel={c.playing ? "Stop" : "Play"}><Icon name={c.playing ? "stop" : "play"} /></Key>
          {c.checks && !c.done
            ? <Key label="hint" onClick={() => c.hint()} ariaLabel="Show where one missing note goes"><span aria-hidden style={{ fontSize: 18 }}>?</span></Key>
            : <Key label="skip" onClick={() => { c.engine.stop(); onNext(); }} ariaLabel="Skip this step"><Icon name="back" className="ls-flip" /></Key>}
          <GoPill onClick={go.onClick} style={{ gridColumn: "span 2" }} ariaLabel={go.aria}>{go.label}</GoPill>
        </div>
      </div>
    </div>
  );
}
