"use client";
/**
 * Blind pairs against the open-source synths (design/sound-shootout.md). Each pair plays theirs and ours in
 * sync on a loop, as a and b in an order shuffled for every pair; the switch flips between them without
 * losing your place. Pick the one you like and it says which was which, then lets you hear ours as it was
 * before the shootout ("then") where the shootout changed it. The blind pick is always theirs against ours
 * now. Picks stay in this browser.
 */
import { useEffect, useRef, useState } from "react";
import { COMPARE_PAIRS, compareUrl, type ComparePair, type CompareSide } from "@/content/compareClips";
import { Icon, Key } from "./controls";
import { RefPage } from "./parts";
import "./lesson.css";

type Player = { ctx: AudioContext; gains: Partial<Record<CompareSide, GainNode>>; srcs: AudioBufferSourceNode[] };
type Pick = { pick: "theirs" | "ours"; at: number };

const cache = new Map<string, Promise<AudioBuffer>>();
function load(ctx: AudioContext, url: string) {
  if (!cache.has(url)) cache.set(url, fetch(url).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)));
  return cache.get(url)!;
}

const PICKS = "ccd.compare.picks";
function readPicks(): Record<string, Pick> {
  try { return JSON.parse(localStorage.getItem(PICKS) ?? "{}") as Record<string, Pick>; } catch { return {}; }
}
function writePicks(p: Record<string, Pick>) {
  try { localStorage.setItem(PICKS, JSON.stringify(p)); } catch { /* private window */ }
}

/** The sides a pair has: theirs, ours as it was, and ours now when the shootout changed it. */
const sidesOf = (p: ComparePair): CompareSide[] => (p.after ? ["theirs", "ours", "after"] : ["theirs", "ours"]);
/** Ours as it plays today. */
const now = (p: ComparePair): CompareSide => (p.after ? "after" : "ours");

export function SoundCompare() {
  const ctx = useRef<AudioContext | null>(null);
  const player = useRef<Player | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [side, setSide] = useState<CompareSide>("theirs");
  // Which side is "a", per pair: shuffled once the page is in the browser (never on the server).
  const [aIs, setAIs] = useState<Record<string, "theirs" | "ours"> | null>(null);
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  useEffect(() => {
    setAIs(Object.fromEntries(COMPARE_PAIRS.map(p => [p.id, Math.random() < 0.5 ? "theirs" : "ours"])));
    setPicks(readPicks());
    return () => { stop(); void ctx.current?.close(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = () => { player.current?.srcs.forEach(s => { try { s.stop(); } catch { /* done */ } }); player.current = null; setPlaying(null); };
  const route = (s: CompareSide) => {
    const p = player.current;
    if (!p) return;
    const t = p.ctx.currentTime;
    for (const [k, g] of Object.entries(p.gains)) g?.gain.setTargetAtTime(k === s ? 1 : 0, t, 0.008);
  };
  const play = async (p: ComparePair, start: CompareSide) => {
    if (playing === p.id) { stop(); return; }
    stop();
    ctx.current ??= new AudioContext();
    const ac = ctx.current;
    await ac.resume();
    const sides = sidesOf(p);
    const bufs = await Promise.all(sides.map(s => load(ac, compareUrl(p.id, s))));
    const gains: Partial<Record<CompareSide, GainNode>> = {};
    const srcs = sides.map((s, i) => {
      const g = ac.createGain(); g.gain.value = s === start ? 1 : 0; g.connect(ac.destination); gains[s] = g;
      const src = ac.createBufferSource(); src.buffer = bufs[i]; src.loop = true; src.connect(g); return src;
    });
    const when = ac.currentTime + 0.05;
    srcs.forEach(s => s.start(when));
    player.current = { ctx: ac, gains, srcs };
    setSide(start);
    setPlaying(p.id);
  };
  const hear = (s: CompareSide) => { setSide(s); route(s); };
  const pick = (p: ComparePair, letter: "a" | "b") => {
    if (!aIs) return;
    const a = aIs[p.id];
    const chose = letter === "a" ? a : a === "theirs" ? "ours" : "theirs";
    const next = { ...picks, [p.id]: { pick: chose, at: Date.now() } };
    setPicks(next); writePicks(next);
  };
  const again = () => { stop(); setPicks({}); writePicks({}); setAIs(Object.fromEntries(COMPARE_PAIRS.map(p => [p.id, Math.random() < 0.5 ? "theirs" : "ours"]))); };

  const done = COMPARE_PAIRS.filter(p => picks[p.id]);
  const oursCount = done.filter(p => picks[p.id].pick === "ours").length;

  return (
    <RefPage title="sound against the open-source synths" back="/sound" meta="blind pairs, a and b shuffled"
      right={done.length ? `${done.length} of ${COMPARE_PAIRS.length} picked` : undefined}
      intro="the same notes through a free, open-source synth and through our engine, set to the same loudness (-16 lufs) so the louder one can't win. a and b are shuffled for every pair. play, flip between a and b as often as you like, then pick the one you like; only then does it say which was which.">
      {done.length > 0 && (
        <div className="ab-bar">
          <span className="ls-sub">so far you picked ours {oursCount} of {done.length} times.</span>
          <button type="button" className="ls-chip" onClick={again}>start again</button>
        </div>
      )}
      <div className="ab-list">
        {COMPARE_PAIRS.map(p => {
          const on = playing === p.id;
          const a = aIs?.[p.id] ?? "theirs";
          const letterOf = (s: CompareSide): "a" | "b" => ((s === "theirs") === (a === "theirs") ? "a" : "b");
          const blindSide = (l: "a" | "b"): CompareSide => ((l === "a") === (a === "theirs") ? "theirs" : now(p));
          const got = picks[p.id];
          const hearing = side === "theirs" ? letterOf("theirs") : letterOf("ours");
          return (
            <section key={p.id} className={`ab-row ${on ? "is-on" : ""}`}>
              <Key label={on ? "stop" : "play"} onClick={() => void play(p, blindSide("a"))} ariaPressed={on} ariaLabel={`${on ? "Stop" : "Play"} ${p.name}`} disabled={!aIs}><Icon name={on ? "stop" : "play"} /></Key>
              <div className="ab-text">
                <b>{p.name}</b>
                <span>{p.what}</span>
                {got && <span>{p.theirs} was {letterOf("theirs")}, ours was {letterOf("ours")}. you picked {got.pick === "ours" ? "ours" : p.theirs}.</span>}
                {on && !got && (
                  <>
                    <div className="ab-seg" role="radiogroup" aria-label="Which one you hear">
                      {(["a", "b"] as const).map(l => <button key={l} type="button" role="radio" aria-checked={hearing === l} className={hearing === l ? "is-on" : ""} onClick={() => hear(blindSide(l))}>hear {l}</button>)}
                    </div>
                    <div className="ab-pick">
                      {(["a", "b"] as const).map(l => <button key={l} type="button" className="ls-chip" onClick={() => pick(p, l)}>i like {l}</button>)}
                    </div>
                  </>
                )}
                {on && got && (
                  <div className="ab-seg" role="radiogroup" aria-label="Which one you hear">
                    {sidesOf(p).map(s => <button key={s} type="button" role="radio" aria-checked={side === s} className={side === s ? "is-on" : ""} onClick={() => hear(s)}>{s === "theirs" ? p.theirs.split(" (")[0] : s === "after" ? "ours now" : p.after ? "ours then" : "ours"}</button>)}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <p className="ls-sub ab-foot">how it&apos;s made: the synths are surge xt, vitalium (vital&apos;s open-source build), odin 2, dexed, geonkick, dragonfly reverb and chow tape model, run in a private workspace. every patch on both sides was written for this test, with no factory presets: same notes, velocities, tempo and length, 48 khz, then set to -16 lufs and saved as mp3 at 224 kb/s. the reverbs are heard on our own dry snare and chord, the wet sound 8 lu under the dry on both sides. &ldquo;ours then&rdquo; is our engine before the shootout (5 november 2026), &ldquo;ours now&rdquo; is after the changes it led to. the measurements are in design/sound-shootout.md.</p>
    </RefPage>
  );
}
