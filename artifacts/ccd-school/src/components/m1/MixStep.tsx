"use client";
/**
 * The dj lessons' mixer: two decks on our engine. Deck a plays your song, deck b a track from the bank
 * (stand-ins at the bpm and key of CCD's picks). Channel faders, a low eq per deck, a crossfader, and a
 * tempo fader on deck b. Both decks run on one transport: deck b's notes are laid out at its own tempo,
 * so until the tempos match its beats drift against yours, which is exactly what you hear and see.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FLAG, OUT } from "@/engine";
import type { LessonScreen } from "@/content/types";
import { bankLayers, bankTrack, camelotFits, camelotOf, DJ_BANK, songLayers } from "@/content/djBank";
import { readTrackV2, type LayerV2, type TrackV2 } from "@/lib/track2";
import { readSongs } from "@/lib/songs";
import { clipVariants } from "@/content/lessons/clipTracks";
import { CAP, Fader, GoPill, Icon, Key, Knob, Screen, Silk } from "./controls";
import { Meta, useEnter } from "./LessonParts";
import { useEngineTrack } from "./useEngineTrack";
import { Gloss } from "./Gloss";

type Of<K> = Extract<LessonScreen, { kind: K }>;
const BEATS = 64; // sixteen bars on the transport, long enough to hear two tracks drift apart
const LEVEL = 8, LOW = 0, ECHO = 6; // mix.level, eq.low and fx.echo in LAYER_PARAMS
const curve = (x: number) => [Math.cos((x * Math.PI) / 2), Math.sin((x * Math.PI) / 2)] as const;

export function MixStep({ screen, accent, onNext, tail }: { screen: Of<"mix">; accent: string; onNext: () => void; tail?: ReactNode }) {
  const song = useMemo(() => readTrackV2(), []);
  const mine = song.layers.some(l => l.events.length) ? song : clipVariants("kick-and-clap")[0].track;
  const songName = useMemo(() => { const i = readSongs(); return i.songs.find(s => s.id === i.active)?.name ?? "your song"; }, []);
  const [bid, setBid] = useState(screen.bank ?? (screen.goal === "match" ? "warm-up" : "operator"));
  const b = bankTrack(bid);
  const base = mine.bpm || 120;
  // Deck b starts at its own tempo, except in lessons where matching isn't the point: then it is already matched.
  const [pitch, setPitch] = useState(0);
  useEffect(() => setPitch(screen.goal === "match" ? 0 : base / b.bpm - 1), [bid]); // eslint-disable-line react-hooks/exhaustive-deps
  const bBpm = Math.round(b.bpm * (1 + pitch) * 10) / 10;
  const [fa, setFa] = useState(screen.goal === "blend" ? 0.75 : 0.75);
  const [fb, setFb] = useState(screen.goal === "blend" ? 0 : 0.75);
  const [lowA, setLowA] = useState(0.5);
  const [lowB, setLowB] = useState(0.5);
  const [xf, setXf] = useState(screen.goal === "crossfade" || screen.goal === "cut" || screen.goal === "echo" || screen.goal === "phrase" ? 0 : 0.5);
  const [echoA, setEchoA] = useState(0);
  const [cutAt, setCutAt] = useState<{ t: number; from: number } | null>(null);
  const [cutDone, setCutDone] = useState(false);
  const [phraseOk, setPhraseOk] = useState<boolean | null>(null);
  const [seen, setSeen] = useState({ left: false, right: false });
  useEffect(() => setSeen(s => ({ left: s.left || xf < 0.1, right: s.right || xf > 0.9 })), [xf]);
  // A cut: the crossfader goes from one side to the other in a quarter of a second or less.
  useEffect(() => {
    const now = performance.now();
    if (xf < 0.1) setCutAt({ t: now, from: 0 });
    else if (xf > 0.9 && cutAt && cutAt.from === 0 && now - cutAt.t < 250) setCutDone(true);
  }, [xf]); // eslint-disable-line react-hooks/exhaustive-deps

  const track: TrackV2 = useMemo(() => {
    const [ga, gb] = curve(xf);
    const A = songLayers(mine, BEATS, "a", 5).map((l: LayerV2) => ({ ...l, params: { ...l.params, [LEVEL]: Math.min(1, 0.75 * fa * ga * 1.414), [LOW]: lowA, [ECHO]: echoA } }));
    const B = bankLayers(b, bBpm, base, BEATS, "b").map(l => ({ ...l, params: { ...l.params, [LEVEL]: Math.min(1, 0.75 * fb * gb * 1.414), [LOW]: lowB } }));
    return { ...mine, bpm: base, swing: mine.swing ?? 0, loop: BEATS, root: b.root, layers: [...A, ...B].slice(0, 8) };
  }, [mine, b, bBpm, base, fa, fb, lowA, lowB, xf, echoA]);
  const { engine, ready } = useEngineTrack(track);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { let gone = false; void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ }); return () => { gone = true; try { engine.stop(); } catch { /* not started */ } }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const playing = beat >= 0;
  const beatA = playing ? Math.floor(((beat % 4) + 4) % 4) : -1;
  const beatB = playing ? Math.floor((((beat * bBpm) / base) % 4 + 4) % 4) : -1;
  const off = Math.abs(bBpm - base);
  const mineKey = camelotOf(mine.root ?? 45, (mine.scale ?? "minor") === "minor");
  const fits = camelotFits(mineKey, b.camelot);
  // Phrasing: bring deck b in within the first beat of an eight bar phrase (32 beats).
  const prevFb = useRef(fb);
  useEffect(() => { if (prevFb.current <= 0.5 && fb > 0.5 && beat >= 0) setPhraseOk(((beat % 32) + 32) % 32 < 1.5 || ((beat % 32) + 32) % 32 > 31); prevFb.current = fb; }, [fb]); // eslint-disable-line react-hooks/exhaustive-deps

  const met = screen.goal === "free" ? true
    : screen.goal === "crossfade" ? seen.left && seen.right
    : screen.goal === "match" ? off <= 0.3
    : screen.goal === "swap" ? fb > 0.6 && lowA < 0.25 && lowB > 0.4
    : screen.goal === "key" ? fits
    : screen.goal === "cut" ? cutDone
    : screen.goal === "phrase" ? phraseOk === true
    : screen.goal === "echo" ? echoA > 0.5 && (fa < 0.15 || xf > 0.85)
    : fb > 0.6 && lowA < 0.25 && (xf > 0.85 || fa < 0.15);
  const why = screen.goal === "crossfade" ? (!seen.right ? "slide the crossfader all the way to b" : "now all the way back to a")
    : screen.goal === "swap" ? (fb <= 0.6 ? "bring deck b's fader up" : lowA >= 0.25 ? "turn deck a's low down" : "keep deck b's low up")
    : screen.goal === "key" ? `your song is ${mineKey}. pick a deck b track whose key fits: the same number, or one either side with the same letter`
    : screen.goal === "cut" ? "slam the crossfader from a to b in one quick move, on the one"
    : screen.goal === "phrase" ? (phraseOk === false ? "that came in mid phrase. pull deck b down and bring it up right as the phrase lights reset to one" : "watch the phrase counter and bring deck b's fader up right on bar one")
    : screen.goal === "echo" ? (echoA <= 0.5 ? "turn deck a's echo up" : "now pull deck a's fader down and let the echo ring out")
    : screen.goal === "match" ? `deck b is ${bBpm > base ? "faster" : "slower"} by ${off.toFixed(1)} bpm. move its tempo fader until the beats line up`
    : fb <= 0.6 ? "bring deck b's fader up first" : lowA >= 0.25 ? "now turn deck a's low knob down: swap the bass" : "last: crossfade to b, or pull deck a's fader down";
  const [say, setSay] = useState<string | null>(null);
  const go = () => { if (met) onNext(); else { setSay(why); window.setTimeout(() => setSay(null), 2600); } };
  useEnter(go);

  const Leds = ({ at, label }: { at: number; label: string }) => (
    <div className="mx-leds" aria-label={label}>{[0, 1, 2, 3].map(i => <i key={i} className={at === i ? "is-on" : ""} />)}</div>
  );
  return (
    <div className="ls-col">
      <div className="fl-inst" style={{ ["--c" as string]: accent } as CSSProperties}>
        <Screen>
          <Meta left="the mixer" right={playing ? (screen.goal === "match" ? (off <= 0.3 ? "matched" : "drifting") : "playing") : "press play"} />
          <div className="mx-decks">
            <div><small>deck a · your song</small><b>{songName.toLowerCase()}</b><span>{base} bpm · {mineKey}</span><Leds at={beatA} label="Deck a beats" /></div>
            <div><small>deck b · bank</small><b>{b.name}</b><span>{bBpm} bpm · {b.key} · {b.camelot}{screen.goal === "key" ? (fits ? " · fits" : " · clashes") : ""}</span><Leds at={beatB} label="Deck b beats" /></div>
          </div>
          {(screen.goal === "phrase" || screen.goal === "cut") && playing ? <div className="fl-airlabels"><span>phrase bar {Math.floor((((beat % 32) + 32) % 32) / 4) + 1} of 8</span><span>beat {beatA + 1}</span></div> : null}
        </Screen>
        <div className="mx-desk">
          <div className="mx-ch">
            <Knob label="low a" color={CAP.navy} size={52} value={lowA} defaultValue={0.5} onChange={setLowA} />
            {screen.goal === "echo" || screen.goal === "free" ? <Knob label="echo a" color={CAP.navy} size={52} value={echoA} defaultValue={0} onChange={setEchoA} /> : null}
            <Fader label="deck a" value={fa} onChange={setFa} height={130} width={40} />
          </div>
          <div className="mx-mid">
            <Silk label="deck b tempo" right={`${pitch >= 0 ? "+" : ""}${(pitch * 100).toFixed(1)}%`} />
            <Fader horizontal label="Deck b tempo" value={(pitch + 0.08) / 0.16} defaultValue={0.5} onChange={v => setPitch(Math.round((v * 0.16 - 0.08) * 1000) / 1000)} width={200} />
            <Silk label="crossfader" right={xf < 0.1 ? "a" : xf > 0.9 ? "b" : "both"} />
            <Fader horizontal label="Crossfader" value={xf} defaultValue={0.5} onChange={setXf} width={200} />
          </div>
          <div className="mx-ch">
            <Knob label="low b" color={CAP.navy} size={52} value={lowB} defaultValue={0.5} onChange={setLowB} />
            <Fader label="deck b" value={fb} onChange={setFb} height={130} width={40} />
          </div>
        </div>
        <div className="fl-marks mx-bank" role="radiogroup" aria-label="Deck b track">
          {DJ_BANK.map(t => <button key={t.id} type="button" role="radio" aria-checked={t.id === bid} className={`ls-chip ${t.id === bid ? "is-on" : ""}`} onClick={() => setBid(t.id)}>{t.name}<small>{t.bpm} · {t.camelot}</small></button>)}
        </div>
      </div>
      <div className="fl-text">
        {screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
        {screen.hint ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {say ? <div className="ls-hint" role="status">{say}</div> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "play"} onClick={async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); }} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play both decks"}><Icon name={playing ? "stop" : "play"} /></Key>
          <GoPill onClick={go} style={{ gridColumn: "span 3", opacity: met ? 1 : 0.6 }} ariaLabel="Next">{met ? "next" : "not yet"}</GoPill>
        </div>
      </div>
    </div>
  );
}
