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
import { bankLayers, bankTrack, camelotFits, camelotOf, CUES, DJ_BANK, songLayers, TRACK_BEATS, type DeckPlay } from "@/content/djBank";
import { FileDeck, useFileDeck } from "./FileDeck";
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
/** Crossfader laws: smooth is constant power (for blends), sharp is a scratch curve (full on within the first fifth). */
const curve = (x: number, law: "smooth" | "sharp") => {
  if (law === "sharp") return [Math.min(1, (1 - x) * 5), Math.min(1, x * 5)] as const;
  return [Math.cos((x * Math.PI) / 2), Math.sin((x * Math.PI) / 2)] as const;
};
type Stem = "drums" | "hats" | "bass";
const STEMS: Stem[] = ["drums", "hats", "bass"];
const LOOP_LENS = [1, 2, 4, 8];

export function MixStep({ screen, accent, onNext, tail }: { screen: Of<"mix">; accent: string; onNext: () => void; tail?: ReactNode }) {
  const song = useMemo(() => readTrackV2(), []);
  const mine = song.layers.some(l => l.events.length) ? song : clipVariants("kick-and-clap")[0].track;
  const songName = useMemo(() => { const i = readSongs(); return i.songs.find(s => s.id === i.active)?.name ?? "your song"; }, []);
  const [bid, setBid] = useState(screen.bank ?? (screen.goal === "match" ? "warm-up" : "operator"));
  const b = bankTrack(bid);
  const base = mine.bpm || 120;
  // Deck b starts at its own tempo, except in lessons where matching isn't the point: then it is already matched.
  const [pitch, setPitch] = useState(0);
  // Sync: one press matches deck b's tempo to deck a (and from then on it stays matched).
  const [synced, setSynced] = useState(false);
  const [law, setLaw] = useState<"smooth" | "sharp">(screen.goal === "cut" ? "sharp" : "smooth");
  const [cue, setCue] = useState(0); // which hot cue deck b started from (beats into its track)
  const [loopLen, setLoopLen] = useState<number | null>(null);
  const [loopAt, setLoopAt] = useState(0);
  const [stems, setStems] = useState<Record<Stem, boolean>>({ drums: true, hats: true, bass: true });
  const [shift, setShift] = useState(0); // semitones on deck b's key
  const [cueHits, setCueHits] = useState(0);
  const [bFile, setBFile] = useState<string | null>(null);
  const [deckA, setDeckA] = useState<"song" | "file">("song");
  const fileA = useFileDeck("a"), fileB = useFileDeck("b");
  const recorder = useRef<{ stop: () => Promise<Blob> } | null>(null);
  const [recState, setRecState] = useState<"off" | "on" | "done">("off");
  const [recUrl, setRecUrl] = useState<string | null>(null);
  const needMatch = screen.goal === "match" || screen.goal === "sync" || screen.goal === "shift";
  useEffect(() => { setPitch(needMatch && !synced ? 0 : base / b.bpm - 1); }, [bid]); // eslint-disable-line react-hooks/exhaustive-deps
  const sync = () => { setPitch(base / b.bpm - 1); setSynced(true); };
  // The tempo fader's range, like a cdj: 8%, then 16%, then wide when the tracks are far apart.
  const need = Math.abs(base / b.bpm - 1);
  const range = need < 0.075 ? 0.08 : need < 0.15 ? 0.16 : 0.5;
  const bBpm = Math.round(b.bpm * (1 + pitch) * 10) / 10;
  const [fa, setFa] = useState(0.75);
  // Blend and phrasing start with deck b waiting, fader down.
  const [fb, setFb] = useState(screen.goal === "blend" || screen.goal === "phrase" ? 0 : 0.75);
  const [lowA, setLowA] = useState(0.5);
  const [lowB, setLowB] = useState(0.5);
  const [xf, setXf] = useState(screen.goal === "crossfade" || screen.goal === "cut" || screen.goal === "echo" ? 0 : 0.5);
  const [echoA, setEchoA] = useState(0);
  const [cutAt, setCutAt] = useState<{ t: number; from: number } | null>(null);
  const [cutDone, setCutDone] = useState(false);
  const [cutMiss, setCutMiss] = useState(false);
  const [phraseOk, setPhraseOk] = useState<boolean | null>(null);
  const [seen, setSeen] = useState({ left: false, right: false });
  useEffect(() => setSeen(s => ({ left: s.left || xf < 0.1, right: s.right || xf > 0.9 })), [xf]);
  // A cut: the crossfader goes from one side to the other in a quarter of a second or less.
  useEffect(() => {
    const now = performance.now();
    if (xf < 0.1) setCutAt({ t: now, from: 0 });
    else if (xf > 0.9 && cutAt && cutAt.from === 0 && now - cutAt.t < 250) {
      // On the one: within a beat of a bar line (or anywhere when nothing is playing yet).
      const inBar = ((beat % 4) + 4) % 4;
      const onOne = beat < 0 || inBar < 1 || inBar > 3.6;
      setCutDone(onOne); setCutMiss(!onOne);
    }
  }, [xf]); // eslint-disable-line react-hooks/exhaustive-deps

  const track: TrackV2 = useMemo(() => {
    const [ga, gb] = curve(xf, law);
    const A = deckA === "file" ? [] : songLayers(mine, BEATS, "a", 5).map((l: LayerV2) => ({ ...l, params: { ...l.params, [LEVEL]: Math.min(1, 0.75 * fa * ga * 1.414), [LOW]: lowA, [ECHO]: echoA } }));
    const play: DeckPlay = { off: cue, loop: loopLen ? { start: loopAt, len: loopLen } : null, shift };
    const B = bFile ? [] : bankLayers(b, bBpm, base, BEATS, "b", play).filter(l => stems[l.type as Stem] !== false).map(l => ({ ...l, params: { ...l.params, [LEVEL]: Math.min(1, 0.75 * fb * gb * 1.414), [LOW]: lowB } }));
    return { ...mine, bpm: base, swing: mine.swing ?? 0, loop: BEATS, root: b.root, layers: [...A, ...B].slice(0, 8) };
  }, [mine, b, bBpm, base, fa, fb, lowA, lowB, xf, echoA, law, cue, loopLen, loopAt, shift, stems, bFile, deckA]);
  const { engine, ready } = useEngineTrack(track);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { let gone = false; void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ }); return () => { gone = true; try { engine.stop(); } catch { /* not started */ } }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const playing = beat >= 0;
  // Files on the decks follow the same transport, faders and crossfader.
  const [ga, gb] = curve(xf, law);
  useEffect(() => { fileA.set(engine, deckA === "file" && playing, fa * ga, lowA, 1); }, [deckA, playing, fa, ga, lowA]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fileB.set(engine, !!bFile && playing, fb * gb, lowB, bBpm / (fileB.bpm || bBpm)); }, [bFile, playing, fb, gb, lowB, bBpm]); // eslint-disable-line react-hooks/exhaustive-deps
  const beatA = playing ? Math.floor(((beat % 4) + 4) % 4) : -1;
  const beatB = playing ? Math.floor((((beat * bBpm) / base + cue) % 4 + 4) % 4) : -1;
  const trackBeatB = playing ? ((beat * bBpm) / base + cue) % TRACK_BEATS : cue;
  const sectionB = CUES.filter(c => c.at <= trackBeatB).slice(-1)[0]?.name ?? "intro";
  const jump = (at: number) => { setCue(((at - ((beat > 0 ? beat * bBpm / base : 0)) % TRACK_BEATS) + TRACK_BEATS) % TRACK_BEATS); setCueHits(n => n + 1); setLoopLen(null); };
  const loopNow = (len: number | null) => { if (len) { const here = Math.floor(trackBeatB / len) * len; setLoopAt(here); } setLoopLen(len); };
  const toggleRec = async () => {
    if (recorder.current) { const blob = await recorder.current.stop(); recorder.current = null; setRecUrl(URL.createObjectURL(blob)); setRecState("done"); return; }
    await ready(); const r = engine.recordOutput(); if (!r) { setSay("recording needs the web engine"); return; } recorder.current = r; setRecState("on"); if (!playing) engine.play();
  };
  const off = Math.abs(bBpm - base);
  const mineKey = camelotOf(mine.root ?? 45, (mine.scale ?? "minor") === "minor");
  // Deck b's key as it plays now, after any key shift.
  const bKey = camelotOf(b.root + shift, b.minor);
  const fits = camelotFits(mineKey, bKey);
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
    : screen.goal === "sync" ? synced && off <= 0.3
    : screen.goal === "cue" ? cueHits >= 2
    : screen.goal === "loop" ? loopLen !== null && fb > 0.5
    : screen.goal === "stems" ? !stems.drums && stems.bass && fb > 0.5 && fa > 0.5
    : screen.goal === "shift" ? fits && off <= 0.3
    : screen.goal === "curve" ? law === "sharp" && cutDone
    : screen.goal === "file" ? true // never blocks: not everyone has a file to hand
    : screen.goal === "record" ? recState === "done"
    : fb > 0.6 && lowA < 0.25 && (xf > 0.85 || fa < 0.15);
  const why = screen.goal === "crossfade" ? (!seen.right ? "slide the crossfader all the way to b" : "now all the way back to a")
    : screen.goal === "swap" ? (fb <= 0.6 ? "bring deck b's fader up" : lowA >= 0.25 ? "turn deck a's low down" : "keep deck b's low up")
    : screen.goal === "key" ? `your song is ${mineKey}. pick a deck b track whose key fits (the same number, or one either side with the same letter), or shift deck b's key until it does`
    : screen.goal === "cut" ? (cutMiss ? "quick enough, but it landed mid bar. go back to a and slam it across right on the one" : "slam the crossfader from a to b in one quick move, on the one")
    : screen.goal === "phrase" ? (phraseOk === false ? "that came in mid phrase. pull deck b down and bring it up right as the phrase lights reset to one" : "watch the phrase counter and bring deck b's fader up right on bar one")
    : screen.goal === "echo" ? (echoA <= 0.5 ? "turn deck a's echo up" : "now pull deck a's fader down and let the echo ring out")
    : screen.goal === "sync" ? (synced ? "synced. now nudge the tempo fader and press sync again to hear it pull back" : "press sync on deck b")
    : screen.goal === "cue" ? "tap a hot cue on deck b to jump there, then another"
    : screen.goal === "loop" ? (loopLen === null ? "set a loop on deck b: tap 1, 2, 4 or 8 bars" : "now bring deck b's fader up and ride the loop")
    : screen.goal === "stems" ? (stems.drums ? "take deck b's drums stem out" : fb <= 0.5 ? "bring deck b up: its bass under your song" : "keep both faders up, your drums with deck b's bass")
    : screen.goal === "shift" ? (!fits ? `your song is ${mineKey}. shift deck b's key until it fits` : "now match the tempo too")
    : screen.goal === "curve" ? (law !== "sharp" ? "switch the crossfader curve to sharp" : "now cut from a to b on the one")
    : screen.goal === "file" ? "load one of your own files on a deck"
    : screen.goal === "record" ? (recState === "on" ? "do a mix, then press stop recording" : "press record, mix, then stop")
    : screen.goal === "match" ? `deck b is ${bBpm > base ? "faster" : "slower"} by ${off.toFixed(1)} bpm. move its tempo fader until the beats line up`
    : fb <= 0.6 ? "bring deck b's fader up first" : lowA >= 0.25 ? "now turn deck a's low knob down: swap the bass" : "last: crossfade to b, or pull deck a's fader down";
  const [say, setSay] = useState<string | null>(null);
  // After one "not yet", a way on: nobody gets stuck on a mixer step.
  const [stuck, setStuck] = useState(false);
  const go = () => { if (met) onNext(); else { setSay(why); setStuck(true); window.setTimeout(() => setSay(null), 2600); } };
  useEnter(go);

  // Only the controls this lesson is about are out; the rest wait behind "more controls".
  const [more, setMore] = useState(screen.goal === "free");
  const TOOLS: Record<string, string[]> = { sync: ["sync"], cue: ["cues"], loop: ["loops"], stems: ["stems"], shift: ["key", "sync"], curve: ["curve"], record: ["record"], file: ["files"], key: ["bank", "key"], match: ["bank"] };
  const shows = (t: string) => more || (TOOLS[screen.goal] ?? []).includes(t);
  const hidden = ["bank", "sync", "cues", "loops", "stems", "key", "curve", "record", "files"].some(t => !shows(t));

  const Leds = ({ at, label }: { at: number; label: string }) => (
    <div className="mx-leds" aria-label={label}>{[0, 1, 2, 3].map(i => <i key={i} className={at === i ? "is-on" : ""} />)}</div>
  );
  return (
    <div className="ls-col">
      <div className="fl-inst" style={{ ["--c" as string]: accent } as CSSProperties}>
        <Screen>
          <Meta left="the mixer" right={playing ? (screen.goal === "match" ? (off <= 0.3 ? "matched" : "drifting") : "playing") : "press play"} />
          <div className="mx-decks">
            <div><small>deck a · {deckA === "file" ? "your file" : "your song"}</small><b>{deckA === "file" ? fileA.name : songName.toLowerCase()}</b><span>{base} bpm · {mineKey}</span><Leds at={beatA} label="Deck a beats" /></div>
            <div><small>deck b · {bFile ? "your file" : "bank"}{synced ? " · sync" : ""}</small><b>{bFile ?? b.name}</b><span>{bBpm} bpm · {bFile ? "" : `${camelotOf(b.root + shift, b.minor)}${shift ? ` (${shift > 0 ? "+" : ""}${shift})` : ""}`}{screen.goal === "key" || screen.goal === "shift" ? (fits ? " · fits" : " · clashes") : ""}{!bFile && playing ? ` · ${sectionB}${loopLen ? ` · loop ${loopLen}` : ""}` : ""}</span><Leds at={beatB} label="Deck b beats" /></div>
          </div>
          {recState !== "off" && <div className="fl-airlabels"><span>{recState === "on" ? "recording your mix" : "mix recorded"}</span>{recUrl ? <a href={recUrl} download="my-mix.webm">download it</a> : null}</div>}
          <div className={`mx-goal ${met ? "is-met" : ""}`} role="status"><span className="ls-led" style={{ ["--c" as string]: met ? "var(--led-mint)" : "var(--led-mint)" } as CSSProperties} />{met ? "done. press next when you're ready" : why}</div>
          {(screen.goal === "phrase" || screen.goal === "cut") && playing ? <div className="fl-airlabels"><span>phrase bar {Math.floor((((beat % 32) + 32) % 32) / 4) + 1} of 8</span><span>beat {beatA + 1}</span></div> : null}
        </Screen>
        <div className="mx-desk">
          <div className="mx-ch">
            <Knob label="low a" color={CAP.navy} size={52} value={lowA} defaultValue={0.5} onChange={setLowA} />
            {screen.goal === "echo" || screen.goal === "free" ? <Knob label="echo a" color={CAP.navy} size={52} value={echoA} defaultValue={0} onChange={setEchoA} /> : null}
            <Fader label="deck a" value={fa} onChange={setFa} height={130} width={40} />
          </div>
          <div className="mx-mid">
            <Silk label="deck b tempo" right={`${pitch >= 0 ? "+" : ""}${(pitch * 100).toFixed(1)}% of ${Math.round(range * 100)}`} />
            <Fader horizontal label={`Deck b tempo, plus or minus ${Math.round(range * 100)} percent`} value={(pitch + range) / (2 * range)} defaultValue={0.5} onChange={v => setPitch(Math.round((v * 2 * range - range) * 1000) / 1000)} width={200} />
            <Silk label={`crossfader · ${law}`} right={xf < 0.1 ? "a" : xf > 0.9 ? "b" : "both"} />
            <Fader horizontal label="Crossfader" value={xf} defaultValue={0.5} onChange={setXf} width={200} />
          </div>
          <div className="mx-ch">
            <Knob label="low b" color={CAP.navy} size={52} value={lowB} defaultValue={0.5} onChange={setLowB} />
            <Fader label="deck b" value={fb} onChange={setFb} height={130} width={40} />
          </div>
        </div>
        {shows("bank") && <div className="fl-marks mx-bank" role="radiogroup" aria-label="Deck b track">
          {DJ_BANK.map(t => <button key={t.id} type="button" role="radio" aria-checked={t.id === bid && !bFile} className={`ls-chip ${t.id === bid && !bFile ? "is-on" : ""}`} onClick={() => { setBid(t.id); setBFile(null); setSynced(false); setCue(0); setLoopLen(null); }}>{t.name}<small>{t.bpm} · {t.camelot}</small></button>)}
        </div>}
        <div className="fl-marks mx-tools" role="group" aria-label="Deck tools">
          {shows("sync") && <button type="button" className={`ls-chip ${synced ? "is-on" : ""}`} aria-pressed={synced} onClick={sync}>sync b</button>}
          {shows("cues") && CUES.map((c, i) => <button key={c.name} type="button" className="ls-chip" aria-label={`cue ${i + 1} ${c.name}`} onClick={() => jump(c.at)}>cue {i + 1}<small>{c.name}</small></button>)}
          {shows("loops") && LOOP_LENS.map(n => <button key={n} type="button" className={`ls-chip ${loopLen === n ? "is-on" : ""}`} aria-pressed={loopLen === n} onClick={() => loopNow(loopLen === n ? null : n)}>loop {n}</button>)}
          {shows("stems") && STEMS.map(st => <button key={st} type="button" className={`ls-chip ${stems[st] ? "is-on" : ""}`} aria-pressed={stems[st]} aria-label={`${st} b stem`} onClick={() => setStems(x => ({ ...x, [st]: !x[st] }))}>{st} b</button>)}
          {shows("key") && <button type="button" className="ls-chip" aria-label="key b - (down a semitone)" onClick={() => setShift(v => Math.max(-6, v - 1))}>key b -</button>}
          {shows("key") && <button type="button" className="ls-chip" aria-label="key b + (up a semitone)" onClick={() => setShift(v => Math.min(6, v + 1))}>key b +</button>}
          {shows("curve") && <button type="button" className={`ls-chip ${law === "sharp" ? "is-on" : ""}`} aria-pressed={law === "sharp"} onClick={() => setLaw(l => (l === "sharp" ? "smooth" : "sharp"))}>curve {law === "sharp" ? "sharp" : "smooth"}</button>}
          {shows("record") && <button type="button" className={`ls-chip ${recState === "on" ? "is-on" : ""}`} aria-pressed={recState === "on"} onClick={() => void toggleRec()}>{recState === "on" ? "stop recording" : "record mix"}</button>}
          {shows("files") && <FileDeck deck={fileA} label="file on a" onLoad={name => { setDeckA(name ? "file" : "song"); }} />}
          {shows("files") && <FileDeck deck={fileB} label="file on b" onLoad={name => { setBFile(name); if (name) setSynced(false); }} />}
          {hidden && <button type="button" className="ls-chip mx-more" aria-expanded={more} onClick={() => setMore(true)}>more controls</button>}
        </div>
      </div>
      <div className="fl-text">
        {screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
        {screen.hint ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {say ? <div className="ls-hint" role="status">{say}</div> : null}
        {stuck && !met ? <button type="button" className="ls-skip" onClick={() => { engine.stop(); onNext(); }}>skip this step</button> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "play"} onClick={async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); }} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play both decks"}><Icon name={playing ? "stop" : "play"} /></Key>
          <GoPill onClick={go} style={{ gridColumn: "span 3", opacity: met ? 1 : 0.6 }} ariaLabel={met ? "Next" : `Not yet: ${why}`}>{met ? "next" : "not yet"}</GoPill>
        </div>
      </div>
    </div>
  );
}
