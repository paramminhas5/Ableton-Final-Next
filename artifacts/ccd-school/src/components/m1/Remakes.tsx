"use client";
/**
 * Remakes (Syntorial's remakes, design/audible-genius.md item 6): famous kinds of sound as match targets on our
 * own instruments. Each is a patch we program in a style ("a 90s acid line"), never a track, and no audio from
 * any record. Pick one, match its telling knobs by ear (notched, green and red per knob, stars), then "keep it"
 * puts that sound on the part of your song it belongs to (or adds the part, with the remake's bar, if your song
 * doesn't have one yet). The list comes from src/lib/remakesSource.ts.
 */
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { passes, which, notch } from "@/lib/matchScore";
import { learn } from "@/lib/learnEvents";
import { emptyTrackV2, newLayerV2, readTrackV2, writeTrackV2, type LayerV2, type TrackV2 } from "@/lib/track2";
import { nameSongIfNew } from "@/lib/songs";
import { REMAKES, type Remake } from "@/lib/remakesSource";
import { keepRemake, patch, REMAKE_NOTCHES as NOTCHES } from "@/lib/remakesKeep";
import { challengeKnob, matchRoundStars, type K } from "@/lib/worldChallenge";
import { GoPill, Icon, Key, Screen, Silk } from "./controls";
import { Meta, useEnter } from "./LessonParts";
import { MatchKnobs, MatchMeter, MatchSides, useMatch } from "./MatchSound";
import { Stars } from "./Stars";
import "./lesson.css";
import "./placement.css";

const KEY = "ccd.remakes.v1";
const readBest = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") ?? {}; } catch { return {}; } };
const saveBest = (id: string, stars: number) => { const b = readBest(); b[id] = Math.max(b[id] ?? 0, stars); try { localStorage.setItem(KEY, JSON.stringify(b)); } catch { /* blocked */ } return b; };
const PART: Record<Remake["part"], string> = { bass: "bass", lead: "lead", chords: "chords", drums: "kick" };

function RemakeMatch({ r, onDone, onBack }: { r: Remake; onDone: (stars: number, kept: boolean) => void; onBack: () => void }) {
  const knobs = useMemo(() => r.knobs.map(k => challengeKnob(r.part, k)).filter((k): k is K => !!k), [r]);
  const full = useMemo(() => patch(r), [r]);
  const { song, part } = useMemo(() => {
    const l: LayerV2 = { ...newLayerV2(r.part, "__remake"), events: r.notes.map(e => ({ ...e })), params: { ...full } };
    return { song: { ...emptyTrackV2(), bpm: r.bpm, loop: 4, layers: [l] } as TrackV2, part: l };
  }, [r, full]);
  const target = useMemo(() => Object.fromEntries(knobs.map(k => [k.index, full[k.index] ?? notch(k.spec.default, NOTCHES)])) as Record<number, number>, [knobs, full]);
  // The matched knobs start at the instrument's own defaults; if a default is the answer, a few notches away.
  const start = useMemo(() => Object.fromEntries(knobs.map(k => {
    const d = notch(k.spec.default, NOTCHES), t = target[k.index];
    return [k.index, Math.abs(d - t) > 1.5 / NOTCHES ? d : notch(t > 0.5 ? t - 3 / NOTCHES : t + 3 / NOTCHES, NOTCHES)];
  })) as Record<number, number>, [knobs, target]);
  const m = useMatch({ song, part, knobs, target, start, notches: NOTCHES });
  const passed = passes(m.result);
  const stars = passed ? matchRoundStars(m.tries) : 0;
  const [kept, setKept] = useState(false);
  const keep = () => {
    const t = readTrackV2();
    writeTrackV2(keepRemake(t, r));
    nameSongIfNew();
    window.dispatchEvent(new Event("ccd:song"));
    setKept(true);
    m.engine.stop();
    onDone(stars, true);
  };
  useEnter(passed && !kept ? keep : null);
  const w = m.worst;
  const hint = !passed && m.tries >= 2 && w ? `try ${w.k.spec.label}: the target's is ${which(w.k.spec.key, w.d > 0)}` : null;
  return (
    <div className="ls-col">
      <div className="fl-inst">
        <Screen>
          <Meta left={`remake · ${r.name}`} right={m.side === "target" ? "playing the target" : "playing yours"} />
          <MatchMeter m={m} hint={hint} passed={passed} />
        </Screen>
        <Silk label="switch between them" right={m.side === "target" ? "the target" : "yours"} />
        <MatchSides m={m} />
        <MatchKnobs m={m} knobs={knobs} spot={hint ? w?.k.index : null} locked={passed} />
      </div>
      <div className="fl-text">
        <p className="ls-read">{r.says.charAt(0).toUpperCase() + r.says.slice(1)}</p>
        <p className="ls-read wc-why">Turn {knobs.map(k => k.spec.label).join(", ")} until yours sounds like it. A patch we made in this style, on our own {PART[r.part]}.</p>
        {passed ? <p className="ls-read ms-done" role="status">that&apos;s the sound. keep it and your song&apos;s {PART[r.part]} gets it.</p> : null}
      </div>
      <div className="ls-bottom"><div className="m1-g">
        <Key label={m.playing ? "stop" : "play"} onClick={m.hear} ariaPressed={m.playing} ariaLabel={m.playing ? "Stop" : "Play"}><Icon name={m.playing ? "stop" : "play"} /></Key>
        <Key label="list" onClick={() => { m.engine.stop(); passed ? onDone(stars, false) : onBack(); }} ariaLabel="Skip this step"><Icon name="back" /></Key>
        <GoPill onClick={passed ? keep : () => void m.check()} disabled={m.busy} style={{ gridColumn: "span 2" }} ariaLabel={passed ? "Keep it in your song" : "Check how close yours is"}>{passed ? "keep it in my song" : m.busy ? "listening" : m.result ? `${m.result.close}% · check again` : "check"}</GoPill>
      </div></div>
    </div>
  );
}

export function Remakes() {
  const [best, setBest] = useState<Record<string, number>>({});
  const [at, setAt] = useState<number | null>(null);
  const [last, setLast] = useState<{ name: string; stars: number; kept: boolean } | null>(null);
  useEffect(() => setBest(readBest()), []);
  const r = at !== null ? REMAKES[at] : null;
  const firstNew = Math.max(0, REMAKES.findIndex(x => !best[x.id]));
  useEnter(r ? null : () => setAt(firstNew));
  const total = REMAKES.reduce((a, x) => a + (best[x.id] ?? 0), 0);
  return (
    <div className="ls fl rm" data-remake={r?.id ?? "list"} style={{ ["--c" as string]: "#5CC8FF" } as CSSProperties}>
      <header className="fl-top">
        <div className="fl-row">
          {r ? <button type="button" className="fl-back" onClick={() => setAt(null)} aria-label="Back to the remakes"><Icon name="back" /></button>
            : <Link href="/gym" className="fl-back" aria-label="Back to practice"><Icon name="back" /></Link>}
          <div className="fl-crumb"><span>practice · remakes</span><h1>{r ? r.name : "remakes"}</h1></div>
          {r ? <div className="fl-count" aria-label={`Remake ${at! + 1} of ${REMAKES.length}`}>{at! + 1}<i>/</i>{REMAKES.length}</div> : null}
        </div>
        <div className="fl-now"><span>{r ? "match it by ear, then keep it" : "famous kinds of sound, made on your instruments"}</span></div>
      </header>
      <div className="ls-stage fl-stage" key={at ?? -1}>
        {r ? <RemakeMatch r={r} onBack={() => setAt(null)} onDone={(stars, kept) => {
          setBest(saveBest(r.id, stars));
          learn("remake_done", { remake: r.id, stars, kept });
          setLast({ name: r.name, stars, kept });
          setAt(null);
        }} /> : (
          <div className="ls-col">
            <div className="fl-inst">
              <Screen>
                <Meta left="remakes" right={<Stars n={total} of={REMAKES.length * 3} />} />
                <div className="ls-title">{last ? (last.kept ? `${last.name} is in your song` : `${last.name}: matched`) : "make a sound like a famous one"}</div>
                <p className="ls-sub">{last ? `${last.stars} ${last.stars === 1 ? "star" : "stars"}. pick another, or open the studio to hear it in your song.` : "each one is a patch we made in a well-known style, never a copy of a record. match it by ear, then keep it on your own part."}</p>
              </Screen>
              <Silk label="remakes" right={`${total} of ${REMAKES.length * 3} stars`} />
              <ul className="wc-rounds">
                {REMAKES.map((x, i) => (
                  <li key={x.id}>
                    <span className="ls-led" style={{ ["--c" as string]: "#5CC8FF", marginTop: 0 } as CSSProperties} />
                    <span><b>{x.name}</b><small>{PART[x.part]} · {x.knobs.length} knobs · {x.bpm} bpm</small></span>
                    <Stars n={best[x.id] ?? 0} />
                    <button type="button" className="ls-chip" onClick={() => setAt(i)} aria-label={`Match ${x.name}`}>{best[x.id] ? "again" : "match"}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="fl-text">
              <p className="ls-read">Syntorial calls these remakes: a sound you know, rebuilt on the synth you are learning. Here they are rebuilt on your own instruments, so a match puts the sound straight into your song.</p>
              {last?.kept ? <Link href="/studio" className="ls-chip" style={{ alignSelf: "flex-start", marginTop: 12 }}>hear it in the studio</Link> : null}
            </div>
            <div className="ls-bottom"><div className="m1-g">
              <Key label="practice" href="/gym" ariaLabel="Back to practice"><Icon name="back" /></Key>
              <GoPill onClick={() => setAt(firstNew)} style={{ gridColumn: "span 3" }} ariaLabel={`Match ${REMAKES[firstNew].name}`}>match {REMAKES[firstNew].name}</GoPill>
            </div></div>
          </div>
        )}
      </div>
    </div>
  );
}
