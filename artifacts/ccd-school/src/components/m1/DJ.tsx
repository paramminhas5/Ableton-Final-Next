"use client";
/**
 * The dj decks (9 Nov): a two-channel controller laid out like a Pioneer DDJ (DeckRig.tsx), on our engine.
 * Deck a plays your song, deck b a track from the bank. Above the controller, both waveforms stacked the way
 * rekordbox shows them, so the beats line up by eye. Simple shows only what the dj lessons have taught you;
 * "everything" shows the whole controller.
 */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FLAG, OUT } from "@/engine";
import { useProgress } from "@/lib/progress";
import { readTrackV2, type LayerV2, type TrackV2 } from "@/lib/track2";
import { arranged } from "@/lib/arrange";
import { fromBar } from "@/lib/cues";
import { readSongs } from "@/lib/songs";
import { bankBands, songBands, type Bands } from "@/lib/djWaves";
import { bankLayers, bankTrack, CUES, DJ_BANK, songLayers, TRACK_BEATS } from "@/content/djBank";
import { clipVariants } from "@/content/lessons/clipTracks";
import { DeckWave } from "./DeckWave";
import { songCommands } from "./MixStep";
import { DeckRig, sectionsFor, useLandscapePhone, type Chan, type DeckId } from "./DeckRig";
import { Cue, Icon, LED, Screen } from "./controls";
import { useEngineTrack } from "./useEngineTrack";
import { useEverything, DepthKey } from "./Everything";
import { Walkthrough } from "./Walkthrough";
import "./frame.css";

const BEATS = 64;
const P = { low: 0, mid: 1, high: 2, cut: 3, level: 8, lp: 12 } as const;
const PHRASES = [{ beat: 0, name: "phrase 1" }, { beat: 32, name: "phrase 2" }];
const sectionAt = (b: number) => CUES.filter(c => c.at <= b).slice(-1)[0]?.name ?? "intro";
const UPRIGHT = "ccd.dj.upright";

/** On a phone held upright the decks are squeezed, so we ask once to turn it. It goes away by itself when you do. */
function useTurnAsk() {
  const [ask, setAsk] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(orientation: portrait) and (max-width: 599px)");
    let kept = false;
    try { kept = !!localStorage.getItem(UPRIGHT); } catch { /* no storage */ }
    const r = () => setAsk(m.matches && !kept);
    r(); m.addEventListener("change", r);
    return () => m.removeEventListener("change", r);
  }, []);
  const keep = () => { setAsk(false); try { localStorage.setItem(UPRIGHT, "1"); } catch { /* ignore */ } };
  return [ask, keep] as const;
}

function TurnAsk({ onKeep }: { onKeep: () => void }) {
  return (
    <div className="dj-turn" role="dialog" aria-modal="true" aria-labelledby="dj-turn-h">
      <div className="dj-turn-card">
        <svg className="dj-turn-ph" viewBox="0 0 64 64" aria-hidden><rect x="22" y="8" width="20" height="38" rx="4" /><path d="M29 41h6" /><path d="M14 50a20 20 0 0 0 32 4" className="dj-turn-arc" /><path d="M46 48v6h-6" className="dj-turn-arc" /></svg>
        <h2 id="dj-turn-h">turn your phone sideways</h2>
        <p>the decks and the mixer fit side by side, like a real controller.</p>
        <button type="button" className="ls-chip" onClick={onKeep}>keep it upright</button>
      </div>
    </div>
  );
}

const chan0: Chan = { trim: 0.5, hi: 0.5, mid: 0.5, low: 0.5, filter: 0.5, fader: 0.8, phones: false, level: 0 };

/** A deck's channel as engine params: trim and fader into level, three-band eq, and one filter knob (left a low-pass, right a high-pass). */
function chanParams(c: Chan, xfGain: number) {
  const f = c.filter;
  return {
    [P.level]: Math.min(1, 0.75 * c.fader * xfGain * (0.5 + c.trim) * 1.2),
    [P.low]: c.low, [P.mid]: c.mid, [P.high]: c.hi,
    [P.lp]: f < 0.47 ? Math.max(0.05, f / 0.47) : 1,
    [P.cut]: f > 0.53 ? (f - 0.53) / 0.47 : 0,
  };
}

export function DJ() {
  const { progress } = useProgress();
  const [everything, setEverything] = useEverything();
  const show = useMemo(() => sectionsFor(progress.completedMissions, everything), [progress.completedMissions, everything]);
  // Your song is read after the page loads (it lives in this browser), so the server and the first render agree.
  const [song, setSong] = useState<TrackV2 | null>(null);
  const [songName, setSongName] = useState("your song");
  useEffect(() => { setSong(readTrackV2()); const i = readSongs(); setSongName(i.songs.find(s => s.id === i.active)?.name ?? "your song"); }, []);
  const mine = useMemo(() => (song && song.layers.some(l => l.events.length) ? song : clipVariants("kick-and-clap")[0].track), [song]);
  const [bi, setBi] = useState(0);
  const b = DJ_BANK[bi] ?? bankTrack("warm-up");
  const base = mine.bpm || 120;

  const [play, setPlay] = useState<Record<DeckId, boolean>>({ a: false, b: false });
  const [pitch, setPitch] = useState<Record<DeckId, number>>({ a: 0, b: 0 });
  const [synced, setSynced] = useState<Record<DeckId, boolean>>({ a: false, b: false });
  const [ch, setCh] = useState<Record<DeckId, Chan>>({ a: { ...chan0 }, b: { ...chan0, fader: 0 } });
  const [xf, setXf] = useState(0.5);
  const [cueA, setCueA] = useState(1);
  const [cueB, setCueB] = useState(0);
  const [pads, setPads] = useState<[boolean[], boolean[]]>([[true, false, false, false], [true, false, false, false]]);
  const [hint, setHint] = useState<string | null>(null);

  const bBpm = synced.b ? base * (1 + pitch.a * 0.08) : b.bpm * (1 + pitch.b * 0.08);
  const aBpm = base * (1 + pitch.a * 0.08);
  const [ga, gb] = [Math.cos((xf * Math.PI) / 2) * 1.414, Math.sin((xf * Math.PI) / 2) * 1.414].map(g => Math.min(1, g));
  const track: TrackV2 = useMemo(() => {
    const A = songLayers(fromBar(arranged(mine), cueA), BEATS, "a", 5).map((l: LayerV2) => ({ ...l, mute: !play.a, params: { ...l.params, ...chanParams(ch.a, ga) } }));
    const B = bankLayers(b, bBpm, aBpm, BEATS, "b", { off: cueB }).map(l => ({ ...l, mute: !play.b, params: { ...l.params, ...chanParams(ch.b, gb) } }));
    return { ...mine, bpm: aBpm, loop: BEATS, layers: [...A, ...B].slice(0, 8) };
  }, [mine, b, bBpm, aBpm, cueA, cueB, play, ch, ga, gb]);
  const { engine, ready } = useEngineTrack(track);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => () => { try { engine.stop(); } catch { /* not started */ } }, [engine]);
  const anyPlaying = play.a || play.b;
  useEffect(() => {
    if (anyPlaying) void ready().then(() => { engine.metronome(false); engine.play(); });
    else try { engine.stop(); } catch { /* not started */ }
  }, [anyPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  const [bandsA, setBandsA] = useState<Bands | null>(null);
  useEffect(() => { let gone = false; void songBands(mine, songCommands(mine)).then(x => { if (!gone) setBandsA(x); }).catch(() => {}); return () => { gone = true; }; }, [mine]);
  const bandsB = useMemo(() => bankBands(b.id), [b.id]);

  const on = beat >= 0;
  const headA = on && play.a ? beat : -1;
  const headB = on && play.b ? ((beat * bBpm) / aBpm + cueB) % TRACK_BEATS : -1;
  const level = (d: DeckId) => (play[d] && on ? Math.min(1, ch[d].fader * (d === "a" ? ga : gb) * (0.6 + 0.4 * Math.abs(Math.sin(beat * Math.PI)))) : 0);

  const setChan = (d: DeckId, k: keyof Chan, v: number | boolean) => setCh(c => ({ ...c, [d]: { ...c[d], [k]: v } }));
  const touch = (label: string, v: number) => setHint(`${label} · ${Math.round(v * 100)}%`);
  const drift = Math.abs(bBpm - aBpm);
  const [ask, keepUpright] = useTurnAsk();
  const side = useLandscapePhone();
  const [canFull, setCanFull] = useState(false);
  useEffect(() => setCanFull(!!document.fullscreenEnabled), []);
  const full = () => {
    if (document.fullscreenElement) { void document.exitFullscreen().catch(() => {}); return; }
    void document.documentElement.requestFullscreen({ navigationUI: "hide" }).then(() => (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.("landscape")).catch(() => {});
  };

  // Your first mix in five numbered steps, one at a time (10 Nov): the line says the step you're on.
  const step: { n: number; text: string; done?: boolean } = !play.a ? { n: 1, text: "press play on deck a. that's your song" }
    : !play.b ? { n: 2, text: "press play on deck b. its fader is down, so the room still hears only a" }
    : drift > 0.3 && !synced.b ? { n: 3, text: `deck b is ${drift.toFixed(1)} bpm off. press sync on b, or move its tempo fader` }
    : ch.b.fader < 0.6 ? { n: 4, text: "bring deck b's channel fader up, on the one" }
    : xf < 0.85 ? { n: 5, text: "slide the crossfader across to b" }
    : { n: 5, text: "you mixed from your song into the next track. try the low knobs to swap the bass", done: true };

  return (
    <div className={`m1-page dj ${side ? "is-side" : ""}`} data-step={step.done ? undefined : step.n}>
      {ask ? <TurnAsk onKeep={keepUpright} /> : null}
      <header className="tb dj-head">
        <div className="tb-l"><Link href="/dashboard" className="tb-k" aria-label="Back"><Icon name="back" small /></Link><h1 className="tb-title">dj decks<small>deck a plays your song</small></h1></div>
        <div className="tb-r">{side && canFull ? <button type="button" className="tb-k" onClick={full} aria-label="Full screen"><svg viewBox="0 0 24 24" width={16} height={16} aria-hidden fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg></button> : null}<DepthKey value={everything} onChange={setEverything} /><Walkthrough screen="dj" auto={!ask} /></div>
      </header>
      <Cue n={step.n} done={step.done} className="dj-cue"><span className="dj-cuen">step {step.n} of 5 · </span>{step.text}</Cue>
      <DeckRig
        decks={[
          { id: "a", title: songName.toLowerCase(), sub: "your song", color: LED.mint, playing: play.a, bpm: base, pitch: pitch.a, synced: synced.a },
          { id: "b", title: b.name.toLowerCase(), sub: `${b.key} · ${b.camelot}`, color: LED.cobalt, playing: play.b, bpm: synced.b ? aBpm : b.bpm, pitch: synced.b ? 0 : pitch.b, synced: synced.b },
        ]}
        chans={[{ ...ch.a, level: level("a") }, { ...ch.b, level: level("b") }]}
        xf={xf}
        show={show}
        pads={pads}
        onPlay={d => setPlay(p => ({ ...p, [d]: !p[d] }))}
        onCue={d => { setPlay(p => ({ ...p, [d]: false })); if (d === "a") setCueA(1); else setCueB(0); }}
        onSync={d => setSynced(s => ({ ...s, [d]: !s[d] }))}
        onPitch={(d, v) => { setPitch(p => ({ ...p, [d]: v })); if (d === "b") setSynced(s => ({ ...s, b: false })); }}
        onChan={setChan}
        onXf={setXf}
        onPad={(d, k) => {
          setPads(ps => (d === "a" ? [ps[0].map((_, i) => i === k), ps[1]] : [ps[0], ps[1].map((_, i) => i === k)]));
          if (d === "a") setCueA(1 + k * 2); else setCueB(CUES[k]?.at ?? 0);
        }}
        onTouch={touch}
        screen={
          <Screen className="dj-scr">
            <div className="dj-meta">
              <span style={{ color: LED.mint }}>a · {aBpm.toFixed(1)} bpm</span>
              <span className="dj-say" role="status">{hint ?? (drift > 0.3 ? `${drift.toFixed(1)} bpm apart` : "tempos matched")}</span>
              <span style={{ color: LED.cobalt }}>b · {bBpm.toFixed(1)} bpm</span>
            </div>
            <DeckWave label="deck a" bands={bandsA} loading={!bandsA} beat={headA} lowDb={(ch.a.low - 0.5) * 30} phrases={PHRASES} zoom />
            <DeckWave label="deck b" bands={bandsB} beat={headB} lowDb={(ch.b.low - 0.5) * 30} phrases={[0, 32].map(x => ({ beat: x, name: sectionAt(x) }))} zoom />
          </Screen>
        }
      />
      <div className="dj-bank" role="group" aria-label="Deck b track">
        <button type="button" className="ls-chip" onClick={() => setBi(i => (i + DJ_BANK.length - 1) % DJ_BANK.length)} aria-label="Previous track on deck b"><Icon name="back" small /></button>
        <span>deck b: <b>{b.name.toLowerCase()}</b> · {b.bpm} bpm · {b.camelot}</span>
        <button type="button" className="ls-chip" onClick={() => setBi(i => (i + 1) % DJ_BANK.length)} aria-label="Next track on deck b"><Icon name="play" small /></button>
      </div>
    </div>
  );
}
