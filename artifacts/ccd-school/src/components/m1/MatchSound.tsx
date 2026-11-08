"use client";
/**
 * Match this sound (touch and hear, item 13). Syntorial's method on our own instruments: the engine plays a
 * target made from hidden settings of the lesson's knobs on your own part; you switch between the target
 * and yours, turn the lit knobs, and check. The closeness comes from the sound (spectrum and envelope of
 * both, rendered offline through the same engine) and the settings (src/lib/matchScore.ts). After two
 * tries a hint names the knob furthest off and which way to go. A close match is kept in your song.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BASS_PARAMS, CHORD_PARAMS, DRUM_PAD_PARAMS, DRUM_RACK_PARAMS, FLAG, INSTRUMENT_BASE, LAYER_PARAMS, LEAD_PARAMS, OUT, display, type ParamSpec } from "@/engine";
import type { LessonScreen, Mission } from "@/content/types";
import { applyTake, readTake, shapeKnobs, withParams } from "@/lib/lessonTake";
import { readTrackV2, type LayerType, type LayerV2, type TrackV2 } from "@/lib/track2";
import { worldOf } from "@/lib/worldOrder";
import { bind } from "@/lib/paramColor";
import { features, KNOB_TOL, MATCH_PASS, knobMarks, matchStars, mono, notch, notchesFor, passes, score, which, type Features, type Score } from "@/lib/matchScore";
import { mulberry32 } from "@/lib/gym/engine";
import { renderPart } from "@/lib/offline";
import { presetTake } from "./AddToTrack";
import { CAP, GoPill, Icon, Key, Knob, Screen, Silk } from "./controls";
import { Body, Meta, useEnter } from "./LessonParts";
import { Gloss } from "./Gloss";
import { useEngineTrack } from "./useEngineTrack";
import { readShape, shapeKey } from "./LessonSteps";
import { stepResult } from "@/lib/learnEvents";

type Of = Extract<LessonScreen, { kind: "matchsound" }>;
export type K = { index: number; spec: ParamSpec };

/** The knob a lesson names on a part, by key: the part's own, the kick pad's, the rack's, or the channel's. */
export function knobFor(type: LayerType, key: string): K | undefined {
  const inst = type === "lead" ? LEAD_PARAMS : type === "bass" ? BASS_PARAMS : type === "chords" ? CHORD_PARAMS : [];
  const pad = type === "drums" ? 0 : type === "hats" ? 4 : -1;
  const all: K[] = [
    ...shapeKnobs(type),
    ...inst.map(sp => ({ index: sp.index, spec: sp as ParamSpec })),
    ...(pad >= 0 ? DRUM_PAD_PARAMS.map((sp, k) => ({ index: INSTRUMENT_BASE + pad * DRUM_PAD_PARAMS.length + k, spec: sp as ParamSpec })) : []),
    ...(pad >= 0 ? DRUM_RACK_PARAMS.map(sp => ({ index: sp.index, spec: sp as ParamSpec })) : []),
    ...LAYER_PARAMS.map(sp => ({ index: sp.index, spec: sp as ParamSpec })),
  ];
  return all.find(k => k.spec.key === key);
}

/**
 * What any "match this sound" screen needs, in the lessons or the ear gym: the target and yours on the
 * engine (switch between them while it plays), the knobs' values, and one check that renders both offline
 * through the same engine and scores them (src/lib/matchScore.ts). `start`: where the knobs start, when not
 * where the part has them.
 */
export function useMatch({ song, part, knobs, target, start, notches }: { song: TrackV2 | null; part: LayerV2 | null; knobs: K[]; target: Record<number, number>; start?: Record<number, number>; notches?: number }) {
  const [mine, setMine] = useState<Record<number, number>>(() => ({ ...(start ?? {}) }));
  const value = (k: K) => mine[k.index] ?? part?.params[k.index] ?? k.spec.default;
  const [side, setSide] = useState<"target" | "yours">("target");
  const heard = useMemo(() => {
    if (!song || !part) return null;
    const p = side === "target" ? { ...part.params, ...target } : { ...part.params, ...mine };
    return { ...song, sections: undefined, layers: [{ ...part, params: p }] } as TrackV2;
  }, [song, part, side, target, mine]);
  const { engine, ready } = useEngineTrack(heard ?? readTrackV2());
  const [beat, setBeat] = useState(-1);
  const playing = beat >= 0;
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => () => { try { engine.stop(); } catch { /* not started */ } }, [engine]);
  // The target plays when you arrive: hear it first.
  useEffect(() => {
    if (!heard) return;
    let gone = false;
    void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ });
    return () => { gone = true; };
  }, [!!heard]); // eslint-disable-line react-hooks/exhaustive-deps
  const hear = async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); };
  const choose = (s: "target" | "yours") => { setSide(s); void ready().then(() => { if (!playing) engine.play(); }); };
  // Notched while matching (Syntorial): the knob moves between a few clear positions, not every 1%.
  const turn = (k: K, v: number) => {
    const nv = notches ? notch(v, notches) : v;
    setMine(m => (m[k.index] === nv ? m : { ...m, [k.index]: nv }));
    // A knob you move loses its mark until the next check.
    setMarks(mk => { if (!(k.index in mk)) return mk; const n = { ...mk }; delete n[k.index]; return n; });
    if (side !== "yours") setSide("yours");
  };
  const [marks, setMarks] = useState<Record<number, { ok: boolean; up: boolean }>>({});

  const targetF = useRef<Features | null>(null);
  const [tries, setTries] = useState(0);
  const [result, setResult] = useState<Score | null>(null);
  const [busy, setBusy] = useState(false);
  const check = async (): Promise<Score | null> => {
    if (!song || !part || busy) return null;
    setBusy(true);
    try {
      if (!targetF.current) { const r = await renderPart(song, { ...part, params: { ...part.params, ...target } }); targetF.current = features(mono(r.l, r.r), r.sr); }
      const r = await renderPart(song, { ...part, params: { ...part.params, ...mine } });
      const s = score(targetF.current, features(mono(r.l, r.r), r.sr), knobs.map(k => ({ mine: value(k), target: target[k.index] })));
      setResult(s);
      setTries(t => t + 1);
      // Green or red per knob, as Syntorial marks them.
      const km = knobMarks(knobs.map(k => ({ key: String(k.index), mine: value(k), target: target[k.index] })), notches ?? 20);
      setMarks(Object.fromEntries(Object.entries(km).map(([i, v]) => [Number(i), v])));
      return s;
    } finally {
      setBusy(false);
    }
  };
  // A new target (the next sound in a step of several): start again from `start`, with nothing checked.
  const targetKey = JSON.stringify(target);
  const firstTarget = useRef(targetKey);
  useEffect(() => {
    if (firstTarget.current === targetKey) return;
    firstTarget.current = targetKey;
    targetF.current = null;
    setResult(null);
    setTries(0);
    setMarks({});
    setMine({ ...(start ?? {}) });
    setSide("target");
  }, [targetKey]); // eslint-disable-line react-hooks/exhaustive-deps
  // The knob furthest off, and which way.
  const worst = useMemo(() => {
    let w: { k: K; d: number } | null = null;
    for (const k of knobs) { const d = target[k.index] - value(k); if (!w || Math.abs(d) > Math.abs(w.d)) w = { k, d }; }
    return w && Math.abs(w.d) > 0.02 ? w : null;
  }, [knobs, target, mine, part]); // eslint-disable-line react-hooks/exhaustive-deps
  return { mine, value, side, choose, turn, engine, playing, hear, check, result, busy, tries, worst, marks, notches };
}
export type Match = ReturnType<typeof useMatch>;

/** The closeness meter: the big number, the bar with the pass mark, sound and settings, and a hint. */
export function MatchMeter({ m, hint, passed }: { m: Match; hint: string | null; passed: boolean }) {
  const r = m.result;
  return (
    <div className="ms-meter" role="img" aria-label={r ? `${r.close}% close: sound ${r.sound}%, settings ${r.settings}%` : "not checked yet"}>
      <div className="ms-big">{r ? `${r.close}%` : "?"}<span>{r ? "close" : "check when it sounds the same"}</span>
        {passed ? <span className="cp-stars" role="img" aria-label={`${matchStars(m.tries, 0)} of 3 stars`}>{[1, 2, 3].map(i => <b key={i} className={i <= matchStars(m.tries, 0) ? "is-on" : ""}>★</b>)}</span> : null}
      </div>
      <div className="ms-bar"><i style={{ width: `${r?.close ?? 0}%` }} className={passed ? "is-pass" : ""} /><b style={{ left: `${MATCH_PASS}%` }} /></div>
      {r ? <div className="ms-parts"><span>sound {r.sound}%</span><span>settings {r.settings}%</span>{m.tries ? <span>{m.tries} {m.tries === 1 ? "try" : "tries"}</span> : null}</div> : null}
      {hint ? <div className="ms-tip">{hint}</div> : null}
    </div>
  );
}

/** Switch between the target and yours. */
export function MatchSides({ m }: { m: Match }) {
  return (
    <div className="ls-pads" role="radiogroup" aria-label="Which sound plays">
      {(["target", "yours"] as const).map((s, i) => (
        <button key={s} type="button" role="radio" aria-checked={m.side === s} className={`ls-pad ${m.side === s ? "is-lit" : ""}`} style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties}
          onClick={() => m.choose(s)}>
          <small>{String.fromCharCode(97 + i)}</small><span>{s === "target" ? "the target" : "yours"}</span>
        </button>
      ))}
    </div>
  );
}

/** The lit knobs. `reveal`: after the answer, each knob says where the target's was. */
export function MatchKnobs({ m, knobs, spot, onTouch, locked, reveal }: { m: Match; knobs: K[]; spot?: number | null; onTouch?: (text: string) => void; locked?: boolean; reveal?: Record<number, number> }) {
  return (
    <div className="m1-g ms-knobs" style={{ gridTemplateColumns: `repeat(${Math.max(1, knobs.length)}, 1fr)`, marginTop: 8 }}>
      {knobs.map(k => {
        const mk = m.marks[k.index];
        return (
        <div key={k.index} className={`ms-k ${mk ? (mk.ok ? "is-ok" : "is-off") : ""}`}>
        <Knob label={k.spec.label} color={CAP.navy} size={knobs.length > 3 ? 60 : 74} height={150} detents={m.notches ? m.notches + 1 : undefined}
          {...bind(k.spec, m.value(k))}
          value={m.value(k)} defaultValue={k.spec.default}
          readout={reveal ? `${display(k.spec, m.value(k))} · target ${display(k.spec, reveal[k.index])}` : display(k.spec, m.value(k))}
          spot={spot === k.index}
          onChange={locked ? undefined : v => m.turn(k, v)}
          onTouch={(label, v) => onTouch?.(`${label} ${display(k.spec, v)}`)} />
        {mk ? <span className="ms-mark" role="status" aria-label={`${k.spec.label}: ${mk.ok ? "right" : `off, try ${which(k.spec.key, mk.up)}`}`}>{mk.ok ? "✓ right" : `${mk.up ? "↑" : "↓"} ${which(k.spec.key, mk.up)}`}</span> : null}
        </div>
        );
      })}
    </div>
  );
}

export function MatchSoundStep({ mission, screen, onNext, tail }: { mission: Mission; screen: Of; onNext: () => void; tail?: ReactNode }) {
  const [base, setBase] = useState<TrackV2 | null>(null);
  useEffect(() => setBase(readTrackV2()), []);
  const take = useMemo(() => readTake(mission.slug), [mission.slug]);
  const own0 = useMemo(() => (take?.events.length ? take : presetTake(mission)), [take, mission]);
  const type = screen.layer as LayerType;
  const otherType = (["drums", "hats", "bass", "chords", "lead"] as LayerType[]).find(t => t === type && t !== own0.type);
  const line = useMemo(() => (otherType ? { ...own0, type, events: [] } : own0), [own0, otherType, type]);
  const knobs = useMemo(() => screen.knobs.map(k => knobFor(type, k)).filter((k): k is K => !!k), [screen.knobs, type]);
  // Notched knobs (Syntorial): five positions on a gentle lesson, nine on standard, every 5% on hard. The
  // lesson's own target is the last sound; the ones before it are warm-ups on the same knobs, a notch or more
  // from where you are, so the step is several short matches rather than one (Syntorial's ~6 per challenge).
  const notches = notchesFor(screen.level ?? "standard");
  const rounds = screen.level === "gentle" ? 2 : 3;
  const [round, setRound] = useState(0);
  const targets = useMemo(() => {
    const last = Object.fromEntries(knobs.map(k => [k.index, notch(screen.target[k.spec.key] ?? k.spec.default, notches)])) as Record<number, number>;
    let h = 7;
    for (const ch of mission.slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const rng = mulberry32(h);
    const warm = Array.from({ length: rounds - 1 }, () => Object.fromEntries(knobs.map(k => {
      const all = Array.from({ length: notches + 1 }, (_, i) => i / notches).filter(v => v >= 0.08 && v <= 0.92 && Math.abs(v - last[k.index]) > 1e-6);
      return [k.index, all[Math.floor(rng() * all.length)] ?? last[k.index]];
    })) as Record<number, number>);
    return [...warm, last];
  }, [knobs, screen.target, notches, rounds, mission.slug]);
  const target = targets[Math.min(round, targets.length - 1)];
  // Yours starts where your part is (what you shaped earlier in the lesson, or the knobs as they are).
  const shaped = useMemo(() => readShape(mission.slug, otherType), [mission.slug, otherType]);
  const world = worldOf(mission.slug) ?? undefined;
  const own = !!base && (!!otherType || !take?.events.length) && base.layers.some(l => l.type === type && l.events.length > 0);
  // Your song with this lesson's part, then just that part: a kick lesson plays only the kick.
  const song = useMemo(() => (base ? (own ? withParams(base, type, shaped) : applyTake({ ...base, added: [] }, mission.slug, line, world, shaped)) : null), [base, own, type, shaped, mission.slug, line, world]);
  const part = useMemo<LayerV2 | null>(() => {
    const l = song?.layers.find(x => x.type === type);
    if (!l) return null;
    const note = type === "drums" ? 36 : type === "hats" ? 42 : -1;
    const events = note >= 0 ? l.events.filter(e => e.note === note) : l.events;
    return { ...l, events: events.length ? events : l.events, mute: false, solo: false };
  }, [song, type]);
  const [carry, setCarry] = useState<Record<number, number> | undefined>(undefined);
  const m = useMatch({ song, part, knobs, target, start: carry, notches });
  const [touched, setTouched] = useState<string | null>(null);
  const passed = passes(m.result);
  // Close overall but one lit knob still off: say so straight away, not after two tries.
  const nearlyBut = !!m.result && !passed && m.result.close >= MATCH_PASS;
  const worst = m.worst;
  const hint = (m.tries >= 2 || nearlyBut) && !passed && worst && Math.abs(worst.d) > (nearlyBut ? KNOB_TOL : 0) ? `try ${worst.k.spec.label}: the target's is ${which(worst.k.spec.key, worst.d > 0)}` : null;
  const lastRound = round >= rounds - 1;
  // For the learning events: checks over every sound in the step, and sounds that needed a hint (two checks or more).
  const tally = useRef({ checks: 0, hinted: 0 });
  const keep = () => {
    tally.current.checks += m.tries;
    if (m.tries >= 2) tally.current.hinted++;
    // A warm-up passed: the next sound, starting from where your knobs are.
    if (!lastRound) { setCarry({ ...m.mine }); setRound(r => r + 1); return; }
    stepResult({ checks: tally.current.checks, hints: tally.current.hinted, stars: matchStars(m.tries, 0), sounds: rounds });
    // Your matched knobs go into your song with the rest of this lesson's sound.
    try { sessionStorage.setItem(shapeKey(mission.slug, otherType), JSON.stringify({ ...shaped, ...m.mine })); } catch { /* ignore */ }
    onNext();
  };
  useEnter(passed ? keep : null);

  const go = passed
    ? lastRound ? { label: "keep it in your song", onClick: keep, aria: "Keep it in your song" } : { label: `next sound · ${round + 2} of ${rounds}`, onClick: keep, aria: `Next sound, ${round + 2} of ${rounds}` }
    : { label: m.busy ? "listening" : m.result ? `${m.result.close}% · check again` : "check how close", onClick: () => void m.check(), aria: m.result ? `Not yet, ${m.result.close}% close. Check again` : "Check how close yours is" };
  return (
    <div className="ls-col">
      <div className="fl-inst">
      <Screen>
        <Meta left={`match this sound · ${round + 1} of ${rounds}`} right={touched ?? (m.side === "target" ? "playing the target" : "playing yours")} />
        <MatchMeter m={m} hint={hint} passed={passed} />
      </Screen>
      <Silk label="switch between them" right={m.side === "target" ? "the target" : "yours"} />
      <MatchSides m={m} />
      <MatchKnobs m={m} knobs={knobs} spot={hint ? worst?.k.index : null} onTouch={setTouched} />
      </div>
      <div className="fl-text">
        <Body text={screen.body} />
        {hint ? <div className="ls-hint ms-hint" role="status"><Gloss>{hint}</Gloss>{screen.hint ? <> {screen.hint}</> : null}</div> : screen.hint && m.tries >= 1 && !passed ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {passed ? <p className="ls-read ms-done">{lastRound ? "close enough to fool an ear. keep it, and this sound goes into your song." : "matched. the next one uses the same knobs, set somewhere else."}</p> : null}
        {!m.tries && !passed ? <div className="ls-hint">the knobs click between a few positions, so every turn is a clear change. after a check, each knob goes green or red.</div> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={m.playing ? "stop" : "play"} onClick={m.hear} ariaPressed={m.playing} ariaLabel={m.playing ? "Stop" : "Play"}><Icon name={m.playing ? "stop" : "play"} /></Key>
          <Key label="skip" onClick={() => { m.engine.stop(); onNext(); }} ariaLabel="Skip this step"><Icon name="back" className="ls-flip" /></Key>
          <GoPill onClick={go.onClick} style={{ gridColumn: "span 2" }} ariaLabel={go.aria}>{go.label}</GoPill>
        </div>
      </div>
    </div>
  );
}
