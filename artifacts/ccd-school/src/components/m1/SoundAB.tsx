"use client";
/**
 * Hear the difference. Each clip plays the old engine and the new one in sync on a loop; the switch in
 * the playing card flips between them without losing your place, so you hear only the change. The blind
 * test plays five rounds of x and y in a random order, you pick the one you like each time, and only
 * at the end does it tell you how often you picked the new engine. Your picks stay in this browser.
 */
import { useEffect, useRef, useState } from "react";
import { AB_CLIPS, abUrl, type AbClip } from "@/content/abClips";
import { Icon, Key } from "./controls";
import { RefPage } from "./parts";
import "./lesson.css";

type Side = "before" | "after";
type Player = { ctx: AudioContext; gains: Record<Side, GainNode>; srcs: AudioBufferSourceNode[] };
type Trial = { clip: AbClip; x: Side; pick?: Side };

const cache = new Map<string, Promise<AudioBuffer>>();
function load(ctx: AudioContext, url: string) {
  if (!cache.has(url)) cache.set(url, fetch(url).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)));
  return cache.get(url)!;
}
const other = (s: Side): Side => (s === "after" ? "before" : "after");

const RESULTS = "ccd.ab.results";
function saveResult(newPicked: number, of: number) {
  try { const r = JSON.parse(localStorage.getItem(RESULTS) ?? "[]") as { at: number; newPicked: number; of: number }[]; r.push({ at: Date.now(), newPicked, of }); localStorage.setItem(RESULTS, JSON.stringify(r.slice(-20))); } catch { /* private window */ }
}

export function SoundAB() {
  const ctx = useRef<AudioContext | null>(null);
  const player = useRef<Player | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [side, setSide] = useState<Side>("after");
  const [trials, setTrials] = useState<Trial[] | null>(null);
  const [at, setAt] = useState(0);
  useEffect(() => () => { stop(); void ctx.current?.close(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = () => { player.current?.srcs.forEach(s => { try { s.stop(); } catch { /* done */ } }); player.current = null; setPlaying(null); };
  const route = (s: Side) => {
    const p = player.current;
    if (!p) return;
    const t = p.ctx.currentTime;
    for (const k of ["before", "after"] as Side[]) p.gains[k].gain.setTargetAtTime(k === s ? 1 : 0, t, 0.008);
  };
  const play = async (c: AbClip, start: Side, key = c.id) => {
    if (playing === key) { stop(); return; }
    stop();
    ctx.current ??= new AudioContext();
    const ac = ctx.current;
    await ac.resume();
    const [a, b] = await Promise.all([load(ac, abUrl("before", c.id)), load(ac, abUrl("after", c.id))]);
    const gains = { before: ac.createGain(), after: ac.createGain() };
    const srcs = ([["before", a], ["after", b]] as [Side, AudioBuffer][]).map(([k, buf]) => {
      const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(gains[k]); gains[k].connect(ac.destination); return s;
    });
    gains.before.gain.value = start === "before" ? 1 : 0;
    gains.after.gain.value = start === "after" ? 1 : 0;
    const when = ac.currentTime + 0.05;
    srcs.forEach(s => s.start(when));
    player.current = { ctx: ac, gains, srcs };
    setPlaying(key);
  };
  const flip = (s: Side) => { setSide(s); route(s); };

  // ── blind test: five rounds ─────────────────────────────────────────────
  const startBlind = () => {
    stop();
    const pool = [...AB_CLIPS].sort(() => Math.random() - 0.5);
    setTrials(Array.from({ length: 5 }, (_, i) => ({ clip: pool[i % pool.length], x: Math.random() < 0.5 ? "after" : "before" })));
    setAt(0); setSide("after");
  };
  const pick = (letter: "x" | "y") => {
    if (!trials) return;
    const t = trials[at];
    const chose = letter === "x" ? t.x : other(t.x);
    const next = trials.map((x, i) => (i === at ? { ...x, pick: chose } : x));
    setTrials(next); stop();
    if (at === trials.length - 1) saveResult(next.filter(x => x.pick === "after").length, next.length);
    setAt(at + 1);
  };

  if (trials) {
    const done = at >= trials.length;
    const t = trials[Math.min(at, trials.length - 1)];
    const score = trials.filter(x => x.pick === "after").length;
    const hearing: "x" | "y" = side === t.x ? "x" : "y";
    return (
      <RefPage title="blind test" back="/sound" meta={done ? "your result" : `round ${at + 1} of ${trials.length}`}
        intro={done ? `you picked the new engine ${score} of ${trials.length} times.` : "x and y are the same clip, one through the old engine and one through the new, in a random order. play, switch between them as often as you like, then pick the one you like."}>
        {!done && (
          <section className="ab-row is-on ab-trial">
            <Key label={playing ? "stop" : "play"} onClick={() => void play(t.clip, t.x, `trial-${at}`)} ariaPressed={!!playing} ariaLabel={playing ? "Stop" : `Play round ${at + 1}`}><Icon name={playing ? "stop" : "play"} /></Key>
            <div className="ab-text">
              <b>{t.clip.name}</b>
              <span>{t.clip.what}</span>
              <div className="ab-seg" role="radiogroup" aria-label="Which one you hear">
                {(["x", "y"] as const).map(l => <button key={l} type="button" role="radio" aria-checked={playing ? hearing === l : false} className={playing && hearing === l ? "is-on" : ""} onClick={() => { const s = l === "x" ? t.x : other(t.x); setSide(s); if (playing) route(s); }}>hear {l}</button>)}
              </div>
              <div className="ab-pick">
                {(["x", "y"] as const).map(l => <button key={l} type="button" className="ls-chip" onClick={() => pick(l)}>i like {l}</button>)}
              </div>
            </div>
          </section>
        )}
        {done && (
          <div className="ab-list">
            {trials.map((x, i) => <section key={i} className="ab-row"><span className="ab-n">{i + 1}</span><div className="ab-text"><b>{x.clip.name}</b><span>{x.pick === "after" ? "you picked the new engine" : "you picked the old engine"}</span></div></section>)}
            <div className="ab-bar"><button type="button" className="ls-chip" onClick={startBlind}>again</button><button type="button" className="ls-chip" onClick={() => setTrials(null)}>back to the clips</button></div>
          </div>
        )}
      </RefPage>
    );
  }

  return (
    <RefPage title="hear the difference" back="/dashboard" meta="our sound engine, then and now"
      intro="the same music through our old sound engine and the new one, at the same loudness so the louder one can't win. play a clip, then flip between then and now. it keeps your place, so all you hear is the change.">
      <div className="ab-bar">
        <button type="button" className="ls-chip" onClick={startBlind}>take the blind test</button>
      </div>
      <div className="ab-list">
        {AB_CLIPS.map(c => {
          const on = playing === c.id;
          return (
            <section key={c.id} className={`ab-row ${on ? "is-on" : ""}`}>
              <Key label={on ? "stop" : "play"} onClick={() => void play(c, side)} ariaPressed={on} ariaLabel={`${on ? "Stop" : "Play"} ${c.name}`}><Icon name={on ? "stop" : "play"} /></Key>
              <div className="ab-text">
                <b>{c.name}</b>
                <span>{c.listen}</span>
                {on && (
                  <div className="ab-seg" role="radiogroup" aria-label="Engine">
                    {(["before", "after"] as Side[]).map(s => <button key={s} type="button" role="radio" aria-checked={side === s} className={side === s ? "is-on" : ""} onClick={() => flip(s)}>{s === "before" ? "then" : "now"}</button>)}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <p className="ls-sub ab-foot">how it&apos;s made: each clip is the same notes played through our engine, saved without compression and set to the same loudness. &ldquo;then&rdquo; is the engine as it was on 5 november 2026.ldquo;then&ldquo;then&rdquo; is the engine as it was on 5 november 2026.rdquo; is the engine before its last upgrade, &ldquo;then&rdquo; is the engine as it was on 5 november 2026.ldquo;now&ldquo;then&rdquo; is the engine as it was on 5 november 2026.rdquo; is what you hear in every lesson today.</p>
    </RefPage>
  );
}
