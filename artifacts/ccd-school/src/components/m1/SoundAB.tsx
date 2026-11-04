"use client";
/**
 * Hear the difference. Every clip plays the old engine and the new one in sync on a loop; the switch
 * flips between them without losing your place, so you hear only the change. Blind mode hides which is
 * which: pick the one you like, then it tells you. Your picks stay in this browser.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AB_CLIPS, abUrl, type AbClip } from "@/content/abClips";
import { Icon, Key } from "./controls";
import { RefPage } from "./parts";
import "./lesson.css";

type Side = "before" | "after";
type Player = { ctx: AudioContext; gains: Record<Side, GainNode>; srcs: AudioBufferSourceNode[] };

const cache = new Map<string, Promise<AudioBuffer>>();
function load(ctx: AudioContext, url: string) {
  if (!cache.has(url)) cache.set(url, fetch(url).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)));
  return cache.get(url)!;
}

const VOTES = "ccd.ab.votes";
type Votes = Record<string, { after: number; before: number }>;
function readVotes(): Votes { try { return JSON.parse(localStorage.getItem(VOTES) ?? "{}") as Votes; } catch { return {}; } }
function saveVotes(v: Votes) { try { localStorage.setItem(VOTES, JSON.stringify(v)); } catch { /* private window */ } }

export function SoundAB() {
  const ctx = useRef<AudioContext | null>(null);
  const player = useRef<Player | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [side, setSide] = useState<Side>("after");
  const [blind, setBlind] = useState(false);
  // In blind mode, x and y are randomly the old or new engine, per clip.
  const [secret, setSecret] = useState<Record<string, Side>>({});
  const [picked, setPicked] = useState<Record<string, Side>>({});
  const [votes, setVotes] = useState<Votes>({});
  useEffect(() => setVotes(readVotes()), []);
  useEffect(() => () => { stop(); void ctx.current?.close(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = () => { player.current?.srcs.forEach(s => { try { s.stop(); } catch { /* done */ } }); player.current = null; setPlaying(null); };
  const route = (p: Player, s: Side) => {
    const t = p.ctx.currentTime;
    for (const k of ["before", "after"] as Side[]) p.gains[k].gain.setTargetAtTime(k === s ? 1 : 0, t, 0.008);
  };
  const play = async (c: AbClip) => {
    if (playing === c.id) { stop(); return; }
    stop();
    ctx.current ??= new AudioContext();
    const ac = ctx.current;
    await ac.resume();
    const [a, b] = await Promise.all([load(ac, abUrl("before", c.id)), load(ac, abUrl("after", c.id))]);
    const gains = { before: ac.createGain(), after: ac.createGain() };
    const srcs = ([["before", a], ["after", b]] as [Side, AudioBuffer][]).map(([k, buf]) => {
      const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(gains[k]); gains[k].connect(ac.destination); return s;
    });
    const p = { ctx: ac, gains, srcs };
    const now = blind ? (secret[c.id] ?? "after") : side;
    gains.before.gain.value = now === "before" ? 1 : 0;
    gains.after.gain.value = now === "after" ? 1 : 0;
    const at = ac.currentTime + 0.05;
    srcs.forEach(s => s.start(at));
    player.current = p;
    setPlaying(c.id);
  };
  const flip = (s: Side) => { setSide(s); if (player.current) route(player.current, s); };
  // Blind: "x" and "y" map to a random side per clip.
  const blindSide = (id: string, letter: "x" | "y"): Side => { const s = secret[id] ?? "after"; return letter === "x" ? s : s === "after" ? "before" : "after"; };
  const startBlind = () => {
    const s: Record<string, Side> = {};
    for (const c of AB_CLIPS) s[c.id] = Math.random() < 0.5 ? "after" : "before";
    setSecret(s); setPicked({}); setBlind(true); stop();
  };
  const pick = (id: string, letter: "x" | "y") => {
    const chose = blindSide(id, letter);
    setPicked(p => ({ ...p, [id]: chose }));
    const v = readVotes();
    v[id] = { after: (v[id]?.after ?? 0) + (chose === "after" ? 1 : 0), before: (v[id]?.before ?? 0) + (chose === "before" ? 1 : 0) };
    saveVotes(v); setVotes(v);
  };
  const total = Object.values(votes).reduce((a, v) => ({ after: a.after + v.after, before: a.before + v.before }), { after: 0, before: 0 });

  return (
    <RefPage title="hear the difference" back="/dashboard" meta="engine 2, before and after"
      right={total.after + total.before ? `you picked new ${total.after} of ${total.after + total.before}` : undefined}
      intro={blind
        ? "blind mode: each clip plays x and y, one old engine, one new, in a random order. play, switch, pick the one you like. then it tells you."
        : "the same phrases through our old engine and the new one, matched in loudness so the louder one can't win. play a clip, then switch between before and after: it keeps your place, so you hear only the change."}>
      <div className="ab-bar">
        {!blind && (
          <div className="ab-seg" role="radiogroup" aria-label="Engine">
            {(["before", "after"] as Side[]).map(s => <button key={s} type="button" role="radio" aria-checked={side === s} className={side === s ? "is-on" : ""} onClick={() => flip(s)}>{s === "before" ? "before" : "after"}</button>)}
          </div>
        )}
        <button type="button" className="ls-chip" onClick={() => (blind ? (setBlind(false), stop()) : startBlind())}>{blind ? "leave blind mode" : "try it blind"}</button>
      </div>
      <div className="ab-list">
        {AB_CLIPS.map(c => {
          const on = playing === c.id;
          const got = picked[c.id];
          return (
            <section key={c.id} className={`ab-row ${on ? "is-on" : ""}`}>
              <Key label={on ? "stop" : "play"} onClick={() => void play(c)} ariaPressed={on} ariaLabel={`${on ? "Stop" : "Play"} ${c.name}`}><Icon name={on ? "stop" : "play"} /></Key>
              <div className="ab-text">
                <b>{c.name}</b>
                <span>{c.what}</span>
                {!blind && (c.changed.length ? <ul>{c.changed.map(x => <li key={x}>{x}</li>)}</ul> : <em>not changed yet, so before and after should sound the same</em>)}
                {blind && on && !got && (
                  <div className="ab-blind" role="group" aria-label="Which do you prefer?">
                    {(["x", "y"] as const).map(l => <button key={l} type="button" className="ls-chip" onClick={() => player.current && route(player.current, blindSide(c.id, l))}>hear {l}</button>)}
                    {(["x", "y"] as const).map(l => <button key={`p${l}`} type="button" className="ls-chip" onClick={() => pick(c.id, l)}>i like {l}</button>)}
                  </div>
                )}
                {blind && got && <strong className={got === "after" ? "is-new" : ""}>{got === "after" ? "you picked the new engine" : "you picked the old engine"}</strong>}
              </div>
              {!blind && on && <span className="ab-now" style={{ "--c": side === "after" ? "var(--led-go)" : "var(--ledoff)" } as CSSProperties}>{side}</span>}
            </section>
          );
        })}
      </div>
      <p className="ls-sub" style={{ margin: "18px 4px 40px" }}>how it's made: each clip is the same notes through the engine, rendered offline, saved lossless, and set to the same loudness. the before set comes from the engine as it was on 5 nov 2026, rebuilt from that exact version. what changed and how we measured it is in the engine plan.</p>
    </RefPage>
  );
}
