"use client";
/**
 * Practice, Model 1 (canvas boards ZPractice and ZDrill). The screen shows your level in
 * each skill and this week's sessions; drill pads start a five minute session. A drill is
 * one screen: compare a and b, pick an answer, check. It gets harder after four right in
 * a row and easier after two misses. Levels are matched, so loudness never gives it away.
 */
import { learn } from "@/lib/learnEvents";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ensureAudio, playCorrect, playWrong } from "@/lib/audio";
import { track } from "@/lib/analytics";
import { useProgress } from "@/lib/progress";
import {
  GYM_DRILLS, MAX_LEVEL, SESSION_SECONDS, advance, makeCompressionQuestion, makeEqQuestion, makeGrooveQuestion, mulberry32, summarize, pickSource, pickTranspose, bandName,
  type AttackSetting, type CompressionQuestion, type EqQuestion, type GrooveKind, type GrooveQuestion, type GymDrill, type GymQuestion, type GymSource, type SessionResult,
} from "@/lib/gym/engine";
import { ABPlayer, REAL_BPM, loadRealKit, renderMatchedPair } from "@/lib/gym/render";
import { freshSaved, loadGym, saveGym, type GymSaved } from "@/lib/gym/store";
import { canUsePass, recordSession, takeFreePass, weekStatus } from "@/lib/gym/week";
import { GoPill, Icon, Key, Screen, Silk } from "@/components/m1/controls";
import { makeMatchQuestion, type MatchPart, type MatchQuestion } from "@/lib/gym/match";
import { GymMatch } from "./GymMatch";
import { GymCopy } from "./GymCopy";
import { makeCopyQuestion, type CopyQuestion } from "@/lib/copyEar";
import { GymImagine } from "./GymImagine";
import { makeImagineQuestion, type ImagineQuestion } from "@/lib/imagine";
import "@/components/m1/lesson.css";

/** A drill opens once a lesson has taught it: the gym practises what you've learnt, it doesn't test you on what you haven't. */
const TAUGHT_BY: Record<GymDrill, { slugs: string[]; first: string; title: string }> = {
  eq: { slugs: ["eq-place", "eq-eight", "eq-mixing-dj"], first: "eq-place", title: "eq: a place for everything" },
  compression: { slugs: ["glue", "compressor", "glue-compressor"], first: "glue", title: "glue: compression and loudness" },
  groove: { slugs: [], first: "groove-feel", title: "groove and swing" },
  // Opens after any lesson with a match step (first-bass is the first).
  // Opens after any lesson with a copy step (your-kick is the first).
  copy: { slugs: ["your-kick", "what-is-rhythm", "clap-and-snare", "first-bass", "kick-and-bass", "chords-on-top", "lead-width", "major-scale", "intervals", "melody-writing", "what-are-chords", "chord-progressions", "bass-follows", "notes-and-octaves", "ear-higher-lower"], first: "your-kick", title: "your kick" },
  // Opens after any lesson with an imagine step (writing a melody is the first in basics).
  imagine: { slugs: ["melody-writing", "intervals", "chord-progressions", "bass-follows", "first-bass", "syncopation"], first: "melody-writing", title: "writing a melody" },
  match: { slugs: ["first-bass", "shape-your-synth", "kick-designer", "saturator-distortion", "warp-modes-deep", "collision-tension-electric"], first: "first-bass", title: "your first bass line" },
};
const NAME: Record<GymDrill, string> = { eq: "eq ear", compression: "compression", groove: "tempo and groove", match: "match this sound", copy: "copy by ear", imagine: "imagine it first" };
const PAD: Record<GymDrill, string> = { eq: "which band?", compression: "compressed?", groove: "faster or swung?", match: "match this sound", copy: "copy by ear", imagine: "imagine it first" };
const COLOR: Record<GymDrill, string> = { eq: "#4FE3B6", compression: "#B89CFF", groove: "#7D96FF", match: "#5CC8FF", copy: "#FFD24A", imagine: "#FF8FD0" };
const BARS_BEFORE_ANSWER = 8;
const fmtHz = (hz: number) => (hz >= 1000 ? `${hz / 1000} khz` : `${hz} hz`);
const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const BAND = bandName;

type Phase = "idle" | "loading" | "listening" | "feedback" | "done";

// Small pictures for the drill pads: one line drawing each, glowing in the drill's colour.
function Pic({ kind, c }: { kind: string; c: string }) {
  const s = { stroke: c, strokeWidth: 2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const P: Record<string, ReactNode> = {
    eq: <path d="M4 26h12c6 0 7-16 12-16s6 16 12 16h12" {...s} />,
    compression: <>{[6, 12, 18, 24, 30, 36, 42, 48].map((x, i) => <path key={x} d={`M${x} ${18 - (i < 4 ? 8 : 4)}v${i < 4 ? 16 : 8}`} {...s} opacity={i < 4 ? 0.5 : 1} />)}</>,
    groove: <><circle cx="10" cy="18" r="3" fill={c} /><circle cx="22" cy="18" r="3" fill={c} /><circle cx="36" cy="18" r="3" fill={c} /><circle cx="48" cy="18" r="3" fill={c} opacity={0.5} /></>,
    match: <><path d="M4 18c5-11 9-11 14 0s9 11 14 0 9-11 14 0" {...s} opacity={0.45} /><path d="M10 18c5-10 9-10 14 0s9 10 14 0 9-10 14 0" {...s} /></>,
    copy: <>{[[8, 24], [16, 12], [24, 24], [32, 18], [40, 12], [48, 24]].map(([x, y]) => <rect key={x} x={x - 3} y={y - 3} width={6} height={6} rx={1.5} fill={c} />)}<path d="M4 30h48" {...s} opacity={0.35} /></>,
    imagine: <><path d="M6 26c4-12 12-16 22-16s18 4 22 16" {...s} opacity={0.4} />{[[14, 20], [22, 14], [30, 17], [38, 12]].map(([x, y]) => <rect key={x} x={x - 3} y={y - 3} width={6} height={6} rx={1.5} fill={c} />)}</>,
    review: <><path d="M8 18a11 11 0 0 1 19-7.5M30 18a11 11 0 0 1-19 7.5" {...s} /><path d="m27 6 0 5-5 0M11 30l0-5 5 0" {...s} /></>,
    daily: <><circle cx="18" cy="18" r="11" {...s} /><path d="M18 11v7l5 3" {...s} /></>,
    train: <><path d="M6 22v-6M12 26v-14M18 20v-2M24 28v-18M30 22v-6M36 24v-10M42 20v-2M48 26v-14" {...s} /></>,
  };
  return <svg viewBox="0 0 56 36" width={56} height={36} aria-hidden style={{ filter: `drop-shadow(0 0 3px ${c})` }}>{P[kind]}</svg>;
}

function Bars({ level, c }: { level: number; c: string }) {
  return (
    <span style={{ display: "flex", gap: 3, flex: 1 }} aria-hidden>
      {Array.from({ length: MAX_LEVEL }, (_, i) => (
        <i key={i} style={{ flex: 1, height: 9, borderRadius: 2, background: i < level ? c : "#232326", boxShadow: i < level ? `0 0 5px ${c}` : undefined }} />
      ))}
    </span>
  );
}

function Curve({ hz, c }: { hz: number; c: string }) {
  const W = 330, H = 90;
  const x = (Math.log(hz / 40) / Math.log(18000 / 40)) * W;
  let d = "";
  for (let i = 0; i <= 120; i++) {
    const px = (i / 120) * W;
    const y = H - 18 - 42 * Math.exp(-((px - x) ** 2) / 900);
    d += `${i ? "L" : "M"}${px.toFixed(1)} ${y.toFixed(1)}`;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H + 14}`} width="100%" aria-label={`Boost at ${fmtHz(hz)}`} role="img" style={{ display: "block", marginTop: 14 }}>
      <path d={`M0 ${H - 18}H${W}`} stroke="rgba(255,255,255,.16)" strokeDasharray="3 3" />
      <path d={d} stroke={c} strokeWidth={2} fill="none" style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
      {["low", "low mid", "high mid", "high"].map((l, i) => <text key={l} x={[20, 110, 220, 310][i]} y={H + 8} textAnchor="middle" fontSize={10} fill="#8A8A90" fontFamily="Outfit">{l}</text>)}
    </svg>
  );
}

export function GymPageClient() {
  const [saved, setSaved] = useState<GymSaved>(freshSaved);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [q, setQ] = useState<GymQuestion | null>(null);
  const [selected, setSelected] = useState<"A" | "B" | null>("A");
  const [bars, setBars] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; note: string; answer: string } | null>(null);
  const [attackStep, setAttackStep] = useState(false);
  const [summary, setSummary] = useState<ReturnType<typeof summarize> | null>(null);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const { missionsNeedingReview, progress } = useProgress();
  const open = (d: GymDrill) => !TAUGHT_BY[d].slugs.length || TAUGHT_BY[d].slugs.some(sl => !!progress.completedMissions[sl]);
  const openDrills = GYM_DRILLS.filter(open);

  const player = useRef<ABPlayer | null>(null);
  const token = useRef(0);
  const startedAt = useRef(0);
  const shownAt = useRef(0);
  const results = useRef<SessionResult[]>([]);
  const order = useRef<GymDrill[]>(GYM_DRILLS);
  const drillIdx = useRef(0);
  const lastGroove = useRef<GrooveKind | undefined>(undefined);
  const lastSource = useRef<GymSource | undefined>(undefined);
  const lastPart = useRef<MatchPart | undefined>(undefined);
  const savedRef = useRef(saved);
  savedRef.current = saved;
  const rng = useMemo(() => mulberry32(Date.now() & 0xffffffff), []);

  useEffect(() => {
    setSaved(loadGym());
    setReady(true);
    return () => player.current?.stop();
  }, []);

  // A drill is one instrument screen: hide the app header and the mode keys while it runs.
  const drilling = phase !== "idle" && phase !== "done";
  useEffect(() => {
    if (!drilling) return;
    document.body.dataset.focus = "1";
    return () => { delete document.body.dataset.focus; };
  }, [drilling]);

  const now = new Date();
  const week = weekStatus(saved.week, now);
  // Today's pick: the skill you have trained least.
  const today = [...GYM_DRILLS.filter(d => !TAUGHT_BY[d].slugs.length || TAUGHT_BY[d].slugs.some(sl => !!progress.completedMissions[sl]))].sort((a, b) => saved.levels[a].level - saved.levels[b].level)[0];

  useEffect(() => {
    if (phase !== "listening" && phase !== "feedback" && phase !== "loading") return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
      if (q?.drill === "groove" && player.current) setBars(player.current.barsPlayed((q as GrooveQuestion).baseBpm));
    }, 250);
    return () => clearInterval(id);
  }, [phase, q]);

  const persist = useCallback((next: GymSaved) => {
    setSaved(next);
    saveGym(next);
  }, []);

  const loadQuestion = useCallback(async () => {
    const my = ++token.current;
    player.current?.stop();
    player.current = null;
    setPhase("loading");
    setFeedback(null);
    setPick(null);
    setAttackStep(false);
    setBars(0);
    setSelected("A");
    setError("");
    const drill = order.current[drillIdx.current % order.current.length];
    drillIdx.current++;
    const level = savedRef.current.levels[drill].level;
    try {
      // Match this sound plays on the engine itself (GymMatch), so there are no clips to render.
      // Copy by ear plays on the engine too (GymCopy).
      if (drill === "copy") {
        setQ(makeCopyQuestion(level, rng));
        setCount(c => c + 1);
        shownAt.current = Date.now();
        setPhase("listening");
        return;
      }
      // Imagine it first plays on the engine too (GymImagine), from the copy drill's material.
      if (drill === "imagine") {
        setQ(makeImagineQuestion(level, rng));
        setCount(c => c + 1);
        shownAt.current = Date.now();
        setPhase("listening");
        return;
      }
      if (drill === "match") {
        const mq = makeMatchQuestion(level, rng, lastPart.current);
        lastPart.current = mq.part;
        setQ(mq);
        setCount(c => c + 1);
        shownAt.current = Date.now();
        setPhase("listening");
        return;
      }
      let question: GymQuestion;
      let pair;
      // a different sound and key every round, never the same source twice running
      const roundBase = async () => {
        const source = pickSource(rng, lastSource.current);
        lastSource.current = source;
        if (source === "real") {
          const kit = await loadRealKit();
          if (kit) return { bpm: REAL_BPM, kit, segment: Math.floor(rng() * 4) };
        }
        return { bpm: 100 + Math.floor(rng() * 5) * 8, source: source === "real" ? "full" as const : source, transpose: pickTranspose(rng) };
      };
      if (drill === "eq") {
        const e = makeEqQuestion(level, rng);
        question = e;
        const base = await roundBase();
        pair = await renderMatchedPair(base, { ...base, eq: { hz: e.answerHz, db: e.boostDb, q: e.q } });
      } else if (drill === "compression") {
        const k = makeCompressionQuestion(level, rng);
        question = k;
        const base = await roundBase();
        pair = await renderMatchedPair(base, { ...base, comp: k.compressed ? { thresholdDb: k.thresholdDb, ratio: k.ratio, attack: k.attack } : undefined });
      } else {
        const g = makeGrooveQuestion(level, rng, lastGroove.current);
        lastGroove.current = g.kind;
        question = g;
        const aIsAnswer = g.answer === "A";
        const plain = { bpm: g.baseBpm };
        const special = g.kind === "tempo" ? { bpm: g.baseBpm + g.deltaBpm } : { bpm: g.baseBpm, swing: g.swing };
        pair = await renderMatchedPair(aIsAnswer ? special : plain, aIsAnswer ? plain : special);
      }
      if (my !== token.current) return;
      const p = new ABPlayer(pair.a, pair.b);
      player.current = p;
      p.start("A");
      setQ(question);
      setCount(c => c + 1);
      shownAt.current = Date.now();
      setPhase("listening");
    } catch (e) {
      console.error("gym render failed", e);
      if (my === token.current) {
        setError("could not prepare the audio on this device.");
        setPhase("idle");
      }
    }
  }, [rng]);

  const startSession = async (first?: GymDrill) => {
    const ok = await ensureAudio();
    if (!ok) { setError("tap again to allow sound."); return; }
    results.current = [];
    order.current = first ? [first, ...openDrills.filter(d => d !== first)] : openDrills;
    drillIdx.current = 0;
    startedAt.current = Date.now();
    setElapsed(0);
    setCount(0);
    setSummary(null);
    track("gym_session_started", { week: week.week });
    void loadQuestion();
  };

  const finishSession = useCallback(() => {
    token.current++;
    player.current?.stop();
    player.current = null;
    const s = summarize(results.current);
    let next = savedRef.current;
    if (s.counts) next = { ...next, week: recordSession(next.week, new Date()) };
    next = { ...next, history: [...next.history, ...results.current.map(r => ({ ...r, at: new Date().toISOString() }))].slice(-300) };
    persist(next);
    setSummary(s);
    setPhase("done");
    learn("gym_session", { answered: s.answered, correct: s.correct, accuracy: s.accuracy, counts: s.counts, drills: Object.keys(s.byDrill).join(" ") });
    if (s.counts) track("gym_session_completed", { drills: Object.keys(s.byDrill).length, accuracy: Math.round(s.accuracy * 100) / 100, difficulty: Math.max(...Object.values(s.byDrill).map(d => d.maxLevel)) });
    fetch("/api/gym/results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ results: results.current }) }).catch(() => {});
  }, [persist]);

  const record = (drill: GymDrill, correct: boolean, note: string, answer: string) => {
    const level = savedRef.current.levels[drill].level;
    results.current.push({ drill, level, correct, responseMs: Date.now() - shownAt.current });
    persist({ ...savedRef.current, levels: { ...savedRef.current.levels, [drill]: advance(savedRef.current.levels[drill], correct) } });
    if (correct) playCorrect(); else playWrong();
    setFeedback({ correct, note, answer });
    setPhase("feedback");
  };

  const check = () => {
    if (!q || pick === null) return;
    if (q.drill === "eq") {
      const e = q as EqQuestion;
      const ok = Number(pick) === e.answerHz;
      record("eq", ok, ok ? `yes, ${fmtHz(e.answerHz)}.` : `it was ${fmtHz(e.answerHz)}.`, String(e.answerHz));
    } else if (q.drill === "compression") {
      const k = q as CompressionQuestion;
      if (!attackStep) {
        const said = pick === "yes";
        if (said !== k.compressed) record("compression", false, k.compressed ? "b was compressed." : "b was not compressed.", k.compressed ? "yes" : "no");
        else if (k.askAttack) { setAttackStep(true); setPick(null); }
        else record("compression", true, k.compressed ? "yes, compressed." : "yes, no compression.", k.compressed ? "yes" : "no");
      } else {
        const a = pick as AttackSetting;
        record("compression", a === k.attack, a === k.attack ? `yes, a ${k.attack} attack.` : `the attack was ${k.attack}.`, k.attack);
      }
    } else {
      const g = q as GrooveQuestion;
      const what = g.kind === "tempo" ? "faster" : "swung";
      record("groove", pick === g.answer, pick === g.answer ? `yes, ${g.answer.toLowerCase()} was ${what}.` : `${g.answer.toLowerCase()} was the ${what} one.`, g.answer);
    }
  };

  const timeUp = elapsed >= SESSION_SECONDS;
  const next = () => (timeUp ? finishSession() : void loadQuestion());
  const toggle = (w: "A" | "B") => {
    if (!player.current) return;
    if (selected === null) player.current.start(w);
    else player.current.select(w);
    setSelected(w);
  };
  const stop = () => { player.current?.stop(); setSelected(null); };

  // ── home ──────────────────────────────────────────────────────────────────
  if (phase === "idle" || phase === "done") {
    const pads: { id: string; label: string; pic: string; c: string; tag?: string; onClick?: () => void; href?: string }[] = [
      ...GYM_DRILLS.map(d => open(d)
        ? { id: d, label: PAD[d], pic: d, c: COLOR[d], tag: d === today ? "today" : undefined, onClick: () => void startSession(d) }
        : { id: d, label: `${NAME[d]}: opens after ${TAUGHT_BY[d].title}`, pic: d, c: "#8A8A8E", tag: "lesson first", href: `/learn/${TAUGHT_BY[d].first}` }),
      { id: "review", label: "review", pic: "review", c: "#FFB35C", tag: missionsNeedingReview.length ? `${missionsNeedingReview.length} due` : undefined, href: "/review" },
      { id: "daily", label: "daily challenge", pic: "daily", c: "#F3C14F", href: "/daily" },
      { id: "train", label: "more ear training", pic: "train", c: "#E9E9E6", href: "/train" },
    ];
    return (
      <main className="m1-page" style={{ paddingTop: 4 }}>
        <Screen>
          <div className="ls-meta">
            <span>practice · 5 minutes</span>
            <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }} role="img" aria-label={`${week.filled} of ${week.target} sessions this week`}>
              {Array.from({ length: week.target }, (_, i) => <i key={i} className="ls-led" style={{ ["--c" as string]: i < week.filled ? "var(--led-mint)" : "#2A2A2E", boxShadow: i < week.filled ? undefined : "none", background: i < week.filled ? undefined : "#2A2A2E" } as CSSProperties} />)}
              <b style={{ fontWeight: 500, marginLeft: 6 }}>{week.filled} of {week.target}</b>
            </span>
          </div>
          {phase === "done" && summary ? (
            <div className="ls-title" aria-live="polite">{summary.counts ? `session done. ${summary.correct} of ${summary.answered} right.` : `${summary.correct} of ${summary.answered}. answer five to count.`}</div>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            {openDrills.map(d => (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--disp-ink)" }}>
                <span style={{ width: 118 }}>{NAME[d]}</span>
                <Bars level={saved.levels[d].level} c={COLOR[d]} />
                <span style={{ width: 30, textAlign: "right", color: "var(--disp-sub)", fontSize: 11 }}>lv {saved.levels[d].level}</span>
              </div>
            ))}
          </div>
          <div className="ls-meta" style={{ marginTop: 14 }}>
            <span>{week.met ? "week done. anything more is a bonus." : `${week.remaining} more ${week.remaining === 1 ? "session" : "sessions"} this week`}</span>
            <span>missing a day resets nothing</span>
          </div>
        </Screen>

        <div className="m1-g" style={{ marginTop: 14 }}>
          <GoPill onClick={() => void startSession(today)} style={{ gridColumn: "1 / -1", height: 76 }}>{phase === "done" ? "go again" : "start 5 minutes"}</GoPill>
        </div>
        <p className="m1-t11" style={{ textAlign: "center", margin: "10px 0 6px" }}>headphones help. speakers work too.</p>

        <Silk label="drills" right="or pick one" />
        <div className="ls-pads">
          {pads.map(p => {
            const inner = (
              <>
                <span style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
                  <Pic kind={p.pic} c={p.c} />
                  {p.tag ? <span className="m1-tag">{p.tag}</span> : null}
                </span>
                <span style={{ fontSize: 16 }}>{p.label}</span>
              </>
            );
            const st = { minHeight: 112, ["--c" as string]: p.c } as CSSProperties;
            return p.href
              ? <Link key={p.id} href={p.href} className="ls-pad" style={st}>{inner}</Link>
              : <button key={p.id} type="button" className={`ls-pad ${p.tag === "today" ? "is-glowpad" : ""}`} style={st} onClick={p.onClick}>{inner}</button>;
          })}
        </div>
        {error && <div className="ls-panel"><span className="ls-led" style={{ ["--c" as string]: "var(--led-red)" } as CSSProperties} /><span>{error}</span></div>}
        {ready && canUsePass(saved.week, now) && (
          <button type="button" className="ls-panel is-link" onClick={() => persist({ ...saved, week: takeFreePass(saved.week, new Date()) })}>
            <span className="ls-led" style={{ ["--c" as string]: "var(--led-lilac)" } as CSSProperties} /><span>busy week? use this week&apos;s free pass.</span>
          </button>
        )}
      </main>
    );
  }

  // ── a drill ─────────────────────────────────────────────────────────────
  const remaining = Math.max(0, SESSION_SECONDS - elapsed);
  const g = q?.drill === "groove" ? (q as GrooveQuestion) : null;
  const locked = g ? bars < BARS_BEFORE_ANSWER && phase === "listening" : false;
  const drill = q?.drill ?? order.current[0];
  const c = COLOR[drill];
  const options: { id: string; label: string; small?: string }[] = !q ? [] :
    q.drill === "eq" ? (q as EqQuestion).options.map(hz => ({ id: String(hz), label: BAND(hz), small: fmtHz(hz) }))
      : q.drill === "compression" ? (attackStep ? (["fast", "medium", "slow"] as const).map(a => ({ id: a, label: a, small: "attack" })) : [{ id: "yes", label: "compressed" }, { id: "no", label: "not compressed" }])
        : [{ id: "A", label: "a", small: g?.kind === "tempo" ? "faster" : "swung" }, { id: "B", label: "b", small: g?.kind === "tempo" ? "faster" : "swung" }];
  const question = !q ? "getting the next clip ready" : q.drill === "eq" ? "b has one band boosted. which one?"
    : q.drill === "compression" ? (attackStep ? "right. which attack setting?" : "a is the original. is b compressed?")
      : g?.kind === "tempo" ? "which clip is faster?" : "which clip is swung?";
  const bLabel = q?.drill === "eq" ? "boosted" : q?.drill === "compression" ? "maybe" : "clip b";

  const top = (
    <div className="ls-top">
      <button type="button" className="ls-x" aria-label="End the session" onClick={finishSession} style={{ border: 0, background: "none" }}><Icon name="close" /></button>
      <div className="ls-seg" role="progressbar" aria-label="Time used" aria-valuemin={0} aria-valuemax={SESSION_SECONDS} aria-valuenow={elapsed} style={{ ["--c" as string]: c } as CSSProperties}>
        {Array.from({ length: 10 }, (_, i) => <i key={i} className={i < Math.floor((elapsed / SESSION_SECONDS) * 10) ? "is-done" : i === Math.floor((elapsed / SESSION_SECONDS) * 10) ? "is-now" : ""} />)}
      </div>
      <span className="m1-t11" aria-label="Time left">{fmtClock(remaining)}</span>
    </div>
  );
  if (q?.drill === "copy") {
    return (
      <div className="ls">
        {top}
        <GymCopy key={count} q={q as CopyQuestion} level={saved.levels.copy.level} count={count} feedback={feedback} timeUp={timeUp}
          onAnswer={(ok, note, answer) => record("copy", ok, note, answer)} onEnd={finishSession} onNext={next} />
      </div>
    );
  }
  if (q?.drill === "imagine") {
    return (
      <div className="ls">
        {top}
        <GymImagine key={count} q={q as ImagineQuestion} level={saved.levels.imagine.level} count={count} feedback={feedback} timeUp={timeUp}
          onAnswer={(ok, note, answer) => record("imagine", ok, note, answer)} onEnd={finishSession} onNext={next} />
      </div>
    );
  }
  if (q?.drill === "match") {
    return (
      <div className="ls">
        {top}
        <GymMatch key={count} q={q as MatchQuestion} level={saved.levels.match.level} count={count} feedback={feedback} timeUp={timeUp}
          onAnswer={(ok, note, answer) => record("match", ok, note, answer)} onEnd={finishSession} onNext={next} />
      </div>
    );
  }
  return (
    <div className="ls">
      <div className="ls-top">
        <button type="button" className="ls-x" aria-label="End the session" onClick={finishSession} style={{ border: 0, background: "none" }}><Icon name="close" /></button>
        <div className="ls-seg" role="progressbar" aria-label="Time used" aria-valuemin={0} aria-valuemax={SESSION_SECONDS} aria-valuenow={elapsed} style={{ ["--c" as string]: c } as CSSProperties}>
          {Array.from({ length: 10 }, (_, i) => <i key={i} className={i < Math.floor((elapsed / SESSION_SECONDS) * 10) ? "is-done" : i === Math.floor((elapsed / SESSION_SECONDS) * 10) ? "is-now" : ""} />)}
        </div>
        <span className="m1-t11" aria-label="Time left">{fmtClock(remaining)}</span>
      </div>
      <div className="ls-col">
        <Screen>
          <div className="ls-meta">
            <span style={feedback ? { color: feedback.correct ? "var(--led-mint)" : "var(--led-red)" } : undefined}>
              {feedback ? (feedback.correct ? "right" : "not quite") : `${NAME[drill]} · ${count}`}
            </span>
            <span>level {saved.levels[drill].level} of {MAX_LEVEL}</span>
          </div>
          <div className="ls-title" aria-live="polite">{feedback ? feedback.note : question}</div>
          {q?.drill === "eq" && phase === "feedback" ? <Curve hz={(q as EqQuestion).answerHz} c={c} /> : (
            <div className="ls-meta" style={{ marginTop: 14 }}>
              <span>{phase === "loading" ? "rendering both clips" : locked ? `keep listening · bar ${Math.min(bars, BARS_BEFORE_ANSWER)} of ${BARS_BEFORE_ANSWER}` : q?.drill === "eq" ? "the curve shows after you answer" : "levels are matched"}</span>
            </div>
          )}
        </Screen>

        <Silk label="compare" right="switch as often as you like" />
        <div className="m1-g">
          <Key label="original" led={selected === "A" ? "var(--led-mint)" : null} ariaPressed={selected === "A"} onClick={() => toggle("A")} ariaLabel="Play clip a"><span style={{ fontSize: 18, fontWeight: 500 }}>a</span></Key>
          <Key label={bLabel} led={selected === "B" ? "var(--led-mint)" : null} ariaPressed={selected === "B"} onClick={() => toggle("B")} ariaLabel="Play clip b"><span style={{ fontSize: 18, fontWeight: 500 }}>b</span></Key>
          <Key label="stop" onClick={stop} ariaLabel="Stop"><Icon name="stop" /></Key>
          <span />
        </div>

        <Silk label="answer" right={locked ? "listen a little longer" : "tap one, it lights up"} />
        <div className={`ls-pads ${options.length === 3 ? "is-one" : ""}`}>
          {options.map(o => {
            const isAns = feedback && o.id === feedback.answer;
            const isPick = pick === o.id;
            const cls = !feedback ? (isPick ? "is-lit" : "") : isAns ? (feedback.correct ? "is-lit is-right" : "is-ring") : isPick ? "is-lit is-wrong" : "is-dim";
            return (
              <button key={o.id} type="button" className={`ls-pad ${cls}`} style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties}
                disabled={!!feedback || locked || phase !== "listening"} onClick={() => setPick(o.id)} aria-pressed={isPick}>
                <small>{o.small ?? ""}</small><span>{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label="end" onClick={finishSession} ariaLabel="End the session"><Icon name="close" /></Key>
          {feedback
            ? <GoPill onClick={next} style={{ gridColumn: "span 3" }}>{timeUp ? "finish" : "next"}</GoPill>
            : <GoPill onClick={check} disabled={pick === null} style={{ gridColumn: "span 3" }}>check</GoPill>}
        </div>
      </div>
    </div>
  );
}
