"use client";
/**
 * The end-of-world challenge (src/lib/worldChallenge.ts): two rounds on the learner's own song, a match on
 * several of the world's knobs and a copy of one of their parts, scored with stars, then optional bonus rounds
 * for more. The pieces are the lessons' own (src/components/m1/MatchSound.tsx and CopyEar.tsx).
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { copyStars } from "@/lib/copyEar";
import { passes, which } from "@/lib/matchScore";
import { learn } from "@/lib/learnEvents";
import { readTrackV2, type TrackV2 } from "@/lib/track2";
import { keyName } from "@/lib/theory";
import { WORLD_LABEL, type WorldId } from "@/lib/worldOrder";
import { CHALLENGES, challengeKnob, clockStars, copyTarget, mainStars, matchPart, matchRoundStars, matchSetup, readChallenges, saveRound, type ChallengeRecord, type CopyRound, type MatchRound, type Round } from "@/lib/worldChallenge";
import { GoPill, Icon, Key, Screen, Silk, WORLD_LED } from "./controls";
import { Meta, useEnter } from "./LessonParts";
import { CopyGrid, CopyMeter, CopySides, copyTip, useCopyOn } from "./CopyEar";
import { MatchKnobs, MatchMeter, MatchSides, useMatch, type K } from "./MatchSound";
import { Stars } from "./Stars";
import "./lesson.css";
import "./placement.css";

type Done = (stars: number) => void;

function Top({ world, title, at, of, sub }: { world: WorldId; title: string; at: number; of: number; sub: string }) {
  return (
    <header className="fl-top">
      <div className="fl-row">
        <Link href={`/world/${world}`} className="fl-back" aria-label={`Back to ${WORLD_LABEL[world]}`}><Icon name="back" /></Link>
        <div className="fl-crumb"><span>{WORLD_LABEL[world]} · end of world challenge</span><h1>{title}</h1></div>
        {at > 0 ? <div className="fl-count" aria-label={`Round ${at} of ${of}`}>{at}<i>/</i>{of}</div> : null}
      </div>
      <div className="ls-seg" style={{ ["--c" as string]: WORLD_LED[world] } as CSSProperties} aria-hidden>
        {Array.from({ length: of }, (_, i) => <i key={i} className={i < at - 1 ? "is-done" : i === at - 1 ? "is-now" : ""} />)}
      </div>
      <div className="fl-now"><span>{sub}</span></div>
    </header>
  );
}

// ── a match round on the learner's own part ───────────────────────────────────
const GIVE_UP = 6;
function MatchRoundStep({ r, song, onDone, onSkip }: { r: MatchRound; song: TrackV2; onDone: Done; onSkip: () => void }) {
  const { song: s, layer, own } = useMemo(() => matchPart(song, r.part), [song, r.part]);
  const knobs = useMemo(() => r.knobs.map(k => challengeKnob(r.part, k)).filter((k): k is K => !!k), [r]);
  const { target, start } = useMemo(() => matchSetup(layer, knobs, r.notches, r.id.length * 97 + song.updatedAt % 1000), [layer, knobs, r, song.updatedAt]);
  const m = useMatch({ song: s, part: layer, knobs, target, start, notches: r.notches });
  const passed = passes(m.result);
  const out = !passed && m.tries >= GIVE_UP;
  const stars = passed ? matchRoundStars(m.tries) : 0;
  const finish = () => { m.engine.stop(); onDone(stars); };
  useEnter(passed || out ? finish : null);
  const w = m.worst;
  const hint = !passed && m.tries >= 2 && w ? `try ${w.k.spec.label}: the target's is ${which(w.k.spec.key, w.d > 0)}` : null;
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left={`match · ${r.name}`} right={m.side === "target" ? "playing the target" : "playing yours"} />
          <MatchMeter m={m} hint={hint} passed={passed} />
        </Screen>
        <Silk label="switch between them" right={m.side === "target" ? "the target" : "yours"} />
        <MatchSides m={m} />
        <MatchKnobs m={m} knobs={knobs} spot={hint ? w?.k.index : null} locked={passed || out} reveal={out ? target : undefined} />
      </div>
      <div className="fl-text">
        <p className="ls-read">{own ? `This is your ${r.part === "drums" ? (r.knobs.includes("low") ? "deck" : "kick") : r.part} as it is in your song, with ${knobs.map(k => k.spec.label).join(", ")} moved out of place. Bring them back by ear.` : `Your song has no ${r.part} yet, so this is a short ${r.part} line. Match its ${knobs.map(k => k.spec.label).join(", ")} by ear.`}</p>
        <p className="ls-read wc-why">{r.line}.</p>
        {passed ? <p className="ls-read ms-done" role="status">matched in {m.tries} {m.tries === 1 ? "check" : "checks"}.</p> : out ? <p className="ls-read" role="status">the target&apos;s settings are under the knobs. try the round again any time.</p> : null}
      </div>
      <div className="ls-bottom"><div className="m1-g">
        <Key label={m.playing ? "stop" : "play"} onClick={m.hear} ariaPressed={m.playing} ariaLabel={m.playing ? "Stop" : "Play"}><Icon name={m.playing ? "stop" : "play"} /></Key>
        <Key label="skip" onClick={() => { m.engine.stop(); onSkip(); }} ariaLabel="Skip this step"><Icon name="back" className="ls-flip" /></Key>
        <GoPill onClick={passed || out ? finish : () => void m.check()} disabled={m.busy} style={{ gridColumn: "span 2" }} ariaLabel={passed || out ? "Next round" : "Check how close yours is"}>{passed || out ? "next" : m.busy ? "listening" : m.result ? `${m.result.close}% · check again` : "check"}</GoPill>
      </div></div>
    </div>
  );
}

// ── a copy round on one of their parts ────────────────────────────────────────
function CopyRoundStep({ r, song, onDone, onSkip }: { r: CopyRound; song: TrackV2; onDone: Done; onSkip: () => void }) {
  const t = useMemo(() => copyTarget(song, r), [song, r]);
  const s = useMemo<TrackV2>(() => ({ ...song, loop: 4, sections: undefined }), [song]);
  const c = useCopyOn({ song: s, layer: r.layer, target: t.events, loop: 4, level: "standard" });
  const tip = copyTip(c, r.layer);
  const [left, setLeft] = useState(r.clock ?? 0);
  const leftAtDone = useRef<number | null>(null);
  useEffect(() => {
    if (!r.clock) return;
    const id = window.setInterval(() => setLeft(x => (leftAtDone.current !== null ? x : Math.max(0, x - 1))), 1000);
    return () => window.clearInterval(id);
  }, [r.clock]);
  if (c.done && leftAtDone.current === null) leftAtDone.current = left;
  const stars = c.done ? (r.clock ? clockStars(leftAtDone.current ?? left, r.clock) : copyStars(c.checks, c.hints.length)) : 0;
  const finish = () => { c.engine.stop(); onDone(stars); };
  useEnter(c.done ? finish : null);
  const what = r.layer === "drums" ? "hits" : "notes";
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left={`copy · ${r.name}${r.layer !== "drums" ? ` · ${keyName(song.root ?? 45, song.scale)}` : ""}`} right={r.clock ? <span className="wc-clock" aria-live="off">{left}s left</span> : c.side === "target" ? "playing the target" : "playing yours"} />
          <CopyMeter c={c} idle={`${c.target.length} ${what} to find`} />
          <CopyGrid c={c} layer={r.layer} />
        </Screen>
        <Silk label="switch between them" right={c.side === "target" ? "the target" : "yours"} />
        <CopySides c={c} />
      </div>
      <div className="fl-text">
        <p className="ls-read">{t.own ? `This is your own ${r.layer === "drums" ? "beat" : r.layer === "lead" ? "melody" : r.layer}, the first bar of it, hidden. Write it back by ear.` : `Your song has no ${r.layer === "drums" ? "beat" : r.layer === "lead" ? "melody" : r.layer} to copy yet, so this one is ours, in your song's key.`}{r.clock ? ` You have ${r.clock} seconds for three stars; it still counts after.` : ""}</p>
        <p className="ls-read wc-why">{r.line}.</p>
        {tip ? <div className="ls-hint" role="status">{tip}</div> : null}
        {c.done ? <p className="ls-read ms-done" role="status">every {r.layer === "drums" ? "hit" : "note"}, by ear.</p> : null}
        {c.checks >= 4 && !c.done ? <button type="button" className="ls-skip" onClick={() => { c.engine.stop(); onDone(0); }}>move on without it</button> : null}
      </div>
      <div className="ls-bottom"><div className="m1-g">
        <Key label={c.playing ? "stop" : "play"} onClick={c.hear} ariaPressed={c.playing} ariaLabel={c.playing ? "Stop" : "Play"}><Icon name={c.playing ? "stop" : "play"} /></Key>
        {c.checks && !c.done
          ? <Key label="hint" onClick={() => c.hint()} ariaLabel={`Show where one missing ${r.layer === "drums" ? "hit" : "note"} goes`}><span aria-hidden style={{ fontSize: 18 }}>?</span></Key>
          : <Key label="skip" onClick={() => { c.engine.stop(); onSkip(); }} ariaLabel="Skip this step"><Icon name="back" className="ls-flip" /></Key>}
        <GoPill onClick={c.done ? finish : () => { c.check(); }} style={{ gridColumn: "span 2" }} ariaLabel={c.done ? "Next round" : "Check your notes"}>{c.done ? "next" : c.grade ? `${c.grade.right}/${c.grade.total} · check again` : "check"}</GoPill>
      </div></div>
    </div>
  );
}

// ── the challenge ────────────────────────────────────────────────────────────
export function WorldChallenge({ world }: { world: WorldId }) {
  const ch = CHALLENGES[world];
  const order: { r: Round; bonus: boolean }[] = useMemo(() => [...ch.main.map(r => ({ r, bonus: false })), ...ch.bonus.map(r => ({ r, bonus: true }))], [ch]);
  const [song, setSong] = useState<TrackV2 | null>(null);
  const [rec, setRec] = useState<ChallengeRecord | null>(null);
  const [at, setAt] = useState(-1);
  const [got, setGot] = useState<Record<string, number>>({});
  useEffect(() => { setSong(readTrackV2()); setRec(readChallenges()[world] ?? null); }, [world]);
  const play = (i: number) => { setSong(readTrackV2()); setAt(i); window.scrollTo({ top: 0 }); };
  const done = (stars: number) => {
    const { r, bonus } = order[at];
    setGot(g => ({ ...g, [r.id + (bonus ? "+" : "")]: stars }));
    setRec(saveRound(world, r.id, stars, bonus));
    learn("challenge_done", { world, round: r.id, kind: r.kind, bonus, stars });
    // After the two main rounds, the summary; after a bonus round, the summary too.
    setAt(!bonus && at === 0 ? 1 : -2);
  };
  const skip = () => { const { r, bonus } = order[at]; if (!bonus) setGot(g => ({ ...g, [r.id]: g[r.id] ?? 0 })); setAt(!bonus && at === 0 ? 1 : -2); };
  const cur = at >= 0 ? order[at] : null;
  const roundStars = (r: Round, bonus: boolean) => (bonus ? rec?.bonus[r.id] : rec?.rounds[r.id]) ?? 0;
  const thisTime = ch.main.every(r => got[r.id] !== undefined) ? mainStars(got[ch.main[0].id] ?? 0, got[ch.main[1].id] ?? 0) : null;
  // From the summary, the go key plays the first bonus round not yet earned (or the first bonus round).
  const goAt = at === -2 ? Math.max(order.findIndex(o => o.bonus), order.findIndex(o => o.bonus && !roundStars(o.r, true))) : 0;
  useEnter(at < 0 && song ? () => play(goAt) : null);
  if (!song) return <div className="ls fl wc" />;
  return (
    <div className="ls fl wc" data-world={world} data-round={cur?.r.id ?? (at === -2 ? "summary" : "intro")} style={{ ["--c" as string]: WORLD_LED[world] } as CSSProperties}>
      <Top world={world} title={cur ? cur.r.name : ch.title} at={cur ? at + 1 : 0} of={order.length} sub={cur ? (cur.bonus ? "bonus round, for extra stars" : `round ${at + 1} of 2`) : `after ${ch.afterTitle}, on your own song`} />
      <div className="ls-stage fl-stage" key={at}>
        {cur?.r.kind === "match" && <MatchRoundStep r={cur.r} song={song} onDone={done} onSkip={skip} />}
        {cur?.r.kind === "copy" && <CopyRoundStep r={cur.r} song={song} onDone={done} onSkip={skip} />}
        {!cur && (
          <div className="ls-col">
            <div className="fl-inst">
              <Screen>
                <Meta left={at === -2 ? "challenge" : "end of world"} right={<Stars n={rec?.main ?? 0} />} />
                <div className="ls-title">{at === -2 && thisTime !== null ? `${thisTime} ${thisTime === 1 ? "star" : "stars"} this time` : ch.title}</div>
                <p className="ls-sub">{at === -2 ? (rec?.main ? `your best is ${rec.main} of 3. bonus rounds add more.` : "every round can be played again. your best stars stay.") : `everything ${WORLD_LABEL[world]} taught, in two rounds on your own song: match a sound by ear, then copy one of your parts. then bonus rounds, if you want more.`}</p>
              </Screen>
              <Silk label="rounds" right={`bonus ${Object.values(rec?.bonus ?? {}).reduce((a, b) => a + b, 0)} of ${ch.bonus.length * 3}`} />
              <ul className="wc-rounds">
                {order.map((o, i) => (
                  <li key={o.r.id + o.bonus}>
                    <span className="ls-led" style={{ ["--c" as string]: o.bonus ? "#F3C14F" : WORLD_LED[world], marginTop: 0 } as CSSProperties} />
                    <span><b>{o.r.name}</b><small>{o.r.kind === "match" ? "match" : "copy"} · {o.r.line}</small></span>
                    <Stars n={roundStars(o.r, o.bonus)} />
                    <button type="button" className="ls-chip" onClick={() => play(i)} aria-label={`Play ${o.r.name}`}>{roundStars(o.r, o.bonus) ? "again" : "play"}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="fl-text">
              <p className="ls-read">The match plays your own part with its knobs moved out of place; the copy hides one of your parts and you write it back. Where your song doesn&apos;t have the part yet, the round brings its own.</p>
              <p className="ls-read wc-why">Nothing is locked. It fits best after {ch.afterTitle}, when the whole world is in your song.</p>
            </div>
            <div className="ls-bottom"><div className="m1-g">
              <Key label="world" href={`/world/${world}`} ariaLabel={`Back to ${WORLD_LABEL[world]}`}><Icon name="back" /></Key>
              <GoPill onClick={() => play(goAt)} style={{ gridColumn: "span 3" }} ariaLabel={at === -2 ? "Play a bonus round" : "Start the challenge"}>{at === -2 ? "a bonus round" : rec?.main ? "play it again" : "start the challenge"}</GoPill>
            </div></div>
          </div>
        )}
      </div>
    </div>
  );
}
